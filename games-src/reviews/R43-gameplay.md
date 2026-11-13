# R43 strict gameplay review (13 Nov 2026, UTC)

Reviewer R43. Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md (8 rows; PASS needs every row >= 7; a stopper caps the total at 4).
Each game was checked out fresh from its branch into its own worktree. Gates ran one at a time with nothing else running.
I played on the STAGED build (`build-all.py --quick --out`, shell included), by Playwright touch taps on phone viewports.

| Game | Commit | --quick | --full | Rows (1-8) | Raw | Total | Verdict |
|---|---|---|---|---|---|---|---|
| cauldron-fair | bc7fabf6 | PASS | PASS | 8 8 8 7 7 7 7 8 | 7.5 | **7.5** | **PASS** |
| doorkick-dungeon | 5b3227c7 | PASS | **FAIL 2/2** | 8 8 7 7 6 8 7 5 | 7.0 | **4.0** (capped) | **FAIL** |
| vale-of-banners | 0ed6b60e | PASS | PASS | 8 7 7 7 7 7 7 7 | 7.1 | **7.1** | **PASS** |

---

## 1. cauldron-fair (shelf/W503-cauldron-gameplay @ bc7fabf64ac9b3ad988151cdc6476fa6258c6626): 7.5, PASS

**Gates**
- `--quick`: PASS (scenarios 10/10 ok, 84.7 s). The R37 cf-start stopper is fixed: the check now counts only the player row.
- `--full`: PASS (phone-check 53.2 s; sweep "RESULT: CLEAN", newcomer vs easy wins 85%; lab WARN 9/12, not blocking).

