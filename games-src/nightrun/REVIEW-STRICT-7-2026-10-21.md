# Nightrun strict seventh review (21 Oct 2026, 14:34-15:20 UTC)

Measured on `56e009f` (pacing 603c051, abup 60227de, forgeui e2900bb, classes 5959113, star chip 992cb0b, lessons 5334039, saves 661f802, holdline d1a4b50, powers 9a2d31c, endramp 364fba4 + 4ab5a05, fleet 89704be, footstage 571cd5e, sprites e63637c + afd9b14 + 8150ff4, labfull 3a370ce, Hard boss tuning 88e5e23). Another worker pushed a sprite fix while this ran, so every test used a frozen copy of the built game at `56e009f` (GAME_DIR). No game code changed. Tests ran one at a time.
Raw: `review/industry-audit-7.json` (full run, SEEDS=5, repeat numbers from a fresh arcade-normal repeat-audit on `56e009f`). Same 4 personas, 13 lines and weights as reviews 6 (49.5), 5 (48.8), 4 (45.9), 3 (43.7).

## Headline
**HEADLINE 52.5 / 100** (49.5 before, +3.0). Mean of the two harshest: V 52.0 and R 53.0. Panel mean 53.8.
What moved: a lot of new content that works (fleet ships from stage 6, a finished 7-section on-foot stage, 12 new power-ups, endless that climbs to Legend with no repeated pattern sets, lessons as mini stages, saves with slots and export), stages cut from 140-263 s to 93 s, Hard is no longer a wall (oracle 30%), first-try no-oracle clear passes (S23 58%), answer value passes (S30 5x).
What got worse: **Normal is now too easy.** The human-model bot clears 97% (69% before; S23 range tops at 90%), the camper 81%, and the bot that never presses DASH or EMP clears exactly as often as the beat bot (92% = 92%). The cause is `pacing`: with `?pacing=0` the human model clears 73%. Two hard audit FAILs: S01 (fleet interceptor 1.38 s on screen) and S10 (boss 135.7 s vs 135). Boss payoff is unchanged (1.18-1.39x time). Economy is now too fast (7.6 h, band 9-13).

## 1. Industry audit
Review 5: 21 P / 9 F / 2 S -> review 6: 24 P / 6 F / 2 S (hard F: S23, S30) -> **now: 21 P / 9 F / 2 S (hard F: S01, S10)**. `--gate` exit 1.

| Std | Review 6 | Now | Target | Note |
|---|---|---|---|---|
| S01 | PASS 2.22 | **FAIL 1.38 s** (hard) | >= 1.5 | shortest kind is the new fleet `einterceptor` (n=18, 11% killed within 0.7 s); `efdrone` 1.41 s; old kinds 2.25-6.65 s |
| S02 | 0.01 | PASS 0.04 | <= 0.15 | |
| S03 | 3.39 | **FAIL 2.82 s** | 3-10 | |
| S04 | 12.31 | **FAIL 10.41** | 12-60 | fewer bullets: shorter stages, crowd cap |
| S05 / S07 / S08 / S09 | PASS | PASS 20 / 5.84 / 60.1 / 0.21 | | |
| S06 | 1.63 | **FAIL 1.42** | 1.5-3.5 | late stages no denser than early |
| S10 | PASS 132.7 | **FAIL 135.7 s** (hard) | 40-135 | on the target already raised from 110 |
| S11 / S12 | 3 / 8 | PASS 3 / 8 | | |
| S13 / S14 / S15 / S16 | 0.41 / 0.29 / 7 / 257 | PASS 0.44 / 0.30 / 9.3 min / 290 | | |
| S17 / S18 / S19 | 0.32 / 0.52 / 1 | PASS 0.26 / **0.27** / 1 | S18 >= 0.25 | fire CV fell back near the floor |
| S20 | FAIL 2.4 | FAIL 2.38 / min | 0.3-1.5 | audit bot's EMP rule (human model: 1.07/min, in band) |
| S21 | 6.51 | PASS 6.61 | 3-10 | |
| S22 | FAIL 0.96 | FAIL **0.98** | <= 0.70 | dashes are reflexes |
| S23 | FAIL 0.36 | **PASS 0.58** | 0.55-0.90 | |
| S24 / S25 | 4.67 / 149.1 | PASS 3.33 / **92.8 s** | 3-8 / 90-240 | both near their floors |
| S26 / S27 | SKIP | SKIP | | no 150 s stage left; pit stop never fires in the sim |
| S28 | FAIL 2 | FAIL 2 | >= 3 | |
| S29 | 8.49 | PASS 6.72 | >= 6 | |
| S30 | FAIL 1.5 | **PASS 5x** | >= 2x | |
| S31 | FAIL 0.42 | FAIL 0.22 | <= 15% | better |
| S32 | 2 s | PASS 1.7 s | <= 20 | |

