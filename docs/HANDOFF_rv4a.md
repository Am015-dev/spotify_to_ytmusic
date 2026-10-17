# HANDOFF rv4A (2026-10-17): Athens camera pumping + spawn
1. Cause: in Athens the auto car <-> 4x4 form change re-fitted the camera (8.6 -> 10.5 m back, 4.5 -> 7 m high) at every terrain crossing. The terrain lift and the height lag on jumps added more. 98cam now keeps the ride's fit in auto mode.
2. roamCam (src/71_roam_drive.js): distance, height and slope are critically damped springs (camSpr). Height uses vertical feed-forward with a 1.2 m lag bound. Slope pitch has a 3 % deadband; the air lift eases; the speed pull-in is halved. TUNE.camSpr=0 gives the old rig back.
3. The Athens free roam spawn is ATH_SPAWN, on Andrea Syngrou (src/70_roam_world.js), north-bound lane. A divided-road boot snap now lands in the lane. rv2k4 GOs warp there first (RV4A_home).
4. Measured on the built page: ath-cam 0 / 0 / 2 swings in 3 × 120 s (was 6-18/min), max jump 1.5 m; ath-spawn 90 km/h in 3.7 s. Slope shot: Ardittou, 7 % uphill, horizon level.
5. Left: the camera fit for a manually picked 4x4 is still far and high (10.5 m back, 7 m up); a feel pass with Alex.
