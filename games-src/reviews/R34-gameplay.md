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
