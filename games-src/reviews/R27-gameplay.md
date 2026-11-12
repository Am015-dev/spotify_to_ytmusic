# R27 gameplay re-review (strict), 12 Nov 2026

Reviewer R27. Scored by `GAMEPLAY-RUBRIC.md`. I changed no game code and did not trust the fixers' notes.

How I played: each branch checked out in a local worktree with `origin/alex/brave-carson-rbpmlk` merged in (local only, not pushed),
gated with `VIS_SLUGS="," build-all.py --full --out /tmp/r27/<x> <slug>` (scenarios, phone-check, sweep), and the staged page served
over http next to the branch's `games/<slug>/` asset folders. Playwright phone contexts (isMobile, hasTouch), every action a
`touchscreen.tap` at the centre of a visible, top-most element (elementFromPoint checked). A tap is "dead" when neither the page text
nor the game state changes within 0.5-0.8 s. My drivers read the screen to decide and never called a game function.
Default settings everywhere. Rules re-checked against the published rules online; notes kept local, not committed.
Screenshots: `games-src/reviews/R27-shots/`.

| Game | Total | Verdict | Gate | Lowest rows |
|---|---|---|---|---|
| redline-rally | 7.0 | FAIL | PASS | 8 Bugs 6 |
| perch-and-plume | 6.8 | FAIL | PASS | 5 Phone 5, 6 AI 6 |

---

## 1. redline-rally (shelf/W496-redline-gameplay @ 82af847a after the local merge): 7.0, FAIL

Gate: **PASS** (`--full`: scenarios, phone-check at every size, rules-test sweep "max 76, spins 3.65 per game"). Lab rows WARN 5/8
(lab rows differ from the scenario list; not a gate fail). The 27-word text that failed R24's phone-check is gone.

What I played:
- Tutorial ("New here? Learn in 5 minutes") at 375x667 and 390x844 by touch: 40 steps, 40 taps (11 of them Next), 88 s, 0 dead taps,
  0 lines over 12 words, every target 44 px or more, 0 errors. It ends on "You know every rule / Play a real game".
  The end card now comes straight after the last tap (R24: 9.6 s wait). One 9.2-9.3 s silent wait remains mid-tutorial: after the Go
  that leads to the spin-out lesson, the cars run and nothing asks for a tap.
- Four default races (Play ▶ > Start the race; Sunline, 2 laps, 4 Easy rivals) to the podium:

| Race | Size | How I played | Result | Time | Rounds | Taps |
|---|---|---|---|---|---|---|
| r1 | 375 | Suggest, then Go; took the "Suggested" boost answer; random discard answer | **won** (heat 12, 0 spin-outs) | 96 s | 17 | 72 |
| r2 | 390 | same as r1 | **won** (heat 14, 0 spin-outs) | 110 s | 17 | 89 |
| r3 | 375 | followed the "shift up / shift down" line, biggest cards first, random boost and discard answers | **2nd** ("One cleaner corner and it is yours") | 141 s | 24 | 113 |
| r4 | 390 | same as r3 | **won** | 140 s | 23 | 112 |

- About 5.6-6.1 s per round including my own taps; the boost and discard questions came 0.6 s (median) after Go and waited for me.
- 0 page errors, 0 console errors, 0 stuck states. Dead taps: **only** the "Discard 0" button (see findings), 15-22 per race with my
  random answers.

Rules check (published game, re-checked online): gear = number of cards, shift one gear free or two for 1 heat, total speed moves you,
corners over the limit cost heat and a spin-out (stress cards, back to gear 1) when you cannot pay, slipstream +2, adrenaline for the
back cars, boost by paying heat and flipping to the next speed card, cooldown and the discard step at the end of the turn. All match
what I saw. Nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right (see the rules check). |
| 2 | Tutorial teaches | 7 | Every rule in order, one line and one tap each, 88 s, ends in a real race; the end wait is gone. Still 11 Next-only steps and one 9.2 s silent wait before the spin-out step. |
| 3 | First 10 seconds | 7 | Big Play ▶; a 4-line goal card ("Goal: first across the line after 2 laps", "Gear = cards...") and one "Start the race". |
| 4 | Turn clarity | 7 | Fixed: my car is on screen in every planning shot I took (16 of 16 at 375, all sampled at 390), with a "You" tag and the next corner number. The advice line ("Corner 5 is 13 away: shift up.") and after-move feedback ("Okay: 7 spaces. The best play went about 10.") are clear. The Suggested badge now gives a reason ("+2 spaces, 25% spin at limit 5"). But it recommends that 25 % risk boost over "No boost", and the green "Discard 0" button looks like an action when it is not one. |
| 5 | Phone play | 7 | Car and corner on screen at both sizes; cards 52x80, gears 74x49, Go 276x46; the result card fits with Race again / Title visible. Gate PASS at every phone size. |
| 6 | AI and pacing | 7 | Rival turns are quick; a race is 1.5-2.5 min. A new player won 3 of 4 on defaults, including one race playing without Suggest. Winnable, and a bit soft: the plain player only lost the 375 race (2nd). |
| 7 | Feel | 7 | Start lights, cars slide, "Slipstream +2" and heat pops, rating line after each move, podium with heat, spin-out and slipstream stats. |
| 8 | Bugs | 6 | 0 errors, 0 stuck in 2 tutorials and 4 races, gate PASS. But the big green "Discard 0" button on the discard step does nothing when no card is picked: every such tap was dead (15-22 per race with random answers). "Keep all" works, so it is not a stopper. |
| | **Total** | **7.0** | **FAIL**: row 8 is below 7. 8+7+7+7+7+7+7+6 = 56/8. No stopper. |

