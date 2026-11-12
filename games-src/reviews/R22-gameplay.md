# R22 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. I checked out each game's branch and merged origin/alex/brave-carson-rbpmlk into it
locally (not pushed), so the shared tap fix in shell/gx-tutor.js and gx-help.js is included. Each game was built with
`games-src/scripts/build-all.py --out /tmp/r22/<x> <slug>`, then again with `--full` for the phone-check gate. I served the build next
to its games/<slug>/ media and played with Playwright touch only (isMobile, hasTouch, `touchscreen.tap` at hit-tested centres) at
390x844 and 375x667, default settings, fresh storage. I checked the rules against the published rulebooks online (notes kept outside
the repo). Shots are in games-src/reviews/R22-shots/.

| Game | Total | Verdict | Gate (phone-check --full) | Lowest rows |
|---|---|---|---|---|
| cauldron-fair | 7.0 | FAIL | FAIL | 2 Tutorial 6, 5 Phone 6, 8 Bugs 6 |
| short-fuse | 7.4 | FAIL | FAIL | 6 AI/pacing 6 |
| nebula-aces | 5.9 | FAIL | FAIL | 6 AI/pacing 3, 4 Turn clarity 5; 2, 5, 8 at 6 |

---

## 1. cauldron-fair (shelf/W503-cauldron-gameplay @ 64f13fdb, merged with alex/brave-carson-rbpmlk locally)

Gate: `build-all.py --out /tmp/r22/cf cauldron-fair` builds and reports PASS, but only because it skips the phone-check. With `--full`
the phone-check **FAILS**: "skin changed box: button.btn.drawb 172x76->168x77, button.btn.stopb 183x76->187x77" at 375x553 (the other 5
layouts pass).

Played: I played by Playwright touch only (isMobile, hasTouch, `touchscreen.tap` at hit-tested centres, fresh storage, default
settings: 2 makers, easy, default speed). I did "New here? Learn in 5 minutes" to its end card 4 times: 390 with taps at +150 ms and
+300 ms after each bubble, and 375 with taps at +50 ms and +500 ms. Each run took 26 steps, 27 taps and 44-56 s, with **0 ignored
taps** in 104 step taps. Each run ended on "Now a real game / You know every rule". Then I played full 9-day games from "Play" to
the result card as a naive new player: draw until the whites reach the limit minus 2 (sometimes minus 3), buy the dearest 1-2
glowing chips, take coins after a boom before day 6, otherwise take the first choice.
- 375x667: **won 41-25**, 110 taps, about 146 s to the result.
- 390x844: **lost 29-30**, 103 taps, 145 s. A second 390 game also reached day 9, but the script went on into "Play again" before
  it read the scores.
- My tap to my next chance to act: median 1.2-1.3 s, max 3.6-4.3 s. 0 page errors, 0 console errors, 0 stuck states, no text under
  14 px.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | It matches the published rules: blind draw, whites over the limit explode and the last chip stays, the flask (once a day, not after a boom), rat tails for trailing players, a bonus die for the furthest safe pot, points or shop after a boom, 2 rubies for the droplet or the flask, yellow from day 2 and purple from day 3, the day-6 white, an empty bag stops you, and the last day (no shop, 5 coins or 2 rubies = 1 point, ties to the furthest pot). The Rules screen now covers green and black, the day-6 white and "If your bag runs empty, you stop." |
