# Via Tessera: rules notes

Via Tessera follows the original Roman-era economic card game one for one: every card, cost, patron value, count and rule below matches the
original edition's rulebook and card overview. Only names, wording and art are ours. Sources were read by a research pass (official rules,
official setup sheet, official card overview, two independent map datasets); research data with the real names stays outside the repo.
Component counts and their mapping to our names: `COMPONENTS.md`. Each rule has a check in `rules-test.js` (see `RULES-CHECKLIST.md`).

## Names (ours -> role)
- Cards: Builder (moves colonists, then builds), Governor (region production or taxes), Trader (coins + trade), Patron (buy 2 cards),
  Censor (buy 1 card, printed cost only), Envoy (copy the rival's top card), Settler (new colonists or coins), Herald (take cards back),
  makers Potter / Reaper / Tinker / Presser / Dyer (brick / grain / tool / wine / cloth houses produce).
- Patrons (the gods that score): Hearth (wealth), Eagle (houses outside brick cities), Sickle (regions), Wing (kinds of goods),
  Shield (colonists on the map), Owl (maker cards).
- Laurel = the 7-point game-end card. Grand Governor = the tile that doubles a Governor's bonus good and breaks ties.
- Colonists: land colonist = cart, sea colonist = ship. Capital = Caput. Goods: brick, grain (food), tools, wine, cloth.

## Setup (2 players)
- Market: only decks I and II (15 cards: cards numbered above the player count are removed). Each deck shuffled, I on top of II.
  7 face up in the display, 8 in the deck.
- 30 city tokens by letter (A 7, B 8, C 10, D 5), one random token of its letter per city. Caput has none.
- Each region gets a bonus marker of its most valuable good (cloth 7 > wine 6 > tools 5 > grain 4 > brick 3), good side up.
- Each player: 7 starting cards, 15 houses, 1 cart + 1 ship in Caput, 2 carts + 2 ships in the storehouse, goods 2 grain + 1 brick + 1 tool
  + 1 wine + 1 cloth (10 of 12 spaces used). Start player 5 coins, second player 6. The Grand Governor starts with the second player.

## A turn
Play one card from your hand and do its action. Played cards stay in your face-up pile (the top one is public) until a Herald.
- **Builder**: steps = your colonists on the map (in Caput or on lines). Split them freely. Carts use roads, ships use sea lanes. First step:
  out of a city onto a line; each further step goes through a city onto the next line. One colonist per line at the end of movement; you
  may pass occupied lines (they still cost a step). Then build in any cities at either end of a line where you have a colonist: goods
  1 grain (brick city) or 1 brick + 1 of the city's good; coins brick 1, grain 2, tools 3, wine 4, cloth 5, times the number of houses in
  the city after this one. One house per player per city, never in Caput, any number per turn.
- **Governor**: either pick a region whose marker shows its good (no house needed): every house there (both players) makes 1 of its
  city's good for its owner, you also take 1 bonus good (2 if you hold the Grand Governor, which then passes to the player on your right),
  and the marker flips to coins. Or collect the coins shown on all flipped markers and flip them all back (the tile does nothing here).
- **Trader**: take 3 coins (5 on a bought Trader), then trade with the bank in at most 2 kinds of goods, any amount, buy and sell at the roof
  prices brick 3, grain 4, tools 5, wine 6, cloth 7. Storehouse room limits buying.
- **Patron**: buy up to 2 market cards. Price = goods on the card + the slot's extra: slot 1 none, slots 2-3 one good of your choice, slots
  4-5 one cloth, slot 6 one good of your choice + one cloth, slot 7 two cloth. Cards go to your hand. Gaps close and the display refills to 7
  after your turn, while the deck lasts.
- **Censor**: buy exactly 1 card paying only its printed goods.
- **Envoy**: do the action of the top card of the rival's pile as if you played it. Not possible if the rival's pile is empty (after their
  Herald) or shows an Envoy.
- **Settler**: either place new colonists (1 grain + 1 tool each) in Caput or in any city with your house, as many as you can pay for and
  have (6 total), or take 5 coins + 1 per colonist of yours on the map.
- **Herald**: take your whole pile back into your hand (Herald included); 1 coin per card over 3. Then you may buy 1 new colonist (1 grain +
  1 tool), placed in Caput.
- **Makers**: each of your houses in cities of that good makes 1 of it (only you, no bonus marker).

## Storehouse
12 spaces, each holds one good or one waiting colonist. Goods are never thrown away to make room. When more goods arrive than fit, the
owner picks which incoming goods to take until the storehouse is full; the rest stay in the bank.

## End and scoring
- The game ends when a player buys the last card of the display (deck empty), or builds their 15th house. That player takes the Laurel
  (7 points). The other player has one last turn, then the game ends.
- Each patron's value is worked out once and multiplied by the number of your cards (hand + pile) that show it:
  Hearth floor((coins + goods at roof prices) / 10); Eagle 1 per house in a non-brick city (max 15); Sickle 1 per region with your house;
  Wing 2 per kind of good your houses make; Shield 2 per colonist on the map; Owl: each maker card scores per your house in its good's
  cities: brick 3, grain 3, tools 3, wine 4, cloth 5.
- Tie: the player holding the Grand Governor wins, else the one who would get it next (with 2 players, the other player).

## Deviations and unknowns (tell the orchestrator)
- **Board**: the original rulebook lists its Mediterranean map for 3-5 players and a smaller Italian map for 2-4. The brief asks for the
  Mediterranean map; we use it for 2 players (a common house choice). The Italian map's topology could not be found. [deviation]
- **City token mix per letter** [unverified]: only the totals are known (30 tokens, letters A7 B8 C10 D5, and 6 tool / 5 wine / 4 cloth
  markers implied). We use A = 2 brick, 2 grain, 1 tool, 1 wine, 1 cloth; B = 2/2/2/1/1; C = 3/2/2/2/1; D = one of each (totals brick 8,
  grain 7, tools 6, wine 5, cloth 4 over 30 cities).
- **Coin side of the bonus markers** [unverified]: the rulebook picture shows 1 or 2 coins and a cloth marker with 1 coin; the full mapping
  is not published. We use brick 1, grain 1, tools 2, wine 2, cloth 1.
- **Optional intermediate scoring** (first Herald scores, 2/1 coins) is an optional beginner rule in the original; it is not included.
- **Goods supply**: unlimited, as in the rules. Coins unlimited.

## Simplified on purpose
Nothing in the rules. Phone fit is solved with zoom, pan, a camera that frames your legal targets, bottom sheets for the market and the trade,
and a horizontally scrolling hand.
