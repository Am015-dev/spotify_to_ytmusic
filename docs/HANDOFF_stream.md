# HANDOFF stream (alex/od-stream): streaming ships as **v89e**. NOT reviewed yet

## STATUS 2026-10-09 ~17:40 (read this first)
- Merged live src: od-cam (v89b1) and then **08f37b5e** (live v89d; od-p2 HEAD 36843abe only relabels v89d→v89c, do NOT merge it). `_base/` worktree = 08f37b5e, builds byte-identical to live v89d.
- Fixes since 8bea0dd:
  - far-cell bounds come from the fill loop;
  - the triangle loop yields every 256 triangles;
  - in-range cells are built inside the WB background build before the far LOD switches on;
  - catch-up budget STR.msC=12 for missing in-range cells, minus this frame's LAZY time (STR.lzT, including LAZY unload);
  - no build in a frame whose LAZY step was big;
  - LBatch.flushG (sliced flush, 60_city_build).
- Probes: `__str.st.fr` (per-frame stream cost: max, o16, o50), `__str.st.lzBig`. Tools: `ath/v89b/popin.js` (holes at speed + long views), `chk5.js` (garage + kiosks), `tPlayS.js` (tPlay + stream stats), `final*.sh` chains.
- Results (pre-merge v89c build, `ath/v89b/final/`):
  - normal phone tPlay: stream frame max 13.6 ms, 0 frames >16;
  - pop-in: 0 holes at Fra 200 km/h and Ath 110 km/h;
  - draws ≤ live at the same 5 spots;
  - heap+geo: Ath 360→248, Fra 290→144;
  - tyre gap 0.03; garage OK.
