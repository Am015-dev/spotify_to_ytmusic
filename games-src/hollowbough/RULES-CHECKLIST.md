# Hollowbough rules checklist (W442)

Every rule below has exactly one assertion block in `logic-test.js` with the same number. Rules marked **N/A** are physical or presentation-only and cannot be tested against the engine. No original rulebook text is stored here; rules are written in our own words.


## A. Components and setup

1. The deck has 128 cards: 63 Critters and 65 Constructions.
2. There are 48 distinct cards; copies by colour: Production 52, Governance 21, Traveler 19, Prosperity 18, Destination 18.
3. Copies per card match the rulebook (Farm 8; Husband/Wife 4; Wanderer, Teacher, Peddler, Miner Mole, Chip Sweep, Barge Toad, Woodcarver 3; uniques 2 or 3).
4. Printed base points: Fool -2, Queen 4, King 4, Doctor 4, Castle 4, Palace 4, Ever Tree 5, Theater 3, Fair Grounds 3, University 3, Wife 2, Husband 2, Farm 1, Mine 2, Ruins 0, Cemetery 0, Dungeon 0, Clock Tower 0, Bard 0, Monk 0.
5. Card costs: Farm 2 twig+1 resin; Mine 1/1/1; Castle 2 twig,3 resin,3 pebble; Ever Tree 3/3/3; Ruins free; Cemetery 2 pebble; Crane 1 pebble; Husband 3 berries (independent card wiki: cost 3, 2 pts); Wife 2 berries; Queen 5 berries; King 6 berries; Monk 1 berry; Innkeeper 1 berry.
6. Setup: each player starts with 2 workers, no resources, season Winter; 8 cards face-up in the Meadow.
7. Starting hands: seat 1 draws 5, seat 2 draws 6, seat 3 draws 7, seat 4 draws 8.
8. Forest: 3 Forest cards in a 2-player game, 4 in 3- and 4-player games, all different.
9. Events: the 4 basic events are always in play; 4 different special events are drawn from the 16.
10. Board: 8 basic locations, 11 Forest locations, 4 basic events (3 pts each), 4 Journey spots worth 5/4/3/2, one Haven.
11. Basic events: 4 Production (green), 3 Destination (red), 3 Governance (blue), 3 Traveler (tan).
12. Seat 1 plays first; play proceeds clockwise (seat order) and wraps.
13. Hand limit is 8: drawing stops at 8 cards (resources/other effects of the same action still happen).
14. City limit is 15 cards: a 16th card cannot be played.
15. Resources are unlimited (no supply cap on any pile).
16. **N/A** Component art, box contents, tokens as physical pieces (UI only).

## B. Turn structure

17. A turn is exactly one action: place a worker, play a card, or prepare for season; then the turn passes to the next player.
18. You may place a worker only if you have an unplaced worker.
19. Prepare for season is offered only when all your workers are placed.
20. Passing: a passed player takes no more turns; the game ends when every player has passed.
21. A passed player cannot be given resources: Monk with the only rival passed gives nothing and asks nothing.
22. A passed player cannot be given cards: Teacher keeps one card and discards the other when every rival has passed.
23. Playing a card from the Meadow replaces it immediately from the deck.
24. Deck empty: the discard pile is shuffled into a new deck.

## C. Basic locations

25. Basic location berry_patch: gives {"berry":1} + 0 card(s) + 0 point token(s); shared.
26. Basic location dewberry_nook: gives {"berry":1} + 1 card(s) + 0 point token(s); exclusive.
27. Basic location amber_weep: gives {"resin":1} + 1 card(s) + 0 point token(s); shared.
28. Basic location pebble_bank: gives {"pebble":1} + 0 card(s) + 0 point token(s); exclusive.
29. Basic location twig_heap: gives {"twig":3} + 0 card(s) + 0 point token(s); exclusive.
30. Basic location gossip_glade: gives {} + 2 card(s) + 1 point token(s); shared.
31. Basic location resin_pool: gives {"resin":2} + 0 card(s) + 0 point token(s); exclusive.
32. Basic location kindling_glen: gives {"twig":2} + 1 card(s) + 0 point token(s); shared.

