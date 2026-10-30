#!/bin/bash
# W275 driver: one browser at a time. Needs the two builds served on 8801 (base) and 8802 (integrated). Output: raw.jsonl next to this file.
cd "$(git rev-parse --show-toplevel)"; export NODE_PATH=$(npm root -g) SEED=${SEED:-1}
OUT=games-src/nightrun/benchmark/w275/raw.jsonl; F=games-src/nightrun/benchmark/fps-fixed.js
for cell in "flight phone" "street phone" "flight pc" "street pc"; do set -- $cell
  for r in 1 2 3; do for b in base integ; do port=$([ $b = base ] && echo 8801 || echo 8802)
    node $F fps $1 $2 http://127.0.0.1:$port/ 60 5 | sed "s/^{/{\"build\":\"$b\",\"round\":$r,/" >> $OUT; done; done; done
for dev in phone pc; do for r in 1 2 3 4 5; do for b in base integ; do port=$([ $b = base ] && echo 8801 || echo 8802)
  node $F cold $dev http://127.0.0.1:$port/ | sed "s/^{/{\"build\":\"$b\",\"round\":$r,/" >> $OUT; done; done; done
echo done >> games-src/nightrun/benchmark/w275/done.flag
