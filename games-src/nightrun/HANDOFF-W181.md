# HANDOFF W181: street camera lead (RET.cam2) is the default (?cam2=0 = old)

Retuned for the wider view (values only): streethard.js LUNGE 210 (rushers crouch from 210 units, was 120; one added line in the rusher ai wrapper), CROUCH .75, GMAX 2;
street3.js GCD 1.9; foot.js belt depth spread .75 -> .95 (D3 was 28%, needs 30).
streetsim, 100 runs per bot (belt on, cam2 on): nearest 27%, gfirst 40%, dodge 69%, idle 0%, stuck 0. D1/D2/D3, fairness, behind-share PASS.
Still FAIL (all failed before this task too): threat peak 82-88% (63%), cover prevents >= 3 hits (0.0), the strict kill-order gate (>= 15 points; got 13).
cam2-test, streetdraw, streetsong, footvis, focus, footlab, guard.py PASS. Results move a lot between 50-run samples (nearest 14-27% on the same build): read RUNS=100.
