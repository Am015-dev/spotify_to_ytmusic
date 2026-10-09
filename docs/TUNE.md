# TUNE: tune the driving feel yourself (since tune20)

All the numbers that shape how the car drives and looks (~55 knobs) are in one place. You change them with sliders while you drive.
Nothing changes for normal players unless a tuning is published.

## Alex: how to use it
1. Open the **beta artifact** in the Claude app, or any build with `?tune=1` added to the URL.
2. Tap the small **⚙** at the top centre of the screen. A drawer slides out on the left. It stops above GAS/BRAKE/◀▶, so you can keep driving.
3. Pick a tab: **Steer · Grip · Engine · Boost · Camera · Body · Race · FX · Audio · Route**. Move a slider and it applies at once.
   FX (since fix21) = boost visuals in roam and races: flame size/length/brightness, sparkles ON/OFF + count + size, speed lines, screen glow/blur, FOV kick, shake (all ×, 1 = default).
   Audio (since fix21) = music on/off, music volume (0.5 default), SFX volume ×, duck music under dialogue + boost (on/off + amount). Tracks: `src/assets/music/<name>.mp3` + the name in `MUS_FILES` (src/98m_music.js).
   The number next to a slider turns **pink** when it differs from the default.
4. **RESET STEER** (or another tab) puts that group back to the defaults.
5. **SAVE…** opens the Saves tab. Type a short note (e.g. "tighter steering") and tap **SAVE**. That stores a new version vN.
6. In the version list (vN · note · time):
   - **LOAD** tries a version now.
   - **★ SET** makes it the version the beta starts with for everyone.
7. **EXPORT JSON** copies the current values. If copying is blocked, the JSON is shown selected so you can copy it by hand.
   Send that JSON (or just "publish v7") to the coordinator.

Some knobs only apply later:
- Traffic density applies on the next city load.
- Race speed applies on the next race.
- Car width, length and ride height are cosmetic and only affect the player car. Collision is unchanged.

## drive24 knobs (v88f): steering build-up and mission routes
Steer tab (`src/98d_drive24.js` `D24_shape`, free roam only; races and drifting are unchanged):
| knob | default | what it does |
|---|---|---|
| `TUNE.stOn` Progressive steering | ON | OFF = the old on/off steering (any ◀/▶ or arrow-key press = full lock in 0.1 s) |
| `TUNE.stRampLo` Time to full lock, slow | 0.20 s | how long ◀/▶ (or a key) takes to reach full lock when slow |
| `TUNE.stRampHi` Time to full lock at 100 km/h | 0.60 s | same at 100 km/h (in between: linear). A short tap = a small correction |
| `TUNE.stK0` Steer start | 0.05 | the lock you get the instant you press |
| `TUNE.stRet` Let-go speed | 12 /s | how fast the wheel comes back when you let go (12 = 0.08 s) |
| `TUNE.stLim` Full lock vs grip limit | 1.40 | full lock asks for this × the turn the tyres can hold at this speed (was ~3× at 100 km/h) |
| `TUNE.yrOut` Stop turning on let-go | 45 /s | how fast the car stops rotating when the steering eases off (v88e: 22; before drive24 7-11 /s) |
| `TUNE.yrIn` Turn build-up | 60 /s | how fast the rotation builds when you steer (0 = old 11→7 /s, ~0.1 s lag) |
| `TUNE.stIn` / `TUNE.stOut` Steer-in / return rate | 60 / 45 /s | how fast the front wheels follow the steering (were 11 / 16 /s, ~0.09 s lag). Less lag = turns start sooner AND stop sooner, so less overshoot |
| `TUNE.stTouchDig` Touch ◀▶ act like arrow keys | ON | touch buttons feed the same on/off value as the keys (before: two ramps stacked, the steering kept building ~0.2 s after the finger lifted) |
| `TUNE.stRampV0` Slow ramp starts above | 0 km/h | the ramp is `stRampLo` up to this speed, then grows to `stRampHi` at 100 km/h |
| `TUNE.stRampRev` Counter-steer ramp | 0 s | if > 0: a press against the way the car is rotating ramps over this many seconds |
| `TUNE.stHold` / `TUNE.stRampFast` Hold = turn | 0.15 s / 0 (off) | if `stRampFast` > 0: after holding ◀/▶ this long the ramp speeds up to `stRampFast` s |
| `TUNE.asMax` Lane assist: widest angle | 0.8 rad | the lane assist (`TUNE.assist`, with no steering input) only acts within this angle of the street (since drive24b it also works on back streets) |

