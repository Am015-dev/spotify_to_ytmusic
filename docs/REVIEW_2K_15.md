# Strict review #15: Mainhattan Overdrive trunk (od-int2 `121f0be`, live v90m-beta.122) vs LEGO 2K Drive

Reviewer session rev15, 2026-10-19. Branch alex/rev15 = alex/rev14 + origin/alex/od-int2. `bash tools/build.sh rev15` gave BUILD_OK, a 3.30 MB split page. I measured on the built page `out/rev15`. Timebox 45 min.

**Method.** Every probe ran **SOLO** (one browser at a time, foreground), each for the full 60 game seconds with a summary line. r14's numbers were inflated by 3–4 parallel probes, so compare these against r13's solo runs (Athens touch: 182 frames > 50 ms) as much as against r14.

## Measured (solo, 60 s each)
| run | boot | frames > 50 ms | max frame ms (owner) | other |
|---|---|---|---|---|
| tBoot Athens touch `lowmem=1` | 52 s | **26/3600** (first 30 s: 22, last 30 s: 4); JS-only 4 | **110** (f29, render 65 + roamStep 41) | med 9.3, p99 46.6, n33 117, 0–5 s med 15.4; owners: render 21, hubTrafficStep-self 2, lazyStep 1 (f31 94 ms: lazyStep 72 inside hubTrafficStep 85); heap 528 → 587 → 600 MB |
| tBoot Frankfurt touch `lowmem=1` | 30 s | **7/3600** (first 30 s: 7, last 30 s: 0) | **96** (f12, roamStep-self 91) | med 9.1, p99 31.4, n33 30, 0–5 s med 14.4; owners: render 5, roamStep-self 2; heap 298 → 472 → 480 MB (**5.79 MB/s** first 30 s) |
| tFrame Athens PC q=high (render stubbed) | **34 s** (r14: 108 s) | JS **19/3600**, n16 534 | **105** (f913: hubTrafficStep 80, hubCullStep 32, CTB_step 26, LV_step 17) | JS med 8.4, p95 22.9, p99 38; PF1GATE 63 frames; `PF1LINK afterReady 27` (r14: 41), gateEnd 180 |
| tFrame Athens PC: boot long tasks | – | – | `PF1BOOTLT` max **2.23 s** (`gate gfx_pre`), then 1.80 (`env end`), 1.56 (`gate env`), 1.54/1.44 (`ld 60/54`) | r14: 27.1 s |
| tFrame Frankfurt PC q=high | **27 s** | JS **7/3600**, n16 422 | **73** (f2344, roamStep 72) | JS med 8.9, p95 21.2, p99 33.7; PF1GATE 55; `PF1LINK afterReady 30` (19 plain, +ao 5, +gs 2, depth 3+), gateEnd 173; heap 602 → 747 MB |
| tFrame Frankfurt PC: boot long tasks | – | – | `PF1BOOTLT` max **2.05 s**, then 1.89 (`gate gfx_pre`), 1.77 (`env end`), 1.40 (`ld 6`) | – |
| PC roam real-render samples | – | – | 6.1–7.3 s long task per real-render sample, both cities (r14: 17–30 s) | SwiftShader 1280×720 high, every 60th frame; not phone-relevant |
| GO `perf/pc-roam-30s`, `perf/alloc-rate`, `TAG=life1,xf1,terrain` | – | – | not measured (timebox spent on the solo probes) | – |
| flag-OFF items htFar, roamBudget, callCap, htGc | – | – | not measured | – |

Shots: `docs/shots/rev15/{fra,ath}_roam.jpg` (852×393, touch `lowmem=1`, 8 s after drivable). I looked at both.

## Re-check of r14 findings
| r14 | item | verdict | measured |
|---|---|---|---|
| N1 | PC roam multi-second stalls, 1.7 s JS frame, 41 late links | ✅ **fixed** (links partly) | Max JS frame Athens **105 ms** (claimed 145; r14 1731), Frankfurt 73 ms. No JS frame > 500 ms. tFrame now drains the gate (gateEnd 180/173 > 0). Links after ready **27 / 30**, still above the ≤ 24 target → see N3. |
| N2 | hubTrafficStep-self top touch owner | ✅ **fixed** (solo) | Athens touch: **2** hubTrafficStep-self frames in 60 s (r14: 65–77 in 45 s under contention; r13 solo: 52). Frankfurt: **0** (r14: 56–59). It is still the biggest sub inside the worst PC frame (80 ms of f913). |
| N3 | PC boot long task 16–27 s | ✅ **fixed** (bhs ON) | Longest boot task **2.23 s** Athens, **2.05 s** Frankfurt (r14 27.1 s). Under the GO's 3 s bound, but above the 2 s target; the top task is `gate gfx_pre` in both cities. |
| N4 | touch f29 render spike 569–991 ms | ⚠️ **partly** | f29 is still the worst touch frame: **110 ms** Athens, 83 ms Frankfurt. Not hidden by a warm frame yet. |
| N5 | lazyStep / LV_step spikes on PC | ⚠️ **partly** | PC: no lazyStep frame in the top list; LV_step 17 ms in f913. Touch Athens f31: **lazyStep 72 ms** on the 2nd drivable frame. |
| N6 | shots: building behind ⏸/minimap, empty near road | ❌ **not fixed** | Frankfurt: same tall yellow building behind ⏸ and the minimap. Both cities: no traffic car in the first ~100 m ahead. |
| N7 | box limits (parallel runs) | ✅ addressed | All runs solo this round; every probe finished with its summary. |
| r13 N6 | Frankfurt heap growth | ⚠️ **partly** | touch: +174 MB in the first 30 s (5.79 MB/s), then +8 MB (0.27 MB/s). Steady state is fine; the boot ramp is not. |

