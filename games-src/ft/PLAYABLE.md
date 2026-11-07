# Sands of Qamar: playable pass (W399, 7 Nov 2026)

Method: screenshots at 390x763 and 1440x860 (title, tutorial steps, first turn, rival turn, scoring, result), looked at as a newcomer, then fixed. The game already had a painted skin, a 23-step tutorial that runs to the end, a hint finger and a one-line instruction; this pass adds the readable-turn layer (`src/playable.js`), the story text (`src/lore.js`) and tests.

## The 10 worst problems found, and what happened

| # | Problem (before) | Fix (after) |
|---|---|---|
| 1 | No "whose turn is it" moment: the round simply continued, only a small chip said "Round 1". | A banner at the start of every turn: "Your turn" (gold) or "<Rival>'s turn" (teal) with one plain sub-line, 2.2 s, never blocks a tap. Round start: "Bid for turn order". |
| 2 | The rival's turn read "Teal is moving" for every step: nothing said what it did. | The instruction line becomes a caption per step in plain words from the engine log ("Farid lifts 3 people off Hamlet B4", "Farid takes 3 Sages"), at the existing 0.4-0.6 s pace; tap the board to speed up (existing). |
| 3 | Tutorial bubbles were dry lessons ("Tap the 5-coin spot"). | The tutorial is the prologue of the story: Old Hadiya gives a story reason, the glow shows where, then she or Farid reacts in a portrait card. Chapters 1-4 with titles. |
| 4 | Tutorial bubble titles were hidden by CSS, so nobody knew who spoke. | Bubble title shows the speaker or the chapter ("Ch.2 First Walk"). |
| 5 | Score changes were silent: the seat numbers just changed. | A score pop at the seat with a plain reason ("+13 You sell 4 different goods for 13 coins"); bids are not popped (the track shows them). |
| 6 | The pick-who-stays popup kept the line "Tap a glowing tile to drop one". | The line says "Pick who stays on this tile". |
| 7 | Result screen: a table, no reaction, the human named "Onyx". | A voice line (win and loss variants), "You" instead of the seat name. |
| 8 | Help opened with a long rules wall. | Rules drawer starts with "How a turn works" in 5 short lines. |
| 9 | Story map: the chapter title was squeezed to one letter per line on a phone (shared kit header). | Worked around in this game's css (title on its own row); the shared kit is untouched. |
| 10 | Goods row cards show only a picture, no name; seat badges (people count) are small icons. | W408: the goods row is 5 columns x 2 rows on a phone (picture over a 13px name, 16px on desktop), so every card is named; the board tiles shrink a little. Seat badges: not changed (the seat chips already use the 13px counters). |

## Tests added
- `playable-test.js quick|story [WxH] [shotsDir]`: plays a Quick game / Story chapter 1 to the result by real touch taps on visible, uncovered UI only.
- `tutor-test.js 390x763,1440x860 clean`: existing tutorial script (taps each spotlit element's centre, elementFromPoint check, all 23 step ids, end card).

## Gate results (7 Nov 2026)
- Quick build (`build-all.py --quick sands-of-qamar`): PASS, 9/9 scenarios. rules-test (with W391's engine fixes merged): PASS.
- Tutorial to the end, all 23 step ids, tapping each spotlit element, 390x763 and 1440x860: PASS (also 375x553 in the same script).
- Quick game and Story chapter 1 played to the result by real taps on visible, uncovered UI at 390x763: PASS.
- Independent audit (ui-audit.spec.js, staged build): NOT zero. phone A0 B25 C39 D0 E2 F0; phone-s A0 B21 C39 D0 E0 F0; pc A37 B33 C54 D0 E2 F0. These come from the painted skin and the start/settings menus (B: contrast of painted buttons such as "normal" and the expansion checkboxes; C: stretched skin backgrounds in the Djinns/turn-track panels; A on pc: 15 px text on the start menu; E: seat-setup buttons flagged "dead"). Not fixed in this pass; next step is a skin pass on the start menu.
- Not done: the 4 after-shots are phone only (title, first turn, rival turn, result); 1440x860 was checked by the tutorial script, not re-shot.

## Remaining
- Problem 10 (goods row without names, small seat badges), the audit counts above, and an opening chapter intro scene for Story mode loss variants (shared kit).
