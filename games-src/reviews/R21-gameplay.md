# R21 gameplay re-review (strict), 12 Nov 2026

Reviewer R21. Scored by `GAMEPLAY-RUBRIC.md`. I changed no game code and did not trust the fixers' notes or their benches.

How I played: I built each branch with the game's own `build.py` and served the page over http next to its `games/<slug>/media` folder.
I used Playwright phone contexts (isMobile, hasTouch, deviceScaleFactor 1) and only `touchscreen.tap`. My drivers read the screen
(and, for vale, the game state) to decide, but every move was a tap at the centre of a visible, uncovered control. I never called a game function.
Rival speed stayed at the default (no AI delay shortened, no tap-to-speed-up). As a "new player" I tapped glowing targets at random, and
took the game's suggestion only where the run says so. Up to 4 browsers ran at once on 4 cores, so waits may be slightly long.
Rules were checked against the published rulebooks and rule summaries online; notes stayed local and are not committed.
Screenshots: `games-src/reviews/R21-shots/`.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| vale-of-banners | 7.0 | FAIL | 4 Turn clarity 6, 6 AI and pacing 6 |
| emberclimb | 6.3 | FAIL | 6 AI and pacing 5; 1 Rules 6, 2 Tutorial 6, 4 Turn clarity 6, 5 Phone 6 |
| hollowbough | 7.0 | FAIL | 6 AI and pacing 6 |

---

## 1. vale-of-banners (shelf/W505-vale-gameplay @ 3e7ccea6): 7.0, FAIL

What I played:
- Tutorial ("New? Learn to play") to the "You know how to play" card at 390x844 and 375x667: 48 steps, 71 taps, 67-68 s each.
  Every target was on screen, uncovered and at least 44x44. Longest silent wait 2.3 s (the 10 s rival gap from R12 is gone). 0 errors.
- Five full Quick games against the default Gentle rival, all to the result screen:

| Game | Size | How I played | Result | Rival wait avg / max |
|---|---|---|---|---|
| g1 | 390 | defaults (★ hints are OFF by default), random glowing targets | lost 57-82 | 1.2 s / 4.5 s |
| g2 | 375 | defaults, random glowing targets | lost 40-77 | 1.1 s / 3.9 s |
| g4 | 375 | turned ★ on (top-bar ☆), took ★ about half the time | **won 95-71** | 2.5 s / 8.9 s |
| g5 | 390 | ★ on, ★ about half the time | lost 91-95 | 2.5 s / 8.8 s |
| g3 | 390 | ★ on, ★ every time | **won 132-38** | 2.1 s / 6.0 s |

- Games took 2.6-4.4 min. 0 page errors, 0 console errors, 0 stuck states in all 5 games and both tutorials.
- With ★ on, 20-27% of my decisions had no ★ on screen (many of these were End turn moments, so "a ★ on every decision" is roughly true).