## D. Forest locations

33. Forest berry_thicket: Gain 2 berries and draw 1 card.
34. Forest foragers_crossing: Gain any 2 resources (twig/resin/pebble/berry, mix allowed).
35. Forest rummage_hollow: Discard any number of cards, then draw 2 for each one discarded (limit 8).
36. Forest echoing_meadow: Repeat any one basic location and also draw 1 card.
37. Forest quarry_burrow: Gain 1 pebble and draw 3 cards.
38. Forest mixed_glade: Gain 1 twig, 1 resin and 1 berry.
39. Forest bumper_bramble: Gain 3 berries.
40. Forest sapwell_copse: Gain 2 resin and 1 twig.
41. Forest postbag_clearing: Draw 2 cards and gain any 1 resource.
42. Forest barter_stump: Discard up to 3 cards; gain 1 resource of your choice for each.
43. Forest rummage_hollow: discard limit is only the hand; drawing respects the 8-card limit.
44. Forest barter_stump: at most 3 cards may be discarded (1 resource each).
45. Forest meadow_bazaar: take 2 Meadow cards, then may play one of them for 1 fewer resource.
46. Forest slots: 2- and 3-player games have one worker slot per Forest card.
47. Forest slots: 4-player games have two slots per Forest card, never both for the same player.

## E. Haven and Journey

48. Haven: discard any number of cards, gain 1 resource of your choice per 2 discarded (odd card is wasted).
49. Haven is shared: any number of workers may use it.
50. Journey is available only in Autumn.
51. Journey spots 5/4/3 are exclusive, the 2 spot is shared.
52. Journey: you must discard cards equal to the spot value (needs that many in hand); worker stays forever and scores its value.
53. A player may send more than one worker to the Journey.

## F. Destination cards (worker spots on cards)

54. A worker may be placed on an unoccupied Destination card in your own city (each holds one worker).
55. Opponents may only visit Inn and Post Office in your city (marked Open); other Destinations are closed to them.
56. Visiting an opponent's open Inn/Post Office gives the owner 1 point token.
57. Post Office needs at least 2 cards in hand to be used.
58. Destination cards in the Meadow cannot be visited.
59. A passed player's open Inn/Post Office can still be visited by others.
60. Cemetery and Monastery hold a worker forever; a second slot opens with Undertaker (Cemetery) / Monk (Monastery).
61. Permanent workers (Cemetery, Monastery, Journey) are not recalled by Prepare for Season.

## G. Events

