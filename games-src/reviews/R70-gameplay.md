# R70 strict gameplay review: twin-thrones

- Build reviewed: `origin/shelf/W520-twin-thrones-rules` at **799eb386ee687eeec31b66c84dae179f3be2c104** (built with build-all, played from `games/twin-thrones/` so the art loads).
- Reviewer date: 14 Nov 2026 (UTC). Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md, 8 rows.
- History: owner bug "unplayable, rules not correct, not fun"; R68 7.0 FAIL on Rules (6): the points-loss end line credited the rival with the player's own leads.

## Verdict

**PASS, 7.5.** Every row >= 7, no stopper. The R68 blocker is fixed: every end line now matches the real score gaps.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 8 |
| 3 | First 10 seconds | 8 |
| 4 | Turn clarity | 7 |
| 5 | Phone play | 7 |
| 6 | AI and pacing | 8 |
| 7 | Feel | 7 |
| 8 | Bugs | 7 |
| | **Average** | **7.5** |

## Gates (run alone, nothing else running)

| Gate | Run 1 | Run 2 |
|---|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x twin-thrones` | PASS (build, 5/5 scenarios, 78 s) | PASS (5/5 scenarios, 77 s) |
| `... --full ...` | PASS (phone-check 54 s, rules-test sweep PASS: 300 games, 264 points / 22 war / 11 science / 3 tie-break) | PASS (same) |

Non-blocking notes from the gate: lab-test WARN 5/8 (LAB rows lack the `menu` scenario); offline.json stale for twin-thrones (refresh with offline-manifest.py at deploy). games/lab.html rewritten by --full was restored, not committed.

## 1. Rules (engine and every text the player sees, checked against the original structure in the repo notes)

Engine (engine.js, data.js) re-read line by line. It matches: 7 coins each; wonder draft 1-2-2-1 / 2-1-1-2, the last wonder of each group goes to its player automatically; max 7 wonders built; pyramid shapes and face-up rows for ages I-III; 20/20/17+3 guild decks; sell = 2 + 1 per yellow; trade = 2 + rival's brown/grey output, 1 with a trade post; chains free (+4 with the chain token); military track -9..+9, loot 2 and 5 once, zones 2/5/10 points, 9 = instant win; a science pair gives a token (law token counts as a symbol, never pairs), 6 different symbols = instant win; the weaker military side picks who starts the next age, the last card taker picks at a tie; play-again is lost when it falls on the last card of an age; all 10 token effects and all 12 wonder effects; guilds score from the best city (builders 2 per wonder, money guild per 3 coins); final points = cards + wonders + tokens + 1 per 3 coins + war zone; tie goes to civic (blue) points, then a shared draw.

End lines (the R68 failure). I wrote my own checker (not the worker's endline-test.js) that reads the headline, the short line (`.rwhy`), the story line (`.line`) and the side note from the real result screen and compares every named category and number with the real final scores:

| Set | Count | Wrong |
|---|---|---|
| Forced: points loss where I lead on 4 categories but lose by 2; loss by 1; win by 1; win with two equal leads; tie-break win; tie-break loss; draw; war win/loss; science win/loss | 11 | 0 |
| Real engine games (150 played, mixed levels: 127 points, 18 war, 4 science, 1 tie-break); 128 with a final score checked in the page | 128 | 0 |
| Live touch games below (5 points wins, 2 points losses, 1 science win) | 7 | 0 |

Examples read from the screen:
- Points loss, I lead on civic +25/science +6: "Rival won 39 to 37 on points. Biggest gaps: wonders +20, guilds +12." / "Rival wins by 2, ahead on wonders (+20) and guilds (+12)." Correct (the rival's leads, not mine).
- Live loss (g3): "Rival won 46 to 34 ... civic cards +13, guilds +10" / "Rival wins by 12, ahead on civic cards (+13) and guilds (+10)." Scores 16-3 civic, 10-0 guilds, 46-34. Correct.
- Tie-break loss: "Tie 22-22: Rival wins on civic points 14 to 9." Correct. Draw: "A draw: 15 to 15 points and 12 civic points each." Correct.

Tutorial and rules-sheet texts checked against the rules: all 40 tutorial lines are true (trade price, start-of-age chooser, tie chooser, 7 wonders, loot, sell price, score parts, tie rule).

Why not 9: card resource costs marked UNSURE in rules-check/twin-thrones.md are still unverified; the How-to-play line "Wonder: tuck the card under one of your wonders" leaves out that you also pay the wonder's cost (the tutorial says it).

## 2. Tutorial (375x667 and 375x553, touch only)

40 steps, all 40 rules seen in order at both sizes, one sentence (12 words or fewer) + one tap each, 0 targets off-screen, 0 bubbles covering their target, 0 console errors, ends with "You know the rules / Play a real game", which starts a real draft. ~140 s by touch. Title marks it "New here? Learn in 5 minutes".
Minor (553): on the "pair" step the bubble sits over token rows 3-4 of the 5-row token sheet (the target row 2 stays clear) (shots/tut553-30-pair.png). On "next-age" a "+1 Weights Hall" pop sits on top of the "You start" label for about a second (tut553-20-next-age.png).

## 3. First 10 seconds

Title: big Quick game button, level row, Tutorial, How to play. Quick game opens a 3-line "How to win" card, then the board with a finger on the first takeable card and the line "Tap a glowing card". Clear.

## 4. Turn clarity — 7

- "Your turn" / "Rival's turn" tag: the tag reads "Rival's turn" 36-47 ms after my tap in 4 out of 4 checks (F6 claim confirmed), and the rival's move is spelled out ("Rival takes Mud Basin to build it.").
- The card sheet names the cost or gain on each button (Build pay 1 / Sell +4 coins / Wonder too costly) plus one line saying why.
- Below 8 because: (a) the status line cuts off at 375 wide: "Rival takes Rock Face to sell it for…" (repro: Quick game, Medium, sell any card, read the line after the rival's turn). (b) The card help says "free if you own a chain symbol" without naming or showing which symbol or card links (shots/g2-sheet25.png, Horse Yard). (c) After every move the line grades you ("Poor move. Best was building Lookout.") on Easy too; useful, but it repeats "Poor move" a lot for a first-timer.

## 5. Phone play — 7

- 7 full games by touch, 0 dead taps, 0 covered or off-screen taps (each tap checked with elementFromPoint before tapping). Action buttons 58-61 px tall, inside the screen at both sizes.
- Choice sheet at 375x553: the 5-row token sheet shows all 5 rows on screen (F6 claim confirmed, tut553-30-pair.png); the build/sell/wonder sheet never went past the screen bottom (0 of about 200 sheet checks).
- Below 8 because floating "+N name" pops land on other text: "+3 Wayside Shrine" over the Goal line (g1-sheet5.png), "+3 Merchant Road" over the turn bar (g2-sheet25.png), "+1 Weights Hall" over the "You start" button (tut553-20), "+3 Armory" on the result screen (g7-result.png). Each lasts about a second; none blocks a tap. The selected card at 553 overlaps the pyramid and its name is half under the coin chip (g2-sheet25.png).

## 6. AI and pacing

Engine ladder, 60 games each (an Easy-level bot stands in for a new player): vs Easy 53 %, vs Medium 25 %, vs Normal 12 %, vs Hard 0 %. A Medium-level player: 80 / 48 / 7 / 7 %. Default level is Easy, so a new player can win. Live: the rival answers in about 1 s; a full game was about 2 min of rival time with instant human moves, about 35 human moves per game. Live results: Easy 4-0 for me (one science win), Medium 1-1 (win at 553, loss at 667), Normal 0-1 (553).

## 7. Feel — 7

The chosen card lifts and zooms, cards fly to the city, coins and shields pop, the pawn slides, a count-up runs on the result table, sounds on. Below 8: pops pile over other text (row 5), a stale "+3 Armory" pop shows on top of the result screen, and the result screen hides the score table by default (Full score is folded).

## 8. Bugs — 7

0 page errors and 0 console errors in 7 games + 2 tutorials + 139 end screens. 0 stuck states (30 s no-progress watchdog never fired). 0 dead taps. Cosmetic: the "+3 Armory" pop from the last move stays on the result screen (repro: shots/g7-result.png, 375x553, Easy, seed 89, play to a science win).

## Clutter (sampled every second)

| Run | Samples | Max helpers at once | Samples with 2+ | Infinite loops |
|---|---|---|---|---|
| 7 games (g3 sampled every 250 ms) | about 1,150 | 1 (toast) | 0 | 0 |
| 15 s after tapping Hint, each game | 7 x 60 | 1 | 0 | 0 |
| Tutorial 375x667 and 375x553 (every 200 ms) | 1,058 | 1 (the tutor bubble) | 0 | 0 |

(The tutor bubble carries both the tutor and the help class; counted as one element.)

## Games played (touch, real AI pacing)

| # | Size | Level | Result | Moves | Notes |
|---|---|---|---|---|---|
| g1 | 375x667 | Easy | win 55-38 points | 35 | lines correct |
| g2 | 375x553 | Medium | win 58-52 points | 39 | |
| g3 | 375x667 | Medium | loss 34-46 points | 37 | loss line names the rival's leads, correct |
| g4 | 375x553 | Easy | win 50-47 points | 35 | |
| g5 | 375x553 | Normal | loss 39-51 points | 38 | |
| g6 | 375x667 | Easy | win 47-31 points | 39 | weak (Easy-bot) moves for me |
| g7 | 375x553 | Easy | science win | 39 | weak moves; stale pop on the result |

## Top fixes (none blocks the pass)

1. Clear or hold the floating "+N name" pops when a sheet, choice or the result screen opens, so they never sit on text (rows 5, 7, 8).
2. Let the status line wrap to two lines, or shorten the rival's move text, so "…sell it for…" is never cut off at 375 wide.
3. Name the chain link on the card ("free if you built Pony Pen"), not "a chain symbol".
4. How-to-play: "Wonder: pay the wonder's cost and tuck the card under it."
5. Soften the per-move grade on Easy (only show "Best was …" when the gap is big).

Shots (reviewer scratch, not committed): g1..g7 title/goal/hint/sheet/result, tut553-01..40, tut667 end.
