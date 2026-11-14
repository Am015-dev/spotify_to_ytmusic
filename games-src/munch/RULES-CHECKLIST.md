# Doorkick Dungeon: rules checklist

Every rule of the original rulebook this game adapts (the 2001 base game, current rules sheet), numbered. Each number has exactly one assertion in `logic-test.js` that builds the position in the real engine, acts, and checks the exact result. Written from the published rules, not from the engine or the builders' tests. Regenerate with `node logic-test.js --md`.

Sources: the published rulebook and FAQ (public rules pages), cross-checked against `rules-notes.md`.
Open interpretations ([H]): Halfling has no -1 to run away and may discard a card to reroll a failed run-away once (rows 76-78, 124); Charm needs at least 3 cards (2010 errata); Resurrection takes the top door discard (the rules sheet text).

## Setup

1. Every hero starts at level 1.
2. Every hero is dealt 4 door and 4 treasure cards.
3. The deck has 94 door and 74 treasure cards (168 in all).
4. A new hero has no race (so is Human) and no class.
5. Before the first turn heroes may play race, class and item cards.
6. Turns pass to the player on the left (next seat).
7. The first player is the one who rolled highest.

## Turn

8. Kicking open a door that shows a monster starts a fight with it.
9. A curse found by kicking open the door hits the kicker at once.
10. Any other door card found by kicking goes to the hand.
11. With no monster met you may loot the room: draw a face-down door card into your hand.
12. With no monster met you may instead look for trouble: play a monster from your hand and fight it.
13. You cannot look for trouble after you have fought a monster this turn.
14. You cannot loot the room after you have fought a monster this turn.
15. You cannot loot the room AND look for trouble: only one of the two.
16. Charity: with more than 5 cards at end of turn, give the extras to the lowest-level player.
17. Charity: if you are the lowest level (or tied for lowest) you discard the extras instead.
18. Charity: ties for lowest level may be given to any of the tied players.
19. Charity stops as soon as you are back down to 5 cards.
20. Exactly 5 cards in hand is fine at end of turn: no charity.
21. A dead hero cannot receive charity.

## Combat

22. A hero's strength is level plus the bonuses of worn items.
23. A monster's strength is its level (Limping Imp = 1, Hairy Hat-Muncher = 12).
24. Items only count when worn: an item in the hand adds nothing.
25. The hero wins only with strictly MORE strength than the monster.
26. A hero with more strength can fight and win.
27. A hero who is not stronger cannot fight: the only way out is to run away.
28. A Warrior wins ties.
29. Winning a fight earns 1 level per monster (Limping Imp = 1 level).
30. Big monsters give 2 levels (Horned Inferno).
31. Winning draws the monster's treasure count (Limping Imp = 1, Stampeding Skygrif = 4).
32. Level and treasure come only when the fight ends, then the monster is discarded.
33. A monster enhancer adds to the monster's strength (Furious +5).
34. A monster enhancer gives extra treasure if the monster is killed (Furious +1).
35. Tiny (-5) cannot take a monster below level 1.
36. Tiny takes away a treasure but never below 1.
37. A monster enhancer is played on a monster in a fight, never outside one.
38. A one-shot item gives its bonus to the hero side for this fight only (Zappy Dart +5).
39. A one-shot item can be played to help the monsters instead (+5 to the monster).
40. A used one-shot goes to the treasure discard pile after the fight.
41. Several monsters in one fight add their strengths (Uninvited Guest).
42. Killing several monsters gives the levels of each.
43. When the hero says Fight, every other player in turn order gets a chance to interfere.
44. Interfering (a curse, a boost) hands the choice back to the hero, who may then run.
45. Worn items cannot be changed during a fight.
46. Race and class cards cannot be played during a fight.
47. A fight ends with the monster discarded when the hero escapes too (no level, no treasure).
48. The monsters' special "vs" bonus applies against the named race (Kissy Leech +6 vs Elf).
49. The "vs" bonus applies against a named class (Off-Key Sirens +5 vs Wizard).
50. No "vs" bonus applies to a hero of another race.
51. Winning at level 9 with a kill reaches level 10 and wins the game.
52. Level 10 only comes from killing a monster: monsters run from or sent away give no level.

## Helping

53. A hero who cannot win may ask any other player for help.
54. The helper adds their level and items to the hero's strength.
55. The helper may refuse.
56. Only one player may help.
57. A helper that wins with you gets no level (the hero alone levels up).
58. An Elf helper goes up a level for each monster killed while helping.
59. The helper takes the number of treasures bargained for, the hero the rest.
60. The helper cannot be promised more treasure than the monsters give.
61. Nobody can help against Menacing Pergola.
62. If hero and helper still lose, both must run away, each rolling separately.
63. A helper's Bad Stuff applies to the helper only; a helper caught gets it too.

