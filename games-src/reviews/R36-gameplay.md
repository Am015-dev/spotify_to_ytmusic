# R36 gameplay re-review (12 Nov 2026)

Strict re-review by `GAMEPLAY-RUBRIC.md`. For each game I checked out the branch tip, merged `origin/alex/brave-carson-rbpmlk`
locally (a no-op for all three: every tip already holds it), and ran both gates on that tree:
`VIS_SLUGS="," build-all.py --quick` and `--full`. I served the built page next to its `games/<slug>/` media and played it by real
touch only (`page.touchscreen.tap`), as a new player on default settings, starting from the title screen. Screenshots are in `R36-shots/`.

All three tips already contain the shared branch, so the tested commit is the branch tip.

Machine note: my first gate run for shipwreck-isle overlapped with my own play runs (load average 20 on 4 cores), and its phone-check
failed on slow taps. I threw that run away and re-ran both gates with nothing else running. Only the clean runs are reported.

| Game | Tested commit | Total | Result | Quick gate | Full gate | Lowest rows |
|---|---|---|---|---|---|---|
| shipwreck-isle | a0de6533 | **4.0** (capped; 6.0 uncapped) | **FAIL** | PASS | **FAIL** | Bugs 4 (dead taps), Tutorial 5 |
| thornbound | dd813c17 | **6.0** | **FAIL** | **FAIL** | PASS | AI/pacing 4, Feel 5 |
| nebula-aces | e917a7ff | **7.1** | **FAIL** | PASS | PASS | Phone play 6 |

---

## 1. shipwreck-isle (shelf/W468-shipwreck-lean @ a0de6533): 4.0 capped, FAIL

**Quick gate: PASS.** "[scn] shipwreck-isle 8/8 scenarios ok ... 1/1 PASS ... EXIT 0".

**Full gate: FAIL.** Phone-check passed at every size (390x763, 375x553, 844x390, rotations, stale). The quick sweep failed with
"FAIL 10 problems": glowing places that did not respond at both sizes, then a stuck plan.
- 375x553 seed 101: "glowing place 7 did not respond: ... Hammer: tap a place, or start", five times, then "stuck >8s at plan2".
  The finger lands on `bfmore`, the "+1" chip drawn on the camp tile, not on the tile.
- 390x763 seed 102: "glowing place 2 did not respond" for the Cook (finger on `bfmore`) and then for the Dog, then "stuck >8s".
- These failures happen **even with the fixer's new retry tap**. The sweep's own counter says `"retry":10`.

What I played (no seed, speed, graphics or scenario overrides; I only cleared local storage):
- **Tutorial** ("New here?" > Learn) at 390x844, tapping only the lit ring. PASS by its own check: 45 of 49 steps shown, 26 of 26 rule
  ids. **79 taps** (45 ring taps plus 34 Continue or Next taps) and **278 s**. Every ring target is 60 px or more. It ends on "You know
  the rules! / Fire and 15 wood by day 12" with "Keep playing / New game". At 375x667 it also passes: 46 of 49 steps, 81 taps (46 ring plus 35 Continue/Next), 211 s, ring targets 59 px or more.
- **Two full default games** by touch (Marooned, 12 days), using my own plan: tap a castaway, tap a random glowing place, answer
  questions, and use ✨ only when a castaway had nothing to do.
  - 390x844: **lost on day 12**, "Time ran out: no ship came", 216 s, 76 board taps, 1 dead glowing place.
  - 375x667: **lost on day 12**, "Time ran out: no ship came", 115 s, 46 board taps, 3 dead glowing places.
  - My driver stopped at the game-over flag and took its screenshot there, during the last night. It did not wait for the result
    card, so I did not re-check the result card this pass. The gate sweep did reach the end of each of its games.
- 0 page errors in all runs.

