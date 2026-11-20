# R110 strict gameplay review: Wildmark

Commit reviewed: `f48381a23f5508da0abe60b899315bc6a35b6674` (origin/shelf/W574-wildmark-strict, "F4 proof screenshots").
Verdict: **FAIL** (average 6.9; row 6 at 4 and row 5 at 6; COLDPLAY_VERDICT_SHORT).

## Gates (one run each, alone, foreground)
- `build-all.py --quick wildmark`: PASS, 11/11 scenarios ok (82.6 s).
- `build-all.py --full wildmark`: PASS (phone-check 60.9 s, rules-test ok). Lab WARN 3/8: LAB rows != scenarios list (not a game issue). games/lab.html not committed.
- 0 page errors in the tutorial and 5 full games below.

## Rules vs the original (engine and every player-facing text)
Engine: RULES-CHECKLIST R1-R119 match the original as I know it (setup counts, market, three/four-alike sweeps, acorn powers,
placement, 20 turns, A cards, corridors, 2p and 3-4p majorities, solo, tie-break, B-D tables). Player texts checked in help.js,
tutor.js, ui.js, score.js, cards.js, data.js. No wrong rule found. Small text gaps (not mismatches):
- `games-src/wildmark/src/help.js:16` rules card says "Bears in pairs, elk in lines, salmon in chains, hawks alone, foxes next to many kinds" also when the B-D variant is on (it describes card set A only).
- `games-src/wildmark/src/tutor.js:58` "ties earn less" is vague (real rule: two tied for first 2 each, three+ 1 each, then no second). The bonus note at `ui.js:545` states it fully, so OK.
- `games-src/wildmark/src/data.js:13` / `help.js:16` salmon "chains" without "each touching at most 2 salmon" in the help card (card chip text has it).
Rules verdict: **match**.

## Helpers and loops
- Calm audit at pick, after the Tip bulb and 15 s after it, at 375x667, 375x553, 910x512, 1366x768, 1920x1080:
  max **1 helper** on screen (`#line .stepn` or the bulb bubble `.gxh-bub.on`), **0 infinite animations** (also 15 s after the bulb).
- Tutorial: Rowan's bubble replaces the step strip (1 helper). During Bram's turn the "+1 river" pop overlaps the Bear card chip (top left), see note in row 5.

## First-timer play (touch, 375x667 and 375x553)
Tutorial (Learn in 5 minutes): 7 short turns, one line + one tap per step, every core rule in order (take pair, adjacency, token
on matching tile, keystone acorn, rival turn, bear pairs, rotation, corridors, three-alike sweep, elk lines, acorn free pick,
salmon runs, four-alike wipe, hawks, acorn replace, fox, majority, 20 turns, acorns = points, tie-break, optional token/skip).
Ends in a win (33-19) with a clear score breakdown and "Play a real game". 66 s at fast tapping, about 3-4 min for a reader.

Full games on the default level (setup shows "You vs 1 gentle rival, 20 turns each"), played as a newcomer who presses Tip
every step and taps where the ring points (place confirmed with Place tile):

| size / input | result (you-rival) | my turns | 
|---|---|---|
| 375x667 touch | 67-96 loss | 20 |
| 375x553 touch | 71-88 loss | 20 |
| 910x512 mouse | 74-87 loss | 20 |
| 1366x768 mouse | 70-92 loss | 20 |
| 1920x1080 mouse | 68-94 loss | 20 |

