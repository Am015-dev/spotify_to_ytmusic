# Meadowfold rules diff (24 Nov 2026)

Source: the publisher's current English rulebook PDF (read in full this round, text extracted locally, nothing copied into the repo).
Our names only. Result: every rule MATCHES; nothing to fix, so no new rule tests (the existing 62 quick / 86 full rules-test checks cover each line).

**Scope note.** The brief listed habitat tiles, wildlife tokens, a 4+4 offer, nature tokens, overpopulation, keystone tiles, corridors and
25 wildlife cards, plus a store page as the screen reference. Those belong to a different game: the habitat-tile-and-wildlife game,
which the shelf already adapts as **Wildmark**. Meadowfold adapts the stacked-landscape-token-and-animal-card game. Rewriting Meadowfold
to the brief's list would have made a second Wildmark and thrown Meadowfold's own game away, so the diff below checks Meadowfold against
its own source. The brief's rows are listed at the end as N/A.

| Rule | Published | Ours | Status |
|---|---|---|---|
| Tokens | 120: 23 blue, 23 grey, 21 brown, 19 green, 19 yellow, 15 red | same (MF.BAG) | MATCH |
| Cards and cubes | 32 animal cards, 10 spirit cards, 75 animal cubes, 4 spirit cubes | same | MATCH |
| Central board | 5 spaces of 3 random tokens (solo side: 3 spaces) | same | MATCH |
| Animal row | 5 face-up cards (solo 3), refilled at the end of each turn | same | MATCH |
| Board sides | everyone uses the same side; A river, B islands; side A for a first game | same; tutorial uses A | MATCH |
| Spirits (variant) | deal 2 each; on your first turn keep 1 with its cube, return the other | same | MATCH |
| Turn order | any order: take tokens (mandatory, once), take 1 card (optional, once), place cubes (optional, unlimited); optional actions may sit between token placements | same | MATCH |
| Take tokens | take all 3 tokens from one space and place all 3 | same; End turn locked until the hand is empty | MATCH |
| Placement | any token on an empty hex; stack only to make trees, buildings, mountains; never under a token; never on a cube | same (E.canStack) | MATCH |
| Mountains | stack of 1-3 grey | same | MATCH |
| Trees | green on 0, 1 or 2 brown | same | MATCH |
| Buildings | red on one grey, brown or red | same | MATCH |
| Water, fields | never stacked, nothing on top | same | MATCH |
| Card limit | at most 4 unfinished cards (an unsettled spirit counts); a finished card leaves the limit | same | MATCH |
| Settling | habitat exactly as on the card, any rotation; tree and mountain heights exact; the home token must be free; buildings of any base; take the bottom-most cube | same | MATCH |
| Shared tokens | one token may be part of several habitats | same | MATCH |
| End of turn | refill the emptied space from the pouch; refill the animal row to 5 | same | MATCH |
| End trigger | the pouch cannot refill the board, or a player ends a turn with 2 or fewer empty hexes; finish the round so turns are equal | same | MATCH |
| Trees score | by height 1 / 3 / 7 | same | MATCH |
| Mountains score | by height 1 / 3 / 7; 0 unless touching another mountain | same | MATCH |
| Fields score | 5 per group of 2+ touching yellow tokens | same | MATCH |
| Buildings score | 5 if at least 3 different colours touch it, else 0 | same | MATCH |
| River (side A) | longest river along the shortest path end to end: 2, 5, 8, 11, 15, then +4 per token past the 6th; only the best river | same (E.riverPts) | MATCH |
| Islands (side B) | 5 per land area split off by water; at least 1 | same | MATCH |
| Animal card score | the highest uncovered number; a full card scores 0 | same | MATCH |
| Spirit score | its bonus, on top of normal scoring, only if settled | same, 10 bonuses | MATCH |
| Winner, tiebreak | most points; tie = most animal cubes placed; still tied = shared | same (spirit cube not counted) | MATCH |
| Solo | 3 spaces, 3 cards; the other 6 tokens go to the box each turn; suns by score, side and spirit | same | MATCH |

Brief rows that belong to the other game (not in Meadowfold's source): starter habitat tiles, 85 habitat tiles, 100 wildlife tokens,
4+4 tile/token offer, nature tokens, overpopulation wipe, keystone tiles, corridor scoring and bonuses, 25 wildlife cards, 20-turn end. **N/A**.

## Tutorial coverage (src/tutor.js, gate tut-v3.js)
Screen map first (11 labelled parts, tap = one sentence, ? reopens it), then: take a pocket, place all 3, stacking (every colour), take an
animal card (once per turn, 4 limit), settle an animal (rotation, home hex free), how a card scores (highest number, one cube per hex),
end turn and refills, landscape points (trees, peaks, fields, buildings), river / islands table, spirits, end triggers and tiebreak,
then a practice game with a live "what to do now" line.
