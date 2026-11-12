# Hollowbough: tutorial coverage (the guided first game, W509)

Learn to play is one guided short game (seed 4242, stacked deal in `tutStage`, `game/src/ui12.js`; text in `game/src/story.js`).
Every step is one sentence of 12 words or fewer and one highlighted tap. Wrong taps shake the bubble and do nothing.
"Look" steps (Haven, Journey, Inn, special events) are a tap on the real spot: the tap teaches, it does not place a worker.
The lesson is a short year (`G.tale`): it may end in Summer. Real games pass only in Autumn (rule 215).
At the end, "Play a real game" starts a real game against the computer at once. There is no "learn later" list.

| # | Step | Rule taught | Tap |
|---|---|---|---|
| 1 | goal | Most points when all have passed wins | Next |
| 2 | places | A turn is one action: worker, card or prepare | Next |
| 3 | twig | Exclusive place (one worker) | Twig Heap |
| 4 | stock | Goods pay for cards | Next |
| 5 | rival | Rival blocks an unshared place | Next |
| 6 | resin | Basic places | Resin Pool |
| 7 | hand | Card cost and points, hand limit 8 | Next |
| 8 | build | Play a card by paying its cost | Allotment |
| 9 | city | City limit 15, production on play | Next |
| 10 | prep | Prepare: workers return, +1, production | Prepare |
| 11 | spring | New season, worker count | Next |
| 12 | berry | Shared places | Berry Patch |
| 13 | toad | Meadow of 8, refills | Toad in the meadow |
| 14 | free | Critter free via its construction | Goodwife |
| 15 | event | Basic event: right cards, first claimer, 3 pts | Event |
| 16 | forest | Forest places give more | Forest place |
| 17 | prep2 | Prepare for Summer, +1 worker | Prepare |
| 18 | summer | Summer: take up to 2 meadow cards | Two meadow cards |
| 19 | haven | Haven: 2 cards for 1 good, shared | Haven |
| 20 | journey | Journey: Autumn only, discard for points | Journey |
| 21 | inn | Destination card in your city; rivals may use the Inn | Inn |
| 22 | special | Special events need two named cards | Special event |
| 23 | autumn | Autumn: +2 workers, production again | Next |
| 24 | pass | Pass ends your game (Autumn in real games) | Pass, Pass |
| 25 | score | Cards, tokens, events | Next |
| 26 | bonus | Purple bonus cards; tie-break most events | Next |
| 27 | end | Who won; a real game follows | Play a real game |

Proof: `game/learn-touch.js 390x844,375x667` walks it by touch taps, checks every step id above appears in this order,
every say is 12 words or fewer, wrong taps never advance, no "learn later" list, and that "Play a real game" starts a real game.
Shots: `playable-shots/gameplay/tut-1.png` .. `tut-28.png` (28 = end card).
