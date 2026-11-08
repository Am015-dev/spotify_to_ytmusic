# Wildmark rules checklist (W431)

Every rule of the original rulebook that Wildmark claims to implement, numbered. `node logic-test.js` has exactly one assertion per number
(same order): it builds its own state, acts through the real engine (`src/engine.js`, `data.js`, `cards.js`) and compares the exact result.
`node logic-test.js --list` prints this numbered list again. The old `rules-test.js` is not evidence and is not used here.

Sources: the published rulebook from memory, plus an online rules reference fetched 8 Nov 2026 (setup, turn, nature tokens, overpopulation, solo,
end, majority bonuses, tie-break, card descriptions). The reference gives card **patterns** but not the **point tables** of cards B, C and D;
those tables (rules marked "table recalled") are from memory and unverified. Card A tables are the well-known ones and are asserted exactly.

Not asserted (our own content, cannot be checked against the original): which animals sit on which tile, the five starter triads' contents,
how the hawk and fox cards B-D resolve edge cases (sight through non-lone hawks, fox pair counts) beyond the cases below, and whether a closed
triangle of 3 salmon is a run (the engine says yes, as each touches only two).

## Setup

R1. The bag holds 100 wildlife tokens, 20 each of bear, elk, salmon, hawk, fox (bag + the 4 market tokens at the start).
R2. There are 85 habitat tiles in total (not counting the 5 starter triads).
R3. 25 keystone tiles: one habitat and exactly one animal each, 5 of every habitat.
R4. 60 two-habitat tiles: each of the 10 habitat pairs appears exactly 6 times.
R5. Every two-habitat tile shows 2 or 3 different animals (never 1, never a repeat).
R6. Every tile has a unique id, and the two habitats of a split tile differ.
R7. The supply holds 25 acorn (nature) tokens; every player starts with none.
R8. Each player starts with a triad of 3 tiles that touch each other; no two players share a triad (4 players).
R9. Tile stack size: 43 tiles for 1 or 2 players, 63 for 3, 83 for 4 (market tiles included).
R10. The market starts with exactly 4 tiles and 4 tokens, each tile paired with the token in its column.
R11. A starting market of 4 identical tokens is wiped and redrawn automatically (200 seeds: never 4 alike).
R12. Players count is 1 to 4 (solo = 1 seat); play starts with the first seat in round 1.

## Turn: taking and placing

R13. Without acorns the only picks are the 4 market pairs (tile and token of one column); no free pick, no replace.
R14. Taking column i gives you that column's tile AND that column's token, and empties exactly those two slots.
R15. A tile may only be placed on an empty hex touching at least one of your tiles: the legal spots are exactly those hexes.
R16. Placing a tile on an occupied hex is refused.
R17. Placing a tile on a hex that touches none of your tiles is refused.
R18. The tile must be placed: while holding it the only moves are placements (no discard, no skip).
R19. A two-habitat tile can be placed in any of the 6 rotations; a keystone has a single orientation.
R20. The chosen rotation is kept on the placed tile: rotation r shifts which three edges show the first habitat.
R21. After placing a tile the token step follows; legal token spots = your tiles with no token that show that animal (the new tile included).
R22. The token may go on an older tile, not only on the tile just placed.
R23. A token cannot be placed on a tile that does not show that animal.
R24. A tile holds at most one token: placing on a tile that already has one is refused.
R25. A token you cannot or will not place goes back to the bag; the turn still ends and nothing else changes.
R26. Placing a token on a KEYSTONE gives you 1 acorn from the supply.
R27. Placing a token on a two-habitat tile gives no acorn.
R28. Returning a token to the bag earns no acorn, even when a keystone was placed.
R29. An empty acorn supply gives no acorn for a keystone token.
R30. Acorns are conserved: supply + held + spent-and-returned always equals 25.
R31. Refill after the turn: only the two emptied slots are refilled (new tile from the stack, new token from the bag); other pairs keep slot and partner.
R32. Refill with an empty tile stack leaves the slot empty without error (end of game).
R33. Turn order: after a turn the next seat acts, wrapping to seat 0 with the round counter +1.
R34. Each turn counts for its player: after one turn seat 0 has done 1 and seat 1 none, and the played tile stays on the map.

## Acorn (nature token) powers

