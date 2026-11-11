# Nebula Aces: graphics upgrade report

**Build:** `python3 build.py` writes `SP/xw/nebula.html`. The file is 1,035,927 bytes (about 1.0 MB; the limit is about 4 MB), md5 `46bb1df1e5916cb93f161d6dd7f54430`. `node --check x.js` passes.

**Untouched:** the round flow and its guidance. `flow.js` is byte-identical to the pre-upgrade backup, and so are `engine.js`, `ai.js`, `data.js`, `exp.js`, `geo.js`, `guide.js` and `story.js`. No rules, engine state or AI changed.

**Backup of the old sources:** `SP/xw/bak/gfx-before/`.

## What looked cheap before
Screenshots are in `SP/xw/gfx/before/`.
- **Ships:** a few raw boxes and cones with flat materials. The engine glow sprites blew out to white discs. The bases were flat black boxes.
- **Asteroids:** flat-shaded, crumpled, spiky blobs, with no craters and no material.
- **Backdrop:** a canvas sky with blotchy gradient blobs and square pixel stars. There was no planet, and there was an empty void under and around the mat.
- **Mat:** a dark translucent square with hairline grid lines.
- **Maneuver ghosts:** flat, opaque-looking ribbons with 1 px outlines.
- **Dice:** coloured squares with a unicode glyph.
- **Renderer:** no shadows, no environment map, no post-processing.
- **UI:** plain flat panels, and emoji in the top bar and dock (📜 ❔ 🎵 ⏩ 💡 🔊 📘 🧭 ⚙).

## What changed

### Renderer (`three3d.js`, rewritten; every external hook is kept)
The kept hooks are `init3D`, `sync3D`, `drainFx`, `drawGuides`, `camView`, `fitCam`, `placeEl`, `pop`, `resize3D`, `W`, `V3.on/ships/anim/camera/r/labels`, `matPick` picking, the name tags and the SVG fallback.
- **Colour and tone:** sRGB output, ACES filmic tone mapping (exposure 1.05) and physically correct lights (`useLegacyLights=false`).
- **Image-based lighting:** PMREM from a custom "space studio" scene (a nebula-tinted gradient, a warm key softbox, and magenta and cyan panels), set as `scene.environment`.
- **Lights:**
  - a warm-white key light with PCF-soft shadows: a tight ±58 frustum over the mat, bias −0.0004, normalBias 0.04;
  - a cool hemisphere fill;
  - magenta and cyan rim lights (nebula spill);
  - one permanent point light for explosion flashes, so no shader recompiles.
- **Post-processing on High only,** as a small hand-written pipeline with no module ports:
  - a 4× MSAA half-float HDR target;
  - a soft-knee bright pass and a 3-level blur for bloom;
  - a composite pass with a colour grade, vignette and dither, then tone mapping.
- **Graphics setting:** a new "Graphics" button in the settings row (under ⚙ on phones) cycles Auto / High / Medium / Low. It is stored in `localStorage` under `na_gfx` with try/catch. `?gfx=high|medium|low` pins a level.

  | Level | Pixel ratio | Shadows | Post-processing | Other |
  |---|---|---|---|---|
  | High | ≤2 | 2048, PCF-soft | bloom, vignette, grade, MSAA | all gas layers |
  | Medium | ≤1.5 | 1024, PCF | none | half the gas layers |
  | Low | 1 | off (blob contact shadows stay) | none | no IBL, no gas, a third of the stars, opaque mat plate, no pebbles or atmosphere shell, lower rock detail |

  - Auto picks Medium on phones and small screens, High on desktop, and Low on software GPUs (SwiftShader, llvmpipe).
  - If the frame rate stays under 24 fps for a 3-second window, the level steps down one step.

### Backdrop
- **Nebula dome:** a domain-warped fbm nebula baked once on the GPU into a 2048×1024 half-float texture. It has pink, blue and gold gas, dark dust lanes, bright emission knots, and a galactic band. Drawing it costs one texture fetch per pixel.
- **Gas layers:** 16 large, slowly turning additive sprites below and around the mat, which parallax for depth.
- **Stars:** three shells (far, mid, and near-below-the-mat) drawn as round, soft, twinkling points in varied colours, with cross-spikes on the brightest stars.
- **Ice giant:** a baked banded texture with a storm, lit by the key light, with a fresnel atmosphere shell glowing on its lit limb.
- **Moon:** a small cratered moon.

