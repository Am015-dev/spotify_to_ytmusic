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
