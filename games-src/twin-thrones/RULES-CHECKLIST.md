# Twin Thrones: rules checklist (W435)

Source: the published structure of the 2-player card-draft duel this game adapts (rulebook from knowledge, cross-checked with its public English rulebook text). Names are never written here.
Every line is one numbered rule. `node logic-test.js` asserts each against the real engine (state set up exactly, one action, exact result); a failure prints `FAIL rule N: expected X, got Y`.

Rulebook points checked from the web text: first player starts Age I; weaker-military player chooses the next starter; with the pawn centred the last active player (took the last card) chooses; looting costs the rival 2 / 5 coins and never below 0; 3 and 6 steps loot, 9 steps wins.

**Not asserted (could not be confirmed to the rulebook, so no test pretends to):** the costs of the Age I-III cards not listed in section L, the Beacon Isle and Thunder Idol wonder costs, and which exact 3 cards are left out of each age (random, as in the original). Section L was checked against the original card list in FIXED1 (RULES-AUDIT.md).


## A. Setup

1. Each player starts with 7 coins.
2. 12 wonders exist; 8 are drawn for the draft (two groups of 4); all different.
3. Wonder draft round 1: first player picks 1, second picks 2, first gets the last of the 4 (order 0,1,1,0; the last one is automatic).
4. Wonder draft round 2 uses the other 4 wonders; second player picks 1, first picks 2, second gets the last automatically (order 1,0,0,1).
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
15. The first player is random: over 12 seeds both seats sometimes pick the first wonder.
16. With seat 1 first, the draft order is 1,0,0 then 0,1,1 and seat 1 opens Age I.

## B. Pyramid

17. Only uncovered cards can be taken: at the start of Age I exactly the 6 front-row cards are available.
18. A card is covered by the cards diagonally in front of it; taking both unblocks it (Age I back card needs both its two neighbours gone).
19. A face-down card is turned face up when the last card covering it is taken.

## C. Turn actions

20. Build: pay the coin cost, the card joins your city.
21. A card with no cost is built for free.
22. You cannot build what you cannot afford (build move is not offered).
23. Discard for coins: you gain 2 coins + 1 per yellow card you own; the card goes to the discard pile.
24. Wonder: pay the wonder cost, the card is tucked under it, the wonder counts as built.
25. Only 7 wonders can be built in the whole game: once 7 exist, no wonder move is offered.
26. After a normal move the turn passes to the other player.
27. Chain: a card whose chain symbol you already own is built for free (no coins, no resources).
28. Without the chain symbol the same card costs full price (Water Arch = 3 stone).

## D. Resources and trading

29. Your own brown/grey production pays resource costs for free.
30. Each missing resource unit costs 2 coins + the number of that resource your rival produces (brown/grey cards).
31. Rival yellow-card production and rival wonder production do NOT raise the price.
32. A matching trade-post card (stone/clay/wood) makes that resource cost 1 per unit; other resources unchanged.
33. Customs Quay makes glass and papyrus cost 1 each.
34. A yellow choice card (Caravan Post) supplies ONE unit of one of its resources, not two.
35. A built wonder with a resource choice supplies one unit (Beacon Isle: wood/clay/stone; Sunken Harbor: glass/papyrus).
36. A card with a coin cost AND resource cost adds trading coins to the printed coins (Caravan Post: 2 coins + glass + papyrus).
37. Trading coins are paid to the bank, the rival gets nothing (without Economy).
38. Economy token: the owner receives the coins the rival pays for trading resources.
39. Economy pays only for traded resources, not for the printed coin cost of a card.
40. Architecture token: wonders cost 2 resource units less.
41. Masonry token: blue cards cost 2 resource units less.
42. Architecture does not discount cards; Masonry does not discount wonders or non-blue cards.

## E. Yellow cards

43. Roadside Inn gives 4 coins when built; Brewhouse gives 6.
44. Trade Chamber: 3 coins per grey card in your city when built.
45. Grand Port: 2 coins per brown card in your city when built.
46. Armory: 1 coin per red card in your city when built.
47. Beacon Quay: 1 coin per yellow card in your city (it counts itself).
48. Sand Arena: 2 coins per built wonder in your city when built.
49. Yellow Age III cards score 3 points each at the end.

## F. Military

50. A red card moves the pawn toward the rival by its shields (player 0 positive, player 1 negative).
51. The pawn cannot go past 9 steps (clamped).
52. Reaching 3 steps: the rival loses 2 coins.
53. Reaching 6 steps: the rival loses 5 coins.
54. Loot cannot take the rival below 0 coins (rival with 1 coin loses 1).
55. Each loot token is taken only once: moving back and forth over 3 steps does not loot twice.
56. A move that jumps over both loot spaces (2 -> 6) takes both tokens: rival loses 2 + 5.
57. Player 1 pushing the pawn to -3 makes player 0 lose 2 coins.
58. 9 steps = immediate military victory.
59. Strategy token: red cards built after taking it give +1 shield.
60. Strategy token does not add shields to wonders.
61. End-of-game military points: 0 steps = 0, 1-2 steps = 2, 3-5 steps = 5, 6-8 steps = 10.

## G. Science