R35. Acorn power 1: spend 1 acorn to take ANY tile with ANY token (different columns); the acorn returns to the supply.
R36. The free pick is refused without an acorn.
R37. Acorn power 2: spend 1 acorn to replace ANY NUMBER of the market tokens; only the chosen slots change, the acorn goes back to the supply.
R38. Replaced tokens are drawn FIRST and only then returned to the bag (you cannot redraw what you just discarded).
R39. Replacing tokens needs an acorn.
R40. Several acorn powers can be used in one turn (replace, then a free pick), each costing its own acorn.
R41. Acorn powers can only be used before you take your pair (not while placing).
R42. If a replace leaves 4 identical tokens, they are wiped again automatically.
R43. Acorns left at the end are worth 1 point each.

## Overpopulation (three or four identical tokens)

R44. Three identical market tokens: the active player MAY wipe those three (offered as a move, optional: the normal picks stay available).
R45. The three-token wipe is not offered with only two alike, or after the market is already four alike.
R46. The three-token wipe replaces exactly the three matching tokens (the odd one stays) and returns them to the bag after drawing.
R47. The three-token wipe works at most once per turn, even if three alike show up again.
R48. The once-per-turn limit resets for the next turn.
R49. The three-token wipe costs no acorn.
R50. Four identical tokens (after a refill) are wiped automatically: all four return to the bag and four new ones are drawn.
R51. Automatic four-token wipes repeat until the four tokens are not all alike (200 full games, never four alike on a player's turn).

## End of the game

R52. Each player gets exactly 20 turns: a 2-player game lasts 40 turns, ending right after the second seat's 20th turn, not earlier.
R53. 3- and 4-player games last 60 and 80 turns.
R54. Everyone ends with 23 tiles (3 starter + 20 placed); the stack is used up and 3 tiles remain face-up in the market.
R55. Once the game is over there are no legal moves and no move is accepted.
R56. Winner = highest total (animals + habitats + majority bonuses + acorns).
R57. Tie on points: the player with more acorns wins.
R58. Tie on points AND acorns: shared victory (no single winner).

## Solo game

R59. Solo is 20 turns on a 43-tile stack, then the game ends.
R60. Solo: after each turn the tile and the token farthest from the stack are removed from the game; the tile never returns.
R61. Solo: the removed token leaves the game (it does not go back into the bag).
R62. Solo: the remaining market items slide toward the stack and two new tile+token pairs fill the far end.
R63. Solo: the farthest REMAINING item is removed when the farthest slot itself was taken.
R64. Solo: component conservation holds (every token is in the bag, market, a valley, in hand, or removed from the game).

## Scoring: wildlife card A

R65. Bears A: groups of EXACTLY 2 bears; 1 / 2 / 3 / 4 pairs = 4 / 11 / 19 / 27, more pairs stay at 27.
R66. Bears A: a lone bear scores 0; a group of 3 scores 0; a group of 3 does not count as a pair plus one.
R67. Bears A: the two bears of a pair must touch each other (diagonal hex neighbours count, 2 apart does not).
R68. Elk A: a straight line of N elk scores 2 / 5 / 9 / 13 for N = 1 / 2 / 3 / 4 (separate single elk each 2).
R69. Elk A: lines run along each of the three hex axes.
R70. Elk A: a bent group (three elk, not straight) is a line of 2 plus a single = 7.
R71. Elk A: 5 elk in a row = a line of 4 (13) plus a single (2) = 15; each elk counts in one line only.
R72. Elk A: every elk is used once in the combination that scores MOST (checked against brute force on 300 random elk layouts).
R73. Salmon A: a run of N salmon scores 2 / 5 / 8 / 12 / 16 / 20 / 25 for N = 1..7; longer runs stay at 25.
R74. Salmon A: a salmon that touches 3 salmon breaks the run: the whole group scores 0.
R75. Salmon A: separate runs score separately and add up (a run of 3 and a run of 2 = 8 + 5).
R76. Salmon A: two runs lying against each other are one group whose salmon touch more than 2 others: 0.
R77. Hawks A: N hawks touching no other hawk score 2 / 5 / 8 / 11 / 14 / 18 / 22 / 26 for N = 1..8; more stay at 26.
R78. Hawks A: two adjacent hawks score nothing (neither is alone); a third far hawk still scores 2.
R79. Fox A: each fox scores 1 per DIFFERENT animal on neighbouring tiles; the same animal twice counts once.
R80. Fox A: other foxes count as a different animal for a fox; empty tiles and tiles without a token count for nothing.
R81. Fox A: a fox sees at most 5 kinds, and each fox scores separately (5 kinds + a second fox that sees 3).

## Scoring: habitat corridors

R82. Each habitat scores 1 point per tile of its largest connected group (single tile = 1, none = 0).
R83. Only the largest group counts: a group of 3 and a separate group of 2 score 3.
R84. Tiles that do not touch are not connected.
R85. Two touching tiles connect only if the two edges facing each other show the same habitat.
R86. Rotating a two-habitat tile changes which neighbours it joins (river/forest tile, one river neighbour to the east: joined at rotations 0, 4, 5 only).
R87. A tile joins a neighbour only through the half that shows the habitat: with river neighbours east and west, a river/forest tile (rot 0) links the east one only.
R88. A tile counts once per habitat even if it connects on several edges (a ring of 6 river tiles around a hole = 6).
R89. A two-habitat tile counts in the corridor of BOTH of its habitats.
R90. Corridors ignore animal tokens: score is the same with or without tokens.
R91. The full score of one valley = animal cards + 5 largest corridors + acorns.

## Scoring: habitat majority bonuses

R92. 2 players: the larger corridor of a habitat earns 2, the other 0.
R93. 2 players: a tie for the largest corridor gives 1 to each.
R94. 2 players: nobody scores a habitat that neither player has.
R95. 2 players: a player with no tile of the habitat does not share a tie at 0; the other player takes 2.
R96. 3-4 players: sole largest 3, sole second largest 1, the rest 0.
R97. 3-4 players: tie for largest between two = 2 each and nothing for second place.
R98. 3-4 players: three players tied for largest = 1 each, nothing for the rest.
R99. 4 players: four players tied for largest = 1 each.
R100. 3-4 players: a tie for second place gives 0 to each tied player (first still gets 3).
R101. 3-4 players: a player with no corridor of the habitat gets no second-place bonus.
R102. Solo: each habitat whose largest corridor has 7 or more tiles earns 2; 6 tiles earn nothing.
R103. Solo: the bonus is counted per habitat (two habitats of 7+ = 4).
R104. Bonuses are added into the final total (W.final) once per habitat.

## Scoring: wildlife cards B, C and D (point tables recalled from the printed cards; flagged where unverified)

R105. Bears B: each group of exactly 3 bears = 10; groups of 2 or 4 = 0.
R106. Bears C: groups of 1 / 2 / 3 = 2 / 5 / 8, plus 3 if you have one group of each size; groups of 4 score 0. _(table 2/5/8 +3 recalled)_
R107. Bears D: groups of 2 / 3 / 4 = 5 / 8 / 13; a single bear scores 0. _(table 5/8/13 recalled)_
R108. Elk B: single = 2, pair = 5, triangle of 3 = 9, diamond of 4 = 13; a straight line of 3 is only a pair plus a single (7). _(table recalled)_
R109. Elk C: any connected group of elk scores by size 2, 4, 7, 10, 14, 18, 23, 28 (size 1..8+). _(table recalled)_
R110. Elk D: elk around one space score by number around it: 2, 5, 8, 12, 16, 21 (1..6). _(table recalled)_
R111. Salmon B: runs of 1..5+ score 2, 4, 9, 11, 17. _(table recalled)_
R112. Salmon C: only runs of 3, 4, 5+ score: 10, 12, 15; runs of 1 or 2 score 0. _(table recalled)_
R113. Salmon D: each run scores 1 per salmon plus 1 per adjacent other-animal token (run of 2 touching a bear and an elk = 4).
R114. Hawks C: 3 points per straight line of sight between two hawks (counted once per pair).
R115. Hawks D: a pair of hawks in sight scores by the number of different animals between them: 4, 7, 9, 11; each hawk is in one pair. _(table recalled)_
R116. Fox C: each fox scores the number of the most common neighbouring animal (foxes excluded).
R117. Fox B: each fox scores 3 / 5 / 7 for 1 / 2 / 3 different PAIRS of the same animal around it (foxes excluded). _(table recalled)_

## Rulebook re-read (W507)

R118. No limit on acorns per turn: two replaces in one turn are both allowed, each costs its own acorn.
R119. A three-token sweep that leaves four alike is wiped again automatically.

Checked and equal in effect, not asserted: the rulebook lets you put the tile and the animal down in either order; the animal can only
go on a tile that is already in your valley, so tile-then-animal (our order) reaches exactly the same positions.
