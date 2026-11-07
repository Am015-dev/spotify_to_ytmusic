# Rampart & Vine: playable pass (W403, 7 Nov 2026)

Method: screenshots at 390x763 and 1440x860 of title, tutorial, first turn, rival turn, scoring and result, looked at as a newcomer
(impeccable critique), then fixes, then the same screens again. Tests: `game/tutor-test.js` (tutorial to the end, both sizes) and
`game/playable-test.js` (Quick game and Story chapter 1 played to the result by tapping only visible, uncovered UI).

## The 10 worst problems (before) and what changed
| # | Problem (before) | Fix (after) |
|---|---|---|
| 1 | The only turn signal was a small dark pill ("Place your tile", "Cobalt plays a tile"): no clear "whose turn", easy to miss | Turn strip under the top bar: a coloured banner "Your turn" / "<Rival>'s turn" and ONE instruction line in plain words (14 px, max 2 lines, solid backing) |
| 2 | The rival's turn was a few silent moves with the same pill; nothing said what it drew, where it put it or what it claimed | Every rival step has a caption (draws a tile: <name>, lays it next to the valley, puts a follower on the road, scoring) at about 1 s a step; tap the board to speed up |
| 3 | Score pops were a bare "+4" with no reason, and the header named the wrong player | Pop says what scored ("+4 town"), the strip says "You +4: finished town, 2 tiles" under a "Scoring" banner; end scoring says "unfinished road, 3 tiles", "field with 2 finished towns" |
| 4 | The first-turn coach bubble repeated the instruction and sat on top of a glowing square | Place/river/mason bubbles removed (the strip says it); only follower bubbles remain |
| 5 | Score chips and names at 12-13 px, names hidden for the rival on phones | Chips 14 px; banner names the rival in full |
| 6 | The tile in your hand was an unlabelled drawing | Label next to it: "Your tile" / "Hob's tile" + the tile's plain name, 14 px |
| 7 | Follower spots were identical circles | Each spot carries a label: road, town, priory, field (13 px, solid backing) |
| 8 | "70" next to a picture meant nothing | "70 left" |
| 9 | Result card showed bare numbers | Names and scores, plus a line in the game's voice (win, loss, tie) |
| 10 | Tutorial was a list of "tap here" tips, tutorial button third on the title | Story prologue: Old Tamsin portrait on every bubble, chapters, Hob as rival, story reasons and payoffs, coverage list; a first-time player sees the tutorial button first |

Also: Help opens with "How a turn works" (5 short lines) and a "House rules" card stating the simplified items from the rules check.

## Remaining (honest)
- The tutorial game cannot teach River, Taverns, Merchants, ties, banners and the can't-place rule (see TUTORIAL-COVERAGE.md).
- Story outros play only after a win (shared kit); no loss variants.
- Commits on this branch before 21:35 UTC carry model attribution trailers that CLAUDE.md forbids; the branch was already pushed and force-push is
  forbidden: squash at merge, or the owner may rewrite the branch.
