# Plan: better graphics on PC when the GPU can take it (Alex, 2026-10-20)

Alex: "for the PC the game should have much better graphics if the graphics card supports it." Today a PC gets the same daytime look as a phone, with more pixels on top. Three reasons, from review 22:
- `GFX_light` writes fixed noon light over the time of day.
- The PC "high" tier adds only a 2048 shadow map (radius 110 m), MSAA 4 and DPR ≤ 2.
- GTAO exists but is opt-in only (`?ao=1`).

This plan adds tiers on top of what already exists. The phone path (`GOV_touchBoot`, `LK` min/low) stays byte-for-byte the same.

## What already exists (reuse, do not rebuild)
| Piece | Where | Today |
|---|---|---|
| GPU string | `src/98pb_perfbeacon.js:13` (`PB.gpu`), `src/10_core5.js:36` (texprobe key) | `UNMASKED_RENDERER_WEBGL` is read but not used to pick a tier |
| Governor | `src/98qg_qgov.js` (`GOV`, `GOV_S` render scale 1 / .85 / .7, `LK.drop`) | PC starts high and steps down (p90 > 22 ms for 3 s); it can step up again |
| Tiers | `LK_LV=['high','med','low','min']` (`src/80_story_m1.js:370`), `LK_lvl()`, `applyQuality()` (`src/20_race_world.js:366`) | — |
| Daytime look | `GFX_light`, `GFX_tier`, `GFX_ao2` (cheap contact AO), `GFX_room` (RoomEnvironment PMREM) in `src/98gx_gfx.js` | — |
| three.js addons in the bundle | EffectComposer, RenderPass, OutputPass, ShaderPass, UnrealBloomPass, **GTAOPass**, **Reflector**, RoomEnvironment, BufferGeometryUtils | Not in the bundle: SMAA, SSR, CSM, Sky (all ship with three r164 addons, MIT) |

## 1. Tier detection (runs once at boot, PC only: `!lowGfx`)
- **Score from the GPU string** (`WEBGL_debug_renderer_info`):
  - software (`SwiftShader|llvmpipe|Basic Render`) → LOW
  - integrated (`Intel(R) (UHD|HD|Iris)`, `AMD Radeon(TM) Graphics`, `Apple M1` without Pro/Max) → MID
  - discrete (`NVIDIA|GeForce|RTX|GTX|Radeon RX|Apple M[1-4] (Pro|Max|Ultra)|Arc`) → HIGH
  - discrete with RTX 30xx or newer, RX 6xxx or newer, or Apple M Max/Ultra → ULTRA candidate
- **Cap by WebGL2 caps:** `MAX_TEXTURE_SIZE < 8192` → at most MID; `MAX_SAMPLES < 4` → no MSAA.
- **Measured probe:** for 3 s after reveal, take the p95 of the frame's own work (the `GOV.busy` ring that already exists).
  - ULTRA candidate with p95 > 8 ms → HIGH.
  - HIGH with p95 > 12 ms → MID.
  - The result is stored as `mho_gfxtier` with the GPU string, so the probe runs once per GPU.
- **Tiers:**
  - LOW = today's phone tier (min/low).
  - MID = today's PC med.
  - HIGH = today's PC high plus the time-of-day fix.
  - ULTRA = new: `LK_LV` gets `'ultra'` in front of `'high'`, and `LK_lvl`, `GOV.d` and `GFX_tier` learn it.
- **Override:** Settings → Graphics gets Auto | Low | Medium | High | **Ultra** (`SET.qm`). The URL takes `?gfx=0..3` (0 = LOW … 3 = ULTRA). The current meaning of `?gfx=0` (old look) moves to `?gfxold=1`.
- **Adaptive downgrade (PC):**
  - Step down: work p95 > 22 ms for 5 s in a row → one step. Render scale goes first (1 → .85), then the tier.
  - **No tier upgrade inside a session**, only at the next boot, where the stored tier is used again. Render scale can still go back up (that step costs no shader compile).
  - Each step is logged in `GOV.log` and the perf beacon, so the Beta db shows which GPUs drop.

