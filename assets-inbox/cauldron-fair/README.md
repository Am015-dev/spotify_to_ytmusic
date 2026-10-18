# Inbox: cauldron-fair

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (3)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `gxh-ok-button-plate.webp` | 512x512 | 2.05 | yes (flat white background, we key it) | gxh ok button plate | wiring |
| `tlink-button-plate.webp` | 1024x512 | 8.14 | yes (flat white background, we key it) | tlink button plate | wiring |
| `ttl-bg-picture.webp` | 1024x1024 | 0.51 | no | ttl bg picture | wiring |

## Wave 7 pictures (11)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-boom-a.png` | 1024x768 | 4:3 | no | Painting: event-boom-a | wiring |
| `event-boom-b.png` | 1024x768 | 4:3 | no | Painting: event-boom-b | wiring |
| `event-boom-c.png` | 1024x768 | 4:3 | no | Painting: event-boom-c | wiring |
| `table-golden-ladle-stage.png` | 1920x1080 | 16:9 | no | Painting: table-golden-ladle-stage | wiring |
| `table-golden-ladle-stage-phone.png` | 1080x1920 | 9:16 | no | Painting: table-golden-ladle-stage-phone | wiring |
| `table-night-fair.png` | 1920x1080 | 16:9 | no | Painting: table-night-fair | wiring |
| `table-night-fair-phone.png` | 1080x1920 | 9:16 | no | Painting: table-night-fair-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (38)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bag-closed.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bag: closed state | wiring |
| `bag-empty.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bag: empty state | wiring |
| `bag-open.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bag: open state | wiring |
| `bag-shake-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bag: shake-a state | wiring |
| `bag-shake-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bag: shake-b state | wiring |
| `cauldron-boil-over.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cauldron: boil-over state | wiring |
| `cauldron-boom.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cauldron: boom state | wiring |
| `cauldron-bubble.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cauldron: bubble state | wiring |
| `cauldron-simmer.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | cauldron: simmer state | wiring |
| `hask-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Granny Hask: idle expression | wiring |
| `hask-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Granny Hask: lose expression | wiring |
| `hask-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Granny Hask: talk expression | wiring |
| `hask-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Granny Hask: win expression | wiring |
| `mirabel-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mirabel: idle expression | wiring |
| `mirabel-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mirabel: lose expression | wiring |
| `mirabel-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mirabel: win expression | wiring |
| `odo-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odo: idle expression | wiring |
| `odo-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odo: lose expression | wiring |
| `odo-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odo: praise expression | wiring |
| `odo-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odo: shock expression | wiring |
| `odo-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odo: taunt expression | wiring |
| `odo-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Odo: win expression | wiring |
| `tamsin-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin: idle expression | wiring |
| `tamsin-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin: lose expression | wiring |
| `tamsin-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin: praise expression | wiring |
| `tamsin-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin: shock expression | wiring |
| `tamsin-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin: taunt expression | wiring |
| `tamsin-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin: win expression | wiring |
| `vesper-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Madame Vesper: idle expression | wiring |
| `vesper-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Madame Vesper: lose expression | wiring |
| `vesper-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Madame Vesper: praise expression | wiring |
| `vesper-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Madame Vesper: shock expression | wiring |
| `vesper-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Madame Vesper: taunt expression | wiring |
| `vesper-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Madame Vesper: win expression | wiring |
| `wynne-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wynne: idle expression | wiring |
| `wynne-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wynne: lose expression | wiring |
| `wynne-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wynne: talk expression | wiring |
| `wynne-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wynne: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (9)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bag-ember.png` | 1024x1024 | 1:1 | - | 3D model: bag-ember | 3D |
| `bag-moss.png` | 1024x1024 | 1:1 | - | 3D model: bag-moss | 3D |
| `cauldron.png` | 1024x1024 | 1:1 | - | 3D model: cauldron | 3D |
| `chip-skull.png` | 1024x1024 | 1:1 | - | 3D model: chip-skull | 3D |
| `chip-spark.png` | 1024x1024 | 1:1 | - | 3D model: chip-spark | 3D |
| `fair-lantern.png` | 1024x1024 | 1:1 | - | 3D model: fair-lantern | 3D |
| `fizz-jar.png` | 1024x1024 | 1:1 | - | 3D model: fizz-jar | 3D |
| `ladle.png` | 1024x1024 | 1:1 | - | 3D model: ladle | 3D |
| `potion-bottle.png` | 1024x1024 | 1:1 | - | 3D model: potion-bottle | 3D |
