# Vehicles and auto-transform
## Key files / functions
- Auto transform (street car / off-road buggy / boat by surface) + body tilt to all wheel contacts: `src/98xf_xform.js` (loader; code in lazy chunk `models/xf.js`, source `src/assets/xf/code.js`, packed by `tools/xf/pack.sh`). On by default, kill switch `?xf=0`. Gate tag `xf1`.
- Cars: `src/93_cars_lego.js` (`CR_*`: parts, presets, steering `CR_yaw`, sit-on-4-tyres, wheels on ground). Big cars `src/98bc_bigcars.js`; ride scale `src/98sz_ride_scale.js`, audit `src/98sz2_ride_audit.js`.
- Driving: roam `src/71_roam_drive.js:roamStep`, vehicle cycle `cycleVehicle`; boats `LD_boat` in `src/98ld_import.js`; boost `src/98k_boost2k.js`; damage `src/98dmg_damage.js`; smash `src/98sm2_smash2.js`, `src/98dest_destruct.js`.
- Facing/orientation notes: [../../FACING.md](../../FACING.md).

- Wall bumper (walls-1, `roamStep`): eases the car before a wall; since drivefeel-r25g only the speed INTO the wall (`RO_wallInc`, 3 rays; corners/pillars/a bend ahead = full ease; `TUNE.wallInc=0` = old). GO `feel/drive` (`src/99cdf_drivefeel_go.js`): 30° glance at 60 km/h meets the wall at 48 km/h (was 25) and keeps 68-87 % (was 46 %).

## Invariants
- Car body rests on 4 tyres on the road (no float/sink); ride lint in `tools/unit/lint_models.js` (fill, height, aspect, wheels).
- The transform assist must not drag the car back along the road at grass edges (comment in `src/71_roam_drive.js` near line 62).

## Known bugs
- Climb window deleted after two failed lanes: [flags.md](flags.md); [../../HANDOFF_let-cars-climb-r22e17.md](../../HANDOFF_let-cars-climb-r22e17.md), [../../HANDOFF_climb-r2-r22e18.md](../../HANDOFF_climb-r2-r22e18.md).
- Invisible car on phone path: [../../HANDOFF_phone-path-bugs-r22e26.md](../../HANDOFF_phone-path-bugs-r22e26.md).
