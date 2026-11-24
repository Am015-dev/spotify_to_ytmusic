# Wildmark rules diff (published rulebook vs ours, 24 Nov)

Source: the published base-game rulebook (a full transcription plus two rules summaries, read only, nothing copied; URLs kept out
on purpose). Our names: acorn = the published bonus token, keystone, land = habitat, valley = your area, sweep = the overpopulation wipe.
Checks: `node rules-diff-test.js` (18 checks, one or more per row), `node rules-test.js 60` (scoring cases + 60 AI games, invariants every move).

| # | Rule | Published | Ours | Status |
|---|------|-----------|------|--------|
| 1 | Components | 85 tiles (25 keystones), 100 animal tokens (20 x 5 kinds), 25 bonus tokens, 5 starters | same counts (src/data.js, `acornPool: 25`) | MATCH |
| 2 | Tile supply | 20 per player + 3: 43 / 63 / 83; solo 43 | `need = (solo ? 2 : np) * 20 + 3` | MATCH |
| 3 | Market | 4 face-up tile + animal pairs | 4 pairs | MATCH |
| 4 | Cards | one scoring card per animal; first game uses set A | set A default, B-D in Quick setup / Story | MATCH |
| 5 | Start | each player one random starter | own starter triads per seat | MATCH |
| 6 | Four alike | four matching animals in the market are wiped automatically, repeat if needed, returned after drawing | `overpop()` repeats, returns after drawing | MATCH |
| 7 | Three alike | optional wipe of the three, once per turn | `wipe3`, `used3` reset each turn | MATCH |
| 8 | Bonus token spend | before taking: (a) any tile + any animal, or (b) wipe any number of animals; no limit per turn | Acorn: Free pick / Replace animals; repeatable while acorns last | MATCH |
| 9 | Take | otherwise take one pair as dealt | `take` | MATCH |
| 10 | Place tile | must touch your area; never on top; never moved later | `canPlace`, no move action | MATCH |
| 11 | Rotation / matching | any orientation; matching land not required to place | Turn button, any of 6 sides; any spot touching | MATCH |
| 12 | Place animal | on any empty tile (new or old) showing that animal; else returned to the bag; never moved later | `tokSpots` (all tiles), Skip = back to bag | MATCH |
| 13 | Keystone | matching animal on a keystone earns a bonus token at once | +1 acorn (while the supply of 25 lasts) | MATCH |
| 14 | Refill | slots refilled in place, pairs do not slide (except solo) | refilled in place | MATCH |
| 15 | Game end | 20 turns each (stack runs out) | `done >= turns` for every seat | MATCH |
| 16 | Animal scoring A | bear pairs, elk lines, salmon runs (max 2 salmon neighbours), lone hawks, fox kinds | `scoreAnimal` + scoring cases in rules-test.js | MATCH |
| 17 | Animal scoring B-D | per card | src/cards.js, checked W507 (R113/R115) | MATCH |
| 18 | Land scoring | 1 per tile in the largest joined group per land; edges must match | `hab` per terrain, edge-matched | MATCH |
| 19 | Majority 2p | largest +2, tie +1 each | `bonus()` | MATCH |
| 20 | Majority 3-4p | +3 first, +1 second; 2-way tie first 2 each, 3+-way 1 each, no second after a tie; tie for second 0 | `bonus()` | MATCH |
| 21 | Bonus tokens | 1 point each at the end | acorns 1 point each | MATCH |
| 22 | Tie-break | most bonus tokens; still tied = shared win | `total*100 + acorns`, shared win | MATCH |
| 23 | Solo turn | after your turn remove the tile and the animal furthest from the stacks (out of the game), slide, refill | rightmost removed (`lostToks`), slide left, refill | MATCH |
| 24 | Solo bonus | +2 per land group of 7+ | `bonus()` solo branch | MATCH |
| 25 | Family / intermediate cards | optional single group-size card | not offered (base cards A-D only) | MISSING (variant, not base rules) |

Result: 24 MATCH, 0 FIXED, 1 MISSING (an optional beginner variant, left out on purpose). Every rule above is taught in the tutorial
(src/tutor.js `TUT_STEPS`, in play order: goal, pick, rotate, place, settle, keystone, rival turn, sweep, acorn, land, majority, 5 animals, end).
