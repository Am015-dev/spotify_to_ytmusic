# Tutorial coverage: Crown City Smash (W500, 8 Nov 2026) - GUIDED FIRST GAME

Learn to play starts a guided first game (`tutor.js`, `tutStart` -> `tutStartScripted`): you, Squidrik and Shroomhulk, scripted dice, every rule in play
order, one sentence of 12 words or fewer and one highlighted tap (or Next) per step, played to a real 20-star win; the end card then starts a real game.
No "learn later" list. Proof: `node tut-walk.js 390 844` (and 375 667) taps every spotlit target by touch and checks each step's words, the TUT_RULES order,
the guided win and the real game after it. The coached free-play game (below) is no longer started.

| # | Rule (TUT_RULES) | Step | Sentence |
|---|---|---|---|
| 1 | 20 stars or last standing | goal | Win with 20 ★, or be the last monster standing. |
| 2 | keep dice | keep | Tap both 3s. Kept dice stay put when you roll. |
| 3 | three rolls | roll1 | You get three rolls. Tap Roll to throw the rest. |
| 4 | three of a kind, a pair scores nothing | third | Three 3s score 3 ★. A pair scores nothing. Keep it. |
| 5 | energy | energy | Each ⚡ is 1 energy for power cards. Keep both. |
| 6 | kept dice can be rerolled | rekeep | Kept dice can be rerolled too. Tap this ⚡ to free it. |
| 7 | resolve | roll2, done1 | One roll left. Tap Roll. / No rolls left. Tap SMASH! to use your dice. |
| 8 | empty Downtown: move in, +1 ★ | score1 | Downtown was empty, so you moved in: +1 ★. |
| 9 | buy a power card | shop, buy | Spend energy on power cards. Tap this card to read it. / Tap it again to buy. PERMANENT cards stay all game. |
| 10 | energy is saved, end turn | end1 | Unspent energy is saved. Tap End turn. |
| 11 | rivals; outside claws hit Downtown | rivals | Squidrik rolls too. Claws from outside hit Downtown: you. |
| 12 | stay | stay | Hit in Downtown: stay, or yield and leave. Tap Stay. |
| 13 | start in Downtown: +2 ★ | bonus | Starting your turn in Downtown pays +2 ★. |
| 14 | Downtown claws hit everyone; stop early | done2 | From Downtown, claws hit every rival. Stop early: tap SMASH! |
| 15 | 0 hearts: knocked out; no healing in Downtown | ko | Shroomhulk hit 0 ♥ and is out. No healing in Downtown. |
| 16 | sweep for 2 energy | sweep, end2 | Pay 2 ⚡ to swap all three cards. Tap Sweep. |
| 17 | yield | yield | Hit again. Yield: Squidrik takes Downtown. Tap Yield. |
| 18 | outside: hearts heal, claws hit Downtown | done3, end3 | Outside, hearts heal and claws hit Downtown. Tap SMASH! |
| 19 | extra matching die +1 ★ | later | Four 3s: 3 ★ plus 1 for the extra die. SMASH! |
| 20 | 20 ★ wins at the end of the turn | win20 | 20 ★! You win when your turn ends. Tap End turn. |
| 21 | how the game is won | result | First to 20 ★ or last standing wins. Now play for real. |

Not taught (not core in a 3-monster game): the Harbor (5-6 monsters only), card-specific powers (each card says what it does), the options in Customise.

---- older coached version (W386, no longer started) ----


The tutorial is a real game (you, Squidrik, Shroomhulk; fixed seed 5) with free choices from turn 1. No forced taps: Dot Inkwell, the Clarion's
reporter, speaks once per rule the first time it matters (`tut-story.js` COACH_TIPS, shown by `playable.js`), one bubble at a time, never blocking input,
dismissable with x; the first bubble has Skip tutorial. When the game ends the final card walks through the real numbers and lists "Things you'll meet later"
(any rule that did not come up, plus Harbor, ties, options, extra turns). Proof: `playable/coached.js` starts it from the title, plays random legal moves through the UI at
390x763 and 1440x860 and asserts every rule id below was explained or listed on the final card. The older scripted spotlight tutorial (steps below the table) is no longer started.

