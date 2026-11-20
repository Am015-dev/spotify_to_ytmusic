# R87 strict gameplay review: perch-and-plume

Reviewed commit: `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk, contains cb812c16 shell calm pass). Reviewer only: no game code touched.
Date: 20 Nov 2026. Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md (8 rows, PASS = every row >= 7, no stopper).

## Verdict: FAIL, average 6.3 (no stopper)

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 6 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 4 |
| 6 | AI and pacing | 5 |
| 7 | Feel | 7 |
| 8 | Bugs | 8 |

Rows under 7: 2, 4, 5, 6. Clutter check: FAIL (up to 10 helpers on screen at once, up to 8 infinite animations, never 0 while a turn waits).

## Gates (each run alone, 2 runs each)

| gate | run 1 | run 2 |
|---|---|---|
| `--quick` | exit 1: scenarios 9/12. All 8 `?scn=` scenarios + ui-audit pass; the 3 fails are `visual.spec.js` title/menu/board: "A snapshot doesn't exist at .baselines/perch-and-plume-*-phone.png" (the ui-baselines branch has no baselines for this game; `baselines.sh pull` fetched 12 others) | identical |
| `--full` | exit 0, PASS: phone-check 59 s, rules-test 240/240 games, LAB WARN 3/8 (LAB rows list lacks `menu`) | exit 0, PASS (same) |
| `node logic-test.js` | 139/139 rules pass | |
| `node ai-gate.js` | PASS: hard 100%, normal 100% vs first-option bot, hard vs normal 72% | |
| `node hint-gate.js` | PASS: Best-follower 95%, mixed 75% vs Easy | |
| `calm-audit.js /tmp/x perch-and-plume` | loops=6 maxHelpers=0 (its "guided" path tapped "Rules", not the tutorial; its helper count ignores `.glow`) | |

Note: the brief's env var `VIS_perch-and-plumeS` is not a valid shell name and build-all only reads `VIS_SLUGS` for `--visual`; runs used `env 'VIS_perch-and-plumeS=,' python3 ...` (no effect). `--full` rewrote games/lab.html; it was restored, not committed.

## How I played

Own Playwright harness (touch only, `hasTouch/isMobile`, deviceScaleFactor 1) on the staged `--quick` build, served by gx-serve. Per size (375x667, 375x553): fresh storage, the title's "New here? Learn in 5 minutes" tutorial to its end by tapping only the marked target, then 3 full Quick games with the shipped defaults (2 players, you vs computer "Fern", Easy, normal speed) as a mixed newcomer (taps the Best badge half the time, else a random glowing target). Game 1 taps the hint bulb after 6 taps and watches 15 s. Sampled every second: helpers (coach bubbles, fingers, nudges, `.tutpoint`, every visible `.glow`, `.bestb`), infinite animations (`document.getAnimations()` iterations Infinity), smallest text, tap targets under 44 px, horizontal scroll. Screenshots in the reviewer scratchpad (`shots/`, `pass1/`, `pass2/`), not committed.

| size | game | taps | dock scrolls | dead taps | time | result |
|---|---|---|---|---|---|---|
| 375x667 | 1 | 82 | 5 | 0 | 152 s | lost 29-46 |
| 375x667 | 2 | 73 | 3 | 0 | 130 s | lost 28-53 |
| 375x667 | 3 | 74 | 3 | 0 | 135 s | lost 31-55 |
| 375x553 | 1 | 97 | 1 | 0 | 156 s | won 54-23 |
| 375x553 | 2 | 86 | 2 | 0 | 142 s | won 39-30 |
| 375x553 | 3 | 90 | 5 | 0 | 140 s | lost 24-41 |

Tutorial: 22 steps, 24 taps, 36 s, 0 stray taps, 0 stuck, ends in a real game (keep screen) at both sizes. 0 console/page errors over everything. Rival waits: mean 1.8-2.1 s, longest 7.5 s.

## Clutter (sampled every second)

| phase | max helpers at once | max infinite loops | seconds with >1 helper |
|---|---|---|---|
| tutorial (both sizes) | 10 (1 coach bubble + 1 `.tutpoint` ring + 7 `.glow` + 1 Best badge) | 8 (`.glow {gl}` on 4 action buttons, row buttons, slots; `.tutpoint {tutp}`) | 24 of 36 |
| games 375x667 | 8 | 7 | 4-16 per game |
| games 375x553 | 7 | 7 | 8-12 per game |
| 15 s after the bulb (375x667) | 6 | 6 | 15 of 15 |
| 15 s after the bulb (375x553) | 1 | 1 | 0 |

Loops come from `src/head.html:127` (`.glow ... animation:gl 1.2s infinite`) on every legal target, and `src/head.html:348`/`:351` (`.tutpoint ... animation:tutp 1.2s infinite`). Glows show on all legal targets even with hints off (games 2-3 had hints off and still showed 4-7 glows). The bulb is a hints on/off toggle, not a one-shot hint; "What should I do?" (`#whatbtn`) is hidden when hints are off (`src/render.js:119`), so it could not be sampled in game 2.

