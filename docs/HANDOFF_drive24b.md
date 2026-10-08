# HANDOFF drive24b (branch alex/od-drive24; read docs/HANDOFF_drive24.md first)

Brief (coordinator): steering settle ≤ 0.8 s and ≤ 1 flip per turn without slower 90° turns; remove artefact zig-zags; check Athens;
FULL review on the split build; DEPLOY message to the coordinator after PASS. Never deploy.sh.

## State
- v88d merged (od-r3 9a2514e = live 3222a87 src; base build proven LIVE_MATCH). `base_dbg.html` = live v88d debug page (A/B base).
- Test pages: `new1_dbg.html` = first drive24b build. Server :8766 (`python3 -m http.server 8766` in repo root).
- Results in `qa24b/`.

## Findings
1. Car alone is stable: open-loop pulse 0 flips, yaw stops in 0.22 s (v88d: 0.43 s). Camera: smoothed follow (6.7/s) lags heading
   ≤ 7.6° in a turn, no oscillation of its own (logged camH/camera yaw in tSteer24 dump cols 10-12).
2. TOUCH bug: ◀/▶ go through TOUCH.steer (own ramp, 7/s let-go) and then D24_shape's ramp on top; after a finger lifts the D24 ramp
   kept BUILDING until it met the decaying TOUCH.steer → ~0.2 s extra lag → old data: touch 2.9-3.1 flips/turn vs keys ~1.1.
   Fix: TUNE.stTouchDig=1, buttons feed TOUCH.dir (digital, like keys) into D24_shape.
3. Lane assist (TUNE.assist) helps settling (old data: assist off → 2.4 flips vs 1.1) but acted up to 46° off the nearest road, so a
   release mid-junction pulled back to the old street. New knob TUNE.asMax (rad; .8 = old) for a narrower, firmer assist.
4. Zig-zags (tools/tZig24.js plots, qa24b/zig_fra_*.png): most are S-jogs where a route crosses a road or leaves a bridge via an off-line
   junction node (±30-55°, 10-15 m sideways in 25-90 m). Real staggered junctions (2 real 90° turns 55-70 m apart) stay.
   Fix: D24_clean step (4), TUNE.rtJog 14 m.

## Open
- measure: touch/keys × 30/60 fps, new vs v88d; route fra+ath; time-to-90°; shots; tPlay; REVIEW; DEPLOY.
