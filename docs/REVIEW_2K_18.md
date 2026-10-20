# Strict review #18: Mainhattan Overdrive trunk (od-int2 `ee7412d`, live v90m-beta.130 = `85e7116` + start-life r17q) vs LEGO 2K Drive

Reviewer session rev18, 2026-10-20. Branch alex/rev18 = alex/rev17 + origin/alex/od-int2. `bash tools/build.sh rev18` gave BUILD_OK, a 3.33 MB split page. I measured on the built page `out/rev18`. Timebox 45 min (ran over: one PC tFrame took 20 min and then failed).

**Method and box.** Every probe ran SOLO and in the foreground. **This box is ~1.3× slower than r17's** (touch median frame 15.8 ms vs 11.8). So I rebuilt the r17 trunk (`origin/alex/rev17`, `out/r17b`) and ran the same Athens probe on it, on this box, as a **same-box baseline**. Compare r18 against that column. Note: the tBoot probe really renders only every 30th frame in software GL, so most "render" long frames are an artifact of this box; the JS-owned counts are the real signal.

## Measured (solo, 60 game seconds each)
| run | boot | frames > 50 ms (JS-owned) | max frame ms (owner) | other |
|---|---|---|---|---|
| tBoot Athens touch `lowmem=1`, **r17 trunk, same box** | 63 s | 158 (**jsn50 42**), first half 90 | **192** (JS 192; roamStep 185 = hubTrafficStep 129 + hubCullStep 98 + PC_step 70) | med 15.0, p99 87.6, n150 **2**; owners: render 116, hubTrafficStep-self 36; **PF1HT f0–60 max 129** at f5; heap 641 > 595 > 576 MB |
| tBoot Athens touch `lowmem=1`, **r18** | 61 s | 143 (**jsn50 33**), first half 76 (JS-owned in the first 30 s ≈ 29) | **121** (f5 gc/other; roamStep 56, hubTrafficStep 26) | med 15.8, p99 76.9, n150 0; owners: render 109, hubTrafficStep-self **25**, roamStep-self 6; **PF1JS120 f0–f119 max 121 at f5**, n > 50 = 4 (f5 121, f79 76, **f80 107, f81 111** = hubTrafficStep 51–55 + hubRecycle/updWorld); **PF1HT f0–60 max 26**; LAZY max 16.8; heap **519 > 513 > 509 MB** (−120 MB vs same-box r17) |
| tBoot Frankfurt touch `lowmem=1`, r18 | 45 s | 33 (**jsn50 10**), first half 21 | **89** total / JS 80 (f164 hubTrafficStep 39, f206 DEST_find 29) | med 14.9, p99 48.7; **PF1JS120 f0–f119 max 48 (f42 DEST_find 27), n > 50 = 0** ✅; PF1HT f0–60 max 19; roamCam max 25; heap 317 > 413 > 425 MB (+96 MB in the first 30 s) |
| tFrame Frankfurt PC q=high | – | – | **not measured** | the page closed (`Target page … has been closed`) after 20 min; only `PF1GATE 0` printed. PC tBoot (`TOUCH=0 q=high`) also ran past 9 min. Harness gap on slow boxes, not a code verdict. |
| tFrame Athens PC q=high | – | – | **not measured** | same reason |
| GO perf/ios-mem, touch tier (tChkGo `?lowmem=1`, built page) | fra 38 s, ath 52 s | – | – | **fra**: ready GPU 157 MB, heap **386 MB**; 30 s GPU 166, heap **403 MB (+17, ≤ +30 ✅)**; rotate GPU +0, heap +3, builds none. **ath**: ready GPU 147, heap **524 MB**; 30 s GPU 156, heap **543 MB (+19 ✅)**; rotate GPU +0, heap +8, builds none |
| GO perf/ios-mem, default tier (keeps far-city LOD) | – | – | – | fra 473 → 551 MB (+78), ath 681 → 764 MB (+83), GPU 217/222 MB. Matches the "27–44 MB high" note only partly: the desktop tier is 90–160 MB above the touch tier |
| GO perf/pc-shrink (`?lowmem=1`) | – | – | – | ✅ PASS both: fra 485 meshes, 93 % instance slots released; ath 1836 meshes, 96 % released, 0 bad arrays (r17 could not run it) |
| GO perf/mem-quant (`?lowmem=1`) | – | – | – | ✅ PASS both: Int16 ground fra saved 4.4 MB, ath 14.4 MB (err ≤ 0.31 cm, 0 holes); far chunk zip round-trip identical, max 60 ms |
| GO perf/fc-first | – | – | – | `lowmem=1`: ✅ fra 27.1 ms, ath 11.5 ms. **Default tier: ❌ fra 37.7 ms** at f112 (grid work 81.6 ms on a pass), ath 7.3 ms |
| GO r17/start-life | – | – | – | ✅ both: 3 cars seeded ahead at boot (1–4 ms); 852×393 top-left open 78 % fra / 81 % ath (info, `?r17pose=1` OFF) |
| unit, `TAG=life1,xf1,terrain`, perf/beacon-boot | – | – | not run (reviewer; timebox) | – |

