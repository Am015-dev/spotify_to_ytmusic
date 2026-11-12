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

## R12 re-review fixes (6.6 FAIL -> fixer 3)
| R12 finding | Cause | Fix | Test |
|---|---|---|---|
| Row 6: lost 5/5 to Easy, even always taking "Best" (61-70) | "Best" came from a one-line estimate (points now, food if stuck), blind to engines, round goals and bonus cards. | "Best" (action tile, bird, space, die, nest, tray card, deck, tuck) is now the hard computer's own look-ahead choice for that moment, cached per decision (`PPAI.hint`, `hintMove()`/`markBest()` in `src/turnui.js`). Easy is noisier (noise 16, off-plan 60% of turns) and hardly values engines or row strength. The grub-or-seed die moves its Best to the right button; the Best bird is kept in view in the hand strip. | `hint-gate.js` (headless, Best vs Easy and mixed vs Easy); `BEST=1` / `BEST=0.5 node tests/touch-game.js` (by touch) |
| Row 4: header "Your birds are working" during Fern's turn, with no birds | The hand-over animation of your last move ran under Fern's turn and was always called "your birds at work". | Header: "Your move · Fern next"; line: "Your move is finishing. Then Fern plays." ("Your birds' powers fire" only when a brown power really fires). `src/render.js`, `src/flow.js` | screenshots |
| Row 5: tutorial at 375x667, 4 targets off screen, 5 under 44 px | The Play button carried a 256 px egg icon (unsized `.egi`), so it ran under the screen edge; nothing scrolled targets in; small-screen dice were 38 px; tray/nest/round strip under 44. | Egg/nest icons in buttons 22 px; each step scrolls its target into view (`tInView` in `src/coach.js`); a tutorial target is at least 44x44; dice 44 px on short phones. | `tests/tutorial-end.js` now fails if a target starts off screen or under 44x44 (before the test scrolls) |

Measured (rival speed fast, hints on): final build, always tapping Best won 4/4 (62-59, 86-46, 60-25, 64-64 won on tie-break);
a mixed newcomer (Best half the time, else a random glowing target) won 1/2 (57-51, lost 53-64). Over all builds in this pass: Best 7/8, mixed 2/6.
Headless (`node hint-gate.js 80`): Best 85-91%, mixed 67-74%, random 30% vs Easy. Random glowing taps with hints off still lose (29-62, 39-47).

## R12 round 2 (orchestrator)
| Ask | Fix | Test |
|---|---|---|
| Mixed newcomer won 2/6 | Easy also shrugs a quarter of its small choices (`EASY_RND` in `src/ai.js`). By touch (hints on, fast rival), Best half the time: won 4 of 8 (52-44, 69-52, 55-50, 57-55; lost 41-46, 57-58, 47-55, 58-58 on tie-break). Always Best: 2/2 (77-36, 69-36) in the tuning pass. Headless: Best 88%, mixed 65%, random 19%. | `BEST=0.5 node tests/touch-game.js`, `hint-gate.js` |
| Cut hand names | Compact hand card: points badge sits over the picture, the name gets the full width, up to 2 lines, never clipped. | `tests/hand-names.js` (all birds at 390 and 375) |
| No Best on the bonus question | Best also marks button choices (No thanks, Pay food, Skip, Reroll, bonus card) and the card or bird a bonus trade uses. 0 decisions without Best in 2 full games. | touch-game `best taps / misses` |
| Best off screen after picking another bird | Best stays on the Best bird; `bestInView()` scrolls it (strip, panel or page) until a finger really lands on it. 0 scrolls in 11 hints-on games. | touch-game scroll count |

## R19 fixes (6.9 FAIL, rows 5 and 6)
| R19 finding | Fix | Test |
|---|---|---|
| Row 6: on defaults (hints off, normal speed) a newcomer lost 40-59 twice | Hints (Best badges, previews) are **on by default**; the bulb turns them off and remembers it. Easy shrugs more of its small choices (`EASY_RND` .6, noise 32, off-plan 75%). No rule changed. | `DEFAULTS=1 BEST=0.5 node tests/touch-game.js` (new player's storage, normal rival speed); `ALL=1 node hint-gate.js` |
| Row 5: tray cards 33x45 with only a number; board birds 40x40 | Phones: the feeder takes one row of 5 dice, the tray gets its own row of named cards (name 14 px, points, habitats) next to the deck; a board bird covers its whole 44 px space. Pills sit above the dock, not over the score chips or food; the "Swipe your birds" pill is gone. | `tests/phone-sizes.js` (44 px cards, names shown, no text under 14 px) |
| Row 6: round-end waits 14-19 s | The wait between your turns has a budget: after 2 s of rival play the rest runs 6x faster; a tap skips the rest (x25) for the whole wait, not into your turn. Turn banners 0.6/0.8 s. | touch-game prints the waits |
| Row 2: Best glowing on "Play a bird" while step 1 asks to tap the score | No Best on the action tiles during the guided tutorial. | `tests/tutorial-end.js` (now also fails on a tap on the target that does nothing) |

Measured by touch (touchscreen.tap), default settings, newcomer = Best half the time, else a random glowing target:
390x844 won 55-45 and 59-58, 375x667 won 62-54 and 66-25; 0 dead taps, 0 scrolls, 0 page errors; longest wait 6.4 s
untapped (was 14-19 s), mean 1.9-2.2 s; smallest tap target 44x44, smallest text 14 px. Headless: Best 97%, mixed 70%, random 25% vs Easy.
