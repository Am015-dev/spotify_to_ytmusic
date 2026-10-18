# Inbox: tidewake

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (5)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `button-button-plate.webp` | 512x512 | 3.63 | yes (flat white background, we key it) | button button plate | wiring |
| `gx-bar-plate.webp` | 1024x512 | 8.86 | yes (flat white background, we key it) | gx bar plate | wiring |
| `gx-drawer-head-plate.webp` | 1024x512 | 5.96 | yes (flat white background, we key it) | gx drawer head plate | wiring |
| `gxh-ok-button-plate.webp` | 512x512 | 1.99 | yes (flat white background, we key it) | gxh ok button plate | wiring |
| `start-plate.webp` | 1024x1024 | 0.51 | no | start plate | wiring |

## Wave 7 pictures (13)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-leviathan.png` | 1024x768 | 4:3 | no | Painting: event-leviathan | wiring |
| `table-harbor-noon.png` | 1920x1080 | 16:9 | no | Painting: table-harbor-noon | wiring |
| `table-harbor-noon-phone.png` | 1080x1920 | 9:16 | no | Painting: table-harbor-noon-phone | wiring |
| `table-rift-night.png` | 1920x1080 | 16:9 | no | Painting: table-rift-night | wiring |
| `table-rift-night-phone.png` | 1080x1920 | 9:16 | no | Painting: table-rift-night-phone | wiring |
| `tile-water-e.png` | 512x512 | 1:1 | no | Painting: tile-water-e | wiring |
| `tile-water-f.png` | 512x512 | 1:1 | no | Painting: tile-water-f | wiring |
| `tile-water-g.png` | 512x512 | 1:1 | no | Painting: tile-water-g | wiring |
| `tile-water-h.png` | 512x512 | 1:1 | no | Painting: tile-water-h | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (42)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `brann-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brann Ashkeel: idle expression | wiring |
| `brann-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brann Ashkeel: lose expression | wiring |
| `brann-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brann Ashkeel: win expression | wiring |
| `crown-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Abyssal Crown: attack pose | wiring |
| `crown-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Abyssal Crown: hit pose | wiring |
| `crown-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Abyssal Crown: idle pose | wiring |
| `crown-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Abyssal Crown: lose pose | wiring |
| `crown-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Abyssal Crown: win pose | wiring |
| `harrow-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Gull Harrow: idle expression | wiring |
| `harrow-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Gull Harrow: lose expression | wiring |
| `harrow-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Gull Harrow: praise expression | wiring |
| `harrow-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Gull Harrow: shock expression | wiring |
| `harrow-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Gull Harrow: taunt expression | wiring |
| `harrow-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Gull Harrow: win expression | wiring |
| `osk-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grandmother Osk: idle expression | wiring |
| `osk-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grandmother Osk: lose expression | wiring |
| `osk-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grandmother Osk: talk expression | wiring |
| `osk-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grandmother Osk: win expression | wiring |
| `sabel-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabel Riftwright: idle expression | wiring |
| `sabel-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabel Riftwright: lose expression | wiring |
| `sabel-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabel Riftwright: praise expression | wiring |
| `sabel-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabel Riftwright: shock expression | wiring |
| `sabel-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabel Riftwright: taunt expression | wiring |
| `sabel-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sabel Riftwright: win expression | wiring |
| `saltshade-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saltshade: attack pose | wiring |
| `saltshade-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saltshade: hit pose | wiring |
| `saltshade-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saltshade: idle pose | wiring |
| `saltshade-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saltshade: lose pose | wiring |
| `saltshade-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Saltshade: win pose | wiring |
| `vey-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Corsair Vey: idle expression | wiring |
| `vey-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Corsair Vey: lose expression | wiring |
| `vey-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Corsair Vey: win expression | wiring |
| `wick-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wick: idle expression | wiring |
| `wick-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wick: lose expression | wiring |
| `wick-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wick: talk expression | wiring |
| `wick-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wick: win expression | wiring |
| `ysolde-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Admiral Ysolde: idle expression | wiring |
| `ysolde-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Admiral Ysolde: lose expression | wiring |
| `ysolde-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Admiral Ysolde: praise expression | wiring |
| `ysolde-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Admiral Ysolde: shock expression | wiring |
| `ysolde-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Admiral Ysolde: taunt expression | wiring |
| `ysolde-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Admiral Ysolde: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (9)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `buoy.png` | 1024x1024 | 1:1 | - | 3D model: buoy | 3D |
| `galleon.png` | 1024x1024 | 1:1 | - | 3D model: galleon | 3D |
| `junk-b.png` | 1024x1024 | 1:1 | - | 3D model: junk-b | 3D |
| `junk-c.png` | 1024x1024 | 1:1 | - | 3D model: junk-c | 3D |
| `junk-d.png` | 1024x1024 | 1:1 | - | 3D model: junk-d | 3D |
| `rift-gate.png` | 1024x1024 | 1:1 | - | 3D model: rift-gate | 3D |
| `sea-lighthouse.png` | 1024x1024 | 1:1 | - | 3D model: sea-lighthouse | 3D |
| `sea-stack.png` | 1024x1024 | 1:1 | - | 3D model: sea-stack | 3D |
| `treasure-barrel.png` | 1024x1024 | 1:1 | - | 3D model: treasure-barrel | 3D |