## 2. HIGH and ULTRA features
Costs are estimates for a mid discrete GPU (RTX 3060 / RX 6600 class) at 1080p. The lane measures the real number with `tools/perfab.js`, before and after, on the built page.

| # | Feature (reuse) | Tier | Est. cost | Risk | Assert, no graphics (or golden view) |
|---|---|---|---|---|---|
| A | **One light owner**: `GFX_light` blends from `FL_at(t)` (sun colour, intensity, elevation, sky, fog); `ART_light` becomes a no-op when GFX is on | all (phones too: a bug fix, same cost) | 0 | Low; the golden day views stay the same at t = .45 | GO `gfx/tod`: noon, dusk and night tuples of `moonL` color/intensity, `hemi`, `SKYU.uHor` all differ and fall in the review-22 bands |
| B | Pixel ratio up to 2 (HIGH) / `min(devicePixelRatio, 2)` with no `GOV_S` floor of .85 (ULTRA) | H/U | 1.5–3 ms at 1440p | Fill-rate bound on 4K screens: cap pixels at 3.7 M | `renderer.getPixelRatio()` per tier in GO `gfx/tier` |
| C | MSAA 4× on the composer targets (exists on high); ULTRA adds **SMAA** (addon `SMAAPass`, MIT) after OutputPass for shader edges | H/U | MSAA ~0.5 ms, SMAA ~0.6 ms | Low | `composer.renderTarget1.samples === 4`; SMAA pass present and enabled on ULTRA |
| D | Sun shadows: HIGH = 2048 PCFSoft over a 110 m radius (exists); ULTRA = **4096 over 220 m** (or CSM addon, 3 cascades) with direction and colour from A | H/U | +1.5 ms (4096), CSM +2.5 ms | Shader count rises with CSM; prewarm must cover it | `moonL.shadow.mapSize.x` per tier; shadow camera covers 200 m; light direction matches `FL_at(t)` elevation (± 3°) |
| E | **GTAO** (`GFX_ao`, exists): default ON for ULTRA by day; HIGH keeps it opt-in | U | measured +720 draw calls; about 2–3 ms | Draw calls: needs the normal pass with instancing kept | `GFX.gtao.enabled` on ULTRA by day, off at night and on lower tiers |
| F | Bloom and grade: UnrealBloom (exists) at threshold .9 by day on H/U (today 2.2 = effectively off), plus a warm/cool grade LUT per time of day in `GFX_GRADE` | H/U | 0.8 ms | Washed-out sky if threshold < .85 | `bloom.threshold` and `strength` per tier and time of day; golden `fra-skyline` per tier |
| G | Textures: anisotropy `renderer.capabilities.getMaxAnisotropy()` (today a fixed 8), mip bias −0.5 on road and facade maps | H/U | < 0.3 ms | Shimmer on facades with bias < −0.5 | Road map `anisotropy ≥ 16` on ULTRA |
| H | Draw distance and LOD: camera far, fog density ×0.6, `HUB` cull radius ×1.5 (2,100 → 3,150 m), building and tree LOD switch ×1.5 | H/U | 1–2 ms (more draw calls) | Streaming hitches; watch long frames | Cull radius and fog density per tier |
| I | Car reflections: plastic `envMap` = sky PMREM rebuilt every 2 s from `SKYU` (today a fixed RoomEnvironment), so dusk reflects orange | H/U | 0.2 ms average (≈ 8 ms per rebuild, spread over frames) | One PMREM per 2 s must not land in a long frame | `GFX.skyEnvT` advances; plastic `envMap === GFX.skyEnv` on H/U |
| J | Wet road at dusk and night: the existing `Reflector` (race water) on a 60×60 m plane under the player, at half resolution, only when `MOOD.wet > 0` | U | 2–4 ms (second scene render) | High cost; ULTRA only, and off when the governor steps down | Reflector is visible only with `wet > 0` on ULTRA |
| K | God rays and fog: a height-fog term in the existing fog chunk and a cheap radial "sun shafts" ShaderPass (screen-space, 1 pass) at dawn and dusk | U | 0.5 ms | Banding at low bit depth | Pass enabled only when the sun is in view and elevation < 20° |
| L | Brick clouds: 2 → 6 cloud groups, with slow drift, on H/U (`CLOUDS`) | H/U | 0.2 ms | None | `CLOUDS.children.length ≥ 6` on H/U |
| M | Night: real `PointLight`s only for the **nearest 6 lamps** (pool moved each 0.5 s); all others use an emissive ground-pool decal (review 22 item 7); windows keep `FL_emis` | H/U (decals on all tiers) | 0.6 ms (6 lights, keyed shader) | Light count change = recompile: keep it fixed at 6 and toggle intensity | Exactly 6 lamp lights exist, the nearest ones get them, and their count never changes |
| N | Traffic and people: full-detail meshes ×1.5 radius, density from TUNE (density-r21l owns the numbers) | H/U | 0.5–1 ms | Overlaps with the density lane: only the radius changes here | LOD radius per tier |

