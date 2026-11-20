# R106 strict gameplay review: perch-and-plume

- Reviewed: `origin/shelf/W583-perch-strict` at **7b2a4b2b2dfdf474c99c93a54b89b916cd67b598** (the last commit is the bonus chip on one line on phones).
- Reviewer: R106. Date: 20 Nov 2026, 18:55-20:05 UTC.
- **Verdict: FAIL, 4.0 (capped).** Uncapped average is 6.1. Rows 2, 4, 5 and 8 are under 7. Row 8 has a likely stopper: random-touch play gets stuck on dead glowing targets at 375x667.

## Gates
| gate | result |
|---|---|
| `build-all.py --quick perch-and-plume` | PASS, 9/9 scenarios (one run) |
| `build-all.py --full perch-and-plume` | PASS: phone-check, rules-test 240/240 (avg 59.3), lab WARN 3/8 (LAB rows differ from the scenario list). One run. `games/lab.html` was reverted, not committed |
| `node smoke.js <served>` x2 | **FAIL both runs, same step:** phone "reached the result screen" fails, errors 0. The PC half passes. A copy that only adds a screenshot and a state dump passed once, so this is timing-flaky and fails 2 of 3 |
| `tests/calm-check.js` 375x667 and 375x553 | PASS: tutorial 25/25 steps by real taps, maxHelpers 1, loops 0, errors 0 |
| `tests/phone-sizes.js` | FAIL, text only: "points now" and "★ 3" are 13 px. The test wants 14 px; the brief's bar of 11 px is met. Every tap target is 44 px or more |
| `tests/touch-game.js` BEST=0 DEFAULTS=1 (random newcomer taps), 5 games | 375x553: reached the result, 10 dead taps. 375x667: **stuck in 4 of 4 runs** (13 dead taps in a row, no result) |
| Own-strategy full games (my rule, not "Best"), 5 games | All 5 reached the result with 0 errors. 375x667 Easy: lost 37-54. 375x553 Easy: lost 50-59. 1366x768 mouse Easy: won 60-54. 910x512 mouse Easy: won 55-48. 1920x1080 mouse Normal: lost 41-69. About 4.5 min and 80-98 taps per game. 1 dead tap in total |
| Infinite animations | 0, including 15 s after the bulb (calm-check plus my own check). The bulb bubble stays up after 15 s |
| Helpers on screen | 1 in calm-check. 2 in my play: the bulb bubble and the Best badge, which point at **different** moves (below). The rival banner and a toast also show at the same time |

## Rules vs the original (engine and every player-facing text)
The core engine matches. A static audit plus the rules-test found no stopper or major rule mismatch. These match:
- cubes 8/7/6/5
- egg cost by column 0/1/1/2/2
- any-2-for-1 food
- feeder reroll when it is empty or all one face
- tray refill
- goal scoring 4/1/0 up to 7/4/3
- brown powers right to left, white when played, pink once between turns
- end scoring and the food tiebreak
- row yields and trades

Rotating the first player each round (engine.js:196) is correct: the start marker passes each round.

Mismatches and wrong text:
1. story.js `STORY.coach.turns` (tutorial step 2) says "One action per turn: 8, then 7, 6, 5. Tap this bar." The bar it points at says "Round 1 of 1 · 4 actions left" (tutor.js:53 `rounds:1, cubes:[4]`, turnui.js:157). Both are seen at once, so the screen contradicts itself. Fix: "In a real game: 8, then 7, 6, 5 actions. This lesson is one short round."
2. turnui.js:211-217: the move rating says "Poor: 0 points. X was worth more" for food or draw moves that set up a play. The "food now lets you play birds" exception is only on the "good" grade (turnui.js:218). The cold tester got "Poor: 0 points" on the first turn of the real game after the tutorial.
3. flow.js:165/203: "Your forest birds use their powers, right to left" is set as a toast and as `#prompt` caption. gameOver (screens.js ~89) clears the toast only after 700 ms and never clears `UI.cap`, so the line can be stale at game over. I did not see it in 5 games, but the code path is there.
4. screens.js ~157 (Goals drawer) says goals "never repeat a family". engine.js:42 exempts the nest family, so two nest goals can appear: R2 "Bowl nests with an egg" and R4 "Ground nests with an egg" did appear in my 1366 game.
5. The habitat names on the cards don't match the coach text. The starting-hand card tags say **Meadow** while the tutorial, goals and prompts say **grassland**. A first-timer can't tell they are the same row.
6. screens.js ~108: the result note "Ties go to the most food left over" omits the solo rival's food rule. Minor.
7. The result screen has no goal-by-goal breakdown. The table has one "Goals" total (screens.js ~103), and per-round results are only in the Goals drawer.
8. The goal tracker count (turnui.js:165, engine.js:164-174) is correct. The earlier "Fern 0 while Fern had eggs" happens when the eggs are not on the goal's nest or row, or for "Full egg sets". Nothing on screen explains this; add "(eggs on ground nests only)" style wording.
9. Feeder reroll (engine.js:491/557) is offered again after each die taken. In the original it is only before taking. Minor, unconfirmed.

