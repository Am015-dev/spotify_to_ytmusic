# R14 gameplay re-review (strict), 12 Nov 2026

Method: each branch fetched and built with `games-src/scripts/build-all.py <slug>` (all PASS), served beside its `games/<slug>/` media folders,
and played with Playwright touch only (hasTouch/isMobile, `page.touchscreen.tap`, elementFromPoint checked on taps) at 390x844 and 375x667.
Waits of 0.9-2 s before each decision stand in for a human reading the screen. Rules checked against the published rulebook text online
(notes kept locally, not committed). Screenshots: `games-src/reviews/R14-shots/`.

| Game | Total | Result | Rows under 7 |
|---|---|---|---|
| final-approach | 7.4 | PASS | none |
| tidewake | 7.0 | FAIL | 6 |
| wildmark | 7.3 | FAIL | 5 |

---

## 1. final-approach (branch shelf/W506-final-approach-gameplay @ 5c8005e0)

Played: the tutorial by touch 6 times, 3 ways at each size (390x844 and 375x667): (a) tap every highlight, then on step 27 wait 6 s,
tap the highlight 3 times, then Finish; (b) tap Finish at once; (c) wait 8 s, then Finish. Each run: 27 steps, 27-30 taps, 50-60 s.
Then Quick games (Computer > Just play, default level) to the result, following "What should I do?" on every turn and doing what it
highlighted by touch (tap the die, tap the space): 3 full games (390 won, 375 lost, 375 won), about 160 s each. 0 page errors, 0 console
errors, 0 failed requests in all runs. Two more 390 games were cut short in round 7 by my own script, which had no code for the advice's
reroll-pick mode; a watchdog read the page every 25 s and it stayed responsive ("Your turn", dice and buttons live), so this is not a game hang.

| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 8 | Unchanged from R6: speed judged at the second engine die, equal speed lands, Axis/Engines every round, gear/flaps raise the speed markers, radio clears planes, coffee, reroll, altitude, brakes in order. Played games end on the right checks ("Landing speed 5 against brakes 6"; "Not level at landing"). |
| 2 | Tutorial teaches | 8 | 27 one-line steps, one tap each, every rule in order, and step 27 now ends on "✓ You can fly / Play a real game / Story mode" in all 6 runs. |
| 3 | First 10 seconds | 7 | "New here? Learn in 5 minutes" is now the first option on the title (above Play); Quick game asks Learn / Just play; the flight card says "Every round: fill both Axis and Engines." |
| 4 | Turn clarity | 7 | "What should I do?" showed on 28 of 28 of my turns in each game; it rings the die and the space and says why ("Try your 5 on Axis: Axis 5 against 6: the plane ends level."). Checklist chips (Level, 6 to go, 9 planes, Gear 0/3, Flaps 0/4) stay visible. The prompt line talks about one die only ("Your 4: engines, or coffee."). |
| 5 | Phone play | 7 | Spaces 47x47, dice 52x52, Finish 71x44, chips fit at 375; nothing cut off on the play screen at either size. |
| 6 | AI and pacing | 7 | About 2.5 min a game; Ravi answers in 0.5 s, 1.4-3.2 s at a round start. Following the advice I won 2 of 3. The loss came in the landing round: the advice put my Axis die first ("Your partner's axis die decides the tilt") and Ravi's die then left the wings 1 right. |
| 7 | Feel | 7 | Painted cockpit, dice fly to spaces, "Ravi used Coffee" banners, a painted runway on a win and a night crash scene on a loss. |
| 8 | Bugs | 8 | 6 tutorials and 3 full games: 0 errors, 0 stuck states, 0 dead taps. |
| | **Total** | **7.4** | **PASS** (every row >= 7, no stopper) |

