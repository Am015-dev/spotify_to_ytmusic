# R13 strict gameplay re-review (12 Nov 2026)

Reviewer R13. Scored by `games-src/reviews/GAMEPLAY-RUBRIC.md`. Each branch was built with `build-all.py <slug>` (PASS) and served
next to its `games/<slug>` media. Every game was played with Playwright touch only (hasTouch/isMobile, `page.touchscreen.tap`,
`elementFromPoint` checked on every tap) at 390x844 and 375x667. Rules were checked against the published rulebook and rules
summaries online (notes kept local, not committed). Fixers' claims were measured, not trusted.

| Game | Earlier | R13 total | Verdict | Rows under 7 |
|---|---|---|---|---|
| lantern-dive | 7.0, 6.9 | **7.0** | **FAIL** | 5 Phone play (6), 6 AI and pacing (6) |
| twin-thrones | 7.1 | **7.0** | **FAIL** | 5 Phone play (5) |

---

## 1. lantern-dive (shelf/W504-lantern-gameplay @ 02b848db)

What I played: the tutorial to its end card at 390x844 (22 steps, 80 s, 35 taps) and at 375x667 (92 s), then "Play a real game".
Free play at 375x667 with fast taps (120 ms after each action) for 5 dives in a row: dive 3 lost, then won on a retry, dive 4 lost,
then won on a retry, dive 5 lost (478 s, 48 card plays). Free play at 390x844 for 3 attempts at dive 3, all lost. Plus one extra run at
375x667 for signal mode, seat pop-ups and font sizes. 0 page errors and 0 console errors in every run.

