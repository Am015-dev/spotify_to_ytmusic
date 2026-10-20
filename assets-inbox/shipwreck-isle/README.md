# Inbox: shipwreck-isle

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (5)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `char-soldier.webp` | 256x256 | 1:1 | no | Card art, part 2 | wiring |
| `gx-bar-plate.webp` | 1024x512 | 8.86 | yes (flat white background, we key it) | gx bar plate | wiring |
| `gxt-b-button-plate.webp` | 1024x512 | 6.29 | yes (flat white background, we key it) | gxt b button plate | wiring |
| `gxt-b-pri-button-plate.webp` | 1024x512 | 6.29 | yes (flat white background, we key it) | gxt b pri button plate | wiring |
| `scen-button-plate.webp` | 1024x512 | 2.44 | yes (flat white background, we key it) | scen button plate | wiring |

## Wave 7 pictures (22)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `camp-horizon-2.png` | 256x256 | 1:1 | no | Painting: camp-horizon-2 | wiring |
| `camp-horizon-3.png` | 256x256 | 1:1 | no | Painting: camp-horizon-3 | wiring |
| `camp-shroud-2.png` | 256x256 | 1:1 | no | Painting: camp-shroud-2 | wiring |
| `camp-shroud-3.png` | 256x256 | 1:1 | no | Painting: camp-shroud-3 | wiring |
| `camp-undertow-2.png` | 256x256 | 1:1 | no | Painting: camp-undertow-2 | wiring |
| `camp-undertow-3.png` | 256x256 | 1:1 | no | Painting: camp-undertow-3 | wiring |
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `hex-beach-b.png` | 512x512 | 1:1 | no | Painting: hex-beach-b | prefix |
| `hex-beach-c.png` | 512x512 | 1:1 | no | Painting: hex-beach-c | prefix |
| `hex-hills-b.png` | 512x512 | 1:1 | no | Painting: hex-hills-b | prefix |
| `hex-hills-c.png` | 512x512 | 1:1 | no | Painting: hex-hills-c | prefix |
| `hex-mountains-b.png` | 512x512 | 1:1 | no | Painting: hex-mountains-b | prefix |
| `hex-mountains-c.png` | 512x512 | 1:1 | no | Painting: hex-mountains-c | prefix |
| `hex-plains-b.png` | 512x512 | 1:1 | no | Painting: hex-plains-b | prefix |
| `hex-plains-c.png` | 512x512 | 1:1 | no | Painting: hex-plains-c | prefix |
| `hex-river-b.png` | 512x512 | 1:1 | no | Painting: hex-river-b | prefix |
| `hex-river-c.png` | 512x512 | 1:1 | no | Painting: hex-river-c | prefix |
| `table-jungle-clearing.png` | 1920x1080 | 16:9 | no | Painting: table-jungle-clearing | wiring |
| `table-jungle-clearing-phone.png` | 1080x1920 | 9:16 | no | Painting: table-jungle-clearing-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (43)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `ada-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Ada: idle pose | wiring |
| `ada-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Ada: lose pose | wiring |
| `ada-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Ada: win pose | wiring |
| `carpenter-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Carpenter: attack pose | wiring |
| `carpenter-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Carpenter: hit pose | wiring |
| `carpenter-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Carpenter: idle pose | wiring |
| `carpenter-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Carpenter: lose pose | wiring |
| `carpenter-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Carpenter: walk-a pose | wiring |
| `carpenter-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Carpenter: walk-b pose | wiring |
| `carpenter-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Carpenter: win pose | wiring |
| `cook-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Cook: attack pose | wiring |
| `cook-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Cook: hit pose | wiring |
| `cook-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Cook: idle pose | wiring |
| `cook-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Cook: lose pose | wiring |
| `cook-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Cook: walk-a pose | wiring |
| `cook-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Cook: walk-b pose | wiring |
| `cook-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Cook: win pose | wiring |
| `explorer-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Explorer: attack pose | wiring |
| `explorer-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Explorer: hit pose | wiring |
| `explorer-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Explorer: idle pose | wiring |
| `explorer-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Explorer: lose pose | wiring |
| `explorer-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Explorer: walk-a pose | wiring |
| `explorer-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Explorer: walk-b pose | wiring |
| `explorer-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Explorer: win pose | wiring |
| `friday-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Friday: attack pose | wiring |
| `friday-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Friday: hit pose | wiring |
| `friday-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Friday: idle pose | wiring |
| `friday-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Friday: lose pose | wiring |
| `friday-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Friday: walk-a pose | wiring |
| `friday-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Friday: walk-b pose | wiring |
| `friday-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Friday: win pose | wiring |
| `prowler-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | a lean black jungle cat with glowing yellow eyes and a long tail: attack pose | wiring |
| `prowler-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | a lean black jungle cat with glowing yellow eyes and a long tail: hit pose | wiring |
| `prowler-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | a lean black jungle cat with glowing yellow eyes and a long tail: idle pose | wiring |
| `prowler-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | a lean black jungle cat with glowing yellow eyes and a long tail: lose pose | wiring |
| `prowler-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | a lean black jungle cat with glowing yellow eyes and a long tail: win pose | wiring |
| `soldier-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Soldier: attack pose | wiring |
| `soldier-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Soldier: hit pose | wiring |
| `soldier-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Soldier: idle pose | wiring |
| `soldier-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Soldier: lose pose | wiring |
| `soldier-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Soldier: walk-a pose | wiring |
| `soldier-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Soldier: walk-b pose | wiring |
| `soldier-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Soldier: win pose | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (12)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `sw-ada.png` | 1024x1024 | 1:1 | - | 3D model: sw-ada | 3D |
| `sw-altar.png` | 1024x1024 | 1:1 | - | 3D model: sw-altar | 3D |
| `sw-barrel.png` | 1024x1024 | 1:1 | - | 3D model: sw-barrel | 3D |
| `sw-crate.png` | 1024x1024 | 1:1 | - | 3D model: sw-crate | 3D |
| `sw-cross.png` | 1024x1024 | 1:1 | - | 3D model: sw-cross | 3D |
| `sw-pine.png` | 1024x1024 | 1:1 | - | 3D model: sw-pine | 3D |
| `sw-prowler.png` | 1024x1024 | 1:1 | - | 3D model: sw-prowler | 3D |
| `sw-reeds.png` | 1024x1024 | 1:1 | - | 3D model: sw-reeds | 3D |
| `sw-rock-a.png` | 1024x1024 | 1:1 | - | 3D model: sw-rock-a | 3D |
| `sw-rock-b.png` | 1024x1024 | 1:1 | - | 3D model: sw-rock-b | 3D |
| `sw-soldier.png` | 1024x1024 | 1:1 | - | 3D model: sw-soldier | 3D |
| `sw-wreck.png` | 1024x1024 | 1:1 | - | 3D model: sw-wreck | 3D |
