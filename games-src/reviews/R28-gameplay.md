# R28 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. I checked out each game's branch and merged origin/alex/brave-carson-rbpmlk into it
locally (not pushed). For each game I ran the deploy gate `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/r28/<slug> <slug>`
(scenarios, phone-check, sweep). I served the build next to the game's media and played with Playwright touch only (isMobile, hasTouch,
`touchscreen.tap` at hit-tested centres) at 390x844 and 375x667, on default settings with fresh storage. I checked the rules against the
published rules online and kept the notes outside the repo. Shots are in games-src/reviews/R28-shots/. The three games were played at
the same time on a 4-core machine while the gates ran, so the waits may read long.

| Game | Total | Verdict | Gate (--full) | Lowest rows |
|---|---|---|---|---|
| nebula-aces | 6.4 | FAIL | PASS | 4 Turn clarity 5; 2, 5, 8 at 6 |
| vale-of-banners | 7.1 | FAIL | PASS | 5 Phone 6 |

---

## 1. nebula-aces (shelf/W486-nebula-bench @ 67a1836e, merged locally): 6.4, FAIL

### What I played
- Build: the coordinator's `--full` gate build (/tmp/r28/nebula-aces), served next to games/nebula-aces/{media,models,music}. Playwright 1.63 touch only (isMobile, hasTouch, `touchscreen.tap` at hit-tested centres), fresh storage, default settings, deviceScaleFactor 1.
- Tutorial: "New here? Learn in 5 minutes" to the "Drill done" card at 390x844 and 375x667: 26-27 coach lines, 46-47 taps, about 110 s per size, coached duel won in round 2 both times. 4-5 taps ignored per size (see New findings).
- 9 full games from "Launch" on defaults to the result card: 7 always taking the suggestion (pre-selected ★ move, recommended action, ★ target, recommended dice mod), 2 mixing the suggestion with random moves that the dial does not mark as rock or red.
- The machine was shared with other reviewers (load 11-12 on 4 cores), so the waits below may run a bit long.

| Game | Size | Mode | Result | Round | Taps | Wait median / max (my tap to next thing I can tap) | Fly to next plan, median / max |
|---|---|---|---|---|---|---|---|
| t1 | 390 | suggest | loss | 5 | 50 | 1.2 s / 5.4 s | 21 s / 28 s |
| s390a | 390 | suggest | **win** | 7 | 52 | 1.2 s / 5.7 s | 17 s / 27 s |
| s390b | 390 | suggest | **win** | 10 | 70 | 1.2 s / 5.5 s | 15 s / 33 s |
| s390c | 390 | suggest | **win** | 11 | 74 | 1.1 s / 5.5 s | 18 s / 23 s |
| m390a | 390 | mixed | loss | 8 | 56 | 1.3 s / 5.8 s | 17 s / 30 s |
| s375a | 375 | suggest | loss | 11 | 84 | 1.2 s / 5.7 s | 15 s / 26 s |
| s375b | 375 | suggest | **win** | 18 | 109 | 1.2 s / 6.2 s | 13 s / 26 s |
| s375c | 375 | suggest | **win** | 22 | 123 | 1.2 s / 5.6 s | 13 s / 25 s |
| m375a | 375 | mixed | loss (flew off the mat) | 11 | 73 | 1.3 s / 5.4 s | 18 s / 28 s |

Following the suggestion won 5 of 7 (71%), not the claimed 8 of 10. Mixed play lost 2 of 2. Overall 5 of 9. 0 page errors, 0 console errors and 0 stuck states in all 11 runs. 4 dead taps, all in t1 (the fire chip slides after it appears). In every game the dial opened on the ★ move, never on last round's move.

