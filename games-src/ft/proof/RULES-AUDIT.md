# Sands of Qamar: rules coverage audit (W624, 24 Nov 2026)

Three questions per rule. **Engine**: proven by `logic-test.js` (119 base rules, numbered as in RULES-CHECKLIST.md) or `rules-ext-test.js` (X1-X22: player counts, expansions, 28 djinns). **Panel**: in the Rules panel (`src/rules-html.js`). **Taught**: the commission that makes you use it (`src/comm.js`, tested by `comm-test.js`), or "Learn more" = a Rules-panel card for rare variants.

## Mismatches found and fixed (engine and panel)

| # | where | was | now (rulebook) | proof |
|--:|---|---|---|---|
| 1 | turn-order track | 16, 11, 8, 5, 3, 1, 0, 0, 0 | 18, 12, 8, 5, 3, 1, 0, 0, 0 | rules 11, 18, 19, 109 |
| 2 | goods sale table (engine + Rules panel) | 1, 3, 6, 12, 20, 29, 39, 49, 60 | 1, 3, 7, 13, 21, 30, 40, 50, 60 | rules 71, 72, 73, 92, 97 |
| 3 | goods deck | Ivory 3, Gold 1, Fish 5, Pottery 7 | Ivory, Jewels, Gold 2 each; Papyrus, Silk, Spice 4; Fish, Wheat, Pottery 6 | rule 5 |
| 4 | tile mix | 6 Hamlets, 7 Stalls (13 blue) | 5 Hamlets, 8 Stalls (12 blue, 18 red) | rules 2, 3 |
| 5 | djinn scoring | Advisors 4, Sages 5, palms 4 with their djinns | Advisors 3, Sages 4, palms 5 | rules 105, 107, 115 |
| 6 | Wonder City scoring | 6 / 20 / 42 / 72 / 110 | 5 / 20 / 45 / 80 / 125 | X12 |
| 7 | precious items | 4 / 7 / 10 | 5 / 7 / 9 | X8 |
| 8 | Rules panel gaps | no player counts, no small print, expansions one line each | Setup by player count, Small print, Learn more (expansions, 28 djinns) | this table |

Results: `logic-test.js` 119/119 (was 104/119), `rules-ext-test.js` 22/22 (new), `rules-test.js` PASS, `comm-test.js` 6/6.
Still not checkable from text (marked UV in the checklist): the points printed on each djinn card. They stay as the game's own values.

## Coverage table

Commissions: **C1** One coin for the oasis · **C2** Coins from stone, coins from silk · **C3** The price of a djinn · **C4** A knife in the souk · **C5** Whose palace is it? · **C6** The last camel.

