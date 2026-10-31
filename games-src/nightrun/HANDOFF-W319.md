# HANDOFF W319: release candidate (branch nr/W319-rc = W317 + W318, not deployed)

## W318 decision: KEEP (merged --no-ff, clean, no hand edits)
Rule (owner brief): keep if with-W318 PC clears >= without - 1. Full stage from the title, duelist, PC 1440x860, 6 seeds, one browser at a time, GAME_DIR builds in /tmp worktrees:
- (a) W317 alone: 2/6 cleared (seeds 0, 3; died street 93-154 s)
- (b) W317 + W318: 3/6 cleared (seeds 2, 3, 4) -> 3 >= 2-1, KEEP.
Noise warning: W317's own run was 4/4 on PC, W316 5/6, W318 3/6: this cell swings 2-5 of 6 between runs of the same code. The keep is by the rule, not proof of a gain.
- (b) phone 390x763 duelist 4 seeds: 2/4 cleared (seeds 1, 2; deaths at 94 s and 119 s). W318's own claim was 6/6: not reproduced (W317 alone 3/4, W316 4/6).
- (b) streetsim RUNS=40: idle 0 PASS; gfirst 85 (>=73 PASS); dodge 65 (65+-8 PASS); still-foes 17.5 PASS; nearest 10 (band 25-40 FAIL; W317 alone 13, W318 on its base 25: W318 + W309 constants together make the casual bot's street harder); best-bot 60-80 band, threat peak, cover, D3 spread FAIL as on W317.
Open owner decision (unchanged from W317): the casual-player street (nearest 10%) is too hard; loosen W309 constants or the W310 wave. Not tuned here.

## Table (final code = W317 + W318, tests run on a fresh build of it)
| row | result |
|---|---|
| merge W318 | PASS clean; rebuild 0 errors |
| flow-test | PASS 0 failed (91) |
| gauntlet-shell | PASS 0 failed (399) |
| claims-check | PASS (17) |
| copy-test | PASS 0 failed (15) |
| focus-test | PASS (15) |
| streetsong x3 | PASS x3 |
| streetdraw | PASS (3) |
| footvis-test | PASS 0 failed (171) |
| gauntlet-foot controls (phone + pc, 44 px, overlaps, on screen, layouts incl. portrait ON/OFF) | PASS 0 failed (57) |
| smoke.sh whole (TMO 120) | 1 FAIL of 12: labfull (34 s). Re-run alone on the final build once: PASS; on W317 alone: PASS. Flaky (failed 2 of 3 runs on final build): FLAKY, cause not found. All others PASS (hud-cover, ui-align x3, hub, story, flow, gunnertele, nocaps); fingerprint SKIP PRE-EXISTING |
| foot-test.js (RUNS=1) | 55 pass / 10 FAIL. Bot rows (reaches checkpoint and boss, run lasts 2-6 min, weapons level, stats) are the file's documented STALE scripted bot: PRE-EXISTING. Control rows FAIL: "land 763x390 and 844x390 result screen buttons": fAgain and fCity 48 px OK, fFly (fly button) h=0 not shown. NOT compared with W317 alone: UNKNOWN whether a bug (likely the button is hidden when not cleared and the row demands it) |
| real-input stage starts: ON FOOT from the title at 390x763 touch and 1440x860 | PASS: 10 gauntlet runs reached the stage and finished, results.json shows no page errors |
| 844x390 touch start; FLIGHT start; pause; result console error counts | NOT RUN (hard stop) |
| NEXT STAGE by real tap after a real clear | flow-test PASS (clicks #srNext); no separate run: NOT RUN |
| full stage phone duelist x4, PC duelist x6 | see decision above |
| boss-only PC late BEHIND caption | NOT RUN (see below) |
| boss-arrival screenshots | LOOKED (taken by gauntlet at the boss fight, a few seconds after arrival, not the exact frame): phone 390x763 (seed 1): boss bar BIG HEAVY across top, Kai and boss both on screen, buttons clear of the action; PC 1440x860 (seed 2): boss bar, boss and Kai at the right edge with the "GUARD [I]" prompt, readable. No defect seen |

## BEHIND caption finding (not reproduced, from code)
The caption is the W161 warning: foot.js:292 and street3.js:55 set S.behind = 1 s before every spawn from the left; the draw is in streetlook.js. In a boss-only cell (JUMP=152) the waves are skipped, so a harness expecting that caption before a left spawn can see none. Likely harness expectation, not unexplained on-screen text (rule 8): no caption appears without a spawn. Unverified; run the JUMP=152 late PC cell once to confirm, owner file street3.js.

## Next
Owner: decide nearest-bot difficulty. Run the NOT RUN rows (flight start / pause / result console errors, 844x390 start, BEHIND repro). Check labfull flake and the fFly row against W317.
