# W487: Rampart & Vine phone clean-up (390x844, 375x667)

## Owner art
All 85 files in games/rampart-and-vine/media are referenced. Several only loaded in the idle warm-up but never showed on screen. They are now wired into visible slots:
- camp-garnet: was never referenced. Now a rival portrait (assets.js RIVAL_PIC).
- ui-score-pill: was hidden by a flat dark-pill override. Now the frame for the score pills again.
- icon-score, icon-follower, icon-tile: were preloaded only. Now they label the rows of the score drawer (points, followers left, tiles left).
- back-default (card-back pile) stays as the tiles-left mark in the top bar, with the word "tiles" under the number.

## Layout fixes
- Panels: the painted frame was drawn 34px wide over a 3px border, so it covered the text. That clipped the coach text, the title and the "1/5" counter. The frame is now a real 28px border (20px on short screens). The page is a soft parchment sunk into the frame, and the counter is page dots.
- Score shown once: the second score bar ("You 35 - Hob 24" + Why/Poor) is gone. Each pill shows the name, the score, and "N left" followers. Tap the pills for the breakdown.
- Seamless board:
  - no per-tile shade or bevel lines;
  - tiles overlap by a hair, so no table line shows between them;
  - every texture repeat divides the tile, and the texture is turned back with the tile;
  - empty spots inside the valley show bare earth instead of the table.
- The camera keeps glowing spots clear of the Recentre button.
- Tray: the held tile is 124px on tall phones. The "Valley complete" plate uses the ribbon at its real shape, with dark words on the cream band (no white blob).
- Shorter lines:
  - shared score: "Both +10" instead of two long names;
  - rival turn: "Watch their tile go down.";
  - game over: "Counting the points…".

## Test fixes
Updated for the current flow (Goal card, "New here?" prompt, tap then "Place here", 8 s final score pops):
- sweep.js
- rotate-test.js
- playable-test.js (SIZE env)

## Gameplay first (owner rule, 8 Nov)
- Rules: compared the engine with the original base rules by playing full games by touch at 390x844 and 375x667, and against the 71 logic tests in RULES-CHECKLIST.md.
  - No rule differences were found. The listed rules (edges, the tile just placed, claimed features, completion scoring and returns, pennants, farmers at the end, majority/ties, unfinished features, 7 followers) each already have a logic test.
- Tutorial: "Learn in 5 minutes" and the Story prologue are now a guided first game.
  - 24 steps, every core rule in order, each one sentence of 12 words or fewer plus one highlighted tap. Then "Play a real game".
  - New taught steps: one owner per feature, banners, majority, ties, a tile that fits nowhere.
  - The coached game's "Rules to learn later" card is gone.
  - Coverage table: TUTORIAL-COVERAGE.md. Proof: game/tut-walk-test.js (also run by learn-touch-test.js).