**0 of 5 won.** The hints never suggest spending acorns (the newcomer held 4-5 acorns by turn 8-13), and they optimise the
immediate gain, so the "gentle" rival out-scores them on habitats or animal cards every game. Each rival turn takes ~6.3 s
(measured between my turns, very steady), i.e. ~2 min of watching per 4-minute game.
Rival turn readable: yes (line "Bram takes the Marsh tile + Fox", then "Bram places the tile in their valley", a pop on his
map, and a season log on PC). Choice visible before committing: yes ("up to +N" on every column, ghost tile with "+N Here:
meadow grows to 3 (+1)", a numbered marker, rotate buttons).
A second game in one session stalled twice in my multi-run driver (both sizes, around turn 5); a clean solo replay of the
same flow progressed normally, so I do not count it as a stopper, but it is worth one fixer check (2 games back to back via Title > Quick game).

## PC with a mouse
- 910x512: everything readable (min 14 px) and one game played with 0 dead clicks, but in the tile stage the **Back** button
  sits at y ~484-512+ and is cut by the bottom edge (see proof `wildmark/proof/shots-f4/910x512-3-preview.png`, also my run).
- 1366x768: good use of width (rival valley + season log left, market right), text 14 px+. Season log renumbers from 1 when it
  scrolls ("1. Bram placed a Hawk." at turn 13), reads like the game restarted.
- 1920x1080: works, 0 dead clicks, but the valley stays ~250-300 px in a 1130 px board; lots of empty board.
- Two hint entry points with different names: bulb "Tip" in the top bar and "Help me" in the dock.

## Phone
- 375x667: text min 14 px, no target under 44 px, no clipping, no scroll, 0 dead taps.
- 375x553: min text **12 px** (animal labels under market tokens), market token buttons **36x48** (under 44 wide); map tiles small
  (~35 px) so animal icons on the map are hard to read. Nothing clipped, no scroll.
- Tutorial: Rowan's avatar is an empty green circle (placeholder look).

## Cold play (independent subagent, no history, touch at 375x667, tutorial + one game)
COLDPLAY_QUOTE

Video: `games-src/reviews/R110-first-3-min-375x667.webm`.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Engine and texts match; only small help-text gaps above. |
| 2 | Tutorial teaches | 8 | Every core rule, one line + one tap, ends in a win, then a real game. Placeholder avatar. |
| 3 | First 10 seconds | 7 | "Learn in 5 minutes" is the obvious first tap; goal line "Beat Bram: score more points". |
| 4 | Turn clarity | 7 | Step strip 1/3-3/3, "up to +N", ghost preview with reasons, clear rival line. Tip vs "Help me" naming. |
| 5 | Phone + PC | 6 | Back clipped at 910x512; 36x48 token buttons and 12 px labels at 375x553; small map at 1920. |
| 6 | AI and pacing | 4 | Hint-following newcomer lost 5/5 on the default Gentle level by 13-29 points; ~6.3 s per rival turn. |
| 7 | Feel | 7 | Tiles drop, tokens settle, score pops, sounds; calm and readable. |
| 8 | Bugs | 8 | 0 errors, 0 dead taps, 0 stuck states in tutorial + 5 games (driver stall noted above, not reproduced). |

Average **6.9** (55/8). FAIL: rows 5 and 6 under 7.

## Repro steps for rows under 7
- Row 6: Title > Play against 1 computer ranger (or Quick game > Start, default Gentle). Every turn press Tip and do what the ring
  says. Final 67-96 (375x667), 71-88 (375x553), 70-92 (1366). Note acorns pile up unused.
- Row 5: open at 910x512, take any pair: the dock's Back button is cut at the bottom. At 375x553 inspect the market: token
  buttons 36 px wide, labels 12 px.

## Fix list (priority order)
1. Make the default level winnable for a hint follower (~50%): weaken Gentle (e.g. it ignores habitat majorities / plays a random
   good-enough pair 40% of the time), and make the Tip consider habitat growth and a "spend an acorn" suggestion when it pays.
   Gate: newcomer-bench with Tip-only play wins 40-60% on Gentle over 50 seeds.
2. Speed the rival up: ~2.5-3 s per rival turn by default (keep the readable line), or a "fast rival" option on by default.
3. 910x512: fit the dock actions (Back) inside the viewport in the tile stage.
4. 375x553: market token buttons >= 44 px wide, labels >= 13 px.
5. One name for help: "Tip" everywhere (drop "Help me" or merge), season log keeps real turn numbers, Rowan avatar art, B-D aware help card.