Grip tab, drive26 (`src/98e_drive26.js`, free roam only): the car goes where it points; it only slides when you ask for a drift.
| knob | default | what it does |
|---|---|---|
| `TUNE.gbHold` GAS+BRAKE drift: hold BRAKE | 0.6 s | GAS+BRAKE+steer only starts a drift after BRAKE has been held this long; a shorter press is a normal brake (v88f: 0 = a brake tap while gas was held drifted at once, 44-48° slide). DRIFT (button / X / Ctrl) still drifts at once |
| `TUNE.gbSteer` GAS+BRAKE drift: min steer | 0.5 | how far ◀/▶ must be in for GAS+BRAKE to become a drift |
| `TUNE.slipMax` Max slide outside drift | 0.12 rad (7°) | the most the car's travel direction may differ from where it points when not drifting (v88f: 0.6 rad = 34°) |
| `C26.kR` Rear grip lost when braking | 0.12 | braking in a turn takes this share of the rear grip away (v88f: 0.38 → up to 8° tail slide at 80 km/h; now ≤ 3.5°) |
Back to v88f: gbHold 0, slipMax 0.6, kR 0.38. Measured with `node tools/tTurn26.js <url> <out.json>` (see docs/research/REF_DRIVING.md).

Route tab (`src/41_career_quests.js` `qvAstar` / `D24_clean`, used by the next route the game plans; `98d_drive24.js` for followed cars):
| knob | default | what it does |
|---|---|---|
| `TUNE.rtTurn` Cost of a 90° turn | 110 m | a route takes a detour of up to this many metres to save one 90° turn (0 = old shortest path) |
| `TUNE.rtUturn` Cost of a U-turn | 800 m | same for a U-turn (also a U-turn over two short hops across lanes) |
| `TUNE.rtGrid` Back-street cost | ×1.35 | filler-grid streets cost this much more than real streets |
| `TUNE.rtNarrow` Narrow-street extra | 0.20 | up to +20 % on streets narrower than 24 m |
| `TUNE.rtSimp` Route smoothing | 3 m | removes lane wiggles from the route line (0 = off) |
| `TUNE.rtJog` Straighten jogs | 14 m | a route that bends 30-55° and straight back (crossing a road or leaving a bridge through an off-line junction) goes straight if it stays within this many metres (0 = off) |
| `TUNE.tcLead` Turn warning ahead | 5 s | the arrow shows the next turn (left/right + metres) this long before it… |
| `TUNE.tcMin` Turn warning at least | 90 m | …or this far before it, whichever is more. Amber when < 3 s |
| `TUNE.fvRad` Followed car: corner radius | 16 m | Hilde, Kaiser, rivals and the escort car drive round corners on this radius |
| `TUNE.fvLat` Followed car: corner grip | 4.5 m/s² | their corner speed = √(grip × radius) (16 m → 30 km/h) |
| `TUNE.fvDec` Followed car: braking | 4 m/s² | they brake this hard before a corner |
| `TUNE.fvBlink` Followed car: blinkers | ON | amber blinkers on the side of a turn < 3 s ahead |

