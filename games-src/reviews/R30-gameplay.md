# R30 gameplay re-review (strict), 12 Nov 2026

Reviewer R30. Scored by `GAMEPLAY-RUBRIC.md`. I changed no game code and did not trust the fixers' notes.

How I played: each branch in a local worktree with `origin/alex/brave-carson-rbpmlk` merged in (local only, not pushed), gated with
`VIS_SLUGS="," build-all.py --full --out /tmp/r30/<x> <slug>`, and the staged page served over http next to the branch's
`games/<slug>/` media. Playwright phone contexts (isMobile, hasTouch), every action a `touchscreen.tap` on a visible element
(elementFromPoint checked). Drivers read the screen and never called a game function. Default settings everywhere.
Up to six browsers ran at once on 4 cores, so measured waits may be a little long. Rules checked against the published rules
online; notes kept local, never committed. Screenshots: `games-src/reviews/R30-shots/`.

| Game | Total | Verdict | Gate | Lowest rows |
|---|---|---|---|---|
| doorkick-dungeon | 7.0 | FAIL | PASS | 5 Phone 6 |
| perch-and-plume | 6.9 | FAIL | PASS | 5 Phone 5, 8 Bugs 6 |
| redline-rally | 7.0 | FAIL | **FAIL** (phone-check L>P) | 5 Phone 6 |

---

## 1. doorkick-dungeon (shelf/W502-doorkick-gameplay @ d43457bd + local merge): 7.0, FAIL

Gate: **PASS** (`--full`: phone-check at every size, lab WARN 9/12 (not a gate fail), sweep "4 games, 4 reached a winner").

What I played:
- Tutorial ("New here? Learn in 5 minutes") by touch at 390x844 and 375x667: 27 steps, 38 taps, 58 s, 0 dead taps, 0 errors.
  Longest silent wait (rival turns shown) 5.3-5.4 s. Every lit target 44 px or more, except one transient 63x38 ring at 375 (step 10, see findings).
- Real game, Quick game > Me vs computer > Start > Just play (defaults: Faster Play on, 3 rivals), as a newcomer who follows the gold
  star and its prompt, and taps the glow:
  - 390x844: **won**, level 10 against 9 / 8 / 3, about 3 min, 108 taps, 0 errors. "Victory! You are a Level 10 Legend!"
  - Wait from my last tap to my next decision: median 6.8 s, max 10.5 s, 7 waits over 5 s (each covers 3 rival turns). I did not tap to skip.
  - Two more star-following runs (390 and 375) did not reach the result: my driver tapped the star card while the game wanted a rival or a
    closed panel (driver limits, not counted). One real thing they showed is in the findings (375: a treasure panel hides the starred card).
- Rules check: the default "Quick (faster play)" is the published optional faster-play rule (listen at the door: a face-down door card at
  the start of each turn; a helper who shares a winning fight also wins); "Full" is under Game length. Kick, fight or run (elf better),
  Bad Stuff, look for trouble / loot, charity down to 5, selling 1,000 gold for a level (never the winning one), curses on anyone,
  help for treasure: all as published. Nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Matches the published turn; the faster-play default is the rulebook's own option ("Pip listens at the door and draws a face-down door card"), with Full available. |
