# Strict review #17: Mainhattan Overdrive trunk (od-int2 `eca2a25`, live v90m-beta.128) vs LEGO 2K Drive

Reviewer session rev17, 2026-10-20. Branch alex/rev17 = alex/rev16 + origin/alex/od-int2 (16 commits). `bash tools/build.sh rev17` gave BUILD_OK, a 3.32 MB split page. I measured on the built page `out/rev17`. Timebox 45 min (ran over: one PC tFrame takes 10 min here).

**Method and box.** Every probe ran SOLO and in the foreground. **This box is faster than r16's** (touch median frame 11.6 ms vs 17.6). So I rebuilt the r16 trunk (`origin/alex/rev16`) and ran the same Athens probe on it, on this box, as a **same-box baseline**. Compare r17 against that column, not against the absolute numbers in REVIEW_2K_16.

## Measured (solo, 60 game seconds each)
| run | boot | frames > 50 ms (JS-owned) | max frame ms (owner) | other |
|---|---|---|---|---|
| tBoot Athens touch `lowmem=1`, **r16 trunk, same box** | 47 s | 78 (JS 18), first 30 s: 48 (JS 12) | **146** (f2985 roamStep-self 137) | med 11.6, p99 62.7, n33 169; owners: render 59, hubTrafficStep-self 16; f0–119: f83 63 / f84 **90** hubTrafficStep |
| tBoot Athens touch `lowmem=1`, **r17** | 52 s | 65 (JS 18), first 30 s: 42 (JS 9) | **149** render (f2459, r 93); JS max **108** (f1000: roamStep 97 = hubTrafficStep 87 + hubCullStep 25 + LV_step 33) | med 11.8, p99 57.0, n33 173; owners: render 47, hubTrafficStep-self 15; f0–119: f56 **78** (hubTrafficStep 48), f60 65, f84 57; PF1HT f0–60 max 48 (r16 16); LAZY max 16.7; heap 552 > 570 > 561 MB |
| tBoot Frankfurt touch `lowmem=1`, r17 | 35 s | **6** (JS 3), first 30 s: 5 | **79** (f78 hubTrafficStep 44, roamHud 16) | med 10.8, p99 35.2, n33 52; **roamCam max 13** (r16 143); heap 339 > 423 > 428 MB (+84 MB in the first 30 s) |
| tFrame Frankfurt PC q=high, r17 | 37 s | JS **9**/3600, n16 602 | **73** (f1402: roamStep 66 = hubTrafficStep 53 + LV_step 34) | JS med 10.4, p95 23.6, p99 36.9; `PF1LINK afterReady 4`, afterGate 7, gateEnd 215; `PF1GATE 0`; heap **546 → 747 MB (+201)** |
| tFrame Frankfurt PC: boot long tasks | – | – | `PF1BOOTLT` max **2.58 s** (`frame 1 menu`), then 2.57, 2.28, 2.14 (`boot` toMenu/warmTex), 1.75 (bhs `props`) | `xc 99c6_rv4a` is gone from the list; `ld 8` now 1.35 s (r16 6.30 s on a 2× slower box). PF1BHS max 1749 ms `props`, 1503 `start`, 1353 `kerb`, 1114 `preBlocks` |
| tFrame Athens PC q=high | – | – | **not measured** (10 min per run; timebox) | – |
| GO perf/ios-mem (tChkGo, built page) | – | – | – | **fra**: ready GPU 216 MB, heap **485 MB**; 30 s GPU 226, heap **597 MB**; rotate GPU +0, heap +11, builds none. **ath**: ready GPU 222, heap **686 MB**; 30 s GPU 236, heap **763 MB**; rotate GPU +4.8, heap −2, builds none. Budget (info only until `?iosmem=1`): GPU ≤ 500, **heap ≤ 250** |
| GO perf/fc-first | – | – | – | PASS fra 23.8 ms (≤ 30), ath 6.4 ms |
| GO perf/pc-shrink | – | – | – | FAIL both: "needs the touch/lowmem tier (?lowmem=1)": tChkGo does not boot that tier, so the GO cannot run in the suite (harness gap, not a code verdict) |
| unit, `TAG=life1,xf1,terrain`, perf/beacon-boot | – | – | not run (reviewer; timebox) | – |

## Screen fit (one shot each, I looked at all four)
Shots: `docs/shots/rev17/{phoneL_852x393,phoneP_393x852,tablet_1366x1024,pc_1920x1080}.jpg` (touch ones `lowmem=1`, 6 s after drivable). A DOM pass on each found **no visible text under 12 px and no clipped HUD text** on any size.
| screen | verdict | notes |
|---|---|---|
| 852×393 landscape (Frankfurt) | ✅ fit | HUD top-left/top-centre, controls in the bottom corners, nothing overlaps. Still: **tall yellow building behind ⏸ and the minimap** (4th review), and the road ahead is empty for ~150 m apart from 2 far cars. |
| 393×852 portrait (Athens) | ✅ fit | Minimap, speed and quest pill stack in the top half; arrows/BRAKE/GAS/BOOST at the bottom; no overlap. The car fills ~⅓ of the height: fine. Road ahead empty. |
| 1366×1024 tablet (Athens) | ⚠️ minor | No HUD over controls, but the speed readout "0 KM/H" and the boost bar sit **on top of the player car** (centre-bottom), and the controls look small for a 10" screen. Lively facades, palms, a market crowd: very 2K. |
| 1920×1080 PC (Frankfurt) | ✅ fit | Minimap bottom-left, speed bottom-right, quest pill top-centre. A red bus ahead, crowds, brick clouds: the best-looking shot. |

