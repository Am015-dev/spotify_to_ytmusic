# Strict review #10: Mainhattan Overdrive trunk `b3e5641` (= beta.110) vs LEGO 2K Drive

Reviewer session rev10, 2026-10-18. Build: `bash tools/build.sh r10` gave BUILD_OK, a 3.27 MB page, split. Served from `out/r10`.
The rubric and the 12 aspects are the same as reviews #6 to #9, so the scores compare. The machine was SwiftShader with 4 CPUs. Every number below comes from a state assert in a script. No game code changed.

**Tools (all on this branch):**
- `tools/rv8/*` (copied from rev9);
- `tools/tRv2k2.js`, which now also logs the pack: `rivals`, `placeChanges`, `placeTrace` (place every 10 s), `nearMed` (median distance to the nearest rival) and `secsWithin30m`;
- `tools/perf1/tBoot.js` (touch, 852×393, DPR 3, Graphics Auto via `?gov=1`, first 60 s);
- `tools/perf1/tFrame.js` (`SECS=30 RACE=0`, desktop q=high, same as r9);
- `tools/tChkGo.js` with `TAG=r9a,r9b,r9c,perf17,scale1,phone2,boot,life1,xf1,terrain`.

**Shots I looked at** (852×393, in `docs/shots/rev10/`): `ath_roam`, `westend_bot_0`, `river_bot_1`, `river_bot_2` and `garage`.

**Overall: 6.0 / 10 against 2K Drive** (r9 5.6, r8 5.3). This is the mean of the same 12 aspects. Races finally feel like 2K: a pack of 5 that fights. **Lag has not moved**, though. Steady-state frame times are flat against r9, and Athens' first minute still has 47 JS frames over 50 ms, almost all inside `roamStep` and not attributed to any wrapped subsystem.

## Scores vs 2K Drive
| # | aspect | r10 | r9 | Δ | evidence | the one fix that would help most |
|---|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **6** | 6 | 0 | Boot to drivable on touch: **41 s in Frankfurt, 45 s in Athens** (r9 42–73 s). Frankfurt's first minute is smooth (8 JS frames > 50 ms). In **Athens, seconds 0–5 run 33–55 ms on almost every frame**, all `roamStep-self`, so the first impression on a phone is a stutter. | Fix #1 |
| 2 | Free-roam driving feel | **6** | 6 | 0 | Road-follow 30 s: Athens 119 km/h, Frankfurt 140 km/h, 0 hits. The CAR↔4×4 dwell landed (`r9b/veh-dwell` PASS). | Fix #1 |
| 4 | Story / side quest | **5** | 4 | +1 | The Frankfurt nemesis arc exists and its finale starts (`r9c/fra-arc` PASS), so both cities now have a rival arc. | – |
| 5 | Races | **8** | 7 | +1 | **5 racers in every city race.** Westend: 22 place changes, nearest rival median 11 m, 98 of 121 s within 30 m. River: 32 changes. GP: 18. Akropolis (2nd run): 21 changes, 80 of 102 s within 30 m. This is 2K's pack feel. Deductions: Akropolis run 1 was a runaway (1 lead change, 333 m ahead); River Run has bugs N2 and N3. | Fixes #4, #5 |
| 6 | Builder | **5** | 5 | 0 | Not re-judged. | – |
| 7 | Garage | **5** | 4 | +1 | EXIT and 🐞 are gone from the garage, and names wrap to 2 lines ("Orange Street Racer") (`garage.jpg`, `r9b/garage-clear` PASS). There is still nothing to earn (all 156 open). | – |
| 8 | Vehicle transform | **6** | 6 | 0 | The roam flip spam is fixed. But `xf1/grass`, `xf1/water` and **`xf1/assist`** are all red (N1). | Fix #3 |
| 9 | Traffic / pedestrians | **6** | 6 | 0 | `life1/people` and `life1/smash` are green again (r9 N1 fixed). Athens has 78 cars (21 → 28 near), Frankfurt 75 (20 → 24). | – |
| 10 | HUD / menus | **7** | 6 | +1 | The race HUD is clean at 852 ("1ST /5", CP, timer, "+0.2 s MAX ADLER"). `r9b/pill-gear` passes in both cities. The Athens pill reads "→ 1466 m". | – |
| 11 | Performance / memory | **5** | 5 | 0 | **Steady-state tFrame 30 s, Athens:** median 16.5 ms (r9 15.7), p99 69 (71), max 232 (268), **24 frames > 50 ms (27)**. **Frankfurt:** 14.6 (14.4), p99 48 (46), max 113 (113), **16 (13)**. The streaming budgets cut `lazyStep` and `LV_step` maxima to 25–33 ms (from 52–57). The remaining spikes are `hubCullStep` (53–91 ms in Athens), the unexplained remainder of `hubTrafficStep` (up to 131 ms) and `roamStep-self` (up to 217 ms, probably GC: the Athens heap grows **739 → 865 MB in 30 s**). | Fixes #1, #2 |
| 13 | World art | **7** | 7 | 0 | `ath_roam` and `westend_bot_0` read like 2K: deep blue sky, brick clouds, glossy LEGO car, pink and yellow façades, kerbside people. | – |
| 14 | Portrait | **6** | 5 | +1 | The pill stays clear of ⚙ and keeps the distance (`r9b/pill-gear` and `#1` PASS). The rival name is on 2 lines. | – |

