# R44 strict gameplay review: shipwreck-isle, tidewake, hollowbough

- Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. PASS needs every row >= 7; a stopper caps the total at 4.
- Each game was checked out fresh (`git checkout -B work origin/<branch>`). Gates were run one at a time: `VIS_SLUGS="," build-all.py --quick` and `--full`.
- I played the STAGED build by touch only (Playwright 1.63, `isMobile` + `hasTouch`, `page.touchscreen.tap`, `elementFromPoint` checked before each tap), fresh profile, at 375x667 and 375x553. The default board was used (3D where the game has it).
- **Staging gap (all three games, not scored):** the staged folder still holds only `index.html`. I served `media/`, `models/` and `music/` from the checkout's `games/<slug>/`, which gave 0 game 404s (hollowbough: only `/sw.js`, which is a test-server artifact).
- Shots and driver output are in the reviewer's scratch folder (`scratch/shots/<game>/...`). They stay local.

| Game | Commit | Quick | Full | Rules | Tut | 10 s | Turn | Phone | AI | Feel | Bugs | Avg | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| shipwreck-isle | aaf1c419 | PASS | FAIL then PASS (run 1 failed with my light title probes running alongside; solo re-run passed) | 7 | 7 | 8 | **6** | 7 | 7 | 7 | 7 | 7.0 | FAIL |
| tidewake | ea284382 | PASS | PASS | 8 | 8 | 8 | 8 | 7 | 8 | 7 | 8 | 7.8 | **PASS** |
| hollowbough | dbbb8417 | PASS | PASS | 8 | 8 | 8 | 7 | 7 | 7 | 7 | 8 | 7.5 | **PASS** |

---

## 1. shipwreck-isle (shelf/W468-shipwreck-lean @ aaf1c419): 7.0, FAIL

Gates:
- **quick PASS** (scenarios 8/8, 148.8 s, EXIT 0).
- **full run 1 FAIL**: `phone-check: FAIL: stuck 8s` (phone-check 188.4 s). Two light Playwright title probes of mine ran at the same time.
- **full re-run alone PASS**: phone-check 175.5 s, sweep.js PASS (4 games), lab WARN 9/12 (a row-list warning, not a fail), EXIT 0. I count it as a load flake, not a stopper. It is the same check that failed under load in R42, so phone-check's 8 s "stuck" limit is tight for this game on a busy machine.
- `node rc/logic-test.js`: 277 pass, 0 fail (3 rules not testable headless).

### What I played

| Run | Size | How | Result | Errors | Dead taps |
|---|---|---|---|---|---|
| t1 Learn in 5 minutes | 375x667 | tapped every ring; Next / Continue / first option between rings | "You know the rules!" card after day 3, 79 s, 51 distinct ringed steps | 0 | 0 (2 ring taps needed a 2nd look before the step changed) |
| t2 Learn | 375x553 | same | end card, 97 s | 0 | 0 |
| g1-g5 default game (Marooned, 2 players, Easy), follow ✨ pawn by pawn, ⭐ / first story option | 667, 553, 667, 553, 667 | ✨, tap the finger, tap the ⭐ row; Start day on "All set" | **4 of 5 rescued** (day 10 each, pile 15/15). g3 lost on day 11: "The camp was cut off", pile 13/15 | 0 | 0 in 1,093 taps |
| o1-o3 own placements (random glowing place and row, no ✨) | 667, 553 | my driver capped own taps per day; it looped on a refused Start day, so these runs did not finish | not a result (driver limit) | 0 | 0 |

Hint followers took 164-186 s per game, with about 60 ✨ taps per game.

### R42 fix status (measured on every audited frame)

| R42 item | Status | Evidence |
|---|---|---|
| P5 plates cover each other | **Fixed** | 0 frames with two plates overlapping (> 40 px²), 0 plates on a glow centre, 0 overlapping glow rings, in 2 tutorials and 5 games at both sizes. Crowded plates step off to free board space (`g2/003-hint-d1.png`) |
| P6 board 185 px at 375x553 | **Fixed** | Plan board is 317 px tall at 375x553 (373 px at 667). Tray is one row, zoom buttons are hidden at that height |
| B1 zoom − under the finger | **Fixed** | Finger target was on a zoom button 0 times in 5 games (~300 finger taps) |
| P7 ✨ reason cut | **Fixed** | 0 cut status lines; the line is whole ("✨Carpenter → Explore place 3 🎲", "🔥 Pile +3. All set: Start day"). Some "why" texts are weak, see T2 |
| A2 deadline-aware hint | **Improved** | ✨ now adds pile wood on most days ("🔥 ✨ adds 3 wood to the pile"). Followers won 4/5 (R42: 2/4) |
| Normal warning at setup | **Done** | Tapping Normal shows "⚠ Normal is hard: the full rules, and ✨ hints won’t carry you." (15 px) right under the buttons |
| P8 small text | **Not fixed** | "You know the rules!" end-card tag 13 px (375x553); the tutorial step counter "15/55" 13 px; the ✨ icon 13.6 px |

