# HANDOFF W317: integration pass 4 (branch nr/W317-integrate4, base nr/W315-integrate3, not deployed)

## Done
Merged --no-ff origin/nr/W313-duel5 (W309 street boss constants, late bot, BALANCE-W309/W313) then origin/nr/W314-gold2 (seeded humanbot, push-gate 24 paired seeds). Both merges clean: no conflicts, no hand edits. Rebuild: 0 guard warnings. No code changed by this pass beyond the merges.
Cut short by the orchestrator's hard stop: unfinished rows say NOT RUN.

## Table (merged build in /tmp/w317, one bot cell at a time)
| test | result |
|---|---|
| flake8 E9,F63,F7,F82 | 0 |
| build warnings | 0 |
| flow-test | 0 failed |
| gauntlet-shell | 0 failed (re-run alone; first run was spoiled by a stray second runner I started and killed) |
| claims-check | PASS all |
| copy-test | 0 failed |
| bossbar-layout | 0 failed |
| focus-test | PASS |
| preload-test | 0 failed |
| streetsong x3 | PASS x3 |
| streetdraw | PASS |
| footvis-test | 0 failed |
| gauntlet-foot controls (44 px, no overlap, on screen: 390x763, 375x553, 844x390) | PASS |
| foot-test.js control rows | NOT RUN |
| smoke.sh whole | NOT RUN |
| streetsim RUNS=40 | idle 0 PASS; gfirst 90 (gate 73+ PASS); dodge 73 (65+-8 PASS); nearest 13 (band 25-40 FAIL; W315 had 23: the W309 constants take it lower, report, not tuned); still-foes 16.9 PASS. Other FAILs as before: best-bot 60-80 band, threat peak, cover, D3 spread, one-seed-equals-real-time (rule-18 beatPos debt) |
| open-probe GATE=1 | 4/4 PASS |
| gauntlet-flight phone dodger x4 | boss killed 4/4, minStage 3, stuck 0, err 0, hud 0/299 |
| gauntlet-flight phone shooter x4 | boss killed 4/4, minStage 4, stuck 0, err 0, hud 0/256 |
| full stage from title, phone 390x763 duelist x4 | cleared 3/4 (one died at 112 s in the street); W316 baseline 4/6 |
| full stage from title, PC duelist x4 | cleared 4/4; W316 baseline 5/6 |
| boss-only phone duelist x4 (JUMP=152) | cleared 3/4 (W313 8/8); the death was seed 3, boss hp 269 left |
| boss-only PC late x4 (JUMP=152) | cleared 2/4 (W313 4/8). The 2 harness FAILs are "foe spawned from the left but BEHIND caption never active" (seeds 0, 1). NOT checked against the W313 source, so merge bug vs pre-existing is UNKNOWN |
| push-gate (report line) | FAIL 4 checks, base 1000: CHOOSE clear 51% vs HOLD 71%, PUSH 47%; pooled score 1.31x PASS; 20 seeds HOLD clears where CHOOSE dies. Base 0 line not captured |
| real-input starts, 0 console errors (title, flight, ON FOOT at 390x763 touch, 844x390 touch, 1440x860) | NOT RUN (script at /tmp/w317log/starts.js, not committed) |
| NEXT STAGE by real tap after a real clear | flow-test PASS (clicks #srNext); no separate run |

## Wrong / open
1. streetsim nearest 13 (was 23 on W315, 43 on W304): the casual-player street is now much harder; needs an owner decision (loosen W309 constants or W310 wave).
2. push-gate CHOOSE clears less than HOLD (51% vs 71%): design gate fails.
3. BEHIND-caption finding on PC late boss-only: check on origin/nr/W313-duel5 built alone.
## Next
Run the NOT RUN rows; compare item 3 against W313; owner decision on item 1.
