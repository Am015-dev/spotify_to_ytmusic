# Plan: open-world streaming for Overdrive (from fiveplay.lol study)
Ordered by player-visible impact on iPhone. One lane = one deliverable, 45-60 min, behind an `OD_FLAG` default OFF until its GO passes ([../game/flags.md](../game/flags.md)). Every lane runs the phone profile + `perf/ios-reveal` gate. Techniques: [../learn/streaming.md](../learn/streaming.md), [../learn/phone-profile.md](../learn/phone-profile.md), [../learn/threads-gpu.md](../learn/threads-gpu.md).

## 1. Real low-memory iPhone profile (complexity high)
- Like theirs: one switch, measured as a pair. On tier 0 (`src/98gt_gfxtier.js:GFX_detect`; Safari has no deviceMemory, use UA + tier): shadows off, texture top mip skipped (half-size canvas textures in `src/10_core*.js`), lower density in `src/98pc_compact.js` / `src/98rb_roam_budget.js`, render-size cap.
- Add an OOM/stall hint: 30 s without boot progress -> "close other tabs".
- Target: phone profile geometry + texture MB (beacon `src/98pb_perfbeacon.js`) -40 % in Athens; ios-reveal PASS; draws/frame on the phone tier logged before/after.

## 2. Persistent local cache of chunks (complexity medium)
- `tools/build.sh` writes `manifest.json` (file -> content hash) next to `PUBLISH_FILES.txt`. Loaders (`src/10z_lazy.js:XC`, `src/98ld_stub.js`, `src/98xf_xform.js`, `src/98lx_life.js`, `src/98as_assets.js`, `src/98qa_loader.js`) ask one helper: IndexedDB hit with the same hash -> eval from cache; else fetch, store, eval. IndexedDB works on the artifact; OPFS only if a probe passes there. Old hashes are deleted at boot.
- Target: second load on phone profile: 0 network bytes for km.js/models.js/xc/models chunks, load-to-drivable -30 % vs first load.

## 3. Car swap after many cars (complexity medium)
- Today: swap time after 100 cars is **38 s**. Per-car chunks `models/<id>.js` (`tools/ld/mkmodels.py`, `src/98ld_import.js:LD_geo`) are fetched on demand and old geometry is kept. Do: cache chunks (lane 2), prefetch the neighbours in the garage list at low fetch priority, dispose the previous car's geometry/materials, join an in-flight fetch instead of refetching.
- Target: swap <= 2 s at car 100, JS heap flat (+-10 %) from car 10 to 100 (GO in `src/99cg_garage_cars.js`).

## 4. Shader recipes + prewarm (complexity high)
- Like their pipeline recipes: record each program key three.js links in a session (`renderer.info.programs`), save to IndexedDB, ship a seed list from the bot run. `src/98bp_warmall.js` compiles the seed + saved keys during the loader, a few per frame (KHR_parallel_shader_compile when present).
- Target: ios-reveal 0 shader links in the first 3 s **and** 0 links in the first 30 s of driving (Frankfurt + Athens, bot route).

## 5. Tile streaming of city chunks near the car (complexity high)
- `src/98cl_stream.js` (STR_*) already builds far super cells only within draw range + `TUNE.strLoad`; extend it to the near data: split Frankfurt LAZY outskirts and Athens blocks into tiles packed per tile in `xc/` (`tools/lazy/pack.js`), load tiles within radius R, dispose beyond R + hysteresis (`src/98mf_memfree.js`).
- Target: geometry buffers flat (<= +10 %) over a 5 min tour (was 68 -> 222 MB Athens before STR); load-to-drivable -20 % (far tiles after reveal).

## 6. Read-ahead along route and heading (complexity medium)
- Their hint queue: queue tiles ahead of the car (velocity x 6 s) and along the race checkpoints (`src/20_race_world.js`) at `priority:'low'`, max N in flight; a demand load joins a queued fetch.
- Target: 0 "tile not ready inside draw range" events in the time-accelerated bot race (`tools/bughunt.js`), phone profile.

## 7. Worker build (later, complexity high)
- No COOP/COEP on our hosts: no SharedArrayBuffer. Still possible: build tile geometry in a Worker and transfer ArrayBuffers; later OffscreenCanvas render worker. Target: 0 long frames (> 50 ms) while a tile loads at 6x CPU.

Files: [../game/render-and-perf.md](../game/render-and-perf.md), [../game/build-and-deploy.md](../game/build-and-deploy.md), [../game/garage-and-models.md](../game/garage-and-models.md).