### Scores

| # | Row | Score | Why (concrete) |
|---|---|---|---|
| 1 | Rules fidelity | 7 | logic-test 277/277. The day's phases, dice vs sure, night food and shelter, threats, Fire + 15-wood pile and the 12-day limit played correctly in 7 runs. The known Easy deal changes are unchanged |
| 2 | Tutorial teaches | 7 | Both sizes reach the end card with 0 errors and 0 dead taps. Still 55 steps (about 80-100 s by driver), many of them Next-only. The end card sits on top of the day summary, whose lines peek out behind it (`t1/012-final.png`) |
| 3 | First 10 seconds | 8 | Big Play and "New here? Learn in 5 minutes"; the first plan screen says "Carpenter: tap a glowing place" with a finger on a glowing place |
| 4 | Turn clarity | **6** | ✨ is whole and readable now. But a player who places pawns on their own (no ✨) starts **day 2 with a helper pawn selected and nothing glowing**: "No job for Dog now" with the Dog ringed (`o1/004-noglow-d2.png`, `o2/004-noglow-d2.png`), or the Hammer helper selected while the line says "Carpenter still has a pawn to place" and no place glows (`o3/003-timeout.png`). Seen in 3 of 3 own-play runs. Also weak ✨ "why" texts: "Build a shelter: Build a shelter", "Build Fire: Make Fire", "Threat: Find food for tonight", "Explore place 7" (no reason) |
| 5 | Phone play | 7 | All four R42 layout faults are fixed (plates, board height, zoom, cut line). Left: the 13 px "You know the rules!" tag and the 13 px step counter |
| 6 | AI and pacing | 7 | Easy followers won 4/5 in about 3 min a game. Normal now warns on setup. Following ✨ still needs no own decision |
| 7 | Feel | 7 | Die drop, flying gains and losses, chip bumps, event and fight cards, unchanged from R42. Every story beat is still Continue-paced |
| 8 | Bugs | 7 | 7 full runs: 0 page errors, 0 console errors, 0 stuck states, 0 dead taps. Result screens reached ("🏆 Rescued!", "☠ Lost on the island"). The first full gate failed under load |

**Total = (7+7+8+6+7+7+7+7)/8 = 56/8 = 7.0 · FAIL** (row 4 is under 7; no stopper).

### Fix list

1. **T1 (Turn clarity): never start the planning screen with a helper selected and nothing glowing.** Repro: 375x667, Play (Easy), on day 1 place every castaway pawn yourself (tap a glow, then a row; no ✨). The game auto-selects the Dog ("No job for Dog now"). Start day. Day 2 opens with the Dog still selected, no glowing place, and the line "No job for Dog now" (`scratch/shots/ship/o1/004-noglow-d2.png`). The same thing happens with the Hammer helper: the line says "Carpenter still has a pawn to place" while the Hammer is selected and nothing glows (`scratch/shots/ship/o3/003-timeout.png`). Fix: at the start of each plan step, and whenever the selected pawn has no job to take, select the first castaway pawn that has no job yet. Only fall back to a helper when every castaway is placed.
2. **T2 (Turn clarity): make the ✨ why a reason, not the job name again.** Seen: "✨Cook → Build a shelter: Build a shelter", "Build Fire: Make Fire", "✨Carpenter → Threat: Find food for tonight", "✨Cook → Explore place 7" (no why). Use hintWhy's plain text ("stops night wounds", "half of the rescue", "clears a threat", "new land to use") when the advisor's why repeats the label or names a different job.
3. **P8 (Phone): two 13 px labels.** The "You know the rules!" tag (`t2` end card at 375x553) and the tutorial counter "N/55". Raise both to 14 px.
4. **Gate note:** phone-check's "stuck 8s" failed again under load (R42 too). Not a stopper, but a sign that a beat can go 8 s without a visible change when the machine is slow.

---

## 2. tidewake (shelf/W498-tidewake-gameplay @ ea284382): 7.8, PASS

Gates:
- **quick PASS** (scenarios 8/8, 81.6 s, EXIT 0).
- **full PASS** first time, alone: phone-check 82.7 s, sweep `decisions {"start":9,"lay":17,"cannon":2} ... PROBLEMS 0`, lab WARN 9/12, EXIT 0.
- `node logic-test.js`: RULES 89 (85 tested, 4 table-only), PASS 85, FAIL 0. `game/rules-test.js`: 41 passed, 0 failed.