| 2 | Tutorial teaches | 7 | 27 one-line steps, one tap each, 0 dead taps at both sizes. But it does not teach listening at the door, which every default game uses, and "Finish" lands on the story chapter map, not a real game. |
| 3 | First 10 seconds | 7 | Start is on screen, then "Just play". The "How to win" card still opens over the board after the rivals have already gone up a level behind it (unchanged). |
| 4 | Turn clarity | 7 | Fixed: the star plus a short prompt ("Become ★ Warrior: tap the glow", "Stop Grub with the ★ card") tells a newcomer what to do, and following it won. At 375 the prompt can point at a card hidden under a panel, and once the star stayed on "Play ★ Loophole" with no hint where it goes. |
| 5 | Phone play | 6 | Hand overflow now shows a "+5 ›" cue. Still: the 3D door covers the Run button at 375 in the tutorial; "+1 Lv" floats sit over the rival plates and over the result text; a treasure panel covers the whole hand at 375; the story map title breaks into "The / Gold / en / Boot"; gear chips are cut at the right edge ("Very Fancy Title"). |
| 6 | AI and pacing | 7 | Fixed: a star-following newcomer won in about 3 min on defaults. Rival rounds are still a 6.8 s median wait (max 10.5 s) unless you know to tap. |
| 7 | Feel | 7 | Painted art, door kick, "A MONSTER!" reveal, run odds, confetti result with kills, helps and curses per hero. |
| 8 | Bugs | 7 | Gate PASS; tutorial at 2 sizes and the finished game: 0 errors, 0 stuck states, 0 dead taps on lit targets. |
| | **Total** | **7.0** | **FAIL**: row 5 is below 7. 8+7+7+7+6+7+7+7 = 56/8. No stopper. |

### Earlier findings (R12)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: newcomer stays level 1, rivals reach 9-10; games 6-17 min | **Fixed**: star-follower won at level 10 in about 3 min. | R30-shots/dk-result-win-390.jpg |
| Row 6: 4-6 s per decision, max 15-22 s | **Partly fixed**: median 6.8 s, max 10.5 s per 3-rival round without tapping to skip. | (timing log) |
| Row 4: charity "drag extras to discard" names no card | **Changed**: the charity step now names the target ("Give to Grub: tap the glow"). | R30-shots/dk-first-turn-star-390.jpg (same prompt style) |
| Row 5: hand row runs off the right edge with no sign | **Fixed**: a "+N ›" cue on the last card. | R30-shots/dk-first-turn-star-390.jpg |
| Row 5: "+2 Lv" floats over the rival plates at tutorial start | **Not fixed**. | R30-shots/dk-tut01-floats-390.jpg |
| Row 3: "How to win" card over the board while a rival plays | **Not fixed** (rivals already level 2 behind it). | R30-shots/dk-howtowin-card-390.jpg |
| Row 2/5: "Lost: Brave Bucket" toast over the "Caught" banner at 375 | **Not seen** in two tutorials. | n/a |
| Row 5: result table wraps "Morwen" | **Fixed**: names on one line. | R30-shots/dk-result-win-390.jpg |
| Row 8: "Run (sure)" tap changed nothing twice | **Not seen**. | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | Tutorial step 10 at 375x667, the kick | The 3D door lies over the fight panel and covers half of "Run" (target 63x38 while it shows). | R30-shots/dk-tut10-door-over-run-375.jpg |
| 2 | Tapped "Finish" on the last tutorial step | Lands on the story chapter map, not a real game; listening at the door (on in every Quick game) was never taught. | R30-shots/dk-tut-end-storymap-390.jpg |
| 5 | Same screen | The title wraps as "The / Gold / en / Boot" over 4 lines; act banners overlap the path labels. | R30-shots/dk-tut-end-storymap-390.jpg |
| 4 / 5 | Real game at 375, drew a treasure | A "Stubby Plate" panel covers the whole hand while the prompt says "Wear ★ Charming Kneepads"; the starred card is under it until you find the ×. The panel text repeats itself ("armor. +3 (Dwarves). 400 gold. only for Dwarves"). | R30-shots/dk-panel-hides-star-card-375.jpg |
| 4 | Real game at 375 | The star stayed on "Play ★ Loophole" turn after turn; tapping it never led anywhere my newcomer could see (my driver may have missed the right target, so not scored as a bug). | R30-shots/dk-star-loophole-loop-375.jpg |
| 5 | 4 v 4 tie, "Tap a rival to ask for help" | The gear chip row is cut at the right edge ("Very Fancy Title"). | R30-shots/dk-tie-help-390.jpg |
| 5 | Result screen | A "+1 Lv" float lies over the result text ("Tansy (1)"). | R30-shots/dk-result-win-390.jpg |
| 6 (good) | Star-follower game, 390 | Won 10-9-8-3 in about 3 min with 6 kills and 2 helps. | R30-shots/dk-result-win-390.jpg |