| area | rule | engine | panel | taught |
|---|---|---|---|---|
| Setup | 6×5 board, 3 people per tile, 90 people | ✓ 1-4, X4 | ✓ | C1 (you see it) |
| Setup | 50 coins each, coins are points | ✓ 7, 85 | ✓ | C1 |
| Setup | 2 players: 11 camels, 2 markers each | ✓ 8, X2 | ✓ | C6 (two markers line in the Rules panel) / Learn more |
| Setup | 3-4 players: 8 camels, 1 marker | ✓ 8, X1 | ✓ | Learn more |
| Setup | 5 players: 12-spot track, Wonder Cities | ✓ X3 | ✓ | Learn more |
| Setup | 9 goods and 3 djinns face up | ✓ 5, 6 | ✓ | C2, C3 |
| Bid | track costs 18…1, three free spots | ✓ 11, 14 | ✓ | C1 |
| Bid | pay the bank at once, no refund | ✓ 12, 19 | ✓ | C1 |
| Bid | dearer spot plays first | ✓ 15 | ✓ | C1 |
| Bid | same price: later bidder first | ✓ 16 | ✓ | **C1 (the puzzle)** |
| Bid | next round bids in play order | ✓ 17 | ✓ | C6 |
| Move | lift every person from one tile | ✓ 20 | ✓ | C1 |
| Move | drop one per tile, no diagonals | ✓ 21, 22 | ✓ | C1 |
| Move | never step straight back; loops allowed | ✓ 23, 24 | ✓ | C1 (tip) / panel |
| Move | last person lands on its own colour | ✓ 25, 28 | ✓ | C1 |
| Move | you choose the drop order | ✓ 26 | ✓ | C1 (Trader first, Advisor last) |
| Move | pass empty tiles, never end on one | ✓ 27 | ✓ | panel (small print) |
| Move | you must move if you can | ✓ 30 | ✓ | panel |
| Take | take all of that colour | ✓ 31 | ✓ | C1 |
| Take | emptied tile: claim with a camel | ✓ 32, 33 | ✓ | C1 |
| Take | camels never change owner | ✓ 34 | ✓ | **C5** |
| Take | no camels left: no claim | ✓ 35, 56 | ✓ | C6 (the Shadow's tile stays unowned) |
| Take | tribe action even without a claim | ✓ 36 | ✓ | C5 |
| Tribe | Advisors: 1 each, +10 per rival with fewer | ✓ 37, 86 | ✓ | C1, **C4** |
| Tribe | Advisor ties give no bonus | ✓ 86 | ✓ | **C4** (3-2 becomes 2-2) |
| Tribe | Sages: 2 each, pay for djinns | ✓ 38, 87 | ✓ | **C3** |
| Tribe | Traders: goods from the front of the row | ✓ 39, 41 | ✓ | **C2**, C5 |
| Tribe | a Mystic from Traders is a Mystic | ✓ 40 | ✓ | C2 (the Mystic in the row) |
| Tribe | Masons: coins = Masons × blue tiles around | ✓ 42, 43, 46 | ✓ | **C2**, C6 |
| Tribe | a Mystic adds a Mason (optional) | ✓ 44, 45 | ✓ | **C2** |
| Tribe | Shadows: range = Shadows (+1 per Mystic) | ✓ 47-49 | ✓ | **C4**, C6 |
| Tribe | Shadows kill exactly one person | ✓ 50, 51 | ✓ | C4, C6 |
| Tribe | or a rival's kept Advisor or Sage | ✓ 52, 53 | ✓ | **C4** |
| Tribe | a kill that empties a tile claims it | ✓ 54, 55 | ✓ | C4 (the land option) |
| Tribe | no target: nothing happens | ✓ 57 | ✓ | panel |
| Tile | Oasis: palm, compulsory | ✓ 58 | ✓ | C1, C6 |
| Tile | Hamlet: palace, compulsory | ✓ 59 | ✓ | **C5** |
| Tile | supply out: not built | ✓ 60 | ✓ | panel |
| Tile | palm/palace built even without a claim | ✓ 61 | ✓ | **C5** |
| Tile | Stall: 3 coins, 1 of the first 3 | ✓ 62, 63 | ✓ | **C2** |
| Tile | Grand Bazaar: 6 coins, 2 of the first 6 | ✓ 64, 65 | ✓ | C5 |
| Tile | Shrine: 2 Sages or 1 Sage + 1 Mystic | ✓ 66-68 | ✓ | **C3** |
| Tile | action of the tile you ended on only | ✓ 69, 70 | ✓ | C4 |
| Sell | 1..9 kinds sell for 1,3,7,13,21,30,40,50,60 | ✓ 71, 72 | ✓ | **C2** |
| Sell | several sets per turn; only different kinds | ✓ 73, 75 | ✓ | C2 |
| Sell | Mystics cannot be sold | ✓ 74 | ✓ | C2 |
| Sell | at the end of the turn, optional | ✓ 76, 77 | ✓ | C2 |
| Clean-up | goods and djinns refill after everyone | ✓ 78-80 | ✓ | C6 (round 2) |
| End | last camel: finish the round, then end | ✓ 81, 82 | ✓ | **C6** |
| End | no legal move: the game ends | ✓ 83 | ✓ | C6 (you have no move in round 2) |
| Score | coins, people, djinns, tiles, palms 3, palaces 5, goods | ✓ 85-95 | ✓ | every debrief; C3, C5, C6 |
| Score | palms/palaces only on tiles you hold | ✓ 89, 90 | ✓ | **C5** |
| Score | goods: best split into sets; Mystics 0 | ✓ 93, 94 | ✓ | C2 |
| Score | ties share the win | ✓ 96 | ✓ | C6 (goal: finish ahead, a tie is not enough) |
| Djinns | a face-up row of 3, pick one | ✓ 66 | ✓ | **C3** |
| Djinns | printed points + a power | ✓ 88 | ✓ | **C3** (Nakhla: palms 5) |
| Djinns | power once per turn, from the turn you get it | ✓ 119 | ✓ | C3 (tip) |
| Djinns | the 22 base effects | ✓ 97-118 | Djinns drawer | Learn more (each card) |
| Djinns | 3 promos, 2 Crafters, 1 Cutpurse djinn (28 types) | ✓ X16-X21 | ✓ | Learn more |
| Crafters | board, Workshops, Exchanges, Ravine, mountains, tent, items, Crafter majority | ✓ X5-X10 | ✓ | Learn more |
| Wonder Cities | board, 5 cities 5/20/45/80/125, Great Lake doubles | ✓ X11-X14 | ✓ | Learn more |
| Cutpurses | one face-up, hire at a Shrine | ✓ X15, cover.js | ✓ | Learn more |

## Totals
- Rules in this table: 63. Engine proven: 63/63. In the Rules panel: 63/63 (the 22 base djinn effects via the Djinns drawer).
- Base-game rules a new player needs: 54. Taught by a commission: 47; in the panel's small print only: 7 (pass through empty tiles, must move, no Shadow target, supply out, loops, two markers detail, 3-4 player counts). Expansion and per-djinn rules: Learn more cards (9).
- Coverage: panel 100%; commissions 87% of base rules (47/54), 100% of the rules that decide a turn (bid, move, take, every tribe, every tile, selling, djinns, end, scoring).
