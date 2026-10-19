# Strict review #11: Mainhattan Overdrive trunk `7d5f646` (= beta.113) vs LEGO 2K Drive

Reviewer session rev11, 2026-10-18. Build: `bash tools/build.sh r11` gave BUILD_OK, a 3.27 MB split page; unit 5049 assertions, 0 FAIL. Served from `out/r11`.
The rubric and the 12 aspects are the same as reviews #6 to #10, so the scores compare. The machine is the same as r10: SwiftShader with 4 CPUs, so render times are software GL and only JS times mean much. No game code changed.

**Tools:**
- `tools/perf1/tBoot.js` (touch, 852×393, DPR 3, Graphics Auto, first 60 s);
- `tools/perf1/tFrame.js` (`SECS=30 RACE=0`: desktop q=high as in r10, plus `TOUCH=1` for Athens);
- `tools/tChkGo.js` on the built page;
- `tools/tRv2k2.js` (trunk);
- `tools/tRv2k2_pack.js`, which is rev10's tRv2k2. Trunk's copy lost the pack logging (`rivals`, `placeChanges`, `placeTrace`, `nearMed`, `secsWithin30m`), so I restored it under a new name;
- `tools/rv8/*` (copied from rev10).

**Shots I looked at** (852×393, in `docs/shots/rev11/`): `fra_roam`, `ath_roam`, `akropolis_bot_0`, `akropolis_bot_1` and `river_bot_2`.

**Overall: 6.3 / 10 against 2K Drive** (r10 6.0, r9 5.6). This is the first review where **lag moved**:
- In Athens' touch first minute, JS frames over 50 ms fell from 47 to 11, and frames over 150 ms from 5 to 0.
- Boot to drivable is 28 s in Frankfurt and 43 s in Athens (r10 41 / 45 s).
- In steady-state Athens, frames over 50 ms fell from 24 to 9.

It is still not 2K-smooth: **20–31 % of steady-state frames spend more than 16 ms in JS alone**, before any rendering. On a phone that means roughly 30–45 fps with periodic 70–100 ms hitches from `hubTrafficStep`.

## Scores vs 2K Drive
| # | aspect | r11 | r10 | Δ | evidence | the one fix that would help most |
|---|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **7** | 6 | +1 | Boot to drivable on touch: **28 s in Frankfurt (41), 43 s in Athens (45)**. Athens frames over 33 ms per second for s0–s5: **14, 5, 5, 6, 5, 5** (r10 33, 20, 21, 11, 17, 13). The first 5 s still have a 20.2 ms median frame in Athens (16.3 ms in Frankfurt), plus f3 `roamCam` 96 ms, f25 `hubTrafficStep` 77 ms and f59 render+program link 118 ms. | Fix #2 |
| 2 | Free-roam driving feel | **6** | 6 | 0 | Road-follow 30 s: Athens 125 km/h, Frankfurt 136 km/h, 0 hits, min HP 96. The lower hitch rate helps, but the hitches still show every few seconds. | Fix #1 |
| 4 | Story / side quest | **5** | 5 | 0 | Not re-judged. Both pills read well (`STORY · Hot Drop`, `CH1 · Koulouri Rush`). | – |
| 5 | Races | **8** | 8 | 0 | 5 racers in every race. **Westend:** 25 place changes, nearest rival median 7 m, 108 of 123 s within 30 m. **GP:** 25 changes, 6 m, 85/88. **Akropolis:** 25 changes, 11 m, 93/102. **River:** 20 changes, 13 m, 131/167. `akropolis_bot_0` is a real 2K moment: "5TH /5", the CP pill, the rival "−1.9 s KATERINA LAMBROU", a pack car alongside and a loop ring ahead. Deductions: the River results are still fake-looking (N1), and one Akropolis run fell 326 m behind (N4). | Fix #6 |
| 6 | Builder | **5** | 5 | 0 | Not re-judged. | – |
| 7 | Garage | **5** | 5 | 0 | 153 tiles, 156 cards, 0 small text. Nothing to earn. | – |
| 8 | Vehicle transform | **7** | 6 | +1 | `xf1/grass`, `xf1/water` and `xf1/assist` are **all green** on the built page (r10 N1 fixed by r10c). River race vehicles: car, boat and off-road. | – |
| 9 | Traffic / pedestrians | **6** | 6 | 0 | Athens 78 cars (20 → 26 near), Frankfurt 75 (21 → 28). `life1/*` PASS. There are white blocky objects on the Athens carriageway after a race (N3). | – |
| 10 | HUD / menus | **7** | 7 | 0 | The race HUD is clean at 852. The roam pill is 1 line with the distance. | – |
| 11 | Performance / memory | **6** | 5 | +1 | See the Performance section. Spike counts roughly halved to thirds everywhere. Medians dropped 3–5 ms. The remaining owner is `hubTrafficStep` (70–108 ms max). The Athens heap grows **+165 MB in 30 s** on desktop (r10 +126). | Fixes #1, #3 |
| 13 | World art | **7** | 7 | 0 | `ath_roam`: deep blue sky, brick clouds, pink and yellow blocks, palms, kerbside people, glossy red LEGO car. This reads as 2K. `fra_roam` is good but sparse: a park boulevard, with the car on the centre line at spawn. | – |
| 14 | Portrait | **6** | 6 | 0 | Not re-tested beyond the GO gate (`r9b/pill-gear` PASS). | – |

