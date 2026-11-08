# Thornbound Throne: design fix list (D5, 8 Nov 2026)

Shots: `games-src/thornbound/playable-shots/design/` (390x844 and 1440x900: title, tutorial first screen, How-to-play card, New-game page, herald-placement turn). Build staged (scenario gate "none ran" under file://). Not reached: mid-game card reveal, rival turn, result (autoplayer only got to the herald turn). Scores are on what was seen.

## Scores (0-10)
| Row | Score |
|---|--:|
| Visual hierarchy | 7 |
| Aim clear in one sentence | 8 (title) / 5 (Learn first screen) |
| Goal card | 6 |
| Readability | 7 |
| Words | 7 |
| Board-first play screen | 6 |
| Consistency / craft | 8 |
| Responsive | 6 |
| **Overall** | **6.8** (rows below 7: Goal card, board-first, responsive, Learn screen) |

## Fix list, highest impact first
1. **Learn first screen cuts the aim off.** Element: the tutorial speech bar "Old Ysolde: The king is dead. Three regions, six locations: hold them..." (truncated with an ellipsis, `Skip tutorial` beside it; tutorial coach bar in `game/` ui, class of the purple strip under the player chips). The first sentence the newcomer needs is lost. Change: let the bar grow to 2 lines (remove `text-overflow:ellipsis; white-space:nowrap`) and make the first line exactly "Hold the most Influence when round 5 ends."; put Old Ysolde's story line second.
2. **Goal card buries the goal.** Element: "How to play" sheet; the dark `Goal:` box is third, after a 5-step list. Change: move the Goal box to the top as the first block, in 18px bold: "Win by holding the most Influence when the last round ends." Then the 5 steps. Delete the "Simplified on purpose" box from this sheet (move it to the full rules; it is not an aim).
3. **Play screen: dead band under the board, hand clipped.** Element: the area between the board bottom (y~595) and the hand (y~730) at 390x844 is empty black; the six hand cards are cropped at the bottom edge so their lower half (the sword row) is cut. Change: scale the board to fill the width and move the hand up so cards show whole (hand container `bottom:0` + `padding-bottom: env(safe-area-inset-bottom)`; give the board `flex:1` and centre it vertically). Card faces are the second most important thing: show them full.
4. **Top bar is 4 icon buttons with no labels.** Elements: the 4 square buttons (hand, log, bulb, book) and the hamburger at the top right. Change: add a 12px caption under each ("Hand", "Log", "Hint", "Rules") or drop to the 3 that matter; labelless icons fail the "explain yourself" bar.
5. **Region names compete with the map.** Elements: `THE UPLANDS / THE TABLELANDS / THE SINKS` and location plates ("Gleaning Meadow", "Cairn Field") at 11-12px over a busy map at 390 wide. Change: plates to 14px, add a 60% black backing, and drop the region captions to 10px uppercase with tracking only when the player taps a region (they currently duplicate the plates).
6. **New game page is a list of five similar gold buttons.** Element: `New game` page ("New here? Learn in 5 minutes", "Start the game", "How to play", "Hot-seat", "Watch"). The primary button is a decoy: "Learn in 5 minutes" is gold, "Start the game" is not. Change: after the first completed tutorial make `Start the game` the gold button; keep Learn as outline. Bottom 45% of the screen is empty: centre the stack or use it for the chosen clan art.
7. **Chips are text-only rows.** Elements: top player chips "You 6 5 0", "Court 5 5 0". Numbers are 15px but icons are unlabelled (cards, supporters, influence). Change: label first view with words once ("Cards 6 · Supporters 5 · Influence 0") then collapse after turn 2.
8. **Desktop 1440:** the title and board are centred phone layouts with large empty sides. Change: at >=1000px width place the hand beside the board (right column) and the log on the left; do not just scale the phone column.
