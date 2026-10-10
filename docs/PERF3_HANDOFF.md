# PERF-3 handoff (memory: Athens heap, Frankfurt geometry growth) · branch alex/od-mem · 2026-10-10

The brief comes from the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut). Live v89k (alex/od-nits fe5567dd) is merged in, so this ships as **v89l**.
Probes are in `tools/eff/`: memprobe, geodiff (new), leakprof (now with an `--inclusive` view), menuheap (new), srcline.sh (new), bkcheck, evalprobe.
Results are in `qa_mem3/`.

## Changes (src/)
- **98wb_world_batch.js · WB far-LOD build.**
  - Items now go straight into compact growable per-cell arrays (`WB_cnew`/`WB_cput`): a Uint16 template index (Uint32 past 65535 templates), 12 matrix floats and 3 colour floats.
  - They no longer pass through `[tpl, Float32Array(16), r, g, b]` items at ~250 B each, ~395k of them in Athens.
  - `WB_cpack` only trims the arrays. `ck` is now Int32Array.
  - Result: the Athens heap stays flat during the 1–2 min background build (live climbs 153 → 233 MB).
- **WB_up (same module):** a streamed super cell's buffers are uploaded as soon as the cell is built, with the SM_upload trick (1×1 target, drawRange 0), so its CPU copy is freed at once.
  - Before this, cells behind the camera were never drawn, so their copies stayed: Frankfurt held 37 MB of them.
  - The Frankfurt "+12.6 MB/min geometry leak" was this: the WB build filling in while its CPU copies stayed (geodiff: 0 → 88 MB of wbLod while parked). It was not a STR or LAZY leak.
- **60_city_build.js · props (115.7k in Athens):**
  - All props of one type share one `p.col` Color. It is read-only: debris only reads it.
  - `i`, `im` and `col` are declared in the prop literal, so they stay in-object.
  - Athens roam-entry heap: ~165 → ~145 MB.
- **98bk_bake.js:**
  - The caches baked during loading (~16 MB in Athens) are cleared when loading ends (`BK.st.ldClr`).
  - New flag `?bk=0` turns the bake off for an A/B.
- **hubGrid "duplicate grid": not a duplicate.** There is a single `hubGrid()` call. The second stack (`TR_bldFix`, 10 MB) is the 7 `tr*` fields that TR_bldFix adds to each of the 66.6k colliders, as boxed doubles at ~150 B per building. They are read in 85/90/98l, so they are left as they are.
- **CPU copies:** after SM3 + WB_up, the CPU copies left in the scene are small: about 15 MB in Frankfurt, 8 MB in Athens.
  - Most of that is the instanced car templates (`w+g+sc`, `a8`), which the LOD builder (`WB_loOf`) reads. They are kept.

## Numbers
| | live v89k | v89l (this) |
|---|---|---|
| tPlay 5 min, Athens V8 heap (mean of the last 3 samples) | 154.1 MB | see `qa_mem3/tp_m4.txt` (m3, without the BK clear: 149.0) |
| tPlay Athens heap at the first sample | 149.6 | 191.3 (m3; the BK caches; cleared in m4) |
| tPlay Frankfurt geometry trend, 2nd half | +2.04 MB/min (old base: +12.6) | 0.00 MB/min · memory gate PASS in both cities |
| Athens V8 heap after a garage round trip (memprobe) | 253.7 MB | ~150 |
| Roam entry, Athens (bake on / off) | 87.8 s | 65.6 s / 86.7 s |
| Roam entry, Frankfurt (bake on / off) | 24.6 s | 19.3 s / 24.6 s |
| BK_CHECK Athens | | PASS (0 mismatches, 8 types × 4000) |

- The menu heap jumps by ~13.5 MB between runs of the SAME build (two levels), so single heap samples are noisy. Use the 5-min tPlay mean.

## Why the Athens heap is still above 100 MB (the next step)
- After the menu (~48–61 MB), roam entry adds ~90 MB. That is the city data model itself (leakprof inclusive, `qa_mem3/hold_ath_m3.txt`):
  - props: 115.7k objects at ~100 B, plus pgrid with 62k cells
  - building colliders: 66.6k at ~360 B, including the TR fields
  - hubGrid: 58k cells
  - Object3D overhead of 10.4k scene objects (5925 InstancedMesh) at ~1.3 KB each
- Reaching < 100 MB needs struct-of-arrays storage for props and colliders: Float32Array x/z/y/ry + Uint16 type, with an index instead of an object. All their readers (smash, traffic, CE, OC, TR, lively, 99_api) would have to change. That is a multi-module refactor, not a safe fix in this pass.
- Second option: merge the 5925 per-tile prop InstancedMeshes into fewer, bigger ones. That changes culling and draw calls.
