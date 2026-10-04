# SP · anchors replaced in base.html

| patch | anchor (exact string, count) | change |
|---|---|---|
| pSP1.py | `window.__mho={` (1) | inserts `sp.js` in front of it (same module scope) |

That is the only text edit. Everything else is done in `sp.js` by wrapping existing bindings at run time
(each wrapper calls straight through while `SP_S.on` is false):

| wrapped | why |
|---|---|
| `ctlPlayer` | P1 = WASD + Space / L-Shift / Q / E only, while split-screen runs |
| `physAI` | the ship flagged `SP_p2` is driven by `physPlayer` with P2 controls |
| `setupRace` | adds P2 next to P1 on the grid, optional AI fill, traffic halved |
| `startRace`, `showResults`, `toMenu`, `buildMenu` | split race start / both-player results / cleanup / "2 PLAYERS" button |
| `resize` | per-viewport composer + half-size bloom targets, camera aspect |
| `roamStep`, `addXP` | Smash Battle: P2 car step, per-player scoring, 3:00 timer |
| `frame` | per-player HUD update |
| `composer.render` (object method) | two scissored viewports, P2 camera, shadow map reused for view 2 |

New globals: `SP_*` functions/consts, `window.__SP` (test API). DOM ids: `SP_btn`, `SP_set`, `SP_res`, `SP_h`, `SP_v1`, `SP_v2`, `SP_t`, `SP_div`.
Note: base.html already has a global named `SP`, so this module only uses the `SP_` prefix.
