# Ochre Horizon: components and how they map to the original

All names, card designs, effects, map geography, milestones and awards are our own; counts and structure follow the original
base game with corporate-era cards. Structure numbers from memory are marked [unverified]; rules-test.js asserts every count.

| Component | Count here | Original structure | Notes |
|---|---|---|---|
| Project cards | 208 | 208 (base + corporate era) | own designs, see data/cards.json |
| - automated (orange "Project") | 118 | [unverified] ~118 | |
| - active (teal "Lasting") | 48 | [unverified] ~48 | effects and once-per-generation actions |
| - events (pink) | 42 | [unverified] ~42 | |
| Tags (cards carrying) | building 55, space 50, science 36, power 26, earth 32, jovian 15, plant 30, microbe 16, animal 11, city 12 | [unverified] similar mix | validate.js tolerance ±3 |
| Cost bands | 0-6: 45, 7-12: 65, 13-19: 49, 20-29: 35, 30+: 14 | [unverified] | |
| Requirement types | temp, oxygen, oceans (min and max), tag counts, production, cities, greeneries | same types | |
| Card resources | microbe 10, animal 10, science 3, fighter 1 cards | [unverified] | |
| Corporations | 12 + 1 beginner | 12 corporate-era corporations + beginner | own powers; balance-tested (forced-corp gauntlet) |
| Map | 61 hexes, rows 5-6-7-8-9-8-7-6-5 | same shape | own bonus layout |
| Ocean spaces / ocean tiles | 12 / 9 | 12 / 9 | |
| Named spaces | 4 volcanic, 1 reserved city site, 2 off-map city spaces | same count and kinds | Mount Ember, Cinder Crown, Ash Throne, Red Anvil; Rift City Site; Lantern Moon Port, Far-Moon Habitat |
| Special tiles (cards that place them) | 11 cards | [unverified] ~11 | raised from 8 to 11 (R99) by giving 3 existing projects a special tile; total stays 208 |
| Milestones | 5 (claim max 3, 8 credits, 5 VP) | 5 | Our own concepts (R99 redesign): Polymath 7 different tag kinds, Landholder a city with 2 of your greeneries next to it, Quartermaster 5 kinds of production, Machinist 3 card actions, Coastkeeper 3 of your tiles next to oceans. Tuned in the gauntlet to the old claim rate: about 3 claims a game, first claim near generation 10 |
| Awards | 5 (fund max 3 at 8/14/20; 5 VP to leader) | 5 | Our own concepts (R99 redesign): Patron most VP printed on cards, Grid Keeper most energy + heat production, Collector most Lasting cards, Outfitter most steel + titanium in stock, Frontier most of your tiles on the map edge. About 3 funded a game in the gauntlet, each funded in 12-32% of games |
| Temperature track | -30..+8°C, 2° steps, bonuses at -24, -20, 0 | same | |
| Oxygen track | 0..14%, bonus at 8% | same | |
| TR start | 20 | 20 | |
| Standard projects | sell 1, power 11, comet 14, aquifer 18, greenery 23, city 25 | same costs | |
| Players | 2 (you vs computer) | 1-5 | |

## Notes (R99)
- Tags and cost bands: data/targets.json holds the targets [unverified] from memory; the table above lists the actual pool. validate.js allows ±3, so the drift (city 12 vs 15, building 55 vs 58, cost 0-6 45 vs 50, 20-29 35 vs 30) is within tolerance but not exact. The original's exact numbers are [unverified].
- Self-trigger: a card's own tags never fire its own "each time you play a tag" effect [unverified]; rules-test asserts it.