**Rules check.** I checked the game against the published first-edition base rules and confirmed the asteroid and touching-ships limits with a web search (notes kept local). The Rules screen and the engine are unchanged since R22. The engine is still right on: secret plan; lowest pilot skill moves first; one action; stress (no actions, no red; green clears it); K-turn; a bump skips your action; leaving the mat destroys the ship; an asteroid rolls one attack die and skips your action. In combat: highest skill fires first; +1 attack die at range 1; +1 defence die at range 3 or when obstructed; shields first; crits face up; focus and evade are cleared at the end and locks stay. Initiative goes to fewer points (the stand-in for the fixed-faction tie is disclosed). No round limit by default. The Rules screen still leaves out three combat limits that the engine applies: a ship on an asteroid can't attack, touching ships can't attack each other, and equal skill fires at the same time. "Flying through an asteroid rolls a damage die" should say attack die. Nothing invented changes how a default game is won.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 7 | The engine follows the base rules. The Rules screen still leaves out 3 combat limits and says "damage die" where it means attack die. Fixed setup facing and grid rocks are disclosed. |
| 2 | Tutorial teaches | 6 | Better: every core rule is done once by touch in about 110 s, the circles are 44 px, and "The rest is in Rules" is gone. Still not fixed: the flow is split (3 bubbles, coached duel, card, drill, card). Coach lines run one step late: "His evades cancelled your hits. At range 3 he rolls one more" shows while the rival aims at me, and "Pilot power" shows at the next plan step. Rocks are only told, never flown. 4-5 ignored taps per size on chips that were still sliding. |
| 3 | First 10 seconds | 7 | Clear title line, big "Launch" and "New here?". Launch shows one goal card with 3 bullets and a finger on "Start ▶". Then "Tap your ship to plan its move". |
| 4 | Turn clarity | 5 | The dial opens on the ★ move, not last round's move (fixed). But in 4 of 9 games the pre-selected ★ move was marked "rock!" by the game itself: R1 ↑3 at 375, R2 bank or K-turn twice, R6 in a mixed game. The dial never warns when a move leaves the mat. In one test all 15 moves left the mat with no mark, ★ included. At 375 the action chips sit on top of name plates. |
| 5 | Phone play | 6 | Targets measured at 44 px or more (dial cells 56x44, bottom buttons 52 high). Both sizes fit. The gate's phone-check passes. But at 375 the Focus and Lock chips cover Kael's and Knifepoint's plates. Fire and action chips slide 15-60 px in the first second after they appear, so a quick tap lands on empty board. |
| 6 | AI and pacing | 7 | A new player who follows the suggestion can now win on default (5 of 7; up from 0 of 10 in R22). Mixed play lost 2 of 2, once by flying off the mat without a warning. The rival is brisk: about 1.2 s median from my tap until I can act again, 6.2 s max. Length swings from round 5 to round 22. Round 22 at bot speed was about 6 minutes, so a person would take 15+ minutes. |
| 7 | Feel | 7 | 3D ships fly their paths, dice tumble, laser lines, damage floaters, painted VICTORY and DEFEAT cards with "Play again". |
| 8 | Bugs | 6 | 0 errors and 0 stuck states in 11 runs, and every game reached the result card. But there were 4 dead taps in one game (the fire chip slides away from the finger), 4-5 ignored taps in each tutorial, and the suggestion still picks moves it labels "rock!". |
| | **Total** | **6.4** | **FAIL**: rows 2, 4, 5 and 8 are below 7. Not capped: the dead taps worked on the second tap and never stopped play. Same call as R22 made for cauldron-fair: a dead tap that works on the second tap costs row 8 but is not a stopper. |

**Gate:** PASS. `build-all.py --full nebula-aces` finished with "1/1 PASS ... EXIT 0": phone-check took 94.7 s and passed, and rules-test passed. One warning: "[lab] nebula-aces WARN 9/12 checks (b) LAB rows [...] != scenarios".