62. Second card with the same science symbol: take one of the face-up progress tokens.
63. Choosing the token removes it from the face-up row and gives it to you.
64. A pair earns a token only once per symbol (a third copy gives nothing).
65. If no progress token is left face up, a pair gives nothing and play continues.
66. 6 different science symbols = immediate science victory.
67. 5 different symbols is not a victory.
68. The Law token counts as a science symbol: 5 card symbols + Law = victory.
69. Taking the Law token as your 6th symbol wins at once.
70. Law is not a pair symbol: Law alone never gives a token.

## H. Progress tokens

71. Agriculture: 6 coins now and 4 victory points.
72. Philosophy: 7 victory points.
73. Mathematics: 3 points per progress token you own (including itself) at the end.
74. Urbanism: 6 coins when taken.
75. Urbanism: +4 coins every time you build a card by chain; not on a normal build.
76. Theology: every wonder you build lets you play again.
77. Law token alone gives no victory points or coins.

## I. Wonders

78. Colossus: 3 points, 2 shields; cost 3 clay + 1 glass.
79. Pyramids: 9 points; cost 3 stone + 1 papyrus.
80. Temple of Artemis: 12 coins and play again; cost 1 wood + 1 stone + 1 glass + 1 papyrus.
81. Hanging Gardens: 3 points, 6 coins, play again; cost 2 wood + 1 glass + 1 papyrus.
82. Great Library: 4 points; draw 3 of the 5 boxed tokens, pick one.
83. Mausoleum: 2 points; build one card from the discard pile for free.
84. Mausoleum with an empty discard pile: no pending choice, play continues.
85. Sphinx: 6 points and play again.
86. Great Lighthouse: 4 points; produces 1 wood/clay/stone of your choice.
87. Circus Maximus: 3 points, 1 shield, discard one rival grey card (goes to the discard pile).
88. Statue of Zeus: 3 points, 1 shield, discard one rival brown card.
89. Destroy wonders do nothing (no choice asked) when the rival has no card of that colour.
90. Appian Way: 3 points, 3 coins for you, rival loses 3 coins, play again.
91. Piraeus: 2 points, play again, produces 1 glass or papyrus of your choice.
92. Playing again keeps the same player to move; a wonder without "again" passes the turn.
93. If the last pyramid card is a play-again wonder, the age still ends normally (no stuck game).

## J. Guilds

94. Merchants: 1 point per yellow card in the city with the most (yours or rival).
95. Shipowners: 1 point per brown + grey card in the richest city.
96. Builders: 2 points per built wonder in the city with the most wonders.
97. Magistrates: 1 point per blue card in the city with the most.
98. Scholars (scientists): 1 point per green card in the city with the most.
99. Tacticians: 1 point per red card in the city with the most.
100. Moneylenders: 1 point per 3 coins in the richer city, no coins gained when built.
101. Guilds that pay coins (all but Builders and Moneylenders): 1 coin per matching card in the city with the most, when built.
102. Builders guild gives no coins when built.

## K. End-of-age and final scoring

103. At the end of an age the player with the weaker military (pawn on their side) chooses who starts: pawn toward player 0 -> player 1 chooses.
104. Pawn toward player 1 -> player 0 chooses who starts the next age.
105. Pawn on the centre: the last active player (who took the last card) chooses who starts.
106. The chosen starter moves first in the new age.
107. Clearing the Age III pyramid ends the game and scores it.
108. Score: blue card points + green card points + yellow card points + wonder points + token points + 1 per 3 coins + military zone points.
109. Highest total wins.
110. Tie on points: the player with more blue (civilian) points wins.
111. Tie on points and on blue points: shared victory (draw).
112. Instant victories (military, science) end the game immediately and beat points.
113. Full random games always reach a legal end (no stuck state, no negative coins, no duplicate card).

## L. Card data checked against the original card list (FIXED1)

114. Lookout (the free watchtower) costs nothing, gives 1 shield and has no chain.
115. Age I science: Herb Garden (wheel) and Weights Hall (scale) are worth 1 point; Scribe Room (quill) and Remedy Shop (mortar) cost 2 coins, are worth 0 and carry a chain.
116. Science symbols per age: Age I and Age II each hold mortar, quill, scale, wheel; Age III holds 2 globes and 2 sundials.
117. Age II science: Scholars' Court (quill, S1 W1 G1, 2 pts) chains from Scribe Room; Healers' House (mortar, C2 S1, 2 pts) chains from Remedy Shop; Herbarium (wheel, W1 P2, 1 pt) and Measure Hall (scale, W1 G2, 1 pt) give chains.
118. Age III science: two sundials worth 3 (S1 W1 G2; W2 G1 P1) and two globes worth 2 (C1 G1 P1 from Herbarium; S1 P2 from Measure Hall).
119. Every chain links the right pair of cards (17 links, none dangling).
120. Yellow card costs: Open Bazaar 3 coins + 1 clay; Caravan Post 2 coins + glass + papyrus; Armory S2 G1; Sand Arena C1 S1 W1.
121. Red card costs: Archery Range S1 W1 P1; Bastion S2 C1 P1; Siege Yard W3 G1; War Pavilion 8 coins (3 shields); High Fort C2 S2; City Wall S2 with no chain.
122. Blue card costs: Hall of Many Gods C1 W1 P2; Council Hall S3 W2; Grand Fountain C2 S1 P1; Sky Obelisk and Judges' Hall have no chain.
123. Wonder costs: Sky Tomb S3 P1; Moon Grove W1 S1 G1 P1; Grand Arena S2 W1 G1; Sunken Harbor W2 S1 C1.
