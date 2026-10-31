# HANDOFF W263: on-foot fight tuned to the gates (branch nr/W263-fair, not deployed)

Numbers, knobs and rejected experiments: `BALANCE-W263.md` (read that first). Base = 3999148, live = 91af04f.

## Gate table (pooled over seed blocks 4321 / 9001 / 20011; RUNS=40 each = 120 runs per bot; RUNS=12 pooled = 36 runs)
| gate | base | live | new | new RUNS=12 |
|---|---|---|---|---|
| idle | 0% | 0% | 0% | 0% |
| gfirst 75 +-8 | 72.5 | 72.5 | 79.2 | 83.3 |
| dodge 65 +-8 | 66.7 | 71.7 | 69.2 | 72.2 |
| nearest 25-40 | 39.2 | 40.8 | 40.8 FAIL (35..48 by block) | 44.4 |
| kill order gap >= 15 | 33 | 32 | 38 | 39 |
| stand still < 20% | 17.8 | 22.0 FAIL | 11.8 | 12.4 |
| max attackers <= 2 | 4 FAIL | 2 | 2 | 2 |
| threat peak 82-88, cover hits >= 3, seed == real time | FAIL | FAIL | FAIL | FAIL (documented, not changed) |

Per-run records are in the scratchpad only; reproduce any block with `SEED0=<n> RUNS=40 ... streetsim.js` (new env var SEED0, default 4321, so old numbers are unchanged).

## Changes (4 lines of game code)
- street/streethard.js: `HPK.gunner` 1.2 -> 0.9. street/foot.js: `ZTF` .21, foe melee depth reach (Kai's own `ZT` stays .15). street/street2.js: rusher `rest` drifts back 4 px/s.
- qa/streetsim.js: `SEED0`. qa/street-rt-test.js: new real-time test (phone + PC, ~3 min, wall clock on purpose).

## Still failing / open
1. nearest-first 40.8% pooled vs gate 25-40 (blocks 48/40/35). Needs a lever that hurts a shoot-nearest player and not a gunner-first one; none found among HPK, CROUCH, RESTT, cooldowns.
2. Real-time proof is missing: the crude skilled bot lost 4 of 4 real-time tries (see BALANCE-W263.md). Owner or a better real-time bot should play one street on phone and PC before this is merged.
3. The rule-9 cap (real time <= 60 s) was exceeded on purpose, as the task asked for a full stage.
4. Duplicate owners seen, not fixed: attacker cap lives twice (foot.js `MAXATK` and streetcircle.js `C.SLOTS`), both 2.
5. Merge conflict risk: none known; branch is the live branch plus 3 game files, 2 qa files, 2 docs.
