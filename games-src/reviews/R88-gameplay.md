# R88 strict gameplay review: sands-of-qamar

**Verdict: FAIL (average 6.4; rows 1, 4, 5 and 6 are under 7; no stopper).**
Commit reviewed: `f3c8282a` on alex/brave-carson-rbpmlk (it includes cb812c16, the shell calm pass). Reviewer only: no game code was changed.

## Gates (run alone, 2 runs each)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick --out /tmp/x sands-of-qamar` | PASS | PASS |
| `build-all.py --full --out /tmp/x sands-of-qamar` | PASS | PASS |

Note for the orchestrator: the brief's `VIS_sands-of-qamarS=","` is not a valid shell variable name, so bash fails with "command not found" (exit 127). The intended `VIS_SLUGS=","` was used. With no visual baseline for this game, `VIS_SLUGS` unset makes the title scenario fail on "snapshot doesn't exist". `--full` rewrote games/lab.html; it was restored and is not committed.

## What I played (touch only, 375x667 and 375x553)
| Run | Size | How the newcomer tapped | Result | Rounds / time |
|---|---|---|---|---|
| Guided tutorial | 375x667 | only the highlighted target, 53 taps | finished; 0 errors, 0 dead taps | 1.0 min (bot speed) |
| Guided tutorial | 375x553 | same | finished; 0 errors, 0 dead taps | 1.0 min |
| Game 1 | 375x667 | hint 50%, otherwise any glowing or visible option | **lost** 142-233 vs easy | 10 rounds |
| Game 2 | 375x553 | hint 50% | **lost** 147-187 | 9 rounds |
| Game 3 | 375x667 | hint 30% | **lost** 133-191 | 8 rounds |
| Game 4 (control) | 375x667 | hint 100% | won 205-159 | 8 rounds |

Every game is 2 players against the default rival (easy) and reached the result screen. Across all runs: 0 page errors, 0 console errors, 0 stuck states and 0 taps with no effect. Twice the tile a step wanted was covered by the colour chooser (`.chb`) (Game 1 and Game 3).

## Clutter (sampled every second through every run, including 15 s after Hints)
- **Infinite animations: not 0.** Up to 20 looping elements at once in the tutorial and 11 in play. These loops run all game, and also in the 15 s after the Hints tap:
  - `glowt` (board.css:47, every glowing tile)
  - `glowb` (board.css:64)
  - `bob` (board.css:55, the lifted people `.mp.h`)
  - `gdpulse` (board.css:392, the tutorial highlight)
  - `#finger.go` fgtap/fgring (board.css:92), when shown
  - the summon lamp `smTurn` (skin.css:57), when shown

  The brief lists glowb and gdpulse as known loops; glowt and bob are extra.
- **Helpers: more than 1.** In play:
  - The `+N` gain badge sits on every tile, together with the `#gainkey` legend ("+N on a tile = points that walk can score · ★ = best", score.js:45). That is 2 helpers.
  - The instruction banner ("Tap a glowing tile to lift people") shows at the same time.
  - In the tutorial, the coach bubble, the banner, the gain legend and the badges are all on screen together (shot `tut-lift`). That is 3 or more helpers.
- **Glows.** Up to 18 elements glow at once in normal play: every legal start tile pulses.

## Rules vs the original (engine and every player-facing text)
The engine matches the published base game on every point checked:
- end of the game at the end of the round in which the last camel is placed, and the no-legal-move end
- 12 palms and 10 palaces
- the bid track, ties at 0, the limit of 3 markers on 0, and next round's order
- Masons (Masons + Mystics) x blue tiles in the 3x3
- Shadow range by Manhattan distance, plus 1 per Mystic, and the kill of a rival's kept Advisor or Sage
- Shrine, Stall and Grand Bazaar prices, and the goods table
- final scoring and the tile mix

Text mismatches:

| Sev | File:line | Says | Should say |
|---|---|---|---|
| major | ft/src/coach.js:77 | Tutorial final count: "3 points per palm on a tile you hold" and `a.palms/3`. | The rival holds Nakhla (guide.js:46), so his palm scores 5. The shown row (Farid Palms 5) contradicts the caption on every learner's last screen. Use each player's real palm value. |
| major | ft/src/coach.js:78 | "Sages: 2 points each." | The rival holds Hikma (guide.js:25), so his Sages score 4 each. Caption and number disagree. |
| minor | ft/src/hlp.js:62 | "Each Mason earns 1 coin per blue tile within one step." | It is the 3x3 around the landing tile, diagonals and the tile itself included. |
| minor | ft/src/lore.js:62-63, hlp.js:77 | Grand Bazaar "two goods for 6 coins". | "2 of the first 6 cards". |
| minor | ft/src/lore.js:64 | "Shrine: pay 2 Sages". | "or 1 Sage + 1 Mystic". |
| minor | ft/src/lore.js:77 | "No legal move? You pass." (coachLater) | No legal move ends the game after the round, with powers only. |
| minor | ft/src/lore.js:9-28 | Old tutorial lines: "5-coin spot", "Farid, you, Farid, you". | Dead text that contradicts the guide; delete it. |
| minor | ft/src/lore.js:31, :75; ui3.js:89; tutdata.js:11 | "The last camel ends the game". | "...at the end of that round" (rules-html.js:39 and guide.js:54 already say this). |
| minor | ft/src/djinns.js:5, :13, :15 | Tamuz: fill "an empty tile" (3 people). Ghulam: also hits 2 kept people. Sirra: "keep what they take" (what exactly). | Make the card text complete. |
| minor | ft/src/engine.js:71, :76 | The no-move check runs per player, and the round-end check ends the game with no bid phase. | Rare edge cases. |
| doc | games-src/rules-check/sands-of-qamar.md "Fixed (W391)" | Says the game ends at the end of the turn, with 22 palms. | Stale. The engine is right (end of round, 12 palms). |

