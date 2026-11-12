# R31 gameplay re-review (strict, by touch)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. Each game branch was checked out in its own worktree, with
`origin/alex/brave-carson-rbpmlk` merged in locally (not pushed). The gate was `VIS_SLUGS="," build-all.py --full --out /tmp/r31/<x> <slug>`.
I served the built page next to `games/<slug>/{media,models,music}` and drove it with Playwright 1.63 using only `touchscreen.tap`
(isMobile, hasTouch, fresh storage, default settings). My driver is a newcomer who taps the lit thing. Before each tap it waits for the
screen to settle, hit-tests the target's centre, and counts a tap as **dead** when nothing on the page changed 0.9 s later.
The gates ran on the same 4 cores during the first sands games, so the sands waits may run a little long.

| Game | Total | Verdict | Gate | Lowest rows |
|---|---:|---|---|---|
| sands-of-qamar | 7.0 | FAIL | PASS | 7 Feel 6, 8 Bugs 6 |
| hollowbough | 7.0 | FAIL | PASS | 6 AI and pacing 6, 8 Bugs 6 |

---

## 1. sands-of-qamar (shelf/W497-sands-gameplay, merged locally @ b339eb93): 7.0, FAIL

Gate: **PASS** (after `npm i` in games-src: phone-check 64.9 s, `rules-test.js ok: ai games 200 stuck 0`, "1/1 PASS", EXIT 0).
Lab WARN 9/12 (LAB rows differ from the scenario list; this does not fail the gate).

What I played:
- Tutorial ("New here? Learn by playing") at **375x667** by touch to "Play a real game": 41 coach lines, 56 taps (9 of them
  Next), 87 s, longest settle 2.8 s, **0 dead taps**, 0 covered targets, 0 errors. It ended in a 109-105 practice win.
  Only the step's own target is lit. Everything else is greyed (End turn, the goods chips), and Next is hidden while the
  coach plays a scripted move. Every target was 44 px or more (tiles 58x44-48, bid spots 69x44).
- Two full default games (▶ Play vs computer > Start: 2 players, easy rival, hints off) to the result card:

