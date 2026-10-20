# Nightrun strict fifth review (20 Oct 2026, 11:11-11:55 UTC)

Measured on `4c77370` (novelty ON by default), then re-merged once to `d47d783` (166cf89: enemy bullets respect BCAP/ebCap again; test triage) and re-measured the industry audit, repeat-audit and the human-model bot there. Final numbers below are `d47d783` unless marked. No game code changed. Tests ran one at a time (each harness uses its own PAR=4).
Raw: `review/industry-audit-5.json` (full run on `d47d783`, SEEDS=5, repeat numbers from a fresh arcade-normal repeat-audit on `d47d783`). Same personas, 13 lines and weights as REVIEW-STRICT-4 (45.9), -3 (43.7), -2 (39.0).

## Headline
**HEADLINE 48.8 / 100** (45.9 before, +2.9; 43.7; 39.0). Mean of the two harshest: V 46.9 and R 50.6. Panel mean 50.1.
What moved: repetition is solved on the metric (repeat 82% -> 43%, mechanic gap 30 -> 11 min), boss mechanics now pay (all 10 bosses 2.47-2.95x, gate 2x), camping no longer pays (camper 17% vs dodger 58%), beat-timed dash is on by default.
What did not: a player without the oracle still fails most stages first try (18%), a boss fought without the mechanic now lasts 181 s (S10 hard FAIL, was 91 s), the audit bot still never uses EMP and 94% of its dashes are reflexes.

## 1. Industry audit
06:40: 11 P / 14 F / 3 S (5 hard F) -> review 4: 21 P / 8 F / 3 S (3 hard F) -> **now: 21 P / 9 F / 2 S (2 hard F: S10, S23)**.
First pass on `4c77370` read a stale repeat file (17 P / 13 F); the numbers below use a fresh repeat-audit.

| Std | Review 4 | Now | Target | Note |
|---|---|---|---|---|
| S01 | 2.14 | PASS 2.30 | >= 1.5 s | |
| S02/S05/S09 | PASS | PASS 0 / 23 / 0.26 | | |
| S03 | 3.13 | PASS 3.67 | 3-10 s | |
| S04 | FAIL 10.79 | **PASS 12.03** | 12-60 | marginal |
| S06/S07/S08 | PASS | PASS 1.85 / 7.4 / 67.7 | | |
| S10 | PASS 91.3 | **FAIL 180.65 s** | 40-110 | bossplay ON: the audit bot ignores the mechanic, fights take ~2x |
| S11 | 3 | PASS 3 | >= 3 | |
| S12 | PASS 8 | FAIL 13 | 6-12 | bossplay adds attacks |
| S13 | FAIL 0.82 | **PASS 0.43** | < 0.75 | novelty ON (OFF: 0.83) |
| S14 | PASS 0.32 | PASS 0.26 | < 0.35 | |
| S15 | FAIL 30.2 | **PASS 11.0 min** | <= 15 | OFF novelty: 11.7, so rules/remix did this |
| S16 | 132 | PASS 250 | >= 40 | |
| S17 | 0.32 | PASS 0.33 (5 seeds) | <= 0.35 | 3 seeds on `4c77370`: 0.36 |
| S18 | 0.41 | **FAIL 0.20** | >= 0.25 | 0.30 on `4c77370`; 166cf89 or seed noise |
| S19 | 1 | PASS 1 | | |
| S20 | FAIL 0 | FAIL 0 | 0.3-1.5 | audit bot never presses EMP |
| S21 | 5.53 | PASS 5.12 | 3-10 | |
| S22 | FAIL 0.97 | FAIL 0.94 | <= 0.70 | |
| S23 | FAIL 0.20 | FAIL **0.18** (37/45 first-try fails) | 55-90% | |
| S24 | FAIL 0 (broken) | **PASS 5.67** | 3-8 | counter fixed |
| S25 | 149 | PASS 149.1 | | |
| S26/S27 | SKIP | SKIP | | no 150 s story stage / no pit stop in sim |
| S28 | FAIL 2 | FAIL 2 | >= 3 | |
| S29 | SKIP | FAIL 4.67 | >= 6 | now measured |
| S30 | PASS | PASS 2 (FAIL 1 on the first pass) | >= 2x | counter-test is noisy at the gate edge |
| S31 | PASS 0 (broken) | FAIL 0.22 | <= 15% | now real (visible-test ALL=1) |
| S32 | 1.8 | PASS 3.6 s | <= 20 | |

