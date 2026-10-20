#!/bin/bash
# parallel AI bench: tools/par.sh tag level seeds "jobs1" "jobs2" ...   -> out/ai/<tag>_<i>.txt
cd "$(dirname "$0")/.."; tag=$1; lv=$2; seeds=$3; shift 3; i=0
for j in "$@"; do node tools/aibench.js $j $seeds $lv 0 out/ai/${tag}_$i.json > out/ai/${tag}_$i.txt 2>&1 & i=$((i+1)); done; wait
cat out/ai/${tag}_*.txt | grep TOTAL
