# Strict review #7: Mainhattan Overdrive trunk `d3a30a5` (= v90m-beta.99) vs LEGO 2K Drive

Reviewer session rev7, 2026-10-18. Build: `tools/build.sh r7`: BUILD_OK, page 3.23 MB, split. Unit: `UNIT OK 5022 assertions · 5009 pass · 0 FAIL · 13 known`.
Same rubric and the same 12 categories as review #6 (`alex/rev6:docs/REVIEW_2K_6.md`), so the scores compare.
Scripts:
- perf-3 harness `CITY=… Q=high SECS=30 RACE=0 HEAP=1 node tools/perf1/tFrame.js out r7` (desktop 1280×720, stepped, `composer.render` stubbed), **one browser at a time with nothing else running**. Athens got 3 runs. Frankfurt got **2 runs**: run 3 was killed by the session's background time limit.
- After the perf runs: `tools/tRaces.js <url> 2 river,gp,westend,akro` in parallel with `tools/tRv2k2.js <url> <out> ath|fra`, the latter run one city after the other.
- SwiftShader, 4 CPUs. Only the stepped JS ms and the MB/s numbers are usable.

Shots I looked at (852×393): `ath_roam` (spawn), `ath_drive`, `fra_roam`, `fra_drive`, plus the 2K reference `docs/race_ref/05_pack_5th_boost.jpg`.
**No race shots this time.** `tRv2k2` crashed in both cities at the race step with `ReferenceError: tkRock is not defined`. That is a tooling regression from races-8: `tkRock` sits above `tkBot` in `98tk_go.js`, and the script slices only `tkBot..tkStaticFeel`. See TOP 8 #5.

**Overall: 5.1 / 10 against 2K Drive** (mean of the same 12 aspects; r6 4.8).

**What got better:**
- **The frame is clearly cheaper.**
  - Athens: stepped JS median 15.0 ms (r6 22.0), p95 39.2 (r6 52.0), frames over 50 ms 50–64 of 1800 (r6 97–98).
  - Frankfurt: 12.3 / 32.9 ms (r6 18.5 / 42.0).
  - Athens is back at the perf-3 record (14.9). Some of r6's +5 ms may have been run-to-run variance, but the compaction gate (perf-7: no `PC_step` at q=high) and the incremental grid both point the same way.
- **Races finish:** 7 of 8 (r6 7 of 12).
  - Akropolis 2/2 (r6 0/3).
  - Westend 2/2.
  - GP 2/2.
  - River 1/2.
  - Stuck counter 0 in every run.

**What did not:**
- **Spikes are still there.** Frankfurt now has the worst single frames measured so far: max 329 / 363 ms in `roamStep`. In Athens, `lazyStep` peaks at 180 ms. p99 is 79–92 ms in Athens.
- **Allocation is still ~185–190 MB/s.**
- **q=high now pays everything:** Athens draws ~990 calls and 3.2 M triangles per frame, with compaction off.

