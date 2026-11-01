# HANDOFF W292 (progression past stage 1)
Done: result screen offers NEXT STAGE / RETRY / TITLE (focus.js hiding rule for #srNext deleted); FLIGHT continues at the first stage not yet cleared with a `Stage N` label (#focStage); stage row 1..N (#focStages) replays unlocked stages. Save = existing `mnr_story` (corrupt/null safe, W262). Design: PROGRESSION-W292.md. Owner files: parts/menus/focus.js only (story.js / profile untouched: they already saved and unlocked correctly).
Proof: qa/flow-test.js now 91 PASS / 0 FAIL on phone 390x763 and PC 1440x860 (chain 1 -> 2 -> 3 by clicks, reload says Stage 3 and row 1..3, row replays stage 2, corrupt and null save -> Stage 1, no page errors). It failed while the row buttons were width:100% (offscreen, caught: "stage row replays stage 2 :: stage 1"), so it fails when broken.
Shots (looked at): result with NEXT STAGE 390; title with Stage 3 label and row 390 and 1440. Not taken: stage-select map (not offered in focus mode by design), result at 1440.

## Gauntlet, PC, qa/gauntlet-flight.js STARTS=n, real input, JUMP=1 (fixture: starts at the boss gate when a stage has one; stages without a boss gate run from the start), NOCTL=1, WALL=200 s, PAR=2, 1 seed only
| stage | dodger | shooter |
|---|---|---|
| 1 | boss seen+killed, result, NEXT -> 2 ok | boss seen, NOT killed in 200 s (1 death) |
| 2 | result, NEXT -> 3 ok | result, NEXT ok |
| 3 | result, NEXT ok | result, NEXT ok |
| 4 | result, NEXT ok | result, NEXT ok |
| 5 (mini-boss) | seen, NOT killed, 2 deaths | seen, NOT killed, 2 deaths |
| 6 | no clear in 200 s (2 deaths) | no clear (2 deaths) |
| 7 | no clear (1 death) | no clear (1 death) |
| 8 (boss) | seen 2x, NOT killed, 2 deaths | seen 3x, NOT killed, 2 deaths |
| 9 | no clear (2 / 1 deaths) | no clear |
| 10 | no clear (2 deaths) | result, NEXT ok |
No page errors, rejections, stuck states or HUD mismatches in any run. Stage 1 PC run without JUMP (earlier): dodger boss killed, result, NEXT ok.
NOT DONE: seeds 2-3 (seed 2 started, killed at the time limit), dodger/shooter 60 sim-s past boss for stages 6-10 (wall cap 200 s at ~0.7 sim-s per wall-s with 2 browsers on 4 cores). No boss file was changed: I did not diagnose bosses 5 and 8 (OPEN-W292-1: bots die at stage 5 and 8 bosses in 2 of 2 runs, same as W270; unknown whether bot skill, armour restore or pattern; needs a bossprobe run per boss with 1 browser). OPEN-W292-2: stages 6-10 not cleared by the bots inside 200 s wall; balance is W293.
Phone 390x763 CDP touch, dodger, JUMP=1: stage 1 -> boss killed, result, NEXT by tap -> stage 2 (seeds 1, 2); stage 2 -> NEXT by tap -> stage 3 (seeds 1, 2); stage 3 seed 1: 2 deaths, no clear. Seed 3 not run. 0 errors, 0 UI overlaps/small targets.
Next (sonnet): 1 browser at a time: JUMP=1 STARTS=5 / 8 with qa/bossprobe.js to find why the bots cannot kill them; then STARTS=6,7,9,10 with WALL=400 and seeds 2-3.
