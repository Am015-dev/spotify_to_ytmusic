# Strict review #19: Mainhattan Overdrive trunk (od-int2 `674f213`, v90m-beta.131) vs LEGO 2K Drive

Reviewer session rev19, 2026-10-20. Branch alex/rev19 = alex/rev18 + origin/alex/od-int2. `bash tools/build.sh rev19` gave BUILD_OK, a 3.34 MB split page. I measured on the built page `out/rev19`, every probe SOLO and in the foreground, one city at a time.

**Box.** This box is **~1.25× faster than r18's** (touch median frame 12.4 / 11.8 ms vs 14.9 / 15.8). I had no time for a same-box rerun of r18, so read the r18 numbers as an upper bound: part of each gain is the box. The JS-owned counts and the GO lines that use game frames are the fairer signal. tBoot renders only every 30th frame in software GL, so "render"-owned long frames are mostly this box.

## Measured (solo)
| run | boot | frames > 50 ms (JS-owned) | max frame ms (owner) | other |
|---|---|---|---|---|
| tBoot Frankfurt touch `lowmem=1`, 60 s | 47 s | **5 (jsn50 2)**; first 30 s: 3 (JS 2) | 74 (f1245 gc/other); JS-owned max 54 (f146 hubTrafficStep 27 + hubCullStep 18 + DEST_find 14) | med 12.4, p99 36.9, n150 0; **PF1JS120 f0–f119 max 40, n > 50 = 0** ✅; PF1HT f0–60 max 29; PF1MAX roamCam **18** (r18 25); LAZY max 27; heap 324 > 414 > 407 MB |
| tBoot Athens touch `lowmem=1`, 60 s | 46 s | 62 (**jsn50 13**); first 30 s: 38 (JS **6**) | **147** (f943 hubTrafficStep 97, hubCullStep 35, LV_step 34) | med 11.8, p99 59.4, n150 0; **PF1JS120 f0–f119 max 31, n > 50 = 0** ✅ (r18 121); PF1HT f0–60 max **19** ✅ (≤ 20); JS bursts at **f631 125**, **f941–943 95/86/147**, f1483 93, f2087 85, **f2236–2239 85/91/76 (miniDraw 49 + miniPaint 37)**, f2779–2780 77/89; heap 546 > 523 > 542 MB |
| GO perf/touch-first-frames (`lowmem=1`) | fra 34 s, ath ~37 s | – | – | ✅ both. **Curtain fra 4643 ms, ath 4711 ms** (≤ beta.130 + 0.5 s); JS max f0–f119 fra 38 ms / ath 28 ms; hubTrafficStep f0–60 19 / 10 ms; minimap 0 / 166 tiles under the curtain |
| GO perf/ios-mem (`lowmem=1`) | – | – | – | **fra**: ready heap 380 MB (**device-like 347**), +30 s 400 (+20 ✅ ≤ 30), GPU 167 → 176 MB. **ath**: ready heap **529** (**device-like 511**), +30 s 551 (+22 ✅), GPU 143 → 152 MB. Rotate: heap +8/+9, builds none. tstream 0 (still OFF) |
| GO perf/touch-render (`lowmem=1`) | – | – | – | ✅ both: wbLodRt 900, far cells beyond cap 0 (draw=0 page, so calls/tris read 0: the cap is checked, the draw saving is not) |
| GO r17/start-life (`lowmem=1`) | – | – | – | fra ✅ 3 seeded, **96 %** top-left open (start pose 77 → 96 %), 2 cars in frustum 40–120 m. **ath ❌ top-left open 75 % (< 80)**, 9 cars in frustum |
| GO perf/pc-post-ready-link (desktop, solo per city) | fra 37 s, ath 38 s | – | – | ✅ **0 / 0 late links** both cities (131 / 129 programs) |
| GO perf/pc-boot-lt (desktop) | – | – | – | ✅ (bhs OFF, info): fra longest link 36 ms, buildHubG step 1548 ms, **longest boot task 11170 ms** (ld 100 Ready + render1, software GL); **ath longest link 1798 ms (one MeshStandardMaterial), buildHubG `step props` 5962 ms**, 3 tasks > 2 s |
| GO perf/pc-roam-30s, perf/fc-first (desktop) | – | – | – | ✅ fra gate 8/8 warm frames (slowest 456 ms). fc-first **fra 24.5 ms ✅ (r18 37.7 ❌)**, ath 4.7 ms |
| tPcHeap desktop, 30 s driven roam (render stubbed) | fra 35 s | fra 6 (max 99) / **ath 16 (max 180)** | – | heap **fra 515 → 681 MB (+166)**, **ath 710 → 854 MB (+144)**; GO perf/pc-heap-60s is info only (fra 665 MB) |
| tFrame PC, unit, `TAG=life1,xf1,terrain` | – | – | not run | reviewer; timebox (tFrame closes the page on this box) |

