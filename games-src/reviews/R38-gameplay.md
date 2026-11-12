# R38 strict gameplay re-review (12 Nov 2026)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. For each game I started from a fresh `git fetch` and a detached worktree on the exact
branch head. Both gates were run as written (`VIS_SLUGS="," build-all.py --quick` and `--full`). I played a separate
`--no-check` build of the same commit, served next to its `games/<slug>/media`. Every tap was a real touch tap
(`page.touchscreen.tap`, hasTouch + isMobile) at 375x667, with spot checks at 390x844 (and 375x553 for tidewake), on default
settings. A "dead tap" is a tap after which neither the game state nor any text on the page changed within 0.9 s.

The machine was shared by three play sessions (load 3-40 on 4 CPUs), so the wall-clock waits below run high. Where a number
depends on load, I say so.

---

## 1. sands-of-qamar (shelf/W497-sands-gameplay @ 9a490a85): 6.6, FAIL

Gates: **quick PASS** (11/11 scenarios, EXIT 0). **full PASS** (phone-check, `rules-test.js ok: ai games 200 stuck 0`, EXIT 0;
same LAB 9/12 warning as before, which is a warning, not a fail).

What I played:

| Run | Size | How | Result | Time | Taps | Dead | Longest rival wait |
|---|---|---|---|---|---|---|---|
| tutorial | 375x667 | follow the coach | practice win 109-105 | 49 s | 56 | 0 | - |
| hint #1 | 375x667 | only the lit target | **lost 175-191** | 91 s | 149 | 0 | 6.5 s |
| hint #2 | 375x667 | only the lit target | **lost 173-252** | 209 s | 169 | 0 | 9.3 s |
| mixed | 375x667 | 30 % random legal taps | **lost 195-210** | 185 s | 175 | 0 | 8.9 s |
| hint | 390x844 | only the lit target | **lost 185-239** | 180 s | 151 | 0 | 8.8 s |

One more hint run at 375x667 also lost (187-231). That is 0 wins in 5. There were 0 page and console errors and 0 stuck states.
Two taps in the tutorial were flagged as dead, but each one opened a chooser, so they were misses by my driver, not dead taps.

**New juice (ft/src/juice.js).** None of the effects block a tap. Every effect node (ring, spark, coin, haul and the `#fx` layer)
has pointer-events none, and elementFromPoint at the next target's centre always returned the target. Taps made while an effect
was showing all registered: 123/123, 115/115, 94/94 and 103/103 across the four games.

Each effect's own animation, read with getAnimations() and checked against the code:

| Effect | Duration |
|---|---|
| dip | 300 ms |
| hurt | 500 ms |
| glow / land | 550 ms |
| coin | ≤ 600 ms |
| ring | 600 ms (node removed at 650 ms) |
| haul | 600 ms (node removed at 620 ms) |
| spark | **610 ms** (last spark: 180 ms delay + 430 ms flight) |
| count-up | 480 ms |

So each effect is about 0.6 s, slightly over in three cases. But the spark flight ends by starting a 560 ms glow and a 600 ms
ring on the score star, so one scoring event lasts about **1.2 s** from start to end. It is decoration only. Under load, nodes
stayed on screen up to 1.5 s, but that comes from the busy machine, not from the code.

**Earn control.** It is now one row: the − and + buttons are 80x48 and Earn is 194x48. But the claim "tiles ≥ 56 px at 375" does not
hold. The djinn offers ("✨ Burhan pay 1 Mystic" ×3) still stack under the Earn row, and the tiles measured **58x36** and
**58x46** while Earn showed. In the sell step with many goods they drop to 29-46 px, and the top row is clipped.

