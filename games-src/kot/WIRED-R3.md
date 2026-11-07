# Crown City Smash: wired round 3 (W353)

## 3D models (12 owner files in facelift-3d/crown-city-smash): 11 of 11 used, 1 alternate
| file | slot |
|---|---|
| clampede, clampede-lite | `glbClampede` in three3d.js (the Clampede monster piece) |
| dot, dot-lite | `glbSingle('dot')`, plaza prop at the right of the Downtown ring |
| fountain, fountain-lite | `glbSingle('fountain')`, Downtown centre prop |
| tower-a..d (-lite) | `glbTowers`, instanced over the city slots |
| token-energy / token-star / token-heart (-lite) | `glbTokens`, pickups in the bursts |
| tower-c-t60000, tower-c-t120000 | alternates of tower-c; HANDOFF.md names `tower-c`. Not published, not used |
All load behind the quality toggle (High = full file, otherwise -lite); `?old3d=1` and a missing file keep the built look.

## 2D files
| file | slot |
|---|---|
| back-brass-beetle, back-bulletin | NEW: painted card back beside "N cards in the deck" in the buy list (desktop + phone), shown once the campaign unlocks the matching card back (paint.js `backFile`, ui.js, ui-ph.js) |
| table-harbor-night, table-spire-gold, title, title-phone, end-win, end-lose | already wired (paint.js); the asset check missed them (dynamic names) |

## Superseded (not wired on purpose)
ui-button-go, ui-button-power, ui-button-ghost, ui-button-pink, ui-button-yellow, ui-dice-tray, ui-hud-chip: the game loads the `-c` versions of each.

## Still unused
- None of the 2D files. Not shown in a screenshot: the deck-line card back (it sits in the buy panel, only reached in the Buy step); the DOM node and its computed style were checked (inline-block with the unlock on).
- Missing, not made: camp-* portraits, cut-* avatars, ui-star-on/off (prompts exist from the asset check).
