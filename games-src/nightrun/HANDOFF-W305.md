# W305 flight proof (branch nr/W305-flight-proof from nr/W302-flight-look), 31 Oct 2026. Not deployed. Scratch: /tmp/w305.
## 1. Finger lift: cause is the HARNESS, not the game
Probe `qa/w305-lift.js` (phone, CDP touch; prints the touch events the PAGE sees around a dash tap, touches = fingers down, changed = who changed):
| harness call for the tap release | page sees |
|---|---|
| W302: touchEnd listing the STEERING finger (id 1) | touchend touches=[7] changed=[1] -> steering finger LIFTED, next touchMove re-presses it |
| touchMove listing the steering finger | tap finger 7 never released (touches stay 1,7) |
| W305: touchEnd listing the TAP finger (id 7) | touchend touches=[1] changed=[7] -> steering finger stays down |
CDP rule: touchEnd ends the points it lists. The game (core/b.js lines 55-60) matches fingers by `identifier` in touchmove/touchend, so a
second finger lifting never drops the steering finger: NO game change, no unit check needed. Same bug in the edge re-grip and I.release
(they sent touchEnd with no points). Fix in qa/gauntlet-flight.js: `tp('touchEnd')` lists the held finger, `I.tap` ends point 7.
## 2. Clear rates (real input, stepped clock, stage 1 + boss, 8 seeds unless noted; box 4 cores, PAR 2-3)
"clear" = boss killed, "clean" = no game over on the way. W302/W291 counted clean-ish runs; both shown.
| run | boss killed | clean (0 game overs) | target | result |
|---|---|---|---|---|
| phone 390x763 dodger (dash on) | 8/8 | 5/8 (62 %); 7/8 with <= 1 game over | >= 40 % | PASS (was 1/8 with the harness bug) |
| phone shooter | 8/8 | 7/8 (88 %) | >= 60 % | PASS |
| PC 1440x860 dodger | PARTIAL: 4 of 8 seeds finished when time ran out: 4/4 | 3/4 | >= 75 % | NOT COMPLETE (seeds 5-8 not finished) |
| PC shooter | PARTIAL: 3 seeds: 3/3 | 2/3 | none | NOT COMPLETE |
| phone dodger pull cap 300 | NOT RUN | | | not needed: the harness fix alone passes |
0 console/page errors, 0 stuck, HUD == state in every finished run.
Failed (not clean) runs, lives lost to: phone dodger s2 1 game over (7 hits in stage 1 by enemy orbs, last hit at the boss 760 u away), s3 1 (6 orb hits,
one needle), s8 2 (boss shots at 531 / 489 u, boss killed on the 2nd go); phone shooter s3 2 (15 orb hits, 1 needle, stage 1 only); PC dodger s1 3
(orbs, needles); PC shooter s1 1. Mostly small enemy orbs at 10-30 u; boss hp at death is not recorded by the harness (not measured).
## 3. Gates vs base (git worktree of alex/brave-carson-rbpmlk): NOT RUN
playability-probe phone 4x CPU flight + street (3 rounds), visible-test, w227probe (the file is gone from the tree; last copy: git show e8b948700:games-src/nightrun/qa/w227probe.js), flow-test: NOT RUN (60 min cap; the box was busy with the gauntlets and the probe needs a quiet box).
## 4. Shots at 390x763 / 1440x860 (flight 10 s and boss): NOT TAKEN (time). Gauntlet shots exist only if SHOTS= is set; not set.
## 5. Next (one task each)
1. (haiku) Re-run PC dodger 8 seeds + PC shooter: `GAME_DIR=<built games/mainhattan-nightrun> DEVS=pc STRATS=dodger,shooter SEEDS=8 NOCTL=1 PAR=2 WALL=900 STAGES=1 node games-src/nightrun/qa/gauntlet-flight.js`.
2. (haiku) Gates vs base on a quiet box: playability-probe flight/street phone x3 alternating, visible-test, flow-test, w227probe from e8b948700.
3. (opus) Shots at both sizes (flight 10 s + boss) and the strict look; W302 items 2-3 still open.
