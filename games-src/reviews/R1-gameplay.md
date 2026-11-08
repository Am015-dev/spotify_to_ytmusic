# R1 strict gameplay re-review (8 Nov 2026)

Reviewer R1. I scored by `games-src/reviews/GAMEPLAY-RUBRIC.md`. I built each branch (`build-all.py <slug> --no-look`, all PASS) and
served the staged page next to its `games/<slug>/media`. I played with Playwright touch only (hasTouch/isMobile, touchscreen taps
and CDP touch drags) at 390x844 and 375x667, with default settings (animations on, default rival). I did not trust the fixers' notes:
I re-checked every first-review finding by touch. Screenshots are in `games-src/reviews/R1-shots/`.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| stitchwise | 6.9 | FAIL | 2 Tutorial 6, 5 Phone 6, 6 AI/pacing 6 |
| vale-of-banners | 4.0 | FAIL (STOPPER at 375x667; raw 6.3) | 8 Bugs 3 (stuck at 375), 5 Phone 4 |
| short-fuse | 7.3 | FAIL | 4 Turn clarity 6 |

---

## 1. stitchwise (shelf/W491-stitchwise-real @ 187ba6d6)

Played: "Learn" to the end 4 times (390: tapping lit patch 1, 2 and 3 in turn; 375: patch 1). Each run took about 27 s and handed
over to a fresh real game. Then 3 Quick games against the default "Easy computer" to the result screen: 390 lost 19-34, 375 won
20 to -8, 390 won 8 to -5. 0 page errors, 0 console errors, 0 stuck states, 0 dead taps.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Unchanged and correct: 3 patches after the spool, whoever is furthest behind moves next, Advance = 1 button per space, income on gold spots, first past leather gets the 1x1, 7x7 = +7, score = buttons - 2 per empty. The engine score matches the result card. |
| 2 | Tutorial teaches | 6 | Dead tap fixed. But it is still a staged slideshow: 4 of the 8 rules start with "Skipping ahead", and before the 7x7 step both quilts are filled "sewn for you". At "Drop it in the gap, then tap Sew it on", only Sew is lit, and tapping it without dragging still sews the patch. It ends on "You -32, Marden -73", so the first score a new player sees is a deep negative. |
| 3 | First 10 seconds | 7 | One clear goal line on the title. "Learn: your first game" is obvious. The first turn says "Tap a glowing patch to buy it". |
| 4 | Turn clarity | 7 | Fixed: during the rival's turn its quilt is now on the board, with "Aurelia is thinking..." and "Aurelia is 1 space behind, so goes next". The Advance button shows its gain ("Advance +7 buttons"). Weak spot: at 375 the patch cards show bare icons and numbers with no words. |
| 5 | Phone play | 6 | Fixed: at 375 the cards no longer overlap (picture above the numbers). Not fixed: card labels "buttons/time/income" are 12 px and their numbers 13 px at both sizes (the bar is 14). In the real game the quilt squares are 22-24 px and the time-track squares 18-19 px. The lit tutorial targets are all 44 px or bigger. |
| 6 | AI and pacing | 6 | The default Easy rival is beatable (2 of 3 won as a new player), and a game is about 20 turns and 2.5 min. But the rival is slow: the wait from ending my turn to my next turn averaged 4.5-6.4 s and peaked at 13-19 s (several rival moves in a row, each animated) with nothing to do. |
| 7 | Feel | 7 | The patch drags and snaps onto the quilt with a fabric ghost ("Good spot! Tap Sew it on"), tokens walk the track, and the result card counts up. Rival turns are mostly waiting. |
| 8 | Bugs | 8 | 4 tutorials and 3 full games: 0 errors, 0 stuck states, 0 dead taps. The result count-up ends on the engine's numbers. |
| | **Total** | **6.9** | **FAIL**: rows 2, 5 and 6 are below 7. No stopper. |

