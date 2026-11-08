# Rampart & Vine: rules checklist (W447)

Every rule of the published rulebook this game adapts, numbered. `node games-src/carc/logic-test.js` runs ONE headless assertion per number
against the real engine (`game/src/engine.js`, `data.js`, `geo.js`): it sets up the state, acts, and compares the exact result
(`FAIL n: expected X, got Y`). The tests were written from the rulebook, not from the builders' tests, and checked by mutation: nine deliberate
engine breakages (monastery 8, pennants dropped, field 2, occupancy ignored, large follower = 1, ...) each made the right rules fail.

Sources: the publisher's rulebook text (base game 3rd edition, expansions 1 and 2) via the rules summaries at rules.dized.com, the
rulebook PDFs at hans-im-glueck.de and the Board Game Arena help page, plus the project's `game/rules-notes.md` for the choices where sources differ.
Rules 1 to 5 are the box contents; 6 onward are play. Section G covers the expansions that are in the game (river, tavern/basilica, goods/mason/hog).
Rule 5 (Merchants & Masons tile geometry) is the one **known open** item: see the note at the end.

Edition: the 3rd edition (2-tile town = 4, farmers 3 per completed town, hog +1 per town).

### A. Setup

1. The base game has 72 tiles
2. Base tiles by number of town (city) sides: 28 with none, 18 with one, 18 with two, 7 with three, 1 with four
3. Every one of the 23 base tile kinds (the 24 of the box, with the two mirrored town-corner-road tiles counted together) has its exact box count
4. Tile geometry: every town/road side belongs to exactly one town/road piece; field pieces cover exactly the non-town sides; a field touches a town whenever a town side lies at one of its corners and never touches one it cannot reach (base, river, Taverns & Basilicas tiles)
5. Tile geometry: every town/road side belongs to exactly one town/road piece; field pieces cover exactly the non-town sides; a field touches a town whenever a town side lies at one of its corners and never touches one it cannot reach (Merchants & Masons tiles)
6. Exactly 10 base tiles carry a pennant (coat of arms)
7. Exactly 6 base tiles carry a monastery (4 alone, 2 with a road)
8. The start tile has a town on one side and a road running straight through the opposite two sides; it is the first tile, at the centre, unrotated
9. 71 tiles remain after the start tile (one is in the first player's hand, the rest in the stack)
10. Each player starts with 7 followers and 0 points
11. Base game seats 2 to 5 players (a request for 6 gives 5)
12. Players take turns in seat order, clockwise, and it wraps round

### B. Placement

13. A new tile must touch an existing tile along a side; a spot touching only at a corner or nowhere is illegal
14. A tile may not be put on an occupied square
15. Touching sides must match: town to town, field to field (a town against a field is illegal)
16. Touching sides must match: road to road (a road against a field is illegal)
17. When a tile touches two neighbours, BOTH sides must match
18. A tile may be turned to any of 4 orientations; every orientation that fits is offered (town-cap south of the start: exactly r1,r2,r3 fit)
19. Placement only offers squares next to the map: every legal move touches a tile
20. A tile with no legal place anywhere is set aside and the player draws another (the set-aside tile never returns)
21. Play continues until the last tile has been placed, then the game ends

### C. Followers

22. After placing a tile the player may place ONE follower on that tile (or skip); skip is always offered
23. A follower may stand on a road, a town, a monastery or a field of the tile just placed (a 3-way junction tile has 3 road ends and 3 fields = 6 places)
24. Only the tile just placed can receive a figure (every figure move names a segment of the new tile)
25. A follower may not go on a feature that already holds any follower (even a rival's), counting the whole connected feature
26. The same occupancy applies to roads: placing a tile that continues an occupied road does not allow a second follower on it
27. A follower may be placed on a field only if the whole connected field holds no farmer
28. A player with no follower left in supply cannot place one
29. Placing a follower takes it from supply (7 -> 6) and ends the turn; the next player is up
30. A follower placed on the tile that completes its feature scores at once and comes back to supply

### D. Completion

31. A completed road scores 1 point per tile, junction to junction (3 tiles = 3)
32. A road may end in a monastery (junction + monastery lane = 2 tiles = 2)
33. A road may end at a town; the town tile counts as a road tile too
34. A road that loops back on itself is complete; every tile counts (4 curves in a square = 4)
35. A completed town scores 2 per tile (a 2-tile town = 4)
36. Each pennant in a completed town adds 2 points (3 tiles + 1 pennant = 8)
37. A town is complete only when no side is open: a town with one open side does not score
38. A completed monastery scores 9 (itself + 8 neighbours) when the LAST NEIGHBOUR is placed, and the follower returns
39. A monastery also completes (9 at once) when the monastery tile itself is the last tile of the ring
40. A completed feature with no follower scores nothing for anybody
41. After scoring, all followers on the finished feature go home to their owners
42. Farmers (followers lying in a field) do NOT return when a town beside them is completed

### E. Majority

43. The player with the most followers in a completed feature scores it alone (2 vs 1: P0 gets 4, P1 gets 0)
44. When players tie for most followers, each of them scores the full value (1 vs 1: 4 and 4)
45. Three players: the two tied for the lead both score, the third gets nothing
46. Followers who lose the majority score nothing but still return to their owners
47. Majority is by number of followers in the feature, not by who completed it

### F. End scoring

48. An unfinished road scores 1 point per tile at game end (junction + start road = 2)
49. An unfinished town scores 1 point per tile AND 1 per pennant (start + banner band = 2 tiles + 1 = 3)
50. An unfinished monastery scores 1 + 1 per neighbouring tile (centre with start above and two side tiles = 4)
51. A field scores 3 per COMPLETED town touching it (one closed town = 3)
52. A field with no completed town beside it scores 0
53. An UNFINISHED town beside a field gives the farmer nothing
54. One field touching two completed towns scores 3 for each (6)
55. Farmers: most farmers in the field wins it; a tie pays both in full
56. End scoring uses majority too: 2 followers beat 1 on an unfinished road
57. End scoring is added to the scores once, and the highest total wins
58. Tied top scores share the win
59. A single highest score wins alone
60. Nothing scores twice: a feature completed during play is not scored again at the end

### G. Expansions

61. Large follower counts as two followers (P1 large vs P0 follower: P1 takes the town alone)
62. Tavern road: 2 per tile when complete (4 tiles = 8)
63. Tavern road scores 0 if unfinished at the end
64. Basilica town: 3 per tile when complete (5 tiles = 15); 0 if unfinished
65. Mason: a tile that extends the road/town holding your mason gives an extra turn at once; the extra turn cannot chain
66. Hog: a farmer majority holder with a hog scores 4 per completed town instead of 3
67. Hog does not count as a farmer: a hog beside a minority farmer adds nothing
68. Goods: whoever completes a town takes its goods tokens, even without followers
69. Goods at the end: 10 points per kind to the player(s) with the most (tie pays all)
70. River: the river tile must continue the river; a curve may not bend the same way as the previous curve (no U-turn)
71. Sixth player is allowed with Taverns & Basilicas

## Note on rule 5 (known open)
Seven Merchants & Masons field pieces (TB_CcRRx_c x2, TB_CcRR_wG, TB_CcRC_c, TB_CcRC_g, TB_CcRx_w, TB_RCcx_g) list a town as adjacent to a field that,
by corner geometry, does not reach it (the field lies across a road stub or hedge). The drawn art agrees with the data, and the rulebook text available here does not
say which is right, so the data was NOT changed: a wrong guess would change farmer scores, and a fix would also need the tile drawings (UI, owned by W426).
Effect: at game end a farmer on one of those fields might get 3 extra points per such town. Needs the physical tiles to settle.
