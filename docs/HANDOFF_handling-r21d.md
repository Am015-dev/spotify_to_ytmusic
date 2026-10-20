# handling-r21d
- Measured (real roam functions replayed in a vm, tools/unit/logic_handling.js): full-lock yaw 0.99 / 0.51 / 0.34 rad/s at 50 / 100 / 150 km/h, so the review's 0.14 at 150 does not reproduce in the code path; no steering change needed there. Not confirmed on the live page (headless boot too slow here).
- Steer ramp: stRampLo .2 -> .12 (90% of full lock at 18 km/h: 0.23 s -> 0.18 s).
- Drift: slip at 0.4 s 0.41 -> 0.51 rad, at 1.5 s 0.96 -> 0.70 rad (was unbounded). New TUNE: drSnap 14 (yaw build-up), drMax .7 (slip cap), drExitT .4 / drExitG 12 (grip springs back on release; exit < .09 rad in .35 s).
- Braking and chase cam untouched. GO feel/handling (src/99c7_handling.js) + unit group `handling`.
- Left: confirm the drift feel by hand on a phone; the review's 1.3 s slip figure did not reproduce in the replay either.
