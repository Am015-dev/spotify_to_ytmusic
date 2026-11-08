# Twin Thrones copy-fix
Game: Twin Thrones. Date: 2026-11-08. Source: games-src/twin-thrones/src plus campaign.json (all coach, tracker, rules, result text).

## Goal card
The Goal card (`'Goal: ' + camp.goal.text`, ui.js newGame) states the aim in ONE sentence. Current goals: "Win the duel.", "Win with at least 40 points.", "Win with the conflict pawn on your side of the track.", "Win by military or science supremacy." All are one short sentence, so no fix needed. Optional: swap "supremacy" for plain words (see table).

| file:line | old line | new line |
|---|---|---|
| campaign.json:1221 | Wonders give points and a power. You and Pell take four each, turn by turn. | Wonders give points and a power. You and Pell pick four each. |
| campaign.json:1222 | Age I. Glowing cards are free to take. Tap one to see it big, then build, sell or raise a wonder. Cards are small: the big card is your reading view. | Glowing cards are free to take. Tap one to read it. |
| campaign.json:1223 | Pell took a card you uncovered. Before you take a card, check what it frees for him. | Pell took a card you uncovered. Check what your pick frees for him. |
| campaign.json:1224 | A free card costs nothing. Production cards give you that resource every turn. | Free card! Production cards give you that resource every turn. |
| campaign.json:1225 | Yellow cards pay coins at once, and make selling better later. | Yellow cards pay coins now and make selling pay more. |
| campaign.json:1226 | You paid coins for that. Missing resources are bought for 2 coins plus what Pell produces of them. | You paid coins for missing resources: 2 each, plus 1 per matching card Pell has. |
| campaign.json:1227 | A shield pushes the conflict pawn toward Pell. Nine steps wins the game on the spot. | Shields push the pawn toward Pell. Nine steps wins the game. |
| campaign.json:1228 | The pawn passed a marked space: coins are looted from the loser. Reach step 9 and the duel ends. | The pawn passed a marked space, so the loser drops coins. |
| campaign.json:1229 | That card has a chain mark. Later cards with the same mark are free for you. | That card has a chain mark. Later cards with that mark are free. |
| campaign.json:1230 | Built free by chain! Chains are the cheapest way to grow. | Built free by chain! Chains save you coins. |
| campaign.json:1231 | A science symbol. Two of the same earn a progress token; six different win the game at once. | Two matching symbols earn a token. Six different symbols win. |
| campaign.json:1232 | A pair of one symbol! Pick a progress token: a bonus you keep all game. | A matching pair! Pick a progress token to keep all game. |
| campaign.json:1233 | Sold for 2 coins, plus 1 for each yellow card you own. Sell what you cannot use. | You get 2 coins, plus 1 per yellow card. Sell cards you cannot use. |
| campaign.json:1234 | You sold a card you could build for free. Selling is best for cards you cannot use. | You sold a card you could build free. Sell cards you cannot use. |
| campaign.json:1235 | A wonder rises. Its card goes underneath, and you get its points and power. | Wonder built! The card goes underneath, and you get its points and power. |
| campaign.json:1236 | A new age. The player behind on the conflict track chooses who starts; at a tie, whoever took the last card. | New age. The player behind on the pawn track picks who starts. |
| campaign.json:1237 | A guild scores at the very end from the richer city. Big points for the right city. | Guilds score at game end, based on the richer city. |
| campaign.json:1240 | Yellow trade posts make buying a resource cost only 1 coin instead of 2 plus. | Yellow trade posts cut the price of a resource to 1 coin. |
| campaign.json:1241 | Only seven wonders can ever be built in total; the last one is discarded. | Only seven wonders get built in total. The last one is lost. |
| campaign.json:1242 | Wonders can also play again, steal coins, discard a rival card or revive a thrown-away one. | Some wonders give an extra turn, steal coins, or bring back a card. |
| campaign.json:1243 | Every progress token has its own effect: tap one in the row to read it. | Each progress token does something different. Tap one to read it. |
| campaign.json:1244 | A tie on points goes to the player with the most civic (blue) points. | On a tie, the player with more blue points wins. |
| campaign.json:1245 | Six different science symbols win the game at once. | Six different science symbols win the game. |
| campaign.json:1246 | Nine steps on the conflict track win at once; the marked spaces loot coins. | Nine pawn steps win the game. Marked spaces steal coins. |
| campaign.json:1247 | The wonder draft runs 1-2-2-1 then 2-1-1-2 so nobody gets a long head start. | Wonder picks go 1-2-2-1, then 2-1-1-2, to keep it fair. |
| campaign.json:1250 | Civic: the points printed on your blue cards. | Civic: points printed on your blue cards. |
| campaign.json:1251 | Science: points on green cards, and the sets of symbols. | Science: points from green cards and symbol sets. |
| campaign.json:1253 | Guilds: purple cards score from the richer city. | Guilds: purple cards score from the richer city's cards. |
| campaign.json:1254 | Wonders: the points on the wonders you raised. | Wonders: points on the wonders you built. |
| campaign.json:1255 | Tokens: progress tokens score their own points. | Tokens: points from your progress tokens. |
| campaign.json:1256 | Coins: 1 point for every 3 coins you kept. | Coins: 1 point for every 3 coins you hold. |
| campaign.json:1257 | Conflict: points for where the pawn ended. | Conflict: points for where the pawn stopped. |
| campaign.json:1258 | Total: the most points wins; a tie goes to the most civic points. | Total: most points wins. A tie goes to more blue points. |
| campaign.json:1214 | Great works bring points and a power. Claim the glowing wonder. After that, every move is yours. | Wonders give points and a power. Take the glowing one. |
| campaign.json:1218 | From here the duel is real. Ione will chip in when a rule first matters. Tap the x to hush her. | Now the duel is real. Ione will explain rules as they come up. |
| campaign.json:1263 | Two thrones stand empty. Draft your wonders, then out-build the rival. | Two thrones stand empty. Pick wonders, then out-build your rival. |
| campaign.json:1264 | The river city and the hill city both claim the crown. Prove yours is greater. | The river city and the hill city both want the crown. |
| campaign.json:1265 | One pyramid, two rulers. Take smart, and leave the rival nothing. | One pyramid, two rulers. Take wisely and leave your rival little. |
| campaign.json:104 | The first stones are laid. Pell goes pale, but the Quarry master has heard of you. | The first stones are laid. Pell goes pale. |
| campaign.json:165 | Do not be discouraged. Study what you uncover, and try again. | Don't give up. Watch what you uncover, and try again. |
| src/ui.js:231 | Pick a progress token: a bonus you keep for the whole game. | Pick a progress token. You keep it all game. |
| src/ui.js:240 | Pick a wonder for your city. A wonder gives points and a power. You get 4. | Pick a wonder. Each gives points and a power. You get 4. |
| src/ui.js:244 | Choose: Build it, Sell it for coins, or use it for a Wonder. | Build it, sell it for coins, or use it for a wonder. |
| src/ui.js:246 | Tap a glowing card. Glowing cards are free to take. | Tap a glowing card. Those are free to take. |
| src/ui.js:234 | Pick one rival card to throw away. | Pick one rival card to discard. |
| src/ui.js:237 | Pick a thrown-away card to build for free. | Pick a discarded card to build free. |
| src/ui.js:228 | Choose who plays first in this age. | Choose who goes first this age. |
| src/ui.js:237 | Revive a discarded card | Rebuild a discarded card |
| src/ui.js:361 | Two rival cities, one pyramid of cards. Out-build, out-think, or out-march your rival. | Two rival cities, one pyramid of cards. Beat your rival. |
| src/ui.js:443 | Win by marching the conflict pawn to the rival capital, by collecting six different science symbols, or by having the most points after Age III. | Win by pushing the pawn, six science symbols, or most points. |
| src/ui.js:443 | Look for the glowing cards. Only those are free to take. | Find the glowing cards. Only those are free to take. |
| src/ui.js:443 | Watch what happens: the card moves, points and coins pop up, the pawn may march. | Watch the card move and the points and coins update. |
| src/ui.js:443 | Then your rival does the same, one step at a time. Tap the board to speed it up. | Then your rival moves. Tap the board to speed it up. |
| src/ui.js:443 | Take one uncovered card from the pyramid. <b>Build</b> it by paying its cost (missing resources are bought from the bank at 2 coins plus what your rival produces), <b>sell</b> it for 2 coins plus 1 per trade card you own, or <b>use it to raise a wonder</b>. Face-down cards flip when nothing covers them. | Take one uncovered card. <b>Build</b> it, <b>sell</b> it, or <b>raise a wonder</b>. |
| src/ui.js:443 | A card with an infinity mark is free when you own the matching symbol. | A card with an infinity mark is free if you own its symbol. |
| src/ui.js:443 | Shields push the pawn toward your rival. Passing the marked spaces loots coins from them. | Shields push the pawn toward your rival. Marked spaces steal their coins. |
| src/ui.js:443 | A matching pair of symbols lets you pick a progress token. | A matching pair of symbols earns a progress token. |
| src/ui.js:443 | Four each, but only seven can ever be built in total. | Each player gets four, but only seven get built. |
| src/ui.js:443 | Choose <b>Build</b> (pay its cost), <b>Sell</b> (take coins) or <b>Wonder</b> (tuck it under a wonder). | Choose <b>Build</b> (pay), <b>Sell</b> (take coins) or <b>Wonder</b> (tuck it under). |
| src/ui.js:388 | Neither crown falls. The river city and the hill city share the night. | Neither crown falls. The two cities share the night. |
| src/ui.js:395 | Military supremacy: the conflict pawn reached the rival capital. | Military win: the pawn reached the rival capital. |
| src/ui.js:395 | Military supremacy: the conflict pawn reached your capital. | Military loss: the pawn reached your capital. |
| src/ui.js:395 | Science supremacy: six different symbols. | Science win: six different symbols. |
| src/ui.js:395 | Won the tie on civic points. | Won the tie with more blue points. |
| src/ui.js:395 | A perfect draw. | A draw. |
| src/ui.js:68 |  begins: a fresh pyramid. |  begins. Here is a fresh pyramid. |
| src/ui.js:65 | Now free to take:  | Now free:  |
| src/ui.js:261 | Free by chain symbol | Free by chain |
| src/ui.js:261 |  of it for trade) |  for trade) |
| src/ui.js:264 | . Missing resources are bought with coins. | . Missing resources cost coins. |
| src/ui.js:264 | Needs nothing: this card is free. | Needs nothing. This card is free. |
| campaign.json:808 | Win by military or science supremacy. | Win by military or science. |

Lines fixed: 72
