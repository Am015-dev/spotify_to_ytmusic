# models-6 handoff (build-10, integrator, 2026-10-13). Branch alex/od-models.
Coordinator session_017iH3DB4VyxwKSdMwsco4Ut, reviewer session_01Y6FYerWwxv43FuKUcaUT4v. Pipeline: docs/HANDOFF_models4.md + models5.md.

## State
- LIVE: v90i (brave-carson 27ec0df; live changelog says 10 Oct, src says 13 Oct: only diff vs out/v90i).
- v90j on alex/od-models 445cad61 (out/v90j built, NOT committed yet; no OD_CHANGELOG entry yet: add after reviewer PASS). Contents:
  - veh-2's 20 rides (od-mdl-veh 3cac11f) in src/MODELS. 7638 Tow Truck: kept veh-2's fuller build (doors, windscreen, mudguards) over rescue-1's.
    Audit: gap -0.006 m, 0 errs on all 20 (qa/v90j_aud, sheet qa/rides.jpg). 4206 Recycling Truck has no bins (LDraw file has none).
  - land-3 props (od-mdl-land db39943): fra cone/barrier/clight/sign/rock, ath CE_pine/olive/cypress/rock. Shots qa/props.jpg (barrier edge-on, CE_rock no view: both known from land-3).
  - Alex direct asks: src/98gz_garage_zoom.js (new, ORDER before 99_api.js): − ⤢ + zoom on every garage tab (cam.zoom on top of R2_frame), pinch outside BUILD,
    wheel, keys + − 0, 💧 PICK in ⋯ MORE (key I), LOADING sign while a tapped ride's chunk loads. Checklist (99c_checklist.js CK2): answers per device
    (key "<ver>/<id>|ph|pc", old keys count for both), dev:'phone'|'pc' items, AREA chips, folded pin has ✅ ❌ › + item text, 📍 GO jumps (GO map).
  - Coordinator asks: 98ba_build_anim.js build-up on wall clock, 0.5–0.9 s (was frame-time capped 0.1 s/frame → many s of bare chassis); 📍 GO.
  - tools/tPlay.js: no stuck time before the first move / story card (reviewer A); SCALE reports pedNear/pedMax (reviewer B).
- tPlay v90j (run 1, before GO/BA): only shared fails vs v90i/v90g. Athens 0 % stuck, close-up peds 1.71–1.86 m (reviewer B answer).
  Memory "leak" fails = the garage trip's one-off +124 geoms (same total as v90i), landing in the fitted 2nd half. Final run: qa/v90j_tp (in progress at hand-off).
- WAITING: facing-1 (driver backwards, alex/od-facing) commit; coordinator says ship v90j if facing is not ready, but no new rides that fail its audit.

## Next
1. tPlay done → GRID (docs/shots/v90j/GRID.jpg: 20 rides from qa/v90j_aud, props qa/v90j_props*, GO jumps qa/go, garage zoom qa/gz, fra/ath drive from qa/v90j_tp) → REVIEW.
2. PASS → OD_CHANGELOG v90j entry → rebuild → git add -f out/v90j → push → READY to coordinator.
3. v90k: veh-3's 21 rides (od-mdl-veh ab4de71, list in HANDOFF_models5.md), track-2 builder slice (alex/od-track), facing-1 if late; roads-1 / home-1 when they PASS.

## Test scripts (qa/, git-excluded; copy if needed)
qa/tGZ.js (garage zoom/pick/checklist), qa/tPin.js (pin fold + one-tap), qa/tGo.js (📍 GO, pass args with ev(f,a)!), qa/tRideT.js (tap → ride timing; needs local_dbg for __g9ev).
Headless frames take seconds: never judge timing from wall clock while tPlay runs; never run two browsers during tPlay (first run timed out at 90 min).
