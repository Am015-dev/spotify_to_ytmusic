# R93 strict gameplay review: vinegrave

- Build: `shelf/W490-vinegrave-bench` at **43347024cc1fcd5c63e8e8c9497c8d0c5e2e0244** (F13). Reviewed 20 Nov 2026.
- Method: real touch only (Playwright `touchscreen.tap` plus CDP touch swipes on the chip strip) at 375x553, 360x640 and 375x667.
  Guided tutorial from a fresh profile, then 10 full games to the result screen (3 at 375x553, 3 at 375x667,
  4 at 360x640), each playing like a newcomer: tap what glows, swipe the strip to every chip, use every ready boon, idol and assistant.
  Helpers and endless animations were sampled every second.
- Verdict: **FAIL**. Raw average 6.0. Capped at **4.0** by a rules stopper: the components are not identical to the original.

## Gates (2 runs each, run alone)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `VIS_SLUGS="," build-all.py --quick --out /tmp/x vinegrave` | PASS (8/8 scenarios, 77 s) | PASS (8/8, 74 s) |
| `... --full ...` | PASS (phone-check, rules-test 200 AI games, 240 s; lab WARN 3/8: LAB rows != scenarios) | PASS (same WARN) |
| `dock-fit-test.js` (branch's own) | PASS, 232 checks | n/a |
`games/lab.html` rewritten by `--full` was restored, not committed.

## What R69 asked to fix, re-checked
| R69 finding | Now |
|---|---|
| 5+ dock chips ran off the left edge, boons unusable (stopper) | **Fixed.** Held up to 8 chips (8 and 6 at 375x667, 6 at 375x553, 7 and 8 at 360x640) (5-6 shown, spent ones merged as "Set x2" / "Used x2"). I swiped to and tapped every chip at all 3 sizes: 0 out of reach, 0 dead taps, every chip opened its sheet, and every "use" changed the game state. Boons, idols and assistants were all used. |
| Long prompts squeezed the map | Partly fixed. The prompt keeps to 2 lines, but the map is still **124-144 px** in real play at 375x553 and 360x640, below the 150 px the fix claims. dock-fit-test only measures 151 px in a staged state. |
| One-button chooser hid the board | Fixed for one button (it is now a dock button). **Choosers with 2+ buttons still hide the whole board:** see Phone play. |
| Text bugs | Mostly fixed. Leftovers are listed under Turn clarity. |

## Rules and components vs the original (repo notes; the original is never named)
The engine skeleton is faithful: 5 rounds; one main action, then the next player; passing takes you out of the round; 2 explorers; 6-card start
(2 Dread, 2 coin cards, 2 compass cards); start goods by seat; travel icons with 2 coins = a Plane; a second camp space costs double;
discover a ruin = compasses + travel, then an idol and a guardian; overcome a guardian for 5 points + a once-per-game boon; Dread for each explorer
left on a guardian's site; items go under the deck and artifacts fire at once; an artifact played from hand costs 1 tablet; a market of 6 with the
divide exiling one item and one artifact each round; magnifier and notebook (the notebook never passes the magnifier and never enters the temple);
temple stacks 11/6/6/2/2/2; temple arrival points by order; tie-breaks. Box counts match: 40 items, 35 artifacts, 15 guardians, 10 + 6 sites,
16 idols, 12 assistants, 19 Dread.

**But the components are not identical, and the game says so itself** (rules drawer "Simplified on purpose", rules-notes.md, RULES-AUDIT.md):
1. Every item, artifact, site, guardian and idol has this game's own numbers and effects: cost, travel icon, points and text. None is the original card.
2. The research track is "a plain ladder of rows, not a map of paths". The original's branching board, its per-space costs and its bonus on every
   space are gone. That changes a core decision every turn.
3. Shrine bonuses, temple tile costs, research bonuses, 9 of the 12 assistants (plus the gold sides of 2 more), and the solo rival deck are this game's own.
4. Buying an artifact always fires its effect (optional in the original).
By the owner's bar ("rules and components IDENTICAL, only names and art differ") this is a **stopper**: row 1 = 4, and the total is capped at 4.

## Clutter
- Helpers on screen: **max 1** in every sample (tutorial 150 + 187 samples, plus about 2,200 over 10 games). 0 seconds with 2 or more.
  No idle hints pop up in a real game (75 s idle check: 0 helpers).
- Endless animations: **2 kinds, during the tutorial only**: the tutor's target ring (`gxt-ring`, `gxt-pulse`, visible in about 90 of 135 s) and the
  step dot (`gxtDot`, about 69 s). **0** in real games, including the 15 s after a hint. This breaks "0 infinite loops".

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | **4** | The skeleton is right, but the cards, sites, guardians, idols, assistants, shrine/temple values and solo deck are invented, and the research track is a ladder. Stopper by the owner's bar. |
| 2 | Tutorial teaches | 7 | 35 steps in order, one short line + one tap each, 135 s, then "Play a real game". Endless pulse ring, and the temple step is a staged "practice jump". |
| 3 | First 10 seconds | 7 | The title gives the goal in one line, "Learn to play" is the big button, and the goal card is short. The board itself is a wall of tiny icons. |
| 4 | Turn clarity | 6 | The prompt line is good ("Dig: 1 compass and 1 coin + Trail Notes"). The map is not: sites are stacks of 10-12 px travel icons and overlapping loot pills; the research ladder shows no costs or bonuses until you open it; market badges (cost, travel icon, star) are never explained; the cost badge covers card titles ("Tin Lamp"); the goal card says "Dread cards cost 1" (means -1 point). |
| 5 | Phone play | 5 | The chip strip is fixed. But a 2+ button chooser hides the map **and** the research track (6-14 times per game, all 3 sizes): exile, "Research: pick what climbs", the research bonus pick, "choose one" artifacts. The exile chooser clips its first card at the left edge. The map is 124-144 px at 375x553 and 360x640. At game over, the toast and 2 floating labels overlap each other on the track. |
| 6 | AI and pacing | 5 | Easy (the default) averages about 28 points. A glow follower won **10/10** games, 9 of them by 25 to 81 points (99-21, 100-19, 97-25); the only close one (28-26) was a game where the bot passed early. Normal averages about 60 and beat an easy-level player 18/20 in an engine sim. Easy is a pushover and normal a wall, with nothing in between. Pace is fine (2-4 min a game, the rival is brisk). |
| 7 | Feel | 7 | Cards fly, a guardian wakes with a full card, a shake and a roar, the score walk at the end, explorers move. Fine. |
| 8 | Bugs | 7 | 10 full games + tutorial: 0 page errors, 0 stuck states, 0 dead taps. Minus the overlapping game-over labels and the leftover text bugs. |
| | **Average** | **6.0** | **Capped at 4.0 (rules stopper). FAIL.** |

## Repro steps for rows under 7
- **Row 1**: open the rules drawer, "Simplified on purpose": it lists the invented numbers, the ladder track and the own solo deck. Compare
  `src/data.js` (ITEMS, ARTS, GU, S1/S2, ID, ASST, TRACK, TEMPLE) with the original's card list.
- **Row 4**: start a game at 375x667, look at a camp site: travel icons and loot pills overlap the neighbour site, and loot text is about 10 px. Tap a
  bought "Tin Lamp" in hand: the "1" cost badge covers the title. Proof: `R93-proof/midgame-375.jpg`.
- **Row 5**: buy an artifact with an exile effect (e.g. Ash Urn), or tap the research track and climb a row that offers a bonus choice: the island map
  and the track disappear and only the chooser shows; in the exile chooser the first card is cut at the left. Play at 375x553: in normal turns the
  map is 124-139 px. Proof: `R93-proof/chooser-hides-board.jpg`, `R93-proof/map-375x553.jpg` (the 4th frame is game over, with overlapping labels).
- **Row 6**: Play, default settings (1 rival, easy), tap whatever glows: final scores 28-26, 51-26, 56-23, 67-22, 69-26, 70-25, 82-27, 97-25, 99-21, 100-19.
  Engine sim, 20 games each: easy rival vs an easy-level player 28-29 (8/20 wins), normal rival vs the same player 64-29 (2/20).

## Cold-play evidence
`R93-proof/cold-play-375x667-first-3min.webm` (189 s, 375x667, fresh profile): title, then Learn to play, the 35-step guided game, the end card,
"Play a real game", then round 1-2 of a real game. `R93-proof/tutorial-grid.jpg` shows 8 tutorial frames.

**Plain words:** yes, a first-timer could play it. The tutor walks you through every action with one tap at a time, nothing ever gets stuck,
and the chips that broke R69 now work. Was it fun? Only partly. The island is a crowd of tiny icons you learn to ignore and just
follow the glow, choosers blank out the board, and the first real game against the default rival is a 70-to-25 walkover with no tension.
And it is not the original game: every card is invented and the research board is a ladder.

## Top fixes (in order)
1. **Components identical to the original**: the real card list (items, artifacts with their costs, travel icons, points and effects), sites,
   guardians and boons, idols and shrine bonuses, all 12 assistants with both sides, the temple tiles and the path-map research board with
   per-space costs and bonuses; drop "Simplified on purpose". This is the stopper.
2. **Never hide the board for a chooser**: show 2+ button choosers as a bottom sheet over the hand, keeping the map and the track visible (the
   research bonus pick needs the track). Fix the exile chooser's left clip.
3. **A rival that fits the middle**: easy should land within about 10 points of a glow follower (now about 28 vs 70); keep normal for players who know the game.
4. **A readable map**: at least 14 px loot text, no overlapping pills, travel icons legible at 360 px; map at least 150 px in real play at
   375x553/360x640; show each research row's cost and bonus on the ladder.
5. **Calm**: stop the tutor ring and dot from pulsing forever (2-3 pulses, then still); keep game-over toasts from overlapping the score floats;
   "Dread cards cost 1" should say "Dread cards are -1 point"; explain the market badges once.
