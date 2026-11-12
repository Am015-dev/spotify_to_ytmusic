# R12 gameplay re-review (strict), 12 Nov 2026

Reviewer R12. I scored by `GAMEPLAY-RUBRIC.md` and changed no game code. I did not trust the fixers' notes; every number below I measured myself.

How I played: each game was built from its branch with the game's own `build.py` and served over http next to its `games/<slug>/media` folder.
I used Playwright phone contexts (isMobile, hasTouch, deviceScaleFactor 1) and only `touchscreen.tap`. Before each tap my driver checked with
`elementFromPoint` that the control was on screen and not covered. A tap that changed nothing within 1.5 s counted as dead. I never called a
game function to make a move. Rival speed stayed at the default, and I did not tap to speed up rival turns, so the waits below are real.
As a "new player" I tapped what glowed: the game's suggestion about half the time, otherwise a random legal glowing target or button.
For vale and perch I also ran one control game that always took the suggestion. My doorkick control run was stopped early, so I give none for it.
Up to five browsers ran at once on 4 cores, so the measured waits may be slightly long. I checked the rules against the published rulebook and rule summaries
online (notes kept in a local folder, never committed). Screenshots are in `games-src/reviews/R12-shots/`.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| vale-of-banners | 7.1 | FAIL | 6 AI and pacing 6 |
| doorkick-dungeon | 6.6 | FAIL | 6 AI and pacing 5; 4 Turn clarity 6; 5 Phone play 6 |
| perch-and-plume | 6.6 | FAIL | 6 AI and pacing 5; 4 Turn clarity 6; 5 Phone play 6 |

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

---

## 2. doorkick-dungeon (shelf/W502-doorkick-gameplay @ 155219e2): 6.6, FAIL

What I played:
- Tutorial ("New here? Learn in 5 minutes") to "Play a real game" at 390x844 and 375x667. Each run was 27 steps, with every step's marker shown within 0.5 s of the step (waits for rival or scripted moves: 1.9-5.1 s). 0 errors.
- Real games: Quick game with the defaults (4 heroes, rivals Morwen, Grub, Tansy), tapping Start and "Just play".
  - Four games as a new player who taps glowing cards, then the glow; the game's marked move half the time; otherwise a random legal button.
  - 390x844: Tansy won at 10 after 6.1 min, me level 1.
  - 375x667: Grub won after 12.2 min, me level 1.
  - 390x844: Tansy won after 14.8 min, me level 1.
  - 375x667: no winner after 17 min (levels 1, 1, 6, 6); I stopped it there.
- Three games reached the result screen with 0 page errors, 0 console errors and 0 stuck states. Wait from my last action to my next decision: 4.3-6.2 s on average, 15-22 s at most. Every one of these waits covers 3 rival turns and the meddle windows.
- A separate card-panel check at both sizes: I opened an equipped chip's panel, checked End turn, tapped the panel's ×, then a rival. In 16 more checks inside the games, the panel never covered the action bar.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Matches the published turn: kick the door (a curse hits at once); fight or run (5+, elf 4+, "Run 33%" for a human, "Run 50%" for an elf); levels and treasure; Bad Stuff; look for trouble or loot the room; charity down to 5; sell 1,000 gold for a level but never the winning one; meddling, help for treasure, races and classes. Nothing broke. |
| 2 | Tutorial teaches | 7 | 27 short steps in rule order, one tap each, ending in a real game. Fixed: the run step now says "4+ escapes (elf +1)" next to "Run 50%". At 375 names are still cut in the fight ("Hairy Hat-…", "Pip (Y…"), and a "Lost: Brave Bucket" toast lies over the "Caught: Bad Stuff" banner. |
| 3 | First 10 seconds | 7 | Fixed: Start is on screen at both sizes (centre y 808 of 844, 631 of 667). Clear title line, then "Tap or drag glowing cards onto your hero" with glowing cards. A 3-bullet "How to win" card still opens over the board while a rival is already playing. |
| 4 | Turn clarity | 6 | The bottom line always says what to do ("Curse Tansy? Drag a card on them", "Too many cards: drag extras to discard", "Losing! Add cards, get help, or run"), and run odds show on the button. But names are still cut at 375 ("Pip (yo…", "Morw…", "Gargantua"). In practice a newcomer who follows the glowing cards stays at level 1 and strength 1 for a whole game: the screen never shows why they keep losing or what to equip. |
| 5 | Phone play | 6 | Fixed: the card panel stops above the action bar at both sizes, its × (44x44) closes it, and End turn stays reachable. All main buttons are 44 px or more. Not fixed: the hand row runs past the right edge (the 6th card starts at x=402 of 390), names are cut at 375, "+2 Lv" floats sit over the rival plates at tutorial start, and the result table breaks a name onto its own line ("Morwen"). |
| 6 | AI and pacing | 5 | Rival turns are shorter than before (a decision every 4-6 s on average, against 15-20 s per rival turn in G8). But games ran 6, 12, 15 and over 17 min, and in all four I ended at level 1 while a rival reached 9-10. G8's player who always took the lightbulb got to level 9, so a win is possible, but it is not likely for a new player. |
| 7 | Feel | 7 | Painted art, the door KICK!, the "A MONSTER!" reveal, dice, "+1 Lv" floats and a result page with kills, helps, deaths and curses per hero. |
| 8 | Bugs | 8 | 2 tutorials and 4 long games: 0 errors, 0 stuck states, and the G8 panel stall did not come back. Unconfirmed: twice, tapping "Run (sure)" changed nothing within 1.5 s (in two different games); I could not tell a dead tap from a slow animation. |
| | **Total** | **6.6** | **FAIL**: rows 4, 5 and 6 are below 7. No stopper. |

