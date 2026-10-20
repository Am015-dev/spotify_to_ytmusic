# Nightrun strict fourth review (20 Oct 2026, 07:24-08:00 UTC)

Measured on branch head `4920087` (full industry audit and all bot suites), then re-merged once to `d84a923` (seeded remix `RET.remix` + new-mechanic cadence `RET.rules`) and re-measured predictability and repetition there. No W12/W23 commit landed during the run (W12 and W23 were already in `4920087`). No game code changed. Tests ran one at a time.
Raw: `review/industry-audit-4.json` (full run on `4920087`). Same personas, 13 lines and weights as REVIEW-STRICT-3 (43.7) and REVIEW-STRICT-2 (39.0).

## Headline
**HEADLINE 45.9 / 100** (43.7 before, +2.2; 39.0 on 18 Oct). Mean of the two harshest: V 44.5 and R 47.2. Panel mean 47.3.
What moved: enemies are seen before they die, replays now differ (react + remix), dash direction and the weapons sheet are fixed on the phone.
What did not: the must-move strike is still a wall for a player without the oracle, camping still equals dodging, the default build still has no beat-timed DASH/EMP, and boss mechanics are switched off.

## 1. Industry audit (INDUSTRY-STANDARDS.md)
06:40 run: 11 PASS / 14 FAIL / 3 SKIP (5 hard FAIL). Now, full run on `4920087` (`--gate` exit 1): 19 PASS / 10 FAIL / 3 SKIP (5 hard FAIL). With the `d84a923` re-measure (S17, S13, S14, S15, S23): **21 PASS / 8 FAIL / 3 SKIP (3 hard FAIL: S13, S15, S23; S01 marginal, below)**.

| Std | 06:40 | Now | Value now (target) |
|---|---|---|---|
| S01 | PASS 2.09 | PASS 2.14 (full); 1.47 on the stage-10-only probe at `d84a923` | >= 1.5 s: watch, the remix build dips on stage 10 |
| S02 | PASS 0 | PASS 0 | <= 15% |
| S03 | PASS 3.13 | PASS 3.13 | 3-10 s |
| S04 | FAIL 4.96 | FAIL 10.79 | 12-60 (closer) |
| S05 | PASS 14 | PASS 22 | <= 150 |
| S06 | FAIL 1.08 | **PASS 1.85** | 1.5-3.5x |
| S07 | PASS 6.22 | PASS 6.42 | 3-10 |
| S08 | PASS 78.6 | PASS 78.9 | 20-80 |
| S09 | FAIL 0.40 | **PASS 0.21** | <= 35% |
| S10 | PASS 88.6 | PASS 91.3 | 40-110 s |
| S11 | PASS 3 | PASS 3 | >= 3 |
| S12 | FAIL 13 | **PASS 8** | 6-12 |
| S13 | FAIL 0.84 | FAIL **0.82** (fresh audit) | < 0.75 |
| S14 | FAIL 0.37 | **PASS 0.32** (fresh audit) | < 0.35 |
| S15 | FAIL 28.4 | FAIL **30.2** min (fresh audit) | <= 15 min |
| S16 | PASS 120 | PASS 132 in the first 30 min | >= 40 |
| S17 | FAIL 0.62 | FAIL 0.53 (3 seeds) -> **PASS 0.32** (5 seeds, `d84a923`) | <= 0.35 |
| S18 | PASS 0.29 | PASS 0.41 (5 seeds) | >= 0.25 |
| S19 | PASS 1 | PASS 1 | >= 0.67 |
| S20 | FAIL 0 | FAIL 0 | 0.3-1.5 EMP/min |
| S21 | PASS 4.77 | PASS 5.53 | 3-10 |
| S22 | FAIL 0.95 | FAIL 0.97 | <= 70% reflex dashes |
| S23 | FAIL 0.11 | FAIL **0.20** (9/45 first try, fresh audit) | 55-90% |
| S24 | FAIL 0 | FAIL 0 | 3-8 contacts |
| S25 | PASS 149 | PASS 149 | 90-240 s |
| S26/S27/S29 | SKIP | SKIP | no 150 s stage / pit stop never fires in sim / no decision log |
| S28 | FAIL 2 | FAIL 2 | >= 3 assists |
| S30 | PASS 2 | PASS 4 (seeker 5 vs 0, wall 6 vs 0, curtain 4 vs 0) | >= 2x |
| S31 | PASS 0 | PASS 0 | <= 15% |
| S32 | PASS 2.3 | PASS 1.8 s | <= 20 s |

