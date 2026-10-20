# Playtest bot report

Run 2026-10-20T08:57Z · base 074f9bc · build http://localhost:8813/ · seeds 20261020,20261021,20261022,20261023,20261024,20261025,20261026,20261027,20261028,20261029,20261030,20261031 · 4 waypoints/run · wall 462 s total (budget 60 s per scenario)

Bot: `src/99c8_bot.js` (GO `bot/nav`, `bot/race`), runner `tools/tBot.js`. It drives with the game's own keys through `roamStep(1/30)` (no teleport between waypoints, no real-time play). Cells are 100 m map cells (`x,z` = south-west corner).

## Scenarios

| result | city | scenario | wall s | detail |
|---|---|---|---|---|
| PASS | fra | nav seed+0 | 26 | BOT NAV Frankfurt · 4/4 waypoints reached · 2.77 km in 120 sim-s · resets 0 · peak 29 m/s · max step 88 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | nav seed+1 | 32 | BOT NAV Frankfurt · 4/4 waypoints reached · 3.36 km in 187 sim-s · resets 0 · peak 29 m/s · max step 48 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: -1000,300 stuck 1s |
| PASS | fra | nav seed+2 | 25 | BOT NAV Frankfurt · 4/4 waypoints reached · 3.11 km in 154 sim-s · resets 0 · peak 29 m/s · max step 35 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | nav seed+3 | 33 | BOT NAV Frankfurt · 4/4 waypoints reached · 4.48 km in 215 sim-s · resets 1 · peak 29 m/s · max step 34 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: -300,-1300 reset |
| PASS | fra | nav seed+4 | 24 | BOT NAV Frankfurt · 4/4 waypoints reached · 3.05 km in 149 sim-s · resets 0 · peak 36 m/s · max step 24 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | nav seed+5 | 27 | BOT NAV Frankfurt · 4/4 waypoints reached · 3.72 km in 164 sim-s · resets 0 · peak 31 m/s · max step 39 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| **FAIL** | fra | nav seed+6 | 25 | BOT NAV Frankfurt · 3/4 waypoints reached · 3.13 km in 157 sim-s · resets 2 · peak 29 m/s · max step 40 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · FAILED leg 3 -1975,295→-2368,-47: auto-reset ×2 at cell -2200,-100 reset · worst cells: -2200,-100 reset / -2600,-100 reset |
| PASS | fra | nav seed+7 | 31 | BOT NAV Frankfurt · 4/4 waypoints reached · 3.85 km in 184 sim-s · resets 0 · peak 29 m/s · max step 44 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | nav seed+8 | 33 | BOT NAV Frankfurt · 4/4 waypoints reached · 4.07 km in 184 sim-s · resets 0 · peak 31 m/s · max step 37 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | nav seed+9 | 17 | BOT NAV Frankfurt · 4/4 waypoints reached · 2.31 km in 99 sim-s · resets 0 · peak 31 m/s · max step 43 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | nav seed+10 | 27 | BOT NAV Frankfurt · 4/4 waypoints reached · 2.82 km in 161 sim-s · resets 2 · peak 29 m/s · max step 35 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: -800,200 reset / -1000,-500 reset |
| PASS | fra | nav seed+11 | 24 | BOT NAV Frankfurt · 4/4 waypoints reached · 3.21 km in 150 sim-s · resets 0 · peak 33 m/s · max step 29 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | race | 29 | BOT RACE Frankfurt Westend Split · 1ST in 141.5 s · gates 5/5 (finish logic fired: true) · stuck 0 (≤ 1) · max step 96 ms · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | nav seed+0 | 47 | BOT NAV Athens · 4/4 waypoints reached · 3.75 km in 222 sim-s · resets 1 · peak 36 m/s · max step 76 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: 1600,-2900 reset / 1500,-2900 stuck 3s |
| PASS | ath | nav seed+1 | 19 | BOT NAV Athens · 4/4 waypoints reached · 2.7 km in 128 sim-s · resets 0 · peak 31 m/s · max step 58 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | nav seed+2 | 51 | BOT NAV Athens · 4/4 waypoints reached · 5.63 km in 298 sim-s · resets 0 · peak 29 m/s · max step 88 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | nav seed+3 | 26 | BOT NAV Athens · 4/4 waypoints reached · 2.59 km in 162 sim-s · resets 1 · peak 30 m/s · max step 77 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: 1500,-2900 stuck 0s+reset / 1500,-3000 stuck 0s |
| PASS | ath | nav seed+4 | 24 | BOT NAV Athens · 4/4 waypoints reached · 2.86 km in 139 sim-s · resets 0 · peak 30 m/s · max step 54 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | nav seed+5 | 31 | BOT NAV Athens · 4/4 waypoints reached · 4.23 km in 172 sim-s · resets 0 · peak 31 m/s · max step 37 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| **FAIL** | ath | nav seed+6 | 10 | BOT NAV Athens · 1/4 waypoints reached · 0.74 km in 54 sim-s · resets 2 · peak 29 m/s · max step 51 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · FAILED leg 1 1340,-2847→1102,-2197: auto-reset ×2 at cell 1300,-2800 reset×2 · worst cells: 1300,-2800 reset×2 |
| **FAIL** | ath | nav seed+7 | 38 | BOT NAV Athens · 3/4 waypoints reached · 3.1 km in 204 sim-s · resets 2 · peak 31 m/s · max step 57 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · FAILED leg 3 1595,-2880→2029,-3016: auto-reset ×2 at cell 1600,-2900 stuck 3s+reset×2 · worst cells: 1600,-2900 stuck 3s+reset×2 |
| PASS | ath | nav seed+8 | 31 | BOT NAV Athens · 4/4 waypoints reached · 3.37 km in 176 sim-s · resets 0 · peak 30 m/s · max step 77 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | nav seed+9 | 33 | BOT NAV Athens · 4/4 waypoints reached · 4.25 km in 188 sim-s · resets 1 · peak 33 m/s · max step 46 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: 1000,-3400 reset |
| PASS | ath | nav seed+10 | 26 | BOT NAV Athens · 4/4 waypoints reached · 3.15 km in 169 sim-s · resets 0 · peak 29 m/s · max step 56 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | nav seed+11 | 22 | BOT NAV Athens · 4/4 waypoints reached · 2.96 km in 138 sim-s · resets 0 · peak 32 m/s · max step 48 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | race | 20 | BOT RACE Athens Akropolis final · 1ST in 102 s · gates 5/5 (finish logic fired: true) · stuck 0 (≤ 1) · max step 105 ms · NaN 0 · falls 0 · JS errors 0 |

