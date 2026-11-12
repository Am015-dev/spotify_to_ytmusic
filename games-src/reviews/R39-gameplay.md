# R39 gameplay re-review (12 Nov 2026)

Strict reviewer, rubric `games-src/reviews/GAMEPLAY-RUBRIC.md`. Each branch was checked out fresh in its own worktree. Builds were served
through `games-src/scripts/gx-serve.js`, the same way the live site serves them. All play was touch taps (Playwright, `isMobile`, `hasTouch`)
at 375x667, plus 390x844 where noted. My drivers tap only what a newcomer would tap (a coach button, the suggested glow, any glow, the main
button). A tap counts as dead when the page does not change within 1.6 s. Screenshots are local only (not committed). Their names are
given for the fixer to reproduce.

| Game | Commit | Quick gate | Full gate | Average | Verdict | Rows under 7 |
|---|---|---|---|---|---|---|
| thornbound | bf654f28 | PASS | PASS | **6.9** | **FAIL** | Phone 6, Feel 6 |
| doorkick-dungeon | 69fceeb6 | PASS | **FAIL** 1st run, PASS 2nd run | **4.0** (capped; 7.1 uncapped) | **FAIL** | Phone 6, plus the gate stopper |
| hollowbough | d2fde088 | PASS | PASS | **7.5** | **FAIL** | Phone 6 |

Shared `phone-check.js` spot-check (doorkick branch): `build-all.py --full sunglaze kaiten-kitchen`: **PASS** (2/2 PASS, EXIT 0).

---

## 1. thornbound (shelf/W489-thornbound-rules @ bf654f28): 6.9, FAIL

**Quick gate: PASS.** "own checks 12/12 ok ... 1/1 PASS ... EXIT 0". The R36 `menu` and `tb-story-start` failures are gone.
**Full gate: PASS.** Phone-check 83.9 s. Sweep "PROBLEMS 0". "1/1 PASS ... EXIT 0". The lab "WARN 10/12" is not a gate fail.

What I played:
- **Tutorial** ("New here? Learn in 5 minutes"), tapping only the spotlight or Next. 375x667: 38 steps, 40 taps (12 of them Next), 40 s,
  0 dead taps, 0 errors. 390x844: the same in 36 s. The two-tap steps (16 "Tap the Tablelands twice", 18 fight order) show progress on
  the first tap. It ends "Bid, steal, Herald, hide, fight, ties, Autumn, Lore", and "Play a real game" opens a real game.
- **Default games** (Quick game > Start, no settings changed), following the suggested glow every time (the `.rg` card, the suggested spot
  or location, the one-tap power button, then the main button). **I won 5 of 5:**