### First-review findings (G1)
| G1 finding | Status | Evidence |
|---|---|---|
| Row 8/2 STOPPER: step 1 says "tap one of the 3", only the 3rd worked | **Fixed**. All 3 are lit, and each one I tapped by touch moved the step on (390 patches 1/2/3, 375 patch 1). | R1-shots/sw-tut-step1-all3-lit-390.jpg, sw-tut-step1-all3-lit-375.jpg |
| Row 2: the tutorial teleports without saying so; quilt auto-filled | **Partly fixed**. Each jump is now announced ("Skipping ahead: you go to 9, Marden to 14" + Skip ahead button). But there are still 4 jumps and the auto-filled quilts, so it is still a demo, not a guided game. | sw-tut-skip-ahead-375.jpg, sw-tut-quilt-sewn-for-you-375.jpg, sw-tut-score-375.jpg |
| Row 5: cards overlap at 375 | **Fixed**. | sw-turn1-cards-375.jpg |
| Row 5: labels 12-13 px, track squares ~14 px | **Not fixed**. Labels are still 12 px and numbers 13 px; track squares are 18-19 px. | sw-turn1-small-labels-390.jpg |
| Row 4: the rival's quilt is never on screen | **Fixed** (shown during the rival's turn, plus a thumbnail on its plate). | sw-rival-turn-quilt-shown-390.jpg |
| Row 7: the patch is a flat colour block while dragging | **Fixed** (the ghost shows the fabric; red stripes = no room). | sw-placing-390.jpg |

### New findings
- Row 6. What I did: ended my turn in a Quick game vs Easy and waited without tapping. What happened: average 4.5-6.4 s and
  up to 19 s before it was my turn again. Shot: R1-shots/sw-rival-turn-quilt-shown-390.jpg
- Row 2. What I did: tutorial step 7/8 "Drop it in the gap, then tap Sew it on". I tapped the lit Sew button without dragging.
  What happened: the patch was sewn anyway, so the step teaches nothing. Shot: R1-shots/sw-tut-quilt-sewn-for-you-375.jpg
- Row 5. What I did: placed patches in the real game at 390. What happened: quilt squares are 24 px (22 px at 375); tapping a
  square to aim the patch is fiddly. Dragging works. Shot: R1-shots/sw-placing-390.jpg
- Positive: the result card. Shot: R1-shots/sw-result-win-390.jpg

---

## 2. vale-of-banners (shelf/W505-vale-gameplay @ 5a1f3c41)

Played: "New? Learn to play" to the end card at 390 and at 375 (48 steps, about 90 s each, 0 errors, every lit target 44 px or bigger except one), then Quick games against the default Gentle rival by touch as a new player who taps ★ Best first and otherwise the glowing targets. At 390: one full game to the result, won 103-84 in 25 turns (2 min 45 s), 0 errors. At 375x667: 3 games, and **none reached the result**. Each time the game ended up in a state where the next needed action could not be tapped (details under New findings).

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Unchanged from G7 and matches the published rules: 5 seasons x 5 rounds, 2 dice + white goods die, take/build/sell/workers, worker bend with 6/1 wrap, 2-silver back lane once per turn, storage 3, 3 goods kinds, region scoring with a season bonus, colour bonus 5/2, mine silver, final silver/goods/worker pairs, tie on empty spaces. |
| 2 | Tutorial teaches | 7 | 48 steps, one line + one tap each, every core rule in order, about 90 s by touch, ends on "Play a real game" (Gentle rival). Fixed: there is only one bubble now (the coach line moved into the dock). Still long, and the last-round crate target at 375 is 44x20 px. |
| 3 | First 10 seconds | 7 | The title line "Roll two dice. Grab tiles. Build the best estate." and Play are clear. Play still goes through a setup screen and a goal card before the board. |
| 4 | Turn clarity | 7 | Whose turn, dice left, prompt line, glowing targets, ★ Best on the best tile, and tile cards ("Take to storage"). Not fixed at 390: the big "Your turn 3 4" banner sits on the middle of the estate, over the glowing space I had to build on. At 375 it now sits higher. |
| 5 | Phone play | 4 | At 375x667 the dock is cut off: once you hold 3 goods kinds, the die-to-workers buttons are below the screen and cannot be scrolled to (see Bugs). Fixed at 375: glowing build spaces are 49x64 and market tiles 44x46. Not fixed: the crate targets on stalls are 44x20 px at 375. The estate's number discs are about 20 px, and the hexes about 34 px wide, when you read the board. |
| 6 | AI and pacing | 7 | 7WHY |
| 7 | Feel | 7 | Dice and tiles fly, regions flash, "+4 beacon" pops, the result has a full score table. |
| 8 | Bugs | 3 | 3WHY |
| | **Total** | **4.0** | **FAIL (STOPPER at 375x667; raw 6.3)** |

