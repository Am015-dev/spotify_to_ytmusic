# Stitchwise: components

Owner rule (20 Nov 2026): the rules and the component STRUCTURE match the base game (33 patches in a ring, two 9x9 quilts,
the 53-space time track, buttons as money and score, 5 start buttons, the 7x7 bonus, -2 per empty square). The patch set itself
is our own: every patch has its own shape, cost, time, income and name. No patch equals a base patch in shape + cost + time +
income, and no patch with a base shape shares two of its three numbers with that base patch. `src/data.js` is the source;
`rules-test.js` checks count, total squares, ranges, connectivity and that all 33 are distinct.

## Totals

| | Base structure | Our set | Change |
|---|---|---|---|
| Patches | 33 | 33 | 0 |
| Squares | 166 | 166 | 0% |
| Button cost | 133 | 137 | +3.0% |
| Time | 107 | 109 | +1.9% |
| Button income (icons) | 38 | 38 | 0% |
| Value proxy (2 x squares - cost - time + 4 x income) | 244 | 238 | -2.5% |
| Cheap-slow (cost <= 3, time >= 4) / expensive-fast (cost >= 6, time <= 3) | 4 / 3 | 4 / 3 | same |

Smallest patch is a 2-square domino (id 0): the neutral token starts just after it, as in the base rules.

## Distributions

| Size (squares) | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|
| Base | 1 | 3 | 7 | 9 | 10 | 2 | 1 |
| Ours | 1 | 2 | 8 | 10 | 9 | 2 | 1 |

Only two free 3-square shapes exist, so we use one fewer 3-square patch and balance the squares with sizes 4-6.

| Cost | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base | 1 | 5 | 7 | 5 | 3 | 3 | 1 | 4 | 1 | 0 | 3 |
| Ours | 1 | 6 | 7 | 2 | 2 | 6 | 1 | 2 | 2 | 3 | 1 |

| Time | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Base | 4 | 9 | 7 | 5 | 4 | 4 |
| Ours | 3 | 6 | 10 | 8 | 4 | 2 |

| Income icons | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Base | 11 | 10 | 8 | 4 |
| Ours | 10 | 11 | 9 | 3 |

## Per size band (cost / time / income sums)

| Size | Base | Ours |
|---|---|---|
| 2-3 (4 base, 3 ours) | 8 / 7 / 0 | 4 / 6 / 0 |
| 4 | 29 / 26 / 10 | 27 / 26 / 8 |
| 5 | 45 / 28 / 12 | 41 / 34 / 10 |
| 6 | 43 / 36 / 14 | 45 / 31 / 15 |
| 7-8 | 8 / 10 / 2 | 20 / 12 / 5 |

Our big patches (7-8 squares) are dearer and our 5-square ones slower: the late game asks for buttons, the early game for time.

## Shapes

18 of our 33 shapes also occur in the base set (with only 2-6 squares there are few shapes to choose from), always with different
numbers. 15 shapes are new: Chevron, Lightning Seam and Clover Sprig (5 squares); Hearth Block, Bolt End, Staircase, Teapot,
Crook, Rickrack, River Bend, Signpost and Big Corner (6); Cottage and Comet Tail (7); Bow Tie (8).

## Balance (AI vs AI, `rules-test.js` bots, 500 games per pairing, fresh seeds 7000+)

| Pairing | Base set | Our set |
|---|---|---|
| Normal beats Easy | 64% | 62% |
| Hard beats Normal | 62% | 60% |
| Easy beats Simple (first-fit bot) | 80% | 85% |
| Normal: average final score | 17.6 | 17.2 |
| Easy: average final score | 10.6 | 8.7 |
| Hard: average final score | 20.2 | 19.3 |
| Average moves per game | 39.0 | 39.2 |

Tuning: hand-authored set, then a small hill-climb (cost/time/income +-1, totals held within 5%, base-match rule enforced)
against Normal-v-Easy and Hard-v-Normal win rates and final scores; checked afterwards on seeds the climb never saw.
