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
| redline-rally | 6.8 | FAIL | 4 Turn clarity 6, 5 Phone 6, 6 AI/pacing 6 (rules stopper fixed) |

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

---

## 3. redline-rally (shelf/W496-redline-gameplay @ b18559a2): 6.8, FAIL

What I played:
- Tutorial ("New here?") to the end card at 375x667 by touch, tapping only the marked targets: 40 steps, 42 taps, 293 s, 0 errors,
  then a real race against four rivals.
- Two full default races (Quick game, defaults: 2 laps, 4 Easy rivals, Hints on) to the podium, as a plain new player: gear up on
  straights, one down near a corner sign, the biggest cards, boost with 5+ heat and no corner close, and in the Discard step throw
  away every Brake and 1 (8 cards per race), else let "Keep all" run.
  - 390x844: **3rd**, 211 s, 22 decisions, 1 spin, boosted 3 times (16 boost questions left to the countdown).
  - 375x667: **2nd**, 211 s, 21 decisions, 0 spins, boosted 2 times (19 left to the countdown).
- 0 page errors, 0 console errors, 0 stuck states, 0 dead taps; every tapped target 44 px or more.
- Go to my next decision: 9.4 s (390) and 9.7 s (375) on average; rival cars about 1.2 s each (max 2.0 s).

Rules check (published rulebook, read online; notes kept locally): the round is shift, play, reveal and move, adrenaline, React
(cooldown and a boost once per turn for 1 heat, after moving), slipstream, corner check, Discard (optional, every round, any card
but Heat or Stress), draw to 7.
- **Discard: fixed.** The step is offered after moving in every round where a card may go (20-21 times per race). My player
  picked Brake and 1 cards and discarded them (8 per race); Heat and Stress cannot be picked. Shot: R19-shots/rr-390-discard.jpg.
- **Boost: fixed.** It is now a question after the reveal ("Speed 7. Boost? Pay 1 heat, flip a card, add it"), asked only with
  engine heat. I chose it 2-3 times per race. Small differences that remain: the question is skipped when even a flip of 1 would
  spin you (a legal, if bad, choice removed), and the line says "flip a card" where the rule flips until a speed card shows.
- Both optional questions now auto-answer after **1.5 s** ("Keep all · 1.0" was already showing 0.5 s after the panel opened). A
  new player who wants to read five cards and choose has to touch the panel within about a second.
With the rule order restored I no longer count this as a stopper.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Discard every round and boost after the reveal now match the rulebook; the rest (order, adrenaline, slipstream, corners, spin-out, cooldown, stress, two-gear shift) still matches. Minor: boost hidden when a flip of 1 would spin you; "flip a card" vs flip until a speed card. |
| 2 | Tutorial teaches | 7 | Now teaches exactly what races do: discard a 3 after moving (step 33-34), boost after the reveal (38-39). 40 one-tap steps in rule order, one line each, ends in a real race. Long (about 5 min). Brake and Burst get one line only, and the 1.5 s countdowns never appear in the tutorial, so the first race surprises you. |
| 3 | First 10 seconds | 7 | Clear title and Play button; the goal card covers laps, gears, corners, heat, Brake/Burst and Suggest (still five lines). |
| 4 | Turn clarity | 6 | At 390 the dashboard, corner signs ("5 in 2, 6 in 4"), phase strip and preview line are clear. At 375, while planning, my car was not on the board in 3 of 4 shots (grass, trees, a rival), and the gear / heat / next-corner line the fixer moved into the dock was not visible, so I could not see how far the next corner was. The boost and discard questions vanish after 1.5 s. |
| 5 | Phone play | 6 | Fixed: no dashboard over the 375 board, all targets 44 px or more, text 14 px or more. But "board-first" fails at 375: the camera often shows empty grass instead of your car during planning. On the 375 result card the Race again / Title buttons sit over the 4th and 5th rows. |
| 6 | AI and pacing | 6 | Better: a plain new player made the podium twice (3rd, 2nd), up from 5th and 5th. But no win in 2 races, and the wait from Go to my next decision grew to 9.4-9.7 s (R9: 7.4-8.0), with two 1.5 s countdowns every round. A race is 3.5 min, a good length. |
| 7 | Feel | 7 | Cars slide, "Slipstream +2" pops, start lights, a podium with "heat burned · spin-outs · slipstreams". The countdown questions make each round feel hurried, not chosen. |
| 8 | Bugs | 8 | Tutorial and 2 races: 0 errors, 0 stuck states, 0 dead taps. Wrong-state copy: after a race with 0 spin-outs the podium says "One cleaner corner and it is yours." |
| | **Total** | **6.8** | **FAIL**: rows 4, 5 and 6 are below 7. The rules stopper is fixed. |

