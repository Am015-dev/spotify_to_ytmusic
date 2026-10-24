# Racers: camera
Pins: [../sources/racers.md](../sources/racers.md). `RaceCameraController`, `g_defaultCameraFov`.

## Facts
- FOV 65; +30 during warp; shake clamped 40-80.
- 3 player views (pitch deg, height, distance): near (5, 35, 20), mid (8, 25, 30), far-high (8, 45, 10).
- Lag: position 0.05-0.10, rotation 0.25 (exponential). Closest approach 12; turn look-ahead gain 80. View change blends over 2 s.

## What we have
- FOV 62 (+26 at speed) in `src/30_race*.js`; roam camera `src/71_roam_drive.js:roamPose`, `roamCam`; solver `CAM_solve` (unit-tested in tools/unit/logic_core.js). Loop notes: HANDOFF_cam*.md ([../../HANDOFF_cam.md](../../HANDOFF_cam.md), [../../HANDOFF_camloop4.md](../../HANDOFF_camloop4.md)).
- GOs: `src/99c5_camstable.js`, `tools/tCamGo.js`.

## Gap
Close enough. Racers has 3 selectable views; we have one chase cam. Optional: a far-high view.
Excerpt (LGPL, short): [code/camera.md](code/camera.md)
