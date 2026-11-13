# R48 strict gameplay review: thornbound (13 Nov 2026, 10:11 UTC)

Build reviewed: `origin/shelf/W489-thornbound-rules` at **5f133a5a** (F10 phone fixes from R45), staged with build-all into /tmp/x.
Previous: R45 7.3 FAIL (Phone 5 only).

## Gates
| Gate | Result |
|------|--------|
| `--quick` | PASS (build, 12/12 scenarios, 1m25s) |
| `--full` run 1 (alone) | PASS (phone-check, lab-test, sweep PROBLEMS 0; 4m02s) |
| `--full` run 2 (alone) | PASS (same; 4m10s) |
| Glow-follower, CAP=650000, 375x553, 2 games | 2/2 finished: 15-8 win, 13-14 loss; 384 s and 411 s; longest still screen 3.3 s; 0 page errors |
| Glow-follower, 375x667, 1 game (with shots) | finished 18-13 win in 410 s; 0 page errors |
| Tutorial by touch (tutor-test), 375x553 + 375x667 | 38/38 steps at both sizes, plus rotate, leave/return, skip, story runs; PROBLEMS 0 |
| Fast/random taps (toddler-test), 375x553 + 375x667 | tutorial and a full game to the result screen at both sizes. 2 dead taps out of about 2100 taps in 5 runs, neither reproducible (see Bugs) |
| Drag at 375x553 (touch) + 1440x900 (mouse) | 8/8 each; every drag takes exactly 1 card from the hand (no double actions) |

The lab-test row is a WARN in both full runs (10/12 LAB rows), not a failure.

## Phone measurements (sampled during the touch games)
- 375x553: **min font 14.0 px**, 0 bad fonts. Min tap box 43 px: the "My board and piles" and hint-bulb toolbar buttons are 44x43, 1 px short.
- 375x667: min tap box 43 px (the same two buttons). One font sample at **9.8 px**: a "7" slot-card numeral inside a region, seen in 1 sample out of hundreds. It looks like a frame drawn before mapTextFit runs after a redraw.
- Covered target: "Spire Court" location; its centre is covered (3 of 9 points hit) at both sizes, most likely by the ROUND marker or a clash badge. It can still be tapped at the edges.
- Kingdom sheet: 14 fast taps across the map at both sizes opened **0 sheets**. Tapping the rival chip opens it on purpose. The X is a dark 44x44 disc (rgb 42,26,16) and easy to see. Glossary words have 44x43 boxes.
- Hand cards are 44 px wide with readable 14 px names. The council column and turn chip are readable at 375x553.

## Scores
| # | Row | Score | Notes |
|---|-----|-------|-------|
| 1 | Rules fidelity | 8 | Not changed by F10. Scenarios 12/12, rules flow intact in all games played. |
| 2 | Tutorial teaches | 7 | 38 steps in order with one tap each, at both phone sizes. Bubbles stay on screen and off the spotlight. Still long (about 50 s if you tap fast). |
| 3 | First 10 seconds | 8 | Goal card first, then "YOUR TURN: tap a card to bid it in secret" with the hand glowing. |
| 4 | Turn clarity | 7 | Turn chip + one line every step. Late game the map gets crowded: clash badges (13, 11) sit on "Spire Court" / "THE UPLANDS", and tiny slot cards cluster near Moss Altar and Gleaning Meadow. |
| 5 | Phone play | 7 | R45's fails are fixed: text 14 px+, 44 px hand cards and glossary boxes, no accidental sheet, clear X. Still a little off: 44x43 toolbar buttons, a covered Spire Court centre, one transient 9.8 px numeral, an empty band about 50 px tall above the hand at 375x667, and "THORNBOUND THRONE" touches "THE SINKS". |
| 6 | AI and pacing | 8 | The glow-follower won 2 of 3 games. Games take 6.5-7 min. Rival waits are at most 3.3 s ("tap to hurry them"). |
| 7 | Feel | 7 | Not changed: cards fly to the bid spot, drags snap with a buzz, badges flip at the reveal. |
| 8 | Bugs | 8 | 0 page errors, 0 stuck states across every gate and game. Dead taps under fast taps: (a) seed 1 at 375x553, the tutorial's final "Next" (step 38 "end"), seen while 3 browsers ran at once and not repeated when re-run alone with the same seed; (b) seed 3 at 375x553, 1 tap in a "watch" moment during a bid (sig 126/148, round 3). Seeds 1-2 re-run: 0. |

**Average 7.5 (60/8). Every row >= 7, no stopper: PASS.**

## Top fixes (none of them block release)
1. Toolbar icon buttons (`.gx-ibtn`, the board/piles and hint bulb): make them 44 px tall, not 43.
2. Spire Court: move the ROUND marker or clash badge off the location's centre so the whole ring can be tapped.
3. Late-game map: keep clash strength badges off region and location labels, or make tiny slot cards bigger or stack them. Run mapTextFit synchronously on a slot-card redraw so no 9.8 px numeral shows for a frame.
4. At 375x667, give the empty band above the hand to the map, and move "THORNBOUND THRONE" apart from "THE SINKS".

## Repro for the minor findings
- 44x43 buttons: `CAP=650000 TB_FILE=/tmp/x/thornbound/index.html node games-src/thornbound/game/measure.js 2 375x553`, then see the "tap 44x43" lines.
- 9.8 px numeral: the same command at 375x667 (1 game), line `font 9.8 "7" <tb-slotcard`.
- Dead tap: `node toddler-test.js 375x553 3`, run against the staged html (game dir copy), then see `dead tap (watch) sig 126|148||3||bid|`.
