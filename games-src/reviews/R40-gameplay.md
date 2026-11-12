# R40 strict gameplay review: shipwreck-isle

- Build reviewed: `origin/shelf/W468-shipwreck-lean` at **073d6ca8fdc723b7056723bbfdb8af1687a4e2fe** (contains the R36 fix 2748d332).
- Reviewer played on a phone by real touch (Playwright `touchscreen.tap`, `isMobile`, `hasTouch`) at 375x667 and 390x844, fresh profile.
- Previous: R36 4.0 (stopper: dead taps on glowing places).

## Gates

| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x shipwreck-isle` | **PASS** |
| `VIS_SLUGS="," build-all.py --full --out /tmp/x2 shipwreck-isle` | **PASS** (phone-check 170 s, sweep.js PASS 4 games; lab WARN 9/12, rows list != scenarios, not a fail) |
| Shared-sweep spot-check: `VIS_SLUGS="," build-all.py --full --out /tmp/y sunglaze` | **PASS** (sweep TOTAL pass=2335 fail=0) |

## What I played

| Run | Size | How | Result |
|---|---|---|---|
| Learn in 5 minutes, start to end | 375x667 | tapped the ringed target of every one of the 55 steps, then kept playing with the advice | Rescued day 11, 0 errors |
| Default game (Marooned, 2 players, Easy island), follow ✨ | 375x667 seed 11 | ✨ per pawn, tapped the place the finger showed, the ⭐ row | **Rescued** day 11 |
| same | 390x844 seed 23 | same | **Rescued** day 10 |
| same | 375x667 seeds 41, 53 | same | **Rescued** day 10, day 10 |
| Default game, per-pawn bulb hints (`?hint=1`, flagged mode) | 375x667 seed 37 | bulb hint for each pawn | Lost on day 12, pile 12/15 |
| Random glowing places (dead-tap hunt) | 375x667 seeds 5 (x2), 390x844 seed 9 (x2) | every human pawn to a RANDOM glowing place, random allowed row | lost (expected), 0 errors |

### Dead-tap check (the R36 stopper)
- 174 real touch taps on glowing place centres across 4 games and 23 days at both sizes: **0 dead**, **0 undone** (pawn still placed 1.2 s after the row tap), **0 glow centres covered** by a plate or chip (elementFromPoint at every centre hit the board), 0 off screen.
- 77 taps opened the place's job list, 97 placed the pawn at once. The only "no placement" row taps (3 cases) was "Add wood to the signal pile (no pawn)", which asks for a second tap with a warning line: intended, not dead.
- **R36 stopper fixed.**

### Can a newcomer who follows the hints win?
- Yes on the default level: following ✨ won **4 of 4** default games (day 10-11) plus the Learn game.
- The fixer's adv-test "0 wins" is the **Normal** deal (I re-ran: `adv-test.js 12` = 0/12, avg day 7.1, mostly "Carpenter died"); `adv-test.js 8 learn` = 8/8. The flagged per-pawn bulb mode lost its one game. Not a fail for the default, see row 6.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | Six-phase round, 2 pawns each, 1 pawn = dice / 2 = sure, events slide to threats, weather vs roof, night food and shelter wounds, Fire + 15-wood pile in stages 1-5 all match. Known deviations documented in rules-check (one Soldier skill cost, fixed starting wreckage, free character pick). Easy island starts the pile at 3/15 (house rule, Easy only). |
| 2 | Tutorial teaches | 7 | Guided 3-day game, one line + one ringed tap per step, in rule order; now teaches the signal pile stages and the Fire, ends on "Keep playing" into a real game, and wins. Long (55 steps, many are Next ▶ info steps) and the zoom buttons cover the event card text in step 26 (see row 5). |
| 3 | First 10 seconds | 8 | Title: big Play and "New here? Learn in 5 minutes"; the offer states the goal in one bold line. First plan screen says "Carpenter: tap a glowing place" with glowing rings on the board. |
| 4 | Turn clarity | 7 | Phase banner names whose turn it is; plates show "Build ● 🎲 risky" / "✔ sure"; rows show cost (2🪵 · 🎲); day summary shows food for tonight, pile pace and the road to rescue. Weak points: the "+1" chip on the board is unexplained; "Too few pawns for place 6: pawn back" arrives after the fact; "Add wood (no pawn)" sits inside a pawn's job list. |
| 5 | Phone play | **6** | See P1-P4 below. Cut-off and overlapping text at both sizes. |
| 6 | AI and pacing | 7 | Default Easy: hint followers win 4/4 at day 10-11, ~35 non-decision taps a game, ~3 min. Normal following the advice never wins (0/12): a player who moves up a level with the hints loses every time. |
| 7 | Feel | **6** | See F1-F2 below. Actions still resolve as text cards plus Continue. |
| 8 | Bugs | 8 | 9 games / tutorial at both sizes: 0 page errors, 0 stuck, 0 dead taps, 0 undone placements. |

**Total 7.0 / 10 · FAIL** (rows 5 and 7 below 7; no stopper).

## Fixes needed (rows under 7), with repro

**P1 (Phone) Day chip cut off at both sizes.** Start any game at 375x667 or 390x844: the first stat chip reads "of 12 days", the word "Day"/number line is clipped on the left. Same on the result screen. Fix: shorten to "1/12" with "Day" as the label, or let the chip size to its text. Shots: `/tmp/claude-0/r40/g1/02-first.png`, `/tmp/claude-0/r40/t1/result.png`, `/tmp/claude-0/r40/t2/plan-3.png`.

**P2 (Phone) Food label overflows its chip.** Same screens: "Food · eat 2" runs under the Wood chip at 375 and 390. Fix: put "eat 2" on its own line or drop it to the summary.

**P3 (Phone) Zoom buttons float over cards.** 375x667: the − / + / ⊕ buttons sit on top of the event card text (Learn step 26, "Chill Rain ... weather.") and on top of the day summary text ("Tomorrow: Battered Camp ..."). Fix: hide the zoom buttons while a story card or the day summary is open. Shots: `/tmp/claude-0/r40/tut/013.png`, `/tmp/claude-0/r40/t1/daysum-4.png`.

**P4 (Phone) Small-screen layout wastes the board.** 375x667 story beats: the board gets ~300 px with the top row of hexes (places 1, 2, 4) under the stat bar, while ~170 px of empty beige sits under Continue; the day summary card is clipped at the bottom by the phase bar ("...then it stays as a threat" cut). Fix: give the empty strip to the board, or move the day summary card into the lower panel. Shot: `/tmp/claude-0/r40/t1/daysum-4.png`, `/tmp/claude-0/r40/tut/021.png`.
- The known "Pile chip off screen at 375x667" did **not** reproduce in any of my 375x667 shots (it showed every time).

**F1 (Feel) Resolution is a card and a Continue.** During "Your castaways at work" each job is a static card ("Hunt: Birds", "Cook: Build a shelter") and a Continue tap; the hunt shows no beast strength vs weapon, no dice, no wound fly-in. Repro: Learn, day 2, the hunt beat. Fix: show the fight (strength vs weapon, wounds flying to the castaway), roll the dice on the board for risky jobs, and fly gathered food/wood from the place to the stat chips. Shot: `/tmp/claude-0/r40/tut/021.png`.

**F2 (Feel) ✨ plays the game.** In the default game, one ✨ per pawn plus the ⭐ row wins 4 of 4 without a single own decision. Fix: keep ✨, but on Easy let it suggest one pawn at a time with a one-line why, so the player makes the call.

**A1 (pacing, not under 7 but next).** Normal level: advice followers 0/12. Either tune the advisor on Normal or say on the setup screen that Normal needs your own plan.

## Notes
- Rules checked against the rules-check doc (games-src/rules-check/shipwreck-isle.md), rules-notes.md and the published rulebook from memory; no new rule breaks seen in play.
- No previous review files are in games-src/reviews; R36's stopper is taken from the brief.
