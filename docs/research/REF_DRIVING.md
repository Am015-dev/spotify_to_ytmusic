# Reference driving model: "Open Road" (tesana.com/play/b5ae027f-…) vs Mainhattan Overdrive v88f (drive26, 2026-10-08)

## Source
- Page `tesana.com/play/b5ae027f-d03a-4a7b-bd74-e14dc2aa222d` loads the game in an iframe:
  `https://play.tesana.ai/game-20260927-d048ed0e/f1e007ec6238/index.html` → `_app/index-LmBlU29_.js` (352 KB, three.js separate).
- The bundle is **minified** (short names) but not obfuscated. Prettified with prettier: 18 261 lines. Everything below was read in that code;
  names like `maxSteerAngle`, `steerInput`, `driftHold`, `slipAngle` are the bundle's own. Single-letter names are mine where I explain them.
- Input in the bundle is keyboard + gamepad only (`Ye.steer()`: A/D or arrows = ±1, gamepad axis 0 with 0.12 dead zone). No touch steering in it.
- Their own vehicle class was run in Node on a flat asphalt plane (`tools/refsim26.js`, the class lines 470-1286 of the prettified bundle,
  car = their `hero_supercar` spec: 1450 kg, grip 1.15, wheelbase 2.725 m, 0-100 3 s). Result: `qa26/refsim.json`.

## Their car controller (class `el`, `integrate(dt)`, fixed step 1/120 s)
1. **Steering input ramp** (digital keys too):
   `rate = (reversing or easing off) ? 6.5 : 5 − 2.4·clamp(v/60)` per second; `steerInput` moves toward the key value at that rate
   → full lock in 0.20 s slow, 0.38 s at 216 km/h; back to centre in 0.15 s.
2. **Speed-scaled steer angle = the grip limit** (`maxSteerAngle(v)`):
   `δmax = clamp(wheelbase·μ·(g + downforce/m) / v² + 0.03 + 0.03·(1 − smoothstep(10,30,v)), 0.06, 0.6)` rad.
   With their car: 0.22 rad at 50 km/h, 0.10 rad at 80 km/h. Full lock never asks much more than the tyres can hold.
   Plus counter-steer help: `δ = −steerInput·δmax + clamp(slip−0.1·sign, ±0.8)·0.9·smoothstep(3,9,v)` (auto counter-steer when sliding).
3. **Tyres**: per axle, slip angle from the bicycle model (`atan2(vLat + yawRate·a, |vLong|)` front, `− yawRate·b` rear), lateral force
   `μ·load·sin(C·atan(B·α/αpeak))` (a Pacejka-like curve), peak at 0.12 rad front / 0.13 rad rear, front shape 1.3, rear 1.42,
   friction circle `√(1 − 0.72·(Fx/Fmax)²)` front, `√(1 − 0.8·…)` rear. Rear grip × 0.5 with the handbrake.
4. **Yaw damping**: if the yaw rate exceeds the kinematic `v·tan(δ)/wheelbase` (capped by `μ(g+…)·1.1/v`), a torque pulls it back
   (`5·(1−0.94·driftAmount)·smoothstep(3,10,v)` per s), plus 0.12/s plain yaw damping. When `|slip| > 0.65 rad` a torque spins it straight.
5. **Drift**: only the **handbrake** (Space / gamepad A) — rear grip halved and the yaw damping is switched off (`driftHold`, which builds
   when slip > 0.2 rad with gas and steer into the slide). The plain **brake** is just a brake (front 68 % / rear 32 %, limited by grip).
6. **Assists** (`pl()`, on by default, settings "Steering & braking assist"):
   - no steer input → it steers along the road (pure pursuit to a point `12 + 0.9·v` m ahead, a lane offset), and counter-steers slip > 0.12 rad;
   - slip > 0.06 rad (3.4°) at > 5 m/s → throttle cut `1 − (slip − 0.06)·7`;
   - corner speed limit from the road's curvature (`al = 0.9` × grip speed) → it lifts and brakes before bends.
7. **Camera** (`chase`): distance 5.5 m, height 2.25, FOV 50→60 with speed; yaw follows `yaw + 0.45·smooth(slip)` through a critically
   damped spring ω = 6.5 /s (max 1.1 rad behind).

