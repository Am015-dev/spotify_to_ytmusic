# Stitchwise: fixes for review R4 (W368, branch shelf/W368-stitchwise-fix, not deployed)

Review R4 scored 6.25. Everything below was fixed in `games-src/stitchwise/src` (+ `temp-art`, tests). Temporary art is installed locally for the tests only (never commit `games/`).

## Review items
| # | Item | Fix |
|---|---|---|
| 1 | Name breach in rules-notes.md | Two repo paths replaced by "public implementation A/B"; `grep -ri` for the original title, its publisher and designer in `games-src/stitchwise` returns nothing (first commit, pushed alone). |
| 2 | "New here?" toast over title/tutorial | Toast removed (Tutorial button is on the title); any toast is also cleared when a tutorial or a game starts; title toasts sit at the bottom. |
| 3 | Story "Goal:" toast on the chips | No toast. Goal (and twist) is a fixed line at the top of the dock (`#goalline`), covers nothing. |
| 4 | Story result had no score | Result now shows both totals, "Lost by N / Won by N", and the tie-break line ("Tied on points. X reached the end first and wins the tie-break, so this is a loss"). |
| 5 | "Score 0 or more" star on a loss | Stars are only earned on a win (shared kit rule); the result says so on a loss. Stars on = goals met is asserted in the test. |
| 6 | Stars stacked vertically | One row (CSS override), checked by bounding boxes in the test. |
| 7 | Best score never saved | Kit keeps only stars (read-only shell), so the game stores its own `sw_best` per stage and shows "Your best here" on the Story result. The map does not show it (shell). |
| 8 | Menu tabs overlap, "Game / Game" | Chips wrap and never shrink; row renamed "This game". |
| 9 | Map header wraps mid-word | Title on its own row. The map's own Tutorial button was dropped (Tutorial stays in Menu, Rules and the title). |
| 10 | Blank dock collapse button | Dark glyph on white button. Esc restores a collapsed panel. |
| 11 | Dev text "Silent until the music files..." | Music row hidden until tracks exist. |
| 12 | Names truncated on phone | Player pill is a 2-row grid (thumbnail, name, buttons/income); "Marden" and "Dame Poppy" fit at 390 px. |
| 13 | Restart without confirmation | First tap turns the button into "Tap again to restart" (3 s). |
| 14 | Result hid the board / "Look at the quilts" | The result IS the side-by-side quilt reveal now; the button is gone. |
| 15 | 404 on first phone load | No 404 or page error in any run (first-launch test, smoke, story tests). |

## Top 5
1. **Real finish:** both quilts side by side, empty squares counted down one by one with "-2" on each and a tick sound, running Buttons / 7x7 / Empty x -2 / Total per quilt, then winner banner (gold for a win) with a fanfare and confetti, "Skip" while counting, tie-break line on a tie. Quick game shows Play again / Title; Story shows Continue, then the kit result with totals. Fits 844x390 (compact), 375x553, 390x763, 1440x860.
2. **Title and table:** painted quilt backdrop (temp art `bg-title` redrawn as a patchwork), framed parchment card with a stitched border and serif display title. Dev line removed.
3. **Opponent quilt in play:** thumbnail of both quilts in the player pills (phone); on wide screens a larger "Marden's quilt" panel under the track (tap = full quilt).
4. **Readable track:** phone track is 3 rows of 18 with direction arrows (‹ › per row), start and end markers, the next button/leather spot ringed in gold, and the landing space of the selected patch ringed in blue and pulsing.
5. **Overlays and small bugs:** all of the table above.
Juice also: winner glow on the winning quilt, confetti, "No" shake on an unaffordable patch, sounds `fanfare` / `thud`.

## Audit (scripts/ui-audit.spec.js, served local build with temp art)
Baseline with temp art (before): phone A0 B7 C16 E1, phone-s A0 B9 C16 E0, pc A16 B7 C16 E2.
After: **phone A0 B0 C0 D0 E0 F0, pc A0 B0 C0 D0 E0 F0, phone-s A0 B1 C0 D0 E0 F0.**
Left: phone-s B1, "Who goes next?" in the How to play sheet (2.80:1). Its box is off screen at 375x553 and the audit samples the clamped bottom row; renaming or re-padding the heading did not change it, the same text measures fine on phone and pc. Not fixed: needs an audit fix, not a game fix.
Changes that made C zero: track and offer-card art use `background-size: cover` instead of 100% 100% (aspect kept). Found by the audit and fixed: dock collapse leaves the panel minimised after Esc (tests tapped offers hidden under it), unaffordable offer tap gave no visible response.

## Tests (all with real taps on touch phones, mouse on PC)
- `build-all.py --quick stitchwise` PASS (11/11 scenarios; `sw-result` now checks the new reveal, both quilts and totals).
- `rules-test.js 100` PASS. AI gate unchanged: Hard 97%, Normal 89%, Easy 87% vs first-legal bot (gates 70 / 55); Hard beats Normal 66% (gate 60).
- `smoke.js <size> --full` (title, quick game, real drags, whole game, result totals, Play again, rules): PASS at 390x763, 390x763 with animations, 844x390, 375x553, 1440x860.
- `smoke.js --tut` and `--story` PASS (390x763; story also 1440x860).
- **`smoke.js <size> --story2`** (new): Story stage 1 LOST on purpose (only Advance): "Not this time", both scores, "Lost by N", retry offered and works; stage 1 won (stars in one row, stars on = goals met, best score saved); stage 2 played to a result with scores and stars. PASS at 390x763, 844x390, 1440x860 (47-48 checks). A forced 9-9 tie was also checked on screen (win and loss versions).
- `menu-test.js <size>` (new): every Menu item (tabs without overlap, no dev text, sound toggle, Rules, Tutorial, Restart with confirmation, Title): PASS at 390x763 and 1440x860.
- `first-launch-test.js <size>` (new): fresh profile, title, no toast, Tutorial start and Next taps, skip: PASS at 390x763, 844x390, 1440x860.
Run them with `URL=http://localhost:PORT/index.html` against the built page and `PLAYWRIGHT_BROWSERS_PATH` pointing at a symlink shim for the installed browser revision.

## Not done / for the orchestrator
- Real art is still temporary (portraits, bg-map, result-win/lose missing); the redrawn `bg-title` is in `temp-art/media`, copy it with the deploy.
- Best score is not on the Story map (shell file, read-only here).
- The Story map's own Tutorial button was removed (shared head button; it also confused the audit's tap order).
- Visual deploy still needs every critic row >= 7 and the orchestrator seeing the shots (`games-src/stitchwise/shots/` after a smoke run).
