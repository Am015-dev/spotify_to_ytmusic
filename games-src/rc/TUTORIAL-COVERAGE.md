# Tutorial coverage: Shipwreck Isle

## Learn to play = the guided first game (`guide.js`, W493, default since 8 Nov)
A real Marooned game on the staged kind deal (`tutDeal`): one sentence of 12 words or fewer and ONE highlighted tap per step (a gold ring
dims everything else; only the ring, the bubble's Next and Skip answer). Day 1 teaches setup to night, day 2 the event card, threat,
gather, rest, a real hunt (one beast is seeded into the hunting deck) and the roof, day 3 tidying the camp. Then "Keep playing" turns it into a normal game (or New game). Scenes no step explains play
by themselves. `?coach=1` keeps the older coached game (below); the Story prologue still uses it.
Proof: `guide-test.js [WxH]` taps only the ring centre: every rule step appears, phase order, words <= 12, a wrong tap is ignored,
end card, Keep playing continues. PASS at 390x844 and 375x667 (50 of 52 steps shown; `one` and `sure` are skipped when the tap on
the place already planned the job). Shots: `playable-shots/w493/tut-*.png`.

| # | Day | Rule | Line |
|---|---|---|---|
| 1 | 1 | goal | Day 1 of 12. Light a fire and stack 15 wood. |
| 2 | 1 | death | Life left. If any castaway dies, everyone loses. |
| 3 | 1 | phases | Every day: event, morale, production, action, weather, night. |
| 4 | 1 | event | Day 1 has no event card. One comes each day after. |
| 5 | 1 | morale | Morale gives or takes determination ✊ each morning. |
| 6 | 1 | production | Production: the camp gives 1 food and 1 wood. |
| 7 | 1 | pawns | Each castaway has 2 pawns. Tap the Carpenter. |
| 8 | 1 | explore | Tap a glowing unknown place. One pawn there rolls dice. |
| 9 | 1 | dice | Explore. One pawn alone rolls the dice. |
| 10 | 1 | dice | Dice can fail, wound you, or start an adventure. |
| 11 | 1 | sure | Now tap the Carpenter’s second pawn. |
| 12 | 1 | sure | Tap the same place. Two pawns never roll: a sure success. |
| 13 | 1 | sure | Join in. Two pawns never roll: a sure success. |
| 14 | 1 | build | Tap the Cook. |
| 15 | 1 | build | Tap the camp. Building happens there. |
| 16 | 1 | shelter | Build a shelter for 2 wood. It stops night wounds. |
| 17 | 1 | invention | Tap the Cook’s second pawn. |
| 18 | 1 | invention | Tap the camp again. |
| 19 | 1 | invention | Inventions are tools. Make the Shovel; the beach allows it. |
| 20 | 1 | invention | Friday helps. Tap Friday. |
| 21 | 1 | invention | Tap the camp once more. |
| 22 | 1 | invention | Help with the Shovel, so it surely gets made. |
| 23 | 1 | action | Every pawn has a job. Tap Start day. |
| 24 | 1 | weather | Weather: each cloud above your roof ruins food and wood. |
| 25 | 1 | night | Night: each castaway eats 1 food, or takes 2 wounds. |
| 26 | 1 | night | No shelter? Everyone takes 1 wound sleeping outside. |
| 27 | 1 | wounds | Wounds use up life. Life at zero means death. |
| 28 | 2 | event | An event card. Its effect happens right now. |
| 29 | 2 | adventure | Its ? token: the next explore draws an adventure card. |
| 30 | 2 | threat | Then it waits as a threat. Deal with it, or it strikes. |
| 31 | 2 | morale | Morale: high morale gives determination, low takes it. |
| 32 | 2 | threat | Tap the Carpenter. |
| 33 | 2 | threat | Tap the camp. Threats are handled there. |
| 34 | 2 | threat | Dig a Drain with the Shovel. The threat is gone. |
| 35 | 2 | gather | Tap the Cook. |
| 36 | 2 | gather | Tap the land you found yesterday. |
| 37 | 2 | gather | Gather fish. Food and wood arrive after all jobs. |
| 38 | 2 | rest | Tap the Cook’s second pawn. |
| 39 | 2 | rest | Tap the camp. |
| 40 | 2 | rest | Rest heals 1 wound. |
| 41 | 2 | hunt | A beast was spotted. Tap the Carpenter’s second pawn. |
| 42 | 2 | hunt | Tap the camp. Hunts start there. |
| 43 | 2 | hunt | Hunt. Each point your weapon is short costs a wound. |
| 44 | 2 | hunt | A hunt needs 2 pawns. Tap Friday. |
| 45 | 2 | hunt | Tap the camp. |
| 46 | 2 | hunt | Join the hunt. No dice: weapon against strength. |
| 47 | 2 | action | Every pawn has a job. Tap Start day. |
| 48 | 2 | roof | Rain cloud, no roof: lose 1 food and 1 wood. |
| 49 | 3 | camp | Tap the Carpenter’s second pawn. |
| 50 | 3 | camp | Tap the camp. |
| 51 | 3 | camp | Tidy the camp: 2 determination and morale up. |
| 52 | 3 | real | That is every rule. Give the rest jobs and play on! |

## Older: the coached first game (`tutor.js` `COACH_RULES`, now behind `?coach=1`)

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

## R3 fix (8 Nov): a real roll and a real adventure card, by doing
Learn to play (guide.js) now has 59 steps over 3 days. Day 2's event card stays on screen while three steps point at it (event, its "?" token,
the threat it leaves). Day 3: the Carpenter explores alone (x1-x3), ✨ fills the other pawns' jobs (x4, keeps the placed ones), Start day, then
the `roll` step holds the first scene with real dice and `advc` holds the adventure card that the "?" token draws; `end` sits on the day 3 summary.
guide-test: 56/59 steps (one, sure and x3 are optional branches), 26/26 rules, at 390x844 and 375x667.
