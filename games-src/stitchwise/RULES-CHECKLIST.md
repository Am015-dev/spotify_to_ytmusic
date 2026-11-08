# Stitchwise rules checklist (W450)

Source: the published two-player quilt game's rulebook (10-year edition PDF, read in full on 8 Nov 2026) plus the usual
public rules summaries. The original's name is deliberately not written here. Numbers match `logic-test.js` (`R1`..`R64`).
Where the rulebook is silent, the rule says INTERPRETATION. Patch/track tables are Rule 65 (structure only; see end).

## Setup
1. Two players. Each starts with 5 buttons.
2. Each player has a 9x9 quilt board (81 spaces), all empty.
3. 33 regular patches, each used once, are laid in a circle in random order.
4. The smallest patch is the 1x2 (two squares). The neutral token sits between it and the next patch clockwise, so the first three patches on offer are the three after it.
5. The time board has a start space and 53 further spaces (last space = 53). Both time tokens start on the start space.
6. Button-income spaces (9): 5, 11, 17, 23, 29, 35, 41, 47, 53 (public data tables; the rulebook only says "some spaces").
7. Special 1x1 patches (5) lie on spaces 20, 26, 32, 44, 50, all available at the start.
8. The 7x7 special tile starts unclaimed.
9. The chosen start player moves first (the start-player token is on top at the start).

## Turn structure
10. The player whose token is furthest behind on the time board takes the turn (players do not simply alternate).
11. If both tokens are on the same space, the player whose token is on top goes first.
12. A player who is still behind (or on top of the tie) after an action takes another turn.
13. A turn is exactly one action, A (advance) or B (take and place a patch). If no patch on offer can be paid for and placed, A is the only legal move.

## Action A: advance and receive buttons
14. Move your token to the space directly in front of the opponent's token.
15. Receive 1 button per space advanced.
16. If you share the space (you on top), you advance 1 space and receive 1 button.
17. A token never goes past the last space; buttons are paid only for spaces actually moved.
18. If the opponent is already on the last space, advancing takes you to the last space.

## Action B: take and place a patch
19. Choose only among the three patches in front of the neutral token (clockwise). Any other choice is illegal.
20. Move the neutral token next to the chosen patch: the next offer starts with the patch that followed the taken one, order kept, wrapping round the circle.
21. Pay the printed button cost; a patch you cannot pay for cannot be taken.
22. A patch costing 0 can be taken with 0 buttons.
23. Rotate/flip freely before placing: all distinct rotations and mirror images (up to 8) are legal.
24. Patches on a quilt may not overlap.
25. Patches must lie wholly inside the 9x9 quilt board.
26. A patch that cannot be placed anywhere cannot be taken (you must choose A instead).
27. After paying and placing, move your token forward by the patch's time cost.
28. If your token ends on the opponent's space, put it on top (so you move first next).
29. A token that would move past the last space stops on the last space.
30. The bought patch's buttons count at once for button income triggered by that same move.
31. The bought patch leaves the circle (33 patches always accounted for); with fewer than three left, only those remaining are on offer.

## Time board events (both actions)
32. Passing a button-income space pays buttons equal to the total button icons on your patches.
33. Landing exactly on a button-income space also pays.
34. A space you start on (already resolved) does not pay again; only spaces after it count.
35. Several income spaces passed in one move each pay.
36. Income counts only printed icons on patches: no patches, or special patches, give 0.
37. Events fire after a patch purchase too (time cost moves you over spaces), not only on advance.
38. The first player to move past a special-patch space takes that patch and must place it at once on any empty square.
39. Landing exactly on a special-patch space counts as passing it.
40. The special patch is gone once taken: the second player passing the same space gets nothing.
41. Passing two special spaces in one move yields both patches, both placed at once.
42. A special patch goes only on an empty square inside the board (not on filled squares, not off the board).
43. You may not decline a special patch while an empty square exists.
44. A special patch fills exactly 1 square and has no cost, time cost or button icon.
45. After placing it, play continues by the normal rule (furthest-behind token moves).
46. INTERPRETATION: with a full quilt a special patch is lost (nothing to place) and the game continues.

## Special tile (7x7)
47. The first player to completely fill a 7x7 square takes the 7x7 tile at once.
48. The 7x7 square may be anywhere on the quilt board.
49. A 6x7 block, or a 7x7 with one gap, does not qualify.
50. Only the first player gets it; a later 7x7 by the other player does not move it.
51. Squares count whatever filled them (regular patches or special patches).
52. Completing the square with a regular patch triggers it as well.
53. The tile is worth 7 points.

## End of game
54. The game continues while either token is short of the last space.
55. A player on the last space takes no more turns while the opponent is not there.
56. The game ends once both tokens are on the last space (after any special patch placement it caused).
57. No moves are legal after the end.

## Scoring
58. Score starts from the buttons you hold.
59. Add 7 if you have the special tile.
60. Subtract 2 per empty square of your quilt board.
61. Squares covered by any patch (including special patches) are not empty.
62. Scores may be negative.
63. The higher score wins.
64. Tie on score: the player who reached the final space first wins (either seat).

## Data (structure only)
65. Every regular patch is a connected shape of at least 2 squares, cost 0-10, time cost at least 1, income 0-3; the 1x2 is the unique 2-square patch.

Not tested (cannot be proven here): that each of the 33 printed patch shapes/costs/times/incomes equals the printed set.
Two entries are still marked UNCONFIRMED in `rules-notes.md` (the long cost-1 patch and the cost-2/time-2 patch).
