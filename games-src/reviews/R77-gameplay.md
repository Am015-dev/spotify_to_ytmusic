# R77 strict gameplay review: redline-rally

- Commit reviewed: `f64204d25aea9832156154ad0e2e8cc83c49b084` (origin/alex/brave-carson-rbpmlk, includes the shell calm pass). The staged build is byte-identical to the live `games/redline-rally/index.html`.
- Reviewer: R77, 20 Nov 2026. I reviewed only and changed no game code.
- **Verdict: FAIL, 7.0 average.** Row 1 (rules text) and row 5 (phone / calm) score below 7. There are no stoppers.

## Gates (each run alone, `VIS_SLUGS=","`)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick --out /tmp/x redline-rally` | PASS (10/10 scenarios, 72 s) | PASS (10/10 scenarios, 72 s) |
| `build-all.py --full --out /tmp/x redline-rally` | PASS (phone-check 57 s, lab-test, rules-test) | PASS (same) |

- Quick run 1 partly overlapped an earlier failed attempt (playwright was missing; I installed it and re-ran). Quick run 2 and both full runs had the machine to themselves.
- `games/lab.html` was restored after the full runs and is not committed.
- Engine tests: `node logic-test.js` passed 73/73. `node rules-test.js` passed: 240 games, 0 stuck, 0 invariant failures, average 26 rounds.

## How I played
- I used my own touch script (Playwright `touchscreen.tap`) on the staged build, at 375x667 and 375x553 with an emulated phone.
- At each size: a fresh load, then the tutorial from the title button "New here? Learn in 5 minutes", then 3 Quick games on the default settings (Sunline, 2 laps, 4 rivals, Easy).
- My player was a plain newcomer: shift up on straights, shift down when a corner is within 7 spaces, play big cards on straights and small ones near corners, boost with 4+ heat unless the button is marked risky, always take slipstream, discard 1s and Brakes.
- Clutter was sampled every second with the `calm-audit.js` SAMPLE function, plus one Hint tap followed by 15 s with nothing else tapped.
- I also ran `scripts/calm-audit.js /tmp/x redline-rally` on its own.

| Size | Tutorial | Race 1 | Race 2 | Race 3 | Errors / stuck / dead taps |
|---|---|---|---|---|---|
| 375x667 | done, 80 s, 43 taps | 4th of 5, 194 s, 27 rounds | 3rd, 171 s | 4th, 171 s | 0 / 0 / 0 |
| 375x553 | done, 80 s, 43 taps | 2nd, 186 s | 5th, 179 s | 2nd, 171 s | 0 / 0 / 0 |

- Wait from my tap to my next decision: about 1.3 s on average, 4.2 s at most. No question ever answered itself.
- Easy rivals spun out 0 or 1 times each per race. Winners burned 1 to 12 heat.
- The newcomer reached the podium in 3 of 6 races and won none.

## Clutter and loops (owner bar: at most 1 helper, 0 infinite animations)
- **Infinite DOM animations: 7 at once while planning, every round (FAIL).**
  - `cdGlow`: every playable hand card gets `.glow` (`src/ui.js:124`; keyframes at `src/head.html:130`).
  - `goGlow`: the Go button once it is ready (`src/ui.js:137`, `src/ui.js:166`; keyframes at `src/head.html:135`).
  - `calm-audit.js` independently reports `loops=6`. The tutorial shows 1 loop (`#goB.go.glow`).
- **Infinite canvas loops (the audit cannot see these): 2.**
  - The pulsing ring around the next corner sign: `src/ui.js:444` (`globalAlpha = 0.55 + 0.35*sin(now/260)`).
  - The pulsing ghost car of the move preview: `src/race.js:43` (`0.5 + 0.25*sin(now/180)`).
- **Helpers:** by the audit's selectors the most at once is 1 (tutorial bubble; Hint bubble).
  - Strictly it is **2**. After Hint, the bubble stays open for the whole 15 s, and the coach rating pill is also on screen ("Good: 6 spaces for 2 heat", from `src/race.js:148-152`). See `667-hint15.png`.
  - At 375x553 the Hint bubble covers almost all of the board (`553-hint.png`).
  - The Hint text is generic ("Tap Suggest and the computer picks…") rather than a move.

## Phone (375x553 and 375x667)
- Smallest DOM text: 14 px. Smallest tap target: 44 px.
- Outside the tutorial's own dimming, no button was off screen or covered at any decision.
- The board is small at 375x553: about 190 px of 553 under the 5-chip header. The dock (status line, corner line, gears, 7 cards, Suggest/Go, engine strip) takes the rest. Any bubble or toast over the board hides the track.