**Rules check.** I checked the published scenario-1 rules online again (notes kept locally only). The goal (Fire plus a 5-stage,
15-wood pile, win on day 10, 11 or 12), "only one stage per round" and wood that can't be taken back all match the engine and the
camp pop-up ("Add wood to the signal pile (no pawn)"). Phases, two pawns for a sure success, threats, hunt (weapon against strength)
and weather all match, as R8 found. I saw nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | The core turn and the scenario goal match the published rules. As in R8, I saw no mystery card in a played game. |
| 2 | Tutorial teaches | 5 | Fixed since R8: down from 57 steps / 90 taps to 45 steps / 79 taps. Day 3 has a real explore roll, and the adventure card shows. **But it never shows how to win**: no step adds wood to the signal pile and no step builds the Fire. The only mention is the first line, "Light a fire and stack 15 wood". The end card then sits over a red line saying "No fire yet, day 4: build the fire first". Still 17 info steps plus 34 Continue taps, and 4.6 min against the promised 5. |
| 3 | First 10 seconds | 7 | "New here?" and the goal line, then Day 1/12 and Pile 0/15 on the bar, and "tap a glowing place". |
| 4 | Turn clarity | 7 | Fixed since R8: the day summary is now in words, with red warnings ("No shelter: everyone takes a wound each night. Build one (2 wood).", "Food 0 of 2 for tonight..."). The pile row in the camp pop-up now says "(no pawn)". Help tips are off by default in a fresh profile: no first-time bubbles showed in my games. |
| 5 | Phone play | 6 | The "+1" chip sits on top of the camp tile and swallows taps meant for the glowing place. Action labels on the board overlap ("Build ... risky" under "Explore ... risky"). At 375x667, the board is panned so the top tiles sit under the supplies bar. At 375x667, the last night's bar shows Day, Food, Wood, Life and Shelter but no Pile chip, so the goal counter is off screen. Text is 14 px or more and ring targets are 60 px or more. |
| 6 | AI and pacing | 6 | My own plan lost both games on day 12 (the 390 game had the pile at 6/15 on day 7). The pace and summary warnings now say what is wrong, but a newcomer who doesn't know how to feed the pile (see row 2) loses. A game takes 2-4 min by touch. |
| 7 | Feel | 6 | Unchanged from R8: small, quick dice and cards. Most of a day is Start day, then Continue. |
| 8 | Bugs | 4 | **Stopper: dead taps on glowing places at both sizes**, in my games (4) and in the gate sweep (10 problems, 2 stuck plans). 0 page errors. |
| | **Total** | **4.0** | **FAIL**. Uncapped: 7+5+7+7+6+6+6+4 = 48/8 = 6.0; a dead tap is a stopper and caps the total at 4. |

### Earlier findings (R8)
| Finding | Status | Evidence (games-src/reviews/R36-shots/...) |
|---|---|---|
| Row 2: 57 steps plus 34 Continue taps (90 taps) | **Partly fixed.** 45 steps plus 34 Continue/Next taps (79 taps), 278 s. | ship-tut390-camp-pop.jpg, ship-tut390-end.jpg |
| Row 2: tutorial roll was the Cook's build dice; adventure card had no effect and was missing at 375 | **Fixed** at both sizes. Day 3 "A real roll: tap this unknown place, and go alone", then "The ? token drew this adventure card" (both sizes). | ship-tut390-end.jpg |
| Row 4: day summary as bare icons | **Fixed.** Now in words with red warnings. | ship-375-lost-day12.jpg |
| Row 4: "Add wood to the pile +3" used no pawn with no explanation | **Fixed.** The row reads "Add wood to the signal pile (no pawn) +1 wood". | ship-tut390-camp-pop.jpg |
| Row 5: "+N" chip covers the Camp label | **Not fixed, worse.** The "+1" chip now blocks taps on the glowing camp (dead taps). | ship-390-deadtap-place2.jpg |
| Row 5: 375 board strip small, top tiles under the supplies bar | **Not fixed.** | ship-375-deadtap-place14.jpg |
| Row 5: camp pop-up showed 2 of 7 rows at 375 | **Fixed at 390.** The taller pop-up shows all 8 rows at 390x844 (gate phone-check passes at 375x553). | ship-tut390-camp-pop.jpg |
| Row 6: ✨ never fed the pile; own plan lost by day 7 | **Partly fixed.** Own-plan games now last to day 12 but still lose. I did not re-run ✨-only games this pass. | ship-390-lost-day12.jpg |
| Row 6: no warning while sleeping outside or starving | **Fixed.** The day summary warns about shelter and food. | ship-375-lost-day12.jpg |
| Row 1: mystery cards never drawn | **Not verified.** I saw none in 2 games. | - |
| Row 7: a day is ✨, Start day, Continue | **Not fixed.** | - |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 / 5 | Default game at 390x844, day 7, tapped glowing place 2 for the Cook | Nothing happened, and a second tap 0.5 s later did nothing either. The finger hits the board's `c3` layer, not the tile. The gate sweep shows the same on the "+1" camp chip (`bfmore`) at 390 and 375. | ship-390-deadtap-place2.jpg |
| 8 / 5 | Default game at 375x667, day 3, tapped glowing places 14, 2 and 13 for the Carpenter | All three ignored the tap and the retry. The top of the board sits under the supplies bar. | ship-375-deadtap-place14.jpg |
| 2 | Read every tutorial step (guide.js) and played it to the end | No step adds wood to the pile or builds the Fire, the two things needed to win. The end card shows over "No fire yet, day 4: build the fire first". | ship-tut390-end.jpg |
| 5 | Last night of the 375x667 game | The top bar shows Day, Food, Wood, Life and Shelter; the Pile chip is not on screen. | ship-375-lost-day12.jpg |
| 6 | Two own-plan default games | Both lost on day 12, "Time ran out: no ship came". | ship-390-lost-day12.jpg, ship-375-lost-day12.jpg |

