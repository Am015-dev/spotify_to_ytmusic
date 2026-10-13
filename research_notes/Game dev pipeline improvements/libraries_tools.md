# Libraries, GUI tooling and high-leverage tooling for Mainhattan Overdrive (three.js racing)

Method note: versions, licences and dates come from the npm registry (`registry.npmjs.org/<pkg>`), queried 2026-10-13. File sizes come from jsDelivr file listings, and "gz" sizes were measured by me with `gzip -9` on the jsDelivr file on 2026-10-13. Real brotli over CDN will be a little smaller. GitHub stars could NOT be fetched (the GitHub API is blocked in this session), so star counts are absent everywhere. Repo facts (e.g. which three.js examples exist) come from raw.githubusercontent.com and the jsDelivr listing of `three@0.186.1`.

Size budget context: the game has a 3.6 MB cap per split file (CLAUDE.md), so any WASM engine competes directly with game code.

## 1. Physics: which engine has a good arcade vehicle controller, deterministic stepping, mobile performance and small size?

### Takeaway
Rapier is the only web engine with a first-class raycast vehicle controller that ships with an official three.js example. Its JS package is heavy, though: ~1.65 MB gz for the `-compat` single-file build. For a LEGO-2K-style ARCADE car, the higher-leverage move is to keep the hand-written car and replace the custom collision with `three-mesh-bvh` (collide against the real render meshes, plus a fixed timestep). Adopt Rapier only if the car is rewritten around its vehicle controller. cannon-es is small but unmaintained since 2022. Jolt and Havok are smaller WASM files than Rapier, but they have no three.js vehicle example.

### Cited Findings
**Size / version / licence table** (measured as described in the method note)

