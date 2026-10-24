# On foot (minifig walking)
## Key files / functions
- `src/98of_onfoot.js` (v89a, "OF"): exit at a stop, minifig steps out, car stays parked; walk/run/jump (floating left stick on touch; WASD + Shift + Space on PC); camera behind; ENTER near own car. Functions `OF_figBuild`, `OF_figPose`, `OF_cars`, `OF_edge`, `OF_nearCar`, `OF_doorPlace`.
- Driver figure: `src/98_garage_driver.js` (`GAR_*`, `window.__gar`). Scale (1.8 m humans): `src/96_scale_qa.js` (SC_*).
- NPC pedestrians/people: `src/98lx_life.js`, `src/98lm_liveliness.js`.
- Dev probes: `tools/hot/footHud.js`, `tools/hot/footSurf.js`; GO rows in `src/99c_checklist.js` (foot items).

## Invariants
- Pedestrian and moped height 1.80 m (`tools/unit/lint_scale.js`).
- Collision with cars/buildings uses the same pose as the drawn car; edges stop the walker (no walking off world/into river).

## Known bugs / history
- Plans and fixes: [../../HANDOFF_onfoot.md](../../HANDOFF_onfoot.md), [../../HANDOFF_FOOT1.md](../../HANDOFF_FOOT1.md), [../../HANDOFF_onfoot-collide-r24a.md](../../HANDOFF_onfoot-collide-r24a.md), [../../HANDOFF_onfoot-edge-r22e31.md](../../HANDOFF_onfoot-edge-r22e31.md).
- Not covered by unit tests: on-foot heights vs terrain (needs runtime geometry); see tools/unit/README.md.
