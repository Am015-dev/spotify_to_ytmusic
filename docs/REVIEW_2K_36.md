# REVIEW_2K_36: world props, world-r30b rounds 1-2 (5063c2f, 90f612f) + world-r30h (c7a7842, d10705c) (2026-10-30)
Reviewer lane review-r30-10. Built page `out/rev36` = trunk c420598 (lane tip d10705c + docs only), served at 127.0.0.1:8836. Parent for A/B = ffd8f89 (`out/rev36p`). Phone profile throughout (iPhone UA, 852x393 touch, dpr 2; 6x CPU in the gauntlet boot).
Note: the brief names REVIEW_2K_34, but the world-r30b FAIL is REVIEW_2K_31 (REVIEW_2K_34 is jserr-r30f). Its items are checked below.

## Verdict: **FAIL. Send it back to world-r30h (same worker).**
The camera-vs-props round 3 is sound work. Gates are green and the gauntlet has no new FAIL row. It still cannot ship:
- `node tools/unit/run.js` is red on this lane (rule 3).
- The START fix is a mask that cannot catch the case it was written for.
- Two "after" shots show the camera problem Alex described.

## 1. Diff read (root-cause quality)
- **Good, real root causes (98fc_foliage_cam.js):**
  - The wbP proxy is now looked up in the proxy's own frame.
  - FC_inInst margins are now in world metres.
  - FC_fdBack runs every frame (was 8 Hz, so a prop could come back 0.53 s late).
  - One fade-and-restore rule now covers café/stall props (`q.fh`), walkers (`p.fh` scales to 0 in pedStep) and bvL pieces.
  - Nothing is moved any more. The `C.mv` café relocation is gone, which fixes REVIEW_2K_31 (d)(3).
  - A START-hidden prop keeps its own timer (`if(!f.ms)`), which fixes REVIEW_2K_31 ask 3.
  - Crown radius dropped from +2 m to +0.8 m and the 10 m "near crown" rule is gone, so no more hiding in plain view.
- **Persistent START clear (FC_clear every ~0.1 s for 6 s while the car is within 8 m of START): a mask, not a fix.**
  - (a) No owner was found for the sq_tv_1 'fig' instance. The worker did not reproduce it, and neither did I (§2).
  - (b) It cannot catch the cause the old handoff named, an owner that re-poses the instance every frame. FC_fdAdd zeroes an instance once and then returns early (`if(FC.fd.has(key))continue` / `if(h){...return}`), so a per-frame writer puts the figure straight back and is never zeroed again.
  - (c) Its cost is unmeasured. Each re-clear does a `scene.traverse` and a `getMatrixAt` for every instance of every small InstancedMesh, 10 times a second for 6 s at START, on the phone path. I could not time it (§2).
  - (d) FC_clear's fallback scan zeroes any instanced piece < 8 m inside the car body without knowing what it is.
- **Not changed:** the gauntlet `world/glance` distance bar (REVIEW_2K_31 ask 2) and quest START by real input (ask 4) are not in these commits. The gauntlet `mission/*` rows did reach a quest START by real input this run (mission/reach 21 s, PASS).

## 2. Athens START, sq_tv_1 'fig' repro (phone profile)
Probe: `docs/shots/rev36/startprobe.js`. For each quest it parks the car at the ring as GO world/mstart does, presses START, then samples what is drawn inside the car body at 0.3, 1, 2, 4, 7 and 10 s, and can switch the re-clear off.
**Not reproduced; the probe did not complete:**
- **2 of 2 runs at 6x CPU:** the page **reloaded itself (same URL) during the first quest START (sq_yi_1)**, so the execution context was destroyed.
- **Unthrottled run 1:** marks were read before they were placed, so 0 quests.
- **Unthrottled run 2:** the page navigated again, then a screenshot hung for 15 min while the gauntlet shared the CPU.

The self-reload at Athens START under 6x is unexplained, and I did not run it on the parent. The gauntlet's own page/reload row is 0, but the gauntlet does not START an Athens quest. This is a lead, not a finding against the lane.
GO world/mstart (1 s sample, DOM click) is green fra+ath.

