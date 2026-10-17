# Rampart & Vine — rules notes (research file)

Faithful browser version of the original game (2000) with its river expansion and first two expansions
(The Riverlands, Taverns & Basilicas, Merchants & Masons). The page uses only our own names, text and code-drawn art.

**Edition followed:** the current ("3rd edition", 2014+ printings) rules — farms scored per field at
3 per completed adjacent city, a completed 2-tile city scores 4, pig +1 per city (4 total).
Tile geometry and counts: `../tiles.json` (from an open-source implementation's tile XML, validated against two other open-source
tile sets by `../validate.py`). `src/gen_data.py` turns it into `src/data.js`.

## Page names
| Page |
|---|
| Rampart & Vine |
| follower (wayfarer / warden / brother / farmer) |
| town, banner |
| priory |
| The Riverlands |
| Taverns & Basilicas: tavern, basilica, champion |
| Merchants & Masons: goods, mason, hog |
| Garnet, Cobalt, Amber, Olive, Sable, Lilac (red, blue, yellow, green, black, grey/pink) |

## Components (counts exactly as the box)
- Base: 72 tiles incl. the start tile (24 geometries; 3rd-edition garden variants listed separately, 33 types).
- The Riverlands: 12 tiles (spring, pond/lake, 6 straight incl. crossings/city/monastery, 4 curves; 11 types).
- Taverns & Basilicas: 18 tiles (17 types; 6 inns, 2 cathedrals), 1 large follower per colour, 6th colour.
- Merchants & Masons: 24 tiles (24 types; 20 goods symbols: 9 wine, 6 grain, 5 cloth), builder + pig per colour,
  20 goods tokens.
- 7 followers per player (the 8th is the score marker, not needed on screen).

## Turn
1. Draw a tile. If it has no legal place at all it is set aside and another is drawn (logged).
2. Place it adjacent (orthogonally) to the map, rotated freely, every touching edge matching.
3. Optionally place one figure on that tile: follower or large follower on an unoccupied road / city /
   monastery / field (unoccupied = the whole merged feature has no figure); or the builder on a road/city of
   the tile whose feature already holds your follower; or the pig on a field of the tile whose field holds your farmer.
4. Score every road/city completed by the tile and any monastery (this tile or a neighbour) now surrounded.
   Majority by strength (follower 1, large 2, builder/pig 0); all tied players score in full; every figure in
   the feature returns (farmers never return). Merchants & Masons: the player who placed the completing tile takes the
   feature's goods tokens (with or without followers).
5. Builder: if the tile extended the feature holding your builder (checked when the tile is placed, before
   scoring), take one extra turn at once; the extra turn never grants another.

## Scoring
| Feature | Completed (immediately) | Incomplete at game end |
|---|---|---|
| Road | 1/tile | 1/tile |
| Road with ≥1 inn | 2/tile | 0 |
| City | 2/tile + 2/pennant (2-tile city = 4) | 1/tile + 1/pennant |
| City with ≥1 cathedral | 3/tile + 3/pennant | 0 |
| Monastery | 9 | 1 + 1 per neighbouring tile |
| Field | — | 3 per completed adjacent city (4 with own pig, if a majority holder) |
| Goods (Merchants & Masons) | — | 10 for the majority of each of wine, grain, cloth (ties: all) |

A tile counts once per feature even if the feature passes through it twice (tile set, not segments).
A city counts once per field but can pay several fields.

## Feature graph
Every road, city, field and monastery piece of each placed tile is a segment. Segments merge with union-find:
cities/roads across matching edges, fields across the two half-edges of each shared edge
(half-edge convention of tiles.json: NL,NR,EL,ER,SL,SR,WL,WR clockwise; a half 2s meets the neighbour's half
2·opp(s)+1). Each root keeps: tile set, list of open edges (`x,y,side`), pennants, goods, inn/cathedral flags,
adjacent-city segment ids (fields). A road/city is complete when its open-edge list is empty (loops included).
Tested by `graph_test.js` (77 assertions on hand-built boards) and `cover.js` (full rebuild of the graph from the
placed tiles compared with the incremental one every 25 moves; the `probe()` prediction compared with the real
merge on every placement).

## Expansions
- **The Riverlands**: spring replaces the start tile (start tile shuffled into the main stack); the other 10 river
  tiles are drawn first, then the lake. Each river tile must be placed at the river's open end with a river edge
  joining it. Edition: the first river edition (12 tiles).
- **Taverns & Basilicas**: as table; large follower counts 2 for majority; 6 players allowed.
- **Merchants & Masons**: goods (wine/grain/cloth), mason (builder), hog (pig) as above.

## Assumptions (where sources disagree or are silent)
1. **River U-turns:** implemented as "a curve may not turn the same way as the most recent curve" (straights in
   between do not reset it). This is the formalisation used by the open-source and online implementations of the official "the river must not
   turn back on itself". With it the river can never collide with itself.
2. **Unplaceable river tile:** goes back under the river pile if other river tiles remain, else set aside. Never
   happened in 2 000+ river placements (the rule makes every river tile placeable).
3. **Unplaceable normal tile:** removed from the game and a new one drawn (current rule); it is shown in the log.
4. **River tile with a city on the bend (RI_1_CcII)**: no pennant (open-source implementation, first river edition); a second open-source tile set shows one. Kept the first.
5. **Taverns & Basilicas city band with two roads (IC_CRcRp)**: has a pennant (both open-source tile sets).
6. **Merchants & Masons field details** on TB_CR, TB_RRC, TB_RRrr, TB_CcRC_c/_g: open-source implementation version kept (see tiles.json notes); the
   drawings reproduce exactly those field splits (`geo_test.js`: 85/85 tiles, 0 errors, 0 adjacency warnings).
7. **Incomplete inn road / cathedral city at game end = 0** (long-standing rule; a 2025 printing reportedly
   rewords this, not verifiable).
8. **Builder:** may be placed where you only have your large follower; the bonus is checked when the tile is
   placed; the extra turn happens even if the extending tile completed (and thus returned) the builder; no
   extra turn when the bag is empty.
9. **Pig:** only pays if its owner is a majority holder of that field.
10. **Goods tokens** are taken even when the city has no followers; token supply equals the symbols so it never
    runs out.
11. **Start player:** seat 1 (Garnet) starts; turn order is seat order.
12. **Garden tiles** (3rd-edition art for the Abbot) are kept as separate tile types with the same function;
    they show a small herb garden only.
13. **Fields at the edge of the map**: a field only continues through a shared edge; unplaced neighbours do not
    join fields (standard).

## Not included
The Abbot, the Princess & Dragon, and other expansions. Online play. Undo of a confirmed tile (the tile is
confirmed explicitly with a ghost preview instead).
