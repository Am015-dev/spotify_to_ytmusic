# Twin Thrones: rules checklist (W435)

Source: the published structure of the 2-player card-draft duel this game adapts (rulebook from knowledge, cross-checked with its public English rulebook text). Names are never written here.
Every line is one numbered rule. `node logic-test.js` asserts each against the real engine (state set up exactly, one action, exact result); a failure prints `FAIL rule N: expected X, got Y`.

Rulebook points checked from the web text: first player starts Age I; weaker-military player chooses the next starter; with the pawn centred the last active player (took the last card) chooses; looting costs the rival 2 / 5 coins and never below 0; 3 and 6 steps loot, 9 steps wins.

**Not asserted (could not be confirmed to the rulebook, so no test pretends to):** individual Age I-III card costs and chain pairs other than those used above, Piraeus wonder cost, and which exact 3 cards are left out of each age. Cost-only; see rules-notes.md UNSURE lines.


## A. Setup

1. Each player starts with 7 coins.
2. 12 wonders exist; 8 are drawn for the draft (two groups of 4); all different.
3. Wonder draft round 1: first player picks 1, second picks 2, first gets the last of the 4 (order 0,1,1,0).
4. Wonder draft round 2 uses the other 4 wonders; second player picks 1, first picks 2, second gets the last (order 1,0,0,1).
5. After the draft each player owns 4 wonders, unbuilt.
6. 10 progress tokens: 5 face up on the board, 5 in the box (all different).
7. The military pawn starts on the centre space (0) of a -9..+9 track; no loot taken yet.
8. Age I and Age II decks: 20 cards each, drawn from pools of 23 (3 left out).
9. Age III deck: 20 cards = 17 of the 20 non-guild cards + 3 of the 7 guilds.
10. Age I pyramid: rows of 2,3,4,5,6 cards (6-card row is the front row).
11. Age II pyramid: rows of 6,5,4,3,2 cards (2-card row is the front row).
12. Age III pyramid: rows of 2,3,4,2,4,3,2 cards (front row = last 2).
13. Rows alternate face up / face down and the front (takeable) row is face up, in all 3 ages.
14. The first player (the one who picked the first wonder) takes the first turn of Age I.

## B. Pyramid

15. Only uncovered cards can be taken: at the start of Age I exactly the 6 front-row cards are available.
16. A card is covered by the cards diagonally in front of it; taking both unblocks it (Age I back card needs both its two neighbours gone).
17. A face-down card is turned face up when the last card covering it is taken.

## C. Turn actions

18. Build: pay the coin cost, the card joins your city.
19. A card with no cost is built for free.
20. You cannot build what you cannot afford (build move is not offered).
21. Discard for coins: you gain 2 coins + 1 per yellow card you own; the card goes to the discard pile.
22. Wonder: pay the wonder cost, the card is tucked under it, the wonder counts as built.
23. Only 7 wonders can be built in the whole game: once 7 exist, no wonder move is offered.
24. After a normal move the turn passes to the other player.
25. Chain: a card whose chain symbol you already own is built for free (no coins, no resources).
26. Without the chain symbol the same card costs full price (Water Arch = 3 stone).

## D. Resources and trading

27. Your own brown/grey production pays resource costs for free.
28. Each missing resource unit costs 2 coins + the number of that resource your rival produces (brown/grey cards).
29. Rival yellow-card production and rival wonder production do NOT raise the price.
30. A matching trade-post card (stone/clay/wood) makes that resource cost 1 per unit; other resources unchanged.
31. Customs Quay makes glass and papyrus cost 1 each.
32. A yellow choice card (Caravan Post) supplies ONE unit of one of its resources, not two.
33. A built wonder with a resource choice supplies one unit (Beacon Isle: wood/clay/stone; Sunken Harbor: glass/papyrus).
34. A card with a coin cost AND resource cost adds trading coins to the printed coins.
35. Trading coins are paid to the bank, the rival gets nothing (without Economy).
36. Economy token: the owner receives the coins the rival pays for trading resources.
37. Economy pays only for traded resources, not for the printed coin cost of a card.
38. Architecture token: wonders cost 2 resource units less.
39. Masonry token: blue cards cost 2 resource units less.
40. Architecture does not discount cards; Masonry does not discount wonders or non-blue cards.

## E. Yellow cards

41. Roadside Inn gives 4 coins when built; Brewhouse gives 6.
42. Trade Chamber: 3 coins per grey card in your city when built.
43. Grand Port: 2 coins per brown card in your city when built.
44. Armory: 1 coin per red card in your city when built.
45. Beacon Quay: 1 coin per yellow card in your city (it counts itself).
46. Sand Arena: 2 coins per built wonder in your city when built.
47. Yellow Age III cards score 3 points each at the end.

