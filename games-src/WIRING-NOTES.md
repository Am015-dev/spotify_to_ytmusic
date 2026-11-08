# Wiring notes: files left unwired on purpose (13 Oct 2026)

Kit files `ui-row`, `ui-bubble-tail` are unused by Final Approach, Thornbound, Lantern Dive, Kaiten Kitchen, Short Fuse
(no strip or tail element in those games); `ui-bubble` is used where the story scene text exists.

- **Lantern Dive** card frames (`card-face-*`): the delivered paintings are unusable as card faces. Coral and Sunstar are dark
  scenes, not cream frames; Tide and Kelp have ragged paper edges, and their corner lanterns collide with the numerals. Needs repaint.
  `icon-tick` and `icon-cross` have opaque blotches behind them (cross is a teal square). `ui-seat` (bright brass plate) would sink the
  white diver text on the Pixi seat chips. `table-tunnel-glow-phone` is only for the Descent unlock (not yet wired for portrait).
- **Thornbound** `ui-sheet` (full clipboard sheet) not wired: only `ui-sheet-head` is (drawer heads); the sheet's painted edge fights the long rules text.
- **Cauldron Fair** `btn-draw` (the bag plate): the Draw button already carries the painted bag and the 3D bag layer; `ui-chipbar` (slanted pockets) does not fit the straight 0/7 meter.
- **All games**: `ui-iconbtn` and `ui-node-*` ship with an opaque white blob in the hanging loop. `crop-kit.py` writes `-k` keyed copies;
  Short Fuse uses them, the shared `gx-skin.css` still uses the originals (the loop is hidden by the 9-slice there). Ask for fixed originals.
- Sweeps need media: serve `games/<slug>/media` next to the page (Thornbound, Kaiten sweeps now do); `file://` pages log harmless audio-fetch errors.

## W461: owner 3D models as the real pieces (8 Nov 2026)
- `shell/gx-glb-boot.js` (inlined) loads `models/gx3d.js` (three + gx-glb + `shell/gx-glb-view.js`; rebuild with `scripts/make-gx3d.py <slug>...`) after page load.
  Every `<img src="models/<name>[@512].webp">` whose `models/<name>[-lite].glb` exists becomes a live canvas on the same box; the hidden img stays as the fallback.
  No WebGL, a weak device (<= 2 cores / 2 GB / Save-Data) or a software GL (SwiftShader) keeps the @512 pictures. `?glb=0` off, `?glb=1` forces it.
  Wired: doorkick-dungeon, hollowbough (module only: no screen code touched, W457), thornbound, kaiten-kitchen, lantern-dive, cauldron-fair. final-approach draws the plane as a Pixi texture from `GXGLBV.snapshot('plane')`.
- Runtime proof (W428 gate: `scripts/asset-usage.js`, reads games/ so it needs the deployed pages): `node games-src/scripts/play-usage.js --scn --desktop --verbose <slug>...` plays a quick game at 390x844 (computer vs computer), visits every `?scn=` state and a 1280x800 pass, logs media/models/music requests and lists what never loaded.
  New scenarios for the end-of-game art: `dk-win-<hero>`, `dk-boss-<boss>`, `tb-throne`, `tb-over`, `fa-end`.
- Story map extras (`map`, `stars`, `banner`): tried, then reverted. The base removed those free-art files (one art style), so the flags only produced 404s.
- Still never loaded in play: rival portraits (`camp-*`) and alternate tables for later chapters, `ui-node-done/locked/boss` (need campaign progress), hollowbough `ever-tree` (end card), `lantern-dive/camp-shallows.webp` is requested but not shipped (404).
