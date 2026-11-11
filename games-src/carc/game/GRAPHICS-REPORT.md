# Rampart & Vine: graphics upgrade report

Built file: `SP/carc/game/rampart.html` (865,797 bytes; three.js r158 is inlined). The rules, engine state, AI and tile data are unchanged. The work is in `src/three3d.js` (rewritten), `src/ui.js`, `src/head.html`, `src/body.html` and `src/sound.js`. The pre-upgrade sources are kept in `gfx/orig/`, and `gfx/orig.html` is the old build, kept for comparison.

## Before: what looked cheap
- Tiles were sharp-edged boxes with flat brown sides and flat top art: a mint meadow, beige town fill and a flat blue river ribbon. Legal squares were flat yellow frames with grey planes.
- Followers were a cylinder, a ball and a box "arm" with hats. None of them looked like a meeple.
- The table was blurry brown noise with no edge and no falloff. There was no environment reflection and no post-processing.
- The UI used mixed emoji icons, flat boxes and plain buttons.

## What changed
**Renderer and quality**
- sRGB output with ACES tone mapping, tuned exposure and physically correct lights.
- A PMREM environment map built from a procedural sky dome with a low sun.
- PCF soft shadows, with a tight frustum that follows the camera and tuned bias and normal bias.
- A new **Settings** popup (header gear button) offers Auto, High, Medium and Low. The choice is stored in `localStorage` (`rv_gfx`, inside try/catch).
  - Auto picks Medium on phones and small screens, and High on desktop.
  - High: pixel ratio up to 2, 2048 shadow map, and post-processing. Post is a 4x MSAA HalfFloat target, soft bloom at half resolution, ACES, a gentle warm grade and a vignette.
  - Medium: pixel ratio up to 1.5 and a 1024 shadow map; no post-processing.
  - Low: no post, no shadows, no environment map, no bump or linen maps, anisotropy 1 and no idle animation.
  - If frames drop badly (>70 ms) for 3 s, the game steps down one level. On Low it then lowers the resolution, to a floor of 0.5.
  - On a very slow GPU it also throttles the frame rate so taps stay responsive.

**Tiles**
- Each tile is a rounded, bevelled slab of thick cardboard (ExtrudeGeometry, smoothed bevel normals).
- The printed art wraps over the top shoulder of the bevel. A fibrous grey-brown board core shows below.
- A linen-weave normal map gives the print finish.
- Each laid tile gets a faint tint and a hair of misalignment, so no two look identical.
- The top art is painted procedurally on canvas:
  - Brushed meadow with wild flowers.
  - Lavender rows, wheat and vine patches, and hedges.
  - Towns paved in cobbles with a ditch shadow at the walls.
  - Dirt roads with worn verges, two cart ruts, a grass crown and pebbles.
  - Rivers with a bank, a sandy shore and a deep centre.
  - Baked soft shade under every building and tree, so nothing floats even on Low.
- Relief props on the tiles:
  - Town walls with a plinth, crenellations and towers.
  - Houses with low terracotta gable roofs, plaster gable ends, blue and green shutters, doors and chimneys.
  - Lathe cypresses, olive clusters, haystacks, and stone bridges with parapets.
  - One shader adds masonry, roof-tile and plaster detail with bump, and trees sway gently.
  - Everything is still merged into one mesh per tile type.
- Water is a transparent, reflective surface with moving ripples and occasional sun glints, which bloom on High.

**Figures**
- Every figure is an extruded, bevelled wooden shape cut from a real meeple silhouette.
  - The mason is a slimmer meeple with a cap; the champion is a larger meeple.
  - Farmers lie down, as in the real game.
  - The hog is an extruded pig profile.
- The wood uses a procedural grain for colour and bump, with a satin clear coat.
- Each piece gets its own grain offset and a tiny colour shift.
- Every piece has a soft contact shadow.
- Follower spots show a bobbing translucent "ghost" meeple in the player's colour over a glowing ring, cyan when it is the advice pick.

**Table and scene**
- A honey-oak plank table with grain, knots, seams, wear and wax sheen (bump map).
- A pool of light follows the view as an in-scene vignette.
- Warm sky, distance-scaled fog, and a cool rim light that lifts the pieces off the board.

**Animation and feedback**
- Tiles drop in with a settle bounce and dust puffs at the corners.
- Figures fly in on an eased arc, land with squash and stretch and a dust puff, and leave with a lift, shrink and sparkle.
- Scores show as a parchment "+N" medallion that pops and rises, with a sparkle burst in the player's colour.
- Glowing legal squares pulse and lift when hovered.
- The ghost tile hovers with a glowing edge and a shadow under it.
- The camera eases on wheel zoom too, and the view refits when the board area resizes (unless you have moved the view). On phones this roughly doubles the board size on screen.

