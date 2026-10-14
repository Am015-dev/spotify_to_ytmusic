# HANDOFF trk-5 (race-track DESIGN lane), 2026-10-14

Branch: `alex/od-int2` (trunk). Code: `src/98fs_flagship.js` (new, in ORDER right after `98b2_builder2.js`), the `gp` world plus small hooks in `src/98b2_builder2.js`, and the `trk5` items in `src/99c_checklist.js`.
Research: `docs/TRACKS_2K_BEATS.md` (beat-by-beat 2K laps and the beat kit) and `docs/shots/trk5/ref2k_*.jpg` (6 reference frames).

## Alex (beta.59)
"Trackbuilder is way boring, way unfair and not fun ... ALL TRACKS ARE BORING ... NOT BEAUTIFUL DESIGN"

## What was built: GRAND TOUR (flagship, hand-designed)
- **The lap:** 152 builder pieces, 2.0 km. It is the first track in the race menu and in ★ DEMO TRACKS.
  - Clean AI lap: 51 s. Average-player bot lap: 54-66 s. Races are 2 laps.
- **Flag:** OFF by default (coordinator STOP, 2026-10-14). `?fs=1` turns it on; run the tests and shots with `?fs=1` added to the page URL.
  - The suite passed with the flag ON. The trk4 bx suite and TAG=life1,xf1 were interrupted by the STOP, so neither has run on the flag-OFF build yet.
  - Its set pieces build only when the loaded log is the GRAND TOUR: world `gp`, 152 pieces, starting with `sf` (`FS_is`).
- **Beats along the lap** (`FS_BEATS` = [piece index, type]):
  1. STADIUM: gantry, two grandstands, a brick wall, studs.
  2. TOWN hairpin round the windmill: LEGO houses, kicker, crowd, wall, studs.
  3. Climb through the cliff cut, then the CANYON gate.
  4. BOOST into the LOOP.
  5. Rim run: crowd, wall, studs.
  6. High bridge over the gorge, then the switchback and the CANYON DROP.
  7. FARM gate, then shortcut 1: through the BARN plus a kicker over the RIVER. The main road bridges the river by the lake.
  8. LAGOON gate, then shortcut 2: a 48 m BOAT SPLASH through 2 buoy arches. The main road goes round the cove.
  9. Beach run: kicker, crate wall, BEACH PARTY stand, brick wall, studs, back into the stadium.
- **Set pieces** (`FS_build`, all from LEGO-style parts):
  - grandstands with minifig crowds that bounce;
  - breakable walls: they burst into bricks, cost no speed and fill 1/3 of the boost meter;
  - 112 gold studs, counted on the HUD (● n), each topping up the boost meter;
  - chevron boards and low red/white barriers on the outside of every bend (straights stay open);
  - giant ground arrows before kickers;
  - biome gates;
  - landmarks: windmill, lighthouse, barn and silo, mesas, a blue loop;
  - per-biome roadside dressing (`FS_biomeDress`): town houses, canyon hoodoos and cacti, farm fences, hay and orchards, beach umbrellas and palms;
  - brick clouds, 3 hot-air balloons;
  - 9 real LDraw sets: houses, a hamburger stand, a cafe, boats.
- **Ground colours per biome** (`FS_paint`): striped canyon cliffs, farm crop strips, beach sand.

## Fairness (what the noisy-bot races found and fixed)
- **Rubber-banding:** on this track rivals never speed up when you lead; a rival far ahead eases off by at most 15 % (`race.fair`). Rival cruise speeds are `FS_RIVAL`.
- **Respawn:** back on the road where you were about 1.2 s earlier, at 60 % of that speed. A second respawn within 6 s goes 25 m further along the main road. Before this, an empty history sent the car to the START, which counted as a free lap.
- **No-progress respawn:** 2 s outside a race; in a race, 2.5 s without 3 m of course progress. A car pinned on a wall keeps its speed, so the old rule missed it.
  - Bug found by the shot pass: the first version never armed for a driver who never lifts off the gas. Touch gas is on by default, so real players would have been respawned every 2.5 s. `fs-bot` now also races a clean full-gas driver.
- **LOOP RIDE:** the loop holds the car on its centre line at ≥ 18 m/s, like 2K. A car arriving at the loop's mouth from the side is captured into it; before this, the loop's side walls trapped corner-cutters.
- **Removed traps:**
  - two kickers that landed in the next turn (stadium, gorge);
  - a boost pad in front of a tight R20 bend;
  - a barn wall that sat across the main road where the split lanes still overlap.
- **Course walk across water gaps** (`BX_gapNext`, 98b2): the walk now continues at the piece ahead and in line with the exit. Before, the AI and the race path jumped sideways onto the other lane at a splash.

## Tests (checklist ver `trk5`, 📍 GO = BX_test; all PASS)
`node tools/fs/tFs.js <built page url> [ids]` (about 70 s, plus the boot).

| test | checks |
|---|---|
| `fs-beats` | ≥ 8 beat types per lap (17 on the shortcuts, 14 on the main road); lap 45-95 s; all 6 walls smashed; ≥ 20 studs |
| `fs-gap` | the longest stretch without a beat on all 4 route combinations is 2.9 s (limit 6 s) |
| `fs-biomes` | ≥ 3 zones over 10 % of the lap: town 38 %, canyon 28 %, farm 24 %, lagoon 9 % |
| `fs-bot` | 6 noisy-bot races: mean place 2.0, ≥ 4 podiums, 0 respawns; a clean driver wins |
| `fs-ai` | both routes: lap done, 0 respawns, stuck max 0 s |
| `fs-resp` | back on the road in 0.2 s, 0 places lost |
| `fs-btn` | 7 race buttons |
| `fs-life` | walls, studs, stands, chevrons and LEGO sets present |

- **Shots:** `node tools/fs/tShots.js <url> <outdir>` takes 9 frames along the lap in ONE session. The car really drives there in fast time. `ONE=1` = dry run (one shot); `FEW=1` = 4 debug shots.
- **Grid:** `qa_trk5/grid_trk5.jpg` (row 1 = 3 2K references, then the 3×3 lap).
- **Planner:** `tools/bx/plan.js` works again (BX_KJ/BX_BK were missing from its sliced eval).

## Open / next (step 5 of the brief)
1. Re-theme CLIFF RUN, CANYON SPLIT, LAGOON SPLASH and TWO-LEVEL CITY with the same beat kit. `FS_build` is GRAND-TOUR-only; generalise it so `BX_DEMOS[k].beats` drives it.
2. In the builder, offer beat pieces (set-piece modules) instead of plain decks: smash wall, stud line, grandstand, gate, barn, buoy arches.
3. Rivals still race the dry main road only (no shortcuts, no boat).
4. The farm reads weakest in the shots (grey road, few fields in view). Ideas: fields closer to the road, sunflowers.
5. Human feel is untested here: there is no iPhone or WebKit in the cloud. Ask Alex for one race and a 0-10 score.
