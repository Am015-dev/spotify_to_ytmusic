# R33 strict gameplay re-review (12 Nov 2026)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. For each game I checked out its branch in a separate worktree and merged
origin/alex/brave-carson-rbpmlk locally (not pushed). Then I ran the deploy gate
`VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/r33/<slug> <slug>`.
I played the staged page with its games/<slug> media folders next to it. Files were served through Playwright request routing (no open port).
Input was touch only (hasTouch, isMobile, `page.touchscreen.tap`), on default settings, at 390x844 and 375x667.
A tap counts as dead if nothing on the page changes within about 1.3 s. My drivers only look at the screen (text, glowing or spotlit
elements). The one exception is the Gate Wyrm check below, which set up the boss fight with the game's debug hook and then played it by touch.
I did not edit game code. Rulebook notes and downloaded sources stay in a local folder outside the repo.

| Game | Total | Verdict | Gate | Lowest rows |
|---|---:|---|---|---|
| emberclimb | 7.1 | PASS | PASS | 2, 3, 4, 5, 7, 8 at 7 |
| perch-and-plume | 7.3 | PASS | PASS | 3, 4, 5, 6, 7, 8 at 7 |
| short-fuse | 7.4 | FAIL | PASS | 5 Phone 6 |

---

## 1. emberclimb (shelf/W485-emberclimb-bench @ 1b797822, already up to date with alex/brave-carson-rbpmlk): 7.1 PASS

**Gate: PASS.**
- Build, scenarios and phone-check (55 s) passed.
- The lab test gave WARN 5/8 (LAB row mismatch). That does not block the gate.
- Sweep: "s 6 wins 1 avg floor 7.0 … RULES TEST PASS (40 games)".

What I played:
- **Tutorial ("New here? Learn in 5 minutes"):** 15 guided steps, 22 taps, 0 dead, about 35 s, at both sizes.
  - Then the coached climb at 375 to the end: CLIMB WON over Mire Behemoth, 7 floors, 119 taps, 0 dead, 93 s.
- **Quick game on defaults** (Garrick, Gentle). A newcomer bot played it: block when a hit is coming, else attack; random rooms; reward card 80% of the time.
  - 390x844: **lost on floor 10 to the boss Ashen Wraith**, 368 s.
  - 375x667: **won (SUMMIT)** over the boss Mire Behemoth, ♥ 184/400, 226 s.
- **Gate Wyrm boss** (debug start, then played by touch at 390): foe turns took 0.85 to 1.9 s.
- 0 page errors, 0 console errors, 0 stuck states. My bot logged 4 "dead" card taps, but each was a first tap that only lifts the card (selection).
  That change is visible, so none of them is a real dead tap.

### Boss check (my own sources, notes local)
- **Mode structure.** A rules summary site describes the printed rulebook example for this boss:
  - it starts in Attack Mode;
  - a mode switch moves the action cube to the first action of the new mode;
  - only the current mode's actions are active.
  The build does this.
- **Numbers.** I found an open-source simulator of the board-game mod on GitHub, separate from the fixer's sources A and B. It lists the same card:
  - Attack Mode: 2 dmg + 5 Block, then the Mode Shift hit of 6. If the Block is broken, it switches to defensive mode instead.
  - Defensive mode: Sharp Hide 1, then 2 dmg, then 4 dmg + 1 Strength (Sharp Hide removed), then back to Attack Mode.
  - The same file's 6-step burn-boss sequence also matches Ashen Wraith (ending 3x2 + 2 Burn + Strength).
