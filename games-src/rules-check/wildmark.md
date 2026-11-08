# Rules check: wildmark

Adapts: a 2024-era tile-laying nature game (hex habitat tiles, wildlife tokens, 20 turns each, five animal scoring cards, habitat corridors with majority bonuses).

## Sources checked
- rulespal.com rulebook summary (setup, turn, refill, nature-token powers, corridor and majority bonuses, solo, tie-break)
- officialgamerules.org rules summary (same topics; its tile-count table disagrees with the first source for 1-3 players, the first source and our notes agree on 43/63/83)
- Search results for the B-D card point tables returned nothing usable.
- games-src/wildmark/rules-notes.md (documented simplifications). Engine: src/engine.js, src/cards.js, src/data.js.

WRONG 1, MISSING 1, SIMPLIFIED 4

## Findings
| Class | Code | What the code does | Correct rule | Conf. |
|---|---|---|---|---|
| WRONG | src/engine.js:131 (endTurn) | After each turn the remaining tiles slide right and the remaining tokens slide right INDEPENDENTLY, new items enter at the left. After a nature-token "free pick" (tile slot and token slot differ) the survivors get re-paired (a tile ends up beside a different token than before). | Existing market items never move; only the taken tile and the taken token are replaced in place. Pairs stay as dealt. | high |
| MISSING | src/engine.js:101, 69 | Nature tokens (acorns) are unlimited. | The supply holds 25 nature tokens; spent ones go back to it. (Practically never reached, low impact.) | med |
| SIMPLIFIED | src/data.js:12-33 | Exact animal combinations on the 85 tiles and the 5 starter triads are our own balanced set (counts per terrain match: 25 single-terrain, 60 split). | Published set has a fixed, specific distribution. | documented in notes |
| SIMPLIFIED | src/engine.js:158-167 | Elk A lines are assigned greedily, longest first, capped at 4. | Best assignment of elk into straight lines (each elk in one line). Greedy can undercount in rare layouts. | documented |
| SIMPLIFIED | src/engine.js:127-129 | Solo: right-most tile and token are removed, rest slide right; removed token goes back to the bag. | Solo removes the tile and token furthest from the stacks, rest slide TOWARD the stacks, refill at the far end. Depends on which side the UI treats as "the stacks"; if the stacks are on the left this matches only the removal, not the slide direction, so the next turn's "furthest" pair differs. | low |
| SIMPLIFIED | src/cards.js (all) | Card sets B, C, D: patterns written from summaries, POINT TABLES from memory/guessed (notes say so). | Printed tables on the real cards. | documented, low |

## Checked and matching (high confidence unless noted)
Tile supply 20 x players + 3 (solo 43); 4 market pairs; four-of-a-kind automatic wipe and repeat; three-of-a-kind optional wipe once per turn; nature tokens: take any tile with any token, or wipe any number of tokens, as many as owned; tile must touch own map, any rotation, no stacking; token only on an empty tile showing that animal, otherwise returned to the bag; keystone gives a nature token; 20 turns each; A-card tables for bear (4/11/19/27 for 1-4+ pairs), elk (2/5/9/13), salmon (2/5/8/12/16/20/25), hawk (2/5/8/11/14/18/22/26), fox (1 per different neighbouring animal, foxes included); corridor = tiles linked by matching edges, 1 point per tile; majority bonus 2p 2/tie 1; 3-4p 3 and 1, two-way tie 2 each and no second place, 3-4-way tie 1 each, tie for second 0; solo +2 for a corridor of 7+; 1 point per unused nature token; tie-break most nature tokens then shared win.

## Not verified
- B-D card patterns and every B-D point value (could not find tables online). Recollection only: bear B trio 10, bear C 2/5/8 +3, bear D 5/8/13, elk C table, salmon B/C tables and fox B max 7 look right; elk B and D shapes, hawk C/D, fox C/D, salmon D scoring details are low confidence.
- Whether the 60 split tiles are exactly 6 per terrain pair and whether all split tiles are 3 edges / 3 edges (code assumes so). med.
- Whether foxes count as a "different animal" for fox A (code counts them). med.
- Starter triad composition (assumed one single-terrain tile plus two split tiles).
- Solo discard/slide direction (see table).

## Status (W416c, 8 Nov)
- WRONG market slide: fixed (pairs stay in place). MISSING acorn supply 25: built. Solo slide direction: now toward the stacks (left), refill at the right.
- Card set A: every pattern and table value tested in `wildmark/rules-a-test.js` (46 checks, PASS). B-D are off by default behind "Variant cards (house tables)".
- Coverage table: `wildmark/RULES-COVERAGE.md`.
