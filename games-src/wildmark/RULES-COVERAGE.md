# Wildmark rules coverage (found -> built -> tested)

Sources: `games-src/rules-check/wildmark.md` (rules check), `rules-notes.md`. Tests: `node rules-a-test.js` (46 checks),
`node rules-test.js 240` (scoring cases + AI games with invariants), `node tutorial-end.js`.

| Rule (found) | Built | Tested |
|---|---|---|
| Market never slides: only the taken tile and token refill in place, pairs stay as dealt (rules check WRONG) | engine.js endTurn | rules-a-test "market: untaken pairs keep their slots", "taken slot is refilled in place"; rules-test market-pairs-stay |
| Nature-token (acorn) supply capped at 25; spent ones go back (rules check MISSING) | engine.js newGame acornPool, keystone award checks the pool | rules-a-test "acorn supply starts at 25"; rules-test acorn-supply-25 |
| Solo: remove the pair furthest from the stacks, the rest slide TOWARD the stacks, refill at the far end (rules check SIMPLIFIED, now matched; stacks = left) | engine.js endTurn (solo) | rules-a-test "solo: survivors slide toward the stacks", "rightmost removed, refills enter at the right" |
| Bear A: groups of exactly 2; 1-4+ pairs = 4/11/19/27; trio and single = 0 | engine.js scoreAnimal, data.js | rules-a-test: table + 1..5 pairs, single, trio |
| Elk A: straight lines, each elk in one line; 1-4 = 2/5/9/13 (5 in a row = 4 + 1) | engine.js (greedy longest first, documented) | rules-a-test: table + lines 1..5, second axis |
| Salmon A: runs where each salmon touches at most 2; 1-7+ = 2/5/8/12/16/20/25; forks score 0; runs add | engine.js | rules-a-test: table + runs 1..8, fork, two runs |
| Hawk A: hawks touching no hawk; 1-8+ = 2/5/8/11/14/18/22/26 | engine.js | rules-a-test: table + 1..9 lone, touching pair |
| Fox A: 1 point per different animal next to each fox (foxes count as a kind) | engine.js | rules-a-test: repeats, five kinds, lonely fox |
| Corridors: 1 point per tile in the largest joined area (matching edges); majority bonus 2p 2 / tie 1, 3-4p 3 and 1, solo +2 at 7+ | engine.js corridor, bonus | rules-test corridor + 3p majority cases |
| 4 alike wipe automatically, 3 alike optional once per turn; acorn = free pick or wipe any tokens | engine.js apply/overpop | rules-test invariants over 240 games |
| Default game uses card set A only; B-D behind "Variant cards (house tables)" (setup), Story follows the same switch | ui.js setup + newGame, campaign.js | rules-a-test "default game uses card set A" |
| Tie-break: most acorns, then shared win; 1 point per unused acorn | engine.js finish/final | rules-test |

Still simplified (documented in the Rules drawer): our own tile animal set; elk lines counted longest first; variant card tables are house tables.
