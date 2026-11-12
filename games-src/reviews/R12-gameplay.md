# R12 gameplay re-review (strict), 12 Nov 2026

Reviewer R12. I scored by `GAMEPLAY-RUBRIC.md` and changed no game code. I did not trust the fixers' notes; every number below I measured myself.

How I played: each game was built from its branch with the game's own `build.py` and served over http next to its `games/<slug>/media` folder.
I used Playwright phone contexts (isMobile, hasTouch, deviceScaleFactor 1) and only `touchscreen.tap`. Before each tap my driver checked with
`elementFromPoint` that the control was on screen and not covered. A tap that changed nothing within 1.5 s counted as dead. I never called a
game function to make a move. Rival speed stayed at the default, and I did not tap to speed up rival turns, so the waits below are real.
As a "new player" I tapped what glowed: the game's suggestion about half the time, otherwise a random legal glowing target or button.
For each game I also ran one control game that always took the suggestion. I checked the rules against the published rulebook and rule summaries
online (notes kept in a local folder, never committed). Screenshots are in `games-src/reviews/R12-shots/`.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| vale-of-banners | 7.1 | FAIL | 6 AI and pacing 6 |
| doorkick-dungeon | (follows) | | |
| perch-and-plume | (follows) | | |

---

## 1. vale-of-banners (shelf/W505-vale-gameplay @ 259f8bd3): 7.1, FAIL

What I played:
- Tutorial ("New? Learn to play") to the "You know how to play" card at 390x844, 375x667 and 360x640. Each run was 48 steps, 74-76 taps and 85-87 s, with 0 errors.
  Every lit target was on screen, uncovered and at least 44x44 at all three sizes.
- Five full Quick games against the default Gentle rival, all to the result screen. Four were played as a new player: 50% ★ Best, otherwise random glowing targets and dock buttons.
  - 375x667: won 80-60 (2.3 min).
  - 360x640: lost 65-108.
  - 390x844: lost 55-118.
  - 375x667: lost 36-87.
  - One control game at 390x844 took ★ Best at every pick: lost 47-98.
- At each of my about 110 decisions per game, the driver checked every needed control: dock buttons, End turn, glowing spaces, stored tiles, goods and crates. It checked that each was on screen, not covered, not under the turn banner and at least 44x44.
  Result: 0 problems in all 5 games at all three sizes.
- 0 page errors, 0 console errors, 0 stuck states, 0 dead taps. Rival wait from my last tap to my next decision: 2.2-2.5 s on average, 6.9 s at most.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Matches the published rules: 5 seasons x 5 rounds; 2 dice + white goods die; take, build, sell, 2 workers; worker ±1 with 6/1 wrap; 2-silver back lane once per turn; storage 3; at most 3 goods kinds; region points by size plus an early-season bonus ("+11 region full (1 size + 10 early)"); colour bonus; mine silver; end scoring; tie-break. Nothing broke in 5 games. |
| 2 | Tutorial teaches | 7 | 48 one-line steps with one tap each, every core rule in order, ending on "Play a real game". Still long. Step 15 ("keep at most three kinds") comes after a 10 s wait with no line while the rival plays 3 turns, and the board jumps from round 2 to round 3 (rival 0 → 27 pts). "New season" comes after another 7 s wait. |
| 3 | First 10 seconds | 7 | Clear title line and Play. But Quick game still goes through a setup screen, then a 4-point "Build the best estate in 5 seasons" card while the rival already moves behind it. |
| 4 | Turn clarity | 7 | Whose turn, dice left, a prompt line, glowing targets, ★ Best, a tile card that explains cost and effect. Season-change lines run to 3 lines ("Spring is over. Mines pay silver… A full region now gets +8 extra."). The red worker badges on market tiles are still not explained on the board. |
| 5 | Phone play | 7 | Fixed: every needed control was on screen, uncovered and at least 44x44 at 390, 375 and 360, over 5 games and 3 tutorials. Weak spots: the estate number discs are small (about 20 px). At 375 the market is 6 narrow columns and tile names are cut ("Moot Hal", "Joine… Keep"). A "+11 region full" pop lies over the market names. |
| 6 | AI and pacing | 6 | Brisk: rival waits 2.2-2.5 s on average, a whole game about 2.2 min. But a new player lost 4 of 5 to the default Gentle rival, by 43, 63, 51 and 51 points. The game that always took ★ Best also lost (47-98), though R1 once won that way (103-84). A first win is not reliable. |
| 7 | Feel | 7 | Dice and tiles fly, regions flash, "+4 animals" and "+4 goods sold" pop, the camera auto-zooms to the glowing spaces, and the result has a full Built/Silver/Workers/Goods/Lore table with honest copy ("A clear loss, 63 points behind. Follow ★ Best."). |
| 8 | Bugs | 8 | 3 tutorials and 5 full games: 0 errors, 0 stuck states, 0 dead taps. Small: in tutorial step 26 the coach bubble covers the prompt line ("Moot Hall: build one more tile now…"), and a "Chain of 2" label sits on the estate. |
| | **Total** | **7.1** | **FAIL**: row 6 is below 7. No stopper. |

