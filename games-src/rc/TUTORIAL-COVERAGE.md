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

## Story beats (Cook is the guide; prologue of the Story, see STORY.md)
| Step | Story reason (the Cook says) | Rule taught |
|---|---|---|
| goal | Our ship is gone; fire and 15 wood so a ship sees us | goal |
| lose | Hunger and wounds kill | how you lose |
| pawns | I cook and heal, Carpenter builds | pawns, roles |
| explore | What lies beside the camp? | explore |
| second | Don't gamble with our carpenter | dice vs sure |
| camp2 | Tidy up: everyone sleeps better | arrange camp, determination, morale |
| night1 / daysum1 | Ouch. Tomorrow we build a shelter, I promise | night, wounds |
| event / threat | Day two: a rain cloud rolls in; a danger at camp | event card, threat |
| build1 / build2 | Shelter first so nights stop hurting | build, shelter |
| gather1 / gather2 | We need food; fishing is best | gather |
| weather / skill | Not tonight! I wave off the rain cloud | weather, skill |
| night2 / end | Dry and safe; twelve days like this | night with shelter, ending |
