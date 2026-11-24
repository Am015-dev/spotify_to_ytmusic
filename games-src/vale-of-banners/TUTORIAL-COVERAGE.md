# Vale of Banners - tutorial coverage (scenario lessons)

The old dimming guided first game is retired. Learn to play (title, Menu, Rules) and the top-bar `Lessons` button open 10 scenario lessons
(`src/lessons.js`, engine `shell/gx-scenario-tutor.js`, spec `orch/TUTORIAL-SPEC.md`). Each lesson stacks a tiny real table with ONE goal on a
floating card (drag, minimise, close; never dims or blocks taps), win/fail with a one-line why, stars, Restart, hint bulb (nudge, then show).
Test: `node vale-of-banners/tools/lessons-test.js` (402x874 and 1366x768, machine speed, ~16 s each). Proof: `proof/lessons-*-sheet.jpg`.

| # | Lesson id | Rule taught | Wrong move that fails |
|---|---|---|---|
| 1 | take | a die takes from the stall with its number; storage | take the Barge with the 2 |
| 2 | build | colour + touching your land + die number | spend both dice without building |
| 3 | region | a full region scores at once (a lone Mine space) | build the Tower first: 4 points |
| 4 | pasture | animals of one kind in one meadow add up | place the Goats: 3 points |
| 5 | sell | every goods tile of a number sells together, 2 points + silver | sell the single Wool |
| 6 | bend | workers bend a die by 1, 6 wraps to 1; 2 workers for a die | take the exact-match Mine |
| 7 | lane | back lane: silver, no die | spend a die |
| 8 | hall | Moot Hall: free second build at any number | spend both dice on one build |
| 9 | barge | Barge loads one stall's goods, moves you up the track | spend both dice without a Barge |
| 10 | game | a short real season: score 13 points | play only workers and End turn |

Not taught (gaps): Keep free action, Lore tiles, colour-complete bonus, storage overflow (discard), tie-break, white-die crate drop,
mine income detail, 3-4 player and team games. They stay in the Rules drawer and the Quick game coach.
