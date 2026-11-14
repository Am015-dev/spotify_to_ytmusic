# R50 strict gameplay review: Hollowbough (14 Nov 2026)

Build reviewed: `origin/shelf/W521-hollowbough-rules` at **f6cef169484af1393ddf98133334c7da2e30c673**, staged by build-all, played by touch
(`page.touchscreen.tap`, isMobile) at 375x667 and 375x553. Trigger: the owner's report "very confusing and distracting with the tap button, the rules are not correct".

**Verdict: FAIL, average 6.8.** The engine rules now match the original. The normal game is still not calm: two things pulse or bob
all the time, and the bulb often points at something off the screen.

## Gates

| Gate | Result |
|---|---|
| `build-all --quick` | PASS (13/13 scenarios) |
| `build-all --full` run 1 | PASS (phone-check, lab 10/12 WARN as before, sweep PASS) |
| `build-all --full` run 2 | PASS (same) |
| Tutorial, touch, 375x667 + 375x553 | 37 steps start to end at both sizes, 0 problems, finishes on "You know the rules" and leads into a real game |
| Full games, touch, vs normal rival | 375x667: lost 24-30 (taps only) · 375x553: won 43-39 (asks the bulb half the time) · 375x667: won 33-27 (asks the bulb half the time). All reached the result screen, 0 page errors, 0 stuck |
| Engine gauntlet (40 games each) | normal vs normal 50/50, avg 33.6 · normal beats easy 80% · hard beats normal 92.5%. 0 errors, 0 stalls |

## Rules against the original (checked from what I know of the original rules, not only the repo audit)

Engine (`game/src/engine.js`) and data match on:
- **Setup:** hands of 5/6/7/8 by seat, 8-card meadow, 3 forest cards with 2 players and 4 with 3-4, 4 basic and 4 special events, 2 workers, start in Winter.
- **Placement:** 4 shared and 4 one-worker basic places; forest second slot only with 4 players and never two of yours; Haven gives 1 per 2 cards; Long Road in Autumn only (5/4/3 one worker, 2 shared).
- **Destinations:** the two open destinations (the owner gets a point); the Glade and the Cloister take a second worker with their critter.
- **Seasons and passing:** Prepare only with every worker out; Spring +1 and production, Summer +1 and up to 2 meadow cards, Autumn +2 and production; Pass only in Autumn (the open-source implementation enforces the same).
- **Card play:** occupy the linked building or the Elderheart Oak for a free critter; unique cards once; city of 15 with its exceptions (the Goodman and Goodwife pair, the card that takes no space, the Toppled Hall); the price changes from Hostler Hedgehog, Pulley Lift, Thornhold Cells and Gavel Marten.
- **Events:** basic events need 4 green, 3 red, 3 blue or 3 tan cards for 3 points each; 16 special events.
- **Scoring and tie-break:** purple bonuses (Master Lathwright capped at 6, the crowned critter 1 per basic and 2 per special event, Goodwife +3 when paired); ties go to the most events, then the most leftover resources.
- **Fixed in this branch:** the jester's free link (`fair_grounds`) now works.

**3 vs 2 berries, settled:** the Goodman costs **3 berries** in the open-source implementation, with 2 points and 4 copies. The Goodwife costs 2.
The data's 3 is correct. Keep it.

**Wrong rule text (not core):** the rules drawer's "Changes in this version" says "The cemetery shows the top four cards of the discard pile".
The engine lets you pick the deck **or** the discard pile, which is the original rule. That line is wrong and is not a change, so delete it.
"Each destination holds one worker" is also the original rule, not a change.

No wrong or missing core rule, so Rules is not capped.

## Clutter: helpers on screen in a normal turn (hints off by default)

Measured with `document.getAnimations()` on the staged build:
- **Gone, as claimed:** ghost finger and coach bubble (0 seen in 3 games without asking).
- **Steady gold edge:** marks legal places and cards. It is not a helper, and it is fine.
- **Infinite animations still running every turn:**
  1. `.pv-meeple.can` → `pvbob` (the worker meeples in the goods row bob 4 px forever while you have workers out of play). `pv.css:25`; the `html.calm` rules do not cover it.
  2. `.pv-tab.hot::after` → `glowp` (a gold dot on the Meadow, City or Goals tab pulses forever whenever something there is playable). `pv.css:36`; the calm rule only covers `.pv-tab.glow`.
- **Idle nudge:** after 8 s idle one place or card gets the `.nudge` outline. It pulses 3 times, then stays. Together with the tab dot, that is **2 active helpers at once** by default.

