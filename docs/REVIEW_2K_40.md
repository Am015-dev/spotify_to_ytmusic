# REVIEW_2K_40: tb1b (a341274), 2026-10-30

**Verdict: PASS. It is safe to ship with `?tb1` OFF (the default). With the flag OFF, boot behaves the same as before (the code paths are equivalent, and the numbers are within noise of the parent). `?tb1` stays default OFF: perf/tb-play is red (see §3).**

Note: the brief named cf75233 as the parent, but cf75233 is the docs-only *child* of a341274 (`log: beta.165 deployed`), and its build is byte-identical. The real parent is **9e7d5fc** (changelog beta.165), and that is what I compared. Live beta.165 (51e1925) does NOT contain tb1b (its `B2_pump` is the old one).

## 1. Diff read, flag OFF (`B2.tb` undefined)
- `B2_pump`: with `T=B2.tb` falsy, the empty check becomes `!B2.q.length&&!T`, which is the same as before. The slice budget `B` is unchanged. The `if(T)` block is skipped. `first=!!T&&…` is false, so the loop is `while(q.length&&(false||now-t<B))`, the same loop as before. The forced first step and the half-slice exist only when TB is active.
- `B2_start`: `!(B2.q.length||B2.tb)` with tb undefined is the same as before. `B2.on`, `B2.done` and `B2.t0` are set at the same points as before.
- `src/60_city_build4.js`: OFF calls `roadB = roadG; roadK`, which keeps the old order (asphalt `bt.add` first, then the kerb-run planner, at the same moment in the loop). The only change is that `TB.ph` goes 1→5→1→5 instead of 1→5. The planner adds nothing to a batch, so `ph` is not read during it. The kerb `push`es are identical.
- `src/98tb_tiles.js`: `TB_gen`, `TB_start` and `TB_arm` run only when `TB.on`. With the flag OFF, the only new things are the `window.TBq` alias and 5 new counters on `TB`. Both are harmless.

## 2. Flag OFF measurements, built pages (tools/build.sh), phone profile, 6x CPU
| check | a341274 | parent 9e7d5fc |
|---|---|---|
| page size | 3 448 758 B | 3 444 438 B |
| unit | 0 FAIL (4983 pass, 13 known) | 0 FAIL (same) |
| boottoctl PLAY→control | 93.5 / 76.7 / 74.8 s (median 76.7) | 72.5 / 75.1 / 74.0 s (median 74.0) |
| rAF gaps > 250 ms after the tap | 101 / 93 | 93 / 92 |
| gate default (why,life1,xf1,terrain, fra+ath) | PASS 78/78, errors 0 | PASS 78/78, errors 0 |
| perf/ios-reveal fra (3 s after reveal) | 0 links, 134=134 programs, median gap 254 ms, max 1455 ms, 1 stall → **FAIL** | 0 links, 134=134, median 262 ms, max 1371 ms, 1 stall → **FAIL** |

- The 93.5 s run is an outlier. A third pair, run back to back, gave 74.8 vs 74.0 s. The code is equivalent with the flag OFF (§1), so I read it as noise on the shared container.
- The long frames in reveal+3 s are the same on both builds (1 stall of about 1.4 s, more than 2.5x the median gap), so this is **not tb1b**. It is a trunk red on perf/ios-reveal (REVIEW_2K_38 passed it on e52b69e). Rule 15 says it must be fixed or deleted within 1 day, so I am flagging it to the coordinator.
- `TAG=life1,xf1,terrain` is contained in the default gate run above, and it passed on both builds.

## 3. Flag ON: perf/tb-play
- My run on a341274 `?tb1=1`: **queue not finished 150 s after the reveal window (go 1, pend 0) ❌** (fra boot 17.7 s). The worker measured control → TB.fin 137.9 s against a 15 s bar, with a longest step of 738 ms. Both runs agree: it is about 10x over the bar.
- Why it is so slow (input for the redesign): the queue is **frame-bound, not CPU-bound**. `B2_pump` gives TB a fixed slice per callback: 2 ms while the boot generators still have work, 4 ms after. It runs once per frame (rIC, or the 60 ms timeout), and each `TB_gen` unit yields after 2 ms (`tick`). So the throughput is the slice length × the frame rate. Today that is about 4 ms of queue work per frame, whether the frame takes 16 ms or 250 ms. At 6x the queue is 14.4 s of CPU (worker's TB_drain), which means at least 3600 pump callbacks. In a real throttled boot the frames are slow (median 254 ms in reveal+3 s), so those callbacks spread over minutes. Scheduling alone cannot reach 15 s. The single big steps (one `mergeGeometries` per tile flush, up to 738 ms) cause hitches but do not add throughput. A redesign needs one or more of these:
  - (a) a budget that is a share of the measured frame time (e.g. 25-30%) instead of a fixed 2-4 ms, accepting a lower fps while the queue runs;
  - (b) much less work before `fin`: move more into R0 or cut the deferred CPU (tb2/tb3);
  - (c) split the tile flush into per-key merges of at most about 20 ms, or precompute or merge off the main thread;
  - (d) a bar set from the CPU cost (e.g. TB_drain × 1.5) instead of a fixed 15 s.

## Gates not run
- Gauntlet: not run.
- Athens boottoctl: not run (tb1 is Frankfurt-only).
- tb-geo OFF/ON: not run. I rely on the worker's `790269a7/288` on both.
