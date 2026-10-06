# src/ map: one line per module (read this + only your own modules)

`tools/build.sh <ver>` concatenates the files in `src/ORDER` into `out/<ver>/overdrive.html` (+ `km.js` from `src/assets/`).
It is plain `cat`: a module is a contiguous run of the page. **Order = execution order.** Function declarations are hoisted;
`const`/`let` are not, so a new module that uses a `const` from a later file must go after it in ORDER.
Big single-line data files (50, 52, 02) are never read whole: `grep -o` a key instead.

| module | KB | what is in it · key globals / functions | owner |
|---|---|---|---|
| `00_page.html` | 115 | `<title>`, all CSS (HUD, menus, touch controls, phone media queries), all HTML markup (`#hud #roam #menu #pause #settings #cmap #gbx`…) | UI / QA |
| `02_data_json.html` | 111 | DATA: importmap (three r164 CDN), `#rf-data` (Frankfurt streets/quays/lm/spots JSON), `#ath-data` (Athens 100 KB line), `<script src="km.js">`, opening `<script type="module">` | world (art) |
| `10_core.js` | 101 | **`OD_CHANGELOG` (top; every deploy prepends an entry)**, CR_ prelude (`CR_trackW CR_smashHit CR_tumble CR_rampLaunch CR_TYRE_Y`), `ALL_OPEN=true`, imports, utils (`$ V3 clamp store fmt`), data tables (`CLASSES TEAMS PERKS PILOTS` circuits, light/mood presets), garage helpers (`gbOpen kitParts liveryPat`), `SET`, renderer + post (`resize applyMood dresStep` bloom/grade), sky, textures (`roadTex wallTex facadeTex…`), track data (`frameAt`) | core (infra) |
| `20_race_world.js` | 106 | race circuits: neon Frankfurt world (`buildRoad buildCity buildLandmarks loadTrack disposeWorld applyQuality`), Athens race world (`athPrep ath*Tex athStands` hazards `AHZ`), ships (`HULL POD LIVERY WHEEL`, transformation) | race / art |
| `30_race.js` | 111 | race traffic (`setupTraffic stepTraffic drawTraffic`), props/Baustelle, particles (`emit burst puff SPARK pools debris`), audio `AU`, race state + **race physics** (`stepSim physPlayer ctlPlayer`, weapons, damage), race flow (`setupRace award` rewards), AI rivals (`nemesis radio rivalHit`), per-frame visuals | driving / AI races |
| `40_hud_input_menu.js` | 31 | race HUD (`updHud buildMap drawMap flashHud`), input (keys `K`, tilt, touch steer pad `steerDraw`, `parkSet`), menu/pause/settings (`togglePause openSettings buildSettings teamCard`) | UI |
| `41_career_quests.js` | 98 | career = free roam: XP/level (`carStat addXP`), `RO` (roam state object), side quests (`QUESTS qStart qStep`), quests v2 road graph + GPS (`qvGraph qvPath qvLayout`), map PIN (`PIN_*`), objective tracker, `?` encounters, story questlines | missions |
| `50_kenney_data.js` | 79 | DATA: `KM_IDX` (model index), `KM_TEX` (atlas PNGs), `KM_BIN=window.__KM_BIN` (blob lives in `assets/km.js`) | — (don't edit) |
| `51_city_net.js` | 41 | Kenney loader (`kmGeo kmKit kmMat`), real Frankfurt layout `CITYCFG RF WP`, Athens street net decode, the Main (`riverAt inRiver rivSide`), decks/bridges `BRIDGES deckAt`, OB road repair (`OB_*`), filler grid, junctions `JUNC` | world (art) |
| `52_terrain_data.js` | 118 | DATA: `TR_DATA` (DEM rasters, one line) | — (don't edit) |
| `53_terrain_roads.js` | 53 | terrain `TR_*` (`TR_real TR_G`), hills/Taunus/Acropolis, road shelves `athRoadProfile shelfY`, Autobahn `AB_*`, garage lots, **`HUB`**, colliders (`groundAt roofAt roamHit bHit hubGrid`), road helpers `rfFree fillAt hubRoads`, facade/sign textures | world (art) + collision (driving) |
| `60_city_build.js` | 200 | build the free-roam map: ground `gndBuild gndVert`, water/quays/slipways/decks, streets, biomes `BIOMES`, landmarks `lmBuildAll`, skyline/outer towns, Athens buildings + landmarks (`athLandmarksBuild athUnitGeos`), **`buildHub`**, lazy biome content `lz*`, studs, props | world (art) |
| `70_roam_world.js` | 81 | culling `hubCull*`, minimap (`miniPaint miniDraw`), districts, hub traffic (`hubTrafficStep`), `hubFrame`, street snap/ramps/checkpoints (`rfSnap rfRamps`), golden bricks, **`enterRoam`/`buildRoam`**, events `chNext chStart`, big map icons, sprints, tutorial `TUT` | roam (driving) / UI |
| `71_roam_drive.js` | 65 | **free-roam driving**: `roamStep` (player physics), wall slide `roamGlance roamBounce`, damage/wreck, `exitRoam cycleVehicle roamWarp`, chapters `CHAPTERS chapter storyCheck`, roam cards/prompts, `chStep chEnd`, `roamPose roamCam` (camera), combo/packs, `roamHud` | driving (cars) |
| `72_roam_map_loop_boot.js` | 51 | big map, **main loop `frame(now)`** (dt, sim, `composer.render`), loading screen `LD ldSet`, career map, `toMenu`, **`boot()`** | core (infra) |
| `80_story_m1.js` | 89 | M1 Frankfurt chapter 1 (`M1_*`: scenes, goons, items, duel, missions), BA touch CSS, BF bug fixes (`BF_*`), LK looks + phone perf (`LK_*`) | missions |
| `81_story_ath_m2_m3.js` | 101 | ATC Athens campaign (`ATC_*`), M2 Hafenbande (`M2_*`), M3 Kaisers Schatten + finale (`M3_*`) | missions |
| `85_audio_feel_sp_otg.js` | 107 | AU adaptive music/SFX (`AU_*`), FL feel: vehicle auto-switch, smash→boost, day/night (`FL_*`), SP split-screen (`SP_*`), OG on-the-go events (`OG_*`) | audio / fx |
| `90_fixes_cv_ju.js` | 81 | OB burst-cause log (`OB_*`), OC night lights/Acropolis scale/heights (`OC_*`), CV traffic signals + city variety (`CV_*`), JU juice (`JU_*`) | world / fx |
| `92_garage_builder.js` | 18 | GB brick builder core: pieces `GB_PC GB_piece GB_brickGeo`, minifig `GB_FIG GB_figGeo`, `GB_geo GB_attach GB_mods`, snapping, mirror, undo | garage |
| `93_cars_lego.js` | 63 | **LEGO cars** (`CR_*`): part geometry (`CR_bb CR_side CR_wheel CR_more`), Speed-Champions presets, loadouts, rival/boss cars, LEGO traffic (instanced, suspension), CAR5 HUD line, sit-on-4-tyres, **steering `CR_yaw`**, wheels on ground | cars |
| `94_garage_ui.js` | 18 | garage builder scene + pointer picking + UI (`#gbx`), garage blocked during events, cutscene portrait | garage |
| `95_drive_flow.js` | 11 | DR probe `window.__dr` + driving flow: fewer breakables/traffic, smash keeps speed, solid blocks, compact touch mission card (`DR_*`) | driving |
| `96_scale_qa.js` | 33 | SC/SC2 real scale (`SC_*`: 1.8 m humans, road setback), QA human-play fixes (`QA_*`), QA7 rotation-proof touch, QA8 no giants/fewer rings, V85 tweaks | QA |
| `97_art.js` | 27 | ART steps (`ART_* ART4_ ART6_ ART7_`): LEGO-2K sky/look, brick trees, boost FX + HUD skin, cars ON road / boats IN water, road surfaces, contact patches, hill grass | art |
| `98_garage_driver.js` | 21 | GAR1 driver minifig at real proportions (`GAR_*`), 8 ready-made drivers (garage DRIVER tab), `window.__gar` | garage |
| `99_api.js` | 41 | test API **`window.__mho={…}`** (state, roamSim, warp, gnd, …), late CR_ hooks (`_crD _cr25F`), closing `</script>` | QA (+ cars hooks) |
| `assets/km.js` | 1916 | `window.__KM_BIN='…'` Kenney model blob (deployed next to the page) | — |
| `assets/shell_head.html` | 0.5 | live `index.html` head up to `<body>` (only for `out/<ver>/index.html` = exactly what deploy.sh writes) | — |

Owners: cars = alex/od-cars session · art/world = alex/od-art session · garage = garage worker · QA/UI = alex/od-qa · core/infra/build = infra worker.
Where to put NEW code: in the module of your area (append near the related code), or a new file `src/NN_<area>_<what>.js` listed in ORDER right before `99_api.js`
(still before `window.__mho`, the old "insert before window.__mho" convention). Wrap existing functions as before (`const _f=f; f=(...a)=>{…}` for `let`/function).
