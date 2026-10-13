# Overdrive efficiency plan (v89f baseline, 2026-10-09)

Research and measurement only. No game code was changed.
- Probe scripts: `tools/eff/probe.js` and `tools/eff/bootprof.js` (Playwright, 852×393, iPhone UA, touch, isMobile).
- Raw results: `docs/eff/*.json` and `*.log`.

**Caveat.** The cloud box renders with software GL (SwiftShader) on a slow CPU. Absolute seconds and fps here are 5–50× worse than an iPhone 16. Use them only to compare before against after. Draw calls, triangles, bytes, heap and shader-program counts do not depend on the machine, so those are real. There is no iPhone or Safari here, so the iPhone memory limit, thermal behaviour and real fps are untestable; a screen recording from Alex is needed for those.

## 1. Measured baseline (live v89f)

### First load
| file | over the wire (gzip) | raw |
|---|---|---|
| index.html (all game JS + CSS + data) | 1 061 KB | 2.70 MB |
| km.js (Kenney models, base64) | 578 KB | 1.92 MB |
| three.module.js r164 (jsDelivr) | 250 KB | 1.25 MB |
| three addons (8 files) | ~25 KB | — |
| **to menu** | **≈1.9 MB** | ≈5.9 MB |
| music, streamed per mode (`preload=auto` when the mode starts) | 2.0–3.4 MB each, 13.2 MB for all 5 (~96 kbps mp3, 170–285 s) | |

- **Session totals:** 9.3 MB (Frankfurt + garage + race) and 7.3 MB (Athens + garage).
- **Caching:** GitHub Pages serves `max-age=600` with gzip, never brotli.

### Timings on the cloud box (relative only)
- **To menu:**
  - First paint 0.63 s, DOMContentLoaded 3.3 s, load event 8.2 s.
  - Menu ready 14 s.
- **JS parse + compile:** only about **0.6–0.9 s** (V8 ParseProgram + CompileCode + CompileScript + PreParse). Parsing is not the bottleneck.
- **Where the 18 s from boot to menu goes** (CPU profile):
  - **37% in three.js `WebGLUniforms`.** This is the synchronous shader-link stall: 107 shader programs exist at the menu.
  - **12% in `getContext`.** A second WebGL context is created just to draw the menu car cards (`W13_carImg`, `40_hud_input_menu.js:138`), then thrown away after 4 s with `forceContextLoss`.

### Runtime per scene
| scene | draw calls / frame | triangles / frame | shader programs | JS heap after GC | time to enter (cloud) |
|---|---|---|---|---|---|
| menu | – | – | 107 | 24 MB | – |
| Frankfurt roam, driving | **518–520** | **1.96–1.99 M** | 157 | 71 → 74 MB | 49–50 s |
| Athens roam, driving | **223–231** | **1.19–1.21 M** | 162 | 133 → 148 MB | 119–143 s |
| garage (from Frankfurt) | 281 | 1.04 M | 157 | 80 MB | 22 s (40 s at DPR 3) |
| garage (from Athens) | 134 | 0.64 M | 162 | 143–158 MB | 16 s (74 s at DPR 3) |
| race (from menu) | 306 | 1.03 M | 129 | 30 MB | 0.4 s to countdown |

- **fps:** below 1 on SwiftShader at every resolution, so it cannot be measured here. The JS plus GL-submit time inside one rAF callback was 36–100 ms (cloud CPU).
- **GPU memory:** v89b measured geometry buffers of 114–222 MB (header of `98cl_stream.js`).
- **Athens total:** about 150 MB JS heap plus about 200 MB of geometry. That sits inside the 300–500 MB range at which developers report iOS killing the tab (§c of the sources), and iOS gives no warning event before it does.

**Where entering Frankfurt roam spends its time** (52 s CPU profile):
- **30%** `getProgramParameter`: shader compiles. 50 new programs are created on top of the menu's 107.
- **23%** road and terrain distance queries during the build: `trailDist` 8.6%, `fillAt` 6.2%, `cityAt` 4.0%, `abAt` 3.4%, `lzRoadD`, `rivClear` and `mtnDist`.
- 4% garbage collection and 2% `gndBuild`.