## Rules vs the original (from the repo's notes and the rulebook as I know it)
The engine matches the checklist; every core rule passes `logic-test.js`. The player-facing text has these mismatches:

| # | File:line | Text now | Problem |
|---|---|---|---|
| R1 | `src/story.js:7` (Help, line 5 of "How a turn works") | "5. Then every rival takes a turn, one car at a time." | Wrong. Everyone plans at once, then cars resolve **leader first**, so you often move after some rivals and before others. The tutorial (`go1`, `order`) teaches it right; Help contradicts it. |
| R2 | `src/tutor.js:126` (help card "How a turn works") | "Press Go. … Then each rival drives in turn." | Same error as R1. |
| R3 | `src/race.js:196` (goal card, the first thing every race shows) | "Too fast with no heat? You spin." | Wrong condition. You spin when the engine holds **less heat than the excess**, not only at zero. With 2 heat and 3 over the limit, you spin. |
| R4 | `src/tutor.js:128` (help card "Corners") | "No heat left means a spin-out." | Same as R3. |
| R5 | `src/ui.js:267` (stall message) | "<name> has only heat cards: no move, gear 1." | Wrong whenever the hand still holds playable cards, just fewer than the gear. The tutorial's own stall (round 4) holds a Stress card and still shows this line. Should say "too few playable cards". |
| R6 | `src/ui.js:40` (Rules, Adrenaline) | "gets +1 move and +1 cooldown" | The engine adds +1 **speed**, which counts at corners and is optional (checklist 26/29). The tutorial (`tutor.js:76`) says "+1 speed". "+1 move" hides the corner cost. |
| R7 | `src/ui.js:39` (Rules, turn strip) | "React: cooldown, boost, slipstream, corners. Discard: draw back to 7." | Merges separate steps. Slipstream and the corner check come after React, not inside it, and the discard step is "throw away any non-Heat, non-Stress cards", then draw to 7. As written, a reader would think Discard means "draw". |
| R8 | `src/ui.js:43` (Starting upgrades) | "The printed rules give no numbers for these … A stress flip skips them." | The values are printed on the starting cards themselves (0 and 5), so the sentence is wrong. Whether a stress flip may stop on the 0/5 starting cards is **UNSURE**: check it against the printed rule and keep `isSpeed` (`src/engine.js:5`) consistent with the answer. |
| R9 | `src/engine.js:225` | A spin-out pays ALL remaining engine heat | **UNSURE**: verify against the printed text (the notes say verified at W496). If the rulebook does not take the heat, this is an engine mismatch. |
| R10 | `src/story.js:20-56` (`STORY.tut`, `chapters`) | e.g. `finale`: "Gear 2, then boost" before Go; `watch1`: "each drive in turn" | Dead text, never shown (no `STORY.tut` reference outside story.js), but it carries the old rules (boost planned before the reveal). Delete it so nobody wires it back. |
| R11 | `logic-test.js:176` / `RULES-CHECKLIST.md` 64-65 | "SKIP R64 Championship (module not built)" | Stale: Championship and Weather are built (`data.js` CHAMP_PTS, WEATHER). Coverage is under-reported. |
| R12 | `src/race.js:151` | "Okay: 1 spaces. The best play went about 5." | Grammar ("1 space"). Seen live in `553-hint.png`. |

