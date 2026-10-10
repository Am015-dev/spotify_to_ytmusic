# PERF-2 handoff (EFF #3 baked grids + EFF #4 memory) · branch alex/od-mem · 2026-10-10

The brief comes from the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut). Live is now **v89k**, so this ships as **v89l**: merge `origin/alex/od-nits` (fe5567dd or newer) before the DEPLOY.
Draft PR #85 (alex/od-mem → alex/od-src) is open and watched; it has no CI.

## Done (committed)
- **tPlay memory gate** (`tools/tPlay.js`): samples every 600 frames (10 game-seconds).
  - `heap` = V8 JS heap after GC, read with CDP JSHeapUsedSize.
  - `totMB` = `performance.memory`, which includes typed-array backing stores.
  - Also renderer.info, `geoMB` (deduped per ArrayBuffer) and `cpuGeoMB`.
  - FAIL if, over the second half of the drive, heap or geoMB grows > 4 MB/min, totMB grows > 6 MB/min, or geoms grow > 40/min.
  - FAIL if the Athens heap (mean of the last 3 samples) is > 100 MB.
  - Run: `MIN=5 SHOTS=0 MODE=phone tools/tplay_fast.sh <url> <out>`.
- **EFF #3: `src/98bk_bake.js`** (in ORDER before `99_api.js`).
  - For each query cell it bakes a candidate list once, lazily. Whole-map lists (trailDist, rivClear, mtnDist) use two levels: 512 m, then 64 m.
  - Neighbourhood lookups (cityAt, abAt, fillAt) prune with "second-best upper bound from another street", so `skip` stays exact.
  - Caches are capped (BK_MAX = 8000 per cache) and cleared after 5 s with no queries in roam.
  - **Exact:** `tools/eff/bkcheck.js` → `BK_CHECK PASS` in Frankfurt, 8 query types × 4000 points, 0 mismatches. Run it for Athens too: `CITY=ath node tools/eff/bkcheck.js <url>`.
  - Frankfurt roam-entry CPU in these functions: about 14.3 s → 6.6 s. That profile ran under contention; redo the A/B with `tools/eff/p2prof.js` (CITY=fra|ath) with no other job running.
  - Athens baseline profile (`qa_mem/prof_ath_base.txt`): cityAt 23 s, trailDist 12 s, ART7_rd 15 s (calls cityAt, fillAt and abAt), athShelfY 24 s. athShelfY already has a cell cache (SM_SC) and is left alone.
- **Probes** (all without `?fast=1`: memprobe and heapsnap hung idle in fast mode):
  - `tools/eff/memprobe.js`: heap, total, GL buffer bytes (bufferData hook) and scene owners.
  - `tools/eff/leakprof.js`: CDP sampling heap profiler. `FROM=enter` gives live allocation sites from roam entry.
  - `tools/eff/evalprobe.js`: evaluates an expression in module scope through `__oc.ev`.
  - `tools/eff/p2prof.js` (CPU profile of roam entry) and `tools/eff/bkcheck.js`.
  - Do NOT use `heapsnap.js` on Athens: it OOM'd the container (15 GB).

## Baseline numbers (live v89i, DPR 0.35, 40 s drive then garage; qa_mem/mp_*_base.txt)
| | V8 heap: roam → drive40 → garage | GL buffers | total incl. ArrayBuffers |
|---|---|---|---|
| Frankfurt | 86 → 84 → 77 MB | 112 MB | 275–400 MB |
| Athens | 153 → 207 → 233 MB | 190 MB | 361–450 MB |

- **The Athens "growth" is not a leak.** `WB_cityBuild2` (background far-LOD build) finishes 1–2 min after roam starts. While it runs it holds 212k–397k items as `[tpl, Float32Array(16), r, g, b]` at about 250 B each, which is the transient peak.
- **Steady state after the WB build** (Athens, 150 s; `evalprobe` + scratch `wb.js`):
  - cells 1088 · items 397k
  - M 18.2 MB, C 4.5, T refs 3.2, templates 15.4 (2991 templates), ck 3.0
  - instanceMatrix of the source InstancedMeshes: 24 MB
  - built super cells: 47 MB GPU
- **tPlay baseline** (5 min/city, `qa_mem/base.txt`). Failures that are already on live, not ours:
  - stuck: Frankfurt 17.3 %, Athens 13.8 %
  - Athens wall hits 1.75/min
  - Athens tutorial text at 9–10 px
  - DRIFT button hidden after rotation
  - Frankfurt geoMB trend +12.6 MB/min: a real leak flag
- **Live holders from roam entry** (Athens, `qa_mem/hold_ath_base.txt`, 110 MB sampled):
  - Object3D 13.6 (InstancedMesh/Mesh objects from buildHubProps)
  - **hubGrid 10.1 + 5.5**: hubGrid runs at least twice (`TR_bldFix → hubGrid` and the first `hubGrid@4013`) and BOTH grids stay alive, so something keeps the old Map
  - buildHubProps/CE_lots 15
  - athBuildG/CV_put 10.7
  - QS_rampFit 3.2 · OG_build 2.2 · LV_eGrid 1.7 · WB_cpack 1.65

## Next steps (in order)
1. **hubGrid duplicate:** find who keeps the first grid alive (grep `HUB.grid` captures, e.g. a `const G=HUB.grid` in a closure) and free it. That's about 5–10 MB.
2. **WB transient peak:** write items straight into the compact form (growable M/C/T per cell) instead of `[tpl, Float32Array(16), …]` then WB_cpack. That cuts about 40–50 MB of peak heap during the build.
   - Also: T refs → Uint16 template index, ck Float64 → Int32 (keys < 2^24, plus −1). That saves about 3 MB.
3. **Frankfurt geo growth (+12.6 MB/min in tPlay):** check STR frees (`__str.sup()`) and LAZY regions dispose. Likely LAZY rebuilds that are never freed, or WB_split pieces.
4. **CPU copies:** SM_upload drops them only for unique non-instanced meshes in HUB.grp, once. Lazy regions loaded later, and the `trG+bwT` / `dr` / `trPl` groups (bricks2x and drive), keep theirs. Measure with memprobe `top` owners.
5. Then get before/after numbers from the same probes, identical 852×393 shots (Frankfurt drive, Athens drive, garage, race), and tPlay once on the split build.
6. REVIEW goes to session_01Y6FYerWwxv43FuKUcaUT4v. After a PASS:
   - merge od-nits, rebuild on CURRENT live
   - add the OD_CHANGELOG entry for v89l
   - `git add -f out/v89l`
   - send DEPLOY to the coordinator