### The sweep.js change (one retry tap before "did not respond")
**Yes, it can hide a real dead tap.** The new code taps a glowing place once, waits up to 2.5 s, and if nothing happened it taps the
same spot again after 0.5 s. It reports "did not respond" only if the **second** tap also fails, and it counts the first-tap
failures only in a `retry` number inside the help-kit summary, which never fails the run. A player whose first tap does nothing has
met a dead tap, whether or not a second tap works. I logged each first-tap failure in my own games: 4 in 2 games. In my runs every one of
them also failed the retry, so in my runs the retry hid nothing. But the gate's own summary shows `"retry":10`, so the gate now
treats "works on the second tap" as a pass. The retry should count as a problem, or at least be printed as a failing number.

---

## 2. thornbound (shelf/W489-thornbound-rules @ dd813c17): 6.0, FAIL

**Quick gate: FAIL**, the same on two runs. "scenarios 10/12 ok":
- `menu`: "no text covered at its centre: [board] text not topmost: "5" <text> is under <div.gxh-tx> | "10" ... | "ROUND" <text> is
  under <div.gxh-bub.on>". A help bubble sits on top of the score track and the round counter.
- `tb-story-start`: "setup failed: GXS.wait timed out: ... GXCOACH.running && document.querySelector('[data-gxt-skip]')".

**Full gate: PASS.** Phone-check passed at all 6 sizes ("1/1 PASS ... EXIT 0"). The lab warning "10/12 checks" is not a gate fail.

What I played:
- **Tutorial** ("New here? Learn in 5 minutes") at 390x844 and 375x667 with the game's touch walker, which taps only the spotlight and
  tries wrong taps: **38 steps** at both sizes, 66 s and 59 s, 27 "tap to go on" taps, 76 wrong taps refused, 0 errors. The steps run
  over 2 rounds and include takeback, the tied Clash (tiea, tie, tieb, tiec), Lore buy (lore, lore2) and steal (bid3, bid4, kc). One
  check failed: at the goal step a wrong tap gave no "Tap ..." hint.
- **Two default games** from the title (Quick game > Start, nothing changed: you plus 1 Easy rival, 4 rounds, hints on). I played as a
  newcomer who taps the coach button, then the suggested glowing card or spot, then any glowing thing, then the main button. I waited
  1.2 s after every tap and counted a tap as dead when nothing on screen changed.
  - 390x844: **lost 4 - 20** ("Gilded Court ... wins with 20 Influence"), 401 s, 89 taps, 0 dead taps, longest still screen 3.4 s, 0 errors.
  - 375x667: **did not finish.** In round 2, at "Tap the regions in the order they should fight", a full-screen card pop-up
    ("Dockside Broker. You can't play this card now.") covered the board. No ✕ or close button was visible in the 375x667 frame.
    My driver, which taps only lit things, found nothing to tap for 757 s. A person may still close it (Esc, or a close button below
    the fold); I did not confirm that, so I have not scored it as a stopper.

