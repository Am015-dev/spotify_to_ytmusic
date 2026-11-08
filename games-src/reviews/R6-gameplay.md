# R6 strict gameplay re-review (8 Nov 2026)

Reviewer R6. Scored by `games-src/reviews/GAMEPLAY-RUBRIC.md`. No game code was changed.
Each game was built from its branch head with `games-src/scripts/build-all.py <slug>` and served next to its `games/<slug>/media` folder.
It was played in Playwright with `isMobile` + `hasTouch` at 390x844 and 375x667, using `touchscreen.tap` only. The game ran at its default
animation and rival speed (no speed-up flags), so every wait below is what a player sees. Each tap was checked with `elementFromPoint`
first. I checked the rules against the published rulebook online and kept the notes outside the repo. Screenshots are in `games-src/reviews/R6-shots/`.

Limits: the full games were played by a touch bot. In Sunglaze and Final Approach it followed the game's own move picker, and in Perch &
Plume it followed the glow, so the win rates are from a sensible new player, not a strong one. I judged Feel from screenshots and the
flow of play.

| Game | Branch @ head | Earlier | R6 total | Verdict | Lowest rows | Stopper |
|---|---|---|---|---|---|---|
| sunglaze | shelf/W501-sunglaze-gameplay @ 7535736d | 7.5 FAIL | **7.9** | **PASS** | Turn clarity 7, Phone 7, AI and pacing 7 | none |
| perch-and-plume | shelf/W508-perch-gameplay @ 6434923c | 4.0 FAIL (stopper) | **6.5** | **FAIL** | First 10 s 6, Phone 6, Feel 6, Bugs 6 | none (the first-tap stopper is fixed) |
| final-approach | shelf/W506-final-approach-gameplay @ e6ef68ab | 4.0 FAIL (twice) | **4.0** (raw 5.9) | **FAIL** | Bugs 3, Tutorial 4 | **yes: the tutorial gets stuck on its last step at both sizes** |

---

## 1. sunglaze: 7.9 PASS

Played: tutorial by touch at both sizes (21 steps, 22 taps, 41 s each), then 2 full default games (2 players, Easy) to the result: lost 40-48 at 390x844
and won 47-38 at 375x667, each following the game's own move picker. A game took about 2 minutes. 0 page or console errors, 0 stuck states, 0 missed taps.

| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 9 | Matches the published game: 5 kilns of 4, take all of one colour, leftovers to the middle, first from the middle takes the start token onto the floor, blocked rows, overflow to the floor, floor -1,-1,-2,-2,-2,-3,-3, adjacency scoring, +2/+7/+10 bonuses, game ends on a full row, ties go to the most full rows. |
| 2 | Tutorial teaches | 8 | 21 steps in rule order, one line and one tap each, then a real game. The bubble no longer hides the shut rack. |
| 3 | First 10 seconds | 8 | "New here? Learn to play" is now the top button, above Begin. The settings below it are secondary. |
| 4 | Turn clarity | 7 | "Your turn: tap a colour", glowing rows, a preview of the floor cost, and much fainter empty wall spots. The rival's wall is not visible on the phone (score pill only), and the turn line is low-contrast grey on navy. |
| 5 | Phone play | 7 | Kiln tiles 44x44 and rack rows 360x44 (340x44 at 375; the whole row takes the tap), top pills 44 px tall, smallest text 14 px, no overflow at either size. The floor line is still 238x34 (224x32 at 375). |
| 6 | AI and pacing | 7 | From my move to my next turn takes 2.0-3.2 s, the result card shows 1.2-2.3 s after the last move, and the Easy rival is beatable (1 of 2). But each round end still takes 7.3-11.5 s. |
| 7 | Feel | 8 | Tiles fly to the racks, leftovers slide, the wall fills with a score pop, and the result card has art and a breakdown. |
| 8 | Bugs | 9 | Tutorial twice and 2 full games: 0 errors, 0 stuck states, 0 dead taps. |
| | **Total** | **7.9** | **PASS** (every row >= 7, no stopper) |

