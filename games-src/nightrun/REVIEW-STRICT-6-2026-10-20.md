# Nightrun strict sixth review (20 Oct 2026, 18:28-19:25 UTC)

Measured on `df49ca5` (boss enrage 6b1e085, Normal difficulty pass 21fea6a, DASH/EMP heat 8bab74a, fire jitter c7612a6, bossplay soft cap a6b87d8, economy 013b3c7, UI align ab93a8f). Other workers pushed while this ran, so every test used a frozen copy of the built game at `df49ca5` (GAME_DIR). No game code changed. Tests ran one at a time (each harness has its own PAR=4).
Raw: `review/industry-audit-6.json` (full run, SEEDS=5, repeat numbers from a fresh arcade-normal repeat-audit on `df49ca5`). Same personas, 13 lines and weights as reviews 5 (48.8), 4 (45.9), 3 (43.7), 2 (39.0).

## Headline
**HEADLINE 49.5 / 100** (48.8 before, +0.7). Mean of the two harshest: V 48.3 and R 50.6. Panel mean 50.9.
What moved: Normal is fair for a human again (human-model 39% -> 69%), the economy is back in band (10.2 h), fire timing is no longer regular (S18 0.20 -> 0.52), the UI has 0 alignment findings at all three phone sizes, and the mechanic gap is down to 7 min.
What got worse: the random DASH/EMP masher now clears 92% (was 58%; gate 40%), so beat play barely matters on Normal. Boss mechanics now pay 1.2-1.4x time (was 2.5-2.9x). Late bosses run 159-196 s. Hard is a wall: 0 clears in 144 runs, oracle included. The camper is back up to 44% (was 17%).

## 1. Industry audit
Review 4: 21 P / 8 F / 3 S -> review 5: 21 P / 9 F / 2 S (2 hard F) -> **now: 24 P / 6 F / 2 S (2 hard F: S23, S30)**. `--gate` exit 1.

| Std | Review 5 | Now | Target | Note |
|---|---|---|---|---|
| S01 / S02 | PASS 2.30 / 0 | PASS 2.22 / 0.01 | >= 1.5 s / <= 0.15 | |
| S03 / S04 | 3.67 / 12.03 | PASS 3.39 / 12.31 | 3-10 s / 12-60 | S04 still marginal |
| S05-S09 | PASS | PASS 23 / 1.63 / 7.63 / 74.9 / 0.25 | | |
| S10 | FAIL 180.65 s | **PASS 132.7 s** | 40-135 | **target raised from 110 to 135 in a6b87d8**; on the review-5 target it still FAILs |
| S11 / S12 | 3 / FAIL 13 | PASS 3 / **PASS 8** | >= 3 / 6-12 | |
| S13 | 0.43 | PASS 0.41 | < 0.75 | novelty OFF: 0.82 |
| S14 | 0.26 | PASS 0.29 | < 0.35 | |
| S15 | 11.0 min | **PASS 7 min** | <= 15 | novelty OFF: 10.2 |
| S16 | 250 | PASS 257 | >= 40 | novelty OFF: 135 |
| S17 / S19 | 0.33 / 1 | PASS 0.32 / 1 | | |
| S18 | FAIL 0.20 | **PASS 0.52** | >= 0.25 | fire jitter |
| S20 | FAIL 0 | **FAIL 2.4 / min** | 0.3-1.5 | audit bot now presses EMP (d690123) and over-uses it; its rule, not the game |
| S21 | 5.12 | PASS 6.51 | 3-10 | |
| S22 | FAIL 0.94 | FAIL **0.96** | <= 0.70 | dashes are still reflexes |
| S23 | FAIL 0.18 | FAIL **0.36** | 0.55-0.90 | doubled, still under |
| S24 / S25 | 5.67 / 149.1 | PASS 4.67 / 149.1 | | |
| S26 / S27 | SKIP | SKIP | | no 150 s story stage; pit stop still never fires in the sim (d690123 did not fix it) |
| S28 | FAIL 2 | FAIL 2 | >= 3 | |
| S29 | FAIL 4.67 | **PASS 8.49** | >= 6 | |
| S30 | PASS 2 | **FAIL 1.5** (hard) | >= 2x | S30 is now the ability median (4e757c6), so this is a method change as much as a regression |
| S31 | FAIL 0.22 | FAIL **0.42** | <= 15% | worse |
| S32 | 3.6 s | PASS 2 s | <= 20 | |

