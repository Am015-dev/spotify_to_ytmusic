# PERF_BISECT2 (perf-2, 2026-10-16): default tiers while driving
Tool: `tools/perfdrive.js <outdir> <vers>` (env CITY, TIERS=med,high, TICKS=1800, SAMPLE=120). Boots `?test=fra&q=<tier>`, holds ArrowUp, drives 1800 fake-time ticks (30 s at 60 Hz, rAF stubbed, composer stubbed) -> per-tick JS cost (median / p95 / max / count >50 ms = hitches); every 120 ticks one real composer frame -> calls, tris, shadow-map renders, programs, geo, tex, heap.
Phone default tier = `med` (`lowGfx = (pointer:coarse)` -> q med, dynamic res on); PC default = `high` (src/10_core4.js:190). Test mode forces `low` otherwise (src/98tq_test_quick.js).
JS ms are CPU only (swiftshader GPU cost not measured), 4 shards in parallel = noisy (+-30 %).

| build | tier | calls | tris M | shadow renders/frame | prog | heap MB | JS med | JS p95 | JS max | frames >50 ms /1800 | driven m |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 40 | high | 869 | 4.06 | 18 | 153 | 415 | 9.3 | 46.9 | 678 | 85 | 120 |
| 61 | high | 749 | 4.14 | 18 | 190 | 561 | 9.1 | 37.0 | 491 | 77 | 295 |
| 61 | med | 672 | 4.38 | 18 | 169 | 595 | 10.8 | 38.9 | 829 | 63 | 317 |
| 63 | med | 722 | 4.34 | 18 | 166 | 561 | 11.7 | 95.1 | 1794 | 168 | 718 |
(62 med smoke run, 240 ticks: 778 calls, 4.64 M tris, 164 prog, 561 MB.)

NOT obtained: 20, 30, 50, 55 and a 40 med baseline. The four shards wrote to one log file (my filename bug) and overwrote each other; two shards were still running when I stopped. Rerun `TIERS=med,high CITY=fra node ../tools/perfdrive.js . v90m-beta.40` etc. with one log per shard.

## Findings
- Tier, not build, is the big cost: med/high draw 670-870 calls and 4.1-4.6 M tris vs 340-500 calls and 1.5-2.5 M tris at low (PERF_BISECT.md). So a phone on med renders ~2x calls and ~2x tris of what perf-1 measured.
- 40 -> 61 high: calls -14 %, tris +2 %, JS median flat. No >20 % jump in the render load.
- Jumps >20 %: JS heap +35 % (415 -> 561 MB) and shader programs +24 % (153 -> 190), both from beta.40 -> 61 (perf-1 saw the same by beta.45). On a phone the heap is the likely real culprit (GC pauses, memory pressure, longer first-frame compiles).
- Streaming hitches while driving: 63-168 frames >50 ms per 1800 and max 0.5-1.8 s. Beta.63 is worst (p95 95 ms, max 1.8 s, 168 hitches) but it drove 718 m vs 120-317 m for the others, so it is not comparable; the hitch count scales with distance driven. Needs a same-distance rerun (scripted steering along the road) before blaming 63.
- Shadow renders are 18/frame at med AND high (count of shadowMap.render calls, includes point/spot lights). Med should likely have fewer; worth checking that med does not render the same shadow set as high.

## Proposed cheapest fixes (none implemented: no clear single cause, and the pass would not fit the timebox)
1. Cap phone pixel ratio (dres already on; cap DPR at 2 on coarse pointers).
2. med: cut shadow map to the sun only (check why 18 renders at med), shorter far plane (2600 -> 2000).
3. Heap/programs: dispose/cull unused models and materials after load; share materials across the new beta.41-61 content.
4. Hitches: spread chunk streaming over several frames (budget ms per frame).