---

## 2. perch-and-plume (shelf/W508-perch-gameplay @ 052e6da0 + local merge): 6.9, FAIL

Gate: **PASS** (`--full`: phone-check at every size, lab WARN 3/8 (not a gate fail), rules-test "240/240 AI games finished").

What I played:
- Tutorial ("New here? Learn in 5 minutes") by touch at 390x844 and 375x667: 22 steps, 24 taps, 0 errors, every target on screen and 44 px+.
  Step 2 now says "One action per turn. Real rounds give 8, then 7, 6, 5." and step 8 teaches the round goal ("Tap the goal").
  At both sizes one tap on step 15 ("Tap a bird. Each egg is 1 point") changed nothing the first time (the next tap worked).
- Two Quick games on defaults (2 players, Easy rival Fern, hints on), newcomer taking Best about half the time, else a random lit target:
  - 390x844: **won 71-27**, 145 s.
  - 375x667: **lost 51-54**, 121 s.
  - Fern's turns: median 1.3-3 s. 0 page errors, 0 console errors, 0 stuck states.
- Rules (published game, re-checked): 4 rounds with 8/7/6/5 action cubes, habitat rows, egg cost by column, any 2 food for 1, tray refill,
  round goals, bonus card, end scoring and the leftover-food tie-break. Nothing invented. 120 birds is a stated cut.
- Is Easy too soft? No: one clear win and one 3-point loss for a half-Best newcomer. It is beatable, not free.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | Fixed: 8/7/6/5 and the round goal are now taught; 22 one-line steps, ends in a real game. One step-15 tap needs repeating. |
| 3 | First 10 seconds | 7 | Starting hand, goal line, one "Keep these". |
| 4 | Turn clarity | 7 | Fixed: the tracker shows "Round 1 of 4 · 8 actions left" and the live round goal; the result says "Ties go to the most food left over." |
| 5 | Phone play | 5 | Fixed: all 4 actions are visible at every turn start at 375 (2x2). **Not fixed and now reproducible**: at 375x667, after choosing a bird and its space, the yellow line "Tap Play to put X in your grassland." covers the "Play:" and "Cancel" buttons; only a 14-20 px strip of Play shows. Tapping the yellow line does nothing. This happens on every bird you play at 375. |
| 6 | AI and pacing | 7 | Brisk, about 2-2.5 min per game; newcomer won 1 and lost 1 by 3. Easy is not too soft. |
| 7 | Feel | 7 | Painted birds, Fern's card shown, food and eggs fly, powers fire chip by chip, clean result table. |
| 8 | Bugs | 6 | 0 errors, 0 stuck, gate PASS. But at 375 the main action's confirm needs a tap on a thin strip; taps on the line over it are dead. |
| | **Total** | **6.9** | **FAIL**: rows 5 and 8 below 7. 8+8+7+7+5+7+7+6 = 55/8 = 6.875. Not capped: the strip under the line does work. |

