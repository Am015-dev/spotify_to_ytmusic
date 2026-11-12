# R19 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its own branch with build-all.py, served next to its
games/<slug> media folder, and played with Playwright `page.touchscreen.tap` (hasTouch, isMobile, deviceScaleFactor 1) at 390x844
and 375x667. Every tap goes to the centre of an element that elementFromPoint proves is on top. I wrote my own touch drivers; I did
not use the fixers' walk scripts as-is (see the crown note: its helper taps with the mouse, not touch). Rules were checked against
the published rulebook online; notes stay in a local folder outside the repo.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| crown-city-smash | 7.5 | PASS | 4 Turn clarity 7, 5 Phone 7, 6 AI/pacing 7, 7 Feel 7 |

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
