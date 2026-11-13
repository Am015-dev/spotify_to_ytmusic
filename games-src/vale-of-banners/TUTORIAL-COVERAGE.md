# Vale of Banners - tutorial coverage (W505, guided first game)

The tutorial is a guided first game: a real 2-player game against the real easy AI (seed 77). Every step is one line of 12 words or fewer
plus one glowing tap (a game piece, a pop-up button, or Next on an info step). Before each of your turns the table is staged (dice, storage,
goods, stalls) so that step's rule comes up; the rival plays real turns in between. After the last step the end card offers
"Play a real game" (a normal 5-season game starts). No "learn later" list: every core rule is taught in the walk.
Steps live in `src/ui.js` (`tutSteps`, staging in `tutStage`). Proof: `node tut-walk.js` taps every step by touch at 390x844 and 375x667 and
by mouse at 1440x900, checks each target is on screen and uncovered, each line has 12 words or fewer, every rule below appears in this order,
the end card is reached and a real game starts. `SHOTS=1 node tut-walk.js` saves `playable-shots/gameplay/tut-N.png`.

| # | Rule | Step ids | Tap |
|---|---|---|---|
| 1 | Two dice, one action each | dice | Next |
| 2 | Goal: most points after five seasons | goal | Next |
| 3 | Take: die number = stall | take, take2 | stall tile, Take |
| 4 | Storage holds three | store | stored tile |
| 5 | Build: same colour, die number, touching your land | build | glowing space |
| 6 | Region scoring + season bonus | region | Next |
| 7 | End turn after both dice | end1 (again end2-end5) | End turn |
| 8 | Turn order by banner track | order | Next (after the rival's real turn) |
| 9 | White die puts goods on a stall | white | Next |
| 10 | Sell all goods of a number: 1 silver + 2 per crate | sell, sell2 | goods, Sell |
| 11 | Any die = 2 workers | workers | workers button |
| 12 | At most 3 kinds of goods | kinds | Next |
| 13 | A worker moves a die by 1 | bend, bend2 | stall tile, Take (1 worker) |
| 14 | 6 and 1 are neighbours | wrap | Next |
| 15 | Back lane: 2 silver, no die, once per turn | buy, buy2 | back-lane tile, Buy |
| 16 | Keep: one free action | keep, keep2, free | keep, space, Moot Hall |
| 17 | Buildings act once; no two alike per region | free2, bld | space, Next |
| 18 | Moot Hall builds one more tile | hall | stored sheep |
| 19 | Pasture scoring (same animals in the meadow) | pas, pas2 | space, Next |
| 20 | Lore bends a rule | lore, lore2 | lore tile, space |
| 21 | Barge: goods from one stall + move up the track | barge, barge2, barge3 | barge, space, crates |
| 22 | Full storage forces a discard | full, full2, discard, discard2 | stall tile, Take, tile, Throw away |
| 23 | Colour bonus (5 first, 2 second) | colour, colour2, colour3 | keep, space, Next |
| 24 | Season end: mines pay, stalls refill, crates stay | season, refill | Next |
| 25 | Final count: silver, goods, worker pairs | final | Next |
| 26 | Tie-break: more empty spaces | tie | Next |
