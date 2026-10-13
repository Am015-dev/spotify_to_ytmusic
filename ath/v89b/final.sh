#!/bin/bash
# v89c final set: merged build (local_dbg.html) vs live v89b1 (_base/local_dbg.html). Serial so timings are clean.
cd "$(dirname "$0")/../.."
N=http://127.0.0.1:8766/local_dbg.html; B=http://127.0.0.1:8766/_base/local_dbg.html; O=ath/v89b/final; mkdir -p $O/pop $O/spots $O/chk $O/foot $O/side
MODE=phone MIN=3 THROTTLE=1 node ath/v89b/tPlayS.js $N $O/tp_new > $O/tp_new.txt 2>&1
for c in fra ath; do node ath/v89b/popin.js $N $c $O/pop/new > $O/pop/new_$c.txt 2>&1; done
MODE=phone MIN=3 THROTTLE=1 node ath/v89b/tPlayS.js $B $O/tp_base > $O/tp_base.txt 2>&1
for c in fra ath; do node ath/v89b/popin.js $B $c $O/pop/base > $O/pop/base_$c.txt 2>&1
  node ath/v88v/shots.js $N $c $O/spots/new > $O/spots/new_$c.txt 2>&1; node ath/v88v/shots.js $B $c $O/spots/base > $O/spots/base_$c.txt 2>&1
  node ath/v89b/heap.js $N $c 30 > $O/heap_new_$c.txt 2>&1; node ath/v89b/heap.js $B $c 30 > $O/heap_base_$c.txt 2>&1
  node ath/v89b/chk5.js $N $c $O/chk > $O/chk/$c.txt 2>&1; done
for c in fra ath; do CITIES=$c MODE=phone FAST=1 node tools/tFoot.js $N $O/foot > $O/foot/tFoot_$c.txt 2>&1; done
ATH=1 node ath/v88v/g11drive.js $N $O/side > $O/side/g11.txt 2>&1
echo FINAL_DONE
