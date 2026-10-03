# Sunglaze graphics upgrade report

The built file is `sunglaze.html` (833 KB, single file, Three.js r158 inlined). I changed only rendering, materials, models, animation and UI styling. The rules, engine state, AI, test hooks and the jsdom/SVG fallback are unchanged.

## What was cheap before (from the BEFORE shots)
- Tiles were flat-lit and had no reflections. They had a painted white "gloss" stripe instead of a real highlight.
- The kilns were flat cream and teal plates, not terracotta.
- The player boards were a raw box with a flat texture and no real slots.
- The runner was a flat plane, and the table a flat box with a stripe texture.
- The clay sack was a purple sphere, and the shard box was bare boxes.
- Highlights were additive yellow planes that blew out the whole kiln and board area.
- The UI used emoji icons and flat buttons and panels.

## What changed
**Renderer and lighting (`src/three3d.js`)**
- sRGB output, ACES tone mapping and physical lights.
- A warm sun key light with PCF soft shadows, a normal bias, and a shadow frustum fitted tightly to the layout.
- A cool sky/terracotta hemisphere fill, plus a cool rim light.
- A procedural "courtyard studio" environment (sky dome, softboxes, arcade openings) baked through PMREMGenerator. Only glossy pieces use it: glaze, brass, clay, plaques and fruit. This keeps big matte surfaces cheap.

**High-quality post pipeline (hand-written, no example ports)**
- The scene renders into an MSAA 4x half-float target.
- Then: a bright pass, a two-level separable blur for bloom, ACES, a light colour grade, a vignette and dither.
- When post-processing is off, a CSS vignette is used instead (`pointer-events:none`).

**Tiles**
- Rounded, bevelled extrusions with correct cap and side UVs.
- MeshPhysicalMaterial with clearcoat, plus a clearcoat normal map for hand-glazed unevenness.
- Per-tile surface detail:
  - a normal map with a raised motif, cuerda-seca ridges and crackle grooves;
  - a roughness map;
  - crazing, iron specks, glaze pooling, and a manganese outline on the motif.
- Each glaze has 3 texture variants, and each tile gets a small random rotation, so no two tiles are identical.
- The sides are glazed, with an unglazed biscuit foot and a drip line.
- Prism tiles are iridescent.
- Every tile has a soft contact shadow.

**Kilns**
- Lathe-turned terracotta discs with a rolled lip and a white-slip band with cobalt waves.
- A painted slip rosette on the floor, with incised grooves in the normal map and a stamped number cartouche.
- A blob shadow under each kiln.

**Player boards**
- Dual-layer boards: a printed base plus a punched top layer with 47 bevelled slot cut-outs.
- The slot walls show a grey-brown card core, and the recesses have painted ambient occlusion.
- The print has a linen normal map.
- New printed design:
  - a cobalt border with gold stars;
  - a player-colour header banner that glows on your turn;
  - a gold score medallion;
  - row medallions, and red penalty medallions on the breakage line.

**Table and scene**
- A rounded walnut table with procedural plank colour, roughness and normal maps, standing on turned lathe legs.
- A deep-cobalt embroidered linen runner.
- A limestone courtyard medallion with a carved rim and an inlaid sunburst.
- Terracotta pavers with glazed star inserts and normal and roughness maps.
- Potted lemon shrubs, with leaves and fruit as InstancedMesh.
- The clay sack is a sculpted lathe hessian sack with a stencilled sun and a rope tie.
- The shard box is a wooden crate with brass corners. It fills with glazed shards as the box count grows.
- The sun token is a brass rim with an enamel top.
- The label plaques are ceramic.
- Before a game starts, the table is shown behind the start screen instead of an empty void.

**Animation and feedback**
- Tiles move on cubic-eased arcs with a tilt, then a landing bounce.
- Particles: glaze-coloured sparkles when a tile is set into the mosaic, and dust puffs on the racks and the breakage line.
- A floating "+N" score pop appears when a mosaic tile lands (hooked from `playFx` via `V3fx`).
- Highlights are now crisp shader outlines with a soft glow: rounded rectangles for slots, rings for kilns. Selected tiles lift and glow.
- Idle life on High: dust motes drift through the sunlight. This only runs while frames are smooth.

