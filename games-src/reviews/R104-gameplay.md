# R104 strict gameplay review: short-fuse

Reviewed: origin/shelf/W570-short-fuse-strict at **57fc99707d6940224ffe1385881e8871e4d3dbba** (57fc9970, "short-fuse: F3 report"; game code at 269717d7).
Reviewer: R104, 20 Nov 2026, 18:30-19:00 UTC. Review only; no game code was changed.

## Verdict: FAIL. Average 6.1, capped at 4 (stopper: a dead tap the gate reproduces)

| # | Row | Score |
|---|-----|------:|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 6 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone and PC play | 5 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 6 |
| 8 | Bugs | 5 |
| | **Average** | **6.1** (capped at **4**) |

Cold-play verdict: playable (yes, never stuck, won all 3 jobs), fun **3.5/5**, would play again "probably yes, for a few more jobs". The game is playable, but the cold tester did not find it fun enough to pass.

## Gates (one run each, in the foreground)
- `--quick`: **PASS**, 9/9 scenarios (71 s).
- `--full`: **FAIL**, "phone-check: FAIL: 2 dead taps (1·2 / 3)". The rerun allowed for flakiness also failed, with "2 dead taps (1 / 1)". So it is reproducible, and F3's claim that `--full` passed does not hold on this head.
- Tests (run by the rules subagent): rules-test 101/101. logic-test 156/157: rule 27 fails, but the test is stale, not the game. It regex-matches start.js:72, which now reads `(w.np||G.np)`.
- calm-audit: loops=0, maxHelpers=0. The guided path tapped "Rules", not "Learn to play", so that number does not cover the tutorial. By eye on the tutorial: at most 1 bubble at a time, and no infinite animations seen after the bulb.
- Console: 0 page errors in any run (phone, PC, 5 sizes). Under file:// only, the model and asset files return 404, which is expected.

## Rules vs the original (engine plus player-facing text)
The engine and the setup data are faithful. Cuts, double/solo/reveal, red and yellow handling, the token placed on a miss, equipment, setup counts, turn order and win/lose all match. Mission setup was checked for all 66 jobs by script. The mismatches are in the text:
1. **major** `game/story.js:35`, `game/tutor.js:116`: "Tap your red: never say red or point at one." The text contradicts itself. The engine reveals an all-red hand by itself (`src/engine.js:191-193`), and `story.js:37` and the win step say the red "revealed itself".
2. **major** `game/hlp.js:31`: "Tap a red wire to show your reds." This contradicts `texts.js:158` ("The page does it for you") and the forced reveal. Reveal is also still offered as a tappable move at `src/engine.js:358`.
3. minor `game/texts.js:155`, `game/story.js:55`, tutorial miss text: "token shows the wire's true number". A yellow wire gets the yellow token, not a number.
4. minor `game/src/data.js:21,25` (Triple Probe, Full Scan): "Name a number" leaves out "never yellow". The engine rejects yellow (`engine.js:280`).
5. minor `game/story.js:62`, `game/tutor.js:80`: the Twin Probe text says "two wires" but leaves out "on the same stand" (compare `data.js:55`).
6. minor `game/scorecard.js:20`: the preview "a miss: fuse -1" ignores the 2-step restriction and an armed Damper (0 steps).
7. minor `game/hlp.js:63`: "the better placed one goes first". The engine gives the turn to the next claimant clockwise (`engine.js:496`).
8. minor `game/src/data.js:196`: job 8 says "No special rules", but it uses 1-of-2 red and 2-of-3 yellow.
9. minor `game/src/data.js:197-198,235`: jobs 25, 44 and 49 leave out the slip and pass penalties from the notes.
10. minor `game/hlp.js:9`: the fuse picture always has 5 segments (the maximum is 6). `texts.js:130-140`: the TUTORIAL array is dead text.
Rules verdict: **engine faithful. 2 major text contradictions (red reveal) and 8 minor text gaps.**

## Cold play (independent subagent, no history, as-is)
> Could I play? Yes, I was never stuck. Taps always worked. The only waits were about 3-5 s of crew turns on screen.
> Wins: Yes on all three. The tutorial's 17 steps ended with "Training done". Phone job 1 was "DEFUSED!" with 1 miss, 13 turns. Phone job 2 was "DEFUSED!" with 2 misses, 19 turns. PC job 1 (3 players) was "DEFUSED!" with a clean job, 0 misses, 12 turns.
> Fun 3.5/5. The deduction is good: tokens show a number range, and you say a number you hold. Cutting is also satisfying. But the crew turns are slow and the board changes a lot between turns.
> Play again? Probably yes, for a few more jobs.
> Confusing: "Tap your red: never say red or point at one." The instruction says tap it, then the next tooltip says never name it. The bar then says "Red: never name it. It reveals itself last." "Hints off" in the top bar is not clearly a toggle. "Job 1 Setup Your pick" and "1 action or play gear" were jargon on first sight. Teal's tokens like "3·Y" and "≠2,6" are not explained. Scissor badges on my wires are not explained. In job 2, a missed Twin Probe or guess made the turn pass silently ("Plum made a move").
> Phone: The intro text under the title is low contrast, pale on cream, almost invisible. In job 2 (5 crew) the layout re-flows between turns: stands moved and rotated, and Teal's rows jumped from left to top, so I mis-tapped risk. Teal and Plum wire rows are tiny, and the cut-wire strip is tiny with tokens barely legible. The top bar overlaps the fuse-rope strip a little. The "Yellow at 2.1 3.1" box crowds the Plum and Teal labels. My hand sits against the bottom edge with no margin, and the Stand 2 row is cut off a little at the bottom.
> PC: The board uses only a narrow band, with a lot of empty space in the middle and sides. The hand at the bottom touches the screen edge. No keyboard shortcuts are shown. I tried 3, Enter and Space, and nothing happened.

