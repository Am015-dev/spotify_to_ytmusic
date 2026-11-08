# Perch & Plume: rules checklist (independent of rules-test.js)

Every rule of the adapted bird-card engine-builder, numbered. `logic-test.js` has exactly one assertion per number and prints `R<n> expected / got` for each failure. This file is generated: `node logic-test.js --md > RULES-CHECKLIST.md`.

Source tags: **RB** official rulebook text (checked 8 Nov 2026), **APP** appendix / designer clarifications of power wording as remembered, **MAT** player-mat artwork as remembered (the rulebook text does not state the row yields, so these three rules are unverified), **HOUSE** this adaptation's own choice.


## Setup

1. [RB] The bird tray starts with 3 face-up bird cards.
2. [RB] The birdfeeder starts with all 5 dice rolled.
3. [RB] The die has 6 faces: 5 food types plus one face that shows two foods (grub or seed).
4. [RB] Four end-of-round goals are chosen, all different.
5. [RB] Each player is dealt 5 bird cards, 5 food (one of each type) and 2 bonus cards to choose from.
6. [RB] A player keeps up to 5 birds and must discard 1 food per bird kept: kept birds + kept food = 5 (2 birds + 3 food is legal).
7. [RB] Keeping more than 5 items in total (3 birds + 3 food) is not allowed.
8. [RB] Keeping fewer than 5 items (keeping 5 birds but also 1 food) is not allowed: each bird kept costs one food.
9. [RB] Keeping 5 birds and no food, or 0 birds and all 5 food, are both legal.
10. [RB] A player keeps exactly 1 of the 2 bonus cards and discards the other.
11. [RB] Each food type kept can only be kept once (one of each type was dealt).
12. [RB] Round 1 gives every player 8 action cubes; rounds 2-4 give 7, 6 and 5.
13. [RB] The game has 4 rounds.

## Turn structure

14. [RB] On a turn a player takes exactly one of 4 actions: play a bird, gain food, lay eggs, draw cards. It spends one cube.
15. [RB] Turn order passes clockwise to the next player.
16. [RB] The same action may be taken on consecutive turns of the same player.
17. [RB] A player with no cubes left is skipped while others still have cubes.
18. [RB] The bird tray is refilled to 3 at the end of every turn (not during it).

## Action 1: play a bird

19. [RB] A bird can only be placed in a habitat printed on its card.
20. [RB] A bird card with several habitat symbols may be placed in any one of them.
21. [RB] The bird goes into the leftmost empty space of the chosen habitat.
22. [RB] A habitat holds at most 5 birds.
23. [RB] Egg cost is 0 in the first column.
24. [RB] Playing in column 2 or 3 costs 1 egg.
25. [RB] Playing in column 4 or 5 costs 2 eggs.
26. [RB] A bird cannot be played without enough eggs on the mat.
27. [RB] Eggs paid for a play are discarded from any birds on the mat (total eggs drop by the cost).
28. [RB] The food cost is paid from the food next to the mat; the tokens return to the supply.
29. [RB] A specific food in the cost must be paid with that food (1 fish is not paid by 1 seed).
30. [RB] A slash cost (fish / rodent) can be paid with either food.
31. [RB] A wild cost can be paid with any one of the 5 foods.
32. [RB] When playing a bird, any 2 food tokens may be spent as 1 food of any type (2 seeds pay for a fish).
33. [RB] A cost of no food (empty cost) needs no payment.
34. [RB] Food cached on birds can never pay a cost.
35. [RB] Playing a bird does not activate the brown powers in the row (it is the one action that does not).
36. [RB] A when-played power fires once, when the bird is played (here: draw 2 cards).
37. [RB] Brown and pink powers do not fire when their bird is played.
38. [RB] A played bird leaves the hand.
39. [RB] Playing a bird spends one cube and ends the turn.

## Action 2: gain food (forest)

40. [MAT] Forest row yield by birds already in the row (0-5): 1, 1, 2, 2, 3, 3 food.
41. [RB] Each die taken from the feeder gives 1 food token matching the face, and the die leaves the feeder.
42. [RB] The grub/seed die gives 1 token of the player's choice, not 2.
43. [RB] Gaining food may only take dice that are in the feeder (cannot choose a face that is not there).
44. [RB] Forest bonus slot (1, 3 or 5 birds): discard up to 1 card from hand for 1 extra food, taken from the dice left in the feeder.
45. [MAT] Forest slots with 0, 2 or 4 birds have no card-for-food conversion.
46. [RB] The conversion is optional: declining it gives just the base food.
47. [RB] No card to discard means the forest conversion is not offered.
48. [RB] If the feeder is empty, all 5 dice are thrown back in before gaining food.
49. [RB] If all dice in the feeder show the same face, the player may throw all 5 dice again before gaining food.
50. [RB] The reroll is not allowed when the dice show different faces.
51. [RB] A feeder with only 1 die counts as "all the same": a reroll is allowed.
52. [RB] The grub/seed face counts as its own face: five of them are all the same, grub/seed plus grub is not.
53. [RB] When the feeder becomes empty (the last die is taken) it is refilled by throwing all 5 dice.
54. [RB] Food gained is public and unlimited: the stash may exceed 5 tokens.