**Tutorial** (the game's tutor-test.js pointed at the staged html, touch): 375x667 and 375x553 clean runs, plus rotate, leave/return,
skip, full animations and two Story runs. 30 steps each run, 266 steps checked, **0 problems**, 28-36 s a run. Every rule on the
checklist was shown. It ends on the "You know the rules" card, then a real game.

**Games** (touch, from Play with the defaults, to the result card):

| Size | Policy | Result | Taps |
|---|---|---|---|
| 375x667 | timid (stop at 3 chips or whites 5) | lost 19-28 | 81 |
| 375x553 | timid | lost 22-35 | 83 |
| 375x667 | timid | lost 22-35 | 82 |
| 375x553 | timid | lost 20-30 | 82 |
| 375x667 | draw until whites 5 | lost 31-37 | 110 |
| 390x844 | draw until whites 5 | **won 31-27** | 115 |
| 375x667 | draw until whites 5 | lost 35-44 | 110 |

0 page or console errors, 0 stuck states, 0 taps on covered targets. My shopper always bought the first chip it was offered (a weak shopper).

**Shop at 375 (the R37 Phone fix)**: two columns. Measured after the chips settle: every shop chip **44x47**, the bag-tray chip
("take it out again") **44x44**, no overlaps (my driver checked every pair at every shop decision). Readings of 24-39 px came only
while the tray chip was still popping in (scale animation) and settle at 44. At 375x553, 4 stalls show and a "3 more stalls ▼" pill opens the rest.

**Help bubble vs .ratb**: the full sweep at 375x553 was clean, and no covered tap came up in 7 games. Not seen again.

**Rules**: the engine diff only renames "Kind cut" to "Send a white back" (title and log text). No rules change since R37.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. Rat-tail spacing is still simplified. |
| 2 | Tutorial teaches | 8 | 30 one-line steps, one tap each, 0 problems at both sizes and in all modes. |
| 3 | First 10 seconds | 8 | Goal card ("Have the most points after 9 days", 3 bullets, "Let's brew"), then "Whites 0/7. Draw, or Stop". |
| 4 | Turn clarity | 7 | YOUR TURN line, whites x/7, risk %, Stop shows what you keep. The "NOW Fairground Dice" pill sits over the board's left edge. |
| 5 | Phone play | 7 | **Up from 6.** Chips 44x47 in two columns, no overlap, all targets 44 px or more. At 375x553 the shop needs one extra tap for the last 3 stalls. |
| 6 | AI and pacing | 7 | 1.5-2 min a game. The easy rival beat my weak shopper 6 of 7, but the margins were 4-15 points and the braver policy won once. |
| 7 | Feel | 7 | Chips fly, meter, risk %, painted stalls, painted result with a per-day table and a voice line. |
| 8 | Bugs | 8 | 9 tutorial runs and 7 games: 0 errors, 0 stuck, 0 dead or covered taps. |
| | **Total** | **7.5** | 60/8. Every row 7 or more, both gates pass: **PASS**. |

**Fix list (not blocking)**
1. Row 6: a newcomer who buys the first chip offered loses most games to "easy". A one-line shop hint ("Best buy: ...") or a softer easy shopper would help. Repro: Play, buy the first chip each day.
2. Row 4: move the "NOW <rival>" pill off the pot edge at 375x553 (turn1 shot).
3. Row 5: at 375x553, consider showing all 7 stalls (smaller headers) instead of the "3 more stalls" pill.

### Sweep check change on this branch
The changed file is **games-src/cauldron-fair/sweep.js** (cauldron's own sweep). games-src/rc/sweep.js is shipwreck-isle's sweep and
this branch does not touch it. Every game has its own sweep copy, so the change cannot affect another game's gate.
- What changed: the "market re-drew between the two reads" swap used to fire only when the finger's x moved. Now it fires when x or y
  moves, and only if the finger is within 8 px of the **current** suggestion on **both** axes (before: x only). The final check still
  fails any finger more than 8 px from that suggestion.
- Can it hide a misplaced finger? No. A finger that is not on the current `hlpSuggest()` target still fails. It only accepts a finger
  that is right where the suggestion is now. One gap is old and unchanged: the check compares the finger with the same `hlpSuggest()`
  the bulb uses, so a wrong suggestion would pass both reads.
- The shell change (gx-help.js `tapFirst`) is opt-in. Only cauldron-fair passes `tapFirst: true` (the other hits are bundled copies of the shell).
- Spot-check on this branch: `build-all.py --full sunglaze kaiten-kitchen`: **2/2 PASS** (sunglaze sweep pass=2357 fail=0), EXIT 0.

---

## 2. doorkick-dungeon (shelf/W502-doorkick-gameplay @ 5b3227c71cb07ddf77adb025d341a7d365511260): 4.0 capped, FAIL

**Gates**
- `--quick`: PASS (own checks 25/25 ok). WARN: "button covered by button.gxt-skip: Menu: sound, speed, hint" (the tutorial's Skip covers the Menu button).
- `--full` run 1: **FAIL**. `FAIL 375x553 g0 turn 42 ... issues: bubble covers its target (window)`. SWEEP FAILED 1/4 (4 reached a winner).
- `--full` run 2: **FAIL**. `FAIL 375x553 g1 turn 63 ... issues: fight clipped: sline/vs/row/row/rollbox card door t-monste 88..138 table 101..232`. SWEEP FAILED 1/4.
- Both failures are at 375x553, and they are different layout faults. The R39 issue is fixed: all 8 sweep games reached a winner, the longest at turn 91, none over 8 min.

**Tutorial** (tutor-test.js on the staged html, touch, 375x667 and 375x553 plus rotate/leave/skip/offer/drag/story): 28 steps,
219 steps checked, **0 problems**, 56-67 s a run.

**Games** (newbie-touch on the staged html; taps the ★/suggested move 80% of the time, otherwise a glowing card or button; defaults, 3 easy rivals):

| Size | Pace | Result | Turns | Time |
|---|---|---|---|---|
| 375x667 | real speed | lost (I reached 9; Tansy 10, Grub helped) | 51 | 3.6 min |
| 375x553 | fast | **won** (level 10) | 25 | 1.4 min |
| 375x553 | fast | **won** (level 10) | 41 | 2.7 min |
| 375x553 | fast | lost (level 4) | 37 | 2.1 min |
| 375x667 | fast | won (as helper) | 21 | 1.3 min |
| 375x667 | fast | **won** (only the summary line kept) | - | - |
| 375x553 | fast | **won** (level 10, a repeat seed for a layout probe) | 25 | 1.4 min |

0 errors, 0 stuck. Longest wait for a rival turn 9.3 s, longest wait for my next move 2.1 s.

**Result card**: the "+N" float is gone. Names wrap instead of being cut, but they wrap under the portrait ("Pip / (you)", "Morwen" below
the face). At 375x553 the last table row (476-503) sits under the button bar (`DIV.acts`, Play again at 496). The card scrolls, so you
can reach it, but on first view it is hidden. At 375x667 about 200 px of art sits above a cramped table.
"You were cursed 5 times, most by Grub (1)" reads oddly (the other 4 came from doors).

**Rules**: AI-only changes (tired rivals after turn 40, an easy rival doesn't gang up on a human under level 8, and helping a winning
fight in fast-play mode). No rule changed.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | 28 steps, 0 problems at both sizes. Skip covers the Menu button during it (gate WARN). |
| 3 | First 10 seconds | 7 | Start, Just play, the goal, the starred card. |
| 4 | Turn clarity | 7 | ★ now also marks the suggested panel action. The bottom bar names the move. |
| 5 | Phone play | 6 | Both full-gate failures are 375x553 layout faults (fight panel clipped; first-time bubble over its target). The last result row is under the button bar at 375x553. Names wrap under portraits. |
| 6 | AI and pacing | 8 | **Up from 7.** My follower won 5 of 7, and games took 1.3-3.6 min. Gate max turn 91 (was 137). |
| 7 | Feel | 7 | Painted art, door kick, star prompts, confetti result with stats. |
| 8 | Bugs | 5 | 0 errors in play, but the full gate failed 2 of 2 runs. |
| | **Total** | **4.0** | Raw 56/8 = 7.0. **Capped at 4: the full gate fails (stopper).** Row 5 is also under 7. |

**Fix list**
1. **Stopper, fight panel at 375x553**: the fight row (door card/monster, y 88..138) is clipped by the table area (101..232).
   Repro: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/x doorkick-dungeon`. See `.check/doorkick-dungeon-sweep.js.log`
   (run 2: 375x553 g1 turn 63).
2. **Stopper, first-time "window" bubble at 375x553**: the help bubble overlaps `HLP_STEPS.window.target()`. Same repro (run 1: 375x553 g0 turn 42).
   Run `--full` at least 3 times clean before you resubmit.
3. Row 5: at 375x553 keep the last result-table row clear of the Play again bar (more bottom padding, or drop the art header on short screens).
   Put names beside the portrait or under it on one line ("Pip (you)").
4. Row 2/5: move the tutorial's Skip button off the Menu button (quick-gate WARN).
5. Sweep note: munch/sweep.js now skips its cover check for bubbles with `pointer-events:none`. Taps pass through, but the bubble still
   hides the target from the player. Keep the check for what the player sees, or prove the see-through bubble leaves the target readable.

---

## 3. vale-of-banners (shelf/W505-vale-gameplay @ 0ed6b60ec06df15b7ab0db7eebb8f66684a2e02b): 7.1, PASS

**Gates**
- `--quick`: PASS (6/6 scenarios, 65.0 s).
- `--full`: PASS (phone-check 58.3 s; rules-test "AI games: 40/40 finished, stuck 0, invariant breaks 0 / PASS 37 checks"; lab WARN 3/8, not blocking).

**Tutorial on the staged build, touch** (the game's tut-walk.js with VB_HTML=staged index.html, plus my checks: Next button size, and
whether a Next step shows its ring or the new fallback):

| Size | Result |
|---|---|
| 375x553 | **all 49 steps, end card, real 5-season game starts.** Star = coach 49/49, every rule in order, longest wait 2.4 s |
| 360x640 | all 49 steps, PASS, longest wait 2.3 s |
| 375x667 | all 49 steps, PASS, longest wait 2.3 s |

**The R41 stopper is fixed**: step 7 "region" at 375x553 now points at "You · 11" on the view tab and goes on.
**But two steps at 375x553 use the fallback**: "order" (9/49, "Your rival played. Higher on the banner track plays first.") and
"rvscore" (16/49, "Tobin scored 27: 1 region, 1 colour bonus.") target `#opp`, which is hidden (0x0) on short phones. After 2.5 s with
nothing on screen, the tutor shows an unpointed bubble. It also leaves a meaningless 44x44 spotlight on four hexes in the middle of your estate.
The rival's tab "Tobin Reed · 27" is on screen the whole time and would be the right target. Shots: vale/xxs/phone-xxs-08-order.png, -15-rvscore.png.

Shell (gx-tutor.js `fallbackMs`): opt-in, only vale sets it (2500 ms), and only for Next steps (`!st.wait`). A tap step with a hidden
target would still block forever. With fallbackMs unset, behaviour is unchanged for other games.

**Games** (staged html, touch, defaults: Gentle rival, hints on):

| Size | Player | Result | Time |
|---|---|---|---|
| 375x553 | newcomer policy (reads previews, ignores ★) | lost 80-145 | 4.8 min |
| 375x667 | newcomer policy | lost 92-117 | 4.8 min |
| 375x553 | dock-check glow tapper (113 dock checks, 0 problems) | lost 87-171 | ~5 min |
| 375x553 | ★ follower | **won 182-107** | 4.8 min |

0 covered taps, 0 errors, 0 stuck. The result card fits at 375x553 (table, honest line "A clear loss, 65 points behind. Follow ★ Best.",
three 44 px buttons).

**Rules**: this commit changes only tutorial targets and the tutor fallback. 40/40 AI games clean.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 7 | **Up from 5.** 49 steps finish at all three sizes. At 375x553, 2 steps point at nothing after a 2.5 s blank wait and light a stray patch of hexes. |
| 3 | First 10 seconds | 7 | Big Play, defaults set, short goal card, ★ on turn 1. |
| 4 | Turn clarity | 7 | Prompt line, ★ with a reason, points on the tabs. |
| 5 | Phone play | 7 | Dock fully on screen, controls 44 px or more (113 checks at 375x553). The board is small at 375x553 and opens zoomed. |
| 6 | AI and pacing | 7 | The ★ follower wins easily. A player who ignores ★ lost 3 of 3 by 25-84, but the result card says "Follow ★ Best". 4.8 min games. |
| 7 | Feel | 7 | Dice, flying tiles, region chips, honest result lines. |
| 8 | Bugs | 7 | **Up from 4.** 3 tutorial walks and 4 games: 0 errors, 0 stuck, 0 dead taps. The 2.5 s fallback waits are the only rough spot. |
| | **Total** | **7.1** | 57/8. Every row 7 or more, both gates pass: **PASS**. |

**Fix list**
1. Row 2: on short phones point "order" and "rvscore" at the rival's view tab (`scoreEl` for seat 1, like `vpT` does for you) instead
   of the hidden `#opp`. Then no step needs the fallback. Repro: `ONLY=phone-xxs VB_HTML=<staged>/vale-of-banners/index.html node tut-walk.js`,
   then check for a `.gxt-ring` on steps 9 and 16.
2. Shell: when the fallback fires, don't draw the 44x44 spotlight hole (it lights random hexes). Say in the tutor test when a step used the fallback.
3. Row 6: a newcomer who ignores ★ loses by 25-84 on Gentle. Consider a softer Gentle, or show ★ on the first few turns without hints.