## Running away

64. A roll of 5 or 6 escapes.
65. A roll of 4 or less is caught.
66. A caught hero suffers the monster's Bad Stuff (Limping Imp: lose a level).
67. An escaped hero suffers nothing.
68. Bad Stuff that kills (Horned Inferno): the hero dies.
69. A level can never drop below 1.
70. With two monsters, roll once for EACH monster.
71. Escaping one monster but not the other: Bad Stuff only from the one that caught you.
72. Elves get +1 to run away.
73. Items that help running away add to the roll (Sprint Sneakers +2).
74. A monster's own run-away modifier applies (Kamikaze Toads -1; Limping Imp +1).
75. A hero who fails the roll but holds a way out may use it (Vanishing Tonic).
76. Halfling: after a failed run-away roll, discard a card to roll again (once).
77. Halfling: only one reroll per run-away.
78. Only a Halfling may discard to roll again.
79. Pop-Up Wall: you and your helper escape automatically.
80. No hero can be chased by a monster that "won't pursue" their level (Horned Inferno, level 4 or lower).
81. "Won't pursue" does not protect a hero above that level (level 5 vs Inferno rolls).

## Death

82. A dead hero keeps level, race and class.
83. A dead hero loses all items and the whole hand.
84. Others loot the body, highest level first, one card each.
85. The best level loots first, so it gets the first pick of the body.
86. Cards nobody can loot are discarded.
87. A dead hero keeps the curses on them and the Mixed Heritage / Double Major cards.
88. The new hero appears at the next player's turn, and draws 4 door + 4 treasure at the start of their own.

## Items

