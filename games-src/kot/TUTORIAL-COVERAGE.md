# Tutorial coverage: Crown City Smash (W386, 7 Nov 2026)

The tutorial is one complete guided game against the real computer players (3 monsters, scripted dice): setup to the 20-star win and the
result screen, in 4 chapters. Each step makes the player do the real action; **Skip** works at every step; progress is remembered, so a
player who leaves resumes later. Source: `tutor.js` (steps, dice script). Proof: `playable/tutorial.js` plays it from fresh storage at
390x763 and 1440x860, checks that nothing covers each spotlit target, that every step was shown and that the game reached its winner.

Chapters: **1** First turn (goal .. end1) · **2** Downtown (rivals .. yield) · **3** Outside the city (done3 .. end3) · **4** Finish (later .. result)

| Rule | Taught by (step id) | How |
|---|---|---|
| [x] Setup: 6 dice, 10 hearts, 0 stars, 0 energy | goal | spotlight on the score strip |
| [x] Goal: first to 20 stars | goal, win20, result | said, then played to the end |
| [x] Roll up to 3 times | keep, roll1, roll2, done1 | the player rolls three times |
| [x] Keep dice, reroll the rest | keep, roll1 | tap two 3s, roll the others |
| [x] Stop rolling early | done2 | SMASH after one roll |
| [x] Numbers: three of a kind scores its value, a pair scores nothing | third | pair note, then the third 3 |
| [x] Extra matching dice add 1 | later | four 3s = 3 + 1 |
| [x] Energy: 1 per bolt, saved between turns | energy, score1, end1 | keep two, see the total, end turn |
| [x] Hearts heal 1 each, never in Downtown | bonus, score2, score3 | wasted in Downtown, heals outside |
| [x] Claws from Downtown hit every rival | done2, score2 | player does it |
| [x] Claws from outside hit the monster in Downtown | done3, score3 | player does it |
| [x] Empty Downtown: you must move in, +1 star | score1 | seen after the first SMASH |
| [x] Start a turn in Downtown: +2 stars | bonus | seen at the start of turn 2 |
| [x] Stay or yield when hit in Downtown | stay, yield | player does both choices |
| [x] Power cards: read, buy with energy, permanent type | shop, buy | player buys one |
| [x] Sweep the three cards for 2 energy | sweep | player does it |
| [x] End turn, turns pass round the table | end1, end2, end3, rivals | the computers' turns are watched |
| [x] The 20-star check happens when you end your turn | win20 | player ends the turn at 20 |
| [x] Result screen: stars, K.O.s, best moment | result | the real result screen |
| [~] Last monster standing wins (K.O. at 0 hearts) | result | **told, not played** (no rival is knocked out in the script) |
| [~] Kept dice may be rerolled later | none | only in Help ("How a turn works") |
| [~] One-shot and "save for later" card types | buy | only the permanent type is bought; others are named in the card text |
| [ ] Harbor (5 or 6 monsters) | none | **not covered**: the tutorial is a 3-monster game |
| [ ] Tie / draw at the end | none | **not covered** |
| [ ] Omen die, Ouch faces, evolutions, Brainjack, curses, costumes, Tower, Berserk, extra turns | none | **not covered**: optional modes, switched on by the player (Help card per mode) |

Note: chapter 4 fast-forwards: "Some turns later you have 16 stars" is set by the tutorial so a short game can reach 20 (said on screen).
