#!/bin/bash
# v89e (stream merged onto live v89d src 08f37b5e): sanity + re-check vs live v89d (_base). Serial so timings are clean.
cd "$(dirname "$0")/../.."
N=http://127.0.0.1:8766/local_dbg.html; B=http://127.0.0.1:8766/_base/local_dbg.html; O=ath/v89b/final3; mkdir -p $O/pop $O/spots $O/foot_new $O/foot_base $O/jack
MODE=phone MIN=3 THROTTLE=1 node ath/v89b/tPlayS.js $N $O/tp_new > $O/tp_new.txt 2>&1
MODE=phone MIN=3 THROTTLE=1 node ath/v89b/tPlayS.js $B $O/tp_base > $O/tp_base.txt 2>&1
for c in fra ath; do CITIES=$c MODE=phone FAST=1 node tools/tFoot.js $N $O/foot_new > $O/foot_new_$c.txt 2>&1; done
CITIES=ath MODE=phone FAST=1 node tools/tFoot.js $B $O/foot_base > $O/foot_base_ath.txt 2>&1
MODE=phone node tools/tJack.js $N $O/jack > $O/jack.txt 2>&1
for c in fra ath; do node ath/v89b/popin.js $N $c $O/pop > $O/pop_$c.txt 2>&1; node ath/v88v/shots.js $N $c $O/spots > $O/spots_$c.txt 2>&1; node ath/v89b/heap.js $N $c 30 > $O/heap_new_$c.txt 2>&1; done
echo FINAL3_DONE