89. Only one headgear may be worn.
90. Only one armor may be worn.
91. Only one footgear may be worn.
92. Two hands: two 1-hand weapons, or one 2-hand weapon; not more.
93. A 2-hand weapon uses both hands (cannot be worn with a 1-hand weapon).
94. Only one Big item may be carried.
95. A Dwarf may carry any number of Big items.
96. Items a hero is not allowed to use are carried but give no bonus (Elves-only bow on a Human).
97. Class-restricted items need the class (Holy Cheese Grater: Clerics only).
98. Sex-restricted items need the sex (Dame's Blade: women only).
99. Items worn by an allowed hero give their bonus (women get Dame's Blade +3).
100. "Not for" items may not be used by the named class (Leggings: not Warriors).
101. Loophole lets a hero use one item they would not be allowed to.
102. Selling: 1,000 gold of items buys one level.
103. Selling: no change given (1,200 gold still buys only one level).
104. Selling: 2,000 gold buys two levels.
105. Selling: less than 1,000 gold at once is not allowed.
106. Selling: 900 gold is not enough, exactly 1,000 is.
107. Selling: you cannot sell to reach level 10.
108. Selling cannot push the level past 9.
109. Sold cards go to the discard pile.
110. Selling is not allowed during a fight.
111. Selling is only for the hero whose turn it is.
112. A Halfling sells ONE item for double price once per turn.
113. The Halfling double price works only once per turn.
114. Dwarf hand limit is 6 cards, not 5.
115. A Porter allows one extra Big item.

## Levels

116. A Go-Up-A-Level card gives one level.
117. A Go-Up-A-Level card cannot take anyone to level 10.
118. A Go-Up-A-Level card may be played on another player.
119. Levels can never go below 1.
120. Level Heist: victim goes down 1, thief goes up 1.
121. Reaching level 10 by killing a monster wins the game.
122. Heavenly Favor: all Clerics go up a level when it is drawn, even to win.
123. Treasure Pile! gives 3 more treasures as soon as you get it.

## Classes

124. A Halfling has no run-away penalty (the power is the reroll).
125. Mixed Heritage with a single Elf: monsters get no "vs Elf" bonus against you.
126. Double Major with a single class: no class drawback (monster "vs Warrior" bonus ignored).

## Levels

127. Level Heist cannot be used by a hero at level 9 (it would not be allowed to reach 10).
128. Level Heist cannot target a hero at level 1.

## Helping

129. An Elf helper at level 9 cannot win the game by helping (stays at 9).

## Levels

130. Heavenly Favor kicked from the door: all Clerics go up a level at once.

## Curses

131. Anyone may play a curse on any player, during a fight, as an interference.
132. Rotten Luck: lose a level.
133. Goose of Gloom: lose 2 levels.
134. Sudden Gust with no headgear worn does nothing.
135. Rust Storm: lose the armor you wear.
136. Sock Goblin: lose the footgear you wear.
137. A curse takes only worn items: a carried item is not lost (Sudden Gust).
138. Butterfingers: lose the Big item.
139. Light-Fingered Gremlin: lose a small item of your choice.
140. Utterly Rotten Hex: lose the item that gives the biggest bonus.
141. Career Crisis: lose a class card; with none, lose a level.
142. Identity Crisis: lose your race and become a Human.
143. Career Change: your class becomes the first class card found in the door discards.
144. Family Tree Hex: your race becomes the first race card found in the door discards.
145. A Change-class/race curse does nothing to a hero with none.
146. Gender Swap: your sex changes.
147. Hen Hat Hex: -1 to your die rolls while you wear no headgear-losing event.
148. Hen Hat Hex ends when the headgear is lost.
149. Hen Hat Hex applies to a run-away roll.
150. Tax Collector: every player pays an item of equal value or loses all items and a level.
151. Grabby Neighbours: the players on each side take a random card from your hand.
152. Spiteful Mirror: no weapon bonus in the next fight only.
153. A curse played on someone is discarded after it takes effect (not kept).
154. Ring of Undoing cancels a curse (the victim is asked).
155. Lucky Flip-Flops block curses you kick open, but not curses other players play.

## Monsters

156. Bad Stuff: Pinch Mites take armor and everything worn below the waist.
157. You cannot run away from Pinch Mites.
158. Hairy Hat-Muncher takes your headgear if you are caught.
159. Kamikaze Toads: lose 2 levels.
160. The Endless Goblin Horde: roll 1-2 and you die, otherwise lose that many levels.
161. Gnawers: no items or bonuses count against them, level only.
162. Gnawers Bad Stuff: your level drops to the lowest at the table.
163. Timeshare Pitchman: your level does not count.
164. Hovering Sniffer: an item worth 200+ gold bribes it away.
165. Garlic Gargle kills a Hovering Sniffer outright.
166. Shieldmaiden: a woman fighter just gets 1 treasure and no fight.
167. Litigation Lizards never attack a Thief.
168. Sleepy Boulderman: you may skip past him (a Halfling may not).
169. Bat-Cape Poser: a Cleric can shoo him away and take the treasure, with no level.
170. Furious Rooster: an extra level if beaten with fire.
171. Barfabunny: extra level if beaten with no help or bonuses.
172. Undead monsters (Rattlebones): fleeing costs a level even when you get away.
173. Pharaoh: fleeing costs 2 levels (above level 3) even when you get away.
174. Forum Troll / Pixie / Skygrif: others take items from you; the Nameless Dread kills all but a Wizard.

## Classes

175. Warrior Berserking: discard up to 3 cards, +1 each in the fight.
176. Wizard Flight: discard up to 3 cards, +1 each to run away.
177. Wizard Charm needs the whole hand and at least 3 cards.
178. Wizard Charm with 3+ cards: discards the whole hand, takes the monster's treasure but no level.
179. Thief Backstab: discard a card to give a player in a fight -2, once per victim per fight.
180. Thief Steal: discard a card, roll 4+ to steal a small item, fail and lose a level.
181. A failed Thief steal costs a level.
182. Thieves cannot steal a Big item.
183. Cleric Turning: discard up to 3 cards, +3 each against Undead.
184. Turning works only against Undead.
185. Cleric Resurrection: instead of kicking, take the top door discard and discard a card from hand.
186. A hero may hold only one class (a new class card replaces the old).
187. A hero may hold only one race (a new race card replaces the old).
188. Mixed Heritage allows two races.
189. Double Major allows two classes.
190. Mixed Heritage can only be played once you have a race.
191. Elf: +1 to run away.
192. Class and race cards may be dropped (discarded) at any time on your turn.

## Special

193. Gone Fishing: all monsters leave and the fighter draws 2 treasures.
194. Plus-One: the monster brings an identical date and both must be beaten.
195. Smoke and Mirrors: swap a monster for another from your hand.
196. Hug Juice: all monsters leave, no treasure.
197. Parrotify Potion: monster leaves, you take its treasure, no level.
198. Not-My-Problem Potion: another player takes over the fight and its rewards.
199. Mirror Twin: doubles your strength when fighting alone.
200. Wishing Lantern: on your own turn a monster vanishes.
201. Rummaging Rod: take any card from the discard piles.
202. Uninvited Guest can only be played during a fight, with a monster from your hand.
203. Sticky Paste: a hero who gets away must roll again.
204. Porter can be played at any time, even in a fight.

## Turn

205. With no monster met you must loot the room or look for trouble: ending the turn is not offered yet.
206. A curse kicked from the door still leaves the room to loot afterwards.
207. After a won fight the turn goes straight to tidy-up: no loot and no trouble.
