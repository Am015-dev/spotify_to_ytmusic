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
| 8 | Tutorial: 8 clicks, no story, did not cover the rules, did not end in a real game | Prologue: 4 chapters, 31 steps, ONE real game vs the real computer to the result screen; guide (Ione) and rival (Pell) talk; chapters leave/resume. See TUTORIAL-COVERAGE.md |
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
