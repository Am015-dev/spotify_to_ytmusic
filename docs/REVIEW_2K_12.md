# Strict review #12: Mainhattan Overdrive trunk `d466be9` (= beta.117) vs LEGO 2K Drive

Reviewer session rev12, 2026-10-19. Build: `bash tools/build.sh r12` gave BUILD_OK, a 3.28 MB split page; unit 5037 assertions, 0 FAIL. Served from `out/r12`.
The rubric and the 12 aspects are the same as reviews #6 to #11. The machine is the same as before: SwiftShader with 4 CPUs, so render times are software GL and only JS times mean much. No game code changed.

**What's new in the method:** this is the first review that measures the **touch LOWMEM profile** (`QS=lowmem=1` in tBoot, `LOWMEM=1` in tFrame). Every iPhone, iPad and Android gets that profile automatically (`LOWMEM_is`, `src/10_core4.js:188`), so it is what Alex actually plays on. Note that tBoot's `LOWMEM=1` env does nothing: you must pass `QS=lowmem=1`. r11 measured touch without LOWMEM, so for Athens I ran that profile too, to keep the r11 comparison exact.

**Tools:**
- `tools/perf1/tBoot.js` and `tools/perf1/tFrame.js` (trunk);
- `tools/tRv2k2_pack.js` and `tools/rv8/*` (copied from rev11 onto this branch);
- `tools/tChkGo.js` on the built page.

**Shots I looked at** (852×393, in `docs/shots/rev12/`): `fra_roam`, `ath_roam`, `akropolis_bot_0` and `river_bot_2`.

**Overall: 6.3 / 10 against 2K Drive** (r11 6.3, r10 6.0). Overall is flat because the gains and losses cancel:
- **Gain:** on the phone profile, the game is now clearly smoother in steady state.
  - Athens: JS frames over 16 ms fell to **10 %** (r11 measured 31 % on touch without LOWMEM).
  - Frankfurt: **7 %**.
  - Graphics Auto finally climbs to scale 1.0 in both cities.
- **Losses:**
  - A new deterministic **150–260 ms freeze about 12 s into driving** appears in both cities, in every run.
  - `xf1/grass` went red again.
  - The pack GOs are red 3 of 4.

## Scores vs 2K Drive
| # | aspect | r12 | r11 | Δ | evidence | the one fix that would help most |
|---|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **7** | 7 | 0 | Touch LOWMEM boot to drivable: **27 s in Frankfurt, 46 s in Athens**. 0–5 s median: **13.3 / 14.8 ms** (r11 Athens touch 20.2). Athens touch without LOWMEM still has f0 `roamCam` 112 ms and f14 `roamStep-self` 162 ms. A shader link still lands after the curtain in both cities. | Fix #3 |
| 2 | Free-roam driving feel | **6** | 6 | 0 | Road-follow 30 s: Athens 122 km/h, Frankfurt 144 km/h, 0 hits. Steady state is smoother, but the 12 s freeze is felt every drive. | Fix #1 |
| 4 | Story / side quest | **5** | 5 | 0 | Not re-judged. The pills read well: `Yiayia Froso · Koulouri Rush → 1466 m`, `STORY · Hot Drop`. | – |
| 5 | Races | **8** | 8 | 0 | 5 racers in every race, 0 JS errors. **Akropolis:** 27 place changes, nearest rival median 11 m, 97/111 s within 30 m. **Westend:** 23 changes, 7 m, 107/124. **River:** 26 changes, 16 m, 140/172. **GP:** 9 changes, 17 m. The River ETAs are better but still not right (N2). GO pack5 is red 3/4 (N3). | Fix #5 |
| 6 | Builder | **5** | 5 | 0 | Not re-judged. | – |
| 7 | Garage | **5** | 5 | 0 | 153 tiles, 156 cards, 0 small text. | – |
| 8 | Vehicle transform | **6** | 7 | **−1** | `xf1/grass` is **red** on the built page again: tyre gap 0.08 m, and on a 0.72 m ground step the far tyre floats 0.42 m. r11 had it green. The r11d handoff calls it "a known red". | Fix #6 |
| 9 | Traffic / pedestrians | **6** | 6 | 0 | Athens 78 cars (22 → 25 near), Frankfurt 75 (17 → 21). `life1/*` PASS. Athens scooters are now coloured (GO `r11e/scoot-colour` PASS), but no scooter is in frame, so I have not confirmed it visually. | – |
| 10 | HUD / menus | **7** | 7 | 0 | `akropolis_bot_0` is clean: "4TH /5", CP 3/5, timer, "−0.2 s KATERINA LAMBROU". Nothing overlaps the controls at 852. | – |
| 11 | Performance / memory | **7** | 6 | +1 | Phone profile: steady n16 **10 % (Athens) / 7 % (Frankfurt)**, n50 1–3. First minute: Athens n50 **13**, JS > 50 ms 4, Frankfurt n50 5. Heap is flat in the first minute. Deductions: the 12 s freeze (N1); Frankfurt steady heap **+78 MB / 30 s**; the PC desktop profile was not re-measured this round. | Fixes #1, #2 |
| 13 | World art | **7** | 7 | 0 | `ath_roam` is 2K-like: deep blue sky, brick clouds, pink and yellow blocks, palms, a kerb stall with people, the glossy red car in its lane. `fra_roam` has the park boulevard and red brick trees, with lively kerbs, **but the car still spawns on the yellow centre line**. | – |
| 14 | Portrait | **6** | 6 | 0 | Not re-tested beyond the GO gate. | – |

