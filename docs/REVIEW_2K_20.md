# Strict review #20: Mainhattan Overdrive trunk (od-int2 `753d9bb`, v90m-beta.133) vs LEGO 2K Drive

Reviewer session rev20, 2026-10-20. Branch alex/rev20 = alex/rev19 + origin/alex/od-int2 (head `ab780f9`, which only adds the docs-only ios-r18n handoff after `753d9bb`). `bash tools/build.sh rev20` gave BUILD_OK, a 3.35 MB split page. I measured on the built page `out/rev20`, every probe SOLO and in the foreground, one city at a time. Unit: 5043 assertions, **0 FAIL**.

**Box.** This box is again faster than the last one: touch median frame **7.6 / 8.1 ms** (r19 12.4 / 11.8), so it is **~1.5× faster than r19's box**. Read every "gain" against that. The JS-owned counts, the GO lines that use game frames, and the heap numbers are the fairer signal. tBoot renders only every 30th frame in software GL, so "render"-owned long frames are mostly this box.

## Measured (solo)
| run | boot | frames > 50 ms (JS-owned) | max frame ms (owner) | other |
|---|---|---|---|---|
| tBoot Frankfurt touch `lowmem=1`, 60 s | 31 s | **0 (jsn50 0)** (r19 5 / 2) | 40 (s4, render); JS max 39 | med 7.6, p99 27.1, n150 0; **PF1JS120 f0–f119 max 30 (f65 hubTrafficStep), n > 50 = 0** ✅; PF1HT f0–60 max 17; PF1MAX roamStep 36, hubTrafficStep 30, hubCullStep 20; LAZY max 18.7; minimap max 4.3 ms; heap 306 > 373 > 395 MB. ⚠️ **2× `TICKERR Cannot read properties of null (reading 'byteLength')`** between s50 and s60 (an rAF callback threw) |
| tBoot Athens touch `lowmem=1`, 60 s | 38 s | **9 (jsn50 4)** (r19 62 / 13) | **180 (f1619, 27 s, render+prog1: a first-use shader link mid-roam)**; JS max 60 (f2741 hubTrafficStep 35) | med 8.1, p99 38.0, n150 1; **PF1JS120 f0–f119 max 37, n > 50 = 0** ✅; PF1HT f0–60 max 10 ✅; f3239 (54 s) 117 ms (render 60 + hubTrafficStep 40 + roamStep 53); 2 gc/other 56–57 ms (f2155, f2360); minimap max 2.2 ms (r19 miniDraw 49) ✅; heap 539 > 566 > 488 MB |
| GO perf/touch-first-frames (`lowmem=1`) | fra 32 s | – | – | ✅ both. **Curtain fra 3610 ms, ath 3664 ms** (r19 4.6 / 4.7 s); JS max f0–f119 fra 37 / ath 49 ms (ath at f1, 1 ms under the line); hubTrafficStep f0–60 20 / 24 ms; minimap 0 / 167 tiles under the curtain (95 ms) |
| GO perf/ios-mem (`lowmem=1`) | – | – | – | **fra ✅**: ready heap 378 (**device-like 337**, r19 347), +30 s 396 (**+18** ✅), GPU 171 → 180 MB. **ath ❌**: ready heap 529 (**device-like 507**, r19 511), +30 s 565 (**+36 > +30 ❌**, r19 +22), GPU 144 → 163 MB. Rotate: builds none both. tstream 0 (still OFF) |
| GO r17/start-life (`lowmem=1`) | – | – | – | fra ✅ 97 % open, 11 cars in frustum. **ath ✅ solo** (96 % open, 20 cars) **but ❌ when run after perf/ios-mem in the same page** (73 % open, 2 cars): the GO reset does not restore the start pose after a 30 s roam, so the GO is order-dependent |
| GO ui/hud-clear, perf/minimap2, perf/soa-1 (`lowmem=1`) | – | – | – | ✅ all, both cities. minimap2: 99.5 / 99.7 % pixels match v1, draw max 18.5 / 11.4 ms. soa-1: fra 40.6k / ath 112k prop rows, columns 2.5 / 10 MB |
| GO perf/pc-post-ready-link (desktop, solo per city) | fra 29 s, ath 47 s | – | – | ✅ **0 / 0 late links** (131 / 134 programs) |
| GO perf/pc-boot-lt (desktop) | – | – | – | ✅ (bhs OFF, info): fra longest link 38 ms, buildHubG step 1204 ms, longest boot task 8747 ms (roamPost + render1, software GL), 1 > 2 s. **ath longest link 34 ms** (r19 1798 ✅), but **buildHubG step 4902 ms**, **longest boot task 18681 ms (roamPost)**, **4 tasks > 2 s** |
| GO perf/pc-roam-30s, fc-first, fc-grid, pc-heap-60s (desktop) | – | – | – | ✅ all. fc-first **fra 2.7 ms / ath 4.3 ms** (r19 24.5 / 4.7); fc-grid typed arrays only, 0.2 MB; BK eviction on (fra 8794 cells, 19630 evicted), ground packing on |
| tPcHeap desktop, **60 s** driven roam (render stubbed) | fra 35 s | fra 1 (max 50) / ath 0 (max 50) (r19 30 s: 6 / 16, max 180) ✅ | – | heap **fra 511 → 641 (30 s, +130) → 658 (60 s, +147)**, **ath 653 → 792 (30 s, +139) → 795 (60 s, +142)**. r19 30 s: +166 / +144. Growth flattens after 30 s in both cities, but the first 10 s add +86 / +113 MB |
| tFrame PC, `TAG=life1,xf1,terrain` | – | – | not run | reviewer; timebox |

