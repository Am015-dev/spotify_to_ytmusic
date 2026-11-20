# Stitchwise rules notes (own words)

Two players, a 9x9 quilt each, 33 polyomino patches in a ring with a neutral marker, a 53-space time track, buttons as money and score.

## Confirmed (from the design brief)
- Turn: (a) buy one of the 3 patches just past the marker: pay its button cost, place it (rotate/flip, no overlap, inside the 9x9), move your token forward by its time; the marker takes the bought patch's place. (b) Advance your token to the space just ahead of the opponent's and take 1 button per space moved.
- The player further back on the track moves next; on a tie the one on top (arrived last).
- Passing a button space pays buttons equal to the button icons on your patches. Passing a leather space takes the 1x1 patch and you place it at once.
- First to fill a 7x7 square gets the 7-point bonus. End: both tokens at the end; score = buttons + bonus - 2 per empty square.

## Patch set: our own (rewrite, 20 Nov 2026)
- The 33 patches are our own design (shapes, cost, time, income, names); see `COMPONENTS.md` for the structure we keep and the
  totals (166 squares, cost 137, time 109, income 38 against the base 166 / 133 / 107 / 38). The rules and all other numbers above
  are unchanged. The earlier per-patch data check (two public sources) no longer applies to `src/data.js`.

## Still guessed
- Tie on final score, and the leather-patch-on-a-full-quilt skip.

## Leather spaces: current printing (F1, 20 Nov 2026)
- The publisher's FAQ says the first leather patch came too early (useless in about half of games) and was moved to a later space;
  newer prints include the change, and a correction sticker is offered for old boards.
- The old board (rules sheet diagram) has leather on 20, 26, 32, 44, 50. The correction sticker covers the leather on 20 and adds one
  in the third ring, on the empty gap between 32 and 44. That gives 26, 32, 38, 44, 50: one leather every 6 spaces, 3 after each button space.
- Used now: `LEATHER_SPOTS: [26, 32, 38, 44, 50]`. Confidence: high that 20 is gone; the new space read from the sticker and board art as 38.