### Earlier findings (G5, R4, R6)
| Finding | Status | Evidence |
|---|---|---|
| R6 STOPPER: tutorial stuck on step 27 of 27 at both sizes | **Fixed.** 6 of 6 runs reached the end card: highlight taps then Finish, Finish at once, and Finish after 8 s, at 390x844 and 375x667. The bubble now says the plain line and its button says Finish. | R14-shots/fa-375-tut-last.jpg, fa-375-tut-end-hl.jpg, fa-390-tut-end-fin.jpg |
| R6: "What should I do?" absent on all 30 turns | **Fixed.** On every turn (28/28, 3 games), with die and space rings. | R14-shots/fa-375-g2-ask.jpg |
| R6: no Play again 2 s after the end | **Fixed.** "Fly again" (loss); "Fly again" + "Next airport" (win). | R14-shots/fa-390-g1-result.jpg, fa-375-g2-result.jpg |
| R6: "New here?" at the bottom of the title | **Fixed.** First option. | R14-shots/fa-390-title.jpg |
| R6: following the advice lost the game | Partly. Won 2 of 3; the loss was the final-round Axis order (see row 6). | R14-shots/fa-375-g2-result.jpg |
| R6: "Spend a token? Tap again." repeated / token spent with no die picked | Not checked: I did not spend reroll tokens in the played games. | none |
| G5/R4 brake rules | Still right (R6 confirmed; tutorial lands at speed 4 against brakes 6). | R14-shots/fa-375-tut-last.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | 375 game, followed the advice in round 7 (landing). | The advice played my 3 on Axis first, saying "Your partner's axis die decides the tilt"; Ravi then tipped the plane 1 right and the landing failed. In the last round the advice should keep the Axis answer in my hands or warn that Ravi may not match. | R14-shots/fa-375-g2-result.jpg |
| 7 / 4 | Lost a landing. | The result says only "Not level at landing" with no number (it was 1 right) and no hint what would have fixed it. | R14-shots/fa-375-g2-result.jpg |
| 4 | Read the prompt line on my turn. | "Your 4: engines, or coffee." names one die while I hold four. | R14-shots/fa-390-quick3.jpg |

---

## 2. tidewake (branch shelf/W498-tidewake-gameplay @ 379dab16)

Played: the tutorial to its end card at 390x844 and at 375x667 (30 steps, 32 taps, about 104 s each). Then 9 Quick games (you vs 2 computers,
default settings: Calm sea start on, add-ons off) to the result screen: 5 at 390x844 and 2 at 375x667 tapping the first ✓ tile and Place each
turn, and 3 at 390x844 deliberately picking ✗ tiles. 0 page errors, 0 console errors, 0 failed requests (the favicon 404 is gone).
Build note: the worktree build needs `games-src/node_modules/three` (missing in a fresh clone); not a game bug.

| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 7 | The 4-step turn, 6/7/8 wakes the leviathans, a 6 raises a new one, placement bans unless forced (Place greys out on a ✗ tile while a ✓ exists), min 3, last junk wins: all match the rulebook. The board is now 7x7 with the dice on columns/rows 1-6 (sources quoted in rules-notes.md; the rulebook text itself never states the size, so the unrolled row/column is a design choice). The default "Calm sea start" begins with 3 leviathans instead of the rulebook's 6 for 2-4 players; it is labelled and can be unticked in Setup. |
| 2 | Tutorial teaches | 7 | Base rules only now, 30 one-line steps, one tap each, ending on "Play a real game"; the add-ons moved to Setup. The danger case is shown (step 22) and a rival sinking on a removed tile is shown (step 28). Still: the elimination swap is one spoken line (step 29) with no card shown. |
| 3 | First 10 seconds | 8 | Goal in 4 short lines, "New here? Learn in 5 minutes" first, Quick game offers Learn/Just play, "Safe start for me" places the first junk. |
| 4 | Turn clarity | 7 | ✓/!/✗ badges, a "start → Stop" path preview with "Hits Hollowmaw" when a tile is deadly, and a new line "⚠ Danger: Hollowmaw can reach your junk if the dice show 6, 7 or 8". Naming is still muddled: the log reads "Vermilion (you) (you) rolls 1+6=7" and the result list "Vermilion (you): sunk". |
| 5 | Phone play | 7 | DOM targets 44 px+, tiles 101 px, no page scroll at either size, result card fits at 375 with the stats line visible. The start marks are still small gold dots (about 16 px) on the canvas; "Safe start for me" is the way round it. |
| 6 | AI and pacing | 5 | Rivals are brisk (1.3-8 s waits). But games are still very short and luck-decided: 9 games lasted 33-143 s with 1-8 placements of mine. I won 3 of 6 by only tapping the first ✓ tile; I lost one after a single placement ("blocked its path" on turn 6, 33 s) and one after 3 placements, both with no choice that could have saved me. |
| 7 | Feel | 7 | Painted chart, junks glide, leviathans move with arrows, path preview, sink marks and a painted result card. |
| 8 | Bugs | 8 | 2 tutorials and 9 games: 0 errors, 0 stuck states, 0 dead taps. Only the "(you) (you)" text. |
| | **Total** | **7.0** | **FAIL** (row 6 under 7; no stopper) |

