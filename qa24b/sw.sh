#!/bin/bash
# steering sweep: qa24b/sw.sh <page> <input> <fps> name 'json' [name 'json' ...]
U=http://127.0.0.1:8766/$1;IN=$2;F=$3;shift 3
run(){ INPUT=$IN FPS=$F SPEEDS=60,100 TUNE="$2" node tools/tSteer24.js $U qa24b/sw_$1.json > qa24b/sw_$1.log 2>&1; echo "$1 $(grep SUM qa24b/sw_$1.log | python3 -c 'import sys,json;l=sys.stdin.read();s=json.loads(l[4:]) if l else {};print({k:s.get(k) for k in ["flipsAvg","turnsWith2plusFlips","overAvgDeg","settleAvg","settleAimAvg","hitsPerMin","offPct","yawFlipsPerKmStraight","t90","done"]})')"; }
while [ $# -gt 0 ]; do run "$1" "$2" & shift 2; done; wait