| Engine (npm) | Version, date | Licence | Main payload raw → gz |
|---|---|---|---|
| `@dimforge/rapier3d-compat` | 0.21.0, 2026-09-25 | Apache-2.0 | `dist/rapier.mjs` (WASM inlined as base64) 4.34 MB → **1.65 MB gz**; the separate `rapier_wasm3d_bg.wasm` is 3.08 MB → 1.17 MB gz — [npm](https://registry.npmjs.org/@dimforge/rapier3d-compat/latest), [jsDelivr files](https://www.jsdelivr.com/package/npm/@dimforge/rapier3d-compat?tab=files) |
| `@dimforge/rapier3d-simd-compat` | 0.21.0 | Apache-2.0 | unpacked 15.8 MB (similar per-file size, not measured) — [npm](https://registry.npmjs.org/@dimforge/rapier3d-simd-compat/latest) |
| `jolt-physics` | 1.1.0, 2026-07-11 | MIT | `jolt-physics.wasm.wasm` 2.02 MB → **0.74 MB gz** (+0.96 MB JS glue); the `wasm-compat.js` single-file build is 3.22 MB → 0.91 MB gz — [jsDelivr](https://www.jsdelivr.com/package/npm/jolt-physics?tab=files) |
| `@babylonjs/havok` | 1.3.14, 2026-07-29 | MIT (per npm metadata) | `HavokPhysics.wasm` 2.09 MB → **0.66 MB gz** + 67 KB JS — [npm](https://registry.npmjs.org/@babylonjs/havok/latest) |
| ammo.js (Bullet) | npm 0.0.10 is stale; use the GitHub `builds/` folder | zlib (Bullet); npm lists none | `ammo.wasm.wasm` 748 KB → **0.29 MB gz** + 442 KB glue — [jsDelivr gh](https://cdn.jsdelivr.net/gh/kripken/ammo.js@main/builds/) |
| `cannon-es` | 0.20.0, **2022-08-12** (no release since) | MIT | `cannon-es.js` 346 KB → **74.5 KB gz** (pure JS) — [npm](https://registry.npmjs.org/cannon-es) |
| `three-mesh-bvh` (not an engine) | 0.9.16, 2026-10-08 | MIT | unpacked 2.3 MB (all builds); runtime gz not measured — [npm](https://registry.npmjs.org/three-mesh-bvh) |

**Rapier vehicle controller**
- Rapier JS exposes `DynamicRayCastVehicleController`, documented as a "character controller to simulate vehicles using ray-casting for the wheels" — [rapier.rs docs](https://rapier.rs/javascript3d/classes/DynamicRayCastVehicleController.html).
- Its API, listed from the 0.21.0 `.d.ts`:
  - per-wheel setters: `addWheel`, `setWheelSteering`, `setWheelEngineForce`, `setWheelBrake`, `setWheelSuspensionStiffness/Compression/Relaxation/RestLength/MaxSuspensionTravel/MaxSuspensionForce`, `setWheelFrictionSlip`, `setWheelSideFrictionStiffness`;
  - read-backs: `wheelIsInContact`, `wheelContactPoint/Normal`, `wheelSuspensionLength`, `wheelSideImpulse`, `currentVehicleSpeed`, `updateVehicle(dt)`.

  Source: [d.ts on jsDelivr](https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/dist/control/ray_cast_vehicle_controller.d.ts).
- three.js ships an official example, `physics_rapier_vehicle_controller`. It uses the `three/addons/physics/RapierPhysics.js` wrapper and `RapierHelper`, calls `world.createVehicleController(chassis)`, adds 4 wheels, and sets suspension stiffness 24 and frictionSlip 1000 — [example source](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/physics_rapier_vehicle_controller.html), [live](https://threejs.org/examples/physics_rapier_vehicle_controller.html).
- three.js r186's examples list contains 13 physics demos: ammo ×6, jolt ×1 (instancing only), and rapier ×6 (basic, instancing, joints, character_controller, vehicle_controller, terrain). There is no Jolt or cannon vehicle demo — [examples/files.json](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/files.json).

**Determinism**
- Rapier: only the `@dimforge/rapier3d-deterministic` builds are cross-platform deterministic. The standard and SIMD builds are deterministic only on the same machine. `Math.sin/cos` in the setup can break determinism. The docs suggest checking it by hashing `world.createSnapshot()` — [rapier.rs determinism](https://rapier.rs/docs/user_guides/javascript/determinism). The one README found for the deterministic build shows version 0.19.3 — [README](https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-deterministic@0.19.3/README.md). Its current version is unverified.

**Jolt and Havok vehicles**
- Jolt: three.js documents a `JoltPhysics.js` addon (`three/addons/physics/JoltPhysics.js`) that adds meshes and scenes, with no vehicle wrapper — [three.js docs](https://threejs.org/docs/pages/JoltPhysics.html).
- Jolt's WASM bindings expose `VehicleControllerSettings` and `WheelSettings`, but objects must be freed manually (no GC) — [three.js manual / search summary](https://threejs.org/manual/en/physics). I found no three.js Jolt vehicle demo.

**Arcade technique (engine-agnostic)**
- The common arcade pattern is a hidden sphere or box rigidbody that drives the motion, the visual car mesh placed on top, a few raycasts for ground alignment, and a spring+damper per ray. Missing damping is the usual cause of endless bounce — [Godot recipe: sphere car](https://kidscancode.org/godot_recipes/4.x/3d/3d_sphere_car), [gamedev.net thread](https://gamedev.net/forums/topic/699625-arcade-car-physics).
- Needle Engine has a "car physics" sample, which shows Rapier-based cars are used in the Needle ecosystem — [Needle sample](https://engine.needle.tools/samples/car-physics) (contents not inspected).

### Inferences
- Rapier gz 1.65 MB is ~45% of the 3.6 MB split-file cap. Jolt or Havok cost ~0.7 MB gz plus glue. A full engine swap is also a rewrite of the driving feel that Alex has been scoring, and lesson 1 says "fix basics first".
- **Recommendation (highest leverage, lowest risk):** keep the arcade car and replace the hand-rolled colliders with `three-mesh-bvh` shapecast or sphere/capsule-vs-BVH. Pair it with a fixed 60 Hz substep (accumulator) and slide-along-normal response.
  - It targets the three listed pain points (wall hits, stuck, colliders not matching the visuals; CLAUDE.md lessons 3 and 10).
  - It is a pure-JS MIT library, maintained (release 6 days ago), and adds no WASM.
- Anti-flip: add an explicit up-right torque and a "reset to last road sample" after more than 1.5 s upside down. Both are a few lines; no library needed.
- If a rigid-body engine is ever adopted: choose Rapier 0.21 (vehicle controller plus official three.js example). Lazy-load it as a separate chunk; do not inline it into km.js.
- Avoid cannon-es for new work: no release for over 4 years.

### Gaps
- No measured iPhone/Safari benchmark of Rapier, Jolt or Havok WASM was found. The searches returned only generic three.js and Safari threads — [example](https://discourse.threejs.org/t/inconsistent-performance-of-three-js-animations-in-safari-for-ios/76329). This is untestable in the cloud (CLAUDE.md lesson 13).
- GitHub stars and the current version of `rapier3d-deterministic` are unverified.
- Havok licence: npm metadata says MIT. I did not read the licence file itself. Verify before shipping.
- Rapier 0.21 changelog not found.

## 2. Editors and inspectors: three.js editor, Needle, PlayCanvas, Babylon, Theatre.js, R3F/drei/leva, triplex, Spline

### Takeaway
None of the full editors fits a vanilla-three.js single-page game without a rewrite. Needle is also paid for commercial use, and triplex, leva and r3f-perf need React. The cheap wins are:
- a `?dev=1` in-page panel (lil-gui) plus three.js's own helpers;
- the three.js online editor (threejs.org/editor) as a free "drop a glb, check scale" viewer;
- noting that three.js r186's new built-in **Inspector** is tied to `three/webgpu`.

### Cited Findings
- **three.js Inspector (new):** r186 ships `examples/jsm/inspector/` with Performance, Memory, Console, Parameters, Timeline and Viewer tabs, plus color-grading and TSL-graph extensions. `Inspector.js` imports from `'three/webgpu'` — [jsDelivr three@0.186.1](https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/inspector/Inspector.js). three 0.186.1 was published 2026-09-24, MIT — [npm](https://registry.npmjs.org/three).
- **Needle Engine:**
  - The free tier is non-commercial only and must keep Needle branding. Pro costs €49/user/month billed annually. Enterprise is recommended for 5 or more seats or €5M+ revenue — [Needle pricing](https://needle.tools/pricing), [EULA](https://needle.tools/eula), [FAQ](https://cloud.needle.tools/faq/is-needle-engine-free-can-it-be-used-for-commercial-projects).
  - npm `latest` is 6.0.0-alpha.7 (2026-10-12), `stable` is 5.1.15, unpacked 92 MB — [npm](https://registry.npmjs.org/@needle-tools/engine).
- **PlayCanvas:** the Editor frontend was open-sourced under MIT in Aug 2025; the backend and hosting stay commercial — [PlayCanvas blog](https://blog.playcanvas.com/playcanvas-editor-frontend-is-now-open-source), [AlternativeTo](https://alternativeto.net/news/2025/8/playcanvas-editor-frontend-is-now-open-source-with-mit-license). It is a different engine, so adopting it would mean a port.
- **Theatre.js:** `@theatre/core` latest is 0.7.2, published **2024-05-19** (Apache-2.0) — [npm](https://registry.npmjs.org/@theatre/core). Snyk rates it inactive. A mirror says development moved to a private repo in 2024 — [Snyk](https://snyk.io/advisor/npm-package/theatre), [gitforkedio mirror](https://github.com/gitforkedio/theatre). It is a keyframe or cinematic tool, not a game-tuning tool.
- **React stack:**
  - `@react-three/fiber` 9.8.1, `@react-three/drei` 10.7.9, `leva` 0.10.1 (2025-10-31), `r3f-perf` 7.2.3, all MIT — [npm fiber](https://registry.npmjs.org/@react-three/fiber/latest), [drei](https://registry.npmjs.org/@react-three/drei/latest), [leva](https://registry.npmjs.org/leva), [r3f-perf](https://registry.npmjs.org/r3f-perf/latest).
  - `@react-three/rapier` 2.2.0 — [npm](https://registry.npmjs.org/@react-three/rapier/latest).
- **triplex:** open-source visual editor for R3F, now under pmndrs. It keeps code as the source of truth with two-way canvas↔code sync, and a VS Code extension is in beta — [bestofjs](https://bestofjs.org/projects/triplex), [three.js forum](https://discourse.threejs.org/t/triplex-a-visual-editor-for-react-three-fiber-announced-they-are-working-on-a-vs-code-plugin/66648). It requires the scene to be R3F components.
- **Spline:** `@splinetool/runtime` 2.0.79, no licence field on npm, unpacked 36 MB — [npm](https://registry.npmjs.org/@splinetool/runtime/latest).

### Inferences
- The game uses vanilla three.js on WebGL (assumed from the context; unverified in code). So the r186 Inspector, R3F, triplex and leva all need a renderer migration or a React rewrite. That is not worth it under the feature freeze.
- What the owner needs is not a scene editor but:
  1. a phone-friendly tuning panel (section 3);
  2. a model viewer with a human-scale reference (section 4);
  3. crash/stuck telemetry (section 5).
- Spline and Needle add a proprietary toolchain plus licence cost, and they don't solve LEGO-part fidelity.

### Gaps
- Babylon.js Inspector and Babylon Editor were not researched (they are Babylon-only; they could load glTF for viewing).
- The three.js editor's current feature set was not re-verified.
- Stars and maintenance of the triplex repo were not verified (GitHub blocked).

## 3. Tuning GUIs and live data tables (lil-gui, Tweakpane, leva; Sheets/CSV→JSON, CastleDB, live config)

### Takeaway
Use **lil-gui** (7.8 KB gz, MIT, the GUI three.js examples already use), bound directly to the `tune.json` object. Behind `?dev=1`, add "Copy JSON" and "Reset" buttons and save in localStorage. Tweakpane is nicer (graphs, monitors) but costs 4× more and has had no release since Nov 2024. leva needs React.

### Cited Findings
- `lil-gui` 0.21.0, 2025-10-12, MIT: `lil-gui.esm.min.js` 29.4 KB → **7.8 KB gz** — [npm](https://registry.npmjs.org/lil-gui), [jsDelivr](https://cdn.jsdelivr.net/npm/lil-gui@0.21.0/dist/lil-gui.esm.min.js).
- `tweakpane` 4.0.5, 2024-11-03, MIT: `tweakpane.min.js` 152 KB → **30.8 KB gz** — [npm](https://registry.npmjs.org/tweakpane).
- `leva` 0.10.1, 2025-10-31, MIT, a React hooks GUI — [npm](https://registry.npmjs.org/leva).
- `stats-gl` 4.2.3, 2026-07-10, MIT: `main.js` → **4.9 KB gz** (GPU+CPU timing panel) — [npm](https://registry.npmjs.org/stats-gl). `stats.js` 0.17.0 is the classic FPS meter — [npm](https://registry.npmjs.org/stats.js/latest).

### Inferences
- **Recommended dev panel:**
  - Bind lil-gui folders to `TUNE.car`, `TUNE.camera` and `TUNE.traffic`.
  - Add a "Copy tune.json" button using `navigator.clipboard`, so Alex can paste values into chat.
  - Add a per-car "scale" slider plus a live readout of the tyre-to-road gap and wall hits per minute.
  - Total cost: about 8 KB.
  - Lazy-load it via `import()` only when `?dev=1`, so it adds 0 bytes to the normal build.
- Live data tables: Google Sheets "Publish to web → CSV" plus a 20-line build script (CSV→`tune.json`) lets Alex edit cars and missions in a spreadsheet on his phone with no new dependency. (This is a general technique; I did not verify a source this session.) CastleDB was not researched (see Gaps). A spreadsheet is lighter for a one-person owner.
- Remote config: `tune.json` is already a separate file. Fetching it with `?v=` cache-busting is effectively remote config, with no service needed.

### Gaps
- CastleDB status/licence, and Google Sheets publish-to-CSV limits, were not verified this session.
- Tweakpane's touch usability on iPhone versus lil-gui's was not verified.

## 4. Asset pipeline: LDraw→glTF, gltf-transform/meshopt/Draco/KTX2, stud instancing, model viewer with scale reference

### Takeaway
Convert LDraw cars ONCE, offline, to `.glb`:
- three.js `LDrawLoader` (with `packLDrawModel.mjs`) or Blender ExportLDraw/ImportLDraw;
- then `gltf-transform optimize --compress meshopt` (plus `instance` for repeated studs and parts).

Load the result with `GLTFLoader` and `MeshoptDecoder`. This replaces hand-maintained JS model files, shrinks them, and gives a standard format that any viewer can check for scale. LDraw units are fixed (1 LDU = 0.4 mm), so wrong scale becomes a one-constant bug, not a per-model one.

### Cited Findings
- `LDrawLoader` (three r186, 15.5 KB gz):
  - It loads from a parts library via `setPartsLibraryPath` and has smooth normals and conditional-line support — [LDrawLoader.js](https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/loaders/LDrawLoader.js), [docs](https://threejs.org/docs/pages/LDrawLoader.html).
  - The docs recommend packing a model and its dependencies into one file. The script is now `utils/packLDrawModel.mjs` (HTTP 200; the old `.js` path returns 404, matching a Dec-2024 LDraw forum report of broken links) — [raw file](https://raw.githubusercontent.com/mrdoob/three.js/dev/utils/packLDrawModel.mjs), [LDraw forum](https://forums.ldraw.org/thread-28554.html), [example](https://threejs.org/examples/webgl_loader_ldraw).
- Blender importers:
  - ExportLDraw (cuddlyogre) imports and exports .mpd/.ldr/.l3b/.dat and handles Stud.io decals — [GitHub](https://github.com/cuddlyogre/ExportLdraw).
  - ImportLDraw (TobyLobster) supports Blender 2.81 to 4.x — [LDraw wiki](https://wiki.ldraw.org/wiki/LDRImporter).
  - From Blender, the built-in glTF exporter produces `.glb` (standard Blender feature; not re-verified).
- No direct LDraw→glTF CLI tool was found. The npm name `ldraw-to-gltf` does not exist (registry lookup failed). A three.js forum thread suggests the Blender route — [discourse](https://discourse.threejs.org/t/how-can-i-render-a-lego-model-as-ldr-or-io-file-using-threejs/56755/6).
- `@gltf-transform/cli` 4.5.1, 2026-09-28, MIT — [npm](https://registry.npmjs.org/@gltf-transform/cli).
  - Commands include `optimize`, `dedup`, `prune`, `instance` (GPU instancing), `flatten`, `join`, `center`, `draco`, `meshopt`, `weld`, `simplify`, `palette`, `resize`, `etc1s`, `uastc` (KTX2/Basis), and `webp/avif`.
  - Example: `gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp` — [CLI docs](https://gltf-transform.dev/cli).
- `meshoptimizer` 1.3.0 (MIT) — [npm](https://registry.npmjs.org/meshoptimizer/latest). `draco3dgltf` 1.5.7 (Apache-2.0) — [npm](https://registry.npmjs.org/draco3dgltf/latest).
- three r186 includes `DRACOExporter.js` and `KTX2Exporter.js` among its addons — [jsDelivr listing](https://www.jsdelivr.com/package/npm/three?tab=files).

### Inferences
- Prefer **meshopt** over Draco for LEGO cars. The meshopt decoder is small and fast, and LEGO cars are flat-coloured, so they need no textures and KTX2 is irrelevant. Draco needs a ~300 KB+ WASM decoder (approximate; not measured this session).
- `gltf-transform palette` merges the per-colour materials. `instance` turns repeated studs, wheels and tyres into `EXT_mesh_gpu_instancing`, and three's `GLTFLoader` reads that as `InstancedMesh`. Expect large draw-call savings for traffic.
- **Scale guard (directly targets the "giants" bug, lessons 4 and 9):**
  - Add a build-time check script: load each `.glb`, compute its `Box3`, and assert the expected bounds (car length 4–5 m in game units, minifig 1.6–1.9 m, etc.). The build fails on a mismatch.
  - Add a one-page "model viewer" at `?viewer=1`: grid, 1.8 m human silhouette, the player car, an orbit camera, and the dimensions printed.
  - Both reuse what is already loaded; no new library.
- The LDraw path also helps agent cost: models stop being multi-hundred-KB JS that agents might read.

### Gaps
- How the current JS model files are generated was not inspected. I also did not measure the actual size gain of `.glb`+meshopt over the current JS models.
- The meshopt decoder size and Draco decoder size were not measured this session.

## 5. Telemetry and reporting: crash/wall-hit heatmaps, Sentry, perf monitoring, session replay

### Takeaway
The cheapest high-value step is a homemade event log:
- `{t, x, z, speed, type: wallHit|stuck|flip|reset}`, ~20 lines;
- POST it or stash it in localStorage, with a "Copy log" button;
- render it as dots on the minimap image for a heatmap.

Add Sentry (~25 KB gz minimal browser SDK) only to catch JS errors on the iPhone, where the cloud can't test. Replay is heavy (~70 KB gz with tracing) and not needed.

### Cited Findings
- `@sentry/browser` 11.7.0 (MIT) — [npm](https://registry.npmjs.org/@sentry/browser/latest).
  - Sentry docs cite ~25 KB gz for the minimal browser SDK and ~35–45 KB with integrations — [Sentry bundle-size guide (mintlify mirror)](https://www.mintlify.com/getsentry/sentry-javascript/guides/best-practices/bundle-size).
  - A third-party release listing gives the ES6 CDN bundle at 25.11 KB, +tracing 35.34 KB, +tracing+replay 69.57 KB gz — [newreleases.io](https://newreleases.io/project/npm/@sentry/vue/release/7.112.0) (aggregator, an older v7; treat as approximate).
- `rrweb` 2.1.7 (MIT) is the DOM session replay library. It records DOM, not WebGL canvas pixels — [npm](https://registry.npmjs.org/rrweb/latest). (The "no canvas" caveat is general knowledge; not verified this session.)
- `posthog-js` 1.438.9 (Apache-2.0 AND MIT), unpacked 27 MB — [npm](https://registry.npmjs.org/posthog-js/latest).
- Perf tools:
  - `stats-gl` 4.2.3 (4.9 KB gz) — [npm](https://registry.npmjs.org/stats-gl).
  - `spectorjs` 0.9.33 (MIT) for WebGL frame capture — [npm](https://registry.npmjs.org/spectorjs/latest).
  - `r3f-perf` 7.2.3 is React-only — [npm](https://registry.npmjs.org/r3f-perf/latest).
  - three r186's Inspector has Performance and Memory tabs, but it is WebGPU-only (section 2).

### Inferences
- A session replay of a WebGL game is of low value. A replay of *inputs* is better: record touch and keyboard per fixed tick plus the seed. With a fixed timestep, the same build can replay Alex's actual run in tPlay. That turns "I crashed on every turn" into a reproducible trace, directly serving lesson 1.
- Sentry's free plan limits and data-region terms were not checked. Alex's game is personal, so a self-written `window.onerror` → POST to any free endpoint might suffice.

### Gaps
- Sentry's current free-tier quota was not verified.
- No turnkey "heatmap for three.js games" library was found or searched for specifically.

## 6. Other ideas: owner dev menu/checklist, remote config, A/B toggles, PWA/offline, AI-agent cost control

### Takeaway
The biggest lever for cost is module boundaries. Split the 3 MB HTML into ~10 ES modules by system (car, collision, world-Frankfurt, world-Athens, traffic, HUD, audio, tune, models/*.glb), each under ~100 KB, with a `MODULES.md` index. Agents then read one module instead of ~150k tokens per session. Everything else (dev menu, toggles, PWA) is small native-browser work, not libraries.

### Cited Findings
- CLAUDE.md (repo) states that 99.8% of tokens were context re-reads, and that every new session pays ~15 min and ~150k tokens to read the 3.7 MB file — [/home/user/spotify_to_ytmusic/CLAUDE.md](file:///home/user/spotify_to_ytmusic/CLAUDE.md).
- `vite-plugin-pwa` 2.0.0 (MIT) generates a service worker and manifest — [npm](https://registry.npmjs.org/vite-plugin-pwa/latest).
- three.js r186's addon physics wrappers show the module-boundary pattern three.js itself uses. They are tiny modules: `RapierHelper.js` is 1.3 KB — [jsDelivr](https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/helpers/RapierHelper.js).

### Inferences
- **Owner dev menu (`?dev=1`):**
  - lil-gui tuning;
  - toggles (traffic off, rings off, collider wireframes, show BVH);
  - a "teleport to checkpoint" list;
  - live counters (wall hits per min, stuck seconds, tyre gap, FPS via stats-gl);
  - a "Copy report" button that bundles tune, log and the user agent for Alex to paste.

  It replaces screenshot-and-guess loops for feel tuning.
- **A/B toggles:** a `?ab=steerB` query flag read once at startup is enough. Alex can open two links and compare. No service needed.
- **PWA:** a service worker adds offline caching. The game runs inside the Claude-app iframe, where SW and manifest behaviour is unverified, so this is low priority.
- **Build-time guards cut agent rework:**
  - the scale check (section 4);
  - a size-budget check per module;
  - a `node --check` per module.

### Gaps
- Service worker behaviour inside the Claude iOS app's iframe is unknown and untestable here.
- No published data was found on token savings from modularising for AI agents. The CLAUDE.md numbers are the only evidence.