### Earlier findings (G7, R5)
| Finding | Status | Evidence |
|---|---|---|
| G7 stopper: dead Continue in tutorial waits | Fixed (still). Tutorial ran through at both sizes, every highlight took the tap. | R14-shots/tide-375-tut-end-hl.jpg |
| R5 row 2: tutorial teaches add-ons (Cannon rescues you from a base sinking) | **Fixed.** No add-on steps; end card: "Add-ons are off; tick one in Setup to see how it works." | R14-shots/tide-390-tut-end-hl.jpg |
| R5 row 2: elimination swap is one line, no card | Not fixed. Step 29: "Sink rivals with your tile, and swap tiles with their hands." | R14-shots/tide-390-tut-end-hl.jpg |
| R5 row 6: games far too short, luck-driven | **Not fixed.** 33-143 s, 1-8 placements; see row 6. | R14-shots/tide-390-bad-result.jpg, tide-390-g1-result.jpg |
| R5 row 4: "Vermilion" vs "You" | Partly. Now "Vermilion (you)", but printed twice in the log: "Vermilion (you) (you) rolls 1+6=7". | R14-shots/tide-390-q3.jpg |
| R5 row 4: empty "Sunken crews' tiles (numbered):" heading | Not checked: no elimination by my own tile happened in 9 games. | none |
| R5 row 5: result stats line hidden at 375 | **Fixed.** "21 turns, 1 junk afloat, 28 leviathan moves." shows above the list. | R14-shots/tide-375-g5-result.jpg |
| R5 row 5: start marks 15 px | Slightly bigger (about 16 px), still under 44 px. | R14-shots/tide-375-g6-start.jpg |
| Favicon 404 | Fixed (0 failed requests). | none |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Quick game at 390, "Safe start for me", laid a ✓ tile on turn 1. | Before my second turn a leviathan blocked my bow: "You were sunk: the leviathan Dredgeback blocked its path." Game over on turn 6 after 33 s and one decision. | R14-shots/tide-390-bad-result.jpg |
| 6 | 6 games tapping only the first ✓ tile and Place. | Won 3 (84, 140, 143 s), lost 3 (64, 77, 100 s, with 3-4 placements). No game needed a real choice to win. | R14-shots/tide-390-g1-result.jpg, tide-375-g5-result.jpg |
| 1 | Looked at a fresh Quick game. | Only 3 leviathans at the start for 3 players; the rulebook places 6. Labelled "Calm sea start (first games)" in Setup and ticked by default. It makes the start gentler but is not the published start. | R14-shots/tide-375-g6-start.jpg |
| 4 (good) | Picked a ✗ tile while ✓ tiles were in hand. | Place greys out and the chart shows "Hits Hollowmaw" on the path end, plus the danger line. Clear, and it enforces the placement ban. | R14-shots/tide-390-bad3-t1-noplace.jpg |
| 4 | Read the move log on turn 1. | "Vermilion (you) (you) rolls 1+6=7." | R14-shots/tide-390-q3.jpg |

---

## 3. wildmark (branch shelf/W507-wildmark-gameplay @ 7ed35418)

