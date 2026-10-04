# Sands of Qamar: rules notes

A browser version of the original game (by the original designer and publisher), with its expansions. The rules and numbers follow the real game. Every name, text and piece of art is original, for copyright reasons. The djinns keep the real cards' effects under new names.

## Components (as in the real game)
- **Board:** 30 tiles, 6×5.
  - Tile set: 5 Hamlets (blue, 5), 4 Shrines at 6 plus one each at 10, 12 and 15 (blue), 6 Oases (red, 8), 8 Bazaar Stalls (red, 6), 4 Grand Bazaars (red, 4).
  - The board is 6×6 with one expansion and 6×7 with both.
- **Meeples:** 16 Advisors, 20 Sages, 18 Traders, 18 Masons, 18 Shadows. Setup puts 3 random meeples on each tile.
- **Goods:** 54 cards.
  - Ivory, Jewels, Gold ×2 each; Papyrus, Silk, Spice ×4; Fish, Wheat, Pottery ×6; Mystic (fakir) ×18.
  - A set of 1–9 different kinds scores 1, 3, 7, 13, 21, 30, 40, 50, 60.
- **Djinns:** 22 base; 3 face up, refilled at the end of each round.
- **Camels:** 11 each with 2 players (each player also has two turn-order markers), 8 each with 3–5 players.
- **Turn-order track:** 18, 12, 8, 5, 3, 1, 0, 0, 0. When two players sit on spots with the same cost, the later bidder goes first.
- **Coins:** 50 each at the start. Coins count as points at the end.

## Turn
1. Bid for turn order.
2. Move: lift every meeple from a tile and drop them one per step, orthogonally, with no immediate backtracking. The last meeple must land on a tile holding its colour.
3. Take all meeples of that colour from the landing tile. If it empties, claim it with a camel.
4. Tribe action, then tile action.
5. Optionally sell a set of goods.

Djinn powers and items can be used at any point during your own turn, each power once per turn.

The game ends at the end of the round in which a player places their last camel, or when no legal move is left.

## Tribes and tiles
Implemented exactly as the rulebook describes. Details:
- Advisors: 1 point each, plus 10 points for every rival with fewer.
- Sages: 2 points each.
- Traders: take goods from the front of the market row.
- Masons: earn Masons × blue tiles in the 3×3 area, plus 1 Mason per Mystic spent.
- Shadows: range = number of Shadows, plus 1 per Mystic. They can also remove an Advisor or Sage from a rival.
- Hamlet: a palace is mandatory. Oasis: a palm tree is mandatory.
- Shrine: summon a djinn for 2 Sages, or 1 Sage + 1 Mystic.
- Bazaar Stall: 3 coins for 1 of the first 3 goods. Grand Bazaar: 6 coins for 2 of the first 6.

## Expansions
- **The Crafters** (the first original expansion):
  - 15 purple Crafters, 3 Workshops and 2 Spice Exchanges (in the inner area), 1 Ravine.
  - Mountains: 2 per Workshop, always leaving every tile reachable.
  - One tent per player: it scores its tile plus 1 per red tile around it.
  - Items: precious items score; magic items are one-shot powers.
  - Crafters score 3 each for the player with the most, 2 each for everyone else.
- **Wonder Cities** (the second original expansion):
  - Wonder Cities, blue ×3 and red ×2, score 5/20/45/80/125 for holding 1–5.
  - The Great Lake: palms and palaces next to it score double.
  - A 5th player, with a 12-spot turn-order track.
- **Cutpurses** (the original mini-expansion):
  - One cutpurse per colour. Hire the face-up one at a Shrine, like a djinn.
  - Trigger it when you take its colour: every rival gives something up and you take the best.
- **Promo djinns:** 3.

## Assumptions (not confirmed by a rulebook I could read)
- **Item mix:** 9 precious items (3 each of 5/7/9 points) and 9 magic items (carpet 2, lamp 2, flute 2, scimitar 1, talisman 1, horn 1).
- **Printed VP** of the two Crafters djinns, the "+5 per djinn" promo, and the Cutpurse djinn (name as well).
- **Wonder City points** are added on top of the tile's own value.
- **The Wonder Cities whim cards** are left out; only the tiles and the 5th player are in.
- **5-player track:** 18, 12, 8, 5, 5, 3, 3, 1, 1, 0, 0, 0 (inferred from photos).
- **Broke bidder:** a player who cannot afford any free spot takes the cheapest free spot and pays all their coins.
- **Crafter majority:** tied players all count as "most".

## Tests
- **gauntlet.js** (computer vs computer): 0 errors and 0 stalls with 2, 3, 4 and 5 players and with every expansion.
- **cover.js:** 40 games mixing AI and random play. Every djinn power and passive, item, cutpurse, tile action and question kind fires, with invariants checked after every move: 0 failures.
- **click.js:** the page is played only through its buttons in 7 configurations, including all hot-seat, 5 players, and every expansion: 0 errors.
- **lay.js** (Playwright, real WebGL, 4 sizes):
  - no page scroll, and nothing covers the board;
  - every popup opens and closes;
  - the panel is visible on every decision.
