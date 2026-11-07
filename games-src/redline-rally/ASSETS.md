# Redline Rally: pictures (2D only)

Every picture is a named slot. `media/<stem>.webp` fills it with no code change; until then a code-drawn placeholder shows. Manifest: `assets.json` (re-made by `gen-assets.py`).

Style block (in front of every prompt): Flat 2D vector game art, top-down view, clean bold shapes with soft cel shading, a warm sunset racing palette of orange, teal, cream and deep navy, thin dark outlines, no 3D, no photo realism, no text, no letters, no numbers, no logos.


## Wave 1 (first minute): 18 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| bg-title | bg | 1080x1920 | 9:16 | no | Title screen background (cover) |
| track-sunline | board | 2000x1200 | 5:3 | no | Sunline Speedway board (cover over the 2000x1200 world; follow games-src/redline-rally/guides/track-sunline.svg) |
| track-hairpin | board | 2000x1200 | 5:3 | no | Hairpin Hill board (cover over the 2000x1200 world; follow guides/track-hairpin.svg) |
| car-crimson | token | 256x128 | 2:1 | yes | Race car on the track (contain, nose to the right) |
| car-azure | token | 256x128 | 2:1 | yes | Race car on the track (contain, nose to the right) |
| car-jade | token | 256x128 | 2:1 | yes | Race car on the track (contain, nose to the right) |
| car-amber | token | 256x128 | 2:1 | yes | Race car on the track (contain, nose to the right) |
| car-violet | token | 256x128 | 2:1 | yes | Race car on the track (contain, nose to the right) |
| car-graphite | token | 256x128 | 2:1 | yes | Race car on the track (contain, nose to the right) |
| card-back | card | 500x700 | 5:7 | no | Deck and discard piles, opponents' cards (contain) |
| card-speed-1 | card | 500x700 | 5:7 | no | Speed card 1 face (cover; the value is drawn by the game) |
| card-speed-2 | card | 500x700 | 5:7 | no | Speed card 2 face (cover; the value is drawn by the game) |
| card-speed-3 | card | 500x700 | 5:7 | no | Speed card 3 face (cover; the value is drawn by the game) |
| card-speed-4 | card | 500x700 | 5:7 | no | Speed card 4 face (cover; the value is drawn by the game) |
| card-heat | card | 500x700 | 5:7 | no | Heat card face (cover) |
| card-stress | card | 500x700 | 5:7 | no | Stress card face (cover) |
| ui-gear-dial | ui | 512x160 | 16:5 | yes | Gear panel background behind the four gear buttons (contain) |
| portrait-kit | portrait | 512x512 | 1:1 | no | Your driver portrait on the result screen (cover) |

## Wave 2 (every remaining rules piece): 7 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| portrait-juno | portrait | 512x512 | 1:1 | no | Juno Vega rival portrait on the result screen (cover) |
| portrait-dax | portrait | 512x512 | 1:1 | no | Dax Orrin rival portrait on the result screen (cover) |
| portrait-pia | portrait | 512x512 | 1:1 | no | Pia Rask rival portrait on the result screen (cover) |
| portrait-oto | portrait | 512x512 | 1:1 | no | Oto Lind rival portrait on the result screen (cover) |
| portrait-bex | portrait | 512x512 | 1:1 | no | Bex Hollis rival portrait on the result screen (cover) |
| icon-heat | icon | 128x128 | 1:1 | yes | Heat icon in the hand panel (contain) |
| ui-corner-sign | ui | 256x256 | 1:1 | yes | Corner speed-limit sign on the track (contain; the limit number is drawn by the game) |

## Wave 3 (polish): 12 pictures

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| ui-engine-tray | ui | 512x192 | 8:3 | yes | Engine tray behind the heat counter (contain) [no code slot yet: a wiring worker adds the hook after delivery] |
| icon-stress | icon | 128x128 | 1:1 | yes | Stress icon (contain) [no code slot yet: a wiring worker adds the hook after delivery] |
| icon-gear | icon | 128x128 | 1:1 | yes | Gear icon (contain) [no code slot yet: a wiring worker adds the hook after delivery] |
| bg-podium | bg | 1080x1920 | 9:16 | no | Result screen background (cover) |
| ui-trophy | ui | 512x512 | 1:1 | yes | Winner trophy on the result screen (contain) |
| ui-flag-checkered | ui | 512x384 | 4:3 | yes | Chequered flag over the start line (contain) |
| fx-heat-flame | fx | 512x384 | 4:3 | yes | Pop when a corner burns heat (contain) |
| fx-spinout-smoke | fx | 512x384 | 4:3 | yes | Pop when a car spins out (contain) |
| fx-slipstream-streaks | fx | 512x384 | 4:3 | yes | Pop for a slipstream jump (contain) |
| fx-boost-flare | fx | 512x384 | 4:3 | yes | Pop for a boost (contain) |
| icon-lap | icon | 128x128 | 1:1 | yes | Lap counter icon [no code slot yet: a wiring worker adds the hook after delivery] |
| icon-place | icon | 128x128 | 1:1 | yes | Race position icon [no code slot yet: a wiring worker adds the hook after delivery] |

## How to drop the finished pictures in (3 steps)

1. Generate each wave in Google Flow with `games-src/next-wave/flow-2d/redline-rally/prompts-wave<N>-ratio-<A>x<B>.json` (one file per wave and ratio; each stem is in exactly one file; list: `games-src/next-wave/NEW-GAMES-WAVES.md`). For the two tracks, give Flow `guides/track-*.svg` as the layout reference. Save each picture as `<stem>.png` (or .webp).
2. Put the files in `assets-inbox/redline-rally/` and run `python3 games-src/scripts/ingest-assets.py` (`--check` first = dry run). It writes `games/redline-rally/media/<stem>.webp`.
3. Tell the orchestrator; run `build-all.py --deploy redline-rally`. Nothing else: the page lists the files in `media/` at build time and draws them at the slot's size and aspect.

Fit rules: `bg` and `board` kinds are cover (cropped to fill), everything else is contain (never stretched). Card values, corner limits and names are drawn by the game on top, so no text or numbers inside any picture.

Note (W334): `assets.json` and the prompt files were edited by hand after the first build; do not re-run the generator script over them (it would undo the wave split, the removed reserved upgrade backs and the wording fixes).
