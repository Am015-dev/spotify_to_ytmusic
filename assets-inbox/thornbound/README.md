# Inbox: thornbound

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (7)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `board-plate.webp` | 1024x1024 | 0.71 | no | board plate | wiring |
| `gx-bar-plate.webp` | 1024x512 | 8.86 | yes (flat white background, we key it) | gx bar plate | wiring |
| `gx-drawer-head-plate.webp` | 1024x512 | 6.42 | yes (flat white background, we key it) | gx drawer head plate | wiring |
| `gxh-ok-button-plate.webp` | 512x512 | 2.04 | yes (flat white background, we key it) | gxh ok button plate | wiring |
| `tbtn-button-plate.webp` | 1024x512 | 5.4 | yes (flat white background, we key it) | tbtn button plate | wiring |
| `tbtn-story-button-plate.webp` | 1024x512 | 5.4 | yes (flat white background, we key it) | tbtn story button plate | wiring |
| `tkey-picture.webp` | 1024x1024 | 0.51 | no | tkey picture | wiring |

## Wave 7 pictures (11)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `back-moth-ossuary.png` | 768x1024 | 3:4 | no | Painting: back-moth-ossuary | prefix |
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | prefix |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | prefix |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | prefix |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | prefix |
| `event-coronation.png` | 1024x768 | 4:3 | no | Painting: event-coronation | wiring |
| `event-uprising.png` | 1024x768 | 4:3 | no | Painting: event-uprising | wiring |
| `table-ossuary.png` | 1920x1080 | 16:9 | no | Painting: table-ossuary | wiring |
| `table-ossuary-phone.png` | 1080x1920 | 9:16 | no | Painting: table-ossuary-phone | wiring |
| `table-sinks-masquerade.png` | 1920x1080 | 16:9 | no | Painting: table-sinks-masquerade | wiring |
| `table-sinks-masquerade-phone.png` | 1080x1920 | 9:16 | no | Painting: table-sinks-masquerade-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (41)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `fennick-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Fennick: idle expression | wiring |
| `fennick-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Fennick: lose expression | wiring |
| `fennick-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Brother Fennick: win expression | wiring |
| `halvard-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Seneschal Halvard Crane: idle expression | wiring |
| `halvard-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Seneschal Halvard Crane: lose expression | wiring |
| `halvard-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Seneschal Halvard Crane: praise expression | wiring |
| `halvard-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Seneschal Halvard Crane: shock expression | wiring |
| `halvard-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Seneschal Halvard Crane: taunt expression | wiring |
| `halvard-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Seneschal Halvard Crane: win expression | wiring |
| `ida-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Warden-General Ida Marsh: idle expression | wiring |
| `ida-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Warden-General Ida Marsh: lose expression | wiring |
| `ida-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Warden-General Ida Marsh: win expression | wiring |
| `orlen-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Orlen the Moth Priest: idle expression | wiring |
| `orlen-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Orlen the Moth Priest: lose expression | wiring |
| `orlen-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Orlen the Moth Priest: win expression | wiring |
| `quill-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mother Quill: idle expression | wiring |
| `quill-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mother Quill: lose expression | wiring |
| `quill-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Mother Quill: win expression | wiring |
| `rook-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Captain Rook Ashby: idle expression | wiring |
| `rook-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Captain Rook Ashby: lose expression | wiring |
| `rook-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Captain Rook Ashby: win expression | wiring |
| `sable-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sable: idle expression | wiring |
| `sable-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sable: lose expression | wiring |
| `sable-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sable: praise expression | wiring |
| `sable-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sable: shock expression | wiring |
| `sable-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sable: taunt expression | wiring |
| `sable-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sable: win expression | wiring |
| `stag-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Pale Stag-King: idle expression | wiring |
| `stag-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Pale Stag-King: lose expression | wiring |
| `stag-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Pale Stag-King: praise expression | wiring |
| `stag-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Pale Stag-King: shock expression | wiring |
| `stag-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Pale Stag-King: taunt expression | wiring |
| `stag-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Pale Stag-King: win expression | wiring |
| `tamsin-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin of the Gate: idle expression | wiring |
| `tamsin-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin of the Gate: lose expression | wiring |
| `tamsin-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin of the Gate: talk expression | wiring |
| `tamsin-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tamsin of the Gate: win expression | wiring |
| `ysolde-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Ysolde the Rune-Reader: idle expression | wiring |
| `ysolde-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Ysolde the Rune-Reader: lose expression | wiring |
| `ysolde-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Ysolde the Rune-Reader: talk expression | wiring |
| `ysolde-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Ysolde the Rune-Reader: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (10)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `banner-clans.png` | 1024x1024 | 1:1 | - | 3D model: banner-clans | 3D |
| `banner-nobility.png` | 1024x1024 | 1:1 | - | 3D model: banner-nobility | 3D |
| `brazier.png` | 1024x1024 | 1:1 | - | 3D model: brazier | 3D |
| `cairn.png` | 1024x1024 | 1:1 | - | 3D model: cairn | 3D |
| `candelabra.png` | 1024x1024 | 1:1 | - | 3D model: candelabra | 3D |
| `pawn-agent.png` | 1024x1024 | 1:1 | - | 3D model: pawn-agent | 3D |
| `pawn-knight.png` | 1024x1024 | 1:1 | - | 3D model: pawn-knight | 3D |
| `pawn-priest.png` | 1024x1024 | 1:1 | - | 3D model: pawn-priest | 3D |
| `pawn-rebel.png` | 1024x1024 | 1:1 | - | 3D model: pawn-rebel | 3D |
| `stag-statue.png` | 1024x1024 | 1:1 | - | 3D model: stag-statue | 3D |
