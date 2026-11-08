# Learn to play: can a player who follows ✨ Suggest win? (W481, 8 Nov 2026)

Gate asked: 27/30 Learn games won by following Suggest. **Not met: 0/30 today.** Nothing in the game changed; this adds a test mode and the findings.

## Test tools added to adv-test.js
- `node adv-test.js 30 learn`: the real Learn setup (tutorial deal from tutor.js tutDeal, easy, Carpenter + Cook + Friday), seed varied per game.
- `LOPT='{"dog":true}'` merges newGame options; `LPOST='js'` runs after setup (try a Learn setup without editing code).
- `TRACE=<game>` prints each day: wounds, food, wood, roof, morale, pile, the plan, the log. `PRIO=1` adds the priority list. `END=1` prints pile/fire/cause at the end.

## Numbers (30 games, wins)
| Setup | wins | avg day of end |
|---|---|---|
| Play, marooned (baseline) | 0 | 8.0 |
| Learn as shipped | 0 | 6.4 |
| Learn + dog, or + 2 items | 0 | 6.1-6.7 |
| Learn + shelter, roof 3, pal 2, weapon 3, food 3, wood 4, no book events | 1 | 10.0 |
| same + pile early (diff below) | 2 | 9.0 |
| Learn, no weather at all, no book events, food 3, wood 3, mountains tile 2nd | 5 | 10.2 |
The computer's own planner (gauntlet) wins 3% on marooned (rules-notes.md), so Suggest is not worse than the AI.

## Why games are lost
1. Hunger is the top killer even with no weather: 2 food a night, each gather gives 1, so 2-4 of 5 pawns go to food every day.
   Suggest fills "Find food" again and again and never builds the roof; then the rain ruins the food it gathered.
2. The signal-pile priority has no action, so Suggest skips it; the AI only starts the pile on day 5 with zero slack (5 stages, one a day).
   Pile wood is safe from the rain, so starting on day 2 is better (tried: pile reaches 8-15, but the wood then misses the cold nights).
3. Wounds lower morale (arrows on the life track), morale -3 costs 3 determination or wounds every morning: a death spiral by day 5-7.
4. Mountains (needed for Fire) come 6th-7th in the Learn tile order [4,10,6,1,3,2,5,...]; tile 5 (mountains, parrot + wood) 2nd helps.

## Tried and dropped (notes/W481-advisor-tries.diff)
Roof above food when clouds come today (w97), morale -2 or lower at w96, pile spare wood every day with a reserve for shelter/roof/snow.
No change in wins (Play 0, Learn 0), so not shipped.

## What would reach 27/30 (next worker, Opus: cross-system)
- The planner needs a lookahead, not more weights: simulate tonight (food, weather, roof, morale arrows) for 3-4 candidate plans and pick the one with
  the fewest wounds, with a pile schedule (stage by day 6 at the latest) and a wood reserve for snow nights. ai.js already has a plan scorer (line ~150).
- A Learn-only island is also needed: weather table for Learn (needs a small `wxDice(r)` hook used by phases.js FN.weather, advisor, ai.js, ui.js,
  flow.js, story.js, sound.js, moves.js stormglass), the mountains tile 2nd, no book events, food 3 and wood 3 at the start.
  Even all of that gives 5/30 with today's Suggest, so the planner work comes first.
