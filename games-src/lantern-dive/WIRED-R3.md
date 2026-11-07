# Lantern Dive: wired R3 (W355)

**3D models: 1 of 1 wired.**
- `models/lantern.glb` -> pre-rendered sprite `models/lantern@512.webp` / `lantern.webp`: command button (`cmdHTML`) and the lantern reveal (`.lanrev`) in ui99.js. Already wired before this round; falls back to the drawn lantern when low graphics is on or the file is missing. Verified, nothing to add.

**2D wired: 9.**
- `camp-brack, camp-nerea, camp-bram, camp-sumi, camp-dag, camp-echo, camp-undertow, camp-maze, camp-lampless` -> Story map nodes, chapter header and result portraits. ui9.js `GXC.init` now passes `artBase: 'media/'`, so the shell loads them; the emoji stays as fallback for portraits not painted yet (camp-shallows, camp-sand, camp-power, camp-tablet, camp-hum, camp-shelves, camp-road, still prompted).

**Superseded: 5.**
- `ui-button-cream`, `ui-button-go`, `ui-button-power`, `ui-panel`, `ui-row`: superseded by the nine-slice `-c` versions the game loads.
- Prompt `lantern-lit` (wave 7 lantern states) -> moved to `next-wave/flow-2d/lantern-dive/prompts-superseded.json`: the finished 3D lantern sprite is the lit lantern.

**Still unused: 7.**
- `ui-bubble, ui-bubble-c`: speech bubble; the game uses only `ui-bubble-tail`. No slot to put a full bubble in without a UI change.
- `ui-node-boss, ui-node-done, ui-node-locked`: Story map node states. The shell (shared `gx-campaign`) loads only `ui-node-open`; adding the other three is a shared-shell change for every game, so it waits for the owner's yes and an all-games build.
- `ui-trick-pad`, `ui-seat-c`: only `ui-trick-pad-c` and `ui-seat` are loaded; left as alternates.
