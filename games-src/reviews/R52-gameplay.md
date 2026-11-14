# R52 strict gameplay review: Hollowbough (14 Nov 2026)

Build reviewed: `origin/shelf/W521-hollowbough-rules` at **06901ebc82566eede9d92c91d26758a4c9555b5f**, staged by build-all (media and models
linked next to the staged page so the art loads), played by touch (`page.touchscreen.tap`, isMobile) at 375x667 and 375x553.
History: owner report "very confusing and distracting with the tap button, the rules are not correct". R50 failed at 6.8 on constant motion,
2 helpers at once, a bulb pointing off-screen and silent taps. F14 claims all four are fixed.

**Verdict: FAIL, average 7.1.** Unprompted play is now calm: 0 loops, at most 1 helper, nothing points off-screen. Two things still fail
the strict checks. (1) Once you tap the bulb, its ring and finger loop with no end until you act (still going after 45 s). (2) 3 taps
made while a choice was open get no answer.

## Gates

| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all --quick` run 1 | **PASS**, 13/13 scenarios (visual baselines skipped as briefed) |
| `VIS_SLUGS="," build-all --quick` run 2 | **PASS**, 13/13 |
| `VIS_SLUGS="," build-all --full` run 1 | **PASS**: phone-check ok, lab WARN 10/12 (same as before), sweep PASS (46 bulb taps, 0 with no suggestion) |
| `VIS_SLUGS="," build-all --full` run 2 | **PASS**, same results |
| Fixer's `calm-measure.js` (4 games) | CALM PASS: 0 animation samples, max 0 helpers, 0 off-screen, 0 silent. It never samples **after** a bulb tap, so it misses finding 1 below |
| Tutorial by touch (`learn-touch.js`), 375x667 + 375x553 | 37 steps at each size, 0 problems; 74 wrong taps blocked; ends on "You know the rules" |
| My own sampler (10 full games, 1 sample per real second) | 10 of 10 games reached the result screen, 0 page errors, 0 stuck states. Results below |

## Rules against the original (quick re-check)

The engine and card data are **unchanged** since R50: `git diff f6cef169 06901ebc` touches only `pv.css`, `ui2/3/6/11.js`, sweep.js,
calm-measure.js and build-all.py. No file under `src/engine.js` or `cards.json` changed. R50's full check therefore still holds:
- setup, placement and the forest rules
- Haven and the Long Road
- destinations, and the second worker on the Glade and the Cloister
- seasons, with Pass in Autumn only
- free critters, unique cards and the city of 15
- events, scoring and the tie-break
- the Goodman at 3 berries

The wrong cemetery line has been **removed** from "Changes in this version", as R50 asked. Small leftover: that list still has "Each
destination holds one worker". That is the original rule, not a change, so it is not core and costs nothing here.
**No regression. Rules OK.**

## Clutter (normal game, hints off, 1 sample per real second)

Players: a "plain" newcomer taps something with a soft glow. A "hint-asker" taps the bulb on about half its turns, then taps what the bulb rings.
Both players stop for 11 s every 7th turn, so the idle nudge fires naturally, and every 5th turn they tap one thing that does **not** glow.

| Size / player / seed | Samples | Max helpers at once | Loop samples | Off-screen bulb or nudge | Silent taps | Score (you vs rival) |
|---|--:|:-:|:-:|:-:|:-:|---|
| 375x667 plain 31 | 223 | 1 | 0 | 0 | 0/13 | 29-25 win |
| 375x553 plain 32 | 252 | 1 | 0 | 0 | 1/16 | 10-29 |
| 375x667 asker 33 | 269 | 1 | 26 (bulb ring) | 0 | 0/15 | 29-27 win |
| 375x553 asker 34 | 246 | 1 | 18 (bulb ring) | 0 | 1/14 | 18-25 |
| 375x667 plain 41 | 185 | 1 | 0 | 0 | 0/10 | 11-29 |
| 375x553 plain 42 | 152 | 1 | 0 | 0 | 0/8 | 7-33 |
| 375x667 asker 43 | 186 | 1 | 9 (bulb ring) | 0 | 0/9 | 19-26 |
| 375x553 asker 44 | 304 | 1 | 25 (bulb ring) | 0 | 1/17 | 53-50 win |
| 375x553 plain 45 | 206 | 1 | 0 | 0 | 0/12 | 11-25 |
| 375x667 plain 46 | 228 | 1 | 0 | 0 | 0/13 | 47-48 |

The first 4 games ran without the art beside the staged page (broken meeple icons, a staging artifact only). The layout and the counts are the same.

- **Helpers at once: max 1** in 2,251 samples. The static tab dot hides while the nudge or the ring shows, so it never doubles up. PASS.
- **Off-screen bulb or nudge: 0** in about 150 bulb answers and about 90 natural idle nudges. PASS (R50's main dead tap is fixed).
- **Loops forever: 0 in unprompted play** (the meeple bob and the pulsing tab dot are gone). **But 2 loops after a bulb tap:**
  `.gxh-ring` (`gxh-pulse 1.1s infinite`, `shell/gx-help.css:23`) and the kit finger (an infinite Web Animation on `.gxh-finger`).
  I timed it: still looping at 1, 5, 15, 30 and 45 s after one tap. It stops only when you act. A hint-asker sees it on about 1 turn in 2. **FAIL** against "0 allowed".
- **Silent taps: 3 of 127** deliberate taps on things that do not glow. Prepare-with-workers-left and unaffordable cards now always answer
  (fixed). The 3 silent ones all happen while a choice is open (repro R8 below).

## Clarity (from the board alone, hints off)

The goal card says what to do: "Win the Elderheart Oak … Most points after Autumn wins", then one Start button.
In the game:
- The top line says "Place a worker".
- Legal places carry a still gold edge. Each place card says what it gives ("3 twigs", "2 cards, 1 point") and whether it is shared.
- Meadow cards show "Costs 3 berries" and "Need 3 berries" or "✓ Can build".
- The disabled Prepare button says "2 workers left" and answers a tap.
- When you play a card, the pay chips (berries ×3, "free" with the linked card's picture) show the options.

A first-time player can act from the board without the bulb. Weak spots:
- At 375x553 the hand folds into a strip of names, so you open it to see costs.
- Once, during a "Tap a meadow card to take it" choice at 553, the hand strip covered the lower third of the big meadow card.

## Fairness (default rival = normal)

- **Hint-asker:** won 2 of 4 (29-27, 53-50, lost 18-25, 19-26). The bulb is a fair teacher.
- **Plain newcomer:** won 1 of 6. That player taps a glowing thing at random and is weaker than a real newcomer: 3 games ended
  on 7 to 11 points. Its close game was 47-48. The rival is not unfair, and it now claims events (12 event points in seed 46).
- Engine balance is unchanged since R50 (normal vs normal 50/50; easy loses 80%).

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|--:|---|:-:|---|
| 1 | Rules fidelity | 8 | No engine or data change since R50's full match. Cemetery line removed. One "change" listed that is really the original rule. |
| 2 | Tutorial teaches | 8 | 37 steps in order by touch at both sizes, 0 problems, wrong taps blocked, ends in a real game. |
| 3 | First 10 seconds | 8 | Goal card with 3 short lines and Start, then "Place a worker" with still gold edges. |
| 4 | Turn clarity | 7 | Calm and readable. Costs and "Need …" lines are on the cards; Prepare explains itself. Held back by the looping bulb answer. |
| 5 | Phone play | 7 | Both sizes play to the end with nothing cut off in normal turns. Rare overlap of the hand strip at 553 during a meadow choice. |
| 6 | AI and pacing | 7 | Brisk rival, games of 40 to 85 own turns. The hint-asker won 2 of 4 and the rival claims events. |
| 7 | Feel | **6** | Cards and points fly and every action has feedback. **Capped:** the bulb's ring and finger loop forever once asked (the strict check allows 0 loops). |
| 8 | Bugs | **6** | 0 errors, 0 stuck states, 10 of 10 games finished. But 3 dead taps (the rubric asks for 0). |

**Average 57/8 = 7.1. FAIL** (rows 7 and 8 are under 7). No stopper.

## Repro steps for rows under 7

**R7: the bulb answer loops forever.**
1. Open the staged page at 375x667 and start a normal game vs computer (hints off, seed 7). Tap Start.
2. Tap the bulb. The ring around Bumper Bramble pulses (`gxh-pulse`, infinite) and the finger repeats its tap (infinite).
3. Wait 45 s without touching anything. Both are still looping.

Fix: let the ring pulse 2 to 3 times and then hold still (`animation-iteration-count:3` under `html.calm`, or in the kit when not tutorial).
Give the finger one tap and then rest, or hide it after one cycle. Keep the bubble text. Then add an "after bulb tap" sample to calm-measure.js.

**R8: 3 silent taps while a choice is open.**
1. Seed 44, 375x553, Summer, Meadow tab: tap Goodman Vole. It is selected, and the pay chips (berries ×3 / free / ×) show.
   Tap Goodman Vole **again**: nothing (no toast, no shake, no change).
2. Seed 34, 375x553, Autumn, Goals tab: tap the Long Road. The chips 4 / 3 / 2 / × show. Tap the Long Road card again: nothing.
3. Seed 32, 375x553, Autumn, during "Tap a meadow card to take it": tap a hand card (Thistle Regent) in the folded hand strip: nothing.
   `deadSay`'s "Finish the choice first" is never reached.

Fix: during any open choice (`UI.sel` or `G.q`), a tap on anything that is not a choice answers with one line. Use "Pick one of the
buttons below", or "Tap a meadow card first" for the meadow choice. A second tap on the selected card can cancel the choice instead.

**R5 minor:** at 375x553, during a "Tap a meadow card to take it" choice that shows only the Undo button, the big meadow card grows
and the hand strip covers its bottom third. Keep the meadow card above the hand strip.

## Top fixes (in order)

1. Bulb answer: the ring and the finger stop looping after 2 to 3 cycles (`shell/gx-help.css:23` and the finger's Web Animation). Add an
   after-bulb sample to calm-measure.js.
2. Answer every tap during an open choice, including a second tap on the selected card (cancel or hint) and hand-card taps during the
   meadow-take choice.
3. (minor) At 553, keep the meadow card above the hand strip during a choice. Drop "Each destination holds one worker" from
   "Changes in this version", because it is the original rule.
