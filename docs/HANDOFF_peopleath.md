# HANDOFF people-ath (2026-10-17): life1/people in Athens
1. Not a regression: life1/people (ath) failed identically on f41b1b5, 5aa1cd3 and b447b2e (1 run each, 0 jumped, 10 s); neither 73c20a5 nor 5ff5672 is in f41b1b5. Never red at one commit.
2. Cause: LIFE_runup picked groups on hill streets (Athens ~1933,-1687, ~40 deg rise); the car stalls and rolls back (v -3, pushed down the slope), so nobody reacts in 10 s. Which group is picked depends on where __tq.reset leaves the car, hence "flaky".
3. Fix (shared code, src/assets/lx/code.js LIFE_runup): the run-up must be drivable, ground rise <= 0.4 m per 2 m step. GO limits untouched. Also helps life1/smash (same picker).
4. After the fix, built page: people alone 3/3 PASS (8.1-8.8 s of 10), TAG=life1 ath twice more PASS; one combined run still failed once (juggler, 0 reactions, car hit something mid run-up, did not reproduce in 4 later runs). unit 0 FAIL; slow1,rv2k2/pace 3/3.
5. Left: ath-density SLOW-only (11.5 s), fra life1/smash 0 burst under load (not touched); people takes 8-9 s of its 10 s on this machine, little headroom; run-up still ignores sm items in the path.
