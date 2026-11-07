# Stitchwise rules notes (own words)

Two players, a 9x9 quilt each, 33 polyomino patches in a ring with a neutral marker, a 53-space time track, buttons as money and score.

## Confirmed (from the design brief)
- Turn: (a) buy one of the 3 patches just past the marker: pay its button cost, place it (rotate/flip, no overlap, inside the 9x9), move your token forward by its time; the marker takes the bought patch's place. (b) Advance your token to the space just ahead of the opponent's and take 1 button per space moved.
- The player further back on the track moves next; on a tie the one on top (arrived last).
- Passing a button space pays buttons equal to the button icons on your patches. Passing a leather space takes the 1x1 patch and you place it at once.
- First to fill a 7x7 square gets the 7-point bonus. End: both tokens at the end; score = buttons + bonus - 2 per empty square.

## Data check against public sources (7 Nov 2026, second pass)
Two independent public implementations were read through a page fetch (facts only, numbers re-typed into our own `src/data.js`; no code, names, art or text copied; neither repository states a licence, so no `THIRD-PARTY.md`):
- Source A: a public implementation A (patch data file: id, cost, time, income, cells) and its README (income spots 5, 11, 17, 23, 29, 35, 41, 47, 53; leather spots 20, 26, 32, 44, 50).
- Source B: a public implementation B (piece constants file: shape grid where 2 marks a button, buttons, time).
- Rule facts: arXiv 2001.04233 (a constraint-programming study): 53 steps, 5 leather steps, 9 income steps, patches cost 0-10 buttons, 0-3 income, 5 buttons and a 9x9 board each, marker after the smallest patch, further-back token moves, tie: last to arrive plays, advance = one step past the opponent for that many buttons, start score 5 - 2*81.
- `cross-check.py` compares A and B (shape up to rotate/flip, cost, time, income): **31 of 33 patches agree exactly**. The 2 that differ were resolved toward B and are still UNCONFIRMED against a rulebook: the long C patch (cost 1, time 5, income 1: A says 7 squares, B says 6) and the cost 2 time 2 patch (A: plus of 5 squares, which would duplicate the plus at cost 5; B: T of 4 squares). Total squares 166.
- Not checked against the printed rulebook (no copy reachable here). Our constants: 33 patches, 5 start buttons, tie on final score -> the player who reached the end first (not in the sources; a guess).

## Still guessed
- Tie on final score, and the leather-patch-on-a-full-quilt skip.
- The 2 unconfirmed patch entries above.