## Screen fit (one shot each, I looked at all four)
Shots: `docs/shots/rev18/{phoneL_852x393,phoneP_393x852,tablet_1366x1024,pc_1920x1080}.jpg` (touch ones `lowmem=1`, 6 s after ready). A DOM pass on each found **0 visible text nodes under 12 px and 0 clipped** on every size.
| screen | verdict | notes |
|---|---|---|
| 852×393 landscape (Frankfurt) | ⚠️ minor | No HUD over the arrows/BRAKE/GAS/BOOST. But **"0 KM/H" and the boost bar sit on the player car's rear wing** (bottom-centre), and the **tall yellow building is still behind ⏸ and the minimap** (5th review). Road ahead: the seeded cars are not visible in the first 150 m in this shot. |
| 393×852 portrait (Athens) | ✅ fit | Minimap, speed, quest pills top half; controls bottom; no overlap. Colourful facades, palms. Road ahead empty. |
| 1366×1024 tablet (Athens) | ⚠️ minor | Speed readout and boost bar **on the car** (same as r17). Controls small for 10". Best shot: dense facades, crowd, 2 taxis and a rider ahead, a smash pile on the road. |
| 1920×1080 PC (Frankfurt) | ✅ fit | Minimap bottom-left, speed bottom-right, quest top-centre. Brick clouds, deep blue sky, crowds and stalls; **road ahead has no car within ~200 m**, and the yellow building fills the left edge. |

