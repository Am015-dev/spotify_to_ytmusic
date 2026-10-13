# HANDOFF: home-1 → next worker (v90k Home + nitro gating), 2026-10-13

Branch `alex/od-home` (from alex/od-models, live v90i). Draft PR #93. Alex's ask: "the nitro/boost should be on sports cars only and not all cars
unless you modify the car in home. I think we should have a save point Home with a garage to store cars".

## What is built (src/98hm_home.js, ORDER after 98gf_garage_floor.js; 1 line in 70_roam_world.js miniDraw)
- **HOME** = each city's own garage (Werkstatt Konstablerwache in Frankfurt, Garaz Psyrri in Athens). The existing building and its `g_city` beacon are reused,
  so there is no new world geometry or collision. Choice noted: re-using the in-city garage was the recommended option. The beacon is titled "Home · …", the map icon is 🏠 and it is
  orange; the minimap keeps it pinned at the edge (the edit in 70_roam_world.js).
- **Save point**: stopping on the beacon (it opens the usual garage card) → `HM_save()`: `pstatFlush` + `roamSavePos` + `mho_home` {city:{t,car},last},
  toast "💾 SAVED · HOME" (`#hmToast`). `mho_home` is per save slot (`CK.push`). The roam position was already autosaved every 3 s; Home makes it explicit.
- **Stored cars**: up to 4 rides parked by the door (`HM_slots`, nose out, ground-aligned with a visible-mesh box `HM_box`). List `mho_home.park`;
  default = favourites + Post Van, Fire Truck, Z06. Swapping rides in the garage while at Home (`HM.at`, cleared 60 m away) parks the old one.
  LDraw rides load on demand: `HM_build` waits via `LD_probe/LD_need`.
- **Pause menu 🏠 HOME** = fast travel; hidden during events (RO.ch/RO.sp). The landing (26 m out) faces the beacon (`roamWarp` wrap via `HM.flip`).
- **Boost rule** (`HM_sport`, free roam only): built-in nitro on QS classes spSport/spSuper (rod, ebbel, posei, gold, t_su*, t_sc_tm, t_sc_hy), grp 'racers',
  sports templates (t_rosso t_bianco t_papaya t_silver t_viola t_flame t_racer t_su_v8 t_sc_f1), refs 75870 75878 75892 75893 76897 75895 1517 30572
  6501 6503 6509 6526 6530 6605 6609 6669 and boats 4641/4643. The rule uses the current form's set (car / off-road / boat).
  Other rides: `ctlPlayer` wrap drops `c.boost`; `body.hmNoB` hides #tN BOOST + #artBoost (not on foot: #tN is JUMP there).
- **NITRO KIT**: garage RIDES stats get a "Nitro" row (Built in / Nitro Kit / none) + an INSTALL NITRO KIT button (1,500 studs, enabled only at Home)
  → `mho_gar.nk` [ids].
- **Races keep boost for everyone** (state 'race', roam sprints RO.sp, rival/mission races = RO.ch with `v2.L.rp`): AI pace and rewards are tuned on boost.
  Not measured beyond that; noted as the rule.
- `window.__hm` test hook.

## Test: tools/tHome.js (real touch, 852×393 phone), `CITIES=fra node tools/tHome.js 'http://127.0.0.1:8766/local_dbg.html?fast=1' qa_home`
Seeds a returning player (`mho_m1` fresh:0): unfinished, the Frankfurt intro HOT DROP replays on load and warps you to its drop point, which is existing story behaviour.
Last full Frankfurt run (before the final fixes) PASSED: start Hot Rod with BOOST · pause 🏠 HOME · fast travel 26 m · drive in → card + save · SAVED toast ·
stored cars parked · garage opens from the card · Post Van selected (no nitro) · van HUD without BOOST · Hot Rod parked after the swap · Shift doesn't boost · 0 console errors.
Open items at the time of handoff (see the latest qa_home_fra.log / shots):
1. NITRO KIT button: tapping a ride card jumps to BUILD; the test now taps `[data-r2m="rides"]` again. Check that the button shows and installs.
2. `mho_home@1` key (now per slot): re-check "mho_home stored".
3. Reload check (van + kit + stored cars + at Home) not yet seen passing.
4. **Athens not run yet** (`CITIES=ath`). Parking slots there are tighter (building 36 m wide: slots at ±14 / ±17.4 m).
5. **tPlay in both cities not run** (gate: no worse than live). The boost gating only removes boost for non-sports rides; the default Hot Rod keeps it.
6. Parked-car shot (`*_5_home_cars.jpg`) needs a look: the camera is set for the shot only.
Then: OD_CHANGELOG entry (v90k: NEW Home save point + stored cars; CHANGED boost only on sports rides, Nitro Kit at Home), grid, reviewer, build-10, coordinator READY.

