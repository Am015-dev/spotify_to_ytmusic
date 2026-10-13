#!/bin/bash
# t90 sweep: name 'tune-json'
U=http://127.0.0.1:8766/new3_dbg.html
run(){ T90ONLY=1 TUNE="$2" node tools/tSteer24.js $U qa24b/t90_$1.json > qa24b/t90_$1.log 2>&1; echo "$1 $(grep -o '"t90":[0-9.]*' qa24b/t90_$1.log)"; }
run c8 '{"TUNE.stRampV0":50,"TUNE.stRampLo":0,"TUNE.stLim":1.5}' & run c9 '{"TUNE.stRampV0":50,"TUNE.stRampLo":0,"TUNE.stLim":3}' & run c10 '{"TUNE.stRampV0":50,"TUNE.stRampLo":0.06,"TUNE.stLim":1.5,"TUNE.stK0":0.3}' & run c11 '{"TUNE.stRampV0":50,"TUNE.stRampLo":0.1,"TUNE.stLim":1.4,"TUNE.stK0":0.35}' & wait