## Our model (v88f, `src/71_roam_drive.js` roamStep + `src/30_race.js` C26 + `src/93_cars_lego.js` CR_yaw + `src/98d_drive24.js`)
Heading `RO.h` rotates at a demanded yaw rate (bicycle `v/2.7·tan(lock)`, lock ramp `D24_shape`), capped by front grip `C26.muCity.road
15 m/s² / v`. The travel direction `RO.vh` follows the heading at `TUNE.gripRoad` 40 /s, capped by rear grip `15·(1 − C26.kR·brake)/v`,
and is clamped to 0.6 rad of the heading. Drift (`RO.dDir`) = travel direction follows at 0.049 × grip, a 1.5× yaw: a real slide.

## Numbers: 90° turn, full lock held, flat road (ours `tools/tTurn26.js` qa26/turn_*.json, theirs `tools/refsim26.js` qa26/refsim.json)
slip = angle between where the car points and where it travels (max / mean over the turn), t90 = time to turn 90°.

| case | ours v88f | ours drive26 | reference |
|---|---|---|---|
| 50 km/h, steer only | 0.5° / 0.4°, 1.73 s | 0.5° / 0.4°, 1.73 s | 10° / 5.3°, 1.95 s |
| 80 km/h, steer only | 0.4° / 0.3°, 2.17 s (scrubs to 53 km/h) | same | 8° / 5.3°, 3.1 s (holds 80) |
| 50 km/h, gas held + 0.4 s brake tap | **DRIFT 2.8° then slide** | 0.5° / 0.5°, no drift | 12.8° / 5.6° (brake only) |
| 80 km/h, gas held + 0.4 s brake tap | **DRIFT, 4.3° / 1.5°** (and up to 44-48° when the tap is a bit longer) | 3.5° / 1.1°, no drift | 8.2° / 5.1° |
| 80 km/h, brake only 0.6 s | 7.8° / 2.6° | 3.2° / 0.9° | — |
| DRIFT held (ours X / theirs handbrake) | 44-48° / 25° | 44-48° / 25° | 69-81° / 19-30° (their handbrake also brakes to 8 km/h) |
| 80 km/h, GAS+BRAKE held through the turn | drift at once | drift after 0.6 s (40°) | (no such control) |

## Root cause of "only drifts"
Not the tyre model: a plain steer turn in ours slips less than 1°, less than the reference (5-10°, a real tyre curve).
1. **GAS+BRAKE = DRIFT at once** (`src/98k_boost2k.js` B2K rule): with gas held, ANY brake press while steering (> 0.25) above 43 km/h
   started a full drift (44-48° slide, travel direction follows at 5 % grip). On PC: holding ↑ and tapping ↓ before/in a corner, the most
   natural way to slow down. On the phone: the seam rule counts a thumb within 12 px of both GAS and BRAKE as both, so a brake tap near GAS
   = drift. The reference has no such rule: its brake only brakes; only the handbrake drifts.
2. **Braking in a turn cut rear grip by 38 %** (`C26.kR .38`): the tail stepped out up to 8° at 80 km/h, and the clamp allowed 34°.

## What drive26 changes (`src/98e_drive26.js`, knobs in ⚙ Grip, docs/TUNE.md, src/assets/tune.json)
- GAS+BRAKE drift only after BRAKE is held 0.6 s (`TUNE.gbHold`) with steer ≥ 0.5 (`TUNE.gbSteer`); shorter = a normal brake.
  DRIFT button / X / Ctrl unchanged (drift at once). Races unchanged.
- `C26.kR` 0.38 → 0.12; slip outside drift capped at 0.12 rad (`TUNE.slipMax`, was 0.6).
- Not copied: their speed-scaled steer angle and throttle-cut assist. Our D24 steering already ramps lock (0.2-0.6 s) and caps it at
  1.4 × the grip limit, and its yaw onset matches theirs within 0.1 s (ours full yaw at 0.3 s, theirs 0.4-0.5 s). Their car turns
  wider at 80 km/h (3.1 s per 90° at a steady 80) where ours scrubs to ~53 km/h and turns in 2.2 s: kept, because Frankfurt junctions are
  tight (W13/W14 added the scrub after cars ran wide into walls).
