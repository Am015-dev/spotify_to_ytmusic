# build25 handoff (builder ease + map legend filters + bigger cars), branch alex/od-build25

## Base
- Branched from origin/alex/od-r3 7e1b8c7 (= live v88e cc9b68d; `tools/verify_live.sh` LIVE_MATCH cc9b68d).
- Plan: ship (A) builder layers/views + (C) map filters first; (B) bigger cars as a second version (brief allows it).

## New modules (in src/ORDER after 99x_test_mode.js, because 99x's markKnown wrapper skips inner wrappers)
- `src/98c_map_filters.js` (MF_*): legend chips on the big map (ALL, GARAGES, RACES, MISSIONS, SIDE QUESTS, EVENTS, COLLECTIBLES, TRAVEL),
  filter big map + minimap + tap targets (markKnown gate while drawing / resolving a map tap), OG collectibles layer; localStorage `mho_mapf`.
  Also caps the AREA COMPLETION panel height so it no longer covers the map's ＋ zoom button.
- `src/98b_builder_layers.js` (B25_*): LAYER mode (default on, `mho_b25`), ▲▼ jump between resting heights, dims below / ghosts above,
  stud grid at the layer, tap aims at the layer plane (centred footprint), red + reason when unsupported, mirror twin on the same layer;
  views TOP / SIDE / 3D; camera orbits the build centre; R2 framing stops left of the layer column. `window.__b25` test hooks.

## Research
- `docs/research/BUILDER_2K.md` (PDF steps, 2K garage, LEGO big sets with sources).

## Tests (qa25/)
- `lib.js` real-touch harness (VW/VH/IFRAME/DESK env), `roam.js` enter roam + skip intro, `map1.js` map chips, `pdfbuild.js` PDF steps
  by real taps (LAYERS=1 = new layer workflow), `b25func.js` builder functions, `b25shot.js` views.
- Live baseline for before/after: worktree /tmp/claude-0/wt_live (od-r3) served on :8767.

## Status (2026-10-08 14:35 UTC, commit ceebd59 pushed)
- Coordinator: ship (A) + (C) as the first version; (B) bigger cars as a second version from a fresh worker (size map below).
- (C) map filters: DONE by real taps (qa25/map1.js): races off removes 20 race icons, garages-only works, ALL toggles, choice kept after reload, chips 44 px / 12 px text, 2 rows on phone.
  Still to show: minimap with filters (a fresh save auto-starts the Hot Drop mission, which hides minimap marks; end or finish it first) and a tap on a hidden icon not setting a waypoint.
- (A) layers/views: built. Shots qa25/b25s/ (3D dim/ghost, TOP, SIDE) look right.
  Fixed after the first test round: layer resets to the new chassis deck (was 6 instead of 1), REDO no longer under the TEST ⚙ (99x puts ⚙ 52 px left of SAVE), cutscene SKIP clear of ⚙.
- IMPORTANT for tests: without `?fast=1` swiftshader runs the garage at ~0.15–1 fps, a touch takes 7.5 s from down to up and the
  builder treats it as a long press (nothing happens). Always test the builder with `local_dbg.html?fast=1`.
- Running at handoff (background, sequential): qa25/b25func.js → qa25/func.log; pdfbuild.js on live (:8767 worktree /tmp/claude-0/wt_live) → qa25/pdf_before.log;
  LAYERS=1 pdfbuild.js on the new build → qa25/pdf_after.log. If the container was reclaimed, rerun them (setup: ./setup.sh, then tools/build.sh b25a --local,
  and for the live baseline `git worktree add /tmp/claude-0/wt_live origin/alex/od-r3 && cd there && tools/build.sh live --local && python3 -m http.server 8767`).
- Pain points found so far (step 2 of the brief): the part you need is often scrolled out of the 5-tile strip (swipe needed; S1/S8/S12 of the PDF steps);
  old pick needs the ray to hit a mesh, so cells next to the cockpit return nothing ("No room"); a 2-wide part is offset from the finger (x = cell − floor((w−1)/2));
  no way to place at a chosen height except STEP ▲▼ one plate at a time; the car framed off-centre; ⚙ covering REDO.

## Next steps (first version = A + C)
1. Read qa25/func.log (all PASS needed) and the two PDF logs; put the before → after numbers (fails, taps) in the review message.
2. Gate shots at 852×393 (?fast=1 only for builder input tests; shots for review on the normal page): layer selector, TOP/SIDE/3D, the car built from the PDF steps,
   map filters on/off, minimap filtered, start screen; plus a PC 1280×720 run (DESK=1 VW=1280 VH=720) and an iframe run (IFRAME=1), 0 console errors. LOOK at every shot.
3. Send the reviewer (session_01Y6FYerWwxv43FuKUcaUT4v) "REVIEW alex/od-build25 <commit> <shots>" + tyre gap (unchanged code path: CR_carPose; measure once with t4/g11drive.js).
4. After PASS: rebuild on CURRENT live HEAD (fetch alex/brave-carson-rbpmlk, check tools/verify_live.sh; merge any newer od-* src that shipped, e.g. drive24),
   prepend OD_CHANGELOG (next free letter after v88e), tools/build.sh <ver>, git add -f out/<ver> (+ tune.json, music/*.mp3 from live), push,
   send the coordinator "DEPLOY alex/od-build25 <commit> out/<ver> <msg>" + 3 bullets for Alex + shot paths. Never run deploy.sh.
## (B) size map (from the code survey)
- Grid/budget: 92:5 consts; GB_plate 8×12 (92:80); blueprint base -4..3 × -6..5 (94:3); hull scan skips cockpit (94:4); bounds in 92 GB_fit, 98t move/paste, 98b.
- Player collision: SC_hit 3 circles (SC_K.off 1.35, SC_K.rad 1.15, 96:34-36); OB_HW/OB_HL 1.25/2.45 vs traffic (90:25); lego NPC 93:376 hard-coded player half-size; fixed 2.2/2.4 radii at 71:49, 85:294/416/275.
- Camera: RCAM (71:261) × SC_K.cam (96:41); CR_minBack (10:92); nothing scales with size.
- Tyres: CR_carPose (93:424-431) reads real wheel meshes → size-independent; CR_bodyPts bbox (93:402-407); CR_PS.b = body bbox (reuse for size).
- Scale: shipMesh SHIP_K .6 (20:621), SC_ship x .75 squeeze (96:30).
- Templates: GAR_SETS (98_garage_driver.js:162-170), G9_T (98y:51-65) [t,x,z,r,c,y]; GAR_frm picks the form.
- Garage limits: dist 7..26 (94:49/51), platform PW 14 / PL 23 (98s:21).
