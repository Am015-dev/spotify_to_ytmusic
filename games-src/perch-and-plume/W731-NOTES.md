# W731: why Perch & Plume did not feel like a game (24 Nov), and what changed

Played a full game at 402x874 and 1366x768 (tests/hud-shots.js, turbo).

## Problems found
1. No score race: "You 0 . Fern 0 board" in small text. Nothing showed who leads or by how much.
2. Unclear turn flow: "Your turn" sat inside the dock with the round/actions bookkeeping. No "do X now" line.
3. No feedback when points arrive: scores changed without anything happening.
4. End of the year was an 8-column number table plus a round-goal list. No winner moment.
5. HUD clutter: 7 top-bar buttons on phone (Hints, Goals, Log, Map, Rules, Menu, Lessons). On PC, two side tables (rival board, round goals).
6. Tutorial: the scenario lessons (W723) were opt-in, and 4 of 7 were broken (missing birds, an egg cost not paid, wrong-move checks).

## Fixes
- Score race strip at the top: big You / rival scores, lead bar, "You lead by N", "Your turn: pick one action" / "Fern is playing", round and actions left.
- Every point gained pops that score and floats "+N" from it, with a sound (hud.js hudBump).
- Score window (tap your score): one stacked bar per player with the parts named. No table.
- End screen: winner podium, totals count up, where the points came from as bars.
- Top bar: 5 icon buttons (Goals, Log, Rules, Menu, Lessons). Hints and Screen map moved into the Menu. PC side tables removed (they live in Goals and the rival's board window).
- Lessons: 7 one-rule scenarios, all fixed. Learn to play opens the first unsolved one. Each card says "Your goal: ...", and the target pulses until your first move. A wrong move fails with a reason, then Retry. The last lesson offers "Play a real game". On phone the lesson card folds to a chip over the score strip, never over the board. `?float=1` keeps the old guided year.

## Numbers
- Always-visible HUD items (tests/hud-shots.js count): phone 16 -> 14, PC 32 -> 19.
- Lessons test (tests/scn-lessons.js): PASS at 402x874 + 1366x768 in 8-9 s, 3 runs in a row.
- rules-test 240/240 AI games, logic-test 145/145.
- build-all --quick: 8/12 scenarios, the same as before this change. Still failing: `menu` (11px board labels such as "Forest" and "free", which were already there) and visual baselines that need refreshing for the new HUD.

Proof: proof/sheet-{before,after,lessons}-{402x874,1366x768}.jpg. The "before" window cells are blank because the old capture script fired too early. The windows themselves worked then too.