## 2. Bot suites (Normal unless named)
| Bot | St 3/10/20 clear | Source |
|---|---|---|
| parked, 16 weapons x heights | 0% (0/108) | mustmove-test |
| hop | 0% (0/108) | mustmove-test |
| tracker | 0% (0/108) | mustmove-test |
| anticamp dodger (oracle) | 58%, hits 4.9 (gate 66%: FAIL) | anticamp-test, 12 runs |
| camper x=70 | **17%**, hits 6.3 (was 92%) | anticamp-test |
| bold | 50%, hits 7.6 | anticamp-test |
| noor (dodger, no strike oracle) | 33% (gate 55%: FAIL) | anticamp-test |
| timing reflex dash | 50%, hits 5.2 | timing-test RUNS=4 |
| timing beat dash | **100%, hits 4.0** | timing-test |
| timing random DASH/EMP | 58%, hits 7.3 (gate 40%: FAIL) | timing-test |
| timing no DASH/EMP | 33%, hits 8.0 | timing-test |
| timing Hard st5 mid, all bots | 0% (FAIL) | timing-test |
| **human-model, owner build** (n=36) | **67 / 33 / 17 = 39%**, hits med 8/7/6 | humanbot, `d47d783` |
| human-model, mid build (n=36) | 67 / 25 / 8 = 33%, hits 9/7/7 | humanbot |
| oracle dodger, owner / mid (n=36) | 100/42/25 / 100/75/42 | humanbot |
| audit dodger, no oracle, first try | 18% (8/45) | repeat-audit |

Other suites: bossplay 65 PASS 0 FAIL; visible 0/216 killed before visible (PASS); dash-dir ALL PASS (portrait + landscape); ui-weapons ALL PASS; novelty PASS; hud-cover PASS (17% at 375x553); grit PASS (EMP 0.19 charges/min, TTK owner build st8: drone/charger/flank 2.5 s, turret 3.6, gunship 6.0, gate 30); econ **FAIL 21.0 h** (gate 9-13; garage cost 25,529 Neon).

## 3. Feature ON vs OFF (human-model + oracle, owner+mid builds, st 3/10/20, RUNS=8: n=48 per bot, SE about 7 points, on `4c77370`)
| Off switch | Human clear | Oracle clear | Other number | Verdict |
|---|---|---|---|---|
| all ON | 42% | 71% | | baseline |
| `?novelty=0` | 46% | 65% | repeat 83% vs 43%, distinct encounters 356 vs 2477, new things first 30 min 154 vs 241, mech gap 11.7 vs 10.6 min; first-try fails 34 vs 35 | **keep ON**: costs no clear rate, halves repetition. Caveat: part of the distinct count is twist suffixes on the same wave; econ OFF not measurable (story-sim has no query) |
| `?bossplay=0` | 46% | 59% | ignore/play 2.47-2.95x ON; S10 181 s ON vs 91 s (review 4) | **keep ON**, but cap fight length for a player who ignores it |
| `?flankers=0` | 44% | 61% | | noise; keep ON (camping gate needs it) |
| `?timing=0` | 42% | **86%** | beat 100% vs no-dash 33% ON | keep ON: the only switch that rewards beat play; it hurts the oracle, not the human |
| `?grit=0` | **55%** | 71% | | grit costs the human 13 points (about 2 SE): it is what makes Normal hard for a human |
| `?anticamp=0` | 42% | 52% | camper 17% ON vs 92% before | keep ON |

## 4. Owner complaints
| Complaint | Verdict | Number |
|---|---|---|
| Enemies die before visible (PULSE 3 + SWARM 10) | **FIXED** | 0/216; shortest median 1.50 s (swarm), drone 2.15 s; S01 2.30 |
| Predictable enemies and bosses | **FIXED (metric)** | Jaccard 0.33, 5/5 distinct orders, boss seeds differ 10/10; fire CV 0.20 is below 0.25 (S18 FAIL) |
| DASH/EMP useless | **PARTLY** | beat dash 100% vs no-dash 33% clear; EMP smart bot 1.51/min; audit bot EMP 0/min, 94% reflex dashes |
| EMP charges fast | **FIXED** | 0.19 charges/min (gate <= 1.5) |
| Weapons superior / too easy on Normal | **FIXED, now too hard for a human** | human-model 39% clear, hits 6-8 per stage; owner build median kill life S03: drone 2.3 s, swarm 1.7 s (TTK 2.5 s); camper 17% |
| Portrait dash direction | **FIXED** | dash-dir ALL PASS |
| Boring / repetitive | **FIXED on the metric, PARTLY in feel** | repeat 43% (gate 75), plain loop 26%, mech gap 11 min; twists are suffixes on known waves |
| Weapons screen overlap | **FIXED** | ui-weapons ALL PASS |
| Creativity (forge, variants, bosses, rules, novelty) | **PARTLY -> mostly** | 10 bosses with 3 mechanics each that pay 2.5-2.9x; 15 rules mechanics; novelty events; forge balance noisy (ledger FLAKY) |

