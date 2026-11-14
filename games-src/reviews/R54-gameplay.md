# R54 strict gameplay review: Hollowbough (after F15)

Branch reviewed: `shelf/W521-hollowbough-rules` at **ccc11e83**. Reviewer did not edit the game. Date: 14 Nov 2026, 16:20 UTC.

## Verdict: FAIL, average 7.3 (Feel 6)

F15 fixes what it set out to fix in a **vs computer** game: no loops, 1 helper at most, no silent taps. But first-timers don't start in that mode.
On a first visit the title preselects **Guided** (`ui6.js:56`, `firstTime() ? 'guided'`). Every newcomer who presses Play gets that game. It
does not get `html.calm` (`ui2.js:860`: calm needs `!guideOn()`). So R52's Feel defect is still there, unchanged, on the path the owner
complained about: after a bulb tap the ring and the kit finger loop forever. On top of that, the ghost finger taps forever and the glowing tiles
pulse forever.

## Gates (each run alone)
| Gate | Result |
|---|---|
| `--quick` | PASS, 13/13 scenarios (1m37s) |
| `--full` run 1 | PASS: phone-check, lab 10/12 WARN (lab rows list), sweep PASS (46 bulb taps) (3m45s) |
| `--full` run 2 | PASS, same as run 1 (3m42s) |
| Rules audit `logic-test.js` | 217/217 pass (1 N/A) |
| Tutorial by touch (`learn-touch.js 375x667,375x553`) | both sizes clean, 37 steps each, 0 problems; real game offered at the end |

## Rules vs the original: no regression
- Since the R50 check, `engine.js`, `ai.js` and `cards.json` are untouched (last engine commit e9570ebc). F15 changed only UI files (ui3, ui6, ui11, skin.css).
- Independent setup spot check from the engine: hands 5/6/7/8 by seat, 8 meadow cards, 3 forest locations at 2 players and 4 at 3-4,
  4 basic + 4 special events, 2 starting workers, 48 distinct cards and 128 copies, Long Road 5/4/3 one worker each and 2 shared, autumn only, discard = points.
- F15 dropped "Each destination holds one worker" from the "Changes in this version" list. That's right: it is the original rule, not a change.

## Clutter, loops and taps (my own sampler, not the worker's scripts)
The sampler runs inside the page once a second. It counts helpers (the bulb answer of bubble, ring and kit finger counted as one, the ghost finger,
the idle nudge, the coach) and every running infinite animation. It also flags off-screen rings, and checks 10-15 s after the first 3 bulb taps of each game.
The driver is a touch-only newcomer: random glowing targets, the bulb on about 35% of turns, hand taps during choices,
second taps on a selected card, and taps on disabled options.

| Run | Games | Samples | Max helpers | Infinite-loop samples | Still looping 10-15 s after a bulb tap | Off-screen rings | Tap checks / silent |
|---|---|---|---|---|---|---|---|
| vs computer 375x667 | 2 (1 win, 1 loss) | 221 | 1 | 0 | 0 / 6 | 0 | 24 / 0 |
| vs computer 375x553 | 2 (2 losses) | 198 | 1 | 0 | 0 / 6 | 0 | 12 / 0 |
| **Guided (title default) 375x667** | 1 (win) | 128 | 1 | **92** | **3 / 3** | 0 | 25 / 0 |
| **Guided (title default) 375x553** | 1 (win) | 119 | 1 | **86** | **3 / 3** | 0 | 24 / 0 |
| Long Road chips (both sizes) | scenario | - | - | - | - | - | 4 / 0 |

Totals: 6 full games to the result screen, 666 samples, **max 1 helper**, **0 off-screen bulb targets**, **0 silent taps in 89 checks**, 0 page errors, 0 stuck.
Loops: **0 in vs games; 178 samples in Guided games**. The looping animations: `.gxh-ring:gxh-pulse` (117 samples), `#finger.go:ftap` (53),
`.tchip.glow`, `.tile.glow`, `.btn.prep` glowp.

Choice taps F15 claimed, all confirmed: a second tap on a selected card says "Pick how to pay below" or "Pick one of the numbers below". A hand tap
during a meadow pick says "Tap a meadow card, not your hand". At both sizes, tapping the Long Road tile shows the chips (3, 2, ×, each 113x44), and a second tap on the tile answers.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Engine unchanged since R50; audit 217/217; setup spot check matches. |
| 2 | Tutorial teaches | 8 | 37 one-line, one-tap steps cover every core rule in order. Clean at both sizes, then a real game. Long for "5 minutes". |
| 3 | First 10 seconds | 7 | Clear title line, "New here?" offer, and a goal card ("Most points after Autumn wins") before the board. |
| 4 | Turn clarity | 7 | Banner names the action ("Place a worker"), Prepare says how many workers are left. The Long Road chips show only a road icon and "3"/"2", with no "discard 3, score 3". The Long Road sits under the Goals tab. |
| 5 | Phone play | 7 | Chips and buttons 44px+, text readable. At 375x553 the hand strip covers the bottom row of Goals text ("Wanderers' Moot ... 3 pts", "Wingborne Healers ... 3 per vole") until you scroll. The bulb bubble sits over the hand cards' cost lines. |
| 6 | AI and pacing | 7 | Hint-asker (`hint-asker.js 4`, 375x667) won 2/4, scores 30-32, 48-47, 34-35, 32-27. The plain random-tapping newcomer won 1/4 vs normal and 2/2 in Guided. Games run 2 min at test speed. |
| 7 | Feel | **6** | vs games are now calm, but the Guided first game still loops forever (see repro). That is the owner's "distracting tap" complaint and R52's Feel defect, on the newcomer's default path. |
| 8 | Bugs | 8 | 6 games to the result screen, 0 errors, 0 stuck states, 0 silent or dead taps in 89 checks. |

**Average 7.3. One row under 7, so FAIL.** No stopper.

### Repro for Feel 6
1. Phone 375x667, clear site data, open the game. The title has **Guided** preselected.
2. Tap **Play**, then **Play now**, then **Start** on the goal card.
3. Without tapping anything else, wait 3 s. Three Places tiles pulse forever (`.tile.t-basic:glowp`) and the ghost finger taps forever (`#finger.go:ftap`).
4. Tap the bulb and wait 15 s. The ring around Resin Pool still pulses (`.gxh-ring:gxh-pulse`, infinite) and the kit finger still taps (infinite).
   The F15 caps (`skin.css` `html.calm .gxh-ring`, and the `ui11.js` observer that returns when the page is not calm) skip this mode.
Shots (reviewer scratch, not committed): `guided_idle.png`, `guided_bulb15s.png`, `lr1_375x553.png`, `end_vs_375x553_0.png`.

## Top fixes (in order)
1. Cap the bulb answer in **every** mode, not only `html.calm`: ring pulses 3 times then holds, kit finger taps 2 times then hides. Guided and hints-on games need it too.
2. In the Guided game, let the ghost finger tap 2-3 times and then rest until the next turn or tap. Make the glows still after a few pulses, as in calm play.
3. Long Road chips: show "discard 3 · 3 pts" (or similar) on each chip so a first-timer knows what the number means.
4. At 375x553, keep the bottom row of Goals text clear of the hand strip, or pad the scroll so it starts clear.
