# Sands of Qamar: design fix list (D4, 8 Nov 2026)

Shots: `ft/playable-shots/feel/d4/` (390x844 and 1440x900: title, Learn first screen, first turn, mid-game, end state).
Limits: first turn and mid-game come from `?scn=sq-board`, which stays in the tile-drop step, so no rival turn or result was reached.
The Goal card shot is missing: the Rules button was not reachable from the title. Item 3 covers it.
The impeccable launcher (`scripts/impeccable context`) is not in the repo; I read the project docs directly.
Built with `build-all.py --quick sands-of-qamar` after `npm i --no-save three@0.158.0` in games-src (node_modules was missing). Build OK; the scenario gate printed "none ran".

## Scores (0-10, my read of the shots)
| impeccable critique | | design-review | |
|---|---|---|---|
| Hierarchy | 6 | Visual hierarchy | 6 |
| Aim clarity | 5 | Consistency | 7 |
| Readability | 5 | Aesthetic fidelity | 8 |
| Motion / feedback | 6 (unverified) | Responsive | 6 |
| Polish | 7 | Accessibility | 5 |
| Pop-up discipline | 5 | Typography | 5 |
| **Mean** | **5.7** | **Mean** | **6.2** |
Rows below 7 block a visual deploy (CLAUDE.md).

## Fixes, by impact
1. **Learn bubble covers the phase strip.** At 390 the coach bubble (`.gxh-bub`, `shell/gx-help.css:4`, Hadiya "Most points wins...") sits on the Bid/Move/Take/Sell/Round row and the "What should I do?" pill, so the player cannot read where they are. Change: anchor the bubble below the status line (`top = status.bottom + 6`) or above the bottom dock. Never place it over the phase row.
2. **Text under 14px on phone.** In `ft/src/board.css`: `.sch .sn` 12px to 14px, `.sch .pp` 11px to 14px, `.chb small` 12px to 14px, tile name label (`.tile` name, about 10px) to 13px minimum. Resource strip labels (Fish, Wheat, Silk...) 11px to 13px. Cut the seat chip to coins plus points; drop camels and secondary counters into the Players dialog (`[data-gx=plrd]`). Seats at 390 read as a spreadsheet.
3. **Aim sentence is a list, not a goal.** The first coach line is "Most points wins. Coins, land, people, goods, djinns all count." Change it in `ft/src/tutdata.js` (and the `ft/src/coach.js` first step) to: "Have the most points when round 9 ends." plus 3 bullets max: "Coins and goods score." / "Land and people score." / "Djinns give bonuses." Use the same text at the top of the Rules dialog (`ft/src/rules-html.js`), and put "Goal" before "How a turn works".
4. **Top bar is five unlabeled icons.** On the title (`#hintsbtn`, `[data-gx=menud]`, rules/cards icons) there are no words. Add 12-14px captions under the icons, or at least `aria-label` plus a "Rules" text on the book icon, so the player can find the Goal card.
5. **Tile-owner picker covers its own prompt.** In the mid-game shot at 390 the three-pawn chooser overlaps the status line ("...ays on this tile" is clipped). Place the chooser under the tapped tile, clamped to the board, or in the bottom dock beside "Put them back"; keep the status text fully visible.
6. **Board is a grid of 30 near-identical tiles at 390.** Tiles are about 58px with a 12px name and three small pawns. For each tile: make the type icon the visible element (large, faded art already exists on 1440), put the point value in a 16px badge (`.tile .tv`, min 22px), and dim non-legal tiles stronger (they already grey out on 1440; the 390 shot keeps full colour on illegal tiles).
7. **Pop-up discipline.** One bubble at a time is met, but the bubble has an × only. Add "Got it" as a tap target of at least 44px, keep it until tapped, and do not re-show the hint pill "What should I do?" beside it.
8. **Desktop (1440) is calm and legible; keep it.** The side column is a good model: seats top right, phase tabs below. Port the 14px minimum to it and leave the rest.
