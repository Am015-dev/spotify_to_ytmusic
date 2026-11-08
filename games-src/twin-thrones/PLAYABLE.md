# Twin Thrones playable pass (W397): first-minute critique, before and after
Method: screenshots at 390x763 and 1440x860 (title, wonder draft, first turn, zoom, rival turn, result, tutorial steps), looked at as a newcomer, impeccable critique (clarity, hierarchy, feedback) and fun-game-design lessons (one thing at a time, show the rival's turn). After-shots: `playable-shots/` (webp, phone).

## The 10 worst problems found, and what changed
| # | Before (problem) | After (fix) |
|---|---|---|
| 1 | Nothing said whose turn it was; the bar at the bottom said "Your move" in small text | Centre banner on every change of turn ("Your turn" gold / "Rival's turn" salmon, 1 s, tap-through) and an always-visible gold/salmon line at the top with a pill (YOUR TURN / RIVAL'S TURN / Conflict / Pyramid / Age) |
| 2 | Instruction was generic ("Tap a glowing card") in a 3-line dock at the screen edge | One instruction line at the top, plain words that change per situation (draft, token, who starts, pick a card, build/sell/wonder); dock keeps only the head + one status line; max 2 lines |
| 3 | The rival moved instantly: a card vanished and numbers changed with no explanation | The rival's turn is 4 steps, 0.6-0.9 s each, tap to speed up: "is thinking..." -> lifts the card, "Rival takes Lookout to build it." -> card flies to the city, coin pop -> effect captions: "+3 points for X", "The pawn moves 1 step toward ...", "loses 2 coins: the pawn passed a marked space", "Now free to take: ..." (those cards pulse) |
| 4 | Card faces were letter chips (S, C, G, W) and clipped names ("Bathhou/se"), costs unreadable | Drawn shapes with the amount: log = wood, brick = clay, rock = stone, drop = glass, scroll = papyrus, disc = coins; a plain effect line on the card ("+1 Stone", "1 Shield", "3 points"); names fit at 13 px; the cost sits in a price footer; the big card says "Needs: 1 stone, 2 wood" in words |
| 5 | Wonder draft: one tiny card in empty space, cards slid under the city strip, rival picks invisible | Big 2x2 cards (15 px name, 14 px effect, cost chips with words), the track and token rows hidden during the draft, the rival's pick lifted and captioned |
| 6 | Progress-token row read "Ope Dee Cit Mas War" | Full names in 44 px buttons (2 lines), tap for the effect |
| 7 | An "Age I begins" toast covered the dock and the big card | Centre banner "Age II" + a caption; the toast sits at the top and clears |
| 8 | Tutorial: 8 clicks, no story, did not cover the rules, did not end in a real game | Coached first game (ADDENDUM 4): one real duel vs the real computer with free choices from move 1, one forced step, Ione speaks just-in-time in one dismissable bubble, final scoring walked row by row, a "later" card for rules that did not come up. See TUTORIAL-COVERAGE.md |
| 9 | The big card had four long wonder buttons and an unclear cost | "Build (1 coin)", "Sell for +2 coins", "Wonder: Beacon Isle (8 coins)", "Needs: ..." in words; disabled buttons dim |
| 10 | Result was a bare table titled "Computer wins" | "Rival wins", totals count up (tap to finish), a line in the game's voice for points / military / science wins and losses |
Also: legal cards glow with a pulsing gold ring, covered cards lose colour (not contrast), face-down cards carry a plate label, "Help" opens with "How a turn works" in 5 lines, Story chapters have 3-line intros, win and loss outros (`campaign.json`), the Story map's Tutorial button now opens How to play (the tutorial starts from the title, Menu or the drawer).

## Gate (all run on the final build, 7 Nov 2026 22:50 UTC)
- `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick twin-thrones`: PASS (5/5 scenarios).
- `node rules-test.js 200` PASS (with the merged W391 cases), `node smoke.js` PASS phone + pc, 0 console errors.
- `node tutorial-e2e.js p` and `d`: PASS at 390x763 and 1440x860 (the whole prologue by taps on the centre of each spotlit element; all 31 step ids shown; no tap target covered; result screen and end card reached; 0 console errors).
- `node playtest-ui.js quick p`, `quick d`, `story p`: PASS (Quick game and Story stage 1 played to the result by taps on visible UI only).
- ui-audit A-F: phone A0 B0 C0 D0 E0 F0, phone-s A0 B0 C0 D0 E0 F0, pc A0 B0 C0 D0 E0 F0.

## Not fixed / honest limits
- The phone pyramid card is still about 60 px wide (six across 390 px); the big card is the readable view. On the 375x553 phone the effect line is replaced by drawn chips and token names are cut (tap shows the full name).
- Rules fixes (ADDENDUM 2) are W391's, in the engine: `origin/shelf/W391-rules-fixes` (commit 1a6ecbe0: tie chooser = last-card taker, Customs Quay costs 4 coins, rules-test cases) is merged into this branch before the final gate; this worker did not edit the engine, rules or data files. Fixed 2 of 2 WRONG items (by W391); the 6 UNSURE card costs are unverified and unchanged.
- The Age II start in the tutorial gives the player the first move by script (the real rule is "the player behind on the pawn chooses"), explained in the `years` step.
- No new art; all pictures are still code-drawn (slots kept).

## Round 3 (W397c): know where you stand
- **Turn tracker** (top right of the instruction line): "Age 1 of 3 / 19 cards left" (draft: "pick 3 of 8"); whose turn is the pill on the left. It turns into a **danger line** when it matters: "Pawn 3 steps from your city", "Rival has 4 of 6 symbols" (red) or the same chances for you (green).
- **Score bar** (always on the board, tap for the legend): Civic / Sci / War / Won / Coin points and the total for you and the rival, the leader marked (gold, star, underlined category).
- **Preview** on the big card: each button says what it would do on a copy of the game ("+3 pts · -2 coins", "pawn +1", "science pair: pick a token", "+1 stone each turn").
- **Points pop with the reason** ("+3 points for Open Stage (civic card)"), a **star** on the computer's best-value glowing card, and a one-line **rating after each of your turns** ("Good move: the best choice here." / "Okay move: selling X was a bit better." / "Poor move: ... was clearly better.").
- **Guided game for bots and people**: while the coached game runs, the token and wonder pills and the score bar are dimmed and not tappable so the glowing card is the obvious target (class `ttguided`, not `coach*`).
- Painted art (free-art/install.py --force, not committed): text sits on solid plates; ui-audit A-F 0 on phone, phone-s and pc with the art installed.

## Round 4 (W429): a clean, picture-first Play screen (390x844)
- Every pyramid card, wonder and science token shows its CC0 picture (`free-art/install.py --force`; `games/twin-thrones/media/` now committed so a rebuild fills all 126 slots).
- Card face: name plate in the card colour (soft hyphens, never clipped), effect badge (red = shields, blue = points, green = science, resource icons), and on takeable cards YOUR price: green "Free" glow or a coin price (red if you cannot afford it). Covered cards are dimmed and spread so name + effect stay visible.
- One instruction line + turn tracker (Age, cards left / danger), one goal line (tap: how to win), one line per player (portrait, coins, points, 4 wonder pictures). Tap points = breakdown, tap a wonder or token = picture + effect.
- "+N card name" pops next to your points when you score. Hints (top bar, off by default) brings back the best-value star, move previews, ratings and the turn banner. The bottom panel only appears when it holds a choice. Cards moved from the top bar to Menu.
- Result: picture banner, the scoring table for both sides, early-win note. Engine, data and AI untouched.
- Gate: build OK, `rules-test.js 200` PASS, `smoke.js` PASS phone + pc (0 errors, run from games/twin-thrones/), playtest-ui quick p PASS (29 turns to the result by taps), tutorial-e2e p PASS. Shots: playable-shots/title, first-turn, mid-game, score-pop, result (.webp).
- W429b (owner verdicts, 8 Nov): drag a glowing card and a drop tray appears (Build / Sell / each wonder, legal ones glow, a vibrate tick on hover and drop); tap still opens the big card. `touch-test.js` proves tap and touch-drag at 390x844 with real touch events (PASS). Shot: playable-shots/drag.webp.
- W429c (BRIEF-GAMEFEEL): Goal card before turn 1 ("Have the most points after 3 ages" + 3 bullets) and the same aim on the first Learn-to-play screen; messages stay 4 s + 1 s per 10 words (tap skips), your own move shows at most 2 lines, the rival's at most 3, no turn banner in Play; text floor 14 px phone / 16 px pc; shield and points badges read as a drawn shield and "N pts"; fixed a CSS clash that put the tutorial's Skip button on top of Next; PC board centred without the empty dock column; Esc closes pop-ups. Gates: build-all --quick PASS, ui-audit A-F 0 (phone, phone-s, pc), rules-test PASS, smoke PASS, touch-test PASS, playtest-ui quick p and d PASS (30 turns each), tutorial-e2e p and d PASS. Review: DESIGN_REVIEW.md. Shots: playable-shots/feel/.
- W429d (feel gate): `feel-audit.js twin-thrones --secs 120` (a)-(e) all 0, full 120 s sessions in Learn and Play on phone and pc, no tutorial skips. Learn to play now opens straight into the coached game with a "How to win" step (Next), no intro scene. Title buttons carry data-a="learn" / data-a="play" (the Learn button used to say data-a="start", so Play bots opened the tutorial). The instruction line is the turn tracker, no longer role=status. No separate "thinking" line or banners on top of it. Tutorial and move lines are at most 12 words per sentence. Wonder text "play again" shows as "take another turn" (display only). Goal and rules texts no longer say "you win" / "wins" outside the result screen.