62. Claiming a basic event: place a worker on it while your city has 4 Production / 3 Destination / 3 Governance / 3 Traveler cards; it is worth 3 points.
63. A basic event cannot be claimed without the required cards.
64. Each event can be achieved by only one player.
65. Basic events: each colour requirement counts the right colour (Destination=red, Governance=blue, Traveler=tan).
66. Claiming an event consumes a worker that is recalled normally at Prepare for Season.
67. Once achieved, an event stays yours even if you later lose the cards.
68. Special event requirements: each special event needs its two named cards in your city (checked for all 15 pair events).
69. Special events: all 16 exist with the rulebook's pairs (Shopkeeper+Post Office, Doctor+Postal Pigeon, Judge+Queen, Historian+Ruins, Woodcarver+Chapel, Cemetery+Shepherd, Teacher+University, Monk+Dungeon, Monastery+Wanderer, Inn+Bard, Undertaker+Barge Toad, Courthouse+Ranger, Lookout+Miner Mole, Chip Sweep+Clock Tower, Peddler+General Store, and 2-of-each-colour).
70. Event Grand Market Scheme: give up to 3 resources to rivals, take 2 point tokens for each.
71. Event Hurry-Scurry Dash: return one deployed worker to hand; worth 4 points.
72. Event Night of Sparklers: place up to 3 of your twigs on it; 2 points each at game end.
73. Event Lost Parchments Unearthed: reveal 5 cards; each goes to hand or beneath the event (1 point each).
74. Event Acorn Bandits Seized: move up to 2 Critters from your city beneath it; 3 points each.
75. Event Marsh Fever Remedy: pay 2 berries and discard 2 cards from your city; worth 6 points.
76. Event Wingborne Healers: 3 points per Husband+Wife pair in all cities.
77. Event Commencement of Pupils: move up to 3 Critters from hand beneath it; 2 points each.
78. Event Counsel for Scoundrels: 3 points per prisoner in your Dungeon at game end.
79. Event Pilgrims Trail: 3 points per worker in your Monastery at game end.
80. Event Resident Minstrel: place up to 3 of your berries on it; 2 points each.
81. Event Gilded Shrine Vault: draw 1 card and gain 1 resource per token on your Chapel; 2 points per token at game end.
82. Event Vigil of Remembrance: 3 points per worker buried in your Cemetery.
83. Event Toll Holiday: run all your Production cards now; worth 3 points.
84. Event Grand Hollow Games: needs 2 cards of each of the 5 colours in your city; worth 9 points.
85. Event Change of Proprietors: place up to 3 resources on it; berry/twig 1 point, resin/pebble 2 points each.

## H. Playing cards: cost, placement, special payment

86. Pay the printed cost in resources from hand or Meadow; resources return to the supply.
87. You cannot play a card you cannot afford.
88. Unique cards: you may not have two copies of the same unique card in your city; commons may be duplicated.
89. Occupy: a Critter may be played free if its linked Construction is in your city and unoccupied; marks it occupied.
90. Each Construction can be occupied only once, ever (token stays even if the Critter leaves).
91. Each Critter is linked to its own Construction only (Husband/Farm; Wanderer/Ruins; Queen/Castle; Fool/Storehouse...).
92. Ever Tree can house any one Critter for free (once).
93. Innkeeper: discard it to cut 3 berries off a Critter's cost (not Constructions).
94. Crane: discard it to cut 3 resources of your choice off a Construction's cost (not Critters).
95. Dungeon: lock one of your Critters beneath it to cut 3 resources off a card; the prisoner scores nothing.
96. Dungeon holds one prisoner; a second cell opens with a Ranger in your city.
97. Judge: when playing any card, pay one required resource with a different resource of your choice.
98. Only one card-playing ability may be used per card played.
99. Free plays (Queen, Postal Pigeon, Cemetery) ignore cost entirely.
100. Wanderer does not use up a city space.
101. Husband and Wife share one city space when paired.
102. Ruins: raze one of your Constructions, build in its place, regain its exact cost, draw 2 cards; works in a full city.
103. Ruins requires a Construction to raze (cannot be played into a city with none).
104. Order of resolution: card enters the city before its own effect resolves (Historian does not trigger on itself; triggers after others).

## I. Seasons

105. Winter -> Spring: recall workers, +1 worker (3), activate all Production cards.
106. Spring -> Summer: +1 worker (4); NO production; may take up to 2 cards from the Meadow.
107. Summer -> Autumn: +2 workers (6), activate all Production cards.
108. Autumn is the last Prepare: no further season change is possible.
109. Seasons are per player: one player's Prepare does not change the other's season.
110. Production cards are activated in the order the player chooses (Teacher/Doctor/Chip Sweep ... ask for the order).
111. Clock Tower: before recalling, spend a token to repeat a basic/Forest spot your worker occupies; starts with 3 tokens.

## J. Critters and Constructions: individual card effects

