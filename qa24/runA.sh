#!/bin/bash
# drive24 steering A/B batch (3 in parallel); results qa24/st_<name>.json
cd "$(dirname "$0")/.."
B=http://127.0.0.1:8766/base_dbg.html; N=http://127.0.0.1:8766/new_dbg.html; S=${SPEEDS:-60,100}
run(){ env SPEEDS=$S "${@:3}" node tools/tSteer24.js $2 qa24/st_$1.json > qa24/st_$1.log 2>&1; }
run base_key $B & run new_key $N & run base_key_noassist $B TUNE='{"TUNE.assist":0}' & wait
run base_touch $B INPUT=touch & run new_touch $N INPUT=touch & run new_key_noassist $N TUNE='{"TUNE.assist":0}' & wait
run base_key30 $B FPS=30 & run new_key30 $N FPS=30 & run base_touch30 $B INPUT=touch FPS=30 & wait
echo BATCH_DONE