## Life knobs (v88n lively, `src/98l_lively.js`): world life
Every part = `TUNE.life` (master) × its own knob. Master 0 = the v88i world (people and traffic spread over the whole city, nothing moving, pastel facades after a reload).
| knob | default | what it does |
|---|---|---|
| `TUNE.life` World life (master) | 1 | scales everything below (0-2) |
| `TUNE.lvPed` People near you × | 0.8 | (v88s: was 1; Alex "way too many people") 56 at 0.8, 70 at 1: pedestrians kept 30-160 m around you, 70 % placed in front (pool 110: 1.6 = all) |
| `TUNE.lvWave` People wave as you pass | ON | 2 of 3 pavement minifigs wave both arms when you pass within 16 m |
| `TUNE.lvTraf` Traffic near you | ON | traffic cars further than 300 m are moved to streets 100-260 m around you, half of them in front (OFF = v88i: 650/480 m → 180-480 m) |
| `TUNE.lvBird` Pigeons + gulls × | 1 | 6 pigeon flocks (7 birds) on the pavement ahead that scatter when you come within 22 m; 3 gull flocks circling 26-40 m up |
| `TUNE.lvFlag` Rooftop flags × | 1 | 36 flags on the nearest roofs (9-60 m up) within 380 m; next city load |
| `TUNE.lvBlimp` Blimp in the sky | ON | a 46 m LEGO blimp circling each city at 150 m |
| `TUNE.lvBoat` Boats on the Main × | 1 | 5 LEGO cruisers on the Main (Frankfurt), pushed-off hull like a glancing hit; next city load |
| `TUNE.lvFac` Bold LEGO facade colours | 1 | mixes the district facade tints toward saturated LEGO colours (Athens at 0.6 ×, the white city stays white); next page load |
| `TUNE.lvCrowd` Crowds, stalls, cafés ahead × | 0.67 | (v88s: was 1 → 4 clusters, 18 people) (v88p) 6 life clusters at 1 at street corners 20-115 m ahead: crowds of 3-6 minifigs (chat, face you, wave, cheer-hop, leap aside), market stalls, café tables. 27 people from the same pool (PED_N 110). Stalls/cafés smash on contact (collider = drawn size) |
| `TUNE.lvPark` Parked cars ahead × | 1 | (v88p) 5 traffic cars parked half on the kerb 30-130 m ahead (same mesh and box collider; smash one and it rejoins traffic) |
| `TUNE.lvPop` Roadside pop-up challenges | ON | (v88p) a ring 45-75 m ahead in your lane: RAMP JUMP, DRIFT ZONE, SMASH STREAK, CONE SLALOM. Drive through to start; timer on the objective line; at most 1; replaces the old random pop-ups |
| `TUNE.lvPopGap` Pop-up gap (s) | 28 | seconds after one ends before the next ring (×0.6 after a miss) |
| `TUNE.lvPopRw` Pop-up studs × | 1 | reward 150 studs × this, plus a brick burst |
| `TUNE.lvLod` Far people/cars: fewer pose updates | ON | (v88u perf) people > 90 m away re-pose every 3rd frame, traffic cars > 250 m every 4th (they still move every frame). OFF = every frame, as before |
| `TUNE.wbCarLod` Traffic cars: simple model far away | ON | (v88v perf, `src/98wb_world_batch.js`) traffic cars beyond `wbNear` draw a simplified copy of the same car (same colours, ~10 % of the triangles); cars outside the view are not drawn. OFF = full brick model for every car at any distance, as before |
| `TUNE.wbNear` Traffic full detail within | 70 m | full brick model + wheels + glass inside this distance |
| `TUNE.wbFar` Traffic drawn up to | 900 m | cars farther than this are not drawn |
| `TUNE.wbCity` City: simple far blocks | ON | (v88v perf) the city is cut into 320 m cells; cells farther than `wbLodD` draw as ONE simplified mesh each (buildings, trees, lamps, roads; colours from the same textures). Near cells draw the real models. Collisions are unchanged (separate boxes). OFF = every model drawn, as before. Needs a city reload to rebuild after a change of the build knobs |
| `TUNE.wbLodD` City full detail within | 190 m (v88w; was 220) | cells whose edge is closer than this keep full detail |
| `TUNE.wbLodCell` (no slider) far block detail | 3 m | size of the merge grid for the far blocks; next city load |
| `TUNE.wbMerged` / `TUNE.wbNfc` (no slider) | ON / ON | also simplify the merged street/building tiles / the always-drawn instanced props; next city load |
| `TUNE.wbFig` (no slider) hide far minifigs/markers | 260 m | mission-giver minifigs, the 1.5 m beacon stubs and ramp parts beyond this are not drawn (they are a few px tall there) |
| `TUNE.wbRingCam` (no slider) ring camera guard | 6 m | a ring (torus ≥ 3 m radius: story/quest/event/pop-up) is not drawn while the camera is within this distance of its plane and inside its radius + this; 0 = off |
| `TUNE.bwOn` City: brick courses + tiles up close | ON | (v88w, `src/98bw_bricks2x.js`) building walls (Kenney houses/shops, facade blocks, quay/bridge stone) show LEGO brick courses with staggered joints, flat tops a tile grid, glass a frame grid. Shader only: 0 extra draws/triangles |
| `TUNE.bwFade` Brick detail drawn up to | 90 m | full detail to 60 % of this, faded out at this distance |
| `TUNE.bwCourse` (no slider) brick course height | 0.48 m | one brick row; bricks are 2× as long, tiles 1.5× as wide |
| `TUNE.bwStud` City: studs on low roofs | ON | real studs on flat roofs/ledges 2-16 m above the ground (`bwStudH`/`bwStudTop`), ONE instanced mesh (1 draw); studs above the camera are skipped |
| `TUNE.bwStudD` Roof studs drawn within | 60 m | radius around the camera; cells are generated in the background (~3 ms per frame) up to this + 90 m ahead |
| `TUNE.bwStudP` / `bwStudMax` (no slider) | 1.2 m / 8000 | stud pitch (radius 0.3×, height 0.2× of it) / most studs drawn at once |
| `TUNE.bwCar` (no slider) finer traffic parts | ON | traffic cars keep mirrors, number plates and exhausts and get smooth curves (next page load); far copies are re-simplified from them |
| `TUNE.wbSuperD` Far blocks: merge 2×2 beyond | 700 m | four far city cells (2×2) draw as one mesh when all four are farther than this (fewer draw calls); 0 = off |
| `TUNE.wbTerr` (no slider) merge ground tiles | ON | the 400 m / 1000 m ground tiles and the small lot plates are merged into 800 m / 2000 m blocks at load (~25 fewer draws); next city load |
| `TUNE.bwRampSh` (no slider) ramp shadows within | 70 m | stunt-ramp parts cast shadows only this close to the camera (each was its own shadow draw); 0 = always |
| `TUNE.wbRuns` (no slider) join near street pieces | ON | neighbouring near cells of a merged street/building tile draw as one piece |
| `TUNE.wbLzD` (no slider) hide far small extras | 420 m | stud lines, crates and markers (geometry < 3 m) of story/biome zones and the hub are not drawn when all of them are farther than this |
| `TUNE.perfHud` Show FPS · worst frame · draws · tris | OFF | (v88u) one small line (bottom left, under the steer buttons) with fps, the worst frame of the last 2 s, JS ms per frame, the frame's real draw calls and triangles. For perf reports from a real PC/phone |

