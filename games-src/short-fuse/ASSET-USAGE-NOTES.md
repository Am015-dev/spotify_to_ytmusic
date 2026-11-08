# Short Fuse: shipped files a quick phone game never requests (review R1, 8 Nov 2026)

asset-usage plays one Quick game at 390x844 for about 3 minutes. These files are shipped but are only used elsewhere:

| file(s) | where it is used |
|---|---|
| media/ui-button-cream, ui-button-go, ui-button-power, ui-eq-frame, ui-job-sheet, ui-nameplate, ui-panel, ui-rack (no suffix) | Full-width masters of the cropped `-c` files that the painted skin loads (`extras.js` skinBoot). Same art. The game uses the `-c` crops. |
| media/ui-node-open, ui-node-done, ui-node-locked, ui-node-boss (no suffix) | Story-map nodes without the brass-key motif. The `-k` set is used because every act shows the clock-key villain. |
| media/ui-bubble, ui-bubble-c | Painted speech bubble (its tail, ui-bubble-tail, is used by the help arrows). Tried on the Learn coach bubble: it is a blue panel and dark text on it fails contrast, so it is not wired. |
| media/ui-row, ui-row-c | Painted list row. No list in the current UI uses it. |
| media/camp-mole.webp | Story portrait for the "Fibber on the Crew" chapters (campaign.json, portrait). |
| media/camp-quill.webp | Story portraits (campaign.json) and the Learn coach bubble when Quill speaks. |
| media/table-clockface.webp, table-tower-floor.webp | Table backgrounds unlocked in Story mode (extras.js tableApply, `unl('table')`). |
| media/table-workbench.webp | Landscape/desktop table. The phone uses table-workbench-phone. |
| models/bomb.glb, bomb.webp, bomb@512.webp | Full-quality bomb model and its posters (W460 model wiring). Phones load bomb-lite.glb. |
