# [FIXED2 nebula-aces] report

Branch `shelf/W582-nebula-strict`. Code head is dba09b9f (pushed; the base branch was merged and had nothing new). This report is the next commit. Not deployed, no PR. (The scheduled report to the orchestrator was refused, so it is written here.)

## Gates
- `--quick`: PASS (9/9 scenarios), before and after the cold-play fixes.
- `--full`: PASS four times, each run alone in the foreground. Two ran before the cold-play fixes and two after. phone-check and rules-test pass. LAB WARN 9/12 is the existing warn-only LAB row mismatch.
- overlap-375: 22 turns, 0 overlaps. `overlap-375 --dial`: 0 problems at both 375x667 and 390x844.
- games/lab.html restored and not committed. calm-audit and games-src/shell untouched.

## Win rate on Easy
- New first game: an even duel by points. Kael (28) against Varn with Iron Will (28): `FIRST_GAME`, expansion w1.
- bench-first.js, novice hint-follower: **50.0% (n=400)**. The old 1-vs-2 game gave 36.0% (n=200).
- The classic 1-vs-2 game is still available as the battle size "Classic duel".

## What changed (interface only, rules identical)
1. **Move dial.**
   - Always upright: six fixed columns (turn, bank, straight, bank, turn, K) and one row per speed.
   - A separate "nose" badge shows which way the ship really faces on screen.
   - The window previews where the move ends: a possible bump ("May bump Varn: no action"), a rock, leaving the mat, or an enemy in your sights with its range.
   - A faint firing arc to range 3 is drawn at the ghost ship.
   - The camera keeps the whole preview above the dial.
2. **Why no shot.**
   - One short line when you can't fire: "You can't shoot: Varn out of your arc." Other reasons: out of range, touching, guarded, on an asteroid.
   - The next round's banner repeats it.
   - Enemies you can't target get an "out of arc" or "out of range" chip.
   - A banner explains a skipped action: stressed, bumped, or rock.
3. **No stacking.**
   - Name tags take the nearest spot that is clear of other tags and of other ships.
   - Action chips sit above the ship, and chips are pushed off name plates.
   - The banner avoids chips and the dial.
   - Ships that are close together shrink their models.
   - The 3D fan of every move is gone from the phone board.
4. **Result said once.** MISS or "You dodged!" is the top line of the dice panel. The floating MISS behind the panel and the 3D MISS pop are gone, and the dice panel stays above the bottom bar.
5. **Auto explains itself.**
   - Auto says what it picked and why: "Auto: Straight 4. Aims at Varn at range 2."
   - When the starred suggestion leaves no enemy in your sights, the dial says why it was chosen.
6. **Lesson.**
   - A wrong tap shows "Try the glowing move" (or "Try the glowing action").
   - Coach cards avoid the dice panel, the dial, the bottom bar and the move and action chips.
   - Both end cards have a ✕ close button. After closing, Debrief and Play again work, and Play again leaves the lesson first.
   - The banner fades in instead of the 2.2x zoom that ran off the screen.

## Cold-play verdict (independent agent, 375x667, touch only, lesson + full real game), as-is
1. Could I play it? Yes. I finished the lesson: moves, Focus, Lock, the attack and dodge dice, and rerolling. Then I played the default quick game, 1 ship against 1, and won in round 13 ("VICTORY! ... Ships left: you 1, rival 0"). Everything I needed I could do by tapping. Nothing ever got stuck.

2. Was it fun? A little. The move grid with its preview line and the "in your sights, range N" hint is clever and easy to read. The dice are nice to watch. The best moment was the round 12/13 shot that took the enemy from 1 hull to 0. But the middle of the game dragged. Out of 6 shots, 3 came out "Missed!", even with Focus or a reroll (rounds 7, 8, 9, 10, 11). I hit in rounds 4, 6, 12 and 13.

3. Would I play again? Maybe once, on a harder setting. Against this opponent I wouldn't.

4. What confused me:
- The enemy never hurt me. I stayed at hull 5 the whole game. Many rounds started with "No shot last round: Varn Kessik is…" and the rest of the text was cut off with "…", so I never learned why. It felt like a target dummy, and the win felt unearned. (s061, s066, s077)
- The star (suggested) move was sometimes worse than another move. In round 13 the star sat on ↱3, which said "No enemy in your sights", while ↗2 put the enemy in my sights at range 1. (s138 vs s139)
- The "Fire at Varn Kessik · range 3 · 3 dice vs …" banner runs off the right edge of the screen, so I couldn't read the end of it (s081, s088, s097). In round 11 the "Your turn: Combat" box sat on top of my own ship (s126).
- The planning screen draws a big tangle of ghost squares over both ships, which hides the asteroids near them (s074, s122).
- In round 1 my move clipped a rock: "skips its action". That felt harsh, because the warning was only a small red line of text.
- "3 vs 3" next to a "2 hits" roll that then missed felt random. I couldn't tell my odds.

**Fixed once after it:**
- The no-shot reason now fits the 8-word limit: "No shot: Varn out of your arc."
- The fire label is shorter and stays on screen.
- When the starred move has no target, the dial says why it was chosen ("Stays out of their sights").
- The 3D move fan is gone from the phone board.
- The rock warning says "damage roll, no action".

**Not fixed:**
- Easy AI feels passive, and the odds are not shown. Balance measures 50%.
- The combat banner sometimes still covers your own ship.

## Proof
- `games-src/xw/proof/first-3-min-375x667.webm`: the lesson, the wrong-tap nudge, the end card closed, then the even duel with the upright dial. It was recorded before the cold-play fixes.
- Recorder: `games-src/xw/proof-video.js`.