## Verify rev17's top 5 fixes
| r17 # | item | verdict | measured |
|---|---|---|---|
| 1 | Touch heap 2–3× over budget (≤ 400 fra / ≤ 450 ath, ≤ +30 MB/30 s) | ⚠️ **half** | Growth ✅ (+17 / +19 MB, now asserted). Ready heap fra **386 ✅ ≤ 400**, ath **524 ❌ > 450**. Still 1.5–2.2× the 250 MB iPhone budget; `?iosmem=1` asserts not flipped ON. tChkGo now can run the lowmem GOs (via `?lowmem=1` in the base URL). |
| 2 | Athens touch hubTrafficStep (jsn50 ≤ 5, JS max ≤ 60, PF1HT f0–60 ≤ 20) | ⚠️ **better, not passed** | Same box: jsn50 **42 → 33** ❌ (≤ 5), JS max **192 → 121** ❌ (≤ 60), PF1HT f0–60 **129 → 26** ❌ (≤ 20, close). hubTrafficStep-self frames 36 → 25. New hot spot: **f79–f81 three frames 76/107/111 ms** in the first 1.5 s. |
| 3 | Live start road (≥ 2 cars 40–120 m ahead; no building behind ⏸) | ⚠️ **half** | GO start-life ✅ (3 seeded ahead). Shots: cars not readable at 852×393 and PC; yellow building still behind ⏸/minimap (pose search exists but `?r17pose=1` is OFF). |
| 4 | Athens render-owned long frames ≤ 20, gov above `min` | ❌ | render 109 (same box r17 116); `gov.end q:min` in both cities. (Partly this box's software GL.) |
| 5 | PC heap +201 MB/60 s, bhs/`ld 8` boot tasks < 1.5 s | **not measured** | tFrame does not finish here. Default-tier ios-mem shows +78 / +83 MB over 30 s. a0cf497 staged rfGrid (claims max buildHubG gap 1126 → ~550 ms), bhs still OFF. |

## What landed since r17 (beta.129, beta.130, r17q)
| claim | verdict | measured |
|---|---|---|
| FC_pull slicing (fc-first) | ✅ touch / ❌ PC | lowmem fra 27.1 ms, ath 11.5 ms; default tier fra **37.7 ms > 30** (f112). |
| PC instance shrink e03bdb0 | ✅ | pc-shrink PASS: 93 % / 96 % instance slots released, ath touch heap 524 MB vs 681 MB default tier. |
| Int16 ground + far deflate (b51806d) | ✅ | mem-quant PASS, 4.4 + 14.4 MB saved, no holes, zip round-trip identical. |
| First parked-car pass under the curtain (074a03e) | ✅ fra / ❌ ath | GO goal "JS max f0–f119 ≤ 50": fra **48** ✅, ath **121** (f5 gc/other; roamStep 56) ❌. |
| ios-mem 30 s growth assert (e5e00c2) | ✅ | +17 / +19 MB ≤ +30. |
| Start life r17q (after beta.130, on trunk) | ✅ GO / ⚠️ visual | see fix 3. |

## Score: **7.8 / 10** (r17 7.6)
Real progress on the same box: Athens touch JS long frames −21 %, JS max 192 → 121 ms, the f5 traffic wave down from 129 to 26 ms, and 120 MB less heap at boot; Frankfurt touch has no JS frame over 50 ms in the first 2 s and only 10 in a minute; all four memory GOs pass on the touch tier and heap no longer grows. The UI fits every screen with no small or clipped text. Not an 8: Athens still has a 3-frame 76–111 ms hitch at f79–f81 and 33 JS long frames per minute, Athens touch heap is 524 MB (2× an iPhone's safe budget), the speed readout sits on the car at 852×393 and tablet, the start road still looks empty in the shots, and PC could not be measured at all on this box.

## Top 5 fixes (biggest score gain first)
1. **Athens touch first-2-s hitch + hubTrafficStep.** Owner: `hubTrafficStep` / `hubRecycle` in `src/70_roam_world.js` (the f79–f81 wave: 51–55 ms each, plus `updWorld` 21 ms on f81) and the f5 `gc/other` 121 ms frame (`roamStep` 56: `PC_step` 13, `hubCullStep` 14). Pass: `CITY=ath QS=lowmem=1 SECS=60 node tools/perf1/tBoot.js out <v>` → `PF1JS120 max ≤ 50`, `jsn50 ≤ 10`, `PF1HT f0-60 max ≤ 20`.
2. **Athens touch heap 524 MB.** Owner: Athens per-city geometry / far-chunk residency (`?tstream=1` slice 1, 56a5f3b, still OFF) and ios-mem in `src/99c7_rev5fix.js`. Pass: GO perf/ios-mem with `?lowmem=1&iosmem=1` → ath heap at ready ≤ 450 MB (then ≤ 350), fra ≤ 350; then flip the `iosmem` asserts ON by default.
3. **Speed readout over the player car** (852×393 and 1366×1024). Owner: speed/boost HUD layout (`roamHud` CSS for touch). Pass: a GO that asserts the speed + boost bar rects do not intersect the projected player-car screen box at 852×393, 393×852, 1366×1024 (PC already puts it bottom-right).
4. **Visible start life + Frankfurt pose.** Owner: r17q start seed in `src/70_roam_world.js` (seed into the player's lane 40–120 m, already moving) and flip `?r17pose=1` ON once its GO passes. Pass: GO r17/start-life asserts ≥ 2 cars in the player's road 40–120 m ahead **and in the camera frustum** at `__tq.drv`, and top-left open ≥ 90 % at 852×393.
5. **PC unmeasurable + PC FC first pass.** Owner: `tools/perf1/tFrame.js` (page closes on slow boxes; add a `SECS`-bounded run that prints PF1BOOTLT/PF1LINK before the race) and FC_pull grid work on the default tier (fc-first fra 37.7 ms at f112). Pass: tFrame fra finishes in < 10 min with `PF1BOOTLT max < 1.5 s`, heap1 − heap0 ≤ +100 MB, and GO perf/fc-first ≤ 30 ms on the default tier.
