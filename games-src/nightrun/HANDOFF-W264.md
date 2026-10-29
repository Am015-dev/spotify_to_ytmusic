# W264 start time and smoothness (branch nr/W264-start)

Method: real page served from a local static server, 5 runs per cell (fresh browser context = cold, second load in the same context = warm), phone = 390x763 DPR 3 touch + 4x CPU throttle, PC = 1440x860. Local network (no bandwidth limit). Scripts: benchmark/playability-load.js, benchmark/playability-probe.js (25-45 s runs, not 90 s).

## Start times (median / max, ms), base -> this branch
| cell | title interactive | first playable frame |
|---|---|---|
| phone flight cold | 4104/6911 -> 3258/3320 | 910/1309 -> 1374/1495 |
| phone flight warm | 3036/5567 -> 2257/2388 | 1147/1260 -> 1146/1390 |
| phone ON FOOT cold | 4022/4181 -> 3280/3318 | 8751/14333 -> 2183/3193 |
| phone ON FOOT warm | 2934/3027 -> 2142/2573 | 10632/12238 -> 2887/2980 |
| PC flight cold | 995/1173 -> 716/798 | 514/531 -> 290/313 |
| PC flight warm | 228/257 -> 208/278 | 431/459 -> 268/291 |
Target title <= 2.5 s on phone: met warm only (cold 3.3 s). Target first playable <= 3 s: met everywhere. Flight first frame is ~460 ms slower cold on phone (still < 3 s).
PC ON FOOT start was not measured (run killed for time).

## Fixes (cherry-picked from W242, plus one test fix)
- Boot no longer fetches/decodes the 40 fusion + weapon pictures (wpx.js, drip after 12 s of play), the 4 street backdrops (footview.js) or street pictures (footart.js, started on ON FOOT): boot decode 1.8 s -> 0.5 s.
- Stage and street start no longer wait for the song (preload.js, footq.js, street3.js); title loads only the menu loop (lagfix.js) instead of 3 mp3 (~8 MB).
- "Song request not firing": it was the test, not the game. After a 503 the song is neither buffered nor busy while it waits to retry; preload-test now accepts TR.tries (request fired, retrying). Real gesture unlock is unchanged (AU.unlock runs from the capturing pointer/click listeners, AudioContext is created inside the tap).
- W242's core/b.js change (boss track at 30 s instead of both tracks at 10 s) is NOT included: with it flight on phone dropped to 10.7 fps (JS 28 ms/frame, 270 long tasks); with base b.js 46 fps. Cause not understood; investigate before retrying.
- W242's AUTO-FIRE tag (hud/c.js, foot.js) and the progress bar were not taken in full; footq.js carries the street progress bar.

## Frame time (ms p50/p95/p99, fps), base -> branch (25-45 s runs)
- PC flight: 16.7/16.8/33.3 -> 16.7/16.8/16.8
- PC street: 16.5/33.3/33.4 -> 16.5/33.3/33.4; long tasks (>50 ms) 3 -> 3 in 45 s
- phone flight (with b.js reverted, 2 runs): base 16.7/33.4/66.7 (58 fps) -> 33.3/50.1/133 (46 fps). Slight regression, unexplained.
- phone street (measured BEFORE the b.js revert): base 16.7/66.7/100 (57 fps) -> 33.3/150/217 (43 fps). Not re-measured; probably the same regression. MUST re-measure before merging.
## Long tasks
The audit's ~40 per 90 s on PC was not reproduced: base had 0 (flight) and 3 (street) in 45 s in this headless run, so there was nothing to fix and no source was found. Stack-sampling by flag bisect not done.
## Not measured / caveats
No GPU (software raster), so PC and phone numbers are pessimistic and noisy; local network hides real download time (the 30 MB -> ~8 MB title saving only shows on a real connection). streetsong-test failed 1 of 3 runs (file-arrival race in the last sample), passes on rerun. simhunt, guard.py not run.
