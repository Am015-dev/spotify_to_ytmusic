# HANDOFF yield1 (2026-10-17)
1. Added L3_yieldP in src/98l3_life3.js: a 2-lane traffic car changes lane when the player is 4-45 m behind it in its lane and closing > 6 m/s. Behind a flag that is OFF by default (`?yld=1` turns it on). Unit 0 FAIL on the built page; the TAG gate was not run on the final build.
2. tools/tChkGo.js: the fake-clock path now covers `rv2k2/*` GOs (it was `rv2k/` only, so rv2k2/pace hit the real-time SLOW limit). The pace trace now prints (x,z) and an `h` flag for a recent hit.
3. Measured: Frankfurt pace PASS (92 km/h, 1 hit); Athens 51-53 km/h in two runs, and 53 km/h with ALL cars removed, then 91 km/h in a third run with cars removed. So Athens is not mainly traffic: the bot sits at 20-40 km/h near (-4566,60) for ~28 s (road geometry or bot steering) and results vary run to run.
4. Not done: the yield A/B (`?yld=1` vs off) over several Athens runs (runs hung/timed out in the sandbox), single-lane roads (no lane to move to), the Athens yield shot, and the life3/walls GO gate.
5. Next: find why the bot crawls around (-4566,60) in Athens, then re-test with `?yld=1`.
