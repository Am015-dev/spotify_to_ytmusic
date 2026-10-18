# Inbox: sands-of-qamar

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (8)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `dcard-plate.webp` | 512x512 | 4.16 | yes (flat white background, we key it) | dcard plate | wiring |
| `gx-bar-plate.webp` | 1024x512 | 7.5 | yes (flat white background, we key it) | gx bar plate | wiring |
| `gx-drawer-head-plate.webp` | 1024x512 | 5.96 | yes (flat white background, we key it) | gx drawer head plate | wiring |
| `mi-plate.webp` | 512x512 | 1.2 | yes (flat white background, we key it) | mi plate | wiring |
| `modal-plate.webp` | 1024x1024 | 0.51 | no | modal plate | wiring |
| `spot-plate.webp` | 512x512 | 0.71 | yes (flat white background, we key it) | spot plate | wiring |
| `tile-blue-plate.webp` | 512x512 | 0.65 | yes (flat white background, we key it) | tile blue plate | wiring |
| `tile-red-plate.webp` | 512x512 | 0.65 | yes (flat white background, we key it) | tile red plate | wiring |

## Wave 7 pictures (14)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `table-dune-night.png` | 1920x1080 | 16:9 | no | Painting: table-dune-night | wiring |
| `table-dune-night-phone.png` | 1080x1920 | 9:16 | no | Painting: table-dune-night-phone | wiring |
| `table-souk-dusk.png` | 1920x1080 | 16:9 | no | Painting: table-souk-dusk | wiring |
| `table-souk-dusk-phone.png` | 1080x1920 | 9:16 | no | Painting: table-souk-dusk-phone | wiring |
| `tile-lake-b.png` | 512x512 | 1:1 | no | Painting: tile-lake-b | wiring |
| `tile-large-b.png` | 512x512 | 1:1 | no | Painting: tile-large-b | wiring |
| `tile-oasis-b.png` | 512x512 | 1:1 | no | Painting: tile-oasis-b | wiring |
| `tile-small-b.png` | 512x512 | 1:1 | no | Painting: tile-small-b | wiring |
| `tile-small-c.png` | 512x512 | 1:1 | no | Painting: tile-small-c | wiring |
| `tile-village-b.png` | 512x512 | 1:1 | no | Painting: tile-village-b | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (52)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `camel-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | camel: idle state | wiring |
| `camel-rest.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | camel: rest state | wiring |
| `camel-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | camel: walk-a state | wiring |
| `camel-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | camel: walk-b state | wiring |
| `camel-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | camel: win state | wiring |
| `farid-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Farid the Water-Boy: idle expression | wiring |
| `farid-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Farid the Water-Boy: lose expression | wiring |
| `farid-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Farid the Water-Boy: win expression | wiring |
| `hadiya-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Hadiya: idle expression | wiring |
| `hadiya-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Hadiya: lose expression | wiring |
| `hadiya-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Hadiya: talk expression | wiring |
| `hadiya-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Hadiya: win expression | wiring |
| `layla-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Layla Coin-Counter: idle expression | wiring |
| `layla-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Layla Coin-Counter: lose expression | wiring |
| `layla-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Layla Coin-Counter: win expression | wiring |
| `marwan-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grand Advisor Marwan: idle expression | wiring |
| `marwan-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grand Advisor Marwan: lose expression | wiring |
| `marwan-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grand Advisor Marwan: praise expression | wiring |
| `marwan-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grand Advisor Marwan: shock expression | wiring |
| `marwan-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grand Advisor Marwan: taunt expression | wiring |
| `marwan-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grand Advisor Marwan: win expression | wiring |
| `nimr-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nimr of the Night Roads: idle expression | wiring |
| `nimr-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nimr of the Night Roads: lose expression | wiring |
| `nimr-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nimr of the Night Roads: win expression | wiring |
| `qadira-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qadira the Uncrowned: idle expression | wiring |
| `qadira-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qadira the Uncrowned: lose expression | wiring |
| `qadira-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qadira the Uncrowned: praise expression | wiring |
| `qadira-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qadira the Uncrowned: shock expression | wiring |
| `qadira-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qadira the Uncrowned: taunt expression | wiring |
| `qadira-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qadira the Uncrowned: win expression | wiring |
| `qays-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qays and Kamil: idle expression | wiring |
| `qays-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qays and Kamil: lose expression | wiring |
| `qays-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Qays and Kamil: win expression | wiring |
| `sabah-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabah the Silk-Seller: idle expression | wiring |
| `sabah-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabah the Silk-Seller: lose expression | wiring |
| `sabah-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabah the Silk-Seller: win expression | wiring |
| `tahir-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Tahir: idle expression | wiring |
| `tahir-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Tahir: lose expression | wiring |
| `tahir-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Tahir: win expression | wiring |
| `you-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | You: idle expression | wiring |
| `you-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | You: lose expression | wiring |
| `you-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | You: talk expression | wiring |
| `you-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | You: win expression | wiring |
| `yusra-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Yusra of the Copper Scales: idle expression | wiring |
| `yusra-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Yusra of the Copper Scales: lose expression | wiring |
| `yusra-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Yusra of the Copper Scales: praise expression | wiring |
| `yusra-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Yusra of the Copper Scales: shock expression | wiring |
| `yusra-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Yusra of the Copper Scales: taunt expression | wiring |
| `yusra-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Yusra of the Copper Scales: win expression | wiring |
| `zubaida-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Zubaida of the Lamp: idle expression | wiring |
| `zubaida-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Zubaida of the Lamp: lose expression | wiring |
| `zubaida-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Zubaida of the Lamp: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (13)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `camel-laden.png` | 1024x1024 | 1:1 | - | 3D model: camel-laden | 3D |
| `djinn.png` | 1024x1024 | 1:1 | - | 3D model: djinn | 3D |
| `jar.png` | 1024x1024 | 1:1 | - | 3D model: jar | 3D |
| `market-stall.png` | 1024x1024 | 1:1 | - | 3D model: market-stall | 3D |
| `meeple-artisan.png` | 1024x1024 | 1:1 | - | 3D model: meeple-artisan | 3D |
| `meeple-assassin.png` | 1024x1024 | 1:1 | - | 3D model: meeple-assassin | 3D |
| `meeple-builder.png` | 1024x1024 | 1:1 | - | 3D model: meeple-builder | 3D |
| `meeple-elder.png` | 1024x1024 | 1:1 | - | 3D model: meeple-elder | 3D |
| `meeple-merchant.png` | 1024x1024 | 1:1 | - | 3D model: meeple-merchant | 3D |
| `meeple-vizier.png` | 1024x1024 | 1:1 | - | 3D model: meeple-vizier | 3D |
| `minaret.png` | 1024x1024 | 1:1 | - | 3D model: minaret | 3D |
| `tent.png` | 1024x1024 | 1:1 | - | 3D model: tent | 3D |
| `well.png` | 1024x1024 | 1:1 | - | 3D model: well | 3D |
