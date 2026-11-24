# R13 review: scenario tutorials, LIVE site (24 Nov)

Method: live `https://am015-dev.github.io/spotify_to_ytmusic/<slug>/?lessons=1` (Rampart: `__RVL.open()`), 402x874 touch and 1366x768,
turbo.js, every lesson started via `GXST.start(i)`, shot at start, then auto-played by the show-me hint target (tap ring centre, up to 6 taps),
shot at end, then `GXST.close()` and a shot of what follows. 196 shots, 22 contact sheets read by eye (all 18 phone/pc sheets for the 9 games
that have lessons). The hint autoplay is a probe, not a solver: "not won by hint taps" means the show-me ring only points at step 1 of a
multi-step move; it is not by itself proof that a lesson is broken. Card never covered a hinted target (overlap=false, 0 covered taps) and
0 JS errors in every run.

## Scores (0-10; a teaches by decision+consequence, b never blocks/covers, c phone-readable, d game-like HUD, e finishes into real game)

| game | a | b | c | d | e | total /50 |
|---|---|---|---|---|---|---|
| kaiten-kitchen | 8 | 9 | 8 | 8 | 8 | 41 |
| lantern-dive | 8 | 9 | 8 | 7 | 8 | 40 |
| rampart-and-vine | 8 | 8 | 8 | 8 | 6 | 38 |
| cauldron-fair | 8 | 7 | 8 | 8 | 7 | 38 |
| emberclimb | 8 | 8 | 8 | 8 | 5 | 37 |
| twin-thrones | 7 | 8 | 7 | 7 | 5 | 34 |
| short-fuse | 7 | 7 | 7 | 7 | 5 | 33 |
| tidewake | 7 | 6 | 7 | 7 | 5 | 32 |
| sunglaze | 6 | 7 | 6 | 8 | 5 | 32 |
| thornbound | 0 | - | - | - | 0 | 0 (no lessons live) |
| ochre-horizon | 0 | - | - | - | 0 | 0 (no lessons at all) |

## Defects, by severity

1. **thornbound, all sizes: lessons not deployed.** `games-src/thornbound/game/lessons.js` (10 lessons, commits 90f1866d/0ce254e6) exists, live page has no GXST. Fix: rebuild + deploy thornbound with gx-scenario-tutor in ORDER.
2. **ochre-horizon, all sizes: no scenario tutorial.** No GXST in source or live. Fix: author lessons.js per TUTORIAL-SPEC section 4 (6-10 lessons + short game).
3. **twin-thrones L10 `game` and emberclimb L10 `game`, both sizes: Close lands on the title screen, not in a game** (99-after-close shots). Fix: in each lessons.js, on the last lesson's win/close start a real Easy game (call the game's newGame/quick-start) instead of returning to title.
4. **Lessons entry hidden: `.gxst-q` is 0x0 in cauldron-fair (both), short-fuse (both), sunglaze (both), emberclimb (both), rampart (both), twin-thrones phone; `?lessons=1` does not auto-open in cauldron, short-fuse, sunglaze, tidewake, twin-thrones, rampart.** A player who closes the picker cannot replay a lesson. Fix: pass `qParent` to `GXST.init` (each game's lessons wiring) pointing at a visible bar, or add a `Lessons` item to the in-game menu.
5. **tidewake L6 `cannon`, L7 `gate`, 402x874: the game's own danger/choose panel covers the lower half of the board while the lesson card covers the upper middle.** Fix: in tidewake lessons keepClear add the danger panel selector and dock the panel below the board on phone (tidewake ui, danger modal).
6. **tidewake L1 `mark`, both sizes: show-me hint has no target (`state().target` null) so step 2 of Hint rings nothing.** Fix: tidewake/game/lessons.js `mark` hint 2 target -> the safest start mark element.
7. **sunglaze, short-fuse, tidewake: a full lesson pass takes > 60 s under turbo (budget exceeded), others 30-45 s.** Long settle waits make each lesson feel slow. Fix: shorten `settled()` caption/AI delays while `GXST.active()` (each game's lessons.js settled()).
8. **Multi-step moves: show-me ring points only at step 1 (sunglaze all lessons: kiln then rack; short-fuse `dual/order/miss/gear/probe/yellow/red/reveal`: probe/wire then partner wire; twin-thrones L2-L9: card then Build; emberclimb `block/intent/poison`).** Taps on the ring alone never finish. Fix: make the hint target a function returning the next needed element (selected? -> rack/Build/confirm).
9. **sunglaze 1366x768: lesson card is 3% of the screen, tucked bottom-right under the wall; at 402x874 it sits over the top kiln row.** Fix: sunglaze keepClear add the kilns at phone, and raise min card width on pc (gxst css var / sunglaze theme).
10. **short-fuse 402x874: card parks between Teal and Plum racks in the middle of the table** (all lessons). Fix: keepClear the crew racks so it docks above the player's rack.
11. **cauldron-fair L6 `boom` 402x874: day-end score sheet covers the board with the lesson card on top** — the consequence is shown, but the goal card and sheet compete. Fix: hide the card while the score sheet is open (cauldron lessons settled()).
12. **emberclimb L1 `strike`, L8 `sweep`: win card lands on the reward screen ("Victory! Skip/Continue"), so two CTAs compete.** Fix: suppress the reward screen while `GXST.active()`.
13. **rampart-and-vine: lesson flow only reachable through `__RVL.open()` / title button; L8 short game: after Close the player is left mid-lesson board with no Lessons button.** Fix: see 4.

Proof: sheets in reviewer scratch (not committed, per read-only rule); rerun with the R13 runner pattern above.
