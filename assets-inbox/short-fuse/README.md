# Inbox: short-fuse

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (9)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `gx-bar-plate.webp` | 1024x512 | 8.13 | yes (flat white background, we key it) | gx bar plate | wiring |
| `gx-drawer-head-plate.webp` | 1024x512 | 6.42 | yes (flat white background, we key it) | gx drawer head plate | wiring |
| `plate-mine-plate.webp` | 512x512 | 4.25 | yes (flat white background, we key it) | plate mine plate | wiring |
| `plate-plate.webp` | 512x512 | 5.91 | yes (flat white background, we key it) | plate plate | wiring |
| `rp-plate.webp` | 512x512 | 11.26 | yes (flat white background, we key it) | rp plate | wiring |
| `start-plate.webp` | 1024x1024 | 0.51 | no | start plate | wiring |
| `tb-plate.webp` | 1024x1024 | 0.55 | no | tb plate | wiring |
| `tile-crew-plate.webp` | 512x512 | 0.77 | yes (flat white background, we key it) | tile crew plate | wiring |
| `tile-mine-plate.webp` | 512x512 | 0.76 | yes (flat white background, we key it) | tile mine plate | wiring |

## Wave 7 pictures (11)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-boom.png` | 1024x768 | 4:3 | no | Painting: event-boom | wiring |
| `event-defused.png` | 1024x768 | 4:3 | no | Painting: event-defused | wiring |
| `table-blueprint.png` | 1920x1080 | 16:9 | no | Painting: table-blueprint | wiring |
| `table-blueprint-phone.png` | 1080x1920 | 9:16 | no | Painting: table-blueprint-phone | wiring |
| `table-clock-tower.png` | 1920x1080 | 16:9 | no | Painting: table-clock-tower | wiring |
| `table-clock-tower-phone.png` | 1080x1920 | 9:16 | no | Painting: table-clock-tower-phone | wiring |
| `wire-tile-frame-d.png` | 512x512 | 1:1 | no | Painting: wire-tile-frame-d | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (34)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bomb-boom-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bomb: boom-1 state | wiring |
| `bomb-boom-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bomb: boom-2 state | wiring |
| `bomb-defused.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bomb: defused state | wiring |
| `bomb-smoke.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bomb: smoke state | wiring |
| `bomb-spark.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bomb: spark state | wiring |
| `bomb-tick-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bomb: tick-a state | wiring |
| `bomb-tick-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | bomb: tick-b state | wiring |
| `brix-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Foreman Brix: idle expression | wiring |
| `brix-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Foreman Brix: lose expression | wiring |
| `brix-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Foreman Brix: talk expression | wiring |
| `brix-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Foreman Brix: win expression | wiring |
| `mole-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Weak Link: idle expression | wiring |
| `mole-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Weak Link: lose expression | wiring |
| `mole-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Weak Link: praise expression | wiring |
| `mole-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Weak Link: shock expression | wiring |
| `mole-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Weak Link: taunt expression | wiring |
| `mole-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Weak Link: win expression | wiring |
| `quill-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Quill: idle expression | wiring |
| `quill-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Quill: lose expression | wiring |
| `quill-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Quill: praise expression | wiring |
| `quill-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Quill: shock expression | wiring |
| `quill-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Quill: taunt expression | wiring |
| `quill-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Vesper Quill: win expression | wiring |
| `rig-act.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Training Rig: act state | wiring |
| `rig-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Training Rig: hit state | wiring |
| `rig-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Training Rig: idle state | wiring |
| `rig-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Training Rig: lose state | wiring |
| `rig-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Training Rig: win state | wiring |
| `tally-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tally: idle expression | wiring |
| `tally-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tally: lose expression | wiring |
| `tally-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tally: win expression | wiring |
| `wren-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wren: idle expression | wiring |
| `wren-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wren: lose expression | wiring |
| `wren-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wren: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (10)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bomb-barrel.png` | 1024x1024 | 1:1 | - | 3D model: bomb-barrel | 3D |
| `bomb-clockwork.png` | 1024x1024 | 1:1 | - | 3D model: bomb-clockwork | 3D |
| `bomb-dynamite.png` | 1024x1024 | 1:1 | - | 3D model: bomb-dynamite | 3D |
| `bomb-tower-clock.png` | 1024x1024 | 1:1 | - | 3D model: bomb-tower-clock | 3D |
| `clock-key.png` | 1024x1024 | 1:1 | - | 3D model: clock-key | 3D |
| `tool-magnifier.png` | 1024x1024 | 1:1 | - | 3D model: tool-magnifier | 3D |
| `tool-multimeter.png` | 1024x1024 | 1:1 | - | 3D model: tool-multimeter | 3D |
| `tool-screwdriver.png` | 1024x1024 | 1:1 | - | 3D model: tool-screwdriver | 3D |
| `tool-wrench.png` | 1024x1024 | 1:1 | - | 3D model: tool-wrench | 3D |
| `wire-spool.png` | 1024x1024 | 1:1 | - | 3D model: wire-spool | 3D |