### Earlier findings (G3)
| Finding | Status | Evidence |
|---|---|---|
| Row 5: kiln tiles 34 px, rack rows 33 px, floor 32 px | Mostly fixed. Tiles 44x44 and rows 44 tall at both sizes. The floor line is still 32-34 px tall. | R6-shots/sg-390-first.jpg, R6-shots/sg-375-mid.jpg |
| Row 6: rival turns 4.5-5 s, round end about 20 s, result 18-25 s late | Fixed for rival turns (2.0-3.2 s from my move to my next turn) and the result (1.2-2.3 s). Partly fixed for round ends: 7.3-11.5 s, measured 3 times per game. | R6-shots/sg-390-result.jpg, R6-shots/sg-375-result.jpg |
| Row 3: title is a settings wall, Learn to play sits under Begin | Fixed. Learn to play is first. | R6-shots/sg-title.jpg |
| Row 4: empty wall spots as strong as placed tiles | Fixed. Empty spots are faded, placed tiles are full colour. | R6-shots/sg-390-mid.jpg |
| Row 2: step 6 bubble covers the shut rack | Fixed. The bubble sits under rack 4, and rack 3 with its X is visible. | R6-shots/sg-390-tut-06.jpg |
| Row 4: rival pill shrinks to "T." | Fixed. Both pills keep their names. | R6-shots/sg-390-mid.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Timed every wait in 2 full games at default speed. | 25 and 27 of my turns came back in 2.0-3.2 s. The 3 round ends per game took 7.3, 11.4 and 10.2 s (390) and 7.7, 11.5, 8.2 and 9.1 s (375) before I could move. Brisk otherwise. | R6-shots/sg-390-mid.jpg |
| 5 | Measured the floor line, which takes a tap when you choose to drop tiles. | 238x34 at 390 and 224x32 at 375: under 44 px. | R6-shots/sg-375-mid.jpg |
| 4 | Looked at my turn screens. | The rival's wall and racks are not on screen. You see their score but not their threats. The "Your turn" line is dim grey on dark blue. | R6-shots/sg-390-mid.jpg |
| 6 | Played the default game following the game's own move picker. | Lost 40-48 (my floor -12) at 390 and won 47-38 at 375. A careful newcomer can win on Easy. | R6-shots/sg-390-result.jpg, R6-shots/sg-375-result.jpg |

---

## 2. perch-and-plume: 6.5 FAIL

Played: tutorial by touch at 390x844 (21 steps, 24 taps, 47 s) to the real game's starting hand. Then a full Quick game at each size on the default settings
(2 players, Easy, the default is now Easy) to the result, following the glow: won 58-47 in 265 s at 390x844 (113 taps), and lost 32-46 in 213 s at
375x667 (89 taps). 0 page or console errors.

| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 7 | 4 rounds of 8/7/6/5 actions, egg cost by column, rows grow stronger, dice feeder, tray, brown right to left, white and pink powers, tuck and cache, round goals, bonus card, the 5-item starting hand. The engine has the row-space trades, but I did not see one offered in play. |
| 2 | Tutorial teaches | 7 | Every rule in order, one line and one tap each, and it ends at a real starting hand. White and pink markers now show within 1.6 s. But "food" (4.9 s), "eggs" (4.2 s) and "goalr" (7.0 s) leave you waiting, and 3 targets start below the fold. |
| 3 | First 10 seconds | 6 | The title offers "New here? Learn in 5 minutes" first, and the starting hand carries a goal line. But tutorial step 1 opens on a crowded dock: score bar, food, tray, 3 rows, round box, bonus card, coach and actions all at once. |
| 4 | Turn clarity | 7 | The sticky prompt says what to do ("Pick a glowing bird below", "Tap Play to put Nettle Grebe in your wetland"), and Play and Cancel sit right under it. The cost shows on the Play button. |
| 5 | Phone play | 6 | Buttons are 44 px or more and Play is never covered (15 of 15 checks). But the dock still needs 6-7 scrolls a game to reach targets, and the board and dock compete for the screen at 375x667. |
| 6 | AI and pacing | 7 | Easy is the default, a game takes about 4 minutes, and the rival is quick. I won 1 of 2 (58-47, 32-46) as a glow follower. |
| 7 | Feel | 6 | Painted bird cards and habitats and a clear result table. But most actions resolve as dock text and number changes rather than visible card, egg or food movement. |
| 8 | Bugs | 6 | Two full games and the tutorial with 0 errors and 0 stuck states. One dead tap at 375: a glowing "+2 food" row did nothing. |
| | **Total** | **6.5** | **FAIL** (rows 3, 5, 7, 8 under 7) |

