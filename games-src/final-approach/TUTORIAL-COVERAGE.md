# Final Approach: tutorial coverage (W425, coached first flight, 4 rounds)

The tutorial is a **coached first flight**, the prologue of the story: check ride at Port Alder, the last four rounds (3000 ft to the runway) on an easy
4-space strip with one plane on space 3. Each round brings one system: 1 axis and engines (spare dice to coffee), 2 radio and landing gear (and the
reroll token), 3 flaps and brakes, 4 the landing. The computer co-pilot sticks to the same systems. On each of your turns ONE bubble says what to do
and why ("Put your 3 on Axis (green ring). The Axis goes first: a middle value leaves the most room.") and a green ring marks the slot and a dashed
ring the die; pick another die and the advice follows it. Every legal move stays allowed; the preview line shows what the die would do before you
drop it. A new rule is said the first time it matters (on the co-pilot's turns or the briefing, at least 4.5 s before the next instruction).
After each round a card says why it ended, what changed and rates it. The end card walks the landing checklist with the real state; rules that did
not come up are listed under "Things you will meet later". Text: `campaign.json` > `tutorial.rounds`, `tutorial.coach`, `tutorial.later`.
Code: `game/src/ui12.js` (`tutAdvise`, `fcPoll`, `fcLine`, `fcEnd`), dice `TUT_SCRIPT` (checked by `game/tut-sim.js` and rules-test: following the coach lands).

## Rule checklist (trigger = the moment it is explained)
| Rule | Coach id | Trigger | Where |
|---|---|---|---|
| Win or lose together, plan aloud, silence after the roll | `intro` | game start (before the first roll) | in play |
| Hidden dice, blue / orange / grey spaces | `seats` | first placement phase | in play |
| Landing checklist (runway, gear and flaps, level, speed in brakes) | `goal` | first placement phase | in play |
| Take turns one die each; axis and engines mandatory | `turns` | first placement phase | in play |
| Axis: tilt by the difference, spin at 3 | `axis` | first axis die placed | in play |
| Radio and collisions with planes on the track | `radio` | round 2 (or a radio die placed) | in play |
| Engines: sum vs blue / orange markers, end on the airport | `engines` | first engine die placed | in play |
| Landing gear 1-2, 3-4, 5-6 | `gear` | round 2 (or a gear die placed) | in play |
| Flaps in order (co-pilot) | `flaps` | round 3 (or a flap die placed) | in play |
| Brakes 2, 4, 6 in order, last round only | `brakes` | a brake die placed or the last round starts | in play |
| Coffee tokens | `coffee` | a coffee die placed or a token held on my turn | in play |
| Reroll token, either seat | `reroll` | a reroll opens, or I hold a token | in play |
| Altitude falls each round (four rounds here, seven in a full game) | `rounds` | round 2 | in play |
| Last round: plane stops, speed within brakes | `final` | landing round starts | in play |
| Final scoring rule by rule, real numbers | final card | result | always |
| Reasons for Ravi's moves | banner + caption | every rival move | always |
| Traffic die, corridor tabs, fuel, wind, trainee, ice, clock, crew cards, hand-over, flip side, cross-check, die that fits nowhere | `tutorial.later` | end card | later card only (honest: not demonstrated) |

Limits: four rounds, not seven; the modules are taught in Story chapters 7 to 15 (their intro scenes name the new rule). A free-play loss is possible and is explained on the end card with "Try again".

## Three modes (Addendum 7)
- **Learn to play** (title button "New here? Learn"): the coached flight above. The only place with coach bubbles, pointing rings and previews by default.
- **Play** (Play / Quick game, the default): clean screen. Board, dice tray, turn tracker (round x of y, altitude, whose turn, dice left), the landing
  checklist line, one instruction line, the top bar. A one-card Goal before turn 1 (phones: a card over the board that closes on Got it or Roll; wide:
  on top of the flight story card). After each placement a short chip says what it did. The round-over card says why the round ended and what changed
  (no rating). No coach bubbles, no ghost finger, no floating toasts (a refused tap puts its reason on the one line). Every "why" is on tap: the checklist
  strip opens the full checklist, a refused space says why on the line, the drawers hold the log and rules. Story no longer forces the coached flight.
- **Hints** (the bulb in the top bar, off by default): previews on each glowing slot and in the dock, the good/okay/poor line on the round-over card,
  the ghost finger, and a "What should I do?" button on your turn that rings the suggested slot and die and says why.
Check: `game/shoot-play.js <png> 390x763` plays a Quick game to the first own turn and fails if a bubble, preview, toast, ghost or card is on screen.
