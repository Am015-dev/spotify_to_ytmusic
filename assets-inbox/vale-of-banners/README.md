# Inbox: vale-of-banners

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (92)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bg-map.webp` | 1600x1000 | 16:10 | no | Story map background (cover) | auto |
| `bg-table.webp` | 1600x1000 | 16:10 | no | Table backdrop behind the boards (cover) | auto |
| `bg-title.webp` | 1600x1000 | 16:10 | no | Title screen background (cover) | auto |
| `board-estate.webp` | 1024x1024 | 1:1 | no | Player's estate mat, hex board (cover) | auto |
| `board-market.webp` | 1600x1000 | 16:10 | no | Central market board (cover) | auto |
| `boss-cass.webp` | 512x512 | 1:1 | no | Cass boss portrait (cover) | auto |
| `boss-hask.webp` | 512x512 | 1:1 | no | Hask boss portrait (cover) | auto |
| `boss-ivo.webp` | 512x512 | 1:1 | no | Ivo boss portrait (cover) | auto |
| `die-white.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Die token (contain) | auto |
| `fx-chain.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Chain action ribbon trail (contain) | auto |
| `fx-coin.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Coin sparkle (contain) | auto |
| `fx-region-complete.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Region complete burst (contain) | auto |
| `goods-1.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Wool goods token (contain) | auto |
| `goods-2.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Cheese goods token (contain) | auto |
| `goods-3.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Honey goods token (contain) | auto |
| `goods-4.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Cider goods token (contain) | auto |
| `goods-5.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Linen goods token (contain) | auto |
| `goods-6.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Salt goods token (contain) | auto |
| `icon-backlane.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Backlane icon (contain) | auto |
| `icon-points.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Points icon (contain) | auto |
| `icon-season.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Season icon (contain) | auto |
| `icon-silver.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Silver icon (contain) | auto |
| `icon-storage.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Storage icon (contain) | auto |
| `icon-track.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Track icon (contain) | auto |
| `icon-workers.webp` | 96x96 | 1:1 | yes (flat white background, we key it) | Workers icon (contain) | auto |
| `portrait-cass.webp` | 512x512 | 1:1 | no | Cass Ferrow portrait (cover) | auto |
| `portrait-hask.webp` | 512x512 | 1:1 | no | Lord Haskel portrait (cover) | auto |
| `portrait-ivo.webp` | 512x512 | 1:1 | no | Ivo Grath portrait (cover) | auto |
| `portrait-marla.webp` | 512x512 | 1:1 | no | Marla Venn portrait (cover) | auto |
| `portrait-odo.webp` | 512x512 | 1:1 | no | Old Odo portrait (cover) | auto |
| `portrait-wren.webp` | 512x512 | 1:1 | no | Wren portrait (cover) | auto |
| `tile-back.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Face-down tile in market and storage (contain) | auto |
| `tile-barge.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Barge tile (contain) | auto |
| `tile-bld-carp.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Joiner's Yard building tile (contain) | auto |
| `tile-bld-chapel.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Bell Chapel building tile (contain) | auto |
| `tile-bld-hall.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Moot Hall building tile (contain) | auto |
| `tile-bld-inn.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Drovers' Inn building tile (contain) | auto |
| `tile-bld-mint.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Counting House building tile (contain) | auto |
| `tile-bld-mkt.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Fair Green building tile (contain) | auto |
| `tile-bld-store.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Granary building tile (contain) | auto |
| `tile-bld-tower.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Beacon Tower building tile (contain) | auto |
| `tile-keep.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Keep tile (contain) | auto |
| `tile-lore-k1.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Drover's Almanac (contain) | auto |
| `tile-lore-k10.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Charter of Guilds (contain) | auto |
| `tile-lore-k11.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Shepherd's Psalter (contain) | auto |
| `tile-lore-k12.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Purse Strings (contain) | auto |
| `tile-lore-k13.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Dockhand's Pact (contain) | auto |
| `tile-lore-k14.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Harbour Toll (contain) | auto |
| `tile-lore-k15.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Seam Map (contain) | auto |
| `tile-lore-k16.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Steady Hands (contain) | auto |
| `tile-lore-k17.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Moot (contain) | auto |
| `tile-lore-k18.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Joiners (contain) | auto |
| `tile-lore-k19.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Bells (contain) | auto |
| `tile-lore-k2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Merchant's Ledger (contain) | auto |
| `tile-lore-k20.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Fair (contain) | auto |
| `tile-lore-k21.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Drovers (contain) | auto |
| `tile-lore-k22.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Counters (contain) | auto |
| `tile-lore-k23.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Beacons (contain) | auto |
| `tile-lore-k24.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Roll of the Granaries (contain) | auto |
| `tile-lore-k25.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Tradebook (contain) | auto |
| `tile-lore-k26.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Bestiary (contain) | auto |
| `tile-lore-k3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Weigher's Scale (contain) | auto |
| `tile-lore-k4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Pilot's Chart (contain) | auto |
| `tile-lore-k5.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Delver's Lamp (contain) | auto |
| `tile-lore-k6.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Carter's Rule (contain) | auto |
| `tile-lore-k7.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Mason's Rule (contain) | auto |
| `tile-lore-k8.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Larder Plans (contain) | auto |
| `tile-lore-k9.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lore tile Smuggler's Wink (contain) | auto |
| `tile-mine.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Mine tile (contain) | auto |
| `tile-pas-goat-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 goats (contain) | auto |
| `tile-pas-goat-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 goats (contain) | auto |
| `tile-pas-goat-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 goats (contain) | auto |
| `tile-pas-goose-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 geese (contain) | auto |
| `tile-pas-goose-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 geese (contain) | auto |
| `tile-pas-goose-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 geese (contain) | auto |
| `tile-pas-pig-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 pigs (contain) | auto |
| `tile-pas-pig-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 pigs (contain) | auto |
| `tile-pas-pig-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 pigs (contain) | auto |
| `tile-pas-sheep-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 2 sheep (contain) | auto |
| `tile-pas-sheep-3.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 3 sheep (contain) | auto |
| `tile-pas-sheep-4.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pasture tile, 4 sheep (contain) | auto |
| `token-banner-0.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Crimson seat banner token (contain) | auto |
| `token-banner-1.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Azure seat banner token (contain) | auto |
| `token-banner-2.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Saffron seat banner token (contain) | auto |
| `token-banner-3.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Violet seat banner token (contain) | auto |
| `token-points.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Points token (contain) | auto |
| `token-silver.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Silver token (contain) | auto |
| `token-worker.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Worker token (contain) | auto |
| `ui-result-lose.webp` | 1200x800 | 3:2 | no | Defeat result screen backdrop (cover) | auto |
| `ui-result-win.webp` | 1200x800 | 3:2 | no | Victory result screen backdrop (cover) | auto |
| `ui-scroll.webp` | 800x500 | 8:5 | yes (flat white background, we key it) | Parchment scroll behind story lines (contain) | auto |
| `ui-tile-frame.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Ornate frame around the big tile view (contain) | auto |
