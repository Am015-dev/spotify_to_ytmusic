# SuperTuxKart chase camera (ported, stkcam-r24m)
Pin: supertuxkart/stk-code@e05fef37e9d5045b7d272f56216dcc981bd6e616, `src/graphics/camera/camera_normal.cpp` (`CameraNormal::moveCamera`, `getCameraSettings`; the task named `src/graphics/camera_normal.cpp`, it moved to `camera/`). Licence GPL-3.0-or-later ([../sources/licences.md](../sources/licences.md)); code only, no STK assets.

## What STK does
- `ratio = speed / max speed without zipper`, clamped to >= -0.12.
- Wanted offset in the kart frame: back `-2.8 - 5.6 * ratio` (times sqrt(smooth_position)), up `0.85 + ratio / 2.5`, swung sideways by half the skid angle.
- ONE state: `offset += (wanted - offset) * delta`, `delta = dt / smooth_position` (default 0.2 s); rotation slerps with `dt / smooth_rotation` (0.125 s). Target = kart + 0.5 up.
- No speed FOV, no wall pull-in in the normal camera.

## What we ported (`src/98sc_stkcam.js`, SKC)
- The single smoothed state: speed ratio smoothed once (STK delta, `SKC.tp` 0.6 s; the FOV speed term uses a slower 1.5 s copy, a FOV change reads as a zoom).
- Wanted length = our rig (`RCAM` b/bk/h/hk, after the size fit) at that ratio + a 0.45 m boost pull-back.
- It runs as the LAST `roamCam` layer: keeps the direction the layers below chose (car -> camera line, orientation untouched) and sets only the length and the FOV.
- Kept: our wall handling (roamHit scan behind the car + the foliage-cam raycast) as a limit with hysteresis: in fast (10/s), hold 0.6 s, out <= 1 m/s.
- One FOV: base + speed + eased boost (4 deg) + kick (<= 1.5 deg), <= 7 deg/s.
- Not ported: the skid side swing, the flying/falling modes, TV cameras. `?stkcam=0` = the old stack.

## Measured (GO cam/steady, `src/99cst_camsteady_go.js`, phone profile)
- beta.161: FAIL both cities. City race 8-11 distance reversals per 10 s, zoom-out up to 2.4 m/s, FOV up to 19 deg/s.
- With SKC: PASS both cities. Distance reversals 1-2, zoom-out <= 0.4 m/s, FOV <= 6 deg/s.
- Why the old stack pumped: roamCam (raw speed -> FOV, roamHit pull-in re-solved every frame), the foliage-cam pull, the juice pull + FOV and the speed-feel pull-back + boost FOV each move the camera at their own rate. Turning any one of them off did not fix it.
Shots: `docs/shots/stkcam/{boost,hairpin}_{fra,ath}.jpg`. Handoff: [../../HANDOFF_stkcam-r24m.md](../../HANDOFF_stkcam-r24m.md).
