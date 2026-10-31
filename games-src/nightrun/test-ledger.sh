#!/usr/bin/env bash
# Nightrun test ledger. Runs every games-src/nightrun/*-test.js ONE AT A TIME (never in parallel),
# reruns each failure once (FLAKY if the rerun passes), then bisects the failures by feature flag.
# Writes results to $LEDGER_OUT/results.tsv and games-src/nightrun/TEST-RESULTS-NIGHTLY.md (the runner-status list TEST-LEDGER.md comes from ledger.py).
# Env: LEDGER_OUT (scratch dir), LEDGER_BUDGET_MIN (default 36: no new run starts after that),
#      LEDGER_PER_TEST (default 600 s timeout per run).
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DIR="$ROOT/games-src/nightrun"
OUT="${LEDGER_OUT:-${TMPDIR:-/tmp}/nightrun-ledger}"
BUDGET_MIN="${LEDGER_BUDGET_MIN:-36}"
PER_TEST="${LEDGER_PER_TEST:-600}"
START=$(date +%s); DEADLINE=$((START + BUDGET_MIN * 60))
COMMIT=$(git -C "$ROOT" rev-parse --short HEAD); TODAY=$(date -u +%F)
NODE_PATH_VAL="$(npm root -g)"
mkdir -p "$OUT/logs"; RES="$OUT/results.tsv"; : > "$RES"

# Preloaded into each run: appends LEDGER_Q to every index.html URL the test opens, so tests stay unchanged.
cat > "$OUT/flag-hook.js" <<'HOOK'
const Module = require('module');
const extra = process.env.LEDGER_Q || '';
const isPW = o => o && typeof o === 'object' && (typeof o.newPage === 'function' || typeof o.newContext === 'function' || typeof o.goto === 'function');
const wrapIf = x => (isPW(x) ? wrapObj(x) : x);
function wrapObj(o) {
  return new Proxy(o, { get(t, k) {
    const v = Reflect.get(t, k, t);
    if (typeof v !== 'function') return v;
    return function (...a) {
      if (k === 'goto' && extra && typeof a[0] === 'string' && a[0].includes('index.html') && !a[0].includes(extra)) a[0] += extra;
      const r = v.apply(t, a);
      return r && typeof r.then === 'function' ? r.then(wrapIf) : wrapIf(r);
    };
  } });
}
const load = Module._load;
Module._load = function (req) {
  const m = load.apply(this, arguments);
  if (req === 'playwright' || req === 'playwright-core' || /(^|\/)playwright(-core)?$/.test(req)) {
    return new Proxy(m, { get(t, k) { const v = Reflect.get(t, k, t); return ['chromium', 'firefox', 'webkit'].includes(k) ? wrapObj(v) : v; } });
  }
  return m;
};
HOOK

# run_one <test> <tag> <extra-query>  -> sets RC (exit code, 124 = timeout, NR = not run) and LOG
run_one() {
  local left=$((DEADLINE - $(date +%s)))
  LOG="$OUT/logs/$1.$2.log"
  if [ "$left" -le 5 ]; then RC=NR; : > "$LOG"; echo "not run: time budget used" > "$LOG"; return; fi
  local lim=$(( left < PER_TEST ? left : PER_TEST ))
  ( cd "$DIR" && LEDGER_Q="$3" NODE_OPTIONS="--require $OUT/flag-hook.js" NODE_PATH="$NODE_PATH_VAL" \
      timeout "$lim" node "$1.js" ) > "$LOG" 2>&1
  RC=$?
}
# status_of: PASS / FAIL / TIMEOUT from RC and the log
status_of() {
  case "$RC" in
    NR) echo NOT-RUN ;; 124) echo TIMEOUT ;;
    0) if grep -q '^FAIL' "$LOG"; then echo FAIL; else echo PASS; fi ;;
    *) echo FAIL ;;
  esac
}
# first_line: the first failing line of the log (cleaned for a table cell)
first_line() {
  local l
  l=$(grep -m1 -A1 '^FAIL' "$LOG" | sed -n 2p)
  [ -z "$l" ] && l=$(grep -m1 -iE 'fail|error|expect|wanted|threw|assert|missing' "$LOG")
  [ -z "$l" ] && l=$(grep -v '^[[:space:]]*$' "$LOG" | tail -1)
  [ -z "$l" ] && l="exit $RC, no output"
  printf '%s' "$l" | tr '\t|' '  ' | cut -c1-170
}

