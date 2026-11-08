# Short Fuse: shipped files a quick phone game never requests (review R1, 8 Nov 2026)

asset-usage plays one Quick game at 390x844 for about 3 minutes. These files are shipped but are only used elsewhere:

| file(s) | where it is used |
|---|---|
| media/ui-button-cream, ui-button-go, ui-button-power, ui-eq-frame, ui-job-sheet, ui-nameplate, ui-panel, ui-rack (no suffix) | Full-width masters of the cropped `-c` files that the painted skin loads (`extras.js` skinBoot). Same art. The game uses the `-c` crops. |
| media/ui-node-open, ui-node-done, ui-node-locked, ui-node-boss (no suffix) | Story-map nodes without the brass-key motif. The `-k` set is used because every act shows the clock-key villain. |
| media/ui-bubble, ui-bubble-c | Painted speech bubble (its tail, ui-bubble-tail, is used by the help arrows). Tried on the Learn coach bubble: it is a blue panel and dark text on it fails contrast, so it is not wired. |
| media/ui-row, ui-row-c | Painted list row. No list in the current UI uses it. |
| media/camp-mole.webp, camp-quill.webp | Now in normal play (art gate, 8 Nov): the cast strip on the title's Story button (Brix, Quill, the Mole), Quill on every Goal card; also story chapter portraits. |
| media/table-clockface.webp, table-tower-floor.webp | Now in Quick play: the table follows the job (jobs 1-8 workbench, 9-33 clock face, 34-66 tower floor; extras.js jobTable). A table won in Story mode overrides it. |
| media/table-workbench.webp | Landscape/desktop table. The phone uses table-workbench-phone. |
| models/bomb.glb, bomb.webp, bomb@512.webp | Full-quality bomb model and its posters (W460 model wiring). Phones load bomb-lite.glb. |

Art gate (BRIEF-REVIEW.md, 05:37): plain ui-* files and ui-node-* without -k are uncropped sources of the -c / -k crops in use (the -k crops remove a white hole in the loop), so they are unreferenced variant sources. ui-bubble-c (story scene text) and ui-row-c (Tutorial row in Settings) load in Story stage 1 and Settings. bomb.glb loads on desktop with ?glb=1.
