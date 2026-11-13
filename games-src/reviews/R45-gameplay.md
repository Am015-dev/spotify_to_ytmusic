# R45 strict gameplay review: thornbound (13 Nov 2026)

Build reviewed: `origin/shelf/W489-thornbound-rules` at **6f154b1add1731705d036af08bb16bbee04966f2** (F9 fixes 58d8ea22 + 6d3c7b8d included).
Staged with `VIS_SLUGS="," build-all.py --quick --out /tmp/x thornbound`; all touch play below is on that STAGED file (`/tmp/x/thornbound/index.html`).
Previous: R39 6.9 (Phone 6, Feel 6). No earlier review files exist in this folder; history taken from the brief.

## Gates
| Gate | Result |
|---|---|
| --quick | PASS (scenarios 81.8 s, own checks 12/12; WARN universal: text under 11px "GILDED COURT" (10px)) |
| --full run 1 (alone) | PASS, 4m02s: phone-check 85.8 s, sweep PROBLEMS 0 |
| --full run 2 (alone) | PASS, 4m06s: phone-check 86.9 s, sweep PROBLEMS 0 |
| --full run 3 (alone) | PASS, 4m12s: phone-check 86.0 s, sweep PROBLEMS 0 |
| logic-test.js | 165/165 rules pass |
| rules-test.js | 119/119 |
| tutor-test.js on the staged file, 375x667 + 375x553 (clean, rotate, leave, skip, story) | PROBLEMS 0, 38/38 step ids, 54-63 s per run |
| glow-follow.js CAP=650000, 2 games, 375x667, staged | PASS: **won 2/2** (17-10, 18-7), 386 s / 431 s, longest still screen 3.3 s, 0 page errors |
All three --full runs show the same warn-only LAB row mismatch (10/12 checks), as before.

## My touch play (staged build, isMobile + hasTouch, real taps)
| Run | Size | Style | Result |
|---|---|---|---|
| Tutorial start to end | 375x667 | spotlight taps | 38 steps, every step one line + one tap or Next; ends on "Your game" |
| Quick game | 375x667 | follow glow | finished, lost 11-13, 123 taps, 0 errors, 0 stuck |
| Quick game | 375x553 | follow glow | finished, won 17-8, 118 taps, 0 errors, 0 stuck |
| Quick game | 375x667 | follow glow, instrumented | finished, won 14-11, 0 errors |
| Quick game | 375x667 | drag a hand card and release before every 3rd tap (CDP touch fling), then tap at once | finished, won 15-13, 151 taps, **0 double actions** |
| Quick game | 375x667 | impatient double taps (2nd tap 90 ms after the 1st) every 4th tap | 36 taps; the only repeated move was a second Supporter on a region (two real taps, two Supporters: correct by the rules) |

**Click replay / double actions:** `humanMove` was wrapped with a stack trace on every accepted move. Across 5 full games no tap ever produced two accepted
human moves. Each tap that logged two moves was the game's own `autoSkip` (ui10.js:245): it ends a menu step with nothing left to do and runs
inside the same `humanMove` call (stack: `humanMove < pump < autoSkip < humanMoveAuto`). That is intended, not a replay. No Bugs stopper.

**Motion:** every animation over 0.6 s is non-blocking (`pointer-events: none`): round banner `.tbban` 1450 ms (a held banner), hit flash `.tbhit` 700 ms,
sparks `.tbspark` 635-749 ms (with their stagger delay). Bid slide, steal flight and Influence pulse are wired (ui10.js:251, FX_MS = 560).

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | 165/165 checklist rules, 119/119 rule tests; bids, steals (strictly higher), tied re-clash, Herald steal, Govern/Journey/Lore and Winter all behaved correctly in play. Solo mode and some card powers are only partly covered (listed in the checklist). |
| 2 | Tutorial teaches | 7 | 38 short steps, ~55 s, one line + one tap, then a real game. Councils' powers, Favour use, Day/Night commands and Tactics are only told, never done. |
| 3 | First 10 seconds | 8 | The title states the goal in one line; the gold "New here? Learn in 5 minutes" button is clearly first; the first game screen shows YOUR TURN + one instruction + a glow. |
| 4 | Turn clarity | 7 | The turn strip always says whose turn it is and what to tap; the suggested option is marked. Board icons (+1, roman numerals, the small track numbers) still need a tap to explain them. |
| 5 | Phone play | **5** | 375x553 still fails the 14 px / 44 px bar (see F1, F2); glossary word buttons are 22 px tall at both sizes (F3). |
| 6 | AI and pacing | 8 | The glow-follower won 2/2 and my touch games went 3-1; a game takes 6-7 min; longest still screen 3.3 s ("Thinking… tap to hurry them"). |
| 7 | Feel | 7 | Bids slide, stolen cards fly, Influence pulses, clashes flash and spark; all quick and never in the way. |
| 8 | Bugs | 8 | 0 page errors, 0 stuck states, 0 dead taps, 0 double actions in 5 games, 7 tutorial runs and 3 x --full. One surprise: F4. |

**Total 7.3 (58/8). FAIL**: Phone is 5 (< 7). No stopper.

## Fixes (row under 7, with repro)
- **F1 (Phone): text under 14 px at 375x553.** Repro: Quick game at 375x553, any round. The side council column has `b` labels "Coin", "Whispers",
  "Pledges", "★ Favour", "Tactics" at **11 px**, the `em` states "empty" / "Meadow" at **10 px**, the count `i` at 11 px, and the turn chip
  `span.tbt-chip` "Your turn" at **13 px**. Shot: scratch `g553-s1.png` (right column). At 375x667 the same strip (horizontal) passes. Also the
  --quick WARN: "GILDED COURT" at 10 px. Board SVG labels (track 0-35 at 11 px; "+1"/"+2" pips about 7 px; roman numerals I/II/III about 7 px) are below 14 px at both sizes.
- **F2 (Phone): hand cards under 44 px wide at 375x553.** Repro: Quick game at 375x553 with 5 or more cards in hand (the place step in round 1).
  `button.hc` is 40x57 / 42x58 (e.g. "Net Menders", "Sea-Mother Heir", "Mist Totem"). At 375x667 they are 44 px or wider.
- **F3 (Phone): glossary word buttons 22 px tall.** Repro: open any card or step sheet that shows a gold word ("Active", "Lore", "Flank", "Region",
  "Tactics", "Supporters"). `button.gl` is 31-74 x 21-22 px at both sizes. Pad them to a 44 px hit area (an invisible ::before is enough).
- **F4 (Bugs, minor): impatient taps can open the Kingdom sheet over the board.** Repro: 375x667, round 1 Autumn, tap fast near the map centre
  (the throne is a tap target at 187,318). The "The Kingdom" sheet covers the map and the hand; its X sits on the parchment and is hard to see
  (scratch `fast-stuck.png`). A tap outside closes it, so it is not a stopper, but a newcomer may not know that. Make the X clearly visible on the parchment.
- Minor (Feel): the hit flash (700 ms) and sparks (up to 749 ms with delay) go a little over the 0.6 s cap; harmless because they never take taps.

Screenshots were taken in the reviewer's scratch folder (not committed): tutorial T-05/T-19/T-27, g553-s1, g667-s2, fast-stuck, kg-553.