| 2 | Tutorial teaches | 6 | Better: 0 ignored taps (R17: 2-3 per run), the coach portrait no longer covers the titles, and "Hask" is gone ("New chips in your bag"). It has 26 one-line steps, 4 of them Next-only, then a real game. Still not every core rule: green and black chips are only read on a Next card ("Stalls say what chips do"), so their after-brew effects are never seen. The rat step shows a "+1" rat badge but never shows how the tails are counted from the score gap. |
| 3 | First 10 seconds | 8 | "Brew bold. Stop wise." The title leads with "New here? Learn in 5 minutes", then a 3-line goal card, then "YOUR TURN · Tap the bag". |
| 4 | Turn clarity | 7 | Fixed: the yellow choice now reads "Send a white back: Return the white chip to the bag?" (R17: "Kind cut"), and the ruby stall has words. Still: a fortune name shows 3 times at once (NOW chip, YOUR TURN bar, sheet title; R17 counted 4). The Wren Feather sheet shows the peeked chips as about 16 px icons. |
| 5 | Phone play | 6 | Fixed: the Day button is 60-62x44 (R17: 71x21), all controls are 44 px or more, and the coach portrait is clear of titles. **Not fixed** (the fixer said it was): at 375 the shop's bottom stall row is still half visible under the "N more stalls ▼" pill. Its glowing chips look tappable, but a tap lands on the stall wrapper (`stw`) and buys nothing, twice in one game (day 2 "1 8", day 9 "4 18"). Also at 375 the choice sheet still covers the lower half of the "ALL DAY Fortune" strip. |
| 6 | AI and pacing | 8 | A naive player won 41-25 and lost 29-30, so the default rival is beatable and close. The rival brews brisk, sensible pots. A game is about 2.5 min and about 105 taps. |
| 7 | Feel | 7 | Chips fly from the bag onto the spiral, the meter fills, rival pots read "finished/exploded", there is a bonus die, and the result card has painted art and a per-day table. A drawn chip still flies across the choice sheet over the first button ("Place none…"). The shop still reads like a form. |
| 8 | Bugs | 6 | 4 tutorials and 2 games to the result: 0 errors, 0 stuck states. But the in-game taps are not clean. Besides the 2 half-row shop taps, the first tap on a just-opened choice sheet did nothing 2-3 times per game ("Score 4 points", "1 Take a Cinder Moth", "Place none, put them all back"), and the second tap worked. The game ignores taps on a pop-up for 450 ms after it opens (ui5.js `UI.advAt … < 450`), with no feedback. That is not a stopper, but the rubric needs 0 dead taps. |
| | **Total** | **7.0** | **FAIL**: rows 2, 5 and 8 are below 7. No stopper. |

### Earlier findings (R17)
| R17 finding | Status | Evidence |
|---|---|---|
| Row 2/8: tutorial bag taps about 0.5 s after the bubble ignored | **Fixed**: 0 of 104 step taps ignored at +50, +150, +300 and +500 ms | games-src/reviews/R22-shots/cf-375-tut-draw-title-clear.jpg |
| Row 5: coach portrait covers the first letter of every tutorial title | **Fixed**: no title covered on any of the 26 steps at either size | cf-375-tut-draw-title-clear.jpg |
| Row 5: "Day N/9" button 71x21 | **Fixed**: 60-62x44 | cf-375-fortune-name-3x.jpg |
| Row 5/8: half-visible bottom shop row at 375 swallows taps | **Not fixed**: the row is still half shown under the pill, and taps hit `stw` | cf-375-shop-half-row-day3.jpg, cf-375-shop-half-row-day8.jpg |
| Row 4: yellow choice titled "Kind cut" | **Fixed**: "Send a white back" | cf-375-sheet-over-allday-strip.jpg |
| Row 2: "Hask added chips" | **Fixed**: "New chips in your bag" | step log |
| Row 1: Rules screen lacks the day-6 white and the empty-bag stop | **Fixed**: both are there, and green/black are explained | source check of the Rules text |
| Row 2: green and black only read, never done, in the tutorial | **Not fixed**: still one Next card | cf-375-tut-stalls-next-only.jpg |
| Row 2: rat-tail counting never shown | **Not fixed**: a "+1" badge, no counting | cf-375-tut-rat-no-count.jpg |
| Row 4: fortune name shown 4 times | **Partly fixed**: 3 times | cf-375-fortune-name-3x.jpg, cf-390-fortune-choice.jpg |
| Row 5: choice sheet over the NOW/ALL DAY strip | **Not fixed** at 375 (clear at 390) | cf-375-sheet-over-allday-strip.jpg |
| Row 7/5: chips fly over the choice buttons; tiny peek icons | **Not fixed** | cf-390-chip-over-button-tiny-peek.jpg |

