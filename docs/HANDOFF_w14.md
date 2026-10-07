# W14 handoff (speed feel + city steering) — branch alex/od-w14b

Base: src from alex/od-garage7 (= live v87p, verify_live LIVE_MATCH 9ee7fad). The garage renamed W13's 99a to 98w_w13_traffic.js; the speed feel
(camera, FOV, speed lines) now lives in `src/99a_w14_drive.js` (added to ORDER before 99_api.js). Physics in 71 (`W13S`, `W13_corner`, `W13_lift`).

## Speed + junction (done)
- City top ≈121 km/h (W13S.city .82), open 1.0, AB 173; pull falls with (v/top)².
- Corner rule (W13_corner): scrub 20 m/s² only when lock is held one way past 0.18 rad (~10°) of rotation (ramps to full over 0.15 rad more) AND
  the yaw asked exceeds grip (RO.c26x>1). Self-limits near 50 km/h. Throttle lift (60%) gated by the same rotation (0.1→0.22 rad).
- tW13f (FAST, OFF=78): braked turn on road -4.8 m; no-brake 89 km/h on road -0.9 m (was +28 m); slalom city 118-120, AB 158-163 (no loss).

## City steering (Alex: "steering and turning quite buggy") — probe tools/tW14s.js (real touch, per-frame log, ramp-free stretch)
Live v87p numbers: yaw t63 0.08 s tap, 0.17-0.33 s hold (slow ramp: touch steer starts 12% and ramps 2.7/s); tap/quick release reverse yaw 16-23%;
after any bump at low speed the unstuck pivot (99_api crTurn, 5 rad/s) turns the car 75-90° by itself at 4.8°/frame (seen at 90 km/h runs, w14
quick+lane both pinned); BRAKE+steer on touch above 86 km/h silently triggers a handbrake drift (30_race ctlPlayer) — with the faster city car that's
every street. Also: a probe artefact (car launched off a ramp, in the air) looked like 14-50° slip: always check airPct.
Fix (W14_ST in 10_core): touch starts 25%, ramp ×1.5; pivot 1.6 rad/s and cancelled when the player steers; city auto-drift only >125 km/h.

## Gate status / next
Gate runs on w14e: qa_w14/{steer,feel,tyre,tplay_w14}. Live baselines: qa_w14/tplay_live (Fra walls 0, stuck 6.9 %; Ath walls 1.87, stuck 6.9 %).
Live build for comparison: git worktree ../odlive at origin/alex/od-garage7, served on :8767.
Then REVIEW → on PASS rebuild on current live, v87q changelog entry, out/v87q, DEPLOY to coordinator.
