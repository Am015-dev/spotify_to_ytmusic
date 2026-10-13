#!/bin/bash
# v89c re-check after the inner-loop slice + big-LAZY-frame skip: warp stress, pop-in Fra, tFoot Athens new vs live, Athens tPlay ×2 each side
cd "$(dirname "$0")/../.."
N=http://127.0.0.1:8766/local_dbg.html; B=http://127.0.0.1:8766/_base/local_dbg.html; O=ath/v89b/final2; mkdir -p $O/pop $O/foot_new $O/foot_base
for c in fra ath; do node ath/v89b/heap.js $N $c 30 > $O/heap_new_$c.txt 2>&1; done
node ath/v89b/popin.js $N fra $O/pop > $O/pop_fra.txt 2>&1
CITIES=ath MODE=phone FAST=1 node tools/tFoot.js $N $O/foot_new > $O/foot_new.txt 2>&1
CITIES=ath MODE=phone FAST=1 node tools/tFoot.js $B $O/foot_base > $O/foot_base.txt 2>&1
for i in 1 2; do CITIES=ath MODE=phone MIN=3 THROTTLE=1 node ath/v89b/tPlayS.js $N $O/tpa_new$i > $O/tpa_new$i.txt 2>&1; CITIES=ath MODE=phone MIN=3 THROTTLE=1 node ath/v89b/tPlayS.js $B $O/tpa_base$i > $O/tpa_base$i.txt 2>&1; done
echo FINAL2_DONE
