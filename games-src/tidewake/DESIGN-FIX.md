# Tidewake: design fix list (D5, 8 Nov 2026)

Shots: `games-src/tidewake/playable-shots/design/` (390x844 and 1440x900: title/setup, first-visit prompt, tutorial first screen, How-to-play card, first turn, 45-tap end). Build staged (scenario gate "none ran" under file://). The autoplayer reached only the start-mark step, so mid-game, rival turn and result were not seen; scores are on what was seen.

## Scores (0-10)
| Row | Score |
|---|--:|
| Visual hierarchy | 5 |
| Aim clear in one sentence | 4 |
| Goal card | 5 |
| Readability | 6 |
| Words | 5 |
| Board-first play screen | 5 |
| Consistency / craft | 7 |
| Responsive | 5 |
| **Overall** | **5.3** (rows 4-6 below the 7 gate) |

## Fix list, highest impact first
1. **The first screen is a settings form, not a title.** Element: the opening page (a scrolling list: checklist of special tiles "Rift Gate / Rogue Wave / Maelstrom / Deck Cannon", then "Captains" with `Players 2-8`, three Human/Computer toggles and difficulty dropdowns, then `Set sail`). It reads like a spreadsheet. File `tidewake/game/ui1.js` (setup render) + `head.html`. Change: show a title card first (name, one-sentence aim, `New here? Play with Osk's help` as the big button, `Quick game`, `Story`); push Captains/special tiles behind a `Customize` button. Default 3 players, 1 human.
2. **No win sentence anywhere on the first screens.** Element: the title/setup page, Learn first screen, "How to play". Change: add as first line everywhere: "Sail your junk the longest. The last junk afloat wins the lantern." (tutorial bar already says "Last junk afloat keeps the lantern", reuse it).
3. **Goal card is a numbered wall.** Element: "How to play" > "How a round goes" 5 items, each 40-70 words at 15px. Change in `texts.js`: cut each step to <=12 words ("1 Place a gold mark on the edge. 2 Roll two dice. 3 Lay a tile in front of your junk. 4 Your junk sails the new path. 5 Draw back to three tiles."), the aim line on top, one picture per step.
4. **First turn: board takes the top half, the bottom 50% is an empty dark panel.** Element: the area under the board at 390x844 (`Vermilion` label and the locate-target button at the right, y 440-844). The player's three tiles are not visible. Change: put the tile hand there (three big tiles 96px, rotate buttons) so the screen is board + hand; the label becomes "Your turn: tap a gold mark".
5. **Coach bubble covers the start marks.** Element: "Your start / Tap a gold mark. [Got it]" bubble pointing up from y~415, overlapping the bottom edge marks and tiles. It needs a button press to continue, fine, but should sit in the dead lower area (see 4), not over the board. Also drop the "Got it" step: the glowing mark is the instruction.
6. **Top bar: 5 small buttons plus `Setup`.** Elements: `Setup, Hint, Crews, Log, Rules, Menu` at 390 wide, 12px labels, cramped. Change: keep `Hint` and `Menu`; move Crews/Log/Rules/Setup inside Menu.
7. **Tutorial first screen shows the whole board with 20+ glowing marks.** Element: the Lantern Race step: all edge marks glow gold at once, so nothing is the target. Change: glow only the one mark the step wants; dim the rest to 40%.
8. **Contrast.** The dark teal panel with `#0b2a35` text-on-light cards is fine, but the `Human / Computer` toggles use teal on teal (unselected dark label on cream is ok, selected "Computer" is white on #1a7a86 about 4.1:1). Darken selected fill to `#12606b`.
