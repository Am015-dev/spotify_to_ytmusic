# R37 strict gameplay review (12 Nov 2026, 21:15-22:15 UTC)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. PASS needs every row at 7 or more. A stopper caps the total at 4.
Brief rule for this round: both gates (`--quick` and `--full`, `VIS_SLUGS=","`) must pass. A failing gate is a stopper.

How I played: each branch in its own fresh worktree. Play copies built with `build-all.py --no-check` and served by the game's own
`gx-serve.js` (so media come from that branch). Playwright 1.63.0, `isMobile`, `hasTouch`, real `touchscreen.tap` only, at the centre
of a control after `elementFromPoint` confirmed it was on top. Fresh storage, started from the title by tapping. The tutorials were
driven by the coach's own highlighted hole or its Next button. Screenshots are local to the review machine (names given, not committed).

## Summary

| Game | Commit tested | --quick | --full | Rows 1-8 | Raw avg | Total | Result |
|---|---|---|---|---|---:|---:|---|
| short-fuse | 9198c40d | **FAIL** (sf-board) | PASS | 8 8 8 7 7 7 7 8 | 7.5 | **4.0** (capped) | **FAIL** |
| cauldron-fair | 93ae36dd | **FAIL** (cf-start) | PASS | 8 8 8 7 6 7 7 8 | 7.4 | **4.0** (capped) | **FAIL** |
| vale-of-banners | 512dd83a | PASS | PASS | 8 8 7 7 5 7 7 6 | 6.9 | **6.9** | **FAIL** |

Note on the gates: `--full` in build-all.py does not run the scenario tests, but `--quick` does. Both short-fuse and cauldron-fair
pass `--full` and fail `--quick`, the same way on two clean runs with nothing else running. In both cases the failing test is the
game's own scenario, broken by a change on that branch.

---

## 1. short-fuse (shelf/W488-short-fuse-sprites @ 9198c40d179cdc803ddce3a4ba825af57db78c85): 4.0 (capped), FAIL

**Gates**
- `--quick`: **FAIL**, twice. `scenarios 8/9 ok: sf-board: Error: board fills the screen: board only 50% of the screen`.
  I measured `#felt` at `?scn=sf-board`: 390x763 = 390x379 = **49.7%** (the bar is > 50%). 375x553 = 40.3%, 1366x768 = 32.0%,
  1280x800 = 34.8%. The commit that makes own wires 44 px wide pushed the board under the bar on the phone project.
- `--full`: PASS (phone-check 60.4 s, quick sweep: 4 games, 0 with problems).

**What I played**
- Tutorial ("Learn to play") at 375x667 and 390x844: 17 steps, 17 taps (5 Next-only), 0 taps that did not advance, 0 targets under
  44 px, 0 bubbles over a target, 26-27 s, 0 errors. Ends on "Training done / Play job 1".
