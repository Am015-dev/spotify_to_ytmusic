# Nightrun balance: enemies are seen and fought (16 Oct 2026)

Owner: "on easy the enemies dont even have time to show up and they are killed"; "I can win the game without moving".
Check: `NODE_PATH=$(npm root -g) node games-src/nightrun/balance-test.js` (headless, real page `?sim=1`, story-sim's dodging bot;
env `RUNS=3 STAGES=1,8,20,30,42 DIFFS=easy,normal,hard BUILDS=fresh,mid,late REPORT=1 JSON=out.json`; about 4 minutes).

Builds: **fresh** = Pulse LV1, nothing else. **mid** = Pulse + Homing Swarm LV2, Rapid Fire 2, Damage 2, Homing 1.
**late** (the owner's) = Pulse Spread LV5 + Homing Swarm LV4 (odd runs: the Laser Lance + Beat Cannon pair at LV5), Rapid Fire 5, Homing 3,
Sharp Beat 5, Damage 5, Crit 5, Pierce/Spread/Chain 3, Orbit/Ricochet/Wingman/Rear gun 2, every garage perk at max, and Drum Burst,
Tempo Up, Slow Groove, Magnet Storm and Triple Shot kept on all stage long.

## Root causes (measured)
1. Player shots hit enemies while they were still off screen: spawns sit at x = W+30..W+300 and only bosses were gated (x < W-20).
   Bullets fly 870 px/s, so a drone line died at x 960-1000 before it was drawn. Even a fresh ship killed 25% of enemies unseen.
2. Every multiplier stacks (shot count x weapon level x perks x power-ups): the late build deals ~40x the fresh ship's raw damage per
   second (measured 1100-1400 vs 25-60), so nothing lived long enough to fire (0-2% of shooters ever fired with mid/late builds).
3. Chargers only crept 90 px in before their dash, so once they could not be hit off screen they rammed the ship at 660 px/s.

## Fix (all in `parts/b.js`, object `DMG`; `DMG.on=false` switches it all off)
- **Entry grace**: an enemy is not damageable until it is fully inside (x <= W-40); bullets fly through it; any other damage
  (chain, orbit, blasts, mines, dash) is undone in one pass after all damage of the frame (`DMG.pass`). A red ring at the edge
  telegraphs each spawn (existing ring effect). When it comes in, its first shot is due within 2 beats (armed glow 1 beat before).
- **On-screen floor** (per-enemy damage ceiling): a normal enemy cannot lose its hull faster than its minimum life on screen
  `ml` (drone/flank 1.2 s, turret 1.3, charger 1.3, gate 1.4, gunship 2.6, mine 0.6, swarm 0; elites 4 s, elite charger 2 s;
  Easy x0.9). Kills still burst, spark and score; a rammed enemy and the EMP ignore the floor.
- **Shot soft cap** (`DMG.hit`): a single shot's damage above 2 counts at half, ceiling 8 (crit text now "heavy hit (about 2.5x)").
  The existing caps stay: tpDmg x2.1, 64/44 player bullets, boss armour floors and minimum bars, perk pressure (UPS.hp).
- A measured-DPS soft cap was tried and is OFF (`DMG.soft=false`): it fed back on itself (a capped build leaves more targets alive,
  which raises the measured DPS) and made drones live 8-10 s.
- **Enemy pace**: enemies now live on screen, so each fires less often (`DMG.fk` .45 on the old cadence, Easy x0.8 more);
  the charger glides fully on screen before it aims, and dashes at 400+40d px/s (was 600+60d).
- Speed challenges (41-45 'speed'): the kill clock is 1.05 of the stage length (was 0.9).

## Targets (late build, Normal; Easy x0.75 of these, never an unseen kill)
- median seconds alive on screen: drone/turret/flank >= 1.2, gunship >= 2.5, elites >= 4; **charger >= 1.3** (it is a rusher:
  glide + aim + dash; the brief's 2.5 s would mean an unkillable charger hitting the ship, which the bot showed: 40+ rams).
- >= 70% of shooters (drone, flank, turret, gunship) fire at least once; 0 enemies killed before they are on screen (rams excepted).
- mini-boss >= 25 s, boss >= 45 s, final boss >= 60 s (boss armour floors, unchanged, already give 49-60 s).
- bot clears stages 1-20 >= 90% on Normal with a mid/late build, 1-4 hits a stage; stage 30/42 60-85%.

## BEFORE (RUNS=3 per cell; on-screen seconds = median of killed enemies)
| diff/build | drone | turret | charger | gunship | killed unseen | shooters fired | boss s (st 8) | clear % 1/8/20/30/42 | hits med |
|---|---|---|---|---|---|---|---|---|---|
| easy/fresh | 0.17 | 0.55 | 0.10 | 0.45 | 28% | 5% | 60 | 100/100/100/67/100 | 1 |
| easy/late | 0.00 | 0.00 | 0.00 | 0.00 | 83% | 0% | 58 | 100/100/100/100/100 | 0 |
| easy/mid | 0.00 | 0.03 | 0.00 | 0.00 | 66% | 1% | 60 | 100/100/100/100/100 | 0 |
| hard/fresh | 0.77 | 1.73 | 0.38 | 7.23 | 11% | 33% | 59 | 100/100/0/0/100 | 3 |
| hard/late | 0.00 | 0.00 | 0.00 | 0.00 | 78% | 0% | 49 | 100/100/100/100/100 | 0 |
| hard/mid | 0.00 | 0.17 | 0.05 | 0.00 | 47% | 6% | 59 | 100/100/100/100/100 | 1 |
| normal/fresh | 0.18 | 0.78 | 0.15 | 1.65 | 25% | 8% | 60 | 100/100/100/33/100 | 2 |
| normal/late | 0.00 | 0.00 | 0.00 | 0.00 | 82% | 0% | 58 | 100/100/100/100/100 | 0 |
| normal/mid | 0.00 | 0.07 | 0.03 | 0.00 | 58% | 2% | 59 | 100/100/100/67/100 | 1 |

## AFTER (same runs; story numbers, so the endless-only fire factor fkE does not change them)
| diff/build | drone | turret | charger | gunship | killed unseen | shooters fired | boss s | clear % 1/8/20/30/42 | hits med |
|---|---|---|---|---|---|---|---|---|---|
| easy/fresh | 2.13 | 2.92 | 1.73 | 3.70 | 0.0% | 83% | 8:61,8:60,8:59 | 100/100/100/0/100 | 2 |
| easy/late | 1.40 | 1.42 | 1.53 | 2.47 | 1.8% | 72% | 8:58 | 100/100/100/100/100 | 2 |
| easy/mid | 1.50 | 1.90 | 1.62 | 2.40 | 0.0% | 81% | 8:59 | 100/100/100/33/100 | 2 |
| hard/fresh | 3.05 | 4.28 | 1.97 | 15.68 | 0.0% | 87% | 8:61 | 100/33/33/0/67 | 5 |
| hard/late | 1.52 | 1.63 | 1.67 | 2.73 | 0.1% | 73% | 8:58 | 100/100/33/33/100 | 4 |
| hard/mid | 2.73 | 3.68 | 1.75 | 7.57 | 0.0% | 86% | 8:60,8:59 | 100/67/0/0/100 | 5 |
| normal/fresh | 2.40 | 3.62 | 2.18 | 8.80 | 0.0% | 86% | 8:60 | 100/100/67/0/33 | 4 |
| normal/late | 1.53 | 1.58 | 1.67 | 2.73 | 0.6% | 79% | 8:58 | 100/100/100/100/100 | 2 |
| normal/mid | 2.02 | 2.73 | 1.80 | 2.95 | 0.0% | 83% | 8:59,8:60 | 100/100/100/0/100 | 2 |

- balance-test: 28 PASS lines; the residual "unseen" kills (0.1-1.8%, late build only) all happen in cleared runs of stage 1/8 (drones)
  and challenge 42 (swarms); not traced yet (next: log x/hp/hq of those enemies in their last frame). The check allows <= 2%.
- Bosses: stage 8 boss 58-61 s on every build (armour floor); stage 40 final boss 62 s with the late build; the stage 5 mini-boss
  kills the bot with lasers on the OLD build too (0% clear, 14 laser hits): the bot cannot dodge lasers, not a balance regression.
- Weak: stage 30 with the mid build is 0-33% (late build 100%); a fresh ship (no upgrades at all) fails from stage 20 on.
  Hard is hard: late build 33% at stage 20/30. Next lever if the owner finds Normal 30 too hard: `densd` (story.js) or `DMG.fk`.
- afk-test PASS (idle ships die; the dodging bot survives on Normal and Hard) with the endless fire factor `DMG.fkE` .5.
- story-sim RUNS=6 (fresh ship, no builds): 1/8 100%, 20 67%, 30 0%, 42 100%; hits 2.5-5.7 a stage.

## AFTER on the merged build (with the 8 weapons, fusions, bullet cap and anti-idle from origin; RUNS=2)
| diff/build | drone | turret | charger | gunship | killed unseen | shooters fired | boss s | clear % 1/8/20/30/42 | hits med |
|---|---|---|---|---|---|---|---|---|---|
| easy/fresh | 2.12 | 3.12 | 1.78 | 8.77 | 0.0% | 85% | 8:60,8:59 | 100/100/100/0/100 | 3 |
| easy/late | 1.53 | 1.82 | 1.80 | 3.47 | 2.5% | 74% | 8:59,8:58 | 100/100/100/100/100 | 2 |
| easy/mid | 1.85 | 2.33 | 1.73 | 2.68 | 0.0% | 81% | 8:59 | 100/100/100/0/100 | 4 |
| hard/fresh | 3.15 | 3.68 | 2.07 | - | 0.0% | 89% | 8:59 | 100/100/0/0/100 | 5 |
| hard/late | 1.93 | 3.68 | 2.25 | 11.42 | 0.1% | 82% | 8:58 | 100/100/50/0/100 | 5 |
| hard/mid | 2.82 | 4.27 | 2.03 | 13.30 | 0.0% | 88% | 8:59 | 100/50/0/0/100 | 5 |
| normal/fresh | 2.67 | 4.10 | 1.97 | 9.13 | 0.0% | 87% | 8:60,8:59 | 100/100/100/0/100 | 4 |
| normal/late | 1.83 | 3.03 | 2.02 | 7.03 | 1.5% | 79% | 8:58 | 100/100/100/50/100 | 3 |
| normal/mid | 2.68 | 4.03 | 2.20 | 8.25 | 0.0% | 87% | 8:60,8:59 | 100/100/100/50/100 | 3 |

- weapon-test PASS (each weapon alone clears stage 1); afk-test PASS after `DMG.fkE` .5 (endless only).
- balance-test: 1 FAIL left: easy/late unseen 2.5% (> 2%), the same cleared-run residual as above. Next session: trace it.

## Round 2 (16 Oct 2026): late stages, Hard, Easy unseen kills, stage-5 lasers
Root cause of the late-stage regression: with entry grace and a minimum life, every enemy now lives 1.2-2.6 s, so at story level L >= 5 several
shooters, drones and chargers overlap on screen and their bullets/touches add up (stage 30 = hull 5, ~320 s long). Fixes (all in `b.js` `DMG`, story only):
- `DMG.lf()` enemy fire falls 13% per level above 3 (floor .4); `DMG.lm()` minimum life falls 1.5 x .13 per level (floor .65). The floors from round 1 still hold.
- Charger dash capped at 470 px/s (`DMG.cvMax`). Hard story: enemy speed 1.3 (was 1.45), bullet speed 1.1 (1.22), fire 1.0 (1.35).
- Easy unseen kills traced: a kill's own blast (processed earlier in the same enemy loop) finished drones that were still entering (hp -1.8 at x 950-1050,
  `gr` set). The loop now restores hp of any enemy still entering before it checks for death.
- Stage-5 mini-boss lasers: the laser is a locked line with a 2-beat telegraph; the bot now stays off the telegraphed line (story-sim.js), like a player.
  Result 100% clear, boss fight 34 s (>= 25 s), so the boss is not trivial.
| check (story-sim, RUNS 10-16, Normal) | before | after |
|---|---|---|
| stage 1 / 8 | 100 / 100 % | 100 / 100 %, hits 2.1 / 3.0 |
| stage 5 (mini-boss) | 0 % (6.4 laser hits) | 100 %, hits 2.4 |
| stage 20 | 50 % (5.3 hits) | 90-94 % (3.4-3.7 hits) |
| stage 30 | 0 % (5.5 hits) | 20-38 % (5.1-5.4 hits) with the default kit; balance-test late build 100 % |
| stage 42 | 83 % | 100 % |
- balance-test (RUNS 3, 3 diffs x 3 builds): 32 PASS, 0 FAIL (Easy late unseen 0 %, shooters fired 71 %). normal/late 1/8/20/30/42 = 67/100/100/100/100,
  hard/late 30 = 33 % (RUNS 10: 50 %). afk-test and weapon-test PASS.
- Still weak: stage 30 with the default kit and mid builds is 20-67 % (long stage, hull 5, many "other" hits = fences/beams the bot ignores). Next lever: `DMG.lvK`/`fkFloor`.

## Walls (RET.walls, 16 Oct 2026)
Story bot (`story-sim.js`, Normal, ARCADE, 16 runs per stage). Flag off = the old tables exactly. `CLASSIC=1` runs the full-song mode.
**Cause:** (1) ARCADE cuts a stage to ~150 s but the kill goal still scaled with the old bar count, so the bot needed 190-280 s on a kill stage, ran past the song and died late (stages 11, 12, 18, 23, 30, 39: 38-88% clear, 4-6 hits). (2) TALOS (stage 40) fires a laser every 2nd cycle from level 8 (every 3rd before); the bot does not read the beam telegraph and took 4.4 hits, 27 laser hits in 16 runs.
**Change:** kill goal x0.75 in ARCADE and x0.45 in CLASSIC (`wallK` in `story.js`, table `RET.wallKill` in `ret.js`; per-stage entries override). TALOS laser cadence stays at every 3rd cycle (`b.js`). The boss fight length is unchanged (60-63 s), the entry grace, damage soft cap and anti-idle are untouched.
| Stage | 11 | 12 | 18 | 23 | 30 | 31 | 39 | 40 |
|---|---|---|---|---|---|---|---|---|
| clear% before | 88 | 75 | 81 | **38** | 75 | 88 | 69 | 69 |
| clear% after | 100 | 100 | 69 | 88 | 94 | 81 | 63 | 100 |
| hits before > after | 4.4>3.2 | 5.0>4.2 | 5.6>4.6 | 5.8>3.9 | 3.8>1.5 | 1.7>1.8 | 3.5>3.1 | 4.4>0.4 |
Whole curve (main stages 1-40): minimum 63%, worst dip against the two neighbours: 18 (69% vs 100/100 avg, noise at 16 runs; before: stage 23 was 62 points under). Mean hits per main stage 2.0 (before 2.3; max 4.6). Challenges 41 and 45 (no-hit) stay at 38% / 13%: one hit ends them by design, they are optional and not changed.
**CLASSIC (8-12 runs, before > after):** 18 0>83, 23 50>83, 40 63>75, 30 25>50, 39 13>42. Stages 30 and 39 are still weak in CLASSIC (they are attrition deaths over 4 minutes, not the kill goal); next: spawn spacing on those two.
Gate: `ret-walls-test.js`.

## Power scale (RET.scale, 17 Oct 2026; `?scale=0` = the old numbers exactly)
Owner: "quite easy even on Legend, weapon level-ups very unfair to the enemies". Code: `parts/scale.js` (new), small guarded hooks in `b.js` (enemy hull in `en()`, first-shot beat), `g.js` (`WP.shots`), `wpx.js` (card number). Gate: `scale-test.js`; `scale-probe.js` prints power / damage / time-to-kill per build.
**Measured (before):**
- `balance-test` never tested the Garage: its "late" build set in-run levels only (`WP.pl` stayed LV1; `m.TP.lv` does not exist, so no perk was applied). New build `BUILDS=max` = two weapons at permanent LV10 (fusion), every garage perk at max, shop picks, power-ups.
- The old `UPS` hull factor (dir.js) counted shop picks and perks only, saturated at x2.1 from a mid garage on, and ignored weapon levels and fusions: mid and max enemies had the same hull.
- Max build, 8 builds x stages 8/20/30/40, 2 runs, before: Normal 100% on every stage with 0 hits; Legend 100% on every stage (hits 4), boss 74 s / 62 s. Legend fresh ship: 0% from stage 20 (the gap between a fresh and a maxed ship was the whole difficulty).
- Weapon level growth: card said LV10 = 2.50x of LV1 (weapon-test cap), plus perks x2.1, fusion x1.12, power-ups.
**Change (all flag `RET.scale`):**
1. Power score = `UPS.u` (shop + garage perks) + 0.1 per equipped weapon level above 1 + 0.3 for a fusion. Expected power of stage n = 0.25 + 0.055 n (endless: by district/loop).
2. Hull factor `SC.hpK = 1 + 0.6 * (1 - exp(-(power - expected)/4))`, at most x1.6, on top of the old `UPS.hp`; fresh ship x1.00, mid garage x1.36, maxed x1.54. Applies to every non-swarm enemy at spawn (`en()`). Bosses and mini-bosses are NOT scaled: their armour already holds a fight at 60-75 s on every build (BALANCE round 1).
3. Diminishing levels: the damage per shot of the shot weapons (pulse, lance, swarm, disc, frost, wave, shell, drone echo) follows `1 + 0.8 (L-1)/9` instead of `1 + 1.5 (L-1)/9`: **LV10 = 1.80x LV1** (was 2.50x). The Garage card shows the new number ("power 1.80x"), truthfully; measured on dummies, ship guns subtracted: pulse LV10/LV1 = 1.6x. Blades, arc, mines, rail, flame, wells, storms and the beat cannon keep the old curve (their damage is applied outside the shot path; the card still shows 2.50x for them).
4. Hardest tiers (story): stage level and hull table `TUNE.dm` hard .3/1.1 -> .5/1.2, very hard .5/1.2 -> .9/1.3, legend .8/1.3 -> 1.2/1.45; no mercy hull/level on very hard and legend; their enemies' first shot comes after 1 beat instead of 2. Normal and Easy untouched. DMG caps, on-screen floor, `ebCap`, `BCAP` unchanged.
**After (RUNS 3-6, dodging bot):**
| check | before | after |
|---|---|---|
| gunship time to kill, stage 20, fresh / maxed ship (dummy dps) | 2.4 s / 5.0 s | 2.4 s / 4.5 s (hull 815 vs 530, level-damage down) |
| Legend, maxed ship, stages 20 / 30 / 40 | 100 / 100 / 100 % | 40-100 / 0 / 100 % over 5-6 runs (mean 47-67%; target 25-45% NOT reached: stage 20 and the final boss stay bot-easy, stage 30 is a wall; scale-test band 15-75%) |
| Normal, mid garage, stages 8 / 20 | 100 / 100 % | 100 / 75-100 % |
| Normal, maxed ship, stages 8 / 20 | 100 / 100 %, 0 hits | 100 / 100 %, 0-1 hits (still a power fantasy) |
| bosses, stage 8 / 40 | 74 / 62 s | 74 / 62 s (unchanged by design) |
- The bot's late-stage clear is bimodal per stage (30 = long attrition stage 0%, 40 = final boss 100%); a human on Legend with a maxed ship now gets hit and loses hull where before the bot had 4 hits median and cleared with ease.
- Weak: Normal with a maxed ship is still untouchable for the bot (0-1 hits): the defence perks (shield, regen, revive, dash) carry it; next lever is a power-aware fire density (`ebCap` stays), not more hull. Non-shot weapons keep 2.5x. A fresh ship still fails from stage 20 on Legend (0%).

## Power scale, round 2 (flag RET.scale2, 17 Oct 2026; `?scale2=0` = round 1 exactly)
Owner: "extremely easy even on Legend ... I stay in a spot, my missiles shoot targets automatically, when bullets come I move to the other spot; even the boss I beat in seconds". Code: `parts/fair.js` (a numbered `scale2.js` is refused by guard.py), hooks by wrapping `SH.steer`, `WP.arcZap/leap`, `spawnBoss`, `bossBeat`, `SC.hpK`; anti-idle extended through `STILL.t` only (h.js untouched). Gate: `scale2-test.js` (+ `balance-test.js` CAMP=1 corner camper, GOD=1, bot shoots shield cores).
**Change:** A. homing locks only on-screen foes past entry grace, inside a forward cone (hard tiers ±40°, 300 px) after a lock-on delay (.18 s); a locked weapon-homing shot does x.8 Normal / x.62 Hard / x.56 Very hard / x.5 Legend damage (shop Homing perk half that cut), arc chains the same; camping (60 px of the 6-s mean for 6 s, two near spots included) sets the h.js stillness clock (hunter shots, lane, discharge) and halves auto-aim. B. boss hull x(1+.3 power) (district/final x.7), a damage budget (HP bar at most max/T per s, 1.5 s burst; T Legend 56 s, mini 46 s; Normal 34/30 s), shields at 66% and 33% until 1 (Normal) / 2 (hard tiers) cores are shot (cores are never auto-aimed). C. hard tiers from stage 11: an aimed lead shot every 3 beats (Legend stage 25+: every 2), from stage 18 (Hard 25) a wall every 4 bars with a 120 px gap at a new place (measured smallest gap 136-170 px); Normal with power f>.4: one aimed shot per bar. Kill-goal stages keep the old hull (stage 30 timed out at 420 s even in god mode: 260 kills not reachable).
**Measured** (PAR=4; higher PAR makes the bot unreliable because its beat taps follow the real clock):
| check | round 1 | round 2 |
|---|---|---|
| god mode, Legend max, stage 20: kills/min parked camper vs dodger | 44 / 44 (auto-aim did all the work) | 17 / 36-52 |
| corner camper, Legend max, stages 20 / 30 / 40 | dies (anti-idle) / dies / clears in god mode | 0 / 0 / 100% (final boss: hops between spots > 60 px apart, revives carry it) |
| mini-boss stage 5, Legend max (god) | 24 s (bar lock, HP bar empty at once) | 48-82 s |
| final boss stage 40, Legend max (god) | 63 s | 78-120 s (target 45-75: long side) |
| Normal max: mini / final boss | 24 / 63 s | 28-34 / 61-63 s (the 32-bar lock sets the floor) |
| stage 30, Legend max, god mode | 0% (timeout, kill goal) | 50% (god); dodging bot still 0% (dies, 3 hull) |
| dodging bot, Legend max, stages 20 / 30 / 40 | 100 / 0 / 100% | 0-100 / 0 / 100% (scale-test run: 100/0/100; target 25-55% NOT reached) |
| Normal mid, stages 8 / 20 | 100 / 100% | 100 / 100% |
- Weak: the final boss is not camper-proof (12+ hits absorbed by revives/shields), stage 30 is still a wall for the bot by attrition (3 hull on Legend), Legend clear bands are bimodal per stage, Normal max still takes only ~1 hit.

## Power scale, round 3 (flag RET.scale3, 17 Oct 2026; `?scale3=0` = round 2 exactly)
Owner (third report): "extremely easy even on Legend ... my missiles shoot targets automatically; even the boss I beat in seconds", "homing swarm beat all enemies very fast on legend". Code: `parts/hard.js` (after fair.js), one hook in `b.js` (`DMG.hit(dm,b,e)` passes the bullet and the enemy). Hard tiers only; Easy/Normal keep round 2. Probe `scale3-probe.js` (build matrix), gate `scale3-test.js`.
**Measured (round 2, Legend stage 20, god mode, 60 s, permanent LV10 pair + all perks + shop picks):** single weapons are weak but the stack is not: every pair (pulse+swarm, swarm+beat bomblets, swarm+laser, swarm+arc, laser+beat, arc+beat) with CRESCENDO / ECHO / WINGMATES / DRUM dealt 285-504 hull/s moving, 237-382 parked, vs a fresh ship 79 / 49. 57-85% of it came from shots that locked and curved (the shop Homing perk turns every gun shot into a homing shot) or from arc chains. Top offenders: swarm+arc, laser+beat and arc+beat with CRESCENDO (456-504/s).
**Change:**
1. Damage ceiling on ordinary enemies, booked in `DMG.pass`: a bucket refilled at `S3.cap()` per s (1 s saved up). `cap = fresh(n) x SC.hpK() x (1 + .8 f)`, `fresh(n) = 40 + 2.8 n` (measured fresh ship: 36 / 96 / 97 / 133 at stages 8/20/30/40), so it never drops below a fresh ship and grows with the stage and the power score. At .45 f it crowded the screen (drones 9 s on screen, ram deaths): .8.
2. Homing (hard tiers): a shot retargets once at most (`S3.RT`), loses its lock when the target is behind the ship or more than 50 deg off the ship's nose, keeps round 2's cone, delay and cut, and drops its CRESCENDO bonus.
3. Auto-aim share: damage from shots that locked and curved > .2 rad, plus arc/leap chains, is scaled so it is at most 35% of the total (EMA 3 s; floor x.08); scaled in by power (a fresh ship keeps its homing).
4. Bosses (hard tiers): auto-aimed damage on a boss x.6; with no aimed hit for 2.5 s the boss repairs 1.2% max/s up to its phase top (this beats the camper). District and final bosses: hull x.55 and round 2's damage budget x.55 (the shield cores and the repair add the time back).
**After:**
| check | round 2 | round 3 |
|---|---|---|
| strongest builds, Legend 20, moving: hull dps applied | 285-504 | 56-196 (ceiling 223 at .45 f; matrix in scale3-test) |
| fresh ship, moving | 79 | 75 (no cut) |
| auto-aim share, moving builds | 59-71% | 26-36% |
| corner camper Legend max 20/30/40 | 33% (cleared the final boss) | 0% of 9 (parked: final boss not killed in 200 s, it repairs) |
| Legend max mini-boss (god) | 48-82 s | 60-73 s |
| Legend max final boss (god) | 117-151 s | 84-88 s at budget x.65; x.55 in the final scale3-test run (see HANDOFF) |
| Normal max mini / final boss | 28-34 / 61-63 s | 28-30 / 62-63 s (unchanged) |
| dodging bot Legend max 20/30/40 | 0 / 0 / 100% | 33 / 0 / 100% (RUNS 3) |
| Normal mid 8/20 | 100% | 100% |
- Weak: stage 30 is still a wall for the dodging bot (deaths are rams by chargers and drones plus bullets: the bot's dodger does not avoid bodies well; not a ceiling effect at .8 f), the final boss stays bot-clearable (12 hits absorbed by revives/shields), Legend bands are still bimodal per stage.

## Boss fights, round 4 (flag RET.boss2, 17 Oct 2026; `?boss2=0` = round 3 exactly)
Owner, after playing the live build: "Legend is still easy but the difficulty increased, boss fights are still short"; earlier: "even boss I can beat in seconds". Bot numbers are not trusted for this, so the floor is a hard rule that does not depend on the bot. Code: `parts/armour.js` (after hard.js; a numbered `boss2.js` is refused by guard.py), two one-line sheen hooks in `c.js` (boss bar, landscape + portrait). Gate: `boss2-test.js`.
**Change:**
1. Hard damage-rate cap: a boss loses at most `max / (T x 1.06)` HP in any rolling 1 s window, booked in `DMG.pass`, which runs right before the only place a boss can die (b.js update). Every source lowers `e.hp`, so homing, bomblets, mines, chains, blades, power-ups (nova is flat .6 x, never % HP), wingmates and blasts are all capped. Floors T (s): mini 50 Normal / 70 Legend, district 80 / 110, final 120 / 170 (Easy, Hard and Very hard in between, table `B2X.T`). Damage above the cap = armour: sparks, a dull hit sound, "ARMOUR HOLDS" (every 5 s at most), a white sheen on the boss bar. hard.js's repair runs at most .4 x the cap.
2. Three phases by HP (66% / 33%), started only on a bar line; the HP is held at the phase line until then; 1 bar of calm (no boss bullets) after each change. Phase 2: new pattern order (the patterns phase 1 never used come first) + fair.js's shield cores (the 33% shield is off: phase 3 has its own verb). Phase 3: fans one size up (fanN / ebCap still apply), music intensity layer, a lane beam aimed at the ship's row every 2nd bar (warned 1 beat on the hard tiers, 2 on Normal / Easy; 44 px band, the ship moves out of it), and a last stand at 12%: EXPOSED, the boss fires nothing for 8 beats.
3. Power: hull x1.8; a ship whose landed damage cannot finish by 1.2 T has its boss damage raised up to x12 (only damage that lands; the cap still holds the floor).
**Measured** (`boss2-test`: 1e6 HP of damage every frame = any build; balance-test GOD=1, dodging bot, RUNS 2):
| fight | before (max build) | god-damage stress after (floor) | max build after | fresh ship after |
|---|---|---|---|---|
| Normal mini (stages 5/13/21/29/37) | 28-29 s | 51-65 s (50) | 64-66 s | 79-81 s |
| Normal district (8/16/24) | 74 s | 84 s (80) | 103-109 s | 129-131 s |
| Normal final (32/40) | 63 s | 127 s (120) | 164-171 s | 197-198 s |
| Legend mini | 52-105 s | 73-91 s (70) | 95-104 s | 109-112 s |
| Legend district | 74-80 s | 116 s (110) | 229-236 s | 184-186 s |
| Legend final | 67-106 s | 180 s (170) | 278-291 s | 319-352 s |
- Every boss on both tiers: phases 2 and 3 start on a bar line, calm bar, armour feedback, last stand (boss2-test).
- Weak: Legend district and final run LONG for the bot (229-291 s vs 110-170 / 170-260 targets) and the fresh ship is above 1.3 x floor on every tier (Normal mini 80 vs 65): the x12 help does not reach the target; suspected cause the Legend core shields (2 cores under hard.js's ceiling) and hard.js's x.35 auto-aim on bosses. scale2/scale3-test boss windows moved to the round-4 targets (Legend final upper bound 340, target not reached). afk-test stage 42 "dodging bot died" fails before and after (not this change).

### Boss fights, round 4b (18 Oct 2026: the cap, not the bot's rhythm, repair or shields, sets the length)
Problem: with the round-4 cap the Legend bot (max build) needed 339-362 s for the final boss and ~233 s for a district boss (targets Legend 70-110 / 110-170 / 170-260, Normal 50-80 / 80-120 / 120-180). Measured: raw damage was 3-4x the cap on average, yet the HP fell at only ~45% of the cap, because (1) damage above the cap in a second was thrown away while the bot's damage arrives in bursts (beat taps, salvos, bombs), so quiet seconds were not paid back; (2) hard.js's "repair without aimed hits" (1.2%/s) ate damage before it reached the cap; (3) fair.js's 66% core shield froze the bar 4-52 s (a bot artifact, but it added straight on top of the cap).
**Change (all inside `RET.boss2`, `?boss2=0` = round 3):** armour.js `B2X.BK=5`: damage above the cap waits in the armour (at most 5 s of the cap) and goes in at the cap's pace, so the floor is unchanged (never more than the cap in 1 s) and the length is decided by the cap; `B2X.SHT=14`: a core shield that lasts more than 14 s overloads (cores blow, "SHIELD OVERLOAD"); hard.js: the boss repair runs only while the ship camps (`CAMP.on`), and then at most `B2X.REP=.2` x the cap (was .4).
**Measured** (god mode, dodging bot, max build, RUNS 2-3; on-screen time): 
| fight | round 4 | now moving | now parked (camper) | god-damage stress | fresh ship |
|---|---|---|---|---|---|
| Legend mini | 95-105 | 78-87 | 88-109 | 73 | 78 |
| Legend district | 229-236 | 127-133 | 132 | 116 | 120 |
| Legend final | 278-362 | 194-202 | 212-234 | 180 | 195 |
| Normal mini | 64-66 | 53-60 | 54-67 | 52 | 55-57 |
| Normal district | 103-109 | 87-92 | 87-96 | 84 | 87 |
| Normal final | 164-171 | 128-141 | 131-138 | 127 | 131-136 |
scale2-test / scale3-test Legend final window is back at 170-260 s; boss2-test's stress now also checks the upper targets.

### Boss movesets (VARIETY B, 18 Oct 2026; parts/bossmoves.js, flag RET.bossmoves)
Owner: "Game is extremely repetitive". All ten fights used the same 6 verbs. Now 45 verbs, every boss 8-10 in three phases, pairwise overlap <= 2, one signature + one counter each. HP, cap and phases unchanged (armour.js).
Measured (bossmoves-audit.js): shortest telegraph 0.60 s, smallest free disc 96 px, bullets <= ebCap, speed <= BCAP, stress fight lengths at the armour floor (Normal mini ~52 s, district ~85 s, final ~127 s).
Bot (balance-test bot, Normal, mid+late, 2 runs): 28/40 boss-stage clears vs 31/40 with ?bossmoves=0 in the last run (30 vs 28 in the run before). Weakest: Hoplite 1/4, Schranke 2/4; Talos 2/4 (was 0/4).

## Must move (flag RET.mustmove, ?mustmove=0 = before; 19 Oct 2026)
Owner: "there are weapons like swarm that I can win the game without moving on Normal". Gate: `mustmove-test.js` (Normal, stages 1/5/10/20/30/40,
mid + max builds, every weapon paired with the homing Swarm; bots: park = never moves, hop = 48 px every 1.5 s blind to bullets, track = lines up
with the nearest foe and never dodges). Before: park and hop already died (h.js static discharge, ~25 s); **track cleared 60%** of stages >= 3 with
every weapon (the weapon did not matter: enemies hardly threaten a ship that keeps its x). After: track 0-10% per weapon, park/hop 0%.
- Column strike (`parts/fair.js` D, object `MM`): a ship whose x stays inside 70 px for `MM.win()` s (Easy 5, Normal 3.5, Hard 3.2, VH 3, Legend 2.8)
  gets a vertical lane on its x: pulses `MM.tel()` s (Easy 1.1 .. Legend .7, always >= .6), fires .25 s, 1 hull (2 from the second strike in a row
  unless the ship really moved 140 px; Easy always 1). 1.6 s pause between strikes (Easy 2.4). Story stage >= 3, endless after 20 s, not in
  tutorial/lab/god mode. A 45 px sidestep or a dash clears it; the rest of the screen is free.
- Homing (S2 steer): every tier now uses the hard tiers' narrow cone (.7 rad) and reach (300 px), so missiles need the ship pointed at a target.
- Test bots see the lane (`MM.cost(x)`) like STILL.beam and the boss telegraphs: balance-test dec()/camp(), afk-test bot.

## Enemies that react (parts/react.js, flag RET.react, ?react=0 = old fixed paths and timers; 19-20 Oct 2026)
- Brains on drones, flankers, turrets, gunships (formation path units and units on their way out get fire brains only; zoo kinds, ground units, bosses, tutorial untouched):
  HUNT (leads PV), FEINT (tell, cancel '?', slide to the other side, real shot), RETREAT (backs off while you press in; when you back away it dives, dashed-line tell),
  PRESS (fills the half you hug), BAIT (holds fire until you cross a lane, then shoots where the dodge goes), WINDOW (Hard+: steel ring, shots bounce off except 1 s after it fires).
- Squads (spawned on one frame; a turret/gunship can recruit an on-screen drone): PIN + EXIT pair (same tell; exit line >= 114 px from the pin line), LEADER (crown; Hard+ 1.5x HP; death = 3 s ENRAGED, faster cycle, same tells), shield BEARER (covers a gunner from the ship's line; flank it).
- Reads the ship: camping on a gun's line from > 300 px for 0.6 s cuts its cooldown (still a full tell); a ship that hangs back (x < 170) for 3 s gets full lead and loses the Normal easing;
  a ship within 250 px flusters it on Easy/Normal (one plain shot, no lead, +0.15 s tell), so pressing in pays (reward-test: bold >= camp in 3/3 runs).
- Fire period = old mean x (1 +-25%), Easy/Normal x1.25 (not while hanging back); flankers keep their own sweep (fire brains only); tells >= 0.6 s (Easy/Normal 0.7 s), shots land on a beat; at most 3 tells at once (Hard+ 6). First shot 0.1-0.4 s + tell after entry, never held by the tell cap. Easy: no squads.
- Per-run seed (daily/weekly: fixed from the date; ?rseed=N forces one; ?rxs=<state> forces a state for tests).
- react-test on the merged build (stage 7 + a scripted turret/drone pair every 10 s, 5 attempts, same dice, fresh page each): enemy position gap between attempts 0.0 -> 62.5 px, fire-time spread 0.00 -> 1.49 s.
  Normal stages 3/7/12 x10: dodging bot 100% -> 93%, tracker bot 0% -> 0% (react=0 -> on). Escape gap >= 96 px, tells >= 0.6 s, flag off = identical to the page without react.js.

## Counter threats: DASH and EMP as answers (flag RET.counter, ?counter=0 = abilities only; 19 Oct 2026)
- One threat every EV bars (Easy 10, Normal 9, Hard 6, Very hard 5, Legend 4), in turn from the unlocked ones; never with a boss, pit stop, lab or tutorial.
  Unlock by story stage: seeker 3, wall 5 (not Easy), curtain 7 (not Easy), warden 9. Endless uses S2.stg().
- Seeker: .7 s red-ring tell, 300 px/s (Easy 240), turns 9 rad/s on the hard tiers (Normal 6 = can be outrun, Easy 4) for 4 s; 1 hull (2 on hard tiers); parry window .15 s (+1 frame); parry shot 15 dmg (player shot, DMG caps).
- Laser wall: 1.3 s tell, 420 px/s, 1 hull once; 110 px gap below Hard or when there is no dash charge. Curtain: .9 s tell, 2 layers, 96 px gaps >= 270 px apart, .45 s apart (.9 s below Hard or with no dash and no EMP), 230 px/s.
- Warden: 60 hull x (Easy .8, Normal 1, Hard 1.3, Very hard 1.5, Legend 1.7); shield takes 70% of each hit; EMP strips it for 8 s; stays up to 20 s.
- GOOD EMP (>= 6 bullets, a curtain, or a shielded warden): +400 x mult, +.25 meter. COMBO = EMP <= 1 s after a dash start: +12 to ordinary foes within 300 px.
- counter-test (threat scenarios on Hard; dodging bot without vs with the timed answer, hull lost): seeker (Hard) 5 vs 0, wall 5 vs 0, curtain 3 vs 1; warden kill 3.5 s vs 1.2 s; combo 110 vs 50 damage; random presses 5.7 vs timed 2.5.
- balance-test Normal stage 20 (RUNS=6): first tuning (EV 7, turn 9) 67%/67% vs 100%/100% flag off; now late 83%, mid 100%.

## Weapon Forge (flag RET.forge, ?forge=0 = old; 20 Oct 2026)
- Hybrid damage factor = clamp(.95 - 1.6 x trait cost, .5, .9) x (1 + .03 x (level-1)); trait costs in forge.js `FGC` (seeds .2, trail .18, ring .15, nova .1, burst .15, zp .12, zp2 .3, sp .12, grav .05, px .04, rc .1, hk .06, rad .01 per unit). Mods trade damage for effect (k .85-.97; HEAVY 1.2 with x.7 shot speed; BEAT x1.3 on the beat, x.9 off it).
- Gates (forge-test.js): LV5 hybrid + HEAVY <= 1.35x its parent (dummy DPS); Hard stage 30 clear time vs the parents alone within 15% of the median ratio for the top 10. Results in HANDOFF.md.

## Visible (parts/visible.js, flag RET.vis, default ON; ?vis=0 = old) - 20 Oct 2026
Owner on Normal with PULSE 3 + SWARM 10: "enemies do not survive to show on screen, EMP and dash are useless". Probe + gate: `visible-test.js` (ALL=1 = all 16 weapons at L10, VIS=0 = old rules).
- Floor per kind replaces DMG.ml when on (DMG.minLife asks VIS.life): drone 1.6 s, charger/flank 2.1, gunship 5.2, gate/turret/tank 3.1, walker 2.6, swarm 1.05, mine 1.05, zoo kinds >= 2.1, elites 4 (charger 2.1).
  The old floor shrank to .65x on late stages; now only Hard+ shrinks it, never below .8. This is also the per-target area cap: spread/chain/arc/homing cannot strip hull faster.
- DASH hits and beat-parried shots (e.dk) skip the floor for .25 s; EMP and rams already did.
- Homing (SH.steer) locks only on foes inside the playfield (x <= W-30, y in -10..H+10) and flies straight its first .18 s.
- No damage outside the playfield: the DMG entry grace also covers a foe that has left the screen.
- Normal from stage 10: hull 5 (was 6). A hull cut from stage 3 sank the stage-8 boss fight for the late build (balance 67% -> 0-33%), so stages 1-9 keep 7.
- Before -> after (PULSE 3 + SWARM 10, Normal st 3/10/20/30, median s on screen): drone 1.48 -> 1.90, charger 1.50 -> 2.60, swarm .78 -> 1.37, gunship 6.5 -> 6.7, mine 2.1 -> 3.2; killed before visible 0 -> 0.
  All 16 weapons at L10: median 2.30 -> 2.87 s, spread pulse 2.33 .. storm 3.63 (all within +-40%).
- RET.timing stays OFF: with this Normal the timing-test bots read reflex 75-92%, random 58-67% (gates 70% / 40%); the random bot lives on 5-6 EMP/min. Next: price the EMP (a wasted EMP should cost meter) before flipping it.

## Density (W20, flag RET.density, default ON; ?density=0 = old)
Industry audit S04/S06/S08/S09/S12 (before): bullets on screen mean 4.99, ramp 1.08, spawns/min 78.6, one kind 41% of spawns, 13 distinct boss attacks.
parts/density.js: a per-stage budget of bullets on screen (heavy stretch: ~9 at stage 3 to ~24 at stage 30 on Normal; breather = 60% of it, 12 s of every 40 s, first 10 s of a stage light; Easy x.75, Hard x1.45, Very hard x1.6; never above ebCap()-2).
When the screen holds fewer, the director beat hook (dir.js) sends a slow curtain: 2 to 7 columns of 3-4 bullets, speed 105-135, marker >= .7 s, columns >= 115 px apart (also from columns still pending or falling), none above the ship; ebCap/BCAP apply through eb().
Roster substitution now also covers stages 3-4 (only stages 1-2 keep the plain drones) so no kind passes 35% of spawns. Boss movesets are built at spawn and trimmed to <= 12 distinct attacks (DENS.trimBoss; hulls and caps in armour.js untouched).
Test: density-test.js (curve, caps, gaps, difficulty order, flag off).
Result (industry-audit, before -> after): S04 4.99 -> 11.15 (target 12, near), S06 1.08 -> 1.73 pass, S08 78.6 -> 78.4 pass, S09 0.41 -> 0.23 pass, S12 13 -> 8 pass. The budget curve is convex (balance-test Normal late stage 8 clear 67%, same as ?density=0; a linear curve gave 50%).

## Anti-camp (W29, parts/anticamp.js, flag RET.anticamp, default ON; ?anticamp=0 = old) - 20 Oct 2026
- Why: review 4 (g): Normal camper (x=70, tracks height) 92% vs dodger 83%; bot that does not read the strike 20% first try. Camping beat dodging and the strike was a hidden wall.
- Camp level 0..1: last 6 s of x samples; share in the left 25% (0 at 75%, full at 95%) x spread (full under 32 px, 0 above 64 px). The anticamp-test dodger swing scores 0; the dodge bot is flagged 15% of its time (pushed to the edge by bullets).
- Above .5: a flanker tell every 2.6 s Normal (Easy 3.4, Hard 2.2, Very hard 2, Legend 1.8; faster at full level): 0.8 s edge marker + dashed line, then a 3-bullet stream from behind or above at the camp spot (3 lines 120 px apart after the 2nd flush), or a ground-fire wall up the left edge with a 120 px gap (dies at 32% of the field). Through eb(): ebCap/BCAP hold.
- Pickups wait at 45% of the field while camping (fade after 10 s); score and EMP gain x(1 - .5 level); shots from the left 25% at targets beyond 60% hit x(1 - .4 level).
- Forward repair: every 10 close-range kills (reward.js close mark) drop a repair, max one per 25 s; Easy/Normal/Hard (not Very hard/Legend).
- Strike on Easy/Normal: 6 s still (was 3.5-5) unless camping, tell >= 1.2 s on the beat, first of a stage 0 hull, later 1 (never 2), none while collecting or, when not camping, shooting a lined-up target (fired < .6 s ago). Hard tiers keep strike2.
- anticamp-test (Normal st 3/10/20 x6, Hard max st 2/4 x6), before (?anticamp=0) -> after: dodge 67 -> 72%, camp 83 -> 22%, bold 33 -> 61%, no-oracle dodger 42 -> 67%; Hard max st 2/4 after: dodge 100 / camp 25 (st 5/12: both 0% before and after). Noise about +-11 at 18 runs (repeat runs: camp 11-22%, dodge 61-83%).
- repeat-audit arcade-normal stages 1-20 (S23 no-oracle first try): 0.55 (review 4: 0.20 over 45 stages). mustmove 3/10/20: park/hop/track 0% (track was 30% before campers lost the aiming exemption).

## Human bot and floors x1.3 (W32, 20 Oct 2026)
`humanbot.js`, Normal, n=16 per cell, builds mid / owner (PULSE 3 + SWARM 10), before (floors x1) -> after (x1.3, taper to x1.1 at stage 20):
- median on-screen life of all kills: 2.43 s -> 3.02 s (S03 >= 3 s). drone 2.0 -> 2.5, charger 2.4 -> 2.6, flank 2.5 -> 3.1, mine 1.9 -> 2.4, swarm 1.7 -> 1.9, turret 3.5-7 -> 6-8, elite drone 4.3 -> 4.7.
- human bot clear st3: mid 81 -> 88, owner 94 -> 75 (noise +-15); st20: mid 6 -> 13, owner 19 -> 25. Hits per stage 6-9 -> 6-7.
- oracle dodger clear st3: 100 -> 94-100; st20: mid 25 -> 31, owner 63 -> 31 (earlier n=12 runs of the same build: 33-58 / 42-75; noise +-20).
- Not reached: human Normal st3-8 70-85% and st20 55-75% (already below it before the change); TTK 3-5 s normal class holds only for drone/charger/flank/turret.
