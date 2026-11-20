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
| Special tiles (cards that place them) | 9 cards | [unverified] ~11 | |
| Milestones | 5 (claim max 3, 8 credits, 5 VP) | 5 | Steward TR 34, Founder 3 cities, Grower plant prod 4, Engineer 7 building, Navigator 5 space |
| Awards | 5 (fund max 3 at 8/14/20; 5 VP to leader) | 5 | Surveyor tiles, Financier credit prod, Visionary science tags, Stoker heat, Prospector steel+ti prod |
| Temperature track | -30..+8°C, 2° steps, bonuses at -24, -20, 0 | same | |
| Oxygen track | 0..14%, bonus at 8% | same | |
| TR start | 20 | 20 | |
| Standard projects | sell 1, power 11, comet 14, aquifer 18, greenery 23, city 25 | same costs | |
| Players | 2 (you vs computer) | 1-5 | |