**Audit defects (the numbers above are not all trustworthy):**
- S24 reads 0 contacts although the stage-20 non-god run *failed* (116.5 s, not cleared, 0 contacts): the contact counter is broken.
- S31 reads 0% because every weapon cleared stage 1 in exactly 147.4 s: the stage is time-locked, so this measures nothing. choices-test on Hard st30 gives the real spread: storm -33% time vs median (gate 15%): **FAIL**.
- S20 = 0 EMP/min: the audit bot never presses EMP on the default build. timing-test's smart bot uses 4.1/min with `?timing=1`.

## 2. Bot suites (Normal unless named)
| Bot | St 3/10/20 clear | Source |
|---|---|---|
| parked, 8 weapons x heights | 0% (0/108) | mustmove-test |
| hop | 0% (0/108) | mustmove-test |
| tracker | 0% (0/108) | mustmove-test |
| dodger (with oracle) | 83% (hits 4.3) | reward-test, 12 runs |
| dodger, reward off | 92% | reward-test |
| bold | 50% (hits 5.8) | reward-test: **FAIL** bold < camp |
| camper (x=70) | **92%** (hits 5.2) | reward-test |
| audit dodger, no oracle | 20% first try (9/45 stages) | repeat-audit, `d84a923` |
| `?timing=1` reflex dash | 67% (hits 4.8) | timing-test |
| `?timing=1` beat-timed dash | 100% (hits 1.5) | timing-test |
| `?timing=1` random DASH/EMP | 67% (hits 5.9): **FAIL** gate <= 40% | timing-test |
| `?timing=1` no DASH/EMP | 17% (hits 7.1) | timing-test |
| `?timing=1` Hard st5 mid, all bots | 0% | timing-test: **FAIL** |
| default build (timing off), per REVIEW-3 | reflex 93%, random 63%, no dash 30% | not re-run |
| Hard max camper, build2 on / off | 75% / 75% | choices-test |
| react on vs off (st 3/7/12) | dodger 97% -> 77%, tracker 0 -> 0 | react-test |

Score in reward-test is `NaN` for the dodge and camp bots: a scoring or harness bug (bold reads 382,773).

**Visible seconds** (visible-test, PULSE 3 + SWARM 10, Normal st 3/10/20): killed before visible 0/210. Median on screen: drone 1.90, mine 1.53, swarm 1.82, charger 2.33, flank 2.37, zoo 2.5-3.2, walker 4.1, turret 5.6, gunship 9.8 s. All PASS.

**Predictability** (stage 10, 5 seeds): `4920087` Jaccard 0.58, fire CV 0.34; `d84a923` (remix) **Jaccard 0.32, fire CV 0.41**, distinct first-15 orders 5/5. react-test: position gap between attempts 0 -> 81 px, fire-time spread 0 -> 2.35 s.

**Bosses** (bossplay-test, `?bossplay=1`, Easy): ignore/play time 1.00 (tresor, adler), 1.32-1.59 for the other 8; gate >= 2x: **13 FAIL**. Seeds differ on 10/10 bosses.

**Enemy variety** (variants-test, kinds -> looks): st3 3 -> 17, st5 7 -> 21, st10 9 -> 21, st20 20 -> 48, st30 20 -> 55, st45 12 -> 25. Arcade spawns: drone 29%, charger 15%, mine 14%, swarm 13%.

**Other suites:** density ALL PASS; dash-dir ALL PASS (portrait 390x763 and landscape); ui-weapons ALL PASS; abil PASS; counter PASS; forge FAIL (Hard st30 hybrids outside 15%: railric x0.80, halocoil x0.75, thunderhead x1.19).