112. Farm: gain 1 berry (on play and each production).
113. Mine: gain 1 pebble.
114. Resin Refinery: gain 1 resin.
115. Twig Barge: gain 2 twigs.
116. General Store: gain 1 berry, or 2 berries if you have a Farm.
117. Fair Grounds: draw 2 cards.
118. Barge Toad: gain 2 twigs per Farm in your city.
119. Husband: if paired with a Wife and you own a Farm, gain any 1 resource on play and every production; unpaired gives nothing.
120. Chip Sweep: re-run one other Production card in your city (not itself).
121. Chip Sweep (re-run): copying Twig Barge gives 2 extra twigs.
122. Miner Mole: mimic one Production card in a rival's city.
123. Doctor: spend up to 3 berries, take a point token for each.
124. Woodcarver: spend up to 3 twigs, take a point token for each.
125. Monk: give up to 2 berries to a rival, take 2 point tokens for each; second Monastery slot.
126. Peddler: swap up to 2 of your resources for any 2 from the supply.
127. Teacher: draw 2 cards, keep 1, give the other to a rival.
128. Wanderer: draw 3 cards.
129. Undertaker: discard 3 Meadow cards, refill, then take 1 Meadow card.
130. Bard: discard up to 5 cards from hand, take a point token for each.
131. Historian: draw 1 card whenever you play another card.
132. Shopkeeper: gain 1 berry whenever you play another Critter (not Constructions).
133. Courthouse: gain 1 twig, resin or pebble whenever you build another Construction (not Critters).
134. Shepherd: gain 3 berries plus 1 point token per token on your Chapel; if paid with berries, those berries go to a rival.
135. Postal Pigeon: reveal 2 cards, may play one worth up to 3 base points free, discard the other.
136. Queen: send a worker to play any card worth up to 3 base points from hand or Meadow without paying.
137. Ranger: move one of your deployed workers to another legal spot.
138. Fool: costs 3 berries, gives -2 points, and is planted in a RIVAL's city (takes a space there).
139. Fool: cannot be played if every rival city is full or already holds a Fool.
140. Inn: send a worker to play a Meadow card for 3 fewer resources.
141. Post Office: give a rival 2 cards, discard any others, then refill your hand to 8.
142. Cemetery: a worker settles forever; reveal 4 cards from deck or discard, play one free, discard the rest.
143. Chapel: add a point token, then draw 2 cards for each token now on the Chapel.
144. Lookout: copy any one basic or Forest location, even if occupied.
145. Monastery: send a worker (permanent), give 2 resources to a rival, take 4 point tokens.
146. University: disband one of your cards, regain its exact cost, plus 1 resource of choice and 1 point token.
147. Storehouse: each production adds a stack (3 twigs, 2 resin, 1 pebble or 2 berries); a worker there hauls it all away.

## K. Scoring and end of game

148. Card points: sum of printed points of every card in your city.
149. Point tokens held count 1 point each.
150. Point tokens on Chapel count at game end.
151. Clock Tower tokens left on it count at game end (1 each).
152. Fool counts -2 for whoever has it in their city.
153. Dungeon prisoners score nothing.
154. Architect: 1 point per resin and per pebble you still hold, max 6.
155. King: 1 point per basic event and 2 per special event achieved.
156. Castle: 1 point per common Construction in your city.
157. Palace: 1 point per unique Construction in your city, itself included.
158. School: 1 point per common Critter in your city.
159. Theater: 1 point per unique Critter in your city.
160. Ever Tree: 1 point per Prosperity (purple) card in your city, itself included.
161. Wife: +3 bonus points if paired with a Husband.
162. Paired Wife is worth 5 total (2 base + 3 bonus); purple cards score base plus bonus.
163. Events score at game end: basic 3 each, special per their rule.
164. Journey workers score their spot value at game end.
165. Game ends when all players have passed; highest total wins.
166. Tie-break 1: most events achieved.
167. Tie-break 2: most leftover resources.
168. Full tie after both tie-breaks is reported as a tie.

## L. Solo mode (Old Grimbeard)

