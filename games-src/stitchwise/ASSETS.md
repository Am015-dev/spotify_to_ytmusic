# Stitchwise: pictures (2D only)

Every picture is a named slot. `media/<stem>.webp` fills it with no code change; until then a code-drawn placeholder shows. Manifest: `assets.json` (re-made by `gen-assets.py`, which also writes the Flow prompts in `games-src/next-wave/flow-2d/stitchwise/` and the music cues in `games-src/next-wave/music/stitchwise/cues-wave1.json`).

Style block (in front of every prompt): Flat 2D hand-stitched quilting illustration, soft woven cotton textures, a warm palette of teal, rose, mustard, cream and deep navy, thin dark stitched outlines, no 3D, no photo realism, no text, no letters, no numbers, no logos.

## Wave 1 (first minute): 23 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| bg-title | bg | 1080x1920 | 9:16 | no | Title screen background (cover) |
| bg-table | bg | 1080x1920 | 9:16 | no | Board background behind the quilt (cover) |
| quilt-frame | board | 900x900 | 1:1 | no | Quilt board 9x9 (cover; the grid is drawn over it) |
| track-frame | board | 1600x400 | 4:1 | no | Time track strip behind the 54 spaces (cover) |
| token-me | token | 128x128 | 1:1 | yes | Your time token (contain) |
| token-opp | token | 128x128 | 1:1 | yes | Opponent time token (contain) |
| icon-button | icon | 128x128 | 1:1 | yes | Button currency icon (contain) |
| icon-hourglass | icon | 128x128 | 1:1 | yes | Time cost icon (contain) |
| patch-leather | token | 256x256 | 1:1 | yes | Single leather patch square (cover) |
| fabric-01 | token | 256x256 | 1:1 | no | Fabric of the patch 'Ribbon Scrap' (square seamless tile, cover over the patch) |
| fabric-02 | token | 256x256 | 1:1 | no | Fabric of the patch 'Bias Binding' (square seamless tile, cover over the patch) |
| fabric-03 | token | 256x256 | 1:1 | no | Fabric of the patch 'Corner Patch' (square seamless tile, cover over the patch) |
| fabric-04 | token | 256x256 | 1:1 | no | Fabric of the patch 'Tile Square' (square seamless tile, cover over the patch) |
| fabric-05 | token | 256x256 | 1:1 | no | Fabric of the patch 'Long Strip' (square seamless tile, cover over the patch) |
| fabric-06 | token | 256x256 | 1:1 | no | Fabric of the patch 'Boot Patch' (square seamless tile, cover over the patch) |
| fabric-07 | token | 256x256 | 1:1 | no | Fabric of the patch 'Tab Patch' (square seamless tile, cover over the patch) |
| fabric-08 | token | 256x256 | 1:1 | no | Fabric of the patch 'Wave Patch' (square seamless tile, cover over the patch) |
| fabric-09 | token | 256x256 | 1:1 | no | Fabric of the patch 'Ruler Strip' (square seamless tile, cover over the patch) |
| fabric-10 | token | 256x256 | 1:1 | no | Fabric of the patch 'Hook Patch' (square seamless tile, cover over the patch) |
| fabric-11 | token | 256x256 | 1:1 | no | Fabric of the patch 'Step Patch' (square seamless tile, cover over the patch) |
| fabric-12 | token | 256x256 | 1:1 | no | Fabric of the patch 'Pocket Patch' (square seamless tile, cover over the patch) |
| portrait-wren | portrait | 512x512 | 1:1 | no | Aunt Wren portrait (story map, intro and result screen, cover) |
| portrait-poppy | portrait | 512x512 | 1:1 | no | Dame Poppy portrait (story map, intro and result screen, cover) |

