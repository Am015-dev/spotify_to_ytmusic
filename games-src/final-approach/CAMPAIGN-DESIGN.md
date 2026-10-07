# Final Approach: story campaign "The Ninth Name"

## Flight school (chapters 1-6): one system at a time
Owner verdict, three times: too many systems at once. Story chapters 1-6 are now the tutorial, built on a **learning ladder** (`G.lad = 1..6` in
`game/src/engine.js`; chapter `setup.lad` in `campaign.json`). A new player's first Play, and the title's "Flight school", start chapter 1.
These are simplified variants; the real game (free Play, chapters 7 and later) is unchanged. Differences from the real rules, all only while `G.lad` is set:
- **No briefing, open dice.** The dice are rolled at once each round and both hands are face up (the computer sees yours too). No phrases.
- **Slots not in play are not drawn** (not in `G.keys`). A die with nowhere to go is set aside automatically (no "put it aside" step) in chapters 1-5.
- **No reroll tokens** in chapters 1-5 (altitude track `tu`); coffee and rerolls arrive in chapter 6.
- Tutorial airport strips (`tut-a`, `tut-b`) replace the real strips in chapters 1-5; chapter 6 is the real Port Alder strip (g1).

| Ch | Adds | Slots | Goal / simplification |
|---|---|---|---|
| 1 Keep it level | axis | ax0, ax1 | Land with the plane level. No engines, no track: the runway just grows round by round. |
| 2 Speed and the runway | engines, approach track | + en0, en1 | Reach the airport (5 empty spaces), then hold; speed at landing within automatic brakes of 6. Empty track: planes come with the radio in chapter 3. |
| 3 Clear the way | radio, planes | + ra0-ra2 | Two planes on a 6-space track; collisions end the flight. |
| 4 Wheels and flaps | gear, flaps | + lg0-2, fl0-3 | All gear and flaps down to land. Brakes still automatic at 6. |
| 5 Brakes | brakes | + br0-2 | Real brakes 2/4/6 in order, but the brakes start at 2 (first brake already set) so a newcomer can finish. |
| 6 The check ride (boss, Chief Pilot Voss) | coffee, rerolls | all (real Port Alder g1) | The real rules at Port Alder, still with open dice and no briefing. |

Each new system arrives with one coach bubble (`sys-axis`, `sys-engines`, `sys-radio`, `sys-gear`, `sys-brakes`, `sys-conc` in `ui10.js`) and its own 2-3 rules cards.
In every chapter the board shows the same two things: the **plane picture** (rear view: tilt = axis, gear and flaps drawn when set, runway grows as the airport
nears, planes ahead on the approach, speed against brakes) and the **landing checklist** (one icon per condition that applies, green tick or red cross; `FA.checklist`).
Win rates, two computer crews, 400 games (node game/lad-sim.js): see FIX notes in the final report; the co-pilot is `hard` (his sharpest) in all six.

The chapter list is now 15 (the shared kit suggests 9-10; `GXC.validate` only flags that count, the map handles 15): c1-c6 flight school (act 1), c7-c9 the old act 1
(Foxmere g2, Orrin g4, Seabright g3 boss), c10-c15 the old acts 2 and 3 (Bowlrock c12 is now an act-3 boss with the `tilted-start` twist).


Shelf id `approach` (games/index.html shelf entry; the in-game GX key is `fa`), so `campaign.json` uses `"game": "approach"`.

## Story
Captain Ines Marlow of Kestrel Air is on her captain's line check. Chief Pilot Hedda Voss grades the season. First Officer Ravi
Okoro (the computer crew mate) flies beside her. Each chapter is one airport on the Kestrel network. The prize at the end is
Cloudspire, a valley where "only eight pilots are cleared to land". Passing the check means being the ninth name on the list.
The opponent in every chapter is the airport and its conditions. Three towers have voices and act as the act bosses.