## 2. Bot suites
Normal unless named. n = runs per cell.

| Bot | St 3 / 10 / 20 | Source |
|---|---|---|
| **human-model, owner** (n=12 per stage) | **92 / 100 / 100**, hits med 4/3/2 | humanbot RUNS=12 |
| human-model, mid | 100 / 100 / 100, hits 3/4/2 | humanbot |
| oracle dodger, owner / mid | 100/100/100 / 100/100/92 | humanbot |
| **human-model, all 6 cells pooled** | **97%** (69% in review 6) | |
| no-oracle audit dodger, first try | **58%** (S23 PASS) | industry-audit |
| anticamp dodger (oracle) / noor (no strike oracle) | **97% / 97%** (gate 40-90%: FAIL both) | anticamp-test, n=36 |
| **camper x=70** | **81%**, hits 5.6 (gate: <= dodger - 25: FAIL) | anticamp-test |
| bold | 100% | anticamp-test |
| timing reflex dash | 92% (gate <= 70%: FAIL) | timing-test, n=12 |
| timing beat dash | 92%, hits 2.1 | timing-test |
| **timing random DASH/EMP** | **75%** (gate <= 40%: FAIL; review 6: 92%) | timing-test |
| **timing no DASH/EMP** | **92%** (= beat; gate: below beat: FAIL) | timing-test |
| parked | 0% | timing-test |
| **Hard human-model owner / mid** (n=8) | 25/0/0 / 50/0/0 = **12.5%**, hits 6-8 | humanbot DIFF=hard |
| **Hard oracle owner / mid** | 38/38/25 / 38/25/13 = **30%** (review 6: 0/144) | humanbot DIFF=hard |
| Hard st10 timing: beat / reflex / random / no-dash (n=4) | **50 / 0 / 0 / 0%** | timing-test HARD_ST=10 |
| Hard max build: dodger / camper | 58% / 14% (PASS) | anticamp-test, n=36 |
| **Endless** human-model / oracle, mid (n=10) | wave 10: 100% / 100%; wave 25: **30% / 50%**; wave 30: 0% / 20% | endramp-test |

Read: Normal has stopped separating players. The beat bot, the reflex bot and the bot that never dashes all clear 92%; DASH/EMP only lowers the hits (2.1 vs 4.8). On Hard the beat is the only way through (50% vs 0%), so the timing chain works there.

### Bosses (bossplay-test, Normal, real hits, 24 runs per boss): unchanged
| Boss | Play s / hull | Ignore s / hull | Time x | Hull x |
|---|---|---|---|---|
| tresor | 59 / 23 | 81 / 33 | 1.36 | 1.45 |
| bruecke | 62 / 25 | 81 / 37 | 1.31 | 1.52 |
| schranke | 69 / 22 | 81 / 37 | 1.18 | 1.67 |
| messe | 62 / 26 | 83 / 38 | 1.34 | 1.43 |
| hoplite | 65 / 23 | 84 / 40 | 1.29 | 1.76 (Easy sanity 1.09x: FAIL) |
| adler | 97 / 41 | 135 / 58 | 1.39 | **1.40 FAIL** |
| krake | 102 / 42 | 138 / 63 | 1.35 | 1.49 |
| ice | 104 / 30 | 140 / 65 | 1.34 | 2.18 |
| kronos | **159 / 59** | 191 / 91 | 1.20 | 1.53 |
| talos | **166 / 49** | 196 / 89 | 1.18 | 1.81 |
bossplay 68 PASS / 2 FAIL, same as review 6. Review 6 task 3 (boss payoff and length) has not been done.

