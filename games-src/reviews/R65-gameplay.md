# R65 strict gameplay review: twin-thrones

Build reviewed: `shelf/W520-twin-thrones-rules` at **5199f15c** (FIXED4). Date 14 Nov 2026, 20:30 UTC.
I only reviewed; no game code was changed.

**Verdict: FAIL, average 7.1.** Tutorial (6) and Phone play (6) are under 7. No stopper.
FIXED4 fixed what R61 asked for: the end lines are true, the turn pill is gone, there is a Medium level.
Two problems are left. The tutorial calls the move it just told you to make a "Poor move". The new choice sheet uses 11-13 px text and cuts off card effects.

## Gates (each run alone)
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x twin-thrones` run 1 | PASS (5/5 scenarios) |
| `--quick` run 2 | PASS (5/5) |
| `--full` run 1 | PASS (phone-check ok, rules-test ok; LAB WARN 5/8, warn-only as before) |
| `--full` run 2 | PASS (same) |
| `cardtext-test.js` | 73 cards ok |
| `tutorial-e2e.js` on the built page (served with `media/`), 375x667 and 375x553 | PASS both: 40 steps, rules 28/28 in order, real game after, 0 errors |

`--full` rewrote `games/lab.html`. I reverted it, so it is not committed.

## Rules and player-facing text vs the original (repo notes; original not named)
- **Engine: unchanged since R61, still matches.** FIXED4 touched only ai.js (new `medium` slip level), ui.js text, tutor.js text and CSS. Win rules match the original: tie on points goes to civic points, then a shared win (engine.js 167-169).
- **End-of-game lines, forced one by one at 375x553 (all true now):**
  | End | Line shown |
  |---|---|
  | war, you / rival | "You won by war: the pawn reached the capital." / "Rival won by war: ..." + "An early war win: points do not decide this game." |
  | science, you / rival | "You won by science: six different symbols." + "An early science win: ..." |
  | points | "Rival won 51 to 45 on points. Biggest gaps: civic cards +2, coins +1." |
  | civic tie-break | "Tie 64-64: You win on civic points 21 to 15." / "Tie 64-64: Rival wins on civic points 21 to 15." |
  | draw | "A draw: 60 to 60 points and 12 civic points each." + "A tie: same points and same civic points, so nobody wins." |
- "1 points" is fixed: it now reads "1 point". The depot text is fixed: "stone costs you only 1 coin each to buy". The tutorial depot line is clear now.
- Still slightly off:
  - The flavour line under a loss always reads "Rival wears the crown this time. Build faster next round.", even on a civic tie-break loss or a slow points loss. Speed is not the reason.
  - On a tie-break win it says "Rival bows to the better builder". Not wrong, just weak.
  - Neither one breaks a rule.
- Rules verdict: **engine correct, every end line true. Row 1 = 7.**

## Play by touch (built page, real touch taps, 375x667 and 375x553)
Tutorial once per size (40 steps each), then games. "Newbie" means: tap a random glowing card, then Wonder if I can, else Build, else Sell. "Star" means: tap Hints every turn and follow the star.

| Size | Level | Player | Result | Length (tapping fast) |
|---|---|---|---|---|
| 667 | Easy | newbie | lost 39-45 | 109 s, 30 moves |
| 667 | Easy | star | won by war | 152 s |
| 667 | Medium | newbie | won 68-52 | 110 s |
| 667 | Medium | star | won 56-16 | 165 s |
| 553 | Easy | newbie | lost 43-50 | 109 s |
| 553 | Easy | star | won 78-43 | 163 s |
| 553 | Medium | newbie | lost 50-57 | 112 s |
| 553 | Medium | star | won 68-49 | 167 s |

All 8 games and both tutorials reached the end: 0 console errors, 0 stuck states, 0 dead taps.
(My first harness runs that used the star wrongly are not counted. Hints reset after every move, and the pyramid star uses class `best`.)

Difficulty (engine bench, 200-300 games each):
| Player | Easy | Medium | Normal |
|---|---|---|---|
| typical new player (bench-ai `newbie`) | wins 68% | **wins 45%** | wins 15% |
| follows the star | wins 98% | wins 83% | wins 49% |

The Medium claim is confirmed (newbie about 45%). The nudge now goes Easy -> Medium -> Normal: after 2 wins it shows "You beat Easy 2 times. Try Medium?". The counter counts all wins, not wins in a row (small point).

**Turn clarity without the pill:** clear enough.
- On your turn the instruction line shows a gold "Your turn" tag, plus "Your move" in the dock.
- On the rival's turn the rival's city frame glows and the dock reads "Rival thinks".
- One gap: for about 30 samples a game, the tag right after your move reads "Rating" (your move's grade) instead of "Rival's turn". The glow and the dock still show whose turn it is.

**Picker at 553:**
- It now opens as a sheet over the pyramid and war track, which is fine while you choose.
- Revive lists of 8, 9 and 10 cards showed 8/8, 9/9 and 9/10 fully visible, with a fade cue at the bottom. Token lists showed 2-5 of 2-5. The destroy list showed 3/3. Every target is at least 44 px tall.
- It is usable. The trade-off: the text is 13 px for names and 11 px for effects, and effects are cut to 2 lines, e.g. "Stone Depot: stone costs you only 1 coin each t...". Revive takes effect on a single tap; tokens ask for a second tap.

## Clutter (sampled every second; about 1,250 game samples + 320 tutorial samples)
| Check | 375x667 | 375x553 |
|---|---|---|
| Most helpers at once, games | 1 | 1 |
| Most helpers at once, tutorial | 1 | 1 |
| Endless animations in games | 0 | 0 |
| Endless animations 1.5 s / 15.5 s / 35 s after tapping Hints | 0 / 0 / 0 | 0 / 0 / 0 |
| Endless animations in tutorial | 27 samples, all the tutorial tap finger `gxt-fin` while it waits for the tap (a deliberate cue; it stops on tap) | 19 samples, same |
| Turn pill on the war track | 0 (`banner()` is never called now) | 0 |

The R61 banner+bubble overlap is gone.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | Engine matches; every end line per win type is true. The flavour line "Build faster next round" on a tie-break or points loss is weak. |
| 2 | Tutorial teaches | **6** | 28/28 rules in order, one line + one tap, real game after. But twice it grades the move it just told you to make as "Poor move" (see repro). |
| 3 | First 10 seconds | 8 | Clear title, Easy preselected, "New here? Learn in 5 minutes", 3-bullet How to win. |
| 4 | Turn clarity | 7 | "Your turn" tag, glowing rival frame, popup shows Build pay N / Sell +N / Wonder cost. The "Rating" tag replaces the turn tag during the rival's turn. |
| 5 | Phone play | **6** | Board text all at least 14 px and no overlaps at both sizes. The choice sheet uses 11-13 px text and cuts off card effects on an irreversible single-tap choice. |
| 6 | AI and pacing | 8 | Brisk rival; a new player wins 68% on Easy and 45% on Medium; Medium fills the gap; a game is about 2-3 min of fast taps, about 5 min for a person. |
| 7 | Feel | 7 | Cards lift and fly, "+1 card" floats, points count up, sound. Unchanged. |
| 8 | Bugs | 8 | 8 games + 4 tutorials: 0 errors, 0 stuck, 0 dead taps. |

**Average 57/8 = 7.1. FAIL** (rows 2 and 5 are under 7).

## Steps to reproduce rows under 7
1. **Row 2: the tutorial calls its own move poor.**
   - Steps: title, then "New here? Learn in 5 minutes". Follow the bubbles to step 10 ("Your wood card pays the wood. Build it free.") and tap Build on Pony Pen.
   - What happens: during steps 11-12 ("Shields push the war pawn...", "Pawn reaches the rival end...") the instruction line shows **"Rating: Poor move. Best was raising Moon Grove."** It happens again later: "Poor move. Best was raising Terraced Orchard."
   - Both tutorial runs show it at both sizes. Screenshots: reviewer scratch `t667/tut-11.png`, `t667/tut-12.png`.
   - Cause: `rateMove` (ui.js 472, the rating is spliced into the items at ui.js 490) runs while `U.tut` is true.
   - Fix: skip the rating when `U.tut`.
2. **Row 5: choice sheet text is too small and cut off.**
   - Steps: 375x553, Quick game. Raise Marble Barrow (revive) with 8+ cards in the discard, or take a library token.
   - What happens: the sheet shows names at 13 px and effects at 11 px, cut to 2 lines ("Stone Depot / stone costs you only 1 coin each t...", "Open Bazaar / makes 1 of ..."). One tap revives at once, so you pick without reading the full effect.
   - Cause: `.gx-app.ttsheet .picker .tk` 13px, `.tk .ds` 11px with line-clamp 2 (head.html, FIXED4). Screenshots: scratch `g553c/picker2.png`, `g553a/picker1.png`.
   - Fix ideas:
     - Keep 14 px and one column of full-width rows (name + full effect), with the fade cue.
     - Or keep the grid and make the first tap arm the choice and show the full effect in a line above the list ("Tap again to build"), like tokens already do.

## Top fixes, in order
1. No move rating during the tutorial (`rateMove` / the `Rating` item when `U.tut`).
2. Choice sheet: 14 px text and full effect text. Either one column, or first tap arms and shows the effect, second tap confirms (same as tokens).
3. Keep "Rival's turn" in the instruction tag during the rival's move. Show the rating as the second line, or only in the Log.
4. A loss flavour line that fits a tie-break or points loss ("They won the tie on civic cards." / "Close one. Try more civic cards."). Drop "Build faster".
5. Small: nudge counter counts wins in a row; reset on a loss.

Screenshots are in the reviewer session's scratch folder (t667/, t553/, g667a-d/, g553a-d/, end1-9.png) and are not committed.
