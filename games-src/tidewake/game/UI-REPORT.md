# Tidewake: UI report (stage 2, the playable page)

Output: `tidewake.html` (one self-contained file, ~1.74 MB: three.js, kit, audio pack 0.74 MB, engine + AI + page). Build: `python3 build.py && node --check x.js`. No edits to `src/engine.js`, `src/data.js`, `src/ai.js`, nor to `../kit`.

## Files (`SP/tots/game/`)
| File | What |
|---|---|
| `head.html`, `body.html` | shell page (board-first shell from `SP/shell`), painted-chart theme, bar, board, dock, 6 popups, start screen |
| `ui1.js` ... `ui5.js` | page logic, joined by `build.py` into `ui.js`: helpers + engine recorders + kit mirror; one-beat-at-a-time replay; analysis + dock; start screen, popups, actions; boot, PerfHUD |
| `texts.js` | rules (own words, expansions, our guesses), guide lessons |
| `sound.js` | `SND_MAP` (one line per event, per audio/tidewake/MAP.md), synth fallback for every event, sea loop, calm/tension music |
| `build.py` | inlines everything; `KIT_PATCHES` (6 string replaces on the COPY of kit.js, each warns if its anchor vanishes) |
| `click.js`, `lay.js`, `perf.js`, `audio.js`, `smoke*.js` | tests |

## What is in the page
* **Board-first.** The page never scrolls. The kit canvas (2D SVG fallback without WebGL) fills `.gx-board`; the dock (right column >= 1000 px, sheet below on narrow screens) holds only what to do now: turn order strip, Roll/Place/Sail/Draw steps, the announcement ticker + dice, the current prompt, the guide card. Everything else is a popup closing with x, Esc or an outside tap: Crews and piles, Log, Rules, Pieces, Menu, Credits.
* **Framing (kit patch 6).** The kit's default region cropped the edges. `viewRegion()` now reads `TW_PADX/TW_PADT/TW_PADB` (set per aspect by `frame()` in ui5.js and re-applied on resize), so the frame, edge numbers, the 48 start marks and ships standing on them all fit at every size and aspect.
* **Start screen.** Quick start (Guided first game, Continue, Start), mode (Me vs computers / Hot-seat / Watch), variant (Standard, Solo, Easy solo "our goal = survive 24 turns or empty the pile", Teams: needs 4+, alternate seats), no-leviathans option, 4 expansion toggles (Rift Gate, Rogue Wave, Maelstrom, Deck Cannon), players 2-8, each seat: colour (8, swaps if taken), Human/Computer, level easy/normal/hard.
* **Turn flow.** Start marks: tap a gold mark on the board, or the dock grid (edge, number, a/b mark). Place: tap a hand tile (tap again or Left/Right, keys 1-3, R, Q), a ghost tile and the gold traced path appear on the board, computed from the engine (`simPlace`/`exitPort` path rules, not guessed); the dock states the outcome in words ("sails 3 currents and stops at column 4, row 2", "This tile sends you off the edge", "runs into X", "two junks would end on one wake", "X is right next to you"), `Place` (or Enter, or a tap on the glowing square). Teams: tap which junk gets the tile. Gate / cannon / pass buttons when legal.
* **Replay, one beat at a time.** The engine runs a whole move at once; `installRecorders()` wraps the engine's own steps at runtime (`lg`, `AG.*`, `eliminate`, `applyRes`, `destroyTile`, `removeMon`, `putGate`, `waveSlot`) and records events. After each move they are replayed: log lines as ticker messages, the dice in the dock (gold = column, blue = row), tile drop, ships glide along the traced steps, collide + sink, leviathans rise/move/crush a tile, cannon shot, Rift Gate warp, Rogue Wave tile/marker/line, Maelstrom. Then `kitSync()` reconciles the kit with `G` (also used for load). "Skip animation" button; `ANIM=0` skips it.
* **Interrupts.** `G.q` is shown to `G.q.who` even on another captain's turn as a dock prompt (alert style for danger: Deck Cannon / Rift Gate / relocate / accept). Humans get a 25 s timer on danger questions; on timeout the hard computer's answer is used (announced). Gate target squares are also tappable on the board.
* **Hot-seat.** More than one human: after a human moves, the device is hidden behind "Pass the device to X / I am X" (also before an interrupt for X). A hand is only ever drawn face up for the seat holding the device (or the single human in "me vs computers"); Crews popup shows counts only (watch mode has an x-ray switch).
* **Guided first game** (2 captains, you vs an easy computer, guide Full): 10 short lessons shown one at a time as things happen (start marks, currents, edge, collisions, leviathans, the roll, leviathan moves, a sinking, the minimum of three, the end), the "safest move" box with its why ("carries you 1 current to column 2, row 1, 4 squares from the nearest leviathan; 0 of 5 placements would sink you") and "Set it up", and warnings. Guide Full/Light toggle with a confirm card; going back to Full resumes the unseen lessons. Light keeps warnings and a "Show the safest move" button.
* **Rules** (How a round goes first; leviathans, interrupts, the 4 expansion pieces, variants, controls, "Our guesses") and **Pieces** (all 35 current layouts with x2 markers = our spread of the 21 repeats, the 10 leviathans with arrow tables, the 4 expansion pieces). Credits popup uses audio/tidewake/credits.html + "Names, card text and art are original".
* **Settings.** Sound / Music, computer speed (0.5x-5x), animations on/off, Graphics Auto/High/Medium/Low (Auto = Low on SwiftShader/llvmpipe), PerfHUD Show speed / Test speed (also `?fps=1`, F9), Guide Full/Light, restart / new game. Save: running game `tidewake_save1` (engine) + `tw_ui1` + `tw_set`, every access in try/catch; "Continue" on the start screen. Test hooks: `ANIM`, `AIDELAY`, `setSeed`, `setAiSeed`, `newGame`, `UI.sim`, plus `UI.speed`, `UI.qTime`, `UI.tickRate`.
* **Audio** wired per MAP.md: all 25 events from samples (0 synth), `sea_loop` bed while a game is on screen, `calm` / `tension` music (a leviathan within 2 squares of a junk, or <= 2 junks left in a 3+ player game), win / lose, ducking list from the MAP.