Mean: (7+6+5+8+5+5+7+6+7+6+7+6)/12 = 75/12 = **6.25, reported as 6.3**.

## r10 verification (built page `out/r11`)
**Gate:** `TAG=r10c,r9a,r9b,r9c,perf17,scale1,phone2,boot,life1,xf1,terrain` gives **62/62 PASS, 0 page errors** (r10 57/61). GO boots: Frankfurt 27.5 s, Athens 35.7 s.

| r10 # | item | fix | verdict | evidence |
|---|---|---|---|---|
| TOP-1 | Athens first-10-s stutter (`roamStep-self`) | perf-r10a `9bfe213`, boot-4 `94929fa` | ✅ mostly | It was a misattribution: it is `hubTrafficStep-self` now. Athens tBoot, JS frames over 50 ms: **47 → 11**. Frames over 33 ms in s0–s5: **115 → 40**. The target was ≤ 30, so this is not quite met; the target of whole-minute JS > 50 ms ≤ 20 is met. The 0–5 s median is still 20.2 ms. |
| TOP-2 | Slice `hubCullStep` every tick, split `hubTrafficStep` | perf-r10b `39f46ae` | ✅ cull / ⚠️ traffic | `hubCullStep` max in tFrame Athens: 53 → **6–21 ms** (desktop and touch). `hubTrafficStep` max is still **82 ms** (Athens desktop), **108 ms** (Frankfurt) and **70 ms** (Athens touch), against a target under 30. tFrame n>50: Athens **24 → 9** (target ≤ 12 ✅), Frankfurt **16 → 8** (target ≤ 8 ✅). |
| TOP-3 | xf1 regression (N1) | r10c `116572e` | ✅ | `xf1/grass`, `xf1/water` and `xf1/assist` PASS. |
| TOP-4 | River Run HUD / ETAs / pack5#2 | r10c `acfcb85` | ✅ / ⚠️ | `r10c/river-hud` PASS and `r9a/pack5#2` PASS. The results show 4 rival times that are distinct, but **exactly 0.10 s apart** (~02:58.14 / .24 / .34 / .44). That still reads as fake (N1). |
| TOP-5 | Pack start reliability, warm page (N4) | – | ❌ not done | No `r9a/pack5-warm` GO. 1 of 2 Akropolis runs in a fresh page fell **326 m behind** at the 100 s mark (5th, 50 km/h) and still won in 127.7 s. The other run won in 106.5 s with 11 lead changes. |
| TOP-6 | Athens heap growth | boot-4 / perf-r10a (partly) | ⚠️ | tBoot heap: Athens 598 → 735 → 740 MB, i.e. **4.6 MB/s for 0–30 s, then 0.16 MB/s**, so it is streaming that is retained, not garbage. tFrame desktop q=high, Athens 30 s: **733 → 898 MB (+165)**, against a target under 40 MB. A 190 ms frame (f132) is almost all `roamStep` with no sub work, which is a GC signature. |
| N1 | xf1 red | r10c | ✅ | see TOP-3 |
| N2 | River HUD vanishes | r10c | ✅ | The r10 shot was taken after the finish. `river_bot_1` again shows the car coasting onto a hillside **after** the finish, which is cosmetic. |
| N3 | Identical River ETAs | r10c | ⚠️ | see TOP-4 |
| N4 | Pack variance | – | ❌ | see TOP-5 |
| N5 | `TICKERR Cannot set properties of null (setting '0')` | – | ❌ | Still once in the Athens touch first minute. |
| N6 | Graphics Auto never climbs; no beacon data | – | ⚠️ | Frankfurt climbs once at 59 s to 0.85. **Athens `gov=[]`** stays at 0.7 / min. The Beta artifact's `perf` collection is **still empty** (checked today), so there are still no real-phone numbers. |
| boot-4 | first-minute allocation | `94929fa` | ✅ | Frankfurt tBoot n50: 33 → 11 |
| people-2 | standing-start swerve | `a72b520` | ✅ | `life1/people` and `life1/smash` PASS. No swerve-related fail in xf1 (r10c fixed the side effect). |

