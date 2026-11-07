# Stitchwise rules notes (own words)

Two players, a 9x9 quilt each, 33 polyomino patches in a ring with a neutral marker, a 53-space time track, buttons as money and score.

## Confirmed (from the design brief)
- Turn: (a) buy one of the 3 patches just past the marker: pay its button cost, place it (rotate/flip, no overlap, inside the 9x9), move your token forward by its time; the marker takes the bought patch's place. (b) Advance your token to the space just ahead of the opponent's and take 1 button per space moved.
- The player further back on the track moves next; on a tie the one on top (arrived last).
- Passing a button space pays buttons equal to the button icons on your patches. Passing a leather space takes the 1x1 patch and you place it at once.
- First to fill a 7x7 square gets the 7-point bonus. End: both tokens at the end; score = buttons + bonus - 2 per empty square.

## Guessed (no rulebook access in this build; check against the owner's private research)
- The individual patch costs, times and income values in `src/data.js` are RECONSTRUCTED from memory and are not guaranteed to equal the original table; shapes are 33 distinct free polyominoes (domino to 7-8 cells). Set the correct values there; nothing else depends on them (AI, tests and UI read the table).
- Track length 53 and the positions of the 9 button spots (5, 11, ... 53) and 5 leather spots (20, 26, 32, 44, 50).
- Tie on final score: the player who reached the end first wins.
- Start: 5 buttons each; the neutral marker starts after the 2-square patch.
- With a leather patch and a full quilt the patch is simply skipped.
