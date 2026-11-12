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
