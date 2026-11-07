# Tutorial coverage: every rule, and where the coached game explains it

The tutorial is a COACHED FIRST GAME (Addendum 4): a real 3-round meal for three diners (you, Odile, Kofi) against the easy chefs, with free
choices from turn 1 (any legal move). Auntie Suzu (and Odile for rival moments) speak just in time: one bubble at a time, never blocking
input, dismissible with the x. There are no forced taps and no spotlight steps. A rule is explained the first time it becomes relevant;
rules that did not come up in this game are listed on the end card ("Things you will meet later"). Wording: `game/src/story.js` (`coach`).
`game/tutorial-end.js` plays the coached game at 390x763 and 1440x860 with random legal moves through the UI and asserts that every id below was
explained during play or listed on the end card. `window.GXCOACH = {running, explained:[ids], later:[ids], done}` exposes it for qa-bot.

| Rule | id | Trigger (when Suzu / Odile speak) |
|---|---|---|
| Goal, free pick, the custard bet (story) | intro | the first turn |
| Reveal together, hands pass on | pass | after the first pass (turn 2) |
| Crispy Prawn pair = 5 | pair, pair2 | you serve your first prawn; again at a pair |
| Fish Slice set of three = 10 | fish | your first Fish Slice |
| Steam Bun ladder | bun | your first bun |
| Roll race (most 6, second 3) | roll | the first roll served by anyone |
| Nigiri values | nigiri | the first nigiri served by anyone |
| Fire Paste triples the next nigiri | paste | paste in your hand or on your counter |
| Nigiri landing on paste | pasteNigiri | the first time a nigiri lands on a paste |
| Twin Sticks | sticks | sticks in your hand or on your counter |
| Custard cups kept to the end | custard | the first custard in a hand or on a counter |
| Rival moves worth learning | rival | the rival takes paste (Odile) / rolls (rival2) |
| Good and poor picks, one line why | good, poor | after your pick: +5 or more, or a clearly better dish was in the hand |
| Rounds 2 and 3 (new hand, custard carried) | rounds, round3 | the start of rounds 2 and 3 |
| Round scoring walked with your real numbers | walk, walk0..2 | after each round's count: sets, roll race, nigiri, totals |
| Roll-race tie | makiTie | when a tie happens (else the end card) |
| Custard at the end, fewest loses 6 with 3+ diners | custardEnd, penalty | at the end of the game, with the real cup counts |
| Custard tie | custardTie | when a tie for most or fewest happens (else the end card) |
| Equal totals: more cups wins | tieBreak | when it happens (else the end card) |

Ties cannot be forced without stacking the deck, so makiTie, custardTie and tieBreak usually appear on the end card ("Things you will meet later").
Not applicable to this game: empty market, can't-place, bonus tiles. Hand sizes for 2, 4 and 5 diners, hot-seat and online play: help drawer only.