## 3. Owner complaints
| | Complaint | Verdict | Number |
|---|---|---|---|
| a | Enemies die before they are seen (PULSE 3 + SWARM 10) | **FIXED** | 0/210 killed before visible; shortest median 1.53 s (mine) |
| b | Enemies and bosses predictable | **PARTLY** | stage Jaccard 0.62 -> 0.32, fire CV 0.41, react on; bosses' seeded order differs 10/10 but boss gates are OFF |
| c | DASH and EMP useless | **PARTLY** | DASH matters (no dash 17-30% vs 83-100%), but 97% of dashes are reflexes and EMP is 0/min on the default build; the timing fix that changes this is OFF |
| d | Dash goes the wrong way in portrait | **FIXED** | dash-dir-test ALL PASS at 390x763 |
| e | Boring / repetitive | **PARTLY** | repeat 84 -> 82% (gate 75), plain loop 37 -> 32% (gate met), mechanic gap 30 min (gate 15) |
| f | Weapons screen overlap | **FIXED** | ui-weapons-test ALL PASS |
| g | Normal beaten too easily | **NOT FIXED, and inverted** | with the oracle the dodger clears 83%, a camper 92% with 5 hits a stage; without the oracle 20%. Easy for the one who reads the strike, a wall for the one who does not |
| h | Creativity (forge, variants, boss mechanics) | **PARTLY** | variants 17-55 looks per stage, forge works (balance FAIL), boss mechanics exist but are OFF and fail their 2x gate |

## 4. Panel (same lines and weights; first 30 min / hour 3)
| # | Line | W | V | R | M | P | Mean 30 | Mean h3 | REVIEW-3 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 5.5/5 | 6/5 | 6.5/5.5 | 6.5/5.5 | 6.1 | 5.3 | 5.6/4.8 |
| 2 | Variety | 16 | 5.5/4.5 | 6/4.5 | 6/5 | 6/5 | 5.9 | 4.8 | 5.4/4.2 |
| 3 | Bosses | 8 | 5.5/4.5 | 5.5/4.5 | 5.5/5 | 6/5 | 5.6 | 4.8 | 5.6/4.8 |
| 4 | Difficulty | 10 | 4/3 | 5/4 | 4.5/3.5 | 5/3.5 | 4.6 | 3.5 | 4.6/3.5 |
| 5 | Build depth | 8 | 4/3 | 4/3 | 4.5/3.5 | 4.5/3.5 | 4.3 | 3.3 | 4.2/3.2 |
| 6 | Music / beat | 8 | 5/3 | 4.5/3 | 5/4 | 5.5/4 | 5.0 | 3.5 | 5.0/3.5 |
| 7 | Readability | 8 | 4.5/3.5 | 5.5/5 | 5/4.5 | 5.5/4.5 | 5.1 | 4.4 | 4.6/3.9 |
| 8 | Audio | 4 | 4/3 | 3/2 | 3/2 | 4/3 | 3.5 | 2.5 | 3.5/2.5 |
| 9 | Onboarding | 6 | 5/5 | 5/5 | 4.5/4.5 | 5/5 | 4.9 | 4.9 | 4.9/4.9 |
| 10 | Progression | 8 | 5/3.5 | 5/3.5 | 5/3.5 | 5/3.5 | 5.0 | 3.5 | 5.0/3.5 |
| 11 | On-foot | 3 | 4/3 | 4/3 | 4/3 | 3/3 | 3.8 | 3.0 | 3.8/3.0 |
| 12 | Touch | 5 | 5.5/5.5 | 6.5/6.5 | 6.5/6.5 | 5.5/5.5 | 6.0 | 6.0 | 5.5/5.5 |
| 13 | Polish | 2 | 4.5/4 | 5/4.5 | 5/4.5 | 4.5/4 | 4.8 | 4.3 | 4.8/4.2 |
| | **Weighted 30 / h3** | | 49.1/39.9 | 52.2/42.2 | 52.5/44.1 | 54.0/44.2 | 52.0 | 42.6 | 49.9/40.5 |
| | **Reviewer** | | **44.5** | **47.2** | 48.3 | 49.1 | panel 47.3 | | 43.7 headline |

