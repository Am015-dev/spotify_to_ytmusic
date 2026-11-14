# Copy fixes: Sands of Qamar
Game: sands-of-qamar | Date: 2026-11-08

## Goal card

The Goal card (ui3.js:89, `goalHtml`) states the aim in ONE sentence: ok. Current lede: `Most points when someone lays their last camel.` No fix needed. (Optional softer wording: `Score the most points before the last camel is placed.`) The Learn-to-play goal lines (lore.js:9, lore.js:44, hlp.js:48) are fixed below.

## Table

| file:line | old line | new line |
|---|---|---|
| lore.js:9 | `The Sultan left no heir, child. Most points when the bazaar closes takes the throne: coins, tribes, land, goods, djinns.` | `The throne is empty, child. Whoever scores the most points wins it.` |
| lore.js:10 | `The tribes crowd the bazaar, three to a tile, each colour with its own gift. Farid the Water-Boy wants the throne for his village well.` | `The tribes, three per tile. Each colour does something different.` |
| lore.js:11 | `Who walks first? Dearer spots play earlier, but coins are points too. Take the 5-coin spot.` | `Pricey spots play first. Take the 5-coin spot.` |
| lore.js:12 | `Two caravans each, so two markers. Put the second on the free 0-coin spot: cheap, but last.` | `You have two markers. Put the second on a free spot.` |
| lore.js:13 | `The order is set: Farid, you, Farid, you. Same price? The later bidder goes first. Watch Farid walk.` | `Play order: Farid, you, Farid, you. Watch Farid go first.` |
| lore.js:14 | `Farid walks his Sages to the Shrine, claims it, and trades two Sages for a djinn. Sages are 2 points each.` | `Farid pays two Sages for a djinn. Sages are 2 points each.` |
| lore.js:15 | `Your turn, child! These Traders are ripe for the taking. Lift everyone from the tile and walk them out.` | `Your turn, child. Tap the glowing tile to lift everyone on it.` |
| lore.js:16 | `Leave one person on each tile you cross: up, down, left or right, never straight back.` | `Drop one person per tile. Never step straight back.` |
| lore.js:16 | `The last walker must land on a tile of its own colour: Traders.` | `Your last person must land on a Trader tile.` |
| lore.js:17 | `All four Traders are yours: four goods. The tile is empty, so your camel claims it. Well walked!` | `Four Traders give four goods. Your camel claims the empty tile.` |
| lore.js:18 | `The Stall sells one of the first three goods for 3 coins. Take the Mystic: it never scores, but it fires up Masons.` | `Pay 3 coins for a good. Take the Mystic: it boosts Masons.` |
| lore.js:19 | `Goods sell in sets of different kinds. Gather your four goods into one set.` | `Sell goods in sets of different kinds. Pick all four.` |
| lore.js:20 | `Four different goods fetch 13 coins, and bigger sets pay far more. Cash them in!` | `Four different goods sell for 13 coins. Sell them.` |
| lore.js:21 | `Farid\'s Advisors plant a palm. Advisors score 1 each, plus 10 for every rival with fewer. Mind your numbers.` | `Advisors score 1 each, plus 10 for beating a rival.` |
| lore.js:23 | `You choose who to leave behind. Choose the tile, then pick the person to leave.` | `Tap a tile, then pick which person stays there.` |
| lore.js:24 | `Leave an Advisor here. Your last walker, the Mason, must reach a Mason tile.` | `Leave an Advisor here. The Mason must end on a Mason tile.` |
| lore.js:25 | `Leave the other Advisor on the next tile, and keep walking.` | `Leave the other Advisor on the next tile.` |
| lore.js:25 | `The Mason lands on a Mason tile. All four Masons are yours.` | `The Mason landed on a Mason tile. You take all four.` |
| lore.js:26 | `Each Mason earns 1 coin per blue tile around: '+b+' tiles. Spend your Mystic for a fifth Mason.` | `Masons earn 1 coin per nearby blue tile ('+b+'). Mystic adds one.` |
| lore.js:27 | `A Hamlet raises a palace: 5 more points for whoever holds the tile. Your camel does.` | `The Hamlet gets a palace worth 5 points to you.` |
| lore.js:28 | `The caravans are counted: you '+a+', Farid '+b+'. Coins, tiles, palaces, palms, Sages, Advisors, djinns and goods all count.` | `Final count: you '+a+', Farid '+b+'. Everything you own scores.` |
| lore.js:29 | `Three more gifts: Grand Bazaar, 6 coins for 2 goods. Oasis, a palm worth 3. Shrine, a djinn.` | `Grand Bazaar: 2 goods for 6 coins. Oasis: a palm. Shrine: a djinn.` |
| lore.js:30 | `Beware the red Shadows: they remove any person within that many steps, or a rival\'s Advisor or Sage.` | `Red Shadows remove a nearby person, or a rival\'s Advisor or Sage.` |
| lore.js:31 | `A real game ends when someone lays their last camel; most points wins. The bazaar is yours, child.` | `A real game ends when someone places their last camel.` |
| lore.js:36 | `The sultan\'s bazaar opens at dawn. Lead the tribes, rule the market.` | `Collect tribes, claim land, and score the most points.` |
| lore.js:38 | `The rival\'s caravans were swifter today. The bazaar remembers; try again at dawn.` | `Your rival won this time. Want to try again?` |
| lore.js:38 | `Close, but the throne slips away. One more walk across the sands?` | `So close! Want another game?` |
| lore.js:46 | `Place your second marker. Same price: later bidder plays first.` | `Place your second marker. A tie goes to the later bidder.` |
| lore.js:52 | `Choose who stays here. Keep the colour you want last.` | `Pick who stays on this tile. Keep your landing colour for last.` |
| lore.js:53 | `'. The last colour is taken whole.'` | `', all of that colour here.'` |
| lore.js:55 | `Traders fetch goods; sets of different goods score 1, 3, 7, 13.` | `Traders bring goods. Different goods in a set score 1, 3, 7, 13.` |
| lore.js:75 | `Crafters, Cutpurses and Wonder Cities arrive in Story mode, each with its own intro.` | `Story mode adds Crafters, Cutpurses and Wonder Cities.` |
| lore.js:75 | `If no move is legal, a player passes; equal scores are a shared win.` | `No legal move? You pass. Equal scores share the win.` |
| coach.js:54 | `Only one '+MNAME[la.c]+' this time. Look for a tile where your last walker lands among several of its colour.` | `Only one '+MNAME[la.c]+'. Land on tiles with several of its colour.` |
| coach.js:56 | `A fine turn, +'+d+' points. Coins and goods add up.` | `Good turn: +'+d+' points.` |
| coach.js:57 | `No points this turn. That is fine early: build land and goods first.` | `No points this turn. Early on, build land and goods first.` |
| tutdata.js:50 | `The coached bazaar opens.` | `The coached game begins.` |
| hlp.js:26 | `Tap a glowing spot. Dearer spots play earlier; free spots cost nothing.` | `Tap a glowing spot. Pricier spots play earlier.` |
| hlp.js:28 | `Tap a glowing neighbour to drop one person there. The last must match a colour.` | `Tap a glowing neighbour to drop one person there.` |
| hlp.js:29 | `Tap Collect. The power chips below are optional extras.` | `Tap Collect. Power chips below are optional.` |
| hlp.js:48 | `Most points when the game ends wins. Points come from tiles, palaces, palms, djinns, goods, Advisors and coins.` | `Most points at the end wins. Almost everything you own scores.` |
| hlp.js:51 | `Early spots cost coins, late ones are free. Coins are also worth one point each at the end.` | `Early spots cost coins, late ones are free. Coins score too.` |
| hlp.js:52 | `Playing earlier lets you grab tiles, goods and djinns before your rivals can.` | `Playing earlier lets you grab the best things first.` |
| hlp.js:54 | `A tile glows only if you can finish a legal move from it. Plan where your last person lands.` | `A tile glows only if you can finish a move from it.` |
| hlp.js:55 | `Yellow and white are kept for points. Green buys goods, blue earns coins, red removes people, purple makes items.` | `Yellow, white: points. Green: goods. Blue: coins. Red: removes people. Purple: items.` |
| hlp.js:57 | `Your last person must land on a tile that already holds their colour. You then take all of that colour.` | `Land your last person on their own colour, then take them all.` |
| hlp.js:61 | `Djinn and item chips are optional. Tap one, then a glowing target if it asks for one.` | `Djinn and item chips are optional. Tap one, then a glowing target.` |
| hlp.js:62 | `Coins equal your Masons times the blue tiles in the 3 by 3 square around you.` | `Each Mason earns 1 coin per blue tile within one step.` |
| hlp.js:64 | `A Shadow removes one person up to its count of steps away, or a rival’s Advisor or Sage.` | `Shadows remove a nearby person, or a rival’s Advisor or Sage.` |
| hlp.js:65 | `If a tile empties, you claim it with a camel, so a removal can win you land.` | `Empty a tile and your camel claims it.` |
| hlp.js:68 | `A camel marks who holds a tile. Tile value, palaces and palms all score for the holder.` | `Your camel marks a tile as yours. Its points all go to you.` |
| hlp.js:73 | `Pay 2 Sages, or 1 Sage and 1 Mystic, to take a face-up djinn. Spent Sages stop scoring.` | `Pay 2 Sages, or a Sage and a Mystic. Paid Sages stop scoring.` |
| hlp.js:74 | `Each djinn is worth points and has a power, either always on or used by paying Sages.` | `Each djinn scores points and has a power.` |
| hlp.js:76 | `Different kinds of goods make sets: 1, 3, 7, 13, 21 points for 1 to 5 kinds, and more beyond.` | `Sets of different goods score 1, 3, 7, 13, 21 points.` |
| hlp.js:143 | `This follows the best route to a good finish.` | `This is the best route to finish.` |
| score.js:38 | `'★ Best start: up to +'+SC.bestTotal+': '+SC.bestLabel` | `'★ Best start: +'+SC.bestTotal+' ('+SC.bestLabel+')'` |
| score.js:41 | `Keep walking: the last person must land on its own colour` | `Keep walking. The last one must match its colour.` |
| score.js:43 | `'. Finish the tile action, then your turn ends.'` | `'. Finish the tile action to end your turn.'` |
| ui.js:45 | `Tap a glowing tile to start` | `Tap a glowing tile` |
| ui.js:169 | `Not allowed now` | `You cannot do that now.` |
| ui3.js:58 | `Lead the tribes. Rule the bazaar.` | `Collect tribes. Claim land. Win the bazaar.` |
| engine.js:107 | `⛺ The tent (scores its tile and each red tile around it)` | `⛺ The tent (its tile plus 1 per nearby red tile)` |
| engine.js:111 | `has placed the last camel: the game ends once every player has played this turn.` | `placed the last camel. The round finishes, then the game ends.` |
| rules-html.js:3 | `The old sultan is gone and the sultanate of Qamar is up for grabs. Shift its tribes from tile to tile, claim land with your camels, summon djinns and trade in the bazaar.` | `Move tribes across the bazaar, claim land with camels, and summon djinns.` |
| rules-html.js:5 | `<li><b>Sell</b> goods if you like. Most points wins.</li>` | `<li><b>Sell</b> goods if you like.</li>` |
| rules-html.js:7 | `Each round starts with a bid. In the order of the last round, each player puts a marker on a free spot of the turn-order track and pays its price: 0, 0, 0, 1, 3, 5, 8, 12 or 18 coins.` | `Each round starts with a bid. Put a marker on a free spot and pay its price.` |
| rules-html.js:7 | `If two players sit on spots with the same price, the one who bid later plays first.` | `Same price? The later bidder plays first.` |
| rules-html.js:7 | `With 2 players, each of you has two markers and so takes two turns a round.` | `With 2 players, each of you has two markers and two turns.` |
| rules-html.js:11 | `You may not step straight back onto the tile you just left (you may pass a tile again later). Mountains block the way.` | `Never step straight back. Mountains block the way.` |
| rules-html.js:12 | `The <b>last</b> person must land on a tile that already holds its colour. Then you take everyone of that colour from that tile.` | `The <b>last</b> person must land on its own colour. Take them all.` |
| rules-html.js:13 | `If the tile is now empty, you claim it: put one of your camels there (or your tent, with the Crafters).` | `An emptied tile is yours: put a camel there (or your tent).` |
| rules-html.js:14 | `Do the <b>tribe action</b> of the colour you took, then the <b>tile action</b> of the tile you ended on (both optional where the card says “may”).` | `Do the <b>tribe action</b>, then the <b>tile action</b>. “May” means optional.` |
| rules-html.js:22 | `earn coins: the number of Masons times the blue tiles around you (the 3×3 square, your tile included). Each Mystic card you spend adds 1 Mason.` | `earn 1 coin per Mason for each blue tile around you. A Mystic adds one Mason.` |
| rules-html.js:23 | `remove one person up to that many steps away, or one Advisor or Sage kept by a rival. Each Mystic adds 1 step.` | `remove a person within that many steps, or a rival’s Advisor or Sage. A Mystic adds a step.` |
| rules-html.js:34 | `Mystics are special cards: they never score, but they boost Masons and Shadows, stand in for a Sage when summoning, and pay djinn powers.` | `Mystics never score. They boost Masons and Shadows, or replace a Sage.` |
| rules-html.js:36 | `Score coins, Advisors, Sages, djinns, the tiles you hold (with their palms and palaces), goods, and any expansion extras.` | `Add up coins, people, tiles, palms, palaces, djinns, goods and extras.` |
| rules-html.js:39 | `purple Crafters, Workshops (pay 1 Crafter or 2 Mystics for an item), Spice Exchanges (4 coins for any face-up good), a Ravine, mountains beside the Workshops, and a tent for each player.` | `adds purple Crafters, Workshops, Spice Exchanges, a Ravine and a tent each.` |
| rules-html.js:40 | `Wonder City tiles (5, 20, 45, 80 or 125 points for holding 1 to 5), the Great Lake (palms and palaces next to it score double) and room for a 5th player.` | `Wonder Cities score more as you hold more. Adds a Great Lake.` |
| rules-html.js:41 | `at a Shrine you may hire the face-up cutpurse instead of a djinn. Later, when you take people of its colour, send it out: every rival gives something up and you take the best of it.` | `hire a cutpurse at a Shrine; it later makes rivals give something up.` |
| rules-html.js:44 | `Tip: tap the glowing tiles on the board. The panel on the right always says what the game is waiting for; the card list explains every djinn, tile, good and token.` | `Tip: tap the glowing tiles. The status line says what the game needs.` |
| data.js:4 | `Keep them. 1 point each, and 10 more for every rival with fewer Advisors.` | `Keep them. 1 point each, plus 10 per rival you outnumber.` |
| data.js:5 | `Earn coins: Masons × blue tiles in the 3×3 around the tile (+1 per Mystic you add).` | `Earn coins: Masons × nearby blue tiles. Each Mystic adds a Mason.` |
| data.js:6 | `Remove one person within that many steps (+1 per Mystic), or one Advisor or Sage kept by a rival.` | `Remove a nearby person or rival Advisor or Sage. Mystics add range.` |
| data.js:19 | `A city of wonders: the more of them you hold, the more they are worth (5 / 20 / 45 / 80 / 125).` | `Worth more the more you hold: 5 / 20 / 45 / 80 / 125.` |
| data.js:37 | `This turn your last person may be dropped on any tile holding its colour, ignoring distance and mountains.` | `Your last person may land on any tile of its colour.` |
| djinns.js:13 | `This turn your Shadows take 2: two people from one tile, or two Advisors/Sages from one rival.` | `This turn your Shadows take 2 people from one tile or rival.` |
| djinns.js:15 | `When your Shadows take a Trader: draw a goods card; a Mason: earn what it would have; an Advisor or Sage: keep it yourself (a Crafter: keep it and draw an item).` | `Shadows keep what they take: Traders give goods, Masons give coins.` |

Notes: the rules page says ties go to the player with more coins (rules-html.js:36), but lore.js:75 says equal scores share the win. A worker should check the engine and make both agree. Several `old` entries are fragments inside a longer string; grep for the fragment. Lines with `\'` are escaped quotes in source.

Lines fixed: 87
