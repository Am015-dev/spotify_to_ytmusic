# Perch & Plume: playable pass (W380, 7 Nov 2026)

First-minute critique: screens at 390x763 and 1440x860 (title, tutorial steps 1-3, first turn, an action, the rival's turn frame by
frame, result), looked at as a newcomer. Scripts: `tests/firstmin-shots.js` (screens), `tests/tutorial-end.js` (tutorial to the end),
`tests/ui-play.js` (Quick game + Story stage 1 by taps on visible, uncovered UI). Shots go to `shots/` (git-ignored);
4 after-shots in `playable-shots/`.

Critique ran single-context (the skill's launcher binary is missing in this checkout, and the brief caps time at 100 min), so the
two-agent critique was replaced by one pass against the same heuristics: visibility of system status, match with the real
world, recognition over recall, minimal visible text.

## The 10 worst problems (before) and what was done (after)

| # | Problem a newcomer hits (before) | After |
|---|---|---|
| 1 | Nothing says whose turn it is. The rival's turn is a 1.8 s grey toast at the top ("Fern: draws cards (+1)") while your own board stays on screen; you can't follow what changed. | **Fixed.** A "Your turn" (gold) / "Fern's turn" (dark) banner opens every turn for about 1 s (tap skips). Each rival step gets its own caption in the instruction bar and as a pill ("Fern uses the wetland: +1 card", "Fern takes seed from the feeder", "Fern's Rust Nuthatch: ..."), 0.7-0.85 s per step. A bird the rival plays is shown large in the middle ("Fern plays"), then shrinks away. A tap during the rival's turn runs it 3x faster; it is never instant. |
| 2 | The instruction ("Pick a row, or play a bird.") is small grey text that doesn't say *what to tap*. | **Fixed.** One gold instruction bar, 16 px bold, max 2 lines, always in the panel: "Tap a glowing row button (food, eggs or cards), or a glowing bird in your hand." and per sub-step "Tap a glowing food die in the feeder to take it (2 left)", "Tap a glowing bird on your board to lay an egg on it", etc. |
| 3 | Everything looks equally tappable; after choosing a row you can't tell where to tap next. | **Fixed.** Legal targets glow (kept); while a choice is pending (food die, egg, card, slot), every other row button, die, tray card and bird is dimmed (body `.focus`). |
| 4 | Food dice and counters are abstract icon glyphs (a swirl, a red cluster, a rat head) with no words; you can't tell seed from grub. | **Fixed.** The temp icon glyphs are dropped for the code-drawn food shapes (slot kept for real art), and every die and every counter carries its word: "seed", "fish", "berry", "grub", "rodent", "either". |
| 5 | A coach bubble ("One action a turn ... Got it") pops up over the rows on the first turn and on the first draw, covering what you need to tap. | **Fixed.** First-time coach bubbles are off by default (the tutorial, the instruction bar and the glow carry it); still switchable in Menu. |
| 6 | Tutorial: 13 steps, 5 of them "Next" lectures; spotlights on whole areas (the mat, the feeder, the tray) instead of the thing to tap; it ends on the Quick-game settings page, not a game. | **Fixed.** 7 steps, each one real tap on the exact element (forest button, a glowing die x2, the bird in hand, the grassland space, Play, the grassland button, a glowing bird x3); the step advances only when that tap is done; Skip works; "Play" on the end card starts a real game at once. Proven by `tests/tutorial-end.js` at 390x763 and 1440x860 (elementFromPoint at each target's centre is the target). |
| 7 | No reason with points: "4 points" pops without saying from what. | **Fixed.** Pops say why: "+4 points: Dusk Vireo", "+1 egg = +1 point", "+1 seed"; your bird slides into its space (420 ms) when played. |
| 8 | Rival chip reads "Fern 0★ · 8▣" (two private symbols). | **Fixed.** "Fern 0 pts · 8 left". |
| 9 | Rules drawer opens with long paragraphs. | **Fixed.** Help opens with "How a turn works" in 5 short lines, then the details. |
| 10 | Header on phones is five unlabeled icon buttons (bulb, target, page, book, menu). | **Explained, not changed.** They are the shared shell's header (read-only for this task); every one has an aria-label and a tooltip, and nothing in the first minute needs them now that the instruction bar says what to tap. Labels show on PC. |

Also seen, not in the 10: the hand on a phone shows the top of the third card's power text cut at the bottom edge (the hand
scrolls); the tray cards are smaller since the feeder dice got their words. Both left as is: the hand is a scroller by design
and the tray card numbers stay readable.

## Gate (see the report at the end of the run)
