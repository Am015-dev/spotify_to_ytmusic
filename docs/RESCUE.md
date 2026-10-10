# RESCUE: skipped / dropped LEGO models (rescue-1, 2026-10-10). Branch alex/od-rescue (from alex/od-models).
Alex: "the skipped rides need to be fixed, we don't skip work that has already been done." Sources searched: docs/HANDOFF_models1-4, _mdlw, _veh, _city1,
MODEL_CATALOG (alex/od-mdl-land), git logs of alex/od-mdl-veh, alex/od-mdl-world, alex/od-mdl-land, alex/od-models (reverts included).

## Fixed on alex/od-rescue
| Model | Why it was skipped | Fix | Proof shot |
|---|---|---|---|
| 7611 Tiny Patrol, 7612 Tiny Muscle, 7613 Track Racer, 8120 Rally Sprinter, 8121 Track Marshal (Racers, build-4) | reverted in v89z: tiny scale (4 studs wide = a toy next to traffic) | restored; new 🏁 RACERS group (garage RIDES filter chip ALL → OWNED → ★ FAVS → 🏁 RACERS, preset `grp:'racers'`); hidden `szR` marker scales them ×2 (98sz_ride_scale.js RSZ.rk) = 8-stud Speed Champions width, ~2 m, a car next to traffic. No driver: all five have closed canopy cockpits | docs/shots/rescue/r7611_drive.png, r<set>_g.png |
| 6350 Pizza To Go (build-5) | only door a 1×3×3 hatch = 1.41 m at minifig scale < 1.9 m figure | doorway opened full height: hatch, step brick under it, lintel brick and the counter behind it removed (9 bricks) = 15 plates = 2.36 m, the red roof plate is the lintel. Still minifig scale (LD_FIG) | docs/shots/rescue/door_w6350.png |
| 30023 Lighthouse (build-5) | micro set blown up 3× broke the minifig rule | a LEGO model on display: TRUE size in the minifig world (LD_SW×LD_FIG, like every building: 4.9 m next to a 1.9 m figure) on a 0.8 m stone plinth (new `plinth` option in 98ld_w.js), Athens | docs/shots/rescue/door_w30023.png |
| 7796 House (build-5) | micro/small Creator set shown 2.5× | same: model on display at true size (3.1 m) on a plinth, Athens | docs/shots/rescue/door_w7796.png |
| 6613 Phone booth (build-5) | "hood malformed" (old inverted-slope mapping) | reconverted `--only booth --yaw 2`: 3665 inverted slopes and the 4861 hood are real LDraw meshes now; A/B sheet matches the LDraw truth (keypad print and the bike submodel not converted). Frankfurt street prop, 1.1k tris | docs/shots/rescue/ab6613_sheet.png, door_w6613.png |
| 4956 Creator House (build-6) | 205k tris raw | already rescued by build-6 in v90f (alex/od-models 7e096ac); my parallel conversion dropped in favour of theirs | docs/shots/mdlw/door_w4956.png |
| 3221 Big Rig in Frankfurt traffic (city-1, pulled in v90e) | 3.84 m wide; traffic drives at 0.36 × road width off the centre line → over the kerb / centre line on narrow roads; no lane-fit proof | CT_wide (98ct_city_lego.js): a kind wider than 2.6 m drives at the offset that keeps it between centre line +0.15 m and kerb −0.3 m, only on segments ≥ 4·hw+1 m (8.7 m), picks its next segment among those (U-turn at a dead end), spawns on one. `__ct.wide()` reports kerb/centre clearances | docs/shots/rescue/rig_lane.png, rig_top.png. Probe (30 s, 3 rigs): all on 22 m roads, kerb clearance ≥ 1.16 m, centre line 6 m, 0 narrow segments. Turns not exercised in 30 s |

## Also found (attempted conversions that failed or parts dropped): status (rows with shots = fixed here)
| Item | Why | Status |
|---|---|---|
| 621 Police Car (veh) | "beacon floats" | reconverted --yaw 1: beacon sits on the roof (A/B matches), driver behind its wheel. RIDES 'Classic Patrol'. Garage floor shows the dark patch (garage-18's bug) | docs/shots/rescue/ab_v621_1.png, r621_g.png |
| 7638 Tow Truck (veh) | converter TypeError (scaled string matrix) | ld2garage.py guard (no stored orientation → free rotation), --drop string --yaw 2; A/B matches. RIDES 'Tow Truck' | docs/shots/rescue/ab_v7638_1.png, r7638_g.png |
| 6522 Highway Patrol bike (veh) | converter IndexError (dropping both sub-files left nothing) | one bike only (ld/omr/6522-1b.mpd), --only biker; rider placed on the seat by hand (no steering-wheel part). RIDES 'Highway Bike' | docs/shots/rescue/ab_v6522_1.png, r6522_g.png |
| 75870 Corvette Z06 (veh) | 25 wide: the file holds the car twice + a camera stand | one car (ld/omr/75870-1b.mpd), --only body,wheel,windscreen: 6.6 wide Speed Champions scale. RIDES 'Z06 Racer' | docs/shots/rescue/ab_v75870_1.png, r75870_g.png |
| 1069 boat (world) | downloaded, never tried | open |
| 1572 Tow Truck, 6668 Recycle Truck, 6526 Red Line Racer, 6669 Diesel Daredevil (build-8) | dark dithered patch on the garage floor (g_34) | queued here; the floor patch itself is garage-18's (session_019vNFjqrqunwBDfw4daimsX) |
| 7242 Street Sweeper (build-8) | brushes convert to box placeholders | queued: real mesh for the brush part |
| 4208 (build-8) | broken size | queued |
| 3718, 6376 (world) | rejected before conversion: no 1×4 door | not converted work; same doorway fix as 6350 applies |
| Palm tree `l_palm` (land) | converted, not placed | land lane (alex/od-mdl-land): Athens seafront candidate |
| Bush 2417/2423 (land) | 1,119 tris vs ~500 brick bush | land lane: LD_KEEP low-poly retry |
| 75893b coupe in Athens traffic (city-1) | +110 MB JS heap when swapped together with the taxi | city-1 OPEN item (heap snapshot diff) |
| bike in 6402 / 6613, figures, stickers | parts of a set, not models (pipeline rule) | by design |
