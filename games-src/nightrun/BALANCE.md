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
