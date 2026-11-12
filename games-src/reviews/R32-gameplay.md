# R32 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. For each game I checked out its branch, merged origin/alex/brave-carson-rbpmlk into
it locally (not pushed) and ran the deploy gate `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/r32/<slug> <slug>`.
I served the gate's built page next to the branch's games/<slug>/{media,models,music} and played with Playwright 1.63 real touch only
(isMobile, hasTouch, `touchscreen.tap` at hit-tested centres, deviceScaleFactor 1, fresh storage, default settings) at 390x844 and
375x667. "Wait" = from my tap until my driver's next tap became possible (includes about 0.3 s of driver polling). Shots are in
games-src/reviews/R32-shots/.

| Game | Total | Verdict | Gate (--full) | Lowest rows |
|---|---|---|---|---|
| cauldron-fair | 7.4 | FAIL | **FAIL** | 5 Phone 6 |
| redline-rally | 7.4 | PASS | PASS | 2, 3, 5, 6, 7 at 7 |
| nebula-aces | 6.8 | FAIL | PASS | 2 Tutorial 6, 5 Phone 6 |

---

## 1. cauldron-fair (shelf/W503-cauldron-gameplay @ 10670365, merge was a no-op): 7.4, FAIL

**Gate: FAIL.** `/tmp/r32` gate log ends "0/1 PASS ... EXIT 1". Build, phone-check (56.7 s) and lab-test ran; the quick sweep fails:
"sweep.js: chapter 1 newcomer ... vs easy: win 85% ... [story-c1-375x553] help: help bubble covers a tappable target". The fixer's
"gate PASS" did not hold on my run. This time the bubble is not the shop bubble: on day 2 of story chapter 1 at 375x553, the help bubble
"Refill the flask so you can use it tomorrow" covers the cauldron spiral, where the line above it says "tap a glowing drop to start one
space further". Shot: games-src/reviews/R32-shots/cf-gate-story-375x553-help-covers-target.jpg

What I played:
- Tutorial ("New here? Learn in 5 minutes") to the end card at 375x667 and 390x844: 30 steps, 30 taps, 0 ignored taps, 0 errors, 32-33 s.
  Every ring target 44 px or more (smallest: Wren Feather chip 45x59 at 375). Bubble text 15 px. Ends on "Now a real game / You know every
  rule" with one "Play a real game" button.
- 3 full games from "Play against the computer makers" on defaults (2 makers, easy) to the result screen, as a naive player: draw until
  whites are 2 below the limit, then Stop; buy the dearest affordable chip(s), max 2 different stalls; first option on every sheet
  ("Place none" on peeks, "Take points" after a boom).

| Game | Size | Result | Taps | Time | Wait median / max | Dead taps | Errors |
|---|---|---|---|---|---|---|---|
| g1 | 390x844 | lost 38-40 | 95 | 109 s | 0.3 s / 4.3 s | 0 | 0 |
| g2 | 375x667 | **won 58-35** | 121 | 129 s | 0.3 s / 4.8 s | 0 | 0 |
| g3 | 390x844 | **won 30-21** | 94 | 103 s | 0.3 s / 5.6 s | 0 | 0 |

(A first 390 run where my driver misread the limit and drew every day to a boom still lost only 32-35. Not counted.)

**Rules check.** Engine and Rules screen unchanged in the rules sense since R28, which checked every number against the published base
game (start bag, prices, white limit 7, flask, rat tails, bonus die, boom = points or shop, 2 chips of different colours, ruby uses,
yellow day 2, purple day 3, day-6 white, no shop on day 9, 5 coins / 2 rubies = 1 point, furthest pot breaks ties). The tutorial lines I
read this time all match it. Still unconfirmed: rat tails are placed on every second space of the score track (the published track has
its own icon spacing). Nothing invented.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Every turn step and number matches; rat-tail spacing is still a simplification. |
| 2 | Tutorial teaches | 8 | Fixed: rat tails are now a tap ("Tap the rat: you 0, leader 2, so 1 rat tail between"). 30 one-line steps, one tap each, 0 ignored taps at both sizes, green and black done by drawing, ends in a real game. |
| 3 | First 10 seconds | 8 | "New here?" first, then Play; the goal card is 3 short lines and "Let's brew"; then "Tap the bag to draw your first chip". |
| 4 | Turn clarity | 7 | Fixed: day 9 now reads "YOUR TURN · Last day! Draw or Stop. All reveal together", then "You stopped. Waiting for others…". The fortune name shows once while you brew. Still: the end-of-brew fortune sheet shows the name 3 times (ALL DAY chip, "ALL DAY Fortune: Spilled Brew", sheet title). In the day-end tally the plates show the old totals while the headline gives the new lead ("You 37, Odo 35" above "Odo leads by 2"). |
| 5 | Phone play | 6 | Fixed in my games: at 375x667 all 7 stalls, the ruby bar and the whole info line ("Tap a chip to see what it does. Buy up to 2, different colours.") fit. All targets 44 px+, text 14 px+. **But the --full gate fails again** on a help bubble that covers tappable drops at 375x553 (story chapter 1). "Dusk Si…" stall name is cut at 375. |
| 6 | AI and pacing | 7 | Brisk (0.3 s median, 5.6 s max wait, about 2 min a game). Naive play won 2 of 3 and lost one by 2: beatable but not free. |
| 7 | Feel | 7 | Chips fly to the spiral, the meter fills, bonus die, painted stalls, a counted day-end bar race, confetti result table. |
| 8 | Bugs | 8 | 3 games + 2 tutorials: 0 page errors, 0 console errors, 0 stuck states, 0 dead taps. The gate failure is scored in row 5. |
| | **Total** | **7.4** | **FAIL**: row 5 is below 7 and the deploy gate fails. 8+8+8+7+6+7+7+8 = 59/8. No stopper. |