## 3. Gates (built page, phone profile)
| check | result |
|---|---|
| `tools/build.sh rev36` | BUILD_OK, page 3,502,555 B |
| `node tools/unit/run.js` | **UNIT FAIL: 1 FAIL `page/size-headroom`: page 3,501,365 B (bar < 3,500,000)**. Parent ffd8f89: 3,496,377 B, **0 FAIL**. The handoff's "unit 0 FAIL, 3.500 MB" does not hold on the pushed commit. |
| `TAG=world` gate fra+ath | PASS 14/14, errors 0 |
| `TAG=life1,xf1,terrain` gate | PASS 42/42, errors 0 |
| default gate (why,life1,xf1,terrain) | PASS 78/78, errors 0 |

## 4. Gauntlet `rev36-full` (seed 36, 1201 s, `docs/shots/gauntlet/rev36-full/REPORT.md`)
32 PASS, 10 FAIL. page/reload 0, page/jsErrors 0, mission/reach + card + objective + toast + end PASS.

| FAIL row | in baseline rev34-s33 / rev35-full-0126c1f? |
|---|---|
| boot/toControl 78.4 s | yes (77.2 / 165.9) |
| drive/onStreet 63 % | yes (rev35), script validity |
| drive/near 1.4 | yes |
| hit/contact 0/5 | yes; hit/noBrake n/a follows from it (rev34) |
| drift/start 1/3 | yes, "not set up" |
| drift/tap 1/3 slid | row is in both baselines (0 valid setups there). This run had 3 valid setups and 1 slid at 19.8°. Handling, not touched by this lane. |
| wall/glance 1/4, wall/headon 0/2 | yes, script |
| ath/boot 122.8 s | **not in the rev35 list**. It ran in parallel with my START probe (contention), so it is not a measurement. Re-check it alone. |

**No new FAIL row attributable to the lane**, with the ath/boot re-check pending.

## 5. Shots (`docs/shots/rev36/`, reviewed in SEEN.md; reference `ref2k_any_freeroam_vista_01`)
- **Athens START:** clean, and identical to before.
- **Frankfurt START:** nothing in the car, but a grey slab fills the left 20 % of the lens.
- **Athens drive:** **no car in frame**. The camera is at grass level between blocks with leaves at the lens. The bot was off-street, so this needs a parent A/B before it is blamed on the lane.
- **Frankfurt at speed:** a smash in a plaza, which is fine.
- **The world looks full.** No early fade or late pop was seen in any shot.

## Back to world-r30h (max 3, ~60 min)
1. **Unit green:** `page/size-headroom` needs the page under 3,500,000 B (now 3,501,365 B). Move the START fallback scan and the wbP proxy block of 98fc into the lazy world file, or trim them. Then show `UNIT OK ... 0 FAIL` on the rebased tip.
2. **START clear: find the owner or bound the cost.**
   - When FC_clear's fallback scan zeroes something after the first second, log the parent chain and userData once and name the owner. Then fix it at the owner (spawn beside the ring).
   - Until then, the fallback must re-zero an instance that was written again (compare against the stored m0, not just whether the key exists).
   - Report FC_clear ms at 6x CPU in Athens (bar: < 2 ms per call).
   - While doing this, explain the Athens page self-reload at quest START under 6x: run `docs/shots/rev36/startprobe.js` with `THR=6` on both the parent and the tip.
3. **Camera with no car or a slab at the lens:** reproduce `after_ath_drive_nocar.jpg` (Athens, lane between blocks) and `after_fra_start_opa.jpg` (Opa's Golden Bricks START) on the parent and on the tip. If the tip is worse, fix it. Add one GO assert that the car's screen box is at least 60 % on screen in chase cam on both paths.

## Method notes
- The probe is kept as `docs/shots/rev36/startprobe.js` (read-only apart from what GO world/mstart already does: car placed at the ring, card START).
- Unit ran without three in node_modules: lint_tracks / logic_core SKIP, as in earlier reviews.
