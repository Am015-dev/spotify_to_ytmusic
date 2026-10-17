# Kaiten Kitchen: rules notes

Our own words, with the numbers the engine uses (`game/src/data.js`, `game/src/engine.js`). Written in Oct 2026 from
`PLAN.md` and the "Rule decisions" in `game/ENGINE-REPORT.md`. The private rules reference (scans in the private research
repo) was not re-read for this file; the **Confirmed** list is what `PLAN.md` took from it and what `rules-test.js` (90
tests) and the product audit's three full games checked in the engine.

## Components (108 cards)
| Card | Copies | Scores |
|---|---|---|
| Crispy Prawn | 14 | 5 for every pair; a lone one scores 0 |
| Fish Slice | 14 | 10 for every set of three; one or two score 0 |
| Steam Bun | 14 | 1 / 3 / 6 / 10 / 15 for 1 / 2 / 3 / 4 / 5 or more |
| Seaweed Roll, 2 icons | 12 | roll race (below) |
| Seaweed Roll, 3 icons | 8 | roll race |
| Seaweed Roll, 1 icon | 6 | roll race |
| Sunset Nigiri | 10 | 2 (6 on Fire Paste) |
| Moon Nigiri | 5 | 3 (9 on Fire Paste) |
| Sun Nigiri | 5 | 1 (3 on Fire Paste) |
| Fire Paste | 6 | triples the next nigiri served onto it; 0 if none comes |
| Twin Sticks | 4 | 0; lets you serve two plates on a later turn |
| Custard Cup | 10 | kept to the end of the game (below) |

## Play
- 2 to 5 diners, 3 rounds. Hand size: 10 with 2, 9 with 3, 8 with 4, 7 with 5.
- Every turn all diners secretly pick one card from their hand, reveal together, then every hand passes one seat to the
  left. Always left, in every round.
- When the hands are empty the round is scored; everything except Custard Cups is discarded and a new hand is dealt
  from the deck (never reshuffled).
- Roll race (per round): add the icons on your table. Most icons scores 6, second most 3. A tie for most splits 6
  (rounded down) and nobody scores second. A tie for second splits 3 (rounded down). Zero icons never score.
- Twin Sticks: on a later turn you may take two cards from the hand you hold; the sticks then go back into that hand and
  pass on with it.
- Custard at the end of the game: most cups +6, fewest −6, ties split (rounded down). With 2 diners nobody loses points
  for fewest. If everyone has the same number, nobody scores.
- Winner: highest total; a tie goes to the diner with more Custard Cups.

## Confirmed vs. guessed
**Confirmed** (from the rules reference via `PLAN.md`, and checked in the engine by `rules-test.js` and the product audit):
deck counts and all scoring numbers above; hand sizes; pass direction; Fire Paste and nigiri; Twin Sticks returning to
the hand; roll-race ties; custard most / fewest and the 2-diner exception; custard tie-break for the win.

**Decided by us** (not spelled out in the reference we used; see `game/ENGINE-REPORT.md`):
1. Two cards taken with Twin Sticks are placed in the best order automatically (Fire Paste first, then the best nigiri),
   which is never worse for the player. The sticks may be one of the two cards taken.
2. A tie for fewest custard splits the 6-point loss with the size rounded down (two tied lose 3 each, three tied 2 each,
   four tied 1 each).
3. Custard Cups stay in the deck with 2 diners (only the penalty is dropped). Five diners use 105 of the 108 cards.
4. If the custard tie-break is also tied, the win is shared.

## Variants
None are implemented: the base deck in our reference has no optional rules.
