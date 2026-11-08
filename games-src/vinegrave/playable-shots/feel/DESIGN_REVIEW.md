# Design review: Vinegrave play screen (W477, 8 Nov 2026)

Reviewed against: games-src/BRIEF-GAMEFEEL.md, REVIEW-FIX.md (R1), DESIGN-FIX.md (D6), games-src/UI-BAR.md
Look: a 1920s expedition scrapbook (sepia photographs, ink frames, parchment tray, jungle-green board).
Skills used: impeccable (critique + craft floor), design-review checklist. Launcher for impeccable was not present in this
container, so project context was read directly.

## Screenshots (this folder, 390x844 and 1440x900)
| Shot | What it shows |
|---|---|
| title-390 / title-1440 | Learn to play, Play, Story; settings behind one "Game settings" line |
| learn-390 / learn-1440 | Learn step 1: "Most points after the last round wins." |
| goal-390 / goal-1440 | Goal card: one sentence, 3 short bullets, one button |
| first-turn-390 / first-turn-1440 | One board: strip, 3 site terraces, research track, market; tray with pawns, goods in words, hand |
| select-390 / select-1440 | A tapped site lifts; the line says what it gives and what you pay; Dig / Details |
| rival-turn-390 / rival-turn-1440 | Rival's move playing out: caption, its card flying to its chip, points popping |
| mid-game-390 / mid-game-1440 | Round 3: pawns on sites, guardian and idols in the tray, markers on the track |
| result-390 / result-1440 | Winner first, big totals, each kind of points counts up with an icon |

## Scores (0-10, final shots)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy (board is the screen, one focus) | 8 | 8 |
| Aim is clear (Learn first screen + Goal card) | 8 | 8 |
| Board and pieces (drag/tap the real piece, glow, snap) | 8 | 7 |
| Art and polish (one style, big art) | 7 | 7 |
| Readability (14 px floor, contrast, no overlap) | 8 | 8 |
| Motion and messages (one at a time, readable time) | 8 | 8 |
| Words (short, plain, <= 12 per sentence) | 8 | 8 |
| Responsive (390x844, 375x667, 1440x900) | 7 | 7 |
| Accessibility (focus rings, labels, 44 px targets, reduced motion) | 7 | 7 |
No row below 7.

## Must fix
None left from R1 or D6.

## Should fix (next round)
1. 375x667: site tiles are about 45 px tall. Readable, but a pinch-zoom on the board would help small phones.
2. Hidden ruins share two photographs (site-hidden-1/2). More hidden-ruin variants would make the top rows less uniform.
3. Result on 375x667 scrolls under the sticky buttons when 2+ players have many score kinds (the buttons stay on screen).

## Could improve
1. The board-map art behind the terraces is dark under the vignette; a lighter grade would show the chart.
2. A short "drag me" ghost finger on the first pawn in a quick game (Learn already shows tap-again).

## What works well
- One board at every size: no tabs, no sheet as the main way. Tap lifts a piece and says what it does; tap again or drag does it.
- Explorer pawns are the pieces: they bob when they can move, fly to the site, and sit on it in the player's colour.
- Rival turns read step by step: the target pulses, then the piece or card flies, then the points pop on the right chip.
- Goods read as words with big numbers ("2 coins"); the result counts every number up, winner first.