### New findings
- Row 8. Did: tapped the first button of a new choice sheet (fortune or Wren Feather) about 0.4-0.6 s after it appeared. Happened: no reaction 2 times at 375 and 2-3 times at 390, and a second tap worked. The game drops taps for 450 ms after a pop-up opens, silently. Shot: cf-390-chip-over-button-tiny-peek.jpg (the Wren sheet at the moment of a dropped tap; a chip is still flying over "Place none").
- Row 5/8. Did: day-3 and day-8 shop at 375, tapped the glowing Sunroot / Scarlet Cap chips in the half-shown bottom row. Happened: elementFromPoint was the stall wrapper `stw`, and nothing was bought. Shots: cf-375-shop-half-row-day3.jpg, cf-375-shop-half-row-day8.jpg
- Gate. Did: `build-all.py --full`. Happened: the phone-check FAILS on "skin changed box" for Draw/Stop at 375x553; the default build-all run skips the check and says PASS.
- Row 6 (works). Did: 2 default games. Happened: won 41-25 at 375 and lost 29-30 at 390; the result card names the winner and lists the points per day. Shot: cf-390-result-lost-29-30.jpg
- Row 2 (works). Did: finished the tutorial. Happened: "Now a real game / You know every rule" with one "Play a real game" button. Shot: cf-390-tut-end.jpg

---

## 2. short-fuse (shelf/W488-short-fuse-sprites @ 5210b7e6, merged with alex/brave-carson-rbpmlk locally)

Played: "Learn to play" by touch to the end card 4 times (390 twice, 375 twice): 17 steps, 18 taps, 19-29 s, default speed. I tapped
the spotlit target or Next 150 ms or 500 ms after each bubble appeared (mixed): **0 ignored taps** in 68 step taps. Then "Play" from the
title (job 1, defaults: 3 crew, Normal, Hints on by default) and "Next job" / "Again" by touch, 6 chains (3 at 390, 3 at 375), 29 jobs
to their result cards. My player reads only the screen: takes a glowing solo cut, else taps each of its numbers and points at the crew
wire the Hints marks as sure, else the narrowest fitting range without a "!" (might be red). No speed-up, no code help.
- Jobs 1-2: won 9 of 12 first tries (3 fuse-outs at 375), every retry won. 19-34 s, 3-12 taps per job.
- Jobs 3-4: won 7 of 13 attempts (about half, as claimed). Of the 6 losses, **3 were a computer crewmate pointing at a red**
  ("Teal pointed at a red wire" at 46/51 and at 38/41, "Amber pointed at a red wire" at 18/41); 3 were the fuse.
- My last tap to my next turn (2 computer crewmates): median 3.2-4.2 s, max 5.2 s, i.e. about 2 s per crew turn (R18: 4.0-4.9 s).
0 page errors, 0 console errors, 0 stuck states, 0 dead taps in about 380 taps (plus a 30-tap random-glow probe: every tap answered).

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Checked again against the published rules: dual cut, solo cut (all remaining of a value, 2 or 4), yellow only matches yellow, pointing at a red = boom, a red-only hand reveals, miss = fuse step + info token on that wire, opening token from the foreman clockwise, foreman with 2 stands at 3 crew, 2 stands each at 2 crew, gear unlocks after 2 cuts of its number and works once, the twin probe's red-plus-other rule. House rules (no progress for four rounds explodes; a hand with no legal cut skips) are disclosed under "Kept simple" in Rules. |
| 2 | Tutorial teaches | 8 | Fixed: 17 one-line steps, only 5 Next-only (goal, mine, hit, wrongres, win; R18: 10 of 22). Token, dual cut, probe miss, Rewind, yellow, red and solo cut are all done by tapping, then "Play job 1". 0 dead taps at 150 ms and 500 ms. The step counter ("4/17") is 13 px. |
| 3 | First 10 seconds | 8 | One-line pitch, a big Play, "Learn to play · A guided first job"; the job card has the goal and a tip. |
| 4 | Turn clarity | 7 | "Your turn. A ! wire might be red.", ranges on every crew wire ("7-9", "1·3"), "Turn over: Plum cut 4 wires alone, no risk. Next: you.", Red at / Yellow at strip. But the red-wire loss card says "A red wire was cut. The fuse won this round. Read the tokens closer next time." when a computer crewmate cut it: it blames the player, names the wrong cause and never says who. At 375 the "Stand 2" tag sits on the "▾ more wires below" cue. |
| 5 | Phone play | 7 | Fixed: the 5 header icons are 44x44. Every wire 44 px or more in jobs 1-4 at both sizes, plates 44 px tall. Still: in job 4 at 375 the second crewmate's second row is hidden under the "▾ more wires below" cue and my plate, so the crew area scrolls on most turns; the Stand tags overlap the top edge of 2 wires each (job 3, both sizes). |
| 6 | AI and pacing | 6 | Pacing is fixed (about 2 s per crew turn, jobs 25-45 s) and a careful player wins jobs 3-4 about half the time. But in 3 of 13 job-3/4 attempts (3 of 29 jobs overall) a computer crewmate pointed at a red and blew the bomb, once at 46/51 with the job almost won. A loss the player could not prevent, in about 1 job in 4 from job 3, is not "the rival plays sensibly". |
| 7 | Feel | 7 | SNIP stamp, fuse burns along the rope, green validation ticks, "+4" pops, art-led DEFUSED / BOOM cards. |
| 8 | Bugs | 8 | 4 tutorials + 29 jobs: 0 errors, 0 stuck, 0 dead taps by my touch. The red-loss card text is wrong (row 4). The phone-check gate still reports dead taps (below), which I could not reproduce. |
| | **Total** | **7.4** | **FAIL**: row 6 is below 7. No stopper. |