Mean: (6+6+5+8+5+5+6+6+7+5+7+6)/12 = 72/12 = **6.0**.

## r9 verification (built page `out/r10`)
| r9 # | item | fix | verdict | evidence |
|---|---|---|---|---|
| TOP-1 | A pack of 5 in every race | r9a `270a56e` | ✅ (⚠️ River) | `r9a/pack5` passes for Westend, GP and Akropolis (5 racers, HUD /5, 5–11 lead changes, gaps < 120 m). **River FAILS: 133 m behind at 164 s**, the same failure the r9a handoff reported. tRv2k2 fights are in the table above. `r9a/pack-cost` PASS (+0.00 ms). |
| TOP-2 | Time-slice `lazyStep` / `LV_step` | perf-17 `7a85bef` | ✅ partly | `perf17/stream` PASS in both cities. In tFrame the maxima went from 52–57 ms to 27–33 ms. Athens frames > 50 ms only went from 27 to 24. |
| TOP-3 | Amortise `hubCullStep` / `FL_step` | perf-17 | ⚠️ **not in Athens** | `FL_step` is ≤ 15 ms in tBoot (r9 112 ms), ✅. But **`hubCullStep` still reaches 53 ms (tFrame) and 91 / 63 ms (tBoot f1406 and f996)** in Athens. The 1/4 slice only runs "on jumps", and normal driving still pays the full cull. |
| TOP-4 | Frankfurt nemesis arc | r9c `876500f` | ✅ | `r9c/fra-arc` PASS. The finale crash (LEGO npc light bar) is fixed. |
| TOP-5 | Portrait pill / phone rival box | r9b `5496558` | ✅ | `r9b/pill-gear` passes for fra and ath. The rival name is on 2 lines. |
| TOP-6 | Garage clean-up | r9b | ✅ | `r9b/garage-clear` PASS. `garage.jpg` has no EXIT over the cards, names wrap, and 0 text under 12 px. |
| N1 | Athens `life1/people` red | r9d `6ebb8fd` | ✅ | `life1/people` and `life1/smash` PASS. |
| N2 | Portrait pill under ⚙ | r9b | ✅ | see TOP-5 |
| N3 | Roam CAR↔4×4 flip spam | r9b | ✅ | `r9b/veh-dwell` PASS |
| N4 | Garage EXIT over cards | r9b | ✅ | see TOP-6 |
| N5 | Races are not a fight | r9a | ✅ | 18–32 place changes; nearest rival median 11–15 m |
| N6 | Athens nudge-hop | – | not re-tested | – |
| N7 | Perf spikes from streaming | perf-17 | ⚠️ | see TOP-2 and TOP-3 |
| new since r9 | Graphics Auto (touch boots low) | scale-1 | ✅ GO, ⚠️ behaviour | `scale1/*` 4/4 PASS. In both 60 s tBoot runs **the governor never steps up** (`gov=[]`, ends at scale 0.7, tier min), because JS-only p90 here is ≥ 14 ms. On a phone with the same JS load, the game would stay blurry for the whole first minute. |
| new | Perf beacon + FPS chip | phone-2 | ✅ GO / ⚠️ no data | `phone2/beacon` and `phone2/chip` PASS, but the Beta artifact's `perf` collection is **empty**, so there are no real-device numbers yet. |
| new | Smash fixed | r9d | ✅ | `life1/smash` PASS |

**Gate:** 57/61 on the built page, with 0 page errors. The reds are `xf1/grass`, `xf1/water`, `xf1/assist` and `r9a/pack5#2` (River). r9 had 54/56, with xf1 only SLOW.

