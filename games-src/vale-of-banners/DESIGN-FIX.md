# Vale of Banners: design fix list (D6, 8 Nov 2026)

Shots: `design-shots/vale-of-banners-{1title,2learn,3goal,4firstturn,4firstturn-b,5mid,6result}-{390,1440}.png`
(390x844 phone, 1440x900 PC). Built with `build-all.py --quick vale-of-banners`. Scenarios used: `?scn=vb-board`, `?scn=vb-result`.
Not tested here: a full game by touch (D6 is review only). `3goal` is the title screen: the How to play button did not open in the shot script; the real Goal card is `4firstturn-b`.

## Scores (0-10)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy | 7 | 7 |
| Aim is clear (Learn first screen + Goal card) | 7 | 7 |
| Board and pieces are the screen (phone) | 5 | 5 |
| Art and polish (title, result) | 5 | 5 |
| Readability (size, contrast, overlap) | 7 | 6 |
| Motion and messages (reading time) | 6 | 6 |
| Responsive (390 and 1440) | 7 | 6 |
| **Overall** | **6.3** | **6.0** |
Gate (every row >= 7) NOT met: rows 3, 4, 6 are below 7.

## Fix list, most impact first
1. **Phone play screen: the hex valley is hidden behind the three tabs.** At 390 the screen is market stalls plus a big "What to do now" sheet
   (`5mid-390`, ~290px of 844px is the sheet). Selector: the bottom panel `#tv` and tabs `#tab-estate/#tab-market`. Change: shrink `#tv`
   to one instruction line + dice row (move the resource chips row and the two "+2 workers" buttons into a collapsed "More" row), and show a
   mini valley strip (the player's hexes, 56px tall) above the tabs on every tab.
2. **Goal card covers the board while the rival is already moving.** `4firstturn-b-390`: header says "Azure's turn" behind the card.
   Selector: the Goal modal opened from the new-game flow (grep `Goal:` in `src/ui.js`). Change: open the Goal card before the first seat
   starts (hold the AI until Start is tapped), and keep the card text at <= 3 bullets of <= 12 words. Bullet 3 ("Animals in meadows, the
   beacon tower and lore add more; silver counts at the end") is 17 words and names 4 things: split to "Animals and lore add points." and move
   the rest to Rules.
3. **Title screen is a plain card on empty green.** `1title-390/1440`: 60% of the screen is blank, no valley art, "Learn to play (start here)" is
   a pale button the same weight as "How to play". Selector: `#start`, `#tutB`, `#howB`. Change: put the valley art (existing owner/free art,
   fills empty slot only) behind `#start`, make `#tutB` a filled primary for first-time players, and cut `#howB` (Rules is already in the top bar).
4. **Result modal is a spreadsheet.** `6result-390`: six-column table (Board, Silver, Workers, Goods, Lore, Total) at 12-13px, plus an
   italic line "The Vale cheers..." with low contrast (1.1:1 measured on `.voice`, `.tip` inside the result box; dark text on dark gold).
   Selectors: result modal table, `.voice`, `.tip`. Change: show only You / Azure big totals first with the winner's banner; put the
   breakdown behind a "Why?" tap; set `.voice` and `.tip` colour to the same ink as the table (#2a2014 on the cream card, >= 7:1).
5. **Worker badges sit on top of tile names in the market (PC and phone).** `5mid-1440`: "3 Sheep", "Lore" and "4 Sheep" labels are
   half covered by the gold worker-cost pills (`.cost`). Selectors: `#mk .cost` over `#mk .tilelabel`. Change: move the cost pill to the
   top-right corner of the hex (position:absolute; top:-6px; right:-6px) and give labels `margin-top:4px`.
6. **PC layout wastes 40% of the screen.** `5mid-1440`: stalls top-left, valley centre, a narrow sheet right, big dead gaps. Change: at
   >= 1000px make the stalls a 2x3 grid at 1.4x scale and centre the valley at 1.2x (`#mk` scale), raise tile labels to 16px.
7. **Debug tag visible.** `#gxscn-tag` ("Test: Turn: take a tile") shows bottom-left in every shot. Only with `?scn=`, so no action
   except confirming it never renders in the deployed build.
8. **Tap targets on phone.** Top-bar buttons are ~44px, but the die chips ("4", "1") and workers buttons are ~40px high. Selector: `.die`,
   `.acts .btn`. Change: min-height:48px.
9. **Emoji as icons** (`📖 Story`, `🏆`, 👷 🪙 in resource row) clash with the hand-drawn hexes. Replace with the existing SVG icon set.

## What works
Goal card wording is close to the standard (one sentence + 3 bullets). Hex valley art is clear and number tokens are large. Rival turn shows "Azure is choosing..." with a dice row, so the wait is explained.
