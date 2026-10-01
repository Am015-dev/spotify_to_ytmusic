# Short Fuse: UI report (stage 2, the playable page)

Output: `shortfuse.html` (one self-contained file, about 2.37 MB: three.js ~0.6 MB, the audio pack 1.14 MB, kit 0.17 MB, engine + AI + data 0.18 MB, page 0.1 MB). Build: `python3 build.py && node --check x.js`.

## Files (all in `SP/bb/game/`)

| File | What it is |
|---|---|
| `head.html`, `body.html` | Page shell: the shared board-first shell (inlined from `SP/shell/`), theme CSS, bar, board, dock, 8 drawers, start screen |
| `ui.js` | The whole page logic (start screen, campaign, turn builder, hot-seat, dock, drawers, kit adapter, effects, clock, settings, PerfHUD hooks) |
| `texts.js` | Our own texts: a briefing line per job, job-rule chips, the rules drawer, the guided tutorial, "why it failed" help, and `refEntries()` (the card/token list) |
| `sound.js` | `SND_MAP` (one line per event), synth fallback for every event, loops, music `main` / `tension`, toggles |
| `build.py` | Builds `shortfuse.html` + `x.js` (and still `debug.html`). Copies `../kit/kit.js` and applies 11 small, documented patches to the COPY (kit files untouched) |
| `click.js`, `lay.js`, `perf.js`, `audio.js`, `run_lay.sh`, `dump_ref.js` | The new tests and the reference dump (`SP/ref_shortfuse.json`, 180 entries) |

No edits to `src/engine.js`, `src/data.js` or `src/ai.js`.

## What is in the page

