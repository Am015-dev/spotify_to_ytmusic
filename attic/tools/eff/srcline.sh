#!/usr/bin/env bash
# PERF-3: map a line number of the --local build (local_dbg.html / overdrive.html) to src/<module>:<line>. usage: tools/eff/srcline.sh <line>...
cd "$(dirname "$0")/../.."; for L in "$@"; do ( cd src; acc=0; for f in $(cat ORDER); do if [ "$f" = 99_api.js ]; then for t in test/*.js; do n=$(wc -l <"$t"); if [ $L -le $((acc+n)) ]; then echo "$L -> src/$t:$((L-acc))"; exit; fi; acc=$((acc+n)); done; fi
 n=$(wc -l <"$f"); if [ $L -le $((acc+n)) ]; then echo "$L -> src/$f:$((L-acc))"; exit; fi; acc=$((acc+n)); done ); done
