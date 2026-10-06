# Cars worker handoff (2026-10-06)

Branch: `alex/od-cars` in `/home/user/odc`. Live is `games/mainhattan-overdrive/` on `alex/brave-carson-rbpmlk`.

## Build and deploy
- `base.html` holds the body of the live `index.html`. Re-extract it on every live change: take the text from `<title>Mainhattan Overdrive</title>` up to `</body>`.
- Build with `./reapply.sh pCARnn.py ...`. Each patch uses `P.py` (`R(old,new,n)` exact replace, then `save()`), which writes `overdrive.html`, `local.html`, `local_dbg.html` (with the `__dbg` hooks) and `chk.mjs`.
- Output: `out/<ver>/overdrive.html` plus `km.js` (copy `km.js` from live).
- Deploy: `DEPLOY_TRAILER="Co-Authored-By: ...\nClaude-Session: ..." bash tools/deploy.sh out/<ver> "<msg>"`, only after a reviewer PASS (session_01Y6FYerWwxv43FuKUcaUT4v).
- Beta artifact `claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug`: build `beta.html` from live `index.html` with `<title>Overdrive Beta</title>` inserted before `</head>`, and pass `km.js` in `files`.
- Report to the coordinator, session_017iH3DB4VyxwKSdMwsco4Ut.

## Live state
- Live is v86v (810a5fb) = all cars patches through pCAR23 (pCAR18 was dropped) + pART6.
- **pCAR24** (845e43b, out/v86w) is in review:
  - camera speed noise removed;
  - smooth AI steering;
  - closer and lower camera with a wider FOV at speed;
  - BOOST is SMASH: always wrecks, victim tumble, NEED BOOST tip, meter ring, faster refill.

## Next: pCAR25
Narrow the race tracks from 48 m to ~14–18 m (`W=def.w||48`, `HALF`, `MARGIN=HALF-3.2`). Keep these consistent:
- AI lines (`xt` clamps), `laneBias`, traffic `x`, mines/props `x`, jumps, walls, checkpoints, `RAMPS`, the 2-player split.

Gate it with frame strips and a lap-time balance check (`raceBal3.js`).

## Test tools (copies in `tools/cars/` on this branch, commit 690bf52; run them from a working dir; playwright is at /opt/node22/lib/node_modules/playwright)
- `jit.js` / `jit3.js`: per-frame jitter probe.
- `ramps2/3.js`: every city ramp (BACK env).
- `ram.js` / `ramRace.js`: SMASH 10/10 tests.
- `tyre3.js`: tyre gaps.
- `smash3.js`: BOOST touch.
- `truck.js`: trucks.
- `raceBal3.js`: race balance.

How to run them:
- Races need the test-driven requestAnimationFrame INIT plus `__tick`.
- Roam uses `requestAnimationFrame=()=>0` plus `__ju.step(n)`. `__ju.step` does NOT step races.
- Server: `cd /home/user/odc; python3 -m http.server 8766 --bind 127.0.0.1`.

## Lessons
- Headless rendering is under 1 fps, so never sample on wall-clock time; step frames instead.
- Measure with `Box3.setFromObject(o, true)`. The geometry box times `matrixWorld` overstates spinning wheels by r·(√2−1).
- A GLOWP glow point is 6 units wide. Keep it more than 14 m from the camera AND more than 8 m from the player.

## pCAR25 prototype (pCAR25.py, WIP, not reviewed)
`W = CR_trackW(def.w) = clamp(0.38·w, 14, 20)`, applied on top of pCAR24.

Results from one quick race (jit3.js):
- The track builds and races with no errors.
- The narrow track reads much faster.