## 5. Panel (same lines and weights; first 30 min / hour 3)
| # | Line | W | V | R | M | P |
|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 5.8/5.3 | 6.5/5.5 | 6.8/5.8 | 6.8/5.8 |
| 2 | Variety | 16 | 5.8/5.5 | 6.3/5.5 | 6.3/6.2 | 6.1/5.7 |
| 3 | Bosses | 8 | 6.0/5.0 | 6.2/5.2 | 6.2/5.7 | 6.7/5.7 |
| 4 | Difficulty | 10 | 4.0/3.0 | 5.3/4.3 | 4.8/3.8 | 5.3/3.8 |
| 5 | Build depth | 8 | 4/3 | 4/3 | 4.5/3.5 | 4.5/3.5 |
| 6 | Music / beat | 8 | 5.5/3.5 | 5.3/3.8 | 5.5/4.5 | 6.0/4.5 |
| 7 | Readability | 8 | 4.7/3.7 | 5.7/5.2 | 5.2/4.7 | 5.7/4.7 |
| 8 | Audio | 4 | 4/3 | 3/2 | 3/2 | 4/3 |
| 9 | Onboarding | 6 | 4.7/4.7 | 4.7/4.7 | 4.2/4.2 | 4.7/4.7 |
| 10 | Progression | 8 | 5/3.9 | 5/3.9 | 5/3.9 | 5/3.9 |
| 11 | On-foot | 3 | 4/3 | 4/3 | 4/3 | 3/3 |
| 12 | Touch | 5 | 5.5/5.5 | 6.5/6.5 | 6.5/6.5 | 5.5/5.5 |
| 13 | Polish | 2 | 4.5/4 | 5/4.5 | 5/4.5 | 4.5/4 |
| | **Weighted 30 / h3** | | 50.8/43.0 | 54.9/46.4 | 54.7/48.0 | 55.9/47.4 |
| | **Reviewer** | | **46.9** | **50.6** | 51.4 | 51.6 |

Onboarding went down 0.3: more systems are on by default (timing chain, boss mechanics, novelty events) and the first-try clear is 18%.
- V: "Bosses finally ask something of me, but if I miss the trick the fight drags for three minutes. I still fail four stages in five the first time."
- R: "The beat dash is on and it is the best way to play (100% vs 33%). The bot that plays like most people still only dashes in panic."
- M: "Hour 3 no longer feels like the same loop; something new every few minutes."
- P: "Two hard gates left: first-try clear and boss length. Economy is now 21 h, outside its band."

## 6. Flags
| Flag | Decision | Reason |
|---|---|---|
| novelty | keep ON | repeat 83 -> 43%, no clear-rate cost |
| bossplay | keep ON + cap | pays 2.5-2.9x; add a soft cap so ignoring it ends near 110 s (S10) |
| timing, flankers, anticamp | keep ON | see table 3 |
| grit | keep ON, retune down on Normal | costs the human 13 points; Normal human clear 39% |
| build2 | stay OFF | not re-measured |

## 7. Top 5 remaining problems
1. First-try clear for a player without the oracle: 18% (S23), noor 33%, human-model 39%. Normal is now too hard, not too easy.
2. Boss fights without the mechanic last 181 s (S10 hard FAIL).
3. EMP is idle and dashes are panic for the audit bot (S20 0/min, S22 94%); the random masher still clears 58%.
4. Economy 21 h to buy everything (gate 9-13).
5. Fire CV 0.20 (S18) and weapon spread 22% (S31); oracle dodger 58% under its own 66% gate.

## 8. Next 6 tasks
| # | Task | Tier |
|---|---|---|
| 1 | Normal difficulty pass: grit toughness x1.15 -> ~x1.0 on Normal only, strike first-hit scorch on every stage; gate human-model >= 60%, S23 >= 55% | sonnet |
| 2 | Boss soft cap: after 90 s of ignoring the mechanic, the bar takes x2; gate S10 <= 110 s and ignore/play still >= 2x | sonnet |
| 3 | Random-masher fix: off-beat EMP costs more, masher <= 40% while beat >= 90% | sonnet |
| 4 | Teach the beat dash/EMP to a reflex player (a ring on the beat, first-stage drill); gate S22 <= 70%, S20 >= 0.3 | opus |
| 5 | Economy back to 9-13 h (prices or replay pay) | haiku |
| 6 | Audit fixes: S20 bot presses EMP, S27 pit stop in sim, story-sim query passthrough (econ ON/OFF), S30 counter-test noise | haiku |

## What to tell the owner
The big three complaints are measurably fixed: enemies are seen (0 of 216 die unseen), the game no longer repeats itself (43% repeats in 5 minutes, was 82%), and bosses now have tricks that halve the fight when you play them. Camping no longer works. The new problem is the opposite of the old one: Normal is now hard for an ordinary player (our human-like bot clears 39%, first try 18%), and a boss whose trick you miss drags on for three minutes. Next round should make Normal fairer and cap boss length, not add content.

## Reproduce
`SEEDS=5 REPEAT=<repeat json> OUT=games-src/nightrun/review/industry-audit-5.json node games-src/nightrun/industry-audit.js --gate`; `CONFIGS=arcade-normal [Q=&novelty=0] node games-src/nightrun/repeat-audit.js`; `BOTS=human,dodger BUILDS=owner,mid STAGES=3,10,20 RUNS=12 REPORT=1 [Q=&<flag>=0] humanbot.js`; bossplay, `STAGES=3,10,20 RUNS=4 timing-test.js`, `REPORT=1 anticamp-test.js`, `STAGES=3,10,20 mustmove-test.js`, grit, `TABLE=1 visible-test.js`, econ, dash-dir, ui-weapons, novelty, hud-cover (all with `NODE_PATH=$(npm root -g)`).
