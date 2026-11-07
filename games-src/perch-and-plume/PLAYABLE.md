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
| 6b | (ADDENDUM 1) The tutorial was not a real game and skipped rules. | **Fixed.** The tutorial is now one real, short game (1 round, 8 actions vs Pip) in 5 chapters with 14 guided steps: 10 taps on exact targets, plus "see" steps that explain what the board shows at that moment. Then "Finish this game": Pip plays with the real AI, you use your last actions, the round goal is scored and the result screen shows. Every rule and the step that teaches it: `TUTORIAL-COVERAGE.md` (6 items honestly marked not covered). `tests/tutorial-end.js` plays all of it to the result screen at both sizes. |
| 7 | No reason with points: "4 points" pops without saying from what. | **Fixed.** Pops say why: "+4 points: Dusk Vireo", "+1 egg = +1 point", "+1 seed"; your bird slides into its space (420 ms) when played. |
| 8 | Rival chip reads "Fern 0★ · 8▣" (two private symbols). | **Fixed.** "Fern 0 pts · 8 left". |
| 9 | Rules drawer opens with long paragraphs. | **Fixed.** Help opens with "How a turn works" in 5 short lines, then the details. |
| 10 | Header on phones is five unlabeled icon buttons (bulb, target, page, book, menu). | **Explained, not changed.** They are the shared shell's header (read-only for this task); every one has an aria-label and a tooltip, and nothing in the first minute needs them now that the instruction bar says what to tap. Labels show on PC. |

Also seen, not in the 10: the hand on a phone shows the top of the third card's power text cut at the bottom edge (the hand
scrolls); the tray cards are smaller since the feeder dice got their words. Both left as is: the hand is a scroller by design
and the tray card numbers stay readable.

Found while testing (fixed): on short phones (375x553) the three row buttons were taller than their rows and overlapped the
next row; they now fit on one line. Zero food counters were 45 % opacity text (failed contrast); now solid text with a grey icon.

## After: re-shot and re-critiqued
Same screens re-shot (`shots/after4`, 4 copied to `playable-shots/`). A newcomer now sees, in order: a gold "Your turn" banner,
one gold sentence saying what to tap, only the tappable things lit; after a tap the piece slides/pulses and a pop says what it was
worth. The rival's turn reads as a short story: "Fern's turn" -> "Fern is choosing an action." -> "Fern plays Copper Oriole in the
forest (+4)" with the card shown large -> "Your turn". Remaining weak spots: the five icon buttons in the shared header (#10), the
hand's power text is 13 px on phones (the audit's floor for that size, same as before), and birds are still code-drawn stand-ins.

## Gate (final build)
| check | result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick perch-and-plume` | PASS (9/9 scenarios, axe clean) |
| `node rules-test.js 120` | PASS 120/120 |
| `node smoke.js <served url>` | PASS phone + PC, 0 errors |
| `tests/tutorial-end.js phone` / `pc` | PASS: 14/14 guided steps (every target and Next uncovered at its centre), all TUTORIAL-COVERAGE.md ids shown, then the rest of the year played by visible taps to the result screen, 0 errors |
| `tests/ui-play.js phone all` (taps only visible, uncovered UI; no engine calls to choose) | PASS: Quick game vs 1 computer to the result (~200 taps), Story chapter 1 to its result ("Goal met!"), 0 covered targets, 0 errors |
| `ui-audit.spec.js` | phone A0 B0 C0 D0 E0 F0; PC A0 B0 C0 D0 E0 F0; phone-s A0 **B3** C0 D0 E0 F0 |

phone-s B3, explained: two are the audit's own "Test:" tag (bottom-left, 10 px dark pill) sitting under the drawer/menu text line
that happens to land there (same pair of colours, 2.82:1, in both; the base build had B4 here); the third is the shared campaign
map's chapter disc "6" at 4.49:1 (shared kit, read-only for this task). Our own board, title and result have no B.

## Rules check (ADDENDUM 2): games-src/rules-check/perch-and-plume.md
WRONG 0, MISSING 3, and all 3 are fixed in the engine. Each has a rules-test case named after it; each case fails on the old engine and passes now:
- `MISSING feeder`: powers that take from the feeder (gainF, cacheF, wFeeder) now reroll an empty feeder, and an all-same feeder that lacks the wanted food; a feeder emptied by a power is thrown back in.
- `MISSING pink`: a bird played by a "play a second bird" power now triggers other players' pink powers.
- `MISSING blue goals` / `random first`: setup options "Round goals: 1 point each, max 5" (blue side) and "Who starts: Random" on the Quick game screen.
The 7 SIMPLIFIED items are listed in the Rules drawer under "Simplified on purpose". The tutorial is unchanged by these fixes.

## Narrative (ADDENDUM 3)
- The tutorial is the story's prologue. Aunt Ottilie is the guide (portrait mark on every bubble) and Pip is the rival who wants to fill his notebook first. It has 5 chapters, from "Dawn in the Larchwood" to "The evening count". Each step gives a story reason in 2 short lines; after each action Ottilie reacts in a speaking card that never blocks a tap. The climax is the evening count: totals count up and Ottilie reacts to a win or a loss.
- Story mode: chapter intros and win outros come from `campaign.json`. Each chapter now also has a loss line from its speaker, and bosses get last words after a win; both show on the result screen.
- Quick game: a flavour line at the start and a result line in the game's voice.
- All the text is in `src/story.js`; the cast and the 3-act arc are in `STORY.md`; the beats are listed next to their rules in `TUTORIAL-COVERAGE.md`.