Recording: `games-src/reviews/R104-first-3-min-375x667.webm` (the first 180 s of the tester's touch session: home, then the tutorial).
Reviewer notes on the cold report: the cold tester played the built file over file://, where art 404s. The low-contrast home tagline, the empty maroon circle on the Goal card and the empty navy band on the Defused card show up only under file://, where the images 404. Served over http (like the live site), the Goal card shows the foreman's portrait, so the F3 "empty circle" gap is **not** a real bug.

## Reviewer checks
- Text and taps (served build, after Go plus one pick): smallest text 14 px on phone and 13 px on PC. No buttons under 44 px, nothing clipped, no page scroll, at 375x553, 375x667, 1366x768, 1920x1080 and 910x512.
- Home, served over http like the live site, with the painted backdrop loaded: the tagline is cream on dark navy art, about 10:1, readable. The "Play" label is near-black on orange, 4.2:1 measured, and passes as large text. Without the art (file://, or the art still loading), the tagline is pale cream on light orange and unreadable. So the F3 contrast gaps show up only when the art is missing. Low priority: add a fallback background colour.
- PC 1366x768: the stands sit in the top-left and top-right corners, with a large empty middle. My hand ends at exactly 768 px, flush with the bottom edge, and Stand 2 is cut against it. At 1920x1080 the hand also ends at 1080. The F3 gap "PC centre mostly empty" is **still open**.
- Phone 375x553, job 1: board-first and readable, with my Stand 2 flush against the bottom edge. Phone job 2 (cold shot): Teal's Stand 2 and Plum's row shrink to tiles of about 28 px, and the "+2" fuse popup overlaps the job counter.

## Rows under 7: repro steps
- **Row 8 Bugs (5), stopper.** Run `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/x short-fuse`. Phone-check taps glowing crew wires (labels "1·2", "3", "1"), and nothing on the page changes within 1 s. That happens 2 times per run, in 2 of 2 runs. Likely cause: `wiretips.js:17-21`. A glowing crew wire that is not the player's legal pick at that moment either returns early or shows only `#wtip`, so a wire that looks tappable gives no feedback.
- **Row 5 Phone and PC (5).** The `--full` phone-check fails. On PC, the centre is empty and the hand touches the bottom edge (1366x768, after Go). No key hint is visible, and the tester's 3/Enter/Space did nothing. On a 3-player job 2 on phone, the crew rows shrink to tiny tiles and re-flow between turns.
- **Row 2 Tutorial (6).** Learn to play, step "Red wires": "Tap your red: never say red or point at one", then the bar says "Red: never name it. It reveals itself last." On steps 1-2 the bubble covers the HUD (F3 known, not re-fixed).
- **Row 4 Turn clarity (6).** Hint tokens "3·Y", "≠2,6" and the scissor badge are never explained. A crew miss shows only "Plum made a move", so you can't tell who did what.
- **Row 7 Feel (6).** Fun 3.5/5. The 3-5 s crew turns and a board that re-flows between turns blunt the satisfying cut.

## Prioritized fix list
1. Fix the `--full` phone-check dead taps. Every glowing wire must respond visibly on tap, or must not glow when it isn't pickable (`wiretips.js:17-21`, glow classes in `tbl.js`).
2. Red-wire text: make it one story that matches the forced reveal (`story.js:35`, `tutor.js:116`, `hlp.js:31`). Either remove the reveal tap at `engine.js:358`, or teach it consistently.
3. Phone job 2+: keep the crew stand layout stable between turns, keep tappable crew tiles at 44 px or more, and move the "+2" fuse popup off the job counter.
4. PC: use the centre (crew stands larger, or around the table) and leave a margin under the hand. Show a small key legend (1-9, Enter, Esc) and check the keys actually act.
5. Home: give the tagline a dark fallback behind it, so it stays readable before the art loads (it is fine once the art is there).
6. Explain the hint tokens ("3·Y", "≠2,6", scissors) in one line the first time they appear. Name the AI's action ("Plum guessed 5 on your wire: miss").
7. Minor text fixes 3-10 above. Update logic-test rule 27 to the new start.js:72.