### Earlier findings (G5, R3, R9)
| Finding | Status | Evidence |
|---|---|---|
| R9 row 1 STOPPER: discard only with 3+ slow cards, every third round | **Fixed**: offered every round a card may go; any non-Heat, non-Stress card. | R19-shots/rr-390-discard.jpg |
| R9 row 1: boost set before the reveal and auto-cancelled | **Fixed**: asked after the reveal; still skipped when a flip of 1 would spin you. | R19-shots/rr-375-tut-39.jpg |
| R9 row 2: tutorial teaches discard and boost unlike races | **Fixed**: tutorial and races now agree. | R19-shots/rr-375-tut-33.jpg, rr-375-tut-39.jpg |
| R9 row 6: plain newcomer 5th and 5th on Easy | **Partly fixed**: 3rd and 2nd, no win. | R19-shots/rr-390-result.jpg, rr-375-result.jpg |
| R9 row 5: Boost button 52x40 | **Fixed**: the boost question buttons are full width; no target under 44 px. | R19-shots/rr-375-tut-39.jpg |
| R9 row 5: dashboard over the 375 board | **Fixed** (dashboard removed at 375), but see the camera finding. | R19-shots/rr-375-plan1.jpg |
| R9 row 5/7: pops piled on cars and signs, coach bubble on the minimap | **Mostly fixed**: one "Good: ..." bubble at top left, clear of the minimap. | R19-shots/rr-390-plan2.jpg |
| R9 row 4: discard question appears without a reason | **Fixed**: it appears every round a card may go. | R19-shots/rr-390-discard.jpg |
| R9 row 8: "0-3 question taps" claim | **Changed**: 20-21 boost and 20-21 discard questions per race now; most auto-answer after 1.5 s. | R19-shots/rr-390-discard.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4/5 | Planned my rounds at 375x667 | In 3 of 4 planning shots my car is not on the board (grass and trees, or a rival); no gear / heat / next-corner line is shown in the dock. | R19-shots/rr-375-plan2.jpg, R19-shots/rr-375-plan3.jpg |
| 1/7 | Reached the Discard step at 390 and waited 0.5 s | "Keep all · 1.0" was already counting; after 1.5 s the step closes by itself. The same for "No boost". | R19-shots/rr-390-discard.jpg |
| 6 | Timed Go to my next decision in 2 races | 9.4 s and 9.7 s on average (R9: 7.4-8.0 s). | R19-shots/rr-390-plan2.jpg |
| 6 | Two default races as a plain new player | 3rd at 390, 2nd at 375; no win. | R19-shots/rr-390-result.jpg, R19-shots/rr-375-result.jpg |
| 8 | Finished 2nd at 375 with 0 spin-outs | The podium says "One cleaner corner and it is yours." | R19-shots/rr-375-result.jpg |
| 5 | Looked at the result card at 375 | Race again / Title sit over the 4th and 5th rows of the table. | R19-shots/rr-375-result.jpg |
| 1 | Read the boost line | "Pay 1 heat, flip a card, add it": the rule flips until a speed card shows. | R19-shots/rr-375-tut-39.jpg |
| 2 | Tutorial at 375 | 40 steps, about 5 minutes by touch; Brake and Burst are one line; no countdown is shown before the first race. | R19-shots/rr-375-tut-end.jpg |

Not tested: the "tap anywhere outside the panel takes the default" path, and hot-seat or online modes.
