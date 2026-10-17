# Shipwreck Isle: graphics upgrade report

Scope: rendering, materials, models, animation and UI styling only. The rules, the engine state, the AI, the round flow, the plan wizard, the roadmap and every piece of guidance text are unchanged.
- Build: `python3 build.py`, which writes `shipwreck.html` (1,136,077 bytes, well under 4 MB).
- Backup of the sources from before this work: `SP/rc-backup-gfx-1790751373/`.

## What looked cheap before (1366x768 and 390x844)
- **Tiles:** flat toon-shaded hex cylinders with no texture. Unexplored tiles were dark green blocks covered in cones, and fog was a pile of white spheres.
- **Island and sea:** the island was a flat, jagged sand polygon. The sea was a flat-shaded, shiny plane (its normals were recomputed on the CPU every frame), with no foam and no shore.
- **Pieces:** pawns were a capsule with a ball on top. The camp was a few cones and boxes, and the fire was an orange cone.
- **Weather and light:** night only dimmed the scene. Lightning turned the whole screen white. Rain was thin grey lines. There was no environment lighting and no tone mapping.
- **UI:** a plain dark bar with raw emoji, flat paper panels, and flat label chips.

## What changed
### 3D (`three3d.js`, rewritten; same API: `init3D`, `sync3D`, `on3DTile`, `V3.*`, the labels)
- **Renderer:**
  - sRGB output, ACES filmic tone mapping with exposure tuned per mood, and physically correct lights.
  - PCF soft shadows with a shadow box fitted to the island, plus bias and normal bias.
  - A PMREM environment built from a stormy sky dome, and MSAA.
- **Lighting:**
  - A warm key light that is muted in storms and becomes the moon at night, casting blue moonlit shadows.
  - A cool hemisphere fill, a rim back-light, and a cold lightning light.
  - A campfire point light that flickers.
- **Tiles:**
  - Each tile is a thick, bevelled board slab with a strata-textured side.
  - On top sits a sculpted relief cap: a subdivided hex displaced by a per-terrain height field, with normals taken from its slope.
  - Each cap has its own procedural paint, roughness and bump maps, painted from the same height field, so no two tiles look alike:
    - **Beach:** sand ripples, a dark wet rim, a foam line, and a tide pool with water.
    - **River (jungle):** dark layered greens, muddy banks, and a carved channel under glassy water.
    - **Plains:** grass, dry patches and flowers.
    - **Hills:** grass with rock on the slopes.
    - **Mountains:** rock strata, with snow above the snow line.
    - **Face-down (cut off) tiles:** a cracked dark back.
- **Props:** merged vertex-coloured meshes, one per tile.
  - Curved palms with ringed bark, drooping fronds and coconuts.
  - Layered jungle canopies with ferns and bushes, acacias, grass tufts, and noise-sculpted rocks.
  - Fronds and leaves sway in the wind through a shader, and the wind rises in storms.
- **Unexplored tiles:**
  - Dark slate terrain with low relief, rocks and dead snags.
  - Three stacked mist layers drift over them. The mist is a shader that reads a blurred mask of the tiles nobody has seen.
  - When a tile is explored its mist fades off, and the mist thins under the pointer on a tile you can explore.
  - Lightning lights the mist, and fog tokens show as a lighter, violet-tinged mist.
  - A pulsing amber rim marks the tiles you can pick.
- **Island and sea:**
  - A sandy skirt runs from under the tiles down into a lagoon, with wet sand at the waterline, palms, dune grass, driftwood and shells.
  - Reef rocks, distant sea stacks, and the wreck (a half-sunk hull with a broken mast and a torn sail) sit off the start beach.
  - The sea is a shader: rolling waves in the vertex shader, ripple normals, a turquoise lagoon that fades to deep water, sun and moon glints, and fresnel sky reflection.
  - Shore foam and surf lines move toward the beach, using a distance-to-land texture.
  - Storms bring bigger waves and whitecaps.
- **Sky and weather:**
  - A shader sky dome with drifting clouds, a sun break by day, and a moon, halo and twinkling stars at night.
  - Storms thicken and darken the clouds, and low storm scud races across the view.
  - Lightning is a jagged, bloomed bolt out over the sea, with a strobing flash that lights the clouds from its direction.
  - Rain streaks slant with the wind, and snow drifts. Both run on the GPU.
- **Camp:**
  - A stone fire ring with logs, shader flames (additive, so they bloom), glowing coals, rising embers, and a curl of smoke.
  - A tarp tent, or a log lean-to once the shelter is built, with thatch layers for the roof level.
  - Sharpened, lashed palisade stakes, and a log pile.
- **Pawns:** painted resin miniatures with a clearcoat finish.
  - Each stands on a round base with a ring in its player colour, with a sculpted body, belt, arms, head and hair, and eyes.
  - Each character has a prop: the explorer's hat, the soldier's helmet and spear, the cook's toque, and the carpenter's hammer and cap. Ada has a headscarf.
  - Friday has his own look, and the dog is sculpted with a collar.
  - Every pawn has a contact blob shadow. Pawns hop to their spots, turn to face where they walk, and land with a dust puff.
