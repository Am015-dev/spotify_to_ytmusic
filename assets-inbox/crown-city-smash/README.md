# Inbox: crown-city-smash

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (5)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `btn-primary-button-plate.webp` | 1024x512 | 1.79 | yes (flat white background, we key it) | btn primary button plate | wiring |
| `gx-bar-plate.webp` | 1024x512 | 7.5 | yes (flat white background, we key it) | gx bar plate | wiring |
| `gx-drawer-head-plate.webp` | 1024x512 | 5.96 | yes (flat white background, we key it) | gx drawer head plate | wiring |
| `gxh-ok-button-plate.webp` | 512x512 | 2.06 | yes (flat white background, we key it) | gxh ok button plate | wiring |
| `newsbtn-button-plate.webp` | 512x512 | 11.94 | yes (flat white background, we key it) | newsbtn button plate | wiring |

## Wave 7 pictures (15)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `back-harbor.png` | 768x1024 | 3:4 | no | Painting: back-harbor | wiring |
| `back-spire.png` | 768x1024 | 3:4 | no | Painting: back-spire | wiring |
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-brass-beetle.png` | 1024x768 | 4:3 | no | Painting: event-brass-beetle | wiring |
| `event-evolution.png` | 1024x768 | 4:3 | no | Painting: event-evolution | wiring |
| `event-portal-opens.png` | 1024x768 | 4:3 | no | Painting: event-portal-opens | wiring |
| `table-harbor-dawn.png` | 1920x1080 | 16:9 | no | Painting: table-harbor-dawn | wiring |
| `table-harbor-dawn-phone.png` | 1080x1920 | 9:16 | no | Painting: table-harbor-dawn-phone | wiring |
| `table-portal-suburbs.png` | 1920x1080 | 16:9 | no | Painting: table-portal-suburbs | wiring |
| `table-portal-suburbs-phone.png` | 1080x1920 | 9:16 | no | Painting: table-portal-suburbs-phone | wiring |
| `table-spire-night.png` | 1920x1080 | 16:9 | no | Painting: table-spire-night | wiring |
| `table-spire-night-phone.png` | 1080x1920 | 9:16 | no | Painting: table-spire-night-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (66)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `boltbox-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Boltbox: attack pose | wiring |
| `boltbox-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Boltbox: hit pose | wiring |
| `boltbox-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Boltbox: idle pose | wiring |
| `boltbox-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Boltbox: lose pose | wiring |
| `boltbox-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Boltbox: walk-a pose | wiring |
| `boltbox-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Boltbox: walk-b pose | wiring |
| `boltbox-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Boltbox: win pose | wiring |
| `bramblebat-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramblebat: attack pose | wiring |
| `bramblebat-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramblebat: hit pose | wiring |
| `bramblebat-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramblebat: idle pose | wiring |
| `bramblebat-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramblebat: lose pose | wiring |
| `bramblebat-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramblebat: walk-a pose | wiring |
| `bramblebat-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramblebat: walk-b pose | wiring |
| `bramblebat-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bramblebat: win pose | wiring |
| `clampede-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Clampede: attack pose | wiring |
| `clampede-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Clampede: hit pose | wiring |
| `clampede-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Clampede: idle pose | wiring |
| `clampede-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Clampede: lose pose | wiring |
| `clampede-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Clampede: walk-a pose | wiring |
| `clampede-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Clampede: walk-b pose | wiring |
| `clampede-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Clampede: win pose | wiring |
| `cortexa-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cortexa: attack pose | wiring |
| `cortexa-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cortexa: hit pose | wiring |
| `cortexa-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cortexa: idle pose | wiring |
| `cortexa-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cortexa: lose pose | wiring |
| `cortexa-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cortexa: walk-a pose | wiring |
| `cortexa-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cortexa: walk-b pose | wiring |
| `cortexa-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Cortexa: win pose | wiring |
| `dot-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dot Inkwell: idle pose | wiring |
| `dot-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dot Inkwell: lose pose | wiring |
| `dot-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dot Inkwell: win pose | wiring |
| `glacyx-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Glacyx: attack pose | wiring |
| `glacyx-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Glacyx: hit pose | wiring |
| `glacyx-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Glacyx: idle pose | wiring |
| `glacyx-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Glacyx: lose pose | wiring |
| `glacyx-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Glacyx: walk-a pose | wiring |
| `glacyx-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Glacyx: walk-b pose | wiring |
| `glacyx-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Glacyx: win pose | wiring |
| `magmaw-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Baron Magmaw: attack pose | wiring |
| `magmaw-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Baron Magmaw: hit pose | wiring |
| `magmaw-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Baron Magmaw: idle pose | wiring |
| `magmaw-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Baron Magmaw: lose pose | wiring |
| `magmaw-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Baron Magmaw: walk-a pose | wiring |
| `magmaw-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Baron Magmaw: walk-b pose | wiring |
| `magmaw-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Baron Magmaw: win pose | wiring |
| `shroomhulk-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Shroomhulk: attack pose | wiring |
| `shroomhulk-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Shroomhulk: hit pose | wiring |
| `shroomhulk-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Shroomhulk: idle pose | wiring |
| `shroomhulk-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Shroomhulk: lose pose | wiring |
| `shroomhulk-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Shroomhulk: walk-a pose | wiring |
| `shroomhulk-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Shroomhulk: walk-b pose | wiring |
| `shroomhulk-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Shroomhulk: win pose | wiring |
| `squidrik-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Squidrik: attack pose | wiring |
| `squidrik-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Squidrik: hit pose | wiring |
| `squidrik-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Squidrik: idle pose | wiring |
| `squidrik-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Squidrik: lose pose | wiring |
| `squidrik-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Squidrik: walk-a pose | wiring |
| `squidrik-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Squidrik: walk-b pose | wiring |
| `squidrik-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Squidrik: win pose | wiring |
| `voltusk-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Voltusk: attack pose | wiring |
| `voltusk-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Voltusk: hit pose | wiring |
| `voltusk-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Voltusk: idle pose | wiring |
| `voltusk-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Voltusk: lose pose | wiring |
| `voltusk-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Voltusk: walk-a pose | wiring |
| `voltusk-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Voltusk: walk-b pose | wiring |
| `voltusk-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Voltusk: win pose | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (14)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `brainjack-token.png` | 1024x1024 | 1:1 | - | 3D model: brainjack-token | 3D |
| `brass-beetle.png` | 1024x1024 | 1:1 | - | 3D model: brass-beetle | 3D |
| `city-bus.png` | 1024x1024 | 1:1 | - | 3D model: city-bus | 3D |
| `container-stack.png` | 1024x1024 | 1:1 | - | 3D model: container-stack | 3D |
| `crown-spire.png` | 1024x1024 | 1:1 | - | 3D model: crown-spire | 3D |
| `harbor-crane.png` | 1024x1024 | 1:1 | - | 3D model: harbor-crane | 3D |
| `lighthouse.png` | 1024x1024 | 1:1 | - | 3D model: lighthouse | 3D |
| `parked-car.png` | 1024x1024 | 1:1 | - | 3D model: parked-car | 3D |
| `street-lamp.png` | 1024x1024 | 1:1 | - | 3D model: street-lamp | 3D |
| `street-tree.png` | 1024x1024 | 1:1 | - | 3D model: street-tree | 3D |
| `tower-e.png` | 1024x1024 | 1:1 | - | 3D model: tower-e | 3D |
| `tower-f.png` | 1024x1024 | 1:1 | - | 3D model: tower-f | 3D |
| `tower-g.png` | 1024x1024 | 1:1 | - | 3D model: tower-g | 3D |
| `tower-h.png` | 1024x1024 | 1:1 | - | 3D model: tower-h | 3D |
