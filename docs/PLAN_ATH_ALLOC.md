# Plan: Athens allocation churn after lane 2 (ath-alloc-r22p2, 2026-10-21)
Two lanes are spent on this target (rule 9). Measured with `HEAP=40 HEAPDUMP=f.json node tools/athdrive.js out <ver> ath` (CDP sampling, 1800 ticks = 30 s, PC-like, gas held). Start 1589 MB, lane 1 1421, lane 2 **1297 MB = 43 MB/s**. Target 25 MB/s = 750 MB: **not reached**, ~550 MB more to remove.

## What lane 2 found (the mechanism, reusable)
- In Chromium 141, reading number fields off some long-lived objects allocates a heap number per read, even in TurboFan code. `RO.ramps` (29 ramps) cost ~210 B per roamTerr call; `Object.assign({}, r)` copies of the SAME objects read at 0 B; rewriting the fields in place does not help (shape state of the old objects, not the math). Disabling Maglev changes nothing (1411 MB). So: hot loops over boot-time objects -> read through a typed-array mirror (re-checked by identity), not the objects.
- `let r=null` then `r=Math.max(r,y)` (null|double phi) boxes per hit (GND_fars 70 -> 11 B/call after the sentinel fix).
- Tools: `HEAPDUMP=` (raw profile), `JSFLAGS=` (e.g. `--allow-natives-syntax`), `AFTER=` (eval after the drive; module scope via `__tk.q(...)`), `SERVE=<dir>` (boot once, run each `<dir>/NN.js` probe, `//HEAP 512` first line = sampled KB by function into `NN.out`; `//QUIT` ends). A probe of 100k calls answers a variant in ~10 s instead of a 3 min boot.

## Top owners now (MB / 30 s, self; callers by chain) and the change each needs
| Owner | MB | Change (behaviour identical) | Lane |
|---|---|---|---|
| iterator `next` (for..of left in LIFE_draw/LIFE_fill, LF_tileG generator, DEST_open `for(const p of PL)`, LIFE cell `for..of` over Maps) | 109 | indexed loops; LF_tileG generator -> resumable index state | Sonnet |
| roamHit (HUB.grid collider reads, ~80 calls/frame) | 64 | per-cell Float64Array mirror like DEST_hb (x,z,hw,hd,c,s,h,y0,rh), keyed by cell array + length, rebuilt on smash/remove (`HUB.bldV` counter bumped where colliders change) | Sonnet |
| LIFE_draw / LIFE_fill / LIFE_at / LIFE_cell (lx chunk) | 54+17+17 | indexed loops over LIFE.L/D; mirror item x/z/h into typed arrays per cell; LIFE_at's `cityAt` -> scratch out | Sonnet |
| cityAt (result object per call: LIFE_free, LF_free, LF_offRoad, L3_kerbFix, LF_open; plus CITY_S pts reads) | 48 | pass a per-site scratch `out` (LF_onRoad/ART7_rd already do); then a pts mirror (x,z,tx,tz per CITY_G cell) | Sonnet |
| RD_cityNear (pts reads, `**`) | 46 | read the same pts mirror as cityAt | with cityAt |
| CV_pre 41, RD_unstack 25, L3_space/near/stop 23+16+14, HT_car/HT_lat/HT_speed 21+14+12, FX19_seat 18, pedStep 26 | ~210 | per-function SERVE probes first (100k calls), then mirror/scratch per finding | Sonnet x2 |
| Math.hypot 39, Math.max 17 (arg boxing from Maglev/generic callers) | 56 | hypot -> sqrt in pedStep, DEST_dij, HT_hit, DEST_open | Haiku |
| DEST_open/DEST_find (budgeted background scan, wall-clock budget) | ~140 incl. | not churn per frame: ends at 9 found; cap the Athens scan to the 1.5 km around the player | Sonnet |

Order: roamHit + cityAt/RD_cityNear mirror (~160 MB), then for..of/iterators (~110), then LIFE (~90), then the per-function probes. Each lane: SERVE probe before/after, `perf/ath-alloc` GO extended with a mirror == objects check like the ramp one.