- **Played it by touch.**
  - Turn 1 intent: 16 + 40 Block.
  - I cut the Block to 16. On turn 2 the badge showed "48" (the Mode Shift hit). The wyrm dropped its Block and hit for 48.
  - Turn 3 went back to 16 + 40 Block.
  This matches the sources (x8 game units). **Verified.**

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Fixed: the Gate Wyrm now matches the printed card, which an independent source confirms. The other act-1 bosses match too. Story ships Act 1 only, so the invented act 2-3 foes are gone from what a player meets. The default Gentle mode multiplies hero HP x5 (♥ 400/400). It is not the rulebook, but it is clearly labelled: "Gentle (first climb) / Tabletop (rulebook)", "Easier: more HP and potions", and "Played on Gentle (easier mode). Try Tabletop next." on the result. |
| 2 | Tutorial teaches | 7 | 15 one-line steps in rule order (intent, energy, attack + Vulnerable, Block, end turn, pattern, Strength, Weak, potion + Poison, finish, reward, map), 0 dead taps at both sizes, then a coached climb that plays to the end. Still 4 Next-only steps (goal, energy, pattern, path), as in R29. |
| 3 | First 10 seconds | 7 | Big "New here? Learn in 5 minutes"; Quick shows a 4-line goal card ("Reach the top. Beat the boss there."). |
| 4 | Turn clarity | 7 | Intent badges ("16 🛡 40"), "Incoming 16" under the hero, card text "Deal 16." / "Gain 8 Block.", one line under the hand. |
| 5 | Phone play | 7 | Every control is 44 px or more at both sizes. Boss fights fit at 375. The hand fan overlaps, but each card taps fine. |
| 6 | AI and pacing | 7 | Foe turns 0.85-1.9 s. Climbs take 4-6 min (coached climb 1.5 min). On the default Gentle, a newcomer reached the boss in both climbs and won 1 of 2. The loss came at the boss, not to a regular foe as in R29. |
| 7 | Feel | 7 | Painted foes and rooms, damage pops, the card lifts on tap, reward fan, painted SUMMIT / FALLEN screens with the final deck. |
| 8 | Bugs | 7 | Gate PASS. 2 climbs, 2 tutorials and 1 coached climb: 0 errors, 0 stuck states, 0 real dead taps. |
| | **Total** | **7.1** | **PASS**: every row is 7 or more, no stopper. 8+7+7+7+7+7+7+7 = 57/8 = 7.125. |

### Earlier findings (R29)
| Finding | Status | Evidence |
|---|---|---|
| Row 1: Gate Wyrm's every-turn 40 Block, single source | **Fixed and verified**: 2-step attack mode with Mode Shift, confirmed by an independent source | games-src/reviews/R33-shots/ec-wyrm-t1-390.jpg, games-src/reviews/R33-shots/ec-wyrm-t2-390.jpg |
| Row 1: Story uses invented act 2-3 foes | **Fixed**: Story shows "Act 1 · The Mire Road", 3 chapters, "More chapters are coming soon." | none (text check) |
| Row 6/1: Gentle x6 still dies on floor 8 to a regular foe | **Fixed enough**: x5 now, both climbs reached the boss, 1 of 2 won | games-src/reviews/R33-shots/ec-q375-result.jpg, games-src/reviews/R33-shots/ec-q390-result.jpg |
| Row 2: 4 Next-only steps | **Not fixed** (still goal, energy, pattern, path) | games-src/reviews/R33-shots/ec-tut390-end.jpg |
| Row 5: "Spine Sl…" name cut in the split | Not re-seen (split fight not met in my climbs) | none |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Quick game on Gentle at 390 | Reached floor 10 and lost to Ashen Wraith (boss) at 0/400. The setup says "Easier", but the act-1 boss can still end a newcomer's 6-minute climb. That is acceptable for a deckbuilder, and the "Try Tabletop next" line is fair. | games-src/reviews/R33-shots/ec-q390-result.jpg |
| 4 | Gate Wyrm turn 2 at 390 | The badge shows "48" for the Mode Shift hit. Nothing on screen says the hit only lands if its Block is still up, or that breaking the Block flips it to defensive mode. A newcomer meets the rule without being told. Minor. | games-src/reviews/R33-shots/ec-wyrm-t2-390.jpg |
| 8 (good) | Coached climb after the tutorial, at 375 | Played to CLIMB WON over 7 floors, 0 dead taps, 0 errors. | games-src/reviews/R33-shots/ec-tutclimb375-result.jpg |
| 5 (good) | Boss fight at 375 | Hero, boss, HP bars, intent and the full hand fit. | games-src/reviews/R33-shots/ec-q375-boss-fight.jpg |

---

## 2. perch-and-plume (shelf/W508-perch-gameplay @ 4949b211 + local merge 7c33c91a): 7.3 PASS