**Where opening the garage spends its time** (28 s CPU profile):
- **55%** `toDataURL`: synchronous PNG encodes of the 3D part thumbnails (`GS_thumb`, `98s_garage_studio.js`).
- **21%** `getContext` + 6% `getExtension`: a new WebGL context for the thumbnails.
- **12%** shader info logs: every shader is compiled again in that new context.
- The builder (`GB.r`, `10_core.js`) also runs in its own WebGL context.

### Biggest source modules (KB)
| module | KB | module | KB |
|---|---|---|---|
| 60_city_build | 205 | 02_data_json | 111 |
| 10_core | 129 | 41_career_quests | 108 |
| 30_race | 119 | 85_audio_feel_sp_otg | 107 |
| 52_terrain_data (data) | 118 | 20_race_world | 106 |
| 00_page (CSS + markup) | 116 | 81_story_ath_m2_m3 | 101 |

- **Assets:** km.js 1 916 KB, 5 mp3s 13 157 KB, tune.json 2 KB.
- **Data inside the page:** 72 KB of base64 PNG atlases, 108 KB of city JSON and 118 KB of terrain DEM.

## 2. Ranked changes

Gains are against the baseline above. Effort: S < 1 day, M 1–3 days, L > 3 days.

**1. Stop paying for shader compiles on the critical path.**
- Today 107 programs are linked before the menu, then 50 more during roam entry, each linked synchronously.
- Fix:
  - Cut the number of material variants: share materials, and keep the same defines, fog and lights settings.
  - Warm the roam programs with `renderer.compileAsync(scene, camera)` while the menu is idle. It uses KHR_parallel_shader_compile.
- What the top games do: Unreal's PSO precaching compiles pipeline states ahead of use and skips drawing until they are ready. three.js recommends `compileAsync` "whenever possible".
- **Gain:** −30–40% boot-to-menu (6.7 s of 18 s on cloud) and −25% roam entry (15.7 s of 52 s).
- Effort M. Risk low: if a shader isn't warm yet, it just compiles late. WebKit reports that the extension can still block on some drivers, so measure on the iPhone.
- Modules: 10_core (materials, renderer), 72_roam_map_loop_boot (the existing `KHR_parallel` warm-up), 60_city_build, 97_art.

**2. One WebGL context: render the menu cards, garage thumbnails and builder with the main renderer.**
- Fix:
  - Render each card into a `WebGLRenderTarget` on the main renderer and copy it with `drawImage` (which already happens in 40).
  - Never use `toDataURL`. Render thumbnails only for visible tiles, a few per frame.
  - Cache by part + colour in memory, and in IndexedDB for repeat visits.
- **Gain:**
  - Garage open −70–85%: 55% `toDataURL` + 27% context creation + 12% recompiling.
  - Boot −12%: the `getContext` in W13.
  - One context's worth of GPU memory saved per extra context on iOS.
- Effort M. Risk low to medium: the thumbnails must look identical, so check them with a quick review shot.
- Modules: 40_hud_input_menu (W13_carImg), 98s_garage_studio (GS_thumb), 10_core (`GB.r` in gbOpen), 94_garage_ui.

**3. Precompute the road and terrain distance fields once, as a grid.**
- `trailDist`, `fillAt`, `cityAt`, `abAt`, `lzRoadD` and `mtnDist` are called per prop and per vertex at build time: 23% of roam entry.
- Fix: bake each into a coarse Float32 grid (for example 4 m cells, about 1–4 MB) at the first build and look values up with bilinear sampling. Better still, bake the grids at build time in `tools/build.sh`.
- What the top games do: Slow Roads generates its world in chunks spread over frames, and engines bake data offline instead of computing it at load.
- **Gain:** −15–20% Frankfurt roam entry, and probably more in Athens (119–143 s on cloud).
- Effort M. Risk medium: collisions and placement must stay identical, so diff the prop positions before and after.
- Modules: 53_terrain_roads, 51_city_net, 60_city_build (callers).

**4. Triangle and draw-call budget for the phone: ≤ 250 calls and ≤ 600 k triangles.**
- Frankfurt draws 520 calls and 2.0 M triangles per frame. Athens draws 230 calls and 1.2 M. The race draws 1.0 M even in an enclosed circuit.
- PlayCanvas: "100–200 draw calls is a rough target for low end mobile devices."
- Fix:
  1. Add a per-mesh triangle and call breakdown (`__mho.gfx()`) to find the top 10 meshes.
  2. Use LOD or impostors for the far city, and keep the 2× bricks and studs (v88w) to under 60 m.
  3. Merge static props per streaming cell, which the `STR` cells already have.
