# Hollowbough: tutorial coverage (the coached first game)

The forced tap-by-tap tutorial is gone. The first game is a real game on a stacked deal (seed 4242: hand with mine, twig barge, resin refinery, allotment, goodwife; Inn, Post Office and Lookout already in the city; a toad in the meadow). Every legal move is allowed from turn 1, the rival plays normally (easy level). Hazel (guide) speaks just in time with ONE chip at a time (`COACH` in `game/src/ui12.js`): it never takes a tap, it fades after 6.5 s, and any tap on the board dismisses it. No forced steps at all (limit was 2). Nothing is saved or counted.

Proof: `game/tutor-e2e.js` (fresh storage, Play, Learn, then plays the whole game by real taps: each move comes from the game's own hint, so any legal move) at 390x763 and 1440x860. It asserts that every rule id (COACH + COACH_LATER) was either explained during play (`UI.tutLog`) or is listed on the final "Things you'll meet later" card (`UI.laterList`), that the score walk-through (own score, rival score, result) was spoken with the real numbers, and that the tutorial is saved as done.

| Rule | Hazel explains it when | id |
|---|---|---|
| Goal: most points when all have passed | game start | goal |
| One worker per turn; basic places, forest, meadow | your first turn, if you wait | places |
| Goods pay for cards | after your first worker | stock |
| Exclusive vs Shared place | after the rival places a worker | rival |
| Hand = plans, glowing = affordable, hand limit 8, city limit 15 | on your turn with cards in hand | hand |
| Buildings stay in the city, production pays each season | after you build | build |
| Critter moves into matching building free | goodwife in hand and allotment in city | free |
| Meadow: open to all, critters cost berries, refill | on your turn with a berry | meadow |
| Events (flags): right buildings, first claimer, 3 points | from Spring | event |
| Prepare for Season: workers home, +1 worker, production | when all workers are out | prep |
| Season order Winter, Spring, Summer (draw), Autumn (bonus workers) | on reaching Spring | spring |
| Shared places take many workers | from Spring | shared |
| Forest places pay more | after two workers | forest |
| Pass ends your game, unused workers are wasted | late in a season | pass |
| Score walk-through: cards, tokens, events, bonuses with your numbers | final score card | score |
| Rival score and winner; tie-break (events, then leftover goods) | rival score card | rscore |
| Result and "a real game is four seasons" | result card | end |

## Listed, not forced (always shown on "Things you'll meet later" unless Hazel already said them)
Inn and Post Office (open places: rival's card, they get a point), Haven (two discards for one good), Long Road (Autumn only), special events (needs and costs), tie-break. Any of the situational rules above that never came up in that game are added to the same card automatically.

Heuristic triggers can miss a situation in one particular game; the card at the end is the guarantee that nothing is left unexplained. Not covered yet: Hazel's "good or poor move, one line why" feedback (only the rival-placed and pass lines exist), solo mode.
