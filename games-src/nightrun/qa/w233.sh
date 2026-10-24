#!/bin/sh
# W233: w231probe over 3 seeds x both devices; prints each gate's minimum. GAME_DIR=<built dir> sh qa/w233.sh
cd "$(dirname "$0")/.." || exit 1
for d in "390 763" "1440 860"; do set -- $d
  for s in ${SEEDS:-1 2 3}; do W=$1 H=$2 SEED=$s node qa/w231probe.js 2>&1 | grep -E "^(phone|PC) (MIN|moments)|^(PASS|FAIL)|SEED|LOW" | sed "s/^/s$s /"; done
done
