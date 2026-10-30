# On-foot gauntlet, 29 Oct 2026 (W261)

Script: `qa/gauntlet-foot.js` (real input only: PC = keyboard + mouse, phone = CDP multi-touch on a 390x763 hasTouch context; bots read `FOOT.S` to decide, never call game functions).
Strategies: idle, random, aggressor, dodger (guard/parry, dash i-frames, jump). Seeded `Math.random` per seed. Game loop runs at `FOOT.ts` = 4 x real time; frame p95 is sampled in the first 8 s at x1.
Run: `NODE_PATH=$(npm root -g) GAME_DIR=<built dir> node games-src/nightrun/qa/gauntlet-foot.js` (env SEEDS, PLAT, STRATS, TS, MAXREAL, OUT, CONTROLS=0, ONLY=phone:dodger:3).
Shots (start, mid, boss, death, result) and results.json are written to OUT (scratchpad, never committed): `/tmp/claude-0/gf/out*`.

## What really ran (not the full 8-seed matrix: the 40 min limit hit)
See "Runs" below. Control check + layout check ran on phone and PC in full.

## Defects
| # | Defect | Evidence | Fix commit | Re-run |
|---|---|---|---|---|
| D1 | Story card ("tap to continue") ignores touch on landscape phones (844x390): the stage's touchstart handler calls preventDefault for anything but buttons, which cancels the click. The title's ON FOOT never starts for a touch player in landscape until SKIP is hit. | Touch tap on `#taleTc`: pointerdown fires, click count 0, card stays; mouse click and a tap on SKIP work. Portrait works only because Chrome treats that touchstart as non-cancelable. | `933ed08` (`parts/core/b.js`: `#taleCard` joins the exclusion list) | 375x553 and 844x390 start now PASS |
| D2 | Phone, auto-fire OFF: the stick pad overlaps the BOMB button (52x54 px). GUARD (streetguard.js) pushes a 4th button into the row after streetlook sized the stick. | layout audit 390x763 auto off: `fStick/fBomb 52x54`; screenshot shows BOMB over the pad | `933ed08` (`parts/street/streetlook.js`: stick width leaves room for the GUARD slot) | 390x763 on/off, 375x553, 844x390: no overlaps, all >= 44 px, labels fit |
| D3 | GUARD button is drawn above the result and pause overlay: bright, tappable, over "YOU WENT DOWN" (this is the reported HUD guard-label overlap). | `elementFromPoint` at GUARD centre = `fGuard` while `#fMenu` is open; screenshot phone-idle-0-result-down | `695cf30` (`parts/street/streetguard.js`: button inserted before `#fMenu`) | element on top is now `fMenu`; screenshot re-checked |
| D4 | OPEN (balance, W263 owns) | Phone idle bot (auto-fire does everything, no input): survives 87-96 s, 20-24 kills, dies; PC idle bot dies at ~20 s with 0 kills. The phone Kai fights by himself. | none | not touched |
| D5 | OPEN (visual, owner call) | With `purefoot` on the stage progress bar and the BEHIND text are not drawn (purefoot.js leaves them out on purpose): `S.behind` is set before every left spawn, the arrow shows but no words. The footstage HUD hook (progress value `P.maxX / boss.x`) never shows. Progress values stay in 0..1 and never go down (checked per tick). | n/a | n/a |
| D6 | Test-script bugs found and fixed in the gauntlet itself (not game bugs): CDP touchEnd with no active touch, `SEEDS=0` read as 8, hidden buttons counted as unusable result buttons. | | `933ed08`, `695cf30` | |

Branch note: "both branches" for the guard overlap was read as the two auto-fire layouts; the origin build (before D2/D3) FAILed the auto-off overlap and shows D3, this branch passes.

## Runs
Control check (real time, both platforms): move left/right, FIRE, jump, KNIFE, guard, dash, BOMB, pause, frozen while paused, resume, RETRY, QUIT to title, ON FOOT again: all PASS on phone and PC. Layout audit 390x763 (auto-fire on/off), 375x553, 844x390: all PASS after D1/D2.
Strategy runs (completed before the stop; 70 s real cap, TS 4, phone and PC ran in parallel so frame p95 is pessimistic: PC 33-66 ms, phone 16.8 ms):
| platform | strategy | runs done | result |
|---|---|---|---|
| phone | idle | 3 of 8 | died at 87-96 s game time, 20-24 kills (auto-fire), no errors |
| pc | idle | 6 of 8 | died at 20-22 s, 0 kills, no errors |
| phone | random | 2 of 8 | died 143 s / 90 s, 44 / 21 kills, no errors |
| pc | random | 2 of 8 | died 68 s / 47 s, 11 / 5 kills, no errors |
| phone | aggressor | 1 of 8 | died 100 s, 25 kills |
| pc | aggressor | 2 of 8 | reached the BIG HEAVY boss fight (boss shot taken), real-time cap hit at game t=235 s, no stuck state |
| both | dodger | 0 | not run (time) |
Minimums over those runs: no page / console / rejection error, no stuck state, Kai never left the screen (min camera margin 15 px), no foe spawned from the left without BEHIND active, every foe that spawned was seen attacking or dying, result screen shown every time a run ended (buttons >= 44 px, not covered). No run cleared the stage: STREET CLEAR screen, the clear result shot and the death-at-boss shot are NOT verified.
The aggressor FAIL lines "progress value ... (335x/902x)" were a test bug (the bar clamps at 1 when Kai passes the boss x); fixed in the script after those runs, not re-run.
The "camera moved back" notes (28-149x) are the designed retreat easing (streetlook SL.back), not a defect.

## W274 (30 Oct 2026): the street is clearable, and what x=7847 is
Quiet machine, one browser at a time, real input, TS=4, MAXREAL 170, build of nr/W273-proof. Game time in seconds.
| device | strategy | seed | result | kills | boss |
|---|---|---|---|---|---|
| PC | dodger | 0 | CLEARED, t=366 | 47 | reached at t=148, killed |
| PC | dodger | 1 | died t=125 | 36 | not reached |
| PC | dodger | 2 | died t=129 | 36 | not reached |
| phone | dodger | 0 | died t=133 | 41 | not reached |
| phone | dodger | 1 | died t=161 | 44 | reached, died in phase 1 (boss bar full) |
| phone | dodger | 2 | died t=212 | 45 | reached, died |
| phone | tactician (new) | 0 | died t=88 | 23 | not reached |
| PC | tactician (new) | 0 | died t=35 | 3 | not reached |
Clears: PC dodger 1 of 3, phone dodger 0 of 3, tactician 0 of 2. NOT run (time limit): dodger seeds 3-7, tactician seeds 1-7, aggressor, random, idle (W261 has loaded-machine numbers for them). Boss hp left was not recorded for the phone deaths (the shot shows a full bar); no run reached phase 2.
The W273 "0 cleared, died at 69-99 s" came from an overloaded machine (frame p95 100-667 ms); on a quiet one the dodger lives 125-212 s and one PC run clears.

## W276 (30 Oct 2026): phone boss framing
Phone dodger, 8 seeds, before: 0/8 cleared, died t=99-209, boss reached in 6-7 of 8, boss hp left 156-238 of 288. The boss FIGURE (+-55 px, drawn sprite) is cropped at the view walls because its body box is 54 px wide: figure in view min 0.76, median 0.87, 42% of boss frames >= 95%, wind-up frames 57% >= 95%. Fix tried (streetboss.js `?bossframe=1`) gave figure 1.00 but froze the boss; left OFF. See HANDOFF-W276.md.
