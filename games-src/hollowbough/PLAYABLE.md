# Hollowbough: playable pass (W393)

Scope note: the orchestrator's turn note said "asymmetric factions, each faction's turn phase by phase". The live Hollowbough on the shelf is a worker-placement and tableau-building game (symmetric players, seasons), and its rules check (`games-src/rules-check/hollowbough.md`) was written against that game, so I did NOT re-theme it. "Factions" became "rivals": the rival's turn is shown step by step instead. Decided without asking, as the brief says.

Method: shots at 390x763 and 1440x860 of title, tutorial steps, first turn, rival turn, scoring, result (tutorial script `game/tutor-e2e.js` with `SHOT=<dir>`), critique with the impeccable checklist (hierarchy, clarity, voice, text size, feedback), fixes, then re-run.

## The 10 worst problems (before) and what happened

| # | Problem (first minute, newcomer, phone) | Status | Before -> after |
|---|---|---|---|
| 1 | Tutorial was a list of "tap this" steps with no reason to care (no voice, no stakes) | FIXED | Hazel (guide) gives a story reason, then the action; Bramble is the rival for the Oak's stewardship. All text in `src/story.js`. |
| 2 | No chapters: one 20-step blur | FIXED | Chapters tagged in the bubble: Ch 1 First Turn, Ch 2 Building, Ch 3 Tricks, Ch 4 Winter's End. |
| 3 | After you act, nothing reacts: the next bubble just appears | FIXED | Hazel's reaction chip (portrait disc + one line, ~2.3 s) after each action; the next step waits for it. Chapter payoffs in the chips. |
| 4 | Rival turn was "Bramble is playing..." then an instant state change | FIXED | A blue "Bramble's turn" banner, the top line names the move ("Bramble: Send a worker to the Pebble Bank"), a beat (~0.6 s), then the worker/card flies, then it lands. |
| 5 | No "Your turn" signal; the instruction line was easy to miss | FIXED | Yellow "Your turn" banner at the start of each of your turns (1.1 s); the instruction line stays. |
| 6 | Instruction line was 13 px on phones | FIXED | 14 px (`head.html`). |
| 7 | Result card was a bare table, no voice | FIXED | Quick game: flavour intro line on start, win/lose line in Hazel's voice on the result card. Tutorial: score card + "The Oak decides". |
| 8 | Help opened with a wall of rules | FIXED | Help now opens with "How a turn works" in 5 lines, then detail; the simplified rules are listed in it. |
| 9 | Tutorial could not be proven to reach its end | FIXED | `tutor-e2e.js`: fresh storage, taps each spotlit target's centre, checks it is uncovered, asserts all 20 steps shown, end card and saved. PASS at both sizes. Quick game and Story stage 1 are also played by taps only (`play-ui.js`). |
| 10 | Tutorial covers the core loop only (not inn, post office, haven, long road, special events, tie-break) | EXPLAINED, not fixed | The staged game is short on purpose; `TUTORIAL-COVERAGE.md` lists every rule, the step that teaches it, and an honest NOT COVERED list. Leave-and-resume restarts the tutorial (staged board is not saved). |

Not changed on purpose: card art, music, 3D, Story-mode scenes (already have portraits and 2-3 line intro/outro per chapter in `campaign.json`), the kit (`shell/*` read-only). Small text on cards (cost icons) is unchanged and remains the next thing to look at; card names are 13 px+.
Test-harness note: screenshots made with the offline route show broken small images (portrait discs, tree art) because only the page is served; the live site and the staged build via `gx-serve.js` have them.

## Rules (addendum 2)
Rules check for this game: WRONG 0, MISSING 0, SIMPLIFIED 6. rules fixed 0/0. The 6 simplified items are now stated in the Help drawer ("Simplifications on purpose"). `rules-test.js`: 108 passed. The report's unverified card-effect details (husband-type critter cost, solo bear tables) were not touched: no source to check them against.

## Gate results (staged build, local server)
- `VIS_SLUGS="," build-all.py --quick hollowbough`: PASS (13/13 scenarios). rules-test 108/108.
- Tutorial to the end (`game/tutor-e2e.js`, fresh storage, taps only): see the DONE line for the final run; 20 of 20 steps shown, end card reached, saved, centre of every target uncovered.
- Quick game and Story stage 1 by taps only at 390x763 (`game/play-ui.js`): played to the result card. Where to tap comes from the game's own hint (lightbulb recommendation), never engine calls.
- ui-audit (before the desktop help-text bump): phone A0 B14 C7 D0 E2 F0, phone-s A0 B17 C7 D0 E0 F0, pc A99 B12 C8 D0 E3 F0. NOT zero: these are old findings (board text 13-15 px on 1366 px wide screens, "Play" button 2.5:1 contrast on the green title button, the table mat stretched, "Host/Join" and "Draw pile" read as dead because the audit runs offline). I only fixed the ones in my own new Help text. The rest is the next job for the shared kit/skin and was not changed in this pass.