## Performance (Alex's #1 complaint)
| run | Frankfurt | Athens |
|---|---|---|
| tBoot touch, boot to drivable | 41 s | 45 s |
| tBoot 60 s, JS+render: median / p99 / max | 14.5 / 48 / 103 ms | 16.6 / 76 / **207** ms |
| frames > 50 ms (all / JS only) / > 150 ms | 33 / **8** / 0 | 133 / **47** / **5** |
| owner of frames > 50 ms | render 24 (software GL, every 30th frame), roamStep-self 4, DEST_find 1 (`DEST_mark` 41 + `DEST_find` 48 at f32) | **roamStep-self 39**, render 84, roamCam 3 (95 ms at f483), DEST_find 2 |
| frames > 33 ms per second | spread out | **s0 33, s1 20, s2 21, s3 11, s4 17, s5 13**, then 2–11 per second |
| Graphics Auto over 60 s | stays at 0.7 / min | stays at 0.7 / min |
| tFrame 30 s steady (median / p95 / p99 / max, n > 50) | 14.6 / 29.8 / 47.7 / 113, **16** (r9 13) | 16.5 / 34.1 / 69.4 / 232, **24** (r9 27) |
| draw calls / tris / programs | 781 / 3.85 M / 202 | 975 / 2.97 M / 206 |
| heap over 30 s | 622 → 768 MB | **739 → 865 MB** |
| boot long tasks (tFrame, q=high desktop) | 40 s, 23 s, 14 s, 14 s | 39 s, 33 s, 21 s, 12 s |

My verdict on playability: Frankfurt is playable on a mid PC. Athens on a phone stutters badly for its first ~6 s and then hitches every few seconds. It is not 2K-smooth in either city.

## Races with the pack (tRv2k2, bot with 150 ms lag)
| race | place / time | lead changes vs nemesis | place changes | nearest rival median | s within 30 m | gap vs nemesis (ahead / behind) |
|---|---|---|---|---|---|---|
| Akropolis (ath) run 1 | 1st / 103 s | **1** | – | – | – | **+333** / −47 m |
| Akropolis (ath) run 2 | 1st / 107 s | 11 | 21 | 15 m | 80 / 102 | +69 / −159 m |
| Westend (fra) | 1st / 126 s | 9 | 22 | 11 m | 98 / 121 | +81 / −52 m |
| Main River Run (fra) | 1st / 179 s | 11 | 32 | 12 m | 122 / 171 | +85 / −78 m; **5th from ~60 s to ~150 s, then 1st** |
| Grand Prix (fra) | 1st / 92 s | 2 | 18 | 13 m | 77 / 89 | +34 / −99 m |