## Findings (biggest first-minute lag first)
**N1. Touch Athens: the first second after drivable still has two long frames, and 22 of 26 long frames are in the first 30 s.** f29 = 110 ms (render 65 + roamStep 41: hubTrafficStep 38, hubCullStep 21, PC_step 21) and f31 = 94 ms (lazyStep 72 inside hubTrafficStep 85). 0–5 s median 15.4 ms vs 9.3 overall.
- Owner: `src/98bp_warmall.js` (touch warm before `__tq.drv`), `lazyStep` (`src/98l_lively.js` and the LAZY queue).
- Repro: `CITY=ath QS=lowmem=1 SECS=60 node tools/perf1/tBoot.js out rev15`, then read `PF1LONG f29` / `f31`.
- Fix: (a) render one hidden roam frame behind the curtain before `__tq.drv` (r14 N4); (b) give lazyStep a 0-budget for the first 60 frames after drivable (or a 4 ms budget for 5 s) so a LAZY build cannot land on frame 31. GO: first 120 drivable frames have no frame > 50 ms on touch Athens.

**N2. Touch Frankfurt heap ramps +174 MB in the first 30 s (298 → 472 MB, 5.79 MB/s); Athens starts at 528 MB.** On an iPhone with `lowmem=1` this is jetsam risk in the first minute, which is worse than any frame. The second half is flat (0.27 / 0.42 MB/s), so this is boot-time build, not a leak.
- Owner: unknown; first suspects are the LAZY district builds and LIFE/ped pools that the gate defers into the first 30 s.
- Repro: `CITY=fra QS=lowmem=1 SECS=30 HEAP=ret node tools/perf1/tBoot.js out rev15` (5 min was not left to run it).
- Fix: run that HEAP=ret probe, name the top 3 owners, and cap LOWMEM pools (ped/LIFE count, lazy radius) so the touch heap stays under ~450 MB at 30 s. GO: touch heap at 30 s < 450 MB in both cities.

**N3. PC still links 27–30 programs after ready (target ≤ 24).** The kinds are plain lit variants (19–21), `+ao` 5 (Frankfurt), `+gs` 2, `OutputShader` 1 and several `basic>depth` shadow-depth variants. With q=high each link costs 0.7–2.6 s on SwiftShader (fix-r14d), so these are the remaining PC hitches a real GPU will feel as 20–100 ms stutters in the first minute.
- Owner: `src/98bp_warmall.js` (LKG roam gate).
- Repro: `CITY=fra SECS=60 RACE=0 node tools/perf1/tFrame.js out rev15`, then read `PF1LINK.diff`.
- Fix: in the LKG gate, also render the shadow-depth pass for one instance of each warmed material (the `0:basic>depth 29:true>false 48:0>3201` keys) and warm the `+ao` variant set in Frankfurt. GO: `PF1LINK afterReady ≤ 24` in both cities.

**N4. Worst PC JS frame is hubTrafficStep 80 ms + hubCullStep 32 + CTB_step 26 together (Athens f913, 105 ms).** It is 15 s into roam, not boot; a single spike, but it is a 6-frame hitch on a 60 Hz monitor.
- Owner: `src/70_roam_world.js` (hubTrafficStep), CTB_step.
- Repro: as N3 with `CITY=ath`, read `"long"` for f913.
- Fix: stagger hubCullStep and CTB_step off the frame where hubTrafficStep runs its recycle wave (they coincide). The ground/tyre-seat cache `TUNE.htGc` (121f0be, OFF) targets the same function: A/B it SOLO with `QS=htgc=1` before flipping.

**N5. PC boot: `gate gfx_pre` is now the longest boot task (2.23 s Athens, 1.89 s Frankfurt), plus `env end` 1.8 s.** Under the 3 s GO bound, but 2K-style menus must never freeze for 2 s.
- Owner: `src/98bp_warmall.js` (gate gfx_pre), env build.
- Repro: `PF1BMK` line of the tFrame runs above.
- Fix: yield inside `gfx_pre` between material groups as bhs does for buildHubG; target < 1 s.

**N6. Shots vs 2K Drive.** Both skies are deep blue with brick clouds and the cities read as LEGO; Frankfurt has red/orange brick trees, a skyline and a park, and Athens has pink/yellow blocks, palms and a stall with minifigs. Nothing covers the controls. Un-2K-like:
- no traffic car in the first ~100 m ahead in **both** cities: the road looks empty, while 2K streets are busy from second one. Owner: `src/70_roam_world.js` traffic spawn. Fix: seed 2–3 cars in the player's road ahead at drivable.
- Frankfurt: the tall yellow building at the top-left still sits behind ⏸ and the minimap (from r14).
- Fun read from the state asserts: speed 0 km/h at 8 s (no input in the shot), story prompt and "HIT FAST = SMASH" hint are on screen, so the first goal is visible. Feel was not measured (no real-time play by rule).

**N7. Touch Athens boots 52 s vs Frankfurt 30 s** (SwiftShader, so inflated, but the 1.7× ratio is real). The governor also drops both cities to `q=min` (Athens at s52, Frankfurt at s17 and s46). The shots at min still look good, but check whether the governor should start at min on LOWMEM instead of stepping there mid-drive (a visible pop). Owner: GOV in the loader.

## Score: **7.3 / 10** (r14 6.4)
The first minute is now smooth when measured solo: touch has 26 (Athens) and 7 (Frankfurt) frames > 50 ms in 60 s with a 110 ms max, and PC has a 105/73 ms JS max with boot at 27–34 s and no boot task over 2.3 s. Still held back by an early touch-heap ramp, 27–30 late PC links, a hitch on frames 29/31, and empty roads ahead.
