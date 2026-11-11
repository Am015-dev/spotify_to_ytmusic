# Sunglaze: clarity and fun report (Oct 2026)

Preview: `games/sunglaze-next/index.html` (built from `game/src`, live file untouched).
Method: blind playtests on a 390x763 phone through `games-src/scripts/drive-serve.js`. Testers were fresh agents with
no repo access: one casual player (guided game on, taps the big button) and one impatient player (skips every guide).
Three rounds, two new testers each. Full per-screen logs are in `playtest/` (r1 = before any change).

## Results

| Round | Build | Casual | Impatient | Average fun | Could explain goal + a round |
|---|---|---|---|---|---|
| 1 | live build, before changes | 3/5 (won 38–29) | 3.5/5 (won 63–54) | 3.25 | yes / yes |
| 2 | fixes A–H | 3/5 (lost 20–23) | 3/5 (lost 39–59) | 3.0 | yes / yes, with why points were won and lost |
| 3 | fixes A–L | 3/5 (lost 28–31) | 3/5 (lost 38–94) | 3.0 | yes / yes, and both described every kind of score change |

**Acceptance is not met.** Fun stayed at 3/5 instead of ≥ 3.5. Clarity did improve:
- Round 1 testers couldn't explain the end of the game, the bonuses or single-tile points.
- From round 2 on, every tester explained the goal, a round, the per-tile points ("3 across + 2 down"), breakage, the Sun token and the end bonuses in their own words.

The fun score didn't move because:
- Round 1's two testers both won; all four later testers lost to the normal computer.
- They named forced breakage at the end of a round as the thing that felt unfair. That rule is part of the game and was not changed.

The fixes after round 3 (M–Q below) have not been blind-tested.

## What testers hit before (round 1)
1. **"★ best" could not be trusted.** Twice it starred a rack that netted 0 over a clean +3, and it ignored half-filled
   racks. Nothing said why.
2. **The Sun token's −1 was hidden inside each rack's breakage number** ("3 tiles −6").
3. **The guide stopped at "Step 1 of 3".** On phones every teaching note was hidden by CSS at heights ≤ 800 px, so
   racks, breakage and scoring were never explained.
4. **No goal on screen.** The game ended with no warning ("Judgement just appeared").
5. **Unexplained score changes:** "+4", "+8" for one tile, and big end bonuses that appeared only in the final table.
6. **The final table was cut off** behind the buttons (Columns and Glazes rows unreadable). The Suggest text was also cut off.
7. **The computer moved before the player had seen the table.** The log named "kiln 5", but the kilns had no numbers.
8. **Faint printed glazes on the mosaic looked like placed tiles** ("I thought I'd finished row 1").
9. "sack 60 · box 7" meant nothing to a new player, and the top-bar icons had no labels.

## What changed (phone UI unless noted; no rule changes)
- **A. A trustworthy star.** The starred rack is the best one right now: points if it fills, minus its own broken tiles.
  - Ties go to a rack that fills, then to the one that keeps more tiles, then to the computer's look-ahead.
  - One line under the racks says why, from the same numbers: "★ Rack 2 fills: +1 at round end, nothing breaks."
  - When the star breaks a tile, the line names the safe alternative: "Still better than rack 4 (scores nothing yet, nothing breaks)".
  - When no rack can take the glaze, the line explains why and how to avoid it next time.
- **B. Sun token shown on its own.**
  - Rack numbers count only that rack's own broken tiles.
  - A separate line explains the Sun token: it takes your next breakage space, and you start the next round.
  - The title says "+ ☀ Sun token".
- **C. Goal line, always visible.**
  - "Most ★ wins. The game ends after a round in which someone completes a mosaic row. Then: full row +2, full column +7, all 5 of a glaze +10." Short screens get a one-line version.
  - It turns into a warning when the end is near: "Last round: Olive will complete mosaic row 2", or "has 4 of 5".
  - Near the end of a round it says "Only 6 tiles left this round: … what fits no rack breaks".
- **D. Every point explained in the round card.**
  - One line per set tile: "Row 2: +4 = 2 across + 2 down". This is computed by the engine at the moment the tile is set; the first version read the final mosaic and gave wrong reasons, and the test caught it.
  - A breakage line counts the spaces, says when the Sun token is among them, and says when the score could not go below 0.
  - Each rival gets a short line ("Olive: 3 tiles +11 (best +6)"), plus the move that ended the round.
