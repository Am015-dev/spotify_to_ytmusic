# HANDOFF dev2 (branch alex/od-dev1) — item 1 BUILDER TRACKS

## Slice 1 done (tests first)
- 3 acceptance tests in BX_TESTS (src/98b2_builder2.js, before 'bx-elev'): `bx-t-cliff` (lap, ≥15 m, air ≥1.5 s, banked turn driven),
  `bx-t-city` (lap, ≥15 m, bridge over+under via bxCross, boat ≥2 s), `bx-t-canyon` (lap, ≥15 m, both SPLIT branches, off-road ≥2 s).
  Each loads `BX_DEMOS['CLIFF RUN'|'TWO-LEVEL CITY'|'CANYON SPLIT'].log`; they FAIL now because BX_DEMOS is still `{}` (line ~377).
- Checklist items ver 'bxT' + GO entries in src/99c_checklist.js (GO -> BX_test(id)).
- Decision: treated as content on the existing builder (Alex asked himself), not a new >1 h feature, so no spec/yes-no round.

## Next slice
1. Fill BX_DEMOS with 3 closed-loop logs built with `bxCh(world,[i,j,l,r],[pieces…])` (grid 40×40 cells of 8 m, l = 2 m levels;
   pieces: sf st cl cr up dn su sd kk bl br wl wr lp fk bo cp). Worlds: mountain (mesa ~30 m at 30,25), city (+lake 70,-75), canyon.
   A lap needs back over START with every CP seen. Verify closure with `__bx.route()` end ≈ start.
2. Race menu entry: list BX_DEMOS in the Race menu (find menu with tools/find.sh menuTrack) -> BX_open + BX_load + BX_driveStart.
3. Run tools/bx/tAccept.js style drive per test (≤3 min total), ONE grid of low chase-cam shots, LOOK (flat = redo).

## Track status (paused for the sink bug, 2026-10-13)
- Tracks hidden (BX_DEMOS_SHOW=false). bxT checks now = feature line + BX_fun() (drivable/fun lines), commit 1278748; they FAIL (grades 37-75 %, no laps).
- Next: add LONG RAMP pieces (4 m over 24 m, ≤25 %), rebuild the 3 tracks with them (no su/sd), wide banks, no dead ends; fix the boat steering (boat holds heading); CP gate post blocks the chase cam on CLIFF RUN.
- Tools: tools/bx/tTracks.js (GO + real touch drive, SECS env), tools/bx/tStart.js (start heading check). Planner scripts were in the scratchpad (cursor closure/overlap/trench) — rewrite if needed.

## SINK bug (coordinator 2026-10-13, Alex shot shots/alex_bug_sink2_onfoot.jpg on alex/overdrive-devkit) — NOT FIXED, not yet reproduced
Tracks are now trk-1's (alex/od-trk). Only this bug is open for dev-2's successor.
- Alex's car = white 911-style ride, most likely `t_turbo` ("Turbo 74 (75895)", LDraw 'porsche', src/98ld_import.js). In the shot the nose and rear wheel are buried ~0.3 m and the car is pitched nose-down. The minifig is also about as tall as the car, which is item 2 (vehicle scale).
- Default car (tools/tSink.js, story start, ?fast=1 + __tick, real keys, F exit): tyre gaps in the car 0.03 ×4; 1.5 s on foot [-0.013,-0.04,0.025,-0.04];
  BUT OF_gap body corners min -0.253 / max -0.139 with pitch 2.24° after OF_settle → OF_settle pitches the body and the box bottom sits 14–25 cm under the road.
  So settle drives the TYRES to the road, not the BODY; for rides whose wheels (userData.r) sit higher than the body bottom (LDraw cars) the body sinks. Check this first with t_turbo.
- Equipping t_turbo:
  - tools/tSink.js: `CAR=<id>` writes mho_gar@0..9, but the story start (#hcStory → #slotList .go) makes a fresh save, so the default car is still used. Fix: GAR_select(id) after reaching roam, then rebuild the roam car (find where roam takes CR_LOAD → shipMesh; setupRace in 30_race.js), OR start through the Garage UI.
  - `?test=fra&car=t_turbo` DOES equip it (qa_dev2/sink_t_turbo.png: the white car on the main road), but there is no __tick there (&fast=1 breaks the boot), and real time headless reaches only ~5 km/h after 8 s of gas. KeyF did not exit at 5 km/h. Try exiting at standstill (KeyF or the 🚪 EXIT button); the sink may not need speed. Then read pitch/roll + tyre gaps + OF_gap.
  - Probe: qa_dev2/tSinkQ.js <url> <out> <car ids> (prints car/foot tyre gaps, body min/max, pitch/roll; one shot per car). Truck id: t_truck (src/98bc_bigcars.js).
- GO: checklist v90k/park-sit already exists (98of + 99c). It must use the real-input exit, and its pass line should be "4 tyre gaps ≤ 0.05 m AND body bottom ≥ -0.02 m AND |pitch|,|roll| ≤ 1°". It must FAIL on live v90m-beta.1 and PASS after the fix.
