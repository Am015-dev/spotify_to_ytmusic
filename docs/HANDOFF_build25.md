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

## Status
- (C) map filters: working by real taps (counts per category, persistence after reload).
- (A) layers/views: built; PDF before/after + function test running.
- (B) not started.
