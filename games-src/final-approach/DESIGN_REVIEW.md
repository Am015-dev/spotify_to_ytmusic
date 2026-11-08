# Design Review: Final Approach play screen (W425)

Reviewed against: games-src/BRIEF-GAMEFEEL.md, UI-BAR.md, BRIEF-PLAYABLE.md addenda 5-7, the owner verdicts of 8 Nov 2026
Philosophy: painted cockpit, board-first (the panel is the screen, one instruction line, hints behind a toggle)
Date: 8 Nov 2026. Skills: design-review + impeccable critique, on real shots (Playwright, real touch on phones).

## Screenshots Captured
| Screenshot (games-src/final-approach/playable-shots/feel/) | Size | Shows |
|---|---|---|
| feel-390-title / feel-1440-title | 390x844 / 1440x900 | title: Play, Quick game, Learn |
| feel-390-goal-card / feel-1440-goal-card | both | the Goal card before turn 1 |
| feel-390-tutorial-round1 / feel-1440-tutorial-round1 | both | Learn to play, round 1, coach line + green ring |
| feel-390-first-turn / feel-1440-first-turn | both | clean Play, your first turn |
| feel-390-rival-turn | 390x844 | the co-pilot's move with its banner |
| feel-390-mid-game | 390x844 | round 4, your turn |
| feel-390-result | 390x844 | the result screen |

## Scores (0-10, impeccable critique + design-review checklist)
| Item | Score | Why |
|---|--:|---|
| Visual hierarchy | 7 | Board is the screen; tracker strip, one line and one primary action below it. |
| Words / readability | 7 | Every slot and checklist chip now has a word ("Speed", "Gear 1-2", "Gear 0/3", "6 to go") on a dark pill; 14px minimum on phones. |
| Consistency | 7 | One button style per role; the same pill style for slot words and chips. |
| Aesthetic fidelity (one art style) | 7 | Owner-painted cockpit and icons kept; icons stay visible behind the words on phones. |
| States and feedback | 7 | Legal slots glow, refused slots grey out with a reason on the line, a chip says what your move did, the rival's move gets one banner. |
| Responsive | 7 | 390x844, 375x667 and 1440x900 fit with no clipping (checklist trimmed to one row on phones). |
| Accessibility | 7 | aria labels on every slot and chip, contrast pills, reduced-motion rules. One pre-existing audit B on the hidden How-to-play drawer. |
| Typography | 7 | 14px phone / 16px desktop floor; bold short words. |

## Must Fix
None open in scope.

## Should Fix
1. **Result screen said the loss reason twice**: fixed, the dock line is empty while the end banner is up.
2. **ui-audit B1 on the closed How-to-play drawer** (pre-existing, also live). _Fix: keep closed drawers off-screen._

## Could Improve
1. The landing-speed chip shows only in the landing round on phones (it cannot be met earlier); a small "Speed" hint could appear at round 6.

## What Works Well
The coached flight teaches one system per round and points at the exact slot; Play is clean with a Goal card; words replaced icon soup without hiding the painted art.
