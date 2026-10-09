# HANDOFF world (alex/od-world): v88v world batching → v88w 2× brick detail → Athens busier

Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Live: v88u (alex/od-athens dadad854; handoff 14f6eb6 merged here).
Draft PR #74 (alex/od-world → alex/od-athens) exists; it is only for tracking.

## Status v88v (NOT reviewed, NOT deployed)
All code is in `src/98wb_world_batch.js` (in ORDER before 99c_checklist.js) + knobs in 10_core TUNE / 99t_tune Life tab / tune.json / docs/TUNE.md.
OD_CHANGELOG v88v entry + 3 checklist items (world-smooth, world-look, world-cars) are committed in src but out/v88v is NOT built for deploy yet.

### Numbers (headless 852×393, normal gfx, `node ath/perf.js <url> fra|ath`, avg of 3 street spots)
| | v88u live | v88v now |
|---|---|---|
| Frankfurt draws | 435 | **249** |
| Frankfurt tris | 2.46 M | **1.02 M** |
| Athens draws | 297 | **242** |
| Athens tris | 1.60 M | **0.97 M** |
Baseline = a worktree of v88u at `wb/base` (local only; recreate: `git worktree add wb/base dadad85` + ln node_modules + `tools/build.sh v88u --local`).

### What it does
1. **WB_car (traffic)**: the root cause of half the triangles: 150 LEGO traffic cars, 23k tris each, frustumCulled=false, full detail at any distance.
   In `scene.onBeforeRender` the HUB.cim instance buffers (+ wheels/glass) are compacted to the in-view cars ≤ `wbNear` 70 m; farther in-view cars go to a
   per-type vertex-clustered copy (`WB_cluster`, InstancedMesh userData.wbLo); cars beyond `wbFar` 900 m / out of view are dropped. Restored in onAfterRender
   (game code keeps its slots c.j). Knobs TUNE.wbCarLod/wbNear/wbFar/wbCell.
2. **WB_city (static city)**: 320 m cells (WBC.C). Static instanced models (Kenney kits, trees, props; incl. frustumCulled=false static ones, TUNE.wbNfc) and
   merged tiles (TBatch meshes, roads/pavements, TUNE.wbMerged) are assigned to cells.
   - Near cells (rect within `wbLodD` 220 m of the camera): instanced models draw through per-original proxy InstancedMeshes (only near instances, rebuilt when the
     near set changes or the original's instanceMatrix.version changes; >4 rebuilds/2 s → entry off). Merged tiles are sorted by cell IN PLACE in the loader
     (`WB_cityPrep`, before SM_upload frees the CPU arrays, ~0.25 s Fra / 0.5 s Ath) and drawn as piece meshes sharing the same attributes via drawRange.
   - Far cells: one mesh per cell (vertex clustering at `wbLodCell` 3 m, colours sampled from the textures (≤256 px copy), Int8 normals + Uint8 colours, flat ground-hugging
     materials lifted 0.25 m). Originals are hidden only during the render.
   - The clustering runs IN-GAME in the background after roamPost (+1.5 s, ~6 ms per frame, real device est. ~10 s; game looks like v88u until `WBC.on`).
     Tests: `await __wb.fast()` finishes it at once (ath/perf.js, shots, top already call it).
3. **WB_fig**: mission minifigs (userData.qaFig), the 1.5 m beacon stubs (userData.artB), ramp parts beyond `wbFig` 260 m are hidden per render.

### Shots (look at them)
`ath/v88v/cmp_fra.png`, `ath/v88v/cmp_ath.png`: left v88u, right v88v, 3 spots × (chase view + drone view 75 m up). Same look up close and far; differences = traffic/pop-up timing only.
A review drive (`ath/v88v/g11drive.js`, ATH=1, = t4/g11drive.js + __wb.fast) was started; its results were not collected → rerun:
`ATH=1 node ath/v88v/g11drive.js http://127.0.0.1:8766/local_dbg.html wb/rev` (start, Frankfurt drive, Athens, low side view, tyre gap).

### Left for v88v
- Draws ≤ 200 Frankfurt (now ~250; worst spot 0.1 ~290). Breakdown at spot 0.1 (ath/v88v/top.js DET=b SPOT=0.1): city proxies+LOD+pieces ~90, terrain trG/trPl ~30,
  traffic (11 types × body/wheels/glass/lo/ART8 twins) ~25-30, misc small (studs in RO.grp, sprites, gb car, points) ~40, remaining merged/HUB.M ~30.
  Ideas: bigger far cells (2-level: 640 m blocks when all 4 sub-cells far), fewer near proxies (merge instanced near content per cell per material is too much memory),
  traffic: one far InstancedMesh for all types, drop ART8 twins beyond ~40 m.
- Unmeasured: the in-game background build's frame hitches (single big ground pieces / the first canvas readback can take 100+ ms in swiftshader). Measure on the beta.
- Then: rebuild on CURRENT live, `tools/build.sh v88v --local`, FULL review (REVIEW alex/od-world <commit> <shots> + tyre gap ≤ 0.05; the car pose code is unchanged),
  after PASS build split out/v88v, `git add -f out/v88v`, DEPLOY to the coordinator.

## v88w plan (2× brick detail, Alex's ask) — only on top of v88v
- Near only (≤ 60 m, i.e. inside wbNear / the near cells): add bricks/studs/tiles/SNOT bands as extra geometry that the far LOD never sees.
- City: studs on roofs and ledges as ONE instanced stud mesh per near cell (proxy scheme already knows near cells); brick courses / window frames as a detail texture
  or merged geometry on the BM facade materials (TBatch), so draws stay within +10 %.
- Cars: finer parts in CR_cityGeo / CR_car templates (93_cars_lego.js); the far copy is rebuilt automatically (WB_loOf keys on geometry uuid).
- Before/after close-ups (cars side view, facades at 10-20 m), draws/tris with perf.js, tyre gap ≤ 0.05.

## Athens busier (after v88w): see docs/HANDOFF_perf.md "Next" (kerb dressing instanced, crowd clusters, evzones, #bus).

## Tools (ath/v88v/, run from the repo root; server :8766 = `python3 -m http.server 8766`)
- `top.js <url> fra|ath` (DET=b SPOT=f): draws/tris per object category at one spot (hooks renderBufferDirect).
- `inv.js`: inventory of HUB.grp by material. `probe.js <url> <city> "<js>"`: evaluate after roam entry. `shots.js <url> <city> <out>` (DRONE=1, SPOTS=…).
- `tpltest.mjs`: node unit check of WB_tpl (indexed = non-indexed result).