### Earlier findings (R28)
| Finding | Status | Evidence (games-src/reviews/R32-shots/...) |
|---|---|---|
| Gate: quick sweep FAIL, help bubble covers shop chips at 375x553 | **Not fixed (moved).** The shop bubble is gone, but the same check now fails on the story-chapter flask bubble covering the drops at 375x553. | cf-gate-story-375x553-help-covers-target.jpg |
| Row 5: shop at 375 cut the info line; 3 stalls behind a "3 more stalls" pill | **Fixed.** All 7 stalls, ruby bar and the full info line fit at 375x667 (tutorial and real game). | cf-375-shop-all-stalls-info-line.jpg, cf-375-tut-shop-7-stalls.jpg |
| Row 2: rat-tail step was a Next card | **Fixed.** It is a tap on the rat (+1) button. | cf-375-tut-rat-tails-tap.jpg |
| Row 4: day 9 "YOUR TURN · Draw or Stop" above "Decided. Waiting…" | **Fixed.** Draw/Stop while brewing, then "You stopped. Waiting for others…". | cf-390-day9-your-turn.jpg, cf-390-day9-stopped-waiting.jpg |
| Row 4: fortune name shown 3 times | **Partly fixed.** Once while brewing; still 3 times on the end-of-brew fortune choice sheet. | cf-390-fortune-name-3x-choice-sheet.jpg |
| Row 2: tutorial day 2 step titled "Last day" | **Unchanged**, but it is the last of the two practice days, so I no longer count it. | cf-375-tut-end.jpg |
| Row 7: drawn chip flies over the first sheet button | **Not checked closely**; the first-option taps all landed (0 dead taps). | n/a |
| Row 6: easy rival maybe soft (won 3 of 3) | **Changed.** Won 2 of 3, lost one by 2. Fair. | cf-390-result-lost-38-40.jpg, cf-375-result-won-58-35.jpg, cf-390-result-won-30-21.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 (gate) | Ran the --full gate | Sweep FAIL at 375x553 in story chapter 1: the flask help bubble covers the glowing drops the line above asks you to tap. | cf-gate-story-375x553-help-covers-target.jpg |
| 4 | Stopped on day 9 at 390 and watched the tally | Plates say "You 37 / Odo 35" while the headline says "Odo leads by 2" and the bars count up to other numbers. The same on day 7 ("18 / 18" above "Odo leads by 7"). The plates update only after the count. | cf-390-day9-tally-plates-vs-headline.jpg |
| 4 | Rival boomed on day 1; the fortune sheet opened | Name 3 times on one screen (chip, dock line, sheet title). | cf-390-fortune-name-3x-choice-sheet.jpg |
| 5 | Shop at 375 | Stall name "Dusk Si…" is cut (cosmetic). | cf-375-shop-all-stalls-info-line.jpg |

---

## 2. redline-rally (shelf/W496-redline-gameplay @ e1642049, merge was a no-op): 7.4, PASS

**Gate: PASS.** `build-all.py --full redline-rally`: "1/1 PASS ... EXIT 0"; phone-check 57.2 s passed at every size including the
landscape-to-portrait turn that failed in R30; rules-test "PASS" (spins 3.65, slipstreams 16.0, boosts 3.5 per AI game).