* **Start screen (mission board).** 66 job tiles grouped in boxes; each has an original one-line briefing, the job text, rule chips, the wire mix (drawn), fuse start, player range, timed badge and the best result. Campaign progress in `localStorage` (`sf_camp`: plays, wins, best = most fuse left / fewest turns); winning a job unlocks the next, locked jobs still play. Crew size 2-5 (only the sizes the job allows), each seat Human/Computer with a name and a crew card (from `allowedChars`), computer level, the "What we know" suggestion toggle (on by default for jobs 1-3), presets "Me + computers", "All human (hot-seat)", "Watch the computer", a **Guided first game** (job 1 with a coach) and **Continue** for a saved game. Captain rotation: "Next job" passes the foreman to the next seat.
* **Board-first table.** The kit's 3D table fills `.gx-board` (2D kit fallback without WebGL); the dock holds everything you decide. Drawers: **Job** card (visual rule cards, number cards, restrictions, dares, "right now" job state), **Gear** (every equipment card with state/unlock/timing, plus crew cards and personal tools), **Know** (what we know: per crewmate wire the possible values, most likely values with %, certain wires, tokens, failed-probe facts, crew calls, the suggestion), **Log**, **Rules** (own words, "How a round goes" first), **Cards** (`refd`: every wire, token, card, table, rule and job with counts), **Menu** (settings), **Credits** (CC0 audio list + "Names, card text and art are original").
* **Turn flow** (all from `knowledge(seat).legal`): tap a glowing crewmate wire → value buttons (only values you hold, "you hold N", chance from what-we-know when help is on) → big "Snip" button (disabled with the engine's reason if illegal). Twin Probe / Triple Probe / Full Scan / Two-Value Probe / own flipped wire as toggles; solo cuts, reveal reds, all-at-once actions (point at N wires), job actions (snare, red call, accuse, pass, swap...) and equipment as buttons, with a generic chooser for parameters (wire on the board, seat, value). Any-time gear is offered off-turn ("Any-time gear"), and in hot-seat another human can ask for the device ("Teal wants to use gear"). Every pending `G.q` is a card with one button per option; wire options also glow on the table and can be tapped.
* **Results**: snapshot diff after every move → kit FX (cut flip + "SNIP!", "BUZZ" on a miss at the new token, PHEW on a turned-back fuse, BOOM/KABOOM, DEFUSED + confetti) and a comic banner in the dock with the log lines; last-step warning stripe; game-over card with "why it failed", stats, replay / next job / mission board.
* **Hidden information.** Hot-seat: the dock shows "Pass to X" and the table shows only wire backs (a neutral view) until X taps "I am X"; the next human decision (turn, question, claim) triggers the next pass. Solo: your stand is always visible. Watch mode: x-ray toggle.
* **Communication.** No chat at all; "Crew calls" lists every rules-allowed announcement (sweeps, holds/none, oxygen signals...).
* **Real-time jobs** (10, 19, 30, 42, 54, 66): a countdown pill in the dock, narrator prompts as cards (the clock holds 3 s for each), the pause button (dock head and Menu) stops the clock and the computer crew. Music cross-fades `main` → `tension` on the last fuse step, a robot fuse near 12 or under 30 s left; ticking clock loop while the clock runs.
* **Newcomer help.** Roadmap strip (turn order from the foreman, current seat, wires left, human/level), fuse pips and wires-cut pill, the suggested move with its reason and "Set it up for me", the guided tutorial (10 short coach cards queued one at a time), and "why this failed".
* **Stage-3 hooks.** Every human input goes through `act(move, seat)` (with an optional `window.NET_INTERCEPT(move, seat)` hook); every seat view comes from `knowledge(seat)` (`view()`), never from `G` directly (only watch-mode x-ray reads `G`).
* **Settings.** Sound / music toggles (persisted, drive GA and the synth), computer speed (0.5-5x), Graphics Auto/High/Medium/Low (Auto = Low on SwiftShader/llvmpipe/software renderers via `WEBGL_debug_renderer_info`), PerfHUD "Show speed" / "Test speed", help and guide toggles, pause, restart, mission board, credits.
* Save/resume: the running game (`shortfuse_save1`) and settings in `localStorage`, every access in try/catch.

## Test results (final build)

| Test | Result |
|---|---|
| `node --check x.js` | OK |
| `rules-test.js` | 89 passed, 0 failed |
| `gauntlet.js 1 66 1 normal` | 262 games, 144 wins (55%), 0 errors, 0 stalls, 0 invariant failures |
| `cover.js 1 1 66` | 262 games finished, 4979 moves, 0 errors, 0 invariant failures (every move). With one seed 3 rare items did not fire (Lone Tag, restriction L, the job-27 token draft); the stage-1 two-seed merged run covers them. |
| `hidden-test.js 1` | 262 games, 4098 poisoned decisions, knowledge / decision / what-we-know differ 0, PASS |
| `click.js 0 23` (jsdom, 2D kit board, page buttons and board tiles only) | **24 games, 0 errors** (solo, all-human hot-seat 2/3/4 players, watch mode; jobs 1 (guided), 3, 4, 8, 9, 10 (timed + claims), 12, 13, 19 (timed), 23, 26, 30 (timed, watch), 31 (5p), 34, 38, 42, 45, 47, 48, 54, 59, 63, 65, 66 (timed bunker); with and without animation; two games also replay through the "Play again"/"Next job" buttons). In hot-seat games every frame checks that no uncut wire the viewer may not see is drawn face up: 0 violations. Invariants checked every step. |
| `lay.js` (Playwright, SwiftShader WebGL, `https://gns.test/` route, fonts from the kit cache) | see the sizes below |
| `perf.js` (PerfHUD) | PERF PROBLEMS 0: `?fps=1` shows the overlay, SwiftShader detected and Auto = Low; forced High stepped down to Medium after ~52 s (p95 2.7 s/frame); Show speed, Test speed (44 s, recommends Low), Apply saves `sf_gfx=low` and leaves auto; idle saver 1 frame/s drawn with nothing moving, wakes on a pointer move; F9 toggles; no buttons transformed at rest (no hover lifts); 0 console errors |
| `audio.js` | AUDIO PROBLEMS 0: GA decoded 33/33 samples after the first click, music `main` playing, `tension` on the last fuse step; 16 events fired in one turn + forced events, 15 from samples, 1 (`select`, fired before decoding finished) from the synth fallback; 0 errors |

### Layout (`lay.js`, PROBLEMS per size)

LAYRESULTS

Each size: start screen, mission board selection, the opening-token question, a human turn, a dual cut built through the dock, its result, all 8 popups opened and closed (x and Esc), dock collapsed and restored, three more turns through the buttons, a hot-seat pass screen and the taken view, a timed job paused/resumed (the clock must stop and restart), the game-over card. Checks: no page scroll (`scrollHeight/scrollWidth`), the board uncovered on a 5x5 `elementFromPoint` grid, dock visible at every decision, no console errors.

Screenshots: `SP/bb/game/shots/L_<size>_<step>.png` (0start, 0start_job9, 1q, 2turn, 3dual, 4result, 5pop_missiond/geard/knowd/refd/setd, 6dockmin, 7later, 8pass, 8pass_taken, 9timed_paused, 10over) and `shots/P_1366x768_*.png` (settings, HUD, speed-test card). Fixed after looking at them: seat signs showed "CREW n" (names were indexed by a missing field), stale stands from the previous job showed on a new one (now `kitReset()` with per-job tile ids), the result banner replayed its pop-in on every refresh, the job chip crowded the phone bar.

## Kit integration and what I would change in the kit

Patches applied to the copy in `build.py` (`KIT_PATCHES`), each a one-line string replace that warns if its anchor disappears:
1-2. route the render loop through `PerfHUD.raf`; 3. disable the kit's own auto step-down when PerfHUD is present; 4. pixel ratio through `PerfHUD.pixelRatio`; 5. `autoQ()` returns Low when `window.SF_SOFTGPU`; 6. expose `SFKit._applyQ(q)` (apply without saving); 7-8. my own tiles are face up only when `known !== false` (own flipped wires in 38/56/64, the neutral hot-seat view); 9 and 11. the 2D and 3D seat plates use the passed name instead of a hard "You"/"YOU"; 10. three-character info chips ("!10" false tokens).

Requests for the kit itself: build those 11 into the kit (or options: `raf`, `pixelRatio`, `softGPU`, `applyQuality`); a `SFKit.reset()` / `removeStand(seat, i)` (today I empty stands and delete `K.st.stands` keys); a false-token chip face ("NOT 5") and side tokens beside a stand (jobs 22 and 50); a marker for a crewmate's flipped wire and for a failed-probe "not" fact; a face-down equipment card state distinct from "used"; a cover-number badge on equipment (job 12); per-seat number cards (jobs 29, 65); bigger stands for the side seats in 3-5 player layouts on narrow boards; an "id" field on `fx()` text so "BUZZ!" can have its own colours (it uses the generic burst now).

## Known gaps

* Racing claims between several humans on one device (jobs 10 and 45) are "first button pressed"; the computer crew waits ~2.6 s before claiming so a human can claim first.
* Off-turn gear for a second human in hot-seat needs a device hand-over ("X wants to use gear"); it is not offered in the middle of a question (the engine forbids it there).
* The what-we-know labels are in the dock and the Know drawer, not floating over the 3D tiles.
* Job 47 uses the engine's default card pair for the calculation (no picker for the two cards); job 49 uses the default oxygen recipient.
* Tested on SwiftShader only (no real GPU, no real ears, no touch device); timed jobs were exercised with a 25x clock in jsdom.
* `lay.js` at 1920x1080 is slow on SwiftShader (~20 min); `run_lay.sh` runs the sizes one at a time.
