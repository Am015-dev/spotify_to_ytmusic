# stitchwise: rules check (7 Nov 2026)

Adapts: a two-player tile-laying duel on a shared time track: buy polyomino patches with buttons, fill a 9x9 quilt, passing income and single-square special spaces, a first-to-fill-7x7 bonus, empty squares cost 2.

## Sources checked
- Publisher's anniversary-edition rulebook PDF (publisher site; full text read: setup, both actions, patch purchase steps, time board events, end of game, scoring, tie-break). Confidence high.
- A fan guide / review search summary (same points). Engine read from the stitchwise side-branch worktree (src/engine.js, src/data.js).
- Patch table (shapes, costs, times, buttons) cannot be checked against the rulebook text: it is only printed on the physical patches.

WRONG 0, MISSING 0, SIMPLIFIED 3

## Findings
| class | code | what the code does | correct rule |
|---|---|---|---|
| SIMPLIFIED | engine.js:9 (`opt.first`) | First player is seat 0 unless set. | Rulebook: "the player who last used a needle" goes first (arbitrary). Harmless. |
| SIMPLIFIED | engine.js:46 (`swSettle`), 53 | A special 1x1 patch on a completely full quilt is skipped. | Rulebook gives no case for a full quilt; skipping is the only sensible reading. |
| SIMPLIFIED | data.js:5-24 | Patch table re-typed from public implementations; 31 of 33 agree between two sources, 2 resolved by guess (see rules-notes.md). | Cannot be confirmed from the rulebook text. The three same-shape pairs (Corner/Boot, Wave/Step, Ruler/Hook) have different costs, which is suspicious but unverified (low confidence). |

## Confirmed matching the rulebook (high confidence)
Both start on space 0, 5 buttons each; regular patches in a circle, the neutral token placed just after the smallest patch (the 1x2) in clockwise order (engine.js:7); choose among the 3 patches ahead of the token; the token takes the bought patch's place (line 61); pay cost, place with rotate/flip without overlap inside 9x9, then move the time token by the patch's time; the new patch counts for income triggered by its own move (inc added before the move, line 61); advance action moves to the space directly in front of the opponent and gives 1 button per space moved, capped at the final space, buttons only for spaces actually moved (swAdvSteps); the player further back moves, ties go to the token on top (arrived last), so one player can move several times in a row (swNext); income and special patches resolved for every marked space passed or landed on, special patch taken by the first to pass and placed at once; 7x7 tile for the first player to fill a 7x7 area, worth 7; end when both tokens reach the last space; score = buttons + 7 (if tile) - 2 per empty square; tie on score goes to the player who reached the final space first (swWinner, line 66; rules-notes.md lists this as a guess, but the rulebook states it).

## Not verified
- Exact positions of income spaces (5, 11, 17, 23, 29, 35, 41, 47, 53) and special spaces (20, 26, 32, 44, 50): the rulebook text does not list them (physical board). They match two public implementations and a published study. Confidence med-high. Whether landing exactly on the last space pays income: engine pays it (spot 53); unconfirmed.
- Whether a player must be allowed to choose not to place a special patch immediately: rulebook says place immediately; engine matches.
- Individual patch values (see SIMPLIFIED row): the two unconfirmed entries are the 6-square C-shape at cost 1/time 5/1 button and the 4-square T at cost 2/time 2/0 buttons.