### Earlier findings (R22)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: lost 10 of 10 on the default first game, 6 of 6 when following suggestions | **Mostly fixed.** Following the suggestion won 5 of 7, not 8 of 10. Mixed play lost 2 of 2. | games-src/reviews/R28-shots/na-390-victory-r7.jpg, games-src/reviews/R28-shots/na-375-victory-r22.jpg, games-src/reviews/R28-shots/na-375-defeat-r11.jpg |
| Row 4/6: the dial opens on a suggested move marked "rock!" (↑3 in R1) | **Not fixed.** The ★ move was "rock!" in 4 of 9 games: R1 ↑3 at 375, R2 turn right 2 at 390, R2 red K-turn with stress at 375, R6 in a mixed game. | games-src/reviews/R28-shots/na-375-suggested-straight3-rock-r1.jpg, games-src/reviews/R28-shots/na-390-suggested-turn-rock-r2.jpg, games-src/reviews/R28-shots/na-375-suggested-kturn-rock-stress-r2.jpg, games-src/reviews/R28-shots/na-375-suggested-rock-r6-mixed.jpg |
| Row 6/8: the suggestion (↑2 every round) flew Kael off the mat | **Fixed for the suggestion:** it varied every round and never left the mat in 7 games. A random unmarked move did fly off (m375a, R11). | games-src/reviews/R28-shots/na-375-dial-offmat-move-no-warning.jpg |
| Dial pre-set to last round's move | **Fixed.** In all 9 games the dial opened on that round's ★ move. | games-src/reviews/R28-shots/na-390-suggested-turn-rock-r2.jpg |
| Row 4: "Ships move" bubble stays up during Fire | **Not seen** in 9 games. The "Ships move" bubble showed only during Move. | games-src/reviews/R28-shots/na-375-tut-pilot-power-coach-late.jpg (Move-step bubble) |
| Row 4: coach "Range 3 gave him a defence die" while I defend | **Partly.** The line now reads "His evades cancelled your hits. At range 3 he rolls one more", but it still shows while the rival aims at me and covers the "Rival's turn" bubble. | games-src/reviews/R28-shots/na-390-tut-coach-my-shot-while-rival-aims.jpg |
| Row 5: 42 px dial circles in tutorial and drill | **Fixed.** 44 px or more measured at both sizes. | games-src/reviews/R28-shots/na-390-tut-dial-44px-circles.jpg |
| Row 5: name plates, move chips and bubbles pile up at 375 | **Not fixed.** The Focus and Lock chips sit on Kael's and Knifepoint's plates. | games-src/reviews/R28-shots/na-375-action-chips-over-name-plates.jpg |
| Row 5: tutorial Lock button on Kael's plate at 375 | **Partly.** Same pattern: action chips cover the plate in real games. | games-src/reviews/R28-shots/na-375-action-chips-over-name-plates.jpg |
| Row 2: split flow, "The rest is in Rules" | **Partly.** The "rest is in Rules" line is gone. The flow is still bubbles, duel, card, drill, card. | games-src/reviews/R28-shots/na-375-drill-done-card.jpg |
| Row 1: Rules screen leaves out the asteroid, touching and simultaneous-fire limits | **Not fixed** (known open). | no shot (a rules check) |
| Gate phone-check FAIL | **Fixed.** The `--full` gate passes. | /tmp/r28/gate-nebula-aces.log |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8/5 | Tapped the ★ fire chip about 1 s after it appeared (game t1, 390) | 4 of 5 first taps did nothing. The chip slides 15-60 px in its first second (I measured this on 49 taps in 3 games), so the tap lands where it used to be. The second tap worked. | games-src/reviews/R28-shots/na-390-fire-chip-slid-dead-tap.jpg |
| 2/8 | Tutorial at both sizes: tapped the finger's target about 2 s after the last step | 4-5 ignored taps per size on Focus, Roll, Boost, Lock and the ship ring, for the same reason: the target was still sliding. | games-src/reviews/R28-shots/na-375-tut-pilot-power-coach-late.jpg |
| 2 | Coached duel, 375 and 390 | "Pilot power: Kael turns one focus result into an evade" shows at the round 2 plan step, after the defence it explains. "Round end" and "Rocks" also show during that plan step. | games-src/reviews/R28-shots/na-375-tut-pilot-power-coach-late.jpg |
| 4/6 | Mixed game at 375, picked ↖3 in R11 (no rock mark, not red) | Kael flew off the mat and the game was lost. The dial marks rocks but never marks a move that leaves the mat. A test ship at the edge saw all 15 moves leave the mat, with no mark on any of them. | games-src/reviews/R28-shots/na-375-dial-offmat-move-no-warning.jpg |
| 6 | Game length on suggestions | Rounds 5 to 22. The 22-round game took about 6 minutes at bot speed, so a person would need 15+ minutes. | games-src/reviews/R28-shots/na-375-victory-r22.jpg |
| 1 | Read the Rules screen | "Flying through an asteroid rolls a damage die" should say attack die. | no shot (a rules check) |

---

## 2. vale-of-banners (shelf/W505-vale-gameplay @ 0c63f2e0, merged locally): 7.1, FAIL

What I played (play copy built with `VIS_SLUGS="," build-all.py` without --full, served next to `games/vale-of-banners/media`,
real touch only via `touchscreen.tap` at hit-tested centres, fresh storage, started from the title by tapping):
- Tutorial ("New? Learn to play") to the last step at 375x667 (twice) and 390x844: 49 steps, 50 taps, 15 of them Next-only,
  0 ignored taps, 0 covered targets, every target 44x44 or more. Longest gap between steps 2.8 s (includes my 1.2 s settle check).
  0 errors. It runs on into a guided short game (season 2 of 2).
- Four full Quick games on defaults (title > Play > "2" and "Gentle" already chosen > Start) to the result screen. I tapped the ★
  about half the time, otherwise a random glowing target. g3 was the impatient one: I tapped the board during every rival turn.
  g1 is weak data: my driver could not see the ★ when it sat in the closed Market tab, so I played almost at random (17 ★ taps).
- Before Start I tapped the already-chosen "2" and "Gentle" chips in every game.

