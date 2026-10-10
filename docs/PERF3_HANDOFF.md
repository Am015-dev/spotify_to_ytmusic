# PERF-3 handoff (memory: Athens heap, Frankfurt geometry growth, baked-grid A/B) · branch alex/od-mem · 2026-10-10

The brief comes from the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut).
- Live v89l (od-play d8e1307a, LIVE_MATCH c35fb140) is merged in. od-play has v89m in progress, so this ships as **v89n**.
- Probes are in `tools/eff/`:
  - memprobe, leakprof (+ inclusive view), evalprobe, bkcheck
  - new: geodiff, menuheap (`RELOAD=1`, `FLY=1`, `ATHD=`, `EV=`), sideshot, srcline.sh
- Results are in `qa_mem3/`.

## What ships (src/ vs live v89l: 4 files)
- **98wb_world_batch.js:** WB far-LOD items go straight into compact growable per-cell typed arrays (`WB_cnew`/`WB_cput`):
  - Uint16 template index (Uint32 past 65535), 12 matrix floats, 3 colour floats
  - They no longer pass through `[tpl, Float32Array(16), r, g, b]` at ~250 B each, ~395k of them in Athens.
  - `ck` is now Int32Array.
- **60_city_build.js:** the prop literal pre-declares `i`, `im` and `col`, so they stay in-object.
- **98bk_bake.js + ORDER:** the baked candidate grids (EFF #3, exact). `?bk=0` turns them off for A/B tests.

## Tried and dropped (with evidence)
- **Clearing the bake caches when loading ends, and one shared Color per prop type.**
  - After an Athens → Frankfurt flight, ~135 MB of the old page stayed alive in 5 of 8 runs.
  - Without these two changes: 0 of 7 bad runs, and live v89l: 0 of 2 (`qa_mem3/ab_fly.txt`).
  - The bisect pointed at the 1 s / load-end clear; the Color share was only worth ~3.6 MB.
- **WB_up (upload streamed super cells at once to free their CPU copy):** it only moved bytes from CPU to GPU.
  - Frankfurt, live: CPU 92 + GPU 135 = 227 MB. With WB_up: 47 + 181 = 227 MB.
  - It also added uploads of cells that are never seen, so it was reverted.
- **"hubGrid duplicate":** not a duplicate. There is a single `hubGrid()` call. The second stack (`TR_bldFix`, 10 MB) is the 7 `tr*` fields on each of 66.6k colliders (boxed doubles at ~150 B per building), read in 85/90/98l.
- **Frankfurt "+12.6 MB/min geometry leak":** not a leak.
  - geodiff while parked: 0 → 88 MB of `wbLod` super cells being built by the background WB build and STR.
  - It is bounded by the STR unload radius. The tPlay trend on live v89l is +0.63, on v89n 0.00 MB/min. PASS.
- **CPU copies:** after SM3 (62 MB Frankfurt / 144 MB Athens already freed), the rest is small: instanced car templates (`w+g+sc`, `a8`) that `WB_loOf` reads, and not-yet-drawn WB cells.

## Numbers
| | live | v89n |
|---|---|---|
| Athens heap, real time (memprobe: roam → drive140 → garage) | 153 → 253 → 258 MB (v89k) | 156 → 162 → 163 MB |
| Frankfurt heap, real time | 73 → 74 → 80 | 78 → 83 → 79 |
| tPlay 5 min fast: Athens heap mean (last 3) / peak | 158.1 / 158.4 (v89l) | 153.9 / 185.1 (the peak is bake caches at the start) |
| tPlay no-leak gate (2nd-half trend) | PASS / PASS | PASS / PASS (geometry 0.00 MB/min both) |
| tPlay FAIL lines (same run, side by side) | 3 (Athens heap, Athens walls 1.2, Frankfurt stuck 3.2) | 2 (Athens heap, Athens walls 1.79). Route varies run to run. |
| Roam entry, Athens: live / bake on / bake off (menuheap, alone) | 87.8 s | 65.6 s / 86.7 s |
| Roam entry, Frankfurt | 24.6 s | 19.3 s / 24.6 s |
| Athens roam-entry heap, bake on / off | 161 | 157 / 141 (the bake caches cost ~16 MB at entry) |
| BK_CHECK Athens | | PASS (8 types × 4000 points, 0 mismatches) |
| Tyre gap (sideshot / p1gap) | | 0.00 m |
| Console errors | 0 | 0 |

## Athens heap target (< 100 MB): NOT met (~154 MB steady)
- The menu costs 48–61 MB; roam adds ~90 MB. That is the city data model (`qa_mem3/hold_ath_m3.txt`, inclusive):
  - props: 115.7k objects at ~100 B, plus a pgrid of 62k cells
  - building colliders: 66.6k at ~360 B, including the TR fields
  - hubGrid: 58k cells
  - 10.4k scene Object3Ds (5925 InstancedMesh) at ~1.3 KB each
- What this pass did remove is the build peak: about −90 MB in real time.
- To get under 100 MB: struct-of-arrays props and colliders (typed x/z/y/ry + type index). That touches smash, traffic, CE, OC, TR, lively and 99_api, so it is a multi-module refactor for its own worker. Merging the per-tile prop InstancedMeshes is a second option.
- Bake caches: a lower `BK_MAX` (8000 now) would cut the 16 MB at entry, at some cost to entry speed. Untested.
