# R34 strict gameplay re-review (12 Nov 2026)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. Every game: fresh `git fetch`, `git checkout -B rv origin/<branch>`, local merge of
`origin/alex/brave-carson-rbpmlk` (not pushed), built with `VIS_SLUGS="," build-all.py --full`, served next to its
`games/<slug>/media` folder. Played by real touch (`page.touchscreen.tap`, hasTouch + isMobile) at 390x844 and 375x667 on default
settings. A "dead tap" = a tap after which neither the game state nor any text on the page changed within 0.9 s.

---

## 1. sands-of-qamar (shelf/W497-sands-gameplay @ 2768f6dc, merge was a no-op): 7.3, FAIL

Gate: **PASS** (`rules-test.js ok: ai games 200 stuck 0 / PASS rules-test`, "1/1 PASS", EXIT 0).

What I played:
- Tutorial ("New here? Learn by playing") at **375x667** by touch to "The count / Play a real game": 55 taps, 94 s,
  **0 dead taps**, 0 covered targets, 0 targets under 44 px, longest settle 2.8 s, 0 errors. It ends in a 109-105 practice win.
- Four full default games (▶ Play vs computer > Start: 2 players, easy rival, hints off) to the result card:

| Game | Size | How I played | Result | Time | Taps | Dead taps | Bid taps (first-tap misses) |
|---|---|---|---|---|---|---|---|
| g390 | 390x844 | only the lit target, chooser "best" when offered, 350-600 ms after it lit | **won 268-155** | 4.5 min | 153 | 0 | 18 (0) |
| fast390 | 390x844 | same, but every bid tapped 0/60/120/200/300 ms after the spot lit | won 268-155 (same deal) | 4.5 min | 153 | 0 | 18 (0) |
| fast375 | 375x667 | as fast390 | **lost 191-207** ("A hair's breadth!") | 4.3 min | 140 | 0 | 16 (0) |
| g375m | 375x667 | mixed newcomer: 30 % of taps on any tile, card or button | **lost 174-213** | 6.4 min | 177 | 0 | 16 (0) |

- 0 page errors and 0 console errors, 0 stuck states. Longest rival wait 5.6 s (390) and 9.7 s (375, mixed).
- (One earlier 390 run stopped at round 9 because my driver did not know the orange "Earn 6" button. That was my driver, not the
  game: the button was lit and worked on the re-run.)

**R31's first-tap issue does not reproduce on this build.** 68 bid taps over four games at both sizes, 34 of them 0-300 ms after
the spot lit while the round-start score pop was on screen: every first tap placed the bid (checked by `G.bids` growing). I agree
with fixer F7.

Rules check: unchanged from R31 and right (bid track and turn order, move people and land on a matching colour, tribe and tile
actions, sale table, djinns, camels and palms/palaces, scoring, no legal move ends the game). The new easy-rival rule (eases off
when it leads by 10+) is an AI setting, not a rule change. Nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Every core rule matches; nothing invented. |
| 2 | Tutorial teaches | 8 | 55 taps at 375, 0 dead, only the target lit, ends on "Play a real game". The end card ("The count") still shows only the total, not where the points came from. |
| 3 | First 10 seconds | 7 | Short goal line, a big "New here? Learn by playing", one lit spot. The board is still 30 busy tiles at first sight. |
| 4 | Turn clarity | 7 | Step tabs (Bid / Move / Take / Sell), one-line prompt, score pops that explain gains and losses ("You lose 3 pts: coins −6, goods sets +3"). |
| 5 | Phone play | 7 | Every tapped target 44 px or more at 390 (tiles 60x91). At 375 tiles are 58x56 at the start, but on the Take step the Earn list (4-7 stacked buttons) squeezes the grid to 58x36 tiles; tiles are not the target then, but a stray tap is easy. The round-start score pop still covers the top tile row. |
| 6 | AI and pacing | 7 | Following the light: 1 win (268-155) and 1 close loss (191-207). Mixed newcomer lost 174-213. So a newcomer can win on defaults and the rival is no pushover. Games 4.3-6.4 min, waits up to 5.6-9.7 s. |
| 7 | Feel | 6 | Unchanged: people drop tile by tile, coins and goods pop, painted result art with a voiced line. It still plays as following one lit tile through every step. |
| 8 | Bugs | 8 | **Fixed:** 0 first-tap misses in 68 bids, 0 dead taps in 523 game taps, 0 errors, 0 stuck, gate PASS. |
| | **Total** | **7.3** | **FAIL**: row 7 is below 7. 8+8+7+7+7+7+6+8 = 58/8 = 7.25. No stopper. |