| Rule id | Explained when |
|---|---|
| setup, goal, roll3 | first roll of your first turn |
| faces | after the first roll (STAR / ENERGY / HEAL / HIT words on the dice) |
| keep, rekeep | when you may reroll |
| pair, triple | you hold two of a number |
| extra | four of a kind |
| energy / hearts / noheal / claws | the roll holds those dice (hearts in Downtown: no healing) |
| stop | one roll left |
| enter / start2 | you are in Downtown after a smash / start a turn there |
| cards, types, sweep, endturn | first buy step |
| rivals | a rival's first turn |
| yield | the Stay or yield question |
| ko, win20 | a monster is low on hearts / someone nears 20 stars |
| final | the result: real scores walked through, later-card |
| later (not played): harbor, tie, omen/expansions, extra turns | final card |

---- older scripted version (kept for reference) ----


The tutorial is one complete guided game against the real computer players (3 monsters, scripted dice): setup to the 20-star win and the
result screen, in 4 chapters. Each step makes the player do the real action; **Skip** works at every step; progress is remembered, so a
player who leaves resumes later. Source: `tutor.js` (steps, dice script). Proof: `playable/tutorial.js` plays it from fresh storage at
390x763 and 1440x860, checks that nothing covers each spotlit target, that every step was shown and that the game reached its winner.

Story: the tutorial is the prologue of the Story. Dot Inkwell (reporter) guides, Squidrik is the rival; every step has a story reason (`say`) and Dot reacts after the action (`react`); each chapter opens and closes with a beat card. All words: `tut-story.js`; arc and cast: `STORY.md`.

Chapters: **1** First turn (goal .. end1) · **2** Downtown (rivals .. yield) · **3** Outside the city (done3 .. end3) · **4** Finish (later .. result)

| Rule | Taught by (step id) | How (story beat in italics) |
|---|---|---|
| [x] Setup: 6 dice, 10 hearts, 0 stars, 0 energy | goal | spotlight on the score strip; *Dot: the Clarion wants a headline, Squidrik is after it too* |
| [x] Goal: first to 20 stars | goal, win20, result | said, then played to the end |
| [x] Roll up to 3 times | keep, roll1, roll2, done1 | the player rolls three times |
| [x] Keep dice, reroll the rest | keep, roll1 | tap two 3s, roll the others; *"Squidrik hates a pair"* |
| [x] Stop rolling early | done2 | SMASH after one roll |
| [x] Numbers: three of a kind scores its value, a pair scores nothing | third | pair note, then the third 3; *"A third 3! Stars in the bank"* |
| [x] Extra matching dice add 1 | later | four 3s = 3 + 1; *"Four 3s! Twenty in sight"* |
| [x] Energy: 1 per bolt, saved between turns | energy, score1, end1 | keep two, see the total, end turn |
| [x] Hearts heal 1 each, never in Downtown | bonus, score2, score3 | wasted in Downtown, heals outside |
| [x] Claws from Downtown hit every rival | done2, score2 | player does it |
| [x] Claws from outside hit the monster in Downtown | done3, score3 | player does it |
| [x] Empty Downtown: you must move in, +1 star | score1 | seen after the first SMASH |
| [x] Start a turn in Downtown: +2 stars | bonus | seen at the start of turn 2 |
| [x] Stay or yield when hit in Downtown | stay, yield | player does both choices; *"Stubborn, I like it" / "Smart retreat"* |
| [x] Power cards: read, buy with energy, permanent type | shop, buy | player buys one; *"Shiny! It's yours for good"* |
| [x] Sweep the three cards for 2 energy | sweep | player does it |
| [x] End turn, turns pass round the table | end1, end2, end3, rivals | the computers' turns are watched |
| [x] The 20-star check happens when you end your turn | win20 | player ends the turn at 20; *"Squidrik's face says it all"* |
| [x] Result screen: stars, K.O.s, best moment | result | the real result screen; *climax: "KING OF CROWN CITY!" beat* |
| [~] Last monster standing wins (K.O. at 0 hearts) | result | **told, not played** (no rival is knocked out in the script) |
| [~] Kept dice may be rerolled later | none | only in Help ("How a turn works") |
| [~] One-shot and "save for later" card types | buy | only the permanent type is bought; others are named in the card text |
| [ ] Harbor (5 or 6 monsters) | none | **not covered**: the tutorial is a 3-monster game |
| [ ] Tie / draw at the end | none | **not covered** |
| [ ] Omen die, Ouch faces, evolutions, Brainjack, curses, costumes, Tower, Berserk, extra turns | none | **not covered**: optional modes, switched on by the player (Help card per mode) |

Note: chapter 4 fast-forwards: "Some turns later you have 16 stars" is set by the tutorial so a short game can reach 20 (said on screen).