## 2. Bot suites (Normal unless named)
| Bot | St 3/10/20 clear | Source |
|---|---|---|
| parked, 16 weapons x heights | 0% (0/108) | mustmove-test |
| hop | 0% (0/108) | mustmove-test |
| tracker | 2% (2/108) | mustmove-test |
| **human-model, owner build** (n=36) | **75 / 83 / 50 = 69%**, hits med 8/6/9 | humanbot RUNS=12 |
| human-model, mid build (n=36) | 92 / 58 / 58 = 69%, hits 8/9/10 | humanbot |
| oracle dodger, owner / mid (n=36) | 100/75/83 / 100/92/67 = 86% | humanbot |
| no-oracle audit dodger, first try | **36%** (S23) | industry-audit |
| anticamp dodger (oracle) | 78%, hits 6.5 | anticamp-test, n=36 |
| camper x=70 | **44%**, hits 8.5 (review 5: 17%) | anticamp-test |
| bold | 81%, hits 9.5 | anticamp-test |
| noor (no strike oracle) | 89%, hits 7.6 | anticamp-test |
| Hard max build: dodger / camper | 63% / 13% | anticamp-test, n=24 |
| timing reflex dash | 75%, hits 7.3 (gate 70%: FAIL) | timing-test RUNS=4 |
| timing beat dash | 100%, hits 4.1 | timing-test |
| **timing random DASH/EMP** | **92%, hits 8.8 (gate 40%: FAIL; review 5: 58%)** | timing-test |
| timing no DASH/EMP | 58%, hits 9.1 | timing-test |
| timing Hard st5 mid, all bots | 0% (FAIL) | timing-test |
| **Hard, human-model + oracle, owner + mid, st 3/10/20** | **0% (0/144)**, hits med 6-9 | humanbot with diff forced to hard (scratch copy, not committed) |

Other suites: bossplay **2 FAIL** / 68 PASS; visible 0/269 killed before visible (PASS); dash-dir PASS (portrait + landscape); ui-weapons PASS; novelty PASS; flankers PASS; mustmove PASS; grit PASS (EMP 0.29 charges/min, 0.20 uses/min; TTK owner build st8: drone 1.9 s, charger 2.4, flank 2.5, turret 3.6, gunship 6.0, gate 30); econ **PASS 10.2 h** only with `SAVE=1` (default econ-test reads the stale committed story-sim.json and prints NaN: harness bug since 73e4fd5; n=6 clears).

### Bosses (bossplay-test, Normal, real hits, 24 runs per boss)
| Boss | Play s / hull | Ignore s / hull | Time x | Hull x |
|---|---|---|---|---|
| tresor | 59 / 22 | 81 / 31 | 1.36 | 1.42 |
| bruecke | 62 / 24 | 83 / 36 | 1.34 | 1.51 |
| schranke | 69 / 23 | 82 / 35 | 1.18 | 1.56 |
| messe | 62 / 27 | 83 / 38 | 1.34 | 1.41 |
| hoplite | 66 / 23 | 84 / 39 | 1.29 | 1.72 (Easy sanity 1.09x: FAIL) |
| adler | 97 / 41 | 135 / 55 | 1.39 | **1.35 FAIL** |
| krake | 101 / 42 | 139 / 64 | 1.37 | 1.53 |
| ice | 104 / 29 | 140 / 66 | 1.35 | 2.28 |
| kronos | **159 / 60** | 192 / 91 | 1.21 | 1.51 |
| talos | **166 / 50** | 196 / 94 | 1.18 | 1.87 |
Review 5 measured 2.47-2.95x. The soft cap shortened the ignore fight, and the payoff shrank with it. A player who plays the trick right still loses 22-60 hull on one boss.

## 3. Feature ON vs OFF (human-model + oracle, owner + mid builds, st 3/10/20, RUNS=8: n=48 per bot, SE about 7 points, `df49ca5`)
| Off switch | Human clear / hits | Oracle clear | Other number | Verdict |
|---|---|---|---|---|
| all ON | 69% / 7.8 | 92% | | baseline |
| `?novelty=0` | 73% / 9.0 | 94% | repeat 82% vs 41%, distinct 355 vs 2356, new first 30 min 135 vs 257, mech gap 10.2 vs 7 min; first-try fails 30 vs 29 stages | **keep ON** |
| `?bossplay=0` | 69% / 8.7 | 92% | payoff 1.2-1.4x time ON | keep ON, payoff needs work (task 3) |
| `?bprage=0` (enrage, stage <= 12) | 82% / 8.5 | 88% | | +13 for the human (about 2 SE): the enrage is a real early-stage cost; keep ON only if it teaches the trick |
| `?flankers=0` | 82% / 8.5 | 86% | | +13 human, -6 oracle: borderline; keep ON (camping gate) |
| `?timing=0` | 81% / 8.2 | 94% | beat 100% vs masher 92% ON | timing costs the human 12 points and does not reward the beat over mashing: **the timing chain is not doing its job** |
| `?grit=0` | **54%** / 6.3 | 58% | | **confounded**: the Normal hit mercy (21fea6a) lives in grit.js, so OFF also removes the mercy. Not a verdict on grit toughness |
| `?anticamp=0` | 71% / 7.8 | 86% | camper 44% ON | noise; keep ON |