## Tests (final build)
| Test | Result |
|---|---|
| `node --check x.js` | OK |
| `click.js 0 17 3` (jsdom, 2D kit board, page buttons and board squares only) | 54 games, 0 errors, 0 hidden-hand violations. Modes: guided, me vs computers (3p, 4p, 5p, 7p), hot-seat (2p, 3p, 4p), mixed hot-seat (2 humans + 2 computers), watch (4p, 8p), solo, easy solo, solo watch, teams (4p me, 6p hot); expansions in every combination (rift, wave, maelstrom, cannon, all four); no-leviathans; with and without animation (kit speed 40); one game with a 1 s interrupt timer. Seen: start marks by dock, tile/rot/keys/sugg/hint/target, place by button and by board square, cannon, gate, pass, interrupt questions (doom, gatePlace, gateWake, bonus, cannonDraw) by button and by board square, coach, guide toggle, pass screens, popups, Play again. Every ~25 steps the kit state (tiles, leviathans, ships) must equal `G`; `checkInvariants()` every tick; stall detector. |
| `lay.js` (Playwright, SwiftShader WebGL) at 1366x768, 1920x1080, 768x1024, 390x844 | PROBLEMS 0 at all 4. Per size: no page scroll (start screen too), all **164 points** (36 square centres, 8 frame corners incl. raised, 24 edge numbers, 48 start marks, 48 ship-height points above them) project inside the board and `elementFromPoint` hits the canvas, checked at: start of the guided game, a human turn, with the ghost shown, later, dock collapsed, hot-seat pass screen, an 8-captain all-expansion game in progress, game over, after a reload + Continue; all 6 popups open and close (x, Esc, outside tap); dock shows the decision. `--2d` (SVG fallback) also 0 problems at 1366x768 and 390x844. Board share of screen: 65% / 73% / 48% / 45% (970x707, 1490x1019, 768x489, 390x383). |
| `perf.js` | PERF PROBLEMS 0: `?fps=1` overlay, SwiftShader detected -> Auto = Low, forced High steps down (12 s), Show speed, Test speed (8.5 s, recommends Low), Apply saves `tw_gfx`, idle saver ~8 fps and wakes on pointer move, F9, no transformed buttons at rest, 0 console errors |
| `audio.js` | AUDIO PROBLEMS 0: GA decoded 28/28, 25/25 events from samples, sea loop running, calm -> tension, 0 errors |

Screenshots in `shots/` (`L_<size>_<step>.png`, `_2d` for the fallback), all four sizes looked at. Fixed after looking: board pad too generous (wasted a quarter of the screen), start-lesson card still visible after the start mark, phone dock showed the lesson above the hand (the decision now comes first, steps strip hidden under 560 px), phone bar overflow in setup, colour select too wide, hot-seat 8p test never reached the busy state.

## Notes and known gaps
* Dice are shown in the dock (HTML, tumble then value) instead of the kit's 3D dice: the kit dice change the camera region and would shrink the board during every roll.
* The Rogue Wave is drawn as the kit's wave tile + edge marker + highlighted row/column; the kit's crest sweep moves along the wrong axis for this rule, so it is not used.
* Sunk ships' tiles/hands are shown only as counts (hidden information); the elimination-bonus prompt shows the pool tiles to the active captain only.
* A junk waiting on a Rift Gate square is drawn at the gate's top port (the kit has no centre position).
* Only SwiftShader was available: no real GPU timing, no touch device, no real ears; Google Fonts (IM Fell English SC, Cormorant Garamond) are blocked in the tests, so screenshots use the Georgia fallback.
* Online play (stage 3) is not wired: every human input goes through `act(move, seat)`, every seat view could come from `knowledge(seat)`.

## Engine notes (not edited)
* `legal()` returns only "That move is not allowed."; the page writes its own reason (a placement that sinks you while a safer one exists).
* `SN()` reads the global `SHIP_NAMES`; the page overwrites those entries with the chosen colour names before `newGame` (the log and `G.seats[].nm` then match the colours).
* `performMove` calls a global `refresh()` while `UI.sim` is 0; the page defines it and guards it with `UI.acting` so replays run first.
* No engine bug found by 54 clicked games, 0 invariant failures.