### Earlier findings (R31)
| Finding | Status | Evidence |
|---|---|---|
| Row 8: first tap on the lit free bid spot at round start ignored | **Fixed / not reproducible**: 0 misses in 68 bids, incl. 34 taps 0-300 ms after it lit | games-src/reviews/R34-shots/sq-g390-score-pop-top-row.jpg (pop on screen during play) |
| Row 6: following the light alone loses (184-219) | **Fixed**: won 268-155 at 390, lost 191-207 at 375 (close) | games-src/reviews/R34-shots/sq-g390-glow-won-268-155.jpg, games-src/reviews/R34-shots/sq-g375-glow-lost-191-207.jpg |
| Row 5: second bid row on the bottom edge at 390; score pop over the top tile row | **Partly**: bid rows fine (0 small targets); the pop still covers the top tile row for a moment | games-src/reviews/R34-shots/sq-g390-score-pop-top-row.jpg |
| Row 2: end card shows only the total | **Not fixed** | games-src/reviews/R34-shots/sq-tut375-end.jpg |
| Row 7: feels like following one lit tile | **Not fixed** (no change to feel this round) | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | 375x667, Take step with a few Mystics in hand | The Earn list (Earn 6 / 8 / 10 / 12 ...) stacks under the board and squeezes the tiles to 58x36 px. At 390 with 7 Earn rows the tiles shrink to about 46 px. | games-src/reviews/R34-shots/sq-g375-earn-list-tiles-36px.jpg |
| 6 (good) | Glow-follow at 390 | Won 268-155; the result card names where the points came from ("most of the points came from Goods (94)"). | games-src/reviews/R34-shots/sq-g390-glow-won-268-155.jpg |
| 6 (good) | Mixed newcomer at 375 | Lost 174-213; a fair game, not a rout. | games-src/reviews/R34-shots/sq-g375-mixed-final-board.jpg |

---

## 2. tidewake (shelf/W498-tidewake-gameplay @ 182fefe8, merge was a no-op): 7.1, FAIL

Gate: **FAIL.** Build, phone-check, lab and scenarios pass, but the quick sweep fails: "sweep.js: 4 games, 76 taps ... PROBLEMS 1 /
375x553 g1 lay: covered pb small sdet by none". On the small phone a lay-phase button (`pb small sdet`) has its centre off the
screen (elementFromPoint finds nothing). This is a row 5 and row 8 finding, and it blocks a deploy.

What I played:
- Tutorial ("New here? Learn in 5 minutes") by touch at both sizes to "You know the rules / Play a real game": 35 taps at 390 (89 s)
  and 36 taps at 375 (88 s), **0 dead taps**, 0 targets under 44 px, longest settle 5.1 s, 0 errors.
- Quick games (Quick game > Just play: you vs 2 computers, coach tips on by default) to the end, 8 counted:

| Game | Size | How I played | Placements | Result | Time |
|---|---|---|---|---|---|
| s390a | 390x844 | "Safest start", then "Use ★" + Place every turn | 6 | **won** | 2.7 min |
| s390b | 390x844 | same | 11 | **won** | 4.5 min |
| s390c | 390x844 | same | 18 | **won** | 6.2 min |
| s375a | 375x667 | same | 17 | **won** | 6.0 min |
| s375b | 375x667 | same | 23 | lost (Jade last afloat) | 7.2 min |
| s375c | 375x667 | same | 5 | lost (Cobalt last afloat) | 2.2 min |
| r390a | 390x844 | random gold mark, random tile, 0-2 random turns, Place | 1 | sunk on turn 2 (sailed into a leviathan) | 0.8 min |
| r375a | 375x667 | same | 11 | **won** | 4.7 min |

