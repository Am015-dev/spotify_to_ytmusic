# HANDOFF debris-1 (2026-10-16)
1. Root cause: the floating bricks in rev70 ath_b_park_trees were NOT tree parts. They are the 10-brick team-colour transform burst (vehMode, src/20_race_world.js) that fires when a warp changes the car mode (4x4/car/boat), plus a smash (bush) when the warp lands the car on a prop (smashCheck).
2. Fix: roamWarp sets RO.rcT (1.5 s grace) at once; vehMode skips the burst for the player in that window; smashCheck silently clears a touched prop while the car is parked in the grace window (no debris, no combo).
3. Colours: cypress DG/G -> G/BG, fir cones -> BG/#2E8B47 (tr1.js, 1-line each). Shots docs/shots/debris1/{before,after}.png (same Athens park spot): bricks gone, greens lighter.
4. New GO debris1/float (checklist item debris1/float): 0 smashes on warp, 0 live bricks, 0 floating foliage props. Gate on built page: unit 0 FAIL; TAG=debris1,tr1,life1,xf1,terrain 42/44, only the known SLOW fails (xf1/land, life1/ath-density).
5. Left: a palm/oak canopy still hangs close over the camera in that shot (camera under a tree: needs a foliage-fade or camera-offset call); Alex look at the cypress brightness.