Rules: the juice commit changes only UI files (ui.js, board.css, body.html, build.py, juice.js). logic-test 119/119 passes, and
I saw no change to any rule in play.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | No change; engine untouched. |
| 2 | Tutorial teaches | 7 | 43 steps, 0 dead taps, ends in a win and "Play a real game". The end card lists where points came from on pages 1-2, but the last page ("The count") still shows only the total. |
| 3 | First 10 seconds | 7 | Goal card, then the bid chips. The glowing spot is easy to miss on a busy 30-tile board. |
| 4 | Turn clarity | 6 | The score pop ("You score 12 pts from Advisors") sits on the top tile row in 62 of 72 pops at both sizes, and hides the people counts you need to read. |
| 5 | Phone play | 5 | Tiles are 36-46 px while Earn shows and 29-46 px in the sell step, with the top row clipped. The pop covers row 1. The 2-player bid labels are 13 px. The Earn buttons themselves are fine. |
| 6 | AI and pacing | 5 | Following the hint lost 4 games of 4 (by 16-79 points), and the mixed newcomer lost too. R34 had won 1 of 2 the same way. Rival waits are 6.5-9.3 s (load-inflated). |
| 7 | Feel | 7 | **Up from 6.** Each drop plays a rising note, and the landing gets a coloured ring. Sparks fly to the star, which counts up, coins fly to your seat, and a big haul flashes the board edge. It now feels like a game. |
| 8 | Bugs | 8 | 0 errors, 0 stuck, 0 dead taps in 644 game taps. |
| | **Total** | **6.6** | **FAIL**: rows 4, 5 and 6 are under 7. 8+7+7+6+5+5+7+8 = 53/8 = 6.6. No stopper. |

### Fix list
1. **Row 5: keep the tiles at 56 px or more on every step at 375x667.**
   - Repro: Play vs computer, take a Mason/Earn action while holding a Mystic with three djinns in play. Shot: sands-play/hint375-earn.jpg (tiles 36 px).
   - Repro: sell step with 7+ goods. Shot: hint375b-small-turn_sell_pop.jpg (29-46 px, top row clipped).
   - Fix: put the djinn "pay 1 Mystic" offers in one row or a sheet, and cap the height of the action area.
2. **Rows 4/5: move the score pop off the tile grid.** For example, show it in the prompt bar or below the step tabs. Repro: make any
   scoring move at 375 or 390; row 1's people counts disappear under it (hint375-pop2.jpg, hint390-pop1.jpg).
3. **Row 6: let a newcomer win on defaults.** Make the default rival ease off further, or make the hint pick moves that score better.
   Following the light lost 4 of 4, plus a fifth earlier run.
4. **Row 2: put the full points breakdown on the last tutorial page ("The count").**
5. **Minor:** raise the bid order labels to 14 px. Trim the spark stagger so the last spark lands by 0.6 s. Optionally drop the
   follow-up ring on the score star.

R34 status:

| R34 finding | Status now |
|---|---|
| Feel 6 | **Fixed** (7) |
| Earn list one row | **Done** |
| Tiles ≥ 56 px while Earn shows | **Not done** |
| Pop over top row | **Not fixed** |
| End card shows only the total | **Partly fixed** |
| Rival waits | Same |
| A newcomer can win | **Worse** (0/5) |

---

## 2. tidewake (shelf/W498-tidewake-gameplay @ 6acc0f67): 7.1, FAIL

Gates: **quick PASS** (8/8 own checks, EXIT 0). It warns that "Your turn" overlaps "⚠ 2 leviathans: 6-8 re…". **full PASS**:
phone-check, and the sweep reports `decisions {"start":10,"lay":23,"cannon":3,"doom":2} ... PROBLEMS 0`, EXIT 0. The R34 sweep
failure (lay button off screen at 375x553) is gone.

What I played:

| Run | Size | Result |
|---|---|---|
| tutorial | 375x667 | 32/32 steps in 142 s, 34 taps, 0 dead, 0 errors, every target ≥ 44 px; ends on a win and "Play again / New game" |
| 11 games | 375x667 | ★-follow and random newcomer: 6 won, 5 lost |
| 3 games | 390x844 | 1 won, 2 lost |
| 1 game | 375x553 | lost |

