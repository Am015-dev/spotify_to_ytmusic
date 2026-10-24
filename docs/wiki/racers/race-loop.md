# Racers: race loop
Source pins: [../sources/racers.md](../sources/racers.md). Paths under `LEGORacers/` of isledecomp/racers.

## Facts
- Laps: default 3 (`src/save/gamestate.cpp`); options 1-5 laps, up to 6 racers (`OptionsScreenBase`); solo race forces 3 (`RaceSession::Initialize`).
- Checkpoints are planes in a graph, up to 4 "next" links each, max 254 nodes (`CheckpointGraph::Load`), so tracks can branch.
- Lap fraction is spread evenly along the main chain, branches interpolated (`ComputeLapFractions`).
- Place = checkpoints passed + fraction; ties by distance to the next plane (`RaceState::UpdateStandings`).
- A lap counts only after zones pre-line -> line -> post-line (`Racer::CrossFinishLine`); "time behind" shows 2 s.
- No wrong-way message: driving backwards just loses progress.
- Circuit points by place: 30/20/10/3/2/1 (`g_circuitPointsByPosition`, `circuitstandings.cpp`).
- Fun drivers: short dense races (3 laps x 6), crashes cost time not the race.

## What we have
- Race flow: `src/30_race.js:setupRace`, `award`; physics `stepSim`; AI rivals `nemesis`.
- Fun layer (rubber band, etc): `src/98rf_race_fun.js`. City duels as courses: `src/98tk_city_duel.js:tkChain`.
- Race modes and plan: [../../RACE_MODES.md](../../RACE_MODES.md), [../../RACE2K_PLAN.md](../../RACE2K_PLAN.md).

## Gap
- No checkpoint graph with branches; our routes are spline/road chains with split routes in city duels.
- No lap-zone sequence (line crossing is a distance test). No circuit points.
Next: [rubber-band.md](rubber-band.md), [ai-lines.md](ai-lines.md).
