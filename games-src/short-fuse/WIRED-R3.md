# Short Fuse: wired R3 (W355)

**3D models: 2 of 2 wired** (already, verified): `bomb` -> `models/bomb@512.webp` wobble and boom, `pliers` -> `models/pliers@512.webp` snip, both through `sprite3()` in tbl.js; nothing shows when low graphics is on.

**2D wired: 3.**
- `table-workbench`, `table-workbench-phone`, `table-clockface`, `table-tower-floor` -> table background (extras.js `tableApply`, name built from the unlocked table; phone workbench when upright). The asset check missed it because the name is built at runtime.

**Superseded: 7.** `ui-button-go`, `ui-button-power`, `ui-eq-frame`, `ui-job-sheet`, `ui-nameplate`, `ui-rack`, `wire-tile-frame`: the nine-slice `-c` versions are what skin.css loads.

**Prompts superseded: 4.** `bomb-tick-a`, `bomb-tick-b`, `bomb-boom-1`, `bomb-boom-2` (wave 7) -> `next-wave/flow-2d/short-fuse/prompts-superseded.json`: the 3D bomb sprite already wobbles and booms in the game. `bomb-spark`, `bomb-smoke`, `bomb-defused` stay, the sprite cannot show them.

**Still unused: 1.** `title-phone`: wired as the portrait title art (table.css, `max-aspect-ratio:4/5`), but with it the menu scenario fails axe colour-contrast on the help "Got it" button (build FAIL, without it PASS), so the change was taken out. The phone art needs a darker scrim in the same CSS rule; owner/next round.
