# Sands of Qamar: rules checklist (W430)

Every rule of the published base game that this adaptation must follow, one number per rule. Each rule has exactly one assertion in `logic-test.js` (same number), run against the real engine in `src/`.

Sources: **RB** = the published rulebook text, **SS** = the player summary sheet (turn flow and the 22 djinn effects and costs), **UV** = printed on tiles/cards, not in any text I could read, so the test only checks the engine against its own data table (not independent proof).

Out of scope here: the expansions (Crafters, Wonder Cities, Cutpurses, promo djinns, 5th player). Not testable from text: exact VP printed on each djinn and on each tile (marked UV).


## Setup

1. [RB] 30 tiles are laid in a 5 x 6 rectangle (6 columns, 5 rows).
2. [RB] Of the 30 tiles, 12 are blue-valued (Hamlets, Shrines) and 18 are red-valued (Bazaars, Oases).
3. [UV] Tile mix is 5 Hamlets, 7 Shrines, 6 Oases, 8 Bazaar Stalls, 4 Grand Bazaars (counts printed on the tiles; not in the rulebook text).
4. [RB] 90 meeples: 16 yellow Advisors, 20 white Sages, 18 blue Masons, 18 green Traders, 18 red Shadows; shaken out 3 per tile, so the bag is empty after setup.
5. [RB] 54 resource cards: 36 goods (Ivory, Jewels, Gold x2; Papyrus, Silk, Spice x4; Fish, Wheat, Pottery x6) and 18 Mystics. 9 are laid face up.
6. [RB] 22 Djinn cards; the top 3 are laid face up.
7. [RB] Each player starts with 50 gold coins.
8. [RB] 3-4 players: 8 camels and 1 turn marker each. 2 players: 11 camels and 2 turn markers each.
9. [RB] The bank holds 12 palm trees and 10 palaces.
10. [RB] The initial bid order is random (turn markers are placed randomly on the bid order track).

## Bidding

11. [UV] The turn order track has 9 spots costing 18, 12, 8, 5, 3, 1, 0, 0, 0 gold (3 spots at 0). The rulebook examples show the 5, 3, 1 and 0 spots; 18, 12 and 8 are from the printed track.
12. [RB] The bidder immediately pays the cost of the chosen spot to the bank.
13. [RB] Except at 0, no two markers may sit on the same spot: a taken paid spot cannot be chosen again.
14. [RB] At most 3 markers on the 0 spots: with three at 0 the next bidder must bid at least 1.
15. [RB] Players act in order of the spots they bid: highest-cost spot first.
16. [RB] Among markers on 0 the LAST bidder plays first of them (earlier 0 bids are pushed down the aisle and play last).
17. [RB] At the start of your turn your marker moves to the first empty bid-order spot: next round bids in the order of play.
18. [RB] 2 players: each owns two markers, so each plays twice per round, even twice in a row when the markers sit on adjacent spots.
19. [RB] Gold paid for turn order goes to the bank and the bidder keeps no refund (coins fall by exactly the price, for every price).

## Movement

20. [RB] You choose a tile holding at least 1 meeple and take ALL its meeples in hand; a tile without meeples cannot be chosen.
21. [RB] You drop exactly 1 meeple on each tile you pass through, starting with a tile adjacent to the one you lifted from.
22. [RB] No diagonal moves: every drop is on a tile sideways-adjacent to the previous tile.
23. [RB] No immediate backtracking: you cannot step back onto the tile you just left, even if it holds your colour.
24. [RB] You may re-enter a tile later in the same move (a loop needs 5 meeples); only the immediate step back is banned. A meeple dropped earlier in the move counts as "already there" for the last-colour rule.
25. [RB] Last meeple same colour: the last meeple dropped must land on a tile that already holds a meeple of its colour; a start tile with no such ending is not selectable.
26. [RB] You choose the order in which you drop the colours from your hand (both orders are offered when both are legal).
27. [RB] You may pass through empty tiles (dropping one meeple on each) but may never end on an empty tile.
28. [RB] Colour rule uses the whole hand: a drop is only allowed if the rest of the hand can still reach a legal ending.
29. [RB] Exactness check against an independent brute-force of the movement rules on 400 random boards: the engine offers exactly the legal start tiles and exactly the legal (tile, colour) drops at every step of random full moves.
30. [RB] You must make a meeple move if one is legal (no passing, no ending the turn before moving); a tribe action cannot be skipped while a kill target exists.

## Tile control

31. [RB] After the move you take back the last meeple dropped plus ALL meeples of that colour already on the tile.
32. [RB] If that empties the tile (only that colour was there), you take control by placing a camel on it.
33. [RB] If other colours remain on the tile you do not take control.
34. [RB] Once a camel is on a tile it never changes owner: emptying a controlled tile gives no new camel.
35. [RB] If you have no camels left you cannot take control (tile stays unowned) and the turn continues normally.
36. [RB] The tribe action is performed whether or not you took control of the tile.

