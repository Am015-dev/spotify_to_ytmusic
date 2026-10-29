# W268 flight gauntlet, part 2 (29 Oct 2026) - PARTIAL: harness fixed and fast, stage 1 + first boss measured, stages 2-10 NOT reached

Harness: `qa/gauntlet-flight.js` (real keyboard / mouse / CDP touch only, clock stepped with `__mnr.step`, seeded Math.random).
Run: `NODE_PATH=$(npm root -g) SEEDS=8 PAR=4 WALL=900 STEPS=12 SHOTS=<dir> OUT=<json> node games-src/nightrun/qa/gauntlet-flight.js` (one browser process per worker).

## What changed in the harness (this is the answer to OPEN-1)
| Cause of slowness | Evidence | Fix |
|---|---|---|
| Parallel runs were contexts in ONE browser process; they starve each other (input needs a frame ack) | 4 contexts: 30 sim-s in 400 s wall. Same run with one browser process per worker: 153 sim-s in 51 s (phone), 464 sim-s in 101 s (PC shooter) | `PAR` workers each launch their own browser |
| 3 page round trips per decision (step, state, world) | 600 steps cost 95 ms, a round trip 4-20 ms | one `evaluate` per decision (`snap`), decision every `STEPS` (default 8; 12 used) sim steps |
| ~30 ms per CDP touchMove | measured 20 touches 643 ms | touchMove skipped under 1.5 px |
No new game hook was needed: `__mnr.simOn(true)` + `__mnr.step(1/60)` already stop the render loop and step the fixed-step update. Inputs are real events; game code is never called to move the ship.

## Controls vs the game's own text (item 4)
Title screen text (parts/head.html:151-161): WASD / arrows fly, SPACE / J fire ("the ship also fires itself"), SHIFT / K dash, X / L EMP, P pause, M mute; touch: DRAG, DASH, EMP. Tutorial (drills/tut.js) says WASD, SHIFT, X, and "EMP + heat".
| Check | Result (seed 1, both devices) |
|---|---|
| Dead input (no events for 90 steps = ship does not move) | PASS phone and PC: the bot cannot steer without events |
| Autofire with no key (text: the ship also fires itself) | PASS (core/a.js:55 sets SET.auto on) |
| WASD, K = dash, L = EMP, arrows, Space, Shift, X, P, resume, touch drag/DASH/EMP/PAUSE | PASS, 10/10 phone, all PC |
| PC mouse steering (OPEN-3) | NOT A DEFECT: no text promises it; the title says keyboard (WASD/arrows). Mouse is menus only. Text and code agree, nothing changed. (If the owner wants mouse steering, that is a feature, not a fix.) |
| "No ammo, HUD shows heat" (OPEN-4) | NOT A DEFECT: the game has heat, not ammo; tutorial text says "HEAT full: guns cool, then fire again". Nothing promises ammo. |

## Results (SEEDS=1, STEPS=12, PAR=4, all 4 strategies x 2 devices; NOT the 8-seed sweep)
| dev | strat | max stage | deaths | boss seen/killed | result screen | stuck | errors |
|---|---|---|---|---|---|---|---|
| phone | idle | 1 | 4 | 0/0 | 0 | 0 | 0 |
| phone | random | 1 | 2 | 0/0 | 0 | 0 | 0 (wall cap) |
| phone | dodger | 1 | 0 | 1/1 | 1 | 0 | 0 |
| phone | shooter | 1 | 4 | 0/0 | 0 | 0 | 4 console (below) |
| PC | idle | 1 | 4 | 0/0 | 0 | 0 | 0 |
| PC | random | 1 | 4 | 0/0 | 0 | 1 | 0 |
| PC | dodger | 1 | 4 | 1/0 | 0 | 1 | 0 |
| PC | shooter | 1 | 3 | 2/0 | 0 | 2 | 0 |
Death screen + AGAIN worked in every run that died (UI audit: 0 overlap, 0 small targets, 0 off-screen in the screens reached). HUD vs state: 0 mismatches in 221 samples. Page errors 0, rejections 0. Frame time (headless software GL, not a device number): phone p50 16.7 / p95 16.7 ms, PC p50 16.7 / p95 33.4 ms.
Ship gate (min stage >= 10, boss killed for dodger and shooter on both devices): NOT MET, not measured. Stage 1 alone takes 130-460 sim-s with these bots.

## Defect table
| # | Defect | Evidence | Fix commit | Re-run |
|---|---|---|---|---|
| D1 | After killing the stage-1 boss the result screen shows but `#srNext` has no bounding box, so the bot cannot go on (game or test? not triaged) | phone/dodger/s1 "result NEXT STAGE not clickable" | none | OPEN: look at the shot `phone-dodger-1-result1.png` and the button's state in the harness's mode first |
| D2 | `stuck 20 s` (no score or HP change while alive) on PC for random (score 0, hp 4, t=21), dodger, shooter | 4 findings, seed 1 | none | OPEN: likely a wave lull or the dodger keeping out of reach, not proved to be the game; needs the enemy list at that moment |
| D3 | Console warning "Ignored attempt to cancel a touchstart event with cancelable=false" x4 on phone/shooter (a browser notice, not an exception) | phone/shooter/s1 | none | OPEN, low: a non-passive touchstart handler calls preventDefault while a scroll gesture is in progress |
| T1 | Test bug: the controls EMP check had no EMP in stock after the L-key check | pc controls | in this commit (fixture tops up P.emp) | controls 2/2 clean |
0 confirmed game defects. D1-D3 are OPEN with cause unproved. This is NOT a pass.
