# Strict review #6: Mainhattan Overdrive trunk `056c93f` (= v90m-beta.96) vs LEGO 2K Drive

Reviewer session rev6, 2026-10-18. Build: `tools/build.sh r6` → BUILD_OK, page 3.23 MB, split. Unit: `UNIT OK 4995 pass · 0 FAIL · 13 known`.
Same rubric and categories as review #5 (`alex/rev5:docs/REVIEW_2K_5.md`), so the scores compare.
Scripts: perf-3 harness `CITY=… Q=high SECS=30 RACE=0 HEAP=1 node tools/perf1/tFrame.js out r6` (desktop 1280×720, stepped, composer.render stubbed; 3 runs per city, **one browser at a time**), then `tools/tRv2k2.js <url> <out> ath` (Akropolis + shots) in parallel with `tools/tRaces.js <url> 3 river,gp,westend,akro`. The `tRv2k2 … fra` run did not start (my script bug), so Frankfurt has perf numbers only, no shots.
Software GL (SwiftShader), 4 CPUs. Stepped JS ms and MB/s are the usable numbers; real-time frame times are not. Console errors: 0 (`R errors []`).
Shots looked at (852×393): `ath_roam` (spawn), `ath_drive`, `akropolis_bot_0` (racing), `akropolis_bot_1/2` (result panel), and the 2K reference `docs/race_ref/05_pack_5th_boost.jpg`.

**Overall: 4.8 / 10 against 2K Drive** (mean of the same 12 aspects; r5 4.7).
What got better: **the Athens spawn walls are gone** (first view is a clean, lively Syngrou under a deep blue sky with brick clouds), GP now finishes 3 of 3 (r4/r5: DNF), the car stops under the result panel and the gauge is hidden there, the Akropolis bot race is tighter (1st 1:36.5, gap median 102 m, r5 132 m).
What did not: **the frame is still too expensive, and on this harness it measured worse than the perf-3 landing numbers**: Athens stepped JS median 22.0 ms / p95 52 ms / 98 of 1800 frames over 50 ms, ~210 MB/s allocated; Frankfurt 18.5 / 42 ms, ~204 MB/s. Both cities are ~+5 ms on the median versus perf-3's record (Ath 14.9, Fra 13.3). And the **Akropolis Final DNF'd 3 of 3 in tRaces** (stall at (-2140,500)); overall race finish rate 7 of 12.

## Measurements (trunk 056c93f; r5 = e59bc7d)
| what | r6 | r5 / earlier |
|---|---|---|
| Boot to `__tq.ready` | Ath 71 s (2 browsers) | Fra 62 s · Ath 81 s (3 browsers) |
| **perf-3 harness, 30 s roam, 3 runs, median of runs: median / p95 / max frame JS ms** | **Ath 22.0 / 52.0 / 255** (runs 22.0/51.5/255, 21.8/52.6/347, 22.1/52.0/253) · **Fra 18.5 / 42.0 / 274** (18.5/42.9/274, 19.1/42.0/288, 18.1/39.5/249) | perf-3 record (HANDOFF_perf): Ath trunk 20.8/45.8/308 → perf3 14.9/39.4/261 · Fra 13.2/33.6/287 → 13.3/33.5/306 |
| frames > 16 ms / > 50 ms (of 1800) | Ath 1386–1421 / 97–98 · Fra 1271–1379 / 46–60 | – |
| p99 | Ath 116–122 ms · Fra 63–75 ms | – |
| allocation (heap sampler, 30 s) | **Ath 6.28–6.46 GB ≈ 210 MB/s** · **Fra 6.09–6.13 GB ≈ 204 MB/s** | perf-3: Ath 183, Fra 178 MB/s; pre-perf-3 353 / 204 |
| Athens life at spawn / after 30 s (cars ≤ 120 m, moving) | 18/18 → 21/16 (78 traffic) | 12/12 |
| Road-follow 30 s from the Athens spawn | **124 km/h**, 0 hits, lowest HP 96, ends (1231,-2370) | 127 km/h, 0 hits |
| Akropolis final, bot (tRv2k2) | **1st 1:36.5**, 3 lead changes, gap median 102 m, max 337 m ahead / 48 m behind, 0 walls, 0 stuck | 1st 1:58.4, gap median 132 m |
| Akropolis hands-off | 2nd, `fin:true` **and** `dnf:true`, prog 0 (contradictory flags) | DNF |
| **tRaces finish rate (bot, 3 runs each)** | **GP 3/3** (77.9–86.7 s) · River 2/3 · Westend 2/3 · **Akropolis 0/3** → **7 / 12** | races-3 handoff: GP 9/9, River ~6/8, Akro ~7/8; r4/r5: GP + River DNF |
| Result panel | car stopped, speed readout hidden (`akropolis_bot_2`) | car at 182 km/h under the panel |