## 4. Owner complaints
| Complaint | Verdict | Number |
|---|---|---|
| Enemies die before visible | **FIXED** | 0/269 killed unseen; S01 2.22 s (shortest kind), S02 1% under 0.7 s |
| Predictable enemies and bosses | **FIXED** | Jaccard 0.32, 5/5 distinct orders, fire CV 0.52 (was 0.20); 25 distinct boss behaviours in 240 min |
| DASH/EMP useless | **PARTLY, worse** | beat 100% vs no-dash 58% (gap 42 points, was 67); random masher 92%, so timing is not needed; 96% of audit dashes are reflexes |
| EMP charges too fast | **FIXED** | 0.29 charges/min (gate <= 1.5); the audit bot's own EMP rule fires 2.4/min |
| Too easy / too hard on Normal (human model) | **FIXED for the human model, not for first try** | human-model 69% (review 5: 39%, gate >= 60%); no-oracle first try 36% (gate 55%); Hard 0/144 |
| Portrait dash direction | **FIXED** | dash-dir PASS |
| Boring / repetitive | **FIXED on the metric** | repeat 41%, plain loop 29%, mech gap 7 min; with novelty OFF 82% |
| Weapons screen | **FIXED** | ui-weapons PASS; ui-align 0 findings at 390x763 / 375x553 / 844x390. Weapon spread S31 0.42 is a balance FAIL, not a screen issue |
| Creativity | **mostly** | 10 bosses x 3 mechanics + enrage, 15 rules mechanics, novelty events (2356 distinct encounters in 4 h) |
| Boss payoff and length | **REGRESSED payoff, length passes only a relaxed target** | ignore/play 1.18-1.39x time, 1.35-2.28x hull (was 2.5-2.9x); S10 132.7 s vs the old 110 target; kronos/talos 159-166 s when played right |

## 5. UI
| Check | 390x763 | 375x553 | 844x390 |
|---|---|---|---|
| ui-align (22 screens) | 0 findings | 0 findings | 0 findings |
| hud-cover | PASS 14.9% | PASS **19.3%** (gate 20%; review 5: 17%) | PASS (no coverage gate; 47.4% measured) |

## 6. Panel (same lines and weights; first 30 min / hour 3)
| # | Line | W | V | R | M | P |
|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 6.0/5.4 | 6.2/5.2 | 6.8/5.8 | 6.8/5.8 |
| 2 | Variety | 16 | 5.9/5.7 | 6.4/5.7 | 6.4/6.4 | 6.2/5.9 |
| 3 | Bosses | 8 | 5.7/4.5 | 5.8/4.7 | 5.9/5.3 | 6.3/5.2 |
| 4 | Difficulty | 10 | 5.0/3.3 | 5.8/4.3 | 5.6/4.1 | 5.9/4.0 |
| 5 | Build depth | 8 | 4/3 | 4/3 | 4.5/3.5 | 4.5/3.5 |
| 6 | Music / beat | 8 | 5.5/3.5 | 4.8/3.5 | 5.3/4.3 | 5.7/4.3 |
| 7 | Readability | 8 | 4.9/3.9 | 5.8/5.3 | 5.4/4.9 | 5.9/4.9 |
| 8 | Audio | 4 | 4/3 | 3/2 | 3/2 | 4/3 |
| 9 | Onboarding | 6 | 5.0/5.0 | 5.0/5.0 | 4.5/4.5 | 5.0/5.0 |
| 10 | Progression | 8 | 5.3/4.3 | 5.3/4.3 | 5.3/4.3 | 5.4/4.4 |
| 11 | On-foot | 3 | 4/3 | 4/3 | 4/3 | 3/3 |
| 12 | Touch | 5 | 5.5/5.5 | 6.5/6.5 | 6.5/6.5 | 5.5/5.5 |
| 13 | Polish | 2 | 4.7/4.2 | 5.2/4.7 | 5.2/4.7 | 4.7/4.2 |
| | **Weighted 30 / h3** | | 52.6/44.0 | 55.0/46.2 | 55.9/48.9 | 56.8/48.1 |
| | **Reviewer** | | **48.3** | **50.6** | 52.4 | 52.4 |

Hour-3 difficulty stays low because Hard, the hour-3 ladder, clears 0/144. Bosses drop on every persona (payoff and length). Music/beat drops for R and P because mashing clears 92%.
- V: "Normal finally feels fair; I clear most stages. But the last bosses take nearly three minutes even when I do the trick, and Hard kills everyone."
- R: "I mashed DASH and EMP at random and cleared 92%. The beat window is there but nothing makes me use it."
- M: "Still something new every few minutes; no stretch longer than 7 min without a new mechanic."
- P: "Two hard gates left (first try 36%, answer value 1.5x). S10 passes only because its target moved. Economy is back at 10 h."