## Measurements (trunk d3a30a5; r6 = 056c93f)
| what | r7 | r6 |
|---|---|---|
| Boot to `__tq.ready` (tRv2k2, 1–2 browsers) | Ath 58 s · Fra 50 s | Ath 71 s |
| **perf-3 harness, 30 s roam, q=high: median of runs, median / p95 / max frame JS ms** | **Ath 15.0 / 39.2 / 254** (runs 15.0/39.2/221, 15.8/41.9/254, 14.8/38.3/279) · **Fra 12.3 / 32.9 / 346** (12.5/33.2/329, 12.1/32.5/363; 2 runs) | Ath 22.0 / 52.0 / 255 · Fra 18.5 / 42.0 / 274 |
| frames > 16 ms / > 50 ms (of 1800) | Ath 794–875 / 50–64 · Fra 407–449 / 22–25 | Ath 1386–1421 / 97–98 · Fra 1271–1379 / 46–60 |
| p99 | Ath 79–92 ms · Fra 53–57 ms | Ath 116–122 · Fra 63–75 |
| Biggest sub-timers (avg / max ms) | `hubTrafficStep` (wraps ped/cull/lazy/mini) Ath 8.6–9.6 / 114–195 · `lazyStep` Ath 2.7–3.3 / **107–182**, Fra 3.8 / 59 · `hubCullStep` Ath 1.4 · `roamCam` 1.0–1.5 / 33–76 | `hubCullStep` 3.1 (perf-7 A/B) |
| allocation (heap sampler, 30 s) | **Ath 5.50–5.86 GB ≈ 188 MB/s** · **Fra 5.49–5.67 GB ≈ 186 MB/s** | Ath ≈ 210 · Fra ≈ 204 MB/s |
| Top allocation sites (30 s) | Ath: `cityAt`←`GND_in`/`ART7_rd` 46–47 MB, `athRoadD`←`OC_roadE` 50 MB, `roamTerr`←`DEST_open` 45 MB, `RD_cityNear`←`RD_kerb` 40–44 MB, `LF_tileG` 40–46 MB, `WB_tpl`←`WB_cityBuild2` 39 MB · Fra: `CV_pre`←`hubTrafficStep` 46 MB, `getZ`←`computeVertexNormals` 48 MB, `FCG_build` 41–45 MB, `ART7_*` 38 MB, QA `invariants` 38 MB | – |
| Draw calls / tris at q=high (avg) | Ath ~990 (max 1114) / 3.2 M · Fra ~787 (max 824) / 3.9 M | – |
| Life at spawn / after 30 s (cars ≤ 120 m, moving) | Ath 20/20 → 20/17 (78 traffic) · Fra 16/11 → 30/29 (75) | Ath 18/18 → 21/16 |
| Road-follow 30 s from spawn | **Ath 123 km/h, 0 hits**, lowest HP 96 · **Fra 139 km/h, 0 hits**, HP 96 | Ath 124 km/h, 0 hits |
| **tRaces finish rate (bot, 2 runs each)** | **GP 2/2** (1st 96.7, 87.3 s) · **Westend 2/2** (1st 129.5, 122.6 s) · **Akropolis 2/2** (1st 106.7 s; 2nd 128 s, 0 lead changes, gap median 86 m) · **River 1/2** (1st 174.8 s; DNF) → **7 / 8** | GP 3/3 · River 2/3 · Westend 2/3 · Akro 0/3 → 7 / 12 |
| Akropolis / Westend / River bot race via tRv2k2 | **not measured**: tool crash `tkRock is not defined` | Akro 1st 1:36.5 |

**Caveat on perf.** r6 measured the same harness, also one browser at a time, so the −7 ms median is mostly real. It is too large to come only from the ~1.8 ms of compaction that perf-7 measured, so part of it is probably machine variance; this timebox had no trunk-vs-r6 A/B. The absolute numbers are the verdict: **Athens is at the 16.7 ms line on the median before rendering, but 1 frame in 30 still takes more than 50 ms, and Frankfurt now has 1/3-second hitches.**

**Caveat on races.** These are 2 runs per track instead of 3. tRaces ran next to tRv2k2 (2 browsers), the same load as in r6.

