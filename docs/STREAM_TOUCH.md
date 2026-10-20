# STREAM_TOUCH: stream the city on touch (ios-r17n, 2026-10-20)
Goal: touch JS heap ≤ 250 MB per city (today, GC'd, test page ?lowmem=1: Frankfurt ~380, Athens ~535 at ready).

## What is built at load and kept (measured by unique ArrayBuffer, Athens / Frankfurt MB)
- Geometry in the scene graph: 155 / 137 MB in total.
  - MEMF streamed chunks (gpuStr, buildHubG merged blocks + LDraw `cd` props, packed Int8 normals / Uint8 colours): hidden far 52 / 25, hidden mid 16 / 18, visible 7 / 23.
  - Ground and drive meshes (trG, gk, dr; position + index kept for raycasts and height reads): hidden far 58 / 7, near ~5 / 5.
  - Instanced templates ~10 / 24 (the instance pipeline itself, matrices + PC src, is ~60 MB more in Athens; see ios-r17g/h).
- WB far city (super cells): Athens 28 / Frankfurt 44 MB of CPU arrays on the TEST page only. The test page stubs renderer.render (draw=0),
  so STR_up never uploads and frees them; on a device (and with STR_up re-run with drawing on) they drop to 0: heap 535→508 / 381→338.
  GO heap numbers (perf/ios-mem) therefore overstate the device heap by that much.
- Non-geometry (~330 MB Athens): GND_L / TR_h / TR_HA grids, ~1.5 M boxed doubles in plain objects, LIFE / LV cells, prop lists (HUB.props),
  Object3D trees (7.7 k InstancedMeshes), CV_put / athBuildG builder leftovers, textures' CPU images.
- LIFE, traffic, props: built per region already (LAZY + LF tiles freed by STR_lzFree past draw range + strLzOut).
- Terrain: TR_h and TR_HA grids built whole at load (gameplay reads anywhere; stay).

## What can be rebuilt from compact source on demand
- Streamed chunks: no per-cell builder exists (buildHubG merges whole districts), so the compact source is the chunk's own deflated
  bytes (lossless, ratio 0.17-0.19 on packed chunks: 57 MB → 10.7 MB in Athens). Slice 1 below.
- WB super cells: already rebuilt from templates + per-instance matrices (STR_step, ≤ 4 ms/frame); nothing to add.
- Ground / drive meshes far away (58 MB Athens): their readers are the car, traffic and LIFE near the player; far tiles could be deflated
  like chunks if every height / raycast path near a far traffic car falls back to GND_L (needs an audit of trG/gk/dr readers). Slice 2.
- City blocks per 200 m cell (the real "rebuild from source"): split buildHubG's merge per cell (WBC cells already exist, 320 m) and keep
  the per-cell plan (block footprints, heights, palette ids: ~100 B per building) instead of merged geometry. Slice 3, big.

## Radius / cell scheme (touch)
- Camera far on touch is 1500 m (LK_lvl 'min', fog 0.00045). A chunk is off past far + 50 m (nearest edge), shown inside far - 50 m.
- Off chunks deflate past far + 200 m, inflate starts at far + 150 m (100 m before the show line), at most 2 zips + 3 inflates in flight.
- Cells: MEMF chunks keep their own bounding circle; slice 3 uses the WBC 320 m grid so build / free decisions match the far LOD.

## Per-frame budget (touch ≤ 8 ms/frame)
- Zip: one memcpy of the chunk (≤ 1-2 ms for the biggest chunks) per frame; CompressionStream runs async. Inflate applies zero-copy
  views (≤ 5 ms). STR_step keeps its 4 ms (12 ms catch-up). Slice 3 builds one cell per ≤ 4 ms slice through the same budget.

## Slice 1 (landed, ?tstream=1, default OFF): src/98mf_memfree.js MEMF.ts
- Radii from camera.far as above, deflate from 4 s after the first roam frame (was 45 s; TR_bldFix runs inside the hub build).
- Measured (touch 852×393, ?lowmem=1, GC'd, 60 s real-time roam on the test page):
  Athens heap ready 531 → 531, after 60 s 539 (off) → 532 (on); 813 chunks deflated, 57.3 → 10.7 MB.
  Frankfurt ready 382 → 382, after 60 s 445 (on; roam growth from LAZY/LIFE dominates).
- Heap at ready does not move (zips start after the first roam frame); the gain is ~45 MB of arrays, mostly hidden by roam growth.
- Long tasks in the 60 s window: 100-170 ms on both on and off (swiftshader + the final CDP GC); no new spike from tstream.
- Below the 80 MB Athens bar → stays OFF.

## Expected heap per city at ready (touch device, not test page)
- Today: Athens ~508, Frankfurt ~338. After slice 1 (+zip during the load curtain): Athens ~460, Frankfurt ~315.
- After slice 2 (far ground): Athens ~420. After slice 3 (cell plans, no merged far blocks) + the instance pipeline cut: Athens ~300.
- 250 MB also needs the non-geometry owners: boxed doubles → typed arrays, HUB.props as SoA, builder leftovers released.