### Earlier findings (G8)
| Finding | Status | Evidence |
|---|---|---|
| Row 8 possible stopper: the card panel stayed over the action bar; End turn unreachable | **Fixed.** At 390 and 375 the panel opens above the action bar. The visible × (44x44, at y 427 of 844 and 250 of 667) closes it on the first tap, and End turn, Ready and Kick! stay visible and tappable. No stuck state in 4 games (about 1,000 taps). | R12-shots/dk-panel-open-390.jpg, R12-shots/dk-panel-closed-390.jpg, R12-shots/dk-panel-open-375.jpg, R12-shots/dk-panel-closed-375.jpg, R12-shots/dk-panel-above-bar-375.jpg |
| Row 8: Thief "Let it be" did not move on | **Not seen again**: every "Let X go on" tap in 4 games moved the game on, and there were 0 stuck states. I did not force the Thief backstab case. | R12-shots/dk-g-375.jpg |
| Row 4: hand cards shown as blank faces | **Fixed**: every hand card shows art and name. | R12-shots/dk-g-charity-390.jpg |
| Row 4: names cut ("Gargant", "Hairy Hat-…") | **Partly fixed**: whole at 390 in fights ("Hairy Hat-Muncher"), and in some real fights at 375 ("Pip (you)"). Still cut in the 375 tutorial fight ("Hairy Hat-…", "Pip (Y…"), on rival plates ("Morw…") and in the hand ("Gargantua"). | R12-shots/dk-tut-11-run-375.jpg, R12-shots/dk-g-fight-375.jpg |
| Row 4: a rival's curse banner read as if I was cursed | **Not checked**: no rival kicked a curse while my driver took a screenshot. My own door curses read "A curse! It hit you". | R12-shots/dk-g-charity-390.jpg |
| Row 2/1: tutorial run step said 5 or 6 for an elf | **Fixed**: "4+ escapes (elf +1)" next to "Run 50%". | R12-shots/dk-tut-11-run-390.jpg |
| Row 5: 3D door covered the fight at 375 | **Fixed**: the fight shows monster, hero, Run and Help. | R12-shots/dk-tut-11-run-375.jpg |
| Row 5: "+2 Lv" float over the top bar and Skip | **Partly fixed**: off the top bar now, but over the rival name plates. | R12-shots/dk-tut-01-floats-390.jpg |
| Row 5: strength badge over "Pip (You)" | **Partly fixed**: no overlap at 390. At 375 the name is cut to "Pip (Y…". | R12-shots/dk-tut-11-run-375.jpg |
| Row 3: Start below the fold | **Fixed** at both sizes. | R12-shots/dk-quick-start-onscreen-390.jpg, R12-shots/dk-quick-start-onscreen-375.jpg |
| Row 6: 15-20 s per rival turn; game over 10 min | **Partly fixed**: 4.3-6.2 s per decision on average (3 rivals), max 15-22 s. Games still ran 6-17+ min. | R12-shots/dk-g-17min-noend-375.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | 4 default games as a new player who taps the glowing cards and the glow | Level 1 at the end of all four, cursed 5-15 times. Rivals reached 9-10. "Best moment: surviving." | R12-shots/dk-g-result-390.jpg, R12-shots/dk-g-lv1-late-390.jpg |
| 6 | Timed the 375 game | No winner after 17 min (levels 1, 1, 6, 6). Too long for a phone session. | R12-shots/dk-g-17min-noend-375.jpg |
| 4 | Charity step with 6+ cards | "Too many cards: drag extras to discard" came up most turns. It names no card and no count, and the extras glow only after you pick a card. | R12-shots/dk-g-charity-390.jpg |
| 2/5 | Tutorial step 12 at 375 | The "Lost: Brave Bucket" toast covers the "Caught: Bad Stuff" banner text. | R12-shots/dk-tut-12-toast-375.jpg |
| 5 | Result page at 390 | The name column wraps "Morwen" below its avatar, so the row reads out of line. | R12-shots/dk-g-result-390.jpg |
| 5 | Hand row | Cards scroll sideways. The 6th card starts off screen with no sign that there is more. | R12-shots/dk-g-charity-390.jpg |
| 3 | First screen of a Quick game | The "How to win" card covers the board while a rival is already playing. | R12-shots/dk-g-goalcard-390.jpg |
| 7 (works) | Door kick and monster reveal | The kick, the "A MONSTER!" card and the run odds feel like a real table moment. | R12-shots/dk-panel-above-bar-375.jpg |