## Tribes

37. [RB] Advisors (yellow): the collected meeples are kept in front of you.
38. [RB] Sages (white): the collected meeples are kept in front of you.
39. [RB] Traders (green): meeples go back in the bag and you take that many resource cards from the START of the row; the row is not refilled until clean-up.
40. [RB] A Mystic taken with Traders is held as a Mystic (not goods).
41. [RB] Traders with fewer cards in the row than meeples: you take what is there.
42. [RB] Masons (blue): coins = (number of blue-valued tiles in the 3x3 around the final tile, incl. it) x (masons returned to the bag).
43. [RB] The final tile itself counts if it is blue-valued.
44. [RB] Masons bonus: discard any number of Mystics; each adds +1 to the multiplier. Mystics are discarded.
45. [RB] Masons: the Mystic bonus is optional and partial use is allowed (1 of 2 Mystics).
46. [RB] Masons return to the bag (not kept).
47. [RB] Shadows (red): kill ONE meeple of any colour on a tile no farther than 1 step per shadow you returned (incl. the one just dropped), counted sideways only. With 2 shadows: distance 2 yes (diagonal = 2), distance 3 no.
48. [RB] With 3 shadows the range is 3: a tile 3 away is a legal target, a tile 4 away is not.
49. [RB] Shadow Mystic bonus: each Mystic discarded adds 1 to the range.
50. [RB] The shadows and the killed meeple go back to the bag; exactly one meeple dies however many shadows you have.
51. [RB] The victim may stand on the final tile itself (distance 0).
52. [RB] Alternatively kill ONE yellow Advisors or white Sage that an opponent keeps in front of them.
53. [RB] You cannot kill your own kept meeples, and an opponent's other kept things (coins, camels) are not targets.
54. [RB] If your kill empties a new tile of all meeples, you take control of it with a camel (a second tile in one turn).
55. [RB] A kill that empties the FINAL tile itself (a different colour was left on it) also gives control of it.
56. [RB] Out of camels: the tile you ended on is claimed first, so the tile emptied by the kill stays unowned.
57. [RB] No Shadow kill target in range: the tribe action is simply done with no kill (turn is not blocked).

## Tile actions

58. [RB] Oasis (compulsory): place 1 palm tree on the tile you ended on.
59. [RB] Hamlet (compulsory): place 1 palace on the tile you ended on (no skip offered).
60. [RB] If the supply of palms/palaces has run out, the compulsory action is ignored.
61. [RB] Palms/palaces are placed on the tile even when you did not take control; any number may stack on a tile.
62. [RB] Bazaar Stall (optional): pay 3 gold, take 1 of the first 3 resource cards; not the 4th. Row is not refilled yet.
63. [RB] Bazaars/shrines are optional but need the full price: with 2 gold the Bazaar Stall offers nothing but skip.
64. [RB] Grand Bazaar (optional): pay 6 gold, take 2 of the first 6 resource cards (15 combinations, never the 7th card).
65. [RB] Grand Bazaar with only 1 resource card left: you may still pay 6 gold to take that one card.
66. [RB] Shrine (optional): pay 2 Sages, take the Djinn of your choice among those face up; Sages return to the bag; the Djinn is not replaced until clean-up.
67. [RB] Shrine alternative price: 1 Sage + 1 Mystic (Mystic discarded).
68. [RB] Shrine cannot be used with only 1 Sage and no Mystic (or only Mystics).
69. [RB] The tile action is that of the tile you ENDED your move on, even if you did not take control of it.
70. [RB] A second tile controlled through Shadow kill gives NO tile action; only the final tile's action is performed.

## Sale

71. [RB] A suit of 1..9 DIFFERENT goods sells for 1, 3, 7, 13, 21, 30, 40, 50, 60 gold.
72. [RB] Selling discards the cards and pays the table amount from the bank (3 different cards = 7 gold).
73. [RB] You may sell several suits in one turn (rulebook example: 6 different = 30, plus 3 duplicates = 7).
74. [RB] Mystics cannot be sold.
75. [RB] A suit may contain only different cards: two copies of one kind cannot be sold together.
76. [RB] The sale happens at the end of your turn, after tribe and tile actions (not during the move).
77. [RB] Selling is optional: a turn can end with goods kept.

## Clean-up

78. [RB] Resource row is refilled to 9 only after all players have played, shifting remaining cards to the front.
79. [RB] Djinn row is refilled to 3 after all players have played.
80. [RB] When the resource deck is exhausted, discards are reshuffled; with nothing left the row stays short.

## End