### Earlier findings (R24)
| Finding | Status | Evidence |
|---|---|---|
| Row 4/5: car not on the board while planning at 375 (3 of 5 shots) | **Fixed**: car and "You" tag in 16 of 16 planning shots at 375 and in every 390 shot I checked. | R27-shots/rr-r1-375-plan03.jpg, rr-r3-375-plan12.jpg, rr-r4-390-plan20.jpg |
| Gate: 27-word text at 375x553 | **Fixed**: `--full` gate PASS. | gate log |
| Row 6: the Suggested boost badge decides the race | **Changed**: the plain player who answered boosts at random won 1 and came 2nd once; Suggest won 2 of 2. | rr-r4-390-result.jpg, rr-r3-375-result.jpg |
| Row 4: Suggested badge gives no reason | **Fixed**: "+2 spaces, 25% spin at limit 5". | rr-r1-375-q1.jpg |
| Row 4/8: "Dax leads by -2" after a 5th place | **Not seen**: no negative or zero lead in any score line of 4 races. | n/a (score lines logged) |
| Row 2: 9.6 s wait at the tutorial end | **Fixed** at the end (card right after the last tap). A 9.2 s wait remains before the spin-out step. | rr-tut375-end.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 / 4 | Discard step, tapped the big green "Discard 0" without picking a card | Nothing happens: no message, no shake, the step stays. Seen in all 4 races at both sizes. A newcomer reads the green button as the way on. | R27-shots/rr-r1-375-dead1.jpg, rr-r2-390-dead1.jpg |
| 4 / 6 | Boost question after a 9-speed reveal | The Suggested answer is "Boost -1 heat (risky): +2 spaces, 25% spin at limit 5". The badge pushes a newcomer into a one-in-four spin-out risk. | R27-shots/rr-r1-375-q1.jpg |
| 7 / 5 | Same moment | The "Slipstream +2" banner sits over the cars and the "You" tag. | R27-shots/rr-r1-375-q1.jpg |
| 2 | Tutorial at 375 and 390 | 9.2-9.3 s with nothing to tap after the Go that leads to the spin-out lesson. | R27-shots/rr-tut375-s31.jpg |
| 6 | Four default races | 3 wins and a 2nd; Easy is beatable without Suggest. | R27-shots/rr-r4-390-result.jpg, rr-r3-375-result.jpg |

---

## 2. perch-and-plume (shelf/W508-perch-gameplay @ 20510d21 after the local merge): 6.8, FAIL

Gate: **PASS** (`--full`: scenarios, phone-check at every size, rules-test "240/240 AI games finished"). Lab rows WARN 3/8 (not a gate fail).

What I played:
- Tutorial ("New here? Learn in 5 minutes") by touch at 375x667 and 390x844: 21 steps, 23 taps, 52-53 s, 0 dead taps, 0 errors.
  On info steps I tapped the lit target first (as the line says, e.g. "Tap the score"), then Next. Every lit target was on screen,
  on top and 44 px or more (smallest 44x44 at 375). Step 2 now shows the round tracker right above the coach line. It ends with
  "Tap to play a real game" and opens a real game's starting hand.
- Two Quick games on defaults (Quick game > Start the year > Keep these: 2 players, Easy rival Fern, hints on), as a newcomer who taps
  "Best" about half the time when one is shown and otherwise a random lit target:
  - 390x844: **lost on the tie-break, 46-46** ("Fern wins the year"), 105 s, 157 taps.
  - 375x667: **lost 7-36**, 80 s, 121 taps, only 2 birds played (see the 375 finding: Play a bird is hidden at the start of most turns).
- Fern never kept me waiting more than 1.5 s. 0 page errors, 0 console errors, 0 stuck states. 7 taps per game changed nothing,
  all on row chips while their powers were animating ("Your wetland birds use their powers"); the chips are not lit then, so I do not
  count them.