Overall that is 7 wins in 15 games (fair share in a 3-player game is 33 %). There were 0 page and console errors and 0 stuck states.
About 1 dead tap in 330 (tapping the same tile again), plus 3 taps on the greyed-out Place button.

**"Got it" fall-through: partly fixed, still reproduces.** I tested it in 36 game starts with 66 coach bubbles, then in 48
targeted trials with a leviathan placed right under the tap point.

| Method | Leviathan sheet opened |
|---|---|
| Fast single tap, centre | 0/23 |
| Tap as the bubble appears | 0/10 |
| CDP touch, 50-150 ms between touchstart and touchend | 0/12 targeted (1/11 in the mixed run) |
| Fast double tap | 1/7 |
| **Press held ≥ 600 ms** | **10/10** (the guard only covers 600 ms from touchdown) |
| **Tap on the bubble body below the button corners** | **4/4** (opens the "Start here?" sheet) |

It happens only on the "Your start" bubble, never on "Lay a current". The board state never changed, and the sheet closes with its ✕.

**Lay buttons: fixed.** At 375x553, 375x667 and 390x844 every lay button is inside the viewport, and elementFromPoint returns it:

| Button | Size |
|---|---|
| Turn L/R | 46x44 |
| Place | 64x44 |
| Zoom | 46x44 |
| Use ★ | 62x44 |

But the "i" (why) button is only **30x44**, and the Goal strip under the dock is cut off by 24-25 px.

**✗ tiles: fixed.** Tapping one shows "Can't: no room ahead. Turn the tile." within 120 ms, in 14.4 px text, and it stays until you
pick another tile. The words "no room ahead" don't say what the danger is (the edge, a leviathan, a crash), and tapping the greyed
Place does nothing.

**Rival turns: better, but not "capped at ~2 s".** Times are without Skip:

| Measure | Median | Max |
|---|---|---|
| One rival turn | 3.5 s | 19.2 s |
| A whole round | 10.3 s | 25.5 s |

That covers 137 rival turns. 23 of them took 11-19 s, every one a roll that woke the leviathans. Only 28 took 2.5 s or less.
Your own dice roll adds 3.5-6.4 s before you can act. R34 measured about 15 s per round and 27-36 s at worst.

Rules: logic-test 85/85. Leviathan blocks, a wake off the edge and "last afloat wins" all played out as the checklist says.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | 32 one-line steps, 0 dead taps, ends in a real game. |
| 3 | First 10 seconds | 8 | Goal card, big "New here?", one-tap quick game. |
| 4 | Turn clarity | 8 | **Up from 7.** A ✗ tile now says why, fast and readably. The wording is vague. |
| 5 | Phone play | 6 | Lay buttons fixed. But the "i" button is 30 px wide, the Goal strip is cut off by 24 px, the "Stop" pin still overlaps the "start" label at 375x553 (star553_turn1.jpg), and the "Your start" bubble covers most of the board. |
| 6 | AI and pacing | 6 | A newcomer wins about half the games. But a round still takes about 10 s and up to 25 s, and a leviathan roll makes one rival turn take 11-19 s with nothing to tap. |
| 7 | Feel | 7 | Painted chart, junks glide, leviathans move one by one. Long rival turns are dead air. |
| 8 | Bugs | 6 | 0 errors and 0 stuck, but the tap still falls through on a held press (10/10) and on the bubble body (4/4). |
| | **Total** | **7.1** | **FAIL**: rows 5, 6 and 8 are under 7. 8+8+8+8+6+6+7+6 = 57/8 = 7.1. No stopper. |

### Fix list
1. **Row 8: stop the tap falling through to the board.**
   - Repro: Quick game at 375x667 with coach tips on. On the "Your start" bubble, press and hold "Got it" for 0.7 s with a leviathan under it; the leviathan sheet opens.
   - Repro: tap the bubble just below the button's bottom corners; "Start here?" opens.
   - Fix: swallow the pointerup/click of any press that started on the bubble, whatever its length, and make the whole bubble eat taps.
