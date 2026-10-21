#!/usr/bin/env bash
# Nightrun SMOKE suite (<= 5 min): the gate for every consolidation step (CONSOLIDATION-PLAN.md). One fresh build in a temp dir,
# then each test ALONE (never two at once: parallel runs gave false hud-cover FAILs), one PASS/FAIL line per test with its time.
#   bash games-src/nightrun/smoke.sh            exit 1 if any test fails      env: KEEP=1 keeps the temp dir, LOG=dir keeps each test's output
# The other ~95 *-test.js files are the FULL (nightly) set: see CONSOLIDATION-PLAN.md "Tests".
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"; GAME="$ROOT/games/mainhattan-nightrun"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
T="$(mktemp -d)"; L="${LOG:-$T/log}"; mkdir -p "$L"
NR_OUT="$T/index.html" python3 "$HERE/parts/build.py" >/dev/null || { echo "FAIL build"; exit 1; }
for d in media music icons; do ln -s "$GAME/$d" "$T/$d"; done; cp "$GAME/manifest.webmanifest" "$T/" 2>/dev/null
export GAME_DIR="$T"; bad=0; t0=$(date +%s)
run() { local name="$1"; shift; local s=$(date +%s); "$@" >"$L/$name.txt" 2>&1; local rc=$?
  local nf=$(grep -c '^ *FAIL' "$L/$name.txt"); local np=$(grep -c '^ *PASS' "$L/$name.txt")
  if [ $rc -ne 0 ] || [ "$nf" -gt 0 ]; then bad=$((bad+1)); echo "FAIL $name ($nf fail, $np pass, rc $rc, $(( $(date +%s)-s )) s): $(grep -m1 '^ *FAIL' "$L/$name.txt" | cut -c1-140)";
  else echo "PASS $name ($np pass, $(( $(date +%s)-s )) s)"; fi; }
run fingerprint      env PAGE="$T/index.html" node "$HERE/fingerprint-test.js"
run hud-cover        node "$HERE/hud-cover-test.js" "$T/index.html"
UI="${UI:-title,settings,story-stage,hud-run,pause,game-over}"   # core screens; the full screen list runs nightly
run ui-align-390x763 env VP=390x763 ONLY="$UI" node "$HERE/ui-align-test.js"
run ui-align-375x553 env VP=375x553 ONLY="$UI" node "$HERE/ui-align-test.js"
run ui-align-844x390 env VP=844x390 ONLY="$UI" node "$HERE/ui-align-test.js"
# hub-test at one phone size (the nightly run keeps all 4): a copy with SIZES cut to 390x763, the test file itself is not changed
sed 's/^const SIZES = \[.*\];/const SIZES = [[390, 763]];/' "$HERE/hub-test.js" > "$T/hub-smoke-test.js"
grep -q '^const SIZES = \[\[390, 763\]\];' "$T/hub-smoke-test.js" || echo "FAIL hub: could not cut SIZES"
run hub              node "$T/hub-smoke-test.js"
run story            node "$HERE/story-test.js"
run sprites          env ONLY="${SPR:-hoplite}" node "$HERE/sprites-test.js"   # one boss for the anchor check; all bosses nightly
run labfull          node "$HERE/labfull-test.js"
echo "$([ $bad -eq 0 ] && echo PASS || echo FAIL) smoke: $bad failed, $(( $(date +%s)-t0 )) s"
[ -n "${KEEP:-}" ] || rm -rf "$T"
exit $([ $bad -eq 0 ] && echo 0 || echo 1)
