# HANDOFF perf3 (2026-10-16)
- "18 shadow renders/frame" was a counting artifact (perfdrive counted every composer fullscreen pass); real count = 1 (one sun light). Fixed in tools/perfdrive.js (counts only calls with lights).
- Med shadow pass costs 137 calls + 1.17 M tris per frame (721->584 calls, 4.28->3.11 M tris with it skipped). New TUNE.shEvery=2 (med only, roam, not split-screen) renders it every 2nd frame: about -9 % calls, -14 % tris averaged. 0 = every frame.
- DPR already capped (med 1.5, high 2, pixel budget in resize()); no change. Far plane 2600->2000 measured only -1 % calls, so TUNE.farMed stays 2600 (hook exists, no change).
- Not done: heap free-after-load; no 852x393 before/after shot (shadow lag on moving cars unchecked: LOOK on phone, set shEvery:0 to revert); tools/perfab.js = in-page calls/tris A/B (shadow off, far).
- Gate: unit 0 FAIL; TAG life1,xf1,terrain built page 35/36; life1/ath-density also fails on the build without my change (pre-existing), 0 console errors.
