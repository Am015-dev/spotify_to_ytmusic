# W260 flight gauntlet, 29 Oct 2026 (INCOMPLETE: harness built and smoke-tested, full 64-run sweep did not finish)

Harness: `games-src/nightrun/qa/gauntlet-flight.js` (real keyboard / mouse / CDP touch only; clock stepped with `__mnr.step`, Math.random seeded per run).
Run: `NODE_PATH=$(npm root -g) SEEDS=8 PAR=2 SHOTS=<dir> OUT=<json> node games-src/nightrun/qa/gauntlet-flight.js`.
What it records: console + page errors, unhandled rejections, 20 s stuck states, dead controls (controls probe), UI overlap / <44 px targets / off-screen,
boss seen + killed, result screens, HUD (`__mnr.HUD`) vs state, real-time frame time p95, shots per stage / boss / death / result.

## Results that exist (1 seed, not 8; stated as is)
| Check | Result |
|---|---|
| Controls probe, phone (touch drag, DASH, EMP, PAUSE, resume) and PC (arrows, Space, Shift, X, P, mouse on resume) | 8/8 controls act, both devices, seed 1 |
| Stage-1 start from title click, both devices, 4 strategies | starts; screenshots in scratchpad `shots/{phone,pc}-{idle,random,dodger,shooter}-1-stage1.png` (not viewed by me: not judged) |
| Page errors / console errors / rejections / UI overlap / small targets at stage 1 | 0 in the runs that completed |
| HUD vs state | 2 samples on phone/idle, 0 mismatches. Too few to claim anything |
| Stages 2-10, boss seen/killed, result screen, death screen in the gauntlet | NOT MEASURED (see OPEN-1) |
| Frame time p95 | one PC sample earlier: p50 16.7 ms, p95 50 ms (headless software GL, ~459 frames); phone sample failed to run. Not a device number |

## Defect table
| # | Defect | Evidence | Fix commit | Re-run |
|---|---|---|---|---|
| T1 | TEST bug: `flow-test.js` waits 700 ms after LAUNCH; here the run is live only after ~1.2 s, so 'launch starts a run' FAILs | baseline `qa/flow-test.js` run, phone: FAIL launch + crash on null bounding box | not changed (not a game defect; the game starts at ~1.5 s) | n/a |
| T2 | TEST bugs in my harness fixed: HUDLOG is `__mnr.HUD`; dash is queued to the beat (<=0.3 s) and shots leave the screen, so the probe samples; a tap on DASH sent touchEnd for all fingers | smoke runs | in this commit | controls probe 8/8 |
| OPEN-1 | The gauntlet cannot reach stages 2-10 in the time box: with real touch / key events each round trip renders software-GL frames; 1-18 sim-seconds per 90-170 s wall at PAR 2-4 (PC 1440x860 is the slowest). Cause is the sandbox, not proved to be the game. | `o4/o5` logs: "run wall cap hit" with stage 1, t 2-24 s | none | next: run on a machine with a GPU, or add a `?sim=1` lighter render path / lower decision rate (every 8 frames), PAR 1 |
| OPEN-2 | No game defect has been found yet, because of OPEN-1. This is NOT a pass. | | | |
| OPEN-3 | PC "mouse" does not steer the ship (no mousemove handler in core/b.js); mouse is menus only. Design question for the owner, not changed | grep core/b.js | none | |
| OPEN-4 | Game has no ammo; HUD shows heat. 'ammo HUD' is checked as heat/EMP/hull/score | | | |
