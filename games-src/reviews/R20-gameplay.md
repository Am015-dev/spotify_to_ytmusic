# R20 strict gameplay re-review (12 Nov 2026)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. Each game built from its own branch, served next to its media folder, played by Playwright touch (hasTouch, isMobile, page.touchscreen.tap) at 390x844 and 375x667. Reviewer did not edit game code. Rulebook notes kept local only.

## 1. sands-of-qamar (branch shelf/W497-sands-gameplay @ 8ff4e8d3): 6.6 FAIL

Build: `npm i three` in games-src, then `build-all.py sands-of-qamar` PASS; the staged page served next to games/sands-of-qamar/{media,models,music}. Played by touch only (Playwright isMobile/hasTouch, page.touchscreen.tap, elementFromPoint checked on every target, a state diff within 1.5 s after every tap counts as "responded"). Guided game from the title "New here? Learn by playing" to "Play a real game" at 390x844 (41 steps, 53 taps, 72 s at bot speed with a 0.7 s read pause per step) and 375x667 (41 steps, 53 taps, 94 s). 0 errors. Then 23 full 2-player games from the title ("Play vs computer", default settings: rival easy, Hints off) through the Goal card to the result screen, all by touch:
- 7 games taking the hint move half the time, otherwise a random glowing target or chooser button (4 at 390, 3 at 375);
- 4 games like that but always picking the chooser's lit "best" option (2 at 390, 2 at 375);
- 6 games using only what glows, no hint at all (Hints are off by default, so this is the real new player);
- 2 games always taking the hint move (control).
0 page errors, 0 console errors, 0 stuck states, 0 dead taps in all runs. Rules re-checked against the published rulebook text online (notes kept locally only).

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Checked again against the rulebook: 3 free bid spots with the later 0-bidder first, Hamlet (village) palace and Oasis palm compulsory, Stall 3 coins / Bazaar 6 coins optional, Shrine 2 Sages or 1 Sage + 1 Mystic, sale table 1/3/7/13/21/30/40/50/60, Shadow reach 1 tile per Shadow plus 1 per Mystic, Shadows can take a rival's Advisor or Sage, Advisors 1 + 10 per rival with fewer, last camel ends the round. One small gap: when a player has no legal walk the engine logs "has no legal move and passes" but does not end the game, which the rulebook does (never happened in 23 games). |
| 2 | Tutorial teaches | 7 | Fixed: step 30 now says "Tap Farid's glowing box." and only Farid's box glows (1 glow, 1 highlight) at both sizes. One bubble per step, every target 43-44 px or bigger, every step took the first tap. Still long (41 steps, 53 taps), several lines pack two rules ("Advisors: 1 each, +10 per rival with fewer. Oasis: palm, 3 points."), and the Mystic that buys extra Shadow reach is never done. |
| 3 | First 10 seconds | 7 | Unchanged: one big "New here? Learn by playing" button; Play vs computer opens a 4-line Goal card, then "Tap a glowing spot to bid". The board is still a wall of 30 busy painted tiles. |
| 4 | Turn clarity | 6 | Fixed: score pops now carry words ("+4 You keep 2 Sages", "+13 You keep 3 Advisors"); 0 of 200+ pops had the label hidden. New problems: "−1 You loses points", "−8 You loses points", "+2 You gains 2 coins" (broken grammar, and the minus pops never say why); the rival's pops ("+3 Teal's Traders bring 2 cards") land during your own turn over the tab bar, and "Teal −5 pts" covers Teal's seat chip. "Sensible" bids include 8 and 12 coins on round 1 (anything up to a quarter of your coins glows), so glow does not mean "good". Hints stay off by default. |
| 5 | Phone play | 6 | Good: 0 visible text under 14 px at any tutorial step, buttons 44 px+, no sideways scroll, no feed ribbon cut at the edge (0 in 23 games). Weak: the meeple figures are still 11x13 px at 375 (13x15 at 390); some glowing tiles are only 36-38 px tall at 375 (Hamlet, Stall, Shrine, Oasis); the bid row sits 8 px above the bottom edge (bottom 659 of 667, 836 of 844); score pops cover the seat chip and the tab bar. |
| 6 | AI and pacing | 5 | Waits are brisk (average 2.7-3.9 s, max 9.5 s), games 2-3 min. But the default rival is NOT beatable for a new player. Hint half the time: won 1 of 7 (lost by 39, 70, 103, 35, 16, 27; won 183-173). Hint half the time and always the chooser's lit "best": won 0 of 4 (lost by 36, 14, 16, 20). Only what glows (the real default, Hints off): won 1 of 6, losing by 124, 83, 74, 119 with a random chooser pick and by 111 / won 149-124 with the lit "best" pick. Always the hint move: won 2 of 2 (195-130, 180-160). The fixer's "5/12" was not reproduced, and this is worse than R10. |
| 7 | Feel | 6 | Meeples drop tile by tile, labelled pops fly, painted result card. But pops pile up and collide with the HUD, the rival's pops arrive late during your turn, and the board still reads as a grid of cards. |
| 8 | Bugs | 8 | 23 games and 2 tutorials: 0 errors, 0 stuck states, 0 dead taps (every tap changed the state within 1.5 s). "Onyx wins" is gone. Only text bugs ("You loses", "You gains"). |
| | **Total** | **6.6** | **FAIL** (rows 4, 5, 6 and 7 below 7; no stopper) |

