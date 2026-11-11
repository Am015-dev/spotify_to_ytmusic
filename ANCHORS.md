# ANCHORS — FL (feel: auto vehicle, smash→boost, day/night)

Patch: `pFL1.py` (inserts module `fl.js`). All new globals are prefixed `FL`/`FL_`; debug API `window.__fl`.

| # | Anchor (exact, count 1) | Replaced with | Why |
|---|---|---|---|
| 1 | `const terr=T0.deck?'road':…inLot(…)…'road';\n  const veh=(RO.vsel\|\|'auto')==='auto'?(…):RO.vsel;` (roamStep, 2 lines) | `const terr=FL_terr(T0,ground,dt);\n  const veh=FL_veh();` | surface classification (road / dirt+grass+park / water) + hysteresis auto switch |
| 2 | `terr==='dirt'?3.6:13)` (roamStep grip) | `terr==='dirt'?(veh==='offroad'?8:2.6):13)` | 4×4 grips on dirt/grass, street car slides |
| 3 | `if(RO.bIdle>.8)s.bm=Math.min(100,s.bm+7*dt)` | `…+FL_RECH*dt)` (4.5/s) | slower passive boost recharge |
| 4 | `if(pl)pl.bm=Math.min(100,pl.bm+4);AU.sfx('brick')` (smashCheck) | `if(pl)FL_smash(def);AU.sfx('brick')` | size-scaled boost + chain multiplier + pop |
| 5 | `seg('Steering assist','assist',[['on','On'],['off','Off']]);` (settings) | same + `seg('Time of day (free roam)','tod',…)` | Cycle / Always day / Always night |
| 6 | `window.__mho={` | `fl.js` + `window.__mho={` | module insertion (README pattern) |

Wrapped (no text anchor): `roamStep` (runs `FL_step` after it), `hubEnter` (re-apply time of day), `M1_takedown` (+45 boost).
Storage: `SET.tod` inside `mho_set`; time of day `mho_fl_tod` (per slot via `store`).
