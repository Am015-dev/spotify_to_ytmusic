# Inbox: redline-rally

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (43)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bg-podium.webp` | 1080x1920 | 9:16 | no | Result screen background (cover) | prefix |
| `bg-title.webp` | 1080x1920 | 9:16 | no | Title screen background (cover) | prefix |
| `car-amber.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Race car on the track (contain, nose to the right) | prefix |
| `car-azure.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Race car on the track (contain, nose to the right) | prefix |
| `car-crimson.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Race car on the track (contain, nose to the right) | prefix |
| `car-graphite.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Race car on the track (contain, nose to the right) | prefix |
| `car-jade.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Race car on the track (contain, nose to the right) | prefix |
| `car-violet.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Race car on the track (contain, nose to the right) | prefix |
| `card-back.webp` | 500x700 | 5:7 | no | Deck and discard piles, opponents' cards (contain) | prefix |
| `card-heat.webp` | 500x700 | 5:7 | no | Heat card face (cover) | prefix |
| `card-speed-1.webp` | 500x700 | 5:7 | no | Speed card 1 face (cover; the value is drawn by the game) | prefix |
| `card-speed-2.webp` | 500x700 | 5:7 | no | Speed card 2 face (cover; the value is drawn by the game) | prefix |
| `card-speed-3.webp` | 500x700 | 5:7 | no | Speed card 3 face (cover; the value is drawn by the game) | prefix |
| `card-speed-4.webp` | 500x700 | 5:7 | no | Speed card 4 face (cover; the value is drawn by the game) | prefix |
| `card-stress.webp` | 500x700 | 5:7 | no | Stress card face (cover) | prefix |
| `card-upgrade-brakes.webp` | 500x700 | 5:7 | no | Upgrade card face: Big Brakes (cover; speed number and name are drawn by the game, keep the top-left corner and the bottom strip calm) | prefix |
| `card-upgrade-coolant.webp` | 500x700 | 5:7 | no | Upgrade card face: Coolant Line (cover; speed number and name are drawn by the game, keep the top-left corner and the bottom strip calm) | prefix |
| `card-upgrade-grip.webp` | 500x700 | 5:7 | no | Upgrade card face: Grip Tyres (cover; speed number and name are drawn by the game, keep the top-left corner and the bottom strip calm) | prefix |
| `card-upgrade-pit.webp` | 500x700 | 5:7 | no | Upgrade card face: Pit Crew (cover; speed number and name are drawn by the game, keep the top-left corner and the bottom strip calm) | prefix |
| `card-upgrade-rocket.webp` | 500x700 | 5:7 | no | Upgrade card face: Rocket Pack (cover; speed number and name are drawn by the game, keep the top-left corner and the bottom strip calm) | prefix |
| `card-upgrade-tuned.webp` | 500x700 | 5:7 | no | Upgrade card face: Tuned Engine (cover; speed number and name are drawn by the game, keep the top-left corner and the bottom strip calm) | prefix |
| `fx-boost-flare.webp` | 512x384 | 4:3 | yes (flat white background, we key it) | Pop for a boost (contain) | prefix |
| `fx-heat-flame.webp` | 512x384 | 4:3 | yes (flat white background, we key it) | Pop when a corner burns heat (contain) | prefix |
| `fx-slipstream-streaks.webp` | 512x384 | 4:3 | yes (flat white background, we key it) | Pop for a slipstream jump (contain) | prefix |
| `fx-spinout-smoke.webp` | 512x384 | 4:3 | yes (flat white background, we key it) | Pop when a car spins out (contain) | prefix |
| `icon-gear.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Gear icon beside the gear buttons (contain) | prefix |
| `icon-heat.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Heat icon in the hand panel (contain) | prefix |
| `icon-lap.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Lap icon in the top bar (contain) | prefix |
| `icon-place.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Race position icon in the top bar (contain) | prefix |
| `icon-stress.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Stress icon beside the stress count (contain) | prefix |
| `portrait-bex.webp` | 512x512 | 1:1 | no | Bex Hollis rival portrait on the result screen (cover) | prefix |
| `portrait-dax.webp` | 512x512 | 1:1 | no | Dax Orrin rival portrait on the result screen (cover) | prefix |
| `portrait-juno.webp` | 512x512 | 1:1 | no | Juno Vega rival portrait on the result screen (cover) | prefix |
| `portrait-kit.webp` | 512x512 | 1:1 | no | Your driver portrait on the result screen (cover) | prefix |
| `portrait-oto.webp` | 512x512 | 1:1 | no | Oto Lind rival portrait on the result screen (cover) | prefix |
| `portrait-pia.webp` | 512x512 | 1:1 | no | Pia Rask rival portrait on the result screen (cover) | prefix |
| `track-hairpin.webp` | 2000x1200 | 5:3 | no | Hairpin Hill board (cover over the 2000x1200 world; follow guides/track-hairpin.svg) | prefix |
| `track-sunline.webp` | 2000x1200 | 5:3 | no | Sunline Speedway board (cover over the 2000x1200 world; follow games-src/redline-rally/guides/track-sunline.svg) | prefix |
| `ui-corner-sign.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Corner speed-limit sign on the track (contain; the limit number is drawn by the game) | prefix |
| `ui-engine-tray.webp` | 512x192 | 8:3 | yes (flat white background, we key it) | Engine tray behind the heat and stress counts in the hand panel (stretched to the row) | prefix |
| `ui-flag-checkered.webp` | 512x384 | 4:3 | yes (flat white background, we key it) | Chequered flag over the start line (contain) | prefix |
| `ui-gear-dial.webp` | 512x160 | 16:5 | yes (flat white background, we key it) | Gear panel background behind the four gear buttons (contain) | prefix |
| `ui-trophy.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Winner trophy on the result screen (contain) | prefix |