| Size | Result | Time | Taps | Dead taps | Longest still screen |
|---|---|---|---|---|---|
| 375x667 | won 14-13 | 7.9 min | 126 | 0 | 3.0 s |
| 375x667 | won 16-9 | 6.7 min | 126 | 0 | 2.9 s |
| 390x844 | won 15-12 | 6.7 min | 128 | 0 | 2.9 s |
| 375x667 | won 19-10 | 6.6 min | 127 | 0 | 2.9 s |
| 375x667 | won 17-10 | 7.2 min | 136 | 0 | 2.8 s |

  0 page errors in all five. After the last scoring, "Tap: next" opens the result card ("You win the throne!", the scores, "Where the
  Influence came from", Play again, Main menu).
- **R36 stopper re-checked.** In round 1, at "Tap the regions in the order they should fight", I tapped a hand card on purpose. A short
  toast said "You can't play this card now. Tap the regions in the order they should fight." No sheet opened, and the board stayed usable
  (tb-p-probe.png). **Fixed.**
- **Story > Skip tutorial** opens the chapter map. **Fixed.** At 375 its title breaks as "The / Heir / of / the / Heat / h", and the
  "Act 1" heading runs into the title block (tb-story-skip0.png).

**Rules check.** The engine and tutorial lines are unchanged from R36 and still match the published game: secret bids in strength order,
take, steal or take back, Herald +1, Supporters +1, ties re-fought with one added card, Govern and Journey in Autumn, Lore buys, 4 rounds
for the short game. I saw nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Unchanged and right. |
| 2 | Tutorial teaches | 7 | 38 one-line steps, 0 dead taps at both sizes, about 40 s. 12 of 40 taps are still Next only, and a few steps are reading only (Favour, card powers, Councils). |
| 3 | First 10 seconds | 7 | The goal card has a headline and 3 bullets, then "Tap a card to bid it in secret", with the suggested card raised. |
| 4 | Turn clarity | 7 | Fixed: the glow is always the suggestion. Slot choices are marked "★ Suggested", and an unplayable card gives a toast instead of a sheet. The bottom chips (Coin, Whispers, Pledges, Favour, Tactics) are still not explained on the board. |
| 5 | Phone play | **6** | Not fixed since R36: at 375 the bid spot is 40x57, the five bottom chips are 70x40, and the first turn shows 24 text items under 14 px (12-13 px). New: the Story chapter-map title breaks a word ("Heat / h"). The unplayable-card toast covers the prompt line and the Court score while it shows. |
| 6 | AI and pacing | 7 | Fixed: a glow-follower won 5 of 5 against the default Easy rival, with margins of 1 to 9 points, so the rival is not a pushover. But a 4-round game is still 6.6-7.9 min and 126-136 taps. |
| 7 | Feel | **6** | Up from 5. Clashes now have a hit effect. Most of a game is still discs, numbers and pop-ups changing; bids and steals have no card flight worth watching. |
| 8 | Bugs | 8 | Both gates pass. 2 tutorials and 5 full games: 0 errors, 0 dead taps, 0 stuck states. |
| | **Total** | **6.9** | **FAIL**. 7+7+7+7+6+7+6+8 = 55/8 = 6.9. Rows 5 and 7 are below 7. No stopper. |

### Fix list (thornbound)
1. Row 5: make the 375 bid spot at least 44x44 and the five bottom chips at least 44 px tall. Raise chip labels and "empty" to 14 px.
   Repro: Quick game > Start at 375x667, first turn (tb-m-firstturn.png).
2. Row 5: the Story chapter map at 375: let the title wrap on spaces only (shrink it or use `overflow-wrap: normal`) and keep "Act 1" clear
   of it. Repro: Story > Skip tutorial (tb-story-skip0.png).
3. Row 5: move the "can't play this card" toast clear of the prompt line and the score bar (for example over the hand).
4. Row 7: animate the moves a newcomer cares about: the bid card flying to its Kingdom Card, a steal moving the card across, Influence
   counting up on the track.
5. Row 6 (keep 7): cut taps per game, for example by auto-advancing "Tap: next" pages that only report a rival's move.

---

## 2. doorkick-dungeon (shelf/W502-doorkick-gameplay @ 69fceeb6): 4.0 capped (7.1 uncapped), FAIL

**Quick gate: PASS.** "own checks 25/25 ok ... 1/1 PASS ... EXIT 0".
**Full gate: FAIL on the first run.** "sweep.js: issues: game ran over 8 min (turn 137) ... SWEEP FAILED 1/4 (3 reached a winner) ... 0/1
PASS ... EXIT 1". A second run passed ("SWEEP CLEAN 4 games (4 reached a winner) ... 1/1 PASS ... EXIT 0"). A gate that fails one run in
two is a stopper, and this one points at a real risk: a 137-turn game that never ends for a player.

What I played:
- **Tutorial** ("New here? Learn in 5 minutes") by touch at 375x667 and 390x844. Both: 28 steps, 48 taps (6 Next), 66-67 s, 0 dead taps,
  0 errors. The "X, then Y" steps (2, 4, 10, 14) work when you tap both targets. Longest wait for the next step was 5.4 s, after the
  door kick.
  - Step 10 at 375: the bubble now sits at the bottom. "YOU 3 vs 12 MONSTERS" stays visible, and the "Pip (you)" target is 61x56
    (was 61x37). **Fixed** (dk-tut375x667-dead3.png).
  - Step 12 at 375: no "Lost" toast over the "Caught: Bad Stuff!" banner. **Fixed** (dk-s12-stop.png).
  - The end card's "Play a real game" starts a real game.
- **Real game** (Quick game > Me vs computer > Start > Just play, defaults: 3 rivals). I followed the starred card, the glowing drop
  target, the pulsing button and the main button. 375x667: **lost**. Grub reached level 10 (Tansy helped, so Tansy won too). I reached
  level 9, after 4.3 min and 168 taps, with 0 dead taps and 0 errors. The longest wait between my decisions was 11.5 s.
  Two more runs did not finish because my driver could not choose between card-panel actions without a ★ (for example "Swap
  Litigation Lizards for ..." twice). That is a limit of my driver, not a game fault, so I do not score it.
- **Rules**: as R35 (kick, fight or run on 5+, elf +1, Bad Stuff, curses, helping, selling 1,000 gold for a level but not the winning one,
  charity, the faster-play helper win). I found nothing invented.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | 28 steps, 0 dead taps at both sizes, about 1 min. The R35 overlaps are gone. |
| 3 | First 10 seconds | 7 | Start, Just play, then "How to win" and the starred card. |
| 4 | Turn clarity | 7 | The bottom bar names the move ("Become Halfling: tap the glow", "Stop Tansy with the ★ card"). The glowing drop target is clear. When a ★ card has several actions in its panel, none is marked. |
| 5 | Phone play | **6** | Fixed: at 375 "Play again" no longer covers the result table. Still: a "+6" float sits on the result headline. Table names are cut ("Pip (yo", "Morw"). Gear chips are 38-39 px tall ("Backstabber's Shiv +3" 114x39, "Staff of Wildfire +5" 349x38, "Gooey Mail +1" 173x38). |
| 6 | AI and pacing | 7 | Rivals are brisk, and the game took 4.3 min. I lost a close game (level 9 against 10). R35's newcomer won 2 of 2 as a helper. One gate sweep game ran past 8 min (turn 137). |
| 7 | Feel | 7 | Painted art, door kick, star prompts, confetti result with per-hero stats. |
| 8 | Bugs | 7 | 2 tutorials and 1 full game: 0 errors, 0 dead taps. The full-gate sweep failed once on an over-long game. |
| | **Total** | **4.0** | **FAIL**. Uncapped 8+8+7+7+6+7+7+7 = 57/8 = 7.1. The full-gate failure is a stopper and caps the total at 4. Row 5 is below 7 anyway. |

### Shared phone-check.js change (tutorial Skip)
Sound, and it does not break other games: the sunglaze + kaiten-kitchen `--full` spot-check passed (2/2 PASS, EXIT 0). The Skip tap uses
the same `tap` + `waitChange(1000)` path as a move. It is counted in `moves` and `skips`, and a dead Skip counts as an unresponsive tap.
The run fails if `[data-gxt-skip]` is still in the page afterwards, and after more than 3 skips. Skips never count toward `wantReal`.
The confirm selectors (`[data-gxt-dlg=exit]`, `[data-gxt-end=skip]`) match `shell/gx-tutor.js`.

Remaining small gaps, as in R35. The confirm-dialog tap is still not timed or checked for a dead tap. The "still open" test is DOM
presence, not visibility (this fails safe). No phone-check line in these runs said "tutorial skipped", so the new path was not exercised by
the spot-check games either.

### Fix list (doorkick)
1. Stopper: find why a sweep game reached turn 137 and ran past 8 min. Add a turn or time cap, or a rival end-game push. Then the full gate
   must pass on repeated runs. Repro: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/x doorkick-dungeon`
   (failed 1 of 2 runs).
2. Row 5: move or drop the "+N" float on the result card at 375. Show full hero names in the table (shorter column labels, or wrap).
   Repro: any full game at 375x667 (dk-g1-result.png).
3. Row 5: make gear chips at least 44 px tall.
4. Row 4: when a ★ card's panel offers several actions, mark the suggested one with ★.

---

## 3. hollowbough (shelf/W482-hollowbough @ d2fde088): 7.5, FAIL

**Quick gate: PASS.** "own checks 13/13 ok ... 1/1 PASS ... EXIT 0".
**Full gate: PASS.** Phone-check 64.0 s. "SWEEP PASS". "1/1 PASS ... EXIT 0". The lab "WARN 10/12" is not a gate fail.

What I played:
- **Tutorial** ("New here? Learn in 5 minutes") by touch. 375x667: 37 steps, 41 taps (11 Next), 28 s, 0 dead taps, 0 errors. 390x844:
  the same in 26 s. It ends "You win, 22 to 17", and "Play a real game" opens a real game.
- **Default path** (fresh browser, Play > Play now > Start; defaults Guided, 2 players). On the first turn the hint finger shows by itself,
  and only one place glows (Bumper Bramble) (hbx-d.png). **Fixed.** My newcomer taps the glow, then a button. **I won 3 of 4:**

| Size | Result | Time | Taps | Dead taps |
|---|---|---|---|---|
| 375x667 | lost 41-46 | 1.9 min | 87 | 0 |
| 375x667 | won 37-27 | 1.4 min | 56 | 0 |
| 390x844 | won 43-41 | 1.7 min | 77 | 0 |
| 375x667 | won 41-37 | 1.5 min | 68 | 0 |

  0 errors and 0 stuck states. Every game reached the result card ("Bramble wins!" or a win, a table, Play again, Look at the board,
  Main menu). **Is the rival now too weak? No.** Bramble scored 27-46, three of the four games were within 5 points, and it won one.
  This ends the 0-in-6 run from R24, R31 and R35.
- **Rules**: unchanged and right for 2 players (as R35). The result table lists city, purple bonuses, tokens and Journey.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right. |
| 2 | Tutorial teaches | 8 | 37 one-line steps, 0 dead taps at both sizes, under 30 s. 11 of 41 taps are still Next only. |
| 3 | First 10 seconds | 8 | Up from 7. The goal tip, then a hint finger on the single best place without asking. |
| 4 | Turn clarity | 7 | Up in substance: the glow now means "good move" (1-3 targets), and counters count down. But at 375 the prompt text is often cut (row 5). |
| 5 | Phone play | **6** | At 375 the top-left prompt pill is cut off. In one game, 4 prompts did not fit (text 52 px tall in a 36 px box): "Keep one; your rival gets the..." (ellipsis), "Tap a meadow card to take it: 2 left.", "Spend goods for tokens, or stop: 3 left.", and "...of 5 discarded. ...ap 4 more." with its start missing. In "Keep one", the two cards to choose from are small backs with no names. The hint finger sits on card names (for example "Crook Shrew"). At 390 the pill fits. |
| 6 | AI and pacing | 8 | Fixed: a glow-follower won 3 of 4 on defaults, with close scores. Brisk: 1.4-1.9 min of play, waits under 2.6 s. |
| 7 | Feel | 7 | Painted places and cards, meeples, finger hints, painted end scene with achievements. |
| 8 | Bugs | 8 | Both gates pass. 2 tutorials and 4 full games: 0 errors, 0 stuck states, 0 dead taps. |
| | **Total** | **7.5** | **FAIL**. 8+8+8+7+6+8+7+8 = 60/8 = 7.5. Only row 5 is below 7. No stopper. |

### Fix list (hollowbough)
1. Row 5 (the only blocker): at 375 the prompt must show in full. Give the pill the full width under the top bar, or let it grow to
   3 lines, or put the prompt above the action bar. Repro: Play > Play now > Start at 375x667. Take 2 meadow cards in Summer, or reach
   "Keep one; your rival gets the other" (hb-g4-pill1.png, hb-g2-t60.png).
2. Row 5: in "Keep one; your rival gets the other", show the two choices face up with names, at hand-card size.
3. Row 5: offset the hint finger so it does not cover the card name or cost it points at.
