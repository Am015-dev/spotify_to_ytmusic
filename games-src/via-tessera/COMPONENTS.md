# Via Tessera: components

Every component of the original 2-player game, its count and effect, mapped to our names. Counts are asserted by `rules-test.js`.

## Cards

| our card | role | patron | count | where | cost (goods) | effect |
|---|---|---|--:|---|---|---|
| Herald | Herald | Shield | 1 x2 players | start (each player) | none | Take your played cards back |
| Builder | Builder | Eagle | 1 x2 players | start (each player) | none | Move carts and ships, then build houses |
| Governor | Governor | Sickle | 2 x2 players | start (each player) | none | A region produces, or collect taxes |
| Trader | Trader | Wing | 1 x2 players | start (each player) | none | take 3 coins, trade 2 kinds |
| Envoy | Envoy | Eagle | 1 x2 players | start (each player) | none | Copy the rival’s last card |
| Patron | Patron | Hearth | 1 x2 players | start (each player) | none | Buy up to 2 cards from the market |
| Builder | Builder | Eagle | 1 | market deck I | 1 tools | Move carts and ships, then build houses |
| Governor | Governor | Sickle | 1 | market deck I | 1 wine | A region produces, or collect taxes |
| Trader | Trader | Wing | 1 | market deck I | 1 wine | take 5 coins, trade 2 kinds |
| Settler | Settler | Shield | 1 | market deck I | 1 grain | New carts or ships, or take coins |
| Envoy | Envoy | Sickle | 1 | market deck I | 1 tools | Copy the rival’s last card |
| Potter | maker (brick) | Owl | 1 | market deck I | 1 grain | your brick houses make 1 each; Owl 3 pts per such house |
| Reaper | maker (grain) | Owl | 1 | market deck I | 1 grain + 1 brick | your grain houses make 1 each; Owl 3 pts per such house |
| Tinker | maker (tools) | Owl | 1 | market deck I | 1 tools + 1 brick | your tools houses make 1 each; Owl 3 pts per such house |
| Builder | Builder | Eagle | 1 | market deck II | 1 tools | Move carts and ships, then build houses |
| Governor | Governor | Sickle | 1 | market deck II | 1 wine | A region produces, or collect taxes |
| Trader | Trader | Wing | 1 | market deck II | 1 wine | take 5 coins, trade 2 kinds |
| Settler | Settler | Shield | 1 | market deck II | 1 grain | New carts or ships, or take coins |
| Censor | Censor | Eagle | 1 | market deck II | 1 cloth | Buy 1 card at its printed price |
| Presser | maker (wine) | Owl | 1 | market deck II | 1 wine + 1 brick | your wine houses make 1 each; Owl 4 pts per such house |
| Dyer | maker (cloth) | Owl | 1 | market deck II | 1 cloth + 1 brick | your cloth houses make 1 each; Owl 5 pts per such house |
| Laurel | game-end card | - | 1 | to whoever ends the game | - | 7 points |
| Grand Governor | tile | - | 1 | starts with player 2 | - | doubles a Governor bonus good, then passes; wins ties |

Decks III-V of the original (15 more cards) are only used with 3-5 players and are not in a 2-player game.

## Map

- 12 regions, 30 cities (letters A 7, B 8, C 10, D 5) + the capital Caput; 44 roads and 35 sea lanes (Caput: 3 roads, 3 lanes). Each line holds one colonist.

| region | cities (letter) |
|---|---|
| I Caledra | Iscadun (A), Thamesa (A) |
| II Aurenia | Sequana (B), Garumna (B), Saltara (B) |
| III Iberra | Brigo (B), Tagora (B), Turia (B) |
| IV Silvana | Rhenum (A), Danuvia (A) |
| V Latria | Alpina (D), Aquila (D), Trinacra (D) |
| VI Numara | Byrsa (B), Rusica (B) |
| VII Carpia | Somesa (A), Savana (A), Pontica (A) |
| VIII Thessia | Illyra (D), Glaucis (D) |
| IX Syrtica | Leptara (C), Silphia (C) |
| X Anatra | Halysa (C), Pamphyla (C), Bosphora (C) |
| XI Levantia | Orontes (C), Murex (C) |
| XII Nilora | Pharia (C), Nilopolis (C), Rosaria (C) |

## Tokens and pieces

| component | count | notes |
|---|--:|---|
| city tokens | 30 | by letter: A 7 (brick, brick, food, food, tool, wine, cloth); B 8 (brick, brick, food, food, tool, tool, wine, cloth); C 10 (brick, brick, brick, food, food, tool, tool, wine, wine, cloth); D 5 (brick, food, tool, wine, cloth) [per-letter mix unverified] |
| region bonus markers | 12 in play | good side = region's best good; coin side brick 1, grain 1, tools 2, wine 2, cloth 1 [coin values unverified] |
| houses | 15 per player | |
| carts (land colonists) | 3 per player | 1 starts in Caput |
| ships (sea colonists) | 3 per player | 1 starts in Caput |
| storehouse | 12 spaces per player | goods and waiting colonists |
| goods | unlimited | brick 3, grain 4, tools 5, wine 6, cloth 7 coins |
| coins | unlimited | start 5 / 6 |

## Patrons (scoring)

| patron | scores |
|---|---|
| Hearth | 1 point per 10 coins of wealth (goods count at price), once per card showing it |
| Eagle | 1 point per house outside brick cities, once per card showing it |
| Sickle | 1 point per region with your house, once per card showing it |
| Wing | 2 points per kind of good your cities make, once per card showing it |
| Shield | 2 points per cart or ship on the map, once per card showing it |
| Owl | Points per house in cities of the card’s good, once per card showing it |
