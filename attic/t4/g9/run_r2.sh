#!/bin/bash
# slice-1 release-2 proof: one browser at a time
cd "$(dirname "$0")/../.."
U=http://127.0.0.1:8766
timeout 1500 node t4/g9sel.js $U/local_dbg.html t4/g9/sel > t4/g9/sel.log 2>&1
timeout 1500 node t4/g8sweep.js $U/iframe852.html iframe > t4/g9/sweep_iframe.log 2>&1
timeout 1500 node t4/g8tiles.js $U/local_dbg.html t4/g9/tiles > t4/g9/tiles.log 2>&1
echo R2_DONE
BASE=1 timeout 1200 node t4/g9stack.js http://127.0.0.1:8766/local_dbg.html t4/g9/stackbp > t4/g9/stackbp.log 2>&1; echo BP_DONE