### Holographic play mat
- A dark glass plate that receives shadows.
- An additive shader grid:
  - range-1 (100 mm) major lines and 25 mm minor lines;
  - intersection dots, ruler ticks along the edges and an edge glow;
  - a slow scan sweep and a centre-weighted fade;
  - deployment bands tinted in each side's faction colour.
- A glowing frame with brass corner emitters.

### Ships: detailed original miniatures
- **Construction:** all 11 models are rebuilt from a parts kit (lathe fuselages, bevelled extruded plates, nozzles, canopies and greebles). The parts are merged into one mesh per material, about 8 draw calls per ship.
  - **Compact Lancer:** a pointed central lance, two gun booms on swept wing plates, canards and three engines.
  - **Armada Talon:** a faceted arrowhead with raked blade fins, a crystal canopy and one hot engine.
  - **The other nine:** the Razor, Maul, Anvil, Needle, Kestrel, Keel, Warden gunship and Herald shuttle each have their own silhouette. Maul and Anvil get ordnance pods.
  - **Changed to avoid film look-alikes:** the freighter was a disc with front prongs and is now a boxy hauler with cargo pods, a forward bridge and a dorsal turret. The shuttle no longer has a tall dorsal fin; it is an inverted-gull delta.
- **Materials:** a procedural hull texture set with panel lines, rivets, weathering streaks and per-panel colour, height and roughness variation (colour, roughness and normal maps). The same texture set gives faction trim paint, gunmetal and clearcoat glass canopies.
- **Engines:** bell nozzles with hot cores, glow sprites and additive exhaust plumes. The engines flicker and flare while the ship moves.
- **Lights:** blinking nav lights.
- **Bases:** glossy black bevelled plastic bases.
  - Each base carries a printed pilot token: the firing arcs, with a turret ring or a rear arc where the ship has one, a skill disc and the pilot name plate.
  - A faction-coloured rim glows under each base.
  - A clear acrylic peg rises from a socket, and a soft blob shadow sits under the base.
  - The selected or active ship lifts slightly, and its rim pulses.
- **Shields:** an ellipsoid shield bubble with fresnel and hexagon cells, and a ripple spreading from the impact point, shimmers on shield hits.

### Asteroids
- **Shape:** an icosphere (detail 5) displaced by fbm plus fine grit, with sculpted impact craters (bowls with raised rims) and smooth normals. Each rock keeps the rule footprint profile.
- **Surface:** PBR rock with vertex-colour variation, darker inside the craters.
- **Motion:** a ring of instanced pebbles orbits each rock. The rocks wobble gently instead of spinning, so the visual footprint stays true to the rule shape.

### Guides
- **Maneuver ghosts:** translucent additive ribbons with bright edges, a soft core and chevrons flowing along the move.
- **Final pose:** a glowing footprint frame with a faint fill and a heading line.
- **Firing arcs:** gradient sectors with glowing range edges.
- **Firing lanes:** animated dashed laser lines.

### Effects
- **Bolts:** glowing laser bolts with a hot core, a halo and a head flare, fired from the nose, plus muzzle flashes.
- **Timing:** hits now land when the bolt arrives. Shield, hull, crit and miss effects are delayed to match.
- **Hits:** sparks with flare sprites, plus hull debris.
- **Explosions:** a flash with a point-light burst, a fireball, smoke, a shockwave ring, 16 tumbling hull fragments that bounce on the mat, and embers.
- **Landing:** a dust puff and a bounce.
- **Camera:** switching views eases the camera over 0.7 s; resizes still snap, so the mat always fits. `V3.slowmo` exists for capturing effects and defaults to 1.

### Dice
- **Faceted SVG d8:** `die()` in `ui.js` now draws a faceted octahedron (front face plus three side facets) with its symbol engraved (shadowed inset plus paint fill). This works everywhere, including jsdom.
- **Rendered 3D d8:** with WebGL, real 3D dice replace the drawing: flattened octahedra with clearcoat, each face's symbol engraved through a normal map. They are rendered offscreen and tone-mapped on the CPU for each face and colour.
- **Animation:** a roll-in animation (transform only; off with reduced motion).

### 2D UI (`polish.css`, new and added to `build.py`; small markup changes in `ui.js` and `body.html`)
- **Icons:** consistent inline-SVG icons replace every emoji in the top bar, the dock head, the view bar and the "All" button. A MutationObserver swaps the glyph, so `flow.js` stays untouched.
- **Panels and buttons:**
  - enamel buttons with hover lift and press states;
  - cockpit-glass dock and drawers (layered gradients, a noise texture, edge highlights, shadows);
  - a gold gradient title;
  - bevelled keycap dial buttons;
  - glass name tags with a faction edge;
  - a dialog entrance animation (transform only).