**Gate: PASS.** Build, scenarios, phone-check at every size, lab test, and rules-test "240/240 AI games finished".

The fixer's change touches only the UI (flow.js, head.html, render.js: 7 lines). Rules code is unchanged since R30's rulebook re-check.
I spot-checked the tutorial lines against the published game: 8/7/6/5 actions per round, a habitat row per action, egg cost by column, brown powers right to left, tucked cards and cached food at 1 point each, ties to leftover food. Nothing is invented.

What I played:
- **Tutorial ("New here? Learn in 5 minutes") by touch:**
  - 390x844: 22 steps, 24 taps, 0 dead.
  - 375x667: 25 taps, 1 missed tap (below).
  - Step 15 ("Tap a bird. Each egg is 1 point"): every tap now lays an egg, 2-3 taps at both sizes, each one visible. The R30 ignored first tap is gone.
  - It ends on the score page with "Tap to play a real game" over Play again.
- **Quick games on defaults** (2 players, Easy rival Fern, hints on). Newcomer bot: takes "Best" half the time, else a random glowing target.
  - 375x667: **lost 66-68**, 166 s.
  - 390x844: **won 63-55**, 187 s.
  - Fern's turns: median 3.4 s, max 5.5 s, from Fern's start to my turn, including the watch-each-step playback.
  - 0 page errors, 0 console errors, 0 stuck states.
  - My bot logged 4 dead taps. All were taps on carousel cards outside the screen (x = 616 or -64), a driver error and not a game bug.
- **Play/Cancel check:** on every bird I played, I checked elementFromPoint at the centre of "Play:".
  It was the button itself in 13 of 13 (6 at 375, 7 at 390). The yellow line now sits above "Play: / Other food / Cancel", and all three are 44 px tall.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right (R30 re-check). The tutorial's numbers match the published game. |
| 2 | Tutorial teaches | 8 | 22 one-line steps in rule order: score, 8/7/6/5, the four actions, white/brown powers, tucks, eggs to the nest limit, the rival's pink power, tray refill, round goal, bonus card, end scoring. Then "Tap to play a real game". Step 15 is fixed. Still 6 Next-only steps. |
| 3 | First 10 seconds | 7 | Starting hand, the goal line, one "Keep these". |
| 4 | Turn clarity | 7 | "Round 1 of 4 · 8 actions left", the live round goal, a "Best" badge, "Tap Play to put Rust Swallow in your grassland." and "Good: +2 points, the best move this turn." |
| 5 | Phone play | 7 | Fixed: Play/Cancel are never covered at 375 (0 of 6) or 390 (0 of 7), and the buttons are 44 px. Small left-overs: at 375 the tutorial's action buttons drop about 50 px when the step 14 bubble grows (one missed tap), and on the end page the step 22 bubble is scrolled half off the top. |
| 6 | AI and pacing | 7 | Games take about 3 min. Fern takes 3-5 s per turn. A half-Best newcomer won 63-55 and lost 66-68: Easy is fair, not soft. |
| 7 | Feel | 7 | Painted birds, food dice and eggs fly, powers fire chip by chip, Fern's moves play out step by step, a clean result table. |
| 8 | Bugs | 7 | Gate PASS. 2 tutorials + 2 full games: 0 errors, 0 stuck. One missed tutorial tap at 375, caused by the layout shift (row 5); a second tap worked. |
| | **Total** | **7.3** | **PASS**: every row is 7 or more, no stopper. 8+8+7+7+7+7+7+7 = 58/8 = 7.25. |

