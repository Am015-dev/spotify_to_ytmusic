# Final Approach: tutorial coverage (W392, coached first game, addendum 4)

The tutorial is a **coached first game**, the prologue of the story: check ride at Port Alder. Chief Pilot Voss (guide) flew five rounds; Captain Marlow (you) and
First Officer Ravi fly the last two while Inspector Pell doubts you on the radio. You play a real game with free choices from turn 1 (all legal moves allowed; the
dice are stacked via a fixed seed, the computer is the real one). Voss speaks just-in-time: one bubble at a time, never blocking input, dismissable (x). After each of
your placements a one-line "Your move: why" appears; Ravi's moves get the banner and caption. No forced spotlight steps at all (the Roll button simply glows).
Text: `campaign.json` > `tutorial.coach` (one line per rule), `tutorial.later`, `tutorial.endText`. Engine: `game/src/ui12.js` (`fcPoll`, `fcSay`, `fcEnd`).

At the end a card walks the landing check rule by rule with the real numbers (and the loss reason), then "Things you will meet later": every core rule that did
not come up in that game, plus the modules. `game/playable-test.js tutorial` plays the coached game through the UI with any legal move, at 390x763 and 1440x860,
and asserts: no more than one bubble at a time, bubbles never block input, at least 7 core rules explained in play, the later card holds every unexplained rule.
Latest runs: phone 12/13 explained in play (the missing one went to the later card), desktop 13/13.

## Rule checklist (trigger = the moment it is explained)
| Rule | Coach id | Trigger | Where |
|---|---|---|---|
| Win or lose together, plan aloud, silence after the roll | `intro` | game start (before the first roll) | in play |
| Hidden dice, blue / orange / grey spaces | `seats` | first placement phase | in play |
| Landing checklist (runway, gear and flaps, level, speed in brakes) | `goal` | first placement phase | in play |
| Take turns one die each; axis and engines mandatory | `turns` | first placement phase | in play |
| Axis: tilt by the difference, spin at 3 | `axis` | first axis die placed | in play |
| Radio and collisions with planes on the track | `radio` | a radio die placed, or my turn with planes ahead | in play |
| Engines: sum vs blue / orange markers, end on the airport | `engines` | first engine die placed | in play |
| Landing gear 1-2, 3-4, 5-6 | `gear` | a gear die placed | in play, else later card |
| Flaps in order (co-pilot) | `flaps` | a flap die placed | in play, else later card |
| Brakes 2, 4, 6 in order, last round only | `brakes` | a brake die placed or the last round starts | in play |
| Coffee tokens | `coffee` | a coffee die placed or a token held on my turn | in play |
| Reroll token, either seat | `reroll` | a reroll opens, or I hold a token | in play |
| Altitude falls each round, seven rounds | `rounds` | second round | in play |
| Last round: plane stops, speed within brakes | `final` | landing round starts | in play |
| Final scoring rule by rule, real numbers | final card | result | always |
| Reasons for Ravi's moves | banner + caption | every rival move | always |
| Traffic die, corridor tabs, fuel, wind, trainee, ice, clock, crew cards, hand-over, flip side, cross-check, die that fits nowhere | `tutorial.later` | end card | later card only (honest: not demonstrated) |

Limits: the game is the last two rounds (from 1000 ft with the gear, one flap and the 2 brake preset), not a seven-round game. A free-play loss is possible and is
explained on the end card with a "Try again". Modules are taught in Story chapters 7 to 15 (their intro scenes name the new rule).

Rules-check (games-src/rules-check/final-approach.md): WRONG 0, MISSING 0, SIMPLIFIED 6, now in Help > "House rules in this version". rules-test 73 pass, 0 fail.