## Rules check vs the original (from rules-notes.md and RULES-CHECKLIST.md)

Engine (`src/engine.js`): turn structure, 8/7/6/5 cubes, row yields 1,1,2,2,3,3 / 2,2,3,3,4,4 / 1,1,2,2,3,3 with trades on spaces 2/4/6, egg cost 0,1,1,2,2, 2-food-for-1 only when playing, feeder empty/all-same reroll, tray refill end of turn and round, brown right to left only in the used row, white once on play, pink once between turns, green goal 4/1/0 .. 7/4/3 with tie split and 0-items-scores-nothing, setup keep 5, final scoring and food tiebreak: all match. Mismatches:

1. `src/engine.js:395` + `src/engine.js:314` / `src/turnui.js:22`: the Rival Flock's "play" card adds a bird but never calls `queuePinks(G, seat, 'play', ...)`, so pink "when another player plays a bird in their <habitat>" birds can never fire in solo (Quick game with 1 player, story chapter 9), while the card text promises they do. Either trigger it (pick a habitat for the flock bird) or say on the card / in "Simplified on purpose" that it is dead vs the Flock.
2. `src/engine.js:332-344` (`brown()`): every power in the original is optional ("may"); here only tuck/trade powers can be declined. gainF, cacheF, flock, hunt, draw1, laySelf, layNest, allFood, allDraw always fire. Rarely harmful (allFood/allDraw feed the rival; hunt can discard a card), but it is a rule difference not listed in `src/screens.js:133`.
3. `src/screens.js:132` (How to play, "How a turn works" item 5): "most points wins: birds, eggs, goals, bonus cards" omits cached food and tucked cards (the RULES list below it, `src/screens.js:128`, has them). Make the two agree.
4. `src/engine.js:357` (wFeeder) logs and toasts "+0 seed" when there is none (seen in the tutorial, "Pip's Dusk Dove: +0 seed"). Say "no seed in the feeder" like gainF does (`src/engine.js:332`).
5. `src/tutor.js:3` says Pip is scripted to draw cards, but `src/tutor.js:10` only scripts him when `UI.mode === 'tutorial'`; the guided game runs as `'tutfree'` (`src/tutor.js:53`), so Pip plays freely (he used the forest and took a die at step 9). Harmless today, but the steps' feeder/board assumptions are not guaranteed.
6. `src/screens.js:105`/`:107`: the result table's "Food" column means cached food, while the tiebreak line under it talks about leftover food. A newcomer reads "Food" as their leftover food. Rename the column "Stored food" (the guided game already says "Stored food", `src/coach.js:138`).
7. Documented simplifications (fine, already in `src/screens.js:133`): automatic payment/egg sources, trade offered before the gain, forced reroll for powers, original 120-bird roster, Rival Flock deck.

No mismatch found in coach lines (`src/story.js:24-45`), card power texts (`src/engine.js:291-315`, `src/turnui.js:14-22`) or the How-to-play RULES list (`src/screens.js:119-128`) beyond the above.

## Findings for rows under 7 (with repro)

### Row 2 Tutorial teaches: 6
- Not taught at all: the setup choice (keep 5 in total, birds vs food, 1 of 2 bonus cards) which every real game opens with; the row trade on spaces 2/4/6 (the grassland button shows "+1 trade" during the tutorial with no explanation); any 2 food = 1 food; columns 4-5 cost 2 eggs; the feeder reroll. Repro: title > "New here?" > read all 22 steps (list: goal, turns, play, cost, slot, pay, white, rgoal, food, die, die2, tuck, cache, eggs, nest, pink, cards, tray, goalr, bonus, final, real; `src/coach.js:17-40`).
- The move rating contradicts the coach: step 9 tells you to take food; after doing it the rating panel says "Okay: +2 points ... Laying eggs was worth more (+3 pts)". Cause: ratings are forced on in the guided game (`src/turnui.js:228` + `src/turnui.js:238` `hintsOn()` is true for `tutfree`). Shot: pass1/375x667-t13-cache.png.
- Up to 10 helpers on one step: step 1 "Tap the score" shows the ring on the score, a Next button, 7 glowing action/row buttons and a Best badge (pass1/375x667-t01-goal.png). Step 8 shows the coach bubble, the goal ring and a "Good: +2 points" rating at once (pass1/375x667-t08-rgoal.png).
- Steps 7, 9, 14, 17 first show "Pip plays. Your next step comes right after." with a "Tap to skip" plus the instruction bar "Your birds' powers fire, one by one. Then Pip plays." (two messages at once).

