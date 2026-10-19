## bisect-black (2026-10-19): Athens desktop GO page black · test-start only, live play OK
1. Verdict: live beta.125 Athens PC is OK in real play (?test=ath, pointer:fine, 852x393 mean 107, 1280x720 mean 105). Only the GO test page (&draw=0, DESKTOP=1) was black (mean 9-11) and r13/sky-blue failed when it ran first (warm horizon 1.02,.86,.66).
2. Cause: 6eba3c2 (fix-bhs), not perf-r15c/e/f: XC_go stopped waiting for the desktop roam-start gate (LKG) unless ?bhs=1, so __tq.ready came while LKG.arm still blocked composer.render and before the gate's GFX_pre ran.
3. Fix (src/98tq_test_quick.js, test start only): ready also waits for LKG.arm to drop (≤ 120 s). Game code unchanged.
4. New GO r13/sky-blue-frame (Athens): gate down + one drawn frame read back, mean brightness > 40 (measured 99). Runs under TAG=r13/sky-blue; sky-blue first now PASS.
5. Gate (built page): unit 0 FAIL; TAG=r13/sky-blue,life1,xf1,terrain,phone2,perf/pc-post-ready-link,perf/touch-first-frames 49/50 (xf1/grass SLOW 11.6 s only, same SLOW on this box per perf-r15g); DESKTOP ath+fra sky-blue/pc-post-ready-link all PASS.