Gate: build-all.py --full phone-check **FAIL**: "2 dead taps" at 390x763, 375x553 and 844x390, "5 dead taps" on the P>L, L>P and stale
layouts (taps on glowing wires with clue labels "1", "1·2", "1-3" changed nothing within 1 s). The plain build (no --full) skips the check.

### Earlier findings (R18)
| R18 finding | Status | Evidence |
|---|---|---|
| Row 6: jobs 3-4 lost 0 of 4 by a screen-reading player | **Fixed**: 7 of 13 won with Hints on (the default) | R22-shots/sf-375-j3-won.jpg |
| Row 6: 9 s waits with 5 crew, 4.0-4.9 s with 3 crew | **Fixed for 3 crew**: median 3.2-4.2 s, max 5.2 s (5 crew not re-run) | R22-shots/sf-375-j3-turn.jpg |
| Row 6: job 1 is 24-27 s, 8-9 taps | **Not changed** (19-29 s, 3-9 taps); acceptable now that the chain is winnable | R22-shots/sf-375-j3-won.jpg |
| Row 5: header icons 40x44 | **Fixed**: Job, Gear, Rules, bulb, Menu all 44x44 | R22-shots/sf-375-j3-turn.jpg |
| Row 4/5: "Stand 1" tag on the foreman's first wire row at 375 | **Not fixed**: Stand tags still touch the top of 2 wires; "Stand 2" now sits on the "more wires below" cue | R22-shots/sf-375-j3-turn.jpg |
| Row 2: 10 of 22 tutorial steps Next-only | **Fixed**: 5 of 17 | R22-shots/sf-390-tut-win.jpg |
| Row 2: red tap / automatic reveal | **Fixed enough**: "Tap your red: never say red or point at one." then the win step explains the reveal | R22-shots/sf-390-tut-win.jpg |
| Left open by the fixer: a computer crewmate sometimes points at a red | **Not fixed, and it decides games**: 3 of 29 jobs lost this way | R22-shots/sf-390-j4-ai-red-loss.jpg, sf-390-j3-ai-red-loss.jpg |

### New findings
- Row 6. Did: chained jobs 1-4 at 390 (careful policy, defaults). Happened: job 4 at 46/51 wires ended "Teal pointed at a red wire"; another chain lost job 3 at 38/41 the same way, and a third lost job 3 to "Amber pointed at a red wire" at 18/41. Shots: R22-shots/sf-390-j4-ai-red-loss.jpg, R22-shots/sf-390-j3-ai-red-loss.jpg
- Row 4. Did: read that loss card. Happened: "A red wire was cut / The fuse won this round. Read the tokens closer next time." It blames me and the fuse; it does not say Teal cut it. Shot: R22-shots/sf-390-j4-ai-red-loss.jpg
- Row 6. Did: tapped Again after that loss. Happened: the retry burned out in 5 turns at 4/51 ("3 misses"), with only 2 taps of mine. A 3-step fuse at 3 crew is by the rules, but the job is over before the player has done anything. Shot: R22-shots/sf-390-j4-fuse-5turns.jpg
- Row 5. Did: job 4 at 375. Happened: Plum's second row is hidden under the "▾ more wires below" cue and my plate; Teal's stand is above. Shot: R22-shots/sf-375-j4-turn.jpg
- Row 4/5. Did: job 3 at 375. Happened: "Stand 2" tag sits on the "▾ more wires below" cue; Stand 1 tag touches the first row. Shot: R22-shots/sf-375-j3-turn.jpg
- Row 5. Did: tutorial at 375. Happened: the coach bubble covers my whole hand on the "A miss" step (fine for a Next step), and on the "point" step it sits over Plum's plate. Shots: R22-shots/sf-375-tut-wrongres.jpg, R22-shots/sf-375-tut-point.jpg
- Row 2 (works). Did: tapped every tutorial target 150 ms after its bubble appeared. Happened: every tap counted (0 of 68 ignored), and the end card hands over to "Play job 1". Shot: R22-shots/sf-390-tut-end.jpg
- Row 3 (works). Did: opened the title fresh. Happened: pitch line, Play, Story, "Learn to play". Shot: R22-shots/sf-390-title.jpg

