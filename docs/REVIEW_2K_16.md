# Strict review #16: Mainhattan Overdrive trunk (od-int2 `ba5b9c3`, live v90m-beta.126) vs LEGO 2K Drive

Reviewer session rev16, 2026-10-19. Branch alex/rev16 = alex/rev15 + origin/alex/od-int2. `bash tools/build.sh rev16` gave BUILD_OK, a 3.31 MB split page. I measured on the built page `out/rev16`. Timebox 45 min.

**Method and box warning.** Every probe ran SOLO and in the foreground. **This box is about 2× slower than r15's**: every real-render touch frame is > 50 ms here (render owns 118 of 163 long frames), and the median frame is 17–18 ms vs r15's 9. So I rebuilt the r15 trunk (`origin/alex/rev15`) and ran the same probe on it, on this box, as a **same-box baseline**. Compare r16 against that column, not against the absolute numbers in REVIEW_2K_15.

## Measured (solo, 60 game seconds each)
| run | boot | frames > 50 ms (JS-only) | max frame ms (owner) | other |
|---|---|---|---|---|
| tBoot Athens touch `lowmem=1`, **r15 trunk, same box** | 92 s | 191 (JS **72**) | **247** | med 18.6, p99 117, n33 466; owners: render 119, hubTrafficStep-self 58, roamStep-self 11 |
| tBoot Athens touch `lowmem=1`, **r16** | 79 s | 163 (JS **46**), first 30 s: 86 | **199** (f9: roamStep 166 = hubTrafficStep 95 + LV_step 38 + updWorld 22) | med 17.6, p99 94.9, n33 329; owners: render 118, hubTrafficStep-self 38, roamStep-self 6; LAZY max 20 ms |
| tBoot Frankfurt touch `lowmem=1`, r16 | 50 s | 96 (JS **22**), first 30 s: 54 | **190** (f8: **roamCam 143**, roamStep 46) | med 17.0, p99 67.4, n33 258; owners: render 73, hubTrafficStep-self 10, roamStep-self 9 |
| tFrame Frankfurt PC q=high, r16 | 55 s | JS **52**/3600, n16 1758 | **150** (f68: roamStep 88 (hubTrafficStep 64), **roamCam 56 = FC_pull 56**) | JS med 15.9, p95 34.3, p99 56.2; `PF1LINK afterReady 4` (r15 30), afterGate 7, gateEnd 215; heap 592 → 704 MB (r15 602 → 747) |
| tFrame Frankfurt PC: boot long tasks | – | – | `PF1BOOTLT` max **6.44 s** (`xc 99c6_rv4a`), then 6.30 (`ld 8`), 3.96 (`done`, first menu frame), 2.91 (`boot` toMenu/warmTex) | r15 (other box): 2.05 s. Halve for box speed and it is still ~3.2 s |
| tFrame Athens PC q=high | – | – | **not measured** (timebox) | – |
| 30 s retained heap (HEAP=ret), both cities touch | – | – | **not measured** (timebox) | GO perf/heap-30s not re-run either |
| GO perf/touch-first-frames, perf/pc-post-ready-link, r13/sky-blue-frame, unit, `TAG=life1,xf1,terrain` | – | – | not run (the probes above measure the same things) | – |

Shots: `docs/shots/rev16/{fra,ath}_roam.jpg` (852×393, touch `lowmem=1`, 8 s after drivable). I looked at both.