## Screen fit (one shot each, I looked at all four)
Shots: `docs/shots/rev19/{phoneL_852x393,phoneP_393x852,tablet_1366x1024,pc_1920x1080}.jpg` (touch ones `lowmem=1`, 6 s after ready). DOM pass: **0 visible text nodes under 12 px, 0 clipped** on every size.
| screen | verdict | notes |
|---|---|---|
| 852×393 landscape (Frankfurt) | ✅ fit, ⚠️ minor | **New start pose works**: the tall yellow tower is gone from behind ⏸/minimap (low green block instead), and a stream of cars and a bus is visible down the road. No HUD over arrows/BRAKE/GAS/BOOST. The boost bar touches the car's rear bumper; "0 KM/H" sits just under the car. A big red-orange tree canopy fills the right edge behind ⚙ / EXIT. |
| 393×852 portrait (Athens) | ✅ fit | Minimap, speed + boost bar, quest pills top half; controls bottom; no overlap. Pink/yellow facades and palms; 2–3 small cars far ahead. |
| 1366×1024 tablet (Athens) | ❌ minor | **"0 KM/H" and the boost bar are still on the car** (rear bumper), 3rd review in a row. Otherwise the best shot: dense balconied facades, crowd and stall on the right, a rider and a car ahead, smash pile on the road. |
| 1920×1080 PC (Frankfurt) | ✅ fit | Minimap bottom-left, speed bottom-right, quest top-centre, nothing on the car. Brick clouds, deep blue sky, market stalls, minifigs, **4–5 cars ahead within ~150 m** (was 0 in r18). The red canopy at the right edge is cut by the frame. |

## Verify rev18's top 3
| r18 # | item | verdict | measured |
|---|---|---|---|
| 1 | Athens touch first-2-s hitch + hubTrafficStep (PF1JS120 ≤ 50, jsn50 ≤ 10, PF1HT f0–60 ≤ 20) | ⚠️ **2 of 3** | PF1JS120 **121 → 31 ✅**, PF1HT f0–60 **26 → 19 ✅**, jsn50 **33 → 13 ❌** (≤ 10). The first 2 s are clean; the hitches moved later: f631 (10.5 s) 125 ms, f941–943 (15.7 s) three frames 95/86/147 ms, f2236 minimap 91 ms. |
| 2 | Athens touch heap ≤ 450 MB (fra ≤ 350) | ❌ | ath ready 524 → **529** (device-like 511), fra 386 → 380 (device-like **347 ✅**). tstream slices 1–3 are on trunk but OFF; `?iosmem=1` asserts still not flipped. |
| 3 | Speed readout over the car (852×393, 1366×1024) | ❌ | Not touched. Tablet still shows speed + bar on the bumper; at 852×393 the bar still touches the bumper. |