## Performance (Alex's #1 complaint)
| run | Frankfurt r11 | Frankfurt r10 | Athens r11 | Athens r10 |
|---|---|---|---|---|
| tBoot touch, boot to drivable | **28 s** | 41 s | **43 s** | 45 s |
| tBoot 60 s, JS+render: median / p99 / max | 10.4 / 39 / 99 | 14.5 / 48 / 103 | 11.8 / 50 / 147 | 16.6 / 76 / 207 |
| frames > 50 ms (all / JS only) / > 150 ms | **11 / 5 / 0** | 33 / 8 / 0 | **38 / 11 / 0** | 133 / 47 / 5 |
| frames > 33 ms (whole minute) | 56 | – | 150 | – |
| 0–5 s median frame | 16.3 ms | – | **20.2 ms** | – |
| owners of frames > 33 ms | render 35, hubTrafficStep-self 16, roamStep-self 3 | – | render 102, **hubTrafficStep-self 26**, roamStep-self 11, roamCam 6, prog link 3, DEST_find 2 | – |
| Graphics Auto over 60 s | 0.7 → 0.85 at 59 s | stays 0.7 | **stays 0.7 / min** | stays 0.7 |
| tFrame 30 s desktop q=high: JS median / p95 / p99 / max, n > 50 | 11.3 / 24.3 / 39.1 / 135, **8** | 14.6 / 29.8 / 47.7 / 113, 16 | 10.5 / 24.7 / 37.6 / 190, **9** | 16.5 / 34.1 / 69.4 / 232, 24 |
| tFrame frames with JS > 16 ms | 343 / 1800 (19 %) | – | 359 / 1800 (20 %) | – |
| tFrame top sub max | hubTrafficStep 108, LV_step 61, lazyStep 50, FC_pull 29 | – | hubTrafficStep 82, pedStep 42, lazyStep 30, FC_pull 25 | hubCull 53, hubTraffic 131 |
| tFrame Athens **touch** (`TOUCH=1`) | – | – | median 12.6, p99 36.8, max 103, **n50 5**, **n16 555 / 1800 (31 %)**; 387 calls, 1.11 M tris | (r10b: 14 / max 131) |
| draw calls / tris / programs (desktop) | 784 / 3.84 M / 203 | 781 / 3.85 M / 202 | 984 / 3.05 M / 211 | 975 / 2.97 M / 206 |
| heap over 30 s (desktop) | 623 → 780 MB | 622 → 768 | **733 → 898 MB** | 739 → 865 |

