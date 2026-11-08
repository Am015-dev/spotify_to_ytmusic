# G7 gameplay review (strict, 8 Nov 2026)

Phone touch play at 390x844 and 375x667 on each game's branch build. Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Sections for the other games are added when their play is done.

## vale-of-banners

Build: branch shelf/W505-vale-gameplay @ 505c08c3, build-all.py PASS. Played on Playwright touch (hasTouch/isMobile, touchscreen taps only):
tutorial to the end card at 390x844 and 375x667, then three full Quick games (2 players, default Normal) to the result screen
(one at 375x667, two at 390x844), playing as a new player who follows the glowing targets and the "★ Best" hint.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | 5 seasons x 5 rounds, 2 dice + white goods die, take/build/sell/workers, worker +-1 with 6/1 wrap, 2-silver back lane once per turn, storage 3, max 3 goods kinds, region 1-36 + season bonus, colour bonus, mine silver, end scoring and tie-break all match the published rules. Own on purpose: lore set, estate map, stalls drawn at random instead of the colour-coded stall spaces. |
| 2 | Tutorial teaches | 7 | 48 steps, one short line + one tap each, all core rules in order (dice > goal > take > build > region > ... > final > tie), ends on "Play a real game" which starts a real 5-season game. Long (about 4-5 min for a person) and a second coach bubble pops over it; crate target is tiny. |
| 3 | First 10 seconds | 7 | Title line is clear and Play is obvious, but Play leads to a setup screen and then a 4-point "Build the best estate" card plus a "Stuck?" line before the board; the prompt then says "Drag your 3 onto stall 3" when a tap is what a new player tries. |
| 4 | Turn clarity | 7 | Whose turn, dice left, prompt line, glowing legal targets, "+N" previews and the tile card ("Take to storage (die 3, 2 workers)") are good. The red worker-cost badge on market tiles is never explained on the board; the big "X's turn" banner sits over the estate. |
| 5 | Phone play | 5 | 390x844 is fine (market tiles 49x57, estate cells 55x61). At 375x667 estate cells are 34-37 px wide, stall goods crates 24x20 px, market switches to 6 cramped columns where worker badges sit on the tile names and the last column's labels touch the screen edge. |
| 6 | AI and pacing | 5 | Rival waits ~7 s per turn (170 s of waiting over 25 rival turns) unless you tap to speed up. A new player following the ★ Best hint lost all three Normal games: 70-120, 114-117, 57-128. Not shown that a new player can win on the default level. |
| 7 | Feel | 7 | Dice, tiles and workers can be dragged, tiles fly, region outlines flash, turn banner, score count-up on the result, 3D estate art. Feels like a game; AI turns are mostly waiting. |
| 8 | Bugs | 7 | 0 page errors, 0 stuck states, 0 dead taps in tutorial x2 and 3 full games. Wrong-state copy: the result says "Close one. Try again?" after a 50-point loss; in the tutorial a coach popup stacks on top of the tutorial bubble. |

Total: 6.6 — FAIL (rows 5 and 6 below 7; no stopper)

### Findings
- Row 5 — did: tutorial step "Take every crate from one stall" at 375x667 — happened: the glowing crate target is 24x20 px (38x30 at 390) — shot: games-src/reviews/G7-shots/vale-375-crates-24px.png
- Row 5 — did: built tiles on the estate at 375x667 (tutorial and full game) — happened: glowing build cells are 34-37 px wide, under 44 px — shot: games-src/reviews/G7-shots/vale-375-estate-34px.png
- Row 5 — did: opened the Market tab at 375x667 — happened: 6 narrow columns; red worker-cost badges cover tile names ("Chapel"), stall-6 labels touch the right edge — shot: games-src/reviews/G7-shots/vale-375-market-crowded.png
- Row 4 — did: my turn started at 375x667 — happened: the "Your turn" banner covers the middle of my estate while I need to read it — shot: games-src/reviews/G7-shots/vale-375-banner-over-estate.png
- Row 6 — did: played a full Normal game at 390x844 following ★ Best on every pick — happened: lost 70 to 120; result still says "Close one. Try again?" — shot: games-src/reviews/G7-shots/vale-result-close-one-50pt-loss.png
- Row 6 — did: full Normal game at 375x667 following ★ Best — happened: lost 114 to 117 (3 of 3 games lost on the default level) — shot: games-src/reviews/G7-shots/vale-375-result-3pt-loss.png
- Row 6 — did: waited through rival turns without tapping — happened: ~7 s per rival turn, about 3 of the 5 minutes of a game spent watching — shot: games-src/reviews/G7-shots/vale-ai-turn.png
- Row 2 — did: tutorial step 6 "Build next to your land" — happened: an "Old Odo" coach popup opens on top of the tutorial bubble, two bubbles at once covering the estate — shot: games-src/reviews/G7-shots/vale-tut-two-bubbles.png
- Row 2 — did: tutorial step 34 at 390x844 — happened: crate target 38x30 px, smaller than every other step's target — shot: games-src/reviews/G7-shots/vale-tut-small-crate.png
- Row 4 — did: tapped a market tile — happened: the card explains the worker cost in words ("die 3, 2 workers"), but the red badge on the board tile has no legend — shot: games-src/reviews/G7-shots/vale-tile-card-worker-cost.png
