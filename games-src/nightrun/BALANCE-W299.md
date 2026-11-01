# BALANCE W299: making the GOLD decision fair (branch nr/W299-gold-tune, from nr/W293-decision, not deployed)

Owner of the change: `parts/waves/waves.js` (constant `FCD`), `humanbot.js` (hull-loss cause + push share per run), `qa/push-gate.js`
(`ONLY=push,choose REUSE=<dir>` re-runs just the policies that meet the flak). Setup: humanbot human model, Normal, fresh build,
sim steps, stages 1, 4, 6 (stages 2-3 clear 100% and stage 5 0% for every policy: no signal), same seeds for every policy.

## 1. Instrument: where lives are lost (W293 constants, 8 seeds, hull points lost per run)
| policy · stage | clear | bullets | collision | flak | other | flak rings/run | share of time in push |
|---|---|---|---|---|---|---|---|
| HOLD · 1 / 4 / 6 | 50 / 63 / 38% | 3.3 / 3.3 / 4.5 | 0.5 / 0.5 / 0.4 | 0 | 0.1 / 2.1 / 2.4 | 0 | 0 |
| PUSH · 1 / 4 / 6 | 38 / 88 / 25% | 2.3 / 2.5 / 3.5 | 1.4 / 1.8 / 1.5 | 0.6 / 0.8 / 0.8 | 0.1 / 1.8 / 2.3 | 8 / 8 / 12 | 51 / 62 / 63% |
| CHOOSE · 1 / 4 / 6 | 38 / 75 / 13% | 2.8 / 4.5 / 3.8 | 1.0 / 0.8 / 1.4 | 0.3 / 0.3 / 0 | 0.1 / 1.6 / 3.0 | 0.6 / 3.5 / 3.8 | 13 / 25 / 24% |
Findings: (a) the flak is a small part of the cost: 0.6-0.8 hull per run for PUSH out of 5-9, because a ring every 1.6 s per gun is
read and left (retreat or DASH). The real price of pushing is ramming into foes (collision x3 of HOLD). (b) CHOOSE's 8-seed deficit
to HOLD (42 vs 50% on stages 1/4/6) is inside the noise of 24 runs (the same PUSH config moved 88 -> 38% on stage 4 between two
runs); its own losses are the same bullets and collisions as HOLD plus ~0.5 hull of collision while pushing, and stage 6 gunships
reach it with 3.8 rings/run. (c) PUSH is not punished because it meets only 8-12 rings per run in 60% of the time spent close.
No change was made to the bot to make a number pass; its rules (hull >= 2 soft squads, hull >= 3 + DASH/EMP ready for guns) are as in W293.

## 2. One constant, one hypothesis
| try | hypothesis | constant | result (8 seeds, same seeds) |
|---|---|---|---|
| W293 | - | FCD 1.6 s | CHOOSE 42 vs HOLD 50%, PUSH 50% (FAIL, FAIL); stage 6 CHOOSE 13% |
| W299-1 | PUSH sits inside 170 px of a gun for most of a squad, so more rings per gun make its time close cost more; CHOOSE (guns only at hull >= 3 with DASH/EMP) is exposed to few | flak cooldown FCD 1.6 -> 1.0 s | CHOOSE 58% vs HOLD 50%, PUSH 42%: all 6 rows PASS; stage 6 CHOOSE 63% |
Not tried (out of time): telegraph FT, ring size FN, FR, GOLD per fifth, the 'half up close' rule.

## 3. Confirmation of the built constant (FCD 1.0, 16 seeds, stages 1, 4, 6, all four policies fresh, nothing reused)
| gate row | need | result | |
|---|---|---|---|
| CHOOSE score vs HOLD | >= 1.25x | 1.75x (paired median 1.68) | PASS |
| CHOOSE clear >= HOLD | >= | 67% vs 58% | PASS |
| PUSH clear <= CHOOSE - 15 | <= 52% | 40% | PASS |
| mode switches / 20 s | >= 1 | 3.27 | PASS |
| squads with another mode than the previous | >= 30% | 48% (n 635) | PASS |
| golds without DASH/EMP | >= 20% fewer | 66 vs 162 (59% fewer) | PASS |
| info GOLD rate HOLD / PUSH / CHOOSE / NOAB | CHOOSE 40-70 | 0 / 64 / 45 / 13% | ok |
Per stage (clear %, HOLD / PUSH / CHOOSE / CHOOSE-no-DASH-EMP): stage 1: 56 / 44 / 69 / 44; stage 4: 81 / 38 / 81 / 69; stage 6: 38 / 38 / 50 / 13.
Stage 6 is clearable by CHOOSE (50%, gate >= 40). Caveat: 16 seeds per cell is still +-12 points; the PUSH rows on stage 6 (38 = HOLD) and
stage 1 (44 vs 69) are the weak ones, and stage 5 (mini-boss, 0% for every policy) was not run: it is a separate balance problem.
Hull lost per run in push at 16 seeds: PUSH collision 1.2-1.7 + bullets 2.4-3.6 + flak 0.4-0.5; CHOOSE flak 0-0.2.

## 4. Keep checks (FCD 1.0 build)
- waves-test: 22 PASS; FAIL lines identical to W293/base (b/c/d on stages 1-3, the slice stages).
- humanbot calibration, stage 3, fresh/mid/late, 12 runs: 100/100/100 (W293: 100/100/100; both above the bite target, as before).
- visible-test: zoo-efdrone 1.37 s and zoo-einterceptor 1.37 s fail (need 2 s); W293 notes the same two failed on base (0.72 s). Not flak related.
- flake8 E9,F63,F7,F82: 0. GOLD toast/chip: untouched (no HUD code changed).
- NOT done: phone fps 3 alternating runs vs W293 (a rings-per-second change only; no render change), flow-test.
- Real input: see HANDOFF-W299.md.
