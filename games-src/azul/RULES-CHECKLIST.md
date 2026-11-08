# Sunglaze rules checklist (base game, no variants)

Source: the published 2017 rulebook for the game Sunglaze adapts, checked against several public rule summaries.
Each number below is asserted by one test in `games-src/azul/logic-test.js` (`node games-src/azul/logic-test.js`).
Terms: kiln = factory display, courtyard = centre, Sun token = first-player marker, rack = pattern line, mosaic = wall,
breakage = floor line, shard box = box lid, sack = bag.

## Setup
1. 100 tiles: 20 of each of 5 colours (bag plus kilns hold all 100 at the start).
2. 2 players use 5 kilns.
3. 3 players use 7 kilns.
4. 4 players use 9 kilns.
5. Every kiln is filled with exactly 4 tiles drawn from the sack (2, 3 and 4 players).
6. Sack after setup holds 100 minus 4 per kiln (80, 72, 64).
7. The Sun token starts in the courtyard; the courtyard holds no tiles in round 1.
8. Each board: racks of capacity 1,2,3,4,5; empty 5x5 mosaic; 7 breakage spaces; score 0.
9. Mosaic colour layout: colour k sits in column (k + row) mod 5 of each row, so every row and column has each colour once.

## Factory offer
10. Taking from a kiln takes ALL tiles of the chosen colour there.
11. The other tiles of that kiln move to the courtyard.
12. The kiln is left empty.
13. A colour not present at that place cannot be chosen.
14. Taking from the courtyard takes ALL tiles of the chosen colour; the others stay.
15. The first player to take from the courtyard takes the Sun token and puts it on their breakage line (first free space).
16. Later courtyard takers do not get the Sun token.
17. The Sun token takes a breakage space and counts in the penalty (token + 4 tiles = -8).
18. Taking from a kiln never gives the Sun token.
19. Play passes to the next player after each take (wraps from last to first).
20. All taken tiles go to ONE rack (or all to breakage).
21. Tiles that do not fit the rack go to breakage.
22. A rack holding one colour cannot receive another colour.
23. A colour cannot go on a rack whose mosaic row already has that colour.
24. A full rack cannot receive more tiles.
25. More tiles of the same colour may be added to a part-filled rack.
26. Placing everything straight onto breakage is always allowed.
27. Breakage holds 7; tiles beyond that go to the shard box.
28. The Sun token is taken even if every tile taken goes to breakage.
29. No passing: every legal move in the offer is a take.
30. The offer ends only when all kilns and the courtyard are empty, then mosaic tiling begins.
31. The Sun token alone in the courtyard cannot be taken (an empty courtyard is not a source).

## Wall-tiling
32. A full rack puts its rightmost tile on the mosaic space of its colour in the same row.
33. The other tiles of that rack (capacity - 1) go to the shard box.
34. Racks that are not full keep their tiles unchanged.
35. A placed tile touching nothing scores 1.
36. Horizontal run of 2+ (new tile included) scores its length.
37. Vertical run of 2+ scores its length.
38. A tile in both a horizontal and a vertical run scores both lengths.
39. Runs must be contiguous: a gap stops the run.
40. Breakage penalty by tiles on the line (token counts): 1:-1, 2:-2, 3:-4, 4:-6, 5:-8, 6:-11, 7:-14.
41. Penalty comes off after wall scoring and a score never drops below 0.
42. Breakage tiles go to the shard box.
43. The Sun token returns to the courtyard (not to the shard box).
44. The player who held the Sun token starts the next round.
45. Every player's racks are tiled and scored, not just the first.

## Refilling
46. After tiling, if no one has a complete row, a new round refills every kiln with 4 tiles from the sack.
47. The round counter goes up by one.
48. If the sack runs out while refilling, the shard box is emptied into the sack and drawing continues.
49. The shard box is not mixed back before the sack is empty.
50. If sack and shard box are both empty, the remaining kilns stay short.

## End of game and scoring
51. The game ends after the tiling phase of a round in which a player completes a horizontal mosaic row.
52. With no complete row, the game continues.
53. A complete column alone does not end the game.
54. +2 for each complete row.
55. +7 for each complete column.
56. +10 for each colour with all 5 tiles on the mosaic.
57. End bonuses are added after the last round's breakage penalty (penalty clamps at 0 first).
58. The highest score wins.
59. Tie on score: the player with more complete rows wins.
60. Still tied: the win is shared.
61. In the last round every player finishes tiling and breakage before the game ends.
