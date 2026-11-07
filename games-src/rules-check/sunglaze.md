# sunglaze: rules check

Adapts: a two-to-four player tile-drafting and wall-building game (factory displays, pattern lines, a 5x5 wall, a floor line), with the official gray-wall variant and the official joker-tile promo.

Sources checked
- Publisher rulebook (EN) mirrored on tesera.ru and cdn.1j1ju.com (rulebook PDF); gray-side variant text as quoted in search results.
- Joker-tile promo rules: ultraboardgames.com joker-tiles page (full rule text); tesera.ru joker-tiles PDF (listed, not opened).
- Project notes: the sunglaze source dir per scripts/build-all.py (game/rules-notes.md). Engine read: game/src/engine.js (122 lines) and data.js.

WRONG 0, MISSING 0, SIMPLIFIED 3 (all documented, all outside the base rules)

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| SIMPLIFIED-ON-PURPOSE | engine.js newGame / rules-notes.md "Left out" | The two-sided-board expansion (boards C and D with pre-coloured spaces, different bonuses) is not offered | Expansion only. Positions of the coloured spaces were not reachable by the previous worker. Not part of the base game |
| SIMPLIFIED-ON-PURPOSE | rules-notes.md "Left out" | The special-factories promo is not offered | Promo only, powers undocumented in reachable sources |
| SIMPLIFIED-ON-PURPOSE | engine.js:29 / assumption 6 | If nobody takes from the courtyard in a round, the sun token stays and the same player starts again | Edge case the rulebook does not spell out; harmless |

## Verified correct (high confidence unless noted)
- 100 tiles, 20 per colour; 5/7/9 kilns of 4 tiles for 2/3/4 players (data.js:8-10).
- Wall layout: each row shifted one step from the row above (wall[r][c] = colour (c-r) mod 5) (data.js:14).
- Floor penalties -1 -1 -2 -2 -2 -3 -3, maximum -14; score never below 0 (data.js:11, engine.js:82).
- Taking: all tiles of one colour from one place; remaining kiln tiles go to the courtyard; first taker from the courtyard gets the sun token on the first free floor space and starts next round (applyTake, scoreFloors).
- Pattern line rules: one colour per line, never a colour the matching wall row already has, overflow to floor then box lid, floor-only choice allowed, no passing (lineOk, legalTakes).
- Wall-tiling scoring: lone tile = 1; otherwise row run (if 2+) plus column run (if 2+) (adjPts, engine.js:65). Rest of a full line to the lid.
- Refill: when the sack is empty the lid is poured back in; kilns stay short if both are empty (draw, newRound).
- End: after the wall-tiling of the round in which any player completes a horizontal row; bonuses +2 row, +7 column, +10 colour; ties broken by most complete rows, then shared (finish, data.js:12).
- Gray wall variant: free choice of space in the row, no colour repeated in a row or column; a full line with no legal space drops everything to the floor (wallCells, lineToFloor). Matches the quoted variant text.
- Joker promo: counts removed/added per player count (1+5 for two players, 2+10 for three or four); take all jokers of a place alone or together with all tiles of one other colour; a line holds one colour plus jokers; joker moves to the wall (to the line colour's space, or any free space in the row if the line is all jokers); a joker blocks its colour for that row; jokers count as no colour for the +10 bonus (PRISMSET, takeSets, placeWall, endBonus). Matches the full rule text.

## Not verified
- Floor-space handling of the sun token when the floor already holds 7 tiles (assumption 2 in the notes). Confidence low that the rulebook says anything; effect is zero on penalty.
- Gray-wall interaction with jokers (assumption 5: a joker from a coloured line counts as that colour for the no-repeat rule). A forum thread cited in search results says the sources conflict. Confidence low.
- Rack-choice rule on the gray wall (assumption 8: a player may fill a line even if all legal columns are blocked, tiles then drop to the floor). Rulebook text for this exact case not seen. Confidence low.
- Starting player of round 1 is random; the rulebook names a specific person. Immaterial.
