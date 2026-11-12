# R35 gameplay re-review (strict), 12 Nov 2026

Reviewer R35. Scored by `GAMEPLAY-RUBRIC.md`. I changed no game code and did not trust the fixers' notes.

How I played: each branch fetched fresh and checked out as a local worktree (`git checkout -B rv-<x> origin/<branch>`), then
`origin/alex/brave-carson-rbpmlk` merged in locally (not pushed). Gate: `VIS_SLUGS="," build-all.py --full --out /tmp/r35/<x> <slug>`.
The staged page was served over http next to the branch's `games/<slug>/` media, cards, models and music. Playwright 1.63 phone
contexts (isMobile, hasTouch). Every action was a `touchscreen.tap` on a visible element whose centre passed elementFromPoint.
The drivers read the screen and never called a game function. All games used default settings. A "dead tap" means a tap on a lit
target where nothing on the page changed within 1.5 s. Up to four browsers ran at once on 4 cores, so measured waits may be a little long.
Rules were checked against the published rules; notes stayed local. Screenshots: `games-src/reviews/R35-shots/`.

| Game | Tested commit | Total | Verdict | Gate | Lowest rows |
|---|---|---|---|---|---|
| doorkick-dungeon | ea277eee | 7.3 | FAIL | PASS | 5 Phone 6 |
| vinegrave | d48c7b8c | 7.1 | FAIL | PASS | 5 Phone 6 |
| hollowbough | e42ccd28 | 7.3 | FAIL | PASS | 6 AI 6 |

---

## 1. doorkick-dungeon (shelf/W502-doorkick-gameplay @ ea277eee + local merge): 7.3, FAIL

Gate: **PASS** (`--full`: phone-check PASS at all 6 sizes, 1 tolerated dead tap in 3 of them. Lab WARN 9/12 (not a gate fail).
Sweep "SWEEP CLEAN 4 games (4 reached a winner)". EXIT 0.)

What I played:
- **Tutorial** ("New here? Learn in 5 minutes") by touch at 390x844 and 375x667. Both sizes: 28 steps, 35 taps, **0 dead taps**,
  52-53 s, 0 errors. Longest wait for the next lit step was 6.1 s (rival turns are shown). At 375 one lit target is under 44 px (step 10).
  The last step's "Play a real game" opens a real Quick game ("How to win" card, then the deal). Fixed.
- **Real games**: Quick game > Me vs computer > Start > Just play (defaults: faster play, 3 rivals). My newcomer follows the gold star
  and its prompt, taps the glow, and taps the button the prompt names:

| Size | Result | Time | Taps | Dead taps | Wait before my next decision |
|---|---|---|---|---|---|
| 390x844 | **won** as helper: Morwen reached 10 with my help; I was level 4 | 3.3 min | 207 | 0 | median 0.4 s, max 2.9 s (one 33 s idle was my driver missing a panel's ×) |
| 375x667 | **won** as helper: Tansy reached 10 with my help; I was level 5 | 2.7 min | 207 | 0 | median 0.4 s, max 2.9 s |

  0 page errors and 0 console errors in all four runs. Rival turns are now brisk (the R30 6.8 s median per round is gone).
- **Rules check**: the run needs 5+ on a die (elf +1; the tutorial's "4+ escapes (elf +1)" is said to an elf, so it is right). Faster play
  (draw a face-down door card at the start of your turn; a helper in the winning fight also wins) is the rulebook's own option, and
  "Full" is still under Game length. Kick, fight or run, Bad Stuff, curses, meddling, helping for treasure, selling 1,000 gold
  for a level (never the winning one), and charity down to 5 are all as published. I found nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. Both of my wins were the faster-play helper rule, which is published. |
| 2 | Tutorial teaches | 8 | Fixed: step 17 teaches the free door card each turn ("Each turn starts with a free door card. Tap your new card."), and Finish starts a real game. 35 taps, 0 dead at both sizes. The word "listen" is only on the end card. |
| 3 | First 10 seconds | 7 | Start, then Just play. The "How to win" card still opens after a rival has already moved. |
| 4 | Turn clarity | 7 | The star plus its prompt still leads a newcomer through every turn. The result headline says "Victory! You are a Level 10 Legend!" to a player who ended at level 4. The line under it explains the helper rule. |
| 5 | Phone play | 6 | Fixed: at 375 the door no longer covers Run, and the item panel now sits above the hand with the starred card visible. Still: at 375 the result card's "Play again" bar covers the result table, and my own row and Grub's are hidden under it. A "+2" float sits over the result art. Tutorial step 10 at 375 lights a 61x37 target, and its bubble covers the fight score. At step 12 at 375, the "Lost: Brave Bucket" toast sits on top of the "Caught! Bad Stuff!" banner (an R12 finding that is back). |
| 6 | AI and pacing | 7 | Rivals are brisk (median 0.4 s to my next decision) and games take about 3 min. The newcomer won both games, but only by helping the leader. I never got past level 5, while rivals reached 6-10. |
| 7 | Feel | 7 | Painted art, door kick, star prompts, confetti result with kills, helps and curses per hero. |
| 8 | Bugs | 8 | Gate PASS. 2 tutorials and 2 full games: 0 errors, 0 stuck states, 0 dead taps on lit targets. |
| | **Total** | **7.3** | **FAIL**: row 5 is below 7. 8+8+7+7+6+7+7+8 = 58/8 = 7.25. No stopper. |

### Earlier findings (R30)
| Finding | Status | Evidence |
|---|---|---|
| Row 5: 3D door covers Run at 375 (tutorial step 10) | **Fixed**: Run is clear at 375. | R35-shots/dk-tut11-run-clear-375.jpg |
| Row 2: Finish lands on the story map; listening never taught | **Fixed**: step 17 teaches the free door card; Finish opens a real game. | R35-shots/dk-tut17-listen-375.jpg, R35-shots/dk-finish-real-game-375.jpg |
| Row 5: story map title wraps "The / Gold / en / Boot" | **Not re-checked** (Finish no longer goes there). | n/a |
| Row 4/5: treasure panel hides the starred card at 375 | **Fixed**: the panel sits above the hand and the starred card shows (seen at 390 too). Its text still repeats itself ("armor. +3 (Dwarves) ... only for Dwarves" and "Dwarves only."). | R35-shots/dk-panel-above-hand-390.jpg |
| Row 4: star stuck on "Play ★ Loophole" | **Not seen**: Loophole came up once and resolved ("Cheat: wear ..."). | n/a |
| Row 5: gear chips cut at the right edge | **Not seen** in my games. | n/a |
| Row 5: "+1 Lv" float over the result text | **Partly**: none at 390. At 375 a "+2" float sits over the result art. | R35-shots/dk-result-cut-375.jpg |
| Row 6: 6.8 s median rival round | **Fixed**: median 0.4 s, max 2.9 s. | (timing log) |
| Row 3: "How to win" card after rivals moved | **Not fixed** (minor). | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | Full game at 375 to the result | "Play again" covers the table: Morwen shows, but Grub and Pip (you) are under the bar. | R35-shots/dk-result-cut-375.jpg |
| 4 | Won as a level 4 helper (390) and a level 5 helper (375) | The headline reads "Victory! You are a Level 10 Legend!" to a level 4 player. | R35-shots/dk-result-helper-win-390.jpg |
| 5 | Tutorial step 10 at 375 ("Tap potion, then your side") | The "Pip (you)" target is 61x37, and the bubble covers the "you vs monster" score it talks about. | R35-shots/dk-tut10-small-ring-bubble-375.jpg |
| 5 | Tutorial step 12 at 375 | The "Lost: Brave Bucket" toast covers the "Caught! Bad Stuff!" banner. | R35-shots/dk-tut12-toast-over-banner-375.jpg |
| 2 (good) | Tutorial at both sizes | 28 steps, 35 taps, 0 dead, ends "Gear up, listen, kick, fight, run, help, curse, loot, sell, charity." | R35-shots/dk-tut-end-375.jpg |

### Shared phone-check.js change (tutorial Skip)
The code is sound in its design. The Skip tap goes through the same `tap` + `waitChange(1000)` path as a move, is counted in `moves`
and `skips`, and a Skip that changes nothing counts as an unresponsive tap. The scenario fails if `[data-gxt-skip]` is still in the page
after the skip and its optional confirm tap ("tutorial Skip did not close the tutorial"). It also fails after more than 3 skips.
Skips never count as real moves. `wantReal` adds up every planned move, and a run with a skip and fewer real moves fails
("only N/M real moves after tutorial skip"). Small gaps: the confirm-dialog tap is not timed or checked for a dead tap; the "still open" test is DOM
presence, not visibility (it fails safe); a run with no skip keeps the old rules. In this gate run the doorkick tutorial did not open on
its own, so no phone-check line says "tutorial skipped". The new path was not exercised by this game's gate.

---

## 2. vinegrave (shelf/W490-vinegrave-bench @ d48c7b8c + local merge): 7.1, FAIL

Gate: **PASS** (`--full`: phone-check 60.9 s PASS, lab WARN 3/8 (not a gate fail), "PASS rules-test (200 AI games)", EXIT 0).

What I played:
- **Tutorial** ("Learn to play") by touch: 35 steps, 35 taps, **0 dead taps**, 53 s at both sizes, max wait 7.4-7.8 s (the rival's
  round). Ends "Prologue complete. You 28, Tamsin 4", then "Play a real game". The score lines add up (18 + 12 - 2 = 28).
  At 375 the site rings are 41-42 px (steps 6 and 12).
- **Real games** (Play > Start the expedition; defaults: 1 rival, easy):

| Size | Newcomer | Result | Time | Taps | Dead taps | Waits |
|---|---|---|---|---|---|---|
| 390x844 | follows the glow, then the action button; passes when told | **won 70-22** | 2.9 min | 153 | 0 | median 0.4 s, max 5.7 s |
| 375x667 | same, but 35% of taps on any lit thing | **won 28-26** | 1.9 min | 74 | 0 | median 0.4 s, max 4.9 s |

  0 page errors and 0 console errors. Choosers (exile or skip, hire an assistant, research "pick what climbs") all closed normally.
- **Rules**: unchanged from R29 (starting deck with Dread, one main action plus free card plays, Plane = 2 coins, items under the deck,
  artifacts at once, guardians, research with magnifier and notebook, temple tiles, 5 rounds). Nothing invented in what I saw.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | As in R29. |
| 2 | Tutorial teaches | 8 | 35 one-line steps, 0 dead taps at both sizes, the count matches, ends on a real game. Round-end Dread and exiling are still only words. |
| 3 | First 10 seconds | 7 | Clean title; one-line goal. The first board is dense. |
| 4 | Turn clarity | 7 | Priced buttons ("Buy · 3 compasses", "Dig"), plain choosers, and the prompt says "What glows is a strong move". Only 3 board moves glow now, but all four starting hand cards glow too, so "strong" is watered down on turn 1. |
| 5 | Phone play | 6 | Fixed: explorer pawns are 44x48. But at 375x667 the board shrinks: the 15 site discs are 30-33 px (54-58 px at 390). They are the main dig and explore targets, and the tutorial ring around one is 41-42 px. |
| 6 | AI and pacing | 7 | Fixed: a newcomer won both default games, 70-22 by following the glow and 28-26 with a third of taps at random. Rival waits are 0.4 s median. Easy is soft against the glow-follower (Tamsin 0 research). |
| 7 | Feel | 7 | Painted cards, walking explorers, flying goods, a painted result card with per-category breakdowns. |
| 8 | Bugs | 8 | Gate PASS. 2 tutorials and 2 full games: 0 errors, 0 stuck states, 0 dead taps (R29's two dead taps were not seen). |
| | **Total** | **7.1** | **FAIL**: row 5 is below 7. 7+8+7+7+6+7+7+8 = 57/8 = 7.125. No stopper. |

### Earlier findings (R29)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: newcomer lost both default games | **Fixed**: won 70-22 and 28-26. | R35-shots/vg-result-win-390.jpg, R35-shots/vg-result-win-close-375.jpg |
| Row 5/8: "Tamsin Reed played 1 more move." toast over the market at my turn | **Not seen**: rival news now shows in the prompt line ("Tamsin buys Coil of Rope."), and no tap hit a toast. | (prompt log) |
| Row 5: explorer pawns 34x46 | **Fixed**: 44x48 at both sizes. | R35-shots/vg-board-390.png |
| Row 5: hand names cut by the next card or a "+3" badge | **Not fixed at 375** ("Creeping Dread" sits half under the edge). | R35-shots/vg-small-sites-375.png |
| Row 8: a "Skip" that did nothing | **Not seen**: "Skip" on the exile chooser worked every time. | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | Started a default game at 375x667 | Site discs are 30x30 (camp) to 33x33 (deep ruins), well under 44 px. At 390 they are 54-58. | R35-shots/vg-small-sites-375.png |
| 5 | Tutorial steps 6 and 12 at 375 | The site ring is 41-42 px. | R35-shots/vg-tut06-site-ring-42-375.jpg |
| 6 | Followed the glow at 390 | Won 70-22; Tamsin scored 0 research. Easy is beatable, maybe soft for someone who follows the glow. | R35-shots/vg-result-win-390.jpg |
| 2 (good) | Tutorial at both sizes | 35 taps, 0 dead, ends on "Play a real game". | R35-shots/vg-tut-end-390.jpg |

---

## 3. hollowbough (shelf/W482-hollowbough @ e42ccd28 + local merge): 7.3, FAIL

Gate: **PASS** (`--full`: phone-check 65.3 s PASS, lab WARN 10/12 (not a gate fail), "SWEEP PASS", "1/1 PASS", EXIT 0).

What I played:
- **Tutorial** ("New here? Learn in 5 minutes") by touch at 375x667: 37 steps, 41 taps (10 are Next), 33 s, longest wait 1.8 s,
  **0 dead taps**, 0 errors. It ends "You win, 22 to 17. Now play a real game!", then "Play a real game".
- **Real games** (Play > Play now > Start; defaults: Guided, 2 players). My newcomer taps a hint finger if one shows, else the first
  glowing place or card, else a button, and passes only when nothing glows:

| Size | Newcomer | Result | Time | Taps | Dead taps on lit targets | Waits |
|---|---|---|---|---|---|---|
| 390x844 | glow-follower | **lost 21-34** (city 9, tokens 4, goals 3, Journey 5) | 1 min | 41 | 0 | median 1.6 s, max 2.4 s |
| 375x667 | glow-follower, 30% of taps on any lit thing | **lost 22-30** (city 11/15) | 1.4 min | 70 | 0 | median 0.4 s, max 3.3 s |
| 375x667 (first try, not scored for row 6) | my driver tapped Pass at the start of Autumn | lost 8-37 | 1 min | 42 | 9 taps on a glowing meadow card whose centre was off the left edge (driver, see findings) | |

  0 page and console errors, 0 stuck states. All three reached the result card ("Bramble wins!", a table, Play again /
  Look at the board / Main menu).
- **Hint bulb** (default "Guided" shows no finger by itself after the first tip): I tapped the bulb 8 times during play. A finger showed
  7 times, each on a real target (Resin Pool, Kindling Glen, Prepare, Dewberry Nook, Quarry Burrow, Lantern Rest). It did not show once, during a rival move.
- **Rules**: unchanged and right for 2 players (8 basic places plus forest and Haven, workers 2/+1/+1/+2, Spring and Autumn production,
  2 meadow cards in Summer, hand 8, city 15, Journey in Autumn, events, purple bonuses, ties to most events). The result table now
  lists Goals and Journey rows. I found nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | Fixed: the guided rival scores 17 now (22-17, was 22-1). 37 one-line steps, 0 dead taps. 10 of 41 taps are still Next only. |
| 3 | First 10 seconds | 7 | Learn and Play up top, a goal tip with one "Got it", and places glow. |
| 4 | Turn clarity | 7 | Repeated questions now count down ("Tap a meadow card to take it: 2 left.", "Pick what to give away: 2 left."). The prompt is still a small pill in the top-left corner. On defaults every open place glows, so the glow does not say what is good. |
| 5 | Phone play | 7 | Places 127x89 (390) and 88x77 (375), cards 117-168 px wide, 44 px tabs. At 375 the meadow row scrolls sideways and can leave a glowing card mostly off the left edge. |
| 6 | AI and pacing | 6 | Brisk (median 0.4-1.6 s; a game is 1-1.5 min of my turns). But a newcomer following the glow lost both scored games, 21-34 and 22-30. The fixer's "glow-follow won 3 + 1 tie of 4" did not hold for me. Across R24, R31 and R35 that is 0 wins in 6 default games. |
| 7 | Feel | 7 | Painted places and cards, meeples, flying cards, a painted end scene with achievements. |
| 8 | Bugs | 8 | Gate PASS. 0 errors, 0 stuck states, 0 dead taps on lit targets that were on screen, in a tutorial and 2 scored games. R31's ignored taps on meadow cards and "Stop here" were not seen. |
| | **Total** | **7.3** | **FAIL**: row 6 is below 7. 8+8+7+7+7+6+7+8 = 58/8 = 7.25. No stopper. |

### Earlier findings (R31)
| Finding | Status | Evidence |
|---|---|---|
| Row 8: glowing meadow card ignored the first taps (390) | **Not seen** on cards that were on screen. In one 375 run my driver hit a glowing card whose centre was off the left edge 9 times, with no effect. A person would not tap there, so I do not score it. | R35-shots/hb-meadow-card-offscreen-375.jpg |
| Row 8: "Stop here" ignored the first tap | **Not seen**. | n/a |
| Row 6: newcomer lost both default games | **Not fixed**: lost 21-34 and 22-30. | R35-shots/hb-result-lost-21-34-390.jpg, R35-shots/hb-result-lost-22-30-375.jpg |
| Row 2: guided rival scores 1 (22-1) | **Fixed**: 22-17. | R35-shots/hb-tut35-score-22-17-375.jpg |
| Row 4: prompt pill small in the top-left | **Not fixed**. | R35-shots/hb-result-lost-21-34-390.jpg |
| Fixer: hint finger missing on 29% of taps | **Mostly fixed**: 7 of 8 bulb taps showed a finger on a real target. | R35-shots/hb-bulb-finger-390.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Two default games following the glow | Lost 21-34 and 22-30. Bramble builds 20-24 city points plus purple bonuses. | R35-shots/hb-result-lost-21-34-390.jpg |
| 5 | 375, Summer, "Tap a meadow card to clear away" | The meadow row was scrolled, so a glowing card sat mostly off the left edge. | R35-shots/hb-meadow-card-offscreen-375.jpg |
| 4 | Played on defaults (Guided) | No hint finger appears unless you tap the bulb; every open place glows, so the glow is no guide. | R35-shots/hb-bulb-finger-390.jpg |
| 2 (good) | Tutorial at 375 | 41 taps, 0 dead, ends 22-17 and opens a real game. | R35-shots/hb-tut-end-375.jpg |