## 3. Owner complaints (with numbers)
| Complaint | Verdict | Numbers |
|---|---|---|
| Stages too long | **FIXED** | kill / survive stages 93 s (was 140-263 s at st 6/11/12/20 with `?pacing=0`); S25 median 92.8 s; boss stages keep their length (st 5: 78 bars) |
| Too many enemies | **FIXED** | per-run peak 8-12 foe-weights (was 8.7-16); S07 mean 5.8 on screen; kill goal 60 (was 260-310) reached 9/9-12/12 |
| Enemies fly away | **FIXED** | unkilled-leave share 0-2.4% (was 1.8-8.5%); a leaver spends 4.3-15 s in the upper two thirds; leaks 0-0.1/min at st 3/10, 1.0-2.6/min at st 20 |
| Dwell / shots-to-kill | **partly** | median dwell 2.8 s (target 5 s: NOT met; the visible.js floor binds it); normal foe 2.8-4.1 hits, elite 10.1, big 11-12.3 (all in band) |
| Leaks past the defence line | **FIXED (mechanics)** | holdline-test 19/19 PASS: a leak drains the line, costs score and multiplier, an empty line costs 1 hull (never the last on Normal), kill near the line refunds half once per bar; Normal leak share <= 0.3% at st 3/10, 2.4-6.3% at st 20; Hard 5.6-7.4% at st 10/20 |
| Endless harder to Legend, never predictable | **FIXED** | DF.d 1.90 (w1) -> 2.15 (w10) -> 3.69 (w25) -> 5.01 (w40); Legend values by wave 31; consecutive-wave pattern Jaccard mean 0.00, max 0.03; 75 verbs in 30 waves; human model reaches wave 20-28, oracle 18-31 |
| Power-up variety and use | **variety FIXED, use not measured** | 12/12 new powers seen, none twice within 4 drops (1200 picks), caps hold (2 timed + 1 charge, 64 bullets), DPS ceiling holds on Legend; no bot counts pickups, so in-run use is unproven |
| DASH / EMP useful | **mechanics yes, play no (on Normal)** | abup 24/24 PASS: DOUBLE DASH only after a beat dash, refund on PERFECT only, EMP eats the held power-up (stored BUBBLE -> SHIELD EMP, < half-left timed -> HOMING EMP), a pickup charges the dash 0.35; masher gets no extra refunds. But Normal: no-dash 92% = beat 92%, random 75%; human-model EMP 1.07/min; 98% of audit dashes are reflexes. Hard: beat 50% vs 0% |
| Forge UI clarity | **FIXED (scripted)** | forgeui 13/13 PASS at 390x763 / 375x553 / 844x390 / 1280x800 (targets >= 44 px, text >= 12 px, no overlap); task by script: card PULSE, slot A, partner chip SWARM = preview in **3 taps**, MERGE = 4, equip slot 1 = **5 taps**; UNDO refunds; 4 disabled reasons shown. The script clicks by id: it proves the flow, not that a player finds it |
| Pilot classes balance | **PASS, but classes do not matter** | 5 classes vs no class (n=144 each, base n=288): human alive 91-93% vs 91%, dodger 90-91% vs 91%, max-min 2 (human) / 1 (dodger), kills/min within 2%; `?classes=0` human 100% vs ON 96% (n=48, noise) |
| Tutorials as mini stages | **FIXED** | lessons 58/58 PASS at 390x763 and 375x553: first time only, never again; practice: wrong move -> TRY AGAIN, right move -> green; LESSON CLEAR in 1-26 s (pilot lesson 1 s: too short to teach); SKIP closes and stays seen; MENU > LESSONS replays |
| Saves | **FIXED** | saves 42/42 PASS: autosave on triggers, visibilitychange and pagehide; 3 named slots; export downloads, import confirms, round trip every key identical |
| Star power-up tap | **FIXED** | star 10/10: one tap trades on touch and mouse, chip 54x48 / 60x48 px, nothing covers it |
| New enemy ships | **mostly**; **new S01 FAIL** | fleet: interceptor st 6, bomber 10, carrier 16, cruiser 22 (roster order holds), single -> pair -> mixed; telegraphs 0.7 / 0.77 / 0.93 s; shots-to-kill interceptor 3, bomber / carrier 6.9, cruiser 14, carrier drone 1. Interceptor lives 1.2-1.5 s on screen, carrier drone 0.9 s. fleet-test (f) FAIL: `?fleet=0` is not reproducible run to run (33 vs 32 spawns on the same seed), so "OFF = old" is unproven |
| On-foot stage | **FIXED** | footstage 27/27: every foot enemy first spawns in its own section (grunt ... medic, warden, relay); bot clears 75% with 3 lives, 25% on one life; deaths in sections 7-8 (the ramp is real); clear 177 s; foot kills on screen median **1.27 s** (under the 1.5 s floor the flying game uses) |
| Sprites | **FIXED** | sprites 56/56: frame time sprites ON vs OFF within 1 ms (median and p95) for adler, hoplite, kronos and a zoo scene; a missing sheet falls back to the old art; anchors pixel-identical; `?sprites=0` requests no anim file |
| Lab coverage | **FIXED** | labfull PASS: registry covers every table (enemy 19, fleet 5, flank 3, variant 13, foot 25, boss 10, ship 9, hybrid 24, mod 12, weapon 16, power 32, dash 19, class 5, skill 30, rule 30, twist 23 ...); 526 items spawn with no page error; saves untouched |

