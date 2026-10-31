# W316 full stage from the title (street + boss), real input, TS 3, 6 seeds, current build of nr/W313-duel5 (no game constant changed)
Harness: qa/gauntlet-foot.js (W316=1 adds a 5 s trace + a shot at every heart lost; logs in /tmp/w316, not committed). Phone 390x763 touch (CDP), PC 1440x860 keys+mouse. Seeds 0-5, one run per seed.
| cell | reached the boss | cleared | where the others died |
|---|---|---|---|
| phone duelist | 4/6 | 4/6 (t 210, 218, 202, 213 s; plus a first seed-0 run 197 s) | seed 0 t=76 s (7 hits: 6 rusher, gunner shots), seed 5 t=135 s (11 rusher hits) |
| PC duelist | 5/6 | 5/6 (t 200, 216, 196, 209, 218 s) | seed 5 t=131 s (7 hits: 4 rusher, 2 gunner, heavy) |
| phone late | 6/6 | 5/6 (t 228, 224, 235, 220, 227 s) | seed 2 died in the boss fight at 222 s, boss hp 4 left |
| PC late | 3/6 at least (seeds 2, 3 boss hp 81 and 11 left; seed 5 reached it, end not logged) | 0/6 confirmed, seed 5 unknown | seed 0 t=131 s, seed 1 t=142 s, seed 4 t=134 s: all in the street |
PC late numbers: the two late runs (phone, PC) were started in parallel into the same OUT/log by mistake, so the PC summary lines were overwritten; the PC rows come from the trace files and the surviving log lines. Redo PC late alone for an exact figure.
Target (phone duelist >= 3/6 reach, >= 2/6 clear; PC >= 4/6 reach, >= 3/6 clear): met on this build, 4/6 and 5/6.
## Where and how the bots die (the street, not the boss)
- The boss arrives at street clock 144.2 s in every run (street3.js: the camera gate is clock-paced, S3.T.boss 145, waves 12, peak 136 s). With cam2 the camera follows Kai, so a bot that runs right reaches the end of the street at about t=47 s (phone camera stops at x 7533, PC 7318) and then waits about 97 s for the boss, pinned at the right edge of the view (kaiRel 314/330 phone, 744/760 PC).
- Every death in the street is in that wait: 2-4 rushers at a time (right spawn is camX+vw+40, about 56 units from Kai at the wall, left spawn camX-40), then heavy + gunner late in the ramp (waves threat 2 -> 8). Rusher melee is 70-100% of the hits (phone seed 5: 11 of 11).
- Bot input is correct: trace shows mx 1 on empty street, 0.5 + fire + knife at a foe, mx -1 / dash / guard on telegraphs. Touch stick is held and Kai moves (x 124 -> 1250 in 5 s).
## Finding vs W313
W313's 0/6 (phone), 3/6 (PC duelist) is not reproduced with the same code and the same harness. The cause of the difference is NOT measured. Candidate (untested): load. W313 gave no process count; here the PC runs ran next to a second browser (frame p95 33-50 ms vs 16.8 ms alone) and still cleared, but the game clock runs at TS 3 x real time, so a slower bot loop reacts later in game time. Same seed gives different outcomes run to run (phone seed 0: cleared at 197 s, then died at 76 s), so 6 seeds is a wide interval: phone duelist 4/6 means roughly 30-95% at 95%.
## Not run
Load test of the W313 numbers, streetsim RUNS=40 gates (no game change), 844x390, weak bots. No game change was made, so the gates are unchanged from W309.