### Rules coverage
- Goal, lose on fuse or red: Rules + tutorial (goal, red).
- Stands sorted, hidden; 2 stands each at 2 crew, foreman 2 at 3 crew: Rules; tutorial (mine).
- Opening info token from the foreman clockwise: Rules + tutorial (token).
- Dual cut, hit, miss (fuse step + token on that wire): Rules + tutorial (point, name, hit, wrong1-wrongres).
- Solo cut (2 or 4, never 3): Rules + tutorial (solo).
- Yellow matches only yellow: Rules + tutorial (yellow1, yellow2).
- Red never named or pointed at; red-only hand reveals: Rules + tutorial (red, win).
- Gear unlocks after 2 cuts, once: Rules + tutorial (hit, gear).
- Twin probe once per job, red-plus-other rule: Rules + tutorial (probe; the red case only in Rules).
- Fuse length by crew size: Rules only.
- House rules (four rounds without progress explode; no legal cut skips): Rules, "Kept simple" (disclosed, not in the published game).

---

## 3. nebula-aces (shelf/W486-nebula-bench @ ce237f86, merged with alex/brave-carson-rbpmlk locally)

Played: built with build-all.py --full and served next to games/nebula-aces/{media,models,music}. Playwright touch only (isMobile,
hasTouch, `touchscreen.tap` at hit-tested centres), fresh storage, default settings. "New here? Learn in 5 minutes" to the "Drill done"
card at 390x844 and 375x667: 3 tutor bubbles, then the coached duel (2 rounds, won), then the flight drill (4 staged rounds), about 90 s
and about 40 taps per size; taps 150 ms and 500 ms after each tutor bubble: 0 ignored. Then 10 full games from "Launch" (the first
game: Kael vs two rivals, the default) to the DEFEAT card: 6 as a new player who always takes what the game suggests (the pre-selected
move, the finger, the "rec" action and target: 3 at 390, 3 at 375) and 4 mixing the suggestion with random green/white moves, two of
them opening with a K-turn (2 at 390, 2 at 375). An 11th mixed game at 375 was still running in round 9 when my 500 s timer stopped it
(not counted). 0 page errors, 0 console errors, 0 stuck states, 0 dead taps in every run.