## F. Military

48. A red card moves the pawn toward the rival by its shields (player 0 positive, player 1 negative).
49. The pawn cannot go past 9 steps (clamped).
50. Reaching 3 steps: the rival loses 2 coins.
51. Reaching 6 steps: the rival loses 5 coins.
52. Loot cannot take the rival below 0 coins (rival with 1 coin loses 1).
53. Each loot token is taken only once: moving back and forth over 3 steps does not loot twice.
54. A move that jumps over both loot spaces (2 -> 6) takes both tokens: rival loses 2 + 5.
55. Player 1 pushing the pawn to -3 makes player 0 lose 2 coins.
56. 9 steps = immediate military victory.
57. Strategy token: red cards built after taking it give +1 shield.
58. Strategy token does not add shields to wonders.
59. End-of-game military points: 0 steps = 0, 1-2 steps = 2, 3-5 steps = 5, 6-8 steps = 10.

## G. Science

60. Second card with the same science symbol: take one of the face-up progress tokens.
61. Choosing the token removes it from the face-up row and gives it to you.
62. A pair earns a token only once per symbol (a third copy gives nothing).
63. If no progress token is left face up, a pair gives nothing and play continues.
64. 6 different science symbols = immediate science victory.
65. 5 different symbols is not a victory.
66. The Law token counts as a science symbol: 5 card symbols + Law = victory.
67. Taking the Law token as your 6th symbol wins at once.
68. Law is not a pair symbol: Law alone never gives a token.

## H. Progress tokens

69. Agriculture: 6 coins now and 4 victory points.
70. Philosophy: 7 victory points.
71. Mathematics: 3 points per progress token you own (including itself) at the end.
72. Urbanism: 6 coins when taken.
73. Urbanism: +4 coins every time you build a card by chain; not on a normal build.
74. Theology: every wonder you build lets you play again.
75. Law token alone gives no victory points or coins.

## I. Wonders

76. Colossus: 3 points, 2 shields; cost 3 clay + 1 glass.
77. Pyramids: 9 points; cost 3 stone + 1 glass + 1 papyrus.
78. Temple of Artemis: 12 coins and play again; cost 1 wood + 1 glass + 2 papyrus.
79. Hanging Gardens: 3 points, 6 coins, play again; cost 2 wood + 1 glass + 1 papyrus.
80. Great Library: 4 points; draw 3 of the 5 boxed tokens, pick one.
81. Mausoleum: 2 points; build one card from the discard pile for free.
82. Mausoleum with an empty discard pile: no pending choice, play continues.
83. Sphinx: 6 points and play again.
84. Great Lighthouse: 4 points; produces 1 wood/clay/stone of your choice.
85. Circus Maximus: 3 points, 1 shield, discard one rival grey card (goes to the discard pile).
86. Statue of Zeus: 3 points, 1 shield, discard one rival brown card.
87. Destroy wonders do nothing (no choice asked) when the rival has no card of that colour.
88. Appian Way: 3 points, 3 coins for you, rival loses 3 coins, play again.
89. Piraeus: 2 points, play again, produces 1 glass or papyrus of your choice.
90. Playing again keeps the same player to move; a wonder without "again" passes the turn.
91. If the last pyramid card is a play-again wonder, the age still ends normally (no stuck game).

## J. Guilds

92. Merchants: 1 point per yellow card in the city with the most (yours or rival).
93. Shipowners: 1 point per brown + grey card in the richest city.
94. Builders: 2 points per built wonder in the city with the most wonders.
95. Magistrates: 1 point per blue card in the city with the most.
96. Scholars (scientists): 1 point per green card in the city with the most.
97. Tacticians: 1 point per red card in the city with the most.
98. Moneylenders: 1 point per 3 coins in the richer city, no coins gained when built.
99. Guilds that pay coins (all but Builders and Moneylenders): 1 coin per matching card in the city with the most, when built.
100. Builders guild gives no coins when built.

## K. End-of-age and final scoring

101. At the end of an age the player with the weaker military (pawn on their side) chooses who starts: pawn toward player 0 -> player 1 chooses.
102. Pawn toward player 1 -> player 0 chooses who starts the next age.
103. Pawn on the centre: the last active player (who took the last card) chooses who starts.
104. The chosen starter moves first in the new age.
105. Clearing the Age III pyramid ends the game and scores it.
106. Score: blue card points + green card points + yellow card points + wonder points + token points + 1 per 3 coins + military zone points.
107. Highest total wins.
108. Tie on points: the player with more blue (civilian) points wins.
109. Tie on points and on blue points: shared victory (draw).
110. Instant victories (military, science) end the game immediately and beat points.
111. Full random games always reach a legal end (no stuck state, no negative coins, no duplicate card).