## Where the values live
- Beta artifact (db capability): collection `tune_versions` holds one doc `v<N>` per version: `{v, note, values, createdAt}`. Doc `tune/current` holds `{v}`.
  On load the page reads `tune/current`, then `tune_versions/v<N>`, and applies its `values`. Nothing is written on load, only on SAVE and ★ SET.
- Public game (GitHub Pages, no db): the page fetches `./tune.json`. That file is `{"v":N,"note":"…","values":{…}}`, and a missing file means defaults.
- `values` maps a knob id (e.g. `"TUNE.stAng"`, `"C26.muCity.road"`, `"RCAM.chase.b"`) to a number. Missing ids stay at their default.
- Knob table, defaults, and the drawer code: `src/99t_tune.js`.
  Defaults are the v87w values: inline literals moved into `TUNE` in `src/10_core.js`, plus the existing `C26`, `W13S`, `W14_ST` and `RCAM.chase` objects and `window.B2K_DMIN`.

## Coordinator: publish version N to the public game
1. Get the values:
   - Alex's EXPORT JSON; or
   - read the beta's db: `ArtifactData get` on `tune_versions/v<N>`, then take `values`.
2. Write `{"v":N,"note":"<note>","values":{…}}` to **`src/assets/tune.json`** and commit it, so every later build carries it.
   `tools/build.sh` copies it to `out/<ver>/tune.json`, and `tools/deploy.sh` copies `out/<ver>/tune.json` to `games/mainhattan-overdrive/tune.json` when it is present.
3. Fastest way, with no game rebuild: commit the same file straight to `alex/brave-carson-rbpmlk:games/mainhattan-overdrive/tune.json`.
   The game reads it on the next page load. `verify_live.sh` still matches, because it compares only index.html and km.js. Also do step 2 so the next deploy doesn't revert it.
4. To go back to the defaults, publish `{"v":0,"note":"defaults","values":{}}`.

## Beta artifact capabilities
Declare `capabilities: {db:{}, user:{}}`. db is the store, and user is recommended by the db capability.
Everyone who can open the beta can read the versions. Contributors and up can save and ★ SET; viewers get "save failed: not_granted".