## Screen fit (one shot each, I looked at all four)
Shots: `docs/shots/rev20/{phoneL_852x393,phoneP_393x852,tablet_1366x1024,pc_1920x1080}.jpg` (touch ones `lowmem=1`, 6 s after ready). DOM pass: **0 visible text nodes under 12 px, 0 clipped** on every size; `__hudClear()` bad = [] on every size.
| screen | verdict | notes |
|---|---|---|
| 852×393 landscape (Frankfurt) | ✅ fit | **Speed + boost bar moved to the top right**, clear of the car and of BOOST/GAS. Open sky top-left behind ⏸/minimap, brick clouds, market stall left, road ahead with 2–3 small cars. The big red-orange tree canopy still fills the right edge behind ⚙ / EXIT / BOOST. |
| 393×852 portrait (Athens) | ⚠️ fit, minor | HUD stacked top-left, controls bottom, no overlap. **The car is too big**: it spans 441 px of a 393 px width (rect −23…418) and fills a third of the screen, so the road ahead is a thin band. No car visible ahead on the road. |
| 1366×1024 tablet (Athens) | ✅ fit | **Fixed** (r17–r19 ❌): "0 KM/H" + bar top right, nothing on the car. Best shot of the four: pink/ochre balconied facades, palms, crowd and stall right, smash pile on the road, one taxi ahead. |
| 1920×1080 PC (Frankfurt) | ✅ fit | Minimap bottom-left, speed bottom-right, quest top-centre. Deep blue sky, brick clouds, food stalls, minifig queue, balloon seller, wrench pickup ring. Cars ahead are tiny (2–3 at ~150 m). The red canopy at the right edge is cut by the frame. |

## Verify rev19's top 5
| r19 # | item | verdict | measured |
|---|---|---|---|
| 1 | Athens mid-minute hitches: `jsn50 ≤ 5`, JS max ≤ 60, PF1MAX miniDraw ≤ 15 | ✅ **3 of 3** (box caveat) | jsn50 **13 → 4**, JS max **147 → 60**, miniDraw max **49 → ≤ 5** (mm2 max 2.2 ms). The box is ~1.5× faster, so the hubTrafficStep part is not proven fixed: `?rcbud=1` (hubRecycle spread) is still OFF, and hubTrafficStep still owns 35–40 ms frames at f2741 / f3239. The minimap fix is real (minimap v2, no per-frame alloc). |
| 2 | Athens touch heap ≤ 450 device-like (fra ≤ 350), growth ≤ +30 | ❌ ath / ✅ fra | ath device-like **511 → 507** (soa-1 saved ~15 MB of the claimed 17), **growth +36 ❌** (r19 +22). fra device-like **347 → 337 ✅**, +18 ✅. tstream still OFF, `?iosmem=1` asserts still info. |
| 3 | Speed + boost bar on the car | ✅ | GO ui/hud-clear PASS at all 4 sizes both cities; seen in all 4 shots. |
| 4 | PC heap growth ≤ +60 / 30 s, Athens PC > 50 ms frames ≤ 5, Athens boot task < 2 s | ⚠️ **1 of 3** | > 50 ms frames ath **16 → 0 ✅**. Growth 30 s fra **+166 → +130**, ath **+144 → +139** ❌ (≤ +60; `?lfr=500` still OFF). Athens buildHubG step **5962 → 4902 ms**, longest boot task **18.7 s** ❌ (bhs OFF). |
| 5 | Athens start view ≥ 90 % open, ≥ 2 cars | ✅ solo / ⚠️ GO order | Solo 96 % open, 20 cars in frustum ✅. After a 30 s roam in the same page the GO reads 73 % / 2 cars: the GO is order-dependent (fix the reset, not the pose). |

