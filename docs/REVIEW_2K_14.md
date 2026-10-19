# Strict review #14: Mainhattan Overdrive trunk `ca4b365` (= v90m-beta.121) vs LEGO 2K Drive

Reviewer session rev14, 2026-10-19. Branch alex/rev14 = alex/rev13 + origin/alex/od-int2. `bash tools/build.sh rev14` gave BUILD_OK, a 3.29 MB split page. I measured on the built page `out/rev14`. Timebox 45 min.

**Caveat on numbers.** To fit the timebox I ran 3–4 probes **in parallel** on a 4-core box, with each probe capped at about 9.5 min of wall time. Most tBoot runs therefore stopped at 35–50 game seconds and did not print their summary line. I counted their frames > 50 ms from the `PF1L` lines. All values are inflated against r13's solo runs. For that reason **the owner shares and the like-for-like first-30 s counts are the signal**, not the absolute n50 values.

## Measured
| run | boot | coverage | frames > 50 ms (PF1L) | max ms (frame, owner) | owners of frames > 50 ms |
|---|---|---|---|---|---|
| tBoot Athens touch LOWMEM, run 1 (3 parallel) | n/a | 0–45 s | 225 (first 30 s: 69) | 991 (f29, render) | render 81, **hubTrafficStep-self 65**, roamStep-self 31, roamCam 18 |
| tBoot Athens touch LOWMEM, run 2 (4 parallel) | n/a | 0–50 s | 229 (first 30 s: 61) | 569 (f29, render) | render 98, **hubTrafficStep-self 77**, roamStep-self 27, roamCam 11 |
| tBoot Frankfurt touch LOWMEM, run 1 | n/a | 0–45 s | 150 | 639 (f629, render) | **hubTrafficStep-self 56**, render 42, roamStep-self 17 |
| tBoot Frankfurt touch LOWMEM, run 2 | n/a | 0–35 s | 149 | 475 (f109, hubTrafficStep-self) | **hubTrafficStep-self 59**, render 34, roamStep-self 21 |
| tBoot Athens touch LOWMEM `&htFar=1`, 30 s | 132 s | 0–30 s, full summary | 94 PF1L; summary n50 254/1800, med 22.1, p99 303, max 836 | 836 (f59, render) | **hubTrafficStep-self 94** (first 30 s: 36 vs 16–18 OFF) |
| tFrame Athens **PC** q=high, 30 s, render stubbed | **108 s** (r13: ~14 min) | 0–30 s, full | n50 89/1800, n16 752, JS med 12.9, p95 50, p99 159, **max 1731** | f849 1731 (OG_tick 893, hubTrafficStep 543, roamHud 165); f851 1252 (roamCam 930, FC_pull 376); f1206 799 (lazyStep 565, hubTrafficStep 721) | sub avg: roamStep 15.5, hubTrafficStep 8.45, lazyStep 2.7, roamCam 1.95 |
| tFrame Athens PC: boot long tasks | – | – | `PF1BOOTLT` max **27.1 s**, then 11.4, 11.1, 7.8 s (r13: 59.6 + 20.1 s) | – | roam-phase long tasks 29.7, 23.4, 17.5 s (real-render samples, which means shader links after ready) |
| tFrame Athens PC: `PF1LINK` | – | – | **afterReady 41**, gateEnd 0 (the probe did not see the LKG gate) | – | +gs 19, +ao 10, Reflector 2, Output 2 |
| tFrame Frankfurt PC, 30 s | not measured | – | the run did not finish in 9 min (4 probes in parallel) | – | – |
| GO touch `r13/sky-blue,life1,xf1,terrain` | fra 61 s, ath 60 s | – | **39/44 PASS**. The 5 FAILs are all xf1 marked `SLOW > 10 s` (13.5–16.1 s, a contention artefact); every assert ✅ | – | – |
| GO desktop `pc-boot-lt,pc-post-ready-link` | fra 59 s, ath 83 s | – | **3/4 PASS**. pc-boot-lt-ath FAILs only on SLOW (14.5 s); its assert ✅: longest link step 117 ms, 36 programs in 32 steps, but the "longest boot task" is **16.4 s, 9 tasks > 2 s** | – | – |

Shots: `docs/shots/rev14/{fra,ath}_roam.jpg` (852×393, touch LOWMEM, 8 s after ready).

## Re-check of r13 findings
| r13 | item | verdict | measured |
|---|---|---|---|
| N1 | hubTrafficStep is the top JS cost | ❌ **not fixed (worse share)** | hubTrafficStep-self owns 65–77 Athens and 56–59 Frankfurt frames > 50 ms in 35–50 s. Its share of long frames is 29–34 % in Athens (r13: 52/182 = 29 %) and **37–40 % in Frankfurt** (r13: 27/125 = 22 %). On PC its avg is 8.45 ms with a max of 721 ms. The fix (`TUNE.htFar`) ships OFF. |
| N2 | PC boot long tasks | ⚠️ partly | PC tFrame boot is **108 s vs ~14 min**, and the longest boot task is **27.1 s vs 59.6 s**. The GO's own log still shows a 16.4 s boot task and 9 tasks > 2 s, so LKG splits the links but something else still blocks the thread for 10–27 s. |
| N3 | LIFE stages and lazyStep spike | ⚠️ partly | No LIFE or LV_step frame is in the top touch maxima. PC f1206 has lazyStep at 565 ms, and LV_step reaches 195 ms on PC f851. |
| N4 | Athens sky black on LOWMEM | ✅ fixed | `ath_roam.jpg` shows a deep blue sky with white brick clouds, and GO r13/sky-blue passes |
| N5 | Frankfurt sky pale | ✅ fixed | `fra_roam.jpg` shows a deep 2K blue |
| N6 | Frankfurt heap growth | not measured | the Frankfurt tBoot runs did not reach their summary. Athens htFar: 514 → 564 → 589 MB, +3.32 / +1.69 MB/s |
| N7 | pack GOs red | not measured | not in the TAG set this round |
| lkgfx | post-gate links ~21 | ⚠️ conflicting | GO pc-post-ready-link passes (bound 24), but tFrame `PF1LINK` reports **afterReady 41** and `gateEnd 0`, and the roam-phase long tasks of 17–30 s look like links. Either the tFrame `?test=ath&q=high` path skips the gate, or the GO measures a narrower window. |

