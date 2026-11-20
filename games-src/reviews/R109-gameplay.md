# R109 strict gameplay review: kaiten-kitchen

- Commit reviewed: `78de407c40cc3afc377e5890ce6b772513a249be` (origin/shelf/W581-kaiten-strict, F6 merge with F5 head)
- Date: 20 Nov 2026 (UTC). Reviewer plays only and changes no game code.
- Video: `games-src/reviews/R109-first-3-min-375x667.webm` (152 s: the whole 19-step tutorial, then a full real game by touch at 375x667)

## Verdict: FAIL, average 7.1 (rows 4 and 5 are below 7)

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 8 |
| 4 | Turn clarity | 6 |
| 5 | Phone play (PC is scored here too) | 6 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 7 |
| 8 | Bugs | 8 |

Average 57/8 = **7.1**. No stoppers: 0 page errors, 0 stuck states, 0 dead taps over 7 full games.

## Gates (one run each, alone in the foreground)
- `--quick`: PASS. Own checks 9/9 ok. WARN universal: the "Fast" button (`button.btn.alt`) is covered by `div.gxh-tx`.
- `--full`: PASS. Phone-check ran, and so did the sweep (`SWEEP CLEAN`: 3 rounds, 27 turns, 0 bulbs). Lab: WARN 9/12. The LAB rows list (kk-board, kk-zoom, story-scene, kk-help, kk-uibar, kk-uibar-start, kk-art) does not match the scenarios list, which also has `menu`. games/lab.html was rewritten by the run and is not committed.
- Engine tests: `logic-test.js` passes 81/81 rules and `rules-test.js` passes 90/90.
- `calm-audit.js`: loops=0, maxHelpers=1. In the real tutorial I still saw 2 helpers at once (see Clutter).

## Rules vs the original (engine and every player-facing text)
The engine matches the original. That covers the 108-card deck, hand sizes 10/9/8/7, passing left in all 3 rounds, and the 6/3 roll race with its tie rules. It also covers Fire Paste on the oldest paste, Twin Sticks only on a later turn (they go back into the hand), the custard +6/−6 with no penalty for 2 diners, and the custard tie-break. Final tables add up in all 7 games I checked by hand, including a custard tie for most (+3/+3/−6) and a tie for fewest (−3/−3).

Text mismatches or incomplete texts:
1. `games-src/kaiten/game/src/ui10.js:45`, bulb reason "Every Steam Bun scores more than the last." This is false from the 6th bun on: it adds 0, and five or more score 15.
2. `games-src/kaiten/game/src/ui1.js:154` "Each extra bun is worth more: now X after, then Y." Same problem: from 5 buns on it reads "now 15 after, then 15".
3. `games-src/kaiten/game/src/ui10.js:50`, bulb reason "Custard Cups pay at the end: most scores 6." It leaves out that the fewest lose 6 with 3 or more diners, which is the main reason to take custard in the default 3-diner game.
4. `games-src/kaiten/game/src/ui10.js` GOAL (around line 90) "Custard counts at the end: most cups wins 6." Same omission of the −6. The "How you win" card is the first rules text a Quick-game player sees.
5. `games-src/kaiten/game/src/ui10.js:51`, bulb wording "+3 now, next best +6". The bulb can recommend a dish that gives fewer points now than the alternative it names (seen twice at round 3, turns 1 and 2, "Moon Nigiri scores: +3 now, next best +6"). The game rule is fine, but the advice text contradicts itself.

All other texts agree with the notes. I checked data.js:10-21, ui5.js (rules book), ui2.js:197, ui10.js:13-26, ui1.js:149-159, ui11.js:79-94 and story.js:37-50.

## First-timer play (touch)
- 375x667: tutorial in 52 s, all 19 steps one line each. It ends "You won 34 to 11". Then a real game on the default level, following the bulb: Odile won 54-45-34 (game took 89 s; rival wait averaged 1.8 s, longest 5.8 s).
- 375x553: two full Quick games, both won by following the bulb, 50-31-34 and 50-30-39.
- Whose turn: clear. A green "YOUR TURN · Tap a dish for the dashed slot" bar shows, and rival picks are captioned ("KOFI'S DISH · Kofi serves Sun Nigiri. +1"). "Leftovers go to Odile" plus the Odile/Kofi chips show where the hand goes.
- Seeing what a choice gives: every card shows a badge ("+5", "1st +6", "end +6", "need 2", "top 4", "×3"). The badges are dense and never explained on the board. The cold player also flagged "need 2", "behind", "tied 1st +3", "grab 2" and "dessert".
- Hint balance (bench, 3 diners against 2 Easy chefs, the default): following the bulb wins 79.8% of 400 games. A sensible newcomer (normal chef with 25% slips) wins 57%. Random-ish play (50-65% slips) wins 26-33%. **A player who takes the biggest green +N badge wins only 6.3%.** The badges a newcomer is most likely to follow steer them to lose, while the bulb overshoots "about half". In my 7 hint-following games I won 5.

## Clutter
- calm-audit reports 0 infinite loops and at most 1 helper, including 15-20 s after the bulb.
- Real tutorial at 375x667, step 3 ("Flip and pass"): the bubble and a dark first-time tip "Need 1: one more scores this set." are on screen together. That makes **2 helpers**, and the tip covers the Sunset Nigiri and Custard Cup names in the hand. Step 8 ("Use the sticks") also shows the bubble plus the tip "Grab 2: tap this, then two dishes." (2 helpers).
- 1366x768, turn 2: the tip "Need 1: one more scores this set." sits over the Steam Bun and Custard Cup labels.

