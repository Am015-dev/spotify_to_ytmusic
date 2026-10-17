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