## New bugs
| # | sev | bug | repro |
|---|---|---|---|
| N1 | **Med** | **xf1 transform GOs regressed: `xf1/grass`, `xf1/water` and `xf1/assist` are red.** Lane assist pulls the car off its line by 0.33 rad (limit 0.15) when the player steers into the park. The boat hull sits 0.18 m under the water line (target 0.22 ± 0.1), and grass reports `form undefined`. In r9 only grass was red, for timing alone. Suspect the r9b CAR↔4×4 dwell or the pack band. | `TAG=xf1 node tools/tChkGo.js http://localhost:8099/r10/index.html out` |
| N2 | **Med** | **River Run: the race HUD vanishes mid-race.** No place, CP or timer shows while the race is running (`river_bot_1.jpg`, ~120 s in), and the car is on a hillside away from the river. The placeTrace shows 5th for ~90 s, then a win. `r9a/pack5#2` fails at 133 m behind. | `node tools/tRv2k2.js <url> out fra`, then look at `river_bot_1.jpg` and the `river_bot` placeTrace |
| N3 | Low–Med | **River results look fake:** 3 of the 4 rivals finish at the identical "~03:02.40" (`river_bot_2.jpg`). Estimated times should be spread out by each rival's gap. | same run, results panel |
| N4 | Low–Med | **Pack variance:** one Akropolis run had the nemesis runaway (1 lead change, +333 m), while the next run on a fresh page was a tight fight. This is likely the warm-page start order the r9a handoff mentions (a bot that never drove). | run `tRv2k2 … ath` twice |
| N5 | Low | **`TICKERR Cannot set properties of null (setting '0')`** once in the Athens touch first minute (thrown from a rAF callback, so one frame's work was lost). | `CITY=ath node tools/perf1/tBoot.js out r10 \| grep TICKERR` |
| N6 | Low (perf) | **Graphics Auto never climbs in the first 60 s** (both cities, `gov=[]`), and `perf` beacon data is empty. Whether phones stay at scale 0.7 cannot be confirmed without device data. | tBoot `PF1 city=… gov=[] end={"s":0.7,"q":"min"}` |

## TOP 6 fixes (ranked by score gain per effort; each is ONE ~30 min fixer task)
| rank | fix | files | GO assert | gain |
|---|---|---|---|---|
| 1 | **Athens first-10-s stutter: find and remove `roamStep-self`.** Run `CITY=ath PROF=1 SECS=12 node tools/perf1/tBoot.js out X` and take the top self-time functions in frames > 33 ms (263 of them are `roamStep-self`). Wrap the culprit in the tBoot list, then budget it, move it to the loader, or slice it per frame. | the function `PROF=1` names (probably in `src/70_roam_world.js` or the Athens assets), and `tools/perf1/tBoot.js` (add it to the wrap list) | `perf/ath-first10`: tBoot Athens touch, frames 0–600 → JS frames > 33 ms ≤ 30 (now ~115) and > 50 ms ≤ 10; whole minute JS > 50 ms ≤ 20 (now 47) | Perf 5→6, First 60 s 6→7 (Alex's #1) |
| 2 | **Slice `hubCullStep` on every tick, not only on jumps, and split `hubTrafficStep`.** Use the perf-17 1/4 slice for the normal cull too. Wrap the remainder of `hubTrafficStep` (its car loop) to find the 40–80 ms that no sub explains. | `src/70_roam_world.js` (`hubCullStep`), the `hubTrafficStep` owner | `perf/cull-every`: tFrame Athens 30 s → `hubCullStep` max < 10 ms, `hubTrafficStep` max < 30 ms, n > 50 ≤ 12 (now 24); Frankfurt ≤ 8 (16) | Perf 5→6 (PC lag) |
| 3 | **xf1 regression triage (N1).** Bisect `xf1/assist` and `xf1/water` between `6bc1079` and `b3e5641` (suspects `5496558` r9b dwell and `270a56e` pack). Restore assist ≤ 0.15 rad and the hull draft. | the regressing commit's files | the existing `xf1/grass`, `xf1/water` and `xf1/assist` go green (no SLOW) on the built page | Transform 6→7, gate green |
| 4 | **River Run fix (N2 + N3 + pack5#2).** Keep the race HUD visible in every River segment. Make the bot or route stay on the river (no hillside detour). Spread rival ETA times by gap. Sample the pack5 gap only until the leader finishes. | `src/98tk_city_duel.js` (River route, results ETA), race HUD in `src/99ui_hud.js` | `r9a/pack5#2` PASS; new `race/river-hud`: every second of a bot River race, `#spHud` (place element) is visible; results: the rivals' times are all distinct | Races 8 stays solid |
| 5 | **Pack start reliability (N4).** On a warm page, all 5 AI must move within 3 s of the green light, and the nemesis must not lead by > 150 m. | `src/98tk_city_duel.js` (`tkStart`, AI reset), `src/98tk_go.js` | `r9a/pack5-warm`: run Akropolis twice in one page → both runs ≥ 3 lead changes, gap < 150 m, every AI `s > 20` at 3 s | Races, fun |
| 6 | **Athens heap growth (~4 MB/s) → GC spikes.** Run `tools/perf1/heapOwner.js` in Athens roam, find the top allocator (the 217 ms `roamStep-self` frame at f1031 has no sub work, so it is a GC signature), and pool it. | the allocator heapOwner names | `perf/ath-heap`: tFrame Athens 30 s heap growth < 40 MB (now 126), jsMax < 120 ms (now 232) | Perf, phone memory |

Not ranked:
- **N6:** let Auto climb on GPU time and not JS p90, or relax the threshold to 18 ms on touch. Do this only after device beacon data arrives. Ask Alex for one real phone session so that `perf` gets rows.
- **N5:** the null-setter TICKERR. Catch it with a stack (`window.__dbg` stack print) in tBoot.

## Raw (r10)
| what | Athens | Frankfurt |
|---|---|---|
| Boot (tRv2k2 `s`) | 59–60 s | 44 s |
| Life | 78 cars, 21 → 28 near | 75 cars, 20 → 24 near |
| Road-follow 30 s | 119 km/h, 0 hits, min HP 96 | 140 km/h, 0 hits, min HP 96 |
| Garage | – | 153 tiles, 156 cards, 0 small text |
| Hands-off race | Akropolis DNF, place null ✅ | – |
| JS errors | 0 (1 TICKERR in tBoot) | 0 |
| GO gate | 57/61 (xf1/grass, xf1/water, xf1/assist, r9a/pack5#2) | |