My verdict: this is a real, measurable improvement, and the spikes Alex feels as "lag" are 2–4× rarer. What remains:
- **Hitches:** one 70–110 ms `hubTrafficStep` frame every few seconds. Its sub-helpers explain ≤ 12 ms; the rest is `-self`, probably GC.
- **Base load:** JS alone exceeds 16 ms on 20–31 % of frames, so a phone cannot hold 60 fps even before the GPU.
- **Athens on touch:** it never leaves render scale 0.7 / quality min, so the phone image stays soft.

## Races with the pack (bot with 150 ms lag)
| race | place / time | lead changes vs nemesis | place changes | nearest rival median | s within 30 m | gap vs nemesis (ahead / behind) | placeTrace (every 10 s) |
|---|---|---|---|---|---|---|---|
| Akropolis run 1 (trunk tool) | 1st / 127.7 s | 9 | – | – | – | +72 / **−326** m | (5th at 100 s, 50 km/h, `akropolis_bot_0`) |
| Akropolis run 2 | 1st / 106.5 s | 11 | 25 | 11 m | 93 / 102 | +70 / −146 m | 45554324341 |
| Westend | 1st / 128.2 s | 11 | 25 | **7 m** | 108 / 123 | +85 / −52 m | 3313333142311 |
| Main River Run | 1st / 174 s | 4 | 20 | 13 m | 131 / 167 | +10 / −167 m | 34332555544445543 |
| Grand Prix | 1st / 91.6 s | 2 | 25 | **6 m** | 85 / 88 | +38 / −96 m | 345451455 |

Hands-off runs: Akropolis and Westend both DNF with place null ✅. JS errors in races: 0.

## New bugs
| # | sev | bug | repro |
|---|---|---|---|
| N1 | Low–Med | **River results still look fake.** The 4 rivals finish at ~02:58.14, .24, .34 and .44, exactly 0.10 s apart and all 4.1 s behind the player. Meanwhile the placeTrace had the player 3rd about 10 s before the finish and 5th for 50 s mid-race. The ETAs ignore the real spread of the pack. | `node tools/tRv2k2_pack.js <url> out fra`, then look at `river_bot_2.jpg` |
| N2 | Low | **Trunk `tools/tRv2k2.js` lost the pack fields** (`rivals`, `placeChanges`, `placeTrace`, `nearMed`, `secsWithin30m`). Restored as `tools/tRv2k2_pack.js` on this branch. | diff against `origin/alex/rev10:tools/tRv2k2.js` |
| N3 | Low–Med (needs triage) | **White blocky objects stand on the Athens carriageway** after a race (`akropolis_bot_1.jpg`: two white upright shapes in the lanes, next to normal traffic). They are either untextured or unloaded models, or people or bins placed on the road. | `node tools/tRv2k2.js <url> out ath`, then look at `akropolis_bot_1.jpg` |
| N4 | Low–Med | **Pack variance (r10 N4) persists:** in 1 of 2 Akropolis runs the bot was 5th and 326 m behind at 100 s, at 50 km/h. It still won, which also suggests the rubber band is strong at the end. | run `tRv2k2 … ath` twice |
| N5 | Low | `TICKERR Cannot set properties of null (setting '0')` once in the Athens touch first minute (r10 N5, unchanged). | `CITY=ath node tools/perf1/tBoot.js out r11 \| grep TICKERR` |
| N6 | Med (perf) | **Athens touch never steps up from scale 0.7 / quality min** in 60 s (`gov=[]`). Frankfurt steps once at 59 s. There is still no device data in `perf`. | tBoot `PF1 city=ath … gov=[]` |

