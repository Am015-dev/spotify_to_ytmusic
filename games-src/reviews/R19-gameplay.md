# R19 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its own branch with build-all.py, served next to its
games/<slug> media folder, and played with Playwright `page.touchscreen.tap` (hasTouch, isMobile, deviceScaleFactor 1) at 390x844
and 375x667. Every tap goes to the centre of an element that elementFromPoint proves is on top. I wrote my own touch drivers; I did
not use the fixers' walk scripts as-is (see the crown note: its helper taps with the mouse, not touch). Rules were checked against
the published rulebook online; notes stay in a local folder outside the repo.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| crown-city-smash | 7.5 | PASS | 4 Turn clarity 7, 5 Phone 7, 6 AI/pacing 7, 7 Feel 7 |
| perch-and-plume | 6.9 | FAIL | 5 Phone 6, 6 AI/pacing 6 |

---

## 1. crown-city-smash (shelf/W500-crown-gameplay @ 3bab7855): 7.5, PASS

What I played:
- Tutorial ("New here? Learn in 5 minutes") to the end card at 390x844 by touch: 26 steps, 32 taps, 145 s, 0 errors, then
  "Play a real game" started a real game.
- Five full games on the default level (Customise shows Easy; 3 Easy rivals) to the result screen, as a new player: keep any number
  with 2+ dice, claws and energy, hearts below 7 ♥ outside Downtown, use every roll, stay unless 5 ♥ or less, buy the first
  affordable card after reading it (my buy step only worked in the last game; the first four were played without buying).
  - 390 g1: **won**, 21 ★, 3.7 min. 375 g1: **2nd**, 18 ★ (Boltbox 22 ★), 3.7 min. 390 g2: **won**, 20 ★, 3.4 min.
  - 375 g2: **won**, 22 ★, 4.1 min. 390 g3: **won**, 21 ★, 2.8 min, bought Leech Tendrils after tapping it and reading it.
  - Won 4 of 5. 0 page errors, 0 console errors, 0 stuck states, 0 dead taps (about 620 taps).
- Wait from my last action to my next turn, measured in the page without tapping Skip: 3.7, 5.3, 5.4, 6.0 and 6.8 s on
  average, 8.0 s at most. R7 measured 13.5-15.8 s, up to 18.8 s.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and correct: 6 dice, 3 rolls, number sets with +1 per extra die, claws, hearts not in Downtown, +1 ★ for entering and +2 ★ for starting a turn there, stay or yield only when hit, 2 ⚡ sweep, 20 ★ or last standing. |
| 2 | Tutorial teaches | 8 | 26 one-tap steps in rule order, each one short line, ending on "Play a real game". Fixed: step 4 now says "Three 3s = 3★, 2s = 2★, 1s = 1★. A pair: 0." and step 24 teaches the extra die. |
| 3 | First 10 seconds | 8 | "First to 20 ★ wins", a big "New here?" button and "Play now (recommended)". The intro card has 3 bullets and one button. |
| 4 | Turn clarity | 7 | The pill always says what to do. The new recap line ("Boltbox: +1★ +1⚡ · took 👑 · hit Shroomhulk -1") says what a rival did. Tapping a card opens its art, a PERMANENT tag, its text and "Buy · 4 ⚡ / Not now". Small: the pill says "Rolling the dice..." on my own turn while Roll is waiting for me. |
| 5 | Phone play | 7 | Targets 44 px or more at 390. At 375 the dice are 42-43 px. In 3 of my shots a round token with a glow sits over the name and star count of the first chip ("Bolt…x"), so the crown-off-the-name fix moved the problem rather than removing it. |
| 6 | AI and pacing | 7 | Fixed: a new player won 4 of 5 on the default level, and the wait between turns is about 4-7 s instead of 14-16 s. Games take 2.8-4.1 min. With 3 rivals it is still about 6 s of watching per turn. The Easy rivals knock each other out (2 KOs in 3 of 5 games), so wins come quickly. |
| 7 | Feel | 7 | Dice tumble and lock, cards fly, heart and star pops on the board, a painted win card. The 3D city is busy and the board labels ("HEAL", "+1⚡") are small. |
| 8 | Bugs | 8 | Tutorial plus 5 full games: 0 errors, 0 stuck states, 0 dead taps. Not higher because of the misleading "Rolling the dice..." pill and the token over a chip name. |
| | **Total** | **7.5** | **PASS**: every row is 7 or more, no stopper. |

