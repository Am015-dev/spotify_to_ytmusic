#!/bin/bash
# AI strength: levels alternate seats game by game (2 players, base game and all expansions)
cd "$(dirname "$0")"
N=${N:-40}
for ex in base river,ic,tb; do for pair in easy,normal normal,hard easy,hard; do
  echo "node gauntlet.js $N 2 $ex $pair > runs/lv_${ex//,/+}_${pair/,/-}.txt 2>&1"
done; done | xargs -P ${P:-4} -I{} bash -c "{}"
cat runs/lv_*.txt > glv.txt