- **Pilot cards (Squads drawer):** a frame with a title bar and a skill gem, an art window (a rendered 3D portrait of the ship on a real GPU; an SVG silhouette otherwise), a type line, a stat bar and a text box.

## Screenshots (all in `SP/xw/gfx/`)
- **BEFORE:** `before/1366x768-{start,plan,dice,closeup,closeup2,horizon}.png` and `before/390x844-*.png`.
- **AFTER (High):** the same names in `after/`.
- **Model gallery (all 11 ships):** `after/models.png` and `after/models_c.png`.
- **Side by side:** `after/cmp_1366x768-{plan,dice,closeup,horizon}.png` and `after/cmp_390x844-plan.png`.
- **Effects (slow motion):** `fx/laser.png`, `fx/shield.png` and `fx/boom1.png`.
- **Auto / Low look, from the layout run:** `SP/xw/shots/*.png`.

## Tests
Every test below ran on the final build (md5 above). The outputs are in `SP/xw/gfx/final/`.

| Test | Result |
|---|---|
| Unit tests (`unit.js`) | **27 ok, 0 failed** |
| Geometry check (`geotest.js`) | runs clean |
| Gauntlet, Core (`gxw2.js`, 20 games) | 20/20 finished (10–10), **0 errors** |
| Gauntlet, Standard 100, all waves (20 games) | 20/20 finished (12–8), **0 errors** |
| Gauntlet, Standard, long time budget (10 games) | 10/10 finished, **0 errors** |
| Coverage, computer play (`cover.js`) | pilots 35/35 and upgrades 57/57, **0 with errors** |
| Coverage, human path (`coverh.js`, 3 shards each) | pilots and upgrades, all 6 shards **0 errors, 0 rejected, 0 stalls** |
| Clicker (`uixw.js`), solo | **0 errors** (animations off and on) |
| Clicker, hot-seat | **0 errors** |
| Clicker, solo with guidance (no tour key) | **0 errors**; it clicked through "Continue to Round N" up to round 12 |
| Layout check (`pwshell.js`), 1366×768 / 1920×1080 / 768×1024 / 390×844 | each **fails 0, console errors 0**, reached round 4, **ALL OK** |
| `pwplay.js`, desktop | a full game to a win in round 11, 0 errors |
| `pwplay.js`, phone | a full game to a win in round 9, 0 errors |

Notes:
- **Layout fix during testing.** The phone layout check at first failed "no prompt button visible". The roll-in animation started at opacity 0, and my reduced-motion override lost on CSS specificity. Headless Chromium does not advance animations under a busy WebGL loop, so the dice stayed invisible. The phone dice were also taller than before. The animation is now transform-only, the override is fixed, and the phone dice are compact.
- **Timeouts under contention.** An early run with every test in parallel left 8 Standard gauntlet games at the 60 s limit. Re-run with less contention, all 20 finish.

## Performance
Measured with SwiftShader (software GL) at 1366×768 in a paused battle, 12-frame average (`gfx/perf.js`). SwiftShader is very slow and noisy, so compare the ratios, not the absolute numbers.

| Build | Frame time |
|---|---|
| Before | 134.7 ms (76 calls, 5.2k triangles) |
| After, High | about 435 ms (bloom, soft shadows, IBL; 33 programs) |
| After, Medium | about 420–465 ms (37.7k triangles, 181 calls) |
| After, Low | **200 ms** (24k triangles, 172 calls) |

- **Low profiling:** removing parts one at a time on Low shows about 30 ms of that 200 ms is the HTML name-tag layout, which was already in the old build.
- **Optimisations made while measuring:** the dome became a plain textured sphere (the bake uses the sphere's own UV layout); Low drops IBL, gas, pebbles and the atmosphere shell, draws a third of the stars and makes the mat plate opaque; Medium uses plain PCF shadows.
- **What Auto does:** it picks Low on SwiftShader and similar software GPUs. On a real laptop GPU these scenes (about 38k triangles and about 180 draw calls) are well inside a 60 fps budget, and the 3-second auto step-down covers weak GPUs.
- **Not measured:** I have not measured a real GPU; the 60 fps claim is an estimate from the scene size.

## Known limits (art director's notes)
- The cream Compact hulls pick up a pink cast from the magenta rim light and nebula environment. It reads as nebula spill, but a slightly cooler key light would make the paint truer.
- Some greebles on the Lancer booms read a little "brick-like" in extreme close-up.
- On software GPUs the pilot-card art window shows an SVG silhouette. The rendered ship portraits are skipped there to keep start-up fast.
