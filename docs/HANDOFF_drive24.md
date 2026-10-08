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