- Warp stress (30 warps) still has ~12 frames >16 ms (max 25–38), 0 >50. It is not a normal drive.
- Open: tFoot Athens FAILED on stream+od-cam (camIn 13 %, stuck 4.6 %; own car 40–65 m away). `final3.sh` re-checks on merged v89e vs live v89d.
- Athens tPlay wall hits 4 vs 2: the same building is hit on live (bot cuts the grass), so it is noise.
- Next: read `ath/v89b/final3/*`. If tFoot ath passes like live → REVIEW (reviewer session_01Y6...) with the memory table, hitch numbers, draws and shots (final/side/*, final/pop/new/*_long*, final/spots/new/*, final/chk/fra_garage.png). After PASS: OD_CHANGELOG v89e + 2 checklist items (drafted: 'far city streams in/out, ~40–50 % less memory', 'no stutter when far districts appear'), `tools/build.sh v89e`, `git add -f out/v89e`, then DEPLOY to the coordinator.


Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Base: v89a src (live brave-carson 653400a).
Parallel: alex/od-quick (traffic mix, speeds in 99_api, ramps). This branch does not touch those.

## What the "521 MB" really was
`ath/v89b/heap.js <url> fra|ath [N]` loads the city, enters roam and does N warp stops across the city (2.5 s each). That is a streaming
stress test, not tPlay. It reports:
- the V8 heap after 2× GC (CDP);
- the heap before GC and its peak (`performance.memory`, no GC);
- the typed-array bytes of all scene geometry (`sceneGeoMB`), which V8's heap number does NOT include and which is also uploaded to the GPU;
- the geometry broken down by scene group.

The GC'd heap is flat and small. The 521 MB was the pre-GC peak plus garbage. The real growth is geometry buffers (CPU copy + GPU copy).

| after 30-stop tour | heap GC'd | pre-GC peak | geometry CPU | far LOD (wbLod) GPU+CPU | heap+geo |
|---|---|---|---|---|---|
| Athens live v89a | 136 | 368–391 | 222 | 152 | 357 |
| Athens v89b | 135 | 368 | **79** | **16 (CPU copy dropped)** | **214** |
| Frankfurt live v89a | 75 | 307 | 215 | 98 | 290 |
| Frankfurt v89b | 77 | 273 | **66** | **19** | **143** |

Errors 0 in both cities (`ath/v89b/v89b_heap2.txt`; baseline `base_*.txt`). Load time unchanged (Ath ~93–103 s, Fra ~35–39 s, headless).

## What streams now (src/98cl_stream.js `STR_*`, + edits in 98wb, 1 line in 60)
1. **WB far super cells (the 2×2 / 640 m far-LOD buffers): the main memory.**
   - Before, they were built for the whole map and never freed.
   - Now `WB_cityBuild2` only collects them. `STR_step` (wrapped into `lazyStep`) builds the nearest unbuilt one within draw range (1600, or 2100 on high) + `TUNE.strLoad` (300 m), as a generator: `STR.sl` 2 ms slices, `STR.ms` 4 ms per frame.
   - It disposes them beyond draw range + `TUNE.strUnload` (900 m), at most 2 per frame.
   - Their CPU arrays are released after the GPU upload (`TUNE.strFree`).
   - The cell items (template refs + 12-float matrix + colour) are packed per cell (`WB_cpack`) and stay resident, so a rebuild needs no source geometry.
   - Visibility logic in `WB_cityPre` is unchanged: cells beyond draw range were never drawn, so no visual change is expected.
2. **LAZY regions** (Frankfurt outskirts + the Athens ones built by plain `lzBuildG`): load at draw range + `TUNE.strLzIn` (100 m), previously a fixed 2200 m. Unload beyond draw range + `TUNE.strLzOut` (800 m):
   - dispose the meshes and InstancedMesh buffers (shared Kenney/prop geometry is never disposed);
   - drop the props from `HUB.props`/`pgrid` and the cull entries;
   - colliders, map roads, ramps and spots stay (plan data). Collisions and missions do not depend on what is loaded.

   On rebuild, the `lzFinish` wrapper skips re-adding the colliders. Taunus/Wald/Attiki corridors (custom builders with side effects) are NOT unloaded.

   Only ~3 MB, but it follows the plan.
3. **SM3 in Frankfurt** (`TUNE.strSm3`): SM_upload, which drops the CPU copy of single-use city meshes after upload, was Athens-only. It now runs in Frankfurt too: Fra load geometry 113 → 51 MB. **Risk:** any Frankfurt code that reads those arrays later would throw. None seen in 30 warps; must be covered by tPlay and the shot set.

Knobs: TUNE `strOn strFree strLoad strUnload strLzIn strLzOut strSm3` (`strOn=0` = old behaviour). Probe: `window.__str.sup()` and `__str.st`
(b/f builds and frees, max/over slice ms, relMB, lzF/lzB).

## Not done (ranked next steps)
1. **Hitches:** STR slice max was 35.6 ms in Fra and 14 ms in Ath (7 and 3 frames over 8 ms during the warp stress).
   - The last commit caps frees at 2 per frame; it has NOT been re-measured.
   - The remaining suspect is the unsliced tail of `WB_supMk` (`WB_rangeSphere` over a big buffer + mesh creation): slice it, or precompute per-cell bounds from the cell rect.
   - LZ max 17 ms is the existing lazy builder (`LZ.ms` 3.5, but single steps are bigger).
   - Measure with `ath/v88v/hitch.js` style on a real drive.
2. **Pop-in check (reviewer gate):** long-view shots in each city at the draw range edge, plus the standard shot set (852×393) and tPlay walls/stuck vs live.
   - Loading starts 300 m before draw range, so a car at 62 m/s has ~5 s to build. If shots show far cells missing, raise `strLoad`.
3. **Draw calls / FPS** vs live: not measured (`ath/v88v/top.js`, perf.js).
4. **More memory** if needed:
   - "Group/Mesh" = 62 MB in Athens and 45 MB in Frankfurt of city mesh CPU arrays that SM_upload skips: shared geometry (use > 1) or WB_split pieces whose arrays WB_cityPrep keeps by reference until the far build.
   - Find who holds them: the prep closures `q.mk` are nulled after the build, but `A` in `WB_split` still keeps the original arrays alive via the piece meshes' attributes.
   - Int16 positions in the far buffers (−33 %).
5. Then OD_CHANGELOG entry + checklist, rebuild on current live (merge alex/od-quick if shipped), split out/v89b, REVIEW → DEPLOY message.
