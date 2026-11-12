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
