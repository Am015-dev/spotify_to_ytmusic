# Crown City Smash: design fix list (D1, 8 Nov 2026)
Shots: `design-shots/crown-city-smash_{390,1440}_*.png`. Reached: title, tutorial first screen, pre-game "Let's smash" card with goal,
first roll. The scripted run opened the Log overlay in place of a mid-game turn and never reached a result, so mid-game, rival turn and
result are NOT reviewed: the worker must shoot them.

## Scores (1-10)
| Row | Score |
|---|---|
| Hierarchy / focus | 7 |
| Layout and spacing | 5 |
| Typography and readability | 5 |
| Colour and contrast | 7 |
| Art and aesthetic fit | 8 |
| Goal clarity | 7 |
| Interaction states and touch targets | 6 |
| Responsive | 6 |
Overall 6.4. Rows below 7: layout, type, touch, responsive.

## Fixes, highest impact first
1. **Player strip text is ~10px** (top of play screen at 390: `Voltusk ♥10 ★0 ⚡0`, shot `390_3goal`). Selectors: `html.ph-p header.gx-bar .pchip b/span`
   in `board.css:60-62` (13px, letter-spacing -.6px). Make the strip two rows or three 112px cards: name 14px/700, stats 16px/700 with
   icons 18px, remove the negative letter-spacing. ★ and ♥ must be readable at arm's length: the win counter ★ gets 20px.
2. **The bottom 20% of the phone play screen is empty purple** (below Roll / SMASH). Move the dice tray down 40px and make dice 76px (now 66),
   or put the "If you resolve now" preview line there at 14px. File: `phone.css` `html.ph #dice`, `#pacts`.
3. **Tutorial card covers the board and the dice labels** (`Dot Inkwell` card, 390 shot): anchor it above the dice tray, max 3 lines, 15px,
   one idea per card. Rewrite: "Roll six dice. Keep good ones. Roll again, up to 3 times." The win line goes on the Goal card.
4. **Goal sentence**: pre-game card says "First to 20 ★ wins. Or be the last..." (cut off). Replace with "Win by getting 20 ★, or by being the last monster standing."
   plus bullets "★ from three matching numbers", "Smash Crown City for a ★", "Hit rivals to knock them out". Never truncate: card min-height auto.
5. **Title screen**: `Crown City Smash` wraps to 3 lines at 42px and pushes the buttons to y=420. Set title to 2 lines (Crown City / Smash) at 40px,
   art height 34vh, buttons start at y<=400. "Play now (recommended)" has 3 lines of 13px body text on orange (contrast ~3.5:1): cut the body to
   "You vs 3 computer monsters" at 15px, cream text on `#9a2e08`.
6. **Footer note on title** ("The names, card text and art are original...") is 13px, low contrast. Move it into Menu > About; the title gets a Customise row only.
7. **Log overlay** (`#log` list) uses 12-13px grey text on purple at 2.5:1 for older lines. Older lines to 14px, colour `#d9ccf2`.
8. **Touch**: the player-strip chips are 44px high but only 90px wide; the bulb and menu buttons are 44px with 4px gaps. Gap >= 8px.
9. **1440x900**: dice sit at the bottom edge (y 780) with the board above; centre the board column, dice 76px, Cards/Log buttons 44px with labels at 16px.
