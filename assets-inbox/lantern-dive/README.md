# Inbox: lantern-dive

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (3)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `gx-bar-plate.webp` | 1024x512 | 8.67 | yes (flat white background, we key it) | gx bar plate | wiring |
| `tlink-button-plate.webp` | 512x512 | 3.03 | yes (flat white background, we key it) | tlink button plate | wiring |
| `ttl-bg-picture.webp` | 1024x1024 | 0.51 | no | ttl bg picture | wiring |

## Wave 7 pictures (16)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `camp-lampless-2.png` | 256x256 | 1:1 | no | Painting: camp-lampless-2 | wiring |
| `camp-maze-2.png` | 256x256 | 1:1 | no | Painting: camp-maze-2 | wiring |
| `camp-undertow-2.png` | 256x256 | 1:1 | no | Painting: camp-undertow-2 | wiring |
| `card-face-coral-b.png` | 768x1024 | 3:4 | no | Painting: card-face-coral-b | prefix |
| `card-face-kelp-b.png` | 768x1024 | 3:4 | no | Painting: card-face-kelp-b | prefix |
| `card-face-lantern-b.png` | 768x1024 | 3:4 | no | Painting: card-face-lantern-b | prefix |
| `card-face-sunstar-b.png` | 768x1024 | 3:4 | no | Painting: card-face-sunstar-b | prefix |
| `card-face-tide-b.png` | 768x1024 | 3:4 | no | Painting: card-face-tide-b | prefix |
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `table-reef-glow.png` | 1920x1080 | 16:9 | no | Painting: table-reef-glow | wiring |
| `table-reef-glow-phone.png` | 1080x1920 | 9:16 | no | Painting: table-reef-glow-phone | wiring |
| `table-wreck-bridge.png` | 1920x1080 | 16:9 | no | Painting: table-wreck-bridge | wiring |
| `table-wreck-bridge-phone.png` | 1080x1920 | 9:16 | no | Painting: table-wreck-bridge-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (44)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `brack-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Ottilie Brack: idle expression | wiring |
| `brack-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Ottilie Brack: lose expression | wiring |
| `brack-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Ottilie Brack: talk expression | wiring |
| `brack-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Ottilie Brack: win expression | wiring |
| `bram-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bram: idle expression | wiring |
| `bram-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bram: lose expression | wiring |
| `bram-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bram: talk expression | wiring |
| `bram-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bram: win expression | wiring |
| `dag-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dag: idle expression | wiring |
| `dag-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dag: lose expression | wiring |
| `dag-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dag: talk expression | wiring |
| `dag-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Dag: win expression | wiring |
| `echo-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Echo: attack pose | wiring |
| `echo-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Echo: hit pose | wiring |
| `echo-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Echo: idle pose | wiring |
| `echo-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Echo: lose pose | wiring |
| `echo-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Echo: win pose | wiring |
| `lampless-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lampless One: attack pose | wiring |
| `lampless-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lampless One: hit pose | wiring |
| `lampless-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lampless One: idle pose | wiring |
| `lampless-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lampless One: lose pose | wiring |
| `lampless-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Lampless One: win pose | wiring |
| `lantern-dim.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the brass diving lantern exactly as in the reference: dim state | wiring |
| `lantern-flicker.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the brass diving lantern exactly as in the reference: flicker state | wiring |
| `lantern-lit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the brass diving lantern exactly as in the reference: lit state | wiring |
| `lantern-out.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the brass diving lantern exactly as in the reference: out state | wiring |
| `maze-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Thousand Turns: attack pose | wiring |
| `maze-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Thousand Turns: hit pose | wiring |
| `maze-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Thousand Turns: idle pose | wiring |
| `maze-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Thousand Turns: lose pose | wiring |
| `maze-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Thousand Turns: win pose | wiring |
| `nerea-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nerea: idle expression | wiring |
| `nerea-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nerea: lose expression | wiring |
| `nerea-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nerea: talk expression | wiring |
| `nerea-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nerea: win expression | wiring |
| `sumi-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sumi: idle expression | wiring |
| `sumi-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sumi: lose expression | wiring |
| `sumi-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sumi: talk expression | wiring |
| `sumi-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sumi: win expression | wiring |
| `undertow-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Grey Undertow: attack pose | wiring |
| `undertow-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Grey Undertow: hit pose | wiring |
| `undertow-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Grey Undertow: idle pose | wiring |
| `undertow-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Grey Undertow: lose pose | wiring |
| `undertow-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Grey Undertow: win pose | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (10)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `anglerfish.png` | 1024x1024 | 1:1 | - | 3D model: anglerfish | 3D |
| `coral.png` | 1024x1024 | 1:1 | - | 3D model: coral | 3D |
| `diver-bram.png` | 1024x1024 | 1:1 | - | 3D model: diver-bram | 3D |
| `diver-dag.png` | 1024x1024 | 1:1 | - | 3D model: diver-dag | 3D |
| `diver-nerea.png` | 1024x1024 | 1:1 | - | 3D model: diver-nerea | 3D |
| `diver-sumi.png` | 1024x1024 | 1:1 | - | 3D model: diver-sumi | 3D |
| `echo-drone.png` | 1024x1024 | 1:1 | - | 3D model: echo-drone | 3D |
| `kelp.png` | 1024x1024 | 1:1 | - | 3D model: kelp | 3D |
| `treasure.png` | 1024x1024 | 1:1 | - | 3D model: treasure | 3D |
| `wreck-hull.png` | 1024x1024 | 1:1 | - | 3D model: wreck-hull | 3D |