## Action 3: lay eggs (grassland)

55. [MAT] Grassland row yield by birds already in the row (0-5): 2, 2, 3, 3, 4, 4 eggs.
56. [RB] Each egg is laid on a bird that has room, according to its egg limit.
57. [RB] Eggs may be laid on any combination of birds, including all on one bird.
58. [RB] A bird can never hold more eggs than its egg limit.
59. [RB] Eggs beyond all egg limits are lost, and the turn still ends.
60. [RB] Grassland bonus slot (1, 3 or 5 birds): pay up to 1 food to lay 1 extra egg.
61. [RB] The egg conversion is not offered without a food token to pay.
62. [RB] An egg stays on its bird for the rest of the game unless discarded (eggs persist after a turn).

## Action 4: draw cards (wetland)

63. [MAT] Wetland row yield by birds already in the row (0-5): 1, 1, 2, 2, 3, 3 cards.
64. [RB] Cards are drawn from the 3 face-up cards in the tray or from the top of the deck, player's choice each time.
65. [RB] Tray spaces emptied by drawing are not refilled until the end of the turn.
66. [RB] Wetland bonus slot (1, 3 or 5 birds): discard up to 1 egg from a bird to draw 1 extra card; the egg goes back to the supply.
67. [RB] The egg conversion is not offered when the player has no eggs.
68. [RB] There is no hand limit.
69. [RB] When the deck is empty the discard pile is reshuffled into a new deck.
70. [RB] At the end of the turn the emptied tray spaces are restocked from the deck.

## Brown powers (when activated)

71. [RB] After the row action, brown powers in that row activate from the rightmost bird to the leftmost.
72. [RB] Only the birds of the habitat that was used activate (a wetland action does not trigger grassland birds).
73. [RB] White and pink powers never activate with a row action.
74. [RB] Every power is optional: a tuck power can be declined (card kept, nothing tucked).
75. [RB] Gain-from-feeder power: takes a die of the matching face from the feeder and gains that food.
76. [RB] Gain-from-feeder power: when the feeder holds no matching die and all dice show one face, the dice are thrown again first (the power is "about to gain food").
77. [APP] Gain-from-supply power: gain 1 food from the supply (no die involved).
78. [RB] Cached food sits on the bird: it is not added to the player's stash and cannot be spent, but is worth 1 point.
79. [APP] Cache-from-feeder power: take the die from the feeder and cache the food on this bird.
80. [APP] Tuck-and-draw power: tucking a card from hand behind the bird then draws a card; the tucked card is worth 1 point.
81. [APP] A tuck power with no card in hand does nothing.
82. [APP] Tuck-and-lay power: tucking a card lays 1 egg on that bird.
83. [APP] Tuck-and-gain power: tucking a card gains 1 food from the supply.
84. [APP] Flocking power: tuck the top card of the deck behind this bird without paying a card.
85. [APP] Predator (look-at-top) power: tuck the top deck card if its wing size is under the limit, otherwise discard it.
86. [APP] Predator (dice) power: rolls the dice outside the feeder; if any shows the food, cache 1 on this bird. The grub/seed face matches grub and seed.
87. [APP] Lay-on-self power: lay 1 egg on this bird, within its egg limit.
88. [APP] Lay-on-nest power: lay 1 egg on each of your birds with that nest type; star nests are wild and match every type.
89. [APP] Draw power: draw 1 card from the deck.
90. [APP] Everyone-gains power: all players gain 1 of the food from the supply.
91. [APP] Everyone-draws power: all players draw 1 card.
92. [APP] Trade power: discard 1 egg from ANOTHER of your birds to draw 2 cards.

## When-played powers (white)