## Worst cells (all runs, both cities)

| cell (city x,z) | counts |
|---|---|
| ath 1600,-2900 | stuck 3.1 s, reset 3 |
| ath 1300,-2800 | reset 2 |
| ath 1500,-2900 | stuck 3.3 s, reset 1 |
| fra -300,-1300 | reset 1 |
| fra -2200,-100 | reset 1 |
| fra -2600,-100 | reset 1 |
| fra -800,200 | reset 1 |
| fra -1000,-500 | reset 1 |
| ath 1000,-3400 | reset 1 |
| fra -1000,300 | stuck 1.0 s |
| ath 1500,-3000 | stuck 0.2 s |

## JS errors during the run

none.

## Findings for the coordinator to route (hand-written, kept between runs; tools/tBot.js appends this file to BOT_REPORT.md)

1. **Athens: road graph leads into an enclosed pocket, cell 1500,-2900 (pin at 1590,-2806; the leg-1 goal node is at 1640,-2799).** The nearest street is Petmeza (sec, 8.5 m wide), 30 m away. From the pin the car moves only 10-12 m in any of 8 headings in 2 s, so it sits in a courtyard or plot between buildings. `navPath` routes through it, and the bot stays boxed in even with back-outs (seed+1, leg 2: `no arrival`, or `auto-reset ×2` when the game's hop fires twice). Quest GPS (`qvGraph`) and traffic use the same `HUB.nodes`, so players and cars can be sent there. Owner: Athens roads lane. Repro: `SEEDS=1 node tools/tBot.js <url>` (waypoint choice is seeded, so the first two legs repeat; game timing can shift the third).
2. **Game recovery needs 4 s of unbroken gas.** The stuck hop (`RO.stkT`, 71_roam_drive.js) only counts frames with the gas held. A driver who lifts for a bend (the bot does) stays pinned: position fixed, `RO.v` still reads 5-8 m/s. Players do this too; a human backs out, so the bot now reverses after 2.5 s pinned. Possible fix: also count pinned time while braking/steering. Not changed here (feel, not a clear bug).
3. **One-off 100-135 ms sim step** in the first leg near each start (Frankfurt cell -400,400; Athens 1600,-2800), seen on 2 of 8 early runs, not in the final runs. Likely first-use warm-up (traffic recycle or lazy chunk). The bot records any step over 120 ms and fails on a freeze over 300 ms or 3+ slow steps.
4. **Repeatability:** waypoints, `Math.random` and the bot are seeded, so the same seed repeats the same route. Game logic that reads the wall clock (streaming, traffic recycle) still shifts a run slightly; a leg that fails once may pass on the next run (finding 1).
5. **Athens: lost leg, cell 1400,-2400 (seed+2, leg 1: 1537,-2694 → 1760,-2832, `no arrival in 76 s`, 571 m left, car ended 300 m off route).** No stuck seconds: the car drove but never reached the waypoint (path crosses a stretch the car cannot take, or a one-way/blocked connector). Needs a trace with `__bot.trace=[]` before `BOT_go('nav',…)`. Passed on an earlier run of the same seed (timing). Owner: Athens roads lane, together with finding 1.

No JS errors, NaN, fall-through or race-finish failures in any run. Both races finish with all 5 gates passed.

6. **roads-r21e re-check (12 Athens seeds on one page, 2026-10-20):** the pocket at 1500,-2900 did not reproduce; failures repeat at cells 1100,-2300 (leg 1257,-2381 -> 1545,-2702, car pins at 1287,-2366 turning round in the street), 900,-3100, 900,-1900. Athens has 46 isolated road islands (1830 nodes) so `navPath` can snap a parked car into a graph hole. Details and next step: docs/HANDOFF_roads-r21e.md.
