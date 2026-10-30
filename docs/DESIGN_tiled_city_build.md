# DESIGN: tiled city build (lane tilebuild-r30j, 2026-10-30)
Goal: PLAY -> first control <= 36 s lab at 6x CPU in Frankfurt AND Athens (= ~5 s on an iPhone, docs/GAUNTLET.md), with perf/ios-reveal green (0 shader links, no long frames in the first 3 s after reveal). Today: gauntlet 75.5 s fra / 108 s ath. Design only: no engine change ships in this lane.

Organisation idea (rule 19, docs/wiki/learn/cuphead-structure.md): "Scene per level (Loading, Tutorial, Win): a clean split between the level and the shell around it." Ported as: a **shell phase** (global plan data: street net, blocks, landmarks, garages, mission spots, minimap, colliders-to-be) that is separate from **per-tile content** (geometry, instanced buildings, props, kerbs, ground). The Frankfurt LAZY biomes already work this way (`src/60_city_build4.js:lzReg`: plan(L) at boot, build(L) as a generator later, "collisions, missions and the minimap never depend on what is loaded"); this design extends that split to the core city.

## 1. Measured breakdown (built page out/tb30j = trunk 9f0c2ea, phone profile)
Probe: a copy of `tools/perf/boottoctl.js` (iPhone UA, 852x393 touch, dpr 2, software GL, real title -> PLAY tap) + `--ath` (the gauntlet's Athens save seed) + a dump of the game's own `BMK` marks, CPU profile on (`--prof`, 2 ms sampling). The profiler adds ~15 % (this run: fra 89.3 s / ath 121.2 s vs the gauntlet's 75.5 / 108 s); shares below are what matter. One run per city, alone on the box.

### Frankfurt, 6x: PLAY -> control 89.3 s (wall, from BMK marks; ms)
| phase | ms | kind |
|---|---:|---|
| Warming up the engine (roamPre/setupRace, before the hub) | 4 232 | other |
| Raising Frankfurt | 414 | other |
| **buildHubG** (4.3 s -> 68.1 s) | **63 800 wall** (51 760 JS self+children in profile) | |
| - rfBase + rfPass (street-net post passes) + hubRoads | 8 083 | global plan |
| - gnd + gndC + Laying the ground + post: (city ground cells) | 20 913 | spatial geometry |
| - fillX + kerb+ + streets + CEkerbs (crossings, kerb pieces, street ribbons) | 11 880 | spatial geometry |
| - Filling the Main + preBlocks + blocks + landmarks + Placing buildings + Merging the city + Planting | 5 908 | spatial (landmarks global) |
| - ctbK (LEGO set variants built on first pick) | 5 557 | template, demand-driven |
| - altFix + trFix0 + trFix (per-building ground fit) | 2 515 | spatial plan |
| - lzPlanAll | 209 | global plan |
| - props (bhp*, ocp, post~) | ~4 960 | spatial |
| - Starting traffic | 2 095 | spatial (spawn) |
| Switching on the street lights + Placing rivals & events | 1 069 | other |
| Painting the sky (P2_compile + ldPrewarm) | 9 025 | shaders |
| Loading the city into the GPU + roamPost + render1 | 2 936 | upload/render |
| twg run0 + ll + r17 + end (start-view prewarm, TWG_run) | 8 075 | render |
Non-hub total: 25.5 s. Hub wall vs hub JS: ~12 s of the hub is loader frames / GC / native between the 12 ms yields (`src/72_roam_map_loop_boot.js:206`).
Profile, top self inside the window: (program) 10.2 s, fillAt 4.9, convertBufferAttribute 3.9, readPixels 3.6, mergeAttributes 3.5, gndGen 2.6, Float32BufferAttribute 2.6, GC 2.3, TR_grade 2.2, LD_cull 2.2. Inclusive: gndGen 15.8, ART7_quad 9.7, GB_geo 6.9, CTB_kind 5.6, rfGridNext 5.1, TBatch.add 4.7+4.2, toNonIndexed 4.3, TWG_run 4.1.

### Athens, 6x: PLAY -> control 121.2 s
| phase | ms | kind |
|---|---:|---|
| Warming up the engine | 4 255 | other |
| bh5..bh17 (pre-ground plan steps) | 2 505 | global plan |
| gnd + gndC (ground cells, QTC stream) | 16 641 | spatial geometry |
| streets + CEkerbs | 4 238 | spatial geometry |
| Planting the olive trees (worldGroundBuild, one 5.2 s step) | 5 187 | spatial geometry |
| preBlocks + ctbK (incl. **athBuildG**: put / CV_put / BV_near2) | 31 537 | spatial plan + geometry |
| Building the landmarks + Merging the city | 1 541 | global / spatial |
| trFix0 + trFix (TR_bldFixG, 75 048 building rows) | 15 103 | spatial plan |
| grid + props start (bhp9..bhp49) | 3 853 | spatial |
| after 85.8 s: unmarked (the BMK buffer's 1 500-entry cap was hit) | 35 397 | props tail + traffic + shaders + TWG |
Profile inclusive: buildHubG 73.5 s, athBuildG 20.8, gndGen 15.3, put 12.3, buildHubPropsG 11.5, TR_bldFixG 10.4, CV_put 9.7, BV_near2 6.3 (self), worldGroundGen 5.0, DR_solidBuildG 4.3, ldPrewarm 3.9, WebGLRenderer.render 3.7, GC 3.4. Self: (program) 20.2, gndGen 7.9, BV_near2 6.3, TR_bldFixG 4.8, find 3.8, cityAt 3.3.

### How much of the city is near the spawn (1x run, after control, measured in the page)
| city (spawn) | within 400 m | 800 m | 1 200 m | 1 600 m | total |
|---|---|---|---|---|---|
| fra (-378, 448): colliders HUB.bld | 163 | 561 (7.5 %) | 1 567 (21 %) | 2 865 (39 %) | 7 433 |
| fra props | 1 326 | 4 131 (11 %) | 8 278 (22 %) | 13 737 (37 %) | 37 579 |
| fra instanced vertices | 1.41 M | 2.46 M (21 %) | 3.81 M (32 %) | 5.57 M (47 %) | 11.86 M |
| ath (1878, -3177): HUB.bld | 474 | 1 570 (2.1 %) | 3 803 (5.1 %) | 6 462 (8.6 %) | 75 048 |
| ath props | 294 | 940 (2.8 %) | 1 812 (5.5 %) | 3 946 (12 %) | 33 103 |
| ath instanced vertices | 0.12 M | 0.24 M (4.4 %) | 0.39 M (7.1 %) | 0.71 M (13 %) | 5.50 M |
(Merged TBatch vertices could not be counted: memFree drops their CPU arrays after upload.) So: everything spatial within 800 m is 8-21 % of the work in Frankfurt and 2-5 % in Athens.

## 2. Design
**Pre-reveal = shell + ring R0 (800 m around the spawn). After control = rings R1 (to 1 600 m = draw range) then the rest, nearest first, time-sliced.**
- **Tile** = the existing `hubTile(x,z)` 800 m cell (`src/53_terrain_roads.js:467`). TBatch already keys its merges `material#hubTile` (`src/20_race_world.js:8`), so a per-tile flush needs no new merge code.
- **Shell (global, ordered, data only)**: street net (rfGrid), hubRoads, blocks list, landmarks, garages, bridges, mission spots, lzPlanAll, QV graph, minimap data. Frankfurt's rfGrid (8.1 s) becomes a build-time bake (like `tools/qtdump.js` -> `src/10b_qt_data.js` for the Athens ground): deterministic from seed 2024, shipped as an xc/ chunk.
- **Tile content (order-free)**: ground cells, kerbs, crossing pads, street ribbons, buildings (block-owned: a block belongs to the tile of its centre, so buildings never straddle an owner), per-building ground fit (trFix), Kenney instances, props, parked cars, traffic seeds. Each block draws from its own seed `mul(2024 ^ blockIndex)` instead of the global `rnd` stream, so a tile builds identically in any order (today `rnd` is consumed in loop order: reordering without this changes the city).
- **Dependency rule**: a tile's props build only after its 8 neighbours' buildings (props test against buildings across the border); colliders (HUB.bld rows + HUB.grid) of ring R0 + one tile are in before reveal.
- **Streaming after control**: one queue `TB.q` pumped by the existing `B2_pump` idle slicer (`src/98bt_boot2.js`, <= 4 ms per frame, never past the idle deadline), ordered by distance to the car and heading (read-ahead like plan/open-world-streaming lane 6); catch-up budget like `STR.msC` when the car is within 300 m of an unbuilt tile. New tile roots stay hidden until finished (as `lzStart`/`lzFinish`).
- **Reveal hygiene (perf/ios-reveal)**: tiles built after reveal must not link programs: every material a far tile can use is compiled under the curtain by drawing a count-1 stand-in per (material, instancing/instanceColor) variant (the boot-r30g finding), and no tile finish may take > 8 ms in one frame (lzPreG-style generator for grid/cull insertion). Nothing streams in the first 3 s after reveal except the R1 queue at <= 4 ms per frame.

Modules touched: `src/60_city_build4.js` (buildHubG step order, kerb/fill loops, blocks loop, props call), `src/60_city_build.js` (gndGen cell order), `src/60_city_build3.js` (athBuildG per tile), `src/85_audio_feel_sp_otg.js` (TR_bldFixG per tile), `src/60_city_build6.js` (buildHubPropsG per tile), `src/20_race_world.js` (TBatch.flush(parent, tileFilter)), `src/98bt_boot2.js` (queue/pump reuse), `src/72_roam_map_loop_boot.js` (roamLoad: stop after ring R0, BMK cap), `src/51_city_net.js` (rfGrid bake load), `tools/qtdump.js` (indexed QTC), new `src/98tb_tiles.js` (TB_* tile book: ring order, TB_ready(x,z), TB_need(x,z), queue), `src/98bp_warmall.js` (stand-in prewarm), traffic/peds spawners, `src/99c_checklist.js` GOs.

### Projection (not a measurement; Step 1 measures the real number)
Frankfurt, keeping the measured 800 m share of each spatial step (21 % geometry, 11 % props, 7.5 % colliders) and baking rfGrid: saves ~48 s of the 89.3 s profile run -> ~41 s profile ≈ **35 s gauntlet** (bar 36: margin ~1 s; the next lever is Painting the sky 9 s, compile only what the R0 view and stand-ins need). Athens, keeping <= 8 % of ~93 s of spatial hub wall: ≈ 36 s profile ≈ **32 s gauntlet**, if the unmarked 35 s tail is mostly props (to confirm in Step 1).

## 3. Implementation steps (each SONNET, ~45 min, one deliverable, flag default OFF until its GO passes; phone profile + perf/ios-reveal on every step)
1. **`?tb1` ring scaffolding + pure-geometry deferral (Frankfurt).** New `src/98tb_tiles.js` (tile ring order, TB.q on B2_pump); BMK cap 1 500 -> 6 000; gndGen cells, kerb pieces, fill pads, street ribbons and the TBatch flush run for tiles within R0 before reveal, the rest after control. Same data, only timing. GO `perf/tb-geo` (99c style): at control every ground cell/kerb whose centre is within 800 m exists; at +30 game-s all exist; sorted vertex-count per (material#tile) equals the flag-OFF build; pass line `tb-geo fra: R0 cells n/n, all at +30 s, keys equal`. Number: fra gauntlet toControl <= 58 s (from 75.5), 0 long frames > 50 ms in reveal+3 s.
2. **`?tb2` indexed QTC: Athens ground out of order.** `tools/qtdump.js` writes a per-cell offset table so gndGen can decode cell k alone; Athens joins tb1 and its olive-tree step goes to the queue (Athens B2.defer is OFF today because of the ordered QTC stream). GO `perf/tb-qtc`: every Athens ground cell decoded out of order equals the in-order decode (height hash per cell). Number: ath gndC + olive trees pre-reveal 21.8 s -> <= 3 s at 6x.
3. **`?tb3` block-owned buildings per tile (both cities).** Per-block seed; blocks loop, athBuildG (put / CV_put / BV_near2 raster windows), Kenney instances, colliders and TR_bldFixG run per tile; R0 + 1 tile of colliders before reveal. GO `world/tb-order`: tile hash (HUB.bld rows x,z,hw,hd,h,ry + Kenney kind/tint of the tile) is identical when built from spawn A and from spawn B (order independence); 0 collider rows missing within 300 m of the car at any time in a 120 s bot drive. Number: ath ctbK + trFix pre-reveal 46.6 s -> <= 5 s; fra blocks + trFix + ctbK 14 s -> <= 4 s. Reviewer looks at before/after shots (the per-block seed changes the city once).
4. **`?tb4` props, parked cars, traffic and peds per tile + TB_ready gating.** buildHubPropsG per tile after its neighbours' buildings; traffic/peds/parked spawners only on TB_ready tiles; missions/races call TB_need(target) at accept time. GO `life/tb-spawn`: 0 traffic cars, peds or props on unbuilt tiles over 120 s; a mission started at a far mark has its target tile built before the car is within 300 m. Number: fra props + traffic pre-reveal 7 s -> <= 2 s; ath props <= 2 s.
5. **`?tb5` rfGrid bake + far-material prewarm.** Build-time dump of the Frankfurt street net (seed 2024) into xc/, loaded instead of rfGridBegin/Next; count-1 stand-ins compile every tile material variant under the curtain. GO `perf/tb-bake`: baked net equals the live net (node count, segment hash); perf/ios-reveal 0 links in reveal+3 s and 0 links while R1 streams (first 30 s). Number: fra rfBase + rfPass 7.9 s -> <= 0.6 s; **gauntlet boot/toControl <= 36 s fra and ath** (the lane's exit bar).
Each flag ships ON (and the old path is deleted) within a day of its GO passing (rule 11).

## 4. Risks and mitigations
- **Collisions / props missing before their tile builds**: colliders for R0 + one tile are in before reveal; at 30 m/s the car needs >= 27 s to leave an 800 m ring, while R1 streams in a projected ~10-15 s at 6x; catch-up budget when within 300 m of an unbuilt tile; last resort: shell-plan collider rows (cheap data) are added ahead of geometry. GO in step 3 checks 0 missing within 300 m.
- **Traffic / peds spawning on unbuilt tiles**: spawners ask TB_ready(x,z); a car driving into an unbuilt tile is parked/hidden until it is ready (step 4 GO).
- **Missions targeting unbuilt areas**: mission spots, gates and race checkpoints are shell data (already true for LAZY regions); accepting a mission/race calls TB_need on its target and route tiles, which jumps the queue (read-ahead along the checkpoints, plan lane 6).
- **Minimap**: roads, landmarks and gates are shell data, but `drawRoamMap` (`src/70_roam_world.js:333`) draws building footprints from `HUB.bld`, which is filled per tile: far tiles would show empty blocks. Mitigation: until a tile is ready the map fills its shell block rects; on each tile finish the cached map base is marked dirty and redrawn (at most once per second). Step 3 GO adds: map footprint count in R1 at +20 s equals the flag-OFF count.
- **Determinism / layout change**: reordering with the global `rnd` would change the city: per-block seeds make every tile order-free (step 3 GO); the city changes once, reviewed by shot.
- **Athens QTC ordered stream**: indexed decode in step 2, with a per-cell equality GO.
- **Holes on the horizon at reveal**: ring R0 is 800 m and draw range 1 600 m: the R1 ring is the first queue item and the fog/far city (WB far super cells, `src/98cl_stream.js`) covers > 1 600 m; the step-1 shot at control and at +5 s must show no visible gap within 800 m, and R1 complete by +15 s.
- **Late shader links / long frames after reveal**: stand-in prewarm (step 5) and the <= 4 ms per-frame pump; any tile finish > 8 ms is split (lzPreG pattern).
- **Margin**: the Frankfurt projection lands at ~35 s against a 36 s bar; if step 5 misses, the next lane is Painting the sky (9 s) compiling only the R0 view's programs plus stand-ins.

Licence: no ported code in this plan; any port follows docs/wiki/sources/licences.md (GPL-3.0 game, attribution header). Read: CLAUDE.md, wiki index, render-and-perf, plan/open-world-streaming, GAUNTLET.md, GAUNTLET_QUEUE.md, REVIEW_2K_32..34, HANDOFF_boot-r30e/g.
