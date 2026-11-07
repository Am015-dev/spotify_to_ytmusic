# Perch & Plume: player review R3 (7 Nov 2026, 18:40-19:10 UTC)

Build reviewed: the single self-contained `perch-and-plume.html` (scratch build), loaded via file://. Real input with Playwright:
phone 390x763 (touch, `tap`) and PC 1440x860 (mouse). Played: first launch with cleared storage, the 13-step tutorial to its end card,
one full Quick game vs one computer on phone (98 taps, lost 54-64) and one on PC (87 taps, lost 48-72), Story chapter 1 (won 52-47,
3 stars) and chapter 2 (won the year 57-34 but chapter failed, 0 stars), every header drawer (Goals, Log, Rules, Menu), hint bulb,
opponent chip, card popup, "Read card", feeder-die tap, Menu > Story map > Back. Moves were chosen from visible legal targets with the
game's own advice. Console/page errors: 0 in every run. Compared with the old shelf title of Cauldron Fair (phone).

## 1. Scores

| Row | Score | Why |
|---|---|---|
| First minute | 5 | Title is a flat green gradient with three tiny cards and four text buttons; the first tutorial bubbles are translucent and print on top of the board/dock text, so the first thing a newcomer reads is a smear. |
| Rules clarity | 6 | Rules drawer, Goals drawer with live counts and the card popup are clear and well written; but the tutorial overlap, "4/1/0 pts" goal notation and the hidden story goal (toast only) cost clarity. |
| Fun moment | 5 | The right-to-left brown-power chain with per-bird pops is a real moment, but every one of 120 birds is the same code-drawn bird recoloured, so the collecting fantasy (the whole point of the game) never lands. |
| Feedback / juice | 5 | Pulses, pops, toasts and synth sounds exist; no art, no celebration on the result screen (plain table), wrong status line during the opponent's turn. |
| Computer opponent | 7 | Plays fast, legal and sensibly: beat an advice-guided player 64-54 and 72-48 in Quick games; story Pip (easy) loses 47-52 and 34-57, a fair act-1 ramp. |
| Phone | 5 | Fits 390 px without horizontal page scroll, but: tutorial bubbles over text, goal toast covers the starting-hand instructions, story-map title breaks as "A Naturalist' / s Year", Menu "Accessibility" pill overflows, feeder dice are 25x25 px. |
| PC | 5 | Board stretches to ~1000 px of mostly empty dashed slots with small cards while the dock has a big empty area; first coach bubble covers the birdfeeder; Escape does not close the card popup. |
| Structure parity with old shelf games | 5 | Has title, Story map with acts/stars, tutorial, help drawers and Menu, but no title art, no top bar on the title (no Menu/Rules/Scores before starting), no table-size quick pick or Online, placeholder silhouettes for every story portrait. |
| **Average** | **5.38** | Not something to show a paying player yet. |

## 2. Bugs

1. **Story chapter result contradicts itself: "You win the year!" then "Not this time", 0 stars.** Severity: **blocking** (Story logic). Device: phone (logic, all devices).
   1. Clear storage, open the game, tap Story, win chapter 1.
   2. Open chapter 2 "A Busy Forest" (goal: "End with 3 or more birds in your forest"), play to the end while placing fewer than 3 forest birds and scoring 45+ and outscoring Pip (here 57-34).
   3. Result screen headline: "You win the year!", no mention of the chapter goal; tap "Continue the story".
   4. Story card: "Not this time", all three stars grey, including "Score 45 or more" and "Win the year", both of which were achieved.
   Expected: the result screen states goal met / not met with the count (e.g. "Forest birds: 2 of 3"); the star list either awards the achieved side stars or says they need the goal first. During play the goal is only a 4-second toast, so the player cannot track it.
