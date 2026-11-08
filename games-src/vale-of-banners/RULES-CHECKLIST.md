# Vale of Banners: rules checklist (W437)

Every rule of the published rulebook this game adapts, numbered. `logic-test.js` holds one headless assertion per number, run against the real engine
(`src/engine.js` + `src/data.js`); this list is generated from that file (`node logic-test.js --md`), so list and tests cannot drift.
Run: `node logic-test.js` prints one line per failing rule (number, expected, got) and the total.

Checked against: the published rulebook text (setup, storage, goods, barge/ship, selling, season end, colour and region bonus, final scoring, tie-break),
cross-checked on 8 Nov 2026 against a rulebook summary page, plus our own `rules-notes.md`. The existing `rules-test.js` was written by the builders and is not used as evidence.

Own, on purpose (not rule checks): the estate map and its numbers, the tile pool mix, the 26 Lore tiles (section H tests that each does what its own text says).
Not original rules and not tested here: the solo and 2 v 2 team modes.

Not decidable from the published text: whether one meadow may hold two animal kinds. Our engine allows it (kinds are scored separately); no rule is asserted.


## A. Setup
_The estate map, the tile pool and the Lore tiles are our own; the counts and the numbering rules are the published ones._

1. The estate is a hexagon of 37 spaces
2. Space colours: 3 keep, 3 mine, 6 lore, 11 building, 8 pasture, 6 barge
3. Every space carries a die number 1 to 6
4. Each player starts with a keep placed on the centre space
5. The centre space is itself a keep-coloured space, and the keep scores nothing at the start
6. Each player starts with exactly 1 silver (2, 3, 4 players)
7. Each player starts with 3 goods tiles
8. Starting workers: 1, 2, 3, 4 in starting order, first player gets 1
9. Two players start with 1 and 2 workers
10. Every player rolls two dice (1-6) and a white die (1-6) is rolled
11. Six numbered stalls hold 2 tiles each with 2 players
12. Stalls hold 3 tiles each with 3 players
13. Stalls hold 4 tiles each with 4 players
14. Back lane holds 4 / 6 / 8 tiles with 2 / 3 / 4 players
15. Five goods tiles are laid out for the season, one per round
16. The tile pool is big enough for 4 players for 5 seasons (stalls + back lane x 5)
17. Goods tiles: 6 kinds, 7 of each

## B. Rounds, phases and turn order