**Graphics setting**
- A new bar button cycles Auto, High, Medium and Low. The choice is stored in localStorage under `sgz_gfx`, inside try/catch.
- Auto picks Medium on phones and small or coarse-pointer screens, and High on desktop.
- In Auto, if frames stay under about 24 fps for 3 seconds, it steps down one level. This happened in the swiftshader tests, where the label read "Auto · Low".
- What each level turns off:

| Level | Pixel ratio | Shadows | Post-processing | Environment map | Clearcoat / iridescence |
|---|---|---|---|---|---|
| High | up to 2 | 2048 | on | on | on |
| Medium | up to 1.5 | 1024 | off | on | on |
| Low | 1 | off | off | off (brighter hemisphere instead) | off |

**2D UI (`body.html`, `head.html`, `ui.js`, `sound.js`, `art.js`)**
- An inline-SVG icon sprite replaces the bar, drawer and dock emoji: guide, players, log, tiles, rules, sound, music, speed, pause/play, new game, graphics, resize, hide, bulb, person, computer, trophy.
- The bar has a zellige-patterned glazed cobalt background with a gold trim and a gold-gradient title.
- Panels, dock, drawers and modal use a paper-noise texture with layered gradients and inset highlights.
- Buttons have hover-lift and press states.
- The modal has a pop-in animation and a blurred backdrop, and drawers slide on an eased curve. Reduced-motion is respected.

**Fixes found on the way**
- A new global `draw()` collided with the engine's `draw()`. I renamed mine to `drawFrame3D`.
- Texture canvases are now CPU-backed (`willReadFrequently`), and noise is baked into fields. This cut page load from about 11 s to about 2.5 s.
- The canvas CSS size now follows its parent (100%). This fixed a transient "covered" failure in the layout test at 768x1024.

## Screenshots (`shots/gfx/`)
- BEFORE: `before_1366x768_{0start,1table,2select,3close}.png`, `before_390x844_{0start,1table,2select}.png`
- AFTER (High): `after_1366x768_{0start,1table,2select,3close}.png`, `after_390x844_{0start,1table,2select}.png`
- Side by side: `cmp_1366_table.png`, `cmp_1366_close.png`, `cmp_390_table.png`
- Medium and Low stills: `a4_1366x768_medium.png`, `a4_1366x768_low.png`
- Start screen: `a4_1366x768_medium_start.png`
- 3-player before/after from the layout test: `shots/final_1366x768_3refd.png` (before) and `shots/gfxfinal_1366x768_3refd.png` (after)

## Tests (final build)
| Test | Result |
|---|---|
| `run_gauntlet.sh` | 18 configurations, 800 games, 800 done, errs=0, stalls=0 in every configuration |
| `cover.js` | 60 games finished, 5224 moves, 0 errors, 0 invariant fails, 0 rules missing in play; 19 scenario PASS, 0 FAIL |
| `click.js` (jsdom, 2D fallback) | 7 games, TOTAL errors 0; every action type exercised (advice, coach toggle, map and buttons, all four popups) |
| `lay.js '{}'` | 1366x768, 1920x1080, 768x1024 and 390x844 all ok; PROBLEMS 0; 0 errors; board covers 65 / 74 / 52 / 51 % of the screen; 1 missed 3D tap at 1366x768, which the test retried through the dock (0 at the other sizes) |
| `lay.js` unmarked-mosaic, 14 turns, 1366x768 | PROBLEMS 0 |

The first full layout run showed one transient covered-board problem at 768x1024. I fixed it (canvas CSS size) and re-ran: PROBLEMS 0.

## Performance
Swiftshader software rendering, ms per frame including a readback. I measured before and after in the same session and game state.

| View | Before | High | Medium | Low |
|---|---|---|---|---|
| 1366x768 | 1663 | 4064 | 2669 | 1923 |
| 390x844 | 410 | 994 | 834 | 527 |

- Draw calls are about 252 (before: 186). Triangles are about 57k (before: 11k). Most of the triangle increase is bevelled tiles and the lathe pieces.
- Low is within about 1.2–1.3x of the old renderer. Medium is 1.6–2x, and High is 2.4x under swiftshader.
- Where the cost goes: the heavy parts are the environment-mapped pixels and the physical clearcoat. Medium keeps both; Low turns both off.
- These are software-rendering timings. I have not measured a real GPU, so the 60 fps target on a laptop is not confirmed.
- The loop still renders only while something moves or glows.

I did not publish anything or make any commits.
