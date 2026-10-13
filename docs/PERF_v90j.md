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

## perf-2 (13 Oct): triangle counts, hook `window.__perf` = renderer.info per rAF (autoReset off), added after `new THREE.WebGLRenderer(` in a test copy
- Athens 852x393, 12 s after page load + GAS: v90j 191 calls / 1.154 M tris; v90j with `__ld.lds.off=1` 191 / 1.154 M; v90i 191 / 1.154 M (geometries 202 in all three).
- Caveat: `RO.on` was false and `LDS.on.length` was 0 in all runs, so the page was in the menu/attract scene, not hub free roam. Clicking `#careerBtn`/`#roamBtn` did not enter the hub.
- Attract/race scene: no difference between v90i and v90j, so the lag is not in that scene. The LDS props live only in the hub and are still unmeasured.
- No fix applied (the >20 % rule was not met). Next: enter the hub via `hubEnter()` (script scope; expose it in the hook), then rerun `docs/perf_v90j/tris.js <port> ath|fra 0|1`.

## perf-3 (13 Oct): free-roam driver `docs/perf_v90j/roam.js` (tPlay start: STORY → slot `.go` → wait `__mho.state==='roam'` → tap cards away)
- Hook in the test copies: `renderer.info.autoReset=false` plus a rAF reader → `window.__perf()` = {calls, triangles, geo} for the previous frame.
- Result: no numbers. One run (v90j Frankfurt) hit the 170 s cap before free roam started. Five parallel runs timed out on `page.goto` (30 s) because software GL plus one static server can't serve them.
- No fix applied: the LDS suspect is still unconfirmed.
- Next: run sequentially, one at a time, with `timeout 400` and `goto` timeout 120 s (≈4 min per run, 6 runs). Or run on a GPU box: `node roam.js <port> ath|fra 0|1 10`.

| city | v90j | v90j LDS off | v90i |
|---|---|---|---|
| Athens | n/a | n/a | n/a |
| Frankfurt | timeout | n/a | n/a |

- v90j-perf (out/v90j-perf, patched from af1d3db, blind fix): Athens CE props (pine, olive, cypress, rock) now swap to their old cheap geometry beyond LDS.near (they had no far geometry); LDS swap loop in hubCullStep runs every 10th frame; LDS lathe segments capped at 8 (already ≤8, so no change).
- A/B: `?props=0` hides all LDS/CE props. Headless check: menu reached, 0 page errors, both with and without `?props=0`. Frame rate not measured (software GL).
- Not covered: Frankfurt LDS swaps (cone, barrier, sign, rock in the kmProps wrapper) still have far = near; their material changed to vertex colours, so swapping back to the old geometry needs a material swap too.