### Earlier findings (R30)
| Finding | Status | Evidence |
|---|---|---|
| Row 5/8: at 375 the yellow "Tap Play to put X…" line covers Play: / Cancel; taps on it dead | **Fixed**: the line sits above the buttons; Play is the top element in 13 of 13 plays | games-src/reviews/R33-shots/pp-q375-play1.jpg, games-src/reviews/R33-shots/pp-q390-play1.jpg |
| Row 2: step 15 first tap ignored | **Fixed**: every tap on the bird lays an egg | none (log: 3 taps, 3 changes, at both sizes) |
| Row 6: Easy beatable, not soft | **Still true**: won 63-55, lost 66-68 | games-src/reviews/R33-shots/pp-q390-result.jpg, games-src/reviews/R33-shots/pp-q375-result.jpg |
| Row 5: landscape dock | Not re-checked (gate rotation scenarios PASS) | none |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 / 8 | Tutorial step 14 at 375x667: tapped the spotlit "Lay eggs" where it was when the step appeared | The step bubble then grew and pushed the 4 action buttons down about 50 px, so my tap landed between buttons and nothing happened. A second tap worked. The "Ottilie" tag also sits on the top-left corner of "Lay eggs". | games-src/reviews/R33-shots/pp-tut375-step14-miss.jpg |
| 5 | Tutorial step 22 at 375 | On the score page the coach bubble is scrolled half off the top; only "real game." shows. | games-src/reviews/R33-shots/pp-tut375-step22-cut.jpg |
| 8 (minor) | Tutorial step 21 at 390: tapped the spotlit Total row | It took more than 1 s to move to step 22 (it did move). | games-src/reviews/R33-shots/pp-tut390-step21-slow.jpg |
| 2 (good) | Tutorial to the end at both sizes | Ends with "You know every rule now. Tap to play a real game." on Play again, then a real game with "Keep these". | games-src/reviews/R33-shots/pp-tut390-end.jpg |

---

## 3. short-fuse (shelf/W488-short-fuse-sprites @ 8e5b9bf4, already up to date with alex/brave-carson-rbpmlk): 7.4 FAIL

**Gate: PASS.** Build, scenarios, phone-check, lab test and sweep all passed. In R22 the phone-check FAILED with 2-5 dead taps; that is now fixed.

Since R22 the fixer changed only crew AI and layout code (5 commits: deduction-safe crew, loss card naming the crewmate, risky wires dim with "!",
small-portrait table layout, crewmate zoom). R22 checked the rules against the published game. No rules code changed, and I found nothing invented.

What I played:
- **Tutorial ("Learn to play") by touch:** 17 steps, 17 taps, 0 dead, 34 s, at both sizes. It ends on "Defused!" → Finish → "Play job 1".
- **Jobs on defaults** (Play from the title: 3 crew, Normal). Driver: shows a middle wire, takes a glowing solo cut, else points at the first glowing
  crew wire and says a number of mine that fits. That is a weaker player than R22's careful clue-reader: it ignores the clue line.
  - 390x844: job 1 lost (fuse, 20/24), lost again (fuse, 12/24), then **won** on Again (24/24). 22-25 s per job.
  - 375x667: job 1 lost (fuse, 20/24), **won** on Again, then job 2 lost (fuse, 22/34).
  - 6 jobs to the result card, 63 taps, 0 dead taps, 0 page errors, 0 stuck states.
    The only console line was one blocked external request, which my sandbox blocks.
  - My last tap to my next turn (2 computer crewmates): median 3.8 s, max 5.5 s.
  - All 4 losses were the fuse after 3 misses, caused by my guesses. **No crewmate pointed at a red** in 6 jobs (R22: 3 of 29 jobs).
    The sample is small and covers jobs 1-2 only.
- **Sizes:** own wires are 30x44 px at both sizes, for both job 1 and job 4. Crew wires are 43x48 at 390, 31x44 at 375 for the zoomed crewmate,
  and 23x18 (not tappable) for the compact one.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged since R22's rulebook check: dual cut, solo cut, yellow, red, info tokens, fuse by crew size, gear after 2 cuts, twin probe. House rules are disclosed. |
