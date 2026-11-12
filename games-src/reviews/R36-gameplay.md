# R36 gameplay re-review (12 Nov 2026)

Strict re-review by `GAMEPLAY-RUBRIC.md`. For each game I checked out the branch tip, merged `origin/alex/brave-carson-rbpmlk`
locally (a no-op for all three: every tip already holds it), and ran both gates on that tree:
`VIS_SLUGS="," build-all.py --quick` and `--full`. I served the built page next to its `games/<slug>/` media and played it by real
touch only (`page.touchscreen.tap`), as a new player on default settings, starting from the title screen. Screenshots are in `R36-shots/`.

Machine note: my first gate run for shipwreck-isle overlapped with my own play runs (load average 20 on 4 cores), and its phone-check
failed on slow taps. I threw that run away and re-ran both gates with nothing else running. Only the clean runs are reported.

| Game | Tested commit | Total | Result | Quick gate | Full gate | Lowest rows |
|---|---|---|---|---|---|---|
| shipwreck-isle | a0de6533 | **4.0** (capped; 6.0 uncapped) | **FAIL** | PASS | **FAIL** | Bugs 4 (dead taps), Tutorial 5 |

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
  the rules! / Fire and 15 wood by day 12" with "Keep playing / New game". The 375x667 tutorial run was still going when I wrote this.
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
| Row 2: tutorial roll was the Cook's build dice; adventure card had no effect and was missing at 375 | **Fixed at 390.** Day 3 "A real roll: tap this unknown place, and go alone", then "The ? token drew this adventure card". Not yet seen at 375. | ship-tut390-end.jpg |
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
