# W313 street boss duel part 5: full matrix at the FINAL constants (GRACE .28, TGRACE .09, HPK 8, ENR .8 / ENRAT .5, late bot 600 +-150 ms). No constant changed.
Boss only = JUMP=152, real input (Playwright keys/mouse on PC, CDP touch on phone 390x763 and 844x390), qa/gauntlet-foot.js, TS 3, seeds 0..n-1. "cleared n/N" = boss killed.
| cell | band | result | hits taken (clears) |
|---|---|---|---|
| 844x390 late | 20-50% | 5/8 (62%) ABOVE band | 3-6 (the 3 deaths: 12, 7, 7) |
| 844x390 duelist | 60-90% | 8/8 (100%) above band | 0-1 |
| phone duelist | 60-90% | 8/8 (100%) above band | 0-1 |
| PC late / phone late / PC duelist | | W309: 4/8, 2/8, 7/8 (not re-run) | |
| masher PC / phone / 844x390 | <= 20% | 0/4, 0/4, 0/4 PASS | |
| random PC / phone / 844x390 | <= 20% | 0/4, 0/4, 0/4 PASS | |
| idle PC / phone / 844x390 | <= 20% | 0/4, 0/4, 0/4 PASS | |
| dodger PC | <= 20% | 4/4 (100%) FAIL | 2, 2, 2, 6 |
| dodger 844x390 | <= 20% | 4/4 (100%) FAIL | 2, 5, 2, 3 |
| dodger phone | <= 20% | 0/4 PASS | 4-9 |
## Constants: NOT changed, and why
The dodger clears on PC and 844x390 because the gauntlet "dodger" is a reactive bot: it guards / dashes / jumps at once whenever the boss attacks, and its log shows 9-14 RIGHT answers per move type per run (duelist-like). Every lever that stops it (smaller GRACE, stronger ENR, more HPK) also hits the late reader, which is already 4/8 PC and 5/8 844x390, so one lever cannot fix the dodger without pushing late under 20%. Needs an owner decision (see HANDOFF-W313.md). The duelist is above 90% on phone and 844x390, so there is headroom to tighten.
## Full stage from the title (ON FOOT tap/click, story card SKIP, street, boss), 6 seeds, no JUMP, game seconds
| cell | cleared | reached the boss | run length (s) | hits taken |
|---|---|---|---|---|
| PC duelist | 3/6 | 3/6 | died 77, 130, 100; cleared 224, 207, 197 | 8-15 |
| PC late | 0/6 | 2/6 (boss hp 254 and 211 left) | 62-176 | 8-16 |
| phone duelist | 0/6 | 0/6 | 77-94 (all died in the street, to rushers) | 9-15 |
| phone late | 0/6 | 1/6 (boss hp 130 left) | 75-198 | 11-17 |
The street BEFORE the boss kills these bots (hurtBy mostly rusher), so the boss band cannot be reached from the title by them. Bands for a full stage were not given; this is a finding, not a pass.
## foot-test.js (W311 copy, RUNS=2): 45 PASS, 18 FAIL
Landscape (763x390, 844x390): layout audit FAIL, fBomb / fGuard overlap in both auto-fire states. Phone/desktop bot lines are the file's own STALE scripted bot (dies to drones at 19-60 s): "reaches the checkpoint and the boss", "lasts 2-6 min", "weapons level up". Also FAIL: JUMP tap leaves the ground (phone), pause toggle stage opens, stats run counted. There is no check named STREET CLEAR in the file.