## Verify "landed since r16"
| claim | verdict | measured |
|---|---|---|
| beta.127 perf beacon (boot / killed / freeze docs) | **not measured** | GO perf/beacon-boot not run. |
| beta.128 rotate rebuilds nothing | ✅ | ios-mem GO: builds none, GPU +0 / +4.8 MB, heap +11 / −2 MB on rotate. |
| beta.128 lean player chunks (GO chunks on demand) | ✅ | `xc 99c6_rv4a` (6.44 s in r16) is gone from PF1BOOTLT; the top xc eval is now `52f_terr_fra` 1.31 s. |
| beta.128 sliced ground (ld 8 in ~250 ms slices) | ⚠️ partly | `ld 8` is still one **1.35 s** long task on PC (r16 6.30 s on a ~2× slower box, so roughly −60 % normalized); the slices are not ≤ 250 ms on this path. |
| FC_pull first-pass fix 253e140 | ✅ | Frankfurt touch roamCam max **13 ms** (r16 143); PC Frankfurt roamCam not in the long list; GO fc-first 23.8 ms ≤ 30. |
| PC instance shrink e03bdb0 (ath −45 MB) | **not verified** | perf/pc-shrink cannot run under tChkGo (needs lowmem tier). ios-mem in that page shows Athens heap 686 MB at ready. |
| bhs partial 2e03f86 (35 ms slices), still default OFF | noted | Not A/B'd. With bhs OFF the bhs steps still cost 1.0–1.75 s each (`props`, `start`, `kerb`, `preBlocks`). |

## Re-check of r16 findings
| r16 | item | verdict | measured |
|---|---|---|---|
| N1 | Frankfurt roamCam/FC_pull 143 ms in the first 2 s | ✅ **fixed** | Touch roamCam max 13 ms, first 30 s has 5 frames > 50 ms (3 JS). |
| N2 | Athens touch hubTrafficStep 95 ms on f9–f11 | ⚠️ **moved, not gone** | Same box: r16 f84 90 ms → r17 f56 78 ms (hubTrafficStep 48), f60 65. PF1HT f0–60 max went **16 → 48** (TWG.ht = 31 claims a gate). JS long frames 18 = 18; max JS 146 → 108. |
| N3 | PC boot long tasks > 3 s | ✅ **fixed** (Frankfurt) | PF1BOOTLT max 2.58 s on this box. |
| N4 | hubTrafficStep top JS owner everywhere | ❌ **same** | It is the owner of every JS long frame on all three profiles (ath touch 15 frames, f1000 87 ms; PC fra f1402 53 ms). |
| N5 | Frankfurt empty road ahead + building behind ⏸/minimap | ❌ **not fixed** | Same in the 852×393 shot. Athens portrait/tablet: road ahead empty too. |
| N6 | 30 s retained heap not measured | ⚠️ measured via ios-mem | Touch heap is **2–3× the 250 MB budget** (fra 485 → 597, ath 686 → 763 MB in 30 s). |

## Score: **7.6 / 10** (r16 7.2)
Frankfurt is now smooth on touch (6 long frames in a minute, max 79 ms) and PC (9 JS long frames, max 73 ms, 4 late links, boot tasks under 3 s), and the UI fits every screen I tried with no small or clipped text. It is not an 8 because Athens touch still hitches in the first second (f56 78 ms) and keeps 15 hubTrafficStep long frames per minute, the touch heap is 485–763 MB against a 250 MB iPhone budget (the likely cause of iOS kills), and the start road is still empty in both cities, which 2K never is.

## Top 5 fixes (biggest score gain first)
1. **Touch heap 2–3× over budget** (iPhone kills = "freezes"). Owner: heap owner table (ios-r17g: ath 599 / fra 406 MB snapshot), `MEM_GPU`/ios-mem in `src/99c7_rev5fix.js`, PC shrink (e03bdb0) and the per-city geometry. Pass: GO perf/ios-mem with `?iosmem=1` → heap at ready ≤ 400 MB fra / ≤ 450 MB ath and ≤ +30 MB over 30 s; then flip `iosmem` asserts ON. Also make tChkGo boot `lowmem=1` for perf/pc-shrink so it runs.
2. **Athens touch hubTrafficStep** (15 JS frames > 50 ms, f1000 87 ms, f56 48 ms in the gated window). Owner: `hubTrafficStep` in `src/70_roam_world.js` (spawn/recycle wave), plus `LV_step`/`hubCullStep` on the same frames. Pass: `CITY=ath QS=lowmem=1 SECS=60 node tools/perf1/tBoot.js out <v>` → `jsn50 ≤ 5`, JS max ≤ 60, `PF1HT f0-60 max ≤ 20`.
3. **Live start road** (4th review). Owner: start spawn in `src/70_roam_world.js` + Frankfurt start pose/yaw. Pass: a GO that asserts ≥ 2 traffic cars in the player's road 40–120 m ahead at `__tq.drv`, both cities, and the 852×393 shot shows no building behind ⏸/minimap.
4. **Athens touch render-owned long frames** (47 of 65; governor ends at `q:min` in both cities). Owner: lowmem render tier / `GOV_step`, draw-call count in Athens. Pass: tBoot ath `PF1OWN>50 render ≤ 20` and `gov.end q` above `min`.
5. **PC heap growth +201 MB in 60 s and 1–1.75 s bhs/`ld 8` boot tasks.** Owner: `buildHubG` steps (`props`, `start`, `kerb`, `preBlocks`), A/B `bhs` (2e03f86) SOLO; heap sampler on tFrame (`HEAP=ret`). Pass: `PF1BOOTLT` max < 1.5 s and tFrame fra heap1 − heap0 ≤ +100 MB. (Minor, same lane: tablet speed readout over the car.)
