# R14 gameplay re-review (strict), 12 Nov 2026

Method: each branch fetched and built with `games-src/scripts/build-all.py <slug>` (all PASS), served beside its `games/<slug>/` media folders,
and played with Playwright touch only (hasTouch/isMobile, `page.touchscreen.tap`, elementFromPoint checked on taps) at 390x844 and 375x667.
Waits of 0.9-2 s before each decision stand in for a human reading the screen. Rules checked against the published rulebook text online
(notes kept locally, not committed). Screenshots: `games-src/reviews/R14-shots/`.

| Game | Total | Result | Rows under 7 |
|---|---|---|---|
| final-approach | see below | | |
| tidewake | 7.0 | FAIL | 6 |
| wildmark | see below | | |

---

## 1. final-approach (branch shelf/W506-final-approach-gameplay @ 5c8005e0)

FA_SECTION

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

WM_SECTION
