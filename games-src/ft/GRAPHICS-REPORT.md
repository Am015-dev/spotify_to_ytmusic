# Sands of Qamar: graphics upgrade report

The build is `SP/ft/sands.html` (876 KB, one self-contained file, made by `python3 src/build.py`). `node --check src/x.js` passes.
SP = `games-src`. All screenshots are in `SP/ft/gfx/`.

## What looked cheap before (from `gfx/before_*.png`)
- Flat toon shading on an empty orange void, with no table, no depth and no reflections.
- The tiles were plain boxes with a dark pill label. The props on the tiles were raw cones and boxes.
- Meeples were a cylinder plus a sphere. Camels were built from boxes. Palaces were a cylinder with a ball on top. Mountains were striped cones.
- Badges and path markers were flat white. The camera snapped into place, and pieces slid by lerp with no arc or landing.
- The UI used plain panels and emoji icons, and the opening illustration was made of flat blocks.

## What changed
**New file `src/art3d.js`.** Every texture is painted in code with canvas 2D, and there are no images:
- wood grain with planks and knots
- a linen finish (used as a bump map)
- a water normal map
- a kilim rug with borders, stepped medallions and a fringe
- the printed indigo board field with a gold lattice
- an engraved brass title plaque
- the tile art: an illustrated top-down scene for each kind of tile (oasis pool and palms, hamlet houses, shrine dome and mosaic, bazaar awnings and pots, workshop kiln, spice mounds, wonder city domes, ravine, lake). Each tile has a frame in its value colour, gold corners, a large name cartouche with the coordinate, and a value medallion. Seeded variation means no two tiles look the same.
- bark, palm fronds, palace arcades, tent stripes, the back of the goods cards, and brass-rimmed badge sprites with drawn palm and palace icons.

**Rewritten `src/three3d.js`.** The public API is unchanged: `init3D`, `sync3D`, `showPath3D`, `showBadges3D`, `buildPlinth`, `fitDist`, `tileScreen`, `pickTile`, `V3.*`. The jsdom/2D path still returns early.

- **Renderer**
  - sRGB output, ACES filmic tone mapping and physically based lights.
  - PCF soft shadows on High and PCF on Medium, with a tight frustum fitted to the tray and tuned bias and normalBias.
  - A PMREM studio environment (a warm dome, a sun softbox and a cool window). It is applied only to glossy materials (metal, glaze, varnish, water), because matte print skips it to save cost.
  - Anisotropic filtering with mipmaps.
- **Lighting:** a golden-hour key light with soft shadows, a warm/earth hemisphere fill, and a cool rim light from behind. There is exponential fog, a darkened "light pool" falloff on the table, and baked blob contact shadows under every pawn, camel, palace, palm and tent.
- **Geometry and materials**
  - **Tiles:** thick tiles extruded with bevels (`ExtrudeGeometry`). The printed top uses the linen bump. The bevel and edges show a coloured core: indigo on blue tiles and terracotta on red ones.
  - **Tray:** a carved, varnished wooden tray with a brass inlay and an engraved plaque, sitting on a kilim on a plank table.
  - **Meeples:** turned wooden pawns (a lathe profile with foot, skirt, collar bead and head), drawn as one `InstancedMesh`. They are painted and varnished, with a small colour variation per pawn.
  - **Camels:** carved from a bevelled camel silhouette, as a thick painted wooden cut-out, with a silk pennant on a brass pole.
  - **Palaces:** an arcaded stone base, a cornice, a drum, a gilded onion dome with a finial, and four glazed corner cupolas.
  - **Palms:** a bent tapered trunk with bark, drooping alpha-cut fronds and coconuts.
  - **Other pieces:** sandstone crags for the Crafters' mountains, a striped silk tent, and a glossy water inset with an animated normal map on the Oasis and Great Lake tiles.
  - **Props:** a brass djinn lamp with a flickering flame, a pile of gold coins and a deck of goods cards.
- **Animation and feedback**
  - Pawns move on eased arcs with a squash bounce and a dust puff when they land. At game start they drop in with a stagger.
  - Camels and tents drop in with a bounce, dust and sparkles. Palaces and palms pop in with an overshoot.
  - "+N" score pops in the player's colour rise from the action tile.
  - A hovered playable tile lifts and glows, and its pawns lift with it. Glowing rounded-frame highlights pulse.
  - Glowing path footprints ripple along the route.
  - The camera always eases to its target and never snaps (except on resize).
  - Idle motion: palms sway, pennants flutter, water shimmers, the lamp flame flickers and dust motes drift (High only).
  - Particle sprites are pooled, and "keeper" sprites stay drawn so that shader programs never recompile during play.
- **Post-processing (High only):** an MSAA HalfFloat render target, a bright pass, a two-level separable blur for bloom, ACES, a vignette and a warm split-tone grade.
- **Graphics quality** is set with a Settings button (gear icon) that opens a new Settings popup. The same popup is under ☰ Menu on phones. The choices are Auto, High, Medium and Low, stored in `localStorage` key `soq_gfx` with try/catch.
  - **Auto:** Medium on phones and small screens, High on desktop. It steps down one level after about 3 seconds of slow frames, or after 2 consecutive frames longer than 0.5 s, ignoring the first 2 seconds and tab-switch gaps.
  - **Medium:** no post-processing, 1024 PCF shadows, Lambert twins for the matte surfaces, and no clearcoat.
  - **Low:** no post-processing, no shadows and no environment map. It uses Lambert twins for all PBR materials and swaps the light-pool overlay for a CSS vignette. If Low still runs under about 8 fps, a "slow mode" draws only when something changes, snaps pieces instead of arcing them, skips particles and renders at 0.6× resolution, so the page stays responsive.