What I played:
- Tutorial ("New here? Learn in 5 minutes") to the end card at 390x844 and 375x667: 40 steps, 40 taps, 0 ignored taps, 0 errors,
  52-53 s. Smallest ring target 64x92 (cards) at 375; text 16 px. 11 steps are Next-only. Longest silent wait 5.25 s (cars moving).
  It now ends on "You know every rule / Now a real race against four rivals" with "Play a real game" (and "Story mode").
- 2 default races (Play ▶ > Start the race; 2 laps, 4 easy rivals) to the podium:

| Race | Size | Player | Result | Taps | Time | Wait median / max | Real dead taps | Errors |
|---|---|---|---|---|---|---|---|---|
| r1 | 390x844 | taps Suggest, Go, the Suggested boost answer, Keep all | **won** "Flag! Sunline is yours", 0 spin-outs | 73 | 107 s | 0.3 s / 3.3 s | 0 | 0 |
| r2 | 375x667 | plain: biggest cards that keep under the "up to speed N safe" line, random boost answer, Keep all | **2nd** "One cleaner corner and it is yours", 5 spin-outs | 117 | 169 s | 0.3 s / 4.6 s | 0 | 0 |

My driver logged 7 "no change" taps in r2. I re-did them by hand: in gear 1 a second card tap swaps the chosen card (the 3 is
dropped, the 4 is chosen), which is right; my detector missed it because the page length did not change. Not counted.

**Rules check.** Unchanged since R30, which checked them against the published game: gear = number of cards (one gear up or down free,
two for 1 heat), sum = speed, corners over the limit cost 1 heat per point, spin-out with stress and back to gear 1, 2 cars per space,
slipstream +2, adrenaline for the last car (+1 speed, +1 cooldown), boost for 1 heat (flip until a speed card), cooldown in low gear,
discard step, Brake / Burst / Heat as the starting upgrade cards. The tutorial lines all match. Nothing invented.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 7 | Every rule in order, one tap each, 0 ignored taps, and it now ends in "Play a real game". The scripted move's rating string in the build is now "Good: 7 spaces for 0 heat" (R30 "Okay … best went 11" not seen). Still 11 Next-only steps, silent waits up to 5.25 s, and on the last step the camera shows Juno, not your car. |
| 3 | First 10 seconds | 7 | Big Play ▶, a 4-line goal card, one "Start the race". |
| 4 | Turn clarity | 8 | Fixed: each boost button carries its own text ("Suggested / +2 spaces, no corner in reach / Boost -1 heat" vs "No boost"); the plan line is short ("Speed 4: road clear, corner in 13"); the risk line "Boost +1 to +4: spin-out risk 0%" sits above both. |
| 5 | Phone play | 7 | Gate PASS (the L>P failure is gone). Cards 52x80, gears 74x49, Go 276x46 at 375; everything fits at both sizes. Score floats ("+1 engine", "Clean: 4 in a 4") still land on the cars and corner signs. |
| 6 | AI and pacing | 7 | About 2-3 min a race; Suggest won, the plain player was 2nd with 5 spin-outs. Fair on Easy. |
| 7 | Feel | 7 | Start lights, cars slide, "+N spaces" / "Slipstream +2" pops, podium with heat, spin-outs and slipstreams per car. |
| 8 | Bugs | 8 | Gate PASS; 2 races and 2 tutorials with 0 errors, 0 stuck states, 0 real dead taps. |
| | **Total** | **7.4** | **PASS**: every row 7 or more, no stopper. 8+7+7+8+7+7+7+8 = 59/8. |

### Earlier findings (R30)
| Finding | Status | Evidence (games-src/reviews/R32-shots/...) |
|---|---|---|
| Gate FAIL: phone-check L>P "text >8 words: 11w" | **Fixed.** --full gate PASS. | (gate log) |
| Row 2: scripted tutorial move rated "Okay: 7 spaces. The best play went about 11." | **Fixed** (build string "Good: 7 spaces for 0 heat."; no "Okay" line seen at either size). | rr-390-tut-boost-step.jpg |
| Row 4: Suggested badge and the boost's risk sat on the No boost button | **Fixed.** Each button shows its own text; Suggested sits on the button it means. | rr-375-boost-own-text-suggested.jpg |
| Row 2: 11 Next-only steps | **Not fixed** (still 11). | rr-390-tut-last-step-camera-on-juno.jpg |
| Row 2: Finish led to the season map | **Fixed.** End card with "Play a real game". | rr-390-tut-end-play-real-game.jpg |
| Row 7/5: "Slipstream +2" banner over the cars | **Partly.** Floats still sit over cars and corner signs. | rr-375-float-over-corner-sign.jpg, rr-375-boost-own-text-suggested.jpg |
| Row 8: "Keep all" with 0 picked | **Still fixed** (used every round, 0 dead). | rr-375-result-2nd-plain.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 2 | Last tutorial step, 390 | "You won, and the others race on" while the camera shows Juno's car and "Slipstream +2", not mine. | rr-390-tut-last-step-camera-on-juno.jpg |
| 5/7 | Plain race at 375 | "Clean: 4 in a 4" and "+1 engine" floats sit on the corner sign and on the cars. | rr-375-float-over-corner-sign.jpg |
| 4 (works) | Gear 1, tapped a second card | The new card replaces the old one (good, no dead tap). | rr-375-card-swap-gear1.jpg |
| 6 (good) | Two default races | Won 107 s (Suggest), 2nd 169 s (plain). | rr-390-result-win-suggest.jpg, rr-375-result-2nd-plain.jpg |

