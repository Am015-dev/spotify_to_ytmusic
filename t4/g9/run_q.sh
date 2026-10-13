#!/bin/bash
cd "$(dirname "$0")/../.."
until grep -q RESULT t4/g9/stackbp.log 2>/dev/null; do sleep 5; done
timeout 1200 node t4/g9stack.js http://127.0.0.1:8766/wt_old/local_dbg.html t4/g9/stack_old > t4/g9/stack_old.log 2>&1
tools/build.sh g9dev --local > /dev/null 2>&1 && echo BUILT
timeout 600 node t4/g9tb.js http://127.0.0.1:8766/local_dbg.html t4/g9/toolbar.png > t4/g9/toolbar.log 2>&1
t4/g9/run_r2.sh