---

## 3. perch-and-plume (shelf/W508-perch-gameplay @ b343f526): 6.6, FAIL

What I played:
- Tutorial ("New here? Learn in 5 minutes") to the "You win the year / Tap to play a real game" card, by tapping only the highlighted target. A real game followed both times.
  - 390x844: 21 steps, 23 taps, 24 s.
  - 375x667: 21 steps, 23 taps, 25 s.
  - 0 errors.
- Five full Quick games at the default settings (2 players, Easy rival "Fern", hints off), all to the result screen. Rival speed was the default, not "fast" (the fixer's touch-game.js sets fast).
  - Four as a new player who taps glowing targets and picks an action at random: lost 39-67 (390), 21-69 (375), 21-59 (390), 19-55 (390).
  - One control game with the lightbulb switched on, always taking "Best": lost 61-70 (390).
- 0 page errors, 0 console errors, 0 stuck states, 0 dead taps in 5 games (about 400 taps).
- Dock scrolls needed to reach a glowing target: 2, 0, 0, 0 and 3.
- Rival wait from my last tap to my next decision: 2.8-3.4 s on average, 13-23 s at most (the round-end steps).

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Matches the published rules: 4 rounds of 8/7/6/5 actions; egg cost by column; rows that grow stronger; dice feeder; 3-card tray; brown powers right to left; white and pink powers; tuck and cache; round goals; a 5-item starting hand; 1 of 2 secret bonus cards (on the start screen, below the fold). The row-bonus trades are in the engine, but no game offered me one on screen. |
| 2 | Tutorial teaches | 7 | Every rule in order, one line and one tap each, and it ends in a real game with a "your score, rule by rule" card. Fixed: no step made me wait more than 2 s for its marker. At 375x667, 4 targets start off screen or half under the bottom edge ("Play a bird", the Play and pay buttons, "real game"). Five targets are under 44 px: nest 40x42, tray 36x48, die 56x38, the round strip 359x35. |
| 3 | First 10 seconds | 7 | Fixed: the start screen and the top bar now carry the goal ("Goal: most points in 4 rounds"), and each action tile says what it gives ("take 2 from the feeder", "+2 eggs = +2 pts"). Not fixed: tutorial step 1 still opens on the full board at once (score bar, feeder, tray, 3 rows, food, bonus card, coach bubble, 4 actions). |
| 4 | Turn clarity | 6 | Play and Cancel sit under a clear prompt. But the dock header says "Your birds are working" and "Your birds are at work, one by one" during Fern's turn, even in round 1 when I had no birds, while the pill says "Fern's turn". That is two answers to "whose turn is it?". With hints off (the default), nothing tells a newcomer which action is sensible. |
| 5 | Phone play | 6 | Better: 0-3 dock scrolls per game (6-7 in R6), and Play is never covered. Still: at 375 the hand cards are cut at the bottom edge, and names are cut at both sizes ("Gilded Treecreep", "Fern Woodpeck"). The tutorial at 375 needs 4 scrolls and has 5 targets under 44 px. A big "Your turn" banner covers the three habitat rows at every turn start. |
| 6 | AI and pacing | 5 | A game is about 3.5 min and rival turns average about 3 s. But I lost all 5 games to the default Easy rival: four new-player games by 28-48 points, and the hints-on, always-"Best" game 61-70. R6 won 1 of 2. A newcomer's first win is not likely. |
| 7 | Feel | 7 | Painted birds and habitats. Now an egg token flies to the bird and "+1 egg = +1 point" pops on the row. Food dice leave the feeder. The result table is clear. The dock still carries most of the story. |
| 8 | Bugs | 8 | 2 tutorials and 5 full games: 0 errors, 0 stuck states, 0 dead taps. Not higher because of the wrong "Your birds are working" header (row 4). |
| | **Total** | **6.6** | **FAIL**: rows 4, 5 and 6 are below 7. No stopper. |

### Earlier findings (G4, R6)
| Finding | Status | Evidence |
|---|---|---|
| G4 row 8 STOPPER: dead first tap after Keep these | **Fixed**: 0 dead taps in 5 games, including the first tap of each. | R12-shots/pp-g-r1-390.jpg |
| G4 rows 4/5: Play button under the dock header, stale text | **Fixed** (still fine in all 5 games). | R12-shots/pp-g-hand-375.jpg |
| G4/R6 row 5: 6-7 dock scrolls per game | **Mostly fixed**: 2, 0, 0, 0, 3. | R12-shots/pp-g-hand-375.jpg |
| R6 row 8: dead tap on a glowing "+2 food" row at 375 | **Fixed**: 0 of about 400 taps dead (390 and 375). | R12-shots/pp-g-result-375.jpg |
| G4/R6 row 2: see-step markers late (food 4.9 s, eggs 4.2 s, goal 7.0 s) | **Fixed**: no step over 2 s at either size. | R12-shots/pp-tut-07-white-375.jpg |
| R6 row 2: 3 targets below the fold when the step begins | **Not fixed at 375**: 4 steps start with the target off screen or half cut (390: 1). | R12-shots/pp-tut-03-button-cut-375.jpg |
| G4/R6 row 3: busy first tutorial screen | **Not fixed**. | R12-shots/pp-tut-01-busy-390.jpg |
| R6 row 3: no goal line | **Fixed**: the goal is on the start screen and in the top bar. | R12-shots/pp-start-hand-390.jpg, R12-shots/pp-g-r1-390.jpg |
| R6 row 7: actions resolve as dock text | **Partly fixed**: eggs and food now fly, with point pops on the board. | R12-shots/pp-best-result-390.jpg, R12-shots/pp-g-yourturn-banner-390.jpg |
| G4/R6 row 6: rival too strong | **Not fixed**: Easy is the default (R12-shots/pp-setup-easy-390.jpg), but I lost 5 of 5 to it. | R12-shots/pp-g1-result-390.jpg, R12-shots/pp-g-result-375.jpg, R12-shots/pp-g2-result-390.jpg, R12-shots/pp-best-result-390.jpg |
| R6 row 1: row-bonus trade never offered | **Not seen** in 5 games. | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Played 5 default games (Easy), one with hints on, always taking "Best" | Lost all 5: 39-67, 21-69, 21-59, 19-55, and 61-70 with "Best". | R12-shots/pp-best-result-390.jpg, R12-shots/pp-g-result-375.jpg |
| 4 | Watched Fern's turn in round 1 (I had no birds yet) | The dock header reads "Your birds are working" and the line "Your birds are at work, one by one", next to a "Fern's turn" pill. | R12-shots/pp-g-fernturn-yourbirds-390.jpg, R12-shots/pp-g-fernturn-375.jpg |
| 5 | Tutorial at 375x667 | Steps "Play a bird", the Play and pay buttons and "real game" start off screen or half under the bottom edge. Nest 40x42, tray 36x48 and die 56x38 targets are under 44 px. | R12-shots/pp-tut-03-button-cut-375.jpg, R12-shots/pp-tut-04-375.jpg |
| 5 | Turn start | A large "Your turn / 8 actions left this round" banner covers all three habitat rows. | R12-shots/pp-g-yourturn-banner-390.jpg |
| 5 | Hand strip | Card names are cut ("Gilded Treecreep", "Fern Woodpeck"). At 375 the cards are cut at the bottom edge. | R12-shots/pp-g-hand-375.jpg |
| 6 | Timed rival turns at default speed | Average 2.8-3.4 s, but up to 13-23 s with nothing to do at round ends. | R12-shots/pp-g2-result-390.jpg |
| 2 (works) | Tutorial end | A "Your score, rule by rule" card, then a real game. | R12-shots/pp-tut-end-375.jpg |
