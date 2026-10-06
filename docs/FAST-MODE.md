# Fast test mode + src/ split: report (infra worker, 2026-10-06)

## Part A: src/ modules (alex/od-src)
- 27 modules, ≤ 200 KB each (largest is 60_city_build.js at 200 KB). See src/MAP.md. Build = `cat` in src/ORDER.
- Proof: `tools/verify_live.sh` → `IDENTICAL index.html da3f600cc27410b4 · IDENTICAL km.js e0c31c231bd59aff · LIVE_MATCH ed2652d` (live v87a).
  (Also matched v87 0e043bc before v87a went live mid-task; the splitter re-ran on v87a unchanged.)
- `tools/patch_to_src.py` vs the old pipeline (P.py on the assembled page), byte-identical output:
  - pCAR24b (od-cars), reverse and forward → back to live: R → 93_cars_lego.js, 71_roam_drive.js
  - pART8 (od-art, pending WIP, 8 anchors) → 10_core.js, 60_city_build.js, 99_api.js
  - pART7 (edits outside R()) → re-split by module first lines → 97_art.js

## Part B: ?fast=1 (src/test/fast.js; ONLY in `tools/build.sh --local` dev pages, never in out/<ver>, deploy unchanged → no reviewer needed)
- Render-only: 426×196 buffer, camera far ≤ 450 m while drawing, no shadow-map updates, no bloom, particles hidden while drawing; with its own clock it draws every 6th frame.
- Frame clock: own back-to-back rAF (now += 1000/60), unless a test clock (__tick) exists.
- Deterministic game time: after the first frame performance.now/Date.now/setTimeout/setInterval follow the frame clock; Math.random is seeded and reset at enterRoam.
  Time-budget loops see frozen time within a frame and just finish their queue.
- tPlay `FAST=1`: ?fast=1, no CPU throttle (results are frame-based), touch events on a synthetic clock (CDP `timestamp`; e.timeStamp follows it),
  so the 440/450 ms finger gaps cost 0 s; auto-ticking stops on the exact frame roam is ready. `tools/tplay_fast.sh` = one process per city in parallel.

## Timings (standard run: tPlay MODE=phone, 1 game-minute per city, SHOTS=0)
| run | wall |
|---|---|
| baseline Frankfurt only (THROTTLE=4) | 354 s |
| baseline Frankfurt + Athens, serial | **16.5 min** |
| FAST=1 serial (before synthetic touch) | 5.3 min |
| FAST=1 serial (synthetic touch clock) | 4.2 min |
| `tools/tplay_fast.sh` (cities in parallel) | **3.1 min** (188 s); results within noise, not identical (see below) |
| FAST=1 Frankfurt only | ~2.2 min |
Floor: Athens world build = ~90 s of CPU with no throttle, the same with or without ?fast=1. 44 % of it is `athShelfY` (>16M distinct calls; a memo does not help).
Perf lead for the game itself (not touched here): the Athens load is CPU-bound in gndBuild → TR_Y → athShelfY.

## Same results?
- Non-fast tPlay is reproducible only at the same machine speed: baseline T4 run twice = identical, but THROTTLE=1 (no fast) already differs
  (Frankfurt 1→2 hits, 66.4→66.8 km/h), because wall-clock timers, time-sliced loading and menu-attract random draws shift the run.
- Fast mode, frame clock, Frankfurt at THROTTLE=1 vs THROTTLE=4 (4× speed difference): hits 0/0, stuck 12.8/12.8 %, 65.9/65.9 km/h, smash 2.6/2.6 per min, identical.
  Remaining diff before the auto-tick fix: start-up ambient traffic only (traffic120m 1.5/1.2).
- Contended check, final build (1 solo run, then 4 Frankfurt runs in parallel): hits 2/1/0/0/0, stuck 12.8 % in all 5, km/h 63.1/63.1/67.1/67.1/67.1,
  smash/min 0.9/6.1/9.6/9.6/9.6. Three of the parallel runs match exactly; the solo run differs. So fast mode is NOT fully deterministic under CPU contention yet:
  some wall-clock input remains (likely event delivery order vs frames in tPlay's touch path). Parallel results are within noise, not identical.
  Next step if needed: log per-frame RO.x/z in solo vs contended and find the first diverging frame.
- Fast vs baseline: within the baseline's own cross-speed spread for Frankfurt (0–3 hits, 61–67 km/h, stuck 12.1–12.8 %). Athens diverges more (a chaotic route: 2 wall hits at 25 km/h vs 0 walls at 57–64 km/h);
  pre-existing failures are unchanged in both (Frankfurt stuck 12 %, DRIFT hidden after rotation).
- Synthetic touch timing changes the tap gaps (game-time based instead of wall), so its numbers are a new deterministic baseline, not the old run replayed.
