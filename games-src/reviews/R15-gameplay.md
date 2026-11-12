# R15 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game's own branch was built with build-all.py and served next to its
games/<slug>/media folder. I played with Playwright touch only (hasTouch/isMobile, touchscreen.tap at hit-tested points) at 390x844
and 375x667. The tutorial driver taps only the spotlit target or Next. In play I take the glowing choice, the way a new player would.

| Game | Earlier | R15 | Result | Lowest rows |
|------|---------|-----|--------|-------------|
| lantern-dive | 7.0, 6.9, 7.0 | **7.3** | **PASS** | all 7: 2, 3, 4, 5, 6, 7 |

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
