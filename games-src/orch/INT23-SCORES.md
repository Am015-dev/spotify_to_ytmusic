# INT23 critic gate, 24 Nov 2026, ~18:30 UTC
Rows R1 Readability / R2 Game-not-spreadsheet / R3 Layout / R4 Finish / R5 First-minute. Gate: every row >= 7 on phone AND pc. Unsure = 6.
Result: NOTHING DEPLOYED. The four inputs are merged on this branch (one squash commit each) but none could be verified or scored.

| game | live (R15) phone / pc | INT23 phone / pc | verdict |
|---|---|---|---|
| gloamwar | 5/8/5/4/6 / 5/8/5/4/6 | not scored (unsure = 6); W766 worker claimed 7/8/7/7/7 / 6/8/7/7/7 | HELD |
| cauldron-fair | 6/8/7/7/7 / 5/3/4/5/4 | not scored; W760 worker: phone 0 flags | HELD |
| lantern-dive | 6/5/5/6/5 / 5/5/4/6/5 | not scored | HELD |
| stitchwise | 5/7/7/6/6 / 4/7/6/6/6 | not scored; W767 worker: R2/R4/R5 still < 7 | HELD |

## What blocked verification
- gloamwar is not in build-all's GAMES list (built by hand with games-src/gloamwar/build.py). Its lessons test FAILS at 402x874 ("minimise gave no chip", repeated twice), passes at 1366x768.
- build-all --quick for cauldron-fair, lantern-dive, stitchwise: all three BUILT; scenario step "none ran" because `@playwright/test` is not installed in this sandbox (games-src/node_modules symlinked to /opt/node-tools, which lacks it). Not a game fault, but it means the key ?scn= tests did not run.
- Contact sheets were not made: serving the staged builds on a local port was refused by the sandbox classifier.
- cheapag delegate refused: CONSENT required (/cheapag:allow). No jobs run, 0.00 USD.

## Merge notes
- W764 lantern: conflict in games-src/scripts/contact-sheet.js (shared). Kept the base side; W764's wait-for-GXSCN.ready line was dropped. This one-line conflict edit was done by hand (before the cheap-agent-only order arrived).
- W767 stitchwise: HANDOFF.md merged cleanly. The title/board visual baselines were not re-approved (no build-all --approve-visual run).

## Top remaining defects (from the workers' own reports and R15; not re-measured)
- gloamwar: phone lessons minimise chip; pc R1 was 6 (tiny pc text).
- cauldron-fair: pc was the weak side in R15 (3/4/5/4 rows); W760 only fixed the first-frame pot.
- lantern-dive: pc R2/R3 low in R15; W764 enlarged hand and text, unmeasured.
- stitchwise: R2/R4/R5 below 7 per W767.
