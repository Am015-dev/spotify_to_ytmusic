# PERF_BISECT (perf-1, 2026-10-16)
Tool: `tools/perfbisect.js` (serves out/<ver>/, `?test=fra|ath&draw=1`, patches `renderer`/`composer` handles at serve time). Run from out/: `FRAMES=40 node ../tools/perfbisect.js . v90m-beta.40,...`.
Test mode forces quality `low` (no shadows, 1500 m far plane), so this measures scene content only, NOT the high/med tier a phone uses.
ms = median rAF interval, 40 frames, swiftshader, 4 shards in parallel (noisy, ±30 %, compare relatively). calls/tris = one forced composer frame at the start spot.

| build | city | boot s | calls | tris M | geo | tex | prog | heap MB | med ms |
|---|---|---|---|---|---|---|---|---|---|
| 40 | fra | 77 | 501 | 2.39 | 541 | 85 | 92 | 368 | 3266 |
| 40 | ath | 85 | 413 | 1.61 | 489 | 97 | 94 | 527 | 4236 |
| 45 | fra | 87 | 467 | 2.47 | 520 | 91 | 108 | 497 | 2932 |
| 45 | ath | 80 | 345 | 1.57 | 468 | 102 | 113 | 561 | 3633 |
| 50 | fra | 99 | 328 | 2.04 | 520 | 90 | 112 | 497 | 2976 |
| 50 | ath | 95 | 409 | 1.71 | 470 | 102 | 116 | 561 | 3964 |
| 55 | fra | 77 | 358 | 1.95 | 569 | 92 | 114 | 527 | 2495 |
| 55 | ath | 73 | 415 | 1.64 | 476 | 102 | 116 | 561 | 3518 |
| 58 | fra | 102 | 366 | 2.11 | 536 | 91 | 114 | 527 | 2976 |
| 58 | ath | 93 | 356 | 1.54 | 494 | 104 | 116 | 561 | 4345 |
| 61 | fra | 82 | 340 | 1.76 | 532 | 91 | 113 | 527 | 2474 |
| 61 | ath | 66 | 355 | 1.47 | 402 | 81 | 134 | 561 | 3505 |
| 62 | fra | 113 | 363 | 1.92 | 557 | 91 | 114 | 497 | 2962 |
| 62 | ath | 95 | 354 | 1.46 | 485 | 103 | 116 | 561 | 4109 |

## Findings
- No >20 % jump in draw calls, triangles, geometries, textures or ms between beta.40 and beta.62 at either start spot. Calls and tris actually fell slightly after beta.45. So terr-4/5, CTB, art-6 and turbines did NOT regress the low-tier start-spot scene.
- Only real drifts: JS heap +43 % fra (368 -> 527 MB, beta.40 -> 45, mostly new content; flat since), shader programs 92 -> 114-134 (+24-45 %, beta.40 -> 45 and beta.61 ath 134, more materials = longer first-frame compile), boot time not trending (noise ±25 %).
- Hence the regression Alex sees is either older than beta.40, or only on the med/high tier (shadows, far plane, post passes, 3x DPR) or during driving (streaming/spawn), none of which this start-spot, low-tier probe covers.

## Next (cheapest, not done)
1. Rerun with `Q=med` (and `Q=high`) on 40/50/61: tier cost is the likeliest source. Expected: finds the pass/shadow change in one run.
2. Probe while driving 300 frames with `tools/prof.js` (PROF=1) on 40 vs 61: catches streaming and spawn cost.
3. Check beta.1-39 (same script) if 1-2 are flat.
No fix implemented: no measured regression to fix, so no TUNE flag added.
