# R42 strict gameplay review: shipwreck-isle, tidewake, hollowbough

- Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. PASS needs every row >= 7; a stopper caps the total at 4.
- Each game was checked out fresh from its branch. Gates: `VIS_SLUGS="," build-all.py --quick` and `--full`. I played the STAGED build by touch only (Playwright `isMobile` + `hasTouch`, `touchscreen.tap`) at 375x667 and 375x553, from a fresh profile.
- `scratch/` = the reviewer's session scratch folder. Screenshots stay local.
- **Staging gap (all three games):** the build-all staging folder holds only `index.html`, with no `media/`, `models/` or `cards/`. Served alone, it logs 404s for painted art (shipwreck 23, hollowbough 23, tidewake 4). Testers linked the media from `games/<slug>/` to play. It is not scored, but check that the deploy copies the media.

| Game | Commit | Quick | Full | Rules | Tut | 10 s | Turn | Phone | AI | Feel | Bugs | Avg | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| shipwreck-isle | eb36ac91 | PASS | PASS (re-run; 1st run failed under load) | 7 | 7 | 8 | 7 | 6 | 7 | 7 | 7 | 7.0 | FAIL |
| tidewake | 3404be6e | PASS | PASS (re-run; 1st run failed under load) | 8 | 7 | 8 | 8 | 6 | 8 | 7 | 6 | 7.3 | FAIL |
| hollowbough | ed1c1661 | PASS | PASS | 8 | 8 | 8 | 7 | 6 | 7 | 7 | 8 | 7.4 | FAIL |

---

## 1. shipwreck-isle (shelf/W468-shipwreck-lean @ eb36ac91)

Gates:
- **quick PASS** (EXIT 0).
- **full**: the first run FAILED while three games were building at once (load average 21 on 4 cores): `phone-check: FAIL: stuck 8s; slow 1530ms; FAIL: timeout (3 min game limit) x2`.
- **full re-run alone PASS**: phone-check 158.9 s, sweep.js PASS (4 games), EXIT 0. I treat it as a load flake, not a stopper. But phone-check under load hit the 3 min game limit twice, and R40 already called the game long.


Staged build `/tmp/x-ship-quick/shipwreck-isle/index.html`. Played by touch only: Playwright, `isMobile` + `hasTouch`, `page.touchscreen.tap` at element centres, `elementFromPoint` checked before every tap, fresh profile (localStorage cleared), 375x667 and 375x553.
Setup note: the staged quick folder has no `media/` or `models/`, so 23 files return 404 (title art, UI skins, 3D models). I served the same index.html with `art/ media/ models/ music/` linked from the checkout's `games/shipwreck-isle/`. After that there were 0 404s. The 404s are a staging gap, not counted as a game bug.
Driver: `scratch/drv/play.js` (audit in `audit.js`; a MutationObserver counts the effects and samples their position and opacity over 0-700 ms).
Shots: `scratch/shots/ship/` (run folders t1, t2, g1-g4, plus x-*.png probes).

### What I played

| Run | Size | How | Result | Errors | Dead taps |
|---|---|---|---|---|---|
| t1 Learn in 5 minutes | 375x667 | tapped the ringed target of all 55 steps; Continue / first option between steps | ended on the "You know the rules!" card after day 3, 149 s | 0 | 0 on rings. 9 taps on a dim "Start day" while no ring was shown were ignored (the guide blocks taps off the highlight); the next ring then came |
| t2 Learn in 5 minutes | 375x553 | same | end card after day 3, 148 s | 0 (2 page errors were from my own observer script, fixed for later runs) | 0 on rings. 7 ignored "Start day" taps, same as t1 |
| g1 default game (Marooned, 2 players, Easy), follow ✨ pawn by pawn | 375x667 | ✨, then tap the place the finger shows, then the ⭐ row; Start day when ✨ says "Every pawn has a job" | **Rescued, day 10** (pile 15/15) | 0 | 0 / 193 taps |
| g2 same | 375x553 | same | **Rescued, day 10** | 0 | 0 / 203 |
| g3 same | 375x553 | same, played on to the result screen | **Lost, day 12**: "Time ran out", pile 8/15 | 0 | 0 / 245 |
| g4 same | 375x667 | same | **Lost, day 12**: pile 11/15 | 0 | 1 / 244 (the finger sat under the zoom − button, see B1) |
| adv-test.js 12 (Normal, whole-plan advice) | sim | | 0/12 wins, avg day 7.5 (5 Carpenter died, 5 Cook died, 1 Explorer died, 1 time ran out); 0 illegal plans | 0 | - |
| adv-test.js 8 learn | sim | | 8/8 wins, avg day 10.5 | 0 | - |

