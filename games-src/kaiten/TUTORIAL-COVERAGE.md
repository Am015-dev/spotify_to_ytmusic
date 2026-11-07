# Tutorial coverage: every rule, and the step that teaches it

The tutorial is the prologue of the story: one real, short game (fixed deal, one round) against the real chef Odile, played from the first
pick to the final scoring and result, in four chapters (c1 to c4 below). Each step: a story reason from Auntie Suzu, the player does the real
action, Suzu reacts. Step wording: `game/src/story.js` (`tut`, `chapters`). `tutorial-end.js` plays it to the end at 390x763 and 1440x860
and asserts that every step id in this table was shown.

| Done | Rule | Step id (chapter) | Story beat |
|---|---|---|---|
| [x] | Goal: most points wins; a meal is three rounds; a tie goes to more Custard Cups | c1, goal, end (c1, c4) | "Staff lunch! Odile bet a custard you can't beat her." / "You win 37 to 16! Real meals last 3 rounds. Ties go to more custard." |
| [x] | The computer chef plays by the same rules | chef, scoreChef (c1, c4) | "Odile bet a custard against you. She plays by the same rules." |
| [x] | Each turn take ONE dish, everyone picks at the same time | belt, pick1 (c1) | "You get a hand of plates. Take one, pass the rest to Odile." |
| [x] | Covers lift and plates land together; the hand passes on (you get the chef's leftovers) | passed (c1) + the one-by-one reveal captions and the "Hands pass" line | "Odile's leftovers are yours now. Plates rode the belt over." |
| [x] | Crispy Prawn: a pair scores 5, a lone one scores 0 | pick2, scoreSets (c1, c4) | "A second prawn makes a pair: 5 points!" / "A pair! Prawns are happy." |
| [x] | Fire Paste: triples the next nigiri; scores 0 if none comes | paste (c2) | "Hot paste triples the next nigiri. Take it first." |
| [x] | Nigiri (Sun 1, Sunset 2, Moon 3) and the triple on paste | nigiri, scoreNigiri (c2, c4) | "The Moon Nigiri lands on the paste: 3 becomes 9!" / "Nine points from one plate!" |
| [x] | Twin Sticks: stay on the table, take two dishes on a later turn, then go back into the hand you pass | sticksTake, sticksUse, twinA, twinB (c2) | "Time for a double helping." / "Two plates this turn. Odile is nervous." |
| [x] | Fish Slice: a set of three scores 10, one or two score 0 | twinA, twinB, fish3, scoreSets (c2, c3, c4) | "Three Fish Slices: 10 points. Find the third." / "A full set. 10 points!" |
| [x] | Seaweed Roll race: most icons 6, second most 3 | roll, scoreRoll (c3, c4) | "Rolls race for icons. Most icons wins 6." / "Three icons! Odile has one." |
| [x] | Steam Bun ladder 1 / 3 / 6 / 10 / 15 | bun, scoreSets (c3, c4) | "Each bun is worth more than the last: 1, 3, 6, 10, 15." |
| [x] | Custard Cup: kept to the end of the game; most +6, fewest -6 (not with two diners) | custard, scoreCustard (c3, c4) | "Custard pays at the end of the game. Most cups gets 6." |
| [x] | Round-end scoring of every counter, the rival's too | c4, scoreSets .. scoreChef | "Lunch is over. Now the counters are counted aloud." |
| [x] | End of the meal and the result screen | end (c4), end card "You know the rules" | "Odile owes you a custard." |

## Not taught by doing (honest list)
- [ ] Roll-race ties (split, rounded down) and custard ties: only stated in the help drawer, not staged (the fixed deal has no tie).
- [ ] The fewest-custard penalty with three or more diners: the tutorial has two diners; the help drawer and `scoreCustard` text state it.
- [ ] Rounds two and three (new hand dealt, custard carried over): the tutorial is one round; the first real game shows it.
- [ ] Hand sizes for 3 to 5 diners, hot-seat and online play: help drawer only.
- Not applicable to this game: empty market, can't-place, bonus tiles.