- V: "Replays differ now, and I see every enemy. But I camp at x=70 and clear more than when I dodge, and the strike still one-shots anyone who has not learned it."
- R: "The beat-dash exists (100% vs 67% reflex) but it is behind a flag. On the default build the dash I press is still a panic button."
- M: "The phone bugs I hit are gone. Hour 3 is still the same Garage loop; no new mechanic for 30 minutes."
- P: "Three hard gates still red (repeat, mechanic gap, first-try clear), S01 marginal. Fund the timing flip and the strike rework, not more content."

## 5. Flags: what should default ON now
| Flag | Decision | Measured reason |
|---|---|---|
| RET.timing | **ON** | beat 100% / 1.5 hits vs reflex 67% / 4.8 vs no dash 17% / 7.1: the only change that makes timing pay; EMP use 0 -> 4.1/min for a smart player. The failing gate is a 108-dash/min random masher (67%) that no human plays, and Hard st5 was 0% for every bot before the flag too. |
| RET.build2 | **stay OFF** | camper Hard max 75% on and 75% off: no measured lever; its own gates (ret-test, tutorial-test) not cleared. |
| RET.bossplay | **stay OFF** | ignore/play 1.00-1.59x (gate 2x), 13 FAIL; balance Normal stage 8 ~72% (HANDOFF W23). |

The one-line change: `parts/timing.js` line 15:
`if(RET.timing===undefined)RET.timing=!/[?&]timing=0/.test(location.search);   // ON by default; ?timing=0 = old`
then update the header of `timing-test.js` (it already forces `?timing=1`) and rebuild.

## 6. Top 5 remaining problems
1. **The must-move strike is a binary wall.** No oracle: 20% first-try clears; oracle: 83-92%.
2. **Camping beats dodging.** Camper 92% vs dodger 83% vs bold 50% on Normal; Hard max camper 75%, unchanged by build2.
3. **Dash is a reflex and EMP is idle on the default build.** 97% reflex dashes, 0 EMP/min (S20, S22).
4. **Boss mechanics do not pay.** Ignoring a gate costs 1.0-1.6x the time; switched off.
5. **Hour-3 repetition.** Repeat 82% (gate 75%), 30 minutes with no new mechanic (gate 15).
Also: audit S24/S31 are broken, reward-test scores NaN, forge hybrids out of balance.

## 7. Top 5 next tasks
| # | Task | Model | Cost trade-off |
|---|---|---|---|
| 1 | Flip RET.timing ON (one line), rebuild, phone-check | haiku | 5 min; biggest measured skill gain per token |
| 2 | Grade the strike: beat warning, partial first-hit damage, 3 tiers by stage; gate: no-oracle bot >= 55% Normal | opus | design and feel; one task, highest impact on S23 and complaint g |
| 3 | Anti-camp: rear/flank spawns and aimed shots at a ship parked > 4 s; gate: camper <= dodger - 25 points | sonnet | tuning, measurable with reward-test |
| 4 | bossplay: replace the time ratio by hull lost, pick FB/OPEN so ignoring costs >= 2x; then flip | sonnet | tuning + test change; keeps bossmoves-test green |
| 5 | Fix audit S24 contacts, S31 time lock, reward-test NaN score | haiku | mechanical; without it the gates lie |

## Reproduce
`OUT=games-src/nightrun/review/industry-audit-4.json node games-src/nightrun/industry-audit.js --gate`; `STAGES=10 SEEDS=5 NOGOD= node games-src/nightrun/industry-audit.js`; `CONFIGS=arcade-normal node games-src/nightrun/repeat-audit.js`; `timing-test.js`; `TABLE=1 visible-test.js`; `bossplay-test.js`; `REPORT=1 choices-test.js` (and `PART=camp Q='&build2=0'`); `STAGES=3,10,20 mustmove-test.js`; `STAGES=3,10,20 RUNS=4 REPORT=1 reward-test.js`; react, counter, variants, forge, density, abil, dash-dir, ui-weapons tests (all with `NODE_PATH=$(npm root -g)`).
