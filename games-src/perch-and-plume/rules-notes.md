# Perch & Plume: rules notes (own words)

A bird-collecting engine-building card game for 1-5 players (solo against an automa-style rival). Base game only.

## Confirmed (implemented and tested in rules-test.js)
- 4 rounds; action cubes per player 8, 7, 6, 5. One action per turn.
- Actions: play a bird, or use a habitat row: forest = gain food from the dice feeder, grassland = lay eggs, wetland = draw cards
  (tray of 3 face-up or the deck).
- Row strength by birds already in that row (0..5): forest 1,1,2,2,3,3 food; grassland 2,2,3,3,4,4 eggs; wetland 1,1,2,2,3,3 cards.
  Spaces 1, 3, 5 (one, three or five birds in the row) add an optional trade: forest discard a card for +1 food,
  grassland pay 1 food for +1 egg, wetland pay 1 egg for +1 card.
- After the row action, every brown power in that row fires, from the rightmost bird to the leftmost.
- Playing a bird: leftmost empty space of a habitat the bird lives in; food cost (specific, either/or, or wild); any 2 food pay for
  1 required food; egg cost by column 0, 1, 1, 2, 2.
- White powers fire once when played; pink powers fire once between your turns when another player does the matching thing.
- Birdfeeder: 5 dice, faces grub, seed, fish, berry, rodent, grub/seed. Empty feeder: roll all 5. All dice the same face: you may reroll all.
- Tray refills at the end of each turn; at the end of a round it is cleared and refilled; first player passes left.
- End-of-round goal: placements 1st/2nd/3rd = 4/1/0, 5/2/1, 6/3/2, 7/4/3; ties add the tied places and split rounded down; 0 items scores nothing.
- Setup: 5 birds, 1 of each food, 2 bonus cards; keep any mix of birds and food that totals 5, keep 1 bonus card.
- Final score: bird points + bonus cards + round goals + 1 per egg + 1 per cached food + 1 per tucked card. Tie: most leftover food.

## Guessed / simplified (say so to the owner)
- Roster: 120 original birds built from 40 species types (`gen-data.py`); costs 1-3 food, points 0-9, egg limits 1-6, wing sizes,
  nests (bowl, cavity, ground, platform, star = any). Powers are from a set of 26 types true to the design's colours, not copies of real cards.
- Goals: 12 original goal tiles, green-side (competitive) scoring only; solo with no rival uses 1 point per item up to 5.
- Bonus cards: 18 original ones with tiered or per-bird scoring.
- Rival Flock (solo): a shuffled deck of 8 action cards per round (add the top deck bird to its flock, take a die, lay eggs,
  take the first tray bird); goal count = marks from its cards. A simplification of an automa, not a copy.
- Payment and egg sources are chosen automatically (cheapest food first; eggs from the fullest nests); "Other food" cycles the payment.

## Cross-check against the online rulebook (7 Nov 2026)
Sources (read only, nothing copied): the extracted text of the official base rulebook and an online rules summary (URLs not written here because they carry the original title).
| rule | rulebook | ours |
|---|---|---|
| actions per round | 8, 7, 6, 5 cubes | same |
| egg cost to play | column 1 free, columns 2-3: 1 egg, columns 4-5: 2 eggs | same (`EGGCOST`) |
| trades on bonus spaces | forest: discard 1 card for +1 food; grassland: pay 1 food for +1 egg; wetland: discard 1 egg for +1 card; at most 1 | same |
| any 2 food = 1 food | only when playing a bird | same (`payOptions` is used only for playing) |
| tray | refill empty spaces at the end of your turn; at round end discard all 3 and refill | same |
| birdfeeder | empty: reroll all 5; all remaining dice the same face: you may reroll | same |
| green goals | 4/1/0, 5/2/1, 6/3/2, 7/4/3; ties add the places and divide rounded down; 0 items scores nothing | same |
| setup | 5 birds, 5 food (1 each), 2 bonus; keep up to 5 birds discarding 1 food per bird kept; keep 1 bonus | same |
| scoring and tie | birds, bonus, goals, eggs, cached food, tucked cards; tie = most unused food | same |
| row yields per column | shown only in the player-mat art (forest 1,1,2,2,3,3; grassland 2,2,3,3,4,4; wetland 1,1,2,2,3,3, bonus on the 2nd/4th/6th space) | same, from the mat as remembered; not stated in the text |
| roster | 170 birds, 26 bonus cards; costs up to 3 food; points 0-9; egg limits 0-6 | 120 birds and 18 bonus cards (the brief's size); costs 1-3; points 0-9; egg limits 1-6; power colours brown / white / pink and their trigger timing match |