- Rotation: a running game at 390x844 rotated to 844x390, 667x375, then 375x667.
- Rules: unchanged from R26 and still right (4 rounds; I saw "Round 1 of 4 · 8 actions" and "Round 2 of 4" with 7 action squares;
  row yields, egg cost by column, any 2 food for 1, tray refill, goals, final scoring and the leftover-food tie-break).

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right; 8/7/6/5 actions per round are in the game. 120 own birds is a stated simplification. |
| 2 | Tutorial teaches | 7 | Stopper fixed: 21 one-line steps, 23 taps, 0 dead, 53 s, ends in a real game. Still: the shrinking 8/7/6/5 actions are never taught ("Practice: 4 actions. Real games: 4 rounds."), and the round goals are only shown on the score page. |
| 3 | First 10 seconds | 7 | Starting hand with "Goal: most points after 4 rounds..." and one "Keep these". |
| 4 | Turn clarity | 7 | Fixed: the dock now says "Fern's turn" / "Your move is finishing. Then Fern plays." Prompts say what to tap, Best badges, "Grub or seed?" is clear. A 46-46 tie ends with "Fern wins the year." and no line saying the tie went to leftover food. |
| 5 | Phone play | 5 | At 375x667 the dock opens scrolled down at the start of a turn: "Play a bird" and "Get food" sit under the "Your turn" header with only a thin strip showing; you see "Lay eggs" and "Draw birds". The round tracker and prompt are scrolled away too. In landscape the dock is full height now and the names read "You" / "Fern" (fixed), but the prompt and the four actions are scrolled out of view. |
| 6 | AI and pacing | 6 | Brisk: Fern moves in under 1.5 s; a game is 1.5-2 min of my taps. My newcomer lost both: a 46-46 tie-break at 390 and 7-36 at 375, where Play a bird was mostly hidden. |
| 7 | Feel | 7 | Painted birds, rival card shown, food and eggs fly, powers fire chip by chip with a caption, clean result table. |
| 8 | Bugs | 7 | Tutorial at 2 sizes and 2 full games: 0 errors, 0 stuck, 0 dead taps on lit targets. Gate PASS. |
| | **Total** | **6.8** | **FAIL**: rows 5 and 6 are below 7. 8+7+7+7+5+6+7+7 = 54/8 = 6.75. No stopper. |

### Earlier findings (R26)
| Finding | Status | Evidence |
|---|---|---|
| Stopper: tutorial step 2 target scrolled away, every tap swallowed | **Fixed**: tracker visible above the coach line with a Next; 0 dead taps at both sizes. | R27-shots/pp-tut375-s02.jpg, pp-tut390-s02.jpg |
| 8/7/6/5 actions never taught | **Not fixed** (same line). | pp-tut375-s02.jpg |
| Landscape dock a 132 px strip, names "Y..." / "F..." | **Partly fixed**: dock full height, names readable. New: prompt and the 4 actions scrolled out of the dock. | pp-rot-844x390.jpg, pp-rot-667x375.jpg |
| "Your turn" shown while Fern's move plays | **Fixed** ("Fern's turn", "Your move is finishing. Then Fern plays."). | pp-g2-375-d3.jpg |
| Board share 48 % at 375x667 | **Not re-measured**; the dock problem below matters more. | n/a |
| "Fresh spring morning" toast over the starting hand | **Not seen** after the tutorial. | pp-tut375-realgame.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 / 6 | Started a Quick game at 375x667 and waited for my turn | "Play a bird" and "Get food" are scrolled under the "Your turn" header (button top at 380 px, header ends at about 430 px); only "Lay eggs" (greyed) and "Draw birds" show. The same happened turn after turn in my 375 game, and my newcomer played only 2 birds. | R27-shots/pp-pab-covered-375.jpg |
| 5 | Late in my first 375 game, picked a bird to play | The yellow prompt "Tap Play to put Clover Bittern in your wetland." lay over the "Play:" confirm button; only its lower edge showed, and my driver went round that screen for minutes. I saw it once and could not make it happen again on demand; that screenshot was lost when I reran the game, so I do not score it. A clean state for comparison: | R27-shots/pp-375-play-confirm-clean.jpg |
| 5 | Rotated a running game to 844x390 and 667x375 | Dock full height, names readable, but the prompt and the 4 action buttons are scrolled out; only hand cards show. | R27-shots/pp-rot-844x390.jpg, pp-rot-667x375.jpg |
| 4 | Finished level at 46-46 at 390 | "Fern wins the year." No line says it was a tie decided by leftover food. | R27-shots/pp-g1-390-result.jpg |
| 6 | Two default games as a half-Best newcomer | Lost 46-46 (tie-break) and 7-36. | R27-shots/pp-g1-390-result.jpg, pp-g2-375-result.jpg |
| 2 (good) | Tutorial at both sizes | 21 steps, 23 taps, 0 dead, ends on "Tap to play a real game" and a real starting hand. | R27-shots/pp-tut390-s21.jpg, pp-tut375-realgame.jpg |
