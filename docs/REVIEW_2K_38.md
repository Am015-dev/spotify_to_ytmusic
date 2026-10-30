# REVIEW_2K_38 (2026-10-30): links-r30i (8b3eca7 + 3d2cc9f) and size-r30k (a28ed13)
Verdict: links-r30i PASS. size-r30k PASS.

## Diff read
- TWG_late runs only when `TWG.li && TWG.on && !LKG.on && state==='roam' && RO.on`. TWG.on is touch-only (pointer:coarse) or `?twg=1`, so desktop never runs it. `?twgli=0` turns it off.
- It runs nothing new. It runs the same calls the first roamStep made after the reveal (FL_apply + buildEnv, ART10_cars, W12_cars, GFX_sunFollow + GFX_light, GL_apply, DREV_pass), only earlier, under the curtain. `GFX_sunFollow(2)` snaps GFX.az to the camera heading. The old first call did the same, because GFX.az was undefined. So the sun, env and car paint on the first drivable frame are the same state as before, and the shots confirm it.
- OG stand-in: one InstancedMesh, compiled into composer.readBuffer, then removed. The render target is restored in a finally block. Its material is kept on purpose (TWG.liMat) so the program is not released. That is a one-off ~1 material leak and acceptable.
- tIosReveal PRE/POST hooks are tool-only.
- size-r30k: only data lines were removed. The page code reads OD_CHANGELOG[0] and slice(0,15) only, with no lookup by index or version. The archive is in docs/OD_CHANGELOG_archive.md.

## Measured (BUILT page out/rev38 = trunk e52b69e)
- Build OK, page 3,441,313 B. Unit 0 FAIL (5342 pass, 13 known, three installed).
- perf/ios-reveal (iPhone UA, 852x393 touch, 6x CPU, real PLAY):
  - fra 5/5: 0 links and 0 late programs (134 programs at reveal = 134 at +5 s).
  - ath 3/3: 0 links and 0 late (138 = 138). REVEAL PASS.
- Long frames are still present in the first 3 s: fra maxDt 1.3-2.4 s, ath 3.4-4.0 s. All of that is JS (js 1.1-3.4 s per frame), with 0 link ms. TWG_late runs before the reveal and cannot cause them. The parent's long frames were NOT re-measured here.
- Gate, phone profile:
  - `TAG=life1,xf1,terrain` PASS 42/42, errors 0.
  - Default (`why,life1,xf1,terrain`) PASS 78/78, errors 0.
  - Desktop UA (no PHONE) `TAG=life1,xf1,terrain` PASS 42/42, errors 0.
- Gauntlet: NOT re-run (the timebox was spent on ios-reveal at 6x). I rely on the worker's docs/shots/gauntlet/links-r30i/REPORT.md: boot/toControl 77.1 s against 75.5 s before, within noise; the bar was already red.
- The TWG_late cost (~0.85-1.0 s at 6x, from the worker) was not timed separately here. The curtain times measured: fra 5.9-13.4 s, ath 5.2-7.6 s.
- Shots and what I saw: docs/shots/rev38/SEEN.md. Same colours and reflections, no black or flat car. Athens shows the car on its first frame, where the parent did not.

## Not a FAIL item, for the coordinator
- Frankfurt, phone path: the first frame after reveal has no player car and no GAS button. This happens in BOTH builds, so it predates links-r30i. Worth a lane from the "first frame" angle if Alex sees it.