| Game | Size | How I played | Result | Time | Taps | Dead taps |
|---|---|---|---|---|---|---|
| g390 | 390x844 | only the lit target (the chooser's "best" when one was open) | **lost 184-219** | 4.0 min | 143 | 4: the lit free "0🪙" bid spot 3 times, End turn once |
| g375m | 375x667 | mixed newcomer: 30 % of taps on any tile, card or button | **won 210-201** | 5.6 min | 203 | 3 on the lit "0🪙" bid spot. The other 30 were taps on unlit tiles, which are expected to do nothing. |

- 0 page errors and 0 console errors, 0 stuck states, and both games reached the result card ("You lose" / "You win!" with a
  full score table, Play again and View the board).

Rules check: same as R25/R27 (bid track and turn order, moving people and landing on a matching colour, tribe and tile actions,
the sale table, djinns, camels and scoring). **New and right:** "no legal move" now ends the game, as the published rule says
(engine.js:72/79: the player uses djinn powers only, then the game ends; the Rules screen says the same). Nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Every core rule matches, and the no-legal-move end is now right. |
| 2 | Tutorial teaches | 8 | Fixed: 0 dead taps in 56 at 375. Only the target glows, everything else is greyed, Next hides during scripted moves. One line and one tap per step, 87 s, ends in a real game. Still 9 Next-only taps. The end card ("The count") shows only the total, not where the points came from. |
| 3 | First 10 seconds | 7 | Big "New here? Learn by playing", a short goal, one lit spot. The board is still 30 busy tiles at first sight. |
| 4 | Turn clarity | 7 | Step tabs (Bid / Move / Take / Sell), one-line prompt ("Tap a glowing spot to bid"), pops that add up, gain badges on tiles (+19, ★+6). |
| 5 | Phone play | 7 | Fixed: the bid track is two rows of 70x48 spots with 68x44 buttons at both sizes. Nothing under 44 px in either game. At 390 the second row sits on the bottom edge of the screen. The round-start score pop ("You score 10 pts from goods sets") covers the top tile row. |
| 6 | AI and pacing | 7 | The lit-target player lost 184-219. The mixed player won 210-201. So a newcomer can win on defaults, but following the light alone does not win. Games take 4-5.6 min. The longest wait was 3.5 s (390) and 5.7 s (375). |
| 7 | Feel | 6 | Unchanged: people drop tile by tile, coins and goods animate, painted result art. It still feels like following one lit tile at a time through every move. |
| 8 | Bugs | 6 | **Not fixed:** at the start of a round, the first tap on the lit free bid spot does nothing while the score pop shows. The second tap works. It happened 3 times in each game, at both sizes. Once the last End turn needed a second tap too. 0 errors, 0 stuck, gate PASS. |
| | **Total** | **7.0** | **FAIL**: rows 7 and 8 are below 7. 8+8+7+7+7+7+6+6 = 56/8. No stopper (the second tap always worked). |

### Earlier findings (R27)
| Finding | Status | Evidence |
|---|---|---|
| Row 2/8: tutorial step 1, the glowing spot ignores taps until Next | **Fixed**: step 1 lights only Next. The spot lights on the next step and works the first time. | R31-shots/sq-tut375-sell-only-target.jpg (same pattern on the sell step) |
| Row 2/8: tutorial "End turn" looks live and does nothing; lit "Pay 2 Sages (best)" dead | **Fixed**: other buttons are greyed. Pay 2 Sages, Wahha and End turn all worked on the first tap. | R31-shots/sq-tut375-sell-only-target.jpg |
| Row 8: lit free bid spot ignores taps at round start while a score pop shows | **Not fixed**: 3 dead in each game at 390 and 375, and the second tap works. | R31-shots/sq-g390-bid-dead-first-tap.jpg |
| Row 5: 8th/9th bid spots half-width stacks | **Fixed**: two rows of 44 px spots. | R31-shots/sq-bid-track-375.jpg |
| Row 5: score pops sit over the step tabs | **Changed**: the pop now sits below the tabs, over the top tile row. | R31-shots/sq-g390-bid-dead-first-tap.jpg |
| Row 5: 58x36 tutorial tile target | **Fixed**: the smallest tutorial target was 58x44. | n/a (driver log) |
| Row 1: no legal move passes instead of ending the game | **Fixed** (engine.js:72/79, Rules screen). | n/a (code + rules check) |
| Row 6: mixed newcomer cannot win | **Fixed**: the mixed player won 210-201. But the lit-only player lost 184-219. | R31-shots/sq-g375-result-won.jpg, sq-g390-result-lost.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 | Round start, 390 and 375: tapped the lit "0🪙" spot right after my End turn and the rival's turn settled | The first tap did nothing, the second worked (3 times per game). The score pop is on screen each time. | R31-shots/sq-g390-bid-dead-first-tap.jpg |
| 6 | Followed only the light at 390 | Lost 184-219: the rival took 71 tile points and 30 palm points to my 45 and 6. | R31-shots/sq-g390-result-lost.jpg |
| 5 | Round start at 390 | The second bid row touches the bottom edge, and the score pop covers the first tile row. | R31-shots/sq-g390-bid-dead-first-tap.jpg |
| 2 (good) | Tutorial at 375 to the end | 0 dead taps, ends on "Play a real game". | R31-shots/sq-tut375-end.jpg |

---

## 2. hollowbough (shelf/W482-hollowbough, merged locally @ a51a8bae): 7.0, FAIL

Gate: **PASS** (phone-check 63.9 s with no dead-tap lines, `sweep.js ok`, "SWEEP PASS", "1/1 PASS", EXIT 0). Lab WARN 10/12
(LAB rows differ from the scenario list; this does not fail the gate). I served every asset folder (cards, media, models, music).

What I played:
- Tutorial ("New here? Learn in 5 minutes") at **375x667** by touch to "Play a real game": 37 steps, 41 taps (10 of them
  Next), 61 s, longest settle 1.4 s, **0 dead taps**, 0 covered targets, 0 errors. It ends on the score table, "You win, 22 to 1".
- Two full default games (Play > "Play now" > Start; mode Guided, 2 players) to the result card:

| Game | Size | How I played | Result | Time | Taps | Dead taps on lit targets |
|---|---|---|---|---|---|---|
| g390 | 390x844 | only the glowing thing | **lost 24-27** (city 13/15) | 2.5 min | 82 | 4: a glowing meadow card twice and another once ("Tap a meadow card to clear away"), and "Stop here" once |
| g375m | 375x667 | mixed newcomer, 30 % of taps on any place, card or button | **lost 15-25** (city 6/15) | 2.1 min | 67 | 0. Twelve taps on greyed places or cards I could not pay for did nothing, which is expected. |

- Both games reached a real result card ("Bramble wins!", a score table, Play again / Look at the board / Main menu). 0 page and
  console errors, 0 stuck states, and no discard loop ("discard" came up twice per game and closed normally).

Rules: unchanged and right for 2 players (8 basic places plus forest and Haven, workers 2/+1/+1/+2, Spring and Autumn production,
2 meadow cards in Summer, hand 8, city 15, Journey in Autumn, basic and special events). Nothing invented in what I saw.
The result table lists cards, point tokens and Journey but no separate goals or events row.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | A full guided year, one line and one tap per step, 61 s at 375, 0 dead taps, then "Play a real game". The rival still ends on 1 point (22-1), and 10 of 41 taps are Next only. |
| 3 | First 10 seconds | 7 | Learn and Play up top. Play asks "Learn in 5 minutes / Play now". A goal card with one Start. Places glow. |
| 4 | Turn clarity | 7 | Short prompts ("Pick the resource you want to gain.", "Spend goods for tokens, or stop."). Costs sit on the cards. The prompt is a small pill in the top-left corner, easy to miss. |
| 5 | Phone play | 7 | Places 127x89 (390) and 88x77 (375), hand cards 117-122 px, 44 px tabs and buttons. Nothing cut off in my shots. The meadow tab shows one big card and leaves the right half of the screen empty. |
| 6 | AI and pacing | 6 | The rival is brisk (longest settle 1.8 s) and games take 2-2.5 min. But a newcomer lost both default games: following the glow 24-27, mixed 15-25. Across R24 and R31 that makes 0 wins in 4 default games. |
| 7 | Feel | 7 | Painted places and cards, meeples, flying cards, a painted end scene with achievements. |
| 8 | Bugs | 6 | Fixed: the result card is reachable in both games, and the discard/Undo loop is gone. 0 errors, gate PASS. But 4 lit targets ignored the first tap in the 390 game (the glowing meadow card twice, Stop here once). The next tap worked, so it is not a stopper. |
| | **Total** | **7.0** | **FAIL**: rows 6 and 8 are below 7. 8+8+7+7+7+6+7+6 = 56/8. No stopper. |

### Earlier findings (R24)
| Finding | Status | Evidence |
|---|---|---|
| Row 8: no result card by touch in either game | **Fixed**: the result card showed in both games. | R31-shots/hb-g390-result-24-27.jpg, hb-g375-final.jpg |
| Row 8: "4 of 5 discarded. Tap 1 more." loop, then a fresh 0-0 game | **Fixed**: not seen in 149 game taps. | n/a (driver log) |
| Gate FAIL (menu scenario, phone-check dead taps) | **Fixed**: `--full` PASS. | gate log |
| Row 2: guided rival scores 1 all year (22-1) | **Not fixed**. | R31-shots/hb-tut375-end-22-1.jpg |
| Known: score chips crowd with 3-4 players | **Not checked** (defaults are 2 players). | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 | 390, Summer: "Tap a meadow card to clear away", tapped the glowing card | Two taps on one card and one on another did nothing. A later card took the tap. | R31-shots/hb-g390-meadow-card-dead.jpg |
| 8 | 390, Autumn: "Spend goods for tokens, or stop", tapped the glowing "Stop here" | The first tap did nothing. | R31-shots/hb-g390-stop-here-dead.jpg |
| 6 | Two default games | Lost 24-27 following the glow and 15-25 mixed. | R31-shots/hb-g390-result-24-27.jpg, hb-g375-final.jpg |
| 2 (good) | Tutorial at 375 | 0 dead taps in 41, one line per step. | R31-shots/hb-tut375-forest-step.jpg |
