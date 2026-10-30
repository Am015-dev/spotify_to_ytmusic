# Gauntlet: the test a player would be (gauntlet-g0, 2026-10-29)
Why: hundreds of GO state asserts were green while a phone player could not hit traffic, could not drift, got reloads and read a 40-word mission card. GOs call game functions; a player presses buttons. `tools/gauntlet.js` presses buttons.

## Run it
```
node tools/gauntlet.js                         # builds out/gauntlet from src/, runs everything (~25-35 min wall on this container)
node tools/gauntlet.js --build out/<ver>       # an existing build
node tools/gauntlet.js --url https://...       # a deployed page
node tools/gauntlet.js --only boot,drive,hit   # parts: perf,steer,drive,hit,drift,wall,pause,mission,race,ath,portrait (boot + HUD rows always run)
GDEBUG=1 node tools/gauntlet.js --only mission # extra DBG lines from the street follower / mission approach
node tools/gauntlet.js --throttle 1            # boot unthrottled (script development only; the baseline uses 6x)
```
Output: one table on stdout (`PASS|FAIL|INFO row number bar`) and `docs/shots/gauntlet/<ver>/REPORT.md` + `rows.json` + every shot. **Exit code = number of FAIL rows.**

## What it is and is not allowed to do
- **Input:** only real Playwright/CDP touch on the real on-screen elements: `#ob2Play`, GAS `#tG`, BRAKE `#tB`, ◀ `#tL`, ▶ `#tR`, ❚❚ `#tP`, pause-menu buttons by their text (RESUME, QUIT TO TITLE), card buttons by text (LET'S GO / START), RETRY, 🏁 RACES, `#startBtn`. Several fingers at once (GAS + steer) like a thumb pair. Brake presses below 20 km/h are spaced >= 420 ms so the bot never double-taps into PARK by accident.
- **Reads (allowed, like a player looking at the screen):** `RO`/`HUB`/`pl`/`state`/`T` fields, DOM boxes and text, and one pure lookup (`roamHit`, collider query, no side effects) to see where a wall is before aiming at it.
- **Never:** set game state or call a game function that changes anything. No `?test=` boot: the real title → PLAY path.
- **Profile:** iPhone UA, 852x393 landscape, touch, device scale 2. Boot (title → PLAY → first control) and the frame-time window run on the real clock with **6x CPU** (CDP throttle). Portrait smoke: 390x844.
- **Clock (honest note):** software GL in this container renders ~2-3 fps, i.e. 0.15 game-s per real second. After the boot, the harness becomes the page's vsync (same capture as `tools/bughunt.js`): it steps the game's own rAF callback at a fixed 1/30 s phone frame and skips GPU draws between screenshots (every screenshot renders real frames first). That is the clock and the GPU, never game state. CPU throttle is off while stepping (it would only slow the wall clock). **All bars are in game seconds (`T`).** Wall-clock UI timers (toasts, card fades) still run in real time.
- **Athens:** the run starts as a returning player whose save is in Athens: before the page loads it writes exactly what the game's own `cityTravel()` writes before its reload (`mho_slot=1`, `mho_roam@1`, `mho_roam.ath@1`, `mho_city@1=ath`); the path to fly there is not driven (it is far on the map).

## The rows
| row | the player does | bar (source) |
|---|---|---|
| boot/toControl | taps PLAY on the title card | first control <= 8 s lab (brief; HITRUN_GAP pair 1 was 76 s) |
| boot/menu, boot/loader | — | 0 samples with the race menu after PLAY; 0 control frames under the loader (hr/boot) |
| hud/overControls(2), hud/minText | — | 0 text boxes over a touch button; 0 visible texts < 12 px (CLAUDE.md phone rules) |
| perf/frame | holds GAS 8 s (real clock, 6x CPU) | INFO: p95 frame ms and frames > 50 ms (iPhone truth = perf/ios-reveal) |
| steer/buttons | GAS + ◀ (or ▶) for 1.2 s, twice each | each >= 20° the pressed way (also proves the bot's own steer sign: ◀ makes `RO.h` grow) |
| drive/time, drive/frustration | holds GAS 2 min, steers along streets, reverses when stuck | >= 110 s and >= 1 km; <= 15 % of gas time under 10 km/h (bughunt frustration limit) |
| drive/pop | — | 0 traffic cars in view (6-60 m) that jump > 2 m in one frame; 0 that appear < 40 m |
| drive/onStreet | — | >= 80 % of the drive on a street: a **script validity** row (if it fails, the drive/hit/drift rows of that run are not trustworthy) |
| drive/near | — | >= 2.5 cars within 40 m on average (HITRUN_GAP gap 8, hr/near) |
| hit/contact, hit/noBrake | picks a traffic car 12-70 m ahead that closes on it (oncoming/slower first), aims with ◀ ▶, GAS held in the last 18 m (never BRAKE) | >= 4/5 contacts (centre distance < 6 m, or the car vanishes < 7 m away = smashed); <= 5 % speed lost between 12 m and contact (HITRUN_GAP gap 1) |
| hit/react | — | INFO only: the HUB position read misses thrown cars (the hit shots show them tumbling). Make it a bar once a read of the thrown body exists |
| drift/start | BRAKE + ◀/▶ for 1.4 s at ~52 km/h, 3 times | 3/3 slip angle (heading vs velocity) >= 15° |
| drift/tap | 0.15 s BRAKE tap mid-corner at ~50 km/h, 3 times | 0/3 slip > 8° |
| wall/glance | turns 20-45° off the street toward a collider the bot sees 7-45 m ahead (`roamHit`), ~40 km/h, 4 times | 4/4 keep >= 60 % speed 0.5 s after contact, 0 hp lost. Only a stop at the collider distance counts (props/minifigs in front are skipped); approaches < 25 km/h are not counted (script) |
| wall/headon | turns ~83° into the buildings at ~45 km/h, 2 times | 2/2 keep <= 35 % |
| pause/resume | taps ❚❚, then ▶ RESUME | pause opens, game time stops, resume restarts it |
| mission/reach, card, cover, objective | drives to the nearest mission marker (streets; straight at it inside 150 m), stops in it or taps the `TAP TO OPEN` prompt, taps START ▶ | card <= 60 s; card text without buttons <= 6 words; 0 card text over the touch buttons; first objective after START <= 6 words (hr/mstart) |
| mission/end, mission/retry | taps the card's GO, drives at the objective; on a fail screen taps RETRY | ends <= 200 s; complete, or RETRY visible and back driving <= 2 s game |
| race/start, race/finish | ❚❚ → QUIT TO TITLE → 🏁 RACES → START, holds GAS and steers to the track centre | grid reached; result screen <= 480 s game |
| ath/boot, ath/drive, ath/race | Athens: PLAY, 60 s drive, RACES → START | control in Athens; >= 55 s, <= 15 % slow, 0 pops; grid reached |
| portrait/boot, portrait/hud | 390x844: PLAY | control; 0 overlaps / 0 small texts |
| page/reload, page/jsErrors | — | 0 reloads; 0 page errors / console errors |
| page/memory | — | INFO: JS heap high-water |

**Seen rows:** after looking at the shots, write `docs/shots/gauntlet/<ver>/SEEN.md` with one `- id | what I saw | shot.jpg` line per sloppy thing; the next run (or a re-run) turns each into a `seen/<id>` FAIL row. Delete a line only when the shot shows it fixed.

Shots (`docs/shots/gauntlet/<ver>/`): title, first control, street at speed, each hit, a drift, walls, pause, mission card, mission HUD, mission end, race menu, race start, race finish, Athens. **Look at every one**; anything sloppy you see (floating objects, clutter, text over controls, black or empty frames) goes into the report's "Seen in the shots" list as a row.

## Adding or tightening a row (fix lanes)
- A fix lane starts from the FAIL row that names its bug (rule 13): run `--only <part>` on the live build, see the row FAIL, fix the game, see it PASS on the built page.
- New row: add a `row(id, what, number, bar, pass, shot, note)` call in the matching `sc*` function. Input must go through `Player.down/up/set/tapSel/tapText`; reads through `__GH.read/cars/car/marks` or a new read-only helper in `HARNESS`. A helper that writes anything the game reads is not allowed.
- **Bars may only be tightened, never loosened, without the coordinator.** Write the source of each bar (HITRUN_GAP, a GO name, Alex's words) in the bar text.
- Separate test-script bugs from game bugs: re-run a FAIL once (`--only <part>`); a script bug (aim, timing) is fixed in the script and noted in the commit; a game bug stays FAIL until the game is fixed.

## Lessons from building it (2026-10-29)
- ◀ makes `RO.h` grow in this game (+x is screen-left, camera down +z). The first bot steered mirror-image and every drive row was nonsense; `steer/buttons` now guards that.
- Mission beacons need `stop to start · TAP TO OPEN`: driving through at 22 km/h twenty times never opens a card. The bot stops in the beacon or taps the prompt, like a player.
- QUIT TO TITLE lands on CHOOSE TRACK (no RACES tap needed). The race finish cam runs at 0.2x, so results come ~12 s game after the line.
- Roam pause keeps `T` running; pause is judged by the car and the traffic standing still.
- Playwright's `page.clock` breaks this page (taps ignored, screenshots hang); do not use it.

## Baseline: trunk 084dfd0 = v90m-beta.164 (2026-10-30), the work list
Report: [shots/gauntlet/v90m-beta.164/REPORT.md](shots/gauntlet/v90m-beta.164/REPORT.md) · 16 FAIL of 43 rows (7 measured + 9 seen). Every measured FAIL was re-run (run A 767 s, run B 821 s wall, same build):
| row | run A | run B (committed) | verdict |
|---|---|---|---|
| boot/toControl | 105.6 s | 105.9 s | **game**, reproduces (bar 8 s lab; 6x CPU on software GL) |
| drift/start | 0/3, 0° slip, car stops | 0/3, 0° slip, car stops | **game**, reproduces: BRAKE + ◀/▶ at 50 km/h brakes to 0 and never slides |
| drive/near | 1.7 | 1.0 | **game**, reproduces (HITRUN_GAP gap 8) |
| mission/card | (not reached: script picked a moving chase van; fixed) | 26 words | **game** (B only reached it; the dev runs saw a 9-word "SIDE CHALLENGE" card) |
| drive/pop | PASS | 2 jumps (3.9 m, 2.3 m) at 8 m | intermittent: 1 FAIL in 6 drive runs today; keep the row, watch it |
| wall/glance, wall/headon | 0/4, 0/2 not set up | 1/4 (+3 not set up), 0/2 not set up | **script**: the wall approach finds props/minifigs before the wall. Dev runs that did set up measured 20° 23 % kept, 37° -17 hp (= REVIEW_2K_26 "glances now damage"). Next lane: aim at long facades only |
| steer/buttons, mission/reach, run/ath | FAIL | PASS | **script** bugs fixed between the runs (no-speed setup; chase marker; Athens seed) |
Passing and worth keeping green: menu/loader never over the car (hr/boot), 0 HUD text over the buttons and no text < 12 px (landscape + portrait), 4/5 then 5/5 nose-in contacts with <= 4 % speed lost before contact (gap 1 looks fixed for oncoming/slower cars), brake taps never slide, pause freezes car + traffic, mission fail → RETRY back driving in 0.2 s, race to the result screen in 134-147 s, Athens boot/drive/race grid, 0 reloads, 0 JS errors.