Mean: (7+6+5+8+5+5+6+6+7+7+7+6)/12 = 75/12 = **6.25, reported as 6.3**.

## Verification of r11 bugs and TOP-6 (built page `out/r12`)
**Gate:** `TAG=r11d,r11e,r11c,r10e,r10d,r9a,r10c,r9b,perf17,scale1,phone2,boot,life1,xf1,terrain` gives **67/71 PASS, 0 page errors**.
- Fails: `xf1/grass`, `r9a/pack5` (Westend: 145 m ahead), `r9a/pack5#2` (River: 140 m behind), `r9a/pack5-warm#1` (Akropolis: nemesis lead 232 m).
- GO boots: Frankfurt 21.6 s, Athens 33.0 s (r11 27.5 / 35.7).

| r11 # | item | fix | verdict | evidence |
|---|---|---|---|---|
| TOP-1 | `hubTrafficStep-self` hitch | perf-r10e (CV_pre without closures, camera raycast cut) | ⚠️ partly | Athens touch tBoot: 11 frames over 50 ms owned by `hubTrafficStep-self` (r11 26 frames > 33 ms), max 96–126 ms. LOWMEM: 4 frames, max 92 ms (f2994). The GO target (`hubTrafficStep` max < 35) is **not met**. |
| TOP-2 | Athens first 5 s | perf-r11c (roamCam and traffic pre-run, LF program in warm) | ⚠️ | 0–5 s median: Athens touch **19.0** (20.2), touch LOWMEM **14.8** (target ≤ 16 ✅ on the phone profile). Still present: f0 `roamCam` 112 ms and f14 `roamStep-self` 176 ms (touch without LOWMEM), and a `render+prog1` frame after the curtain in both cities (Fix #3). |
| TOP-3 | Athens retained heap | perf-r11c | ✅ phone / ⚠️ PC | tBoot Athens touch: 578 → 720 → 734 MB (**4.75 MB/s, then 0.48**; r11 4.6 / 0.16), so no better without LOWMEM. LOWMEM: 537 → 626 → 600 MB (**2.97 MB/s, then −0.88**; target ≤ 2.5, close). tFrame LOWMEM steady: Athens +22 MB / 30 s ✅, **Frankfurt +78 MB** ❌. |
| TOP-4 | Graphics Auto climb and beacon | r11d | ✅ climb / ❓ beacon | Every tBoot run now climbs: Athens 0.85 at 21–35 s and 1.0 at 51–52 s; Frankfurt 0.85 at 17 s and 1.0 at 56 s (r11 Athens `gov=[]`). Quality stays `min` in all 4 runs (scale only). GOs `r11d/beacon-write` and `r11d/gov-climb` PASS. **The Beta `perf` collection is still empty** (read with ArtifactData today), so there are still no real-phone numbers. Either Alex has not played since beta.114, or the platform still refuses. |
| TOP-5 | N3 white road objects, N5 TICKERR | r11e | ✅ / ✅ | TICKERR: **0** in 4 tBoot runs (r11: 1). The scooters are coloured (GO PASS); not confirmed in a shot. |
| TOP-6 | River ETAs from the real pack, pack variance | r11e, r10d | ⚠️ / ❌ | River results (`river_bot_2`): ~03:03.01 / .11 / .61 / 04.11. The gaps are **0.10, 0.50, 0.50 s**, so two adjacent deltas are still equal and one is 0.1 s. All 4 rivals are 4–5 s behind, although the placeTrace had the player **3rd for the last ~30 s** (`…55333`) before winning by 4 s. `r9a/pack5-warm#1` is still **red** (232 m). |
| N1 | River results fake | r11e | ⚠️ | see TOP-6 |
| N2 | trunk tRv2k2 lost pack fields | – | ❌ | still on rev branches only (`tools/tRv2k2_pack.js`) |
| N4 | pack variance | r11e (end band .25→.12) | ❌ | GO pack5 is red 3/4 this run. tRv2k2 Akropolis: gap max behind −165 m (r11 −146/−326). |
| N6 | Auto never climbs | r11d | ✅ | see TOP-4 |
| r11f | LF free (reverted), PF1LZ | – | ✅ tool | lazyStep max 16–22 ms, 0–1 slow steps; no longer a hitch owner |

## Performance (Alex's #1 complaint)
### tBoot: first 60 s after drivable (852×393, DPR 3, Graphics Auto)
| run | boot | JS+render median / p99 / max | n33 / n50 / n150 | JS n50 | 0–5 s median | heap MB (0 / 30 / 60 s) | owners of frames > 50 ms |
|---|---|---|---|---|---|---|---|
| **Athens touch LOWMEM** | 46 s | **9.1 / 41.7 / 167** | 93 / **13** / 1 | **4** | **14.8** | 537 / 626 / 600 | render 6, hubTrafficStep-self 4, render+prog 3 |
| **Frankfurt touch LOWMEM** | 27 s | **9.1 / 32.0 / 367** | 30 / **5** / 1 | 2 | 13.3 | 480 / 466 / 462 | render 2, render+prog 1 (f239: 367 ms), hubTrafficStep-self 1, roamStep-self 1 |
| Frankfurt touch LOWMEM, rerun with PROGS=1 | – | 8.3 / 30.3 / 85 | 25 / 5 / 0 | 1 | 13.6 | 472 / 457 / 466 | f239 render+prog 85 ms again (program named below) |
| Athens touch (no LOWMEM), r12 | 43 s | 10.0 / 52.6 / 177 | 130 / 42 / 3 | 13 | 19.0 | 578 / 720 / 734 | render 26, hubTrafficStep-self 11, roamCam 1, roamStep-self 1, DEST_find 1, render+prog 2 |
| Athens touch (no LOWMEM), **r11** | 43 s | 11.8 / 50 / 147 | 150 / 38 / 0 | 11 | 20.2 | 598 / 735 / 740 | – |
| Frankfurt touch (no LOWMEM), **r11** | 28 s | 10.4 / 39 / 99 | 56 / 11 / 0 | 5 | 16.3 | – | – |

### tFrame: 30 s steady state, touch LOWMEM, roam at speed
| run | JS median / p95 / p99 / max | n16 (of 1800) | n50 | calls / tris | heap Δ | top sub max |
|---|---|---|---|---|---|---|
| **Athens** | **8.9 / 18.8 / 27.2 / 166** | **187 (10.4 %)** | 1 | 369 / 0.91 M | 639 → 661 (+22) | **LV_step 160** (f700), hubTrafficStep 162 incl. LV, hubCullStep 22, roamHud 20, CTB_step 15 |
| **Frankfurt** | **9.0 / 17.2 / 24.0 / 165** | **127 (7.1 %)** | 3 | 363 / 1.24 M | 494 → 572 (**+78**) | **LV_step 156** (f718), lazyStep 92 (f5), hubCullStep 26 |
| Frankfurt rerun (PROF=1) | max 264 | 255 | 3 | – | – | LV_step 247 (f720) |
| Frankfurt rerun (LV probe) | max 155 | 107 | 2 | – | – | LV_step 148 (f714) |
| r11 Athens touch (no LOWMEM) | 12.6 / – / 36.8 / 103 | 555 (31 %) | 5 | 387 / 1.11 M | – | hubTrafficStep 70 |

The CPU profile over the Frankfurt run shows no single hot function. By self time: W13_lines 4.1 %, lzRoadD 1.8 %, GND_in 1.3 %, gndGen 1.0 %, GC 0.8 %.

### The single biggest remaining lag cause on touch LOWMEM
It is **one 150–260 ms JS freeze about 12 s into every drive**. It shows up in both cities, in 4 of 4 tFrame runs, always at frames 700–720. tFrame books it to `LV_step` (`src/98l_lively.js:118`, which runs inside `hubTrafficStep`).
- **The LV helpers are ruled out.** I wrapped all 27 `LV_*`/`LVP_*` helpers at runtime (`PROBE`): none took over 3 ms. The bird, flag, blimp, boat, cluster, park, edges, eGrid, corner and spawn helpers are all clean.
- **So the time is `LV_step`'s own body.** That leaves `camera.updateMatrixWorld()` / frustum setup, or (much more likely) a **major GC landing on that frame**. That would match the Frankfurt steady heap of +78 MB / 30 s and the r11 "-self with no sub" signature.

Everything else on the phone profile is now small:
- JS median is 9 ms;
- the other n50 frames are 1–3 per 30 s;
- the first-minute JS n50 is 2–4.

The second cause is the `hubTrafficStep-self` 60–126 ms frames in the first minute: 4 in Athens LOWMEM, 11 without LOWMEM. The third is the post-curtain shader link (Fix #3).

PC (desktop q=high) was **not re-measured** in this round. The timebox went to the phone profile Alex asked about.

## Races (bot with 150 ms lag, `tools/tRv2k2_pack.js`)
| race | place / time | lead changes | place changes | nearest rival median | s within 30 m | gap ahead / behind | placeTrace |
|---|---|---|---|---|---|---|---|
| Akropolis | 1st / 116.6 s | 13 | 27 | 11 m | 97 / 111 | +36 / −165 m | 453454233121 |
| Westend | 1st / 129.3 s | 9 | 23 | **7 m** | 107 / 124 | +77 / −52 m | 3313332443211 |
| Main River Run | 1st / 179 s | 6 | 26 | 16 m | 140 / 172 | +15 / −170 m | 332333544444455333 |
| Grand Prix | 1st / 88.8 s | 3 | 9 | 17 m | 68 / 85 | +39 / −89 m | 344431444 |

Hands-off: Akropolis and Westend both DNF with place null ✅. JS errors 0. The races are lively; the pack stays close. The GP placeChanges fell (25 → 9), but that is one run.

## New bugs
| # | sev | bug | repro |
|---|---|---|---|
| N1 | **High (perf)** | **150–260 ms freeze ~12 s into roam**, both cities, every run, booked to `LV_step` self time (see above). | `CITY=fra TOUCH=1 LOWMEM=1 SECS=30 RACE=0 node tools/perf1/tFrame.js out r12`, then look at `long[0]` |
| N2 | Low–Med | River result ETAs: deltas 0.10 / 0.50 / 0.50 s (two equal), and all rivals 4–5 s back although the player was 3rd until the last ~10 s. | `node tools/tRv2k2_pack.js http://127.0.0.1:8812/index.html out fra`, `river_bot_2.jpg` |
| N3 | Med | Pack GOs red 3/4 in one gate run: `pack5` (Westend 145 m ahead), `pack5#2` (River 140 m behind), `pack5-warm#1` (Akropolis 232 m). | tChkGo `TAG=r9a` |
| N4 | Med | `xf1/grass` red again (far tyre floats 0.42 m on a 0.72 m step). | tChkGo `TAG=xf1` |
| N5 | Med (perf, start) | Post-curtain shader link: an LDS `MeshStandardMaterial` (vertex colours + map, `gfxg` onBeforeCompile key **`bw3`**; the warm built the `bw1` variant), at f239 in Frankfurt (85–367 ms). Athens has 3 `render+prog1` frames > 50 ms (f29, f839, f1319). | `CITY=fra QS=lowmem=1 PROGS=1 node tools/perf1/tBoot.js out r12 \| grep PF1MAT` |
| N6 | Low | tBoot's `LOWMEM=1` env is silently ignored (the profile needs `QS=lowmem=1`), so earlier "LOWMEM" tBoot numbers (perf-r11f n50 75) may not be LOWMEM. | tBoot source |
| N7 | Low | Frankfurt roam spawn is still on the yellow centre line (`fra_roam.jpg`, open since r11). | – |
| N8 | Info | Graphics Auto climbs scale only: quality stays `min` for 60 s in every run, even with good frames. | tBoot `end={"s":1,"q":"min"}` |

## TOP 6 fixes (ranked by score gain per effort; each is ONE ~30 min fixer task)
| rank | fix | files | GO assert | gain |
|---|---|---|---|---|
| 1 | **Kill the 12 s freeze (N1).** Name it first: add CDP `Tracing` (category `v8.gc` + `devtools.timeline`) to tFrame for frames 690–730, or time `camera.updateMatrixWorld()` separately inside `LV_step`. If it is GC: run `tools/perf1/heapOwner.js` over 0–12 s of Frankfurt LOWMEM roam (+78 MB / 30 s) and pool or hoist the top allocator. If it is `updateMatrixWorld`: use `camera.updateMatrixWorld(false)` / reuse `roamCam`'s matrices. | `src/98l_lively.js` (LV_step), the allocator heapOwner names | `perf/lv-stall`: tFrame `TOUCH=1 LOWMEM=1 SECS=30 RACE=0` in both cities: jsMax < 60 ms, n50 ≤ 1, Frankfurt heap Δ < 30 MB | Perf 7→8, driving feel 6→7 |
| 2 | **`hubTrafficStep-self` GC frames (r11 TOP-1, still open).** tBoot `WRAP=HT_cars,HT_pose,HT_next,HT_hit,HT_flush HEAP=1` on Athens LOWMEM; pool the per-tick arrays and objects (`L3_space`/`L3_stop`, near lists). | `src/70_roam_world.js` (hubTrafficStep, HT_*), the L3 owner | `perf/traffic-hitch`: tBoot Athens `QS=lowmem=1`: 0 `hubTrafficStep-self` frames > 50 ms (now 4), `hubTrafficStep` max < 40 ms (now 92) | Perf, first minute |
| 3 | **Warm the missing shader variants (N5).** Twin the LDS `gfxg … bw3` variant (and the 3 Athens `render+prog1` programs; name them with `PROGS=1 CITY=ath`) in the loader warm. | `src/98bp_warmall.js` | `perf/warm-bw`: tBoot both cities `QS=lowmem=1`: 0 `render+prog` frames after f30, max frame < 120 ms | First 60 s 7→8 |
| 4 | **Pack reliability (N3).** The bot stalls at split rejoins and in traffic (r10d/r11e notes). Sample the ahead-gap only while the bot is not in recovery and `v > 15`, make the bot recover faster at gate 2, and make sure traffic yields to racers on the race line. | `src/98tk_city_duel.js`, `src/98tk_go.js` (bot), the GO in `src/99c7_rev5fix.js` | `r9a/pack5`, `#2`, `-warm#1` all PASS in **two consecutive** gate runs | Races 8→8.5, test trust |
| 5 | **River ETAs from the real pack (N2).** Rival ETA = own finish time + gap_m / rival's own speed at the finish, minimum 0.3 s apart, **no two equal adjacent deltas**, and a rival that was ahead within the last 15 s finishes < 1.5 s behind. | `src/98tk_city_duel.js` (`tkEtas`) | extend `r11e/eta-spread`: 4 distinct deltas, no adjacent pair equal within 0.05 s, the first rival < 2 s when placeTrace had the player ≥ 2nd in the last 15 s | Races polish |
| 6 | **`xf1/grass` (N4) + Frankfurt spawn lane (N7).** Re-fit the off-road form's far tyre on ground steps (tyre gap ≤ 0.15 m on a 0.72 m step), and shift the Frankfurt spawn pose half a lane to the right. | the xf1/grass GO owner (`grep -l xf1/grass src/99c*.js`) and the tyre-fit code it tests; the Frankfurt roam spawn pose | `xf1/grass` PASS; new `r12/fra-spawn-lane`: spawn lateral offset from the centre line ≥ 1.5 m | Transform 6→7, first-impression art |

Not ranked:
- **Graphics Auto quality step (N8).** Once scale is 1.0 and b75 < 12 ms for 20 s, allow `q` min → low on touch. Do this only after #1–#3, because lag comes first.
- **Beacon.** Ask Alex (via the coordinator) to drive the Beta for 2 min on the iPhone, then read `perf`.

## Raw (r12)
| what | Athens | Frankfurt |
|---|---|---|
| Boot (tRv2k2 `s`) | 50.4 s | 37.7 s |
| Life | 78 cars, 22 → 25 near | 75 cars, 17 → 21 near |
| Road-follow 30 s | 122 km/h, 0 hits, min HP 88 | 144 km/h, 0 hits, min HP 100 |
| Garage | – | 153 tiles, 156 cards, 0 small text |
| TICKERR (4 tBoot runs) | 0 | 0 |
| GO gate | 67/71 (fails: xf1/grass, r9a/pack5, pack5#2, pack5-warm#1) | |
| `perf` db (Beta) | empty | |
