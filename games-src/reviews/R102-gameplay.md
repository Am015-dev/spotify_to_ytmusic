# R102 strict gameplay review: wildmark

Branch reviewed: `origin/shelf/W574-wildmark-strict` at **d6e50a3aa6cfb2c22fb036ef9852cde843ec0696** ("empty parts of the chip rows no longer swallow taps on the valley").
Played on the built file (`build-all.py --quick --out /tmp/x wildmark`) with its `games/wildmark/media` art, touch only, at 375x667 and 375x553.

**Verdict: FAIL. Average 6.8.** Rows 4 (turn clarity) and 5 (phone) are at 6. No stopper. The cold tester says it is playable and "mildly" fun and would play again.

## Gates
| Gate | Run 1 | Run 2 |
|---|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x wildmark` | PASS | PASS |
| `VIS_SLUGS="," build-all.py --full --out /tmp/x wildmark` | PASS (rules-test: hard 83% / easy 0%, 8 games) | PASS (same) |
| `node logic-test.js` | PASS 119/119 | |
| `node scripts/calm-audit.js /tmp/x wildmark` | loops=0 maxHelpers=1 (its own selector set; see Clutter) | |
| `node newplayer-bench.js 60` | greedy bot vs novice 100%, vs easy 100%, vs normal 55% (the default "gentle" level is not in the bench) | |

`--full` rewrote `games/lab.html`. I restored it and did not commit it.

## Bulb check (dead-bulb pattern)
`help.js:20` uses `rulesFor: G.stage || 'pick'`, and `ui.js:463` calls `GXH.phase(null)` on every render in quick/coach mode. So a render while the bulb bubble is up would still close it. In practice nothing re-renders while the player waits, so the bubble stayed up. I tapped the bulb and sampled every 250 ms for 10 s:
- Play game, pick step: 40/40 samples up. Tile step: 40/40. Ghost placed (step 3): 40/40. Turn 2 pick: 40/40.
- Rival turn: the rules card opens and stays 40/40 (no suggestion on a rival turn, which is correct).
- Tutorial, first step: 40/40 up.
**Result: PASS.** Two side issues. In the tutorial the bulb points at a different pair (column 4) than the tutorial step wants (column 1). That puts two helpers on screen with conflicting advice (shot: bulb2-tutorial-start). At step 3 the bubble's arrow points at the empty market slot, not at the ringed hex it recommends.

## Rules vs the original (engine and player text)
The engine matches. logic-test 119/119 covers setup, picks, acorn powers, the 3- and 4-token sweeps, 20 turns, solo, every A-card table, habitats, majority and tie-breaks.
Mismatches and gaps:
1. `games-src/wildmark/src/ui.js:88-94` `autoTok()`. When the animal has exactly one legal tile and the gain is >= 0, the game places it by itself after 650 ms. In the original, placing the animal is always optional. Settling a split tile also blocks its other animals later, so this removes a real choice. 650 ms is not enough time to find and tap Skip.
2. `src/ui.js:502` How to play, Scoring: "3-4 players 3 for first and 1 for second" leaves out the tie rules (two-way tie 2 each, three- or four-way tie 1 each, no second after a tie). The engine has them (R97-R100).
3. `src/tutor.js:63` "Biggest land of a kind beats Bram: plus 2 points" leaves out the 2-player tie (1 each).
4. `src/tutor.js:27` "Touching same land joins up: 1 point per joined tile" does not say that only the largest group per terrain counts. The goal card (score.js) and How to play do say it.
5. Flow, not a rule: the tutorial teaches tile → Place → animal (`tutor.js:16,25,33,42,49,59` "Tap Place"). The real game is the 3-tap turn ("Tap a ringed tile for the X"). The first real turn uses a different step 3 than the one taught.
Everything else checked is correct, including the card texts (data.js:11-15, PV_TABLE score.js:14), acorns, sweeps, ties and solo.

## First-timer play (3 full games by touch + cold play)
I used a "newcomer who follows the hints" bot: it takes the pair with the highest "up to +N", taps the spot with the best chip, then the ringed tile with the best chip. It plays the default **Play** button (rival = gentle). Random-tap games were used only to hunt for stuck states.
| Game | Size | Result | Turns | Notes |
|---|---|---|---|---|
| 1 | 375x667 | **Lost 85-86** | 20 | rival turn 1.85 s avg; 0 dead taps; 0 errors |
| 2 | 375x553 | **Won 93-87** | 20 | 0 dead taps; 0 errors |
| 3 | 375x553 | did not finish: turn 4, the best spot was under the seat chips / off screen (see Phone) | 4 | `k553-stuck0` |
| cold | 375x667 | **Won 93-84** (tutorial + full game) | 20 | quoted below |
So a hint follower wins about half (close games: 49-49 at turn 11 and 79-76 at turn 19 in the cold game). The default level has tension. Easy and Novice are too soft: a greedy bot wins 100%. Not default, but anyone who steps down from the default gets no contest.

## Clutter (sampled every second through full games)
- Infinite animations: **0**, in every sample, including 10-15 s after Hint.
- Helpers: calm-audit counts only bubbles, fingers and rings, and gets 1. Counting everything that explains or announces gives a **max of 4-5 at once**: turn banner, "+N because" chip, score pop, the "+3 Good move / Okay move: Elk column was +3" verdict chip, plus the rival inset caption. Seconds with >1 helper: 90 of 103 (game 1) and 79 of 104 (game 2). The usual stack on a rival turn is banner + because-chip + verdict chip (shot `scan-rival-553`). On your own step 3 it is the bulb bubble + the "+1 Here: river grows" preview chip.
- The turn banner sits over the top bar (Hint / Hints / Scores) for 34-35 s per game (pointer-events off, so no dead taps, but it hides the buttons). This was open in R86 and is still open.

## Phone
- Text: no visible text under 11 px in title, goal, pick, tile, ghost, animal, rival or Scores at 375x553. Taps: no button under 44x44.
- **Clipped:** the step-3 instruction line is cut off at both sizes: "Tap a ringed tile for the Fox (turn the…" and "Tap a glowing tile for the Fox, or Skip…" (`.stept`). That is exactly the line that teaches the 3-tap turn.
- **Hidden best spot at 375x553 (turn 4):** the valley is framed so the "+2" best spot sits under the Bram seat chip, and the left/right spots are off screen with no edge arrow (shot `k553-stuck0`). Tapping the "+2" hits the seat chip and opens Bram's valley.
- **Rival inset over spots:** a tap on a legal spot under the rival inset (`#rinset`) switches the whole view to Bram's valley mid-turn ("Bram's valley: tap You to go back to the turn", shot `d667-stuck0`). You can recover, so it is not a stopper, but it is a trap.
- Cold tester: late in the game the best spot is often off screen and shown only as an "up 4" arrow chip; +1 chips overlap tiles and the zoom buttons.