## Wave 2 (every remaining rules piece): 29 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| fabric-13 | token | 256x256 | 1:1 | no | Fabric of the patch 'Anchor Patch' (square seamless tile, cover over the patch) |
| fabric-14 | token | 256x256 | 1:1 | no | Fabric of the patch 'Cup Patch' (square seamless tile, cover over the patch) |
| fabric-15 | token | 256x256 | 1:1 | no | Fabric of the patch 'Elbow Patch' (square seamless tile, cover over the patch) |
| fabric-16 | token | 256x256 | 1:1 | no | Fabric of the patch 'Stair Patch' (square seamless tile, cover over the patch) |
| fabric-17 | token | 256x256 | 1:1 | no | Fabric of the patch 'Cross Patch' (square seamless tile, cover over the patch) |
| fabric-18 | token | 256x256 | 1:1 | no | Fabric of the patch 'Banner Patch' (square seamless tile, cover over the patch) |
| fabric-19 | token | 256x256 | 1:1 | no | Fabric of the patch 'Lightning Patch' (square seamless tile, cover over the patch) |
| fabric-20 | token | 256x256 | 1:1 | no | Fabric of the patch 'Leaf Patch' (square seamless tile, cover over the patch) |
| fabric-21 | token | 256x256 | 1:1 | no | Fabric of the patch 'Wide Block' (square seamless tile, cover over the patch) |
| fabric-22 | token | 256x256 | 1:1 | no | Fabric of the patch 'Ladder Patch' (square seamless tile, cover over the patch) |
| fabric-23 | token | 256x256 | 1:1 | no | Fabric of the patch 'Kite Patch' (square seamless tile, cover over the patch) |
| fabric-24 | token | 256x256 | 1:1 | no | Fabric of the patch 'Bridge Patch' (square seamless tile, cover over the patch) |
| fabric-25 | token | 256x256 | 1:1 | no | Fabric of the patch 'Hammer Patch' (square seamless tile, cover over the patch) |
| fabric-26 | token | 256x256 | 1:1 | no | Fabric of the patch 'Zigzag Patch' (square seamless tile, cover over the patch) |
| fabric-27 | token | 256x256 | 1:1 | no | Fabric of the patch 'Arch Patch' (square seamless tile, cover over the patch) |
| fabric-28 | token | 256x256 | 1:1 | no | Fabric of the patch 'Pennant Patch' (square seamless tile, cover over the patch) |
| fabric-29 | token | 256x256 | 1:1 | no | Fabric of the patch 'Windmill Patch' (square seamless tile, cover over the patch) |
| fabric-30 | token | 256x256 | 1:1 | no | Fabric of the patch 'Long Stair' (square seamless tile, cover over the patch) |
| fabric-31 | token | 256x256 | 1:1 | no | Fabric of the patch 'Snowflake Patch' (square seamless tile, cover over the patch) |
| fabric-32 | token | 256x256 | 1:1 | no | Fabric of the patch 'Frame Patch' (square seamless tile, cover over the patch) |
| fabric-33 | token | 256x256 | 1:1 | no | Fabric of the patch 'Flag Patch' (square seamless tile, cover over the patch) |
| portrait-tilly | portrait | 512x512 | 1:1 | no | Tilly Thimble portrait (story map, intro and result screen, cover) |
| portrait-odette | portrait | 512x512 | 1:1 | no | Odette Loom portrait (story map, intro and result screen, cover) |
| portrait-bram | portrait | 512x512 | 1:1 | no | Bram Seam portrait (story map, intro and result screen, cover) |
| portrait-ivo | portrait | 512x512 | 1:1 | no | Ivo Selvage portrait (story map, intro and result screen, cover) |
| portrait-hester | portrait | 512x512 | 1:1 | no | Hester Pinwheel portrait (story map, intro and result screen, cover) |
| portrait-tobias | portrait | 512x512 | 1:1 | no | Tobias Quillon portrait (story map, intro and result screen, cover) |
| bonus-tile | token | 256x256 | 1:1 | yes | 7x7 bonus tile (contain) |
| torn-square | token | 256x256 | 1:1 | yes | Torn quilt square for the Moth Season story stage (cover) |

## Wave 3 (polish): 11 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| portrait-fernsby | portrait | 512x512 | 1:1 | no | Granny Fernsby portrait (story map, intro and result screen, cover) |
| portrait-marguerite | portrait | 512x512 | 1:1 | no | Marguerite Bodkin portrait (story map, intro and result screen, cover) |
| portrait-aurelia | portrait | 512x512 | 1:1 | no | Queen Aurelia portrait (story map, intro and result screen, cover) |
| bg-map | bg | 1080x1920 | 9:16 | no | Story map background (cover) |
| result-win | bg | 1080x1920 | 9:16 | no | Win result background (cover) |
| result-lose | bg | 1080x1920 | 9:16 | no | Loss result background (cover) |
| fx-sparkle | fx | 256x256 | 1:1 | yes | Sparkle at the button-income moment (contain) |
| fx-stitch | fx | 256x256 | 1:1 | yes | Stitch flourish when a patch is sewn on (contain) |
| icon-bonus | icon | 128x128 | 1:1 | yes | Bonus 7 icon (contain) |
| icon-leather | icon | 128x128 | 1:1 | yes | Leather patch space icon on the track (contain) |
| ui-offer-card | ui | 400x320 | 5:4 | yes | Patch offer card background (contain) |

## Three drop-in steps

1. Put finished files in `assets-inbox/stitchwise/` named `<stem>.png` or `.webp` (the stem is in the table).
2. Run `python3 games-src/scripts/ingest-assets.py` (`--check` for a dry run): it resizes to the slot size and writes `games/stitchwise/media/<stem>.webp`.
3. Tell the orchestrator: one `build-all.py --deploy stitchwise` lists the new files (no code change).

Music: drop `tavern-a.mp3`, `main-a.mp3`, `fight-a.mp3`, `victory-a.mp3`, `defeat-a.mp3` into `games/stitchwise/music/`; the Music picker plays them. Silent until the files exist.
Register for the owner's laptop list: `python3 games-src/stitchwise/register-assets.py`.