**2D UI** (`head.html` CSS, `body.html`, `ui.js`, `story.js`):
- A carved-wood top bar with a brass trim, a lattice pattern and gold gradient title text.
- Consistent inline SVG line icons in the bar and in the popup titles: bulb, camel, lamp, scroll, cards, book, sound, music, speed, pause, menu, plus and gear.
- Parchment panels with a noise texture, a brass frame on the dock and drawers, and a dark header on the drawers.
- Pressable gradient buttons with hover and press states, and fade/slide transitions on drawers, the modal and the scrim.
- **Card faces in the Card list and Djinn popups:** a framed card with a title bar, an SVG art window (pawn, tile, djinn lamp or goods), a type line and a text box.
- Framed goods and djinn chips, and a brass chip and banner.
- A new golden-hour opening illustration: sun rays, three layers of skyline with onion domes and minarets, a caravan, and the five pawn colours as turned pawns.

**Two small UI robustness fixes** found by the tests. The rules, engine and AI are untouched (their files are unchanged since before this work).
1. `go()` now clears a stale advisor suggestion. Its old "step" button could be clicked after the board changed and caused "illegal move" errors in `click.js`.
2. A forced single tribe action no longer auto-fires on a 1.3 s timer during animated play. The button stays until the player clicks it, so it no longer vanishes under the pointer. Instant mode (ANIM=0, used by the tests) still auto-advances. This timer was making `lay.js` click detached buttons.

## Screenshots (SP/ft/gfx/)
- **Before:** `before_1366_0open.png`, `before_1366_1board.png`, `before_1366_2close.png`, `before_1366_3path.png`, `before_390_1board.png`
- **After (High):** `after_1366_0open.png`, `after_1366_1board.png`, `after_1366_2close.png`, `after_1366_3path.png`, `after_390_1board.png`
- **Piece close-ups, mid-game on High:** `final_palace.png` (palace, pawns, camel), `final_palm.png`, `final_meeples.png`, `final_walls.png` (mountain crags)
- **Other quality levels:** Medium in `med2_board.png`, Low in `l1_board.png` (an earlier iteration)
- **UI:** `ui_open.png` (opening), `ui_setd.png` (Settings with graphics quality), `ui_refd.png` (card frames), `ui_djd.png`

## Tests (final build)
| Test | Result |
|---|---|
| `lay.js '{}' base` | 1366x768 65%, 1920x1080 74%, 768x1024 49%, 390x844 47% board, no errors, **PROBLEMS 0** |
| `lay.js '{"np":4,…all expansions}' all` | the same 4 sizes (65/74/49/47%), no errors, **PROBLEMS 0** |
| `click.js` (7 games, jsdom 2D path) | **TOTAL errors 0**. Every popup was seen, including the new `pop:setd`. |
| `gauntlet.js 8 3 all-ex` | 8/8 done, errs 0, stalls 0 |
| `gauntlet.js 10 2` | 10/10, errs 0, stalls 0 |
| `gauntlet.js 6 5 sultan` / `6 4 artisans,thieves` | 6/6 each, errs 0, stalls 0 |
| `cover.js 40` | 40/40 finished, errors 0, invariant-fails 0 (the MISSING list is random-play coverage and varies from run to run) |
| `perf.js` (AI planner) | 14 / 9 / 6 ms |

Note: one early `cover.js 40` run hit a random-play engine exception (`scimitar` item, "no legal move"). It did not come back in 7 later runs of 30–40 games. It is in the untouched engine and has nothing to do with graphics.

## Performance
These figures are from SwiftShader (a CPU renderer, measured on an idle 4-core machine). They are the median rAF interval of 16 frames after a 20-frame warm-up, using `gfx/bench.js`. The "before" file is `gfx/before.html`: the original `three3d.js` rebuilt with the same UI.

| Build / quality | 1366x768 | 390x844 |
|---|---|---|
| before (toon) | 267–300 ms | 133 ms |
| after Low: effective, with slow-mode idle skipping | 17 ms | 17 ms |
| after Low: every frame drawn | 517 ms | 333 ms |
| after Medium | 900–1183 ms | 517 ms |
| after High (bloom + MSAA HDR target) | 1267 ms | – |

In software rendering, Medium and High cost about 3–4× the old toon look, because the cost is almost all per-pixel shading. JavaScript time per frame is 2–7 ms. On a real GPU the scene is light: about 120–250 draw calls, one instanced mesh for all pawns and shared geometry. Auto mode protects slow machines by stepping down to Low, and slow mode keeps the UI responsive there. Profiling notes: the environment lookup on matte surfaces cost about half of the Medium frame, so it now applies only to glossy materials. Shadows and clearcoat each cost about 25%, so Medium uses PCF without clearcoat.

## Known limits
- At the full-board desktop view the tile names are small. They are sharp when zoomed and in the close-ups.
- Google Fonts don't load in this sandbox (certificate error), so the screenshots show the fallback fonts.
- Auto mode never steps back up during a session. Choosing a level in Settings resets it.