## Alex's open complaints
| complaint | verdict | evidence |
|---|---|---|
| "Lags a lot even on a powerful machine" | **BETTER, still the worst issue** | Ath 15.0 / 39.2 ms, 50–64 frames > 50 ms per 30 s (half of r6). Fra 12.3 / 32.9. But max 330–360 ms in Fra and `lazyStep` spikes to 180 ms in Ath. Allocation is still ~188 MB/s, so GC hitches remain. On an iPhone these JS numbers multiply. |
| "Athens is unplayable" | **better** | Clean, lively Syngrou (`ath_roam`, `ath_drive`), 123 km/h with 0 hits, 20 cars near. Akropolis Final now finishes 2/2. |
| Race DNFs | **mostly fixed** | 7/8. Akropolis 0/3 → 2/2 (the tkRock detector plus the race traffic clear). Only River DNF'd. |
| Debris over the race frame / race HUD | **unverified** | No race shot this time (tRv2k2 broken, #5). |

## Side by side vs 2K Drive (`docs/race_ref/05_pack_5th_boost.jpg` vs `ath_drive.jpg` / `fra_drive.jpg`)
**What 2K shows:** a huge place number top-left, the position list, the minimap bottom-left, the pack in the middle, and speed streaks that sell 100+ km/h.

**Ours, roam only:**
- **Athens (`ath_drive`, 86 km/h)** reads well: deep blue sky, brick clouds, pink and yellow blocks, mountains on the horizon, a glossy grey sedan beside the player, crowds on the kerbs. That is close to 2K's free-roam look.
- **Frankfurt (`fra_drive`, 161 km/h)** feels slow at 161 km/h: no speed streaks, no FOV punch, a flat grey crosswalk filling the lower half. 2K's sense of speed is far stronger.

**Defects:**
- At the Athens spawn (`ath_roam`, 0 km/h), **a pale cyan ellipse covers the bottom third under the car**. It looks like a ring/decal or a water plane at the camera.
- **The quest pill is truncated at 852 px:** "CH 1 · Koulouri Ru…", "Demolition Job → 28…". The distance, the one number the player needs, is cut off.
- **A near building wall fills the top-left corner** of `ath_drive`.
- `fra_drive` has a stray yellow fragment at the top-right edge.

Race-frame parity with 2K (place number, pack fight) could not be judged this round.

## Scores vs 2K Drive
| # | aspect | r7 | r6 | evidence (shot) | single highest-impact fix |
|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **5** | 5 | Boot 58 s Ath (r6 71). Clean spawn, but a cyan ellipse at the car and a truncated quest pill (`ath_roam`). | Fix the pill truncation and the spawn ellipse. |
| 2 | Free-roam driving feel | **6** | 5 | Ath 123 / Fra 139 km/h, 0 hits. JS median at about 15 / 12 ms. Still 50+ hitches > 50 ms per 30 s in Ath, and no speed effects at 161 km/h (`fra_drive`). | Spike hunt (lazyStep / roamStep). |
| 4 | Story / side quest | **4** | 4 | Chapter pill and "DRIFT HERE 0.0 / 4 s" readable (`ath_drive`); the pill truncates its distance. Not re-measured. | – |
| 5 | Races | **6** | 5 | 7/8 finish, Akropolis 2/2, stuck 0 everywhere; River 1/2. No race visuals this round. | River finish leg. |
| 6 | Builder | **4** | 4 | Not re-shot (carried). | – |
| 7 | Garage | **4** | 4 | Not re-shot (carried). | – |
| 8 | Vehicle transform | **6** | 6 | Not re-measured (carried). | – |
| 9 | Traffic / pedestrians | **6** | 6 | Ath 20 near / 78; Fra 16 → 30 near / 75; 0 hits in both road-follows; lively kerbs in both shots. | – |
| 10 | HUD / menus | **5** | 5 | Controls clear, gauge readable; the quest pill truncates at phone width; the race HUD is unverified. | Pill layout plus a race HUD state assert. |
| 11 | Performance / memory | **4** | 3 | Ath 15.0 / 39.2 / 254, Fra 12.3 / 32.9 / 346 ms, ~187 MB/s. Median big win; p99 79–92 Ath; max worse in Fra; 990 calls / 3.2 M tris at high. | Spikes, then allocation. |
| 13 | World art | **6** | 6 | Deep sky, brick clouds, mountains, colourful blocks (`ath_drive`). Minus the cyan ellipse, the near-wall clip, the stray fragment, and flat Fra ground. | Spawn ellipse / near-wall fade. |
| 14 | Portrait | **5** | 5 | Not re-measured (carried). | – |

Mean of the 12 scored aspects: (5+6+4+6+4+4+6+6+5+4+6+5)/12 = 61/12 = **5.08 → 5.1** (r6 4.8).

## TOP 8 fix list (ranked by impact on fun; perf and Athens first)
| rank | problem | repro (coords / state) | suspected file · function | size |
|---|---|---|---|---|
| 1 | **Athens hitches: 50–64 frames > 50 ms per 30 s, p99 79–92 ms; `lazyStep` max 107–182 ms** | `CITY=ath Q=high SECS=30 RACE=0 HEAP=1 node tools/perf1/tFrame.js out r7` from the Athens spawn; `WRAP=lazyStep,PC_add` with `PROF=1` to see which lazy group spikes | `src/60_city_build4.js` `lazyStep`: queued LAZY groups build in one frame. Split each group's build over frames with a ms budget (as `PC_grid` was made incremental in perf-7) | M |
| 2 | **Frankfurt 329–363 ms single frames in `roamStep`** (r6 max 274) | `CITY=fra … tFrame.js` (same env), `PROF=1` and look inside frames > 100 ms | under `roamStep`, not in the named sub-timers: candidates are `FCG_build`/`FC_pull` and `computeVertexNormals` (`getZ`, 48 MB in Fra), probably `LF_drapeG` | M |
| 3 | **~187 MB/s allocation** (GC → p99) | same runs with `HEAP=1 TOPN=30` | `cityAt`/`GND_in`/`ART7_rd`, `athRoadD`/`OC_roadE`, `roamTerr`←`DEST_open`, `RD_cityNear`/`RD_kerb`, `LF_tileG`, `CV_pre` in `hubTrafficStep`, QA `invariants` outside `?qa`; plus the `TR_Y`/`groundY` deopt from HANDOFF_perf | M |
| 4 | **River Run DNF 1 of 2** | `node tools/tRaces.js <url> 2 river` run 2: stuck at v 18 (g2) from 45 s, (957,-785) → (219,-333) at 120 s, then v 0 at (-327,524) at 180 s with h −4.18. That is the finish-leg corner of races-3 at (-315,446) | `src/98tk_city_duel.js` `tkGeoOf` finish leg, plus the River braking horizon in `tkBot` (`98tk_go.js`). The tkRock detector does not catch a car parked at v 0 without gas | M |
| 5 | **Review tooling broken: tRv2k2 cannot race** (`ReferenceError: tkRock is not defined`), so there is no Akropolis/Westend/River bot race, no race shots and no race-HUD check | `node tools/tRv2k2.js <url> out ath` (also `fra`) | `tools/tRv2k2.js` line 5: the `BOT` slice starts at `function tkBot` but `tkRock` (line 4 of `98tk_go.js`) is above it. Start the slice at `function tkRock` | S |
| 6 | **Quest pill truncated at 852 px** ("Koulouri Ru…", "Demolition Job → 28…"): the distance is cut off | `ath_roam.jpg` at spawn, 852×393 | quest pill text in `src/41_career_quests.js` and its CSS: drop the chapter name or move the distance to its own field, and never ellipsize "→ N m" | S |
| 7 | **Pale cyan ellipse over the bottom third at the Athens spawn** (0 km/h) | `tRv2k2 … ath` → `ath_roam.jpg`; it is gone once driving (`ath_drive.jpg`) | a near-camera spawn ring or a water/boost decal at the start position. Find it with a raycast from the camera at spawn; hide it when within N m of the camera | S |
| 8 | **q=high draws everything: Athens ~990 calls (max 1114) / 3.2 M tris; Fra 3.9 M** now that compaction is gated off at high | `tFrame` output `calls`/`trisM`; `node tools/perf4/tTris.js <url> out.json high fra,ath` | `src/98pc_compact.js` `PC_gate`: re-enable a cheap far-cull at med/high (cells only, no re-pack) and the perf-5 leftovers (car IM twin, LIFE `bm_s`) | L |

**Not ranked:**
- Frankfurt has no speed streaks or FOV kick at 160 km/h (2K sells speed far better).
- A near building wall clips into the top-left corner of `ath_drive`.
- A stray yellow fragment sits at the top-right edge of `fra_drive`.
- Akropolis hands-off `fin` + `dnf` flags (r6) were not re-checked.
- Frankfurt perf run 3, builder, garage and portrait were not measured in this timebox.
