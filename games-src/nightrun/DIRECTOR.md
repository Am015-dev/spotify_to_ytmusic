# Nightrun: full-length districts, the director, fair difficulty, more upgrades (F, 8 Oct 2026)

Source: `parts/` (build: `python3 games-src/nightrun/parts/build.py`). New parts: `songs.js` (generated), `dir.js`, `up2.js`, `athens2.js`.
Checks: `f-checks.js` (this update), `sweep.js` (whole page, once before a deploy), `f-sim.js` (bots, the difficulty numbers), `story-sim.js`.

## A district lasts as long as its song
- `songs.js` is made by `analysis/song-energy.py` (ffmpeg): every song's length in bars and its loudness per bar (0-9). A song decoded in the page wins over the table (`songBars()` in `a.js`), so a replaced mp3 still sets the length. Re-run the script when a song changes.
- District = the song's bars (Bank 66, Main 89, Ostend 125, Athens 66, Messe 89 at loop 1; 101 / 64 bars from loop 2 on). The boss comes in the last 32 bars (`bossBar = bars - 32`, at least bar 24) and cannot fall before bar 32 of its own fight: the boss has HP floors (armour, shown as ARMOUR) that hold it at 62 % until bar 14, 30 % until bar 26 and 4 % until bar 32. So wave phase + boss are never shorter than the song (check: `f-checks.js length`, measured 66.0 for a 66-bar song). If the boss needs longer the song loops. A mini-boss stands 14 bars (stage goal `mini`).
- Story uses the same rule (`stLen`): `survive` = the song's bars, `kill` / `score` / PERFECT goals scale with length / 46, and the stage cannot end before the song does; boss stages put the boss at `len - 32` (mini-boss `len - 14`).
- Endless cycle order: Bank, Main, Ostend, **ATHINA**, then the final-boss district (Messe, KRONOS). `ORDER` / `nextDi()` in `b.js`; the next loop uses the endless songs and adds mutators.

## The director (`dir.js`)
- Waves enter on bar lines. Every 8 bars a new **theme** (ranks, flank, turrets, swarm, elite, hazard, rush, breather) is drawn from the tier (position in the cycle + 5 per loop), the loudness of the next 8 bars and the district's flavour. Each bar the number of patterns is `(0.95 + slope*t + quad*t^2) * (0.42 + 1.15*E) * difficulty * upgrades * lenK` where `E` is that bar's loudness: loud bars are dense, breakdowns are calm. A pattern is spawned at once if the screen has been empty for a bar (no dead air above 2 bars, measured below 1), and never two bars pass without a spawn.
- Patterns (`PATS`): drone line / sine / V / snake, phalanx, wedge, chargers, turret pair / line, flank pair / pincer (enter from the top and bottom edge), swarm / swarm ring, elite V, convoy, mines, gate, pillars, gunship. A mini-boss comes about every 64 bars of play.
- **Mutators** (loop 1: one, loop 2: two, loop 3+: three; they rotate per district): HAILSTORM (slow rain, columns marked one beat before), MINEFIELD, TURBO (faster shots), TIDE (swarms), FLANK RUSH, ELITE GUARD. Loops also widen fans and rings and speed bullets up a little (`TUNE2`).
- `TUNE2` (in `dir.js`, live as `__mnr.TUNE2`) holds the numbers; `f-sim.js` measures them (`T2='{"slope":0.2}'`).

## Fair
- Every enemy shot is armed one beat before it fires (`e.arm`: glow and a closing ring); the boss glows the beat before every volley, spirals and lasers too. A shooter that was not armed does not fire. Check: `f-checks.js telegraph` (0 of ~35000 shots unarmed).
- Nothing spawns within 210 px of the ship (`DIR.safe`: it slides further off screen). Flankers and rain are announced by a marker for a beat. No enemy fires at a ship closer than `max(190 px, bullet speed * 0.85 s)`. Bullets never exceed 400 px/s. Fans keep their bullets at least 0.15 rad apart.
- One hit costs one pip and gives 1.5 s of invulnerability (existing). Gate beams and chargers warn for a full beat.
- **Safe path** (`f-checks.js safepath`): a planner with exact knowledge of every bullet, enemy path, locked charger lane, gate beam, laser and the boss's next telegraphed volleys searches 1.3 s ahead for a path that touches nothing (ship speed 300 px/s, no dash). It flies every formation, every boss pattern and every mutator at the hardest setting (hard, loop 4) for 20 trials each.

## Soft scaling
`upsCalc()`: every pit-stop upgrade and garage perk has a weight (`UP_W`, `TP_W`); `soft = 1 - exp(-u/1.4)` raises enemy hit points (up to +110 %), pattern density (+35 %), pace and bullet speed a little. Story uses the same numbers, so upgrades always help but never break it.

## Upgrades (`up2.js`)
New pit-stop upgrades: Side Cannons, Rear Gun, Ricochet, Auto-Shield, Score Magnet, Neon Interest, EMP Cell, Lucky Drops (in the pool from the start) and Piercing Shots, Chain Lightning, Bullet Time, Overdrive, Beat Drone, Second Wind (unlocked in the garage CREW tab). New garage perks: Time Dilator, Piercing Rounds, Neon Interest, Side Mounts. New ships: **Swing** (long-short pairs, 2 shots per beat at 0 and 2/3) and **Syncopator** (a 3-2 clave on the 16th grid, 5 shots per bar between the beats). Wing cannons, the rear gun, beat drones, the piercing spike and the overdrive ring are drawn on the ship.
Neon pays about a quarter of what it did (`NEON_K` in `shop.js`) because a district now has 300+ kills; hull drops are 1 in 110 kills.

## Athens
Portrait has its own backdrop (`athens2.js`): the floodlit Acropolis with the Parthenon on its rock, Lycabettus with its white chapel, olive groves, whitewashed Plaka roofs with a blue church dome and string lights, the sea with moon glints. Landscape adds the moon with its glint column on the water and olive groves on the shore.