**Rules check.** The published game, checked online (notes local only): Influence wins after a fixed number of rounds (4 short, 5
standard, 6 long). Bids in strength order take a Kingdom Card, steal one a rival holds with a higher bid, or take your card back. The
Herald adds +1 where it stands, each Supporter adds +1 in its region, and Lore buys the faction's stronger cards. The tutorial lines
match all of this. The first game uses the official short length (4 rounds). I saw nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Engine as R23. Tied Clash, takeback, steal and Lore buying are now taught. |
| 2 | Tutorial teaches | 7 | Fixed since R23: 38 one-line steps over 2 rounds in about 1 min, and every R23 gap is now a tap step. Still 27 "tap to go on" taps between steps, and a few reading-only cards (goal, map, tactics, attrition). |
| 3 | First 10 seconds | 7 | The title's first button is "New here? Learn in 5 minutes". The goal card is down to a headline plus 3 bullets, then "Make a secret bid: tap a card, then the glowing spot". |
| 4 | Turn clarity | 6 | The "YOUR TURN" line plus the lit card help. But I was lost at the clash order: a card that can't be played still opens a full card sheet, and that sheet hides the prompt. Bottom chips (Coin, Whispers, Pledges, Favour, Tactics) are labels with no explanation on the board. |
| 5 | Phone play | 6 | Full gate PASS. But the quick gate fails on a help bubble over the score track. At 375x667 the "Make a secret bid" bubble covers the top half of the board. The bottom chips are 70-73x40 px (under 44), the 375 bid spot is 40x57, and the first screen has 24 text items under 14 px. |
| 6 | AI and pacing | 4 | Following the game's own suggestions against 1 Easy rival, I **lost 4 - 20**. The earlier newcomer record was 1 win in 3. Waits are short now (longest still screen 3.4 s), but a game is still about 5-7 min. |
| 7 | Feel | 5 | The painted board and cards look good. Play is still discs and numbers flipping, with no clash animation worth watching. |
| 8 | Bugs | 6 | 0 page errors, 0 dead taps at 390. At 375 the full-screen card sheet ended my run (see above). The quick gate fails 2 scenarios on both runs. |
| | **Total** | **6.0** | **FAIL**. 7+7+7+6+6+4+5+6 = 48/8 = 6.0. Rows 4, 5, 6, 7 and 8 are below 7. |

### Earlier findings (R23)
| Finding | Status | Evidence (games-src/reviews/R36-shots/...) |
|---|---|---|
| Row 2: 28 steps, 1 round, 8 Next-only, 6 silent watch steps of 7-18 s | **Fixed.** 38 steps over 2 rounds in 59-66 s, with no long silent waits. | tb-390-goal-card.jpg |
| Row 3: goal card 4 lines of rules, busy first screen | **Mostly fixed.** Headline plus 3 bullets. | tb-390-goal-card.jpg |
| Row 4: no suggestion unless you tap the bulb | **Fixed.** Hints are on by default; the lit card and spot lead each step. | tb-375-first-turn-bubble.jpg |
| Row 6: newcomer lost 4-21 and 5-17; 6.5 min games, 180+ "tap to go on" | **Partly fixed.** About 89 taps a game now, and the longest still screen is 3.4 s. But I still **lost 4 - 20** against the Easy rival. | tb-390-lost-4-20.jpg |
| Row 5 / 8: Govern sheet half under the board, 26 dead taps | **Not seen** (0 dead taps at 390); a new full-screen sheet problem appeared at 375 instead. | tb-375-cardpop-covers-clash-order.jpg |
| Row 5: gate FAIL (board 48% at 375x553) | **Fixed.** Phone-check passes at every size. | gate log |
| Row 7: static board, discs and "?" tokens | **Not fixed.** | tb-390-lost-4-20.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Default game at 390x844 (1 Easy rival, 4 rounds), following the suggested glow | Lost 4 - 20. | tb-390-lost-4-20.jpg |
| 4 / 8 | Default game at 375x667, round 2, clash order | A full-screen card sheet ("You can't play this card now") covered the board and the prompt, with no close button visible. My run could not go on. | tb-375-cardpop-covers-clash-order.jpg |
| 5 | Quick gate, scenario `menu`, run twice | Fails both times: a help bubble covers the score-track numbers and "ROUND". | gate log |
| 8 | Quick gate, scenario `tb-story-start`, run twice | "GXS.wait timed out" waiting for the coach's Skip button in the story start. | gate log |
| 5 | First turn at 375x667 | The "Make a secret bid" bubble covers the top half of the board. The bottom chips are 70x40 px and the bid spot is 40x57 px. | tb-375-first-turn-bubble.jpg |

---

## 3. nebula-aces (shelf/W486-nebula-bench @ e917a7ff): 7.1, FAIL

**Quick gate: PASS** ("1/1 PASS ... EXIT 0"). **Full gate: PASS**: phone-check passed at all 6 sizes in 102 s; same lab warning as
R32 ("9/12 checks", not a gate fail).