## Verify "landed since r15"
| claim | verdict | measured |
|---|---|---|
| Frankfurt LOWMEM heap packing (+80 → +27 MB at 30 s) | **not measured** | No HEAP=ret run. PC Frankfurt (not LOWMEM) heap 592 → 704 MB, +112 MB, vs r15's +145 MB. |
| Touch warm gate (twg): JS max f0–f119 Athens 36–51 / Frankfurt 71–75 ms | ❌ **not met in tBoot** | Athens **f9 199 ms**, f10 113, f11 80 (hubTrafficStep-self); Frankfurt **f8 190 ms** (roamCam 143). Even halved for box speed (~100 / ~95 ms) both are over the claim. The tBoot path (`?test&gov=1&warm=1`, waits for `__tq.drv`) may not wait for the gate the way the GO does. Either way, frames 8–11 are still the first-second hitch. |
| PC LKG gate pass 2: post-ready links 28 → 3–4 | ✅ **confirmed** (Frankfurt) | `PF1LINK afterReady 4`, afterGate 7 (kinds: plain 5, +gs 1, +ao 1). Athens not measured. |
| Test page waits for the gate | ✅ (indirectly) | tFrame `PF1GATE 0`: the gate was already drained at ready. |
| bhs, htFar, roamBudget still OFF | noted | Not A/B'd. PC boot long tasks are back to 6.3–6.4 s on this box, so bhs is worth re-testing. |

## Re-check of r15 findings
| r15 | item | verdict | measured |
|---|---|---|---|
| N1 | touch Athens first-second long frames (f29 110, f31 94 lazyStep) | ⚠️ **partly** | Same box: JS > 50 ms **72 → 46** (−36 %), max 247 → 199. lazyStep is gone from the long list (LAZY max 20 ms), and f29 is now 97 ms of render only. The worst frames moved earlier, to **f9–f11** (hubTrafficStep 95 / 52 / 61 ms). |
| N2 | touch Frankfurt heap ramp +174 MB in 30 s | **not measured** | HEAP=ret not run in the timebox. The claimed fix (+27 MB) is unverified by this review. |
| N3 | PC links after ready 27–30 | ✅ **fixed** (Frankfurt) | **4** after ready (target ≤ 24). Athens not measured. |
| N4 | PC hubTrafficStep + hubCullStep + CTB_step 105 ms | ⚠️ **partly** | Frankfurt PC worst frame is 150 ms at **f68**: hubTrafficStep 64 + FC_pull 56 (in roamCam). hubTrafficStep is still in every top frame on both profiles. |
| N5 | PC boot `gate gfx_pre` 2.2 s | ❌ **not fixed / regressed** | gfx_pre is no longer in the top list, but `xc 99c6_rv4a` = **6.44 s** and `ld 8` = 6.30 s are. Halved for box speed that is ~3.2 s, over the 3 s GO bound. |
| N6 | shots: empty road ahead, building behind ⏸/minimap | ❌ **not fixed** (Frankfurt) / ⚠️ partly (Athens) | Frankfurt: no car in the first ~150 m and the tall yellow building is still behind ⏸ and the minimap. Athens: 3–4 cars ~100–150 m ahead on the left lane, better. |
| N7 | Athens boot 1.7× Frankfurt; governor drops to min mid-drive | ⚠️ **same** | Touch boot 79 s vs 50 s (1.6×). Both runs end at `q=min` (`gov.end q:min`). |

## Findings (biggest first-minute lag first)
**N1. Frankfurt: a 143 ms roamCam / FC_pull spike in the first two seconds, on touch AND PC.** Touch f8 = 190 ms (roamCam 143); PC f68 = 150 ms (roamCam 56, all of it in `FC_pull`, plus hubTrafficStep 64). This is new in the top list (r15 Frankfurt touch max was roamStep-self 96), and it lands exactly in the window the touch warm gate is supposed to cover.
- Owner: `src/98fc_foliage_cam.js` (`FC_pull`, called from roamCam).
- Repro: `CITY=fra QS=lowmem=1 SECS=60 node tools/perf1/tBoot.js out rev16`, read `PF1L f8`; `CITY=fra SECS=60 RACE=0 node tools/perf1/tFrame.js out rev16`, read `"long"` f68.
- Fix: run the first `FC_pull` (foliage-occlusion pull for the start camera) under the twg curtain, or time-slice it (≤ 4 ms per frame) for the first 120 frames. GO: no roamCam frame > 20 ms in f0–f119 on Frankfurt touch.

