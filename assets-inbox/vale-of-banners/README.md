# Inbox: vale-of-banners

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (92)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bg-map.webp` | 1600x1000 | 16:10 | no | Story map background (cover) | wiring |
| `bg-table.webp` | 1600x1000 | 16:10 | no | Table backdrop behind the boards (cover) | wiring |
| `bg-title.webp` | 1600x1000 | 16:10 | no | Title screen background (cover) | wiring |
| `board-estate.webp` | 1024x1024 | 1:1 | no | Player's estate mat, hex board (cover) | wiring |
| `board-market.webp` | 1600x1000 | 16:10 | no | Central market board (cover) | wiring |
| `boss-cass.webp` | 512x512 | 1:1 | no | Cass boss portrait (cover) | wiring |
| `boss-hask.webp` | 512x512 | 1:1 | no | Hask boss portrait (cover) | wiring |
| `boss-ivo.webp` | 512x512 | 1:1 | no | Ivo boss portrait (cover) | wiring |
| `die-white.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Die token (contain) | wiring |
| `fx-chain.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Chain action ribbon trail (contain) | wiring |
| `fx-coin.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Coin sparkle (contain) | wiring |
| `fx-region-complete.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Region complete burst (contain) | wiring |
| `goods-1.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Wool goods token (contain) | wiring |
| `goods-2.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Cheese goods token (contain) | wiring |
| `goods-3.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Honey goods token (contain) | wiring |
| `goods-4.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Cider goods token (contain) | wiring |
| `goods-5.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Linen goods token (contain) | wiring |
| `goods-6.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Salt goods token (contain) | wiring |
| `icon-backlane.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Backlane icon (contain) | wiring |
| `icon-points.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Points icon (contain) | wiring |
| `icon-season.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Season icon (contain) | wiring |
| `icon-silver.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Silver icon (contain) | wiring |
| `icon-storage.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Storage icon (contain) | wiring |
| `icon-track.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Track icon (contain) | wiring |
| `icon-workers.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Workers icon (contain) | wiring |
| `portrait-cass.webp` | 512x512 | 1:1 | no | Cass Ferrow portrait (cover) | wiring |
| `portrait-hask.webp` | 512x512 | 1:1 | no | Lord Haskel portrait (cover) | wiring |
| `portrait-ivo.webp` | 512x512 | 1:1 | no | Ivo Grath portrait (cover) | wiring |
| `portrait-marla.webp` | 512x512 | 1:1 | no | Marla Venn portrait (cover) | wiring |
| `portrait-odo.webp` | 512x512 | 1:1 | no | Old Odo portrait (cover) | wiring |
| `portrait-wren.webp` | 512x512 | 1:1 | no | Wren portrait (cover) | wiring |
| `tile-back.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Face-down tile in market and storage (contain) | wiring |
| `tile-barge.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Barge tile (contain) | wiring |
| `tile-bld-carp.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Joiner's Yard building tile (contain) | wiring |
| `tile-bld-chapel.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Bell Chapel building tile (contain) | wiring |
| `tile-bld-hall.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Moot Hall building tile (contain) | wiring |
| `tile-bld-inn.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Drovers' Inn building tile (contain) | wiring |
| `tile-bld-mint.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Counting House building tile (contain) | wiring |
| `tile-bld-mkt.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Fair Green building tile (contain) | wiring |
| `tile-bld-store.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Granary building tile (contain) | wiring |
| `tile-bld-tower.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Beacon Tower building tile (contain) | wiring |
| `tile-keep.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Keep tile (contain) | wiring |
| `tile-lore-k1.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Drover's Almanac (contain) | wiring |
| `tile-lore-k10.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Charter of Guilds (contain) | wiring |
| `tile-lore-k11.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Shepherd's Psalter (contain) | wiring |
| `tile-lore-k12.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Purse Strings (contain) | wiring |
| `tile-lore-k13.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Dockhand's Pact (contain) | wiring |
| `tile-lore-k14.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Harbour Toll (contain) | wiring |
| `tile-lore-k15.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Seam Map (contain) | wiring |
| `tile-lore-k16.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Steady Hands (contain) | wiring |
| `tile-lore-k17.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Moot (contain) | wiring |
| `tile-lore-k18.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Joiners (contain) | wiring |
| `tile-lore-k19.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Bells (contain) | wiring |
| `tile-lore-k2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Merchant's Ledger (contain) | wiring |
| `tile-lore-k20.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Fair (contain) | wiring |
| `tile-lore-k21.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Drovers (contain) | wiring |
| `tile-lore-k22.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Counters (contain) | wiring |
| `tile-lore-k23.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Beacons (contain) | wiring |
| `tile-lore-k24.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Granaries (contain) | wiring |
| `tile-lore-k25.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Tradebook (contain) | wiring |
| `tile-lore-k26.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Bestiary (contain) | wiring |
| `tile-lore-k3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Weigher's Scale (contain) | wiring |
| `tile-lore-k4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Pilot's Chart (contain) | wiring |
| `tile-lore-k5.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Delver's Lamp (contain) | wiring |
| `tile-lore-k6.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Carter's Rule (contain) | wiring |
| `tile-lore-k7.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Mason's Rule (contain) | wiring |
| `tile-lore-k8.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Larder Plans (contain) | wiring |
| `tile-lore-k9.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Smuggler's Wink (contain) | wiring |
| `tile-mine.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Mine tile (contain) | wiring |
| `tile-pas-goat-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 goats (contain) | wiring |
| `tile-pas-goat-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 goats (contain) | wiring |
| `tile-pas-goat-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 goats (contain) | wiring |
| `tile-pas-goose-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 geese (contain) | wiring |
| `tile-pas-goose-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 geese (contain) | wiring |
| `tile-pas-goose-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 geese (contain) | wiring |
| `tile-pas-pig-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 pigs (contain) | wiring |
| `tile-pas-pig-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 pigs (contain) | wiring |
| `tile-pas-pig-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 pigs (contain) | wiring |
| `tile-pas-sheep-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 sheep (contain) | wiring |
| `tile-pas-sheep-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 sheep (contain) | wiring |
| `tile-pas-sheep-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 sheep (contain) | wiring |
| `token-banner-0.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Crimson seat banner token (contain) | wiring |
| `token-banner-1.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Azure seat banner token (contain) | wiring |
| `token-banner-2.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Saffron seat banner token (contain) | wiring |
| `token-banner-3.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Violet seat banner token (contain) | wiring |
| `token-points.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Points token (contain) | wiring |
| `token-silver.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Silver token (contain) | wiring |
| `token-worker.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Worker token (contain) | wiring |
| `ui-result-lose.webp` | 1200x800 | 3:2 | no | Defeat result screen backdrop (cover) | wiring |
| `ui-result-win.webp` | 1200x800 | 3:2 | no | Victory result screen backdrop (cover) | wiring |
| `ui-scroll.webp` | 800x500 | 8:5 | yes (flat white background, we key it) | Parchment scroll behind story lines (contain) | wiring |
| `ui-tile-frame.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Ornate frame around the big tile view (contain) | wiring |