**Own-content judgement: our own design.** gen-data.py builds the 120 birds procedurally from 40 generic types × 3 with adjective prefixes (Copper Warbler, Hollow Hawk, Opal Kestrel and so on). There are no real species names and no stat-and-power pattern copied from a specific card. 22 cards were sampled; there is 1 duplicate stat tuple.
The structure match is fine. Two power sentences are near-verbatim though:
- the predator "wings under N cm: tuck, else discard"
- the "roll the dice not in the feeder, cache on a hit"

The terms tuck, cache, birdfeeder and tray, and the brown/white/pink colours, are also the original's. A plain-wording pass is recommended, but it does not block.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | The engine is faithful. Player text contradicts the screen in a few places (items 1, 4, 5 above) |
| 2 | Tutorial teaches | 6 | "Learn in 5 minutes" is **25 steps**. Wrong taps on step 4 are still silent. The cold tester's taps on "Tap this bar" and "Tap here" did nothing; only Next advanced. Step 8 shows the coach box and a yellow toast together. The tutorial game ends 17-2, which is no test |
| 3 | First 10 seconds | 7 | The goal line is on the starting-hand screen, the four big action cards glow, and costs show in "Play: (icons)" before you commit |
| 4 | Turn clarity | 6 | The **bulb and the Best badge disagree**: the bulb says "Play Pine Teal" while Best sits on "Draw birds" (screenshot below). A false "Fern played · Passed" popup shows at game start before Fern has acted (log: Fern cubes 8). Three messages stack at the start of a turn ("Round 1: 8 actions…" banner, "Your turn" banner, "Your turn is starting" toast). "Poor: 0 points" on setup moves |
| 5 | Phone + PC play | 6 | Phone: text 13 px or more and taps 44 px or more pass. At **375x553**: the Round/actions tracker is hidden under the dock on my turn; hand cards are half off screen; "Start the year" overlaps the "Who starts" row; the starting-hand title is covered by the intro line; the end-turn button ⇥ overlaps the "Get food" card while the rival summary is up. PC: 1366x768, 1920x1080 and 910x512 by mouse all use the width with a 3-column layout, text 12 px or more, no cut labels found, 0 dead clicks. The dock body still scrolls 60 px at 1366x768, and the hand sits at the bottom edge |
| 6 | AI and pacing | 7 | Easy is beatable about half the time: me 2 of 4, cold tester 1 of 2 (lost 60-63 on phone, won 72-62 on PC). A game takes about 4.5 min. Rival turns wait up to 8 s (mean 3.7 s), which the cold tester said "saps momentum" |
| 7 | Feel | 7 | Powers fire bird by bird with pops, and the art and table look good. The cold tester said "choosing between birds, eggs and food has real weight" |
| 8 | Bugs | 3 | **Stopper (PLAUSIBLE):** `touch-game.js` with random glowing-target taps got stuck in 4 of 4 runs at 375x667, with 13 dead taps in a row on legal, glowing targets, including the Best one. States: draw step (tray card, Best tray card), pending play ("Play:" button and slot), wetland trade ("tap a bird with an egg"), feeder die. smoke.js phone fails 2 of 3 |

Uncapped average: (7+6+7+6+6+7+7+3)/8 = **6.1**. With the stopper the cap is **4.0**. **FAIL**: rows 2, 4, 5 and 8 are under 7.

### Repro: row 8 stuck state
1. Serve a build: `build-all.py --quick --out /tmp/x perch-and-plume`, then `python3 -m http.server 8765` in /tmp/x, with `media/` symlinked from games/perch-and-plume.
2. Run `SIZES=375x667 BEST=0 DEFAULTS=1 node tests/touch-game.js http://127.0.0.1:8765/perch-and-plume/ 3`.
3. It prints "stuck on dead taps". One dump (my debug copy of the test):
   - `q:"draw", mine:true, busy:false, pop:false`, legal `[tray 0,1,2, deck]`
   - the tapped `.bc.mini[data-a=tray][data-i=0][data-legal]` is the top element at its centre, yet 13 taps change nothing
   - another dump: `pend:{i:1,h:0}`, prompt "Tap Play to put Slate Jay in your forest", and "Play:" is dead. The hint wants hand i:4, and the shown card's cost (seed+berry) is not in the supply, so the pending index looks stale against the hand
