# Twin Thrones: design fix list (D5, 8 Nov 2026)

Shots: `games-src/twin-thrones/playable-shots/design/` (390x844 and 1440x900: title, Learn first screen, How-to-play card, first turn (wonder draft), mid, 45-tap end, result scenario `tt-result`). Build staged (the game's own tests are in `rules-test.js`, not run by me; no engine change proposed).

## Scores (0-10)
| Row | Score |
|---|--:|
| Visual hierarchy | 5 |
| Aim clear in one sentence | 7 |
| Goal card | 7 |
| Readability | 6 |
| Words | 7 |
| Board-first play screen | 4 |
| Result screen | 3 |
| Consistency / craft | 6 |
| Responsive | 5 |
| **Overall** | **5.5** (rows below 7: hierarchy, readability, play screen, result, craft, responsive) |

## Fix list, highest impact first
1. **Result screen overlaps itself.** Element: the `YOU WIN!` banner and its two sentences ("Military supremacy: the conflict pawn reached the rival...", "Your banners reach their gate...") drawn over the pyramid and the conflict track; `Play again` and `Title` buttons sit on top of the card rows (`twin-thrones/src/ui.js`, result overlay, ~y 270-570 at 390x844). Text is unreadable. Change: make the result a solid card (`background:#10242b`, border gold, padding 20) centred over a 70% black scrim, banner 32px, one sentence of <=12 words, then buttons below the text, never over cards. Hide the pyramid behind the scrim.
2. **Wonder draft is four text boxes.** Element: the four `Merchant Road / Grand Arena / Moon Grove / Thunder Idol` panels (first turn). The top half of each is empty (no wonder art), the lower half is cost chips. This is the "spreadsheet" the owner banned. Change: render each wonder as a card with its art (`res/wonder-*` asset if registered in `assets.json`, else a painted gradient plus a 64px symbol) in the top 55%, the name 18px under it, one effect line at 14px, costs as icon+number chips below.
3. **Cost chips are unreadable.** Element: `1 papyrus`, `2 papyrus` chips: the scroll icon is drawn through the text (reads like strikethrough) and chip text is 12px (`ui.js` line ~88 `class="chip`). Change: chips as `[icon 20px] 2` with a text label only on long-press; min 14px, text on its own solid background.
4. **Empty board strips dominate.** Elements: the "Rival" and "You" strips with four empty slots each (y 115-190 and 650-740) take 25% of the screen while the choice is squeezed in between. Change: collapse empty strips to one 40px row (name, $7, 2 pts) until a card is built.
5. **Bottom status bar is faint and cut.** Element: the "Your move / Wonder draft" bar with a `⇥` skip button (y 740-844): grey bar 8px high, "Wonder draft" at ~13px, nothing else. Change: 16px text "Pick one wonder", drop the `⇥` icon (replace with the word "Speed up" if kept).
6. **Result scenario leaks a test string.** Element: the line "Test: Result: how the duel ended" at the bottom of the result. Remove it from the live render (`ui.js`, `?scn=tt-result` hook text) or hide when no `scn` param.
7. **Top bar is four buttons plus a title.** `Cards / Log / Rules / Menu` at 390 width are ok but the instruction strip under it ("Your turn / Pick a wonder for your city...") is the real heading. Make that strip the first, larger element: 16px bold, and shorten to "Pick a wonder (you get 4)".
8. **Desktop 1440:** same phone column. At >=1000px put the pyramid centre, both city strips left and right, and the log below. Do not stretch the phone layout.
