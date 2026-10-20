# Inbox: hollowbough

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (3)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `board-plate.webp` | 1024x1024 | 0.54 | no | board plate | wiring |
| `chipb-button-plate.webp` | 512x512 | 1.36 | yes (flat white background, we key it) | chipb button plate | wiring |
| `start-plate.webp` | 1024x1024 | 0.51 | no | start plate | wiring |

## Wave 7 pictures (10)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-first-snow.png` | 1024x768 | 4:3 | no | Painting: event-first-snow | wiring |
| `event-harvest-feast.png` | 1024x768 | 4:3 | no | Painting: event-harvest-feast | wiring |
| `table-autumn-hollow.png` | 1920x1080 | 16:9 | no | Painting: table-autumn-hollow | wiring |
| `table-autumn-hollow-phone.png` | 1080x1920 | 9:16 | no | Painting: table-autumn-hollow-phone | wiring |
| `table-summer-brook.png` | 1920x1080 | 16:9 | no | Painting: table-summer-brook | wiring |
| `table-summer-brook-phone.png` | 1080x1920 | 9:16 | no | Painting: table-summer-brook-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (42)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bramble-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramble: attack pose | wiring |
| `bramble-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramble: hit pose | wiring |
| `bramble-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramble: idle pose | wiring |
| `bramble-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramble: lose pose | wiring |
| `bramble-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramble: walk-a pose | wiring |
| `bramble-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramble: walk-b pose | wiring |
| `bramble-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramble: win pose | wiring |
| `fern-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Fern: attack pose | wiring |
| `fern-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Fern: hit pose | wiring |
| `fern-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Fern: idle pose | wiring |
| `fern-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Fern: lose pose | wiring |
| `fern-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Fern: walk-a pose | wiring |
| `fern-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Fern: walk-b pose | wiring |
| `fern-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Fern: win pose | wiring |
| `grimbeard-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Grimbeard: attack pose | wiring |
| `grimbeard-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Grimbeard: hit pose | wiring |
| `grimbeard-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Grimbeard: idle pose | wiring |
| `grimbeard-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Grimbeard: lose pose | wiring |
| `grimbeard-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Grimbeard: walk-a pose | wiring |
| `grimbeard-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Grimbeard: walk-b pose | wiring |
| `grimbeard-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Grimbeard: win pose | wiring |
| `hazel-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hazel Quickpaw: attack pose | wiring |
| `hazel-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hazel Quickpaw: hit pose | wiring |
| `hazel-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hazel Quickpaw: idle pose | wiring |
| `hazel-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hazel Quickpaw: lose pose | wiring |
| `hazel-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hazel Quickpaw: walk-a pose | wiring |
| `hazel-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hazel Quickpaw: walk-b pose | wiring |
| `hazel-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hazel Quickpaw: win pose | wiring |
| `quill-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill: attack pose | wiring |
| `quill-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill: hit pose | wiring |
| `quill-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill: idle pose | wiring |
| `quill-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill: lose pose | wiring |
| `quill-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill: walk-a pose | wiring |
| `quill-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill: walk-b pose | wiring |
| `quill-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill: win pose | wiring |
| `thistle-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Thistle: attack pose | wiring |
| `thistle-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Thistle: hit pose | wiring |
| `thistle-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Thistle: idle pose | wiring |
| `thistle-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Thistle: lose pose | wiring |
| `thistle-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Thistle: walk-a pose | wiring |
| `thistle-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Thistle: walk-b pose | wiring |
| `thistle-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Thistle: win pose | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (12)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `acorn.png` | 1024x1024 | 1:1 | - | 3D model: acorn | 3D |
| `berry-bush.png` | 1024x1024 | 1:1 | - | 3D model: berry-bush | 3D |
| `hollow-log.png` | 1024x1024 | 1:1 | - | 3D model: hollow-log | 3D |
| `mushroom-ring.png` | 1024x1024 | 1:1 | - | 3D model: mushroom-ring | 3D |
| `snail.png` | 1024x1024 | 1:1 | - | 3D model: snail | 3D |
| `stump.png` | 1024x1024 | 1:1 | - | 3D model: stump | 3D |
| `worker-badger.png` | 1024x1024 | 1:1 | - | 3D model: worker-badger | 3D |
| `worker-hare.png` | 1024x1024 | 1:1 | - | 3D model: worker-hare | 3D |
| `worker-hedgehog.png` | 1024x1024 | 1:1 | - | 3D model: worker-hedgehog | 3D |
| `worker-porcupine.png` | 1024x1024 | 1:1 | - | 3D model: worker-porcupine | 3D |
| `worker-rabbit.png` | 1024x1024 | 1:1 | - | 3D model: worker-rabbit | 3D |
| `worker-squirrel.png` | 1024x1024 | 1:1 | - | 3D model: worker-squirrel | 3D |