### Earlier findings (G7, R1)
| Finding | Status | Evidence |
|---|---|---|
| R1 row 8/5 STOPPER: at 375x667 the "die → 2 workers" button fell below the screen with 3 goods kinds held, and the turn could not go on | **Fixed.** At every decision of 2 games at 375x667 and 1 at 360x640, every dock button and End turn was on screen and uncovered. All three games reached the result. | R12-shots/vale-g-autumn-375.jpg, R12-shots/vale-g-turn-360.jpg, R12-shots/vale-g-result-win-375.jpg |
| R1 row 8: two more 375 games never finished ("Moot Hall: build one more", "Drag your 1 onto a glowing 1") | **Fixed**: 0 stuck states in 5 games at 3 sizes. | R12-shots/vale-g-result-loss-360.jpg |
| G7/R1 row 5: crate target 24x20, then 44x20 at 375 | **Fixed**: 44x44 at 390, 375 and 360 (tutorial step 34). At 375 the bubble covers the stall names while you choose. | R12-shots/vale-tut-34-crate-390.jpg, R12-shots/vale-tut-34-crate-375.jpg, R12-shots/vale-tut-34-crate-360.jpg |
| G7 row 5: build cells 34-37 px at 375 | **Fixed**: no glowing space under 44x44 at any size. | R12-shots/vale-g-turn-375.jpg |
| G7 row 5: market cramped at 375, badges over names | **Partly fixed**: tiles are tappable, but names are still cut at 375 ("Moot Hal"). | R12-shots/vale-tut-34-crate-375.jpg |
| G7/R1 row 4: the "Your turn" banner covers the estate / the glowing space | **Fixed**: the banner now sits over the score strip. My check found no needed control under it in about 550 decisions. | R12-shots/vale-g-turn-375.jpg |
| G7 row 6: ~7 s per rival turn | **Fixed**: 2.2-2.5 s average, 6.9 s at most. | R12-shots/vale-g-zoom-390.jpg |
| G7 row 6: lost 3/3 on Normal | **Not fixed for a new player**: the default is now Gentle, but I lost 4 of 5 to it (one of the losses followed ★ Best every pick). | R12-shots/vale-best-result-loss-390.jpg, R12-shots/vale-g-result-loss-390.jpg |
| G7 row 2: two coach bubbles at once | **Fixed**: one bubble at every step of 3 tutorials. | R12-shots/vale-tut-01-390.jpg |
| G7 row 8: "Close one" after a big loss | **Fixed**: "A clear loss, 63 points behind." | R12-shots/vale-g-result-loss-390.jpg |
| G7 row 4: red worker-cost badge never explained on the board | **Not fixed** (still explained only on the tile card). | R12-shots/vale-tut-46-pop-over-market-390.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Played 5 default games: 4 as a new player, 1 always taking ★ Best | Won 1, lost 4 by 43-63 points. The ★ Best game was lost 47-98. The default Gentle rival is not reliably beatable for a newcomer. | R12-shots/vale-best-result-loss-390.jpg, R12-shots/vale-g2-result-loss-375.jpg |
| 2 | Tutorial step 14 "Tap End turn", then waited | 10 s with no line while the rival takes 3 turns. The board jumps from round 2 to round 3 and the rival from 0 to 27 points without being shown. The same happens before "New season" (7 s). | R12-shots/vale-tut-end-390.jpg (end card) |
| 8 | Tutorial step 26 (Moot Hall) | The coach bubble lies over the prompt line, and a "Chain of 2" label sits over the estate. | R12-shots/vale-tut-26-prompt-under-bubble-390.jpg |
| 5 | Tutorial step 46 and real games, Market tab | The "+11 region full (1 size + 10 early)" pop covers the stall names, and names are cut ("Moot Hal", "Moot Ha"). | R12-shots/vale-tut-46-pop-over-market-390.jpg |
| 3 | Quick game, first screen | A 4-point goal card covers the board while the rival already plays its first turn behind it. | R12-shots/vale-g-goalcard-375.jpg |
| 4 | Season change | The prompt becomes a 3-line paragraph ("Spring is over. Mines pay silver: Azure +0, You +0. New tiles in the market. A full region now gets +8 extra."). | R12-shots/vale-g-zoom-390.jpg |
| 7 (works) | Whole game | Dice and tiles fly, regions flash, the camera follows the glowing spaces, and the result table is clear. | R12-shots/vale-g-result-win-375.jpg |