18. A season (phase) has exactly 5 rounds
19. The game has exactly 5 phases and ends after round 5 of phase 5
20. The game is not over after round 5 of phase 4
21. Turn order follows the track: further up the track plays first next round
22. Same track step: the player who arrived last (on top) plays first
23. Every player takes one turn per round, in order
24. Turn order for the round is fixed when the round starts (a barge mid-round does not reorder it)
25. At the start of each round every player rolls two fresh dice, both unused
26. At the start of each round the white die is rolled and that round's goods tile goes to the stall it shows
27. The goods tile laid in a round is the next one of the season's five (round 2 uses tile 2)
28. A turn has exactly two dice actions: a player cannot end the turn before using both dice
29. A player can end the turn once both dice are used
30. A used die cannot be used again
31. Two identical dice give two separate actions
32. Only the acting player can move (the other player's dice are not offered)

## C. Actions with a die


33. Take: a tile from the stall with the die's number goes into storage and leaves the stall
34. Take: the die number must match the stall (no workers = other stalls not offered)
35. Workers: a stall 2 numbers away costs 2 workers, which are paid
36. Workers: 1 worker changes a die by exactly 1; two workers are not charged for a 1 step change
37. Workers: 6 and 1 are neighbours (die 6 reaches stall 1 for 1 worker)
38. Workers: 1 and 6 are neighbours the other way round
39. Workers: the distance between 2 and 5 is 3 (the short way round)
40. Workers: you cannot spend workers you do not have
41. Storage holds 3 tiles; taking a 4th forces a discard
42. The discard removes one tile of your choice, leaving 3 in storage
43. A discard cannot be skipped: while storage is over capacity no dice action is offered
44. Place: the tile goes on a free space of its own colour
45. Place: a tile cannot go on a space of another colour
46. Place: the die number must equal the number on the space
47. Place: the space must touch a space you already filled (not touching = illegal)
48. Place: touching the start keep counts (adjacency to any filled space)
49. Place: touching a tile placed earlier counts
50. Place: an occupied space cannot be built on
51. Place: workers adjust the die to the space number and are paid (die 1, space number 3 = 2 workers)
52. Place with workers: a die 2 steps from the space number needs 2 workers
53. Place: the tile moves from storage to the estate (storage shrinks)
54. Sell: all goods of the die's number are sold at once and leave your storage
55. Sell: you get exactly 1 silver, however many tiles you sell
56. Sell: 2 points per tile with 2 players
57. Sell: 3 points per tile with 3 players
58. Sell: 4 points per tile with 4 players
59. Sell: only a kind you hold can be sold (die 3, no kind-3 goods = no sale offered)
60. Sell: workers let a die reach a neighbouring kind (die 3 sells kind 4 for 1 worker)
61. Sell: sold tiles are not scored again at the end (they leave the goods store)
62. Workers: a die used for "take workers" gives 2 workers, any die number
63. Back lane: pay 2 silver, take any tile into storage, no die needed
64. Back lane: only once per turn
65. Back lane: needs 2 silver (1 silver = not offered)
66. Back lane: can be bought again on the next turn
67. Back lane: with a full storage the new tile forces a discard

## D. Tile effects


68. Keep: placing it gives one extra action at once
69. Keep: the extra action works with any number, free, and uses no die (take from stall 5)
70. Keep: the extra action can also be "take workers" or a sale
71. Keep: the extra action can place a stored tile on any number space
72. Keep: the extra action may be declined
73. Mine: pays nothing when placed
74. Mine: pays 1 silver per mine at the end of a season
75. Mine: pays also at the end of the last season
76. Mine: does not pay at the end of a normal round
77. Barge: you move up the turn track by one step
78. Barge: you may take ALL goods from any ONE stall, not only the one matching the die
79. Barge: you take only from one stall (the other stalls' goods stay)
80. Barge: goods of a kind you already hold stack on that pile
81. Goods: at most 3 different kinds can be held
82. Goods: a tile that does not fit stays on the stall (it is not lost)
83. Goods: a mixed stall gives what fits and leaves the rest (kinds 1,2 held; stall [3,4] -> take 3, 4 stays)
84. Barge: with no goods on any stall there is nothing to take (no pending question)
85. Barge: arriving on a step where another player stands puts you on top (you play first)
86. Pasture: score the animals on the placed tile
87. Pasture: also score same animals already in that meadow
88. Pasture: other animal kinds in the meadow do not count
89. Pasture: same animals in a different meadow do not count
90. Pasture: three placements add up (2, then 2+3, then 2+3+4 = 2 + 5 + 9)
91. Building: Moot Hall lets you place another stored tile at once on any number
92. Building: Moot Hall can chain into another Moot Hall
93. Building: Joiner's Yard takes a Building tile from a stall into storage (not other kinds)
94. Building: Bell Chapel takes a Keep, Mine or Lore tile (not Barge/Building/Pasture)
95. Building: Fair Green takes a Barge or Pasture tile (not other kinds)
96. Building: the "take a tile" buildings cannot take from the back lane
97. Building: Drovers' Inn gives 4 workers
98. Building: Counting House gives 2 silver
99. Building: Beacon Tower gives 4 points
100. Building: Granary sells one kind of goods at once, whatever the dice
101. Building: Granary pays the normal sale (1 silver + 2 per tile with 2 players)
102. Building: Granary with no goods asks nothing
103. Building: a region may not hold two of the same Building
104. Building: a different Building may join the same region
105. Building: the same Building may be built again in another region

## E. Scoring during play


106. Region of 1 space completed in season 1: 1 + 10 bonus
107. Region of 2 spaces completed in season 1: 3 + 10 bonus
108. Region of 3 spaces completed in season 1: 6 + 10 bonus
109. Region of 4 spaces completed in season 1: 10 + 10 bonus
110. Region of 6 spaces completed in season 1: 21 + 10 bonus
111. Region of 7 spaces completed in season 1: 28 + 10 bonus
112. Region table: 5 spaces = 15 and 8 spaces = 36 (no 5 or 8 region on our map, so the table itself is checked)
113. Season 1 region bonus is 10
114. Season 2 region bonus is 8
115. Season 3 region bonus is 6
116. Season 4 region bonus is 4
117. Season 5 region bonus is 2
118. A region scores only when its last space is filled (not the second to last)
119. A region scores once only
120. The start keep space counts as filled for its region (keep region of 3 needs only 2 more)
121. Colour bonus with 2 players: first to complete a colour gets 5, second 2, later players nothing
122. Colour bonus with 3 players: first to complete a colour gets 6, second 3, later players nothing
123. Colour bonus with 4 players: first to complete a colour gets 7, second 4, later players nothing
124. Colour bonus: published values are 5/6/7 for the first player and 2/3/4 for the second (2/3/4 players)
125. Colour bonus is only for a whole colour, not a single region (mines: 3 spaces in 2 regions)
126. Selling stays correct after Moot Hall chains (a chained placement still scores its region)

## F. End of a season


127. At season end the stalls are emptied and refilled (full stalls again)
128. At season end the back lane is refilled
129. At season end goods left on the stalls are removed
130. At season end five new goods tiles are laid out for the new season
131. At season end players keep their silver, workers, goods, storage and track position
132. A new season starts with round 1 and a new roll
133. The turn order carries over into the new season

## G. End of game and final scoring


134. Final: 1 point per silver
135. Final: 1 point per unsold goods tile
136. Final: 1 point per 2 workers (5 workers = 2)
137. Final: a single worker is worth nothing
138. Final: tiles still in storage score nothing
139. Final: points from play are kept and the end bonus is added on top
140. The player with most points wins
141. Tie: the player with fewer empty estate spaces wins
142. Tie on points and spaces: the player further back on the turn track wins
143. Tie on points, spaces and step: the player lower in the stack wins
144. Tie-break does not override a points difference (more points wins even with more empty spaces)
145. The game is over after the last round: no moves are offered

## H. Lore tiles (our own set of 26; each does what its text says)


146. Lore: placing a Lore tile gives its rule at once
147. Lore Drover's Almanac: When you take workers, take 1 more.
148. Lore Merchant's Ledger: When you sell goods, take 1 more silver.
149. Lore Weigher's Scale: When you sell goods, score 1 more point per tile.
150. Lore Pilot's Chart: When you place a Barge, score 2 points.
151. Lore Delver's Lamp: At the end of each season, take 1 worker per Mine.
152. Lore Carter's Rule: Taking a tile: change the die by 1 for free.
153. Lore Mason's Rule: Placing a tile: change the die by 1 for free.
154. Lore Larder Plans: Your storage holds 4 tiles instead of 3.
155. Lore Smuggler's Wink: The back-lane stall costs you 1 silver instead of 2.
156. Lore Charter of Guilds: You may build the same kind of Building twice in one quarter.
157. Lore Shepherd's Psalter: When you place a Pasture, score 2 more points.
158. Lore Purse Strings: When you take workers, also take 1 silver.
159. Lore Dockhand's Pact: When you sell goods, also take 1 worker.
160. Lore Harbour Toll: When you place a Barge, take 1 silver.
161. Lore Seam Map: At the end of each season, score 1 point per Mine.
162. Lore Steady Hands: Each worker changes a die by up to 2.
163. Lore Roll of the Moot: Game end: 3 points per Moot Hall.
164. Lore Roll of the Joiners: Game end: 3 points per Joiner's Yard.
165. Lore Roll of the Bells: Game end: 3 points per Bell Chapel.
166. Lore Roll of the Fair: Game end: 3 points per Fair Green.
167. Lore Roll of the Drovers: Game end: 3 points per Drovers' Inn.
168. Lore Roll of the Counters: Game end: 3 points per Counting House.
169. Lore Roll of the Beacons: Game end: 3 points per Beacon Tower.
170. Lore Roll of the Granaries: Game end: 3 points per Granary.
171. Lore Tradebook: Game end: 1 point per goods tile you sold.
172. Lore Bestiary: Game end: 4 points per kind of animal on your land.
