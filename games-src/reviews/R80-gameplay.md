# R80 strict gameplay review: kaiten-kitchen

Reviewed commit: **f3c8282a** on origin/alex/brave-carson-rbpmlk (it contains cb812c16, the shell calm pass). Reviewer only; no game code changed.
Date: 20 Nov 2026 (UTC).

## Verdict: FAIL. Total 4.0 (capped by a stopper; the plain row average is 6.3)

Stopper: the hint bulb is a dead tap. On turn 1 of a Normal game, tapping the bulb lights the button and shows nothing.
This happened in 5 of 6 tries (touch and mouse, 375x667 and 375x553). The calm-audit's own "+bulb" path also measured 0 helpers.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 7 |
| 8 | Bugs | 4 (stopper) |

## Gates (each run alone, `VIS_SLUGS=","`; the brief's `VIS_kaiten-kitchenS` is not a valid shell name and does not switch off the baseline compare)
- `--quick` run 1: PASS (scenarios 67.5 s). Run 2: PASS.
- `--full` run 1: PASS (phone-check 66.7 s, sweep CLEAN: 3 games, 27 rounds, twin 1, hurry 68). Run 2: PASS (sweep CLEAN). `games/lab.html` was restored and not committed.
- Both full runs also printed `[lab] WARN 9/12 checks (b) LAB rows != scenarios` (non-blocking).
- `tut-walk.js 375x667,375x553`: PASS at both sizes (27 steps, 27 rules, no Next buttons), and the real game it hands over to was played to the result by touch (0 problems).
- `calm-audit.js`: `loops=1 maxHelpers=0` (`div.sbox.empty.mine {kkpulse}`). Its guided path tapped "Rules" (no Guided button on the first screen).

## Rules vs the original (sources: rules-check/kaiten-kitchen.md, kaiten/rules-notes.md, RULES-CHECKLIST.md, my own knowledge of the published rules)
**Engine** (`kaiten/game/src/engine.js`, read in full): matches. Card counts and scores are right, and so are hand sizes 10/9/8/7 and the pass to the left.
Roll race ties are right (a tie for most splits 6 with no second place; a tie for second splits 3; zero icons never score). Fire Paste takes one nigiri and only nigiri played after it.
Twin Sticks go back into the hand and need 2 cards. Custard: most +6, fewest −6, no penalty with 2 players, all equal scores nothing. The tie-break is more custard.
The AI reads only public info plus its own hand and memory (`ai.js:4`, `:181-206`). The one known simplification is that a Twin Sticks pick is placed in an automatic order (`engine.js:140`). It is disclosed in help (`ui5.js:40`) and never scores worse.

**Player-facing text mismatches:**
1. 2-player games teach a custard penalty that does not exist there. The guided first game is always 2 players (`ui3.js:14`), and so is a 2-diner Quick game. These lines say "fewest loses 6" with no 2-player exception:
   - `kaiten/game/src/story.js:79` coach `custard`: "Custard pays at the very end: most +6, fewest -6."
   - `kaiten/game/src/story.js:83` coach `custardEnd`: "Custard: most cups +6, fewest -6. Ties split." (shown at the end of the 2-player guided game, `ui11.js:212`)
   - `kaiten/game/src/ui1.js:147` whyPick: "most scores +6, fewest loses 6."
   - `kaiten/game/src/ui10.js:21` bulb rules card: "most scores 6, fewest loses 6."
   - `kaiten/game/src/ui5.js:31` help glossary: "then most scores 6 and fewest loses 6."
   - Correct versions already exist: `ui2.js:126`, `data.js` card text, `ui5.js:17`, and tutorial `ui11.js:101`.
2. `kaiten/game/src/story.js:18` `wait: '%R\'s turn|…'` shows a "KOFI'S TURN" chip during the reveal (screenshot 375x667-g2-mid). Picks are simultaneous, so this suggests turns that the game does not have. Use "Kofi served" or "Reveal".
3. No other mismatch found in card texts (`data.js`), help (`ui5.js`), tutorial (`ui11.js:74-104`), coach (`story.js:71-95`), hint lines (`ui10.js`), logs and end lines (`engine.js:165-220`).

Pass direction (always left) and paste-before-nigiri only both match the published base game.

## First-timer play (touch only, 375x667 and 375x553)
The tutorial plus 3 Normal games per size (default: 3 diners, both chefs Easy). In games 1-2 I always took the dish with the biggest green +N, like a newcomer following the hint numbers. In game 3 I tapped random dishes.

| Game | Result (You / Odile / Kofi) | Winner |
|---|---|---|
| 375x667 g1 (+N) | 40 / 50 / 39 | Odile |
| 375x667 g2 (+N) | 38 / 41 / 35 | Odile |
| 375x667 g3 (random) | 27 / 53 / 32 | Odile |
| 375x553 g1 (+N) | 33 / 40 / 38 | Odile |
| 375x553 g2 (+N) | 41 / 39 / 40 | **You** |
| 375x553 g3 (random) | 32 / 54 / 44 | Odile |

- Every game was 27 picks with 0 page errors, 0 stuck states and 0 dead dish taps (each dish tap changed state within 2 s).
- A sped-up game took about 55 s, so about 3-4 min at normal speed. That is a good length.
- `bench-newplayer.js` says a "sensible new player" wins 33% (Easy-level play) to 70% (Normal-level play with 25% slips) against 2 Easy chefs. A newcomer can win; following the +N alone wins about 1 in 4.
- Odile won 5 of 6 although both chefs are Easy. Worth a look (seat order or personality weights).
- Turn clarity is good on the belt ("YOUR TURN · Tap a dish to take it", +N badges, Goal card with 3 lines). It is weak after the pick:
  - the reveal labels are clipped (see Phone);
  - your own counter hides groups off the right edge;
  - the hint bulb does nothing.

