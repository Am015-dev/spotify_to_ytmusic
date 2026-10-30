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

---
# W270 (30 Oct 2026): result -> next stage, D1-D3 triage, stage-start runs - PARTIAL, short of the full 10-stage matrix
Harness changes (`qa/gauntlet-flight.js`): `FOCUS0=1` loads `?focus=0`; `STARTS=2,5,8` begins at that story stage through the game's own `startStory` hook (the stage map needs the hub); on a result screen it records what is at the NEXT STAGE button (hidden, display, pointer-events, disabled, element at its centre, focus mode), clicks it with real input and checks the next stage is live; stuck findings list the ship, boss and enemies.
Machine note: 4 cores. 4 browsers in parallel starved each other (420-500 s wall for 120-180 sim-s); PAR=2 gives about 1-3 sim-s per wall-s. That is why the matrix below is small.

## D1 - NEXT STAGE "not clickable": cause found, by design, not a code defect
| Check | Evidence |
|---|---|
| Cause | `parts/menus/focus.js:19` `html.focus #srNext, ... {display:none!important}`. Focus mode is on by default (`RET.focus`), added on the owner's order of 23 Oct ("focus on one stage"). The result screen then offers RETRY and TITLE only, so the button has no box. The harness was right, the game does what the owner asked. |
| Not the cause | no overlay, no disabled state, no timer, no pit stop (the shop did not appear), no fullscreen card (`mnr_fscard` is set by the harness) |
| With `?focus=0`, phone 390x763, real CDP touch tap | PASS: shooter, stage 1 boss cleared, result screen, tap on NEXT STAGE -> stage 2 live (`next 1`). Same for a stage-2 start: result -> stage 3 (`phone shooter from2: next 1`) |
| With `?focus=0`, PC 1440x860, real mouse click | NOT REACHED: PC stage-1 runs died or hit the wall cap before a result screen (see table). The click path is the same `clickEl` code, only unproven on PC. |
| Player consequence | In the default (focus) build a player who clears stage 1 can never reach stage 2 from the result screen. That is the freeze by design, but it means stages 2+ cannot be reached in the live build at all. Owner decision needed: OPEN-W270-1. No code changed. |

## D2 - "stuck 20 s" (no score or HP change while alive)
| Finding | Cause | Verdict |
|---|---|---|
| PC dodger, stage 1, t=21, score 0, hp 4, en=0, eb=0 | Stage 1 has only 3 drones in the first 30 s (spawned at 0.9 s, 7.9 s, 17.9 s, measured with an idle ship), then nothing until the mini-boss lead (bar 47). The dodger parks away from the lane and never kills them, so nothing changes. | Bot parking + a quiet opening. Not a hang: waves advance (dbar 18 at t=35). Pacing note OPEN-W270-2: about 18 s with no foe at the start of stage 1. |
| PC shooter, stage 1, t=60, score 1842/3665, boss=null, en 0-1 | Seen once per run at the very end of the 61 s stage; boss had been seen, not killed. Not reproduced by a stepped idle probe (the stage fails by hull, not by a hang). | NOT PROVED as a defect; evidence is a single run. OPEN |
No unreachable spawn, undamageable boss or non-advancing wave was found. A pinned-HP probe is invalid (the stage's own hull counter ends it), so it was dropped.

## D3 - touchstart console notice: fixed
`parts/core/b.js` (stage touchstart / touchmove): `preventDefault()` is now called only when `e.cancelable`. A second finger (DASH / EMP tap) during an active drag is delivered non-cancelable; calling preventDefault on it logged "Ignored attempt to cancel a touchstart event with cancelable=false". Owner of the behaviour: `core/b.js:55-58`, no second copy. Re-run evidence is WEAK: phone runs after the change show `err 0`, but this round's runs before the change also showed `err 0` (the W268 notice was logged only in some runs), so the fix is correct by the browser's rule but not proved by a before/after pair.

## Stage and boss map (from `__mnr.STAGES`, stage 1 differs in play)
| Stage | Name | Goal | Boss |
|---|---|---|---|
| 1 | FIRST RUN | list says survive 46; in play `ST.def.goal` = mini, lead bar 47 of 61 | mini-boss seen and killed by the phone shooter and by the W268 phone dodger |
| 2 | PATROL | kill 170 | none |
| 3 | ZEIL | score 105000 | none |
| 4 | HAUPTWACHE | survive 46 | none |
| 5 | TRESOR-WART | mini-boss | mini-boss |
| 6 | KONVOI | kill 210 | none |
| 7 | TAUNUS TOWER | score 154000 | none |
| 8 | SEK-ADLER | boss | boss |
| 9 | RIVER ROAD | score 126000 | none |
| 10 | EISERNER STEG | survive 46 | none |
(The stage-1 list/play mismatch is recorded, not investigated.)

## Runs this round (focus off, seed 1, stepped; one seed, so these are samples, not the 3-seed gate)
| dev | start | strat | stage reached | boss seen/killed | result -> next | stuck | errors | note |
|---|---|---|---|---|---|---|---|---|
| phone | 1 | shooter | 1 -> 2 | 1/1 | PASS touch tap | 0 | 0 | |
| phone | 1 | dodger x2 seeds | 1 | 0/0 | - | 0 | 0 | wall cap under 4-way load, alive |
| phone | 2 | shooter | 2 -> 3 | 0/0 | PASS touch tap | 0 | 0 | |
| pc | 1 | shooter | 1 | 1/0 | - | 2 | 0 | died once, boss not killed in 207 sim-s |
| pc | 1 | dodger | 1 | 0/0 | - | 1 | 0 | 4 deaths |
| pc | 2 | shooter | 2 | 0/0 | - | 0 | 0 | wall cap (70 s) |
| pc | 5 | shooter | 5 | 2/0 | - | 0 | 0 | 3 deaths, mini-boss seen twice, not killed |
| pc | 8 | shooter | 8 | 1/0 | - | 0 | 0 | boss seen, 1 death, wall cap |
| phone | 5 | shooter | 5 | 0/0 | - | 0 | 0 | 2 deaths, wall cap |
| phone | 8 | shooter | 8 | 2/0 | - | 0 | 0 | 3 deaths, boss seen twice, not killed |
All dodger runs for stages 2-10, 3 seeds each: NOT RUN (time and CPU). Idle: the stepped idle probe died on stages 1-4 within 62 s (hp 0 by t=21-23 on stages 2-4, fail at t=62 on stage 1), so "idle dies" holds for those. HUD vs state 0 mismatches in 140 samples, page errors 0, rejections 0, UI audit 0 in the screens reached.
Gate (stages 1-10 on both devices, 3 seeds, bosses killed): NOT MET, mostly unmeasured. This is not a pass.

## Defect table (W270)
| # | Status | One line |
|---|---|---|
| D1 | explained, OPEN decision | focus mode hides NEXT STAGE by owner design; NEXT STAGE works with `?focus=0` on phone (touch); PC click unproven |
| D2 | not a game defect found | empty stage-1 opening + parking bot; pacing OPEN-W270-2 |
| D3 | FIXED | `e.cancelable` guard in core/b.js |
| OPEN-W270-3 | OPEN | bosses of stages 5 and 8 not killed by the bots in these runs: balance or bot skill, not told apart |
