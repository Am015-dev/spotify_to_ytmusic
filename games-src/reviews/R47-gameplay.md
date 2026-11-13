# R47 strict gameplay review: doorkick-dungeon (13 Nov 2026, UTC)

Reviewer R47. Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md (8 rows; PASS needs every row >= 7; a stopper caps the total at 4).
Branch `shelf/W502-doorkick-gameplay` @ **dbc5c026d1e839bb4f646b4ddbb8435695102363** (tip: "fight fit ignores cards still sliding in").
The gates ran one at a time with nothing else running. I played the STAGED build (`/tmp/x1/doorkick-dungeon/index.html` from `--quick`)
with Playwright touch taps (`touchscreen.tap`) at phone sizes.

| Commit | --quick | --full x3 | Rows (1-8) | Raw | Total | Verdict |
|---|---|---|---|---|---|---|
| dbc5c026 | PASS | **FAIL 1 of 3** (PASS, FAIL, PASS) | 8 7 7 7 6 7 7 5 | 6.8 | **4.0** (capped) | **FAIL** |

## Gates
- `--quick`: PASS (1 min 37 s). The R43 WARN ("button covered by button.gxt-skip: Menu") is gone.
- `--full` run 1: PASS. SWEEP CLEAN 4 games (4 reached a winner). Phone-check 71 s, clean.
- `--full` run 2: **FAIL**. `FAIL 375x553 g1 turn 28 ... issues: fight clipped: sline/vs/row/fbtns card door t-monste 96..177 table 101..266`.
  SWEEP FAILED 1/4 (4 reached a winner). The monster card's top is 5 px above the table's top edge. This is the same class of fault as R43 run 2.
- `--full` run 3: PASS. SWEEP CLEAN 4 games.
- Lab WARN 9/12 in all three runs (not blocking). Phone-check was clean in all 3 runs: the "off-screen: Fizzing Doom Potion +5" flake did not appear.

**Stopper:** the brief says any `--full` failure is a stopper, and 1 of 3 failed. In this run the clipped fight had no rollbox, and its
monster card was 81 px tall (not shrunk). So the fit gave up, or had not yet re-run, while that card was still above the table. The new
"skip cards still sliding in, fit again 700 ms later" path is the likely gap: the sweep audits during that window.

## Sweep check restored? Yes
- `munch/sweep.js` line 94-95: the `thru` exemption (`getComputedStyle(b).pointerEvents === 'none'`) is removed. Every `.gxh-bub.on`
  is now checked against the glowing targets, whatever its pointer-events.
- The `.gxh-bub.gxh-thru{pointer-events:none;opacity:.6}` rule is deleted from tbl.css, and hlp.js no longer adds `gxh-thru`.
  When no free spot exists, hlp.js now re-places the bubble anywhere on screen (`hlpForce`), or hides it (`GXH.hide()`).
- The own-target check (sweep.js line 150, "bubble covers its target") is unchanged and passed in all 3 runs. All 12 sweep games
  showed the "window" bubble (4 per run), and none covered its target.

## Tutorial by touch (the game's own tutor-test.js, pointed at the staged html)
| Run | Result |
|---|---|
| 375x553 clean | 28 steps, 0 problems, 88 s |
| 375x667 clean | 28 steps, 0 problems, 89 s |
| 375x553 rotate, skip, offer, drag, storyskip, story x2 | 0 problems |
| 375x553 **leave and come back** | **FAIL, 3 of 3 runs**: "reopening a half-done tutorial offered no restart/exit" |
| 375x667 leave and come back | 0 problems, 28 steps |

Cause (found with a probe): after leaving at step 6, there is a saved game. At 375x553 the start card then lists Story / Continue saved game /
Quick game / Tutorial (continue?). The Tutorial button sits at y 557-603, which is **below the 553 px screen**. The card scrolls
(`.dlg.start` overflow auto), so a player can reach it, but nothing shows there is more below. The test taps off screen and nothing happens.
If you leave at step 1 (no saved game yet), the button is at y 503 and the "You left the tutorial half way / Restart / Exit" dialog works.
R43's leave run was at 375x667, so this is probably not new, only newly tested at 553.
The new rule `html:has(.gxt-top) header .gx-ibtn{visibility:hidden}` fixes Skip-over-Menu by hiding Menu, Rules and the bulb for the
whole tutorial. There is no sound or speed menu in the tutorial now; Skip is still there.

## Full games (newbie-touch on the staged html: follows the ★/suggested move 80% of the time, otherwise a glowing card or button; 3 easy rivals)
| Size | Result | Turns | Time | Rival max wait |
|---|---|---|---|---|
| 375x553 | **won** (level 10, 9 kills) | 42 | 2.6 min | 7.0 s |
| 375x553 | lost (level 9; Morwen 10) | 52 | 3.3 min | 6.9 s |
| 375x553 | lost (level 7; Tansy 10) | 65 | 3.8 min | 7.0 s |
| 375x667 | lost (level 3; Tansy 10) | 31 | 1.9 min | 7.5 s |
| 375x667 | lost (level 6; Tansy 10) | 42 | 2.5 min | 7.2 s |

0 page or console errors, 0 stuck states, longest wait for my own next move 1.7 s. In fights my in-page probe found no fight button,
monster card or score off screen (after animations), and no fight button under 44 px. These games only used fit levels t0 and t1 (t1 in 10-28
of about 300-450 fight samples per game). tight2 and tight3 never happened in real play.

## Fight screen at 375x553
- **t1 (real play, card 41 px wide)**: readable buttons ("Run 33%" 168x46, "Help" 79x46), clear score "YOU 6 vs 8 MONSTERS" and
  "-2: need help or run". But the monster card hides under the right end of the score pill: you see its "8" and a sliver of art,
  and its name is cut ("...gola"). Shot: fight-t1-375x553-7-1.png.
