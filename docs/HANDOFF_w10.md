# Worker 10 handoff (2026-10-07): brake twitch + traffic contact
Branch alex/od-w10 (src = live v87j ffe02b7 re-split + 4 module edits). Probe: `tools/tW10.js` (TEST=brake|traffic|shots, MODE=phone|desk, FAST=1).

## Root causes
1. Brake twitch = the "pinned → UNSTUCK" helper in roamStep (71_roam_drive.js). It counted *holding BRAKE* and *any speed < 5 m/s* as pinned,
   so 0.6 s after braking to a stop (and 0.6 s into pulling away from a stop) it turned the car ±22.5° and set v=10 m/s. Braking itself never yawed (0.00°).
   Fix: pinned only when really not moving (< 2 m/s) with throttle, or in a blocked reverse (brake held > 1.2 s).
2. Traffic "jumps back" = non-smash contact in hubTrafficStep (70_roam_world.js): player teleported 0.9 m back, speed capped to car speed+4 m/s,
   traffic car moved back c.t-=0.01 of its segment (0.6 m in one frame, 3.2-3.8 m spring-back). Fix: W10_bump (95_drive_flow.js) = momentum exchange
   along the lane (e=0.1), side hits stop the player's sideways motion and shove the car a little sideways for good; the car then brakes to a stop (W10_brake, hitT)
   and pulls away at ≤4 m/s². Horn (10_core.js) now makes nearby cars stop 1.5 s instead of jumping back 8 % of their segment. Smash rules (≥150 km/h / SMASH) unchanged.
   Race AI: ship-ship contact has no spring-back; race traffic code still has a 0.9 m lateral shove but races have no civilian traffic since v87b (left alone).
   Not changed: wedding-car escort quest (41) moves nearby cars back 5 %/frame within 9 m.

## Numbers (tW10, FAST=1, real touch/keys)
Brake, total yaw after the stop, 40/80/120 km/h: before 110°/70°/45° (repeated UNSTUCK kicks), after 0°/0°/0°; yaw while braking 0.00°, lat v 0.
Traffic (stopped car on the Autobahn lane, desk keys): before: car back-step 0.6 m/frame, spring-back 3.2-3.8 m, player back-teleport 0.9 m, 119→14 km/h in 1 frame.
After: 20 km/h: car pushed 1.2 m forward, 0 back-step, player stops smoothly; 120: player 119→54, car slides 28 m forward braking; 159: SMASH as before.

## tPlay (FAST=1, phone, 1 min/city) v87k candidate vs live v87j
Fra: walls 0 vs 0.88/min, stuck 12.9 vs 12.8 %, 64.4 vs 65.4 km/h. Ath: walls 1.75 vs 3.5/min, stuck 12.9 vs 0 %, 35.7 vs 78.4 km/h.
Athens stuck/avg differ by route: 0.3-min DEBUG traces of both builds are frame-identical for 14 s (same 33 % start stuck) and split only when the routes diverge;
earlier live runs showed Ath stuck 3.5 % / Fra 5.8 %. FAST tPlay is not deterministic under contention (docs/FAST-MODE.md).
Shots: docs/shots/w10/. Note: tW10 shots only render with FAST=1 (non-fast stays black in this harness).
Tyre gap: traffic wheel instances 0.04 m; the player number from tW10 (-0.14 m) uses wheel-mesh bboxes vs groundAt and is not comparable (no wheel/ride-height code changed).

## Reviewer FAIL on 413de02 (07:55): todo for the next worker (fixes accepted, evidence missing)
1. Athens stuck: tPlay phone Athens 3x per build (live v87j vs w10), non-FAST if possible; report stuck % + avg km/h per run; w10 mean must be no worse than live.
   Plus scripted: nose into a wall at 20 km/h, hold GAS 5 s, the car must free itself as on live (v86z behaviour). Risk to check: my pinned threshold
   now needs < 2 m/s (was < 5 m/s); a car grinding along a wall at 2-5 m/s no longer gets the UNSTUCK turn. If it regresses, alternative:
   keep < 5 m/s but only when |RO.v|*dt - mv is large (velocity being eaten by collisions), i.e. not during normal acceleration.
2. Player tyre clearance: measure per tyre with Box3.setFromObject(wheel,true) or a ray from 0.6 m above the contact point, on w10 AND live.
   My bbox probe gave -0.143 (w10) vs -0.064 (live), probably the place()+20-tick timing (suspension settling), unverified.
3. Drive-feel frames: 90° turn strip + slalom strip (phone, real touch, slip < 5°, camera lag < 0.2 s); low side view with the PLAYER car in frame
   (tW10 TEST=shots: the camera sits 11 m to the side of the midpoint; on the Autobahn the player was out of frame, move closer / aim at the player).
   Drive in the traffic direction (strips showed WRONG WAY).
The second Athens tPlay pair (qa_tp_ath2_*) did not finish before handoff.