- ★-follow won **4 of 6** (fair share 33%); every ★ line I logged before Place said 1-3% risk, rising to 10-14% late in the game
  (the fixer's claim that ★ risk is honest looks right). Random play won 1 of 2.
- 0 page and console errors, 0 stuck states. The start pop-up opened on every gold-mark tap (it has two big "upper / lower mark"
  buttons). Rival turns: about 15 s of waiting per round, and up to 27-36 s without anything to tap late in a game.
- (Earlier ★ runs were thrown away: my driver mistook a rival's "Sunk" card for my own, and once kept tapping under a sheet.)

Rules check: unchanged and right (every junk starts on an edge mark before tiles, a dice roll first, 6/7/8 wakes the leviathans,
edge / leviathan / collision sinks, last junk afloat wins, sunk crews stay out, refill to three). The leviathan sheet's numbers
(1-6 faces, move order) match the expansion. No official smaller first-game setup exists, as the fixer says. Nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | 35-36 one-line steps at both sizes, 0 dead taps, ends on "Play a real game". |
| 3 | First 10 seconds | 8 | 4 goal lines on the title, tutorial first, "Safest start · under 1%". |
| 4 | Turn clarity | 7 | Short ★ line with the real risk ("★ Safest: 14% risk, keeps 5 moves open"), ✓ / ✗ / ★ badges, a warning in the prompt ("⚠ Tidegrave: 6-8 reaches you"), a clear Sunk card naming cause and turn. |
| 5 | Phone play | 6 | Tiles 68-100 px, 44 px buttons, start pop-up with big buttons. But the gate sweep finds an off-screen lay button at 375x553, the coach's "Got it" sits over the board and the tap falls through (below), and the "start" label still touches the "Stop" pin. |
| 6 | AI and pacing | 7 | Fixed: ★ now protects a newcomer, 4 wins in 6 (R29: 1 in 4), no more "under 1%" then out. Random play still sinks fast, as it should. Pacing is slow: about 15 s per round of rival play, up to 27-36 s late in a game (Skip helps). |
| 7 | Feel | 7 | Painted chart, junks gliding, leviathans moving one by one, red sink marks, named causes. |
| 8 | Bugs | 6 | 0 errors and 0 stuck. But the gate fails, and tapping "Got it" on a coach bubble opened a leviathan sheet underneath in 5 of 13 game starts. Tapping a ✗ tile gives no feedback at all (9 such taps in the random game). |
| | **Total** | **7.1** | **FAIL**: gate FAIL; rows 5 and 8 are below 7. 8+8+8+7+6+7+7+6 = 57/8 = 7.125. No stopper. |

### Earlier findings (R29)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: ★ doesn't protect a newcomer (1 of 4, out after 1 placement) | **Fixed**: ★ won 4 of 6; the shortest ★ game still lasted 5 placements | games-src/reviews/R34-shots/tw-s390-star-won.jpg, games-src/reviews/R34-shots/tw-s375-star-lost.jpg |
| Row 5/8: gate sweep fails a start-mark tap at 375x553 | **Changed, still FAIL**: start marks now open the pop-up (my 390/375 taps all worked), but the sweep now fails on an off-screen lay button at 375x553 | none (gate log) |
| Row 5: "Stop" pin overlaps the "start" label | **Not fixed** (they touch; both readable) | games-src/reviews/R34-shots/tw-s390-star-line-start-stop.jpg |
| Row 4: ★ line short, risk honest | **Still good**: 1-3 % early, 10-14 % late, matches outcomes | games-src/reviews/R34-shots/tw-s390-star-line-start-stop.jpg |
| Row 2: tutorial clean | **Still good**: 0 dead at both sizes | games-src/reviews/R34-shots/tw-tut390-end.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 / 5 | Tapped "Got it" on the coach bubble ("Your start" / "Lay a current") | The bubble closed and the same tap reached the leviathan under it: its rules sheet opened and covered "Safest start" / Place until I closed it with ✕. 5 of 13 game starts. | games-src/reviews/R34-shots/tw-gotit-tapthrough-sheet.jpg |
| 8 / 5 | Deploy gate at 375x553 | Sweep: lay button `pb small sdet` off screen ("covered ... by none"). | none (gate log) |
| 4 | Random game: tapped a ✗ tile | Nothing happens: no shake, no line saying it would sink you. | games-src/reviews/R34-shots/tw-r375-x-tile-no-feedback.jpg |
| 6 | Full games | Rival turns take about 15 s per round; late in a game I waited up to 27-36 s with nothing to tap. | games-src/reviews/R34-shots/tw-s375-star-lost.jpg |
| 6 (good) | Random play at 390 | Sunk on turn 2 by sailing into a leviathan, with a clear cause line: a careless player loses, a ★ player usually doesn't. | games-src/reviews/R34-shots/tw-r390-random-sunk-turn2.jpg |

---

## 3. vale-of-banners (shelf/W505-vale-gameplay @ 978b7f51, merge was a no-op): 7.0, FAIL

Gate: **PASS** (`rules-test.js ok: AI games: 40/40 finished, stuck 0, invariant breaks 0 / PASS 37 checks`, "1/1 PASS", EXIT 0).

What I played:
- Tutorial ("New? Learn to play") at **375x667** by touch to "You know how to play / Play a real game": 49 taps (15 of them Next),
  79 s, **0 dead taps**, 0 targets under 44 px, longest settle 2.2 s, 0 errors.
- Full Quick games on defaults (▶ Play > Start: 2 players, Gentle rival, Hints on) to the result card:

| Game | Size | How I played | Result | Time | Taps (★ taps) | Dead taps |
|---|---|---|---|---|---|---|
| s390 | 390x844 | always the ★ (tab, tile, die, goods, pop-up button), else the glow | **won 144-115** ("A big win, by 29 points") | 7.3 min | 175 (113) | 0 |
| s375b | 375x667 | same | **won on the tie-break, 154-154** | 6.3 min | 170 (111) | 0 |
| s375c | 375x667 | same | **lost 98-145** ("A clear loss ... Follow ★ Best.") | 6.9 min | 176 (111) | 0 |
| s375 | 375x667 | same | **not finished**: round 4, the ★ pointed at a hidden goods button (below) | 13 min | 500 | 327 (all on the hidden ★ target) |
| g375 | 375x667 | ignored the ★, tapped a random glowing thing on the screen I was on | **lost 71-123**, filled 4 regions, sold twice | 6.3 min | 143 (0) | 0 |

- 0 page and console errors. Rival turns: longest wait 9-13 s.
- Turn 1 now opens on the Market when nothing can be built (390 game; screenshot). The fitting free tiles glow.
- (My first two vale runs stopped on a driver bug: I did not know the tile pop-up's "Take to storage" buttons. Not counted.)

Rules: same as R28/R31 and right (5 seasons x 5 rounds; two dice plus the goods die; take, build, sell or workers; ±1 per worker
with 6 and 1 next to each other; regions, colour bonus, animals, mines, tower; end scoring by silver, goods and workers). Nothing
invented. Open point stays: the result card says "you win the tie-break" without saying which rule decided it.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. The tie-break reason is not shown. |
| 2 | Tutorial teaches | 8 | 49 steps at 375, 0 dead taps, ends on "Play a real game". Still 15 Next-only taps. |
| 3 | First 10 seconds | 7 | Big ▶ Play, defaults chosen, a short goal card, the first turn opens on the Market with the ★ lit. |
| 4 | Turn clarity | 7 | Fixed: the result table and the score chips now use one list (regions / colours / animals / goods sold / tower / silver ...). Every ★ has a reason line. But a ★ follower who loses is told "Follow ★ Best." |
| 5 | Phone play | 6 | Targets 44 px or more, 0 covered targets in 4 games. But in 1 of 3 ★ games at 375x667, after "Chain of 2. Build again", the ★ goods button (Honey) was squeezed under the dock's next row: only a sliver showed, and the ★ line said "Sell your Honey". |
| 6 | AI and pacing | 7 | Fixed: the ★ no longer plays the game for you: 2 wins (one a tie) and 1 clear loss in 3 finished ★ games, vs 168-65 in R31. Without the ★ I lost 71-123 but filled 4 regions (R31: 0). Games 6-7 min at bot speed. |
| 7 | Feel | 7 | Dice roll, tiles fly, region chain banner, turn rating, honest result lines. |
| 8 | Bugs | 6 | 0 errors, gate PASS, 0 dead taps in 3 of 4 ★ games. But the hidden ★ target above: 327 taps on it did nothing in one game, and my driver could not finish it. |
| | **Total** | **7.0** | **FAIL**: rows 5 and 8 are below 7. 8+8+7+7+6+7+7+6 = 56/8. Not counted as a stopper: other moves (4 → 2 workers, the estate) stayed open, but a ★ follower is stuck. |

### Earlier findings (R31)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: ★ too strong (won 168-65) | **Fixed**: 144-115, 154-154 (tie-break win), 98-145 | games-src/reviews/R34-shots/vb-s390-star-won-144-115.jpg, games-src/reviews/R34-shots/vb-s375-star-tie-154.jpg, games-src/reviews/R34-shots/vb-s375-star-lost-98-145-follow-star.jpg |
| Row 6/4: without the ★ a newcomer never finds the market, fills 0 regions | **Better**: the turn opens on the Market when nothing can be built; the no-★ player filled 4 regions but still lost 71-123 | games-src/reviews/R34-shots/vb-s390-turn1-opens-market.jpg, games-src/reviews/R34-shots/vb-g375-glow-lost-71-123.jpg |
| Row 4: result table vs score strip use different groupings | **Fixed**: same rows in both | games-src/reviews/R34-shots/vb-s390-star-won-144-115.jpg |
| Row 5: "Turn over" banner over the score strip | **Not re-seen** (0 covered targets in 3 finished games) | n/a |
| Row 2: tutorial clean | **Still good**: 0 dead in 49 | games-src/reviews/R34-shots/vb-tut375-end.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 / 8 | 375x667, ★ game, round 4 after "Chain of 2. Build again" | The ★ was on "3 · 1 Honey" but the goods row was squeezed under "4 → 2 workers" (only a yellow sliver shows). The ★ line said "Sell your Honey". 327 taps on it did nothing; the game could not go on the ★ way. Seen in 1 of 3 ★ games at 375. | games-src/reviews/R34-shots/vb-s375-star-honey-hidden.jpg |
| 4 | Followed the ★ every turn and lost 98-145 | The result line says "A clear loss, 47 points behind. Follow ★ Best." to a player who did just that. | games-src/reviews/R34-shots/vb-s375-star-lost-98-145-follow-star.jpg |
| 1 / 4 | Tied 154-154 | "Tied on points: you win the tie-break." without saying what decided it. | games-src/reviews/R34-shots/vb-s375-star-tie-154.jpg |

---

## Summary

| Game | Tested commit | Total | Result | Gate | Lowest rows |
|---|---|---:|---|---|---|
| sands-of-qamar | 2768f6dc | 7.3 | FAIL | PASS | 7 Feel 6 |
| tidewake | 182fefe8 | 7.1 | FAIL | FAIL (sweep, 375x553) | 5 Phone 6, 8 Bugs 6 |
| vale-of-banners | 978b7f51 | 7.0 | FAIL | PASS | 5 Phone 6, 8 Bugs 6 |