## 4. Feature ON vs OFF (human-model + oracle, owner + mid builds, st 3/10/20, RUNS=8: n=48 per bot, SE about 6 points, `56e009f`)
| Off switch | Human clear / hits | Oracle clear | Other number | Verdict |
|---|---|---|---|---|
| all ON | 96% / 4 | 100% | stage 93-95 s | baseline |
| `?pacing=0` | **73% / 8** | **85%** | stage 140-149 s; st 20 human 44% | **pacing is what made Normal easy** (+23 points). Keep ON (owner asked for short stages), retune Normal difficulty on top of it |
| `?holdline=0` | 96% / 5 | 98% | | no clear-rate cost; keep ON |
| `?fleet=0` | 98% / 4 | 98% | S01 FAIL comes from fleet | keep ON, fix interceptor / carrier-drone life |
| `?powers=0` | 98% / 5 | 98% | | noise; keep ON |
| `?abup=0` | 100% / 3 | 94% | | noise; keep ON |
| `?classes=0` | 100% / 4 | 100% | | noise; keep ON |
| `?sprites=0` | 98% / 5 | 96% | frame time within 1 ms | keep ON |
| `?endramp=0` | (endless only) | | ramp-free and deterministic; story stages identical ON/OFF | keep ON |
| `?footstage=0`, `?forgeui=0`, `?lessons=0`, `?saves=0`, `?labfull=0` | (no fly-stage effect) | | each test checks OFF = old screen / no UI, all PASS | keep ON |

## 5. UI
| Check | 390x763 | 375x553 | 844x390 |
|---|---|---|---|
| ui-align (24 screens) | 0 findings | 0 findings | 0 findings |
| hud-cover | PASS 14.9% | PASS 19.3% (gate 20%) | PASS (no coverage gate; 48.9%, was 47.4%) |

## 6. Other
- Economy (`SAVE=1 econ-test`): full garage 25529 Neon, 467 Neon/h from play, 1415 with replay pay; **7.6 h to buy everything: FAIL (band 9-13 h**; review 6: 10.2 h).
- pacing-test: the human model fails boss stage 5 in 12/12 runs with pacing ON and OFF (fresh build); classes-test (mid build, whole tree) clears it 71-78%. A fresh-build wall at the first boss.

## 7. Panel (same lines and weights; first 30 min / hour 3)
| # | Line | W | V | R | M | P |
|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 6.3/5.7 | 6.3/5.4 | 7.1/6.1 | 7.0/6.0 |
| 2 | Variety | 16 | 6.3/6.2 | 6.8/6.2 | 6.8/6.9 | 6.6/6.4 |
| 3 | Bosses | 8 | 5.8/4.5 | 5.9/4.7 | 6.0/5.3 | 6.2/5.0 |
| 4 | Difficulty | 10 | 4.6/4.3 | 5.0/4.6 | 5.2/4.6 | 5.0/4.5 |
| 5 | Build depth | 8 | 4.8/3.8 | 4.6/3.6 | 5.2/4.2 | 5.0/4.0 |
| 6 | Music / beat | 8 | 5.3/4.0 | 4.6/4.0 | 5.3/4.5 | 5.5/4.5 |
| 7 | Readability | 8 | 4.9/3.9 | 5.6/5.1 | 5.4/4.9 | 5.6/4.7 |
| 8 | Audio | 4 | 4/3 | 3/2 | 3/2 | 4/3 |
| 9 | Onboarding | 6 | 5.7/5.7 | 5.6/5.6 | 5.2/5.2 | 5.6/5.6 |
| 10 | Progression | 8 | 5.6/4.6 | 5.5/4.5 | 5.6/4.6 | 5.4/4.4 |
| 11 | On-foot | 3 | 5.5/4.5 | 5.5/4.5 | 5.5/4.5 | 5.0/4.5 |
| 12 | Touch | 5 | 5.8/5.8 | 6.8/6.8 | 6.8/6.8 | 5.8/5.8 |
| 13 | Polish | 2 | 5.3/4.8 | 5.8/5.3 | 5.8/5.3 | 5.3/4.8 |
| | **Weighted 30 / h3** | | 55.2/48.7 | 56.4/49.6 | 58.5/52.7 | 57.9/51.0 |
| | **Reviewer** | | **52.0** | **53.0** | 55.6 | 54.5 |

