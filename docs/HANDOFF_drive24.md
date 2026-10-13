v88f: QUICK REVIEW PASS (79749841), out/v88f pushed, DEPLOY msg sent to coordinator. Reviewer's next-build items (not blocking):
 1. Hilde card: 2nd text line runs under the HIL avatar → padding-right ~64 px. 2. Map: ⚙ (#tuG) over AREA COMPLETION → hide while the
 map is open; GARAGES-only view showed no garage icon → show ≥1 or a "nearest garage →" hint. 3. Map route diagonal leg through a block
 → check the polyline follows road centrelines; add a checklist item.

# >>> drive24c (2026-10-08 15:05) — release v88f fast track (coordinator): merge od-build25 + live, QUICK REVIEW, DEPLOY msg
Fixes this round: (1) follow/tail GPS = the leader's own route S.R (A* to the moving truck snapped to the far carriageway → false
"U-turn in 60 m" on Hot Drop; now "bear right in 90 m", qa24c/mission). (2) D24_despike: out-and-back spikes + destination hooks.
Athens U-turns: live 26 / branch 28 → 25 (7 left on tRoute's random 3-leg follow routes, Athens has no follow mission → open item).
tPlay phone 60 fps live v88e vs branch (qa24c/live60, br60): FAILs on BOTH = pre-existing: fra stuck (5.4 live / 7.4 branch, earlier
branch run 3.6), rotation DRIFT hidden, Athens start (player box ship-size, odd camera, random spawn → hits/reload vary by run).
Road collider (530,-200): same static 6.6 m box h 21 on live (qa24c/probe2.js) → pre-existing. 30 fps A/B stopped (scope cut).

# >>> drive24b HANDOFF (2026-10-08 14:20) — read this block + docs/HANDOFF_drive24b.md first
Branch alex/od-drive24 (HEAD = this commit). v88e merged (od-r3 63f4fca = live cc9b68d, LIVE_MATCH proven in a worktree).
Release candidate = current src (build: `tools/build.sh <ver> --local`). Steering defaults = sweep Z1. NO REVIEW sent yet, NO out/<ver> yet.

## What changed (all knobs in ⚙ Steer/Route + docs/TUNE.md + src/assets/tune.json)
1. BUG: ◀ straight to ▶ skipped the ramp (stRet path → full opposite lock in 0.17 s) — fixed in D24_shape (98d).
2. BUG: touch ◀▶ had two stacked ramps (steering kept building ~0.2 s after lift) — TUNE.stTouchDig=1 feeds TOUCH.dir like keys.
3. BUG: lane assist had no road direction on filler-grid streets (RO.rdT only cityAt/Autobahn) — fillAt fallback (71).
4. Less input→yaw lag: stIn 60, stOut 45 (were 11/16), yrIn 60 (new; was 11→7), yrOut 45 (was 22), stLim 1.4, stRampLo .2.
5. Routes: S-jog straightening D24_clean step 4 (TUNE.rtJog 14 m), D24_clr height check per 4 m step on groundAt (decks).
6. tools: tSteer24 settleX/flipsX/t90/hit positions+nearest car; tZig24 (zig-zag plots); tPlay FPS=30; qa24b/sw.sh, t90.sh sweeps.

## Metrics vs live v88e (tSteer24, 8 Frankfurt routes × 60+100 km/h; flips / counter-yaw °/s / settle s / settleX s / t90 s)
| | live v88e | new |
|---|---|---|
| keys 60 fps | 1.11 / 29.7 / 3.10 / 2.81 / 1.77 | 1.11 / 23.7 / 1.71 / 0.99 / 1.77 |
| touch 60 fps | 1.33 / 32.0 / 3.13 / 2.92 / 1.82 | 1.09 / 23.5 / 1.66 / 1.00 / 1.77 |
| keys 30 fps | 1.12 / 30.1 / 2.69 / 2.25 / 1.73 | 0.98 / 20.6 / 1.85 / 1.16 / 1.77 |
| touch 30 fps | 1.29 / 32.0 / 3.24 / 3.01 / 1.77 | 0.92 / 20.0 / 1.99 / 1.34 / 1.77 |
Second run (qa24b/h2_*): keys60 1.09 flips / settle 1.94, touch60 1.04 / 1.83. Flips vary ±0.1 run to run.
Targets: flips ≤ 1 ≈ met (0.92-1.11); settle ≤ 0.8 s NOT met (1.7-2.0 s). Why: the old settle clock starts 15 m past the route's
sharp corner where a 50 km/h car is still ~40° short of the new street (a 90° turn takes 1.77 s at full lock = live). settleX (clock from
turn exit) = 1.0-1.3 s, bimodal: half the turns ~0.1 s, the rest 2-4 s = big turns where the test driver re-centres onto the route line.
Every faster-ramp variant (sweeps P-X, Y7) brought counter-yaw back to 25-31 °/s. Straight-line yaw sign flips/km rose (155-180 vs 110-155;
a count, the car follows small taps more exactly — magnitude not measured).
Hits: first run 20 hits/48 min vs live 6; re-run with nearest-car logging: new 0.08-0.36/min vs live 0.54/min (touch). Hits are traffic-car
bumps (nearest car 4-5 m), plus one static spot on test route 5 at 30 fps that live also hits → noise, no wall regression found.
Routes: Frankfurt zig-zags 49 → 36 (live ~170), Athens 408 (live) → 100, turns/km 3.93 → 2.56, Athens U-turns 26 → 28 (not checked).

## Gate status (qa24b/rc/, build rc_dbg.html = out/d24z split + test modules)
- shots: qa24b/rc/drive/01_start…06_athens_drive (tyre gap max 0.03 m), qa24b/rc/mission/s0,s1 (turn cue "right in 30 m"… then
  "U-turn in 60 m" on Hot Drop follow — LOOK at it, may be a real U-turn cue). NOT looked at yet. No garage shot yet (tPlay SHOTS).
- tPlay 60 (FAST=1) phone: FAIL fra stuck 3.6 %, FAIL rotation check (DRIFT "hidden", steps []), FAIL road collider at (527,-200)
  (static world box, not drive24), FAIL ath hits 1.74/min (player was the SHIP: h 13.8 l 21.8). tPlay 30 (FPS=30 THROTTLE=1): stuck 5.8 %,
  same rotation + collider FAILs, ath: 1 page RELOAD, 2 loading screens, small text "TAP TO CONTINUE"/"YOU". Desk runs were still going.
- NEXT: run the same tPlay on live (base_dbg_e.html = live v88e debug page, build it from od-r3 63f4fca in a worktree) to see which FAILs
  are pre-existing; look at shots; then REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v; after PASS: OD_CHANGELOG v88f, out/v88f
  (overdrive.html, km.js, tune.json from src/assets, music/*.mp3 from live), DEPLOY msg to the coordinator.

# HANDOFF drive24 (branch alex/od-drive24, from live v88c src = od-r2 75248d2; v88d 3222a87 NOT merged yet)

Brief: mission routes ("random lefts/rights, sudden") + steering stability on left/right road turns + every knob in TUNE.
Gate still owed: tPlay on the split build, review shots, REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v, then DEPLOY msg to coordinator.

## Root causes found
1. **Routes** (`41_career_quests.js` qvAstar/qvPath): plain shortest distance on a graph of filler grid + both lane chains + 20 m proximity links.
   Equal-length staircases through the filler grid, lane hops, dead-end spurs at via points (M1_path joined legs with no heading),
   and destinations on the far carriageway gave zig-zags and U-turns. The HUD arrow pointed straight at the target through buildings
   ("Follow → 68 m"), so it swung left/right with no turn warning. Followed cars (Hilde, Kaiser, rivals, escort) slid along the raw
   polyline: 90° heading snaps at full speed, no slowing, no signal.
2. **Steering** (measured, `tools/tSteer24.js` trace): the car itself does NOT oscillate (open-loop pulse: 0 flips, yaw stops in 0.43 s).
   The instability is closed-loop: ◀/▶ and keys are on/off and any press reached full lock in ~0.1 s; above ~60 km/h full lock asks
   2-3× the yaw the tyres give (bicycle yaw v/WB·tan(lock) vs grip μ/v), so every short correction tap = max yaw (~57°/s at 50 km/h)
   → overshoot → counter-tap. Plus the yaw kept going ~0.4 s after let-go (yaw smoothing 7-11/s). Lane assist (TUNE.assist) at junctions
   picks the nearest road tangent; with assist 0 the bot was off-road less (5.9 % vs 14 %) but hit more; left unchanged (open item).

## Changes (all in src/, knobs in TUNE: 10_core.js defaults, 99t_tune.js drawer tabs Steer + Route, docs/TUNE.md table)
- qvAstar: turn cost TUNE.rtTurn (110 m / 90°), U-turn TUNE.rtUturn (800, also across 2 short lane hops), filler grid ×rtGrid 1.35,
  narrow +rtNarrow; start heading h0 (nav passes the car heading). Graph gets road class `G.K`.
- D24_clean: spur/loop cut, Douglas-Peucker (rtSimp 3 m), jog merge; stop at the destination instead of passing it.
- M1_path: via points snap to real streets (D24_nearMain), heading carried across legs, then D24_round (corner arcs, fvRad 16 m).
- 98d_drive24.js (new, in ORDER before 99t_tune.js): D24_round, corner speed cap D24_vcap (fvLat 4.5, fvDec 4), blinkers D24_blink
  (fvBlink), D24_side; HUD amber CSS; D24_shape steering (stOn, stRampLo .25, stRampHi .6, stK0 .05, stRet 12, stLim 1.1).
- 71_roam_drive.js: arrow = turn-by-turn via D24_cue (41) when on a GPS route: "Follow · left in 120 m", ≥ max(tcLead 5 s, tcMin 90 m)
  ahead, amber < 3 s; falls back to the old bee-line arrow off-route/near target. Yaw decays at TUNE.yrOut 22/s on let-go.
- Escort car + M1 follow/tail use rounding, corner caps, blinkers.

## Metrics so far
Routes (tools/tRoute24.js, 10 layouts per mission type, per GPS leg; qa24/route_*.json):
| | turns/km | turns < 80 m apart | U-turns | zig-zags | median min gap |
|---|---|---|---|---|---|
| Frankfurt before | 3.09 | 246 | 22 | 170 | 70 m |
| Frankfurt after | 1.83 | 69 | 1 | 49 | 160 m |
| Athens before | 3.93 | 645 | 26 | 408 | 35 m |
| Athens after | 3.04 | 321 | 25 | 211 | 50 m |
Hot Drop follow route: 15 turns/2 U → 6/0. Tail Kaiser: 22/4 U → 9/0. Athens U-turns left are real road geometry (turnarounds).
Steering (tools/tSteer24.js, keys, 60+100 km/h, 8 routes, rate-aware human bot; qa24/st_*.json):
| | flips/turn | counter-yaw °/s | settle s | straight yaw flips/km | hits/min |
|---|---|---|---|---|---|
| live v88c | 1.07 | 28.5 | 2.91 | 142 | 0.08 |
| new ramp .12/.4 | 1.13 | 18.9 | 2.46 | 92 | 0.70 |
| ramp .25/.6 (now default) | 1.04 | 13.2 | 2.32 | 82 | 0.30 |
| ramp .35/.8 | 1.13 | 8.2 | 2.54 | 45 | 0.47 |
"settle" = |heading error| < 4° held 0.5 s after exit; it is dominated by the bot re-centering 3-5 m of lateral offset, so the 0.8 s
target is not met by any build with this definition. Hits/min are low counts (noise). Running when handed off: new defaults with
yrOut 22 vs 9 (`qa24/st_new_key.log`, `qa24/st_new_yr9.log`). NOT yet measured: touch input, 30 fps, Athens steering, turn warning time.

## Open items for the next worker
1. Read the yrOut runs; pick defaults. Run touch (`INPUT=touch`) and 30 fps (`FPS=30`) on base_dbg vs new_dbg.
2. Warning time: `node tools/tCue24.js http://127.0.0.1:8766/local_dbg.html qa24/cue.json` (target: min ≥ 3 s).
3. Shots: `node tools/tShots24.js <url> qa24/shots` (mission turn cue + minimap, mid-turn, Hilde blinker) and `ATH=1 node t4/r2drive.js <url> <out>`
   (start, Frankfurt drive, low side views + tyre gap, Athens). Garage shot from tPlay. LOOK at them (blinker placement untested).
4. Merge v88d (coordinator: live 3222a87, adds src/99x_test_mode.js + music): re-split or merge alex/od-r3's src, verify_live.
5. tPlay: `FAST=1 node tools/tPlay.js http://127.0.0.1:8766/local_dbg.html qa24/tplay`. 0 console errors.
6. tune.json: add the new knobs with their defaults (Alex wants configs included); OD_CHANGELOG entry; out/<ver>.
Build: `tools/build.sh d24x --local`; base build for A/B = `base_dbg.html` (copy of live local_dbg, untracked); server :8766 (`setup.sh`).
