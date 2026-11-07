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

## Voltusk animations (W359)
- `anims/crown-city-smash/voltusk-idle.webm` (loops) and `voltusk-attack.webm` (plays at 1.9x, about 2 s, on a smash, then back to idle): alpha video on a billboard plane on Voltusk's standee (media.js `CCMedia.anim`, hooked in three3d.js buildMonster + loop3D, engine.js at the smash).
- Only on High/Medium. Built figure stays when: quality Low, prefers-reduced-motion, KO, files missing/erroring, `?old3d=1` or `?anim=0`. Muted; pauses when the tab is hidden or the canvas is off screen.
- Copy step: `python3 games-src/kot/tools/media-tools.py anims` (copies to games/crown-city-smash/media/, lists them under "anims" in media.json; the manifest tool now keeps other keys). offline.json lists both files.
- Checked: build-all --quick PASS (12/12). Medium, phone 390x763 and PC 1440x860: Voltusk video plane shows and animates, 0 console errors.
- NOT proven: frame time. Software GL here: 350 ms median with video vs 17 ms without (phone). Needs a real-GPU check before deploy; if bad, use `?anim=0` default or drop Medium. The attack clip swap was not asserted by a test (only called; screenshot taken).
