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
