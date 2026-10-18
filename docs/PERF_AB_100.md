# PERF A/B: beta.98 (96911c5b) vs alex/od-int2 HEAD (d3a30a5)

Measurement only, no game code changed. Both pages built with `tools/build.sh` in separate worktrees.

- **A** = commit `96911c5b` (beta.98), build `out/abA`
- **B** = `origin/alex/od-int2` HEAD `d3a30a5` (changelog v90m-beta.99), build `out/abB`

## Method

- `tools/perf1/tFrame.js out <ver>` with `HEAP=1 RACE=0`, `Q` = high|low, `CITY` = ath|fra, desktop 1280×720, headless Chromium (SwiftShader).
- **SECS=10** (fake seconds of free roam, 600 frames per run). The 30 s setting in `HANDOFF_perf.md` costs about 3 min per run in this sandbox, which did not fit the timebox for 24 runs.
- ONE build at a time, nothing else running. Runs were sequential, each a separate process.
- ms = per-frame main-thread JS time with `composer.render` excluded (harness definition). MB/s = `PF1HEAP total` MB / 10 s (same convention as earlier MB/s figures).
- Each cell is the **median of 3 runs**, per metric.

## Result (median of 3 runs)

| City / quality | A median ms | A p95 ms | A max ms | A MB/s | B median ms | B p95 ms | B max ms | B MB/s |
|---|---|---|---|---|---|---|---|---|
| Athens / high | 22.4 | 58.2 | 214 | 359 | 20.0 | 58.3 | 205 | 344 |
| Athens / low | 19.2 | 42.5 | 170 | 312 | 19.5 | 48.0 | 219 | 303 |
| Frankfurt / high | 16.9 | 41.2 | 198 | 280 | 14.5 | 36.8 | 282 | 247 |
| Frankfurt / low | 15.6 | 34.1 | 123 | 262 | 14.7 | 34.4 | 150 | 238 |

## Raw runs (median ms / p95 ms / max ms / MB/s)

| Cell | Build | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| Athens / high | A | 21.3 / 55.2 / 214 / 358 | 23.0 / 58.9 / 269 / 359 | 22.4 / 58.2 / 136 / 360 |
| Athens / high | B | 19.0 / 53.7 / 195 / 344 | 20.0 / 58.3 / 211 / 336 | 20.3 / 66.0 / 205 / 353 |
| Athens / low | A | 19.6 / 42.5 / 92 / 312 | 19.1 / 41.4 / 196 / 305 | 19.2 / 45.3 / 170 / 315 |
| Athens / low | B | 18.8 / 46.6 / 288 / 301 | 19.8 / 51.0 / 219 / 305 | 19.5 / 48.0 / 98 / 303 |
| Frankfurt / high | A | 17.7 / 40.8 / 191 / 280 | 16.6 / 41.2 / 198 / 280 | 16.9 / 43.3 / 200 / 283 |
| Frankfurt / high | B | 14.2 / 40.8 / 289 / 251 | 14.5 / 36.8 / 277 / 245 | 14.8 / 36.0 / 282 / 247 |
| Frankfurt / low | A | 15.6 / 34.1 / 115 / 267 | 16.1 / 35.7 / 123 / 262 | 15.4 / 33.7 / 127 / 259 |
| Frankfurt / low | B | 14.6 / 34.4 / 268 / 238 | 14.7 / 34.5 / 150 / 254 | 14.8 / 34.4 / 118 / 233 |

## Reading

- **Median:** B is faster on Frankfurt (−2.4 ms high, −0.9 ms low) and Athens high (−2.4 ms). Athens low is flat.
- **p95:** B is worse on Athens low (+5.5 ms). Other cells are within about 1 ms of A.
- **Max:** single-frame spikes are noisy (A 92–269, B 98–289). Frankfurt high is consistently higher in B (277–289 vs 191–200 in A). Treat this as a signal to check, not a verdict.
- **MB/s:** B allocates less in all four cells (−3% to −12%).
- Three runs per cell and SECS=10 are not enough to call p95 or max differences real. Median and MB/s are the stronger signals here.