Difficulty drops for the first 30 min (Normal too easy, DASH/EMP optional) and rises for hour 3 (Hard and endless now climbable). Bosses stay flat; P drops for the S10 FAIL. Build depth rises for forge UI, ability upgrades and powers, held back because the classes change nothing measurable.
- V: "Stages are short and clear now, and there are new ships to shoot. But I never die on Normal, and the last bosses still take nearly three minutes."
- R: "On Normal I can skip DASH and EMP and clear as often as the beat player. On Hard the beat is the only way through: that's the game I want on Normal."
- M: "New ships, a real street stage, new power-ups, endless that never repeats a wave. Plenty to see."
- P: "Two hard gates: an interceptor that lives 1.4 s and a boss median 0.7 s over a target that was already relaxed. The economy finishes in 7.6 h. `?fleet=0` doesn't reproduce."

## 8. Top 5 findings
1. **Normal is too easy** since pacing: human model 97% (73% with `?pacing=0`), oracle and no-oracle dodgers 97% (band 40-90%), camper 81% (gap to dodger 16, gate 25).
2. **DASH/EMP do not matter on Normal**: no-dash 92% = beat 92%, reflex 92%, random 75% (gate 40%). On Hard they decide everything (beat 50%, all others 0%).
3. **S01 hard FAIL**: fleet interceptor 1.38 s on screen (11% killed within 0.7 s), carrier drone 0.9-1.4 s; foot enemies 1.27 s. Plus S03 2.82 s, S04 10.4, S06 1.42 now under their bands.
4. **Bosses untouched**: payoff 1.18-1.39x time, kronos / talos 159-166 s played right; S10 hard FAIL 135.7 s.
5. **Economy 7.6 h (FAIL 9-13)** and **fleet `?fleet=0` not reproducible**; boss stage 5 is a wall for a fresh build (0/12).

## 9. Next tasks
| # | Task | Tier |
|---|---|---|
| 1 | Normal difficulty on top of pacing: human-model 60-85%, oracle and noor in 40-90%, camper <= dodger - 25, no-dash <= beat - 15, random <= 40%; Hard and stage length unchanged | opus |
| 2 | Boss payoff and length (review 6 task 3, still open): S10 <= 110 s, ignore/play >= 2x hull on every boss, kronos / talos played right <= 120 s | opus |
| 3 | S01: interceptor and carrier drone on-screen life >= 1.5 s (entry path or hull), foot enemies >= 1.5 s; S01 / S02 / S03 PASS | sonnet |
| 4 | Fleet `?fleet=0` determinism: find which part makes a seeded run differ run to run (bisect by flag), make fleet-test (f) pass | sonnet |
| 5 | Economy back to 9-13 h (prices of the new abup / class / forge items included), econ-test PASS | sonnet |
| 6 | Harness chores: count power-up pickups and uses in humanbot (REPORT column); econ-test without SAVE=1; S27 pit stop in the sim; humanbot calibration line skipped when DIFF != normal | haiku |

## What to tell the owner
The big asks landed and they work: stages are now about 90 seconds instead of two to four minutes, fewer enemies are on screen, almost none fly off unkilled, and a visible defence line punishes leaks. New enemy ships, a full street stage, twelve new power-ups, ability upgrades, a step-by-step forge, pilot classes, tutorial mini stages, saves with slots and export, animated sprites and a complete Lab all pass their checks on all three phone sizes. Endless now climbs to Legend and never repeats a wave. Hard can be cleared again. The catch: shortening the stages made Normal too easy. Our human-like bot clears 97%, and on Normal you can ignore DASH and EMP and do just as well. Bosses are as long as before, and the new interceptor ship dies too fast to be seen properly. Next round: make Normal bite again so the beat matters, shorten the bosses, slow down the interceptor. No new content.

## Reproduce
All with `NODE_PATH=$(npm root -g) GAME_DIR=<frozen copy of games/mainhattan-nightrun at 56e009f>`: `CONFIGS=arcade-normal OUT=<f> repeat-audit.js`; `SEEDS=5 REPEAT=<f> OUT=review/industry-audit-7.json industry-audit.js --gate`; `BOTS=human,dodger BUILDS=owner,mid STAGES=3,10,20 RUNS=12 REPORT=1 humanbot.js` (Hard: `DIFF=hard RUNS=8`; section 4: `RUNS=8 Q=&<flag>=0`); `RUNS=4 STAGES=3,10,20 HARD_ST=10 timing-test.js`; `REPORT=1 STAGES=3,10,20 HSTAGES=3,10,20 anticamp-test.js`; endramp-test; pacing, holdline, powers, abup, forgeui, classes, lessons, saves, star, fleet (`V=1`), footstage, sprites, labfull, bossplay tests; `VP=<size> ui-align-test.js`; `hud-cover-test.js <index.html>`; `SAVE=1 econ-test.js` (then `git checkout -- games-src/nightrun/playtest/story-sim.json`).
