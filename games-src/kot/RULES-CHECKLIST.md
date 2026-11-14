# Rules checklist: Crown City Smash

Every numbered rule below has exactly one assertion in `logic-test.js` (same number). Regenerate with `node logic-test.js --md`.


## Setup

1. Every monster starts with 10 hearts, 0 stars, 0 energy.
2. No monster starts in the city; the city is empty.
3. Three power cards are face up at the start.
4. The power deck holds 66 cards (shuffled) with the market cards taken from it.
5. A game of 2-4 monsters uses only the city (the Harbor is closed).
6. A game of 5 monsters opens the Harbor as a second city space.
7. A game of 6 monsters opens the Harbor as well.
8. Turns are rolled with six dice.
9. Winning needs 20 stars.

## Rolling

10. After the first roll a monster may reroll twice (two rerolls in total).
11. Rerolling uses up one reroll each time and a third reroll is refused.
12. Kept dice do not change on a reroll.
13. Dice not kept are all rerolled (at least one die changes over 20 seeds).
14. A die kept on an earlier reroll can be rerolled again later.
15. Dice faces are 1, 2, 3, energy, claw, heart (one of each on a die).

## Dice faces

16. Three 1s score 1 star.
17. Three 2s score 2 stars.
18. Three 3s score 3 stars.
19. Two of a number score nothing.
20. Each extra matching die adds 1 star (four 1s = 2).
21. Five 3s score 5 stars (3 + 2 extra).
22. Six 2s score 5 stars (2 + 3 extra).
23. Two different triples both score (1-1-1 and 3-3-3 = 4).
24. Each energy die gives 1 energy (no set needed).
25. Energy carries over between turns (it is not reset at turn end).
26. Each heart die heals 1 heart when outside the city.
27. Healing never goes above 10 hearts.
28. Heart dice do nothing for a monster in the city.
29. Claws from outside the city hit the monster in the city for 1 each.
30. Claws from outside the city do NOT hit other monsters outside.
31. Claws from inside the city hit every monster outside, 1 each per claw.
32. A monster never hits itself with its own claws.
33. Hearts cannot drop below 0 (damage is capped at the hearts left).

## The city (Downtown)

34. If the city is empty after your dice, you must move in even with no claws, and gain 1 star.
35. If the city is occupied and nobody yields, the attacker stays outside.
36. A monster that starts its turn in the city gains 2 stars.
37. A monster hit in the city may yield: it still loses the hearts, leaves, and the attacker moves in (+1 star).
38. A monster hit in the city may stay: it keeps the city and the attacker stays outside.
39. A monster in the city is not asked to yield for its own attack, and keeps the city.
40. A monster knocked out in the city by claws leaves it, and the attacker moves in (+1 star).
41. The attacker enters only after the damage is done (the old occupant is gone first).
42. A monster yielding does not lose its stars or cards.
43. Only one monster at a time holds the city (a 4-monster game never has two inside).

## The Harbor (5-6 monsters)

44. With 5 monsters: city taken, Harbor empty -> the attacker must move into the Harbor and gain 1 star.
45. A monster in the Harbor counts as in the city: outside claws hit it.
46. A monster in the Harbor hits all monsters outside with its claws.
47. A monster in the Harbor does NOT hit the monster in Downtown (both are "in the city").
48. A monster in the Harbor gains 2 stars at the start of its turn.
49. An attacked Harbor monster may yield; the attacker takes the Harbor (+1 star).
50. If the Harbor monster is knocked out while Downtown is held, the attacker takes the Harbor.
51. When only four monsters remain the Harbor closes and no monster occupies it.
52. A monster cannot be in Downtown and the Harbor at the same time.

## Knock-out and winning

53. A monster at 0 hearts is eliminated.
54. An eliminated monster's power cards go to the discard pile.
55. An eliminated monster in the city leaves it.
56. An eliminated monster is skipped in turn order.
57. The game is won at once by the last monster standing.
58. A monster with 20 stars at the end of its turn wins.
59. A monster with 19 stars does not win.
60. A monster that scores past 20 (e.g. 18 + a triple of 3s) wins.
61. If every remaining monster is eliminated at the same moment, nobody wins.
62. Reaching 20 stars mid-turn does not end the game: you may still buy, and win when the turn ends.

## Buying power cards

63. A face-up card is bought by paying its energy cost.
64. A card cannot be bought without enough energy.
65. A bought card is replaced from the deck so three cards are face up again.
66. A Keep card stays in front of the buyer.
67. A Discard card takes effect at once and goes to the discard pile, not in front of the buyer.
68. You may pay 2 energy to discard all three face-up cards and reveal three new ones.
69. A sweep cannot be paid with fewer than 2 energy.
70. Several cards can be bought in the same turn while energy lasts.
71. When the deck runs out the discard pile is reshuffled into a new deck.

## Turn order

72. Play passes to the next living monster on the left (seat order).
73. After the last monster, play returns to the first and the turn counter advances.
74. Start of turn: a monster in the city gains stars BEFORE it rolls.

## Power cards: Discard

