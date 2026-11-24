# Shipwreck Isle: rules audit (W730, 24 Nov)

Full numbered rule list: `RULES-CHECKLIST.md` (277 rules in 26 groups: setup, event, morale, production, planning,
resolving, threat, hunting, building, gathering, exploring, camp/rest, dice, weather, night, characters, Friday/Dog,
items, discovery tokens, decks, end of game, scenarios 1/2/3/6). `node logic-test.js` asserts 274 of them on the real engine.

## Rules the engine did not implement
| rule | status |
|---|---|
| Random wreckage variant (first wreckage drawn from crates / sea chest / dinghy) | **added**: Hard island (or `newGame({wreck:'random'})`). Easy/Normal keep the crates. `engine.js` newGame |
| 1-2 player games limited to Carpenter, Cook, Explorer | kept relaxed on purpose (player choice); told in the rules window |
| Soldier not used in 1-2 player games (A16) | implemented (substituted) |
| Scenarios 4, 5, 7 and the bonus sheet (V36) | out of scope (own maps and rules); told in the rules window |

## Rules the player was never told (or not where they look)
| rule | fix |
|---|---|
| What wins and what loses (goal, last day, any death loses all) | **Rules window now opens with "Your goal": win, lose, every night.** The flag button on the board opens "Camp and goal": the scenario goal, progress now, day x of y, "if anyone dies, everyone loses" |
| Night: eat 1 food or 2 wounds; no shelter = 1 wound | rules window top block, camp window, lessons 1 and 3 |
| One pawn rolls dice, two pawns are sure | lesson 2 |
| Roof stops one cloud per level | camp window line, lesson 4 |
| Weapon vs beast strength | camp window line, lesson 5 |
| Signal pile: one stage a day | lesson 6, goal line |
| Determination pays for skills | lesson 7 |
| Wreckage floats away if ignored | rules window (Event phase); no longer its own lesson (8 lessons) |
