# Garage worker 8 handoff (2026-10-07)

## Release 1 = v87r: branch alex/od-garage8a (src = live v87q d96357d + garage changes). REVIEW sent, DEPLOY after PASS
- **CHOOSE TRACK at 852×393** (`src/00_page.html`, block "G8 (v87q)" in the max-height:500px rules): START RACE, 2 PLAYERS and Medal points sit in their own right column (168 px).
  The panel gets a matching padding-right, so the bar never covers the WEATHER/CLASS rows. Menu text is now ≥ 12 px. `t4/g8trk.js` measures overlap 0 and small text 0, at the top and scrolled to the bottom.
- **Phone builder camera** (`src/98t_garage_tools.js`, G8_):
  - Pitch .15 (was .42), ×0.92 distance.
  - setViewOffset centres the car in the free band between the toolbar and the palette (`G8_band()`).
  - The workshop (roller doors, GARAGE signs, shelves, mechanics) now fills the back of the shot.
  - Studio tweaks in `98s`: 8 GARAGE signs at y0+2 (two per wall) and 2 extra mechanics at (-12,14) and (-2,16).
- **Brick shower** on GB_enter and GB_exit: a 2D canvas, 70 bricks, 1.05 s. The clock starts at the first drawn frame, so a slow GB_enter does not eat the animation. `__g8.T.dur` stretches it, for tests only.
- **STEP UP / STEP DOWN** in `#gsBar` moves the held part 1 plate. A position is valid if it overlaps nothing and touches something: rests on, hangs under, or sits beside a part or the chassis (`G8_free`).
  PLACE at a stepped height adds the part at that y, plus the mirror twin when it fits.
- **REDO** sits next to UNDO (↷; also Ctrl+Y and Ctrl+Shift+Z). GB_snap clears it. UNDO and REDO are disabled when their stack is empty.
- Tests: `t4/g8step.js` (shower enter/exit, held, step y 1→3→2, place, undo/redo counts 17→15→17→15) and `t4/g8cam*.js`.
- Gotcha: the `?fast=1` mode stops the garage render loop (the camera never updates). Do garage shots WITHOUT fast.
- Gotcha: live v87q has a W14 block after 98s that split_src lumps into 98_garage_driver. It now lives in its own module, `src/98x_w14_speed.js` (verify_live LIVE_MATCH d96357d).

## Release 2 (next worker): branch alex/od-garage8. Built on v87p src: rebase it onto alex/od-garage8a and keep 98u + the 94 edits
Alex (iPhone v87p): "the garage builder is a bit unresponsive in several areas and I cannot place the tiles, also there is no select option."
1. **Dead taps: root cause found and fixed.**
   - A tap on the side of the car aims at the neighbouring cell (hit point + normal × 0.35 stud), which often has no chassis, so `GB_cand` returned null and nothing happened. Big parts failed unless the tap was dead centre.
   - Measured on v87p, existing car, 1×1 tile: 35 of 100 car points dead. Hull 0 of 100, pontoon 4, airboat fan 1, XL wheel 10.
   - Fix (`src/98u_garage_select.js` top): `GB_cand` falls back to the nearest cell where the part fits. It clamps into the grid, then searches rings up to 3 cells. After: 0 of 210 dead for every part (`t4/g8sweep.js`, also in an iframe: `iframe852.html`).
   - Finger tolerance (`src/94_garage_ui.js` pointer handlers): touch drag threshold 14 px (was 8), tap up to 1.5 s (was 0.9 s).
   - No DOM element blocks taps over the canvas (elementFromPoint grid: 0 blockers).
2. **Tiles place fine in every test.** All 9 Tiles parts place with real taps (`t4/g8tiles.js`, FAIL []), on the existing car and on a bare chassis.
   They are 1 plate thick and default to the car's colour, so a red tile on a red car is nearly invisible, which is the likely "can't place".
   Not done yet:
   - Make placed thin parts obvious: a longer flash or outline, or a default contrasting colour.
   - Ask Alex for a screen recording (lesson 13) if he still can't place them.
3. **SELECT** (`src/98u_garage_select.js`, SL_):
   - ☝ SELECT tool in the toolbar after ✚. Tap a part to select it (cyan glow; the mirror twin too when MIRROR is on; a group is selected whole).
   - `#slBar`: MOVE · ROTATE · COLOUR · DELETE · COPY · SELECT UP · GROUP/UNGROUP · DESELECT.
   - MOVE, COPY and ROTATE lift the selection as one cluster (ghost + brackets) and reuse `#gsBar`: PLACE, ROTATE, CANCEL, STEP.
   - A swatch tap recolours the selection. UNDO cancels a carry. Groups are stored as `b.g` on the bricks.
   - Status: code builds with 0 console errors in the sweep. The real-touch proof `t4/g8sel.js` is NOT finished: its first run timed out (part-map raycast grid too fine; now 14 px).
     Run it alone (no other browser running): `node t4/g8sel.js http://127.0.0.1:8766/local_dbg.html t4/g8/sel` and look at the shots in t4/g8/sel/.
4. Release-2 proof the coordinator asked for:
   - a strip of real taps placing each Tiles item;
   - selecting and moving a brick;
   - SELECT UP moving a cluster;
   - 0 dead taps on a tap grid over the car (g8sel step 6);
   - 0 console errors.
   Then quick REVIEW and DEPLOY as v87s on the current live.
5. Toolbar width on the phone: SELECT adds about 74 px. `#gbBkN` is capped at 104 px with an ellipsis; check that the row still fits at 852 px (all buttons on one line).

## Test notes
- The software renderer runs at ~2 fps: use CDP touchStart+touchEnd back to back (as in nb.js and g8*.js). Never run two browsers at once (taps time out).
- `DRIVE=1 node t4/nb.js <url> <out>` builds, saves, drives My Build, and gives the tyre gap (`tyre`, `tyre_rest`).
