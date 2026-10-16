# HANDOFF rev-71 (2026-10-16) — verdict: GO with ?l3lt default OFF
1. First gate (guard ON): life3/lights failed assert in 2 of 5 runs (3-4 red-light runs at junction node 115 (612,-2), limit 2) -> flipped ?l3lt default OFF (?l3lt=1 / od_l3lt=1 = on) and removed the "stops at red lights" line from the changelog. Fix still open: stop-line guard needs work before it ships ON.
2. Gate on BUILT out/v90m-beta.71 (page 3.44 MB, xc/ 4 files): unit 0 FAIL without three.js; with three.js only logic_core TUNE crash (allowed). TAG=life1,life3,xf1,terrain,env1,tr1,debris1: 48/50 and 47/50, fails only SLOW/timing (life1/ath-density, xf1/land+slope). life1 wheel/popup/carousel failed once under load (frame-rate timing).
3. Flaky: life3/lanes (inner/outer split 72/28 vs >=30 %) and life3/peds each failed 1 in ~4 runs on the built page (random seed, not related to the flip).
4. Shots docs/shots/rev71/: a_ath_park (no floating bricks, looked), c_fra_street_trees (looked, fine). b_fra_queue is NOT proof: the camera is on grass and no queue is clearly visible; the red-light queue is only covered by the (now PENDING) life3/lights GO.
5. Not deployed.
