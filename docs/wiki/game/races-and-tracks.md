# Races and tracks
## Key files / functions
- Spline-track race world (neon Frankfurt, Athens race world, hazards): `src/20_race_world.js` (`loadTrack`, `buildRoad`, `athPrep`, `AHZ`, `athHazTick`).
- Race flow/AI/physics: `src/30_race.js` (`setupRace`, `stepSim`, `award`, `nemesis`), `src/30_race3.js` (rubber), `src/31_race_r15.js`.
- Fun layer: `src/98rf_race_fun.js` (`RF_rub`); items `src/98z_race_items.js` (R15_*); boost `src/98k_boost2k.js`.
- City duels / sprints on real streets (2K-style courses): `src/98tk_city_duel.js` (`tkChain`, `tkSnap`, `tkHash`); GO `src/98tk_go.js`.
- Prototype stretch (`?proto=1`, default OFF): `src/98pr_proto.js` (`PR_build`, `PR_lights`), shots `docs/shots/proto1`.
- Racers power-up bricks (`?proto=1`, Westend race only): `src/98rb_racersbricks.js` (LGPL-3.0 port; `window.RBR`, `RB_touch/RB_use/RB_tick`), GO `race/racers-bricks` (`src/99crb_bricks_go.js`), shots `docs/shots/bricks` ([HANDOFF](../../HANDOFF_bricks-r24i.md)).
- Race freedom (racefree-r24l): city-race soft bounds + rival planting `src/98rfb_race_bounds.js` (lazy: `TK_bd`, `TK_near`, `TK_pY`), race-mode hold point keeps the player's line (`src/30_race2.js` physPlayer); GO `race/racefree` (`src/99crf_racefree_go.js`), [HANDOFF](../../HANDOFF_racefree-r24l.md).
- Story/missions/quests: `src/41_career_quests.js` (`QUESTS`, `qvGraph`), `src/80_story_m1.js`, `src/81_story_ath_m2_m3.js`; Athens specials `src/98esc_escape.js`.
- Plans: [../../RACE2K_PLAN.md](../../RACE2K_PLAN.md), [../../RACE_MODES.md](../../RACE_MODES.md), [../../TRACKS_2K.md](../../TRACKS_2K.md), [../../TRACKS_2K_BEATS.md](../../TRACKS_2K_BEATS.md), [../../TRACKS_REF.md](../../TRACKS_REF.md).

## Invariants
- Tracks lint: grade <= 22 %, rails, builder pieces (`tools/unit/lint_tracks.js`).
- Races finish with all gates passed (bot reports); a race never stalls.
- Takedown mode was deleted (red on phone): [flags.md](flags.md).

## Known bugs / history
- Race lanes: [../../HANDOFF_race15.md](../../HANDOFF_race15.md), [../../HANDOFF_race17.md](../../HANDOFF_race17.md), [../../HANDOFF_raceG.md](../../HANDOFF_raceG.md), [../../HANDOFF_races.md](../../HANDOFF_races.md).
- Racers comparison: [../racers/race-loop.md](../racers/race-loop.md), [../racers/file-formats.md](../racers/file-formats.md).
