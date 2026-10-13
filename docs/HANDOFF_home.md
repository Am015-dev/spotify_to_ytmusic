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