The tutorial gives each player 3 camels so that it ends in 2 rounds. That is fine for a lesson, but it is never said.

## Scores (GAMEPLAY-RUBRIC, 8 rows)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | The engine is clean, but the tutorial's final count shows wrong captions for the rival's palms and Sages. Several help and card lines are inexact (Masons, Grand Bazaar, Shrine). |
| 2 | Tutorial teaches | 7 | 41 one-line steps, one highlighted tap each, every core rule in order, then a real game. Weak points: the count pages contradict themselves; the Mason Mystic bonus and the Grand Bazaar are only shown, never done; 3 camels are never explained. |
| 3 | First 10 seconds | 7 | Clear title with the goal line, a big "New here? Learn by playing" button, and a banner telling you what to tap. The lamp art overlaps the "QAMAR" heading. |
| 4 | Turn clarity | **6** | At 375x553 the phase strip (Bid/Move/Take/Sell) and all tile names disappear. The rival chip turns into a truncated marquee ("Teal scores 10 pts: earn..."), and your own chip is briefly replaced by "You lose 3 pts: spent 3 coins". The meeple counts are tiny digits in coloured dots. The +N badges on every tile need a legend. |
| 5 | Phone play | **5** | Board tiles are 58x40 at 553 and 58x43 at 667, under 44 px tall. Smallest text is 13 px (rubric wants 14). At 553 the goods row runs off the right edge (`button.mcard` at x 381-425). On the result screen at 553, Play again / View the board cover the Palaces, Goods and Total rows. The first rows of the bid track sit flush with the bottom edge. |
| 6 | AI and pacing | **5** | The rival is brisk and sensible, and a game is 8-10 rounds. But a newcomer who follows the hint half the time lost all 3 games to the default (easy) rival, by 40-91 points. Only a player who taps the hint on every move won. "A newcomer can win" is not met. |
| 7 | Feel | 7 | Every action gets point pops, a coach voice, glowing targets and a summon scene. The loops above make it busy rather than lively. |
| 8 | Bugs | 8 | 6 runs to the end with 0 errors, 0 stuck states and 0 dead taps; all gates pass. The chooser covered the target tile 2 times. |

**Average 6.4: FAIL.**

## Repro steps for rows under 7
- **Row 1:** Learn by playing → tap the highlighted target through all 41 steps → the count pages at the end. Page 1 shows "Palms: You 0, Farid 5" under "3 points per palm".
- **Row 4:** Run at 375x553, Play vs computer, and look at your first move. The phase strip and tile names are gone. After a rival scores, its chip reads "Teal scores 10 pts: earn..." (shot `game-375x553-s22-03-turn-move.png`).
- **Row 5:** At 375x553, play a full game and lose. Then:
  - On the result screen, the buttons sit over the bottom table rows (shot `-08-result.png`).
  - During the game, the goods row's last card is cut at the right edge.
  - Tile boxes measure 58x40.
- **Row 6:** Play vs computer at the defaults (2 players, easy rival) and take the hinted move only about half the time. You lose. Three seeds (11, 22, 33) all lost by 40 or more.

Shots and play script: reviewer scratchpad (not committed); file names are quoted above.

## Fix list (priority order)
1. **Newcomer win rate (row 6).** Make the easy rival beatable without following the hint on every move:
   - raise `LVL.easy.loose` and `ease` (ai.js:4), or stop easy taking the dearest bid spots
   - re-tune so that a 50%-hint bot wins at least 1 in 2 over 20 seeds
2. **Phone layout at 375x553 (row 5).**
   - Tiles at least 44 px tall, or a bigger hit area around each tile.
   - Keep the goods row inside the screen, or make it wrap.
   - On the result screen, reserve room for the buttons so the score table never sits under them.
   - Raise the smallest text to 14 px.
3. **Clutter.**
   - Make glowt, glowb, bob and gdpulse play 2-3 times and then stop, or keep them static. Nothing infinite.
   - Show either the +N tile badges and their legend, or the banner, never all of them with the coach bubble. Hide the badges unless Hints is on.
   - Light 1 suggested tile instead of all 18 legal tiles. The other legal tiles can stay tappable without a glow.
4. **Turn clarity at 553.**
   - Keep a compact phase strip.
   - Keep the rival chip's coins and camels visible, with score news in its own line or toast.
   - Show the tile type as an icon when the name is dropped.
5. **Tutorial count text (row 1).** coach.js:77-78 should print each player's real per-piece value (Nakhla 5 per palm, Hikma 4 per Sage) or say "with Farid's djinn".
6. **Help and card text.**
   - hlp.js:62 (the 3x3 incl. diagonals)
   - lore.js:62-64 and hlp.js:77 (first 6; or 1 Sage + 1 Mystic)
   - lore.js:31, :75 and ui3.js:89 ("at the end of that round")
   - lore.js:77 ("You pass" is wrong)
   - delete the dead lore.js:9-28 lines
   - complete the Tamuz, Ghulam and Sirra texts
7. **Small items.**
   - Have the colour chooser (`.chb`) avoid covering the tile it is asking about.
   - Fix the title lamp art overlapping the heading.
   - Add a separator after "Hadiya" on the count pages ("Hadiya The game is over").
   - Say in the tutorial that it uses 3 camels.
   - Update the stale "Fixed (W391)" notes in rules-check/sands-of-qamar.md.
