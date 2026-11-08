# Perch & Plume: gameplay gate (W508, 8 Nov 2026)

Rules checked against the official base rulebook text (local notes only, git-ignored `benchmark/`). Then a full 4-round game
was played by touch at 390x844 and 375x667 as a new player.

## Rule and turn-flow differences
The engine already matched the rulebook: 4 actions, leftmost open space, egg cost 0/1/1/2/2, food cost with any 2 for 1, row
yields, bonus-space trades, brown powers right to left, 8/7/6/5 actions, round goals with tie splitting, pink once between turns,
white once when played, caching, tucking, bonus cards, end scoring and the food tie-break (139/139 logic rules pass).
No rule was wrong. The differences were in what a new player can see and do:

| # | Difference / lost moment | Fix | Test |
|---|---|---|---|
| 1 | Starting hand on 390x763 and 375x667: big cards squeezed into 104 px boxes, power text spilled over the other cards, "Keep these" was off screen, so the game could not start. | Each bird is one full-width row (picture, habitats, name, points, cost, 2-line power); "Keep these" sticks to the bottom. `src/head.html` | `tests/gameplay-gate.js` |
| 2 | Your food sat below the hand, off screen: "Not enough food" with no way to see your food. In the real game your food lies next to your mat. | The food row (and bonus card button) moved above the instruction bar. `src/body.html` | `tests/gameplay-gate.js` |
| 3 | Tutorial was free play with a "Things you'll meet later" list: pink powers, tucking, white powers, round goals could be skipped. | A guided game of 21 steps, every core rule in order, one sentence of 12 words or fewer and one highlighted tap each; other taps blocked; ends with a real game. `src/coach.js`, `src/tutor.js`, `src/story.js` | `tests/tutorial-end.js` |

## Still differs (by design, see rules-notes.md)
Roster size (120 birds, 18 bonus cards, 26 power types), green-side goals only with a rival, simplified solo rival.
Not taught as a step: bonus-space trades and feeder rerolls (dice luck); the instruction bar and rules drawer cover them.
`story-check.js` crashes the same way before and after this change (not touched).

## R6 re-review fixes (6.5 FAIL -> fixer 2)
| R6 finding | Cause | Fix | Test |
|---|---|---|---|
| Dead tap on a glowing "+2 food" row (375x667, round 4) | Every render rebuilt the board/dock with innerHTML; a tap that landed during a re-render lost its button (no click). Taps on rows/spaces/actions while your own birds still animated were also dropped. | `setH()` only replaces a part when its HTML changed; rows, spaces, Play and the 4 actions join the "kept tap" path (applied when the animation ends). `src/render.js`, `src/flow.js` | `tests/touch-game.js` (every glowing target in a full game, both sizes), run by `tests/first-tap.js` |
| 6-7 dock scrolls a game | Big full-width hand carousel (303 px) and a 2-line round box under the actions. | Phones: compact hand strip (picture, name, points, cost); the chosen bird opens full width with its power; any other bird opens big on tap. Round box one line, hidden while deciding; the panel keeps the step's buttons and glowing cards under the prompt. `src/head.html`, `src/render.js` | `tests/touch-game.js` counts scrolls |
| Tutorial food/eggs/goalr waits 4-7 s | Pip's turns played at full speed between steps. | In the tutorial Pip plays 6x faster, your own animations 2x; the wait bubble says "Tap to skip" and a tap plays the rest at once. `src/flow.js`, `src/coach.js` | `tests/tutorial-end.js` (all step markers within 2 s) |
| First 10 s, Feel | Goal not stated on the first screen; actions resolved as number changes. | Score bar says "Goal: most points in 4 rounds" on the first turn; the four actions glow; food flies from the die to your food row, eggs fly to the bird, rows bump. `src/turnui.js`, `src/flow.js` | screenshots |
| Result note looked under 14 px | | 15 px. `src/screens.js` | |