## What landed in beta.132–133
| claim | verdict | measured |
|---|---|---|
| HUD clear: speed + boost off the car and controls (97138b1) | ✅ | hud-clear PASS 4 sizes × 2 cities; 0 text < 12 px, 0 clipped. |
| Props columns, soa-1 (6867809): ath ready 531 → 514, fra 389 → 374 | ✅ (small) | ath ready heap 529 test-page / 507 device-like; fra 378 / 337. ~15 MB saved in Athens, as ios-r18d predicted (≤ 30–35). Not the heap fix. |
| PC BK eviction + ground packing (7431bb1): 60 s growth fra +115 / ath +80 with `?lfr=500` | ⚠️ default path only partly | Default (lfr OFF) 60 s: fra **+147**, ath **+142**. The claimed numbers need `?lfr=500`, which is still OFF. |
| Camera-pull grid in typed arrays (3a06942) | ✅ | fc-first fra 2.7 / ath 4.3 ms (≤ 30), fc-grid PASS, 0.2 MB. |
| Minimap v2 (38158b4) | ✅ | touch draw max 4.3 / 2.2 ms in tBoot (r19 miniDraw 49 + miniPaint 37), 99.5 % pixel match. |
| Athens start pose + 5 seeded cars (4a7e6c1) | ✅ solo | 96 % open, 5 seeded, 20 in frustum. GO order dependency noted above. |

## Score: **8.0 / 10** (r19 7.9)
The first minute is now clean in both cities on touch: zero JS frames over 50 ms in the first 2 s, Frankfurt has **zero** frames over 50 ms in a whole minute, the curtain is ~3.6 s, the minimap hitch is gone, and the speed readout is finally off the car on every screen. PC has 0 late links and almost no long roam frames. It looks like 2K Drive on tablet and PC. It is an 8 and not more because: part of the gain is a ~1.5× faster box; **Athens touch has a 180 ms first-use shader link at 27 s** (an iPhone will feel that) plus 117 ms at 54 s; **Athens heap is still ~507 MB device-like** (about 2× a safe iPhone budget, so a crash risk, and its 30 s growth now fails its own GO at +36); PC heap still grows ~+140 MB in the first minute; the Athens PC boot has an 18.7 s long task; a `byteLength` of null is thrown in Frankfurt's rAF at ~55 s; the portrait car is too big.

## Top 5 fixes (biggest score gain first)
1. **Athens touch mid-roam shader link (180 ms at f1619) + late 117 ms frame.** Owner: the touch warm gate prewarm list in `src/99c7_rev5fix.js` (TWG) / the material that links at f1619. Find it with `CITY=ath QS=lowmem=1 SECS=60 PROGS=1 node tools/perf1/tBoot.js out <v>` (prints `PF1MAT`). Pass: same run → `n150 0`, no `render+prog` owner after the gate, max frame ≤ 80 ms, jsn50 ≤ 4.
2. **Athens touch heap + growth.** Owner: tstream (`?tstream=1`, default OFF) and ios-mem in `src/99c7_rev5fix.js`; growth owner from `HEAP=ret` tBoot. Pass: GO perf/ios-mem `?lowmem=1` → ath device-like ready ≤ 450 MB, growth ≤ +30 (now 507, +36 ❌); then flip tstream and the `?iosmem=1` asserts ON.
3. **Frankfurt rAF throws `Cannot read properties of null (reading 'byteLength')` at ~55 s.** Owner: unknown; suspects are the freed-geometry paths (BK eviction / ground packing, `src/assets/as/code.js` ASSET.ag, 7431bb1). Pass: `CITY=fra QS=lowmem=1 SECS=60 node tools/perf1/tBoot.js out <v>` and the desktop tPcHeap 60 s run → 0 `TICKERR` lines; add a GO that counts rAF exceptions over 60 s (= 0).
4. **PC heap growth + Athens PC boot task.** Owner: `src/98lf_lively_fill.js` (`?lfr=500` default OFF) and Athens `buildHubG` (bhs OFF, step 4.9 s, longest task 18.7 s). Pass: `CITY=ath SECS=60 node tools/perf1/tPcHeap.js out <v>` → growth ≤ +60 MB at 60 s (now +142, fra +147); GO perf/pc-boot-lt-ath with `?bhs=1` → longest task < 2 s, then flip both ON.
5. **Portrait car size + GO order dependency.** Owner: touch portrait chase-cam distance/FOV in `roamCam` (car rect −23…418 at 393×852, wider than the screen); `r17/start-life` GO reset in `src/99c7_rev5fix.js` (restore the start pose before measuring). Pass: GO ui/hud-clear asserts car width ≤ 75 % of the viewport at 393×852; `CITY=ath TAG=perf/ios-mem,r17/start-life node tools/tChkGo.js "<url>?lowmem=1"` → both start-life PASS (now 73 % after ios-mem).
