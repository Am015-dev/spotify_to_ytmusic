# Inbox: rampart-and-vine

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (3)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `card-frame.webp` | 512x1024 | 0.68 | yes (flat white background, we key it) | card frame | wiring |
| `scrim-plate.webp` | 1024x1024 | 0.51 | no | scrim plate | wiring |
| `top-plate.webp` | 1024x512 | 7.22 | yes (flat white background, we key it) | top plate | wiring |

## Wave 7 pictures (13)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `table-castle-hall.png` | 1920x1080 | 16:9 | no | Painting: table-castle-hall | wiring |
| `table-castle-hall-phone.png` | 1080x1920 | 9:16 | no | Painting: table-castle-hall-phone | wiring |
| `table-vineyard-dusk.png` | 1920x1080 | 16:9 | no | Painting: table-vineyard-dusk | wiring |
| `table-vineyard-dusk-phone.png` | 1080x1920 | 9:16 | no | Painting: table-vineyard-dusk-phone | wiring |
| `tex-field-b.png` | 256x256 | 1:1 | no | Painting: tex-field-b | wiring |
| `tex-field-c.png` | 256x256 | 1:1 | no | Painting: tex-field-c | wiring |
| `tex-hedge-b.png` | 256x256 | 1:1 | no | Painting: tex-hedge-b | wiring |
| `tex-road-b.png` | 256x256 | 1:1 | no | Painting: tex-road-b | wiring |
| `tex-roof-b.png` | 256x256 | 1:1 | no | Painting: tex-roof-b | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (47)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `baron-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Sable Baron: idle expression | wiring |
| `baron-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Sable Baron: lose expression | wiring |
| `baron-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Sable Baron: praise expression | wiring |
| `baron-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Sable Baron: shock expression | wiring |
| `baron-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Sable Baron: taunt expression | wiring |
| `baron-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Sable Baron: win expression | wiring |
| `corvin-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Corvin Blackmere: idle expression | wiring |
| `corvin-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Corvin Blackmere: lose expression | wiring |
| `corvin-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Corvin Blackmere: win expression | wiring |
| `dulcie-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dulcie Tapwell: idle expression | wiring |
| `dulcie-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dulcie Tapwell: lose expression | wiring |
| `dulcie-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dulcie Tapwell: win expression | wiring |
| `ferro-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Ferro the Boatman: idle expression | wiring |
| `ferro-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Ferro the Boatman: lose expression | wiring |
| `ferro-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Ferro the Boatman: win expression | wiring |
| `garnet-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Garnet: idle expression | wiring |
| `garnet-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Garnet: lose expression | wiring |
| `garnet-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Garnet: talk expression | wiring |
| `garnet-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Garnet: win expression | wiring |
| `hob-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hob the Carter: idle expression | wiring |
| `hob-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hob the Carter: lose expression | wiring |
| `hob-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hob the Carter: win expression | wiring |
| `isolde-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Isolde of Lilac Hall: idle expression | wiring |
| `isolde-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Isolde of Lilac Hall: lose expression | wiring |
| `isolde-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Isolde of Lilac Hall: win expression | wiring |
| `mabry-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mabry Furrow: idle expression | wiring |
| `mabry-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mabry Furrow: lose expression | wiring |
| `mabry-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mabry Furrow: win expression | wiring |
| `ostrand-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Reeve Ostrand: idle expression | wiring |
| `ostrand-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Reeve Ostrand: lose expression | wiring |
| `ostrand-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Reeve Ostrand: praise expression | wiring |
| `ostrand-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Reeve Ostrand: shock expression | wiring |
| `ostrand-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Reeve Ostrand: taunt expression | wiring |
| `ostrand-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Reeve Ostrand: win expression | wiring |
| `quill-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Quill: idle expression | wiring |
| `quill-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Quill: lose expression | wiring |
| `quill-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Quill: praise expression | wiring |
| `quill-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Quill: shock expression | wiring |
| `quill-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Quill: taunt expression | wiring |
| `quill-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Quill: win expression | wiring |
| `tamsin-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Tamsin: idle expression | wiring |
| `tamsin-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Tamsin: lose expression | wiring |
| `tamsin-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Tamsin: talk expression | wiring |
| `tamsin-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Tamsin: win expression | wiring |
| `wren-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wren Ashlar: idle expression | wiring |
| `wren-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wren Ashlar: lose expression | wiring |
| `wren-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wren Ashlar: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (19)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `church-tower.png` | 1024x1024 | 1:1 | - | 3D model: church-tower | 3D |
| `cottage.png` | 1024x1024 | 1:1 | - | 3D model: cottage | 3D |
| `haystack.png` | 1024x1024 | 1:1 | - | 3D model: haystack | 3D |
| `oak-tree.png` | 1024x1024 | 1:1 | - | 3D model: oak-tree | 3D |
| `piece-champ-axe.png` | 1024x1024 | 1:1 | - | 3D model: piece-champ-axe | 3D |
| `piece-champ-banner.png` | 1024x1024 | 1:1 | - | 3D model: piece-champ-banner | 3D |
| `piece-champ-knight.png` | 1024x1024 | 1:1 | - | 3D model: piece-champ-knight | 3D |
| `piece-hog-black.png` | 1024x1024 | 1:1 | - | 3D model: piece-hog-black | 3D |
| `piece-hog-piglet.png` | 1024x1024 | 1:1 | - | 3D model: piece-hog-piglet | 3D |
| `piece-hog-spotted.png` | 1024x1024 | 1:1 | - | 3D model: piece-hog-spotted | 3D |
| `piece-mason-hammer.png` | 1024x1024 | 1:1 | - | 3D model: piece-mason-hammer | 3D |
| `piece-mason-ladder.png` | 1024x1024 | 1:1 | - | 3D model: piece-mason-ladder | 3D |
| `piece-mason-trowel.png` | 1024x1024 | 1:1 | - | 3D model: piece-mason-trowel | 3D |
| `piece-meeple-farmer.png` | 1024x1024 | 1:1 | - | 3D model: piece-meeple-farmer | 3D |
| `piece-meeple-knight.png` | 1024x1024 | 1:1 | - | 3D model: piece-meeple-knight | 3D |
| `piece-meeple-monk.png` | 1024x1024 | 1:1 | - | 3D model: piece-meeple-monk | 3D |
| `sheep.png` | 1024x1024 | 1:1 | - | 3D model: sheep | 3D |
| `stone-bridge.png` | 1024x1024 | 1:1 | - | 3D model: stone-bridge | 3D |
| `windmill.png` | 1024x1024 | 1:1 | - | 3D model: windmill | 3D |
