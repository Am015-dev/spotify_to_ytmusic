# Twin Thrones FIXED2 report (14 Nov 2026)

Branch `shelf/W520-twin-thrones-rules`, code commit 857bf7d6 (on top of 902bfb5e + origin/alex/brave-carson-rbpmlk). Not deployed.

## Gates
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick twin-thrones` | PASS, 5/5 scenarios |
| `build-all.py --full` run 1 (alone) | PASS (phone-check, LAB warn-only as before, rules sweep) |
| `build-all.py --full` run 2 (alone) | PASS |
| guard.py | ok |
| logic-test.js / rules-test.js 300 / tutorial-script-test.js | 125/125 (2 new card-data tests) / PASS / PASS |

## Measured (2 normal games per size, Quick game on the default level, real touch taps, sampled every second)
| Size | Max helpers | Infinite loops (samples) | Loops 15 s after Hint | Wait for your turn: median / p90 / max | Smallest takeable card | Names cut | Popup over war track |
|---|---|---|---|---|---|---|---|
| 375x667 | 1 | 0 / 353 | 0 | 2.4-3.0 s / 4.0-4.9 s / 5.8-6.3 s | 58x76 | 0 | 0 |
| 375x553 | 1 | 0 / 355 | 0 | 2.4 s / 3.1-4.0 s / 4.9-5.6 s | 50x55 | 0 (all 73 card names checked) | 0 |

The wait is the time from your move to your next move. It includes your own result line (0.9 s) and the rival's move (about 1.5-2 s). The max is an age change.
Idle 9 s: the star showed 4 of 4 times. Tapping the starred card: the popup button glowed 8 of 8 times (Build 8 in the last run; Wonder and Sell glow too).

## What changed
1. Calm board: takeable cards have a still gold edge. No pulse runs forever: draft wonders, wonder slots, tokens, the ghost finger and the tutorial ring/dots pulse 2-3 times, then hold. The star appears only after you tap Hints or sit still for about 8 s. It pulses 3 times, then stays still. Toast and the "Rival's turn" banner never show together.
2. Hint glow: the Build button glows now (`hm` is read before the button; it was read after it). Sell glows when selling is best. Hints: the first tap shows the best move, the second tap turns hints off.
3. Pacing: one line for your move (the rating, if hints are on), then the rival's move: a 0.65 s lift and up to 2 short lines. Chained rival actions use 1 shorter line. Tap still skips.
4. Text: every narration, toast, instruction and popup line is 8 words or fewer. Wonder lines say "extra turn". Two token texts were shortened. There is a safety cut in the code.
5. 375x553: the goal line is hidden below 600 px tall. Covered pyramid rows overlap more, so takeable cards are at least 50x55. Long names get soft hyphens and a 12 px step. The popup never covers the war track.
6. Data: Beacon Isle costs P2 S1 W1 and Thunder Idol costs P2 S1 W1 C1. Both have tests (logic-test section L).
7. Fairness: the default level is **Easy** (first game Easy; your pick is remembered). R56 measured a newcomer vs Easy at 72% and a hint follower vs Normal at 48%. No AI change.
