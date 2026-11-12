# R23 gameplay re-review (12 Nov 2026)

Strict re-review by `GAMEPLAY-RUBRIC.md`. Each branch was checked out locally, `origin/alex/brave-carson-rbpmlk` merged in locally
(thornbound and perch already held it; wildmark needed a local merge, .gitignore conflict only), built with
`VIS_SLUGS="," build-all.py`, and then built again with `--full` to run the phone-check gate (the plain build skips it: "phone-check skipped").
I served each build next to its `games/<slug>/` media and played it with real touch only (`touchscreen.tap`), starting from the title
screen by tapping its buttons, on default settings. Screenshots are in `R23-shots/`.

| Game | Branch @ tip | Total | Result | Gate | Lowest rows |
|---|---|---|---|---|---|
| thornbound | shelf/W489-thornbound-rules @ 369db832 | **4.9** | **FAIL** | **FAIL** | AI/pacing 3, Tutorial 4, Feel 4 |
| perch-and-plume | shelf/W508-perch-gameplay @ f3e0532b | **7.0** | **FAIL** | **FAIL** | Bugs 6 (gate dead taps) |
| wildmark | shelf/W507-wildmark-gameplay @ 0184d35b | **7.3** | **FAIL** | **FAIL** | Phone play 6 |

Limits of this pass (stated, not hidden): I hit the ~80 min cap. I did **not** re-read the published rulebooks online this time.
Row 1 for each game rests on the earlier reviewers' rulebook checks (R2, R14, R19) plus the branch's own rules notes, and no rules
code changed on these branches since. For wildmark my driver stopped on an info sheet at turn 16-19 of 20 in both games, so I did
not reach its result screen in a real game this pass (I did reach the tutorial's result screen).

---

## 1. thornbound (shelf/W489-thornbound-rules @ 369db832): 4.9, FAIL

What I played:
- Tutorial from "New here? Learn in 5 minutes" to its end card at 390x844 and 375x667: 28 steps, 30 taps, 95 s each, 0 page errors.
- Three Quick games (title > Quick game > Start the game, default: you vs 2 computers on Easy):
  - 390, glow-follower (tap the lit card/spot/button), no hint: **lost 4 - Court 21 - Lanterns 14**, 400 s, 272 taps (191 of them
    "tap to go on" during watch moments).
  - 375, the hint bulb tapped once at the start: **lost 5 - 17 - 9**, 390 s.
  - 390, the hint bulb tapped before every decision and its finger followed: my driver stopped in round 2 on a choice sheet (see findings).
- 0 page errors, 0 console errors (only music files missing from my local server).

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Unchanged since R2 (engine matches the published turn order; tied clash, steal/take-back bid and buying with Lore are still not taught). Not re-read online this pass. |
| 2 | Tutorial teaches | 4 | Still 28 steps, unchanged (the fixer says so). 8 Next-only steps (goal, map, tactics, attrition, icons, score, council, winter, end). 6 steps are watch steps with no line and nothing to tap, lasting 7-18.6 s (favour 11.6 s, supporters 12.8 s, claim 18.6 s, Autumn 18.2 s). One round only; no scripted second round. |
| 3 | First 10 seconds | 5 | The goal card is still 4 lines of rules (Influence, Clash, Herald steal, bid). The first screen still has 5 icon buttons, 3 score chips, 6 locations, 5 chips and 6 cards. |
| 4 | Turn clarity | 5 | No suggestion is shown on the default game: the dock line is empty on most of my turns and the finger never appeared in 81 decisions. A hint with a reason ("A middle bid can still win a good card. It keeps your best free.") appears only after tapping the bulb, once per tap. Choice sheets are still lists of rules text. |
| 5 | Phone play | 5 | Gate FAIL: board 48% of the screen at 375x553 and 51% after rotation; texts over 8 words. 10-20 text items under 14 px on tutorial screens. A choice sheet's first option sits half under the board. |
| 6 | AI and pacing | 3 | On defaults I lost both games, 4 vs 21 and 5 vs 17, last both times. A game takes 6.5 min, and most of it is watching: 178-191 "tap to go on" taps per game. The fixer's 4/8 used a test hook (`newGame('me',{guide:'full'})` plus a newcomer suggester), not the default game. |
| 7 | Feel | 4 | Unchanged: number discs and "?" tokens flipping on a static board; long watch moments. |
| 8 | Bugs | 6 | 0 errors and 0 stuck states in the tutorial and 2 full games. Lost points for the phone-check gate failure and 26 dead taps on a half-covered choice option (below). |
| | **Total** | **4.9** | **FAIL** (6 rows under 7; no stopper) |

### Earlier findings (R2)
| Finding | Status | Evidence |
|---|---|---|
| STOPPER: tutorial stuck at 6/28 after a fast tap | **Fixed** in my runs: 0 stuck at both sizes (I tapped about 1 s apart, not the 200-600 ms R2 used). | R23-shots/tb390-tut-end.jpg |
| "WATCH, tap to go on" does nothing | **Partly fixed**: 0 dead taps on watch moments in 2 full games, but the watch moments themselves are unchanged in number and length. | R23-shots/tb390-g-turn3.jpg |
| Result headline names the wrong winner | **Fixed**: "Gilded Court takes the throne ... Court 21 Lanterns 14 You 4" agree. | R23-shots/tb390-g-result.jpg |
| Tutorial 28 steps, one round, Next-only start | **Not fixed** (fixer agrees). | R23-shots/tb375-tut-20.jpg |
| Busy first screen, wordy goal card | **Not fixed**. | R23-shots/tb390-g-turn3.jpg |
| New player cannot compete | **Not fixed** on defaults: lost 4-21-14 and 5-17-9. | R23-shots/tb390-g-result.jpg, tb375-g-result.jpg |
| 375 layout: board too small, small text | **Not fixed**: gate says board 48% at 375x553. | gate log |
| Feel | **Not fixed**. | - |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4 / 6 | Default Quick game, 81 decisions | No suggestion or finger shown unless you tap the bulb; the fixer's "a suggestion with a reason on every decision" is on-demand only. | R23-shots/tb390-g-turn3.jpg, R23-shots/tb375-g-bulb.jpg |
| 6 | Two default games as a newcomer | Lost 4-21-14 (390) and 5-17-9 (375), about 6.5 min each. | R23-shots/tb390-g-result.jpg, R23-shots/tb375-g-result.jpg |
| 5 / 8 | Round 2, Govern choice sheet at 390, tapped the first option | The list scrolls up under the board; the first option is half hidden and its visible top did nothing for 26 taps. The bulb gave no finger on this sheet. | R23-shots/tb390h-g-stuck.jpg |
| 2 | Tutorial step timing at both sizes | Steps favour, supp, clash, claim and autumn1 show no line and wait 7-18.6 s with nothing to do. | R23-shots/tb375-tut-20.jpg |
| 5 | `--full` build | Gate FAIL: "board <55% of screen: 375x553 48%", "after-rotate-play 51%", "text >8 words: 11w 'Lantern Rising takes Village Muster...'". | gate log |

---

## 2. perch-and-plume (shelf/W508-perch-gameplay @ f3e0532b): 7.0, FAIL

What I played:
- Tutorial at 375x667 from "New here?": 21 steps, 24 taps, 28 s, ends straight in a real game. All targets on screen and 44 px or more.
- Two Quick games (title > Quick game > Start the year > Keep these; defaults: 2 players, Easy rival Fern, hints **on** by default),
  as a newcomer who takes "Best" half the time and otherwise taps a random glowing target:
  - 390: **lost 39-53**, 214 s, 146 taps. 375: **won 46-40**, 214 s, 134 taps.
- Wait from my last tap to my next turn (no skip taps): median 3.6-4.4 s, max 5.7-6.4 s.
- 0 page errors, 0 console errors, 0 stuck states, 0 tapped targets under 44 px (280 taps), 0 text under 14 px on the first screen.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged engine (139 rule tests, R19 and W508 rulebook checks). Not re-read online this pass. |
| 2 | Tutorial teaches | 7 | 21 one-line steps, one target each, 28 s. Step 2's target is covered (2 taps needed), step 14 took 3 taps. The 8/7/6/5 shrinking actions are still not taught ("Real games: 4 rounds"). |
| 3 | First 10 seconds | 7 | Starting hand with "Keep these", the four actions say what they give ("Lay eggs +2 eggs = +2 pts"), a "Best" badge on one. |
| 4 | Turn clarity | 7 | Hints on by default: "Best" badges on actions, birds, spaces and tray cards; the prompt always says what to tap ("Tap Play to put Tidal Wren in your wetland"). |
| 5 | Phone play | 7 | Fixed from R19: tray cards show names ("Copper Thrush", "Tidal Warbler"), every target I tapped was 44 px or more at both sizes, nothing cut off in my shots. The gate still flags an 8+ word text and board 49% after rotation. |
| 6 | AI and pacing | 7 | Waits are now 6.4 s at most (R19: 14-19 s). The mixed newcomer won 1 of 2 (46-40, lost 39-53). A game is about 3.6 min. |
| 7 | Feel | 7 | Painted birds, food and eggs fly, row bumps, clear score table. |
| 8 | Bugs | 6 | My 2 games and the tutorial: 0 errors, 0 stuck, 0 dead taps. But the phone-check gate FAILS with "2 dead taps (+2 eggs / +1 cards)", the same kind of dead row tap R6 found. |
| | **Total** | **7.0** | **FAIL** (row 8 under 7: gate dead taps) |

### Earlier findings (R19)
| Finding | Status | Evidence |
|---|---|---|
| Lost on defaults (hints off) | **Fixed in part**: hints now on by default; mixed newcomer won 1 of 2. | R23-shots/pp375m-g-result.jpg, R23-shots/pp390m-g-result.jpg |
| Round-end waits 14-19 s | **Fixed**: max 6.4 s, median about 4 s. | log |
| Tray cards 33x45 with only points | **Fixed**: names shown, targets 44 px+. | R23-shots/pp390m-g-first.jpg |
| Hand cards 37x50, board birds 40x40 at 375 | **Fixed** for everything I tapped (0 under 44 in 280 taps). | log |
| Round line over the score chips | **Not seen** in my shots. | R23-shots/pp390m-g-first.jpg |
| Tutorial step 1 "Tap the score" while Best glows elsewhere | **Fixed** (only the score is lit). | R23-shots/pp375-tut-1.jpg |
| 8/7/6/5 actions never taught | **Not fixed**. | R23-shots/pp375-tut-end.jpg |
| Earlier gate fail "a bird in hand outside the screen" | **Fixed**: not in this gate run (no off-screen item for perch). | gate log |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 | `--full` build, phone-check gate | FAIL: "2 dead taps (+2 eggs / +1 cards)" in a played scenario, plus "text >8 words: 23w 'Solo you play against the Rival...'" and "board <55% after-rotate 49%". | gate log |
| 2 | Tutorial step 2 at 375 | The lit target (score bar) was covered by another element; my first tap did nothing, the second worked. | R23-shots/pp375-tut-1.jpg |
| 6 | Mixed newcomer, 2 games | Won 46-40 at 375, lost 39-53 at 390. Winnable, not a given. | R23-shots/pp375m-g-result.jpg |

---

## 3. wildmark (shelf/W507-wildmark-gameplay @ 0184d35b): 7.3, FAIL

What I played:
- Tutorial at 375x667 from "New here?": 52 steps, 46 taps, 55 s, ends on "You win! You 33 Bram 26" with "Play a real game".
- Two games on the title's "Play against 1 computer ranger" (default Gentle rival): 390 careless (first column, first spot), 375 careful
  (highest "up to +N" column, highest "+N" spot). Both ran without errors to turn 16-19 of 20; then my driver stopped on a tile-info
  sheet it opened itself by tapping a non-target hex (a driver fault, not the game's). At 375 I led 51-27 at turn 11.
- Rival wait: median 2.3 s, max 3.6 s. 0 page errors, 0 console errors. Smallest spot I could tap: 47 px.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged since R2/R14 (market of four pairs, wipes, both acorn powers, 20 turns, largest-area bonus, tie-break). Not re-read online this pass. |
| 2 | Tutorial teaches | 8 | Every scoring rule by doing it, one tap per step, and "Replace animals" is now done by tap (steps 36-39). |
| 3 | First 10 seconds | 7 | "New here?" first, one big Play button, goal line "Beat Bram". |
| 4 | Turn clarity | 7 | "up to +N" on each column, "+N" badges on spots, 1/3-2/3 step card, "What should I do?". |
| 5 | Phone play | 6 | At 375x667, 8 of 17 turns had legal spots off screen or covered (17 spots in all). Edge arrows now show the count ("▲ 3", "▼ 5"), but the camera does not fit them and a "Your turn" banner covers spots in the middle. Gate FAIL: market labels off screen in landscape and after rotation, board 50% at 375x553. At 390x844: 0 hidden spots in 19 turns. |
| 6 | AI and pacing | 8 | Bram plays in 2-3.6 s; careful play led 51-27 at turn 11. |
| 7 | Feel | 7 | Tiles drop, animals hop, score pops; unchanged. |
| 8 | Bugs | 7 | 0 errors, 0 stuck states and 0 dead taps on targets over about 36 game turns. Not higher: I did not reach a real game's result screen this pass, and the gate fails. |
| | **Total** | **7.3** | **FAIL** (row 5 under 7; no stopper) |

### Earlier findings (R2, R14)
| Finding | Status | Evidence |
|---|---|---|
| Market labels and "up to +N" badges 13 px | **Fixed**: only one 13 px item (a "1" counter) on the first screen. | R23-shots/wm390-g-first.jpg |
| Legal spots off the edge at 375 with no cue | **Partly fixed**: edge arrows with counts, but 8 of 17 turns still hide spots; banner covers spots. | R23-shots/wm375-g-hidden2.jpg, R23-shots/wm375-g-hidden1.jpg |
| "Replace animals" only a Next line | **Fixed**: done by tap in tutorial steps 36-39. | R23-shots/wm375-tut-end.jpg |
| Gentle soft for a careful player | Still true (51-27 at turn 11), fine for a first game. | R23-shots/wm375-g-hidden2.jpg |
| Painted terrains hard to tell apart | Not re-checked. | - |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | 375x667, turn 11, holding a tile | 3 spots above and 5 below the view (arrows "▲ 3", "▼ 5"); the "Your turn" banner sits over spots in the middle of the valley. | R23-shots/wm375-g-hidden2.jpg |
| 5 | `--full` build, phone-check gate | FAIL: "off-screen: Fox, Bear" (844x390), "Bear, Salmon" (after rotation), "board <55% 375x553 50%", "text >8 words: 15w 'Foxes you have no foxes yet...'", 1 dead tap in 3 scenarios. | gate log |
| 4 (good) | Careful game at 375 | Following the "up to +N" and "+N" badges alone is enough to beat Gentle clearly. | R23-shots/wm375-g-hidden2.jpg |
