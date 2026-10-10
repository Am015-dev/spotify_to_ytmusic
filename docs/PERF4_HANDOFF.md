# PERF-4 handoff (Frankfurt GPU growth on v89n) · branch alex/od-mem · 2026-10-10

The brief comes from the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut). Live v89o (od-play 194aa532) is merged in (ff081e44), so this ships as **v89p**.

## Root cause (real leak, fixed)
- `FL_headlights` (the live copy is the override in `src/90_fixes_cv_ju.js`; the one in 85 is dead code) checked capacity with `H.count<N`.
- `H.count` is the drawn-instance count, set at the end of the same function. While any traffic car was hidden (most of the time), the check rebuilt the InstancedMesh every call.
- The old mesh was only removed, never disposed, so its merged geometry, material and instance buffer stayed on the GPU.
- Fix: compare against `instanceMatrix.count`, re-add the mesh if only its parent changed, and dispose the old one on a real rebuild.

## Evidence (`qa_mem4/`)
- **v89n baseline, tPlay 15 min FAST with RENDER=20** (`n15_fast`):
  - glMB 126 → 283 MB and info geometries 4100 → 7068, with scene geometry flat at ~4600.
  - That is a steady +6 MB/min and +180 geometries/min. Streamed far cells stayed 62–70 MB.
- **strtour (warp tour, real drawing), same spot visited twice:**
  - v89n: +4.9 MB GPU, +113 geometries, 147 off-scene undisposed `FL_headlights` geometries.
  - v89p: +2.0 MB (LAZY corridors and the wbM run pool, both bounded) and 0 leaked geometries. The headlight mesh id stays stable.
- **Far city (STR super cells) is bounded and frees really free GPU buffers** (glMB drops ~25 MB when leaving):
  - Frankfurt: 98 MB for the whole map, at most 82 MB built at any spot.
  - Athens: 248 MB for the whole map, at most 100 MB built at any spot.
- play-4's "5.8–12 MB/min" = headlight leak + exploration streaming. tPlay's old `geoMB` (scene traverse) could not see the leak, because the leaked meshes are off-scene and tPlay drew nothing.

## Gate (tools/tPlay.js)
- **GLHOOK:** a `bufferData`/`deleteBuffer` hook gives `glMB`, the exact live WebGL buffer bytes.
- **`RENDER=N` (default 20):** the page draws every Nth game frame so uploads really happen.
- **MEMS samples:** add `glMB` and `str` (built cells, mb, upMB = far cells already on the GPU, builds, frees). `MEMLOG=1` prints each sample as it is taken.
- **No-leak check:** 2nd-half trend of `glMB − str.upMB` ≤ 1.5 MB/min, far cells ≤ 110 MB, plus the existing heap, totMB and geoms checks. `geoMB` is reported only.
- **Probe:** `tools/eff/strtour.js`. Its `TRACK=1` option lists drawn geometries that are off-scene and not disposed, grouped by creation stack.

## Status / next
- [x] p15_fast (v89p, 15 min FAST Frankfurt):
  - glMB levels off at 167–179 MB and drops as cells free, ending at 172 MB (v89n: 283 MB).
  - Leak gate PASS: glMB 0.37 MB/min, heap 0.27 MB/min, far cells ≤ 68 MB.
  - The only FAIL is the existing 10 px CHECKPOINT label.
- [x] Night shots, same drive (`tools/eff/nightshot.js`): `qa_mem4/shots/v89p_night.png` vs `v89o_night.png` look the same.
  - The headlight mesh id is stable on v89p and changes every second on live v89o. 0 console errors on both.
- [ ] REVIEW (quick: no visual change; headlight shot at dusk + 0 console errors), then the OD_CHANGELOG entry and checklist item, push `out/v89p`, and send DEPLOY.
- Other FAILs in the baseline run were already there on v89n and are not this task: stuck 4.5 %, CHECKPOINT 10 px text.
