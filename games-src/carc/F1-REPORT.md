# F1 fix report: rampart-and-vine (after R81, 6.1 FAIL)

Branch `shelf/W584-rampart-strict`. Commits 53e9d31c, acca00f8, plus this report and the proof files.

## Gates
- `--quick`: PASS (11/11 scenarios).
- `--full` run 1: PASS. `--full` run 2: PASS. Each ran alone in the foreground. `games/lab.html` was not committed.
- `node carc/logic-test.js`: RULES 71, PASS 71, FAIL 0.
- `tut-walk-test.js 375x667`: PASS. 24 steps in order, every step 12 words or fewer.
- `phone-probe.js` (new) at 375x667 and 375x553, Hints on and off: PASS. Smallest glow 44 px. No glow under the status card. Seats never overflow into the tile count. The action line shows on your turn.
- Quick sweeps with seeds 777, 31, 99 and 4242: SWEEP CLEAN.

## Loops (calm-audit, staged build, 375x667)
`loops=0 maxHelpers=1`, measured on your turn and for 20 s after a bulb tap, and on the guided path. pulse2 (.glow), hpulse (#htile), fpulse (.fglow), pulse (.pvhl) and tapg (#ghost) now each run 3 times, then stop.

## Win rates (novice-bench.js, 40 games each, 2 players, no expansions)
| Novice (pGood) | vs | Novice wins | Average score (novice-computer) |
|---|---|---|---|
| 0.5 | Easy | 60% | 67-63 |
| 0.25 | Easy | 13% | 41-59 |
| 0.5 | Medium (new) | 21% | 59-74 |
| 0.25 | Medium | 0% | 38-84 |
| 0.5 | Normal | 0% | 66-104 |

Before: Easy lost to every novice (83-100% novice wins, computer scoring 29-30). Now Easy uses the Normal reckoning, but it settles for one of its top 6 spots 70% of the time. It never sends a farmer and sometimes keeps a follower back. It closes its own roads and towns and scores 63 against a novice who plays the good move half the time. Medium takes its best spot 55% of the time, otherwise one of its top 4, and it does use farmers. The menu chips now read Easy, Medium, Normal, Hard. The campaign keeps `easy`, so chapter rivals got tougher.

## What changed
1. **Loops:** the five infinite CSS animations are now finite (3 runs).
2. **Rules text, matching the original:**
   - Mason, on the card, the bulb line and the advisor: "when you grow it, take one extra turn. Extra turns never chain."
   - Hog: scores 4 per town only if you win that field.
   - Discard log names the player ("Cobalt draws again"), not "you".
   - Unfinished towns count banners in the coach `last` line, the end-of-game summary and the tutorial `final` step.
   - "How a turn works", "The goal" and "Every turn" now include the priory.
   - New rules cards: Priories; Finished means points (now with banners); Taverns and Basilicas ("still open at the end: 0"); The champion (counts as two); Goods (10 to the most of each). Expansion games swap these cards into the place and fig phases. Each list keeps 2 to 4 cards.
3. **Tutorial:**
   - The turn-5 town tile now carries a banner (tile BA_Ccp at 0,-1, turned 3).
   - You claim the town while it is open ("Claim the open town now. Whoever closes it, you score.").
   - Hob's turn-6 tile closes it (BA_C at -1,-1, turned 1): 3 tiles and 1 banner give you 8.
   - The banner step points at the banner tile.
4. **Phone:**
   - The cell size floor is 44 px, so a glow is always a full finger target.
   - The board fits and centres between the status card and the hand. Glows under the card are culled.
   - If no glow is in view on your turn, the view moves to the nearest one, even after a pan.
   - The rival recap ("Cobalt: town and follower, +4") sits on its own line under the action line instead of replacing it.
   - At 420 px or narrower, the Hints button keeps the short label "Hints" (it is lit when on) and the seat gap is 1 px, so the seats clear the tile count. Both changes look the same with or without the painted skin.
   - The board pans freely, and the "N more" chips stay.
5. **Turn clarity and pacing:** Hints start on for new players (bulb and square tags); the switch remembers the player's choice. The rival waits at most 3 s for score captions to finish (it used to wait about 5 s per caption).
6. **Gates:**
   - The story-scene line fades in from 40% opacity, never from 0, so `story-scene` cannot catch it invisible.
   - sweep.js now follows the calm contract. A bulb suggestion counts as marked by its ring (the finger only when the game asks). Dismiss taps go on the status card, not on the seats, which open the score sheet. The 8-word rule covers the instruction line, and the recap is checked on its own line. The screen-reader live line is skipped by the wordy check. Help-kit clicks are null-safe. The Play tap retries once. A stuck game logs a diagnostic.
   - Found and fixed along the way: expansion rules cards had made the bulb bubble close at once (phase mismatch); fixed with per-game phase remapping.

## New baselines (for the orchestrator to approve; .baselines/ untouched)
`games-src/carc/proof/baselines-new/{phone,tablet,wide}-{title,menu,board}.png`. Same surfaces and masks as `scripts/visual.spec.js` (`carc/game/baseline-shots.js`). They differ from the old set mainly because Hints now start on and the header is tighter.

## Video
`games-src/carc/proof/first-3min-375x667.webm` (`carc/game/record-3min.js`). Touch only: Play, "Learn in 5 minutes", the whole tutorial (to about 95 s), "Play a real game", then 7 of the player's own turns by tapping glows, circles and Skip.

## Cold play (independent subagent, no knowledge of the changes; verdict as-is)
> 1. Could play: yes, though the early screens needed some guessing. I tapped through the menus blind. Then a guided tutorial walked me through a whole short practice game, which I finished (24 to 2) before a "Play a real game" button appeared. After that I played about 11 turns of a real game and stopped before the end.
> The turn loop is clear: the top banner says "Turn, then place on a glow." Tapping a glowing square previews the tile. "Place here" confirms it, and tapping the tile again turns it. Then follower circles appear with labels like "road +2", "town +4" and "farmer", plus a Skip button. Scoring is shown in the banner ("Cobalt +4: finished town, 2 tiles") and as green "+4" and "grows" tags on the glowing squares.
> Confusion points:
> - The rules popup ("Have the most points...") appeared over the board with the Hints button visible but nothing explaining it.
> - The scoring figures when claiming (priory 9, farmer with no number) are shown with no explanation of what they mean.
> - The "N more" off-screen arrows were hard to read.
> - Once the map grew, the board scrolled out of sight and I had to drag or use Recentre.
> - My score stayed at 0 for many turns while the computer was scoring, which felt discouraging.
> 2. Enjoyed it: somewhat. The art is warm and polished, the live "+points" previews are very helpful, and the computer takes quick turns. But the early game is slow (taps, then Place, then follower, then Skip). I didn't get to see the final result of the real game, so I can't say whether the late game pays off. I would try a second game.
> 3. Could play: yes. Enjoyed it: somewhat.

The cold play ran on the build from before the last two fixes (bulb phase, 3 s caption wait). Its points about "N more" chips, the farmer having no number, and the slow early game are still open.

## Not done
- Checklist rule 5 (field geometry in the merchants set) is still the known open item from R81.
- No deploy: the orchestrator approves the baselines first.
