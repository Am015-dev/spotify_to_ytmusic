# Crown City Smash: graphics upgrade report

Build: `python3 build.py` writes `kot2.html` directly (1,053,868 bytes, 1.05 MB; the limit is about 4 MB). `node --check x.js` passes.
No rules, engine state, AI or networking code changed. `net.js`, `engine.js`, `ai.js` and `data.js` are untouched.

## What changed

### Renderer (`three3d.js`, rewritten; every external hook is kept)
The kept hooks are `init3D`, `sync3D`, `V3.on`, `V3.fxSeen`, `V3.mons[k].g`, `popLabel`, the dice click path, `seatInfo` and the SVG fallback.
- Colour and tone: sRGB output, ACES filmic tone mapping (exposure 0.92) and physically correct lights.
- Image-based lighting: a PMREM environment built from a custom dusk studio scene (sky gradient, a warm softbox, and magenta and cyan neon panels).
- Lighting:
  - a warm key light with PCF-soft shadows, a tight frustum (±19/17), bias −0.00035 and normalBias 0.025;
  - a cool hemisphere fill;
  - magenta and cyan rim lights, like neon spill;
  - dusk fog.
- Post-processing on High only, as a small hand-written pipeline with no module ports:
  - the HDR scene renders into a 4× MSAA half-float target;
  - a soft-knee bright pass, then a 3-level separable blur for bloom;
  - a composite pass adds a slight colour grade, vignette and dither, then tone mapping.
- Graphics quality setting: the menu has a new "Graphics" row that cycles Auto / High / Medium / Low. It is stored in `localStorage` under `ccs_gfx`, wrapped in try/catch.

  | Level | Pixel ratio | Shadows | Post-processing | Environment map |
  |---|---|---|---|---|
  | High | ≤2 | 2048 | bloom, vignette, MSAA | on every PBR material |
  | Medium | ≤1.5 | 1024 | none | on the hero pieces only (figures, dice, brass, crown, water) |
  | Low | 1 | off (the blob shadows stay) | none | none |

  - Auto picks Medium on phones and small screens, High on desktop, and Low on software GPUs (SwiftShader, llvmpipe).
  - If the frame rate stays under 24 fps for a 3-second window, the level steps down automatically.
  - `?gfx=high|medium|low` pins a level, for screenshots.
- jsdom and no-WebGL: `init3D` still returns false, the SVG board renders as before, and `cycleGfx` and `gfxLabel` are safe without WebGL.

### Monsters: painted vinyl collectibles
- Materials: every figure uses `MeshPhysicalMaterial` with clearcoat, a painted mottling map and a roughness breakup. Airbrushed shading is baked into vertex colours (darker toward the feet and on undersides). The black outline hulls are gone.
- Sculpting:
  - tapered tentacles, legs, tusks and tails;
  - lathe-turned snouts and a mushroom cap with a lip and gills;
  - rounded-box robot parts, bevelled bolts and wings;
  - glossy eyes with pupils and catch-lights;
  - capsule brows and belly patches.
- Glow details: Magmaw has glowing lava cracks (an emissive map). Boltbox, Glacyx and Bramblebat have emissive eyes.
- Every figure stands on a lacquered display base with a coloured rim light, a brass bezel and a soft contact shadow.
- A knocked-out figure tips over on its base.

### Dice: rounded resin dice with engraved symbols
- Geometry and texture: a RoundedBoxGeometry port, including its per-face UV mapping. Each face has a 256px canvas with a resin gradient and swirl, paint-filled symbols with an inner engraving shadow, and a normal map made from a blurred height mask, so the symbol is recessed.
- Materials: clearcoat physical. Kept dice turn amber resin. The berserk die is red resin and the Omen Die is sand/gold.
- Tray: dice land in a lacquered walnut tray with a felt bed.
- Motion and feedback: blob shadows follow the dice height, and landing throws a dust puff. Hovering a die lifts it slightly and shows a pointer cursor; clicking pulses it.
- Fonts: the face textures rebuild once web fonts load.

### City: a miniature skyline at dusk
- Buildings: about 90 procedural buildings (plain slabs, setback towers, round towers with domes, and low shops with awnings) merged into a few draw calls with a small geometry "Bag" merger.
  - The facade atlas has lit warm, cool and pink windows as an emissive map, recessed frames as a normal map, and glass/wall roughness.
  - Cornices, rooftop water towers, AC units and antennas; the red aviation lights blink in two phases.
- Neon: 16 original neon words (HOTEL, RAMEN, ARCADE, and so on) in one atlas. They go on facades and roof billboards and flicker.
- Downtown: a stepped display pedestal with painted bands, brass trim, a marble top and a glowing ring. Behind it is a DOWNTOWN marquee with a neon face and chaser bulbs.
- Plaza: radial stone setts with a normal map, a bevelled curb and a brass inlay. Instanced street lamps have warm light pools. Clustered low-poly trees.
- Harbor: stone quays, glossy water with a scrolling normal map (cheaper than the old per-frame vertex normals), a plank pier with posts and rope, a bobbing tug and blinking buoys.
- Backdrop: a sky dome with a sunset glow and twinkling stars, two far skyline silhouette bands with tiny lit windows, and painted dusk clouds.
- Streets: asphalt with lane dashes, curbs and crosswalks.

