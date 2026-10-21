#!/usr/bin/env bash
# Nightrun QA runner (<= 8 min, PASS/FAIL lines only). One fresh build, then:
#   a monkey x3 seeds (parallel, 90 s)   b soak (accelerated 10 game-min, <= 95 s)   c save/resume   d perf budget   e asset-load
#   f text overflow + g phone sweep (DOM, 3 sizes) and canvas text (ui-align-test on the canvas screens, 3 sizes)
#   bash games-src/nightrun/qa/qa.sh          exit 1 if anything fails.   env: QA_ONLY=monkey,soak,save,perf,assets,sweep,canvas  SECS=90 (monkey)  FULL=1 (real 10 game-min soak, no wall cap)  LOG=dir
# Every failing line is a candidate for qa/BUGS.md. Tests run ONE AT A TIME (parallelism only inside monkey: 3 pages, no timing measured).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; NR="$(dirname "$HERE")"; ROOT="$(cd "$NR/../.." && pwd)"; GAME="$ROOT/games/mainhattan-nightrun"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
T="$(mktemp -d)"; L="${LOG:-$T/log}"; mkdir -p "$L"
NR_OUT="$T/index.html" python3 "$NR/parts/build.py" >/dev/null || { echo "FAIL build"; exit 1; }
for d in media music icons; do ln -s "$GAME/$d" "$T/$d"; done; cp "$GAME/manifest.webmanifest" "$GAME/sw.js" "$GAME/offline.json" "$T/" 2>/dev/null
export GAME_DIR="$T"; ONLY_="${QA_ONLY:-monkey,soak,save,perf,assets,sweep,canvas}"; bad=0; t0=$(date +%s)
want() { case ",$ONLY_," in *",$1,"*) return 0;; esac; return 1; }
sum() { local name="$1" s="$2" rc="$3"; local nf=$(grep -c '^FAIL' "$L/$name.txt") np=$(grep -c '^PASS' "$L/$name.txt")
  if [ "$rc" -ne 0 ] || [ "$nf" -gt 0 ]; then bad=$((bad+1)); grep '^FAIL' "$L/$name.txt" | grep -v ": [0-9]* failed$" | cut -c1-400; echo "FAIL $name ($nf fail, $np pass, $(( $(date +%s)-s )) s)"; else echo "PASS $name ($np pass, $(( $(date +%s)-s )) s)"; fi; }
run() { local name="$1"; shift; local s=$(date +%s); "$@" >"$L/$name.txt" 2>&1; sum "$name" "$s" $?; }
if want monkey; then s=$(date +%s); for sd in 1 2 3; do SEED=$sd SECS="${SECS:-90}" node "$HERE/monkey.js" >"$L/monkey-$sd.txt" 2>&1 & done; wait
  for sd in 1 2 3; do sum monkey-$sd $s 0; done; fi
if want soak; then if [ "${FULL:-0}" = 1 ]; then run soak env WALL_S=3000 node "$HERE/soak.js"; else run soak node "$HERE/soak.js"; fi; fi
want save   && run save   node "$HERE/save.js"
want perf   && run perf   node "$HERE/perf.js"
want assets && run assets node "$HERE/assets.js"
want sweep  && run sweep  node "$HERE/sweep.js"
if want canvas; then for vp in 390x763 375x553 844x390; do run canvas-$vp env VP=$vp ONLY="story-stage,hud-run,hud-boss,pit-shop,game-over" node "$NR/ui-align-test.js"; done; fi
echo "$([ $bad -eq 0 ] && echo PASS || echo FAIL) qa: $bad failed, $(( $(date +%s)-t0 )) s"
[ $bad -eq 0 ]