| Game | Size | Result | Time | Taps / decisions | ★ taps | ★ on End turn / without reason | ★ only in closed Market tab | Rival wait median / max |
|---|---|---|---|---|---|---|---|---|
| g1 | 375 | lost 54-97 (near-random play) | 4.6 min | 181 / 133 | 17 | 16 / 0 | not measured | 5.5 s / 10.8 s |
| g2 | 375 | **won 83-80** | 5.7 min | 248 / 174 | 78 | 33 / 0 | 33 | 5.8 s / 8.9 s |
| g3 (impatient) | 390 | **lost 83-85** | 3.9 min | 304 / 178 | 65 | 32 / 0 | 37 | 2.7 s / 4.9 s |
| g4 | 390 | **won 90-66** | 5.1 min | 208 / 155 | 67 | 29 / 0 | 37 | 5.1 s / 10.3 s |

- 0 page errors, 0 console errors, 0 stuck states in all four games and three tutorials.
- My wait is from my End turn tap to my next playable turn. It includes the round and season cards. The gate and other reviewers
  were running on the same 4 cores, so the waits may run long. Tapping during rival turns speeds them up (median 2.7 s).
- Teaching note in place of the ★ line: 0 times. ★ with no reason line: 0 of 640 decisions.
- Dead taps on my own turns: 0. (My driver logged a few, but each was a tap on the open "Your estate" tab or a tap that only
  closed a round card.) In the impatient game, 11 of 59 taps during rival turns showed no response (the first tap each turn speeds the rival up).