## TOP 6 fixes (ranked by score gain per effort; each is ONE ~30 min fixer task)
| rank | fix | files | GO assert | gain |
|---|---|---|---|---|
| 1 | **Kill the `hubTrafficStep-self` hitch.** Wrap `HT_*` and `LV_step` / `pedStep` in tBoot (`WRAP=HT_cars,HT_pose,HT_next,HT_hit,HT_flush,LV_step,pedStep`) and run `HEAP=1`. The 70–108 ms frames have ≤ 12 ms in helpers, so the self time is allocation and GC in the car loop or its closures (`CV_near` closure per car per frame, `L3_space`/`L3_stop` arrays). Pool or hoist them. | `src/70_roam_world.js` (`hubTrafficStep`, `HT_*`), the CV / L3 owners | `perf/traffic-hitch`: tFrame `TOUCH=1 CITY=ath SECS=30`: `hubTrafficStep` max < 35 ms, n > 50 ≤ 2 (now 5), frames with JS > 16 ms ≤ 400 (now 555); Frankfurt desktop `hubTrafficStep` max < 40 (now 108) | Perf 6→7, Driving feel |
| 2 | **Athens first 5 s.** Move the f59 render+program link (the late shader) into the loader warm (`98bp_warmall`), pre-run `roamCam`'s first-frame setup (96 ms at f3) and the first `hubTrafficStep` (77 ms at f25) before the curtain lifts. | `src/98bp_warmall.js`, `src/98bo_boot1.js`, roamCam owner | `perf/ath-first5`: tBoot Athens touch: 0–5 s median ≤ 16 ms (now 20.2), frames > 50 ms in s0–s5 ≤ 2, no `render+prog` frame after the curtain | First 60 s 7→8 |
| 3 | **Athens retained heap (+137 MB in 30 s of streaming).** Use `tools/perf1/heapOwner.js` on Athens roam. Dispose or share the per-tile geometry and materials that `lazyStep` / LDS keep, and cap retained tiles on touch. | `src/70_roam_world.js` lazy tiles, LDS owner | `perf/ath-heap`: tBoot Athens heap 0–30 s ≤ 2.5 MB/s (now 4.6); tFrame Athens desktop heap Δ < 80 MB (now 165), jsMax < 120 (now 190) | Perf, phone memory (iOS kills tabs over ~1.5 GB) |
| 4 | **Let Graphics Auto climb on touch when frames are good (N6).** Use the render+JS frame p75, not the JS p90 ≥ 14 ms that blocks Athens. Also verify the `perf` beacon actually writes from the published Beta artifact (the collection is empty after many sessions): check the db capability and the write path. | `src/9x_gov` (GOV_step), the phone-2 beacon | `scale1/gov-climb`: simulated frames at 12 ms JS → scale ≥ 0.85 within 20 s; `phone2/beacon-write`: with a stub `window.claude` db, one `perf` doc is written within 65 s | Phone image quality, and real data for the next review |
| 5 | **N3 white road objects + N5 TICKERR.** Find what the white shapes are (log the mesh names within 3 m of the lane centre in Athens) and keep them off the carriageway or give them their material. Catch the null-setter with a stack. | the spawner of those objects (people / props), the rAF owner | `life1/no-road-props`: 0 non-vehicle meshes within 2 m of a lane centre in a 200 m Athens radius; tBoot Athens 0 TICKERR | Traffic / world art polish |
| 6 | **River ETAs from the real pack + pack start variance.** Rival finish ETA = gap in metres / own pace, with ≥ 0.5 s spread when the gaps differ; damp the end-of-race rubber band. Add `r9a/pack5-warm` (Akropolis twice in one page). | `src/98tk_city_duel.js` | `race/eta-real`: River results, the rivals' times differ by the gap ±20 % and no 2 adjacent deltas are equal; `r9a/pack5-warm`: both runs ≥ 3 lead changes, the player bot never > 200 m behind | Races 8→8.5 |

Not ranked: start the Frankfurt car in its lane, not on the yellow centre line (`fra_roam.jpg`).

## Raw (r11)
| what | Athens | Frankfurt |
|---|---|---|
| Boot (tRv2k2 `s`) | 51.5–53.9 s | 38 s |
| Life | 78 cars, 20 → 26 near | 75 cars, 21 → 28 near |
| Road-follow 30 s | 125 km/h, 0 hits, min HP 96 | 136 km/h, 0 hits, min HP 96 |
| Garage | – | 153 tiles, 156 cards, 0 small text |
| JS errors | 0 (1 TICKERR in tBoot) | 0 |
| GO gate | 62/62 | |