## Clutter (sampled once a second through all 6 games, plus 15 s after the bulb tap)
- **Helpers on screen: max 0.** This passes, but only because the bulb never shows its bubble. Glow classes: max 1 at once (`button.grp.wait.waitf`, an unused Fire Paste).
- **Infinite animations: max 3 at once. Required: 0.**
  - `kaiten/game/head.html:63`: `.slot .sbox.empty.mine{animation:kkpulse 1.6s infinite}` runs on every one of your turns (also flagged by calm-audit).
  - `kaiten/game/head.html:426`: `#stage.wob .kk-cloche{animation:wob .26s infinite}`. Up to 3 cloches at once during the reveal drum roll (about 130 ms each turn).
  - `kaiten/game/head.html:53`: `.grp.waitf .pl{animation:kkpulse 1.4s infinite}` on an unused Fire Paste, which can last a whole round. The canvas copy loops too: `ui7.js:410` sine pulse while `o.pulse`, and `ui7.js:372` flame particles.

## Phone (375x667 and 375x553)
- Text under 11 px: 0. Taps under 44 px: 0. Good.
- **Clipped or overlapping:**
  - Reveal stage, both sizes (shots 375x667-g2-mid, 375x553-g1-mid):
    - the gain caption from `ui8.js:172` ("no points yet", "+2 roll race (n…") is wider than the card;
    - it overlaps the neighbour card and is cut off at the left screen edge;
    - "+0" and "3" sit half off-card.
    The rest of the screen below the stage is empty beige.
  - Your own counter overflows at 375 wide once you hold about 5 groups (shot clip-375x553, round 2 turn 7):
    - the custard shelf `button.grp.shelf` ends at x=388-410, past the 375 edge, so your custard count is hidden;
    - the last group ("2nd +1") is cut by the pick slot;
    - the floating "+2 roll race" text overlaps the group labels.

## Row notes and repro for every row under 7
- **Row 4 Turn clarity (6).**
  - Repro A: Normal game, take any dish, watch the reveal. The chip reads "KOFI'S TURN" and the captions are clipped.
  - Repro B: play to round 2 turn 6+. Your counter's right end (custard, last group) is off-screen, so "what do I have" cannot be answered.
  - Repro C: turn 1, tap the bulb. Nothing.
- **Row 5 Phone (5).** The two clipping cases above at both sizes, and 3 infinite loops against the owner's 0.
- **Row 8 Bugs (4, stopper).**
  - Repro: fresh storage with the tutorial marked done → Play → "Start the meal" → "Got it" on the Goal card → wait 3 s → tap the bulb (top bar, 2nd icon).
  - What happens: the bulb turns yellow (`lit`) and no bubble or rules card appears for 10 s. `hlpSuggest()` returns a target ("Fire Paste triples…") and `GXH.state().on` is false.
  - Once (375x553, tapped about 0.8 s after the Goal card) a bubble appeared and was gone within 1.5 s.
  - Suspect `bulbOpen` in `shell/gx-help.js:206` (`skipUntil` guard, or `draw()`/`hide()` from the next re-render). Check it in kaiten before touching the shell.
- Rows 1, 2, 3, 6 and 7 are at 7.
  - Tutorial: complete and in order. The 10 look-only steps in a row after the round (`ui11.js:94-104`) read like a list; fold custard tie and tie-break into the end-of-game result.
  - Feel: cloche reveal, plates flying to counters, score pops and sound all work.

## Prioritized fix list
1. **(Stopper) Make the bulb show its suggestion bubble on every tap and keep it up until the next action.** Test: tap the bulb on turn 1 at both sizes, then sample 15 s: 1 helper, 0 loops.
2. **Reveal captions** (`ui8.js:172` `.sgain small`): clamp to the card width (wrap to 2 lines, or drop "no points yet" and show nothing at +0). Keep "+N" inside the card. Fill or shrink the empty area under the stage.
3. **Own counter overflow at 375**: let the groups shrink or wrap, or move the custard shelf next to the avatar, so `.grp.shelf` and every group stay inside 375 px with no overlap from the floating "+N roll race".
4. **Kill the 3 infinite loops**: `head.html:63` (`.sbox.empty.mine`, play 2 pulses then stop), `head.html:53` plus `ui7.js:410`/`:372` (Fire Paste pulse and flame: 2 pulses on landing, then still), `head.html:426` (give wob a finite iteration count of 1-2).
5. **2-player custard text**: make `story.js:79`, `story.js:83`, `ui1.js:147`, `ui10.js:21` and `ui5.js:31` say "no penalty with 2 players", or switch on `G.np` like `ui11.js:101` does.
6. **"%R's turn" chip during the reveal** (`story.js:18` wait line): reword for simultaneous picks ("Kofi served", "Reveal").
7. (Balance check) Odile won 5 of 6 games at Easy. Compare seat 1 and seat 2 win rates in `bench-newplayer.js`.

Shots and logs from this review were written to the reviewer's scratch folder (not committed): title, first 10 s, bulb, mid-game reveal, result, and the clip shot for each size.
