# R15 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game's own branch was built with build-all.py and served next to its
games/<slug>/media folder. I played with Playwright touch only (hasTouch/isMobile, touchscreen.tap at hit-tested points) at 390x844
and 375x667. The tutorial driver taps only the spotlit target or Next. In play I take the glowing choice, the way a new player would.

| Game | Earlier | R15 | Result | Lowest rows |
|------|---------|-----|--------|-------------|
| lantern-dive | 7.0, 6.9, 7.0 | **7.3** | **PASS** | all 7: 2, 3, 4, 5, 6, 7 |
| twin-thrones | 7.1, 7.0 | **7.3** | **PASS** | all 7: 3, 4, 5, 6, 7, 8 |

---

## 1. lantern-dive (shelf/W504-lantern-gameplay @ eec645e1)

What I played: the tutorial to its end card at 390x844 (22 steps, 31 taps, 50 s) and at 375x667 (22 steps, 29 taps, 50 s).
Free play by touch at 375x667: 3 attempts (dive 3 lost, then won on retry; dive 4 lost), plus 2 more attempts at dive 3 (both lost).
Free play at 390x844: 4 attempts (dive 3 lost, then won; dive 4 won; dive 5 lost). Each attempt ran to its result screen. My play was a
newcomer's: take the glowing job, skip the flare, tap Ready (no signal), and play a random glowing card. 0 page errors and 0 console
errors in every run.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | I checked again against the published deep-sea rules. The Lantern 4 holder is Captain and picks first. You must follow colour, and trumps win. One signal per dive (highest, lowest or only, never a trump, between tricks). The flare passes one card left or right and costs an attempt. One broken job ends the attempt. A dive ends at once when every job is done ("Cards in hand do not matter"). No deviation found. |
| 2 | Tutorial teaches | 7 | 22 one-line steps, 15 px text, 19 of 22 are taps on the real object, 50 s, then "Play a real game". Signal limits are taught by touch. The job draft by difficulty is still never shown. |
| 3 | First 10 seconds | 7 | A clear title, the goal line "Dive together. Do not talk about your cards." and one big "New here? Learn in 5 minutes". Free play is still 3 screens (setup → Goal card → table). |
| 4 | Turn clarity | 7 | The prompt says what to do ("Signal now, or tap Ready.", "Tap a job to take it."). A signal chip ("1 low", "9 high") is now a pink pill, and a job chip is a cream card with a coin, so they no longer look alike. Hand cards carry a "Yours" / "New" tag. The prompt is still a small 2-line caption in the top-left corner. |
| 5 | Phone play | 7 | Fixed: my own job is a full-width row at 375 ("First and last", 284 px, no ellipsis). The suits now have their own tint: Coral pink, Tide blue, Kelp green, Sunstar gold, Lanterns cream. Text is 14-15 px, and the flare buttons and Signal/Ready are 75-80 x 44+. Still wrong: at 375 the result card's last line is hidden behind its buttons. The "Nerea wins" chip sits on her tricks line. The Result button covers the "You" label on the table. |
| 6 | AI and pacing | 7 | Waits are fixed. From my card to my next turn: median 3.5 s (max 7.8) at 375 and median 3.3 s (max 11.1) at 390, over 62 turns (R13: 8.8 s). A dive attempt took 20-30 s. My random newcomer play won 3 of 9 attempts, and each won dive came on the first or second try. The computer divers kept their jobs safe (no job broke by a computer's own play in my runs). |
| 7 | Feel | 7 | Cards travel to the pad, the trick sweeps to the winner, job ticks fire, and the flare has its own picture. The 390 pad is still a big empty dark box between tricks. |
| 8 | Bugs | 8 | 0 errors, 0 stuck states and 0 dead taps over 2 tutorials and 9 attempts. |

**Total: 7.3 — PASS** (every row ≥ 7, no stopper).

### Earlier findings (G4, R5, R13)
- R13 row 5, own job pill cut at 375 ("Exac 2 i…"): **FIXED.** Full row, scrollWidth = width. Shot: games-src/reviews/R15-shots/lantern-375-own-job-full.jpg
- R13/R5 row 5, Coral and Sunstar both dark teal, Tide and Kelp both cream: **FIXED.** Pink / gold / blue / green / cream. Shot: games-src/reviews/R15-shots/lantern-375-play-tints.jpg
- R13 row 6, waits of 8.8 s median: **FIXED** (3.3-3.5 s median). Shot: games-src/reviews/R15-shots/lantern-390-play.jpg
- R13 row 4, job chip looks like a signal chip: **FIXED.** Shot: games-src/reviews/R15-shots/lantern-375-signal-chip.jpg
- R13 row 4, the prompt is a small top-left caption: **NOT FIXED.** Shot: games-src/reviews/R15-shots/lantern-375-signal-chip.jpg
- R13 row 5, the 390 tutorial hand overlaps so far that only the numbers show: **PARTLY.** It is now 2 rows of 7, and the bubble covers the top of the upper row on the signal step. Shot: games-src/reviews/R15-shots/lantern-390-tut-09-signal.jpg
- R13 row 7, the trick pad is mostly empty: **NOT FIXED** at 390. Shot: games-src/reviews/R15-shots/lantern-390-play.jpg
- R5/R13 row 2, job draft by difficulty never shown: **NOT FIXED.** Shot: games-src/reviews/R15-shots/lantern-390-tut-02.jpg
- R5 row 6, first real game too short: **still fixed** (Free play starts at dive 3, and the tutorial ends on "Play a real game"). Shot: games-src/reviews/R15-shots/lantern-390-tut-end.jpg, games-src/reviews/R15-shots/lantern-375-tut-end.jpg

### New findings
- Row 5 — did: lost dive 3 at 375x667 — happened: the result card's explanation ("The red cross marks the job that broke. Grey jobs were still…") runs under the Try again buttons and is cut off — shot: games-src/reviews/R15-shots/lantern-375-result-text-cut.jpg
- Row 5 — did: watched trick 6 at 375x667 — happened: the "Nerea wins" chip covers her "2 tricks" line — shot: games-src/reviews/R15-shots/lantern-375-winner-chip-over-tricks.jpg
- Row 5 — did: finished a won dive at 375x667 — happened: the Result button covers the "You" label under my card on the pad — shot: games-src/reviews/R15-shots/lantern-375-result-btn-over-you.jpg
- Row 6 (works) — did: retried a failed dive with the same jobs — happened: won on attempt 2, and the result says why it ended ("Every job was done after trick 3. The dive ended at once.") — shot: games-src/reviews/R15-shots/lantern-375-retry-won.jpg, games-src/reviews/R15-shots/lantern-390-result-won.jpg
- Row 4 (works) — did: broke my own job at 390 — happened: the result names it ("Win a 6 using your own 6"), with the trick — shot: games-src/reviews/R15-shots/lantern-390-result-fail.jpg

---

## 2. twin-thrones (shelf/W483-twin @ bccc4b1a)

What I played: the tutorial to its end card ("You know the rules", "Play a real game") at 390x844 (38 steps, 73 taps, 150 s) and at
375x667 (38 steps, 75 taps, 149 s). Then a full Quick game on Easy (the default; "easy" is the button marked on) at each size, by touch,
to the result screen. At 390x844 I won 66-60 (331 s, 31 turns). At 375x667 I lost 57-74. My play was random among the glowing cards:
build if I could pay, else a wonder, else sell. I took progress tokens by tapping the glowing token on the board twice. 0 page errors
and 0 console errors.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | I checked again against the published duel rules: wonder draft 1-2-1 twice, only uncovered cards, freed cards flip, trade at 2 + the rival's production, free chains, sell for 2 + 1 per yellow card, loot spaces, instant war and science wins, a science pair gives a token, the 7-wonder limit, the weaker army chooses who starts, 1 point per 3 coins, ties go to blue cards. The wonder values I saw (12 coins + another turn; 3 coins, the rival loses 3, another turn) match. No deviation found. |
| 2 | Tutorial teaches | 8 | 38 one-line steps in play order, almost all taps on the real card or button, including chain, wonder, the 8th wonder lost, token pick, loot, sell, scoring and the tiebreak; ends on "Play a real game". Long for "5 minutes" (2.5 min). |
| 3 | First 10 seconds | 7 | A clear title and goal line ("Two rival cities, one pyramid of cards. Build the better city."), Easy on by default, a big "Quick game". "New here?" is one of 4 equal tiles, not the first thing. |
| 4 | Turn clarity | 7 | The turn line always says whose turn and what to do ("Pick a progress token: a bonus you keep for the whole game.", "You will start the new age."). Build shows "free" / "pay 6" / "too costly". Still: the token tooltip covers the turn line, and the rival's draft picks give no "rival is choosing" cue on the cards. |
| 5 | Phone play | 7 | Fixed: at 375 the token pick, who-starts and Build/Sell/Wonder are a sheet ("Your move", with Hide) over the pyramid. Nothing piles onto my city row, and no labels are cut. No visible text under 14 px (whole page, Age I, 375). Buttons are 44 px+, and token tiles are about 94x44. Still: the token tooltip sits on the turn line at both sizes, and a "+2 Scholars' Court" floater sits over my city row. |
| 6 | AI and pacing | 7 | Easy is winnable by random play (won 1 of 2 here, 2 of 2 in R13). A game is about 5.5 min. Waits are on the slow side: median 6.7 s, max 21.8 s from my move to my next turn at 390 (the max spans an age change with who-starts). |
| 7 | Feel | 7 | Cards lift to a big preview, fly to the city, coins and points float up, the war pawn moves, and the rival's pick is shown first. |
| 8 | Bugs | 7 | 0 errors, 0 stuck states, and both games reached the result. The last card no longer lands on "You win!". Minor: during the rival's draft pick, the wonders stay bright and a tap does nothing, with no feedback. |

**Total: 7.3 — PASS** (every row ≥ 7, no stopper).

### Earlier findings (G2, R13)
- R13 row 5, token pick at 375 collapses the pyramid into a strip over my city ("Sie", "Fre"): **FIXED.** The token pick is a sheet over the pyramid; my city row is clear. Shots: games-src/reviews/R15-shots/twin-375-token-sheet-real.jpg, games-src/reviews/R15-shots/twin-375-tut-token-sheet.jpg
- R13 row 5, who-starts at 375 overlaps my city, "+3 Open Stage" on "I start": **FIXED** in the real game. In the tutorial a "+… Weights Hall" floater still touches the top edge of "I start" (it can still be tapped). Shots: games-src/reviews/R15-shots/twin-375-who-starts-real.jpg, games-src/reviews/R15-shots/twin-375-tut-who-starts.jpg
- R13 row 5, Build/Sell/Wonder over my city row at 375: **FIXED.** They sit over the pyramid, under the card preview. Shot: games-src/reviews/R15-shots/twin-375-build-lift.jpg
- R13 row 8, last card's fly-in on "You win!": **FIXED** (clean result at both sizes). Shots: games-src/reviews/R15-shots/twin-390-result-won.jpg, games-src/reviews/R15-shots/twin-375-result-lost.jpg
- R13/G2, board token tap only opened an info card: **FIXED.** In a real game (375 and 390), the board tokens glow. My first tap armed one ("Tap it again to take it"), and the second took it. Shot: games-src/reviews/R15-shots/twin-390-board-token-armed.jpg
- R13 row 4, token tooltip covers the turn line: **NOT FIXED.** Shots: games-src/reviews/R15-shots/twin-375-token-armed-tooltip.jpg, games-src/reviews/R15-shots/twin-390-board-token-armed.jpg
- G2/R13, "Build: too costly" looked live: **still fixed** ("Wonder too costly" is greyed). Shot: games-src/reviews/R15-shots/twin-375-build-lift.jpg
- R13 row 2, tutorial long: **still true** (38 steps, 150 s). Shot: games-src/reviews/R15-shots/twin-375-tut-end.jpg, games-src/reviews/R15-shots/twin-390-tut-end.jpg

### New findings
- Row 8 — did: tapped a wonder right after my first draft pick at 375x667, while the line narrated my pick — happened: nothing happened, and the 3 wonders stayed bright with no "Rival is choosing" cue; my driver logged 15 such ignored taps over the draft — shot: games-src/reviews/R15-shots/twin-375-draft-tap-ignored.jpg
- Row 5 — did: armed the "Master Builders" token at 390x844 — happened: the token tooltip covers "Your turn / Pick a progress token", and a "+2 Scholars' Court" floater sits on my city row — shot: games-src/reviews/R15-shots/twin-390-board-token-armed.jpg
- Row 6 — did: played Easy at 375x667 with random glowing cards — happened: lost 57-74; the result explains why ("civic cards (+21) and wonders (+13)") — shot: games-src/reviews/R15-shots/twin-375-result-lost.jpg