4. Suspects:
   - `UI.pend`/`UI.sel` indexes going stale after the hand changes
   - the F2 tap filters in flow.js:16 (`UI.qT` 250 ms) and flow.js:24 (`UI.rvGone` 700 ms) swallowing taps when the prompt key keeps changing
   - the busy-queue path in flow.js:18-22

   The fixer must first confirm it is not a test artifact by doing the same taps by hand. If it is a test artifact, row 8 is a 6 (smoke flake plus the false "Fern passed" popup) and the cap goes away. Rows 2, 4 and 5 still fail.

### Repro: other rows under 7
- Row 4, bulb vs Best: Quick game, Easy, keep, wait for your turn, tap "What should I do?". The bubble names a bird to play while the Best badge is on Draw birds (`bulb1.png`, still up after 15 s in `bulb2.png`).
- Row 4, false popup: Quick game, Easy, "Who starts: You", Keep these. The "Fern played · Passed · 0 points" popup appears over the feeder before your first turn.
- Row 5: 375x553, Quick game. See the start-screen overlap, then on your turn the tracker is hidden and the ⇥ button sits over "Get food".
- Row 2: New here?. At step 4 tap "Get food" or a board bird: nothing happens, no message. Step 2 reads "8, then 7, 6, 5" next to "Round 1 of 1 · 4 actions left".

## Cold play (independent tester, no history, touch 375x667 plus mouse 1366x768), quoted as-is
> Could you play it: yes, both games, start to result screen. Mobile was harder because of the small tap targets and the lack of an obvious next step in places, but I was never fully stuck.
> Fun: 3.5 out of 5. Rounds are quick and choosing between birds, eggs and food has real weight. On the PC the lack of an obvious next action in some states and the long AI-turn waits sap momentum.
> Play again: yes. The bonus card and the round goals gave me small plans to chase.
> Confusions: the tutorial's "Tap this bar" and "Tap here" steps said to tap a spot, but only "Next" advanced, and taps on the bar and the goal did nothing. Step 18 (lay eggs): taps at x=125 and x=173 did nothing for several tries, so I used "Lay all", which worked. Tapping a hand card only opens a read-only card popup; I expected it to select the bird, but you have to press "Play a bird" first. The feeder is dim until you choose Get food, and at first I didn't know the dice were the food. On Fern's turn a popup covers the top of the board and must be dismissed, and a faded "Fern's turn, tap to skip" overlay sits on the board. On phone the screen scrolls and the action buttons are low; on some screens they are hidden until you scroll. "Not allowed: no such die" appeared when I tapped where I thought a die was, because the dice shift after each pick. Step 25 ended in a game with "Poor: 0 points" at the start, which is harsh for a first turn.
> Results: phone (Easy) lost 60-63 (Birds 20 vs 28, Goals 16 vs 13, Eggs 21 vs 11, Fern 9 tucked vs 0). PC won 72-62. The tutorial ended 17-2.
> Broken: nothing broken. The Fern's-turn popup sits over the feeder and the status text, and the food and bird icons on phone are tiny.

The verdict is that it was playable and "3.5/5, would play again". That is middling, not the owner's "enjoying it" bar. Video: `games-src/reviews/R106-first-3-min-375x667.webm` (first 180 s).

## Prioritized fix list
1. **Row 8 dead-tap stuck state** (above): reproduce by hand, then fix the stale `UI.pend`/`UI.sel` index or the over-eager F2 tap filters. Make smoke.js phone pass 5 of 5.
2. **One voice for hints:** the bulb bubble and the Best badge must name the same move (hintMove vs the `.bestb` source). Show only one of them at a time.
3. Remove the false "Fern played · Passed" popup at game start, and stack at most one message at turn start (drop the "Your turn is starting" toast or the banner).
4. Tutorial:
   - cut 25 steps to about 12, or say "about 3 minutes"
   - make "Tap this bar" / "Tap here" taps advance
   - a wrong tap gives a one-line nudge ("Tap the glowing Play a bird")
   - fix the step 2 "8,7,6,5" line
   - make the step 18 egg target obvious
5. 375x553 layout:
   - keep the Round/actions tracker visible on your turn
   - the ⇥ button must not overlap the action cards
   - fix the overlaps on the Quick-game and starting-hand screens
6. Text:
   - one habitat name (Meadow or grassland, everywhere)
   - make the "Poor" rating credit setup moves
   - clear the toast and caption at game over
   - correct the goals "never repeat a family" claim
   - add a per-round goal breakdown to the result table
   - explain the goal tracker's counting rule
7. Pacing: shorten rival turns (mean 3.7 s, up to 8 s) or make the default rival speed fast.
8. Plain-word rewrite of the two near-verbatim power sentences (predator tuck, dice cache).

Screens (reviewer scratch, not committed): bulb1.png and bulb2.png (bulb vs Best), q03.png (false Fern popup), q01.png and q02.png (553 overlaps), q08.png (⇥ over Get food), pc910-stack.png (3 messages at turn start), t04b.png (silent wrong tap), dead-*.png (stuck states).
