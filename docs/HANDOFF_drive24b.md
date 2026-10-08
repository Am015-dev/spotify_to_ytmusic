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

## Results so far (tSteer24 keys, 60+100 km/h, 8 Frankfurt routes, 56 turns; t90 = hold ◀ at 50 km/h until 90°)
| build / knobs | flips | counter-yaw °/s | settle s | straight wobble /km | t90 s |
|---|---|---|---|---|---|
| live v88d (base_dbg) | 1.13 | 28.4 | 2.97 | 140 | 1.77 |
| drive24 defaults (ramp .25/.6) | 1.13 | 9.3-9.5 | 2.29-2.42 | 48 | 1.98 (slower!) |
| A: ramp .1 up to 50 km/h (stRampV0 50), stLim 1.4, stK0 .35 | 1.13 | 31 | 2.98 | 123 | 1.80 |
| B: A + asMax .35, assist 3 | 1.09 | 30 | 3.03 | 112 | 1.80 |
Touch (60+100): v88d 1.25 flips / settle 3.19; drive24 1.16 / 2.40; with stTouchDig 1.15 / 2.56. 30 fps keys (drive24): 1.02 / 1.97.
t90 sweep (qa24b/t90.sh): even no ramp gives 1.78 (shaping off = 1.76): the ramp is what costs turn speed.
Routes Frankfurt zig-zags: 49 (drive24) → 36 (jog pass + deck-aware clearance), U-turns 4-5, turns/km 1.83.
Coordinator 12:31: steering first; zig-zags at 36 OK unless a visible U-turn; REVIEW before ~400k context.

## Open
- measure: touch/keys × 30/60 fps, new vs v88d; route fra+ath; time-to-90°; shots; tPlay; REVIEW; DEPLOY.

## Notes (12:56)
- Live is now v88e = cc9b68d (R3 levels/perks, English UI): merge its src (alex/od-r3) BEFORE building out/<ver>.
- Bugs found in drive24 steering: (a) ◀ straight to ▶ skipped the ramp (stRet path → full opposite lock in 0.17 s), fixed;
  (b) assist had no road direction on filler-grid streets (RO.rdT only from cityAt/Autobahn), fixed with fillAt.
- t90 vs stability trade: a short ramp at corners brings back ~30°/s counter-yaw; testing a hold-accelerated ramp (stHold/stRampFast).
- New metric settleX/flipsX: clock from turn exit (heading first < 8° off the new street); old settle includes ~0.8 s of the turn itself.

## Sweeps (keys 60+100, qa24b/sw_*.json; flips / counter-yaw / settle / settleX / straight wobble / t90)
- S defaults new7: 1.07 / 8 / 2.17 / 1.66 / 46 / 1.98
- short ramp at corners (P,Q,R,T-W,X1-4): t90 1.8-1.9 but counter-yaw 20-31, wobble 90-125 — rejected
- Y4 stIn 40, yrIn 40, stOut 30, yrOut 30 (less input→yaw lag): 0.96 / 16.5 / 1.87 / 1.28 / 131 / 1.82  ← best so far
- settleX is bimodal: half the turns ~0.1 s, the rest 2-4 s = big turns where the driver re-centres onto the route line