### Earlier findings (R27)
| Finding | Status | Evidence |
|---|---|---|
| Row 5: at 375 "Play a bird" / "Get food" scrolled under the header at turn start | **Fixed**: all 4 actions and the tracker show at every turn start. | R30-shots/pp-turnstart-4actions-375.jpg |
| Row 5 (seen once, unscored): the yellow prompt over the "Play:" confirm | **Not fixed; now reproduced on demand** at 375 (first bird of a game, and in a full game). 390 is fine. | R30-shots/pp-play-btn-under-prompt-375.jpg, R30-shots/pp-play-btn-visible-390.jpg |
| Row 2: 8/7/6/5 never taught; round goals only on the score page | **Fixed** (step 2 and step 8). | R30-shots/pp-tut02-8765-390.jpg, R30-shots/pp-tut-roundgoal-390.jpg |
| Row 4: 46-46 tie ended "Fern wins the year" with no reason | **Fixed**: result line "Ties go to the most food left over." | R30-shots/pp-result-loss-375.jpg |
| Row 6: newcomer lost both games | **Fixed**: won 71-27, lost 51-54. | R30-shots/pp-result-win-390.jpg |
| Row 5: landscape dock scrolled the prompt and actions away | **Not re-checked** in a played game this round (gate rotation scenarios PASS). | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 / 8 | 375x667, Play a bird > Rust Swallow > tapped the grassland space | "Tap Play to put Rust Swallow in your grassland." covers Play: (84x44 at y 436) and Cancel; elementFromPoint at Play's centre is the yellow line. A tap on the line is dead; a tap 10 px lower works. | R30-shots/pp-play-btn-under-prompt-375.jpg |
| 2 | Tutorial step 15 at both sizes | The first tap on the lit bird changed nothing; the second worked. | R30-shots/pp-tut15-390.jpg |
| 6 (good) | Two default games | Won 71-27 (390), lost 51-54 (375): Easy is fair, not soft. | R30-shots/pp-result-win-390.jpg, R30-shots/pp-result-loss-375.jpg |

---

## 3. redline-rally (shelf/W496-redline-gameplay @ a29139f9 + local merge): 7.0, FAIL

Gate: **FAIL**. Build, scenarios PASS; phone-check FAIL in the landscape-to-portrait scenario only:
`text >8 words: 11w "Speed Brake card road clear corner…"` (390x763, 375x553, 844x390, P>L and stale all PASS). Per the brief a gate FAIL
is a Phone/Bugs finding; R27's gate on this branch was PASS, so this is new after the latest base merge or the F3 change.

What I played:
- Tutorial ("New here? Learn in 5 minutes") by touch at 390x844 and 375x667: 40 steps, 41 taps, 63 s, 0 dead taps, 0 errors, every target 44 px+.
  Longest silent wait now 4.9 s (R27: 9.2 s before the spin-out step). "Finish" leads to the season map.
- Two default races (Play ▶ > Start the race; Sunline, 2 laps, 4 Easy rivals) to the podium:
  - 390x844, Suggest then Go, took the Suggested answer: **won** ("Flag! Sunline is yours."), 106 s, 17 rounds, 0 spin-outs, 0 dead taps.
  - 375x667, plain player (follows the shift-up/down line, biggest cards, random boost answers, Keep all or Discard at random): **2nd**
    ("One cleaner corner and it is yours."), 127 s, 2 spin-outs, 0 dead taps.
  - Wait for my next decision: median 1.6-2.5 s, max 4.0-6.3 s. 0 page errors, 0 console errors, 0 stuck states.
- Rules re-checked: gear = cards played, one gear free or two for 1 heat, corners over the limit cost heat, spin-out with stress and back
  to gear 1, slipstream +2, adrenaline, boost for heat, cooldown, discard step; Brake / Burst / Heat are the starting upgrade cards. Nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 7 | Every rule in order, one tap each, the long wait is gone. Still 11 Next-only steps, and the move the tutorial tells you to make is then rated "Okay: 7 spaces. The best play went about 11." |