Caveat on perf: the +5 ms is uniform across both cities, so part of it may be the heap sampler (`HEAP=1`) or machine variance rather than code; I could not A/B without `HEAP` and with `?pc5=0` inside the timebox. Either way the absolute numbers are the verdict: **no city is near 16.7 ms on the median, and ~5 % of Athens frames take > 50 ms before any rendering.**
Caveat on races: tRaces ran in parallel with tRv2k2 (2 browsers). The Akropolis stall spot matches the races-3 handoff's documented flake ((-2100,490)), so it is real, just more frequent here.

## Alex's open complaints
| complaint | verdict | evidence |
|---|---|---|
| "Lags a lot even on a powerful machine" | **OPEN, worst issue, not better than r5** | Athens 22.0 / 52 / 255 ms JS-only, 97 frames > 50 ms per 30 s, ~210 MB/s allocation. Frankfurt 18.5 / 42 / 274. perf-3's 14.9 ms Athens median did not reproduce on trunk beta.96. |
| "Athens is unplayable" | **better** | Spawn walls gone (`ath_roam.jpg`: clean avenue, pink/yellow blocks, palms, people), 124 km/h road-follow with 0 hits, 18–21 cars near. Still ~22 ms JS per frame, and the Athens race (Akropolis) DNF'd 3 of 3 in tRaces. |
| Spawn walls | **FIXED** | `ath_roam.jpg`; GO rev5fix/ath-ground. |
| Debris over the race frame | **mostly fixed** | `akropolis_bot_0.jpg`: no big slabs in the middle; but a colourful smeared fragment/chromatic blotch still sits in the bottom-left corner and on the left edge. |
| Car under the result panel | **FIXED** | `akropolis_bot_1/2.jpg`: car stopped, km/h hidden. The cyan boost bar still shows under the panel (cosmetic). |
| Race DNFs | **PARTLY** | GP fixed (3/3). River 2/3, Westend 2/3, **Akropolis 0/3**. |

## Side-by-side vs 2K Drive (`docs/race_ref/05_pack_5th_boost.jpg` vs `akropolis_bot_0.jpg`)
2K: huge place number top-left, position list, minimap bottom-left, the road and the pack fill the middle, thin speed streaks at the edges. Ours: the avenue is lively and readable (crowds both sides, palms, traffic ahead, a fountain), and the debris slabs from r5 are gone from the centre. But **I see no race HUD at all in this race shot**: no place number, no checkpoint/time/gap pills (r5 had them), no km/h text; the top-right shows the roam chip "ATHENS 0% COMPLETE". Plus chromatic fringing on all edges and a garbled fragment smear bottom-left. 2K's race HUD is the loudest thing on screen; ours is absent in this frame. (Could be shot timing; it needs a state assert, see TOP 8 #6.)

## Scores vs 2K Drive
| # | aspect | r6 | r5 | evidence (shot) | single highest-impact fix |
|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **5** | 4 | Athens opens on a clean Syngrou, no walls (`ath_roam.jpg`); "HIT FAST = SMASH" hint + chapter pill. Cold path not timed. | Frame cost (it is the first thing felt). |
| 2 | Free-roam driving feel | **5** | 5 | 124 km/h, 0 hits over 30 s, lively, but JS alone is 22 ms median / 52 ms p95 in Athens: it stutters. | Cut the frame cost. |
| 4 | Story / side quest | **4** | 4 | "DRIFT HERE" + Stranded! pill over the road top-centre (`ath_drive.jpg`), readable. Not re-measured. | – |
| 5 | Races | **5** | 5 | GP fixed 3/3; Akropolis bot 1st with a closer gap; but tRaces 7/12 finish and Akropolis 0/3. | Akropolis stall at (-2140,500). |
| 6 | Builder | **4** | 4 | Not re-shot (carried). | – |
| 7 | Garage | **4** | 4 | Not re-shot (carried). | – |
| 8 | Vehicle transform | **6** | 6 | car/offroad in Akropolis, 0 walls, 0 stuck. | – |
| 9 | Traffic / pedestrians | **6** | 6 | Athens 18–21 near, 78 cars; 0 hits in 30 s road-follow. Smash count over 120 s not re-measured. | – |
| 10 | HUD / menus | **5** | 5 | Result panel fixed; but no race HUD visible in the race shot (`akropolis_bot_0.jpg`), boost bar under the panel. | Race HUD state assert. |
| 11 | Performance / memory | **3** | 3 | perf-3 harness: Ath 22.0/52/255 ms, Fra 18.5/42/274 ms, ~205–210 MB/s; worse than perf-3's own record; tris −14…−36 % (perf-5 tTris) but calls +1…+22 %. | Find the +5 ms (pc5 A/B) and the 200 MB/s. |
| 13 | World art | **6** | 5 | Walls gone; deep sky, brick clouds, colourful Athens blocks (`ath_roam`, `ath_drive`). Minus: chromatic fringe + fragment smear at the race frame edges. | Drop chromatic aberration on phones. |
| 14 | Portrait | **5** | 5 | Not re-measured (carried). | – |

