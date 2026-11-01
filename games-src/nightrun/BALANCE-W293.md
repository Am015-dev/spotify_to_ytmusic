# BALANCE W293: the push-or-hold GOLD bounty (design: DESIGN-DECISION-W247.md on nr/W247-design)

Built as the default (RET.gold, `?gold=0` = off for before/after tests only). Owner of the behaviour: `parts/waves/waves.js`
(WV.bopen / WV.bty / WV.chip / the RET.resultRow wrapper); `parts/waves/slice.js` opens one bounty per scripted group (2 lines).

## What the player sees and decides
- Every squad starts a bounty clock: top-band chip `GOLD 5s · fly in close, kill the squad · 1/5` (the existing wave chip, no new HUD).
- Kill the whole squad before the clock runs out (1.5 s + 1 s per foe), with at least half of it hit up close (reward.js close bonus,
  140 px) = GOLD: the `up` pickup (+1 weapon level for the stage) at the last kill, the squad's points paid twice again, a 1.2 s chip
  `GOLD 2/5 · +1 weapon level`. A foe that leaves, the clock at 0 or a squad shot from afar = `GOLD LOST` chip (no hull cost).
- The stage is cut in five fifths (by bar): each fifth pays one GOLD, so the player picks WHICH squad to push. Result line:
  `◆ GOLD n/5` (+ best, kept per stage in localStorage `mnr_wvgold`).
- The risk: a wave gun foe (turret, gunship, shielder) answers a ship inside 170 px with a flak burst: a red ring tells it 0.6 s
  ahead, then two rings of 16 bullets (190 and 133 px/s, offset half a step). A bullet needs >= 0.6 s + travel to reach the ship.
  DASH and EMP answer it. A ship at the old home x (220) never triggers it.

## Why the design doc's rule had to change (measured, humanbot human model, Normal, fresh build)
1. A time-only bounty does not separate PUSH from HOLD. Median squad clear was 4.5 s (HOLD) vs 4.1 s (PUSH) (stages 1-6, 4 seeds,
   clock off). Clears are set by spawn stagger and entry flight, and drones die in 2 shots with or without the +35%. So the bounty
   needs close kills.
2. A flat cap of 5 golds was spent on stage 1's first five drone squads in ~20 s. That became one GOLD per fifth.
3. Inside the 190 px no-fire floor (MINSHOT) pushing cost nothing: PUSH cleared as often as HOLD. That added the told flak.

## Gate: `qa/push-gate.js` (stages 1-6, 8 seeds, final build, `RUNS=8 TABLE=1`)
| gate | need | result | |
|---|---|---|---|
| CHOOSE score vs HOLD | >= 1.25x | 1.68x pooled (paired median 1.99x) | PASS |
| CHOOSE clear >= HOLD clear | >= | 56% vs 69% | FAIL |
| PUSH clear <= CHOOSE - 15 | <= 41% | 58% | FAIL |
| CHOOSE mode switches / 20 s (median) | >= 1 | 2.59 | PASS |
| CHOOSE squads with another mode than the previous | >= 30% | 49% (n 581) | PASS |
| CHOOSE golds without DASH/EMP | >= 20% fewer | 55 vs 173 (68% fewer) | PASS |
| info: GOLD rate HOLD / PUSH / CHOOSE / NOAB | HOLD <= 10, CHOOSE 40-70 | 0 / 70 / 52 / 13% | ok |

Per stage (clear %, median score, median gold):
| stage | HOLD | PUSH | CHOOSE | CHOOSE no DASH/EMP |
|---|---|---|---|---|
| 1 | 88 · 98k · 0 | 75 · 176k · 5 | 75 · 143k · 4 | 50 · 72k · 4 |
| 2 | 100 · 26k · 0 | 100 · 71k · 5 | 100 · 56k · 5 | 100 · 23k · 1 |
| 3 | 100 · 31k · 0 | 100 · 64k · 4 | 100 · 53k · 4 | 100 · 30k · 1 |
| 4 | 63 · 41k · 0 | 75 · 96k · 5 | 63 · 93k · 4 | 63 · 37k · 0 |
| 5 | 0 · 51k · 0 | 0 · 81k · 4 | 0 · 85k · 3 | 0 · 34k · 1 |
| 6 | 63 · 57k · 0 | 0 · 114k · 4 | 0 · 95k · 3 | 13 · 41k · 1 |

Read: the two clear gates are noisy and structurally capped. Every policy clears stages 2-3 100% and stage 5 0% (the mini-boss),
so only stages 1, 4 and 6 (24 runs) can tell the policies apart. Same rules, earlier rounds at 8-12 seeds:
CHOOSE vs HOLD = 69/67, 65/65, 68/60 (pass), 56/71 (fail). PUSH = 63, 65, 63, 52, 58.
Stage 6 (gunship lines + turrets) is where pushing now kills both PUSH and CHOOSE. The bot's CHOOSE rule avoids guns near its push
spot, yet still dies there. Next round (owner's play first, rule 16e): either no flak from gunships, or CHOOSE should hold all of stage 6.

## Feature off = unchanged (`PRE='RET.gold=false'` vs the base build, same session)
- waves-test: 22 PASS lines on both; the same FAIL lines on both (b/c/d on stages 1-3 = the slice stages, already there before);
  (f) pooled clear 65% off vs 67% base (one run, sim noise). Gold ON: also 22 PASS, (f) 67%.
- humanbot calibration, stage 3, fresh/mid/late, 12 runs: 100/100/100 off = 100/100/100 base (both FAIL the bite 45-95 target,
  already there before). Gold ON with the default HOLD bot: 100/100/100.
- visible-test (gold on): only zoo-efdrone fails (1.22 s); base fails zoo-efdrone (0.72 s) and zoo-einterceptor (both already there).
- flow-test: 61 PASS, 0 FAIL on both.
- phone fps (benchmark/playability-probe.js flight phone, 60 s, 3 runs alternating with base): base 49.2 / 38.2 / 48.0,
  new 38.4 / 48.1 / 50.6 (median 48.0 vs 48.1, inside the base spread; p95 33.4 ms on all six).

## Real input and phone readability
- qa/gauntlet-flight.js STRATS=shooter STAGES=1 SEEDS=1: phone (CDP touch) and PC (keyboard) both reach the stage 1 result, boss
  killed, 0 errors, 0 rejections; the result shows `◆ GOLD 0/5` on both (the shooter bot never flies in close, so 0 is expected).
  Its two findings (`result NEXT STAGE not clickable` in focus mode, `control does nothing: fire`) are in the result flow / controls
  probe (W292's area); not checked against base in this round.
- Phone 390x763 shots looked at: the clock chip `GOLD 5s · fly in close, kill the squad · 0/5` and the toast `GOLD 1/5 · +1 weapon
  level` sit in the top band under the score bar, ~12 px text on a dark strip, readable; the result line `◆ GOLD 0/5` is readable.
