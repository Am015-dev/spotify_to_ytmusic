# HANDOFF on foot (v89a, P1 of docs/ON_FOOT_PLAN.md on alex/od-onfoot)

Branch `alex/od-p1` (base = v88x src, live). Module `src/98of_onfoot.js` (prefix `OF_`, in src/ORDER after `98bw_bricks2x.js`).
Other touches: one line at the end of `src/99_api.js` (`__mho.foot` getter), the v89a `OD_CHANGELOG` entry (10_core.js) and 3 `OD_CHECKLIST` items (99c_checklist.js).

## What it does
- `RO.foot`: `'car' | 'exit' | 'walk' | 'enter'`. Outermost `roamStep` / `roamCam` wrappers: on foot only `OF_step` / `OF_cam` run
  (plus `hubTrafficStep`, `studFXStep`, `roamHud`, the same minimal set as the wreck path). `RO.x/z/y/h` follow the walker so culling,
  peds, minimap and traffic braking follow him; the parked car pose is `OF.car` and `pl.mesh` is pinned there every frame.
- EXIT: `#tB` becomes `🚪 EXIT` (class `ofDoor`) when |v| < 2.2 m/s and no gas/brake held for 0.5 s (or in PARK mode), on the ground, no
  sprint/cutscene/menu, not a boat. A capture-phase listener on `#tB` claims the press (no brake, no park double-tap). PC: F/E when no M1 weapon is out.
- Driver hidden: `GB_geo` is wrapped to store the brick types on the merged geometry (`userData.bt`); `OF_drv` swaps in a clone with the
  `drv*` triangles collapsed, and restores the original on ENTER.
- Minifig: `GAR_fig(GB_figGet())` standing pose split into body / 2 legs / 2 arms (5 meshes, `GB_MAT`), scaled to exactly 1.80 m, `qaFig`.
- Walk: floating stick `#ofZone` (left 40 %, 140 px ring, 10 % dead zone, squared curve, > 85 % = run), RUN = `#tG`, JUMP = `#tN`;
  walk 1.6 m/s, run 5 m/s, accel 20 m/s², turn 720°/s, jump 0.9 m. Collisions: `roamHit` + `bldPush` (r 0.35), cars as oriented boxes
  1.02 × 2.35 half-size (own parked, static bodies, all traffic), props from `HUB.pgrid` (r = clamp(0.45·def.r, .15, 1.1) + .35), step-up ≤ 0.45 m, no river.
- Camera: 4.5 m back, 2.2 m up, yaw follows the walking direction (not when walking towards the camera), pulled in along the ray (`roamHit`).
- ENTER (`OF.near` within 1.7 m of a car box): own car = restore. Another car = body swap: the current body's children move into a static
  `THREE.Group` at its world pose (`OF.vs`), a kerb-parked traffic car (`c.pk`) is lifted into `ud.m` as 3 one-instance InstancedMeshes
  (body/wheels/glass, same geometry, material and tint), its pool slot is retired (`c.dead=1e9`), the car is moved ≤ 1.6 m off the kerb into
  the lane. `OF_lift` keeps the borrowed body's lowest tyre point on the road every frame (CR_carPose only grounds real wheel meshes).
  `LV_parkStep` is paused on foot so parked cars stay put. Borrowed static bodies > 300 m away are dropped; your own car always stays.
- `exitRoam` / `roamWarp` put you back in the car; `enterRoam` resets all OF state.

## Test
`node tools/tFoot.js http://127.0.0.1:8766/local_dbg.html qa_foot` (env `FAST=1`, `MODE=phone,desk,iframe`, `CITIES=fra,ath`).
Real CDP touch / real keys only: drive 60 m on the GPS route, brake, tap 🚪 EXIT, walk ≥ 30 m with the stick (keys on desk) along the street,
go to the nearest parked car (Athens has none: g-streets don't park; then your own car), tap 🚪 ENTER, drive 100 m.
Checks: EXIT offered, minifig 1.75–1.85 m, peds, ≤ 5 controls on foot, no HUD over controls, text ≥ 12 px, walked ≥ 30 m, ENTER offered,
drove 100 m, tyre gap ≤ 0.05 m (min over body vertices of y − ground under that vertex), stuck ≤ 3 %, camera in building ≤ 2 %, 0 console errors.
Shots `qa_foot/<mode>_<city>_{1_drive_exitbtn,2_standing,3_walking,4_enter_prompt,5_reentered,6_driving_again}.jpg`.

## Known limits (P1)
- Athens has no kerb-parked traffic (all g-streets), and the static prop cars (`CE_car*`) are not enterable yet: in Athens you re-enter your own car.
- A borrowed traffic car has no driver figure (traffic geometry has none).
- On foot, events/missions (`chStep`) are paused; the M1 weapon does not fire on foot.
- Test variance: traffic is random; a stopped traffic car in the walker's path costs ~0.3 s of "stuck" per encounter.

## Status (2026-10-09)
- Reviewer PASS (QUICK, f02c034). DEPLOY sent to the coordinator: `alex/od-p1` a773a592, `out/v89a` (built on live v88y; od-garage12 merged; od-quick not shipped/merged).
- Review fixes: the door button (EXIT/ENTER) is placed left of BOOST/JUMP (`OF_doorPlace`, gaps 14/20 px at 852×393); own-car collider from measured extents (`OF_ext`);
  foot camera rises 1.6 m over a parked car behind the fig instead of pulling in (`OF.camU`).
- Last results: qa_foot_q (phone+desk × fra+ath, 65/65 PASS). Earlier desk_ath stuck 7.1 / 9.3 % (keys pinned on one Athens building) dropped to 0.9 % after the camera change; watch it.

## P2 next steps (car-jacking, +1★; plan §4 P2)
- ENTER near a MOVING/stopped traffic car (`OF_cars` kind 'traf'): stop it (`c.hitT`, `c.cv=0`), driver minifig hops out (`GAR_fig` with `GAR_riv` colours), "HEY!" via `feed()`, runs off; then reuse the body swap in `OF_finishEnter` (k:'park' path).
- Athens: make `CE_car*` prop cars enterable (instanced props in `HUB.pgrid`, `p.im`): same one-instance body lift + `OF_lift`; mark the prop dead.
- Borrowed cars: add a seated driver (GAR_fig sit pose) to the lifted body.
- Stars: `WNT_` module (P4) owns the wanted level; P2 only increments a counter and shows ★ in the HUD line.
- Keep the outermost-wrapper rule: on foot nothing car-only runs; add new per-frame work inside `OF_step`.
