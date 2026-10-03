#!/bin/bash
# full gauntlet, 8 seeds, both levels, 6 chunks in parallel: tools/fullg.sh tag
cd "$(dirname "$0")/.."; tag=$1; mkdir -p out/$tag
for lv in normal hard; do
 for r in "1 16" "17 30" "31 42" "43 50" "51 58" "59 66"; do set -- $r
  node gauntlet.js $1 $2 8 $lv out/$tag/${lv}_$1.json > out/$tag/${lv}_$1.txt 2>&1 &
 done; wait
done
echo done > out/$tag/DONE