Tutorial, cards, gears, corners and end lines checked and correct: deck 12 speed + 3 stress; engine 6; hand 7; shift 1 free / 2 for 1 heat; cooldown 3/1/0/0; corner excess per corner; spin to gear 1 with 1 stress (gear 1-2) or 2 (gear 3-4); slipstream 2, not speed, never across the line; boost after the reveal; discard step; race until all finish; ties.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine correct, but four player-facing texts teach wrong rules: turn order (R1, R2), spin condition (R3, R4, on the goal card every race), stall cause (R5), adrenaline effect (R6). Plus R7-R8 and two UNSURE items. |
| 2 | Tutorial teaches | 8 | 20 rules in order, one short line and one tap per step, 43 taps / 80 s, then a real race. Small gaps: it never shows the 2-stress spin and calls stress "random" rather than "the next speed card". |
| 3 | First 10 seconds | 7 | Clear title (Play / Learn) and a 3-line goal card, but that goal card states the wrong spin rule (R3), and its quote toast shows behind the modal. |
| 4 | Turn clarity | 7 | Gear buttons show their cost ("-1 heat"), cards say "move N", "Corner 5 in 3: up to speed 5 safe". But there are 3 status texts at once (rating pill, lead line, corner line), and the Hint answer is generic, not a move. |
| 5 | Phone play | **6** | 14 px text and 44 px taps pass, nothing clipped. Fails the calm bar: 7 infinite DOM loops plus 2 canvas loops every planning round. The Hint bubble covers the board at 553 and stays open; 2 coaching overlays show together. |
| 6 | AI and pacing | 7 | Brisk (about 1.3 s waits, 3-minute races, 25-27 rounds). Easy rivals drive cleanly (0-1 spins). A naive newcomer made the podium 3/6 but won 0/6, so a careful new player can win, just. |
| 7 | Feel | 7 | Card flips, speed needle, boost / slipstream / spin effects, sounds, podium. The constant glows make the hand feel noisy, not alive. |
| 8 | Bugs | 8 | 2 tutorials + 6 races to the result screen: 0 page errors, 0 stuck states, 0 dead taps. Only a text bug (R12). |

**Average 7.0. FAIL** (rows 1 and 5 are under 7).

## Repro steps for the rows under 7
- **Row 1:**
  1. Play, then read the goal card: "Too fast with no heat? You spin."
  2. Menu, then Rules: "Then every rival takes a turn" and "Adrenaline … +1 move".
  3. In the tutorial at round 4 (gear 2 holding Stress + Heat), the status line reads "... has only heat cards: no move, gear 1" although a Stress card is in hand.
  - Compare with the engine: `src/engine.js:152-160` (stall when there are too few playable cards) and `finishMove` (spin when `need > c.eng`).
- **Row 5:**
  1. Play any Quick game at 375x553 and reach the plan screen.
  2. Every playable card pulses (cdGlow) and Go pulses (goGlow) without end. Check with `document.getAnimations().filter(a=>a.effect.getComputedTiming().iterations===Infinity).length` (6-8).
  3. Tap the bulb: the bubble covers the track and stays open with the rating pill (`shots 553-hint.png`, `667-hint15.png`).

## Prioritized fix list (for a fixer)
1. **Spin rule text (R3, R4).** `race.js:196`: "Too fast with too little heat? You spin." `tutor.js:128`: "Not enough heat to pay means a spin-out."
2. **Turn order text (R1, R2).** `story.js:7` line 5 and `tutor.js:126`: "Then all cars move one by one, the leader first."
3. **Kill the loops.**
   - `src/ui.js:124`: drop the `glow` class on hand cards, or make `head.html:130` cdGlow run 3 iterations and then stay still.
   - `head.html:135` goGlow: 3 iterations, then a static highlight.
   - Canvas: stop the corner ring (`ui.js:444`) and ghost (`race.js:43`) pulses after about 3 s, or draw them static.
   - Re-run `calm-audit.js` and expect loops=0.
4. **Stall message (R5).** `ui.js:267`: "too few playable cards: no move, gear 1."
5. **Adrenaline wording (R6).** `ui.js:40`: "+1 speed (counts at corners, optional) and +1 cooldown".
6. **Hint calm.**
   - Hide the rating pill while a Hint bubble is open, and close the bubble on the next tap or after one read.
   - At heights under 600 px, anchor the bubble over the dock, not the board.
   - Make the Hint name a move ("Gear 2, play 3+2: safe in the corner") instead of "Tap Suggest".
7. **Rules turn strip (R7).** `ui.js:39`: "React: cooldown, boost. Slipstream. Corner check. Discard: drop unwanted cards, then draw to 7."
8. **Starting-upgrade sentence (R8).** `ui.js:43`: remove "The printed rules give no numbers for these". Settle the stress-flip question (R8) and the spin heat question (R9) against the printed rulebook, then align `isSpeed` / `finishMove` and the text.
9. **Housekeeping.** Delete dead `STORY.tut` / `chapters` (R10). Update `logic-test.js` NB / checklist 64-65 (R11). Fix "1 spaces" (R12).
10. **Re-review.** Once 1-5 are fixed, re-run both gates and the calm audit, and re-review rows 1 and 5.

Screenshots: these are in the reviewer's scratch folder (not committed): `375x667` / `375x553` title, every tutorial step, plan1-3, hint, hint+15 s, result.