## Findings (biggest first-minute lag first)
**N1. PC roam has multi-second stalls in the first 30 s: real-render samples cost 17–30 s of long task each, and a 1.7 s JS frame.** The PC tFrame shows roam-phase long tasks of 29.7, 23.4 and 17.5 s, `PF1LINK afterReady 41` with `gateEnd 0`, and JS frame f849 at 1731 ms (OG_tick 893 + hubTrafficStep 543).
- Owner: `src/98bp_warmall.js` (LKG gate and lkgfx), `src/85_audio_feel_sp_otg.js:682` (`OG_tick`).
- Repro: `CITY=ath SECS=30 RACE=0 node tools/perf1/tFrame.js out rev14`, then read `PF1LINK` and `longtasks`.
- Fix: (a) make tFrame's `?test=…&q=high` path go through the same LKG roam gate as the real loader (gateEnd must be > 0), then warm the 19 `+gs` and 10 `+ao` variants in LKG; (b) OG_tick rebuilds its group when `OG.key` changes, so spread that build over frames (yield every 4 ms) or build it in the loader. GO: PF1LINK afterReady ≤ 24 in tFrame, and no JS frame > 500 ms in the first 30 s on PC.

**N2. hubTrafficStep-self is still the top owner on touch, and in Frankfurt it is now #1** (56–59 frames vs render 34–42; r13: 27). TUNE.htFar, its fix, is OFF, and my one ON run did not help: with `&htFar=1` Athens had **36** hubTrafficStep-self frames in the first 30 s vs 16–18 OFF, and 94 vs 61–69 frames > 50 ms (one run, under contention, and **not verified** that the query flag reaches `TUNE.htFar`; I could not find a query parser for it).
- Owner: `src/70_roam_world.js` (hubTrafficStep, `HT_lo` at line 80).
- Repro: `CITY=fra QS=lowmem=1 node tools/perf1/tBoot.js out rev14`, then count the `PF1L` lines with owner `hubTrafficStep-self`.
- Fix: first add a `?htf=1` query switch (or confirm the existing one) and run a SOLO A/B. Then split the self time with `WRAP=HT_cars,HT_pose,HT_next,HT_hit,HT_flush`. Do not flip htFar ON on this evidence.

**N3. PC desktop boot still holds one 16–27 s long task** (GO pc-boot-lt-ath info line: 16.4 s, with 9 tasks > 2 s; tFrame `PF1BOOTLT`: 27.1, 11.4, 11.1 s). The longest *link* step is only 117 ms, so the remaining blocker is not the links.
- Owner: the desktop boot path in `src/98bp_warmall.js` and the loader.
- Repro: `DESKTOP=1 TAG=pc-boot-lt-ath node tools/tChkGo.js <url> <out>`, then read "longest boot task".
- Fix: run tFrame with `PROF=1` over the boot and name the 27 s task (likely city build, LIFE/LD meshes or texture upload), then chunk it. Add the "longest boot task < 2 s" bound to the GO as a pass condition (today it is info only).

**N4. Touch first-frame render spikes: f29 costs 569–991 ms in both Athens runs (owner render)**, plus render owns 81–98 Athens frames > 50 ms. This is SwiftShader-inflated, but f29 is the first real render after drivable, so a phone will hitch there too.
- Owner: the render warm for LOWMEM in `src/98bp_warmall.js`.
- Fix: draw one hidden frame of the roam scene behind the curtain before `__tq.drv`.

**N5. PC lazyStep and LV_step spikes on PC: 565 ms (f1206) and 195 ms (f851).** Owner: `lazyStep`, `src/98l_lively.js`. Fix: give lazyStep an 8 ms budget on desktop as on LOWMEM.

**N6. Shots (touch LOWMEM).** Both skies are now deep blue with brick clouds, which is good and 2K-like.
- Frankfurt: a lively park boulevard with red and orange brick trees, LEGO minifigs, a skyline, and the car in the right lane. A tall yellow building at the top-left sits behind the ⏸ button and the minimap and cuts the view.
- Athens: pink and yellow blocks with palms and a stall, which is nice. The road ahead is empty of traffic in the near 100 m, so the street is less lively than 2K. In both shots, nothing covers the controls.

**N7. Box limits.** Every xf1 GO and pc-boot-lt-ath failed only on `SLOW > 10 s` under parallel load. Re-run them solo before treating them as red.

## Score: **6.4 / 10** (r13 6.2)
Both sky bugs are fixed and PC boot fell from ~14 min to 108 s, with the worst task down from 60 s to 27 s. But hubTrafficStep still owns the most touch lag (#1 in Frankfurt), its fix ships OFF, and PC roam still links about 41 programs after ready, with multi-second stalls in the first 30 s.
