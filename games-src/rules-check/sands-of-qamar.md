# sands-of-qamar: rules check

Adapts: a two-to-four player (five with an expansion) meeple-moving, turn-order-bidding game on a 30-tile grid: lift all people from a tile, drop them one per step, the last must land on a matching colour, take that colour and do its tribe action, then the tile action.

Sources checked
- zatu.com "how to play" article (setup, camels, builders, merchants, sacred place, palm/palace values, end condition).
- geekyhobbies.com review-and-rules article (setup, bidding track, all five tribe actions, tile actions, merchandise sale values, final scoring, tie rule).
- board-game.co.uk (redirect to zatu.com) and a general encyclopedia article: little extra detail.
- No publisher rulebook text was reachable (search only returned reviews and summaries). The project's own research file ../rules.md named in data.js is not in the repo.
- Project notes: games-src/ft/rules-notes.md. Engine read: games-src/ft/src/engine.js, djinns.js, data.js.

Counts: WRONG 1 (med), MISSING 1 (med), SIMPLIFIED 7

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| WRONG (confidence med; sources disagree) | engine.js:76 endRound / :109 claimTile (G.endTrig) | When a player places their last camel the game ends only at the end of the whole round, so everyone after them in turn order and the rest of the round still play | Two of three summaries say the game ends at the end of that player's turn (the round is not completed); one says a final round is played. Needs the rulebook to settle. The "no legal move left" ending is handled correctly |
| MISSING (confidence med) | engine.js:156-157 placePalace / placePalm | Palm trees and palaces are unlimited | The pieces come from a finite supply; when it runs out the tile action does nothing. Counts (believed 22 palms, 10 palaces) not confirmed by any source reached |
| SIMPLIFIED-ON-PURPOSE | rules-notes.md "Assumptions"; data.js:33-42 | Crafters expansion: split of items is 9 precious (3 each of 5/7/9) and 9 magic items with invented counts | Real item mix and counts unknown to the previous worker; marked as assumed |
| SIMPLIFIED-ON-PURPOSE | djinns.js (jawhar, sana, hafiz, majlis) | Printed points of 2 Crafters djinns, the "+5 per djinn" promo and the cutpurse djinn are guessed | Marked "assumed" in data |
| SIMPLIFIED-ON-PURPOSE | data.js:30 BIDTRACK_5 | Five-player track is 18, 12, 8, 5, 5, 3, 3, 1, 1, 0, 0, 0, inferred from photos | Unconfirmed |
| SIMPLIFIED-ON-PURPOSE | rules-notes.md | Wonder Cities whim cards are left out | Expansion extra content not implemented |
| SIMPLIFIED-ON-PURPOSE | engine.js:62-65 bidMoves | A player who cannot afford any free spot takes the cheapest free spot and pays all coins | Rulebook behaviour not seen |
| SIMPLIFIED-ON-PURPOSE | engine.js:113-117 / thiefGive | Cutpurse "give up" choices for rivals are chosen by the computer (least valuable thing) | A real rival chooses |
| SIMPLIFIED-ON-PURPOSE | rules-notes.md "Crafter majority" | Tied players all count as having the most Crafters | Tie rule unconfirmed |

## Verified correct (against the three summaries)
- 30 tiles, 3 people drawn onto each; 16/20/18/18/18 people of the five colours (data.js:7). 54 goods cards: 6 groups as listed, 18 Mystics (data.js:27). Goods sale values 1,3,7,13,21,30,40,50,60 for 1..9 different kinds; Mystics do not count (data.js:28, doSell).
- 50 coins each; 8 camels (3-4 players), 11 camels and two turn markers each with 2 players (data.js:31, engine.js:29).
- Turn order: pay the amount on the chosen track spot, play order from dearest to cheapest (engine.js:66-69). Track 18,12,8,5,3,1,0,0,0.
- Movement: lift all, one per step orthogonally, no immediate step back, last person must land on a tile already holding its colour; people dropped earlier in the same move count (startLegal, canFinish). Take all of the last colour; empty tile gets a camel (finishMove, claimTile). Hamlet/Oasis actions are compulsory (tileMoves returns without a skip).
- Tribe actions: Advisors kept, 1 point each plus 10 per rival with strictly fewer (scoreOf:102); Sages kept, 2 points each; Traders take that many from the front of the market row (doTribe:127); Masons earn Masons x blue tiles in the 3x3 area including the end tile, a discarded Mystic adds one Mason (doTribe:128); Shadows remove one person within a distance equal to the number of Shadows (+1 per Mystic) or a rival's Advisor/Sage; Masons, Traders and Shadows return to the bag.
- Tile actions: Shrine pays 2 Sages or 1 Sage + 1 Mystic for a face-up djinn; Bazaar Stall 3 coins for 1 of the first 3 goods; Grand Bazaar 6 coins for 2 of the first 6 (tileMoves).
- Final score: coins, Advisors, Sages, djinn points, 3 per palm and 5 per palace on controlled tiles, printed tile values, goods sets (scoreOf:101-110). Ties share the win (finish:115).

## Not verified
- Shelf end-of-game timing (see first finding): confidence on "end of turn" is med-low; sources conflict.
- Zero-cost bidding stack order. Code: later bidder among equal-cost spots plays first (engine.js:68). One source says a zero bid goes to the bottom zero space and pushes earlier zero markers up, which can be read either way. Confidence low.
- Whether a Mystic adds a Mason (code) or adds one to the blue-tile count (one summary). Result differs: (n+f)*blues vs n*(blues+f). Confidence low.
- Tile mix and printed tile values (5 Hamlets worth 5, 6 Oases worth 8, 8 stalls worth 6, 4 bazaars worth 4, shrines 6/6/6/6/10/12/15) and djinn point values/effects for the 22 base djinns (only plausibility-checked against the review text; none of 22 fully sourced). Confidence low.
- Whether any payment is owed to a rival when ending on their tile: the three summaries mention none, so none is implemented. Confidence med.
- Tie-break: summaries say tied players share; one possible official tie-break (most coins) was not found. Confidence low.
- Merchants: summaries say the cards come off the front of the row; code does the same. Confidence med.

## Fixed (W391)
- WRONG game ends after the whole round -> fixed: the game ends at the end of the turn in which the last camel is placed (two of three summaries; the third says a final round, so confidence is medium). Test "game-ends-at-end-of-the-turn-of-the-last-camel" (ft/rules-test.js).
- MISSING finite palms and palaces -> fixed with 22 palms and 10 palaces (counts believed, not sourced); a tile action with an empty supply does nothing. Test "palm-and-palace-supply-is-finite".
