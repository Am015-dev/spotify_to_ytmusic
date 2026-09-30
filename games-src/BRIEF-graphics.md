# Graphics upgrade brief: "AAA tabletop" look

The user says the games look like "sloppy objects and drawings" and wants them to look like AAA games. The bar to aim for is a premium digital board game (Digital Wingspan, Tabletop Simulator with a good mod, Board Game Arena 3D, the Carcassonne and Azul apps): pieces that look like real, well-made physical components, lit like a product photo, on a rich table.

## Hard constraints
- One self-contained HTML file per game, built by the game's `build.py`. Three.js r158 UMD is inlined from `SP/node_modules/three/build/three.min.js` (SP = games-src).
- The examples in `SP/node_modules/three/examples/jsm/` are ES modules. If you use any (RoomEnvironment, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, SMAAPass, ShaderPass, RoundedBoxGeometry…), port them into a plain script that attaches to `THREE.*`: strip the imports and exports, and prefix THREE classes. Keep only what you need.
- All art is original and procedural: code-drawn canvas textures, SVG, and geometry. No external images or models, and no copyrighted art or logos. Fonts only from Google Fonts, or none.
- Keep the file under about 4 MB.
- Do not change the game rules, the engine state or the AI. Only change the rendering, the materials, the models, the animation and the visual polish of the UI.
- Keep the board-first layout: no page scroll, nothing fixed covering the board, and popups close with ✕/Esc/tap outside.
- Keep every test hook, and the jsdom/2D fallback path, working. The jsdom tests have no WebGL, so guard every WebGL-only feature.
- Performance: aim for 60 fps on a laptop. Add a Graphics quality setting (High / Medium / Low) in the settings menu, and store it in localStorage with try/catch.
  - Auto-pick: Medium on phones and small screens, High on desktop.
  - Low turns off post-processing and shadows.
  - If frames drop badly for 3 seconds, step down one level automatically.

## What "AAA" means here (checklist)
1. **Renderer:**
   - `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmicToneMapping` with tuned exposure, and physically correct lighting.
   - Soft shadows (PCFSoft, a tight shadow camera frustum, bias tuned so there's no acne or peter-panning).
   - An environment map through PMREMGenerator (a RoomEnvironment port, or a custom gradient/studio scene) so metals, glazes and varnish reflect.
   - Antialiasing: MSAA, or SMAA/FXAA when post-processing is used.
2. **Lighting:** a warm key light with soft shadows, a cool fill (hemisphere), and a rim or back light to separate pieces from the board. Optional subtle fog or atmosphere for depth. Contact shadows or baked soft blob shadows under every piece so nothing floats.
3. **Materials:** MeshStandardMaterial or MeshPhysicalMaterial everywhere, never flat or Lambert colours.
   - Procedural canvas textures for colour, roughness and normal (or bump): wood grain, printed cardboard with a linen finish, felt or cloth table, stone, sand, glazed ceramic (clearcoat), brass or metal, painted plastic minis.
   - Anisotropic filtering, and mipmaps on.
   - Subtle wear, edge highlights and colour variation per piece, so no two tiles look identical and flat.
4. **Geometry:**
   - Nothing looks like a raw primitive. Tiles and cards get bevelled, rounded edges (an ExtrudeGeometry bevel or a RoundedBox port), with printed art on the top face and a coloured core on the edges.
   - Pawns, meeples, camels and ships get sculpted silhouettes (Lathe/Extrude/merged parts), not a lone box or cylinder.
   - Use InstancedMesh for many identical pieces.
5. **Table and scene:** a real table surface (a wood or felt texture, with a vignette falloff at the edges), a board with thickness, a frame, printed detail and slight depth. A tasteful backdrop that fits the theme, and no empty black void.
6. **Animation and feedback:**
   - Pieces move on eased arcs with a small landing bounce and a dust or sparkle puff.
   - Score pops; hovered or selected pieces lift and glow (a soft emissive or outline); the camera eases smoothly and never snaps.
   - Idle life: flicker, sway, water shimmer, where it fits the theme.
7. **Post-processing on High only:** gentle bloom on emissive highlights, vignette, SMAA, and optionally subtle depth of field or a colour-grade LUT via ShaderPass. Never smeary.
8. **2D UI polish:** it must match the 3D quality.
   - Themed panels with depth: layered gradients, a subtle texture, borders and shadows, instead of plain boxes.
   - Consistent inline-SVG icons instead of raw emoji where the emoji look cheap.
   - A good display font plus a readable body font, and a consistent type scale.
   - Buttons with hover and press states, and smooth open and close transitions on the dock and popups.
   - Card faces (when a game has cards) with a proper frame, title bar, art window, type line and text box, all consistent.

## Process
1. Take BEFORE screenshots at 1366x768 and 390x844 with Playwright, and view them with Read.
   - Playwright: PW=$(npm root -g)/playwright, with launch args --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader.
   - Never run `playwright install`.
   - List honestly what looks cheap.
2. Implement the upgrade in the game's source files, then rebuild with `python3 build.py` and run `node --check x.js`.
3. Take AFTER screenshots of the same views, plus a close-up of the pieces, and view them. Iterate until it clearly looks like a premium product. Compare before and after side by side and be your own harsh art director.
4. Measure performance. Swiftshader is slow, so compare the frame time before and after, and make sure Low/Medium are cheap.
5. Run ALL of the game's existing tests (gauntlet, cover, clicker, layout check, rules tests; read the folder to find them) and get them passing with 0 errors and 0 layout problems.
6. Do not publish artifacts and do not git commit. Write `GRAPHICS-REPORT.md` next to the built file, covering what changed, the before/after screenshot paths, the test results with exact numbers, and the performance numbers. Reply with the same summary.
