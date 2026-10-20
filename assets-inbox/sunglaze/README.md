# Inbox: sunglaze

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (1)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `btn-sm-button-plate.webp` | 512x512 | 1.31 | yes (flat white background, we key it) | btn sm button plate | wiring |

## Wave 7 pictures (11)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `back-black-kiln.png` | 768x1024 | 3:4 | no | Painting: back-black-kiln | wiring |
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `table-kiln-hall.png` | 1920x1080 | 16:9 | no | Painting: table-kiln-hall | wiring |
| `table-kiln-hall-phone.png` | 1080x1920 | 9:16 | no | Painting: table-kiln-hall-phone | wiring |
| `table-moon-courtyard.png` | 1920x1080 | 16:9 | no | Painting: table-moon-courtyard | wiring |
| `table-moon-courtyard-phone.png` | 1080x1920 | 9:16 | no | Painting: table-moon-courtyard-phone | wiring |
| `tile-gloss-b.png` | 256x256 | 1:1 | no | Painting: tile-gloss-b | wiring |
| `tile-gloss-c.png` | 256x256 | 1:1 | no | Painting: tile-gloss-c | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (44)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bram-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bram Kettle: idle expression | wiring |
| `bram-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bram Kettle: lose expression | wiring |
| `bram-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bram Kettle: win expression | wiring |
| `cobb-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cobb the Sorter: idle expression | wiring |
| `cobb-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cobb the Sorter: lose expression | wiring |
| `cobb-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cobb the Sorter: win expression | wiring |
| `garnet-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Garnet Hale: idle expression | wiring |
| `garnet-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Garnet Hale: lose expression | wiring |
| `garnet-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Garnet Hale: praise expression | wiring |
| `garnet-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Garnet Hale: shock expression | wiring |
| `garnet-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Garnet Hale: taunt expression | wiring |
| `garnet-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Master Garnet Hale: win expression | wiring |
| `iris-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Iris Prismwright: idle expression | wiring |
| `iris-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Iris Prismwright: lose expression | wiring |
| `iris-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Iris Prismwright: win expression | wiring |
| `nell-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nell Frost: idle expression | wiring |
| `nell-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nell Frost: lose expression | wiring |
| `nell-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nell Frost: win expression | wiring |
| `ochre-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mother Ochre: idle expression | wiring |
| `ochre-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mother Ochre: lose expression | wiring |
| `ochre-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mother Ochre: talk expression | wiring |
| `ochre-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mother Ochre: win expression | wiring |
| `saffra-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saffra Vell: idle expression | wiring |
| `saffra-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saffra Vell: lose expression | wiring |
| `saffra-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saffra Vell: praise expression | wiring |
| `saffra-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saffra Vell: shock expression | wiring |
| `saffra-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saffra Vell: taunt expression | wiring |
| `saffra-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saffra Vell: win expression | wiring |
| `tamsin-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin Reed: idle expression | wiring |
| `tamsin-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin Reed: lose expression | wiring |
| `tamsin-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin Reed: talk expression | wiring |
| `tamsin-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin Reed: win expression | wiring |
| `twins-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lumen Twins: idle expression | wiring |
| `twins-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lumen Twins: lose expression | wiring |
| `twins-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lumen Twins: win expression | wiring |
| `umbra-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lady Umbra of the Black Kiln: idle expression | wiring |
| `umbra-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lady Umbra of the Black Kiln: lose expression | wiring |
| `umbra-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lady Umbra of the Black Kiln: praise expression | wiring |
| `umbra-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lady Umbra of the Black Kiln: shock expression | wiring |
| `umbra-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lady Umbra of the Black Kiln: taunt expression | wiring |
| `umbra-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lady Umbra of the Black Kiln: win expression | wiring |
| `vesper-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Ash: idle expression | wiring |
| `vesper-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Ash: lose expression | wiring |
| `vesper-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Ash: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (13)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `glaze-pot.png` | 1024x1024 | 1:1 | - | 3D model: glaze-pot | 3D |
| `kiln.png` | 1024x1024 | 1:1 | - | 3D model: kiln | 3D |
| `tile-black-a.png` | 1024x1024 | 1:1 | - | 3D model: tile-black-a | 3D |
| `tile-black-b.png` | 1024x1024 | 1:1 | - | 3D model: tile-black-b | 3D |
| `tile-blue-a.png` | 1024x1024 | 1:1 | - | 3D model: tile-blue-a | 3D |
| `tile-blue-b.png` | 1024x1024 | 1:1 | - | 3D model: tile-blue-b | 3D |
| `tile-red-a.png` | 1024x1024 | 1:1 | - | 3D model: tile-red-a | 3D |
| `tile-red-b.png` | 1024x1024 | 1:1 | - | 3D model: tile-red-b | 3D |
| `tile-teal-a.png` | 1024x1024 | 1:1 | - | 3D model: tile-teal-a | 3D |
| `tile-teal-b.png` | 1024x1024 | 1:1 | - | 3D model: tile-teal-b | 3D |
| `tile-yellow-a.png` | 1024x1024 | 1:1 | - | 3D model: tile-yellow-a | 3D |
| `tile-yellow-b.png` | 1024x1024 | 1:1 | - | 3D model: tile-yellow-b | 3D |
| `trowel.png` | 1024x1024 | 1:1 | - | 3D model: trowel | 3D |