| 2 | Tutorial teaches | 8 | 17 one-line steps (goal, own wires, show a wire, point, say a number, clean cut, twin probe, miss, Rewind, yellow, red, solo cut, win), 5 Next-only, 0 dead at both sizes, then "Play job 1". |
| 3 | First 10 seconds | 8 | One-line pitch, a big Play, "Learn to play · A guided first job"; the job card gives the goal in 3 bullets and a tip. |
| 4 | Turn clarity | 7 | "Your turn · 1 action · or play gear", "Turn over: Plum cut 2 wires alone, no risk. Next: you.", and "Clues: 6. Not red." under a picked wire. The loss card now names the real cause ("The fuse ran out · 13 turns · 3 misses · 20/24 wires cut"). I did not see a red loss, so I could not check the crewmate-named card. At 390 in job 4 the crew plates show "1" and "P." instead of the names. |
| 5 | Phone play | 6 | Own wires are 30 px wide at both sizes (R22: 44 px or more), with small gaps. At 375 job 4 uses a zoom layout: one crewmate's wires at 31x44, the other's as 23x18 strips you cannot tap until you tap that plate ("Tap a crewmate to see their wires"). It fits, but the main targets are now under 44 px, and the crew view needs an extra tap. |
| 6 | AI and pacing | 7 | Crew turns take about 2 s each (3.8 s for two). Jobs take 18-26 s. No crewmate red-point in 6 jobs, so the AI fix holds in my sample. My clue-blind guesser lost 4 of 6 jobs to the fuse; R22's careful clue-reader won about 3 of 4 jobs 1-2. |
| 7 | Feel | 7 | Wires cut with a SNIP, the fuse burns along the rope, "+2" pops, painted DEFUSED / BOOM cards with move ticks ("✓ Match ✓ Wrong guess ✓ Solo cut"). |
| 8 | Bugs | 8 | Gate PASS (R22 phone-check FAIL now fixed). 2 tutorials + 6 jobs: 0 errors, 0 stuck, 0 dead taps. |
| | **Total** | **7.4** | **FAIL**: row 5 is below 7. 8+8+8+7+6+7+7+8 = 59/8 = 7.375. No stopper. |

### Earlier findings (R22)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: a computer crewmate pointed at a red in 3 of 29 jobs | **Fixed in my sample**: 0 of 6 jobs (jobs 1-2 only) | games-src/reviews/R33-shots/sf-q390-job1-lost.jpg (fuse loss, not red) |
| Row 4: red-loss card blames the fuse and the player, never names the crewmate | **Not re-seen** (no red loss). Fuse losses now read "The fuse ran out" plus turns, misses and wires cut. | games-src/reviews/R33-shots/sf-q390-job2-lost.jpg |
| Row 5: job 4 at 375, second crewmate hidden under "▾ more wires below" | **Changed**: a zoom layout replaces scrolling; the other crewmate is a compact 23x18 strip until you tap its plate | games-src/reviews/R33-shots/sf-size-j4-375.jpg |
| Row 4/5: "Stand" tags on wires / on the "more wires" cue | **Fixed**: Stand 1/2 tags sit beside or above the wires | games-src/reviews/R33-shots/sf-size-j4-375.jpg, games-src/reviews/R33-shots/sf-size-j4-390.jpg |
| Gate: phone-check 2-5 dead taps | **Fixed** (gate PASS) | none (gate log) |
| Row 5: coach bubble covers the hand on "A miss" | Not checked visually this round; 0 dead taps in the tutorial | games-src/reviews/R33-shots/sf-tut375-end.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | Measured every wire in job 1 and job 4 at both sizes | Own wires are 30x44 px at 390 and 375 (under 44 px wide). At 375 in job 4 the zoomed crewmate's wires are 31x44, the other's 23x18 (not tappable). | games-src/reviews/R33-shots/sf-size-j4-375.jpg, games-src/reviews/R33-shots/sf-size-j4-390.jpg, games-src/reviews/R33-shots/sf-q375-turn2.jpg |
| 4 / 5 | Job 4 at 390, setup | The crew plates read "1 ★ 26" and "P. 13": the names are cut to one character. | games-src/reviews/R33-shots/sf-size-j4-390.jpg |
| 6 | Job 1 on defaults, guessing without reading the clue line | Lost twice to the fuse (3 misses) before winning on the third try, at both sizes. That is fair by the rules, but the crew wires show no clue labels until you tap one, so a newcomer who does not tap around guesses blind. | games-src/reviews/R33-shots/sf-q390-turn1.jpg, games-src/reviews/R33-shots/sf-q390-job3-won.jpg |
| 2 (good) | Tutorial by touch at both sizes | 17 taps, 0 dead, ends on Finish → "Play job 1". | games-src/reviews/R33-shots/sf-tut390-end.jpg |