93. [APP] Draw-on-play power draws the printed number of cards.
94. [APP] Food-on-play power gains the printed food from the supply.
95. [APP] Lay-on-play power lays the printed number of eggs on this bird (capped by its limit).
96. [APP] Lay-on-nest-on-play power lays 1 egg on each of your birds with that nest (including itself).
97. [APP] Bonus-on-play power: draw 2 bonus cards, keep 1, discard the other.
98. [APP] Feeder-on-play power: gain every die of that food in the feeder.
99. [APP] Play-a-second-bird power: may immediately play another bird in the named habitat, paying its normal food and egg cost.
100. [APP] The second bird of a play-a-second-bird power may also trigger its own when-played power.

## Between-turns powers (pink)

101. [RB] Pink "another player lays eggs": when an opponent takes the lay-eggs action, lay 1 egg on this bird.
102. [RB] Pink "another player gains food": when an opponent takes the gain-food action, gain 1 food from the supply.
103. [RB] Pink "another player plays a bird in a habitat": tuck the top deck card when they play in that habitat, not in another.
104. [RB] A pink power never fires on its owner's own action.
105. [RB] A pink power can be used only once between its owner's turns: a second trigger by another opponent in the same interval does nothing.
106. [RB] Each pink bird has its own once-between-turns use: two pink birds on one mat both fire for the same opponent action.
107. [RB] The pink allowance renews at the start of its owner's next turn.

## End of round

108. [RB] The round ends when every player has used all cubes; the next round starts with 7 cubes each (then 6, then 5).
109. [RB] At round end all face-up tray cards are discarded and the tray is restocked with 3 new cards.
110. [RB] The first-player token passes to the next player clockwise.
111. [RB] The end-of-round goal is scored for the round just finished.
112. [RB] The game ends after round 4: the phase is "over" and a final score exists.

## End-of-round goals

113. [RB] Round 1 goal (green side): 1st 4, 2nd 1, 3rd 0.
114. [RB] Round 2 goal: 1st 5, 2nd 2, 3rd 1.
115. [RB] Round 3 goal: 1st 6, 2nd 3, 3rd 2.
116. [RB] Round 4 goal: 1st 7, 2nd 4, 3rd 3.
117. [RB] Tie for 1st: add the points of the tied places, divide by the tied players, round down; the next place is not awarded (5+2)/2 = 3 in round 2.
118. [RB] Tie for 1st in round 1: (4+1)/2 = 2 each; the third player gets nothing.
119. [RB] Three-way tie in round 1: (4+1+0)/3 = 1 each.
120. [RB] Tie for 2nd: the tied players share places 2 and 3, (2+1)/2 = 1 in round 2.
121. [RB] A player with none of the targeted item scores nothing, even if that would be a place (only one player has a bird: 2nd place is empty).
122. [RB] Players with 0 of the item score 0 and do not take a place; a lone scorer in round 2 gets 5.
123. [RB] Blue side: 1 point per targeted item, maximum 5, in every round.
124. [RB] Goal "birds in a habitat" counts the birds in that row.
125. [RB] Goal "eggs in a habitat" counts eggs on that row's birds only.
126. [RB] Goal "nests with an egg": counts birds of that nest type holding at least 1 egg; star nests count as every type; birds with no egg do not count.
127. [RB] Goal "sets of eggs": the number of complete sets, one egg in each of the three habitats = the smallest egg count over the rows.
128. [RB] Goal "total birds" counts all birds across the three habitats.

## Bonus cards

129. [APP] A tiered bonus card scores its tier points only when the count reaches the tier (4 small birds = 3, 6 = 7, 3 = 0).
130. [APP] A per-bird bonus card scores a fixed amount for each qualifying bird (birds worth 3 points or less, 1 each).
131. [APP] Eating-based bonus cards count birds whose food cost includes that food, wild and either-or slots counted per printed symbol.
132. [APP] Habitat-only bonus cards count birds that live in only that habitat (a two-habitat bird does not count).
133. [APP] Egg-count bonus cards (birds holding 4 or more eggs) count birds with at least that many eggs, 3 points each.
134. [APP] A bonus card is scored only at game end and is included in the final total.

## Final scoring and ties

135. [RB] Final score = bird points + bonus cards + round goals + 1 per egg + 1 per cached food + 1 per tucked card.
136. [RB] Unused food tokens next to the mat are worth nothing.
137. [RB] The player with the most points wins.
138. [RB] Tie on points: the player with the most unused food tokens wins.
139. [RB] Tie on points and food: the players share the victory.

## Not testable here (known size differences, see rules-notes.md)

- Roster: the original has 170 birds and 26 bonus cards; this game has 120 original birds and 18 bonus cards, and fewer power types. Goals are 12 tiles.
- The solo rival is a simplified automa, not the original solo rules.