TESTS=$(ls "$DIR"/*-test.js | xargs -n1 basename | sed 's/\.js$//')
echo "== pass 1: ${TESTS:+$(echo "$TESTS" | wc -l) tests} at $COMMIT, one at a time" >&2
for t in $TESTS; do
  run_one "$t" run ""; st=$(status_of); fl=$(first_line)
  if [ "$st" = FAIL ] || [ "$st" = TIMEOUT ]; then
    run_one "$t" rerun ""
    if [ "$(status_of)" = PASS ]; then st=FLAKY; fl="passed on rerun (first: $fl)"; else fl="$(first_line)"; st=$([ "$RC" = 124 ] && echo TIMEOUT || echo "$(status_of)"); fi
  fi
  printf '%s\t%s\t%s\t%s\n' "$t" "$st" "-" "$fl" >> "$RES"
  echo "$st $t" >&2
done

# pass 2: failing tests -> all flags off (old failure?) -> else one flag off at a time
ALLOFF="&mustmove=0&abil=0&counter=0&reward=0&react=0&vary=0&vary2=0&bossmoves=0&strike2=0&forge=0&deck=0&hintdiet=0&roster=0"
SINGLES="mustmove=0 abil=0 counter=0 reward=0 react=0 vary=0&vary2=0 bossmoves=0 strike2=0 forge=0 deck=0&hintdiet=0&roster=0 timing=1 build2=1 bossplay=1"
echo "== pass 2: flag bisect" >&2
awk -F'\t' '$2=="FAIL"||$2=="TIMEOUT"{print $1}' "$RES" > "$OUT/failing.txt"
while read -r t; do
  run_one "$t" alloff "$ALLOFF"; ao=$(status_of)
  if [ "$ao" = NOT-RUN ]; then cause="not bisected (budget)"
  elif [ "$ao" != PASS ]; then cause="old"
  else
    causes=""; partial=0
    for f in $SINGLES; do
      run_one "$t" "off-$(echo "$f" | tr '&=' '__')" "&$f"; s=$(status_of)
      if [ "$s" = NOT-RUN ]; then partial=1; continue; fi
      [ "$s" = PASS ] && causes="$causes ${f//&/ }"
    done
    if [ -z "$causes" ]; then cause="interaction (all-off passes, no single flag fixes)"; else cause="$(echo $causes | tr ' ' ',')"; fi
    [ "$partial" = 1 ] && cause="$cause (partial: budget ran out)"
  fi
  awk -F'\t' -v OFS='\t' -v t="$t" -v c="$cause" '$1==t{$3=c} {print}' "$RES" > "$RES.tmp" && mv "$RES.tmp" "$RES"
  echo "bisect $t: $cause" >&2
done < "$OUT/failing.txt"

# Report
PASS=$(awk -F'\t' '$2=="PASS"' "$RES" | wc -l); FAILN=$(awk -F'\t' '$2=="FAIL"' "$RES" | wc -l)
FLK=$(awk -F'\t' '$2=="FLAKY"' "$RES" | wc -l); TMO=$(awk -F'\t' '$2=="TIMEOUT"' "$RES" | wc -l); NRN=$(awk -F'\t' '$2=="NOT-RUN"' "$RES" | wc -l)
MD="$DIR/TEST-RESULTS-NIGHTLY.md"   # TEST-LEDGER.md is the RUN / NOT RUN / BROKEN list generated by ledger.py
{
  echo "# Nightrun test ledger"
  echo
  echo "Generated by \`games-src/nightrun/test-ledger.sh\` on $TODAY at game commit \`$COMMIT\`."
  echo "Tests run one at a time, 10-minute cap each. A failing test is rerun once (FLAKY if the rerun passes)."
  echo "Cause = the feature flag (page query) whose removal makes the test pass; \`old\` = still fails with every flag off."
  echo
  echo "Totals: $(awk -F'\t' 'END{print NR}' "$RES") tests: $PASS PASS, $FAILN FAIL, $FLK FLAKY, $TMO TIMEOUT, $NRN NOT-RUN."
  echo
  echo "| Test | Status | Cause flag | First failing line | Commit / date |"
  echo "|---|---|---|---|---|"
  awk -F'\t' -v c="$COMMIT" -v d="$TODAY" '{ gsub(/\|/, "/", $4); printf "| %s | %s | %s | %s | %s %s |\n", $1, $2, $3, $4, c, d }' "$RES"
} > "$MD"
echo "wrote $MD" >&2
git -C "$ROOT" checkout -- games-src/nightrun/playtest/story-sim.json 2>/dev/null || true