Played: the tutorial to the end by touch at 390x844 and 375x667 (42 steps: 33 do-it taps and 9 Next, 42 taps, 87 s each, 0 repeats,
ends on "You win! 35-25" with "Play a real game"). Then 4 games on the title's default "Play against 1 computer ranger" (rival Gentle):
390x844 careless (always the first column, the planner's spot) to the result, lost 40-66; 375x667 playing the planner's best move: 93-62
win to the result, plus two more that my script left on the last turns (79-39 at turn 16 and 88-63 at turn 20) when it tapped a planner
spot that was off-screen. A rerun that hit-tested every spot tap found 0 covered spots and 0 dead taps in 20 turns. 0 page errors, 0
console errors in all runs.

| # | Row | Score | Why (one line) |
|---|-----|-------|----------------|
| 1 | Rules fidelity | 8 | Unchanged since R2: market of four pairs, four-alike auto wipe, once-a-turn three-alike wipe, both acorn powers, 20 turns, 2-player largest-area bonus, acorn tie-break; the result table scores each animal card correctly ("Bear pairs 1,2,3,4 = 4,11,19,27"). |
| 2 | Tutorial teaches | 7 | 42 short steps, one tap each, every scoring rule by doing it. "Replace animals" (step 23) is still a Next-only line you never try. |
| 3 | First 10 seconds | 7 | "New here? Learn in 5 minutes" first, then one big Play button; goal "Beat Bram: score more points in your valley than he does." |
| 4 | Turn clarity | 7 | "up to +N" on every column, glowing spots with "+1" badges, a one-line verdict ("★ +5 · Good move", "⚠ No points · Poor move: Salmon column was +4") and "What should I do?". |
| 5 | Phone play | 6 | The market column labels and the "up to +N" badges are 13 px on every turn (the top chips are fixed). At 375x667 a grown valley puts legal spots off the left edge (a "+1" spot cut off at x=0) and under the You/Bram chips; you must pan to find them. |
| 6 | AI and pacing | 8 | Bram's turn takes 2.4-3.1 s. Playing well I won 93-62; playing carelessly I lost 40-66. A 20-turn game takes about 3 minutes at my pace. |
| 7 | Feel | 7 | The verdict is now a small one-line pill that fades, "+1 acorn" pops by the counter, tiles drop in and animals hop. I placed by tapping; I did not test drag-and-snap. |
| 8 | Bugs | 8 | 2 tutorials and 2 full games plus 2 long partial games: 0 errors, 0 stuck states, 0 dead taps on visible targets. |
| | **Total** | **7.3** | **FAIL** (row 5 under 7; no stopper) |

### Earlier findings (G5, R2)
| Finding | Status | Evidence |
|---|---|---|
| R2 row 5: top animal-count chips 13 px | Partly fixed. The top chips are no longer under 14 px, but the market labels ("Salmon", "Fox") and "up to +N" badges measure 13 px. | R14-shots/wm-375-g4-first.jpg |
| R2/R5/R7: verdict card and step card cover the lower board | **Fixed.** One-line pill ("★ +5 · Good move") that fades. | R14-shots/wm-375-g3-turn15.jpg |
| R2 row 7: your own turn feels flat | Partly fixed: pops and tile/animal animations are there; drag not tested by me. | R14-shots/wm-375-g3-turn15.jpg |
| R2 row 2: "Replace animals" acorn power only a Next line | Not fixed (step 23, a Next-only line in my run log). | R14-shots/wm-390-tut-end.jpg |
| R2 row 6: Gentle may be soft | Still true for a careful player (93-62), fine for a first game. | R14-shots/wm-375-g4-result.jpg |
| G5: unreadable result | Still fixed: big totals, one-line reason, per-animal table. | R14-shots/wm-375-g4-result.jpg |
| R7: painted terrains hard to tell apart | Not re-checked. | none |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5 | 375x667, turn 16, held a tile with a valley of 18 tiles. | Legal "+1" spots lie at the very left edge (one cut off at x=0) and the top row runs under the You/Bram chips; the camera does not fit the legal spots, so a player has to pan or zoom out to see all options. | R14-shots/wm-375-g2-stuck.jpg |
| 5 | Measured text on the first play screen. | 8 market texts at 13 px: "up to +3", "Salmon", "up to +1", "Fox"... | R14-shots/wm-375-g4-first.jpg |
| 4 (good) | Careless game at 390. | The verdict pill tells you every poor move in one line ("⚠ -7 · Poor move: Bear column was +6"). | R14-shots/wm-390-g1-turn15.jpg |