### Row 4 Turn clarity: 6
- Every waiting turn glows all legal targets (4-7 elements) plus up to 2 Best badges (on "Play a bird" and on a hand card at the same time, pass1/375x667-g1-mid1.png), plus "What should I do?". With hints off the glows stay. The eye has no single answer to "what now".
- The round-goal chip `span.tr-g` (tap target in the tutorial, step 8) is 17 px tall at both sizes.
- The cost/gain lines on the four action buttons are good ("take 2 from the feeder", "+2 eggs = +2 pts", "No room for eggs"); keep them.

### Row 5 Phone play: 4
- 375x553: whenever the dock is tall (4-action panel, a selected card, or a coach bubble) the three board rows collapse to 15-20 px strips: birds on the board disappear, slot chips ("1 egg", "free") spill over the neighbouring rows, row buttons "+2 food"/"+2 eggs" become 64x15 / 64x20 taps, board slots 44x15. Repro: 375x553, tutorial step 5 "Tap the glowing space on your board" (pass2/375x553-t05-slot.png); also in real games after tapping "Play a bird" (shots/375x553-g1-mid1.png, -g3-mid3.png). This is the board, at the moment you must tap it.
- 375x553: the round-start banner "Round 1: 8 actions each. Goal: ..." and the intro toast sit over the board rows (shots/375x553-g1-mid1.png); on the keep screen the intro toast covers a bird card at both sizes (pass1/375x667-g1-keep.png).
- 375x667: the hand is cut at the bottom; 1-5 dock scrolls per game were needed to reach a glowing card (table above); at 375x553 on the title "Quick game" and "How to play" are below the fold.
- OK: smallest text 12 px (habitat tag), no horizontal scroll, 0 dead taps.

### Row 6 AI and pacing: 5
- Default Quick game (vs Easy computer): a mixed newcomer won 2 of 6 by touch (lost 29-46, 28-53, 31-55, won 54-23, 39-30, lost 24-41); hint-gate's headless mixed newcomer wins 75%. Borderline but acceptable.
- Solo is not fair: choosing 1 player ("Solo: you race the Rival Flock", default level Easy) — headless, 60 seeds each: a player who always follows the Normal AI's choice beats the Easy Flock only 22/60 (37%), a mixed newcomer 7/60 (12%); vs Normal Flock 12/60 and 1/60. The Easy Flock averages 63.6 = 34.7 bird points (12 free birds, 3 per round from `AUTO_CARDS`, `src/engine.js:390`) + 19.5 goal points (5 goal marks every round, `src/engine.js:394`). Repro: script in the review notes below. Story chapter 9 uses this rival.
- Pacing is good: ~2.5 min per game at normal speed, rival wait mean 2 s, longest 7.5 s.

## Prioritized fix list

1. Phone 375x553 board collapse (row 5): give the board rows a minimum height (birds and slot chips readable, row buttons and slots >= 44 px) and let the dock scroll or shrink instead; never let slot chips overflow into other rows. Prove with a ?scn= at 375x553 after "Play a bird" and on tutorial step 5.
2. Calm (rows 2, 4): one helper at a time. Glow only the single suggested target (or none) instead of every legal target; stop the infinite `gl` and `tutp` animations (`src/head.html:127`, `:348`, `:351`): a 2-3 pulse then static outline. In the guided game hide Best badges and move ratings (`src/turnui.js:228`, `:238`). Gate: calm-audit counting `.glow` reports maxHelpers <= 1, loops = 0, also for 15 s after the bulb and on the tutorial path.
3. Solo Rival Flock balance (row 6): Easy must be beatable by a newcomer (target: mixed newcomer >= 40% vs Easy, like hint-gate for 2 players). Levers: fewer "play" cards or lower bird points for Easy, fewer goal marks. Add a solo line to hint-gate.js.
4. Tutorial coverage (row 2): add short steps for the keep-5 setup (or run the tutorial through the keep screen), the row trade on bonus spaces, and the 2-for-1 food rule; script Pip in `tutfree` too (`src/tutor.js:10`).
5. Rules text (row 1): pink play-trigger vs the Flock (`src/engine.js:395`), optional brown powers or list it as simplified (`src/screens.js:133`), How-to-play line `src/screens.js:132`, "+0 seed" (`src/engine.js:357`), result column "Food" -> "Stored food" (`src/screens.js:105`).
6. Overlaps: the intro toast and round banner must not cover the keep cards or the board.
7. Gate hygiene: record perch-and-plume visual baselines (owner approval) so `--quick` can pass; add `menu` to the LAB rows.

## Review notes

Solo check (run from games-src/perch-and-plume): newGame with seats `[{kind:'human'}, {kind:'automa', lvl}]`, seeds 300-359; seat 0 plays `AI.choose(G,0,'normal')` ("best") or that half the time and a random legal move otherwise ("mixed"); the Flock plays `validMoves(G,1)[0]`.
Results: Easy Flock vs best 22/60 (60.0 vs 63.3), vs mixed 7/60; Normal vs best 12/60, vs mixed 1/60; Hard vs best 1/60, vs mixed 1/60.