## Cold play (independent subagent, no history, touch at 375x667, tutorial + full game)
Video of its first 3 minutes: `games-src/reviews/R102-first-3-min-375x667.webm`. Quoted as-is:

> I could play it: tutorial (7 turns), then a full 20-turn game on the default difficulty. Result: I won 93 to 84 vs Bram.
>
> Stuck or confused:
> - The tutorial coach is clear ("Tap the glowing spot"), but near the end it leaves a long stretch of Next taps (s073-s079). It also lets you place a tile with a -4 label showing and says nothing about it (s089).
> - Red negative numbers on a ringed tile (-12, -16, -2) are not explained. I only learned a salmon run must chain, touching at most 2 salmon, by accidentally opening a tile info sheet. The sheet was useful, but I reached it by mistake.
> - Tapping a tile in your hand after already holding one did not swap the pair the way I expected. Twice I took a different pair than I meant (s178, s184).
> - Placing is two or three taps (tile, spot, animal tile, sometimes Place tile). The animal step is easy to miss because the hint text is truncated ("Tap a ringed tile for the Fox (turn the...").
> - When the board grows, the best-scoring spot is often off-screen, shown only as an arrow chip like "up 4". I had to guess or pan (s191, s228).
>
> Turn and choices: I always knew it was my turn. The "up to +N" badges on each pair and the +N chips on the spots told me what a choice would give before I committed.
>
> Opponent: I could mostly follow it. A banner says "Bram places the tile in their valley" and a "Bram's valley" preview appears. But it flashes by in about 2 seconds and half-covers the board, so I only saw what it did from the score changes.
>
> Fun: yes, mildly. The score was close all game (49-49 on turn 11; 79-76 on turn 19), the numbers made each pick a small puzzle, and the art is nice. I'd play again, but the board needs panning late and the opponent's move is hard to read.
>
> Small or hard to hit: the tile and animal icons inside hexes are small, and the +1 chips overlap tiles and the zoom buttons. The score banner partly covers the tiles under it. The Help me and Acorn buttons are small and close together. The zoom buttons sit on top of the board's right edge.
>
> Taps that did nothing: none that I could tell. A tap on a hex sometimes opened the info sheet instead of selecting it.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | Engine 119/119. Auto-settle removes the optional return (ui.js:88-94); three incomplete text summaries. |
| 2 | Tutorial teaches | 7 | Every rule in order, one line + one tap. Teaches the old Place-button flow, not the 3-tap turn; long Next stretch at the end; bulb conflicts with the step. |
| 3 | First 10 seconds | 7 | Clear title, "New here?" and Play; goal card is short enough. |
| 4 | Turn clarity | **6** | You see gains before committing (good). But the step-3 line is clipped, red negative numbers are unexplained, the rival turn is a 1.8 s flash, up to 4-5 helpers stack, and the banner covers the top bar. |
| 5 | Phone play | **6** | Text and tap sizes pass. At 375x553 the best spot hides under the seat chips with no arrow; the rival inset over spots switches the view; the line is clipped. |
| 6 | AI and pacing | 7 | Default level: hint follower 1-1, cold tester won by 9, close all game; rival 1.85 s per turn. Easy/Novice too soft (100% greedy wins). |
| 7 | Feel | 7 | Score pops, lit patterns, nice art, quick turns. Feedback is wordy (chips) rather than physical. |
| 8 | Bugs | 7 | 0 errors, 0 dead taps, no true stuck state in 6 games + cold play. View-switch trap (row 5). |
**Average 6.8. FAIL** (rows 4 and 5 below 7).

