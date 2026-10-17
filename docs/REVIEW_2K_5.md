# Strict review #5: Mainhattan Overdrive trunk `e59bc7d` (= v90m-beta.93) vs LEGO 2K Drive

Reviewer session rev5, 2026-10-17. Build: trunk `alex/od-int2` `e59bc7d`, built with `tools/build.sh r5` (BUILD_OK, page 3.21 MB, split). Unit: `UNIT OK … 0 FAIL`. Served locally from `out/r5/`.
Same rubric and categories as review #4 (`alex/rev4:docs/REVIEW_2K_4.md`), so the scores compare.
Scripts: `tools/tRv2k2.js <url> <out> ath` (Akropolis, same as r4), `tools/perf1/tFrame.js` (desktop 1280×720, `q=high`, 30 s), and two review-only probes (not committed, method below):
**tR5** (852×393 phone context, per city: life at spawn, 25 s of the REAL `frame()` loop with a road-follow steerer and `composer.render` timed, then 120 s stepped road-follow with `roamStep+roamCam+drawTraffic+updWorld` timed per step, counting stops > 3 s, jumps > 25 m/step, speed halvings, camera-distance swings ≥ 2 m, SM2 counters, life every 30 s; Athens also 15 s from each r4 push-out spot) and **tSp** (Athens spawn: `TR_G` heights across the road and rays at the visible walls).
Software GL (SwiftShader), 4 CPUs, 3 browsers at once, so real-time frame times are NOT hardware numbers. Stepped JS ms and draw calls/triangles are. Console errors: 0 in every run.
Shots looked at (852×393): `ath_spawn`, `ath_spawn20`, `ath_rt_drive`, `ath_drive`, `ath_maze`, `akropolis_bot_0`, `akropolis_bot_1`, `fra_rt_drive`, and the 2K reference `docs/race_ref/05_pack_5th_boost.jpg`. (The garbled emoji/arrows in my shots come from my local static server's charset, not the game.)

**Overall: 4.7 / 10 against 2K Drive** (mean of the same 12 aspects; r4 was 4.8).
Athens got much better where r4 pointed: the camera no longer pumps (0 swings ≥ 2 m/min, was 7.5), the streets are alive (12 cars near the spawn, 21–37 while driving, was 5 and 0), traffic contacts fell from 205 to 36 per 2 min, no push-out jumps at the r4 spots, and the spawn is on Syngrou (127 km/h average over 30 s, was 66).
But the score does not rise, because what Alex feels first is still broken: **the frame is too expensive** (Athens stepped JS median 20 ms, p95 62 ms, max 728 ms on top of rendering ~1.2–1.9 M triangles in ~300–390 draw calls even on `q=low`), and **the Athens spawn view is framed by two giant flat ochre walls** that tower over Syngrou. The car still smashes a traffic car every ~4 s in Athens, smash debris covers a quarter of the screen in races, and the car keeps doing 182 km/h under the Akropolis result panel.

## Measurements (trunk e59bc7d; r4 = ab53298)
| what | r5 | r4 |
|---|---|---|
| Boot to `__tq.ready` (3 browsers in parallel) | Fra 62 s · Ath 81 s | 115–186 s (5 browsers) |
| Stepped frame JS, 120 s road-follow (roamStep+roamCam+drawTraffic+updWorld), median / p95 / max | **Fra 11.4 / 35.8 / 396 ms · Ath 19.9 / 61.6 / 728 ms** | – (PERF_1 pf2: Fra 10/23/171, Ath 20/100/409) |
| Stepped JS, 15 s from each r4 spot (Ath) | 11–18 / 30–52 / 124–327 ms | – |
| Real `frame()` loop, phone context (SwiftShader) | 10–13 frames in 25 s; `PERF.js` 111–116 ms per frame; render 24–30 ms median | – |
| Draw calls / triangles per frame (`q=low`, `lowGfx`, pr 1) | Fra 387 calls / 1.88 M tris · Ath 303 / 1.17 M | PERF_1 desktop high: 743 / 4.3 M |
| Road-follow 120 s, avg km/h, stops > 3 s, jumps > 25 m, speed halvings | Fra 160 km/h, 0, 0, 0 · **Ath 114 km/h, 0, 0, 0** | Fra 121, Ath 92; 1 teleport each |
| Road-follow 30 s from the Athens spawn (tRv2k2) | **127 km/h**, 0 hits, lowest HP 96, ends (1212,-2356) | 66 km/h, ends in the ped maze |
| Camera distance 5 / 50 / 95 %, swings ≥ 2 m per min | Fra 7.0 / 7.2 / 7.6 m, **0**/min · Ath 3.7 / 7.2 / 8.0 m, **0**/min | Fra 1.0/min · **Ath 7.5/min** |
| Traffic contacts in 120 s (SM2) | Fra 0 taps / 17 car smashes · **Ath 5 taps / 31 car smashes**; props Ath 6 taps / 5 smashes | Fra 54/83 · Ath 171/34 |
| Street life (cars ≤ 120 m, moving) | Fra spawn 14/9, drive 21/16 and 26/22, then 0/0 east of x≈3400 · **Ath spawn 12/12, drive 36/34, 28/28, 37/34, 23/19** | Ath 5/1, 0 after 30 s |
| r4 push-out spots, 15 s road-follow each | (1039,-1893) 83 km/h, 0 jumps · (-83,-1904) 89 km/h, 0 jumps · (1609,-1712) 129 km/h · **(1114,-1864) 26 km/h, 25 prop taps, camera down to 3.6 m** | jumps 20–31 m + hits 83–117 km/h |
| Akropolis final, bot, after Athens roam | **1st 1:58.4**, 5 lead changes, **gap median 132 m**, max 308 m behind, 0 walls, 0 stuck | 1st 1:55.8, 5 changes, gap 38 m |
| Akropolis hands-off | DNF (good) | – |
| Result panel (Akropolis) | **car at 182 km/h under the panel** | Westend 34 km/h |

## Alex's open complaints
| complaint | verdict | evidence |
|---|---|---|
| "Lags a lot even on a powerful machine" | **OPEN, worst issue** | Athens stepped JS p95 62 ms and max 728 ms (budget 16.7 ms for 60 fps) with rendering excluded. PERF_1 (perf-2) found ~400 MB/s allocation in Athens driving; the GC pauses land in random functions. perf-2 fixed QS_shutSet (~1.9 GB/20 s), but LF_drapeOk/LF_tileG (~2 GB) and DEST_find (~1.5 GB) are still open, and GO perf/frame is still RED by its own record. Even `q=low` draws 1.2–1.9 M triangles. |
| "Athens is unplayable" | **better, still not good** | Driving now works: 114 km/h for 2 min, 0 stops, 0 jumps, lively streets. Against it: the giant ochre walls at the spawn (first view), a car smash every ~4 s, grinding at (1114,-1864), and the frame cost is ~2× Frankfurt's (median 19.9 vs 11.4 ms). |
| Camera far/close loop | **FIXED (stepped)** | 0 swings ≥ 2 m/min in Athens over 120 s and 4 spots (r4 7.5/min). One open sign: the 5th percentile is 3.6–3.7 m, so the camera sometimes pulls in to half distance (spot 1114,-1864). |
| Traffic rams | **PARTLY** | 36 contacts in 120 s (r4 205), but 31 are smashes, above the rv2k4/ath-traf target (≤ 30). AYD_clear is OFF by default (rv4F). |
| Walls/push-outs on roads | **FIXED at r4 spots** | 0 jumps > 25 m at all 4 spots and in the 120 s run. |
| Empty streets | **FIXED in Athens** | 12/12 at the spawn, 19–37 moving while driving. Frankfurt is empty east of x≈3400 (0 cars in 120 m twice). |

## Desktop perf
`tools/perf1/tFrame.js` (desktop 1280×720, q=high, 30 s, fra + ath) did not finish inside the timebox (stopped at boot after 5 min under 3-browser load). The latest desktop numbers are PERF_1.md perf-2 (same trunk line): Athens run alone 17.5–20.6 ms median / 71–85 ms p95 / 719–856 ms max; Frankfurt 16.9–18.2 / 102–108 / 686–1269 ms (paired, noisy). My stepped phone-context numbers above agree on the shape: Athens costs ~2× Frankfurt and has 0.4–0.7 s spikes.

## Side-by-side vs 2K Drive (`docs/race_ref/05_pack_5th_boost.jpg` vs `akropolis_bot_0.jpg`)
2K: big place number top-left, minimap bottom-left, clear road ahead, effects are thin speed streaks at the edges. Ours: the place/checkpoint/time/gap pills now show (r4 #7 fixed) and the avenue is lively, but **black and white debris slabs cover ~25 % of the frame** (right half), chromatic fringe on the edges, and the speedo is a small "68 KM/H" text in the top-left corner over the menu icon. 2K never hides the road in a race.

## Scores vs 2K Drive
| # | aspect | r5 | r4 | evidence (shot) | single highest-impact fix |
|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **4** | 5 | Athens opens on two huge flat ochre walls over Syngrou (`ath_spawn.jpg`, still there after 20 s in `ath_spawn20.jpg`). Frankfurt opening is clean (`fra_rt_drive.jpg`). Cold path not timed. | Remove the Athens spawn walls. |
| 2 | Free-roam driving feel | **5** | 5 | Driving works in both cities (160 / 114 km/h, 0 stops, 0 jumps), but the frame cost (Ath p95 62 ms, spikes to 728 ms) makes it stutter, which is what Alex reports. | Cut per-frame allocation (GC). |
| 4 | Story / side quest | **4** | 4 | A BOOST RINGS panel (0/6 rings, retry) opens mid-screen over the road after a warp (`ath_maze.jpg`). No card froze the car (0 stops > 3 s). | Dock challenge panels at the top edge. |
| 5 | Races | **5** | 5 | Akropolis 1st again but the race is loose: gap median 132 m (r4 38), up to 308 m behind. Race pills visible (`akropolis_bot_0.jpg`). River Run / Grand Prix not re-run (timebox). | Keep the Akropolis rival within ~60 m. |
| 6 | Builder | **4** | 3 | Not re-shot. Landed: garage overlay closed before the builder opens + GO builder/visible (commit "builder: close the garage overlay…"). Unverified by me. | Shot the real garage → BUILD path. |
| 7 | Garage | **4** | 4 | LEVEL UP now queued while the garage is open (GO garage/levelpop). Not re-shot; name truncation unverified. | – |
| 8 | Vehicle transform | **6** | 6 | Akropolis uses car/offroad without camera re-fit swings (rv4A keeps the fit). | Deeper water colour (r4). |
| 9 | Traffic / pedestrians | **6** | 5 | Athens alive (12–37 cars near, nearly all moving; `ath_drive.jpg` people + cars both sides). Still 31 car smashes / 2 min. Frankfurt empty east of x≈3400. | Athens yield that also works at > 80 km/h. |
| 10 | HUD / menus | **5** | 5 | Race pills fixed. Car at 182 km/h under the result panel (`akropolis_bot_1.jpg`), speedo a small corner text, BOOST RINGS panel over the road. | Stop the car under the result panel in city duels. |
| 11 | Performance / memory | **3** | 4 | Stepped JS Ath 19.9/61.6/728 ms, Fra 11.4/35.8/396 ms; 1.2–1.9 M tris on `q=low`; GO perf/frame red by its own record; ~400 MB/s allocation (PERF_1). Memory not re-measured. | GC churn: LF_drapeOk/LF_tileG, DEST_find. |
| 13 | World art | **5** | 6 | Ochre walls at the spawn; debris slabs fill the race frame (`akropolis_bot_0.jpg`); big spiky foliage on the Plaka path (`ath_maze.jpg`). Good: deep sky, brick clouds, lively Athens avenue (`ath_drive.jpg`). | Debris scale/near-camera cull. |
| 14 | Portrait | **5** | 5 | Not re-measured (carried from r4). | – |

Mean, 12 scored (1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14): (4+5+4+5+4+4+6+6+5+3+5+5)/12 = 56/12 = **4.67 → 4.7**.

## r4 Athens TOP 5 re-check
| r4 # | GO | evidence now | verdict |
|---|---|---|---|
| 1 camera far/close loop | rv2k4/ath-cam | 0 swings ≥ 2 m/min (120 s + 4 spots); 5th pct 3.6–3.7 m | **FIXED** (watch the occasional pull-in) |
| 2 car rams traffic | rv2k4/ath-traf | 5 taps + 31 smashes = 36 in 120 s (target ≤ 30; r4 205) | **PARTLY** |
| 3 bad spawn | rv2k4/ath-spawn | Syngrou, 127 km/h over 30 s, ends on (1212,-2356). But the view is the ochre walls. | **FIXED for driving, OPEN for looks** |
| 4 push-outs | rv2k4/ath-push | 0 jumps > 25 m at (1039,-1893), (1114,-1864), (-83,-1904); 0 in 120 s. (1114,-1864) grinds at 26 km/h. | **FIXED** (new grinding spot) |
| 5 empty streets | rv2k4/ath-life | spawn 12/12, drive 19–37 moving | **FIXED** |

## TOP 8 fix list (ranked by impact on fun; perf and Athens first, as asked)
| rank | problem | repro (coords / state) | suspected file · function | size |
|---|---|---|---|---|
| 1 | **Frame-time spikes from GC churn** (Alex's "lags on a powerful machine") | `CITY=ath Q=high SECS=30 node tools/perf1/tFrame.js out r5` or GO perf/frame: Athens road-follow, stepped JS p95 62 ms, max 728 ms; ~400 MB/s allocated (PERF_1 perf-2 HEAP=1) | `src/98lf_lively_fill.js` `LF_drapeOk`/`LF_tileG` (~2 GB/30 s: per-prop `V.map` arrays, `_vy`), `src/98dest_destruct.js` `DEST_find` (~1.5 GB, O(N²) shortcut scan with Maps: precompute at load), QA ticker outside `?qa` | L |
| 2 | **Too many triangles/draw calls even on low** | Frankfurt spawn, `q=low`, 852×393: 387 calls, 1.88 M tris per frame; Athens 303 / 1.17 M (desktop high 743 / 4.3 M) | `src/72_roam_map_loop_boot.js` `frame()` → `composer.render`; distance culling / merging of city meshes and the shadow pass (perf3: 137 calls + 1.2 M tris); per-tier far plane (`TUNE.farMed`) | L |
| 3 | **Athens spawn framed by giant flat ochre walls** (first thing the player sees) | `?test=ath`, ATH_SPAWN (1852,-3146, h -0.698): `TR_G` is flat 75 m within ±40 m of the road, but rays hit vertex-coloured unnamed meshes 26–69 m off the road reaching y 81–95 (6–20 m above the road); still there after 20 s (`ath_spawn20.jpg`) | the Athens deep-interior solid/filler block visuals (`src/95_drive_flow.js` `DR_solidBuild` raster, or the Athens filler blocks after `CITY_reidx`, `src/51_city_net.js`) or the outer ground mesh (`worldGroundGen`, `src/60_city_build.js`) not matching `TR_G` | M |
| 4 | **Athens car smashes traffic every ~4 s** | 120 s stepped road-follow from the Athens spawn at 114 km/h: carTap 5 + carSmash 31 (rv2k4/ath-traf target ≤ 30) | `src/98ayd_yield.js` `AYD_clear` (OFF behind `window.OD_AYDCLR`, it widened the Westend gap): make the corridor clear work without moving race rivals (skip `RO.sp` AI) and turn it on in roam | M |
| 5 | **Smash debris covers ~25 % of the race frame** | Akropolis final, checkpoint 3/5, 68 km/h (`akropolis_bot_0.jpg`): black/white slabs fill the right half | `src/30_race.js` `debris()`: cap the piece size and cull or fade pieces within ~4 m of the camera | S |
| 6 | **Car keeps driving at 182 km/h under the result panel** (regression of rv2k3/finish for the city duel) | Akropolis bot run to the finish: result panel up, HUD 182 km/h (`akropolis_bot_1.jpg`); Westend was 34 km/h in r4 | `src/98tk_city_duel.js` finish path (`sprintEnd`/result show): apply the same finish slowdown as Westend | S |
| 7 | **Grinding spot in Athens** (looks like a stuck car) | warp `rfSnap(1114,-1864)`, 15 s road-follow: 26 km/h average, 25 prop taps, camera pulled to 3.6 m | props on the drivable lane: `src/60_city_build6.js` `smashCheck` / `src/98sm2_smash2.js` `SM2_prop` (light touch = bump, so the car hugs a prop row) and the prop placer there; camera pull in `src/98fc_foliage_cam.js` `FC_pull` | S/M |
| 8 | **Akropolis final is no longer close** | tRv2k2 ath: 1st, gap median 132 m, max 308 m behind (r4 38 m) | rival pace / rubber band in `src/98tk_city_duel.js` (and `src/98ayd_yield.js` effect on the rival's lane) | M |

Not ranked: BOOST RINGS panel opens mid-screen over the road after a warp (`ath_maze.jpg`); Frankfurt has 0 cars within 120 m east of x≈3400 (life samples at (3413,1153) and (4751,1435)); River Run and the Grand Prix were not re-run in this timebox (r4: both DNF).
