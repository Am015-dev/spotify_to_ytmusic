# W275 valid performance table (base vs integrated)
Base = origin/alex/brave-carson-rbpmlk b18dd91 (newer than 519caf2f5), integrated = nr/W272-integrate e61f544. Each built with parts/build.py in its own worktree, served on 8801 / 8802.
Method: ONE browser at a time (driver `benchmark/w275/run.sh`, nothing else running), per cell 3 alternating rounds base,integ,base,integ,base,integ, 5 s warm-up discarded, 60 s measured.
Tool: `benchmark/fps-fixed.js` (new; playability-probe.js reacts to game state and uses Math.random, so it cannot give both builds the same load). Seeded input schedule (SEED=1, one decision per 120 ms, independent of the game) and Math.random replaced by the same seeded PRNG in both builds. Start by real click/tap from the title; street skips the story card.
Player kept alive (flight `__mnr.god`, street hp topped up every 0.5 s) so all 60 s are play; all 24 runs ended alive, 0 page errors.
Phone 390x763 DPR3 touch, 4x CPU throttle; PC 1440x860. Raw: `benchmark/w275/raw.jsonl`, tables: `benchmark/w275/tables.md` (`agg.py`).
Software GL, no GPU: numbers are comparative only (absolute fps is low: PC flight ~17, phone ~9). Frame times are quantised by the 60 Hz tick (p95 moves in 16.7 ms steps).

## Result (fps median of 1 s windows; r1/r2/r3 -> median [spread = (max-min)/median])
| cell | base fps | integrated fps | delta | base p95 ms | integ p95 ms | long tasks base / integ |
|---|---|---|---|---|---|---|
| flight phone | 8.18/9.23/9.23 -> 9.2 [11%] | 8.57/8.96/9.23 -> 9.0 [7%] | -2.9% | 166.8 [20%] | 166.8 [10%] | 538 / 541 |
| flight pc | 16.72/16.45/17.14 -> 16.7 [4%] | 17/16.72/18.69 -> 17.0 [12%] | +1.7% | 83.4 [20%] | 83.4 [20%] | 679 / 619 |
| street phone | 9.84/10.29/11.08 -> 10.3 [12%] | 10/11.25/11.25 -> 11.2 [11%] | +9.3% | 266.7 [13%] | 233.4 [14%] | 318 / 336 |
| street pc | 36.78/34.43/37.5 -> 36.8 [8%] | 35.41/35.08/36.19 -> 35.4 [3%] | -3.7% | 83.3 [20%] | 83.4 [20%] | 440 / 464 |
p99 and per-round values are in tables.md. Every integrated median lies inside the base's own round range, so no cell shows a slowdown outside the base spread.

## Cold start (5 cold contexts each, ms, median / max)
| dev | metric | base | integrated |
|---|---|---|---|
| phone | DOMContentLoaded | 4094 / 5854 | 5685 / 6633 |
| phone | navigation -> title interactive | 9265 / 9517 | 6774 / 7820 |
| phone | START press -> first playable frame (flight) | 2169 / 2459 | 2146 / 2303 |
| pc | DOMContentLoaded | 1104 / 1292 | 1006 / 1132 |
| pc | navigation -> title interactive | 2063 / 2139 | 1265 / 1539 |
| pc | START press -> first playable frame (flight) | 794 / 864 | 872 / 926 |
Only the flight START was timed (street start goes through the story card, which a person reads; not timed).

## Verdict
- Noise: base alone spreads 11% (flight phone) and 12% (street phone) between its 3 rounds, 8% street pc, 4% flight pc. That is above the 10% limit in two cells, so this measurement CANNOT resolve a 5% regression there. The brief asked for 5 rounds in that case; the 50 min limit did not allow it (3 rounds = 32 min of runs plus 7 min cold start). Not run: 5 rounds, bisect (nothing outside the spread to bisect).
- What can be said: integrated fps and p95 are inside the base's own spread in all four cells, no long-task or p95 shift beyond it, nothing died, 0 page errors. No evidence of a regression; no proof of equality within 5% for the two noisy cells.
- Start times: title interactive is faster on both profiles; START->first frame equal on phone, +78 ms (+10%, 794 vs 872, n=5) on PC; phone DOMContentLoaded is slower (5685 vs 4094, n=5, max ranges overlap 5854 vs 6633) while the title shows earlier. Mixed, small samples: not a clear regression, not proven "not worse".
- Next: rerun the two noisy cells with 5 rounds, and time the street start.
Not measured: real GPU, a real phone, street cold start. The seed fixes inputs and Math.random, but spawn timing still depends on the frame rate, so the load is similar, not identical.