**N2. Touch Athens: hubTrafficStep 95 / 52 / 61 ms on f9–f11, plus LV_step 38 on f9.** Same box, r16 cut JS long frames from 72 to 46, but the first-second hitch has only moved from f29/f31 to f9–f11. Halved for box speed it is still ~100 ms on f9, against the claimed ≤ 51 ms.
- Owner: `src/70_roam_world.js` (hubTrafficStep spawn wave), `LV_step`; `src/98bp_warmall.js` (twg).
- Repro: `CITY=ath QS=lowmem=1 SECS=60 node tools/perf1/tBoot.js out rev16`, read `PF1L f9..f11`.
- Fix: run the first traffic fill (the full hubTrafficStep spawn wave) and the first LV_step under the curtain, then cap per-frame spawns to 2 for the first 2 s. Also check why tBoot's f0–f119 disagree with GO perf/touch-first-frames: make the GO use the tBoot path (`gov=1&warm=1`, wait on `__tq.drv`) so the claim and the probe measure the same thing.

**N3. PC boot long tasks are 6.3–6.4 s (`xc 99c6_rv4a`, `ld 8`) on this box, ~3.2 s normalized; over the 3 s bound.** r15's top was `gate gfx_pre` 2.2 s. The new top one is an xc chunk eval (the test checklist chunk `99c6_rv4a`) and loader step 8.
- Owner: loader `ld 8` step; xc chunk loading for `99c6_rv4a` (check whether a test-only chunk is evaluated on the normal boot path at all).
- Repro: `CITY=fra SECS=60 RACE=0 node tools/perf1/tFrame.js out rev16`, read `PF1BMK`.
- Fix: do not load `99c6_*` checklist chunks unless `?test`/GO asks for them, or load them after drivable; slice `ld 8`. Then A/B `bhs` SOLO on the same box. GO: PF1BOOTLT max < 3 s normalized.

**N4. hubTrafficStep is still the top JS owner on every profile** (touch Athens 38 frames > 50 ms with hubTrafficStep-self as owner, Frankfurt 10, PC Frankfurt f68 64 ms). It is the steady-state lag after the first second.
- Owner: `src/70_roam_world.js`.
- Fix: A/B `TUNE.htGc` and `roamBudget` SOLO (`QS=htgc=1`) on this box against the numbers above; flip whichever cuts touch-Athens hubTrafficStep-self frames by half.

**N5. Shots vs 2K Drive.** Deep blue sky, brick clouds, glossy red car, lively Athens facades with palms and a market stall, Frankfurt skyline, brick trees and a park: both read as LEGO and nothing covers the controls. Un-2K-like:
- Frankfurt: **the road ahead is empty** for ~150 m (still r14/r15 N6). 2K streets are busy from second one. Owner `src/70_roam_world.js` spawn: seed 2–3 cars in the player's road 40–120 m ahead at drivable.
- Frankfurt: the tall yellow building still sits behind ⏸ and the minimap (third review in a row). Owner: start pose / camera yaw for Frankfurt.
- Athens: cars visible ahead now, an improvement.
- Fun read: story prompt and "HIT FAST = SMASH" are on screen at 8 s, so the first goal is visible. Feel was not measured (no real-time play by rule).

**N6. Not measured this round** (say so instead of guessing): the 30 s retained heap on both touch cities (the Frankfurt heap-packing claim), the whole PC Athens tFrame run, and the GO lines. The next review needs a box-speed baseline first (the r15 trunk on the same box, as done here), or the numbers are not comparable.

## Score: **7.2 / 10** (r15 7.3, on a faster box)
Same box, r16 really is better than r15 on touch Athens (JS long frames −36 %, max 247 → 199), and PC late links dropped from 30 to 4. But the first-second hitch is still there and has moved earlier (f8–f11: Frankfurt roamCam/FC_pull 143 ms, Athens hubTrafficStep 95 ms), the PC boot has 6 s tasks on this box, and the Frankfurt road ahead is still empty with a building behind the HUD, so the first minute does not feel 2K-smooth yet.
