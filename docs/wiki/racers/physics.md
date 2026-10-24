# Racers: car physics
Pins: [../sources/racers.md](../sources/racers.md). Classes `RacerCarBody`, `RacerPhysics`, `DriveController`.

## Facts
- No top-speed clamp: drag = mass*thrust/vmax^2, speed settles where drag = thrust. Player base vmax 110, AI route vmax 120. Braking thrust x2.
- Steering radius 40..4096 (`SetTurnRadius`); widens with speed: v^2*mass/(grip*g) (`ComputeMinTurnRadius`).
- Grip default lateral 3.0, friction 0.25; every surface overrides grip/friction/rolling (`.tmb`, `SurfaceTable`).
- Powerslide: >= 3 wheels down, no wall contact, facing within ~32 deg of velocity (`CanPowerslide`); banks up to 45 deg; ends below speed 0.03.
- Air: gravity 39 (x4 airborne); landing bounce x1.15-1.3; kept within 45 deg of upright.
- Walls: speed into wall removed, then 30 % of the rest (`ApplyWallResponse`); nose-first hit adds 200 ms yaw kick; spin-out 0.6 s.
- Stats 0-100: accel and top speed move only +-5 %; handling scales steering 0.7-1.0 (`SetAccelerationStat`, `SetHandlingStat`).

## What we have
- Race physics: `src/30_race.js:stepSim`, `physPlayer`, `ctlPlayer`. Free roam: `src/71_roam_drive.js:roamStep`, wall slide `roamGlance`, `roamBounce`.
- Drift/boost: `src/98k_boost2k.js`. Damage: `src/98dmg_damage.js`. Handling GO: `src/99c7_handling.js`.
- Tuning knobs: [../../TUNE.md](../../TUNE.md).

## Gap
Our crash model is bigger (smash, damage, wreck). Racers crash = time loss only; worth copying for races (30 % loss, 0.6 s spin).