### Earlier findings (G4)
| Finding | Status | Evidence |
|---|---|---|
| Row 8 STOPPER: dead first tap after Keep these (3 of 3) | **Fixed.** At both sizes, the first tap on "Play a bird" right after Keep these changed the screen within 0.9 s (4 of 4 checks). | R6-shots/pp-390-g-firsttap.jpg |
| Rows 4/5: Play button under the dock header, stale "tap a glowing space" text | **Fixed.** The prompt reads "Tap Play to put <bird> in your <habitat>", with Play and Cancel right under it. Play was on screen and uncovered on 7 of 7 (390) and 8 of 8 (375) birds played. | R6-shots/pp-390-g-playgo.jpg |
| Row 5: hand opens off screen, many forced scrolls; 42x48 slots at 375 | Partly fixed. Picking a bird now scrolls the hand under the prompt (R6-shots/pp-390-g-firsttap.jpg). But a game still needed 6 scrolls at 390 and 7 at 375 to reach a target. | R6-shots/pp-375-g-dead1.jpg |
| Row 2: see-step markers late (white, pink, goalr) | Partly fixed. White 0.9 s and pink 1.5 s are fine. The "goalr" step still waits 7.0 s, and "food" and "eggs" 4-5 s, after the step starts. | R6-shots/pp-390-tut-01.jpg |
| Rows 2/3: "Round 1 of 1" vs "4 rounds", busy first screen | Copy fixed ("This practice is one short round", "Real games: 4 rounds"). Busy first screen not fixed. | R6-shots/pp-390-tut-01.jpg |
| Row 6: Normal rival too strong for a default | Fixed. Easy is the default (R6-shots/pp-390-quick-setup.jpg). Won 58-47 and lost 32-46 as a glow follower. | R6-shots/pp-390-g-result.jpg, R6-shots/pp-375-g-result.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 | 375x667, round 4, tapped the glowing "+2 food" habitat row (64x48, uncovered). | Nothing changed for 1.35 s. The turn went on only after a different tap. A newcomer sees a glowing target that ignores them. Seen once in about 90 taps; the 390 game had 0. | R6-shots/pp-375-g-dead1.jpg |
| 2 | Timed each tutorial step from its start until the marker showed. | food 4.9 s, eggs 4.2 s, goalr 7.0 s, cards 1.4 s (the rival's turn plays first). In 3 steps (food, eggs, cards) the target was below the fold when the step began. | R6-shots/pp-390-tut-end.jpg |
| 5 | Counted scrolls in 2 full games. | 6 (390) and 7 (375) dock scrolls just to reach the glowing target. The board and dock never fit together at 375. | R6-shots/pp-375-g-dead1.jpg |
| 7 | Watched the result screen. | A clear table (Birds, Bonus, Goals, Eggs, Food, Tucked). The note under it ("Birds = card points...") looks under 14 px. | R6-shots/pp-390-g-result.jpg |

---

## 3. final-approach: 4.0 FAIL (stopper)

Played: tutorial by touch at 390x844 and at 375x667 (27 steps, 57-60 taps, about 75 s). Then a full Quick game (Computer > Just play, default level) at 375x667
to the result, following the game's own advice for my seat: lost on the axis ("Not level at landing") in 77 s. 0 page or console errors.

| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 8 | The brake timing now matches the published rule. Speed is compared with the brakes when the second engine die is placed. A brake set later doesn't count. Equal speed lands, no brakes never lands. I checked this in the rulebook text, by running the branch's logic tests (172 of 172 pass), and in play ("Landing speed 4 against brakes 6"). |
| 2 | Tutorial teaches | 4 | 27 one-line steps teach every rule, and the brake timing is now right ("Brake 6 now. Brakes set after the engines come too late."). But the last step never finishes, so the tutorial never reaches its end card or a real game. |
| 3 | First 10 seconds | 6 | Clear title, then a "Learn in 5 minutes / Just play" offer. "New here?" sits at the bottom of the title, under Play and Quick game. |
| 4 | Turn clarity | 6 | Prompt lines like "Your 1: engines, or axis." and checklist chips are good. But the "What should I do?" button didn't show on any of my 30 turns, and "Spend a token? Tap again." repeated 3 times. |
| 5 | Phone play | 7 | Slots are 45x45, the chips fit at 375 in the last rounds, and the prompt text is readable. |
| 6 | AI and pacing | 6 | Brisk: a game takes under 2 minutes. But following the game's own advice lost my 1 full game (tilted 2 right at landing). |
| 7 | Feel | 7 | Painted cockpit, dice fly, "Ravi used Radio" banners and a distinct crash scene. |
| 8 | Bugs | 3 | Tutorial stuck at step 27 of 27 at both sizes (see below). |
| | **Total** | **4.0** | Capped: stuck state. Raw average 5.9. **FAIL** |

### Earlier findings (G5, R4)
| Finding | Status | Evidence |
|---|---|---|
| Speed equal to the brakes crashed (G5 stopper) | Fixed (R4 confirmed it; still true here). The tutorial lands at speed 4 against brakes 6, and the rules test for equal speed passes. | R6-shots/fa-390-tut-25.jpg |
| Speed judged at round end, not at the second engine die (R4 stopper) | **Fixed.** `afterEngines` freezes `G.landBrake` when the second engine die goes down and loses at once if the speed is above it. The published text says speed is checked "when playing the second engine die", and the brake marker sits just past the brake number. The tutorial now sets brake 6 BEFORE the last engine die and says so. Logic tests "Timing:" (3 rules) pass. | R6-shots/fa-390-tut-25.jpg |
| Tutorial text taught the wrong timing | Fixed (steps 23, 25, 26). | R6-shots/fa-390-tut-25.jpg |
| Checklist chips clip at 375 in the last round | Fixed. Five chips fit in one row at 375x667, round 4 of 7. | R6-shots/fa-375-g-mid.jpg |
| Advice gives nothing when the best move needs coffee | Not verified. The "What should I do?" button was absent on all 30 of my turns at the default settings. | R6-shots/fa-375-g-mid.jpg |
| Goal card is a 4-bullet text wall | Not checked: my game started through "Just play", and I did not capture a Goal card. | none |
| Prompt and plan lines cut off with "..." | Fixed on the screens I saw ("Your 1: engines, or axis." fits at 375). | R6-shots/fa-375-g-mid.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 / 2 **STOPPER** | Did the tutorial by touch to step 27 of 27 ("Landed! Runway clear, gear, flaps, level wings, slow enough.") at 390x844. Tapped the highlighted spot (a clear cell over the scene, 187,287) for 30 s. | Nothing happened: no end card, no "Play a real game". The bubble says "Tap Next." but its button says "Finish". | R6-shots/fa-390-tut-stuck.jpg |
| 8 / 2 **STOPPER** | Same at 375x667: waited 1.5 s, tapped the highlight 3 times, then tapped the bubble's 71x44 "Finish" button. | The bubble faded and Finish greyed out, but no end card came in the next 30 s. The only way out is "Skip tutorial" at the top. A new player's first session ends in a dead screen. | R6-shots/fa-375-tut-after-finish.jpg |
| 6 | Played a Quick game following the game's advice at every turn. | Lost "Not level at landing": my 3 under Ravi's 6 tipped the plane 2 right, then the advice had nothing to fix it. Earlier rounds also logged "Pilot spends a reroll token: Rerolled: Pilot 0 dice, Co-pilot 0 dice" twice, so a token can be spent with no die picked. | R6-shots/fa-375-g-result.jpg |
| 7 / 4 | Reached the result screen. | A crash scene with one line, "Not level at landing". Two seconds after the end, no Play again or Next button was on screen. | R6-shots/fa-375-g-result.jpg |
| 3 | Title at 390x844. | "New here? Learn in 5 minutes" is the last option, at the bottom, under Play and Quick game. | R6-shots/fa-390-title.jpg |