Rules check: I checked the rules screen and the tutorial lines against the published rules online again. 5 seasons x 5 rounds,
two dice plus the white goods die, take/build/sell/hire, ±1 per worker with 6 and 1 next to each other, back lane for 2 silver once a
turn, region points 1-3-6-10-15-21-28-36 plus 10/8/6/4/2 by season, colour bonus 5/2 with two players, mines pay silver each
season, end scoring 1 per silver, 1 per goods, 1 per 2 workers. Nothing invented. The tie-break ("the estate with more empty spaces
wins") follows one reading of the rulebook; online sources disagree on this point. The code, rules screen and tutorial all say the same.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Every core rule matches the published game. The tutorial, rules screen and engine agree. The only point I'm unsure of is the tie-break, which sources disagree on. |
| 2 | Tutorial teaches | 8 | Fixed: once the bubble settles, it never covers the prompt line (0 of 49 steps at both sizes). At 375 it crossed the line for a moment on steps 4 and 6 while sliding in. Fixed: step 15 now explains the rival's points ("Tobin scored 27: 1 region, 1 colour bonus"). That line leaves out his 6 goods points, so 16+5 does not add up to 27. Still 15 Next-only steps of 49. Max gap 2.8 s. |
| 3 | First 10 seconds | 7 | Title, a big Play, setup with defaults chosen, a 4-line goal card, you move first. Fixed: tapping a chosen chip now answers ("Players: 2 is already chosen. Tap Start."). |
| 4 | Turn clarity | 7 | Fixed: the ★ on End turn now has a reason line every time (110 times over 4 games, 0 without one). No teaching note replaced the ★ line. New: on about 1 decision in 5 (33-37 a game, both sizes) the ★ sits on a market tile while the Market tab is closed. The tab shows no ★. The line says "★ Take Keep..." about a tile the player can't see. |
| 5 | Phone play | 6 | The glowing worker chip ("2 workers") is only 40 px tall (88-103 x 40), below 44 px. Tapping it just shows a toast that says drag. The round and season cards ("Round 3 of 5") appear on my own turn and sit on top of glowing spaces and the ★ cell. A tap there only closes the card (4-7 such taps a game). The "Your turn" banner still sits over the score strip. |
| 6 | AI and pacing | 7 | Following the ★ about half the time, I won 83-80 and 90-66 and lost 83-85 (and lost 54-97 playing almost at random). Games last 3.9-5.7 min. Rival turns took a median of about 5 s with the cards, up to 10-11 s once or twice a game on a busy machine. Tapping cuts that to about 2.7 s. |
| 7 | Feel | 7 | Unchanged: dice roll in the banner, tiles fly, score pops ("+2 goods sold", "+16 region full"), regions flash, the result table counts up, and the copy is honest ("Won by just 3 points"). |
| 8 | Bugs | 7 | 0 errors, 0 stuck states, 0 dead taps on my turns in 4 games and 3 tutorials. Gate --full passes, and the setup chips answer now. Not 8: when I tapped during rival turns, 11 of 59 taps got no response. |
| | **Total** | **7.1** | **FAIL** (row 5 under 7; no stopper) |

**Gate**: PASS. `/tmp/r28/gate-vale-of-banners.log`: `[time] vale-of-banners phone-check 59.9s` (no dead-tap lines),
`rules-test.js ok: AI games: 40/40 finished, stuck 0, invariant breaks 0 / PASS 37 checks`, `PASS vale-of-banners`, `EXIT 0`.
One WARN, not blocking: `[lab] WARN 3/8 checks (b) LAB rows [...] != scenarios [menu,...]`.

### Earlier findings (R26)
| Finding | Status | Evidence |
|---|---|---|
| Gate fails: dead taps on selected chips "2"/"Gentle" | **Fixed**: the tip line answers, and the gate passes. | games-src/reviews/R28-shots/vb-g1-375-setupchip.jpg |
| ★ on End turn with no reason line (~28 a game) | **Fixed**: "★ End turn: no useful move left..." every time, 0 of 110 without it. | measured; games-src/reviews/R28-shots/vb-g4-390-d40.jpg (line under prompt) |
| Teaching note replaces the ★ line 1-2 times a game | **Fixed**: 0 times in 640 decisions. | measured |
| Coach bubble over the prompt (step 26, most Next steps) | **Fixed** once it settles (0 of 49 at both sizes). At 375 it crossed the line for a moment on steps 4 and 6 while sliding in. | games-src/reviews/R28-shots/vb-tut-375-ov-4.jpg |
| Rival jumps 0 → 27 with "+16 region full" pops and no explanation | **Fixed in part**: a new step says "Tobin scored 27: 1 region, 1 colour bonus". It leaves out his 6 goods points. | games-src/reviews/R28-shots/vb-tut-375-s15-rvscore.jpg |
| 14 Next-only tutorial steps | **Not fixed**: now 15 of 49 (the recap step adds one). | tutorial log |
| "Your turn" banner over the score strip | **Not fixed**. | games-src/reviews/R28-shots/vb-g3-390-starhidden1.jpg |
| One 10-11 s rival wait per game | **Not fixed** (10.3-10.8 s in 2 games; busy machine). | measured |
| Taps on the "Turn over" card / during rival turns | **Partly**: the first tap each rival turn speeds it up. 11 of 59 taps showed no response. | games-src/reviews/R28-shots/vb-g3-390-rivaltap.jpg |
| New player can win on defaults | **Holds**: won 2 of 3 real attempts, lost the third by 2. | games-src/reviews/R28-shots/vb-g2-375-result.jpg, games-src/reviews/R28-shots/vb-g4-390-result.jpg, games-src/reviews/R28-shots/vb-g3-390-result.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4 | Looked for the ★ on every decision at both sizes | About 1 decision in 5, the ★ is on a market tile while the Market tab is closed. The tab shows no ★, but the line names the tile. A new player can't see what the ★ means. | games-src/reviews/R28-shots/vb-g0-375-star-in-closed-market.jpg, games-src/reviews/R28-shots/vb-g2-375-starhidden2.jpg |
| 5 | Tapped the glowing worker chip | It is 88-103 x 40 px, under 44 px. A tap only shows "Drag a worker onto a die to change it by one." | games-src/reviews/R28-shots/vb-g1-375-worker-tap-toast.jpg |
| 5 | Tapped the ★ space early in my turn | The "Round 3 of 5" card sits on the glowing spaces during my own turn (1 die already used). The tap only closes the card, and the build does not happen (4-7 times a game). | games-src/reviews/R28-shots/vb-g3-390-beat-over-star.jpg, games-src/reviews/R28-shots/vb-g1-375-beat-on-my-turn.jpg |
| 2 | Tutorial step 15 at both sizes | The recap says "Tobin scored 27: 1 region, 1 colour bonus". The pops show +16 and +5, so 6 goods points are missing from the line. | games-src/reviews/R28-shots/vb-tut-390-s15-rvscore.jpg |
| 2 | Tutorial at 375, first pass | On steps 4 and 6 the bubble crossed the prompt for a moment while sliding in, then moved clear. | games-src/reviews/R28-shots/vb-tut-375-ov-4.jpg |
| 8 | Tapped the board during rival turns (g3) | 59 taps; the first each turn speeds the rival up. 11 showed no response. Once a stale "Drag a worker..." toast showed during the rival's turn. | games-src/reviews/R28-shots/vb-g3-390-rivaltap.jpg |
| 7 | Result screen right after the last move | The table counts up, so a quick look shows "Total 13" next to 83 pts. It settles after about a second. Fine, just noting it. | games-src/reviews/R28-shots/vb-g2-375-result.jpg |