---

## 3. nebula-aces (shelf/W486-nebula-bench @ 092fa706, merged locally to 5bf7f79a): 6.8, FAIL

**Gate: PASS.** `build-all.py --full nebula-aces`: "1/1 PASS ... EXIT 0"; phone-check 117.8 s passed; rules-test PASS. One warning
(not a gate fail): "[lab] nebula-aces WARN 9/12 checks (b) LAB rows [...] != scenarios".

What I played:
- Tutorial ("New here? Learn in 5 minutes"), following only the coach (the 👆 finger or the lit hole; never "★ Auto"):
  - 390x844, by hand at about 1.3 s per tap: 3 bubbles, "Your first battle" card, coached duel (2 rounds), "Flight drill" card,
    drill, end card **"Play a real game / Story mode"**. About 40 taps, 0 errors. So the tutorial can be finished by touch.
  - 375x667, at 1 s per tap: the coached duel to the "Flight drill" card in 22 taps, 0 ignored, 0 errors (reroll die-pick worked).
  - 390x844 with my fast driver (tap about 0.3 s after each new target): **stuck in a loop at the coached reroll**, 240 taps:
    finger on a blank die → tap it → the pick mode closes and the finger goes back to "⌖ Reroll / Choose any of your dice" → tap →
    finger on the die again … The dice were still growing in (38x39, later 48x52) when tapped. This is the spot where the fixer's
    driver got stuck too. At a slower pace (≥ 0.4 s after the dice settle) the die is selected, the finger moves to the second blank
    die, then "⌖ Reroll", and the duel goes on.
- 2 full games from "Launch" on defaults to the result card, following the guide: the finger where shown, else the pre-selected dial
  move ("Lock move ✓"), the recommended action, the recommended target, Roll, recommended defence or Done; "Hold fire" when nothing
  was in arc. 0.5 s pause before each tap.

| Game | Size | Result | Round | Taps | Time | Wait median / max | Dead taps | Errors |
|---|---|---|---|---|---|---|---|---|
| n1 | 390x844 | **VICTORY** | 20 | 103 | 277 s | 1.2 s / 6.7 s | 0 | 0 |
| n2 | 375x667 | **VICTORY** | 10 | 59 | 155 s | 1.1 s / 7.1 s | 0 | 0 |

(An earlier 390 run where my driver closed the dial with ✕ every round instead of locking the suggestion lost in round 14. Not counted.)

