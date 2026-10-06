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

## Test tools (`/tmp/claude-0/sp`, not in git; copy what you need)
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
