# R71 strict gameplay review: thornbound

- Build reviewed: `shelf/W489-thornbound-rules` @ **701fbdfa48463a6f2b2f510d6dc12553798794c6** ("the tap guard decides per tap at its pointerdown ...").
- Reviewer R71, 14 Nov 2026, 22:30-23:10 UTC. Touch only, isMobile + hasTouch, at 375x667 and 375x553 (plus one game at 390x844). No game code edited.
- **Result: FAIL, average 6.9.** Two rows are under 7: AI and pacing (6) and Bugs (6). No stopper.

## Gates (each run alone, nothing else running)

| Run | Command | Result |
|---|---|---|
| 1 | `VIS_SLUGS="," build-all.py --quick --out /tmp/x thornbound` | PASS (85 s) |
| 2 | same | PASS (80 s) |
| 3 | `... --full ...` | PASS (264 s): phone-check 86.6 s, sweep PROBLEMS 0, lab WARN 10/12 (b: LAB rows list) |
| 4 | same | PASS (266 s): phone-check 86.0 s, sweep PROBLEMS 0, lab WARN 10/12 (same) |

The `games/lab.html` rewritten by `--full` was restored, not committed.
Unit tests on the branch: rules-test 119/119, logic-test 165/165, hint-test PASS (76 cards; 14 Site cards checked against cards.json; the road line is at most 8 words).

## Rules verdict: faithful (row 1 = 8)

Checked against the repo's own notes (`thornbound/rules-notes.md`, `cards.json`):
- Engine: rules-test covers every turn step in the notes. That includes the bid order and steal (strictly higher), the Great Road discard (1 card or 2), the Herald +1 and steal, Supporters counting in the first Clash only, a tied Clash replayed with new cards only, Deadly before the count, Attrition (minimum 3), Winter cleanup and the Favour tiebreak. All pass.
- The R64 findings are fixed. Hedge Skirmishers now prints Ambush (data `cm` matches cards.json), including the Night drawback against an opposing Heir. Martial Writ now says "during its first Clash".
- My own spot check, text vs cards.json: all 16 Tactics, all 14 Site/HQ cards, 4 Favour actions and 9 random Kingdom Cards (seed 71: Tome of Real Names, Dead King's Helm, Concealed Ways, Roaming Company, Monarch's Seal-Ring, Shadow Assembly, Faraway Hermitage, Broken Gnomon, Buried Hall). Every one matches in meaning.
- Tutorial and log lines checked: no wrong rule found. (The bulb line "Supporters come back to your board next round" is the Pledges Council action, which is correct.)
- Minor wording, not scored down:
  - Rite of the Fang's card text says it adds "Strength, Traits and text", but the card and engine also copy **Commands**. The action label does say Commands.
  - Ivory Rampart's text says "With two Supporters", where the card means two or more.

## Helpers and loops (sampled every second)

| Run | Samples | Max helpers (repo sampler) | Infinite-loop samples | After-bulb windows |
|---|---|---|---|---|
| Tutorial 375x667 | 65 | 1 | 0 | - |
| Tutorial 375x553 | 65 | 1 | 0 | - |
| Game 1, 375x667, follows suggestions | 454 | 1 | 0 | 3 bulbs x 15 s: max 1, 0 loops |
| Game 2, 375x553, random choices | 430 | 1 | 0 | 3 x 15 s: max 1, 0 loops |
| Game 3, 375x667, random choices | 412 | 1 | 0 | 3 x 15 s: max 1, 0 loops |
| Game 6, 375x553, follows suggestions | 460 | 1 | 0 | 3 x 15 s: max 1, 0 loops |

**Caveat: the repo's sampler (`helper-sample.js`) never saw a single in-game glow.** In the games it records only `bubble`, even while the bot tapped 25-31 glowing regions per game. It looks only for a gold drop-shadow, so it is blind to the current glow style. "Max 1" is therefore true for bubbles, but it says nothing about glows.

My second, class-based counter (game 6) counts `.glow`, `.rg`, `.rec`, finger and bubble. It saw up to 3 kinds at once: bubble + suggest + targets in 32 samples, also during bulb windows. I checked by eye:
- Bulb 1 and bulb 2: the bubble plus its own target ring. 1 helper.
- **Bulb 3 (Round 2, placing a card): the bubble's arrow points at the glowing Uplands region, while the Champion card in hand also glows with the finger on it.** That is two lit targets, so "only its target glows" is not true here. Shot: `shots2/game-g0-375x553-bulb3.png`.
- First-play "Hide a card" coach bubble: it points at the map while the finger points at a hand card. Shot: `shots3/m-375x553-place.png`.

Infinite loops: 0 in every run.

## Double-tap and fast tapping

My probe double-tapped every overlay's button by touch, with the second tap 110 ms later, and logged where the second tap's click landed.

| Overlay | Double-taps | Second tap reached the board |
|---|---|---|
| Goal card "Got it" | 11 | 0 |
| Title Start button | 1 | 0 |
| Tutorial "Next" | 4 | 0 (no step skipped) |
| Glossary close | 0 (never opened during the probe; not measured) | - |
| **Coach bubble "Got it" / "Go"** | 7 | **7: it pressed the Goal button (`.tbt-goal`) and opened the Goal card** |
| **Bulb bubble OK** | 2 | **2: same** |

Focused repro: at 375x667 with gaps of 110 and 250 ms, and at 375x553 with 150 ms, the result was "Goal card open=true" every time.
- Shots: `shots/r71-dtap-375x553-1-before.png` and `-after.png`.
- Likely cause, from reading the code: the tap guard (turnstrip.js:210-226) arms only when a tapped overlay is removed or set `hidden`. The `.gxh-bub` bubble only loses its `on` class, so `gone()` is false and the guard never arms for it.