### Earlier findings (G7, R7)
| Finding | Status | Evidence |
|---|---|---|
| R7 row 6: newcomer lost both Easy games | **Fixed**: won 4 of 5 by touch (one buying, four not). | R19-shots/crown-390-g1result.jpg, crown-375-g2result.jpg, crown-390-g3result.jpg, crown-375-g1result.jpg (the loss: 2nd, 18 ★) |
| R7 row 6: 13.5-15.8 s between my turns | **Fixed**: 3.7-6.8 s average, 8.0 s at most, without Skip. | R19-shots/crown-390-g3turn3.jpg (recap line) |
| R7 row 2: 1s and 2s never shown to score less | **Fixed**: step 4 says so. | R19-shots/crown-390-tut-04.jpg |
| R7 row 2: keep-step ring on the already kept die | **Fixed** as far as I saw: my walk tapped the marked holes in order and never un-kept a die. | R19-shots/crown-390-tut-04.jpg |
| R7 row 5: Downtown holder's name cut ("Boltb…") | **Partly fixed**: the crown no longer cuts the name, but a round token covers the first chip's name and stars in 3 shots. | R19-shots/crown-390-g2turn1.jpg, crown-375-g1turn2.jpg |
| G7 row 4: cards bought blind | **Fixed** (tap opens the card text and Buy). | R19-shots/crown-390-g3cardread.jpg |
| G7 row 4: Shed Skin prompt cut | **Not seen** (the card never came up). | n/a |
| G7 row 5: tray hides Downtown at 375 | **Fixed** ("Downtown: You" tag above the tray). | R19-shots/crown-375-g1turn2.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | Looked at the rival chips during my roll at 390 and 375 | A round glowing token sits over the first chip's name and star count ("Bolt…x"). | R19-shots/crown-390-g2turn1.jpg, R19-shots/crown-375-g1turn2.jpg |
| 5 | Tapped my dice at 375x667 | Dice are 42x42 and 43x43 px, just under 44. | R19-shots/crown-375-g1turn2.jpg |
| 4 | Started my turn | The pill says "Rolling the dice..." while the game waits for my Roll or SMASH! tap. | R19-shots/crown-390-g3turn3.jpg |
| 6 | Five default games as a newcomer | Won 4 of 5. In 3 of 5 games two rivals knocked each other out, so the field is soft; a 2.8 min win felt quick. | R19-shots/crown-390-g3result.jpg |
| 8 (method) | Read the fixer's touch walk (`games-src/kot/playable/lib.js`) | Its tap helper uses `page.mouse.click`, not `touchscreen.tap`, so its "by touch" numbers are mouse numbers. My own touch runs agree with its results. | n/a |
| 2/4 (works) | Bought a card in a real game | Tap opens the card with art, PERMANENT tag, text, "Buy · 4 ⚡" and "Not now". | R19-shots/crown-390-g3cardread.jpg |

---

## 2. perch-and-plume (shelf/W508-perch-gameplay @ badb8e38): 6.9, FAIL

What I played:
- Tutorial ("New here? Learn in 5 minutes") to its last step at 375x667, tapping only the highlighted target: 21 steps, 23 taps,
  78 s, 0 errors, then a real 4-round game at its starting hand. All 21 targets started on screen and were 44x44 or more.
- Three full Quick games at the default settings (2 players, Easy rival Fern, default rival speed, not "fast"), to the result:
  - 390, hints **off** (the default), a newcomer tapping a glowing thing they can see: **lost 40-59**, 230 s, 89 taps.
  - 375, hints off, same newcomer: **lost 40-59**, 237 s, 85 taps.
  - 390, hints switched **on** (lightbulb), Best half the time, else a random glowing target: **won 57-44**, 252 s, 112 taps,
    Best shown on 55 of 56 decisions.
- 0 page errors, 0 console errors, 0 stuck states, 0 dead taps, 0 dock scrolls in 3 games.
- Rival wait from my last tap to my next turn: 3.2-3.7 s on average (median 0.6 s), 14-19 s at most (round ends).