Mean, 12 scored: (5+5+4+5+4+4+6+6+5+3+6+5)/12 = 58/12 = **4.83 → 4.8** (r5 4.7).

## TOP 8 fix list (ranked by impact on fun; perf and Athens first)
| rank | problem | repro (coords / state) | suspected file · function | size |
|---|---|---|---|---|
| 1 | **Frame JS 22 ms median / 52 ms p95 in Athens, +5 ms vs the perf-3 record in both cities** | `CITY=ath Q=high SECS=30 RACE=0 node tools/perf1/tFrame.js out r6`, from the Athens spawn (1852,-3146): 97 of 1800 frames > 50 ms. A/B the same with `?pc5=0` and without `HEAP` first. | `src/98pc_compact.js` `PC_step`/`PC_one` (wrapped into `hubCullStep`): re-packs 1833 meshes / 568k instances in Athens every 10 frames / 20 m with a `Math.hypot` + frustum test per instance; make it incremental (per-cell lists, budget per frame) | M |
| 2 | **Akropolis Final DNF 3 of 3** (the Athens race) | `node tools/tRaces.js <url> 3 akro`: bot slows at (-2198,497) at 30 s, sits at (-2140,450–524) with v −12…9 for 30+ s; stuck detector never fires (`stuck0`) | route around (-2100,490) in `src/98tk_city_duel.js` / `tkGeoOf`+`tkDespike` (races-3 open flake) and the stuck test in the race step (`RO.stkT`) that misses a car rocking back and forth | M |
| 3 | **~205–210 MB/s allocation** (GC spikes, p99 116–122 ms in Athens) | same run with `HEAP=1 TOPN=30` | leftovers listed in HANDOFF_perf perf-3 #4: `TR_Y`/`groundY` deopt loop (same fix as `TR_G`), `DEST_open` garbage (`roamHit`), `computeVertexNormals` in `LF_drapeG`, QA invariants running outside `?qa` | M |
| 4 | **Too many triangles/draw calls** (still > 1 M tris on `q=low`, calls up to 488) | `node tools/perf4/tTris.js <url> out.json low fra,ath` | perf-5 left list: the 48-instance car IM (~217k tris), its twin, LIFE `bm_s` (105k), `Mesh#32` (55k) not compacted: add them as `C.dyn` in `src/98pc_compact.js`; try `TUNE.drCell=400` to cut the extra cell calls | L |
| 5 | **Westend DNF 1 of 3** | tRaces westend run3: 290 m straight jump (660,-33)→(573,-310), stalls near (614,-141) at 60 s | Westend route through the city in `src/98tk_city_duel.js` (TK_C route; same tkDespike/stub family as GP) | M |
| 6 | **No race HUD visible in an Akropolis race frame** (no place, pills, km/h; roam chip "ATHENS 0% COMPLETE" shown instead) | tRv2k2 ath, `akropolis_bot_0.jpg` mid-race at checkpoint 1–2 | race HUD show/hide in `src/99ui_hud.js` (the `spShow`/`body:has()` rules added in rev5fix) and the city-duel HUD in `src/98tk_city_duel.js`; add a GO: during a city duel the place pill and speed text are visible | S |
| 7 | **River Run DNF 1 of 3** | tRaces river run2: falls behind from 30 s, (946,-831) airborne 6 s at 45 s, then (645,-625) at 75 s, never finishes; races-3 also has the finish-corner overshoot at (-315,446) | boat route / `TR_onSlip` and the finish-leg corner in `src/98tk_city_duel.js` `tkGeoOf`; `tkBot` look-ahead at 42 m/s | M |
| 8 | **Chromatic fringe + fragment smear at the race frame edges** | `akropolis_bot_0.jpg`, left edge and bottom-left corner | post chain in `src/72_roam_map_loop_boot.js` (`composer` chromatic pass: off on phones/`q=low`), and near-camera debris in `src/30_race.js` `debris()` (the rev5fix fade still leaves pieces at the screen edge) | S |

Not ranked: Akropolis hands-off reports `fin:true` and `dnf:true` together (`src/98tk_city_duel.js` result flags); the cyan boost bar stays visible under the result panel; Frankfurt shots, Athens 120 s smash count, builder, garage and portrait were not re-measured in this timebox.
