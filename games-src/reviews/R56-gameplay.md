# R56 strict gameplay review: Twin Thrones

- Branch reviewed: `shelf/W520-twin-thrones-rules` at **902bfb5e24b602545065daa679c324e971c5e5d9**
- Owner bug report: "Twin thrones is unplayable the rules are not correct and does not play for fun"
- Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md (8 rows). The reviewer changed no game code.
- **Verdict: FAIL, average 6.5.** The rules are now right and nothing stops play. It fails on clutter, phone size, pacing, and a broken best-move glow.

## Gates
| Gate | Result |
|---|---|
| `build-all.py --quick twin-thrones` | PASS, 5/5 scenarios (81 s) |
| `build-all.py --full` run 1 | **FAIL** phone-check: `text >8 words: 9w "Rival takes Terraced Orchard points coins…"` |
| `build-all.py --full` run 2 | **FAIL** phone-check: `text >8 words: 9w "points take another turn glass or…"` (wonder text, so it depends on the seed) |
| node logic-test.js / rules-test.js / tutorial-script-test.js | PASS 123/123 / PASS (300 AI games, 0 stuck) / PASS |

## Rules vs the original (from the repo notes; checked card by card against the published rulebook and card list, from memory)
Engine, all MATCH: setup (7 coins, 8 of 12 wonders drafted 1-2-2-1 / 2-1-1-2, 5 of 10 tokens up), all three layouts and face-up rows,
card access by covering, flipping, build/sell/wonder, selling for 2 + yellow, trade price 2 + rival brown/grey (choice cards and wonders do not count),
depots and the glass/papyrus quay, chains, the 7-wonder cap, play again lost on the last card of an age, war (loot 2/5 once, 9 = win, 2/5/10 points),
science (pair = token, 6 symbols = win, Law counts), all 10 token effects (the shield token applies to red cards only), guild coins on build
and best-city scoring, who starts the next age, end scoring, and the blue-points tie-break.
Card data: all 73 cards now match on cost, points, chain and age (the FIXED1 science spread and chain fixes are correct).

Still wrong (card data only, not a core rule, so Rules is not capped at 5):
1. **Beacon Isle** costs P2 S1 **G1**; the original wonder costs 2 papyrus + 1 stone + 1 **wood**.
2. **Thunder Idol** costs W1 S1 P2; the original wonder costs 2 papyrus + 1 stone + 1 wood + 1 **clay** (5 resources, clay is missing).
Both are listed in RULES-AUDIT.md as "UNSURE (kept)".

In-game text: the tutorial lines and the Rules drawer agree with the engine. The Rules drawer is thin: it does not give the 9-step war win,
the loot amounts, the 2 + rival trade formula, guilds, who starts the next age or the tie-break. The tutorial covers these.

## Touch play (375x667 and 375x553, fresh storage, hints ON by default, touch taps only)
For each size: the tutorial, then 3 full games (G1 hint follower on the default Easy, G2 plain newcomer on Easy, G3 hint follower on Normal).
| Size | Tutorial | G1 hint/Easy | G2 newcomer/Easy | G3 hint/Normal | Errors / stuck / dead taps |
|---|---|---|---|---|---|
| 375x667 | 40 steps, 159 s, all 25 rules | win 64-37, 6.2 min | win 62-34, 6.4 min | loss 41-54, 6.4 min | 0 / 0 / 0 |
| 375x553 | 40 steps, 160 s, all 25 rules | win 63-34, 6.0 min | win 48-25, 6.0 min | loss 25-58, 6.0 min | 0 / 0 / 0 |

(The only console errors were missing art when run from games-src without media/. With media/ present there were 0 errors.)
Headless fairness, 60 games each: hint follower vs Normal 29/60 (48%), newcomer vs Easy 43/60 (72%), newcomer vs Normal 12/60 (20%), hint follower vs Easy 56/60.
Fair. Normal crushes a plain newcomer, but the default level is Easy.

Wait for your turn (from your move to "Your move" again): median **9.9 s** at 667 and 8.7 s at 553, p90 14-15 s, max 26-27 s. Most of each 6-minute game is spent watching narration.

