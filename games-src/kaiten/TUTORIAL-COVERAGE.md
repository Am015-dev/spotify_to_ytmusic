# Tutorial coverage: every rule, taught in order

The tutorial (Learn to play) is a STAGED first meal (W499): you and one chef, one round of 10 dishes dealt from a fixed script
(`game/src/ui11.js`, `tutDeal`). Every step is ONE sentence of 12 words or fewer and ONE glowing thing to tap. Pick steps move on when you
take the glowing dish; look steps move on when you tap the glowing seat, tray or belt. There are no Next buttons and no "learn later"
list: every core rule has its own step. The end card's "Play a real game" starts a real 3-round meal against two Easy chefs.
Wording: `game/src/story.js` (`tut`). `game/tut-walk.js` walks it by touch at 390x844 and 375x667, checks every id below appears in
order with at most 12 words, then plays the real game to the result by touch.

| # | id | Rule | Tap |
|--:|---|---|---|
| 1 | goal | Most points after three rounds wins | your seat |
| 2 | chef | The chef picks at the same time, same rules | chef's seat |
| 3 | pick1 | Take one dish a turn; picks are secret | Crispy Prawn |
| 4 | passed | Picks flip together, then hands pass on | the belt |
| 5 | pick2 | Prawn pair = 5 | Crispy Prawn |
| 6 | paste | Fire Paste triples the next nigiri | Fire Paste |
| 7 | nigiri | Moon 3 on paste = 9 | Moon Nigiri |
| 8 | nigiriVals | Nigiri alone: Sun 1, Sunset 2, Moon 3 | your paste tray |
| 9 | sticksTake | Twin Sticks: two dishes on a later turn | Twin Sticks |
| 10 | sticksUse | Use the sticks | your sticks |
| 11 | twinA | Fish Slice: three = 10, one or two = 0 | Fish Slice |
| 12 | twinB | Sticks go back into the passed hand | Fish Slice |
| 13 | fish3 | Third Fish Slice completes the set | Fish Slice |
| 14 | roll | Roll race: most 6, second 3 | 3-icon roll |
| 15 | bun | Steam Buns 1, 3, 6, 10, 15 | Steam Bun |
| 16 | custard | Custard stays to the end of the meal | Custard Cup |
| 17 | scoreSets | Sets scored with your real numbers | your counter |
| 18 | scoreRoll | Roll race result | your rolls |
| 19 | rollTie | Tie for most rolls splits 6, no second | your rolls |
| 20 | scoreNigiri | Nigiri on paste scored | your paste tray |
| 21 | scoreChef | Same rules for the chef; lone dish = 0 | chef's seat |
| 22 | clear | After a round all but custard is cleared | your counter |
| 23 | rounds | Three rounds, fresh hands each round | your seat |
| 24 | custardEnd | End: most cups +6 | custard shelf |
| 25 | penalty | 3+ diners: fewest cups -6 | custard shelf |
| 26 | custardTie | Custard ties split, rounded down | custard shelf |
| 27 | tieBreak | Equal totals: more cups wins | your seat |

Not taught (help drawer only): hand sizes for 3 to 5 diners, hot-seat and online play.
The older coached free game (`coachBegin`, `tutorial-end.js`) stays in the code but is no longer what Learn to play opens.
