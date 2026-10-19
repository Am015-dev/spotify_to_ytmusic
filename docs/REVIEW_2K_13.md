# Strict review #13: Mainhattan Overdrive trunk `d02a30b` (= v90m-beta.118) vs LEGO 2K Drive

Reviewer session rev13, 2026-10-19. Branch alex/rev13 = alex/rev12 + origin/alex/od-int2. Build: `bash tools/build.sh rev13` gave BUILD_OK, a 3.2 MB split page. I measured on the built page `out/rev13`. Cut short by the coordinator at about 75 min, so most runs are single runs, not two.

**The box is about 2× slower than r12's box.** To calibrate, I built beta.117 (`d466be9`) as `b117` and ran the same probe on it. Athens touch LOWMEM tBoot gave n50 **176 on b117 vs 182 on b118**, boot 78 vs 82 s. So the absolute numbers below are not comparable with r12; the **b117 vs b118 delta is the signal**, and that delta is ≈ 0, which means no regression.

## Measured (single runs unless noted)
| run | boot | median / p99 / max ms | n50 (of 3600) | 0–5 s med | heap MB (0 / 30 / 60 s) | owners > 50 ms |
|---|---|---|---|---|---|---|
| tBoot Athens touch LOWMEM b118 | 82 s | 18.0 / 105.9 / 283 | 182 (JS 65) | 26.2 | 689 / 570 / 604 | render 117, hubTrafficStep-self 52, roamStep-self 11 |
| tBoot Athens touch LOWMEM b118 `lifestage=0` | 61 s | 19.6 / 107.9 / 303 | 187 (JS 68) | 29.8 | 702 / 570 / 591 | render 119, hubTrafficStep-self 55 |
| tBoot Athens touch LOWMEM **b117** | 78 s | 19.0 / 108.3 / 378 | 176 (JS 58) | 27.7 | 684 / 604 / 592 | render 117, hubTrafficStep-self 43 |
| tBoot Frankfurt touch LOWMEM b118 | 53 s | 19.4 / 70.1 / 148 | 125 (JS 45) | 31.0 | 302 / 439 / 503 | render 81, hubTrafficStep-self 27, roamStep-self 12 |
| tFrame Athens touch LOWMEM 30 s, b118 | – | JS 19.5 / p99 61.9 / **362** | 31 (of 1800) | – | – | f41 lazyStep 339; f690/f693 LV_step (LIFE stages) 175/166; f1520 198 |
| tFrame Athens touch LOWMEM 30 s, `lifestage=0` | – | JS 17.3 / p99 64.6 / 219 | 30 | – | – | f703 LV_step 206 (the old LIFE freeze) |
| tFrame Athens **PC** (1280×720, q=high), 60 s, render stubbed | ~14 min (!) | JS 19.8 / p95 52 / p99 100.8 / 229 | **199** (n16 2358) | – | – | roamStep avg 20.8, **hubTrafficStep avg 11.2 / max 134**, lazyStep max 80, hubCullStep max 63, minimap 61 |

Not measured (time): Frankfurt PC and the second run of each line. The PC tBoot (Athens, q=high) did not reach its first 20 game seconds in 10 min, so I stopped it and used tFrame for PC. The tFrame boot showed long tasks of **59.6 s and 20.1 s** (`PF1BOOTLT`) during the PC load.

## Re-check of r12 findings
| r12 | item | verdict | measured |
|---|---|---|---|
| N1 | 12 s LIFE freeze | ⚠️ partly | Staged LIFE turns one 206–219 ms frame into 2 frames of 166–175 ms (tFrame Athens, this box). n50 is **31 vs 30** with and without it, so **the staged LIFE change did NOT cause the Athens n50 rise 28→46**; that rise is box noise or another cause. tBoot (`warm=1`) is identical with or without staging (182 vs 187), because the loader builds LIFE there. New: a 339 ms `lazyStep` frame at f41 in the staged run (seen once). |
| N2 | River ETAs | ✅ claimed (r12c), not re-run | GO r11e/eta-spread tightened per the handoff |
| N3 | pack GOs red | ❌ open | per r12c handoff: GP pack5#1 and River pack5#2 are still red |
| N4 | xf1/grass | ❓ | r12c could not reproduce it; not re-run here |
| N5 | post-curtain shader link | ⚠️ | `render+prog1` frames > 50 ms: 1 in b118, 1 with lifestage=0, **3 in b117**, so the warm twins help; f1319 Athens is still 179 ms (render 160) |
| N7 | Frankfurt spawn on the centre line | ✅ | `fra_roam.jpg`: the car sits right of the yellow lines |
| TOP-2 | hubTrafficStep-self | ❌ | Athens LOWMEM: **52** frames > 50 ms on b118 vs 43 on b117 (same box); PC: hubTrafficStep is 56 % of roamStep time |

