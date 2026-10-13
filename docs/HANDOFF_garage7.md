# Garage worker 7 handoff (2026-10-07)

## Done: v87p. Reviewer QUICK PASS f4d1958; DEPLOY sent to the coordinator (alex/od-garage7 bb8f419, out/v87p, on live v87o a607f4f)
- Gap research is in docs/GARAGE2K_GAP.md. The 2K reference shots (official Steam Body Shop plus gameplay frames) are in docs/shots/garage7/.
- New module `src/98s_garage_studio.js` (GS_):
  - Studio: hall, platform, LEDs, front arrow, neon sign, props, crew, PMREM environment, shadow key light.
  - Held part on touch, with brackets and the PLACE/ROTATE/CANCEL bar `#gsBar`.
  - Pop animation.
  - 3D thumbnails from an offscreen renderer.
  - Phone camera pulled back ×1.2, and NEW BUILD opens at pitch .42.
- The garage car's meshes are given castShadow via defineProperty. This lifts ART6_noCast, but only on the garage copy.
- The v87o W13 traffic code sits in its own module, `src/98w_w13_traffic.js`.
- The "New in" toast now needs `#menu.home` (98_garage_driver.js).
- Tests:
  - `t4/nb.js` taps PLACE after each held tap (SHOTHELD=1 adds the 04a/04b shots).
  - `t4/gsnew.js`: a bare NEW BUILD shot.
  - `t4/gsdbg.js`: studio state.
  - `t4/toast.js`: the toast check.
  - `t4/px12.js`: text size.

## Open
1. On the phone the hall walls/sign show only as a top strip. Tilt the camera further, or use setViewOffset.
2. CHOOSE TRACK at 852×393: the START RACE bar overlaps the WEATHER/CLASS rows (menu UI).
3. From the 2K gap list: a brick-shower transition, STEP VERTICAL, REDO.
4. nb.js: under the new camera the spoiler tap point sometimes lands on a cell with no room (31–33 parts).