**Rules check.** Checked against the published first-edition rules (base rulebook and the first-edition tournament rules; notes kept
local). Fixed: no round limit by default. The game is fought until one side has no ships; Options → Game length → "Timed, 20 min" is
off by default and says "tournament style: points destroyed, a tie is a draw", which matches the early tournament rules (later rules
used a roll-off). Still right: plan in secret, move lowest pilot skill first (ties: initiative first), one action (focus, evade, lock,
roll, boost; never the same action twice), stress (no actions, no red; a stressed red becomes the opponent's pick), green clears
stress, K-turn = straight then 180°, bump = back off and skip the action, any part off the mat = destroyed, asteroid = 1 attack die
and skip the action, obstructed shot +1 defence die, fire highest skill first with equal skill simultaneous, +1 attack die at range 1,
+1 defence die at range 3 (primary only), shields first, then face-down/face-up damage cards, a 2-damage card, focus/evade removed at
the end, locks and stress stay, initiative to fewer squad points (on a tie the second-named side; the base rule gives it to one fixed
faction, so this is an equivalent stand-in), obstacles beyond range 2 of the edges. Disclosed simplifications ("Kept simple" in Rules):
grid asteroid spots, ships set up facing the enemy (the rules allow any facing), a 5-step barrel-roll slide, a 100-round safety cap.
The Rules screen still leaves out three base rules the engine applies: a ship on an asteroid can't attack, touching ships can't attack
each other, and equal pilot skill fires at the same time. Nothing invented that changes how a default game is won.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 7 | The 8-round limit and the health tiebreak are gone; the timed mode is optional, off, and faithful to the early tournament rules. The engine matches the base rules. The Rules screen still leaves out three combat limits (above), and setup facing is fixed (disclosed). |
| 2 | Tutorial teaches | 6 | The reroll finger now goes to the blanks ("Attack die 3: blank", "Attack die 4: blank"), and every core rule is done once by touch in about 90 s. But it is still 3 bubbles, then a different coach system for the duel, then a card, then the drill, then a card, ending "The rest is in Rules". While I defend, the coach still says "Range 3 gave him a defence die". The drill dial is 42 px circles. |
| 3 | First 10 seconds | 7 | Clear title line, big "Launch" and "New here? Learn in 5 minutes". Launch goes to one "Start ▶" card and then a finger on your ship. |
| 4 | Turn clarity | 5 | Fixed: move arrows follow the ship's facing after a K-turn, and the enemy reveal chips are rotated too. But the dial opens on a suggested move that is pre-selected and labelled "rock!" (↑3 "Straight 3 · rock!" in round 1; ↑2 "rock!" flying away from both rivals in round 3), so the game recommends hazards. A "Ships move / Lowest skill first" bubble stays on during the Fire step and covers a rival's name plate. At 375 ship labels, move chips and range wedges pile on top of each other. |
| 5 | Phone play | 6 | The plan grid at the bottom has big cells and both sizes fit. Still: the board dial in the tutorial and drill is 15+ circles of 42 px, packed together; at 375 the tutorial Lock button sits on Kael's name plate; name plates and move chips overlap; the phone-check gate fails (a 10-word line on the asteroid step, cells off screen after rotation). |
| 6 | AI and pacing | 3 | On the default first game I lost **10 of 10**, in rounds 1, 1, 4, 4, 5, 5, 5, 6, 6 and 7. Following the game's own suggestions lost 6 of 6, twice in round 1: the suggested ↑3 flies into range 1 of both rivals (and through an asteroid at 375) and Kael (5 health) is gone before round 2. Twice the suggestion (↑2 every round) flew Kael off the mat at full or near-full health. The rival ended with both ships in 9 of 10 games. My wait from my last input to my next plan: median 7-13 s, max 18-40 s per game. A new player cannot win on the default level. |
| 7 | Feel | 7 | 3D ships glide along their templates, dice tumble in a tray, laser lines, "CRIT!" and damage floaters, a painted DEFEAT card. |
| 8 | Bugs | 6 | Fixed: no "undefined" on the result card (10 of 10). 0 errors, 0 stuck states, 0 dead taps. But the suggestion logic is broken in play: it pre-selects moves marked "rock!" and, followed round after round, flies the ship off the battlefield (the fixer's note says it "avoids edge traps"). The phone-check gate fails. |
| | **Total** | **5.9** | **FAIL**: rows 2, 4, 5, 6 and 8 are below 7; row 6 is 3. |

Gate: phone-check FAIL (build-all.py --full): text over 8 words "Auto place recommended Places your asteroids…" on 844x390, P>L, L>P
and stale; off-screen cells C1, D1 (P>L) and A1, B1 (stale). See /tmp/r22/na/.check/phone-check-results.md on the review machine.

### Earlier findings (R15)
| R15 finding | Status | Evidence |
|---|---|---|
| Row 1: 8-round limit with a "more health left" tiebreak | **Fixed.** No round limit from Launch; "Timed, 20 min" is optional, off by default, and decided on points destroyed (a tie is a draw). | code ui.js Options; rules-notes [T1]; games ran to round 7-9 |
| Row 4: dial arrows stay screen-fixed after a K-turn | **Fixed.** After a K-turn the ship faces down and the dial shows ↓1 straight and ↘1 for "Bank left 1"; the ghost matches. | games-src/reviews/R22-shots/na-390-after-kturn-arrows-follow-ship.png |
| Row 4: enemy reveal chips point up the screen | **Fixed.** The chips over the rivals are rotated with each rival's facing. | games-src/reviews/R22-shots/na-375-labels-and-chips-pile-up.png |
| Row 2: reroll finger picks the hits | **Fixed.** The finger goes to "Attack die 3: blank", then "Attack die 4: blank" (both sizes, from the run log). | games-src/reviews/R22-shots/na-375-tut-lock-button-on-kael-label.png (the lock step before the reroll) |
| Row 6: lost 5 of 5 on the default first game | **Worse.** Lost 10 of 10, 2 of them in round 1, 6 of 6 when following the suggestions. | games-src/reviews/R22-shots/na-390-defeat-round1-no-undefined.png, games-src/reviews/R22-shots/na-390-defeat-flew-off-mat.png |
| Row 8: "undefined" on the DEFEAT card | **Fixed** (10 of 10 cards read normally). | games-src/reviews/R22-shots/na-390-defeat-round1-no-undefined.png |
| Row 4: stale "Rival's turn" bubble during my plan | **Not seen** in 10 games; a different stale bubble ("Ships move" during Fire) appears instead. | games-src/reviews/R22-shots/na-390-ships-move-bubble-in-fire-step.png |
| Row 4: "★ Use evade" names Kael's pilot ability | **Fixed.** The button reads "★ Focus → evade / Change 1 of your…". | run log (tap text) |
| Row 4: coach "Range 3 gave him a defence die" while I defend | **Not fixed.** | games-src/reviews/R22-shots/na-375-tut-range3-coach-while-defending.png |
| Row 5: 42 px overlapping move circles in the coached plan | **Not fixed** (tutorial and drill board dial; the real game uses the bottom grid). | games-src/reviews/R22-shots/na-375-drill-dial-42px-circles.png |
| Row 5: "Kael" label on Nightjar's label after the K-turn | **Partly.** Not on Nightjar's label, but name plates, move chips and the "Ships move" bubble still stack at 375. | games-src/reviews/R22-shots/na-375-labels-and-chips-pile-up.png |
| Row 2: split flow; "The rest is in Rules" | **Not fixed.** 3 bubbles → coached duel → card → drill → "Drill done. You know every rule… The rest is in Rules." | games-src/reviews/R22-shots/na-375-drill-end-rest-in-rules.png |

### New findings
- Row 6/4 — did: first game from Launch at 375, took the pre-selected move — happened: the dial opens on ↑3 "Straight 3 · rock!"; Kael flies through an asteroid into range 1 of both rivals and is destroyed in round 1 (same at 390 without the rock) — shot: games-src/reviews/R22-shots/na-375-suggested-move-into-rock-r1.png, games-src/reviews/R22-shots/na-390-defeat-round1-no-undefined.png
- Row 6/8 — did: always took the suggested move at 390 — happened: the suggestion was ↑2 in all 6 rounds, marked "rock!" in round 3 while both rivals were behind Kael; in round 6 "Kael Varro flies off the battlefield and is lost" (also in a mixed game at round 7) — shot: games-src/reviews/R22-shots/na-390-suggested-straight2-every-round.png, games-src/reviews/R22-shots/na-390-defeat-flew-off-mat.png
- Row 6 — did: 10 default games, 6 on the suggestions and 4 mixed — happened: 10 losses in rounds 1-7; the rival kept both ships in 9 of 10; waits between my turns median 7-13 s, max 18-40 s — shot: games-src/reviews/R22-shots/na-390-defeat-flew-off-mat.png
- Row 4/5 — did: round 2 at 390, after Fly — happened: the step bar reads "R2 Fire" but the "Ships move / Lowest skill first" bubble is still up and covers Knifepoint's name plate — shot: games-src/reviews/R22-shots/na-390-ships-move-bubble-in-fire-step.png
- Row 5 — did: watched round 3 moves at 375 — happened: Kael's plate sits under a move chip, the Nightjar and Knifepoint plates are stacked, and an orange range wedge fills the lower right — shot: games-src/reviews/R22-shots/na-375-labels-and-chips-pile-up.png
- Row 5 — did: tutorial lock step at 375 — happened: the Lock button (with the finger) sits on Kael's name plate — shot: games-src/reviews/R22-shots/na-375-tut-lock-button-on-kael-label.png
- Row 1 — did: compared the Rules screen with the base rules — happened: it leaves out "a ship on an asteroid can't attack", "touching ships can't attack each other" and simultaneous fire at equal skill (the engine applies all three) — no shot (a rules check)
- Row 4 (works) — did: flew a K-turn in round 1, opened the dial in round 2 — happened: arrows and ghost follow the ship's facing — shot: games-src/reviews/R22-shots/na-390-after-kturn-arrows-follow-ship.png
