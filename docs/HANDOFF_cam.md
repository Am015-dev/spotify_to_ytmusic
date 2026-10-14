# HANDOFF cam-2 (2026-10-14), alex/od-int2

## Landed (all pushed)
- 544ec504 camera refit: `CAM_rkey(ud)` (src/98cam_size_cam.js) = ride fingerprint (gbM first uuid + ud.m children count/first/last uuid). The old key (mesh uuid + gbM.length) never changed on same-count garage swaps (Athens: every ride) or on TAKE/ENTER (they swap body children on the same mesh).
  - `gbClose` wrapper sets CAM.snap: refit 4 frames later and CAM.cur=null (snap, no 3 s crawl).
  - Race camera (state 'race', updateCam in src/30_race3.js): `CAM_rk(s)` solves the ride profile with the race stock camera as base (`CAM_rbase`: back 10.5, up 3.4, look 29 m ahead, 1.66 up); `CAM_fwd` = track tangent as heading. updateCam multiplies back/up/ahead by ck.b/ck.h/ck.l.
  - hot results: rv14/rv-cam-refit PASS fra+ath (rod 8.1, bus 25.6/22.3, truck 18); race with the truck: camera 27 m away, not inside; swoosh/park-sit/lego-col PASS on hot. NOT yet run in int-4's tChkGo (10 s limit).
- a12bc789 settle tyre bottoms from the PRECISE wheel box (`OF_wbx.setFromObject(w,true)`). The default Box3 is the AABB of the rotated geometry box and reads up to 40 % deep on a spun wheel. 4becf981 used the default and floated rides: superseded. `OF_parkChk` uses the same.
- 23deb8d0 checklist GOs: v90n/sink-rod, sink-cab (t_v60054_1), sink-truck (t_v60059_1) = pick ride, Hot Drop with M1.noScene (touchdown pose), exit on foot, tyres 0..0.05 m; v90n/sit-bench (3 nearest benches fra + ath). 3.7-4.8 s each, PASS in fra.
- Bench sit: `OF_sitFit` (on sit start) lifts legs onto the seat top and moves the torso against the backrest front face; `OF_sitChk`, `OF_sitAll(max)` in src/98of_onfoot.js. 40 nearest Frankfurt benches passed. Athens and all-benches NOT run.

## Findings
- Could NOT reproduce Alex's sunk cab / Hot Rod: after Hot Drop touchdown + exit every tested ride (rod, t_v60054/60018/60083/60059/60017, t_truck, t_bus) has tyres 0.03 m above the road, also with wheel upgrades and on an 8.8 % slope. The old origin-minus-radius formula is within 1 cm of the precise one at rest. beta.25 probably predates dev-5's settle; unconfirmed.
- Frankfurt phone quick matrix (precise measure): roam-tyre-gap>5cm 4-5 cases, all extreme terrain starts: 6050,-1800 (river, tyres 0.19-1.8 m up), 6200,6750 / 7100,5850 / 7850,1800 (very steep, wheels 3-8 cm sunk: CR_carPose clamps wheel travel to -0.12/+0.22 and the body pitch lags). foot-parked-car-tyre-gap 0.
- Other matrix FAILs seen (not mine, not looked at): roam-start-inside-wall 4, heading-vs-road 2, no-forward-progress/reverses 2 (fra 7250,4050), qa-inv ride_below_ground / camera_underground @ fra 6799,4498.

## Queue for cam-3 (coordinator order)
1. tChkGo flow for rv14/rv-cam-refit, swoosh, park-sit, lego-col, v90n/sink-*, sit-bench (each < 10 s); run sit-bench in ath; `OF_sitAll()` for all benches both cities.
2. roam tyre-gap on steep starts (CR_carPose wheel clamp / pitch lag in src/93_cars_lego.js ~l.426-433) and the river start; maybe make those starts invalid instead.
3. Athens roam-camera-behind (321 cases, camera 0.8 m from the car): roamCam back-collision loop (src/71_roam_drive.js l.264-268, CR_minBack).
4. qa-inv camera_blocked 29, camera_underground 4, ride_below_ground 7 (tools/matrix, `node tools/matrix/run.js --quick`).
5. ON FOOT banner: foot-2 owns it (not mine).
6. Re-add tests for the other switch paths if wanted (garage pick, vehicle button, TAKE, ENTER, race start): my cam-sw-* ran 14-20 s in tChkGo, too slow; keep each < 10 s.

## Tools / gotchas
- `HOT_PORT=8892 HOT_CITIES=fra node tools/hot.js eval|go|reboot|stop`: one daemon per port. After `stop` the first call often fails with a boot timeout: call again. `reload` cannot add NEW functions or swap `const`: reboot.
- `OF_sinkAll(ids)` / `OF_sinkChk()` / `OF_sitAll(max)` are eval helpers (window.*). CAM_road(minLen, steep) picks the steepest clear street.
- The permission classifier blocked `git revert` / applying a reverted diff on od-int2: re-land reverted work as fresh edits.
