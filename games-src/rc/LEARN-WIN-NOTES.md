# Learn to play: can a player who follows ✨ Suggest win? (W481, 8 Nov 2026)

Gate asked: 27/30 Learn games won by following Suggest. **Round 2 (lookahead + Learn deal): 29/30** (other seed sets: 29, 29, 27). Play: 0/30 before and after.

## What changed in round 2
- ✨ Suggest looks ahead in Learn (advisor.js lookSuggest): 6 priorities-first plans + the greedy plan + 3 computer plans, each with 0 / half / all
  spare wood on the signal pile, played to the next morning 4 times on reshuffled decks with the real engine on a copy. Score = the computer's
  stateScore + low-life penalty + pile schedule (all 5 stages by day 12, keep 3 days slack) + Fire deadline, and most inventions count less (wood is
  the bottleneck). Seeded per day, so the same position gives the same advice. Old Suggest on the new Learn deal: 5/30.
- Learn deal (tutor.js tutDeal, Learn only): food 3 and wood 3 at the start, mountains tile 2nd, the 14 mildest event cards (Chill Rain still day 2),
  weakest beasts first, no weather dice (G.wxT={}; engine wxTab() reads it, Play/Story use the scenario table unchanged).
- Play keeps the priority-list Suggest: the lookahead also wins 0/30 there and the games end earlier (day 7.4 vs 7.9). Faithful marooned is very hard.

---
Round 1 (below): 0/30, nothing in the game changed.

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