### First-review findings (G7)
| G7 finding | Status | Evidence |
|---|---|---|
| Row 5: crate target 24x20 at 375 (38x30 at 390) | **Not fixed**: 44x20 at 375 (wider, still 20 px tall). | R1-shots/vale-tut-crate-44x20-375.jpg |
| Row 5: build cells 34-37 px at 375 | **Fixed** for the glowing targets (49x64). | vale-turn1-375.jpg |
| Row 5: market at 375 cramped, badges over names | **Mostly fixed**: tiles 44x46, names readable. | vale-mid-375.jpg |
| Row 4: "Your turn" banner covers the estate | **Not fixed at 390** (covers the glowing build space); at 375 it now sits at the top. | vale-banner-over-glow-390.jpg, vale-turn1-375.jpg |
| Row 6: lost 3/3 on Normal following ★ Best | **Fixed** with a new default "Gentle" rival: won 103-84 at 390, and led 55-46 at 375 before the stopper. | vale-result-win-390.jpg |
| Row 6: ~7 s per rival turn | **Fixed**: about 2.1 s average, 4.2 s max. | vale-rival-turn-375.jpg |
| Row 8: "Close one" after a 50-point loss | Not seen (I did not lose a game); the copy now reads "margin-true" per the fixer. | n/a |
| Row 2: two bubbles at once in the tutorial | **Fixed** (the coach line is in the dock, not a second popup). | vale-tut-coach-in-dock-390.jpg |

### New findings
- **Row 8 / 5 (STOPPER, 375x667).** What I did: a Quick game vs Gentle at 375x667. In Autumn (season 4, round 3) I held 3 goods
  kinds and one die (4) that fit nothing. What happened: the prompt says "Nothing fits. Swap a die for 2 workers." The "4 → 2 workers"
  button is under the bottom edge: the goods row is cut at y=667, and the dock has overflow hidden with a 267 px fixed height.
  There is no End turn and the page cannot scroll, so a touch player cannot go on. Measured on a fresh 375 game: `#goods` already
  ends at 680 px and `#acts` starts at 684 px, below the 667 px screen. Shot: R1-shots/vale-375-stuck-swap-button-offscreen.jpg
- Row 8 (375x667, same cause suspected). In two more 375 games the turn never finished. One stopped at "Moot Hall: build one more
  tile now, any number." The other alternated "Put it on a glowing space" and "Drag your 1 onto a glowing 1" for over 100 taps.
  In both, the next control I needed was not on the screen. Not confirmed one by one; the logs are the evidence.
- Row 4 (390). What I did: selected a stored tile on my turn. What happened: the "Your turn 3 4" banner covers the one glowing
  estate space I must tap. Shot: R1-shots/vale-banner-over-glow-390.jpg
- Row 5 (375). What I did: tutorial step 34 "Take every crate from one stall". What happened: the target is 44x20 px. Shot:
  R1-shots/vale-tut-crate-44x20-375.jpg

---

## 3. short-fuse (shelf/W488-short-fuse-sprites @ e1140427)

