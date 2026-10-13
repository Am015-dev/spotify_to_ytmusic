# Mainhattan Overdrive: v90i (27ec0df) vs v90j-beta (af1d3db) performance check

Status: INCOMPLETE (10-minute slice). Raw data and script: `docs/perf_v90j/`.

## Measured (headless Chromium, software GL, 852x393 phone, GAS held 25 s, median of s5-25)
| city | version | ms/frame | heap MB |
|---|---|---|---|
| Frankfurt | v90i | 1317 | 115.7 |
| Frankfurt | v90j-beta | 1350 | 116.3 |
| Athens | v90i | 1233 | 156.9 |
| Athens | v90j-beta | 1183 | 157.3 |

- About 1 fps in both versions: software GL is the limit, so these frame times can't show the slowdown. Heap is the same in both.
- Draw calls, triangles and object counts: not captured. `renderer` and `scene` can't be reached from page scope (`CID` reads undefined), so a test hook is needed.
- The 1280x720 runs crashed (browser closed before the 100 s timeout).

## Suspects from the diff (index.html +318 lines; models.js +326; 60+ model chunks)
1. **`hubCullStep` wrapper (LDS)**: v90j adds LEGO props to Frankfurt (cones, barriers, warning light, STOP sign, rocks) and Athens (pines, olives,
   cypresses, rocks via `CE_defs`). For the Athens CE types, `far` = `near` (`LDS_tri(g)`), so there is no low-detail swap. The new lathe trees
   (`LDS_lth` + `toNonIndexed`) may have many more triangles than the old 108-tri trees. This scales with instance count and fits "lags everywhere".
2. Home parked cars (`HM_parkList`/`HM_build`): unverified whether they are instanced or merged.
3. The GB build-up now runs on the wall clock (garage only, so unlikely to cause the drive lag).

## Next step
Expose `window.__perf=()=>({i:renderer.info, n:...})` (one line) and re-run `perf.js` on a GPU machine, or compare `LDS.st` near/far tri counts
(`__ld.lds.st`) in both versions. Quick A/B in v90j: `__ld.lds.off=1` (skips the per-frame LDS swap) or the `LDS_ab(1)` hook (old props).
