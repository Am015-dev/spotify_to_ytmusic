# Playtest bot report

Run 2026-10-20T07:39Z · base ca2c66e · build http://localhost:8813/ · seeds 20261020,20261021,20261022,20261023 · 4 waypoints/run · wall 186 s total (budget 60 s per scenario)

Bot: `src/99c8_bot.js` (GO `bot/nav`, `bot/race`), runner `tools/tBot.js`. It drives with the game's own keys through `roamStep(1/30)` (no teleport between waypoints, no real-time play). Cells are 100 m map cells (`x,z` = south-west corner).

## Scenarios

| result | city | scenario | wall s | detail |
|---|---|---|---|---|
| PASS | fra | nav seed+0 | 26 | BOT NAV Frankfurt · 4/4 waypoints reached · 2.77 km in 127 sim-s · resets 1 · peak 29 m/s · max step 94 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: -400,400 reset |
| PASS | fra | nav seed+1 | 20 | BOT NAV Frankfurt · 4/4 waypoints reached · 2.32 km in 121 sim-s · resets 1 · peak 29 m/s · max step 36 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: -600,400 reset |
| PASS | fra | nav seed+2 | 23 | BOT NAV Frankfurt · 4/4 waypoints reached · 3.11 km in 155 sim-s · resets 0 · peak 29 m/s · max step 34 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | fra | nav seed+3 | 32 | BOT NAV Frankfurt · 4/4 waypoints reached · 4.47 km in 214 sim-s · resets 1 · peak 29 m/s · max step 29 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: -300,-1300 reset |
| PASS | fra | race | 22 | BOT RACE Frankfurt Westend Split · 1ST in 126.5 s · gates 5/5 (finish logic fired: true) · stuck 0 (≤ 1) · max step 53 ms · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | nav seed+0 | 37 | BOT NAV Athens · 4/4 waypoints reached · 3.08 km in 176 sim-s · resets 1 · peak 29 m/s · max step 73 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · worst cells: 1600,-2800 reset |
| **FAIL** | ath | nav seed+1 | 19 | BOT NAV Athens · 2/4 waypoints reached · 1.77 km in 109 sim-s · resets 2 · peak 29 m/s · max step 50 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · FAILED leg 2 1633,-2805→1393,-2879: auto-reset ×2 at cell 1300,-2900 reset×2 · worst cells: 1300,-2900 reset×2 |
| **FAIL** | ath | nav seed+2 | 17 | BOT NAV Athens · 1/4 waypoints reached · 0.41 km in 109 sim-s · resets 0 · peak 29 m/s · max step 61 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 · FAILED leg 1 1537,-2694→1760,-2832: no arrival in 76 s (571 m left) at cell 1400,-2400 lost · worst cells: 1400,-2400 lost |
| PASS | ath | nav seed+3 | 18 | BOT NAV Athens · 4/4 waypoints reached · 2.21 km in 109 sim-s · resets 0 · peak 29 m/s · max step 29 ms (0 over 120) · NaN 0 · falls 0 · JS errors 0 |
| PASS | ath | race | 23 | BOT RACE Athens Akropolis final · 1ST in 115.3 s · gates 5/5 (finish logic fired: true) · stuck 0 (≤ 1) · max step 69 ms · NaN 0 · falls 0 · JS errors 0 |

## Worst cells (all runs, both cities)

| cell (city x,z) | counts |
|---|---|
| ath 1400,-2400 | lost 1 |
| ath 1300,-2900 | reset 2 |
| fra -400,400 | reset 1 |
| fra -600,400 | reset 1 |
| fra -300,-1300 | reset 1 |
| ath 1600,-2800 | reset 1 |

## JS errors during the run

none.

## Findings for the coordinator to route (hand-written, kept between runs; tools/tBot.js appends this file to BOT_REPORT.md)

1. **Athens: road graph leads into an enclosed pocket, cell 1500,-2900 (pin at 1590,-2806; the leg-1 goal node is at 1640,-2799).** The nearest street is Petmeza (sec, 8.5 m wide), 30 m away. From the pin the car moves only 10-12 m in any of 8 headings in 2 s, so it sits in a courtyard or plot between buildings. `navPath` routes through it, and the bot stays boxed in even with back-outs (seed+1, leg 2: `no arrival`, or `auto-reset ×2` when the game's hop fires twice). Quest GPS (`qvGraph`) and traffic use the same `HUB.nodes`, so players and cars can be sent there. Owner: Athens roads lane. Repro: `SEEDS=1 node tools/tBot.js <url>` (waypoint choice is seeded, so the first two legs repeat; game timing can shift the third).
2. **Game recovery needs 4 s of unbroken gas.** The stuck hop (`RO.stkT`, 71_roam_drive.js) only counts frames with the gas held. A driver who lifts for a bend (the bot does) stays pinned: position fixed, `RO.v` still reads 5-8 m/s. Players do this too; a human backs out, so the bot now reverses after 2.5 s pinned. Possible fix: also count pinned time while braking/steering. Not changed here (feel, not a clear bug).
3. **One-off 100-135 ms sim step** in the first leg near each start (Frankfurt cell -400,400; Athens 1600,-2800), seen on 2 of 8 early runs, not in the final runs. Likely first-use warm-up (traffic recycle or lazy chunk). The bot records any step over 120 ms and fails on a freeze over 300 ms or 3+ slow steps.
4. **Repeatability:** waypoints, `Math.random` and the bot are seeded, so the same seed repeats the same route. Game logic that reads the wall clock (streaming, traffic recycle) still shifts a run slightly; a leg that fails once may pass on the next run (finding 1).
5. **Athens: lost leg, cell 1400,-2400 (seed+2, leg 1: 1537,-2694 → 1760,-2832, `no arrival in 76 s`, 571 m left, car ended 300 m off route).** No stuck seconds: the car drove but never reached the waypoint (path crosses a stretch the car cannot take, or a one-way/blocked connector). Needs a trace with `__bot.trace=[]` before `BOT_go('nav',…)`. Passed on an earlier run of the same seed (timing). Owner: Athens roads lane, together with finding 1.

No JS errors, NaN, fall-through or race-finish failures in any run. Both races finish with all 5 gates passed.
