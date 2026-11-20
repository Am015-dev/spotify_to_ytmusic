# Meadowfold rules checklist (each line = a rule and where it is proven)

| Rule | Proof |
|---|---|
| 120 tokens: 23/23/21/19/19/15 | rules-test "token counts per colour", "120 tokens" |
| 32 animal cards, 10 spirits, one home hex each, 2-5 cubes | rules-test "32 animal cards", "every card" |
| Side A 23 hexes, side B 25 hexes | rules-test "side A/B" |
| 5 pockets of 3, 5 face-up cards (solo 3 and 3) | rules-test "5 pockets of 3", "solo: 3 pockets" |
| Take one pocket, place all 3 | rules-test "take a pocket", "only one pocket", "cannot end with tokens in hand"; scn mf-board, mf-place |
| One card per turn, max 4 unfinished | rules-test "one card per turn", "at most 4 cards" |
| Water/field never stack | rules-test "water/field never stack"; scn mf-stack (water hex not glowing) |
| Mountains to 3 | rules-test "mountains up to 3"; scn mf-stack |
| Trunks 2 max, leaves on 0-2 trunks | rules-test "two trunks max", "leaves on 0-2 trunks" |
| Building on one grey/trunk/red | rules-test "building on one grey/trunk/red", "nothing on leaves or buildings" |
| Cube blocks stacking | rules-test "an animal blocks stacking" |
| Habitat match, rotation, exact heights, one cube per hex, shared tokens | rules-test "card pattern matches (rotated)", "tree height must match", "one animal per hex", "one token in several habitats"; scn mf-animal |
| Card score = highest uncovered value | rules-test "card score = highest revealed slot"; scn mf-animal |
| Trees 1/3/7; mountains 1/3/7 next to a mountain | rules-test "trees", "mountains score only next to a mountain" |
| Fields 5 per group of 2+ | rules-test "fields" |
| Buildings 5 with 3+ colours, lone red not a building | rules-test "building with 3 colours", "1 colour", "lone red" |
| River table and longest path | rules-test "river of 5 = 11", "river table" |
| Islands 5 each, minimum 1 | rules-test "side B" x2 |
| Spirit bonuses (rulebook examples) | rules-test "field spirit 14", "mountain spirit" x2 |
| End: 2 or fewer empty hexes, finish the round | rules-test "two empty hexes: the round finishes first", "game ends after the last player" |
| Full games 1-4 players, both sides, spirits, every move legal, 120 tokens conserved | rules-test gauntlet (E.check after every move) |
| Rival turn plays and passes back | scn mf-rival |
