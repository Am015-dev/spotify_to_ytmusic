# final-approach: rules check

Adapts: a two-player cooperative dice-placement game about landing an airliner in 7 rounds (hidden dice behind screens, axis, engines, radio, gear, flaps, brakes, coffee, approach-track planes, 21 scenarios plus add-on modules).

Sources checked: rules-summary sites found by web search (officialgamerules.org, gamerules.com, geekyhobbies.com, a rules-app site rules.dized.com, rulespal.com; all summaries, none read in full); the shelf's own `final-approach/rules-notes.md`, `AUDIT-RULES.md` (an earlier independent audit against the publisher booklets and a rules app, 26 rows) and `FIX-REPORT.md`; engine `games-src/final-approach/game/src/engine.js` (spot-checked: newGame/cleanAbil, brakeVal, landing checks, validMoves/reroll, pending handlers) and `data.js` scenario table (not re-transcribed). Printed rulebook and printed strips not available to me.

WRONG 0, MISSING 0, SIMPLIFIED 6 (plus 3 unverified risks listed below)

This game was the most carefully audited on the shelf. The four real defects found by the earlier audit (reroll token only on own turn, unchecked ability list, lost trainee token, hand-over/flip only on own turn) are fixed in the current engine (`FA.cleanAbil` at engine.js:81, reroll offered to either seat at engine.js:313, trainee token returns to the row).

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| SIMPLIFIED | engine.js:167, 233 (`s > br`) | Last-round landing passes when speed is less than or equal to the brake value; brake value must be at least 2. | Printed text says speed must be "less than" the brake marker; earlier audit argues the marker sits between two numbers so equal-to-the-number passes. Documented as ruling 9 in the notes. Confidence med: this is the single rule most likely to be argued by a player with the box. |
| SIMPLIFIED | engine.js (die with no legal place, `toss`) | A die with no legal space is thrown away as the turn. | Booklets are silent; house rule, documented (ruling 2). |
| SIMPLIFIED | engine.js (trainee token) | Trainee token is placed immediately in the same turn; cannot go on a trainee space. | Rules app says place it right away; the box text can be read as "later this round". Documented (ruling 1). |
| SIMPLIFIED | ui (presets), net | Briefing talk is limited to a fixed set of non-dice phrases; timer pauses on pass-the-device screens and while the computer plays. | Real game: free talk about strategy (never dice values) and a 60-second timer that never pauses. Documented (rulings 6, 7). |
| SIMPLIFIED | engine.js (Hand-over, Flip side, Cross-check) | Usable by either seat while no question is open; Cross-check fires once per round when the second of gear/flap dice is down; both players see the swapped values. | Matches rules-app text ("at any time", once per round); the "both learn the values" part is an adaptation. |
| SIMPLIFIED | not built | The newer expansion (about 20 scenarios and modules such as alarms, turbulence, bad visibility, engine loss) is not implemented. | Not part of the box this adapts. Documented (section 9). |

## Checked and correct (sample, from the earlier audit and my spot reads)
- 4 + 4 dice, alternate placement, first player per altitude row, silent after the roll, reroll tokens on rows 6000 and 2000 (green/yellow) or 6000 only (red/black). High (earlier audit read booklet text).
- Axis: tilt toward the higher die by the difference, cumulative, 3 = spin, level required to land. High.
- Engines: markers blue 4 / orange 8, 0 / 1 / 2 spaces, gear +1 blue (max 7), flaps +1 orange (max 12), advance step by step (tab check, collision, step), overshoot, holding pattern, crash short of runway. High for the structure; the exact thresholds were confirmed only in rules-app text (med-high).
- Radio (pilot 1 space, co-pilot 2, count from the plane, 1 = own space); gear 1-2/3-4/5-6 any order; flaps 1-2/2-3/4-5/5-6 in order; brakes exactly 2, 4, 6 in order; coffee +-1 each, no wrap, 3 tokens in the game, either player may spend. High.
- Modules: traffic die, corridor tabs, fuel (20, minus 6 if unused, leak formula), wind dial (20 positions, +3 start), trainee, icy runway (4 columns 2/3/4/5), real-time (60 s). High per earlier audit; wind modifier table matched a single digital source only.
- Win conditions list (no planes, all lights green, level axis, speed vs brakes, trainee/ice done). High.

## Not verified
- All 21 approach strips (plane counts, traffic icons, tab positions) match one online implementation and one fan table (0 differences) but have NEVER been compared with the printed box strips; the notes' earlier claim of two printed strips referred to promo airports. A typo here would silently change one scenario's difficulty. Confidence in data: med.
- Wind-dial modifier table and the red/black altitude side: single-source (the same online implementation). Med.
- Whether the brake comparison is strict (see first table row). Med.
- I did not re-run the engine; I rely on the shelf's rules-test (68 pass) and the earlier audit's reproductions for behaviour.
