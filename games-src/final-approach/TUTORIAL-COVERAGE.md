# Final Approach: tutorial coverage (W392)

The tutorial is the prologue of the story: **Check ride at Port Alder**. Chief Pilot Voss (guide) has flown five rounds; Captain Marlow (you) and First Officer Ravi
fly the last two while Inspector Pell (the doubter) listens on the radio. It is a real game played against the real engine, from the 1000 ft row to the landing
result, in three chapters (leave and resume works: progress is kept per step). Text lives in `campaign.json` > `tutorial` (chapter beats, step lines, reactions, end card).
Proof: `game/playable-test.js tutorial` plays all of it by taps at 390x763 and 1440x860 and asserts every id below was shown (26/26) and the end card appears.

Honest limit: the staged flight starts at row 5 (1000 ft) with gear, one flap and the 2-brake already set (the story says Voss flew the first five rounds). A
full seven-round tutorial game was not built in the time box. Modules are taught one at a time in Story chapters 7 to 15 (their intro scenes name the new rule).

## Chapters and story beats
| Chapter | Opens with (guide beat) | Payoff beat |
|---|---|---|
| 1 Your first turn (`ch1`) | Voss: "Check ride, Captain. Inspector Pell is on the radio. He says two pilots can't land blind." | After the axis: "The wings answer you. First turn flown!" |
| 2 Clear the way (`ch2`) | Ravi: "Pell has parked a plane on our runway path. Radio and engines will move us past it." | After radio, engines, coffee: "Path clear. Pell goes quiet." / "She moves!" / "Coffee earned." |
| 3 Landing day (`ch3`) | Voss: "Last round. Every light must go green. Wheels, flaps, wings, brakes: all of it." | Climax at `landed`: "Pell: '...Passed.' Green Wings is open." then the end card |

## Rule checklist
| Rule | Taught by step (story reason, reaction) | Status |
|---|---|---|
| Win or lose together, one plane, two seats | `plane` (Pell's bet) | [x] |
| Landing checklist: runway clear, gear and flaps down, level, speed within brakes | `goal` (Pell's four lights), seen again at `landed` | [x] |
| Hidden dice, pilot blue / co-pilot orange | `seats` | [x] |
| Whose spaces (blue, orange, grey shared) | `owners` | [x] |
| Round flow: roll, take turns one die each, axis and engines mandatory | `rounds`, `roll` ("Plan out loud, never dice numbers") | [x] |
| Silence after the roll | `roll` reaction "Silence now. Trust him." | [x] |
| Alternating placement, rival's placement shown with reason | `axis1` (Ravi goes first, his die explained) + in play: banner and caption per step | [x] |
| Axis: tilt toward the higher die by the difference, cumulative | `axis2`, `axis3` | [x] |
| Tilt of 3 is a spin (loss) | `axis2` text | [x] seen, not forced |
| Engines: sum vs blue / orange markers, 0, 1 or 2 spaces | `engines`, `engines2` | [x] |
| Collision with a plane on the track | `radio` ("fly through it and we are gone") | [x] told, not forced |
| Radio: pilot 1, co-pilot 2, counts from the plane | `radio` (plane on space 2, your radio clears it) | [x] |
| Landing gear: 1-2, 3-4, 5-6 any order, raises blue marker | `gear` | [x] |
| Flaps: 1-2, 2-3, 4-5, 5-6 in order, raises orange marker (co-pilot's job) | `flaps` (seen, Ravi's side) | [x] seen |
| Brakes: exactly 2, 4, 6 in order, only count in the last round | `brake` | [x] |
| Last round: plane does not move, speed must fit the brakes | `roll2`, `engines2` | [x] |
| Coffee: a spare die earns a token; spend to change a die by one | `coffee` (earn), `cof` (spend) | [x] |
| Reroll token, either seat, rerolls unplaced dice | `rr1`, `rr2`, `rr3` | [x] |
| Altitude track, seven rounds, first player per row | `rounds`, the "Ravi first" strip is spotlit | [x] partly (last two rounds only) |
| End: win only when every light is green; otherwise crash | `landed` (all green) | [x] win only |
| Loss conditions in play (spin, missing axis/engine die, overshoot) | `axis2` (spin) only | [ ] not played, listed in Help > "You lose at once if" |
| Overshoot / holding pattern / reaching the airport early | not staged | [ ] not covered |
| Die with no legal space is thrown away | not staged (house rule, stated in Help) | [ ] not covered |
| Traffic die (busy sky) | Story ch 7 intro | [ ] not in tutorial |
| Corridor tabs | Story ch 9 intro | [ ] not in tutorial |
| Fuel watch / leak | Story ch 8 (and 10, 12, 13, 15) | [ ] not in tutorial |
| Wind dial | Story ch 14 | [ ] not in tutorial |
| Trainee tokens | Story ch 11 | [ ] not in tutorial |
| Icy runway | Story chapters with the icy scenarios (check the scenario list) | [ ] not in tutorial |
| Against the clock | Story ch 15 | [ ] not in tutorial |
| Ability cards, hand-over, flip side, cross-check | Story ch 10 (crew cards), Help | [ ] not in tutorial |

Rules-check (games-src/rules-check/final-approach.md): WRONG 0, MISSING 0, SIMPLIFIED 6. The six house rulings are now stated in the Help drawer under
"House rules in this version"; no engine change was needed, so no rules-test case was added (rules-test 73 pass, 0 fail).