What I played:
- **Tutorial** ("New here?") at 390x844 and 375x667 with the game's lesson walker, which taps only the spotlight or the ghost finger
  and tries wrong moves: **all pass** at both sizes. Every lesson line is 12 words or fewer, a wrong move or action is refused, the
  drill really barrel rolls, boosts, tries a move off the mat (refused) and bumps, and the end card starts a real game. 0 page errors.
  The coached reroll was done by touch in both runs without the R32 loop.
- **Two default Quick games** ("Launch"), following the suggestions: the ★ move the dial opens on, the recommended action and target,
  then Roll / Done. The driver taps about 0.15-0.5 s after a target appears, faster than a person.
  - 390x844: **VICTORY in round 9**, 51 taps, 0 errors, 0 stuck states.
  - 375x667: the game ended with my side as the winner in round 9, 51 taps, 0 errors. My screenshot was taken after the result card had
    already closed (it shows the title), so I don't have the 375 result card.
  - Both games ended the same way: round 9 and 51 taps. The first game seems to play out the same way each time when you follow the
    suggestions.

**Rules check.** Same base-rules engine R28 and R32 checked: secret dials, lowest skill moves first, one action, stress, a bump skips
the action, off the mat is destroyed, highest skill fires first, range bonus, shields first, crits. I saw nothing invented. The
R32 notes on the Rules screen (asteroid "damage die" wording, simultaneous fire at equal skill) were not re-checked this pass.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | As in R32. |
| 2 | Tutorial teaches | 7 | Fixed per F5: the coached reroll worked by touch at both sizes, the lesson refuses wrong taps, and every rule line is 12 words or fewer. Still split into bubbles, duel, card, drill and card. |
| 3 | First 10 seconds | 7 | "Launch" and "New here?" are big, then "Tap your ship to plan its move" with a finger. |
| 4 | Turn clarity | 7 | One hint line and a finger on the next thing at every step ("Tap ◉ Focus: your next shot hits harder"). |
| 5 | Phone play | 6 | Gate PASS and targets are 44 px or more. **Not fixed**: at 375x667 the "Round 1: plan your move" bubble still covers the enemy ship Knifepoint. A sliding "Your turn / Kael Varro flew. Now pick a..." banner runs over Knifepoint and is cut off at the right edge. Kael's name plate showed hearts and shield in my shots, so the Lock-chip overlap was not seen. |
| 6 | AI and pacing | 7 | Following the suggestions won 2 of 2 in round 9, at a brisk pace. Both games played out the same way, so a replay feels the same. |
| 7 | Feel | 8 | 3D ships fly their paths, dice tumble with MISS / hit stamps, laser lines, the rival's turn plays out step by step, and the VICTORY card is painted. |
| 8 | Bugs | 8 | 2 tutorials and 2 games: 0 page errors, 0 stuck states, and no fast-tap loop at the reroll. |
| | **Total** | **7.1** | **FAIL**: row 5 is below 7. 7+7+7+7+6+7+8+8 = 57/8 = 7.1. No stopper. |

### Earlier findings (R32)
| Finding | Status | Evidence (games-src/reviews/R36-shots/...) |
|---|---|---|
| Row 2: fast tap on the reroll die closed the pick mode (looped 120 times) | **Fixed** in my runs: the lesson walker finished the coached reroll at both sizes. | - |
| Row 2: coach lines run late | **Better.** The lesson test's line-per-step checks pass; I did not time each line. | - |
| Row 5: ⌖ Lock chip on Kael's name plate at 375 | **Not seen.** Hearts and shield are visible in my 375 shots. | na-375-your-turn-overlap.jpg |
| Row 5: "Your turn" bubble hides Knifepoint at 375 | **Not fixed.** Now the "Round 1: plan your move" bubble covers Knifepoint, and a sliding banner crosses it later. | na-375-first-turn-bubble-covers-knifepoint.jpg, na-375-your-turn-overlap.jpg |
| Row 6: game length swings (round 10 to round 20) | **Changed.** Both games ended in round 9 the same way. | na-390-victory-r9.jpg |
| Row 1: Rules screen "damage die" wording | Not re-checked. | - |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | First turn at 375x667 | The "Round 1: plan your move" bubble covers the enemy ship Knifepoint. | na-375-first-turn-bubble-covers-knifepoint.jpg |
| 5 | Round 3 at 375x667 | The "Your turn / Kael Varro flew. Now pick a..." banner slides over Knifepoint and is cut off at the right edge. | na-375-your-turn-overlap.jpg |
| 6 | Two default games following the suggestions | Identical games (round 9, 51 taps, same result). | na-390-victory-r9.jpg |
