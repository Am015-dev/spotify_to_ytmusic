# Final Approach: tutorial coverage (W506, guided first landing)

The tutorial is a guided first landing: the last four rounds at Port Alder (3000 ft to the runway) on a 4-space strip with one plane on space 3.
Every step is one sentence of 12 words or fewer and one highlighted tap (the shell kit `gx-tutor.js`: only the glowing thing answers).
Dice and the co-pilot are scripted in `game/tut-plan.js`; `game/tut-sim.js` and `rules-test.js` prove the plan lands. After the last step
the end card offers "Play a real game" (a normal seven-round flight starts at once). There is no "learn later" list.
Code: `game/src/ui12.js` (`tutSteps`, `TUT_RULES`). Test: `node game/tutor-test.js` walks every step by touch at 390x844 and 375x667
and fails if a core rule step is missing or out of order, or any line is over 12 words.

| # | Rule taught | Tap | Line |
|---|---|---|---|
| 1 | Win or crash together, plan before the roll | Roll | We land or crash together. Plan now, then tap Roll. |
| 2 | Dice are secret, no talking numbers | your 4 | Dice are secret now. Never say numbers. Tap your 4. |
| 3 | Axis: the higher die tips the wings | Axis | Axis: the higher die tips the wings. Your 4 beats 3. |
| 4 | Alternate turns; Axis + Engines every round or crash | your 5 | Take turns. Fill Axis and Engines every round, or we crash. |
| 5 | Engines: sum vs blue/orange, approach track | Speed | Engines add up: 5 plus Ravi's 2 is 7. We move one. |
| 6 | Concentration earns coffee | Coffee | A spare die on Concentration earns a coffee token. |
| 7 | Gear 1-2/3-4/5-6 raises blue | Gear 1-2 | Gear needs 1-2, 3-4 or 5-6. Each raises blue. |
| 8 | Altitude drops each round | Roll | We drop 1000 feet each round. Reach the runway in time. |
| 9 | Collision crash, radio clears planes | Radio | Leaving a plane's space crashes. Radio 2 clears the next space. |
| 10-12 | Reroll token: both reroll chosen dice | Reroll, your 1, Reroll button | A reroll token lets us both roll again. Tap it. / Tap your 1 to roll it again. / Tap Reroll. Only the dice you picked change. |
| 13 | Spending coffee (+/-1) | minus | Spend coffee: tap minus to turn your 4 into 3. |
| 14 | Axis balance back to level; tilt 3 crashes | Axis | Your 3 under Ravi's 4 levels the wings. Tilt 3 crashes. |
| 15 | Engines again | Speed | Your 5 plus Ravi's 3 is 8: one space closer. |
| 16 | Flaps in order (co-pilot) | Gear 5-6 | Ravi's flaps go out in order. Your new 6 drops gear. |
| 17 | Must reach the airport | Roll | Last chance to reach the airport. Tap Roll. |
| 18 | Level wings | Axis | Match Ravi's 5 on Axis to keep the wings level. |
| 19 | Overshooting the airport crashes | Speed | Your 4 plus Ravi's 4 reaches the airport. Flying past crashes. |
| 20 | All gear down | Gear 3-4 | Your 3 drops the last gear. All three are down. |
| 21 | Brakes 2, 4, 6 in order | Brake 2 | Brakes take exactly 2, then 4, then 6, in order. |
| 22 | Landing round: plane stops | Roll | Landing round: the plane stops moving. Tap Roll. |
| 23 | Speed must be BELOW the brakes | Brake 4 | Brake 4 next. Landing speed must stay below the brakes. |
| 24 | Land level | Axis | Match Ravi's 3. We must land with level wings. |
| 25 | Landing speed = engine sum | Speed | Your 2 plus Ravi's 2 makes speed 4. |
| 26 | Brake 6 | Brake 6 | Brake 6 makes speed 4 safe. Last die, then we land. |
| 27 | Win: all five landing checks | Finish | Landed! Runway clear, gear, flaps, level wings, slow enough. |

Not in the guided landing (each is introduced in its Story chapter with its own intro scene): traffic die, corridor tabs, fuel, wind,
trainee, icy runway, the clock, crew cards, a die that fits nowhere.
