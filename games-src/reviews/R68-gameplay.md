# R68 strict gameplay review: twin-thrones

Build reviewed: `shelf/W520-twin-thrones-rules` at **d60ea103** (F5). Date 14 Nov 2026, 21:25 UTC. Review only; no game code changed.

**Verdict: FAIL, average 7.0.** Row 1 (Rules fidelity) is 6. Every other row is 7 or more. No stopper.
F5 fixed both R65 failures:
- The tutorial shows no move rating.
- The choice sheet is one column, 14 px, full effect text, and revive needs two taps.

There is one new problem from F5 (commit 7c7abcc0). The new loss line on a points loss names the wrong side's lead. It says the rival was ahead in exactly the areas where YOU were ahead, then tells you to "close that gap". It happened in 3 of 3 points losses (2 live, 1 forced).

## Gates (each run alone)
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x twin-thrones` run 1 / run 2 | PASS / PASS |
| `--full` run 1 / run 2 | PASS / PASS |

`--full` rewrote `games/lab.html`. I reverted it; it is not committed.

## Rules and player-facing text vs the original (repo notes; original not named)
- **Engine: matches.** I re-read engine.js. It covers setup, the draft order, pyramid flips, build/sell/wonder, trade price, chains and the 7-wonder cap. It also covers the war loot at 3 and 6 (first crossing only), the military and science instant wins, pair tokens, Law, Strategy (red cards only) and Theology. Age-change chooser: the weaker side picks, or on a tie the last taker. End scoring: tie goes to civic, then shared. F5 did not touch engine.js.
- **Tutorial text:** all 40 lines are true, including draft order 1-2-2-1 / 2-1-1-2, trade price, tie start, loot and tie-break.
- **End lines, every end type, forced at 375x553 (plus 6 live games):**

| End | Short line (`.rwhy`) | Story line (`.line`) | True? |
|---|---|---|---|
| war win / loss | "You/Rival won by war: the pawn reached the capital." | "Your banners reach their gate..." / "Their banners reach your gate..." | yes |
| science win / loss | "...won by science: six different symbols." | "Six symbols, one great discovery..." / "Rival's scholars solve what yours could not." | yes |
| points win | "You won 30 to 25 on points. Biggest gaps: civic cards +10." | "The crown is yours: you led on civic cards (+10)." | yes |
| **points loss** | "Rival won 39 to 35 on points. Biggest gaps: wonders +15, guilds +4." | **"Rival wins by 4, ahead on civic cards (+10) and war points (+5). Close that gap to turn it around."** | **NO**: civic +10 and war +5 were the player's leads |
| tie-break win / loss | "Tie 30-30: You/Rival win(s) on civic points 15 to 10." | "Level on points, and ...civic points decided it, 15 to 10." | yes |
| draw | "A draw: 30 to 30 points and 12 civic points each." | "Neither crown falls..." + "A tie: same points and same civic points, so nobody wins." | yes |

Live proof:
- g4 (375x553, Easy) final 41-43: the short line says "Biggest gaps: wonders +10, trade cards +6". The story line right under it says "Rival wins by 2, ahead on civic cards (+5) and war points (+5)". The player had civic 14 vs 9 and war 5 vs 0. Shot: `/tmp/claude-0/r68/shots/g-375x553-easy-newbie-result.png`.
- g1 (375x667, Easy) final 36-40: "Rival wins by 4, ahead on war points (+5) and guilds (+4)". The player had war 5 vs 0 and guilds 4 vs 0. The rival actually led civic +10.

Cause: `ui.js` resultLine:
- `var ld = lead(w === 0 ? sb : sa, w === 0 ? sa : sb)` lists the loser's leads.
- The loss branch prints `ld` as the winner's lead.
- The win branch only works because it calls `lead(sa, sb)` again.

- **Rules verdict: engine correct. One player-facing line is false on every points loss (the most common way to lose), and it teaches the wrong lesson. Row 1 = 6.**

## Play by touch (built page served with media, real touch taps)
- **Tutorial:** I ran it at 375x667 and at 375x553. Both completed: 40 steps, one line and one tap each, 0 errors.
  - Rating text on screen: 0 seconds in either run (sampled every second, about 160 samples each).
  - The tutorial hands over to a real game.
  - For the 15 s after the hand-over: 0 helpers stacked and 0 endless animations.
- **Games.** "Newbie" taps a random glowing card, then Wonder, else Build, else Sell. "Star" turns on Hints and follows the star.

| # | Size | Level | Player | Result | Taps-fast length |
|---|---|---|---|---|---|
| g1 | 667 | Easy | newbie | lost 36-40 | 129 s |
| g6 | 667 | Easy | newbie | won 56-40 | 124 s |
| g3 | 667 | Medium | star | won 48-42 | 137 s |
| g4 | 553 | Easy | newbie | lost 41-43 | 126 s |
| g2 | 553 | Medium | newbie | won 60-52 | 126 s |
| g5 | 553 | Medium | star | won 56-52 | 136 s |

All 6 games reached the result screen: 0 console errors, 0 stuck states, 0 dead taps. The games were close and fair; a newbie won 2 of 4.

- **Revive sheet at 553 with many cards.** I built Marble Barrow by touch with 12 cards (and with 6) in the discard.
  - The sheet is one column. Names and effects are both 14 px with full text (0 clipped), and every row is 46 px tall.
  - At 553 the scroll window is 155 px, so about 3 rows show at once, with a fade cue at the bottom. A finger swipe reaches the 12th card.
  - The first tap arms the card ("Tap again to build it free"), and the second tap builds it. This worked at both sizes.
  - Readable and usable. Shots: `/tmp/claude-0/r68/shots/rv2-375x553-12.png` and `rv2-375x553-12-armed.png`.
- **Token sheet** (5 items) and **destroy sheet** (1-5 items): all items fully visible, 14 px, 46 px tall. The token pick also needs two taps.
- **Turn tag while the rival is to act** (sampled each second):
  - "Rival's turn" shows for 25-32 samples per game.
  - The rest of the time, your own move's narration is still running: "You" (24-26 samples in newbie games) or "Rating" (22-23 samples with Hints on).
  - The F5 claim is true once the narration ends. The rival city glow and the "Rival thinks" dock cover the gap.
- **Medium nudge:** after win, win, win, loss, win it showed "2 / 3 / 4 times in a row", then nothing, then nothing. It resets on a loss. Correct.
- **Smallest visible text** in play, at both sizes: 14 px. No horizontal scroll.
  - Some info-only targets are below 44 px: wonder tiles 46x34, tokens 34x34, points pills 49x32. None is needed to play.

## Clutter (live, every second)
| Check | 375x667 | 375x553 |
|---|---|---|
| Most helpers at once, tutorial (about 160 samples each) | 1 | 1 |
| Most helpers at once, games (about 390 samples each) | 1 | 1 |
| Endless animations, games and tutorial | 0 | 0 |
| Endless animations for 15 s after tapping Hints (one window per game) | 0 | 0 |

Helpers counted: toast, banner, finger, coach/help bubble, peek, hint star or glow. The shell bubble carries both `gxh-bub` and `gxt-bub`, so I counted it once.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine correct. The points-loss line is false in 3/3 losses: it credits the rival with the player's leads. Repro below. |
| 2 | Tutorial teaches | 7 | 40 steps, 28 rules in order, one line and one tap each. No rating anywhere. Real game after. |
| 3 | First 10 seconds | 7 | Goal line on the board, glowing cards, finger on the first move. Unchanged since R65. |
| 4 | Turn clarity | 7 | "Your turn" tag, plus "Rival's turn" once the narration ends. The city glow and dock fill the gap. |
| 5 | Phone play | 7 | 14 px everywhere, a one-column sheet with full text, a two-tap revive, and 46 px rows. At 553 only 3 rows show at once (swipe needed). |
| 6 | AI and pacing | 7 | The newbie won 2 of 4 on Easy/Medium. Games were close, about 2 min tapping fast (about 5-6 min for a real player). |
| 7 | Feel | 7 | Cards lift and fly, numbers pop, scores count up, sound. Unchanged. |
| 8 | Bugs | 8 | 6 games, 2 tutorials and forced end states: 0 errors, 0 stuck, 0 dead taps. |

**Average 7.0 (56/8). FAIL: row 1 under 7.**

## Repro for row 1
1. Open the build at 375x553 and start a Quick game on Easy.
2. Lose on points, or force it in the console: `TT_TEST.newGame('cpu',3); TT_TEST.toPlay(0); var G=TT_TEST.U.G; G.over=true; G.winner=1; G.reason='points'; G.final=[{blue:20,green:0,yellow:0,guild:0,wonder:10,token:0,coins:0,mil:5,total:35},{blue:10,green:0,yellow:0,guild:4,wonder:25,token:0,coins:0,mil:0,total:39}]; TT_UI.render();`
3. The result reads "Rival won 39 to 35 ... Biggest gaps: wonders +15, guilds +4." Under it: "Rival wins by 4, ahead on civic cards (+10) and war points (+5). Close that gap to turn it around." Both of those are the player's leads.

## Top fixes
1. **Row 1:** in `ui.js` resultLine, build the lead list from winner vs loser: `lead(w === 0 ? sa : sb, w === 0 ? sb : sa)`. Use it in both branches. Add a test that forces a points loss and checks that the categories named in `.line` match the `.rwhy` gaps.
2. Small: at 375x553 the choice sheet shows only about 3 rows. Consider letting it grow over the war track while a revive or token choice is open, as R65 saw.
3. Small: right after your move, the tag reads "You" or "Rating" for about 1-2 s while the rival is already to act. Show "Rival's turn" as soon as the side changes.