**The star question.** The ★ decides the game. Ignoring it, a new player lost both games by 25 and 37. Obeying it every time won by
94 points against Gentle. Half and half was a coin flip (won by 24, lost by 4). The ★ is a small marker with no reason attached: it never
says *why* (points, region bonus, goods), and once (g3 decision 1) the prompt said "Drag your 6 onto stall 6 to take a tile" while the ★ sat on
"1 Wool" in my goods. So the ★ plays the game for the player instead of teaching it. It is also off by default: the only way to turn it on is an
unlabelled ☆ icon in the top bar, while the result card says "Follow the ★ Best hint next time".

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and still right: 5 seasons x 5 rounds, 2 dice + white goods die, take/build/sell/2 workers, ±1 worker with 6/1 wrap, back lane for 2 silver once per turn, storage 3, at most 3 goods kinds, region bonus by size plus season, colour bonus 5/2, mines pay silver, end scoring, tie on empty spaces. No rule broke in 5 games. |
| 2 | Tutorial teaches | 7 | Fixed: no long waits (max 2.3 s), every step one line and one tap, ends in a real game. Still: on step 3 the ★ Best badge marks the Keep on stall 1 while the coach says "Tap the mine" on stall 4. The coach bubble still covers the prompt line on step 26. Between steps 14 and 15 the rival still jumps from 0 to 27 points and "+16 region full" / "+5 colour finished" pops fill the board without explanation. |
| 3 | First 10 seconds | 7 | Clear title and Play. Quick game still goes through a setup screen, then a 4-point goal card while "Azure is thinking..." plays behind it. |
| 4 | Turn clarity | 6 | Whose turn, dice left, glowing targets and the tile card are clear. But the ★ (the fixer's main fix) is off by default behind an unlabelled ☆ icon, and when on it says what, never why. The build prompt says "+N is the points" while the spaces show "1/3", "2/7" region-fill counts. Season changes are still a 3-line paragraph. The red worker badges on market tiles are still unexplained on the board. |
| 5 | Phone play | 7 | Every needed control I tapped was on screen and uncovered at both sizes, targets 44 px+. The "Your turn" banner lies over the score strip, and "+2 goods sold" pops sit on top of it. |
| 6 | AI and pacing | 6 | Brisk: rival waits 1.1-2.5 s on average, a game 2.6-4.4 min; max 8.9 s with 3 browsers running. But on defaults a new player lost 2 of 2 (by 25 and 37). A win needs the hidden ★, and then it is a rout (132-38): there is no setting where a new player's own choices win. |
| 7 | Feel | 7 | Dice and tiles fly, regions flash, pops, camera follows the glow, full result table with honest copy ("A clear loss, 37 points behind"). |
| 8 | Bugs | 8 | 2 tutorials and 5 games: 0 errors, 0 stuck states, 0 dead taps. |
| | **Total** | **7.0** | **FAIL**: rows 4 and 6 are below 7. No stopper. |

### Earlier findings (R12)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: new player lost 4 of 5 to Gentle | **Not fixed for a new player.** Defaults: lost 2 of 2. ★ half the time: 1 of 2. ★ every time: won by 94. | R21-shots/vale-g1-nohints-loss-390.jpg, vale-g2-nohints-loss-375.jpg, vale-g4-mix-win-375.jpg, vale-g5-mix-loss-390.jpg, vale-g3-star-win-132-38-390.jpg |
| Row 2: 10 s silent rival gap in the tutorial | **Fixed** (max 2.3 s). The 0 → 27 point jump is still shown with no line. | vale-tut-15-jump-pops-375.jpg |
| Row 8: coach bubble over the prompt on step 26, "Chain of 2" over the estate | **Not fixed.** | vale-tut-26-bubble-over-prompt-375.jpg |
| Row 5: names cut in the market at 375 ("Moot Hal") | **Fixed** (whole words: "4 Geese", "Inn", "4 Sheep"). | vale-tut-03-star-vs-coach-375.jpg |
| Row 5: "+N region full" pop over the market | **Partly fixed**: now pops over the estate and the turn banner. | vale-tut-15-jump-pops-375.jpg |
| Row 3: goal card while the rival already moves | **Not fixed.** | vale-g-goalcard-390.jpg |
| Row 4: season change is a 3-line paragraph | **Not fixed.** | vale-g-season-paragraph-390.jpg |
| Row 4: red worker badge unexplained | **Not fixed.** | vale-g3-star-fraction-labels-390.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4/6 | Started a Quick game on defaults | No ★ anywhere: hints are off. The only switch is an unlabelled ☆ icon in the top bar. The result card still says "Follow the ★ Best hint". | vale-g-goalcard-390.jpg, vale-g1-nohints-loss-390.jpg |
| 6 | Took ★ at every decision (g3) | Won 132-38. The ★ alone beats Gentle by 94; own choices lose by 25-37. The star plays the game for the player. | vale-g3-star-win-132-38-390.jpg |
| 4 | g3 decision 1 with ★ on | Prompt: "Drag your 6 onto stall 6 to take a tile"; the ★ sits on "1 Wool" in my goods. Two different instructions at once, no reason given. | vale-g3-star-prompt-mismatch-390.jpg |
| 2 | Tutorial step 3 | Coach: "Tap the mine" (stall 4); a "★ Best" badge sits on the Keep at stall 1. | vale-tut-03-star-vs-coach-375.jpg |
| 4 | Placing a tile mid-game | Prompt: "Put it on a glowing space. +N is the points." The spaces show "1/3", "2/7", not +N. | vale-g3-star-fraction-labels-390.jpg |
| 5/7 | Watched a sell during my turn | "+2 goods sold" pop overlaps the "Your turn" banner, which itself lies over the score strip. | vale-g3-star-fraction-labels-390.jpg |

---

## 2. emberclimb (shelf/W485-emberclimb-bench @ 3612f9ef): 6.3, FAIL

What I played:
- Tutorial ("New here? Learn in 5 minutes") from fresh storage at 390x844: 14 guided steps (32 s, every target 44 px+, 0 errors), then the
  coached 7-floor climb by random playable cards and random glowing rooms: fight, chest, campfire, shop, two-warden elite, boss.
  **I lost the coached climb at the boss** ("FALLEN, felled by Mire Behemoth (boss)", 1.9 min). At 375x667 the coached climb reached the elite and
  won it, then my driver could not go on at the elite reward (see row 5).
- Quick game (now "1 act" by default, confirmed) as a new player, Warrior, random playable cards, End turn when nothing plays, random rooms:
  - 375 seed 2: **died on floor 1** to an Ash Imp after 0.7 min (its 8x3 became 16x3 after it gained Strength; 80 → 0 HP in 4 turns).
  - 375 seed 5: reached the boss on floor 10 and died to Ashen Wraith (2.5 min).
  - (A third Quick game at 390 did not reach a result within my time cap; I give no result for it.)
- 0 page errors, 0 console errors, 0 stuck states in every run. Foe turns take under 1 s.

**Fidelity check (every foe, card and rule against the published tabletop game).**
- Turn: 3 energy, draw 5, Block soaks, one foe per hero row, die roll sets die-moves for the round, potions, relics, chest = relic, campfire Rest or Smith,
  shop, elites, boss ends the act: all match.
- One scale (tabletop x8): Rest 24 (= heal 3), Weak "hit 8 less" (= -1), Strength "adds 8 to every hit" (= +1), potions 32/16/24: consistent.
  **Not consistent:** the status chip still reads "Strength 1: +1 per hit" on foes, while their hits go from 8 to 16.
- Act 1 foes map onto the published act-1 roster (cultist-type ritual foe, die-driven brute, small bugs, slimes, the three elites including three
  sentries). No phase 2 exists in the data and the invented "Warden Captain" boss is no longer used by any encounter (dead data only).
- **Invented / not faithful:** each act has one fixed boss instead of a random pick from that act's boss deck, and acts 2 and 3 reuse act-1 boss
  types (Ashen Wraith is the act-1 burn-ghost boss, Gate Wyrm the act-1 guardian-type boss) and act-1 elites (Thorn Brute, Sleeper Statue).
  Act 2/3 regular foes and Tomb King / Skyclaw are invented stand-ins. The optional final act needs no keys. With "1 act" as the default this
  matters less, but "3 acts" is offered as the full game.
- The boss split (when Mire Behemoth falls, 1 big + 2 small slimes per hero join next round): I could not confirm the tabletop timing online,
  and I never saw it happen (I never killed the boss).
- Campfire text says "Rest to heal 24 HP (the tabletop heal 3)": it names the source medium to the player.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 6 | Act 1 and the core turn match on one x8 scale. But foe Strength chips say "+1 per hit" while hits rise by 8, acts 2-3 reuse act-1 bosses/elites and have one fixed boss each, and the split could not be confirmed. |
| 2 | Tutorial teaches | 6 | 14 one-line steps, then every room met by doing. Still 4 Next-only steps (goal, energy, pattern, map). The coached climb can be lost at the boss with random-ish play (I lost it at 390), and it ends on a plain "FALLEN" result like a real loss. |
| 3 | First 10 seconds | 7 | Big "New here? Learn in 5 minutes"; step 1 points at the boss's intent with "Goal: beat the boss on top." |
| 4 | Turn clarity | 6 | Fixed: the prompt pill no longer covers the intent. Still: "Strength 1: +1 per hit" is wrong on the x8 scale; the coach said "Fully blocked. That is how a warden fights." while I had no Block and 48 incoming; a "Do the glowing step first" toast sits on the prompt line. |
| 5 | Phone play | 6 | Hand inside the screen, cards 106x140+, End turn 112x48, coach strip above the dock. But at 375 the elite reward (potion + relic + 3 cards) pushes the card row under the bottom "Reward" bar: only the card titles show and Skip / Continue are below the fold, so my driver found nothing uncovered to tap. |
| 6 | AI and pacing | 5 | Foe turns are quick and Quick game is 1 act. But 0 wins in 3 finished climbs by a new player: died on floor 1 in 0.7 min, died at the boss, and lost the coached tutorial climb. A floor-1 "weak" foe hits 16x3 after one Strength. The fixer's "newcomer bot" plays the best AI move 70% of the time (bench-newplayer.js), which is not a new player. |
| 7 | Feel | 7 | Damage pops, cards fly, "+2 Dazed" splash, fight grade ("Poor fight: took 48 HP"), boss art, painted reward screen. |
| 8 | Bugs | 7 | 0 errors, 0 stuck in 5 runs. Wrong coach line (above) and the 375 elite reward layout. |
| | **Total** | **6.3** | **FAIL**: rows 1, 2, 4, 5 and 6 are below 7. No stopper. |

### Earlier findings (R16)
| Finding | Status | Evidence |
|---|---|---|
| Row 4/5: prompt pill over the enemy intent | **Fixed.** | R21-shots/ember-elite-390.jpg |
| Row 4/5: coach toasts over HP, gold, Hints, Rules | **Fixed**: the coach is a strip above the dock. | ember-elite-390.jpg, ember-boss-strength-label-390.jpg |
| Row 5: second elite foe cut at 375 | **Not re-checked at 375** (the 375 elite shot was not taken before the reward). At 390 both wardens fit. | ember-elite-390.jpg |
| Row 8/5: stale boss tip over "CLIMB WON!" | **Not checked**: I never won a climb. | n/a |
| Row 5: reward text cut at 375 | **Fixed** for the normal reward ("Deal 8. Gain 8 Block." wraps). New: the elite reward at 375 falls below the fold. | ember-reward-375.jpg, ember-elite-reward-below-fold-375.jpg |
| Row 6: Quick game defaults to 3 acts | **Fixed** ("1 act" selected). | ember-quick-setup-1act-375.jpg |
| Row 2: 26-bullet end card | **Not checked**: I lost the coached climb, so the end card did not show. | ember-tut-climb-fallen-390.jpg |
| Row 2: Next-only steps | **Not fixed** (goal, energy, pattern, map). | ember-tut-01-next-390.jpg |
| Row 1: mixed scales | **Mostly fixed** (x8 everywhere I checked) except the foe Strength chip. | ember-boss-strength-label-390.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Quick game at 375, random playable cards | Died on floor 1 to an Ash Imp in 0.7 min: 8x3, then Strength 1 made it 16x3; 80 → 48 → 8 → 0 HP. | ember-q-floor1-imp-375.jpg, ember-q-fallen-floor1-375.jpg |
| 6/2 | Coached tutorial climb at 390, random cards | Lost at the boss: "FALLEN, felled by Mire Behemoth (boss)". The tutorial climb is losable and ends like a real loss. | ember-tut-climb-fallen-390.jpg |
| 1/4 | Boss and Ash Imp after they gained Strength | Chip reads "Strength 1: +1 per hit"; the hit grew by 8 (8 → 16, 40 → 48). | ember-boss-strength-label-390.jpg, ember-q-floor1-imp-375.jpg |
| 5 | Won the elite at 375 (potion + relic + cards) | The 3 card choices slide under the bottom "Reward" bar (titles only), Skip and Continue are off screen. | ember-elite-reward-below-fold-375.jpg |
| 4 | Boss fight, 0 Block, Incoming 48 | Coach: "Fully blocked. That is how a warden fights." | ember-boss-strength-label-390.jpg |
| 1 | Data check | Acts 2-3 reuse act-1 boss types and elites; one fixed boss per act. | n/a (data in src/data.js ENCA/ACTBOSS) |
| 6 | Quick game at 375, seed 5 | Reached the boss on floor 10 and died to Ashen Wraith (2.5 min). | ember-q2-fallen-boss-375.jpg |

---

## 3. hollowbough (shelf/W482-hollowbough @ 17de9e5a): 7.0, FAIL

What I played:
- Tutorial ("New here? Learn in 5 minutes") at 390x844 and 375x667: 27 steps, 44 taps, 37 s each, every target on screen and uncovered,
  longest wait 1.4 s, 0 errors. Then "Play a real game".
- Two full games vs computer (title → Play → "Play now", default level) by random glowing targets and buttons, to the result screen:
  - 390: **won 26-13** in 1.3 min. The rival showed "done" with only **4 cards in its city** (Cards 4, tokens 4, Journey 5).
  - 375: **lost 27-30** in 3.5 min (rival 21 cards in city).
  - Rival waits: median 0.9 s / 1.2 s, max 1.4 s / 1.6 s. 0 page errors, 0 console errors, 0 stuck states.
- Rules (re-checked online): 2-player 8 basic places + 3 forest + Haven, 2/+1/+1/+2 workers per season, green production in Spring and Autumn,
  2 meadow cards in Summer, hand 8, city 15, Journey Autumn only, 4 special events, ties to most events. All match; nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right (see above). |
| 2 | Tutorial teaches | 7 | Fixed: step 1 now says "You start with 3 built cards, worth 6 points". Still unearned. The Journey, the Inn and special events are only "Tap it" (no discard, no purchase), and Autumn is never played ("Tap Pass twice to end now"). At 375 the step-1 bubble covers the goods row and the tabs. |
| 3 | First 10 seconds | 7 | "New here? Learn in 5 minutes" first; Play → "Play now"; goal card; glowing places. |
| 4 | Turn clarity | 7 | Choice prompts are plain ("Pick a resource in the cost to swap." with three full-width "Pay 1 twig instead of 1 pebble" buttons; "0 of 3 discarded"). The prompt is still a small top-left pill. The score delta now shows inside my chip as "−1 pt" in place of my name and city count, which reads like my score. I did not get "pick which effect goes first", so that open item is unchecked. |
| 5 | Phone play | 7 | Fixed: "Prepare / 2 workers left" fits in 2 lines; no floating point pills over places or tabs. Targets 44 px+. A card flying to the city crosses the goods row for a moment, and only 3 hand cards show without a swipe. |
| 6 | AI and pacing | 6 | Brisk (max 1.6 s) and a new player can win. But in the 390 game the rival ended its year with 4 cards in its city and 13 points while I built 15: not a sensible rival. At 375 it played well (21 cards, 30 points). |
| 7 | Feel | 7 | Painted places and cards, meeples, cards fly, score pops in the chip, painted result with a table. |
| 8 | Bugs | 7 | 0 errors, 0 stuck in 2 tutorials and 2 games. At 375, with a full city (15/15), 0 goods and 0 workers, my driver tapped glowing targets for about 170 decisions with no change before the year ended; something kept glowing that did nothing. Not confirmed by hand. |
| | **Total** | **7.0** | **FAIL**: row 6 is below 7. No stopper. |

### Earlier findings (R17)
| Finding | Status | Evidence |
|---|---|---|
| Row 5: "Prepare after 1 more worker" overflows at 375 | **Fixed** ("Prepare / 2 workers left", 2 lines, fits). | R21-shots/hb-tut-10-prepare-375.jpg |
| Row 4/5/7: "+2 points" / "−1" pills float over places, tabs, rival chip | **Fixed**: deltas show inside the chip. New: "−1 pt" replaces my city count in the chip. | hb-g-rival-done-390.jpg |
| Row 5: Journey meeples over "Autumn only · 2-"; last goal under the hand | **Fixed** in the tutorial Goals view ("Autumn only · 2-5 pts" readable). | hb-tut-20-journey-tap-375.jpg |
| Row 5: cellar choice bar hides the 5th city row at 375 | **Not checked** (no cellar choice came up). | n/a |
| Row 5: achievements cut on the result at 375 | **Not checked**: no achievements line showed on either result. | hb-g375-result-27-30.jpg |
| Row 4: "Pick which effect goes first" explains nothing | **Not checked** (did not come up). Fixer says still open. | n/a |
| Row 2: 3 starting cards / 6 unearned points | **Explained, not fixed**: step 1 now says so. | hb-tut-01-375.jpg |
| Row 2: early taps ignored | **Not re-checked** (my walker waits for the step). | n/a |
| Row 2/5: bubble covers goods and tabs at 375 | **Not fixed** on step 1. | hb-tut-01-375.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Default game at 390, random glowing taps | Rival "done" in Autumn with 4 cards in city; I won 26-13 without trying. | hb-g-rival-done-390.jpg, hb-g390-result-26-13.jpg |
| 6 (works) | Default game at 375 | Close loss 27-30; rival built 21 cards. | hb-g375-result-27-30.jpg |
| 2 | Tutorial steps 20-22 | Journey, Inn and special events are "Tap it" only; none is played out. Autumn is skipped. | hb-tut-20-journey-tap-375.jpg |
| 8 | 375 game, full city, nothing affordable | About 170 taps on glowing targets did nothing until the year ended. | hb-g375-result-27-30.jpg |
| 7/5 | Swap-cost choice at 390 | A "1pt" card in flight covers the berries/tokens in the goods row. | hb-g-swap-flying-card-390.jpg |