- **Gain:** 2–3× fewer vertices on the GPU, less heat and fewer dynamic-resolution drops. This is likely the largest fps lever on the phone.
- Effort M–L. Risk medium: the look changes, so it needs the full review shot set.
- Modules: 98bw_bricks2x, 98wb_world_batch, 98cl_stream, 60_city_build, 70_roam_world (culling).

**5. Memory gate in tPlay plus Athens memory diet.**
- Athens holds 133–158 MB of JS heap (twice Frankfurt) plus about 200 MB of geometry.
- iOS can reload the tab in a loop with no context-lost event (WebKit bug 300782).
- Fix:
  - Fail a tPlay run if the heap grows by more than 20 MB or `renderer.info.memory` grows by more than 10% over 5 minutes of driving.
  - Find what Athens keeps: drop the CPU copies of geometry after upload (as STR already does for the far city) and the decoded street-network arrays.
- **Gain:** safety against silent reloads on the iPhone, and an Athens target of under 100 MB heap.
- Effort S for the gate, M for the diet. Risk low.
- Modules: tools/tPlay.js, 51_city_net, 60_city_build, 98cl_stream.

**6. Merge the post-processing passes on the phone.**
- Every frame runs RenderPass → SCRUB → UnrealBloom (multi-mip) → FX → OutputPass, which is four or more full-screen passes at about 0.75 MP.
- Fix: fold SCRUB, FX and the output conversion into one shader. On `lowGfx`, run bloom at ¼ resolution or turn it off.
- What others do: pmndrs `postprocessing` merges effects into one EffectPass, because "almost every pass performs at least one expensive fullscreen render operation".
- **Gain:** roughly 2–4 ms of GPU time per frame on the phone. This is an estimate; measure it with the iPhone recording.
- Effort S–M. Risk low to medium (look: quick review).
- Modules: 10_core (composer, `FX`, `SCRUB`).

**7. Ship km.js as binary (`km.bin`, fetched as an ArrayBuffer) instead of base64 plus `atob`.**
- **Gain:**
  - −25% raw bytes (1.92 → 1.44 MB).
  - No 1.9 MB JS string or its copy in the heap.
  - The decode step disappears.
  - Over the wire it is about the same after gzip (578 KB).
- Effort S. Risk low. Modules: 50_kenney_data, 51_city_net (`kmGeo`), tools/build.sh, tools/split_km.py.

**8. Service worker for repeat visits.**
- Fix: precache index.html, km and three with content-hashed names. Cache the music with CacheFirst + RangeRequestsPlugin (Workbox pattern).
- **Gain:**
  - Repeat loads need no network: about 1.9 MB plus the tracks, against GitHub Pages' 10-minute cache.
  - Music that has been heard once plays offline.
- Effort M. Risk medium: a stale cache could serve an old build, so a versioned cache name and deploy.sh must bump the version.
- Modules: new `sw.js`, 00_page (register), tools/deploy.sh.

**9. Music: re-encode as AAC-LC (.m4a) at 64–80 kbps.**
- Music already streams through `<audio>` + MediaElementSource and is never decoded to PCM, which is correct (MDN advises against AudioBuffer for clips longer than 45 s).
- **Gain:** −20–33% of music bytes (13.2 → about 9–10 MB in total, about 0.5–1 MB less per mode switch).
- Effort S. Risk low: listen-check one track. Opus works only from iOS 18.4, so skip it.
- Modules: 98m_music (file names), src/assets/music.

**10. Agent cost: keep modules small and keep data separate.**
- Split 60_city_build (205 KB) and the four other modules over 100 KB into ≤ 60 KB pieces along their existing sections.
- Keep the three data modules (02, 50, 52) out of every agent read. They are already never read whole.
- Make `docs/MODULES.md` + `tools/find.sh` the mandatory first step in every brief.
- **Gain:** a worker reads about 10–30 KB instead of 100–200 KB per change, roughly ¼ of today's ~150 k-token warm-up. Fewer edits from different areas land in the same file.
- Effort S–M, no game risk (build output byte-identical, checked with `verify_live.sh`). Modules: the five large ones listed above.

