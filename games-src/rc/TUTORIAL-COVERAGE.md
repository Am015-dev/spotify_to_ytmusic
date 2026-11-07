# Tutorial coverage: Shipwreck Isle (the coached first game, `tutor.js` `COACH_RULES`)

The tutorial is a COACHED FIRST GAME (default since round 2; the 25-step spotlight tutorial is removed). A real Marooned game with free legal
moves from turn 1 on a stacked seed; the Cook speaks one dismissible bubble at a time when a rule first matters, comments on good and poor moves and on
what the island did (event card, weather), never blocks input. Fog and determination are forced to come up once from day 2. It ends (after fog, skill and
the "plan is ready" line were taught, from day 4) with a card that walks the goal rule by rule with the player's real numbers and lists "Things you'll
meet later"; buttons: Keep playing / Play a real game / Story (or Start chapter 1 when it runs as the Story prologue). A Skip tutorial pill is always on screen;
reopening a half-done tutorial offers the kit's restart / exit dialog. `window.GXCOACH = {running, explained:[ids], done}`.
Proof: `coach-test.js` (390x763 and 1440x860, free legal moves through the UI): 22 of 22 rule ids explained, move + rival lines, scoring walk, one bubble at a time,
GXCOACH.done; `coach-test.js <size> leave` (leave, resume, skip).

| Done | Rule | Coach id (first time it matters) |
|---|---|---|
| [x] | Goal: fire + 15 wood by day 12, a ship rescues you | goal |
| [x] | Pawns, one job each; roles | pawns |
| [x] | Dice vs sure (one pawn rolls, two never roll); a good pair | dice, sure |
| [x] | Explore, new land, the day's haul | explore, found |
| [x] | Build, shelter cost, gather, camp arrangement, determination | build, gather, camp |
| [x] | Plan check ("everyone has a job") and poor plans (no shelter, no food) | ready, noshelter, nofood |
| [x] | Production each morning | prod |
| [x] | Event card, threat slot (what the island did) | event, threat |
| [x] | Morale each morning | morning |
| [x] | Adventures, mysteries, beasts (risk) | fight |
| [x] | Weather: clouds above the roof (real cloud count) | weather |
| [x] | Night: eating, hunger, no shelter, wounds | night, wounds |
| [x] | Skills cost determination (forced to come up once) | skill |
| [x] | Fog: +1 pawn (forced once) | fog |
| [x] | Final scoring walked rule by rule with real numbers | the final card |
| [ ] | Hunting, resting, distance, inventions/items, snow/storms, night healing, moving camp, other scenarios | listed on the "Things you'll meet later" card, not played |

## Coached first game (addendum 4; flag `?coach=1`, OFF by default; code in `tutor.js` `COACH_RULES`)
A real game with free legal moves on the staged seed; the Cook speaks one dismissible bubble at a time when a rule first matters; no forced taps;
at the end a "Things you'll meet later" card (hunting, resting, distance, inventions, snow/storms, night healing, moving camp, other scenarios)
with the player's real day / food / wood. Test: `coach-test.js` (plays by tapping a pawn, a glowing place, the plan helper, Start day, Continue; asserts goal,
pawns, production, night explained, >= 10 rules, one bubble at a time, the end card). Result at 390x763: PASS, 19 of 20 rules explained in the played game
(prod goal pawns dice fight found weather event morning threat sure build night gather ready wounds explore camp + later card); `skill` and `fog` did not come up.
Not done: good/poor-move feedback lines beyond "ready", rival-move comments, and making it the default tutorial (the 25-step one stays until the owner chooses).