- **3 monsters, t0 (forced setup)**: three 33x47 monster cards, tucked under the "MONSTERS" pill and against the Treasure pile; names
  unreadable. Shot: tight-h10-m3.png.
- **tight3 at 18 px (forced by class, because real play never reached it)**: the score line goes, so there is no strength vs strength
  on screen. The monster cards are 18x26 px tiles with cut names ("Tim Pit", "Kar Toa", "Rat"). The bottom line still says
  "Tap the ★ card to win this fight", and Run/Help stay 44 px+. **Judgement: 18 px cards are not usable.** You can't read them.
  As drop targets (a potion onto a monster) they are less than half the 44 px minimum. Also, without the score you can't tell
  whether a play is enough. tight3 is rare (loot pick in the dock), but where it happens the player is flying blind.
  Shot: tight3-forced.png.

## Result card
- 375x553: the winner art is gone on short screens, and names sit beside their portraits on one line (gap 4 px, same top). The last
  table row ends at y 492 and Play again starts at 500, so it is clear. Fixed since R43.
- 375x667: the portrait header comes back, the full table is visible, and the last row (610) is above Play again (614). Fine.

## Rules
No engine change since R43 (the diff touches hlp.js, scn.js, sweep.js, tbl.css, tbl.js, tutor.js and one ui.js line for the result card).
Rules check `games-src/rules-check/doorkick-dungeon.md`: WRONG 0, documented simplifications only.

## Scores
| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. Trading and the optional table rules are still left out (documented). |
| 2 | Tutorial teaches | 7 | 28 one-line steps, 0 problems in clean, rotate, story, skip and drag runs at both sizes. Down from 8: at 375x553, after leaving mid-way, "Tutorial (continue?)" is below the screen with no scroll hint (tutor-test leave FAIL 3/3), and the tutorial hides Menu. |
| 3 | First 10 seconds | 7 | Start, Just play, goal, starred card. At 553 with a saved game, Tutorial is below the fold. |
| 4 | Turn clarity | 7 | ★ move, bottom line names the move, the score pill gives the margin. In tight3 the score disappears. |
| 5 | Phone play | **6** | Full gate fight clip at 375x553 (1 of 3). In t1 the monster card sits under the score pill. 3-monster fights show unreadable 33 px cards. tight3 cards are 18 px. The start-card Tutorial button is off screen at 553 with a saved game. Result card now good. |
| 6 | AI and pacing | 7 | Down from 8. 1.9-3.8 min games, rivals at most 7.5 s, sensible. My follower won 1 of 5 (avg level 8.7 at 553, 4.5 at 667). R43 got 5 of 7 with a similar policy. A new player can win, but less often than R43 found. |
| 7 | Feel | 7 | Door swing, painted cards, star prompts, confetti result with stats and best moment. |
| 8 | Bugs | **5** | 0 errors and 0 stuck in 5 games and 10 tutorial runs, but `--full` failed 1 of 3 runs. tutor-test leave fails 3/3 at 375x553. |
| | **Total** | **4.0** | Raw 54/8 = 6.8. **Capped at 4: a `--full` run failed (stopper).** Rows 5 and 8 are under 7. |

## Repro steps for rows under 7
- **Row 8 / Row 5 (stopper)**: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/x doorkick-dungeon`, run 3 times.
  Run 2 here: `.check/doorkick-dungeon-sweep.js.log`: `FAIL 375x553 g1 turn 28 ... fight clipped: sline/vs/row/fbtns card door t-monste 96..177 table 101..266`.
- **Row 5, tight3**: at 375x553 put the arena into tight3 (`ar.classList.add('tight','tight2','tight3'); ar.style.setProperty('--cw','18px')`
  in a 3-monster fight, which is the size tbFit's last loop allows). Monster names are unreadable and there is no score.
- **Row 5, monster under the score pill**: 375x553, any fight that fits at t1 (cw about 41 px), or 3 monsters. The rightmost monster card
  sits under the "MONSTERS" end of the score pill.
- **Row 2/3/5, start card**: 375x553. Start the tutorial, play to step 6, reload. "Tutorial (continue?)" is at y 557, which is off screen.
  Or run `node munch/tutor-test.js 375x553` with its html pointed at the staged build: the leave run fails.

## Fix list
1. **Stopper**: the fight must never be clipped at 375x553. When tbFit skips a card that is still sliding, the sweep audits during the
   700 ms before the re-fit. Either fit on the card's final layout box (offsetTop, or the animation's end transform), or keep the arena
   hidden or tight until the re-fit runs. Then run `--full` 3 times clean in a row before resubmitting.
2. Row 5: replace tight3's 18 px cards. Keep a one-line strength readout (e.g. "6 vs 8") and show monsters as a compact list with
   names at 14 px+, or collapse the dock pick, not the fight. Keep drop targets at 44 px or more.
3. Row 5: keep the monster cards clear of the score pill at t0/t1 (put the pill above the row, or move the row down) so the card name
   and level read.
4. Row 2/3/5: on short screens make all start-card buttons fit (smaller title or art at max-height 600px), or show a "more below"
   cue, so "Tutorial (continue?)" is visible with a saved game.
5. Row 2: during the tutorial, keep a sound and speed control somewhere instead of hiding the whole header button row.

Screenshots (reviewer scratchpad, not committed): play/fight-t1-375x553-7-1.png, play/end-375x553-7-0.png, play/end-375x667-8-1.png,
tight-h10-m3.png, tight3-forced.png, leave6-pre.png, leave-3.png.
