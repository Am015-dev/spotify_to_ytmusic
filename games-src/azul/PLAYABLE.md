# Sunglaze: playable-by-a-human pass (W388, 7 Nov 2026)

Bar: a first-time player on a phone (390x763) knows what to do within 60 s, and can finish the tutorial, a Quick game and Story stage 1.
Sunglaze is an old live game (art, 3D table, music stay as they are). Rules check (W384, `games-src/rules-check/sunglaze.md`): WRONG 0, MISSING 0, SIMPLIFIED 3 (all documented, all outside the base rules), so there was nothing to fix in the engine.

## First-minute critique: the 10 worst problems (before)
Screens looked at: title, tutorial steps 1-3, first turn, rival turn, scoring, result; phone 390x763 and desktop 1440x860.

| # | Problem (as a newcomer) | Status |
|--:|---|---|
| 1 | Tutorial was ONE staged last round: the wall was already half full, so nobody saw a game start, a first take, or why the first points are small. Not "a real game". | FIXED: part A is a real round 1 from empty boards (18 steps), part B is the staged final round (23 steps). |
| 2 | Phone: the first-time coach bubbles "Take one colour" / "Choose a row" sat over the kilns and covered tiles right after you picked one, and repeat the instruction line. | FIXED: those two bubbles are gone (the always-visible instruction line says the same); the lightbulb rule cards stay. |
| 3 | Rival's turn: only the tiny header chip glowed and a line said "Olive is choosing...". No clear "whose turn is it" moment. | FIXED: a solid pill "Olive's turn" / "Your turn" drops in under the score chips before each turn. |
| 4 | Score and caption pops ("row 4", "-6 broken") floated over the score chips with no backing, half unreadable. | FIXED: solid navy backing, 17px. |
| 5 | Desktop dock: a 5-line, 13px "Step 1 of 3" paragraph plus a repeated chapter title and a duplicate recap line. | EXPLAINED: the phone path (board-first, one instruction line) is what the owner plays; the desktop dock keeps its list of kilns, which is useful on a big screen. Not changed (shared dock code). |
| 6 | Title: tutorial hidden under "More options" after the first visit. | EXPLAINED: first visit offers "Learn in 5 minutes"; the Menu keeps "Tutorial" and now offers the two chapter groups to replay. |
| 7 | Rival turn pacing: tiles moved in one burst. | ALREADY STEP BY STEP: lift (0.9 s), slide to the middle, place, caption per step ("Olive takes 2 Garnet", "Extra tiles break"); tap speeds up. The new turn pill adds a 0.7 s beat before each rival move. |
| 8 | Rack rows have no numbers on the phone (which row holds how many?). | EXPLAINED: row length is the number of empty slots; the tutorial says "Row 2 holds two tiles" and points at it. Not changed (art layout). |
| 9 | Result: blank band above "Olive wins" when the painted banner is missing. | EXPLAINED: only when the media file is blocked (test harness); live build has the painted banner. |
| 10 | Tutorial could not be left and resumed by chapter. | FIXED: two parts, "Next" between them, chapter chooser in the Menu once finished; Skip works at every step. |

Files: `TUTORIAL-COVERAGE.md` (rule checklist and the steps that teach each rule), `game/tutor-e2e.js` (tutorial to the end by taps, both sizes), `game/quick-e2e.js` (Quick game / Story stage 1 by taps only).