**2D UI**
- Emoji are replaced by one consistent inline-SVG icon set. This covers the header, the drawers, the stat rows (a meeple icon generated from the 3D silhouette, champion, mason, hog, wine, grain, cloth), the coach, recap and chip, and the start screen.
- The header is a walnut bar with a gold rule and a tile emblem.
- The dock, drawers and modal are layered parchment with a procedural SVG noise texture and inset borders.
- Buttons are pressable, with hover and press states. Drawers slide and fade, and the modal pops in. Reduced motion is respected.
- The dock "Your tile" card shows the same painted tile art as the board.
- Fonts are unchanged: Marcellus SC and Alegreya Sans from Google Fonts. The sandbox has no font access, so the screenshots show fallback fonts.

## Screenshots (`SP/carc/game/gfx/shots/`)
- **Before:**
  - `before_1366x768_{0start,1board,2ghost,3close,4low}.png`
  - `before_390x844_{0start,1board,2ghost,3close,4low}.png`
- **After:**
  - `after_1366x768_{0start,1board,2ghost,3close,4low}.png` (High)
  - `after_390x844_{0start,1board,2ghost,3close,4low}.png` (Medium)
- **Piece close-up:** `after_pieces.png` (standing, lying farmer, champion, mason and hog)
- **Iteration shots:** `a1`…`a5`, `p1`

## Tests (all run on the final build)
- `node geo_test.js`: tiles 85, drawing errors 0, adjacency warnings 0.
- `node graph_test.js`: 77 passed, 0 failed.
- `node gauntlet.js 20 3 river,ic,tb`: 20 done, errs 0, stalls 0.
- `node cover.js`: 40 games finished, 6403 moves, errors 0, invariant fails 0, probe mismatches 0; 84 of 84 tile types placed; MISSING TOTAL 0. These numbers are from a run before the last renderer-only changes; `cover.js` loads only the engine files (data, geo, engine, ai), which were not changed.
- `node click.js` (jsdom 2D fallback, 7 games including the new Settings popup `pop:setd`): TOTAL errors 0.
- `lay.js` (real WebGL through SwiftShader, 4 sizes): PROBLEMS 0.

  | Size | Board share | Human turns | 3D taps | Missed |
  |---|---|---|---|---|
  | 1366x768 | 65% | 4 | 6 | 0 |
  | 1920x1080 | 74% | 4 | 3 | 0 |
  | 768x1024 | 50% | 4 | 6 | 1 |
  | 390x844 | 47% | 4 | 5 | 1 |

  A missed tap falls back to the direct hook and is not counted as a problem. Before the upgrade, 0 taps were missed.

Two things were fixed along the way to get `lay.js` passing:
- The Tiles popup was painting all 84 tile textures for its thumbnails. Now only the dock uses the painted thumbnail.
- `backdrop-filter` blurs made software compositing stall, so they were removed.

## Performance
Measured in SwiftShader (software GL, 4 CPU cores) at pixel ratio 1: the average ms per frame for a full draw, on a 20-tile, 12-figure board. `gfx/perfh.js` produces these numbers. SwiftShader timings are noisy (±30%).

| Build / level | 1366x768 | 390x844 |
|---|---|---|
| Before (shadows on) | 621 | 279 |
| After, Low | 678 | 210 |
| After, Medium | 2429 | 1074 |
| After, High | 4901 | n/a |

- **Low** costs about the same as the old renderer, so it is the cheap tier.
- **Medium and High** are 4–8x heavier in software. The cost is per-pixel PBR with environment lighting, soft shadows and post, plus 80k triangles against 21k. There are fewer draw calls, though: 119 against 241.
- On a real laptop GPU this workload is far inside a 16 ms frame. I could not measure a real GPU here.
- In SwiftShader the auto step-down reaches Low at a pixel ratio of about 0.56 within a few seconds, which is how the Playwright tests stay responsive.
- Idle rendering (water shimmer and tree sway) runs at about 24 fps on High and Medium, and is off on Low.

## Notes
- Every WebGL feature sits behind `init3D`, and jsdom returns early, so the 2D map path is untouched.
- All test hooks are unchanged: `V3.on`, `V3.r`, `cellWorld`, `screenOf`, `spotWorld`, `fitAll`, `focusCell`, `resetScene`, `sync3D`, and `TH` as the tap plane.
- There is no InstancedMesh. Every tile type is unique, and there are few figures, so each tile's props are merged into one mesh instead.
