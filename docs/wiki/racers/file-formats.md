# Racers: track and level file formats
Pins: [../sources/racers.md](../sources/racers.md). Facts only; no copied layouts.

## Container
- One race file `.rab` (read in `RaceSession::Initialize`) names every part of a track. Assets sit in LEGO.JAM (Laupetin/Lego-Racers-Mod has JAM/GDB tools).
- Every file can be mirrored (Y negated) for reverse tracks.

## Parts
- `.wdb` world (`GolWorldDatabase::Load`): models, LOD scene nodes, sprites, lights, UV-scrolling materials.
- `.skb` sky (`RaceSkyState::Load`): timed keyframes of top/middle/bottom colour.
- `.cpb` checkpoints; `.spb` start grid, position + facing (`RaceState::LoadStartPositions`).
- `.pwb` power-ups (`ParseColorBricks`, `ParseWhiteBricks`): colour-brick position + colour + optional respawn; white-brick positions.
- `.hzb` hazards (`HazardManager::LoadHazards`): 21 types (hammer, rolling rock, sweep cannon, lava geyser, snowfall, ghost, warp pad...), each with trigger radius, interval, period.
- `.tmb` surfaces; `.trb` triggers; `.tib` timers; `.evb` events; `.rrb` AI lines (see [ai-lines.md](ai-lines.md)); camera start pose and map bounds.
- Track width: s8 byte x 0.125 per side in AI-line points.

## What we have
- Track data is code/JSON: `TD`/`TRK` in `src/20_race_world.js:loadTrack`; tracks plan [../../TRACKS_2K.md](../../TRACKS_2K.md). City duels in `src/98tk_city_duel.js`. LDraw model data: `src/MODELS`, [../../MODEL_PIPELINE.md](../../MODEL_PIPELINE.md).
- Hazards: `src/20_race_world.js:AHZ` (Athens trams, `athHazTick`).

## Gap
No data-described race. Plan (design doc step 3): one JSON race file (grid, brick spots, hazards, sky keyframes) built by `src/98pr_proto.js`, one hammer hazard. See [../game/races-and-tracks.md](../game/races-and-tracks.md).