## 3. Do first (top 5)

1. **One WebGL context for the cards, thumbnails and builder** (#2): garage open −70–85%, boot −12%.
2. **Shader warm-up and fewer variants** (#1): boot −30–40%, roam entry −25%.
3. **Distance-field grids** (#3): roam entry −15–20%, and more in Athens.
4. **Memory gate in tPlay** (#5, gate part): stops silent iPhone reloads before they ship; Athens < 100 MB heap as the next target.
5. **Per-mesh triangle and call breakdown, then a phone budget of ≤ 250 calls and ≤ 600 k triangles** (#4): about 2–3× less GPU vertex work while driving Frankfurt.

## 4. What NOT to do (low gain or high risk for us)

- **Code splitting / lazy `import()` for load time.** JS parse and compile is only 0.6–0.9 s. The load is dominated by shader compiles and world building, not by parsing. Splitting the concatenated build would also break the shared-scope `src/` model. Only reconsider it for the ~350 KB of garage modules, after #2.
- **Draco or meshopt.** The geometry is procedural, plus one 1.4 MB Kenney blob that gzips to 578 KB. Not worth it.
- **KTX2 / Basis textures.** Textures are canvas-generated, with only 72 KB of PNG atlases. Little to gain.
- **A full World Partition-style rewrite.** STR (v89b) already streams far cells and LAZY regions. Extend it; don't replace it.
- **Moving world generation to Web Workers or OffscreenCanvas now.** The code shares globals across about 70 modules, so a port is L effort with high risk. Do #3 (grids) first.
- **A BatchedMesh rewrite.** three.js forum reports are mixed (one user got 20 fps vs 60). The existing InstancedMesh use is fine.
- **An ECS retrofit.** Retrofitting it into a shipped game with tightly coupled systems is "not worth it" (LUT thesis).
- **120 Hz work.** The iPhone 16 is a 60 Hz phone, so the budget is 16.7 ms.

## Sources

- three.js `compileAsync` and `renderer.info`: https://threejs.org/docs/pages/WebGLRenderer.html; parallel compile PR: https://github.com/mrdoob/three.js/pull/19752
- KHR_parallel_shader_compile: https://developer.mozilla.org/docs/Web/API/KHR_parallel_shader_compile; WebKit blocking report: https://bugs.webkit.org/show_bug.cgi?id=251514
- Unreal PSO precaching: https://dev.epicgames.com/documentation/en-us/unreal-engine/pso-precaching-for-unreal-engine
- Unreal World Partition: https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine
- Slow Roads (chunked generation, WebP halved the bundle, load times, 52% of players above 55 fps): https://web.dev/case-studies/slow-roads
- PlayCanvas mobile guidelines (100–200 draw calls, device pixel ratio): https://developer.playcanvas.com/user-manual/optimization/guidelines/
- pmndrs postprocessing (merged EffectPass): https://github.com/pmndrs/postprocessing and https://github.com/pmndrs/postprocessing/issues/82
- iOS tab reloads with no context-lost event: https://bugs.webkit.org/show_bug.cgi?id=300782; 300–500 MB reports: https://discussions.unity.com/t/webgl-memory-increment-issue-and-crash-on-ios/894771
- OffscreenCanvas WebGL in a worker on iOS 17+: https://bugs.webkit.org/show_bug.cgi?id=183720
- AudioBuffer advice for clips longer than 45 s: https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer; Opus on iOS from 18.4: https://caniuse.com/opus
- Workbox cached audio (RangeRequestsPlugin): https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video
- KTX2: https://www.khronos.org/news/press/khronos-ktx-2-0-textures-enable-compact-visually-rich-gltf-3d-assets
- BatchedMesh reports: https://discourse.threejs.org/t/significant-performance-drop-and-high-cpu-usage-with-batchedmesh/67324
- ECS retrofit thesis: https://lutpub.lut.fi/handle/10024/169074
- Vite code splitting and HMR: https://vite.dev/guide/features
- 60/120 Hz in Safari: https://iphonesoft.fr/2026/01/26/activer-defilement-fluide-120-hz-safari-mac-ipad-iphone