### Earlier findings (R10)
- Row 2/8, step 30 Shadows: no "Tap Farid", 16 tiles glow, tile tap opens a chooser the step refuses: **fixed**. "One tile per Shadow, or a rival's Advisor. Tap Farid's glowing box." with 1 glow at both sizes. Shots: games-src/reviews/R20-shots/sands-tut-30-shadows-390.jpg, games-src/reviews/R20-shots/sands-tut-30-shadows-375.jpg
- Row 4/7, score pop shows only "— +6" (label hidden by CSS): **fixed** for the label (0 hidden in all games: "+4 You keep 2 Sages"), but see the new grammar and overlap findings. Shot: games-src/reviews/R20-shots/sands-g1-t72-390.jpg
- Row 6, new player cannot win on default (0 of 5 at 50-75 % hints): **not fixed**. 1 of 7 at 50 % hints, 0 of 4 at 50 % hints with the lit "best" chooser option, 1 of 6 with glow only. Shots: games-src/reviews/R20-shots/sands-g1-result-390.jpg, games-src/reviews/R20-shots/sands-h3-result-390.jpg, games-src/reviews/R20-shots/sands-r4-result-375.jpg
- Row 5, "You +6 pts" feed ribbon cut at the left edge at 375: **fixed** (0 ribbons or pops past either edge in 23 games). Shot: games-src/reviews/R20-shots/sands-bid-375.jpg
- Row 4, Shadow chooser "+1🔮" icons with no words: **not re-seen** in the tutorial (the step now targets Farid's box directly, no chooser). The chooser now lights one option with a "best" tag.
- Row 8, "Onyx wins" under a "You win!" card: **fixed** ("You win with 183 points."). Shot: games-src/reviews/R20-shots/sands-h6-result-375.jpg
- Row 5, meeple figures 11x13 px at 375: **not fixed** (11x13 at 375, 13x15 at 390). Shot: games-src/reviews/R20-shots/sands-tut-5-lift-375.jpg
- Row 8, ~1 % taps on a glowing tile with no response: **fixed** (0 of ~3,000 taps).
- Row 3, clear title and bid start: **still true**. Shots: games-src/reviews/R20-shots/sands-title-390.jpg, games-src/reviews/R20-shots/sands-goal-375.jpg

### New findings
- Row 6 — did: 7 full games at 390 and 375 from the title, hint move half the time, random glowing target otherwise — happened: won 1 of 7; lost 141-180, 105-175, 96-199, 128-163, 151-167, 122-149 — shots: games-src/reviews/R20-shots/sands-g1-result-390.jpg, games-src/reviews/R20-shots/sands-h3-result-390.jpg
- Row 6 — did: 6 full games tapping only glowing things (Hints are off by default) — happened: won 1 of 6 (149-124 at 375); lost 73-197, 112-195, 70-144, 89-208, 80-191. In all, a new player who does not always follow the hint won 2 of 17 games, worse than R10 — shot: games-src/reviews/R20-shots/sands-r4-result-375.jpg
- Row 4 / Row 6 — did: first bid of a real game with 50 coins at 375 and 390 — happened: 12 and 8 coin spots glow as "sensible" next to Free and 1 coin; a newcomer who taps any glow overpays early — shot: games-src/reviews/R20-shots/sands-bid-375.jpg
- Row 4 — did: bid and walked in real games — happened: pops read "−1 You loses points", "−8 You loses points", "+2 You gains 2 coins (Khanjar)"; the minus pops never say what cost the points — shot: games-src/reviews/R20-shots/sands-g1-t44-390.jpg
- Row 5 / Row 7 — did: watched the board during my turn at 390 and the bid at 375 — happened: "+3 Teal's Traders bring 2 cards: Silk, Gold" lands on the tab bar during my Sell step; "Teal −5 pts" sits on Teal's seat chip and hides the name and coins — shots: games-src/reviews/R20-shots/sands-g1-t72-390.jpg, games-src/reviews/R20-shots/sands-bid-375.jpg
- Row 5 — did: measured every glowing target during walks at 375 — happened: some glowing tiles are 36-38 px tall (Hamlet, Stall, Shrine, Oasis), under the 44 px bar — shot: games-src/reviews/R20-shots/sands-tut-5-lift-375.jpg
- Row 1 (minor) — did: read the engine's turn start against the rulebook — happened: "has no legal move and passes" does not end the game as the rulebook says (not seen in play).
- Row 2 (works) — did: the whole guided game at both sizes — happened: one bubble, one highlighted target per step, 3-page count ending on "Play a real game" — shots: games-src/reviews/R20-shots/sands-tut-count-3-375.jpg, games-src/reviews/R20-shots/sands-tut-39-summon-390.jpg

---

