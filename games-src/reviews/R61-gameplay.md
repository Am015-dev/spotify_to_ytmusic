# R61 strict gameplay review: twin-thrones

Build reviewed: `shelf/W520-twin-thrones-rules` at **6a94d005** (code 44eee160, the FIXED3 commit). Date 14 Nov 2026.
I only reviewed; no game code was changed.

**Verdict: FAIL, average 7.0.** Rules fidelity and Phone play score 6. No stopper.

## Gates (each run alone)
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick twin-thrones` run 1 | PASS (5/5 scenarios) |
| `--quick` run 2 | PASS (5/5) |
| `--full` run 1 | PASS (phone-check ok, rules-test ok; LAB WARN 5/8, warn-only as before) |
| `--full` run 2 | PASS (same) |
| `cardtext-test.js` | 73 cards ok |
| `tutorial-e2e.js` at 375x667 and 375x553 | 40 steps, 28/28 rules in order, real game after. It reports FAIL only because it opens the source file without `media/`, which gives image 404s; no script errors. |

Note: `--full` rewrites `games/lab.html` in the working tree. I reverted it; nobody should commit it by accident.

## Rules and card text vs the original (repo notes; original not named)
- **Engine: matches.** I checked by reading the code against the original structure:
  - setup: 7 coins, draft 1-2-2-1 / 2-1-1-2, 5 of 10 tokens face up;
  - the three pyramid shapes and which rows are face up;
  - covering and flipping;
  - build / sell (2 + yellow) / wonder, and the 7-wonder cap;
  - trade price (2 + rival's brown/grey), depots and the Quay at 1 coin, choice resources not raising the rival's price;
  - chains free, Urbanism +4 on chain;
  - Architecture and Masonry take off 2 units, choosing the cheapest 2;
  - war: loot at 3 and 6 steps (first time only), win at 9, end points 2/5/10;
  - science: a pair gives a token, 6 different symbols wins, Law counts;
  - wonder effects, including Theology and Strategy (not on wonders);
  - who starts the next age (weaker military chooses; on a tie, the last card taker);
  - guild coins and points (richer city);
  - end scoring, then civic tie-break, then a shared win.
- **All 73 card costs and effects match** the original card list (23 / 23 / 20 + 7 guilds; the 12 wonders and 10 tokens too). Only the costs already listed as UNSURE in rules-notes are still unconfirmed (Beacon Isle, Thunder Idol).
- **Card popup text (`describe()` + chain lines), all 73 read one by one:** every effect is now named. The 12 cards R59 flagged (Sand Arena, the 4 coin yellows, the 7 guilds, Customs Quay) are correct and complete. The popup names the chain card ("Free to build if you own X") and the cards it unlocks.
  Small faults:
  - "1 points" on Herb Garden, Weights Hall, Herbarium and Measure Hall.
  - Depots say "your wood costs 1 coin each to trade". "your" is vague: it means wood you buy.
- **Misleading result text (caps Rules at 6):** I saw one points tie live (375x667, game 1, 64-64, the rival won on civic points). The result line reads "Rival won 64 to 64 on civic points, thanks to guilds (+7) and wonders (+7)."
  - Guilds and wonders did not decide a tied total.
  - The civic totals that did decide it are not given.
  - The flavour line under it ("Build faster next round") also does not fit.
  The draw sentence ("A tie: same points and same civic points, so nobody wins") is fixed, but the tie-break win, the case that actually happens, is still wrong. Code: `shortWhy()` in ui.js, the `tiebreak` branch.

## Play by touch (375x667 and 375x553)
At each size, two runs of: tutorial, then 3 full games on the default level (Easy).
- Game 1 is a first-timer: random glowing card, Wonder when possible, else Build, else Sell.
- Games 2 and 3 follow the Hint star.
- The first run's games 2 and 3 at 553 stalled on a revive list because my harness tapped without scrolling (see Phone play). The second run scrolled like a person would and is the one counted.

| Size | Game | Player | Result | Length (tapping fast) |
|---|---|---|---|---|
| 667 | 1 | first-timer | won by war | 104 s, 33 moves |
| 667 | 2 | Hint star | won 72-47 | 131 s |
| 667 | 3 | Hint star | won 56-35, "Try Normal?" shown | 113 s |
| 553 | 1 | first-timer | lost 51-60 | 114 s |
| 553 | 2 | Hint star | won 68-53 | 127 s |
| 553 | 3 | Hint star | won by war, "Try Normal?" shown | 84 s |
| 667 (run 1) | 1 | first-timer | tie 64-64, lost on civic points | 111 s |

All games reached the result screen: 0 console errors, 0 stuck states, 0 dead taps. The tutorial took about 155 s, 40 steps.

Difficulty (engine bench, 100-200 games):
| Player | vs Easy | vs Normal |
|---|---|---|
| typical new player (bench-ai "newbie") | wins 64% | wins 16% |
| follows the Hint star | wins 97% | wins 44% |

The Easy-to-Normal jump R59 flagged is unchanged. The new "Try Normal?" button (after 2 Easy wins) sends a player straight to a level they win 1 game in 6 unless they follow the Hints. There is still no middle level.

## Clutter (sampled every second, about 500 samples per size)
| Check | 375x667 | 375x553 |
|---|---|---|
| Endless animations | 0 | 0 |
| Endless animations 15 s after tapping Hints | 0 | 0 |
| Most helpers at once | **2** (banner + tutorial bubble, 5 samples) | **2** (10 samples) |
| Popup covers the war track | 0 (fixed) | 0 (fixed) |
| Banner covers the war track | **85 samples** | **73 samples** |
| Tutorial bubble over the popup | 8 samples (pointing at Build/Wonder, by design) | 7 samples |
| Token tooltip stuck | not seen | not seen |

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine and all 73 cards match. The tie-break result line is misleading (above). |
| 2 | Tutorial teaches | 7 | 28/28 rules in order, one line + one tap, then a real game. The "Your turn" banner still shows together with the bubble. |
| 3 | First 10 seconds | 8 | Clear title with "New here? Learn in 5 minutes" and a 3-bullet "How to win". |
| 4 | Turn clarity | 7 | Instruction line, popup with Build pay N / Sell +N / Wonder cost and name, chain card named. The banner repeats what the line already says. |
| 5 | Phone play | **6** | The turn banner sits on the war track and pawn at every turn change at both sizes. The revive list at 553 hides most choices under your city strip with no scroll cue. |
| 6 | AI and pacing | 7 | Brisk rival, a new player can win on Easy, a game takes about 5 min. The Normal jump is still steep. |
| 7 | Feel | 7 | Cards lift and fly, coin floats, points count up, sound. |
| 8 | Bugs | 8 | 7 full games + 2 tutorials, 0 errors, 0 stuck, 0 dead taps. |

**Average 7.0. FAIL** (rows 1 and 5 are under 7).

## Steps to reproduce rows under 7
1. **Row 1, tie-break text.**
   - Steps: play Quick games until the points are tied. Faster: in the console, set a final score with equal totals and different blue points, then end the game.
   - What happens: "X won 64 to 64 on civic points, thanks to guilds (+7) and wonders (+7)." (my screenshot p667/g0-result.png)
   - Expected, for example: "64 to 64. Rival wins the tie on civic points, 21 to 15." Drop "thanks to" when the reason is a tie-break. Also fix "1 points".
2. **Row 5, banner on the war track.**
   - Steps: 375x553, Quick game. Make any move.
   - What happens: the big "Rival's turn" pill (`#banner`) shows for about 1 s in the middle of the war track, covering the pawn and the 2$ spaces. "Your turn" does the same when control returns. (my screenshot q553/cov-26.png)
   - Also, in the tutorial at step 6 (pyramid), the "Your turn" pill and the tutorial bubble show together (q553/cov-1.png).
   - Fix: drop the pill (the instruction line already names whose turn it is), or move it off the track, and never show it while a tutorial step is due.
3. **Row 5, revive list.**
   - Steps: 375x553. Raise the rebuild-from-discard wonder (Marble Barrow) once the discard pile holds more than 6 cards.
   - What happens: the "Revive a discarded card" panel shows 2 rows. The rest sit under your city strip and need a scroll nobody is told about. (my screenshot p553/g1-dead1.png)
   - Fix: let the panel fill the height, or add a "more below" hint / fade.

## Top fixes, in order
1. Tie-break result line: name the civic totals and drop "thanks to".
2. Turn banner: remove it, or move it off the war track, and suppress it while a tutorial bubble is due.
3. Revive (and token) lists at 553: show all choices, or a clear scroll cue.
4. Add a middle level, or point the "Try Normal?" nudge at Normal with Hints on.
5. "1 points" → "1 point"; depots: "buy wood for 1 coin each".

Screenshots were taken in the reviewer session's scratch folder (p553/, p667/, q553/, q667/) and are not committed.