81. [RB] A player placing their last camel ends the game at the end of THAT TURN: every other player still takes their actions this turn, then the game ends.
82. [RB] The last camel also ends the game when placed by Shadow kill (second tile) -- the end is triggered by dropping the last camel.
83. [RB] The game also ends when no legal meeple move is possible: that player and all after can only use djinn powers; the turn finishes and scores are computed.
84. [RB] Pieces are conserved over whole games (90 meeples, 54 resource cards, no negatives): computer-vs-computer sweep with the engine invariants checked after every move.

## Scoring

85. [RB] 1 VP per gold coin.
86. [RB] Advisors: 1 VP each plus 10 VP for each opponent with strictly fewer Advisors (ties give no bonus).
87. [RB] Sages: 2 VP each.
88. [UV] Djinns: the sum of the VP printed on each Djinn you hold (values live on the cards; the engine table is checked for sum behaviour only).
89. [RB] Palm trees: 3 VP each, only on tiles you control.
90. [RB] Palaces: 5 VP each, only on tiles you control.
91. [RB] Tiles: the printed value of every tile you control (camel on it).
92. [RB] goods: each series of different cards scores the table value (6 different + 3 duplicates of three kinds = 30 + 7).
93. [RB] goods is scored as the best split into series of different cards (checked against a brute-force best split on 300 random hands).
94. [RB] Mystics score nothing at game end.
95. [RB] Total = coins + advisors + sages + djinns + palms + palaces + tiles + goods.
96. [RB] Highest total wins; a tie is shared (both listed as winners).

97. [SS] Each PAIR of Mystics you hold at game end acts as 1 wild goods of your choice (no cost).  _(wild goods)_

98. [SS] Cost 1 Sage or 1 Mystic: pick an empty tile (no camel, meeple, palm tree or palace) and place 3 meeples drawn at random from the bag on it.  _(3 meeples)_

99. [SS] Each time someone gets a Djinn: 1 gold if it is you, 2 gold if it is an opponent (taking a different Djinn).  _(gold per djinn)_

100. [SS] Your Sages and Advisors are protected from Shadows.  _(protection)_

101. [SS] Cost 1 Sage or 1 Mystic: place 1 palace on any Hamlet (anywhere on the board, any time in your turn).  _(palace on Hamlet)_

102. [SS] Cost 1 Sage + (1 Sage or 1 Mystic): the gold your Masons get this turn is doubled.  _(double masons)_

103. [SS] Cost 1 Sage or 1 Mystic: place 1 palm tree on any Oasis.  _(palm on Oasis)_

104. [SS] Cost 1 Sage or 1 Mystic: when you place a palace this turn you may drop it on a neighbouring tile instead.  _(palace neighbour)_

105. [SS] Each of your palm trees is worth 5 VP instead of 3.  _(palm value 5)_

106. [SS] Cost 1 Sage or 1 Mystic: your Shadows kill 2 meeples of any colour on the same tile, or 2 Sages/Advisors from the same opponent.  _(double kill)_

107. [SS] Each of your Advisors is worth 3 VP instead of 1 (the +10 majority bonus is unchanged).  _(advisor value 3)_

108. [SS] When your Shadows kill: a Trader -> draw the top resource card; a Mason -> take the gold that Mason would have taken; a Advisor or Sage -> place it in front of you instead of killing it.  _(kill bonuses)_

109. [SS] Cost 1+ Mystics, when bidding: each Mystic discarded lowers your bidding cost by one spot (you still take the chosen spot).  _(cheaper bid)_

110. [SS] Cost 1 Sage or 1 Mystic: when you build a palm tree this turn you may place it on a neighbouring tile instead.  _(palm neighbour)_

111. [SS] Cost 1 Sage + (1 Sage or 1 Mystic): take control of 1 empty tile (no camel, meeple, palm or palace) and place a camel on it.  _(free camel)_

112. [SS] Each time a meeple is dropped on one of your tiles during a move: 1 gold if you did the move, 2 gold if an opponent did.  _(coin per drop)_

113. [SS] Each time a palace is placed: 1 gold if you placed it, 2 gold if an opponent did.  _(gold per palace)_

114. [SS] Each time Shadows kill: 1 gold if you did the killing, 2 gold if an opponent did.  _(gold per kill)_

115. [SS] Each of your Sages is worth 4 VP instead of 2.  _(sage value 4)_

116. [SS] Cost 1 Sage + (1 Sage or 1 Mystic): draw the top 3 Djinns, keep 1, discard the other 2.  _(pick a djinn)_

117. [SS] Cost 1 Mystic: take the top card of the resource draw pile.  _(take a card)_

118. [SS] Cost 1 Sage + (1 Sage or 1 Mystic): take control of 1 tile that holds only meeples (no camel, palm tree or palace); place a camel on it.  _(free camel on meeples)_

## Djinns

119. [SS] A Djinn power with a cost can only be used once per turn, only on the turn of its owner, and can be used the moment you get the Djinn.  _(once per turn / timing)_