**Rules check.** The engine is the same base-rules engine R28 checked (secret dials, lowest skill moves first, one action, stress, bump
skips the action, off the mat = destroyed, asteroid = attack die and no action, highest skill fires first, range bonuses, shields
first, crits face up, initiative by points). The game's own messages now state the asteroid and touching limits ("a ship sitting on an
asteroid can't shoot this round", "ships touching each other can't fire at each other"). The Rules screen still says "Flying through
an asteroid rolls a damage die" (it is an attack die) and does not state equal-skill simultaneous fire. Nothing invented.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 7 | Engine right; in-game messages now give the asteroid and touching limits. Rules screen: "damage die" wording and simultaneous fire still missing. |
| 2 | Tutorial teaches | 6 | Now finishable by touch, ends in "Play a real game", and the drill makes you fly off the mat once ("Ship lost. See? That ship would be gone"). Still: the flow is split (bubbles, card, duel, card, drill, card); coach lines still run late ("His evades cancelled your hits. At range 3 he rolls one more" shows while Slate shoots me; "Pilot power" shows at the next plan step); and the reroll die-pick throws away a quick tap on the die the finger shows (closes the pick mode), which looped my driver 120 times. |
| 3 | First 10 seconds | 7 | "Launch" and "New here?" are big; one goal card; then "Tap your ship to plan its move" with a finger. |
| 4 | Turn clarity | 7 | Fixed per R28: a one-line hint plus a finger on the next thing every step ("Tap ◉ Focus: your next shot hits harder"), and following the suggestion never led to a loss in my 2 games. The real-game dial marks the suggestion only as a pre-selected yellow cell (no ★ or reason), and the "Your turn" bubble covers an enemy ship. |
| 5 | Phone play | 6 | Gate PASS; dial cells, chips and bottom buttons 44 px+. **Not fixed**: at 375 the ⌖ Lock chip still sits on Kael's name plate (hearts and shield hidden), and the "Your turn" bubble hides Knifepoint. |
| 6 | AI and pacing | 7 | Following the guide won 2 of 2 (rounds 10 and 20). Waits 1.1-1.2 s median, about 7 s max (rival moves and dice). Length still swings: the round-20 game was 4.6 min at my pace, a person would take 10+. |
| 7 | Feel | 7 | 3D ships fly their paths, dice tumble, laser lines, damage floaters, painted VICTORY / DEFEAT cards. |
| 8 | Bugs | 7 | 2 full games: 0 page errors, 0 console errors, 0 stuck states, 0 dead taps (the R28 sliding chips are fixed). The quick-tap reroll cancel is scored in row 2; it never stopped play at a human pace. |
| | **Total** | **6.8** | **FAIL**: rows 2 and 5 below 7. 7+6+7+7+6+7+7+7 = 54/8 = 6.75. Not capped: the reroll loop only happens on taps faster than about 0.4 s. |

### Earlier findings (R28)
| Finding | Status | Evidence (games-src/reviews/R32-shots/...) |
|---|---|---|
| Row 8/5: fire and action chips slide 15-60 px after they appear (dead taps) | **Fixed.** 0 dead taps in 162 game taps at 0.5 s pace. | na-390-victory-r20.jpg |
| Row 4/6: ★ / pre-selected move marked "rock!" in 4 of 9 games | **Not seen.** 2 of 2 games won on the pre-selected move; no rock hit noted. Not proven over many games. | na-375-dial-suggested-no-star.jpg |
| Row 4/6: dial never warns when a move leaves the mat | **Fixed.** The drill shows a cell marked "off mat! ✕" and makes you fly it once. | na-390-drill-offmat-taught.jpg |
| Row 2/8: 4-5 ignored taps per tutorial size on sliding targets | **Fixed** (0 ignored at 1-1.3 s pace) but **new**: a quick tap on the reroll die closes the pick mode. | na-390-tut-reroll-pick-finger-on-die.jpg, na-390-tut-reroll-quick-tap-cancelled.jpg |
| Row 2: coach lines one step late ("Range 3 …" while the rival aims; "Pilot power" at the next plan) | **Not fixed.** | na-390-tut-coach-my-shot-while-rival-aims.jpg |
| Row 2: split flow (bubbles, duel, card, drill, card) | **Not fixed**; the end card now offers "Play a real game". | na-390-tut-end-play-real-game.jpg |
| Row 5: action chips cover name plates at 375 | **Not fixed.** ⌖ Lock covers Kael's plate. | na-375-lock-chip-over-kael-plate.jpg |
| Row 6: suggestion wins 5 of 7 (claimed 8 of 10) | **Better**: 2 of 2 (fixer: 3 of 6). | na-390-victory-r20.jpg, na-375-victory-r10.jpg |
| Row 1: "damage die" should say attack die | **Not fixed.** | no shot (Rules text) |
| Row 6: game length rounds 5-22 | **Unchanged** (rounds 10 and 20). | na-390-victory-r20.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 2/8 | Coached reroll at 390: tapped the die the finger shows about 0.3 s after the pick dice appeared | The pick mode closes, nothing is selected, and the finger goes back to "⌖ Reroll / Choose any of your dice". Repeated 120 times in a row. At a slower pace it works. | na-390-tut-reroll-pick-finger-on-die.jpg, na-390-tut-reroll-quick-tap-cancelled.jpg |
| 4 | Opened the dial in a real game at 375 | The suggestion is just a pre-selected yellow cell ("Turn left 2") with no ★ and no reason; the tutorial taught a ★ mark. | na-375-dial-suggested-no-star.jpg |
| 5 | Action step at 375 | The "Your turn / Kael Varro flew" bubble covers Knifepoint; ⌖ Lock covers Kael's plate. | na-375-lock-chip-over-kael-plate.jpg |
| 2 (good) | Drill | Off the mat is now taught by doing: the finger points at the "off mat!" move and Brecken says "See? That ship would be gone. Fly straight 2 instead." | na-390-drill-offmat-taught.jpg |
