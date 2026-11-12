# R28 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. I checked out each game's branch and merged origin/alex/brave-carson-rbpmlk into it
locally (not pushed). For each game I ran the deploy gate `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/r28/<slug> <slug>`
(scenarios, phone-check, sweep). I served the build next to the game's media and played with Playwright touch only (isMobile, hasTouch,
`touchscreen.tap` at hit-tested centres) at 390x844 and 375x667, on default settings with fresh storage. I checked the rules against the
published rules online and kept the notes outside the repo. Shots are in games-src/reviews/R28-shots/. The three games were played at
the same time on a 4-core machine while the gates ran, so the waits may read long.

| Game | Total | Verdict | Gate (--full) | Lowest rows |
|---|---|---|---|---|
| vale-of-banners | 7.1 | FAIL | PASS | 5 Phone 6 |

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

