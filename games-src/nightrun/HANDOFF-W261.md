# HANDOFF W261 (on-foot gauntlet)
Branch `nr/W261-gauntlet-foot`. Deliverable: `qa/gauntlet-foot.js` + `GAUNTLET-FOOT-2026-10-29.md` (defect table).
Fixed: D1 story card touch in landscape (core/b.js), D2 stick/BOMB overlap auto-fire off (streetlook.js), D3 GUARD over result/pause menu (streetguard.js).
Not done (40 min limit): the full 8 seeds x 4 strategies x 2 platforms matrix. Idle ran 3 (phone) / 6 (PC) seeds, the other strategies a reduced 2 seeds each; see the doc's Runs section.
OPEN: D4 phone idle bot survives ~90 s through auto-fire alone (W263 balance); D5 purefoot hides the progress bar and BEHIND words (owner call). Also not yet checked: a cleared run (no bot cleared in the runs done, so the STREET CLEAR result and boss shot are unverified), the boss shot.
Next: `PLAT=phone STRATS=aggressor,dodger SEEDS=8 TS=4 node games-src/nightrun/qa/gauntlet-foot.js` alone in the background (~1 min per run); run phone and PC one after the other if frame p95 matters (parallel runs inflate it).
Tool note: never `pkill -f` a pattern that appears in your own command line.