Per-tier budget (frame work time, p95, mid discrete GPU, 1080p): HIGH ≤ 8 ms, ULTRA ≤ 12 ms. A feature that breaks its tier budget moves up one tier.

## 3. Lanes (each ≤ 40 min, one deliverable, Sonnet; 2 workers at once, the reviewer checks each)
1. **tier-r22a: detector + light owner (A).** GPU-string score, caps, 3 s probe, `mho_gfxtier`, `?gfx=0..3`, the Settings entry, PC step-down-only. Fix `GFX_light`/`ART_light` (A). The phone path stays the same: assert `GOV_touchBoot` state and `LK_lvl()` are unchanged on touch. GOs: `gfx/tier` (fake GPU strings → expected tier), `gfx/tod`, plus perf/ios-reveal. The flag `mho_gfxtier` defaults to auto, and `?gfx` forces a tier.
2. **gfx-r22b: HIGH pass (B, C-MSAA, F, G, H, L).** Only knobs that already exist. Golden views per tier (below).
3. **gfx-r22c: ULTRA core (C-SMAA, D, E).** Add the SMAA and (only if 4096 is not enough) CSM addons. Licence: three.js MIT, noted in the commit.
4. **gfx-r22d: ULTRA atmosphere (I, K, J).** Sky env every 2 s, sun shafts, wet-road Reflector. J goes behind its own flag, default OFF until its cost is measured.
5. **gfx-r22e: night (M + lamp decals).** Decals on all tiers (the review-22 item 7 target), 6 real lights on H/U.

Opus is not needed: everything is a knob or a stock addon. Use Opus only if lane 1's tier mapping misfires on real Beta GPUs twice.

## 4. Golden baselines per tier
- `tools/golden.js` gets `--tier low|mid|high|ultra`, which loads the page with `?gfx=N` and stores views under `docs/golden/<tier>/<view>.png`. The current files become `docs/golden/low/`, the phone and default set (moved, not regenerated).
- CI and lanes run `low` always, plus each tier they touch. A tier set is about 1.5 MB (half-size PNG). MID and HIGH get only `fra-skyline`, `fra-street-traffic`, `ath-street` and `race-grid`; HUD views stay low-only (same DOM).
- SwiftShader renders every tier deterministically (slowly). GTAO, SMAA and shafts are deterministic with the seeded clock. J (the reflector) is masked out of the diff the same way the sky is.
- A lane that changes a tier's look runs `--update --tier <t>`, looks at each new baseline next to a 2K Drive or Forza Horizon reference (side-by-side shot, CLAUDE.md rule 4), and commits only those files.