## Boss airports
| Act | Boss | Scenario | Personality |
|---|---|---|---|
| 1 Green Wings | Seabright Bay, Controller Teo Vance | g3 | Precise and dry. Wants the left turn flown exactly to the corridor tabs. It is the hardest green airport for computer crews (37-42%). |
| 2 Weather Gets a Vote | Bowlrock, Controller Gunnar Sted | y2 | A gruff mountain veteran. Five spaces, three tilt tabs and fuel to watch (8-10%). |
| 3 The List | Cloudspire, Controller Aurel Kade | r1 + twist | Keeper of the list. Narrow valley, kerosene and a 60-second clock every round. Boss rule: one extra plane on space 3. |

## Difficulty curve
- **Act 1** (c1-c4, `hints: true`): green airports, one idea per chapter. c1 is Port Alder (g1), which a computer crew lands 83-87% of the time, so a newcomer can win it. c2 teaches the radio and traffic, c3 fuel, and c4 the corridor tabs.
- **Act 2** (c5-c7, no hints): crew cards (Castlemoor g6). c6 is Foxmere in fog (y1) with the trainee, flown from the **Co-pilot seat** (`setup.role: 1`). Bowlrock (y2) is the boss.
- **Act 3** (c8-c10): Twin Spires (y6) opens the act at about 33%. Palmreach (y3) has the tail wind plus the `red-altitude` twist. Cloudspire (r1) is the final boss with `extra-plane`.
- **aiLevel is the co-pilot's skill, and here it runs opposite to difficulty.** The gauntlet table in game/TEST-RESULTS.md shows an `easy` co-pilot drops green landings from 51% to 17%. Because of that, the campaign never uses `easy`. Act 1 and the final boss use `hard` (Ravi at his sharpest). Acts 2 and 3 use `normal`. Every `easier` block uses `aiLevel: "hard"`, removes the twist and adds `spare-coffee`. The integrator must not use the default "one AI level down", because that would make the game harder.
- Stars use these metrics: `won`, `coffee` (tokens held at the end), `rerolls` (tokens held), `fuel`, `coffeeSpent`, `radio` (planes cleared), and `brakeMargin` (brake value minus landing speed).

## Twists menu (setup only; the rules engine is unchanged)
All twists are applied right after `FA.newGame` returns. The integrator calls it from the UI wrapper `newGame(mode, o)` in game/src/ui3.js.
| id | How |
|---|---|
| extra-plane | `G.planes[2] += param` (space 3, or the last space before the airport on short strips), capped so `FA.planesOnTrack(G) <= D.planeSupply`. |
| short-fuel | `G.pl.kero = D.keroStart - param` (only for kero/leak scenarios). |
| red-altitude | `G.alt = 'rb'`. Row 0 is the same on both sides, so the only effect is that the 2000 ft reroll never comes aboard (`startRound` reads `altRow(G)`). |
| held-reroll | `G.rrHand = Math.max(0, G.rrHand - param)`. The 6000 ft token stays in the box, and `rrReserve` already counts it as there. |
| tilted-start | `G.pl.axis = param` (±1; negative = toward the Pilot). |
| spare-coffee | Used by the easier offer only: `G.coffee = Math.min(D.coffeeMax, param)`. |

## Levers verified in code
- Scenario/airport choice: game/src/engine.js:newGame(o) takes `o.scenario`, `o.seed`, `o.abil` and `o.ai`. The scenario ids and their airports (`ap`) are in game/src/data.js `FA.DATA.scenarios` and `airports`.
- Seat and co-pilot level: game/src/ui3.js:newGame(mode, o) uses `cfg.role` and `cfg.level`, then sets `ai[1-role] = level`. game/src/ai.js:move(G, seat, level) accepts `easy`, `normal` and `hard`.
- Crew cards: game/src/engine.js:cleanAbil (at most `sc.ab`) and game/src/ui3.js:suggestAbil.
- Metrics come from these state fields:
  - `G.result.win`, `G.coffee`, `G.rrHand` and `G.pl.kero` (game/src/engine.js:newGame, endRound).
  - `G.used.coffeeSpend` (performMove).
  - `G.used.radioClear` (removePlane).
  - `brakeMargin = FA.brakeVal(G) - G.landSpeed`.
- Win check: `isWon: G => !!(G.result && G.result.win)`. Every landing lasts 7 rounds, so round count is not used for stars.
