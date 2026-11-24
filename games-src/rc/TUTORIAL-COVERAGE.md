# Tutorial coverage: Shipwreck Isle (scenario lessons, `lessons.js`)

The dimming tutorial and the coached first game are retired. The tutorial is now a set of short GAMES on the shared scenario engine
(`shell/gx-scenario-tutor.js`, docs `shell/GXST.md`): each lesson stacks a tiny real island (one castaway, two pawns), gives ONE goal on a floating card
(drag, minimise, close; it never dims and never blocks a tap), judges the real game after the day has played out, and ends with a win (stars, the rule, one
line why) or a fail (one line why) and Retry. Hint bulb: nudge, then show (a ring, costs a star). Entry: `Lessons` button on the title ("More ways to play"),
in the top bar, in the menu and in the Story header. Last lesson is a real two-day game.
Proof: `node lessons-test.js` (turbo clock, real taps, 402x874 and 1366x768): every lesson solved, a wrong move fails with a message, Retry, hints, nothing under the
card, 0 JS errors. Contact sheets in `proof/lessons/`.

| Lesson | Rule it teaches | Wrong move that fails |
|---|---|---|
| 1 jobs | pawns do one job each; gather arrives after the jobs; production; each castaway eats 1 food at night, none = 2 wounds | gather wood, go hungry |
| 2 sure | a lone pawn rolls dice and can be hurt; two pawns on a job are sure; explore finds new land | split the pawns, both roll |
| 3 shelter | no shelter = a wound every night; a shelter costs wood; build action | skip the shelter |
| 4 roof | rain clouds above the roof spoil food and wood; roof level; weather phase | skip the roof |
| 5 hunt | hunt takes 2 pawns, no dice; weapon against beast strength; hunting grounds | skip the hunt, starve |
| 6 wreck | event and threat cards; wreckage on the threat track is claimed by a pawn | leave the crates |
| 7 signal | the goal: wood on the signal pile, one stage a day, ship comes by day 10 to 12 | leave the pile empty |
| 8 skill | determination pays for skills, once a round | never open the skills |
| 9 game | the whole day loop (plan, play out, night, morning), two real days | starve or no shelter |

Rule group (RULES-CHECKLIST.md section) -> lesson: Setup, Planning actions, Resolving actions, Action dice and tokens -> 1, 2; Gathering, Production phase -> 1;
Exploring -> 2; Building (shelter, roof, palisade, weapon) -> 3, 4; Hunting -> 5; Threat action, Event phase -> 6; Weather phase -> 4; Night phase -> 1, 3;
Morale phase, End of the game, Scenario 1 -> 7, 9; Characters, wounds and skills -> 8; Arranging the camp and resting, inventions, items, discovery tokens,
Friday and the Dog, the other scenarios, adventure and mystery cards -> met in lesson 9 (Friday is in the game) and listed in the rules and the card list;
they are reference, not rules a new player needs to finish a game.

Known engine quirk found while stacking lesson 5 (not changed here): with exactly ONE beast in the hunting grounds, planning a hunt with both pawns is refused
("no more beasts to hunt") because `targetWhy('hunt')` counts the act's own two pawns. Lesson 5 stacks two beasts.