### What I played

| Run | Size | Result |
|---|---|---|
| Tutorial (tap only the ring, Continue between steps) | 375x667 | 32 steps, all 31 rules, 0 slow steps, 3 roll-card Continues each answered within 1 s, end card "You know the rules" with "Play a real game", 74 s |
| Tutorial | 375x553 | 31 steps, all 31 rules, 0 slow, 4 roll-card Continues answered (**R42's dead roll Continue is fixed**), 70 s |
| 17 Quick games (you vs 2 computers), "Just play" | 7 at 553, 10 at 667 | follow-★ newcomer won **8 of 10**; random newcomer won **3 of 7**. The "You win!" result card was reached (`fin667/003-result.png`) |

Across the 17 games: 0 page errors, 0 console errors, 0 dead Place taps, 0 stuck states. Round time from my Place to my next turn: median 4.3-6.8 s, max 8.0 s. No text under 14 px in the strip, cards or bubbles.

### R42 repro repeated ("Your start" bubble, Quick game, fresh profile per trial)

A trial is **valid** when, after the bubble is gone, a plain tap on the same point opens a sheet.

| Method | Size | Trials | Valid | Sheet opened |
|---|---|---|---|---|
| Corner: 4 px left of / 1-4 px below Got it's bottom-right corner | 375x667 | 10 | 10 | **0** (R42: 4/5) |
| Same, bottom-left corner | 375x667 | 10 | 10 | **0** |
| Bubble body (left of Got it) | 375x667 | 10 | 1 | 0 |
| Hold 700 ms on Got it | 375x667 | 10 | 0 | 0 |
| Double tap on Got it, gap 120 / 250 / 350 ms | 375x667 | 10 each | 0 / 1 / 3 | **0** |
| Double tap at the corner point (start mark under it), gap 120 / 250 / 350 ms | 375x667 | 10 each | 10 / 10 / 10 | **0 / 0 / 0** |
| Corner, corner-left, body, hold, double 120/250/350 | 375x553 | 5 each | 2 / 0 / 0 / 0 / 0 / 0 / 0 | **0** |

The fall-through is fixed: 0 sheets in 50 valid trials, including 30 double taps where a start mark sat right under the second tap.

### Scores

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | logic-test 85/85, rules-test 41/41. Wakes, edge sinks, leviathan sinks and "last junk afloat" played out correctly |
| 2 | Tutorial teaches | 8 | 31/31 rules in order at both sizes, one tap per step, 0 dead or slow taps. The roll card's Continue answers at 375x553 now |
| 3 | First 10 seconds | 8 | Rules in four lines on the title, "New here? Learn in 5 minutes", one-tap Quick game, then Learn / Just play |
| 4 | Turn clarity | 8 | "Your turn: lay a current", the danger note, ★ with Use ★, risk per tile, Stop pin |
| 5 | Phone play | 7 | Bubbles, Goal strip and buttons fit. The start label is now 13 px (was 10 px; `max(13px,.8rem)`), still 1 px under the bar. In 1 of 17 games (375x667, 19 turns) the Goal strip ran 10-36 px below the screen for 3 frames on my own late turns (`g375x667-5/result.json`). I could not catch a screenshot of it in 2 more tries. During rival turns the replay list pushes the Goal strip off screen (it scrolls inside `#ps`). That is fine while the rival plays |
| 6 | AI and pacing | 8 | Rival turns are brisk (round median about 5.5 s, max 8.0 s). Games last 24-155 s. Newcomers win often (★ 8/10, random 3/7), maybe a little soft, but fair |
| 7 | Feel | 7 | Gliding junks, wake banner ("Cobalt rolled 7 · leviathans wake!"), red sink mark and sunk cards. Unchanged |
| 8 | Bugs | 8 | 2 tutorials and 17 games: 0 errors, 0 dead taps, 0 stuck. The R38/R42 fall-through no longer reproduces |

**Total = (8+8+8+8+7+8+7+8)/8 = 62/8 = 7.75, shown as 7.8 · PASS.**

### Fix list (none required to pass)
1. Phone: raise the board "start" label from 13 px to 14 px (`.ostart span`, `html.ph .ostop span,html.ph .ostart span`).
2. Phone (watch): Goal strip 10-36 px below 667 for 3 frames on late own turns in 1 of 17 games (turns 40-44 of a 19-turn random-play game). Repro attempt: 375x667, Quick game, random tile choices until late game. Check `phFit` also runs after the danger note and crew list change on your own turn.
3. AI (watch): the ★ follower won 8 of 10. Check the default rivals' strength with a larger seeded batch.

---

## 3. hollowbough (shelf/W482-hollowbough @ dbbb8417): 7.5, PASS

Gates:
- **quick PASS**: own checks 13/13; WARN universal "button covered by div.gxh-tx" on a Parcel Dove card (same as R42); EXIT 0.
- **full PASS** alone: phone-check 63.4 s, SWEEP PASS, lab WARN 10/12, EXIT 0.
- `node logic-test.js`: rules total 215 (N/A 1), tested 214, pass 214, fail 0.

### What I played

| Run | Size | Path | Result | Time | Errors |
|---|---|---|---|---|---|
| Tutorial | 375x667 | title > New here? Learn | 36 steps, 41 taps (10 Next-only), 0 slow, end card "Play a real game" | 48 s | 0 |
| Tutorial | 375x553 | same | 37 steps, 41 taps (11 Next-only), 0 slow | 43 s | 0 |
| g1-g3 | 375x553 | Play > Play now (Guided), tap what the hint finger shows, first button on cards | won 38-34, 54-39, 38-35 | 89-131 s | 0 |
| g4-g6 | 375x667 | same | won 39-31, 48-30, 47-38 | 117-139 s | 0 |

Every game reached the result card ("You win!", city / purple bonuses / tokens / goals / Journey table, Play again).

### R42 fix status

| R42 item | Status | Evidence |
|---|---|---|
| 1 Coach text 12.5 / 13.5 px | **Fixed** | `.gxh-bub .gxh-tx` 14 px, `.gxh-tt` 14.5 px. 0 visible texts under 14 px in the prompt, bubbles, action tray or cards in 6 games |
| 2 Finger under `#acts` | **Fixed** | `#finger` z-index 49 over `#acts` 45. The finger was drawn above the Prepare bar in my shots at both sizes |
| 3 Finger covers cost / reward text | **Not fixed** | In 92 of 474 frames with the finger shown (19 %), its box overlaps a `.pvc-cost` or `.pvc-name` box by more than 4x4 px. On turn 1 it still covers the suggested place's reward: "3 twigs" on Twig Heap (`g375x667-1/002-fingunder.png`), "2 cards, any 1" on Postbag Clearing (`g375x553-1/004-finghit.png`). In the meadow it covers "Costs 3 twigs / 1 resin" on Glowworm Playhouse (`g375x553-1/006-dead.png`). Cause: the R42 change and meas-r39's check use `.cost,.ci,.zcost,.rew,.rw`, but the cards' cost and reward lines are `.pvc-cost` |

### Scores

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | logic-test 214/214. Results list city, purple bonuses, tokens, goals and Journey |
| 2 | Tutorial teaches | 8 | 36-37 one-line steps, 0 dead or slow taps at both sizes, then a real game. About a quarter of the taps are still Next-only |
| 3 | First 10 seconds | 8 | "Place a worker" pill plus a finger on a glowing place on turn 1. The finger covers that place's reward |
| 4 | Turn clarity | 7 | The prompt pill counts down and is never cut. The finger hides cost or reward text on about 1 in 5 hints |
| 5 | Phone play | 7 | Coach text is 14 px+ and the finger sits above the tray: the two R42 phone blockers are gone. No target under 44 px. The finger-over-cost item stays (row 4) |
| 6 | AI and pacing | 7 | The rival is unchanged and plays sensibly and briskly. Games take 1.5-2.3 min. But the hint follower won 6/6 here (margins 3-18) after 7/7 in R42, so 13 of 13 on the default level. That is beatable, but soft |
| 7 | Feel | 7 | Painted places and cards, finger hint, coach and result table. Unchanged |
| 8 | Bugs | 8 | 2 tutorials and 6 games to the result: 0 page or console errors, 0 stuck states. My driver's coarse "no change" check flagged some question-choice taps (selection only), but every game moved on and finished, so none are counted |

**Total = (8+8+8+7+7+7+7+8)/8 = 60/8 = 7.5 · PASS.**

### Fix list (none required to pass)
1. Row 4: add `.pvc-cost` (the card cost and place reward line) and `.pvc-name` to fingerSpot's avoid list, and to meas-r39's overlap selector so the check can catch it. Repro: fresh profile, Play > Play now, 375x667: on turn 1 the finger covers "3 twigs" on Twig Heap (`g375x667-1/002-fingunder.png`).
2. Row 6 (watch): 13/13 newcomer wins on Guided over R42 and R44. Run a 20+ game seeded batch, and nudge the rival up if the win rate stays above about 80 %.
3. Staging: the staged folder has no `media/`. A deploy of that folder alone would 404 all painted UI.