| 3 | First 10 seconds | 7 | Big Play ▶, a 4-line goal card and one "Start the race". |
| 4 | Turn clarity | 7 | Fixed: Suggested sits on "No boost" whenever the risk is above 10 % and on the boost only when it is safe ("+2 spaces, no corner in reach"). The No-boost button carries the boost's risk ("Suggested / 100% spin: corner in 1, limit 6 / No boost"), which reads oddly at first. |
| 5 | Phone play | 6 | Car, corner, cards (52x80) and Go all fit at both sizes in play. But the gate's phone-check fails after a landscape-to-portrait turn (an 11-word line). |
| 6 | AI and pacing | 7 | About 2 min a race; Suggest won, the plain player was 2nd. Fair on Easy. |
| 7 | Feel | 7 | Start lights, cars slide, "+9 spaces" and "Slipstream +2" pops, podium with heat, spin-out and slipstream stats. |
| 8 | Bugs | 7 | Fixed: "Keep all" moves on with 0 picked; 0 dead taps in 2 races and 2 tutorials, 0 errors. |
| | **Total** | **7.0** | **FAIL**: row 5 below 7 and the deploy gate fails. 8+7+7+7+6+7+7+7 = 56/8. No stopper. |

### Earlier findings (R27)
| Finding | Status | Evidence |
|---|---|---|
| Row 8/4: big green "Discard 0" did nothing with 0 picked | **Fixed**: the button reads "Keep all" and moves on; 0 dead taps in 2 races. | R30-shots/rr-keepall-390.jpg |
| Row 4/6: Suggested pushed a 25 % spin-out boost | **Fixed**: Suggested on "No boost" at 20-100 % risk; boost suggested only when safe. | R30-shots/rr-boost-nosuggest-100pct-390.jpg, R30-shots/rr-boost-suggest-safe-375.jpg |
| Row 2: 9.2 s silent wait before the spin-out step | **Fixed**: longest wait 4.9 s. | (tutorial log) |
| Row 7/5: "Slipstream +2" banner over the cars and "You" tag | **Not fixed** (seen in the gate shot over the cars). | R30-shots/rr-gate-l2p-fail.jpg |
| Row 6: Easy beatable without Suggest | **Unchanged**: plain player 2nd, Suggest won. | R30-shots/rr-result-2nd-375.jpg, R30-shots/rr-result-win-390.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 / 8 | Ran the deploy gate `--full` | phone-check FAIL at L>P: `text >8 words: 11w "Speed Brake card road clear corner…"`. Gate FAIL, so this branch cannot deploy as is. | R30-shots/rr-gate-l2p-fail.jpg |
| 2 | Tutorial step 38, did exactly what the tutorial said | The rating line says "Okay: 7 spaces. The best play went about 11." right after a scripted move. | R30-shots/rr-tut38-okay-rating-390.jpg |
| 4 | Boost question at 100 % risk | The Suggested badge and "100% spin: corner in 1, limit 6" sit on the No boost button; the risk belongs to the other button. | R30-shots/rr-boost-nosuggest-100pct-390.jpg |
| 6 (good) | Two default races | Won 106 s (Suggest), 2nd 127 s (plain). | R30-shots/rr-result-win-390.jpg |

---

### Shared gate change: `games-src/scripts/phone-check.js` (on this branch)
The change makes the blind tapper press `[data-gxt-skip]` (and a confirm button) whenever a shell first-run tutorial is on screen,
then `continue`. It is fair that a blind tapper should not fail on a tutorial that shields everything but one spotlight. But as written it
**weakens the check for every game that uses `shell/gx-tutor.js`** (cauldron-fair, emberclimb, thornbound and others):
- the skip tap is not counted as a move and not timed, so a dead or covered Skip button is never reported as a dead tap;
- nothing checks that the tutorial actually closed: if Skip does nothing, every one of the 6+3+2 moves is spent tapping Skip, the game is
  never played, and the verdict can still be PASS (it only fails "couldn't start" when there were no autoStart clicks and 0 moves);
- the tutorial screens themselves are no longer exercised by the gate.
Needed before it lands on the base branch: time the skip tap like any move (dead = unresp), fail if `[data-gxt-skip]` is still there after
the confirm, add a note "tutorial skipped" to the result line, and require at least a few real moves for PASS.
