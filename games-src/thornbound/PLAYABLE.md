# Thornbound Throne: playable pass (W401)

First-minute critique at 390x763 and 1440x860 (title, tutorial step 1, bid, herald, hide, clash). Ten worst problems, each with before/after.

| # | Problem (before) | After |
|---|---|---|
| 1 | No always-visible "whose turn / what now": only a dismissible "Got it" bubble at the bottom. | New turn strip under the scores: a "Your turn" / "<Rival>'s turn" chip plus ONE line of plain instruction (<= 2 lines, 15px), updated every decision. |
| 2 | The rival's turn was invisible: the board changed with no explanation. | Every rival step gets one caption in the strip, held ~1.3 s (tap the strip to skip); steps run one at a time at ~0.6 s plus animation. |
| 3 | Tutorial was a list of clicks with no reason to act. | Tutorial is the prologue: Ysolde (guide) and Tamsin (rival), a story reason in every bubble, a reply after each action, four named chapters, a climax at the result. Text in `game/src/story.js`. |
| 4 | Quick game had no voice: it started and ended without flavour. | One-line intro from Ysolde and a win / lose / tie line on the result card. |
| 5 | Herald step: all six locations looked alike, so the target was unclear. | Non-legal locations dim to 45% while placing a Herald or claiming; legal ones glow. |
| 6 | Help began with a 2-minute essay. | Help opens with "How a turn works": five short lines, then the goal; simplifications are stated. |
| 7 | Map and hand cards are small on a phone (hand strips ~44 px wide). | Not changed (shared kit art); card detail stays in the tap pop-up. Explained, not fixed. |
| 8 | Score changes were announced only in the log. | Scoring news card on the board (already present) plus the guide's reply: "+2 location, +1 Herald, 1 stolen". |
| 9 | Tutorial ended with no meaning for the story. | Last step: Ysolde's climax line depends on who won. |
| 10 | Tutorial could not be proven to finish. | `game/tutor-test.js` plays all 19 steps from fresh storage at 390x763 and 1440x860 (plus rotate, leave-and-return, story start): 0 problems. `finger-test.js` plays a guided game and Story chapter 1 by touch only: 0 problems. |

Not done (honest): the tutorial guides round 1 only (see TUTORIAL-COVERAGE.md); no leave-and-resume chapters; solo mode and advanced setup of the board game are not built (stated in Help).
Rules check: WRONG 0, MISSING 3, SIMPLIFIED 6. Fixed: 1/3 by the engine worker (Kingdom Card may go on either board space); the two others are features not built and are stated in Help.

## Gate results (390x763 unless noted)
- build-all --quick: PASS. rules-test 119/119, smoke OK, 0 page errors.
- tutor-test (19 steps, fresh storage, spotlight tap, wrong-tap check, target not covered): PROBLEMS 0 at 390x763, 1440x860, plus rotate, leave-and-return and story-start runs.
- finger-test (guided game and Story chapter 1 by touch on visible glowing targets only): PROBLEMS 0.
- ui-audit: phone A0 B4 C0 D0 E5 F0; phone-s A0 B13 C1 D0 E0 F0; pc A15 B11 C0 D0 E12 F0. F (title one primary, one instruction line) fixed in this pass ("Play" renamed "Quick game"; the help bubble and the strip never show a line together).
  Not zero, not fixed here: A/C on the Story map (shared campaign shell fonts and topbar art), B/E in the Menu and How-to-play panels (summary contrast, "dead button" flags on settings toggles). These are shell/panel items outside this task's scope; listed for the orchestrator.
- First-time help bubbles are now off by default (the strip already says what to do); the lightbulb still gives a hint on demand.
- Shots: playable-shots/ (title, first turn, rival turn, result; phone).