Played: "Learn to play" to its end card at 390 and at 375 (21 steps, about 49 s each, 0 errors), then "Play job 1" from the title
(3 crew, Normal) to the result card at both sizes: DEFUSED 13 turns, 1 miss (390) and DEFUSED 12 turns, 1 miss (375). I played as a
new player who reads only tokens, cut wires and sort order. 0 page errors, 0 console errors, 0 stuck states. I also tested a crew-wire
tap during "Show a wire" and the hint bulb at 375.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | The odds badges are gone, so the deduction is the player's again. Dual cut, a miss burns the fuse and puts a token on the true value, red = boom, yellow matches yellow, solo cut of the last 2/4 (seen: my two 1s got scissors once the other two 1s were cut), gear unlocks after two cuts, captain's two stands, clockwise turns. |
| 2 | Tutorial teaches | 7 | Fixed: the practice miss now says "Say 2, a risky guess: nothing proves it is a 2." It no longer gives the hidden value away. Not fixed: red (step 19) and the Twin Probe (step 15) are still Next taps, never practised. |
| 3 | First 10 seconds | 8 | Fixed: the title now says "A team bomb puzzle: guess your crew's hidden wires from the clues and cut them all before the fuse burns out." Play shows a 3-bullet goal card and then "Show a wire: tap one of yours." |
| 4 | Turn clarity | 6 | Fixed: no toast over the turn line, no grades, and an "or play gear" chip. New problem: a 12-wire hand (the captain's two stands) is drawn as two plain rows, like a 6-wire hand wrapped onto two rows. There is no gap or label between the stands. So a new player sees "2 2 2 3 3 4" above "1 1 1 4 5 5" right after being told the wires are sorted low to high, and can't tell which neighbours to read a token against. The ★ and the case icon on the name plates are never explained. |
| 5 | Phone play | 7 | Fixed: the header icons are 44x44 at y=0 at both sizes. Wire tiles are 60x79 and nothing scrolls. At 375, a cut crew wire briefly flies over the next stand while "Turn over" shows. |
| 6 | AI and pacing | 7 | The crew plays sensible token-led cuts. From my tap to my next turn (two crew turns) took 3.5-4.5 s on average. Job 1 is winnable (2 of 2). The job is still thin: 26-33 s and 9 taps from me for a whole job. |
| 7 | Feel | 7 | SNIP and +2 pops by the counter, the cut animation, the fuse, and a painted DEFUSED card with Next job / Again / Jobs. |
| 8 | Bugs | 8 | 2 tutorials and 2 full jobs plus the setup and hint checks: 0 errors, 0 stuck states. The crew-wire tap during setup now says "Not theirs: tap one of YOUR wires." |
| | **Total** | **7.3** | **FAIL**: row 4 is below 7. No stopper. |

### First-review findings (G6)
| G6 finding | Status | Evidence |
|---|---|---|
| Rows 1/4/5: unexplained odds badges solve the deduction | **Fixed**: no odds on wires; the bulb hint is a plain sentence ("Plum showed a 5 near it: Plum's 3rd wire is likely a 3."). | R1-shots/fuse-first-turn-390.jpg, fuse-hint-two-stands-375.jpg |
| Row 4: grade line "Poor 50% odds..." cut off and unexplained | **Fixed**: removed. | fuse-crew-turn-390.jpg |
| Row 4: "Your turn" toast over the Turn-over line | **Fixed**. | fuse-first-turn-375.jpg |
| Row 5: header icons clipped (40x44 at y=-4) | **Fixed** (44x44 at y=0). | fuse-title-goal-line-390.jpg |
| Row 5: "+2" / "SNIP!" floating over crew wires | **Mostly fixed**: +2 sits by the cut counter. At 375 a flying cut wire still crosses a stand for a moment. | fuse-first-turn-375.jpg |
| Row 2: practice miss gives away the hidden value | **Fixed**. | fuse-tut-miss-no-giveaway-390.jpg |
| Row 2: red and Twin Probe only told, never done | **Not fixed**. | fuse-tut-red-next-only-375.jpg, fuse-tut-probe-next-only-375.jpg |
| Row 3: no goal line on the title | **Fixed**. | fuse-title-goal-line-390.jpg |
| Rows 8/4: crew-wire tap during "Show a wire" silent | **Fixed** ("Not theirs: tap one of YOUR wires."). | fuse-setup-crew-tap-explains-375.jpg |
| Row 6: a job is ~30 s and 7 taps | **Not fixed** (26-33 s, 9 taps). | fuse-result-defused-375.jpg |

### New findings
- Row 4. What I did: started job 1 at 375 as captain (12 wires) and turned the hint on. What happened: my two stands are drawn
  as two plain rows, "2 2 2 3 3 4" above "1 1 1 4 5 5", with nothing between them. In the 6-wire game at 390 my one stand also
  wraps onto two rows ("1 1 3" / "4 5 6"). Two rows can mean one stand or two, and the sort order looks broken. Crew stands have
  the same problem (Teal as captain: two rows of 6). Shot: R1-shots/fuse-hint-two-stands-375.jpg, fuse-first-turn-390.jpg
- Row 4. What I did: looked at the name plates during play. What happened: the ★ (captain) and the small case icon next to every
  name are never explained on the board. Shot: R1-shots/fuse-first-turn-375.jpg
- Row 5. What I did: my first turn at 375, just after "Plum guessed right". What happened: the cut wire tile flies outside its
  stand and covers the first wire of Teal's second row and of Plum's stand for a moment. Shot: R1-shots/fuse-first-turn-375.jpg