2. **Tutorial bubbles are translucent and drawn over board/dock text, illegible.** Severity: major. Device: phone (steps 3 and 6 seen; screenshots `phone-03-tut-step3.png`, `phone-04-tut-step6.png`).
   1. Clear storage, open the game, tap "New here? Learn in 5 minutes".
   2. Step 3 "Gain food": bubble text overprints the meadow row card text ("+1 trade" shows through).
   3. Step 6 "Play a bird": bubble overprints "Pick a row, or play a bird." and the food counters.
3. **Story goal toast covers the starting-hand instructions.** Severity: minor. Device: phone.
   1. Story > chapter 2 > Play. 2. On "Your starting hand" the toast "Goal: End with 3 or more birds in your forest." sits on top of the "Keep 5 things in total..." line, which becomes unreadable.
4. **Status line says "Your birds are at work, one by one." during the computer's turn.** Severity: minor. Device: phone (`phone-11-game-t15.png`).
   1. Quick game, 2 players. 2. While the dock title reads "Round 1 of 4 · Fern · 3 actions left", the prompt reads "Your birds are at work, one by one." (PC shows the correct "Watch Fern.").
5. **Grammar: "1 points" and "1 actions".** Severity: minor. Device: both.
   1. Quick game, tap the hint bulb when a 1-point bird is suggested: "Play Velvet Kinglet: 1 points and a power that repeats."
   2. Play to the last action of a round: dock reads "... · 1 actions left".
6. **Story map title wraps mid-word: "A Naturalist' / s Year".** Severity: minor. Device: phone (`phone-16-story-intro-c1.png`). Steps: title > Story.
7. **Menu tab "Accessibility" overflows its pill and touches "About".** Severity: minor. Device: phone. Steps: in a game tap Menu (`m-phone-08-menu.png`).
8. **Feeder dice are 25x25 px touch targets.** Severity: minor. Device: phone. Steps: in a game, choose the forest row; the dice you must tap are 25 px (below the 40-44 px norm).
9. **First coach bubble covers the birdfeeder on PC; the bubble repeats its title** ("One action a turn / One action a turn: ..."). Severity: minor. Device: PC (`m-pc-04-board.png`). Steps: clear storage, Quick game, keep hand.
10. **Escape does not close the large card popup; the popup then blocks header buttons.** Severity: minor. Device: PC. Steps: tap a feeder die or a hand card > "Read card", press Escape: popup stays, clicks on Menu are intercepted by `#pop` until Close is clicked.
11. **PC layout wastes the screen.** Severity: major (PC feel). Device: PC. Steps: any game at 1440x860: six empty dashed slots per row fill ~1000 px, played birds are small, the right dock is half empty; hand cards would fit two rows larger.
12. **No art: every bird is one recoloured placeholder shape, every story portrait a grey silhouette, plain gradient backgrounds.** Severity: major (release content; build reports 0 pictures). Device: both.
13. **Title has no top bar.** Severity: minor (parity). Device: both. Old shelf games show Scores / Rules / Menu on the title; here sound, settings and scores are unreachable until a game starts.

## 3. Top 5 changes (ranked)

1. **Fix the Story result flow:** show the chapter goal as a live tracker on the board ("Forest birds 2/3") and put "Goal met / Goal missed: 2 of 3 forest birds" as the headline of the result screen; make the star list consistent with what was achieved (award side stars or label them "needs the goal").
2. **Art pass for birds, portraits and title background** (prompts are ready for 186 slots): distinct birds per card, a title scene like the old shelf games; until then the game should not be sold.
3. **Make tutorial and coach bubbles opaque and placed so they never cover the text they refer to** (anchor above/below the target, keep the dock prompt visible); drop the duplicated bubble title.
4. **PC layout:** scale card size to the board (fewer, larger slots visible; rows sized to content), use the empty dock space for a larger hand, and close popups with Escape.
5. **Phone polish and copy:** feeder dice to 44 px, fix the story-map title wrap and the Menu tab overflow, keep goal toasts off the starting-hand text, pluralise "1 point/1 action", correct the status line during the computer's turn; add the title top bar (Scores, Rules, Menu) for shelf parity.