## Findings (biggest lag first)
**N1. `hubTrafficStep` is the biggest JS cost on both profiles.** It averages 11.2 ms out of 20.8 ms roamStep on PC q=high, and owns 52 Athens LOWMEM frames > 50 ms (b117: 43), with maxima of 99–124 ms.
- Owner: `src/70_roam_world.js` (hubTrafficStep, HT_*) and the LV/L3 code it calls.
- Repro: `CITY=ath QS=lowmem=1 node tools/perf1/tBoot.js out rev13`, then read `PF1OWN>50`.
- Fix: run tBoot with `WRAP=HT_cars,HT_pose,HT_next,HT_hit,HT_flush,L3_tick` to split the self time. Then step far cars (> 120 m) at 1/4 rate on alternate frames, and cap the per-frame car count at 24 on touch.
- GO `perf/traffic-hitch`: hubTrafficStep-self frames > 50 ms ≤ 10 on Athens LOWMEM, on the same box as a b117 baseline run.

**N2. The PC (desktop q=high) load is pathological: one 59.6 s long task and one 20.1 s long task during boot** (tFrame Athens; the PC tBoot did not reach drivable plus 20 s in 10 min). The JS frame itself is also heavy: median 19.8 ms, n50 199/3600, with render stubbed.
- Owner: the q=high warm path, `src/98bp_warmall.js`, probably shader compiles in one task.
- Repro: `CITY=ath SECS=60 RACE=0 node tools/perf1/tFrame.js out rev13`, then read `PF1BOOTLT`.
- Fix: yield between warm programs on desktop as the LOWMEM path does (one program per frame, or `KHR_parallel_shader_compile` polling). Confirm on real PC Chrome before trusting the SwiftShader seconds.

**N3. Athens LIFE stages still cost 166–175 ms each, and there is a new 339 ms `lazyStep` spike at f41** (tFrame touch LOWMEM, lifestage=1, one run).
- Owner: `src/assets/lx/code.js` (LIFE_pre), and lazyStep.
- Fix: build the turbine LD in the loader for LOWMEM too (as the perf-r12a handoff suggested). Re-run 2× to confirm the f41 spike, and keep lazyStep's budget under 16 ms while LIFE_pre runs (do not run both on the same frame).

**N4. Athens sky renders BLACK** in `docs/shots/rev13/ath_roam.jpg`: white brick clouds on black. **b117 has it too** (`b117_ath_roam.jpg`), so this is not new in beta.118.
- Context: `?test=ath&lowmem=1`, 852×393 touch, 8 s after `__tq.ready`, SwiftShader. r12's shots, via tRv2k2 on the real loader, had a blue sky, so this may be test-page or LOWMEM only. Not investigated further (coordinator stop).
- Fix: check the scene background, the sky dome and the fog colour on the LOWMEM Athens path. Add a GO that reads a sky pixel (or `scene.background`) and asserts blue.
- This is very un-2K-Drive if it happens on phones.

**N5. Frankfurt sky is pale white-blue, not the deep 2K blue** (`fra_roam.jpg`). Otherwise the shot is good: park boulevard, brick trees, kerb stall, the car in the right lane, and nothing over the controls.

**N6. Frankfurt heap grows +4.55 MB/s, then +2.14 MB/s, in the first minute** (302 → 503 MB). Owner: run heapOwner over 0–30 s.

**N7. The pack GOs are still red (from r12c):** pack5#1 GP and pack5#2 River. Owner: `src/98tk_city_duel.js`.

## Score: **6.2 / 10** (r12 6.3)
Lag is unchanged against beta.117 on the same box (n50 182 vs 176; hubTrafficStep slightly worse), the LIFE staging only splits the freeze, the PC desktop load has a 60 s blocking task, and Athens has a black sky (pre-existing) on the touch LOWMEM test page.
