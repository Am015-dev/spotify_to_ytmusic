# Final Approach: rules coverage (found -> built), W425, 8 Nov 2026

Sources: `rules-notes.md` (sections 1 to 6) and `../rules-check/final-approach.md` (WRONG 0, MISSING 0, SIMPLIFIED 6). Every row was checked line by line
against `game/src/engine.js` and has a test in `game/rules-test.js` (74 pass, 0 fail). "UI" names where the player sees it.

| # | Rule (rules notes) | Built in (engine.js) | Test (rules-test.js) | UI |
|--:|---|---|---|---|
| 1 | Two seats, 4 hidden dice each, win or lose together | `newGame`, `stripView` | setup; hidden information | tracker shows dice left as tokens, partner's dice as "?" |
| 2 | Briefing talk, never dice; silence after the roll | `validMoves` (say only in `brief`, max 3 presets) | briefing: preset phrases | phrases only before Roll; coach says "plan aloud, never dice numbers" |
| 3 | Alternate one die each, first player from the altitude row | `nextTurn`, `altRow` | turns | tracker: "Your turn (Pilot)" / "Ravi's turn (Co-pilot)" |
| 4 | Colours: own spaces, grey for either | `fits` | colours | slot tooltip "Pilot: ..."; greyed with "Only the co-pilot can use ..." |
| 5 | Axis: tilt by the difference, cumulative, 3 = spin | `afterAxis` | axis (3 tests) | preview "Axis after: tilt 2 right (one more is a spin)" |
| 6 | Axis and engines mandatory each round | `endRound` | axis: mandatory; end of round | tracker + coach round 1; "Save a die for Axis and Engines" |
| 7 | Engines: sum vs blue (4) / orange (8) markers: 0/1/2 spaces | `afterEngines`, `advance` | engines (2 tests) | preview "Speed 7: advance 1 (to space 2)" |
| 8 | Gear lifts blue (to 7), flaps lift orange (to 12) | `applyEffect` | engines: markers | preview "Gear down: blue marker 4 -> 5" |
| 9 | Advance step by step: tab check, collision, step; overshoot; holding pattern | `advance` | approach (4 tests) | preview warns "past the airport: crash" |
| 10 | Crash short of the runway (last row not on the airport) | `endRound` | end of round | round-over card "Behind: n spaces to go" rating |
| 11 | Radio: pilot 1 space, co-pilot 2, count from the plane (1 = own space) | `applyEffect`, `removePlane` | radio (2 tests) | preview "Radio: clears the plane on space 3" |
| 12 | Gear 1-2 / 3-4 / 5-6 any order | `SLOT`, `fits` | values; landing gear | slot needs text; tutorial round 2 |
| 13 | Flaps 1-2, 2-3, 4-5, 5-6 strictly in order | `fits` | flaps | greyed "Flaps go in order: flap 1 first"; tutorial round 3 |
| 14 | Brakes exactly 2, 4, 6 in order; only the last round | `brakeVal`, `fits` | brakes; final round | preview "Brakes 2 -> 4: landing speed may be up to 4"; tutorial round 3 |
| 15 | Concentration: coffee token, max 3 | `applyEffect` | concentration | preview "Coffee: tokens 1 -> 2" |
| 16 | Coffee: each token +-1, no wrap, either player, carries over | `validMoves` (c), `performMove` | coffee (2 tests) | coffee stepper; coach "Spend 1 coffee to turn your 3 into a 4" |
| 17 | Reroll tokens (rows 6000/2000 or 6000), either seat, any time, both reroll | `startRound`, `pendMoves` | reroll (4 tests) | coach explains when held (tutorial round 2) |
| 18 | Altitude track: 7 rows, 7 rounds | `D.alt`, `endRound` | altitude | tracker "Round x of 7 · 3000 ft" |
| 19 | Last round: no move; speed <= brakes, brakes >= 2 | `afterEngines`, `landingChecks` | final round (2 tests) | preview "Landing speed 4 vs brakes 4: slow enough" |
| 20 | Landing: no planes, all gear+flaps, level, speed in brakes (+ trainee, ice) | `landingChecks`, `checklist` | landing (2 tests) | always-visible checklist; "Landing 3/5 met" in every preview; end card walks it with real numbers |
| 21 | Traffic die (2,3,3,4,4,5) once per icon on the space you stand on | `startRound` | traffic (2 tests) | Story chapter 7 |
| 22 | Corridor tabs | `advance` | tabs (2 tests) | Story chapter 9 |
| 23 | Fuel watch (20, die burns, 6 if unused, below 0 loses) | `applyEffect`, `endRound` | fuel watch | Story chapters 8, 10, 12, 13 |
| 24 | Fuel leak (burn difference + 1) | `afterEngines` | fuel leak | Quick game scenarios |
| 25 | Tail wind dial (20 positions, +3 start, table) | `afterAxis`, `windMod` | wind (3 tests) | Story chapter 14 |
| 26 | Trainee tokens (6, immediate placement, all used) | `pendMoves` (intern) | trainee (3 tests) | Story chapter 11 |
| 27 | Icy runway (columns 2,3,4,5, replaces brakes) | `applyEffect` (ice), `endRound` | icy runway (3 tests) | Quick game scenarios (red/black airports) |
| 28 | Against the clock (60 s) | ui timer + `endRound` | against the clock | Story chapter 15 |
| 29 | Six ability cards | `pendMoves`, `cleanAbil` | 6 ability tests | crew cards on the setup screen |
| 30 | A die with no legal place is thrown away (house rule) | `validMoves` (toss) | no legal place | coach "Nothing takes your 5: throw it away" |
| 31 | Scenarios: 21 over 11 airports in 4 bands | `D.scen`, `D.tracks` | data (4 tests) | Quick game picker |

Result: 31 of 31 rules found in the notes are built and tested. Nothing was missing in the engine; this round built the player-facing part
(what each slot needs, previews, tracker, round-over card, a tutorial that teaches round by round) and one new test (the coached flight lands).

## Campaign ladder (Story)
Ladder of rising difficulty, all at real airports: chapters 1-6 Port Alder one system at a time (axis -> engines -> radio -> gear and flaps -> brakes -> the full check ride),
then green airports 7-10 (river, fuel, the long left turn, a fuel logbook), yellow 11-14 (trainee, fuel in the bowl, storms, wind) and red 15 (fuel against the clock).
Black (heroic) scenarios and the icy runway are in Quick game only (unchanged this round; see "remaining" in the report).

## Tutorial (coached first flight, 4 rounds at Port Alder, easy 4-space strip, one plane on space 3)
Round 1 axis and engines (spare dice to coffee) -> round 2 radio and landing gear (and the reroll token) -> round 3 flaps and brakes -> round 4 the landing.
Each of your turns the coach says what to do and why in one line and points at the exact slot (gold ring) and die; any legal move is still allowed.
The end card walks the landing checklist with the real state; rules that did not come up are listed under "Things you will meet later".
Dice are fixed (`TUT_SCRIPT` in `game/src/ui12.js`); `game/tut-sim.js` and the rules test check that following the coach lands the plane.