**Stall hunt (the fixer's 375x667 note):** I could not make it stall. I ran 5 dives at 375x667 with fast taps, plus 1 more dive at
375x667. Every phase moved on: job pick, signal or Ready, every trick, result, retry and next dive. One early run of mine did loop,
but that was my test script tapping a job card hidden under the Goal card, not the game. **No stopper.**

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | These match the published deep-sea rules: 40 cards (4 colours 1-9 + 4 trumps), Lantern 4 holder is Captain and picks first, you must follow colour, trumps win, you are never forced to win, one signal per dive (highest, lowest or only, never a trump, only between tricks), a flare costs an attempt, and one broken job ends the attempt and you retry. One name per concept now: "Captain" and "signal" everywhere ("Ping" and "Commander" are gone from the built page). |
| 2 | Tutorial teaches | 7 | 22 one-line steps; 16 are taps on the real object. The failed-job line is now right ("fails the attempt. The crew then tries again"). The "only" signal and "between tricks" are told in a line, not shown. The job draft by difficulty is never shown. Ends on a won dive, then a real game. |
| 3 | First 10 seconds | 7 | The title and "New here? Learn in 5 minutes" are clear. Free play is still setup → Goal card → table (3 screens). |
| 4 | Turn clarity | 7 | Signal is now its own mode: tap Signal, the legal cards glow, Lanterns dim, then "Show it / Cancel". Seat chips are words ("9 high", "No Kelp", "One Coral, one Kelp"), and the seat pop-up lists cards, tricks, signal and the job. The result screen names the job and the trick that broke it. Weak spots: the prompt is a 2-line top-left caption, and a seat's job chip and its signal chip look alike. |
| 5 | Phone play | 6 | Fixed: hand cards are 62x87 (375) and 64x90 (390), action buttons 69x48, header 44x44, and no text under 14 px. Still wrong: at 375 your own job pill is cut off ("Exac 2 i…", "Never two…"). Coral and Sunstar are both dark-teal cards with yellow numbers, and Tide and Kelp are both cream; the new shapes are tiny foot marks, so suits still differ only by a small emblem. In the 390 tutorial the 14-card hand overlaps so far that only the numbers show. |
| 6 | AI and pacing | 6 | The first real game is now longer: the game after the tutorial has 2 jobs, and Free play starts at dive 3 (10 tricks). But waits got longer: from my card to my next turn took a median of 8.8 s (max 13.6 s) over 58 turns, so a 10-trick dive takes about 95 s with 10 decisions. My newcomer play (lowest legal card) won 2 of 9 attempts. The computer divers play sensibly. |
| 7 | Feel | 7 | Cards now visibly travel from the seat (caught mid-flight at 375), won tricks sweep to the winner, and the job beats fire. The 375 trick pad is still a big, mostly empty dark box between plays. |
| 8 | Bugs | 8 | 0 errors, 0 stuck states and 0 dead taps over 2 tutorials and 10 attempts, including the fast-tap 375 run. |

**Total: 7.0 — FAIL** (rows 5 and 6 are below 7; no stopper).

### Earlier findings (G4, R5)
- R5 row 5, signal spots 30x30 on the card corners: **FIXED.** Signal is a separate mode, so a card tap always plays. Shot: games-src/reviews/R13-shots/lantern-375-signal-mode.jpg
- R5 row 4, "Ping" vs "signal", "Captain" vs "Commander": **FIXED** (the built page has neither "Ping" nor "Commander"). Shot: games-src/reviews/R13-shots/lantern-375-seat-pop.jpg
- R5 row 4, symbol chips "8▲", "1▽", red ⊗: **FIXED.** Chips are words ("9 high", "Signal used"). Shot: games-src/reviews/R13-shots/lantern-390-tut-token.jpg
- R5 row 5, Coral and Sunstar both dark teal: **NOT FIXED.** The same paper and number colour; only the emblem differs. Shot: games-src/reviews/R13-shots/lantern-375-job-pill-cut.jpg
- R5 row 5, header labels 13px: **FIXED** (15px; no text under 14px).
- R5 row 2, step 5 says a failed job "loses the dive": **FIXED.** The "only" signal and "between tricks" are told, not shown: **PARTLY.**
- R5 row 6, the first real game was 2 card plays: **FIXED** (2 jobs after the tutorial; Free play starts at dive 3). Shot: games-src/reviews/R13-shots/lantern-375-real-game-2jobs.jpg
- R5 row 7, no visible card travel: **FIXED.** Shot: games-src/reviews/R13-shots/lantern-375-card-travel.jpg
- R5 row 5, the 375 trick pad is small and empty: **PARTLY.** The pad is large but empty most of the time.
- Fixer's 375 stall: **NOT REPRODUCED.** Shot: games-src/reviews/R13-shots/lantern-375-dive5-result-no-stall.jpg

### New findings
- Row 5 — did: took the job "Exactly 2 in a row" at 375x667 — happened: my own job pill reads "Exac 2 i…" (and "Never two…" in another dive), so I cannot read my own job without opening Jobs — shot: games-src/reviews/R13-shots/lantern-375-job-pill-cut.jpg, games-src/reviews/R13-shots/lantern-375-card-travel.jpg
- Row 6 — did: played 5 dives at 375x667 — happened: a median of 8.8 s and a max of 13.6 s from my card to my next turn, "Thinking…" on each seat in turn; a dive is about 95 s for 10 taps — shot: games-src/reviews/R13-shots/lantern-375-dive3-won.jpg
- Row 4 — did: watched the seats during the signal phase — happened: Nerea's job chip "No Kelp" has the same pill look as a signal chip such as "9 high" — shot: games-src/reviews/R13-shots/lantern-375-signal-mode.jpg
- Row 4 (works) — did: lost dive 3 — happened: the result names the job, the trick and the card ("Trick 10: Bram won it with Coral 7") and offers same jobs or new jobs — shot: games-src/reviews/R13-shots/lantern-375-result-fail.jpg

---

## 2. twin-thrones (shelf/W483-twin @ 258ac29c)

What I played: the tutorial to the end at 390x844 (38 steps, about 190 s) and at 375x667 (38 steps, 190 s, end card "You know the
rules"). Then a full Quick game on Easy (the level selected by default) at 390x844: won 60-41 in 259 s, 30 turns. Another at 375x667:
won 41-33 in 289 s, 31 turns. My play was random among the glowing cards: build if I could pay, otherwise a wonder or sell. 0 errors.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | These match the published game: the wonder draft (1-2 then 2-1, the last wonder automatic), only uncovered cards, freed cards flip, trade at 2 + the rival's production, chains are free, selling for 2 + yellow cards, war loot spaces, war and science instant wins, science pairs give a progress token, the wonder that picks from 3 unused tokens, the 7-wonder limit, the weaker army choosing who starts (tie: last card taker), coins 1 point per 3 and the blue-card tiebreak. No deviation found. |
| 2 | Tutorial teaches | 8 | 38 one-line steps, almost all taps on the real card or button, every core rule in play order, then a real game. It is long for "5 minutes" (about 3 min of it is waiting on the rival). |
| 3 | First 10 seconds | 7 | Clear title and goal line. The Goal card's "Start the duel" button is small (115x44) for the one thing to tap. |
| 4 | Turn clarity | 7 | The top line always says whose turn and what to do. A disabled Build is grey, says "too costly" and explains itself on tap. Weak spots: the token and Build tooltips cover the turn line, and the 5 round icons above the pyramid (the progress tokens) have no words. |
| 5 | Phone play | 5 | At 390 it is fine. At 375x667 the board breaks whenever the dock grows. During a progress-token pick, the pyramid collapses into a strip, and its cards pile onto my city row with labels cut to "Sie", "Fre". On "who starts", the Age II pyramid overlaps my city, cut to "Hors", "Sawp", and a "+3 Open Stage" floater sits on the "I start" button. On the Build/Sell/Wonder lift, the buttons sit over my city row. |
| 6 | AI and pacing | 7 | Random play won both Easy games (60-41, 41-33), so a new player can win. The rival moves in 1.5-7 s (median wait 6.3 s at 375), and a game is 4.3-4.8 min. |
| 7 | Feel | 7 | Cards lift and fly to the city, the rival's pick is shown before it lands, score floaters, the war pawn moves. |
| 8 | Bugs | 7 | 0 errors, 0 stuck states and 0 dead taps on my turns. At 375 the last card's fly-in sits on top of the "You win!" heading as the result opens. |

**Total: 7.0 — FAIL** (row 5 is 5; no stopper).

### Earlier findings (G2)
- R4/R5, the 4th progress token off-screen at x=448 in a scrolling row: **FIXED.** 3 tokens (wonder pick, 390) and 5 tokens (pair pick, 375) all sit in a grid of 94-116 x 42-58, all on screen, scrollWidth 0. Tap to arm ("Tap again to take it"), tap again to take. Shot: games-src/reviews/R13-shots/twin-390-token-armed.jpg
- R4, a token tap on the board only opened an info card: **NOT SHOWN TO WORK.** During a real pair pick at 375 the board tokens had no pickable state (no glow); only the dock list picks. Shot: games-src/reviews/R13-shots/twin-375-token-pick-pyramid-collapsed.jpg
- R4, "Build: too costly" looked live: **FIXED.** Grey, "too costly", and a tap shows "You need 2 coins. You have 1." Shot: games-src/reviews/R13-shots/twin-390-build-disabled.jpg
- R6, Easy is winnable: **still true** (won 60-41 and 41-33). Shot: games-src/reviews/R13-shots/twin-390-result.jpg
- R2, the tutorial covers everything but is long: **still true** (38 steps, about 190 s). Shot: games-src/reviews/R13-shots/twin-390-tut.jpg

### New findings
- Row 5 — did: picked a progress token after a science pair at 375x667 — happened: the 5-token grid pushes the board up; the pyramid becomes a strip, its cards overlap my city row, and the labels are cut ("Sie", "Fre"); a "+2 Globe Hall" floater sits on the grid — shot: games-src/reviews/R13-shots/twin-375-token-pick-pyramid-collapsed.jpg
- Row 5 — did: chose who starts Age II at 375x667 — happened: the pyramid cards overlap my city ("Hors", "Sawp" cut off) and "+3 Open Stage" covers the "I start" button — shot: games-src/reviews/R13-shots/twin-375-who-starts-overlap.jpg
- Row 5 — did: tapped a card I could not afford at 375x667 — happened: Build/Sell/Wonder sit over my city row, and the "You need 2 coins" tooltip covers the turn line — shot: games-src/reviews/R13-shots/twin-375-build-lift-overlap.jpg
- Row 8 — did: finished the game at 375x667 — happened: the last card's fly-in sat on top of the "You win!" heading as the result opened — shot: games-src/reviews/R13-shots/twin-375-result-fly-over.jpg
- Row 4 — did: picked a token at 390 — happened: the "Tap again to take it" tooltip covers the turn line at the top — shot: games-src/reviews/R13-shots/twin-390-token-armed.jpg