- **E. End bonuses visible during play.**
  - The opening story screen now lists the four scoring rules.
  - Your board shows "+N end bonus" earned so far, and the goal line shows the rivals' bonuses with the reason ("Olive +7 (1 column)").
  - The desktop score chips show the bonus too.
- **F. A first-game card** that says the goal, a turn, the round end, the Sun token and a column tip in 5 short lines. It replaces "Step 1 of 3", whose steps 2 and 3 never appeared. In the guided game, the take panel also shows one teaching line per step.
- **G. Fitting screens.**
  - Rack buttons are one row shorter in portrait, so the reason line fits at 390x763.
  - The end card drops the story line, so the whole table shows, and its 3 buttons sit in one row (New game / Mosaics / Close).
- **H. Numbered kilns** in the 3D table, matching the log ("kiln 5").
- **I. The table before the first move.** The computer's first move waits 2.6× the normal delay; later moves wait 1.4×.
- **J. Printed glazes are fainter and smaller,** so they can't be read as placed tiles.
- **K. Clearer labels:**
  - "sack / box" removed;
  - blocked racks say "mosaic row 3 has Cobalt" instead of "mosaic row has it";
  - the top-bar icons have accessible names;
  - your recent-moves list shows every rival's last move.
- **L. Typo fixes,** and short-screen variants for every new line.
- **M–Q (after round 3, not blind-tested):**
  - pick-time warning "It completes mosaic row 3: the game ends after this round";
  - rivals' round lines;
  - bonus reasons;
  - the first-game card now also covers the Sun token, racks carrying over and "a row never holds a glaze twice";
  - the goal line shows only the warning when one is up, so your board doesn't shrink.

## Tests
- New `game/clarity-test.js` (jsdom, phone mode). It checks every human turn over N games:
  - the star is never worse right now than another rack;
  - no rack number hides the Sun token, and the token's cost is shown on its own;
  - there is always a reason line, and every suggestion has a reason;
  - the round card's lines add up to the score change, and every "a across + b down" adds up to its points;
  - the goal line is present.
- Before the fixes: 258 failures in 4 games (best 13, sun 36, why 90, sum 16, goal 103). After: 0.

| Test | Result |
|---|---|
| clarity-test.js 8 games | ALL PASS |
| cover.js 60 games | 60 finished, 5,088 moves, 0 errors, 0 invariant fails, 19/19 rule scenarios |
| click.js (7 configs, desktop jsdom) | 0 errors |
| click-phone.js | 0 errors |
| lay.js 1366x768, 1920x1080, 768x1024, 1100x700 | PROBLEMS 0 (lay.js's own default 4th size, 390x844, times out in its drawer step on the original build too; that size is covered by lay-phone) |
| lay-phone.js 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342 (2p) + 4p at 390x763 and 375x553 | PROBLEMS 0 at every size (412x780 first showed 3: the round card's score table overflowed; fixed, then rerun) |
| net/p2p-sunglaze.js full1 / full2 / leave / migrate + p2p-sunglaze-phone.js | 0 bad in every scenario (6 runs); hosts and clients agree |

## What's still weak
- **Fun is 3/5 for four testers in a row.** The low points they named:
  - forced breakage at the end of a round. Following Suggest once led into a −14 on the next turn: the suggestion does not look ahead to the forced last takes;
  - losing big to column bonuses they had not planned for.
  The opening card now teaches columns, but no blind tester has seen it.
- **The star prefers "fill now and break 1" over "keep all tiles".** Testers read that as wrong even with the reason line. A future pass could weight breakage more, or skip the star when the gain is small.
- **Your board in the strip is small at 375x553,** and the large board view is found only by tapping it.
- **Frost and Cobalt are hard to tell apart** at small sizes (art).
- **The ☀ and ✗ marks on rival chips are unlabelled.** Rival boards are reached by tapping a rival chip or the top people icon.
- **Desktop and tablet got only** the story-screen rules, the bonus chip and the kiln numbers. The desktop dock was not reworked.