Problems found:
1. **Too many takedowns.** pCAR24 makes any contact above 150 km/h a takedown, and in the tight pack the player takes down a rival every few seconds, each with a crash cam. Fix: keep a cooldown on the crash cam, or require boost for AI takedowns on narrow tracks.
2. **Camera in the wall.** One frame showed the camera inside a wall. The camera's lateral lead and wall clearance need clamping to `HALF`.
3. **Not yet checked:**
   - the starting grid of 8 across 14–20 m;
   - the AI dodge (6 m) and `MARGIN` 3.2;
   - traffic lanes and props/mines `x`;
   - jump widths (`jw`);
   - boat sections and tunnels;
   - per-track lap-time balance on all tracks;
   - the 2-player split.

## 2026-10-06 evening (session_012oDcg1MhwXUU7Y9ufgfS4k)
**Live = v86y 99f6baf (garage pGAR1, low-seat driver drvL/drvLR). pCAR24b is NOT live.**

### pCAR24b — steering after a crash (reviewer PASS on 56a8c34, built on v86x)
- Bug (Alex): "after a crash off-road I can't turn left/right, it sticks".
- Root cause: `CR_yaw` (roam) is a pure bicycle model, yaw = v/CR_WB·tan(dl), so at v≈0 (after a wall hit, wreck rebuild or grass stop) ◀/▶ gave 0 yaw.
- Fix (`pCAR24b.py`, 2 replaces):
  - a low-speed pivot `-st*1.15*pv²*dS` (pv = 1−sp/9) that follows travel/reverse intent;
  - the pinned logic backs off with UNSTUCK after 2 s when no open direction is found.
- **To ship:**
  1. re-extract base.html from live v86y;
  2. `./reapply.sh pCAR24b.py` (anchors are in CR_yaw / roamStep pinned block; pGAR1 doesn't touch them, but verify COUNT);
  3. rerun `tools/cars/g24b.js`, reviewer, `tools/deploy.sh`.
- **The deploy from this session was refused by the session permission guard**, so the next session must have deploy permission.
- Gate tool `tools/cars/g24b.js <base url dir> <outdir>` (env `MODES=top,iframe`):
  - real CDP touch on #tL #tR #tG #tB; release = touchEnd [] then re-touchStart the rest after 440 ms (tPlay pattern);
  - wall finder uses `__tr.hit` with a solid 12 m block;
  - wreck = hp 1 + drop 45 m.
- Results, turn within 0.5 s from rest, v86x → fix: grass 1°→23°, wall 6°→21°, wreck 0°→24°. Strips are in `shots24b/`.
- tPlay phone fails (FRA stuck 6.4 %, rotation check) also fail on unpatched v86x, so they are pre-existing.

### Queue (from the coordinator)
1. Ship pCAR24b on v86y (above).
2. Respawn camera (reviewer): after a roam wreck rebuild (`roamWreckStep`, W.t>=2) the car blinks (RO.inv=2) and the chase cam isn't framing it for ~1 s, then the 4×4 pops in at the bottom edge. Snap the camera behind the car on the rebuild frame and keep the car visible before input. Check v86x first.
3. Rival coupé glass: CR_car windscreen/roof are fully transparent; traffic got trans-black in pCAR6. Make them tinted semi-opaque with the driver visible (see devkit docs/shots/v86y/7_rival_coupe_low_seat.jpg). Garage wraps CR_car (drv→drvL) and CR_rivB (drvL→drvLR).
4. pCAR25, the full coordinator scope: narrow tracks 14–20 m (prototype pCAR25.py), double-tap ◀/▶ SMASH lunge (no roll, ~1 s cooldown), BOOST is plain boost again, rival health bars + name/class (3 SMASH = wreck; traffic 1), form swap <0.3 s, BOOST button solid + tip vs zone toast. Gate: 10/10 double-taps with zero false triggers, in an iframe.
- Garage balance done: gold+max is 3.3 % faster than rod (131.8 vs 136.3 s), both P1, reported to session_01LEhhDZWZUb5KQF9GsjoFVJ.
- Other workers: garage session_01LEhhDZWZUb5KQF9GsjoFVJ (gar2.js before window.__mho), art session_01W6yiubKvmPYdJJoxW8Vqu4 (ground, roads, shadows, lighting; tell it if road geometry changes).
