# Racers: car builder
Pins: [../sources/racers.md](../sources/racers.md).

## Facts
- Grid 10 x 6 cells, up to 15 high, max 64 pieces (`CarBuildModel::Initialize`, `TestPlacement`; `CarBuildPieceList` caps at 64).
- Only free bricks count: their volume adds mass and moves the centre of mass (`ComputeHighPieceCentroid`).
- Each 20 cells of volume: +1 handling, +1 top speed, -1 accel (`RaceState::CreateRacer`). Bigger = faster top speed, slower off the line.
- Chassis `.cmb` sets base stats, mass, wheel positions, driver mount.

## What we have
- Builder core `src/92_garage_builder.js` (`GB_PC`, `GB_geo`, `GB_attach`, `GB_mods`), UI `src/94_garage_ui.js:GB_ui`, studio `src/98s_garage_studio.js`, parts/canvas `src/98pa_garage_parts.js`, collection + templates `src/98y_garage_collection.js`. 250-brick budget.
- `GB_mods`: top -1.2 %, accel -3 % at full budget (penalty only).
- LDraw sets: `src/98ld*`. See [../game/garage-and-models.md](../game/garage-and-models.md).

## Gap
Ours only penalises size; Racers trades accel for top speed. Optional stat rule: +top/+handling per 20 volume, -accel.