2. **Row 6: shorten the leviathan step on rival turns.** Move the woken leviathans together, or show them at 2x speed. That gets the
   11-19 s turns under about 4 s, and the round median under about 6 s.
3. **Row 5: fix the remaining layout problems.**
   - Make the "i" button at least 44 px wide.
   - Make the Goal strip fit at 375x667 and 375x553.
   - Separate the "Stop" pin from the "start" label at 375x553.
   - Fix the quick gate's text-overlap warning ("Your turn" / "⚠ 2 leviathans").
4. **Row 4 (minor):** name the danger in the ✗ line, e.g. "Can't: this runs you off the edge" or "…into a leviathan". Make the greyed
   Place shake or repeat the reason when tapped.

R34 status:

| R34 finding | Status now |
|---|---|
| Lay button off screen | **Fixed** |
| ✗ tile gives no reason | **Fixed** |
| "Got it" fall-through | **Partly fixed** (fast taps 0/23; held press 10/10; bubble body 4/4) |
| Slow rivals | **Partly fixed** |
| Stop / start overlap | **Not fixed** at 375x553 |

---

## 3. nebula-aces (shelf/W486-nebula-bench @ fd818e08): 7.1, FAIL

Gates: both gates failed on the first run, while the machine was loaded (load ~25):
- quick: `menu: text at least 8 px inside every dialog ... (8 px < 8)` on the Rules and start dialogs
- full: phone-check page.goto timeouts and "slow 1539-5338 ms"

I re-ran both alone on an idle machine (load ~2), on the same commit and worktree:
- **quick PASS** (EXIT 0)
- **full PASS** (phone-check; `rules-test.js ok: PASS rules-test`; LAB 9/12 warning; EXIT 0)

I count the gates as PASS. The "8 px < 8" check sits right on the limit, so it is flaky under load. Adding 1 px of dialog padding
would make it safe.

What I played:

| Run | Size | How | Seed | Rounds | Taps | Result |
|---|---|---|---|---|---|---|
| tutorial | 375x667 | follow the finger | - | - | 36-38 (both sizes) | finishes; starts a real 3-ship game; 0 errors |
| sugC | 375x667 | suggestions | 55976016 | 17 | 78 | won |
| sugD | 375x667 | suggestions | 810883470 | 9 | 45 | won |
| sugE | 375x667 | suggestions | 1049015926 | 5 | 24 | **lost** |
| mix375 | 375x667 | 30 % off-suggestion | 2322089019 | 11 | 43 | **lost** |
| mix390 | 390x844 | 30 % off-suggestion | 1620472436 | 6 | 35 | won |

Three more games on the same build all won, in 10, 13 and 12 rounds. There were 0 errors, 0 stuck states and 0 dead taps in the games.

**Games now differ.** Eight games had eight different seeds, different rocks and deploy spots, 5-17 rounds and both wins and losses.
That fixes R36's two identical round-9, 51-tap games. The squads (Kael against two talons) and the enemy start spots are still the
same every game.

**Banners at 375x667.** I sampled every 90 ms against the exposed ship circles (`BF.circ()`). A banner counts as "settled" when it
stays more than 450 ms. Over 249 turn banners in 5 games:

| Check | Touched at some moment | Settled |
|---|---|---|
| Ship hull circle | 21 | **1** |
| Hull + nameplate | 47 | **13** (5 %) |
| Cut off at the screen edge | 39, all mid pop-in | **0** |

For example, the round 3 "Ships move / Lowest skill first" banner sits on Nightjar's nameplate and hides its hearts
(neb-play/shots/375x667-sugC-ovl2.jpg). The R36 round-1 bubble over Knifepoint and the right-edge cut-off are fixed.

**Tutorial coach bubble.** It is a different element from the turn banners, and it is not covered by the fix. At 375x667, 12 of 28
lesson bubbles settled over the enemy ship, and at 390x844 it was 6 of 29. In "Secret dials" and "Arc, range, order" the bubble
(y 10-150) completely hides Slate, the ship the step is about (neb-play/shots/375x667-tut375-ovl5.jpg). The "Leave lesson" link
is **69x26 px**.