By the brief, "anything that moves or pulses constantly" caps **Feel and Turn clarity at 6**.

**Helper count: 2** (pulsing tab dot + idle nudge), plus bobbing meeples. The target is 1.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|--:|---|:-:|---|
| 1 | Rules fidelity | 8 | The engine matches the original on every core rule checked. The 3-berry cost is right. One wrong drawer line (cemetery). |
| 2 | Tutorial teaches | 8 | 37 steps in order: places, shared and single places, meadow, free critter, events, forest, Inn, Haven, Summer, Autumn, Long Road, Pass, scoring. One bubble per step, wrong taps blocked, then a real game. |
| 3 | First 10 seconds | 7 | Goal card ("Most points after Autumn wins"), then "Place a worker" with the legal places edged in gold. |
| 4 | Turn clarity | **5** | Capped at 6 by constant motion. Lower still: the bulb points at cards that are not on screen, and Prepare taps silently (repros below). |
| 5 | Phone play | 7 | Both sizes play with nothing cut off. At 553 the hand folds into a strip. The bulb bubble covers the score bar. |
| 6 | AI and pacing | 7 | About 1.6 s per rival turn, games of about 70 turns, and a newcomer can win on normal. Weak spot: the normal rival almost never claims an event (0.6 event points per game). |
| 7 | Feel | **6** | Capped: bobbing meeples and a pulsing tab dot every turn. Otherwise cards fly, points fly and moves are shown. |
| 8 | Bugs | **6** | 0 errors and 0 stuck states, but 3 kinds of dead tap (below). |

**Average 6.75, rounded to 6.8. FAIL** (rows 4, 7 and 8 are under 7). No stopper.

## Repro steps for rows under 7

**R4/R7-a: constant motion (cap).**
1. Open the staged page at 375x667 and start a normal game vs computer (hints off).
2. Tap Start on the Goal card.
3. Watch the goods row: the 2 worker meeples bob up and down forever.
4. When a meadow card is affordable, the Meadow tab shows a gold dot that pulses forever.

Fix: in `html.calm`, set `animation:none` on `.pv-meeple.can` and on `.pv-tab.hot::after`. Let the dot sit still.

**R4/R8-b: the bulb points off the screen.** A dead tap each time; reproduced 3 times at 375x553 and 2 times at 375x667.
1. At 375x553, seed 22, in Spring with the Places tab open, tap the bulb.
2. The bubble says "Build Crook Shrew". That card is in the Meadow tab, which is not open, and its ring sits at x=779, outside the 375 px screen.
3. At 375x667, seed 23, with the Meadow tab open, the bulb says "Build Pulley Lift". The card is scrolled off to the right (ring at x=807), and the bubble covers the meadow cards.
4. Also at 375x667: during the Autumn Long Road "discard 5" step, the bulb says "Discard Flintpit". Flintpit is off-screen in the hand row (ring at x=561).

Fix: before showing the bubble, open the right tab and scroll the target into view. Never ring an element outside the viewport.

**R8-c: silent taps.**
1. Start a normal game at 375x667.
2. Tap the big "Prepare · 2 workers left" button while workers are still in hand: nothing happens, no message.
3. Tap a hand card you cannot afford: nothing happens, no zoom, no "need 2 resin" note (the meadow view shows that note).

Fix: answer both with a short line, for example "Send your 2 workers first" and "Needs 1 more resin".

**R4 minor:** after playing the Hollow Sexton, the line says "Tap a meadow card to clear away: 3 left", but the view stays on City.
Only the pulsing tab dot tells you where to go. Switch to the Meadow tab automatically.

## Hint-asker and newcomer fairness

The rival is fair:
- **Normal:** it scores about 34 in AI-vs-AI games. A touch player tapping random legal things won 2 of 3.
- **Easy:** it loses 80% to normal.
- **Bulb:** it answers with one bubble and one ring (a single helper, on demand), but about 1 in 10 answers rings something off the screen (R8-b). That is the main thing a hint-asker will hit.

## Top fixes (in order)

1. Stop the two infinite animations in calm play: the meeple bob and the tab dot.
2. The bulb must switch tab and scroll its target into view, or pick a target that is on screen.
3. Give feedback for an early Prepare tap and for an unaffordable hand card.
4. Delete the wrong cemetery line from "Changes in this version". Keep the Goodman at 3 berries.
5. (AI) Let the normal rival claim basic events it qualifies for.
