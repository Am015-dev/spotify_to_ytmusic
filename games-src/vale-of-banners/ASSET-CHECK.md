# Vale of Banners: asset check

Every id the rules and story use, computed by `games-src/vale-of-banners/asset-check.py` (reads `src/data.js`, `assets.json` and the flow prompt files). Rerun: `python3 games-src/vale-of-banners/asset-check.py --md`.

| id | stem | in assets.json | prompted in flow file |
|---|---|---|---|
| Keep tile | tile-keep | yes | yes |
| Mine tile | tile-mine | yes | yes |
| Barge tile | tile-barge | yes | yes |
| Tile back | tile-back | yes | yes |
| Building: Moot Hall | tile-bld-hall | yes | yes |
| Building: Joiner's Yard | tile-bld-carp | yes | yes |
| Building: Bell Chapel | tile-bld-chapel | yes | yes |
| Building: Fair Green | tile-bld-mkt | yes | yes |
| Building: Drovers' Inn | tile-bld-inn | yes | yes |
| Building: Counting House | tile-bld-mint | yes | yes |
| Building: Beacon Tower | tile-bld-tower | yes | yes |
| Building: Granary | tile-bld-store | yes | yes |
| Lore: Drover's Almanac | tile-lore-k1 | yes | yes |
| Lore: Merchant's Ledger | tile-lore-k2 | yes | yes |
| Lore: Weigher's Scale | tile-lore-k3 | yes | yes |
| Lore: Pilot's Chart | tile-lore-k4 | yes | yes |
| Lore: Delver's Lamp | tile-lore-k5 | yes | yes |
| Lore: Carter's Rule | tile-lore-k6 | yes | yes |
| Lore: Mason's Rule | tile-lore-k7 | yes | yes |
| Lore: Larder Plans | tile-lore-k8 | yes | yes |
| Lore: Smuggler's Wink | tile-lore-k9 | yes | yes |
| Lore: Charter of Guilds | tile-lore-k10 | yes | yes |
| Lore: Shepherd's Psalter | tile-lore-k11 | yes | yes |
| Lore: Purse Strings | tile-lore-k12 | yes | yes |
| Lore: Dockhand's Pact | tile-lore-k13 | yes | yes |
| Lore: Harbour Toll | tile-lore-k14 | yes | yes |
| Lore: Seam Map | tile-lore-k15 | yes | yes |
| Lore: Steady Hands | tile-lore-k16 | yes | yes |
| Lore: Roll of the Moot | tile-lore-k17 | yes | yes |
| Lore: Roll of the Joiners | tile-lore-k18 | yes | yes |
| Lore: Roll of the Bells | tile-lore-k19 | yes | yes |
| Lore: Roll of the Fair | tile-lore-k20 | yes | yes |
| Lore: Roll of the Drovers | tile-lore-k21 | yes | yes |
| Lore: Roll of the Counters | tile-lore-k22 | yes | yes |
| Lore: Roll of the Beacons | tile-lore-k23 | yes | yes |
| Lore: Roll of the Granaries | tile-lore-k24 | yes | yes |
| Lore: Tradebook | tile-lore-k25 | yes | yes |
| Lore: Bestiary | tile-lore-k26 | yes | yes |
| Pasture: 2 Sheep | tile-pas-sheep-2 | yes | yes |
| Pasture: 3 Sheep | tile-pas-sheep-3 | yes | yes |
| Pasture: 4 Sheep | tile-pas-sheep-4 | yes | yes |
| Pasture: 2 Goats | tile-pas-goat-2 | yes | yes |
| Pasture: 3 Goats | tile-pas-goat-3 | yes | yes |
| Pasture: 4 Goats | tile-pas-goat-4 | yes | yes |
| Pasture: 2 Pigs | tile-pas-pig-2 | yes | yes |
| Pasture: 3 Pigs | tile-pas-pig-3 | yes | yes |
| Pasture: 4 Pigs | tile-pas-pig-4 | yes | yes |
| Pasture: 2 Geese | tile-pas-goose-2 | yes | yes |
| Pasture: 3 Geese | tile-pas-goose-3 | yes | yes |
| Pasture: 4 Geese | tile-pas-goose-4 | yes | yes |
| Goods: Wool | goods-1 | yes | yes |
| Goods: Cheese | goods-2 | yes | yes |
| Goods: Honey | goods-3 | yes | yes |
| Goods: Cider | goods-4 | yes | yes |
| Goods: Linen | goods-5 | yes | yes |
| Goods: Salt | goods-6 | yes | yes |
| Cast: Wren | portrait-wren | yes | yes |
| Cast: Old Odo | portrait-odo | yes | yes |
| Cast: Cass Ferrow | portrait-cass | yes | yes |
| Cast: Lord Haskel | portrait-hask | yes | yes |
| Cast: Marla Venn | portrait-marla | yes | yes |
| Cast: Ivo Grath | portrait-ivo | yes | yes |
| Boss: Cass Ferrow | boss-cass | yes | yes |
| Boss: Lord Haskel | boss-hask | yes | yes |
| Boss: Ivo Grath | boss-ivo | yes | yes |
| Seat banner: Crimson | token-banner-0 | yes | yes |
| Seat banner: Azure | token-banner-1 | yes | yes |
| Seat banner: Saffron | token-banner-2 | yes | yes |
| Seat banner: Violet | token-banner-3 | yes | yes |
| Estate mat | board-estate | yes | yes |
| Market board | board-market | yes | yes |
| Title background | bg-title | yes | yes |
| Table background | bg-table | yes | yes |
| Story map | bg-map | yes | yes |
| Worker token | token-worker | yes | yes |
| Silver token | token-silver | yes | yes |
| Points token | token-points | yes | yes |
| White die | die-white | yes | yes |
| Icon: workers | icon-workers | yes | yes |
| Icon: silver | icon-silver | yes | yes |
| Icon: points | icon-points | yes | yes |
| Icon: storage | icon-storage | yes | yes |
| Icon: back lane | icon-backlane | yes | yes |
| Icon: season | icon-season | yes | yes |
| Icon: banner track | icon-track | yes | yes |
| Tile frame | ui-tile-frame | yes | yes |
| Win screen | ui-result-win | yes | yes |
| Lose screen | ui-result-lose | yes | yes |
| Story scroll | ui-scroll | yes | yes |
| FX region complete | fx-region-complete | yes | yes |
| FX chain | fx-chain | yes | yes |
| FX coin | fx-coin | yes | yes |

## Script output (summary)

```
required: 92
prompted: 92
gaps: 0
extra stems in assets.json not in rules: none
```