## Final Frankfurt run (home-1, last) · grid `qa_home/GRID_home_fra.jpg`
tHome fra: 25/27 PASS, 0 console errors. PASS: Hot Rod BOOST, pause 🏠 HOME, fast travel, drive in = save + "SAVED · HOME" toast, mho_home@1 stored,
garage from the Home card, Post Van picked → no nitro, NITRO KIT offered (1,500 studs), van: Shift doesn't boost, Hot Rod parked after the swap (list),
kit stored, reload → van + kit + Home position (3.4 m) + stored cars restored.
The 2 FAILs are test order: the kit was already installed when the second tap came, and the BOOST tap ran with the garage card open (busy blocks boost).
**What I SAW in the grid. A fresh worker must fix these before the reviewer can pass:**
1. Shots 5 and 9 ("stored cars") show the garage card or garage UI, not the parked cars. The parked cars are NOT visually verified (sizes in the log look plausible:
   van 3.7×2.7×4.2 m, fire truck 3.9×5.2×7.4, Z06 1.7×1.4×4.4). Close the card first (or step 60 m away) and shoot the façade.
2. Shots 8 and 11 were taken with the garage still open: `closeGar` didn't close it (tap `#gbSave` "SAVE & DRIVE"). The van HUD without BOOST is only proven by the
   class check (`body.hmNoB`), not by a shot.
3. The SAVED toast (shot 4) sits over the garage card title: move it above the card or hide it when the card opens.
4. Shot 12: after the reload, the Frankfurt intro "STORY · Hot Drop" objective shows again (seeded fresh:0, step 0): existing story state, not the Home save.
5. Not run: Athens (`CITIES=ath`), tPlay in both cities, tyre-gap measure on the parked cars, OD_CHANGELOG entry.

## Reviewer verdict on 39d31f2: FAIL (partial). To do before re-REVIEW (one new GRID)
1. BUG: name/model mismatch. Garage tiles 8–11 are headed "Post Van (6651)" but show OFF-ROAD · GUACAMONSTER stats and a green 4x4. Likely the RIDES view is
   on the OFF-ROAD tab (G9C.type 'off', since the van has forms ['car'] it falls back to the Hot Rod's off-road). Show the street Post Van with its real model.
2. Tile 7: a cloud of flying bricks (build-up burst, 98ba_build_anim?) covers the garage header + stats while the kit panel is open. Nothing may draw over the UI.
3. Move the SAVED · HOME toast off the card title "Home · Garage".
4. In-world proof shots: (a) stored cars at Home, tyres on the ground, gap measured ≤ 0.05 m; (b) the van driving with NO BOOST button; (c) the van after the
   NITRO KIT with BOOST; (d) the Hot Rod parked at Home after the swap; (e) the Home pin on the minimap (zoom/circle).
5. Athens: a Home shot + the boost gate. Phone tPlay fra+ath no worse than v90i (fra walls 0.5/min, stuck 4.5 %; ath walls 1.49/min).
6. OD_CHANGELOG v90k entry + OD_CHECKLIST (99c) items for Home and the nitro gate.
7. DROPPED by the reviewer (correction 13:58): the 98ld_v_* models are reviewed with od-models. Was: the reviewer saw ~19 new 98ld_v_* models + src/MODELS on this branch. They come from the base alex/od-models (b40e79b v90j WIP), NOT from
   home-1: `git diff origin/alex/od-models...HEAD -- src` = only 98hm_home.js, 70_roam_world.js (1 line), ORDER, MAP.md. Ship them with od-models' own review.
8. Check that the 99c pin coverage isn't hidden by the HOME card.
