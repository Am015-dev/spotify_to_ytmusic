# Tutorial coverage: Shipwreck Isle (Chapter 0, `tutor.js`)

The tutorial is a staged two-day game of the Marooned scenario (Carpenter and Cook, fixed seed and decks, real engine, real AI-free day scenes).
25 steps in two chapters the player can leave and resume with Skip / reopen. Every step spotlights one element; action steps advance only
when the game reports that exact action; "Next" steps are plain explanations.
Proof: `rc/tutor-test.js` (clean run at 390x763 and 1440x860: taps every spotlight centre, `elementFromPoint` check, wrong-tap check, all 25 step ids seen).

Chapter 1 "Day 1" = steps goal .. daysum1. Chapter 2 "Day 2" = steps event .. end.
**Honest status (7 Nov 2026):** the tutorial ends with an end card after day 2, not on a real result screen. A full 12-day game does not fit
a tutorial; the win / lose result is only explained (step `end`), not played. Rules marked `[ ]` are NOT taught yet.

| Done | Rule | Step that teaches it |
|---|---|---|
| [x] | Goal of the scenario (signal fire + 15-wood pile, rescue ship) | goal |
| [x] | How you lose (a death, no rescue by day 12), shared life / food / wood | lose |
| [x] | The day in order (event, camp makes food and wood, plan, jobs, weather, night) | day |
| [x] | Castaways and pawns (2 each, one job per pawn), Friday helps | pawns |
| [x] | Plan: pick a place on the island for a pawn (glowing places) | explore |
| [x] | Dice or sure: one pawn rolls, two pawns never roll | dice, second |
| [x] | Explore, new land found, gather there later | explore, found |
| [x] | Arrange the camp: determination and morale | camp1, camp2 |
| [x] | Start the day, jobs play out one by one | go1, go2 |
| [x] | Night: eat 1 food each, no shelter = 1 wound each | night1, daysum1 |
| [x] | Wounds cost life, resting heals | daysum1 |
| [x] | Event card each morning, its effect | event |
| [x] | Threat slot: deal with it in time or it strikes | threat |
| [x] | Fog: +1 pawn needed, fogged camp makes nothing | fog |
| [x] | Build: shelter costs 2 wood, stops night wounds | build1, build2, night2 |
| [x] | Gather food (hills / fish), second pawn makes it sure | gather1, gather2 |
| [x] | Weather: clouds above the roof ruin food and wood | weather |
| [x] | Skills cost determination (Cook ignores a cloud) | skill |
| [x] | End of game: fire + 15 wood wins, a death or no rescue loses (explained) | end |
| [ ] | Playing a real result screen (win / lose) inside the tutorial | not covered: needs 10-12 days |
| [ ] | Morale arrows and the first player's determination each morning | only mentioned in camp2 |
| [ ] | Threat pushed off the left slot fires its effect | not covered |
| [ ] | Hunt (beasts, fights, weapon loss), Rest, Face a threat actions | not covered |
| [ ] | Distance: places two tiles from camp need +1 pawn | not covered |
| [ ] | Adventure cards, Mystery cards, discovery tokens, inventions, items | not covered |
| [ ] | Snow, heating, storm, hungry animals, healing at night, camp move, spoiling food | not covered |
| [ ] | Scenarios 2, 3, 6 special goals (crosses, Ada, children) | not covered |

Next work (in order): a third chapter that plays rounds 3-4 with a hunt and a distant place; a chapter 4 that ends on a won result with a
stacked fire + pile; both need new `tutDeal` stacking and new step ids in `tutor.js`.