Hint followers on Easy won **2 of 4** (R40, when ✨ planned the whole day: 4 of 4). Each game took about 60-70 ✨ taps plus one finger tap and one ⭐-row tap per pawn. The player made **0 own placement decisions** in all 4 games. The 11-17 story choices per game were the ⭐ or first option.

### R40 fix status

| R40 item | Status | Evidence (measured) |
|---|---|---|
| P1 Day chip cut off | **Fixed** | Chip reads "📅 1/12 Day", box 55x65 at (5,48). scrollWidth = clientWidth on every chip and child, at both sizes and on every audited frame. `g2/016-result.png` |
| P2 Food label overflows | **Fixed** | "Food · eat 2" chip is 69 px wide at x 64-133; next chip starts at 137. No overflow, no chip overlap on any frame. `x-plan-553.png` |
| P3 Zoom buttons over cards | **Fixed** for cards | Zoom buttons are hidden under the event card, the day summary and the fight card (`t1/024-adv-d2.png`, `t1/023-wounds-d2.png`, `g1/fx-01.png`). The z-order check found 0 frames with a zoom button on top of card text. New: the zoom − button still covers board places, see B1 |
| P4 Board squeezed / summary clipped (375x667) | **Fixed** | Story beats use the full height (`t1/041-story-d3.png`). The summary's last line "…then it stays as a threat." is visible (`t1/023-wounds-d2.png`). Its top edge still tucks under the stat bar (visual) |
| F1 Static card + Continue | **Partly fixed** | Effects counted per game: die 1-4, fly 27-37, pop 60-72, event cards 16-23. Die samples: dropped from y 21 to 126 in 260 ms, faces cycle ⚅→⚁→⚅. Fly samples: icon moves (89,71) → (350,127) in 700 ms while it fades. The fight card shows "🐾 1 strength vs 🗡 0 weapon, 🩸 −1 ♥", animated in (`t2/fx-01.png` → `t2/fx-03.png`). Every beat is still Continue-paced, and the fight card covers the board |
| F2 ✨ wins with zero own decisions | **Partly fixed** | ✨ now names one pawn and gives a why ("✨ Carpenter → Explore place 3: new land…"), and the player places every pawn. Following it still needs no decision of your own. It no longer always wins (2/4) |
| A1 Normal advice 0/12 | **Unchanged** | adv-test 12 = 0/12 |

### Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why (concrete) |
|---|---|---|---|
| 1 | Rules fidelity | 7 | The six-phase day, 1 pawn = dice and 2 = sure, night food (2 wounds if unfed) and the shelter wound, the event → threat slide, Fire + 15-wood pile and the 12-day limit all played as documented in rules-check. No new rule break seen in 4 games and 2 tutorials. Known documented deviations remain (Easy pile starts at 3/15) |
| 2 | Tutorial teaches | 7 | The guided 3-day game reached the end card at both sizes, and all 55 ringed targets answered first tap. Order: goal → phases → event → morale → production → pawns → explore/dice/sure → build/shelter/invention → weather → night → wounds → adventure → threat → gather/rest/hunt → pile → Fire. Still long (55 steps, many are Next-only). About 7-9 s with no ring while "Start day" looks tappable but is ignored. "Skip tutorial" is 95x40 |
| 3 | First 10 seconds | 8 | Title: big Play (337x45) and "New here? Learn in 5 minutes". The first plan screen says "Carpenter: tap a glowing place", with a finger on a glowing place |
| 4 | Turn clarity | 7 | The phase banner names whose turn it is; plates show 🎲 risky / ✔ sure; ✨ gives a reason. Weak points: the ✨ line is cut with an ellipsis at 375 ("…: new land…", "🔥 Pile +3. Every pawn has a job.…"); the summary's "Tomorrow" text is cut ("fight it at the start of…,"); the "+1/+2/+3" plate button is still unexplained |
| 5 | Phone play | **6** | Chips and zoom buttons are fixed, but the plan board overlaps itself. At 375x553 one job plate covers another almost fully ("Build 🎲 risky" over "Explore ✔ sure", overlap 140x36 px). The board is only 185 px tall (y 118-303) with the glow rings of places 3/7/8/12 overlapping each other and their number badges. At 375x667 plates overlap too (Build over Explore's "risky"). The zoom − button covers a hinted place (B1). Small text: "You know the rules!" is 13 px. "Skip tutorial" is 40 px tall |
| 6 | AI and pacing | 7 | Default Easy: hint followers won 2/4 (day 10, day 10; losses ended with the pile at 8/15 and 11/15), about 5-6 min a game by the driver, ~65 hint taps. The learn deal won 8/8. Normal: 0/12 following the advice, and the setup screen does not warn about this. Acceptable while Easy is the default. Both losses end on a tip ("Put wood on the pile every day") that the ✨ advice itself did not follow |
| 7 | Feel | 7 | The die drops and tumbles, gains and losses fly between place and chip, the chip bumps, +/− pops float, the fight card animates strength vs weapon and the wound, the event card flips in. Measured in every game, not just claimed. It is still a Continue-per-beat story; the fight card hides the board |
| 8 | Bugs | 7 | 6 runs to the end at both sizes: 0 page errors, 0 console errors (besides the staging 404s), 0 stuck, result screen reached (`g3/020-result.png`, `g4/022-result.png`). 1 tap in 244 on a hinted place landed on the zoom − button (B1). Not a stopper: the next tap placed the pawn |

**Total = (7 + 7 + 8 + 7 + 6 + 7 + 7 + 7) / 8 = 56 / 8 = 7.0 · FAIL** (row 5 is under 7; no stopper).

### Fix list (rows under 7, and the next risks)

**P5 (Phone): job plates cover each other on the plan board.** Repro: 375x553, Learn, step 16 ("Tap the camp again"): the "Build ● 🎲 risky" plate sits on top of "Explore ✔ sure", and you cannot read the Explore plate (overlap 140x36 px). Same at 375x667 in Learn step 49 (Build over Explore's "risky"). In g3 at 553, day 8 had four story plates stacked (Explore/Gather/Threat/Build overlapping by 106-125 px). Fix: lay plates out without collisions (stack them vertically by place, or keep one collapsed "+N" plate per crowded area), and clamp them inside the board. Shots: `scratch/shots/ship/t2/014-camp2-d1.png`, `scratch/shots/ship/t1/049-plan2-d3.png`.

**P6 (Phone): the board at 375x553 is too small to tap with confidence.** Repro: 375x553, Play anyway, first plan screen. The board gets y 118-303 (185 px). The glow rings of places 3, 7, 8 (camp) and 12 overlap each other, and the "3" and "?" badges sit under the rings. Fix: at short heights, shrink the pawn tray (two rows → one, drop the "Dog: helps hunt…" line) or zoom the camera onto the glowing places so the rings don't overlap. Shot: `scratch/shots/ship/x-plan-553.png`.

**B1 (Phone/Bugs): the zoom − button covers a hinted place.** Repro: 375x667, default Easy game, follow ✨. Once the finger pointed at (259,369), `elementFromPoint` there returned the zoom − button (`.gx-ibtn`, box x 229-273). The tap zoomed out instead of opening the place. Fix: hide `#bfzoom` while the ✨ finger is shown, or keep the finger and glow targets out of the zoom buttons' box. Seen in run g4 (`scratch/shots/ship/g4/result.json`, dead list).

**P7 (Phone/clarity): the ✨ reason is cut off.** Repro: 375x667, default game, tap ✨ on day 1: the banner reads "✨ Carpenter → Explore place 3: new land…". Also "🔥 Pile +3. Every pawn has a job.…" on days 2, 4, 8. The why is the part F2 asked for. Fix: let the banner wrap to 2 lines, or drop "place N". Shot: `scratch/shots/ship/x-hint.png`.

**P8 (small): text and target sizes.** "You know the rules!" end-card tag is 13 px (`t2/055-final.png`). "Skip tutorial" is 95x40 (`t1/004-phases-d1.png`). On the title screen the player-count buttons "1" and "3" are 41x44 and 42x44. The pawn labels "Carpenter Carpenter" touch once the Hammer helper joins the tray (`x-pop.png`). The day summary's "Tomorrow: … fight it at the start of…," is cut mid-sentence (`g1/fx-01.png`).

**A2 (AI, next risk, not under 7):** in 4 Easy games, following ✨ won 2. Both losses ran out of time with the pile at 8/15 and 11/15. ✨ added pile wood on only 3-4 of 12 days, and the loss screen then tells the player to "put wood on the pile every day". Make ✨ add pile wood whenever the Fire burns and spare wood exists, or soften the loss tip. Normal is still 0/12 (adv-test); add a line on the setup screen ("Normal: the advice won't carry you"), or tune it.

---

## 2. tidewake (shelf/W498-tidewake-gameplay @ 3404be6e): 7.3, FAIL

Gates:
- **quick PASS** (EXIT 0).
- **full**: the first run FAILED under the same load: `sweep.js ... PROBLEMS 1 / 375x553 g0: dead tap on the enabled Place button`.
- **full re-run alone PASS**: phone-check 76.6 s, sweep `decisions {"start":9,"lay":21,"cannon":5,"doom":2} ... PROBLEMS 0`, EXIT 0.
- I count it as a timing-sensitive dead tap at 375x553, not a stopper. It matches the tutorial "roll" Continue that did not answer within 1 s at 375x553 (below).


Build under test: the staged `/tmp/x-tide-quick/tidewake/index.html`, served over http. I used Playwright with isMobile and hasTouch, touch only, a fresh profile per run, and the default 3D board. I did not tap Skip.
The staged folder has no `media/` directory, so every run logged 4 × HTTP 404 for `media/tile-water-a..d.webp`. Those files exist in `games/tidewake/media/`, so this comes from the staging and is not counted as a game bug. Apart from that I saw 0 page errors and 0 console errors.

### What I played

| Run | Size | Result |
|---|---|---|
| Tutorial (tutor driver: taps only the highlighted ring, at default speed) | 375x667 | 32 steps, 31/31 rules in order, 0 dead taps, 0 errors, ends on a win, "Play a real game" starts a clean game |
| Tutorial | 375x553 | 31 steps, 31/31 rules. **The roll card's Continue did not answer one tap within 1 s** (after step "reloc"), and the "roll" step never showed at this size |
| 9 Quick games (default: you vs 2 computers), ★-follow and random newcomer alternating | 375x667 | 2 won (g3, g6), 1 shared sink-together result (g5), 6 lost |
| 4 Quick games | 375x553 | 2 won (g0, g2), 2 lost |
| Fall-through trials | 375x667, 375x553 | 190 fresh game starts on the "Your start" coach bubble (table below) |

Overall the newcomer won 4 of 13 games outright, 5 of 13 counting the shared result. A fair share is 33 %. Every game reached the result screen. Taps: 0 dead, 0 elementFromPoint misses and 0 stuck states in 230 game taps. Games were short: median 56 s, 7-36 turns.
Every strip, pop-up and card button I measured was at least 44 px, and no strip text was under 14 px.

### "Got it" fall-through: R38 repro repeated

I used the "Your start" bubble on a Quick game, each trial from a fresh profile. In a **valid** trial a board target sits under the tap point: after the bubble is gone, a plain control tap on the same point opens a sheet.

| Method | Trials | Valid (target under the point) | Sheet opened |
|---|---|---|---|
| (a) CDP touchStart, hold 700 ms, touchEnd on Got it, 375x667 | 70 | 11 (leviathan under it) | **0/11** (0/70) |
| (a) same at 375x553 | 10 | 0 (only the strip under the point) | 0/10 |
| (b) Tap the bubble body 1-4 px below Got it's bottom-left corner | 5 | 5 (start mark under it) | 0/5 |
| (b) Same below the **bottom-right** corner | 5 | 5 | **4/5**: "Start here? Bottom 5" opens (ft-body-375x667-1/5/7/9.png) |
| (c) Fast double tap on Got it (40 ms down, 90 ms gap) | 70 | 11 (leviathan under it) | **1/11**: the leviathan sheet "Tidegrave" opens (ft-dbl-375x667-28.png) |

Why (b) happens: at the right-corner point, `elementFromPoint` returns `.opip` (a gold start mark), not the bubble. The mark's touch area reaches up over the bubble's bottom edge and sits above it, so the tap never touches the bubble.
The one miss in (b) is a trial where the bubble sat 3 px higher, so the point landed on `.gxh-bub` (bubble-corner-zoom.png, bubble-start-375x667.png).
Result: the held press is fixed (was 10/10). The bubble-body tap still falls through (4/5, was 4/4), and so does the double tap (1/11, was 1/7).

### Rival timing (no Skip)

This covers 13 games: 144 rival turns and 71 rounds. A round runs from my action to my next actionable moment, so it includes my own roll and wake.

| Measure | Median | Max | Over 4 s |
|---|---|---|---|
| One rival turn | 1.5 s | 3.4 s | **0** (1 over 3 s; 143/144 ≤ 2.5 s) |
| A whole round | 6.7 s | 10.0 s | 13 of 71 over 8 s |

### R38 status

| R38 finding | Status now |
|---|---|
| Held "Got it" falls through (10/10) | **Fixed** (0/11 valid, 0/80 total) |
| Bubble-body tap falls through (4/4) | **Not fixed** (4/5 at the bottom-right corner) |
| Fast double tap (1/7) | **Not fixed** (1/11) |
| Rival turns of 11-19 s, round median 10.3 s and max 25.5 s | **Fixed** (turn max 3.4 s, round median 6.7 s, max 10.0 s) |
| "i" button 30 px wide | **Fixed**: 44x44 in every game |
| Goal strip cut off by 24 px | **Partly fixed**: fits at 375x553 (bottom 3 px inside) and on most 375x667 turns. But in 3 of 9 games at 375x667 it ran 13-38 px off screen when the danger note wraps to 2 lines (goalcut-375x667-g8.png, goalcut-375x667-g7.png) |
| "Stop" pin overlaps the "start" label at 375x553 | **Fixed**: 0 px² overlap in about 42 turn samples (both sizes) |
| "Your turn" / "⚠ 2 leviathans" overlap | Not seen in my play. The danger note now wraps as its own box (goalcut-375x667-g8.png) |

Rules: `node logic-test.js` gives RULES 89 (85 tested, 4 table-only): PASS 85, FAIL 0.

### Score

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | logic-test 85/85. Wakes, sinks, "last afloat" and the shared sink-together result all played out correctly. |
| 2 | Tutorial teaches | 7 | 31/31 rules in order at both sizes, 0 dead taps at 375x667. At 375x553 the roll card's Continue did not answer within 1 s, and the "roll" step was skipped. |
| 3 | First 10 seconds | 8 | Goal card on the title, "New here?" with Learn / Just play, and a one-tap Quick game. |
| 4 | Turn clarity | 8 | "Your turn: lay a current" plus a named danger ("Abyssal Crown: 6-8 reaches you"), risk % per tile, a ★ suggestion and the Stop pin on the route. |
| 5 | Phone play | 6 | Fixed: the "i" button (44 px), the lay buttons and the Stop/start overlap. Still wrong: the Goal strip is cut by 13-38 px at 375x667 whenever the danger note takes 2 lines (3 of 9 games). The board "start" label is .62rem (about 10 px) text. |
| 6 | AI and pacing | 8 | Rival turn median 1.5 s, max 3.4 s, 0 over 4 s. Round median 6.7 s. The newcomer wins 4-5 of 13 (about a fair share). Games are short (median 56 s). |
| 7 | Feel | 7 | Painted chart, gliding junks, wake banner ("You rolled 6 · leviathans wake!"). The part of a rival turn after about 1.4 s now jumps instantly with no motion, so that is a trade-off. |
| 8 | Bugs | 6 | 0 errors, 0 stuck, 0 dead taps in 13 games. But the R38 fall-through still reproduces: bubble-body tap 4/5 and fast double tap 1/11. Per the brief, any fall-through puts this row under 7. |
| | **Total** | **7.3** | (8+7+8+8+6+8+7+6) = 58 / 8 = 7.25, so 7.3. **FAIL**: rows 5 and 8 are under 7. No stopper (nothing got stuck and every game finished). |

### Fix list
1. **Row 8: the bubble body must eat every tap, and so must a double tap.**
   - Repro (b): Quick game at 375x667 from a fresh profile, then "Just play". On the "Your start" bubble (box about 100,268 to 259,364; Got it 182,316 to 253,360), tap at (249, 361), 4 px left of and 1 px below Got it's bottom-right corner. "Start here? Bottom 5" opens in 4/5 trials. Screenshots: shots/tide/ft-body-375x667-1.png, -5, -7, -9; zoom: shots/tide/bubble-corner-zoom.png.
   - Cause: `.opip`'s hit area extends over the bubble and is above it in hit-testing.
   - Fix: give the bubble a hit layer above `#ov`, or turn off pointer-events on the marks while a coach bubble is up.
   - Repro (c): same bubble, with a leviathan at square (4,5) under Got it. Two CDP touches, 40 ms down and 90 ms apart, on Got it (218, 338) open the leviathan sheet in 1/11. Screenshot: shots/tide/ft-dbl-375x667-28.png.
   - Fix: after a coach bubble closes, drop board picks for about 400 ms. `PH.closeT` is no longer set by the new guard, and a click that lands on the freshly revealed canvas is let through.
2. **Row 5: keep the Goal strip on screen when the danger note wraps.**
   - Repro: Quick game at 375x667, played until a leviathan threatens you, so the turn bar shows "Your turn: lay a current." with "⚠ Abyssal Crown: 6-8 reaches you" on a 2nd line. The Goal strip's bottom is 13-38 px below 667. Screenshots: shots/tide/goalcut-375x667-g8.png, shots/tide/goalcut-375x667-g7.png.
   - Fix: shrink or hide the feed line, or put the danger on the same line, when the turn bar is 2 lines.
   - Also raise the board "start" label from .62rem to 14 px or more, or replace it with an icon.
3. **Row 2 (watch): the roll card at 375x553 in the tutorial.**
   - Repro: tutorial at 375x553. After step "reloc", the roll card's Continue (`#pc [data-ph=dismiss]`) did not answer one tap within 1 s, and the "roll" step was never shown.
   - Fix: make that Continue answer on the first tap, and show the roll step at this size.

---

## 3. hollowbough (shelf/W482-hollowbough @ ed1c1661): 7.4, FAIL

Gates:
- **quick PASS**: own checks 13/13; WARN universal "button covered by div.gxh-tx" on a Parcel Dove card; EXIT 0.
- **full PASS**: phone-check 65.4 s, SWEEP PASS, lab WARN 10/12 (not a fail), EXIT 0.

**Reviewer note on row 5:** the play-tester scored Phone 7; I lower it to 6. The rubric's Phone row needs readable text of 14 px or more. In every game, the coach bubble that tells a newcomer what to tap renders at **12.5 px body / 13.5 px title**. I confirmed the cause in the build: hollowbough's own `game/head.html` overrides `.gxh-bub .gxh-tx{font-size:12.5px}` and `.gxh-tt{font-size:13.5px}`, over the shared 14 / 14.5 px. On top of that, at 375x553 the hint finger hides under the Prepare bar (z-index 42 < 45). R39's three phone fixes are done. These two misses remain, and both are one-line fixes.


Build tested: the staged `/tmp/x-hollow-quick/hollowbough/index.html`. The staged folder holds only index.html, so on the first runs every
painted media file returned 404 (23 files: `media/icon-*.webp`, `ui-*.webp`, `table-woodland.webp` ...). I then served the same index.html
with the checkout's `games/hollowbough/{media,music,models,cards}` beside it: 0 failed requests. All scores below come from that setup.
Driver: Playwright, isMobile + hasTouch, DPR 2, a fresh context per run, `page.touchscreen.tap` at element centres, each target checked with
`elementFromPoint`. The newcomer taps the hint finger's target, or else the glow, or else the action button, and presses the first button on any card.
AIDELAY was set to 400 ms, and the driver pauses 300 ms before each tap. `node logic-test.js`: **rules total 215 (N/A 1), tested 214, pass 214, fail 0, EXIT 0.**

### What I played
| Run | Size | Path | Result | Time | Taps | Dead taps | Errors |
|---|---|---|---|---|---|---|---|
| Tutorial ("New here? Learn in 5 minutes", 44 px) | 375x667 | title > Learn | 37 steps, end card "You know the rules", "Play a real game" starts a real game | 59 s* | 42 (11 Next) | 0 | 0 |
| Tutorial | 375x553 | same | same, 37 steps | 64 s* | 42 (11 Next) | 0 | 0 |
| Game 1 (media missing) | 375x667 | Play > Play now > Start (Guided / On / On) | won 34-33 | 1.45 min | 50 | 0 | 0 non-404 |
| Game 2 | 375x667 | same | won 50-42 | 2.34 min* | 82 | 0 | 0 |
| Game 3 | 375x553 | same | won 47-38 | 3.82 min* | 88 | 0 | 0 |
| Game 4 | 375x553 | same | won 29-28 | 2.25 min* | 50 | 0 | 0 |
| Game 5 | 375x667 | same | won 44-37 | 2.77 min* | 60 | 0 | 0 |
| Game 6 | 375x553 | same | won 55-45 | 2.89 min* | 78 | 0 | 0 |
| Game 7 | 375x667 | same | won 56-42 | 2.12 min* | 74 | 0 | 0 |
| Keep-one probe (forced: one Slate Schoolmarm and 3 berries put in my hand at turn 1) | 375x667 | same | won 35-19 | 1.82 min | 72 | 0 | 0 |

\* These times include my driver's waits: 700 ms reading time per tutorial step, and up to 1.75 s waiting for a glow when the finger
could not be read. They cannot be compared with R39's times. Game 1 used finger-follow with no extra waits and took 1.45 min, inside R39's 1.4-1.9.
Every game reached the result card ("You win, X to Y", a score table with city, purple bonuses, tokens, Journey (and Goals in game 5), Continue).
There were 0 page errors, 0 console errors other than the staging 404s, and 0 stuck states.
One more attempt at 375x553 ended in a driver loop: my driver read the target under the finger tip, and that was the disabled "Prepare, 3 workers left"
button. The finger itself was not visible (see fix 2). A person would not tap there, so I do not count it as a dead tap. Shot: `shots/hollow/r42-g2-dead1.png`.

### R39 phone fixes: status
| R39 problem | Status | Measurement |
|---|---|---|
| Prompt pill cut at 375 (52 px of text in a 36 px box) | **FIXED** | I measured the pill before every tap in 2 tutorials and 8 games, at both sizes, about 190 prompt texts, 40+ of them distinct. scrollHeight > clientHeight in **0** of them (worst sh50/ch50), and scrollWidth = clientWidth = 121 in all. The box grows to 52 px for 3 lines, at 14 px font. The four R39 examples now fit: "Tap a meadow card to take it: 2 left." sh50/ch50, "Spend goods for tokens, or stop: 3 left." sh50/ch50, "Keep one; your rival gets the other." sh50/ch50, "1 of 5 discarded. Tap 4 more." sh35/ch35. Two prompts briefly read off-screen during the pill's bounce animation ("2 of 3 discarded. Tap 1 more.", "Pick a worker, then where it goes."). The screenshot shows the full text: `shots/hollow/r42-g1-cut26.png`. |
| Keep-one choices were nameless backs | **FIXED** | Seen in the forced probe and naturally in games 4, 5, 6 and 7. The two choices are face-up `.tchip.tcard.tbig`, 89-120 px wide by 103-134 px tall, with full names ("Bramble Allotment", "Amber Still", "Pulley Lift", "Hoard Cellar", "Candlewick Shrine" ...), points and cost. That is about the size of a hand card (~105x130 in the same build). Shot: `shots/hollow/r42-teach-keepone.png`. |
| Hint finger covers card names | **PARTLY FIXED** | Finger box vs name boxes (`.pvc-name,.hcn,.tcn,.cn,.nm,.pv-name`): **0 overlaps** across all runs. Finger box vs cost boxes (`.pvc-cost`): it overlapped costs in every game, on 4-13 different cards per game (for example "Costs 2 berries", "2 twigs 1 resin 1 pebble"). In `r42-g1-cut26.png` the finger hides "1 resin / 1 pebble" on Candlewick Shrine. On the very first turn it hides the reward of the suggested place, "3 berries" on Bumper Bramble (`r42-g6-first.png`). The fingerSpot fallback also creates a new problem (fix 2). |

Non-regression vs R39: tutorial 37 steps with 0 dead taps (R39: 37 steps, 41 taps, 0 dead). Default path is still Play > Play now > Start with
Guided, 2 players. Glow-follower won **7 of 7** (R39: 3 of 4). 0 errors.

### Scores
| # | Row | Score | Why (measured) |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | logic-test 214/214 pass. The result table lists city, purple bonuses, tokens, goals and Journey, and Keep-one gives the other card to the rival. No change in rules since R39. |
| 2 | Tutorial teaches | 8 | 37 one-line steps, 42 taps, 0 dead taps at 375x667 and 375x553. It ends with "You know every rule" and opens a real game. 11 of 42 taps are still Next only. |
| 3 | First 10 seconds | 8 | Fresh profile: on turn 1 a "Your turn: Tap a glowing place or card" tip and a finger on one glowing place (Bumper Bramble). The finger covers that place's reward text ("3 b..s"), so this does not rise to 9 (`r42-g6-first.png`). |
| 4 | Turn clarity | 7 | Prompts now read in full on every turn, and counters count down. Still: the finger hides costs and rewards, and sometimes it is invisible (fix 2). "Play a shown card free, or skip" offers two 44 px art-only cards with no names (`r42-g6-fingerbad.png`). |
| 5 | Phone play | **6** | Same as R39 (6), for new reasons. Fixed: the pill is never cut (0 of ~190 measurements at both sizes) and Keep-one is face up with names. No tap target under 44 px. Remaining: coach-bubble text is **12.5 px (body) and 13.5 px (title)**, below 14 px, in every game ("Tap a glowing place or card", "Tap Prepare. Worke..", "The power needs a card..."). The finger covers cost text. At 375x553 the finger hides under the Prepare bar (fix 2). |
| 6 | AI and pacing | 7 | Down from 8. A glow-follower won 7 of 7 on defaults (R39: 3 of 4), with margins 1, 1, 7, 8, 9, 10, 14 and Bramble scoring 28-45. The rival plays sensibly and briskly, but on the default level it now looks a little soft. A finger-follow game takes 1.45 min. |
| 7 | Feel | 7 | Painted places, cards and meeples, a finger hint, and a coach. Not changed in this round. |
| 8 | Bugs | 8 | 2 tutorials and 8 games to the result card: 0 page or console errors (with media served), 0 stuck states, 0 dead taps. The invisible finger is a hint defect, not a stopper. |
| | **Total** | **7.4** | 8+8+8+7+6+7+7+8 = 59 / 8 = 7.375, shown as **7.4**. **FAIL**: row 5 is under 7. No stopper. |

### Fix list (hollowbough)
Row 5 is below 7: fixes 1 and 2 are needed to PASS. Fixes 3-5 keep rows 4 and 6 at 7.
1. **Row 5: coach text under 14 px.** The `.gxh` coach bubbles use 12.5 px body and 13.5 px title text. Repro: fresh profile, Play > Play now >
   Start at 375x667; the "Your turn / Tap a glowing place or card" bubble shows on turn 1 (`shots/hollow/r42-g6-first.png`). Raise both to at least 14 px.
2. **Rows 4 and 5: the hint finger disappears under the action bar or tray.** `#finger` has z-index 42 and `#acts` has 45. When the target is a hand
   card at 375x553, fingerSpot's last fallback spot (below the card) puts the finger at 237,495 (40x48), under the "Prepare" button, so it is invisible.
   At 375x667 the same thing happens for tray choices ("Play a shown card free, or skip"). Repro: 375x553, default game, Winter turn with 0 workers left
   and a hand card suggested (`shots/hollow/r42-g5-fingerbad.png`). Also seen on the "Place a worker" turn
   (`shots/hollow/r42-g2-dead1.png`), and at 375x667 in `shots/hollow/r42-g6-fingerbad.png`. Fix: raise the finger above `#acts`, and drop spots that fall outside the visible panel.
3. **Row 4: the finger covers cost and reward text.** Add `.pvc-cost` and the place reward label to fingerSpot's avoid list. Repro: any default game.
   On turn 1 the finger covers "3 berries" on Bumper Bramble (`r42-g6-first.png`). In a discard step it covers "1 resin / 1 pebble" on Candlewick Shrine (`r42-g1-cut26.png`).
4. **Row 4: "Play a shown card free, or skip"** shows the two choices as 44 px art-only thumbnails with no names. Show names, as Keep-one now does
   (`shots/hollow/r42-g6-fingerbad.png`).
5. **Row 6: check the default rival's strength.** The glow-follower won 7 of 7 here, against R39's 3 of 4. Run a larger seeded batch (20+ games) and nudge the rival up if the win rate is above about 80 %.
6. **Staging note, not scored:** the staged folder has no `media/`. A deploy of this folder alone would show 404s for all painted UI images.