## 7. Flags
| Flag | Decision | Reason |
|---|---|---|
| novelty | keep ON | repeat 82 -> 41%, no clear-rate cost |
| bossplay | keep ON, rework payoff | 1.2-1.4x time; late fights 159-196 s |
| bprage | keep ON, review | costs the human 13 points at stage <= 12 |
| timing | keep ON, fix the masher | masher 92% vs beat 100% |
| flankers, anticamp | keep ON | noise-level effect |
| grit | keep ON; split the Normal mercy out of grit.js so it can be measured alone | OFF removes the mercy (confound) |
| gritboss (Hard boss mercy) | measure next | OFF by default, Hard 0/144 |
| build2 | stay OFF | not re-measured |

## 8. Top 5 remaining problems
1. Random DASH/EMP mashing clears 92% (gate 40%, was 58%): the beat timing is optional on Normal, and 96% of dashes are reflexes.
2. Hard is a wall: 0/144 clears for human-model and oracle at stages 3/10/20; timing-test Hard st5 0% for all bots.
3. Boss payoff collapsed to 1.2-1.4x time (was 2.5-2.9x); late bosses take 159-196 s and 50-90 hull. S10 passes only on a target raised from 110 to 135 s.
4. No-oracle first-try clear 36% (S23 hard FAIL), answer value 1.5x (S30 hard FAIL).
5. Camper 44% (was 17%) and weapon spread S31 0.42 (was 0.22); econ-test harness prints NaN without SAVE=1.

## 9. Next 6 tasks
| # | Task | Tier |
|---|---|---|
| 1 | Masher fix: off-beat DASH/EMP must cost (heat locks did not do it; failed once as a sonnet task); gate random <= 40%, beat >= 90%, reflex <= 70%, human-model >= 60% | opus |
| 2 | Hard wall: measure `?gritboss=1`, then tune Hard so the oracle clears >= 40% and human-model >= 15% at st 3/10/20; Normal unchanged | sonnet |
| 3 | Boss payoff and length: S10 <= 110 s on the original target, every boss ignore/play >= 2x hull, kronos/talos played right <= 120 s and <= 30 hull (soft cap and enrage both tried: escalate) | opus |
| 4 | S23 first-try no-oracle >= 55% and S30 answer value >= 2x without lifting the masher | sonnet |
| 5 | Harness chores: econ-test reads the story-sim temp output (or sets SAVE=1 and restores the file); S27 pit stop in the sim; split the Normal mercy into its own flag (`?nmercy=0`) so grit ON/OFF is clean; S20 bot EMP rule to 4+ bullets within 120 px | haiku |
| 6 | Camper back under 25% (44% now) and S31 weapon spread <= 15% (0.42) | sonnet |

## What to tell the owner
Normal is now fair: our human-like bot clears 69% of stages (39% last round), and the economy is back to about 10 hours to buy everything. Enemies are always seen, the game doesn't repeat itself (41% repeats in 5 minutes), and the menus are clean on all three phone sizes. Three things are wrong. Pressing DASH and EMP at random clears 92%, so the beat timing doesn't matter yet. Hard can't be cleared at all, not even by our perfect bot. And the boss tricks now save only about a third of the fight time: the last two bosses take almost three minutes even when you play them right. The next round should fix the masher, open Hard and shorten the bosses. It shouldn't add content.

## Reproduce
All with `NODE_PATH=$(npm root -g) GAME_DIR=<frozen copy of games/mainhattan-nightrun at df49ca5>`: `CONFIGS=arcade-normal OUT=<f> [Q=&novelty=0] repeat-audit.js`; `SEEDS=5 REPEAT=<f> OUT=review/industry-audit-6.json industry-audit.js --gate`; `BOTS=human,dodger BUILDS=owner,mid STAGES=3,10,20 RUNS=12 REPORT=1 humanbot.js` (RUNS=8 with `Q=&<flag>=0` for section 3; Hard = humanbot with `m.SET.diff='hard'` in a scratch copy); `STAGES=3,10,20 RUNS=4 timing-test.js`; `REPORT=1 anticamp-test.js`; `STAGES=3,10,20 mustmove-test.js`; bossplay-test; grit-test; `SAVE=1 econ-test.js` (then `git checkout -- games-src/nightrun/playtest/story-sim.json`); visible-test; dash-dir; ui-weapons; novelty; flankers; `hud-cover-test.js <index.html>`; `VP=<size> ui-align-test.js`.