The fixer measured with hints on and the rival on "fast" (its touch-game.js writes both into storage). A new player gets hints off
and normal speed, so its "won 4 of 8" does not describe the default game.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | As R12: 4 rounds of 8/7/6/5 actions, egg cost by column, rows that grow, feeder dice, 3-card tray, brown powers right to left, white and pink powers, tuck and cache, round goals, 5-item start, a secret bonus card. The row-bonus trades did not come up in my 3 games. |
| 2 | Tutorial teaches | 7 | Fixed at 375: every target on screen and 44 px or more, 78 s, one line and one tap each, ends in a real game. Still: step 1 asks you to "Tap the score" while a "Best" badge glows on "Play a bird"; the score already reads "You 5 leads" before you have done anything; the shrinking 8/7/6/5 actions are never taught ("Real games: 4 rounds"). |
| 3 | First 10 seconds | 7 | The starting-hand screen opens with "Goal: most points after 4 rounds" and a pre-picked start with "Keep these". The first board is busy: score bar, feeder, tray, 3 rows and 4 actions at once. |
| 4 | Turn clarity | 7 | The prompt always says what to tap ("Tap a glowing bird in the tray, or the deck, to take a card (1 left)") and action tiles say what they give. With hints on, Best marks the choice and "What should I do?" sits under the prompt. With hints off (the default) nothing says which action is sensible. |
| 5 | Phone play | 6 | Hand cards are 37x50 px (36x48 at 375) and board birds 40x40 at 375, under 44. Tray cards are about 33x45 and show only a points number, so you cannot read which bird you take. At 375 the hand cards are cut at the bottom edge. At the first turn the "Round 1: 8 actions each. Goal: ..." line is drawn over the score chips. |
| 6 | AI and pacing | 6 | On the default settings a newcomer lost both games 40-59; only with the lightbulb on (which nothing makes a newcomer turn on) did the mixed player win, 57-44. Rival turns are quick (median 0.6 s), but round ends still wait 14-19 s with nothing to do. A game is about 4 min. |
| 7 | Feel | 7 | Painted birds and habitats, eggs and food fly, point pops on the rows, a clear result table. |
| 8 | Bugs | 8 | 1 tutorial and 3 full games: 0 errors, 0 stuck states, 0 dead taps. Not higher because of the overlapping round line. |
| | **Total** | **6.9** | **FAIL**: rows 5 and 6 are below 7. No stopper. |

### Earlier findings (G4, R6, R12)
| Finding | Status | Evidence |
|---|---|---|
| R12 row 6: lost 5/5 to Easy | **Partly fixed**: won 1 of 1 with hints on; lost 2 of 2 on the default (hints off). | R19-shots/pp-390-best-result.jpg, pp-390-def-result.jpg, pp-375-def-result.jpg |
| R12 row 6: round-end waits 13-23 s | **Not fixed**: 14-19 s at most. | R19-shots/pp-390-def-turn2.jpg |
| R12 row 4: "Your birds are working" during Fern's turn | **Not checked** in a shot (I did not catch Fern's first turn); no wrong header seen in my shots. | n/a |
| R12 row 5: tutorial targets off screen / under 44 at 375 | **Fixed**: 21 of 21 on screen, all 44x44 or more. | R19-shots/pp-375-tut-01.jpg, pp-375-tut-09.jpg |
| R12 row 5: hand names cut | **Fixed** for names (whole names, e.g. "Copper Warble…" is cut only by the screen edge); cards still cut at the bottom at 375. | R19-shots/pp-375-def-turn2.jpg |
| R12 row 5: big "Your turn" banner over the rows | **Not seen** in my shots. | R19-shots/pp-390-best-turn1.jpg |
| G4/R6/R12 row 3: busy first tutorial screen | **Not fixed**. | R19-shots/pp-375-tut-01.jpg |
| R6/R12 row 1: row-bonus trade never offered | **Not seen** in 3 games. | n/a |
| Dead taps / first-tap stopper | **Fixed**: 0 dead taps in 3 games. | R19-shots/pp-390-def-turn2.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Two default games (hints off, normal speed) as a newcomer tapping glowing targets | Lost 40-59 at 390 and 40-59 at 375. | R19-shots/pp-390-def-result.jpg, R19-shots/pp-375-def-result.jpg |
| 6 | Turned the lightbulb on, took Best half the time | Won 57-44. The game is winnable only with a setting that is off by default. | R19-shots/pp-390-best-result.jpg |
| 5 | Drew from the tray at 375 and 390 | Tray cards are about 33x45 px with only a points number; the bird and its cost cannot be read before taking it. | R19-shots/pp-375-def-turn2.jpg, R19-shots/pp-390-def-turn2.jpg |
| 5 | Tapped hand cards and board birds | Hand cards 37x50 (390) and 36x48 (375); board birds 40x40 at 375. | R19-shots/pp-390-best-turn1.jpg |
| 5 | First turn, hints on, 390 | The "Round 1: 8 actions each. Goal: Full egg sets (1 per row)" line overlaps both score chips, and a "Swipe your birds" toast covers the food. | R19-shots/pp-390-best-turn1.jpg |
| 2 | Tutorial step 1 at 375 | "Tap the score" while a "Best" badge glows on "Play a bird"; the score already says "You 5 leads". | R19-shots/pp-375-tut-01.jpg |
| 2 | Tutorial step 9 | A stale "Good: +2 points ... the best move this turn" line is half cut at the top of the dock. | R19-shots/pp-375-tut-09.jpg |