- Jobs from the title's **Play** (3 crew, Normal), playing as a clue reader (tokens, the low-to-high order and the new range labels):
  - 375x667: job 1 lost (fuse, 14/24), job 1 **won** on Again (24/24), job 2 lost (fuse, 24/34).
  - 390x844: job 1 **won** (clean, 24/24), job 2 lost twice (fuse, 18/34 and 24/34).
  - Job 4 at 375x667: lost (fuse, 36/51). Job 4 at 390x844: lost, "You pointed at a red wire" (my driver's pick).
  - 10 jobs to the result card. 0 page or console errors, 0 stuck states, 0 taps on covered targets, **0 targets under 44 px**.
    Wait from my last tap to my next turn: median 1.7-3.8 s, max 5.7 s.
- Sizes: own wires and job-1 crew wires 49x49 or larger. In job 4 at 375 the zoomed crewmate's wires are 49x49 (Teal) or 54x70 (Plum).
  The other crewmate is a compact 22x24 strip. Tapping the strip swaps the zoom (checked), so it is a 2-tap view, not a dead target.

**Rules**: no rules code changed since R22/R33, which checked the published game. The new crew range labels ("1-2", "4-6") follow
from the sort order and the tokens, so nothing is invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right: dual cut, solo cut, yellow, red, tokens, fuse by crew size, gear, Twin Probe. |
| 2 | Tutorial teaches | 8 | 17 one-line steps, one tap each, 0 dead, at both sizes, then "Play job 1". |
| 3 | First 10 seconds | 8 | One-line pitch, a big Play, "Learn to play · A guided first job", short job card. |
| 4 | Turn clarity | 7 | "Your turn · 1 action · or play gear", "Your turn: tap a crew wire to guess", and now range labels under hidden crew wires (fixes R33's "guess blind"). But the red-loss card contradicts itself (below). |
| 5 | Phone play | 7 | Fixed: every target I tapped was 44 px or more at both sizes. Still: the compact crewmate plate reads "P…" at 375 in job 4 (the commit says names in full), and about 90 px of empty floor sits between the crew and "You" while the compact strip is 22x24. |
| 6 | AI and pacing | 7 | Crew turns are quick (median wait under 4 s), jobs take 20-45 s. My clue reader won 3 of 10 jobs, mostly on job 1. No crewmate pointed at a red. |
| 7 | Feel | 7 | Snip, burning fuse, painted DEFUSED/BOOM cards with move ticks and "Next job, try: ..." |
| 8 | Bugs | 8 | 2 tutorials + 10 jobs: 0 errors, 0 stuck, 0 dead taps. |
| | **Total** | **4.0** | Raw 60/8 = 7.5, **capped at 4: the `--quick` gate fails** (sf-board). Rows are all 7 or more, so fixing the gate should give a PASS. |

**Fix list**
1. **Gate (stopper)**: make `#felt` cover more than 50% of the screen at 390x763 (now 49.7%), e.g. trim the gap between the crew area
   and the "You" plate. Then the `--quick` gate passes. Repro: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick --out /tmp/x short-fuse`.
2. Row 4: the red-loss card says "BOOM! / You pointed at a red wire" and then "The fuse won this round. Read the tokens closer next time."
   Repro: job 4 at 390x844, point at a red wire. Use a red-specific line. Shot: sf390j4-result1.png.
3. Row 5: in job 4 at 375x667 the compact crewmate plate shows "P…" instead of "Plum". Shot: sf375j4-turn1.png.
4. Row 2 (small): on "Training done" the "Play job 1" button showed dark text on a dark brown fill in my shot. Check its contrast. Shot: sf375-tut-end.png.

---

## 2. cauldron-fair (shelf/W503-cauldron-gameplay @ 93ae36dd098c1a08b7aa38756902207823204223): 4.0 (capped), FAIL

**Gates**
- `--quick`: **FAIL**, twice. `scenarios 9/10 ok: cf-start: Error: quick game row: players 2/3/4 in one style: 6 options`.
  Cause: this branch adds a "Rivals easy/normal/hard" row as a second `div.tseg` inside the new `div.tsegs`, so the game's own check
  `#start .tseg .chipb` now counts 6 buttons, not 3. The UI change looks fine, but the gate fails.
- `--full`: PASS (phone-check 54.6 s; quick sweep "RESULT: CLEAN", newcomer vs easy wins 85%). The 375x553 help-bubble failure from R32 is gone.
  **Flaky:** my first `--full` run FAILED the sweep on the same family of check: "[g3@375x553A] help: help bubble covers a tappable
  target .ratb@334,313". The second run was CLEAN. I count the second run, but the 375x553 help bubble can still land on the rat button
  in some games.

**Shell change (games-src/shell/gx-help.js, `tapFirst`)**: every new line sits behind `cfg && cfg.tapFirst`. Only cauldron-fair
passes `tapFirst: true` to `GXH.init` (grep: no other game sets it). The added `c2.tapClear` field is new, and nothing outside it
reads that field. The moved `delete b.dataset.gxhShrunk` still runs on the same path. Other games are not affected.

**What I played**
- Tutorial ("New here? Learn in 5 minutes") at 375x667 and 390x844: 30 steps, 30 taps (6 Next-only), 0 taps that did not advance,
  0 targets under 44 px, 0 bubbles over a target, 38 s, 0 errors. Ends on "Play a real game".
- 4 full games from "Play against the computer makers" (2 makers, easy) to the result table:

| Game | Size | Play style | Result | Taps | Time |
|---|---|---|---|---|---|
| a | 375x667 | timid (stop at 3 chips or whites 5) | lost 24-31 | 80 | 89 s |
| b | 390x844 | draw until whites 5 | **won 34-25** | 116 | 103 s |
| c | 375x667 | draw until whites 5 | lost 38-43 | 105 | 106 s |
| d | 375x667 | draw until whites 5 | lost 34-50 | 118 | 124 s |

  0 page or console errors, 0 stuck states, 0 taps on covered targets. The shop buy was always the first offered chip (a weak shopper).

**Rules**: the engine has not changed in the rules sense since R28/R32 (start bag, white limit 7, flask, rat tails, bonus die,
boom = points or shop, two chips of different colours, ruby uses, yellow from day 2, purple from day 3, day-6 white, no shop on day 9,
leftover rubies, tie to the furthest pot). The tutorial lines I read match. Rat-tail spacing is still a simplification.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Every turn step and number matches; rat-tail spacing simplified. |
| 2 | Tutorial teaches | 8 | 30 one-line steps, one tap each, 0 dead at both sizes, real game after. |
| 3 | First 10 seconds | 8 | "New here?" first, a 3-line goal card, "Tap the bag". |
| 4 | Turn clarity | 7 | "YOUR TURN · Whites 3/7. Draw, or Stop to keep this space.", a risk %, and the Stop button shows what you keep. I did not re-check R32's fortune-name-3-times and tally-plate points. |
| 5 | Phone play | 6 | All 7 stalls fit at 375x667, but the chips in the 3-column stalls are **33x51 px** (Marrow 36x51, the single chips 36-38x51), under 44 px wide, and their circles overlap. At 390x844 they are 49x69. Everything else was 44 px or more. |
| 6 | AI and pacing | 7 | Brisk: about 1.5-2 min a game. The easy rival won 3 of 4 against my weak shopper, losing to "draw to whites 5" at 390. Fair, not free. |
| 7 | Feel | 7 | Chips fly to the spiral, meter, risk %, bonus die, painted stalls, a day-by-day result table with art. |
| 8 | Bugs | 8 | 2 tutorials + 4 games: 0 errors, 0 stuck, 0 dead taps. |
| | **Total** | **4.0** | Raw 59/8 = 7.4, **capped at 4: the `--quick` gate fails** (cf-start). Row 5 is also under 7. |

**Fix list**
1. **Gate (stopper)**: update the cf-start check so it counts the player row only (for example `#start .tseg:first-child .chipb`,
   or a separate class for the Rivals row), or keep the Rivals row out of `.tseg`. Repro: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick --out /tmp/x cauldron-fair`.
2. Row 5: at 375x667 the shop chips in the 3-column stalls are 33x51 px with overlapping circles. Make each chip 44 px or wider: a
   2-column grid at narrow widths, or one chip per tier with the price under it. Repro: Play, finish day 1, look at the shop at 375x667.
   Shots: cf375a-pickchip-eval-d5.png (375), cf390d-* (390 for comparison).
3. Gate risk: the 375x553 help bubble covered the rat button (`.ratb`) in one of my two `--full` sweeps. Make the tapFirst placement also keep clear of `#ratchip`/`.ratb` in that state.
4. Row 4 (carry-over, not re-checked): fortune name 3 times on the end-of-brew fortune sheet; day-end plates show old totals under the new lead.

---

## 3. vale-of-banners (shelf/W505-vale-gameplay @ 512dd83a89494d102cac7e7e7c2376e69cfc93d3): 6.9, FAIL

**Gates**
- `--quick`: PASS (scenarios 65.8 s). `--full`: PASS (`1/1 PASS`; lab WARN 3/8 on LAB rows vs scenarios, not blocking).

**What I played**
- Tutorial ("Learn to play") at 375x667: 49 steps, 49 taps (15 Next-only), 0 taps that did not advance, 0 targets under 44 px,
  0 bubbles over a target, 56 s, 0 errors. Ends on "Play a real game | Story mode".
- Full Quick games (▶ Play > Start: 2 players, Gentle rival). A dock audit ran at every one of my decisions: is each dock button
  (`#acts .btn`, goods, dice, storage, glowing cells) fully on screen, uncovered and 44 px or more? (That is the game's own
  `dock-check.js` audit.)

| Size | Style | Result | Time | Decisions with a dock control off screen |
|---|---|---|---|---|
| 390x844 | ★ follower | **won 140-125** | 5.1 min | **0 / 139** |
| 375x667 | ★ follower | **won 159-150** | 4.6 min | **75 / 145** (wk0/wk1 "N → 2 workers", skipB, wkxB) |
| 360x640 | ★ follower | lost 132-136 ("Close one: just 4 points short") | 4.7 min | **25 / 130**, and twice the ★ sat on a worker button below the screen edge |
| 375x553 | ★ follower | **not finished**: round 4, stuck (below) | 1.7 min | 23 / 72; ★ target under the dock 11 times |
| 375x667 | glowing things, hints on | lost 104-107 | 5 min | 73 / 127 |
| 375x667 | glowing things, hints off | lost 143-147 | 3 min | 93 / 130 |
| 375x667 | glowing things, hints off | lost 96-144 | 2.9 min | 56 / 120 |
| 375x553 | glowing things, hints off | **not finished**: round 4, stuck (below) | 0.5 min | 34 / 42 |

  0 page or console errors in every game.

**The dock at the four sizes (checked myself)**
- **390x844: clean.** 0 off-screen, 0 covered, 0 small in 139 decisions.
- **375x667: not fixed.** The worker row ("2 → 2 workers", "6 → 2 workers") sits at y 629-673 on a 667 px screen, cut by 6 px, in
  about half of all decisions. In the same state the dock's first line ("A number on a tile = workers it costs ...") is clipped under
  "Your move". The dock does not scroll at this size. The centres stay on screen, so the buttons still work. Shot: vbdock-375x667s-g0-bad2.png.
- **360x640: not fixed.** Same row at y 615-669 on a 640 px screen: only about 25 px shows. Twice the ★ pointed at a worker
  button whose centre was below the edge. Shot: vbdock-360x640s-g0-bad1.png.
- **375x553: worst.** The dock body scrolls (249 px of content in 194 px), with no cue. In two games my driver (it taps only controls
  whose centre is on screen) got stuck:
  (a) "Nothing fits. Swap a die for 2 workers." The only legal move, "4 → 2 workers" / "5 → 2 workers", shows as a 15-18 px sliver at
      the bottom edge. Shot: vbstuck-375x553gc-g0.png.
  (b) ★ follower: "Both dice used. Tap End turn. ★ Buy 4 Goats". The ★ tile (bl-3, the market's bottom row at y 318) is under the dock
      sheet. The only ★ I could reach was the open Market tab, which does nothing. End turn still worked. Shot: vbstuck-375x553s-g0.png.
- Why the fixer's check passed: `dock-check.js` loads the bare `vale-of-banners.html` (494 KB). Against that file it passes at
  375x667 and 390x844 for me too. The staged build that deploys (`build-all.py` output, 603 KB, served with media) fails the same
  check on turn 1 at 375x667 (`wk0 off-screen @629-673`). The check must run against the staged build.

**Rules**: unchanged and right (5 seasons x 5 rounds; two dice plus the goods die; take, build, sell or workers; worker ±1 with the 6/1
wrap; regions, colour bonus, animals, mines, tower; end scoring by silver, goods and worker pairs). The tutorial now ends with "A tie
goes to the estate with more empty spaces", so the tie-break rule is taught.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right; tie-break taught in the tutorial. |
| 2 | Tutorial teaches | 8 | 49 steps, 0 dead at 375, ends in a real game. Still 15 Next-only taps. |
| 3 | First 10 seconds | 7 | Big Play, defaults set, a 4-line goal card. Hints are on by default, and turn 1 shows the ★. |
| 4 | Turn clarity | 7 | Fixed: the losing tip fits the player. A ★ follower who lost by 4 got "Close one: just 4 points short. Try again?", and "Follow ★ Best" now goes only to players who ignored it. Every ★ has a reason line. |
| 5 | Phone play | 5 | Clean at 390x844, but the dock overflows in 20-75% of decisions at 375x667, 360x640 and 375x553 (above). The brief's own target (the dock at 375 px) is not met in the build that ships. |
| 6 | AI and pacing | 7 | Rival turns brisk. ★ follower won 2, lost 1 by 4. Without the ★: lost by 3, 4 and 48. Games 3-5 min. |
| 7 | Feel | 7 | Dice, flying tiles, chain banner, turn rating, honest result lines. |
| 8 | Bugs | 6 | 0 errors and both gates pass, but 2 of 8 games could not go on at 375x553 by on-screen taps: the only legal move, and in the other game the ★ target, were under the edge or the dock. Not a stopper: End turn and scrolling the dock stay possible. |
| | **Total** | **6.9** | 8+8+7+7+5+7+7+6 = 55/8 = 6.875. **FAIL**: rows 5 and 8 are under 7. |

**Fix list**
1. Row 5/8: fit the dock at 375x667, 360x640 and 375x553 in every state, in the **staged** build. The worker row (wk0/wk1, skipB,
   wkxB) must be fully on screen. For example, put the worker swaps on the goods row, or shrink the dice row and the prompt on
   short screens. Repro: `build-all.py --no-check vale-of-banners`, serve it with `gx-serve.js`, then run `dock-check.js` against
   that URL (not the file) at 375x667 and 360x640.
2. Row 8: at 375x553, when the only legal move is a worker swap ("Nothing fits. Swap a die for 2 workers."), that button must be on
   screen. Scroll the dock to it, or move it next to the prompt. Shot: vbstuck-375x553gc-g0.png.
3. Row 5/8: never put the ★ on a target that the dock covers. At 375x553 the ★ on a bottom-row market tile (bl-3, "4 Goats") sits
   under the dock sheet. Scroll the market to it or lift the dock. Shot: vbstuck-375x553s-g0.png.
4. Test fix: make `dock-check.js` (and `phone-play.js`) load the staged build through `gx-serve.js`, so the check sees what players get.
