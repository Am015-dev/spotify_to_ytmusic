# Redline Rally: rules checklist (W432)

Source: the printed rulebook of the game this adapts, from memory plus a web check of its rules text. Written in this game's own words.
Each numbered rule has ONE assertion with the same number in `logic-test.js` (run `node logic-test.js`, it prints one line per failing rule).
Tags: [CORE] must match the original. [EXT] house extension, not in the original (tested for self-consistency only). [NB] module not built (no assertion can run; listed so nothing is hidden).

## Setup
1. [CORE] Each car's deck: 12 speed cards, three each of 1, 2, 3, 4.
2. [CORE] The deck also holds 3 stress cards.
3. [CORE] The engine starts with 6 heat; no heat card is in deck, hand or discard at the start.
4. [CORE] Everyone draws a hand of 7.
5. [CORE] Every car starts in gear 1.
6. [CORE] 2 to 6 cars; a space holds at most 2 cars (grid included).
7. [CORE] Grid: the pole car is in front; at most 2 cars per row.

## Turn 1: shift gear
8. [CORE] You may stay in your gear or move one gear up or down for free.
9. [CORE] Moving two gears costs 1 heat, paid from the engine to the discard pile.
10. [CORE] A two-gear shift is not allowed with an empty engine.
11. [CORE] Gears run 1 to 4 only; no shift of 3, no gear 0 or 5.

## Turn 2: play cards
12. [CORE] Gear N means you play exactly N cards.
13. [CORE] Heat cards cannot be played.
14. [CORE] Played cards go to the discard pile.
15. [CORE] Speed = the sum of the played speed cards.
16. [CORE] A stress card: flip the deck until a speed card shows; its value counts; the flipped cards go to the discard pile.
17. [CORE] If the deck runs out while flipping, the discard pile is shuffled into a new deck.

## Turn 3: reveal, boost
18b. [CORE] Boost is decided in the react step, after the cards are revealed (W496: a question after the reveal; test R69).
18. [CORE] Boost costs 1 heat (engine to discard) and needs at least 1 heat in the engine.
19. [CORE] Boost: flip until a speed card shows and add its value to the speed.
20. [CORE] The boost value counts as speed for corner checks.
21. [CORE] Cards played this turn are not shuffled back into the deck while flipping for boost.

## Turn 4: cooldown
22. [CORE] Gear 1: move up to 3 heat cards from hand back into the engine.
23. [CORE] Gear 2: move 1 heat card from hand to the engine.
24. [CORE] Gears 3 and 4: no cooldown.
25. [CORE] Cooldown only takes heat cards out of the hand (never from the discard pile or deck).

## Adrenaline
26. [CORE] The last car to move gets +1 speed (adrenaline). It is optional: the car skips it when it would cost more corner heat.
27. [CORE] The last car to move gets +1 cooldown, also in gears 3 and 4.
28. [CORE] With fewer than 5 cars only the last car gets it; with 5 or more, the last two.
29. [CORE] The adrenaline +1 counts as speed for corner checks (W496 fix: it used to be ignored at corners).
30. [CORE] Cars that are not last get nothing.

## Slipstream
31. [CORE] Ending directly behind another car (it is on the next space) offers 2 more spaces.
32. [CORE] Ending in the same space as another car (side by side) offers it too.
33. [CORE] No offer when no car is on the same or the next space.
34. [CORE] It is optional; declining leaves the car where it landed.
35. [CORE] Taking it moves exactly 2 spaces (to the nearest free space if full).
36. [CORE] It does not add to speed for corners.
37. [CORE] It cannot carry a car across the finish line.
38. [CORE] A space never holds more than 2 cars after slipstream.

## Movement
39. [CORE] A car moves its speed in spaces.
40. [CORE] If the target space is full the car stops on the first free space behind it.
41. [CORE] Cars resolve leader first, last car last.

## Corners
42. [CORE] Speed at or under the corner limit costs nothing.
43. [CORE] Speed over the limit: pay heat equal to the excess (engine to discard).
44. [CORE] Crossing several corners in one move: each is paid separately with the same speed.
45. [CORE] Paying exactly all the engine's heat is allowed (no spin out).
46. [CORE] Not enough heat: spin out. The car stops on the first free space behind the corner line.
47. [CORE] Spin out puts the car in gear 1.
48. [CORE] Spin out in gear 1 or 2: 1 stress card goes to the hand.
49. [CORE] Spin out in gear 3 or 4: 2 stress cards go to the hand.
50. [CORE] Spin out pays all the heat left in the engine.
51. [CORE] Corners are ignored once the car is past the finish line.
52. [CORE] A corner crossed by slipstream still counts and uses the speed without the +2.

## Replenish
53. [CORE] After moving, draw back to 7 cards.
54. [CORE] Right after moving (discard step, before drawing) you may discard non-heat, non-stress cards (W496: moved from the next plan to its real place).
55. [CORE] Heat and stress cards cannot be discarded this way.
56. [CORE] Empty deck: the discard pile is shuffled to make a new deck.

## Stall
57. [CORE] Too few playable cards for the gear (hand full of heat): play what you have, heat cards from the hand fill the rest and go to the discard, do not move, go to gear 1, no cooldown or boost.

## Finish
58. [CORE] The finish line is crossed after laps x track length spaces.
59. [CORE] A car that has finished does not play again.
60. [CORE] The race goes on until every car has finished (W496 fix: it used to stop after the first finisher's round). When no human is still racing, the computer cars run out the race at once.
61. [CORE] Several cars finishing in the same round: the one furthest past the line wins, then second furthest, and so on.
62. [CORE] While the race runs, cars still racing rank behind the finishers by distance.
63. [CORE] Equal distance: the car that arrived first on that space ranks higher (the original uses the lane; this game has no lane tie-break) [EXT tie rule].

## Modules of the original
64. [NB] Championship (several races, points per place).
65. [NB] Weather and road-condition event cards.
66. [EXT] Legends (option `legends:k`, up to 3): automated cars with no hand or heat; each turn a Legend plays the next card of its pace deck, brakes to take every corner on its path without penalty, and takes a free slipstream boost when safe; it never gets the last-place boost. This game's own rules for the module, tested for self-consistency only.
67. [EXT] Garage upgrades (option `garage:true`): a face-up market of 6 from a pile of 2 copies of each of the 6 upgrade types; the back of the grid chooses first, snake order, 2 picks each, market refilled after every pick; the picks are shuffled into the deck. Different from the 3-pick draft (`upg`). Own design, tested for self-consistency only.
68. [CORE] Finishers leave the track at the end of the round they cross: they no longer fill a space or offer slipstream.