## PC (mouse, one full game each)
- 910x512: win 55-38-36. The game uses the width (tables, side panel and hand fit), and nothing scrolls. Text below 12 px: the "Your turn" panel heading is 9.8 px and the final table's "Where the points came from" is 11.8 px. The setup chips (Invite, At the table, easy, easy+, normal, hard) are 34 px tall, which is fine with a mouse.
- 1366x768: loss 39-46-32. 1920x1080: win 54-38-41. In both, "winner" and "Where the points came from" on the final table are 11.8-11.9 px. The tables are large with small dishes, and the side-panel player boxes are mostly empty.
- No dead clicks.

## Phone
- Taps are all ≥ 44 px and text is ≥ 11 px (scale-corrected) at 375x667 and 375x553, with no page scroll.
- **Still open: a cream panel covers the lower half during the reveal**, at 375x667 (about 200 ms after the pick) and at 375x553 (about 1.4 s). The hand vanishes behind an empty cream belt texture while the reveal cards cover the tables, so for that moment there is no board at all. The cold player called it "brief but jarring".
- 375x553 final screen: the box scrolls (`rsbox` 485/419). The Buns and Nigiri rows of "Where the points came from" sit under Play again / Menu, and the score sheet only fits after scrolling.
- The top-left label reads "Scoring 3/3" on the final screen, and "Scoring 1/1" behind the tutorial end card.

## Cold play (independent agent, no history, touch, 375x667, tutorial + one full game). Quoted as-is:
> COULD PLAY: yes. The 19-step tutorial is clear and one tap per step. A real 3-diner, 3-round game (Odile and Kofi) ran to the final screen with no stalls or errors.
> FUN: Mostly yes. The art is lovely, the hint lightbulb is genuinely helpful, and the end-sheet breakdown is satisfying. But mid-game turns blur together and I rarely felt a real choice beyond following the hint.
> PLAY AGAIN: yes
> RESULT: Kofi won with 40. Odile 38, me 37 (rounds 13/10/8; custard +6 for me, -6 for Kofi). I lost by 3 while following the hints.
> CONFUSED BY: Tutorial step 8: tapping Twin Sticks needed a second tap on the sticks, and then two dishes. / The "tap 2 dishes" empty slot looks unchanged after the first pick, so it's unclear it registered. / Tutorial step 3: "Flip and pass" covers the hand, and the hand layout shifts every turn (1 or 2 rows), so the tap target moves. / Hint bubble toggles on each lightbulb tap, and its text sometimes comes back blank on later turns. / Hint says "Nobody sees your pick" but gives no sense of what the opponents hold. / Terms like "need 2", "behind", "tied 1st +3", "grab 2" and "dessert" are never defined on the board. / "Scoring 3/3" label at the top during the final screen. / Starting a "Quick game" shows a setup panel first. "Learn in 5 minutes" is offered again there. / An unprompted "How you win" popup appears at the first turn.
> BROKEN: During the reveal, the bottom half of the screen goes blank cream with the hand hidden. It is brief but jarring. / The hint bubble covers the opponents' and my own table rows. Tooltips in the tutorial also cover tray headers. / My first scripted taps near the card strip did nothing when I guessed coordinates. They only worked on the card itself, because the row position changes. / Nothing stuck and no text clipping on the end screen.

The cold verdict is playable, fun "mostly", and would play again. It is not a clean "fun" verdict ("rarely felt a real choice beyond following the hint"), so the PASS bar is not met on that line either.

## Rows under 7, with repro steps
**Row 4, Turn clarity (6)**
1. Quick game, then Start the meal. On any turn, read the card badges: "need 2", "1st +6", "tied 1st +3", "end +6", "top 4", "behind", "grab 2" and "dessert" have no legend on the board.
2. Tap the bulb on round 3, turn 1. It reads "Moon Nigiri scores: +3 now, next best +6", recommending the smaller number with no reason given.
3. Take the biggest green +N every turn. The bench shows that wins 6% against two Easy chefs, so the most visible "what it gives" cue misleads.

**Row 5, Phone and PC (6)**
1. 375x667 or 375x553, Quick game, pick any dish. For about 0.2-1.4 s the lower half is a blank cream panel and the hand is hidden (screenshots m553/rev-1400, d667/rev-200).
2. Tutorial, step 3 at 375x667: the bubble and the "Need 1" tip both show, and the tip covers the hand labels.
3. 375x553, finish a game: the Buns and Nigiri rows of the final table are hidden under Play again / Menu until you scroll.
4. 910x512 with a mouse: the "Your turn" panel heading is 9.8 px (below 12). On all PC sizes, "Where the points came from" and "winner" are 11.8 px.

## Prioritized fix list
1. Remove the cream panel during the reveal at phone sizes: keep the hand, or at least the board, visible while the cards flip.
2. Make the green +N badges honest for newcomers, or add a one-line legend on long-press. The cards should also show the bulb's real value, not only points right now. Fix the bulb text so it never says "next best" with a bigger number than the dish it recommends.
3. Show one helper at a time: hold the first-time tips while a tutorial bubble is up, and move tips off the hand labels (phone and 1366).
4. Fix the texts: buns "more, up to five (15)", and add "fewest loses 6" to the bulb custard line and the Goal card.
5. Fit the final table at 375x553 without scrolling, and bring the PC text to at least 12 px ("Your turn" heading at 910x512, "Where the points came from", "winner").
6. Make the choices feel like choices (cold player): for example, show what each rival is collecting ("Odile needs 1 prawn") so denying a dish becomes a visible decision.
7. Minor: "Scoring 3/3" or "Scoring 1/1" labels on end screens; the "Fast" button is covered by `div.gxh-tx` (quick gate WARN); the lab rows do not match the scenarios list.