- **Markers:** painted wooden tokens.
  - Wood sources are log bundles and food sources are fruit piles. An exhausted source gets a slate cover with an X.
  - The totem is carved, with glowing violet eyes. The cave is a rock outcrop.
  - The hexed-scenario cross is wood with a cursed glow ring, the time token is brass, and the temple relic is a spinning emissive gold piece.
- **Motion:** tiles land with a small bounce and a dust puff, the camera eases as before, and weather and night changes blend in real time, so they also finish on slow GPUs.
- **Post-processing (High only):** a HalfFloat MSAA target, soft bloom on the fire, eyes, bolt and relic, ACES tone mapping, a split-tone grade that turns cooler in storms and at night, and a vignette.

### Graphics quality
- **Where to set it:** a new **Graphics** button in the bar (inside the ☰ menu on phones). It cycles Auto, High, Medium and Low, and is saved in `localStorage` (`swi_gfx`, with try/catch).
- **Auto:** picks Medium on phones and small screens and High on desktop. If frames stay over 70 ms for 3 s, it steps down one level (and then lowers the resolution). A level chosen by hand is kept.
- **The levels:**
  - **High:** post-processing and 2k shadows.
  - **Medium:** 1k shadows, no post-processing, two mist layers and a lighter sea mesh.
  - **Low:** no shadows, no post-processing, no environment reflections or bump maps, one mist layer, a 60x60 sea mesh with no ripple normals, no storm scud and no dust puffs.
- **Other savings:** idle animation is capped at about 30 fps and runs slowly behind the start screen.

### 2D UI (`head.html` CSS, `body.html`, `ui.js`, `sound.js`)
- **Icons:** consistent inline-SVG icons replace the bar emoji (camp, log, cards, rules, sound on and off, sea, speed, graphics, new game, menu) and the emoji in the popup headers.
- **Top bar:** tarred-plank gradient with a brass hairline, a gold engraved title, and bevelled buttons with hover lift and a pressed state.
- **Dock:**
  - A sheet of ship's paper with grain and lamp-side light.
  - Glossy amber main buttons with hover and press states.
  - Raised cards for the wizard steps, needs, priorities and results.
  - A glowing marker on the current roadmap step.
- **Popups:** paper texture on the drawers, modals and story pages, an eased drawer slide, and a fade and rise for modals.
- **Island labels:** parchment tags with a pointer. The "? N Explore" tags are dark lantern glass with an amber border and a soft glow, so they stay readable over the mist.

## Screenshots
Scratchpad folder `SP/rcg/`:
- **Before:** `before/{1366x768,390x844}_{0start,1plan,2explored,3camp,4storm,4flash,5night,6tile}.png`.
- **After (High):** `after_high/…`, same names, plus `7close.png` (a close-up of the pawns and camp) and `8wreck.png`.
- **After (Low):** `after_low/…`.
- **Side by side:** `cmp_{size}_{1plan,2explored,3camp,4storm,5night}.png`.
- **Mountain and snow tile:** `mt/1366x768_3camp.png`.
- **Newcomer replay, after:** `np/d*.png` (1366x768) and `np/m*.png` (390x844).

## Tests (final build)
| Test | Result |
|---|---|
| `rules-test.js` | 24 pass, 0 fail |
| `force.js` | 2520 runs, 0 failing |
| `gauntlet.js` | marooned N=20, errs 0 |
| `adv-test.js` | 162 plans, 0 illegal, 0 bad moves, 0 errors |
| `click.js` | 6 games, TOTAL errors 0 |
| `lay.js` (4 sizes) | PROBLEMS 0; the board covers 65% / 74% / 47% / 40% of the screen at 1366 / 1920 / 768 / 390 |
| `np.js` 1366x768 and 390x844 | 48 shots each, errors [] |

**`lay.js` needed one fix:** my first version of the drawer transition delayed `visibility` on close. On the slow software GPU this left a closing drawer over the board, and the dock-minimised check reported "COVERED". I reverted it to the original instant hide, keeping the eased slide in.

## Performance
Average frame time in headless Chrome with SwiftShader (a software GPU, so these numbers are far slower than any real laptop GPU). Use them only to compare versions.

| Build | 1366x768 | 390x844 |
|---|---|---|
| Before | 509 ms | 151 ms |
| After, High | 1520 ms | 413 ms |
| After, Medium | 645 ms | 592 ms (noisy) |
| After, Low | 501 ms | 320 ms |

- **At 1366x768, Low costs about the same as the old build.** High costs about three times as much: MSAA HDR, bloom, the fullscreen sky, sea, mist and scud shaders, and 2k soft shadows.
- **At 390x844, Low is still about twice the old build.** The shader sea, sky and mist still run there, just lighter.
- **The CPU per frame is lower than before**, since the sea normals are no longer recomputed on the CPU.
- **On SwiftShader, Auto drops to Low by itself within a few seconds.** In the newcomer replay the bar showed "Auto · Low", which is the intended step-down.

## Notes and limits
- **Only one real change outside the graphics:** the bar has a new Graphics button.
- **Jungle:** the game has no "jungle" terrain type, so the river tile is drawn as the jungle river valley.
- **Lightning bolts:** they strike out over the sea, so from the default top-down view the flash on the clouds and mist is what you see. The bolt itself shows when the camera is tilted lower.
- **Fonts:** the Google Fonts could not load in the sandbox (certificate errors), so the screenshots show the fallback fonts. Players will get IM Fell and Alegreya.
