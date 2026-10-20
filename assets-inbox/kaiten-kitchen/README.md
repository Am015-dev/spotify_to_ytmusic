# Inbox: kaiten-kitchen

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (6)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `chipb-button-plate.webp` | 512x512 | 1.52 | yes (flat white background, we key it) | chipb button plate | wiring |
| `chipb-seatb-button-plate.webp` | 512x512 | 1.67 | yes (flat white background, we key it) | chipb seatb button plate | wiring |
| `gx-bar-plate.webp` | 1024x512 | 8.86 | yes (flat white background, we key it) | gx bar plate | wiring |
| `tlink-button-plate.webp` | 512x512 | 3.03 | yes (flat white background, we key it) | tlink button plate | wiring |
| `ttl-bg-dim-picture.webp` | 1024x1024 | 0.51 | no | ttl bg dim picture | wiring |
| `ttl-bg-picture.webp` | 1024x1024 | 0.51 | no | ttl bg picture | wiring |

## Wave 7 pictures (11)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `belt-b.png` | 1920x384 | 16:9 | no | Painting: belt-b | wiring |
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-golden-plate.png` | 1024x768 | 4:3 | no | Painting: event-golden-plate | wiring |
| `event-lunch-rush.png` | 1024x768 | 4:3 | no | Painting: event-lunch-rush | wiring |
| `table-breakfast-counter.png` | 1920x1080 | 16:9 | no | Painting: table-breakfast-counter | wiring |
| `table-breakfast-counter-phone.png` | 1080x1920 | 9:16 | no | Painting: table-breakfast-counter-phone | wiring |
| `table-rainy-evening.png` | 1920x1080 | 16:9 | no | Painting: table-rainy-evening | wiring |
| `table-rainy-evening-phone.png` | 1080x1920 | 9:16 | no | Painting: table-rainy-evening-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (33)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `cloche-closed.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cloche: closed state | wiring |
| `cloche-lift-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cloche: lift-a state | wiring |
| `cloche-lift-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cloche: lift-b state | wiring |
| `cloche-open.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cloche: open state | wiring |
| `kofi-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kofi: idle expression | wiring |
| `kofi-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kofi: lose expression | wiring |
| `kofi-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kofi: praise expression | wiring |
| `kofi-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kofi: shock expression | wiring |
| `kofi-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kofi: taunt expression | wiring |
| `kofi-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kofi: win expression | wiring |
| `mina-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mina: idle expression | wiring |
| `mina-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mina: lose expression | wiring |
| `mina-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mina: talk expression | wiring |
| `mina-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mina: win expression | wiring |
| `odile-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odile: idle expression | wiring |
| `odile-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odile: lose expression | wiring |
| `odile-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odile: praise expression | wiring |
| `odile-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odile: shock expression | wiring |
| `odile-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odile: taunt expression | wiring |
| `odile-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odile: win expression | wiring |
| `pip-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip: idle expression | wiring |
| `pip-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip: lose expression | wiring |
| `pip-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip: win expression | wiring |
| `suzu-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Auntie Suzu: idle expression | wiring |
| `suzu-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Auntie Suzu: lose expression | wiring |
| `suzu-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Auntie Suzu: talk expression | wiring |
| `suzu-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Auntie Suzu: win expression | wiring |
| `taro-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Taro: idle expression | wiring |
| `taro-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Taro: lose expression | wiring |
| `taro-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Taro: praise expression | wiring |
| `taro-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Taro: shock expression | wiring |
| `taro-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Taro: taunt expression | wiring |
| `taro-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Taro: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (10)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `custard-cup.png` | 1024x1024 | 1:1 | - | 3D model: custard-cup | 3D |
| `dumpling.png` | 1024x1024 | 1:1 | - | 3D model: dumpling | 3D |
| `maki.png` | 1024x1024 | 1:1 | - | 3D model: maki | 3D |
| `nigiri.png` | 1024x1024 | 1:1 | - | 3D model: nigiri | 3D |
| `noodle-bowl.png` | 1024x1024 | 1:1 | - | 3D model: noodle-bowl | 3D |
| `plate-gold.png` | 1024x1024 | 1:1 | - | 3D model: plate-gold | 3D |
| `plate-green.png` | 1024x1024 | 1:1 | - | 3D model: plate-green | 3D |
| `plate-red.png` | 1024x1024 | 1:1 | - | 3D model: plate-red | 3D |
| `soy-bottle.png` | 1024x1024 | 1:1 | - | 3D model: soy-bottle | 3D |
| `tea-cup.png` | 1024x1024 | 1:1 | - | 3D model: tea-cup | 3D |
