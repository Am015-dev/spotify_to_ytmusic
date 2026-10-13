#!/bin/bash
cd "$(dirname "$0")/../.."
U=http://127.0.0.1:8766
until grep -q BP_DONE t4/g9/run_q.log; do sleep 5; done
timeout 1500 node t4/g9sel.js $U/local_dbg.html t4/g9/sel2 > t4/g9/sel2.log 2>&1; echo SEL_DONE
timeout 600 node t4/g9tb.js $U/local_dbg.html t4/g9/toolbar2.png > t4/g9/toolbar2.log 2>&1; echo TB_DONE
timeout 900 node t4/g9tpl.js $U/wt_s2/local_dbg.html t4/g9/tpl > t4/g9/tpl.log 2>&1; echo TPL_DONE
timeout 1200 node t4/g9col.js $U/wt_s2/local_dbg.html t4/g9/col > t4/g9/col.log 2>&1; echo COL_DONE