75. Corner Kiosk (1): gain 1 star.
76. Rush-Hour Train (4): gain 2 stars.
77. Tower Block (5): gain 3 stars.
78. Sky Needle (6): gain 4 stars.
79. Power Surge (8): gain 9 energy (net of the cost).
80. Panic Sirens (7): every other monster loses 5 stars.
81. Panic Sirens cannot take stars below 0.
82. Flame Wave (3): every other monster loses 2 hearts, the buyer does not.
83. Refinery Blast (6): gain 2 stars and every other monster loses 3 hearts.
84. Patch Up (3): heal 2 hearts.
85. Patch Up can heal a monster that is in the city (cards, unlike dice, may).
86. Carpet Strike (4): every monster, the buyer included, loses 3 hearts.
87. Jet Squadron (5): gain 5 stars and lose 4 hearts.
88. Militia Drill (3): gain 2 stars and lose 2 hearts.
89. Reactor Snack (6): gain 2 stars and heal 3 hearts.
90. Tank Column (4): gain 4 stars and lose 3 hearts.
91. Cyclone (6): gain 2 stars; every other monster loses 1 energy for every 2 it holds.
92. Rampage Rush (7): take another turn right after this one.
93. Skydive Stomp (5): gain 2 stars and take over Downtown; the previous holder leaves.
94. Skydive Stomp makes the Harbor monster leave too (5 monsters).

## Power cards: Keep

95. Corrosive Drool (6): adds a claw to your roll every turn, even with no claws rolled.
96. Cosmic Gut (3): power cards cost you 1 energy less.
97. Top Predator (5): +1 star on every turn you roll at least one claw.
98. Top Predator gives nothing when you roll no claw.
99. Plated Hide (4): you lose no hearts when you would lose exactly 1 heart.
100. Plated Hide does not help against 2 hearts.
101. Alley Lurker (4): offers a reroll of a 3 even after your last reroll.
102. Tunneler (5): adds a claw while you are in the city.
103. Chameleon Skin (3): each heart you would lose can be saved by a die roll (never loses more, sometimes less).
104. Wrecking Spree (3): showing 1, 2, 3, heart, claw and energy together gives 9 stars.
105. News Chopper (3): gain 1 star whenever you buy a power card.
106. Carrion Feast (4): gain 3 stars every time a monster drops to 0 hearts.
107. Battery Belly (3): at turn end gain 1 star for every 6 energy you hold.
108. Growth Spurt (4): heals 2 when bought and raises your maximum hearts by 2.
109. Second Skull (7): you roll one extra die.
110. Scorch Breath (4): when you roll a claw, the neighbours lose 1 extra heart.
111. Time Hiccup (5): rolling three or more 1s gives another turn with one die fewer.
112. Kid Fan Club (3): whenever you gain energy, gain 1 more.
113. Mega Brain (5): you get one extra reroll each turn.
114. Gourmand (4): rolling three or more 1s gives 2 extra stars.
115. Mending Beam (4): a heart die may heal another monster, which pays you 2 energy per heart.
116. Grazer (5): gain 1 star at turn end if you made nobody lose hearts.
117. Grazer gives nothing if you made someone lose hearts.
118. Pack Hunter (3): once per turn turn one die into a 1.
119. Egg Clutch (7): if knocked out, discard cards, lose stars, leave the city, and hatch with 10 hearts.
120. Vapor Jets (5): you lose no hearts when you choose to yield the city.
121. Garage Lab (2): once per buy step peek at the top card and buy it (here Rush-Hour Train: pay 4, gain 2 stars).
122. Shed Skin (3): at turn end you may discard a Keep card for its cost in energy (Top Predator = 5).
123. Power Cell (3): put 6 energy on it; 2 move to your pool at each turn start; discard when empty.
124. Nova Roar (7): your claws hit every other monster, wherever they are.
125. Omni-Muncher (4): showing a 1, a 2 and a 3 gives 2 stars.
126. Twist Ending (3): turn one die to any face before resolving, then discard it.
127. Venom Quills (3): rolling three or more 2s adds two claws.
128. Toxic Spittle (4): a monster your claws hit gets a poison token and loses 1 heart per token at the end of its turn.
129. Shrink Beam (6): each monster your claws hit gets a shrink token and rolls one die fewer.
130. Mind Peek (3): after another monster's last roll you may reroll one of its dice.
131. Quick Mend (3): at any time pay 2 energy to heal 1 heart, even to avoid being knocked out.
132. Regrowth (4): whenever you gain hearts, gain 1 extra.
133. Underdog Spirit (3): at turn end, if you have the fewest stars, gain 1 star.
134. Smoke Screen (4): comes with 3 puffs; each gives an extra reroll; discard when gone.
135. Sunsoaker (2): at turn end, if you have no energy, gain 1.
136. Barbed Tail (5): when you roll at least one claw, add another claw.
137. Rubber Limbs (3): before resolving pay 2 energy to turn one die to any face.
138. Mind Link (4): pay 1 energy for an extra reroll.
139. Street Eater (4): +1 star when you start your turn in the city, and a claw is added if you roll one in the city.
140. Thick Skin (3): whenever you lose 2 or more hearts at once, gain 1 energy.
141. Membrane Wings (6): when you would lose hearts, pay 2 energy to lose none for the rest of that turn.
142. Copycat Gland (8): copies a Keep card another monster has (here Top Predator: +1 star on a claw turn).
143. Bargain Hunter (3): when a new card is revealed another monster holding it may buy it first (Corner Kiosk: 3 energy, 1 star).
144. Leech Tendrils (4): may buy Keep cards from other monsters, paying the owner the cost.
145. The 66-card deck contains exactly 17 Discard cards (kiosk, train, tower, needle, surge, sirens x2, flame, refinery, patch, carpet, jetsq, militia, reactor, tanks, cyclone, rush, skydive).
146. The 66-card deck contains Keep cards only of the printed list (no duplicate except Second Skull).

## Winning at turn end

147. A monster that reaches 20 stars but is knocked out in the same turn does not win (Jet Squadron at 4 hearts).