### Repro for rows under 7
- Row 4 / clipped line: Play → Start → tap any market tile → tap any glowing spot. The instruction line reads "3/3 Tap a ringed tile for the Salmon (tur…" at 375x667 and 375x553.
- Row 4 / helper stack: finish your turn at 375x553. During Bram's turn the banner sits over Hint/Scores, with a "+2 because forest area +1…" chip and a "+1 · Okay move: Elk column was +3" chip at the same time (`scan-rival-553`).
- Row 4 / red numbers: mid-game (turn 14), pick a salmon whose ringed tiles would make a salmon touch 3 others: "−12" on a ringed tile, with no text saying why (cold s186).
- Row 5 / hidden spot: 375x553, Play, follow the "up to" labels for 3 turns. On turn 4 the "+2" spot sits under the Bram seat chip and the left/right spots are cut off with no arrow (`k553-stuck0`).
- Row 5 / inset trap: 375x667, early turns with the rival inset showing at the top right. Tap a legal spot under it and the view becomes "Bram's valley: tap You to go back to the turn" (`d667-stuck0`).

## Prioritized fix list
1. **One helper at a time.** Queue the banner, because-chip, verdict chip and score pop, or drop the verdict chip during the rival turn. Move the turn banner off the top bar (or make it the instruction line).
2. **Framing at 375x553.** Keep every legal spot inside the safe area below the seat chips (or show an edge arrow for any spot under a chip). Never let the rival inset sit over a legal spot, or make taps through it reach the spot.
3. **Step-3 line never clipped.** Shorten it to "Tap a ringed tile for the Fox" and move "turn the tile first / Skip" to the buttons.
4. **Explain negatives.** A red "−12" chip needs a short reason ("breaks your salmon run: touches 3 salmon"), the same way the "+N because" chip works.
5. **Rules:** stop auto-settling (or wait for a tap and keep Skip one tap away). Add the tie rules to How to play (ui.js:502) and tutor.js:63, and "largest group" to tutor.js:27.
6. **Tutorial:** teach the real 3-tap turn (tap the ringed tile), cut the end-of-tutorial Next run, and hide the bulb (or make it agree with the step) while the tutorial runs.
7. **Rival turn readable:** hold the inset/caption about 3-4 s, or until a tap, and ring the rival's new tile.
8. **Depth/tension below default:** Easy should not lose 100% to a greedy bot. Aim for a greedy-bot win rate of ~70-80% on Easy.