## What landed in beta.131
| claim | verdict | measured |
|---|---|---|
| Speed-line canvas on a CPU-raster context, stroked under the curtain (2378266) | ✅ | roamCam max per frame fra 18 ms / ath 17 ms (r18 25); no roamCam-owned long frame. |
| Start cars + Frankfurt start pose (r17v, 4b8a7f8) | ✅ fra / ❌ ath | fra 96 % open, 2 cars in frustum, visible in the 852×393 and PC shots. Athens start-life FAIL: top-left 75 % < 80. |
| PC late links → 0 (5152888, 0502ad6) | ✅ | pc-post-ready-link 0 / 0 both cities, solo. |
| First-minute flags (DEST under the curtain, PC_add / LIFE f0–f120, b2e87bd) | ✅ | JS max f0–f119: fra 40 / ath 31 (tBoot), 38 / 28 (GO); no JS frame > 50 ms in f0–f119 in either city. |
| lowmem far LOD 900 m (cd2c232, 8a388f8 defaults at load) | ✅ (cap) / unmeasured (saving) | touch-render: wbLodRt 900, 0 far cells beyond the cap. Device-like heap fra 347 / ath 511. Draw saving not measured on a draw=0 page. |
| Curtain bisect (15ab0af) | ✅ | 4.6 s fra / 4.7 s ath, within beta.130 + 0.5 s. |

## Score: **7.9 / 10** (r18 7.8)
Better where the player feels it first: both cities now have **zero** JS frames over 50 ms in the first 2 s, Frankfurt has only 2 JS long frames in a whole minute, the curtain is ~4.7 s, PC has 0 late shader links, PC FC first pass now passes, and the Frankfurt start finally looks like 2K Drive: open sky top-left, cars on the road ahead. Some of the gain is this faster box. Still not an 8: **Athens has 13 JS hitches per minute up to 147 ms** (traffic waves at 10 s and 16 s and a 91 ms minimap repaint at 37 s), the iPhone will see them. Athens touch heap is ~510 MB device-like, about 2× a safe iPhone budget. PC heap grows +144 to +166 MB in 30 s, and Athens PC roam has 16 frames over 50 ms (max 180). The speed readout is still on the car on tablets. The Athens start view fails its own GO.

## Top 5 fixes (biggest score gain first)
1. **Athens mid-minute traffic + minimap hitches.** Owner: `hubTrafficStep` / `hubCullStep` / `LV_step` in `src/70_roam_world.js` (f631, f941–943, f1483, f2087, f2779: hubTrafficStep 53–97 ms per frame, so spread the recycle/respawn wave over frames) and `miniDraw` / `miniPaint` (f2236–2238: 49 + 37 ms, cap the tiles per frame after the curtain like `callCap`). Pass: `CITY=ath QS=lowmem=1 SECS=60 node tools/perf1/tBoot.js out <v>` → `jsn50 ≤ 5`, JS max ≤ 60 ms, PF1MAX miniDraw ≤ 15.
2. **Athens touch heap.** Owner: tstream (`?tstream=1`, slices 1–3: 56a5f3b, 0595f1f, 189d4e2, default OFF) + ios-mem in `src/99c7_rev5fix.js`. Pass: GO perf/ios-mem `?lowmem=1&iosmem=1` → ath device-like ready ≤ 450 MB (then ≤ 350), fra ≤ 350, growth ≤ +30; GO perf/tstream-near PASS; then flip tstream and the `iosmem` asserts ON.
3. **Speed + boost bar on the car (tablet, and touching it at 852×393).** Owner: touch `roamHud` speed/boost CSS layout. Pass: a GO that asserts the speed and boost-bar rects do not intersect the projected player-car screen box at 852×393, 393×852, 1366×1024 and 1920×1080 (PC already passes by eye).
4. **PC heap growth + Athens PC roam frames.** Owner: lively fill tiles `src/98lf_lively_fill.js` (`?lfr=N`, default OFF; HANDOFF_perf says ~140 MB held after 30 s) and the Athens `buildHubG` `step props` 5.96 s boot task (bhs OFF). Pass: `CITY=ath SECS=30 node tools/perf1/tPcHeap.js out <v>` → growth ≤ +60 MB, > 50 ms frames ≤ 5; GO perf/pc-heap-60s asserts it; perf/pc-boot-lt-ath longest task < 2 s with `?bhs=1` before flipping it ON.
5. **Athens start view.** Owner: r17v start-pose search (`src/70_roam_world.js` / tR17v) for Athens. Pass: GO r17/start-life on Athens → top-left open ≥ 90 % at 852×393 (now 75 %, FAIL), ≥ 2 cars in the frustum 40–120 m (9 ✅).
