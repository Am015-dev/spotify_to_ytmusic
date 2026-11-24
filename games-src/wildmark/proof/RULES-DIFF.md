# Wildmark rules diff (W650)

Our names only. "Published" = the published rulebook as summarised in `rules-notes.md` (checked against online rules references
7 and 8 Nov; this pass re-checked the digital edition's store text: take a tile + animal, place both, keystone animal = acorn, acorns
widen choices and score 1 each). Test = case in `rules-test.js` (W650 lines are new this pass).

| # | Rule | Published | Ours | Status | Test |
|---|------|-----------|------|--------|------|
| 1 | Components | 85 tiles (25 keystones), 5 starter triads, 100 animals (20 x 5), 25 acorns | same | MATCH | acorn-supply-25 |
| 2 | Tile supply | 20 per player + 3; solo 43 | 43 / 43 / 63 / 83 | MATCH | W650 tile supply |
| 3 | Starter | each player one starter triad | same | MATCH | every seat 23 tiles at end |
| 4 | Market | 4 face-up tile + animal pairs | same | MATCH | market-pairs-stay |
| 5 | Setup wipe | four alike in the opening market are wiped and redrawn | same (shared overpop) | MATCH | W650 setup wipe |
| 6 | Four alike | wiped by itself, redrawn, repeat; wiped animals go back after the draw | same | MATCH | AI games + invariants |
| 7 | Three alike | may sweep once per turn, drawn before the three go back | same | MATCH | wipe3 offered / once |
| 8 | Acorn: free pick | spend 1: any tile + any animal | same | MATCH | market-pairs-stay |
| 9 | Acorn: replace | spend 1: replace any number of animals; may repeat in a turn | same | MATCH | W650 acorn replace again |
| 10 | Take | take one pair, the pair stays as dealt | same | MATCH | market-pairs-stay |
| 11 | Place tile | must touch your valley, any rotation | same | MATCH | W650 tile must touch |
| 12 | Place animal | only on a tile that shows it, one per tile, never moves | same | MATCH | W650 shows it / one per tile |
| 13 | Return animal | may always return it to the bag | same | MATCH | W650 may go back |
| 14 | Keystone | animal on a keystone earns an acorn (supply 25) | same | MATCH | keystone acorn |
| 15 | Refill | refill taken slots from the stacks | same | MATCH | market-pairs-stay |
| 16 | Game end | stack empty = 20 turns each | 20 turns each | MATCH | every seat 20 turns |
| 17 | Bear | groups of exactly 2: 1-4 pairs = 4 / 11 / 19 / 27 | same | MATCH | bear pair / triple / two pairs |
| 18 | Elk | straight lines, each elk in one line: 2 / 5 / 9 / 13 | same | MATCH | elk line 3 / bent 7 |
| 19 | Salmon | runs, each touches at most 2 salmon: 2,5,8,12,16,20,25 | same | MATCH | salmon run 3 / blob 0 |
| 20 | Hawk | hawks touching no hawk: 2,5,8,11,14,18,22,26 | same | MATCH | one lone hawk |
| 21 | Fox | 1 per different animal next to it (foxes count) | same | MATCH | fox 3 + other fox |
| 22 | Habitats | largest joined group per land, edges must match | same | MATCH | corridor through split edge |
| 23 | Majority 2p | biggest +2, tie 1 each | same | MATCH | bonus cases |
| 24 | Majority 3-4p | 3 / 1; tie first 2 each (3+ way 1 each), no second after a tie | same | MATCH | tie first 2/2, 3-way 1 |
| 25 | Solo bonus | +2 per land group of 7+ | same | MATCH | bonus cases |
| 26 | Solo removal | far tile + animal leave the game, rest slide to the stacks | same | MATCH | W650 solo x2 |
| 27 | Acorns at end | 1 point each | same | MATCH | final scoring |
| 28 | Tie-break | most acorns, else shared | same | MATCH | final scoring |
| 29 | Card sets B-D | variant cards | implemented (Quick "Mixed B-D", Story act 3) | MATCH | R113 / R115 |

No mismatches found this pass; 9 new cases make every rule above tested. `node rules-test.js 20`: PASS.
