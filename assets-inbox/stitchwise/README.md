# Inbox: stitchwise

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (63)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bg-map.webp` | 1080x1920 | 9:16 | no | Story map background (cover) | auto |
| `bg-table.webp` | 1080x1920 | 9:16 | no | Board background behind the quilt (cover) | auto |
| `bg-title.webp` | 1080x1920 | 9:16 | no | Title screen background (cover) | auto |
| `bonus-tile.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | 7x7 bonus tile (contain) | auto |
| `fabric-01.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Ribbon Scrap' (square seamless tile, cover over the patch) | auto |
| `fabric-02.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Bias Binding' (square seamless tile, cover over the patch) | auto |
| `fabric-03.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Corner Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-04.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Tile Square' (square seamless tile, cover over the patch) | auto |
| `fabric-05.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Long Strip' (square seamless tile, cover over the patch) | auto |
| `fabric-06.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Boot Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-07.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Tab Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-08.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Wave Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-09.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Ruler Strip' (square seamless tile, cover over the patch) | auto |
| `fabric-10.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Hook Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-11.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Step Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-12.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Pocket Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-13.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Anchor Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-14.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Cup Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-15.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Elbow Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-16.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Stair Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-17.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Cross Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-18.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Banner Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-19.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Lightning Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-20.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Leaf Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-21.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Wide Block' (square seamless tile, cover over the patch) | auto |
| `fabric-22.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Ladder Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-23.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Kite Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-24.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Bridge Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-25.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Hammer Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-26.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Zigzag Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-27.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Arch Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-28.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Pennant Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-29.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Windmill Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-30.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Long Stair' (square seamless tile, cover over the patch) | auto |
| `fabric-31.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Snowflake Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-32.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Frame Patch' (square seamless tile, cover over the patch) | auto |
| `fabric-33.webp` | 256x256 | 1:1 | no | Fabric of the patch 'Flag Patch' (square seamless tile, cover over the patch) | auto |
| `fx-sparkle.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Sparkle at the button-income moment (contain) | auto |
| `fx-stitch.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Stitch flourish when a patch is sewn on (contain) | auto |
| `icon-bonus.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Bonus 7 icon (contain) | auto |
| `icon-button.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Button currency icon (contain) | auto |
| `icon-hourglass.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Time cost icon (contain) | auto |
| `icon-leather.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Leather patch space icon on the track (contain) | auto |
| `patch-leather.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Single leather patch square (cover) | auto |
| `portrait-aurelia.webp` | 512x512 | 1:1 | no | Queen Aurelia portrait (story map, intro and result screen, cover) | auto |
| `portrait-bram.webp` | 512x512 | 1:1 | no | Bram Seam portrait (story map, intro and result screen, cover) | auto |
| `portrait-fernsby.webp` | 512x512 | 1:1 | no | Granny Fernsby portrait (story map, intro and result screen, cover) | auto |
| `portrait-hester.webp` | 512x512 | 1:1 | no | Hester Pinwheel portrait (story map, intro and result screen, cover) | auto |
| `portrait-ivo.webp` | 512x512 | 1:1 | no | Ivo Selvage portrait (story map, intro and result screen, cover) | auto |
| `portrait-marguerite.webp` | 512x512 | 1:1 | no | Marguerite Bodkin portrait (story map, intro and result screen, cover) | auto |
| `portrait-odette.webp` | 512x512 | 1:1 | no | Odette Loom portrait (story map, intro and result screen, cover) | auto |
| `portrait-poppy.webp` | 512x512 | 1:1 | no | Dame Poppy portrait (story map, intro and result screen, cover) | auto |
| `portrait-tilly.webp` | 512x512 | 1:1 | no | Tilly Thimble portrait (story map, intro and result screen, cover) | auto |
| `portrait-tobias.webp` | 512x512 | 1:1 | no | Tobias Quillon portrait (story map, intro and result screen, cover) | auto |
| `portrait-wren.webp` | 512x512 | 1:1 | no | Aunt Wren portrait (story map, intro and result screen, cover) | auto |
| `quilt-frame.webp` | 900x900 | 1:1 | no | Quilt board 9x9 (cover; the grid is drawn over it) | auto |
| `result-lose.webp` | 1080x1920 | 9:16 | no | Loss result background (cover) | auto |
| `result-win.webp` | 1080x1920 | 9:16 | no | Win result background (cover) | auto |
| `token-me.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Your time token (contain) | auto |
| `token-opp.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Opponent time token (contain) | auto |
| `torn-square.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Torn quilt square for the Moth Season story stage (cover) | auto |
| `track-frame.webp` | 1600x400 | 4:1 | no | Time track strip behind the 54 spaces (cover) | auto |
| `ui-offer-card.webp` | 400x320 | 5:4 | yes (flat white background, we key it) | Patch offer card background (contain) | auto |
