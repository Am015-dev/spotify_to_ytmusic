# Race modes: demolition-style variations (lane G, 2026-10-17)

Alex: "at the race options we can have some demolition-racer style variations". The research, with source links, is in `docs/refs/racemodes/NOTES.md`.
Every mode reuses the city-course race engine (`98tk_city_duel.js`: two-route course, rivals, "?" bricks TURBO / BRICK BLAST / SHIELD, ramps, arches) and the brick burst and debris (`xfBurst`, `debris`). Phone: no new button. Gas stays on by default, and the items fire when you pick them up.

Ranked by fun ÷ effort (effort: S = under 1 day, M = 1–2 days, L = new arena geometry).

| # | mode | inspired by | rules / win | arena | effort | status |
|---|---|---|---|---|---|---|
| 1 | **Takedown Race** | Burnout 3 takedowns, Wreckfest Banger Race | Race the Quick Race course. Ram a rival from behind while you are faster, or hit it while a BRICK BLAST has it stunned: TAKEDOWN. The rival spins out in a brick burst for 2.6 s and drops 15 m, and you get −3 s. Rivals hunt you: within 40 m they steer into your lane, and from just behind they shove at +3 m/s. A rival takedown costs you 40 % of your speed and gives that rival −3 s. Order = time − 3 s × takedowns, capped at 300 s. | Any Quick Race city course | S | **BUILT**, `?td=1` |
| 2 | **Road Rage (time attack)** | Burnout Paradise Road Rage | Free roam, 90 s: take down as many traffic or rival cars as you can (target 5/10/15 = ★). Each takedown adds 5 s, and the run ends when time runs out or your health reaches 0. | Free roam in either city: busy streets, traffic as the targets | S–M | next. Reuses the 1 takedown trigger plus the life-1 traffic |
| 3 | **Marked Man / Getaway** | Burnout Paradise Marked Man, 2K Drive Getaway | You carry a golden brick from A to B while 3 rivals hunt you. Each takedown knocks studs loose; SHIELD bricks only. Win = reach B with ≥ 1 stud, or the rivals win. | Point to point on the course builder (one route) | M | Reuses the 1 hunters plus the stud pickups |
| 4 | **Smash Score race** | Wreckfest points race, 2K Drive smash events | The finish order sets base points (10/6/3/1). Every smash, takedown and combo adds points, and the most points wins. | Any city course | S | Needs lane F's smash2 trigger to count smashes, so build after `?smash2` lands |
| 5 | **Brick Derby** | Wreckfest / FlatOut derby, Destruction AllStars | Last car running in a walled bowl. Each car has 100 health; rams remove 10–40 by closing speed, and a car at 0 bursts into bricks. Shrinking brick walls after 60 s (Gridfall). | New: round 120 m brick bowl with ramp walls on a park (Ostpark / Zappeion) | L | Needs an arena, car–car physics for every pair, and a camera for small spaces |
| 6 | **Figure-8 crossover race** | Wreckfest Figure-8 | 3 laps on a figure-8 with a level crossing at the centre, where traffic and rivals collide. | New: a figure-8 laid out on a large square (Messe / Syntagma) | L | Needs looped-course support (the city courses run point to point) |

## 1 · Takedown Race (built)
- **Rules**: as in the table. A shield blocks a rival takedown. Each rival rams at most once per 20 s, and you get 15 s of grace after you are taken down (so a clean driver still wins). Rival-on-rival hits are not modelled.
- **Arena**: the Quick Race course for the selected track (Grand Prix, Skyline, Fraport …), with 3 rivals (Weber, Kaya, Adler).
- **Phone / PC controls**: unchanged. Turbo comes from "?" bricks; ram with gas. PC: arrows/WASD.
- **Menu**: Quick Race tab → **Mode · Race | Takedown** (shown only with `?td=1`) → START TAKEDOWN RACE.
- **HUD**: the race line shows 💥 n, the feed shows "💥 TAKEDOWN · name · −3 s", the result title reads "💥 TAKEDOWN · …", and the result shows takedowns, the time bonus and how often you were taken down.
- **Reuse**: the `tkStart` / `tkStep` / `tkFinish` wrappers (`src/98td_takedown.js`, 4 KB), `xfBurst` + `debris` for the wreck, and `tkBot` for the GO. No new physics.
- **Acceptance GO `raceG/takedown`**: the mode starts (sp.td, 3 rivals). A staged rear hit at +12 m/s counts 1 takedown and stuns the rival. A staged rival shove from behind counts 1 taken-down and cuts speed to < 7 m/s. Rivals steer toward you (aim > 0). The Fraport Quick Race returns a takedown result within 300 s. The human-like bot (150 ms lag) wins a Takedown Westend Split (`TDR.force`, the one fair course): 3/3 runs 1st, 1–2 takedowns each way.
- **Known**: the human-like bot DNFs the Quick Race courses even without takedowns (Grand Prix stuck at 77 %, Skyline at the finish line, Fraport around 40 %), as in review #3 `rv2k3/races`. Fix the courses there; then the GO can require a Quick Race win. The centre "💥 TAKEDOWN!" banner is not visible in the shots (roam `say` routing), but the burst is.

## Shots
`docs/shots/raceG/td_action.jpg` (takedown burst mid-race, 852×393), `td_result.jpg` (result with takedown line), `por_td_action.jpg` (393×852).
