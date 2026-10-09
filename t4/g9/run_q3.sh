#!/bin/bash
cd "$(dirname "$0")/../.."
until grep -q COL_DONE t4/g9/run_q2.log; do sleep 5; done
DRIVE=1 timeout 1500 node t4/nb.js http://127.0.0.1:8766/local_dbg.html t4/g9/drive1 > t4/g9/drive1.log 2>&1; echo DRIVE1_DONE
timeout 900 node t4/g9fu.js http://127.0.0.1:8766/local_dbg.html t4/g9/fu > t4/g9/fu.log 2>&1; echo FU_DONE