Rules: the only engine change since R36 is the fresh seed. Stress, focus, range, bump, rocks and the off-mat refusal all behaved
as the rules notes say.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | As R36. The Rules-screen wording notes from R32 are still not re-checked. |
| 2 | Tutorial teaches | 6 | **Down from 7.** It finishes by touch and starts a real game, but the coach bubble hides the enemy ship it is teaching about in 12 of 28 steps at 375, and "Leave lesson" is 26 px tall. |
| 3 | First 10 seconds | 8 | Title, then Launch, the goal card and Start in 3 taps. The round-1 bubble no longer covers an enemy. |
| 4 | Turn clarity | 7 | One hint line and a finger every step. Banners avoid the hulls but still land on nameplates 5 % of the time. |
| 5 | Phone play | 6 | Game targets are ≥ 44 px and text ≥ 14 px. But the lesson bubble covers the enemy, the "Leave lesson" link is 26 px, banners sit on nameplates, and the hint pill overlaps the bottom of the round-plan bubble. |
| 6 | AI and pacing | 7 | **Games vary now.** A newcomer can win and can lose. One 17-round, 78-tap game drags, and the squads never change. |
| 7 | Feel | 8 | 3D flights, tumbling dice with stamps, laser lines, a painted result card. |
| 8 | Bugs | 8 | 0 errors, 0 stuck, 0 dead taps in games. One tutorial reroll tap only toggled a dashed outline (no text change). |
| | **Total** | **7.1** | **FAIL**: rows 2 and 5 are under 7. 7+6+8+7+6+7+8+8 = 57/8 = 7.1. No stopper. |

### Fix list
1. **Rows 2/5: apply the banner-placement logic to the lesson coach bubble (`#na-coach`).** When the enemy is in the top ~170 px,
   dock the bubble at the bottom (or the other way round). Repro: New here? at 375x667, step "Secret dials" / "Arc, range,
   order": Slate is fully hidden (tut375-ovl5.jpg).
2. **Row 5: make "Leave lesson" (`.na-lv`) at least 44 px tall.**
3. **Row 4/5: let banners avoid the nameplate as well as the hull.** Pad the avoid circle to ~30 px and add ~48 px below the ship.
   Repro: Quick game at 375x667; the round 3 "Ships move" banner covers Nightjar's nameplate (sugC-ovl2.jpg).
4. **Minor:**
   - Keep the hint pill clear of the round-plan bubble.
   - Keep the "Fire at Knifepoint · range 2 · 3 dice vs 3" tooltip off Kael's nameplate.
   - Add 1-2 px of padding to the Rules and start dialogs so the "8 px inside" check is not on the limit.
   - Vary the default squads or enemy start spots too.

R36 status:

| R36 finding | Status now |
|---|---|
| Round-1 bubble over Knifepoint | **Fixed** |
| Banner over Knifepoint | **Mostly fixed** (1 settled over a hull; nameplates still 5 %) |
| Banner cut off at the right edge | **Fixed** (0 settled cut-offs) |
| Identical games | **Fixed** |

---

## Summary

| Game | Commit | Quick gate | Full gate | Rows (R/T/F10/TC/Ph/AI/Feel/Bugs) | Avg | Verdict |
|---|---|---|---|---|---|---|
| sands-of-qamar | 9a490a85 | PASS | PASS | 8/7/7/6/5/5/7/8 | 6.6 | FAIL |
| tidewake | 6acc0f67 | PASS | PASS | 8/8/8/8/6/6/7/6 | 7.1 | FAIL |
| nebula-aces | fd818e08 | PASS (idle rerun) | PASS (idle rerun) | 7/6/8/7/6/7/8/8 | 7.1 | FAIL |

Screenshots were not committed. They are local to the review session (sands-play/, tide-play/, neb-play/).