The double-tap test (`doubletap-test.js`) checks the Goal card only, so it misses this. No game move was made by accident: the second tap opens the Goal card, which then has to be closed.

Does the guard eat legitimate taps? A probe in front of the guard listed every swallowed gesture. In 6 full games, 2 tutorials and the double-tap run, with taps 500-1200 ms apart, it swallowed **0** taps. Taps elsewhere on screen inside the 350 ms window go through by design.

## Games played (touch, default settings: Play, then Start, you as Clans against the Gilded Court, 4 rounds)

| # | Size | Strategy | Result | Time | Longest dead screen | Errors |
|---|---|---|---|---|---|---|
| 1 | 375x667 | follow suggestions + 3 bulbs | lost 13-19 | 447 s | 3.4 s | 0 |
| 2 | 375x553 | random legal glow + 3 bulbs | lost 13-13 (tiebreak) | 423 s | 3.3 s | 0 |
| 3 | 375x667 | random + 3 bulbs | **won 13-12** | 405 s | 3.2 s | 0 |
| 4 | 375x553 | random | lost 8-17 | 335 s | 3.3 s | 0 |
| 5 | 390x844 | follow suggestions | lost 8-14 | 367 s | 3.3 s | 0 |
| 6 | 375x553 | follow suggestions + 3 bulbs | lost 8-14 | 454 s | 3.3 s | 0 |

Every game reached the result screen ("Gilded Court takes the throne", scores, "Where the Influence came from", Play again).

I also ran 4 extra suggestion-following games with `glow-follow.js`. Run 4 at a time, they hit the script's 420 s cap in Round 4 because of CPU load, not a game stall. They stopped at 6-14, 15-6, 8-11 and 15-16.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Engine and texts match the notes (above). Two small wording slips. |
| 2 | Tutorial teaches | 7 | 37 steps, one line and one tap each, reaches the end card at both sizes. It covers bid, take-back, Herald, hiding cards, Supporters, fight order, the Clash, claiming, the Herald steal, a tie replay, Govern, Journey, buying with Lore, Winter and stealing a Kingdom Card. Commands (Ambush, Retreat, Flank, Deadly), Attrition and the Order Track are one "Next" line each, never done. |
| 3 | First 10 seconds | 7 | A Goal card with 3 bullets, then the coach bubble "Make a secret bid: tap a card, then the glowing spot". |
| 4 | Turn clarity | 7 | YOUR TURN / TAP: NEXT pill, an instruction line, "Suggested" tags, glossary links. At 375x553 the instruction line is cut off (see row 5). |
| 5 | Phone play | 7 | 0 visible text under 14 px, 0 buttons off screen; tap targets 44 px or more (glossary chips sometimes 43.x px). Minuses: the line is cut at 553; bulb 3 lights two targets; Clash strength chips cover the region names. |
| 6 | AI and pacing | **6** | A game takes 6-7.5 min and the rival is brisk, but a newcomer rarely wins. Following the game's own suggestions lost 4 of 4 full games (13-19, 8-14, 8-14, 8-14). Random choices won 1 of 3. |
| 7 | Feel | 7 | Cards fly to their spots, Clash chips, the bid flip, influence pops, a clear result screen. |
| 8 | Bugs | **6** | 0 page errors, 0 stuck states, 6 of 6 games finished. But the double-tap fall-through on the coach and bulb bubbles is back: 9 of 9 second taps opened the Goal card. The R64 fix claimed hint bubbles were covered. |

**Average 6.9, FAIL.** Rows 6 and 8 are under 7; no stopper.

## Repro steps for rows under 7

**Row 8: a bubble double-tap falls through**
1. Clear site data, open `?phone=1` at 375x667, tap Play, tap Start, tap "Got it" on the Goal card.
2. The coach bubble "Make a secret bid" appears with "Got it" at about (322, 110).
3. Double-tap "Got it", 110-250 ms apart.
4. The bubble closes and the Goal card opens: the second tap pressed the Goal button underneath.
5. The same happens with the bulb bubble's OK, any phase.

**Row 6: a newcomer who follows suggestions loses**
1. Clear site data, tap Play, then Start (defaults).
2. Each time, tap whatever the game suggests: the `.rg` / `.rec` glow or the main button.
3. Results at 375x667, 390x844 and 375x553: lost 13-19, 8-14, 8-14, 8-14. The Court finishes 14-19.

**Row 5 (scored 7, fix anyway):**
1. At 375x553, in Spring, the line reads "Tap a region to send a Supporter there (+1). Then" and stops; "Then Done." is cut off. Shot: `shots3/m-375x553-menu.png`.
2. Later the line reads "Added cards are revealed: Gilded Court -..." with the rest cut off.

## Top fixes (in order)

1. **Tap guard on hint bubbles.** Arm the guard when `.gxh-bub` loses `on`, or treat a closing bubble as "gone". Add coach-bubble and bulb-bubble cases to doubletap-test.js; it only covers the Goal card now.
2. **A newcomer must be able to win on the default level.** Make the default rival easier, or make the suggestions stronger. Gate: suggestion-following wins at least 50% over 10 default games.
3. **One lit target while the bulb is open.** When the suggestion is a card plus a region, light only the thing the bubble points at, or point the bubble at the card.
4. **Fix the helper sampler.** helper-sample.js misses every current in-game glow (it sees only bubbles). Fix it so the "max 1 helper" gate is real.
5. Let the instruction line wrap to 3 lines, or shorten it, at 375x553.
6. Small text fixes: Rite of the Fang should say "Commands"; Ivory Rampart should say "two or more Supporters".

Screenshots are local to the review run (scratchpad `shots/`, `shots2/`, `shots3/`) and are not committed; they are listed by name above.