Clutter, sampled every second (about 1,270 samples per size):
- Helpers on screen at once: at most **2** (at 667, the toast "City Planning: 6 coins now…" plus the banner "Rival's turn"). At 553, at most 1.
- Infinite loops: **222 / 225 sampled seconds had a running infinite animation**, with up to **6 different loops at once**:
  `avring` on every takeable card, the star card included; `pulse` on the draft wonders; `placeglow` on wonder slots; and `gxtDot` / `gxt-pulse` in the tutorial.
  Target: 0. These loops run for the whole of your turn, so they also run 15 s after every hint.
- The star (best card) is always on while hints are on, and it pulses with every other takeable card. **This caps Turn clarity and Feel at 6.**

## Scores
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Engine and 73 cards match. 2 wonder costs are still wrong (Beacon Isle, Thunder Idol). The Rules drawer is thin. |
| 2 | Tutorial teaches | 8 | One scripted game, 25 rules in order, one line and one tap per step, then a real game. A bit long (40 steps, about 2.7 min). |
| 3 | First 10 seconds | 7 | A clear title and goal line, then "Tap a glowing card. The star is best." But 6 cards pulse at once. |
| 4 | Turn clarity | **6** | Cap: the star is always on and pulsing. Bug: the "glowing best button" never lights on Build (see repro A). Sell never glows. |
| 5 | Phone play | **5** | At 553 the takeable cards are 38x41 and 40x44 px (below 44) and names are cut off ("Terra", "Sky", "Open Sta"). The popup covers the war track. The turn banner covers the rival city. |
| 6 | AI and pacing | **6** | The AI is fair (see above). But the rival takes a median of 9-10 s per turn, up to 27 s. Not brisk. |
| 7 | Feel | **6** | Cap (always-on pulsing). Cards fly, coins pop and the pawn slides. But the whole board throbs nonstop, and the popup shows "Free" twice. |
| 8 | Bugs | **6** | 0 errors, 0 stuck states and 0 dead taps in 6 games. But both `--full` gates FAIL, and the Build hint glow is dead code. |

**Average 6.5. FAIL** (rows 4-8 are under 7). There is no stopper.

Fun verdict: there are now real decisions: take or deny from the pyramid, sell or build, when to raise a wonder, and race on war or science.
A first-time player can follow the tutorial and the star. The game is no longer "unplayable". It still feels like a slow, flashing spreadsheet on a small phone.

## Repro steps for rows under 7
A. Turn clarity (dead Build glow): Quick game on Easy, hints on. Tap the starred card and the popup opens. Build is the best move (12/12 seeds tested),
   but no button glows. Cause: src/ui.js zoom builder line ~377 reads `hm` before `var hm = …hintMove(G)` on line ~379, so it is always undefined there.
   In play the glow showed on 7 of 59 popups at 667 and 5 of 59 at 553, all of them Wonder.
B. Clutter: at 375x667 start a Quick game. On your turn every `.card.av` runs `avring 1.6s infinite` and the star card pulses too. Run
   `document.getAnimations().filter(a=>a.effect.getComputedTiming().iterations===Infinity).length` and it returns 6 or more.
   Two helpers at once: take a progress token with the double tap. The toast stays up while the "Rival's turn" banner fires.
C. Phone (375x553): reach Age III. The takeable cards measure about 40x44 px, names are cut off, and "+4 <card>" pops over the goal line.
D. Pacing: play any move, then time until "Your move". Median 9-10 s, p90 15 s, worst 27 s (narration of your move, then the rival's intent, then the rival's move).
E. Gate: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/x twin-thrones` fails phone-check: a narration or wonder text line has 9 words (limit 8).

## Top fixes (in order)
1. Stop the infinite loops. Give takeable cards a static ring. Make the star a static badge that only appears after about 8 s idle or on a Hint tap, and pulse it at most 2 times.
   Stop the draft/slot/tutorial pulses after 2 cycles.
2. Fix the hint glow in the popup: move `var hm` above the Build button. Also mark Sell when the best move is a sell.
3. Cut the wait for the rival to 3 s or less: one short narration line per side, and skip the "intent" line on Easy.
4. At 553 px tall, make the takeable cards at least 44 px tall with readable names (for example, shrink the cities to one strip). Keep the popup off the war track.
5. Make both `--full` gates pass: keep the narration and wonder lines to 8 words or fewer.
6. Card data: Beacon Isle = P2 S1 W1; Thunder Idol = P2 S1 W1 C1.