### Animation and feedback
- Hops are eased with a landing squash and a dust burst.
- Stars now add sparkles, and the particles are glossy and spin.
- The camera eases to its framing instead of snapping.
- Idle life: bobbing figures, flickering neon, blinking lights, drifting clouds, water shimmer and a bobbing boat.

### 2D UI (`polish.css`, new and added to `build.py`; small markup changes in `body2.html` and `ui.js`)
- Top bar: a dusk-gradient bar with a skyline silhouette and a neon edge, and the title as a neon sign.
- Icons: the emoji in the top-bar buttons (Cards, Yours, Monsters, Log, Menu) are now inline SVG icons.
- Buttons have enamel gradients with hover and press states. Panels and drawers are layered paper with a subtle texture and a soft drop shadow. Drawer headers are dusk-coloured.
- The dock dice buttons are ivory or amber resin to match the 3D dice.
- Power cards now have a printed frame by type, a title bar with a cost gem, an art window (halftone and skyline behind the icon), a type line and a text box. The compact buy rows and owned cards get matching trim.
- The name plates and HUD chip are glossy plaques.
- The start-screen monster picker shows portraits rendered from the actual 3D vinyl figures, tone-mapped offscreen. The SVG art stays as the fallback in jsdom and on software GPUs.
- The dialog entrance animation is transform-only, and the drawer transition is unchanged, so nothing is ever invisible or lingering.

## Screenshots
All paths are under `SP/gfx/`, where SP is the scratchpad.

| Before | After |
|---|---|
| `before/1366x768-start.png` | `after/1366x768-start.png` (3D portraits) |
| `before/1366x768-game.png` | `after/1366x768-game.png` (High) |
| `before/390x844-start.png`, `before/390x844-game.png` | `after/390x844-start.png`, `after/390x844-game.png` (Medium, the phone auto level) |
| `before/1366x768-market-popup.png` (older layoutcheck shot) | `after/1366x768-market.png` (card frames) |
| — | close-ups: `after/1366x768-closeup.png` (figures), `after/1366x768-dice.png` (engraved dice), `after/1366x768-city.png` (neon and skyline) |

The Low level is in the layoutcheck shots (SwiftShader auto-picks Low): `layout-after/*.png`, for example `1366x768-5-buy.png`.

Honest remaining nits:
- The Google fonts fail to load in this sandbox (a certificate error), so the shots use fallback fonts.
- The plaza pavers are still a little busy.
- Low has no environment reflections, so the figures are flatter there.

## Tests (final build)

| Test | Result |
|---|---|
| `node scripts/rulestest.js kot/kot2.html` | passed 27, failed 0 |
| `gauntlet.js` (20 games, 50 turns) | 20/20 finished; errors 0, invariant violations 0, stalls 0 |
| `gauntlet.js`, all expansions, 5 players, SEED=2200 (20 games; run before the last CSS-only fixes) | 20/20 finished; errors 0, invariant violations 0, stalls 0 |
| `uiclick4.js` (solo and hot seat) | TOTAL clicks 701, rejected 0, errors 0, invariant violations 0 |
| `nettest.js` (2 clients) | lobbyOK true, started true, clientsAgree [true, true], errors [] |
| `kot/layoutcheck.js` | ALL PASS: 1366x768 (59 checks), 1920x1080 (39), 768x1024 (68), 390x844 (62); 0 fails, 0 console errors |
| `coverage.js` (1 forced game per item, 12 turns) | 230 items; errors/invariant problems 0; 19 never fired in this one-game sample (the earlier baseline used 2 games per item and had 6 never fired; the engine is unchanged) |

The first layoutcheck run found 3 failures: a drawer stayed visible just after closing, because I had added a `visibility` transition. I removed that transition and the rerun passed at all 4 sizes.

Baseline before the change: rules 27/0, gauntlet (12 games) 0 errors, clicker 782 clicks with 0 rejected and 0 errors, nettest with no errors. The baseline outputs are in `gfx/tests-before/`.

## Performance
Measured with `gfx/bench.js`: SwiftShader (CPU), 1366x768, the render loop stopped, the average of 4 single frames with a pixel read-back to sync. The game is mid-turn with 4 monsters.

| Build | ms per frame | Draw calls | Triangles |
|---|---|---|---|
| Before (toon) | 1655 | 444 | 42k |
| After, Low | 1524 (cheaper than before) | 230 | 135k |
| After, Medium | 2250 (1.36×) | 230 | 135k |
| After, High | 5425 (3.3×, bloom + MSAA + full IBL + 2048 shadows) | scene 230 + 8 post passes | — |

- The city merge roughly halved the draw calls.
- On SwiftShader, image-based lighting was most of the cost (about 4 s of 6.4 s before I made it per-level), which is why Medium keeps it on the hero pieces only.
- High targets real GPUs, where these passes are cheap. The frame-rate watchdog steps down if they are not.
