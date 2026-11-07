# rampart-and-vine: rules check

Adapts: the classic tile-laying game with followers on roads, towns, monasteries and fields (current-edition scoring), with three expansions: a river start (12 tiles), a tavern/cathedral set (18 tiles, large follower, sixth colour), and a goods/builder/pig set (24 tiles).

Sources checked
- Rule summaries and fan-site rule texts from web search (builder, goods, pig, river, tavern/cathedral zero-scoring). Official rule text for the base game and the expansion-1 rulebook PDFs (host: 1jour-1jeu.com "expansion 1 rulebook PDF", a publisher CDN "expansion 1 rules PDF") were found but not text-extracted; I relied on search snippets plus my knowledge of the published rules. Confidence: high for base scoring and tile counts, med for expansion edge cases.
- games-src/carc/game/rules-notes.md, src/engine.js (read in full), src/data.js (tile table, counted by script).

Counts: WRONG 0, MISSING 1, SIMPLIFIED 4

## Matches the published rules (checked, no action)
- Base set: 72 tiles; I counted all 24 geometries against the published distribution (2 monastery+road, 4 monastery, 1 full town with banner, 4 start-type, 5 one-side town, 2 band with banner, 1 band, 3 opposite towns, 2 adjacent towns, 3+3 town-and-curve, 3 town-and-three-roads, 2+3 corner town variants, 1+3 three-side towns, 2+1 three-side town with road, 8 straight, 9 curve, 4 T-junction, 1 crossroads). All counts match.
- River set: 12 tiles (spring, lake, 10 others). Tavern set: 18 tiles with 2 cathedral tiles and 6 inn tiles, one large follower per player. Goods set: 24 tiles with 9 wine, 6 grain, 5 cloth symbols; one builder and one pig per player. All match.
- 7 followers per player; 2-5 players base, sixth colour only with the tavern set. engine.js:41, :31.
- Scoring: road 1/tile; completed town 2/tile + 2/banner (2-tile town = 4); monastery 9 complete, 1 + neighbours incomplete; incomplete town 1/tile + 1/banner; field 3 per completed town; ties share full points; large follower counts 2, builder and pig count 0; farmers never return. engine.js:155-165.
- Tavern/cathedral: inn road 2/tile complete, 0 incomplete; cathedral town 3/tile + 3/banner complete, 0 incomplete.
- Goods: whoever places the completing tile takes the goods (followers not needed); end bonus 10 per type to the player(s) with the most. Pig adds 1 per town (4 total) to the field majority holder. Builder can only go on a road/town already holding the owner's follower; extra turn does not chain; none when the stack is empty.
- River: spring first, lake last, the other river tiles in between; start tile shuffled into the stack; no U-turn (a curve may not bend the same way as the previous curve). Unplaceable normal tile is set aside and a new one drawn.
- Monastery completion is checked for the placed tile and for all 8 neighbours. A tile counts once per feature.

## Findings
| Class | Code | What the code does | Correct rule |
|---|---|---|---|
| MISSING | engine.js (not present) | No small expansions or the abbot-type garden scoring; the notes list the garden tiles as plain tiles with a garden drawing. | The garden tiles belong to an abbot expansion; in the base game they are ordinary tiles. No effect on the base rules. |
| SIMPLIFIED | engine.js:44-49 | Player 1 always starts, turn order is seat order. | Start player is chosen freely (often the youngest). |
| SIMPLIFIED | engine.js:99 (discard) | An unplaceable normal tile is removed and logged, and another is drawn. | Same (current rule). Listed for completeness. |
| SIMPLIFIED | engine.js:137-139 | Builder bonus is granted when the placed tile extends the feature holding the builder, even if that same tile completes the feature (and the builder goes home). | Community sources disagree: some say the extra turn still counts, others (annotated rules) say no extra turn if the feature is completed by the tile. Not settled; the code takes the generous reading. |
| SIMPLIFIED | rules-notes.md #4-6 | Four tile details (a river bend tile's banner, a tavern-set band tile, four goods-set field splits) follow open-source tile sets where those disagree. | The printed tiles are the authority; cannot verify here. |

## Not verified
- Whether the builder's extra turn applies when its tile completes the feature (see above). Confidence in a final answer: low.
- Tile detail for the tavern-set tile with four separate town edges (IC_CCCCG): whether it has the garden in the middle and four unconnected towns. Low.
- Exact composition of the river set (which of the 10 non-end tiles are curves, straights, crossings). Total of 12 matches; per-type list low.
- Edition drift: a 2025 reprint reportedly rewords incomplete tavern/cathedral scoring; not verifiable (notes already flag it).
- Rules for the AI levels are not rules; not checked.

## W391
- MISSING builder extra turn when the placed tile completes the feature: sources disagree, no verdict, left as is (generous reading). Garden tiles belong to an abbot expansion that is not part of this game; no engine change.
- SIMPLIFIED: see the rules drawer.