169. Solo uses 2-player layout: 3 Forest cards, 5 cards in hand, 8 Meadow cards.
170. Solo: Old Grimbeard blocks the top-left Forest card and the 3-twig space at start.
171. Solo: after each card you play, a d8 roll takes that Meadow slot's card into his city (colours/totals only).
172. Solo: his score is 2 per card in his city (3 per Prosperity card), plus 3 per basic event he holds, plus point tokens given to him.
173. Solo: you win only with strictly more points than Old Grimbeard (tie = loss).
174. Solo: he receives resources/cards you must give a rival as discards; Inn and Post Office in his city may be visited, giving him 1 point.
175. Solo: Prepare for Season moves his Forest/basic workers and blocks Meadow slots 1,2,3,4 over the year.
176. Solo difficulty: each special event you did not achieve scores 3 for him (Grumpy) or 6 (Gruff, Ghastly) -- with 4 events in play.

## M. Edge cases and rulebook corner rules

177. Husband/Wife pairing is one-to-one: a second Husband does not share the first pair's space.
178. A Wife arriving after an unpaired Husband pairs with him and shares his space.
179. Shepherd played free by occupying pays nothing to a rival.
180. Historian also triggers when a card is played free (Queen).
181. Shopkeeper also triggers when a Critter is played free by occupying.
182. Teacher with a full hand draws nothing (cannot draw at 8 cards).
183. Wanderer with a nearly full hand draws only up to 8.
184. Postal Pigeon cannot play a revealed card worth more than 3 base points.
185. Cemetery can reveal from the discard pile instead of the deck.
186. University disbanding: card goes to discard, its cost returns, +1 resource of choice, +1 point token, and it frees a city space.
187. University is unusable if you have no other card in your city.
188. Storehouse cannot be visited while empty.
189. Monastery cannot be used with fewer than 2 resources to give.
190. Ruins gives back exactly the razed card's cost, and the razed card goes to the discard pile.
191. Ruins cannot raze another Ruins and cannot be used with no Construction.
192. Mimicking: Miner Mole offers only Production cards of rivals, one entry per distinct card.
193. Miner Mole with no Production card in any rival city does nothing.
194. Chip Sweep cannot copy a Production card it has already re-run in the same chain (no infinite loop).
195. Production card played in Summer fires on play (not at Prepare).
196. Storehouse resources never count as the owner's resources for Architect.
197. Basic events need cards in YOUR city, and Storehouse counts as Production (green).
198. Ever Tree counts Prosperity cards held beneath nothing else: Dungeon prisoners do not count.
199. Theater/School ignore Critters locked in a Dungeon.
200. Journey worker count: leaving for the Journey with the 2-spot needs only 2 cards in hand.
201. Autumn Prepare gives +2 workers so a player owns 6 workers in total across the year.
202. Recalled workers return to hand: after Prepare nothing is deployed and all workers are available.
203. Prepare can be done only once per season step; Winter->Spring->Summer->Autumn in order.
204. Played cards are never lost: card conservation holds after a long scripted sequence.
205. Solo: a Fool you play is discarded and removes one card from his city, without triggering his play.
206. Solo: Prepare for Spring/Summer/Autumn blocks Meadow slots 1; 2; 3 and 4 for you.
207. Solo: blocked Meadow cards cannot be played by you.
208. Solo: his forest worker moves to the next Forest card each season; his basic-space worker moves 3 twigs -> 2 resin -> 1 pebble -> berry+card.
209. Solo Ghastly: in his Autumn Prepare he removes one of your workers for good (you have 5, not 6).
210. Solo: Postal Pigeon's free play counts as two plays so he plays two cards.
211. Solo: he claims any basic event his city qualifies for at game end.
212. Solo: Old Grimbeard has no city limit.
213. Solo: Echo/Miner Mole may copy a Production card in his city.
214. Solo: anything you must give a rival (Post Office cards, Monk berries) is simply discarded/lost.
215. Passing is allowed only in Autumn: in Winter, Spring and Summer the year goes on (no Pass move).
