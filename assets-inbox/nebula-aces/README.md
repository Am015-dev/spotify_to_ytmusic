# Inbox: nebula-aces

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (1)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `gx-bar-plate.webp` | 1024x512 | 8.86 | yes (flat white background, we key it) | gx bar plate | wiring |

## Wave 7 pictures (12)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `back-red-streak.png` | 768x1024 | 3:4 | no | Painting: back-red-streak | wiring |
| `back-veil-station.png` | 768x1024 | 3:4 | no | Painting: back-veil-station | wiring |
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `table-asteroid-belt.png` | 1920x1080 | 16:9 | no | Painting: table-asteroid-belt | wiring |
| `table-asteroid-belt-phone.png` | 1080x1920 | 9:16 | no | Painting: table-asteroid-belt-phone | wiring |
| `table-red-rift.png` | 1920x1080 | 16:9 | no | Painting: table-red-rift | wiring |
| `table-red-rift-phone.png` | 1080x1920 | 9:16 | no | Painting: table-red-rift-phone | wiring |
| `table-veil-station.png` | 1920x1080 | 16:9 | no | Painting: table-veil-station | wiring |
| `table-veil-station-phone.png` | 1080x1920 | 9:16 | no | Painting: table-veil-station-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (54)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `brecken-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Marshal Odile Brecken: idle expression | wiring |
| `brecken-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Marshal Odile Brecken: lose expression | wiring |
| `brecken-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Marshal Odile Brecken: talk expression | wiring |
| `brecken-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Marshal Odile Brecken: win expression | wiring |
| `castigan-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lord Castigan: idle expression | wiring |
| `castigan-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lord Castigan: lose expression | wiring |
| `castigan-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lord Castigan: praise expression | wiring |
| `castigan-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lord Castigan: shock expression | wiring |
| `castigan-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lord Castigan: taunt expression | wiring |
| `castigan-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Lord Castigan: win expression | wiring |
| `drill-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Drill Wing Flight Officer: idle expression | wiring |
| `drill-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Drill Wing Flight Officer: lose expression | wiring |
| `drill-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Drill Wing Flight Officer: win expression | wiring |
| `hammer-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hammer Squadron Lead: idle expression | wiring |
| `hammer-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hammer Squadron Lead: lose expression | wiring |
| `hammer-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hammer Squadron Lead: win expression | wiring |
| `hex-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hex: idle expression | wiring |
| `hex-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hex: lose expression | wiring |
| `hex-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hex: win expression | wiring |
| `kael-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kael Varro: idle expression | wiring |
| `kael-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kael Varro: lose expression | wiring |
| `kael-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kael Varro: talk expression | wiring |
| `kael-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kael Varro: win expression | wiring |
| `kira-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kira Scald: idle expression | wiring |
| `kira-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kira Scald: lose expression | wiring |
| `kira-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kira Scald: win expression | wiring |
| `knife-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Knifepoint: idle expression | wiring |
| `knife-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Knifepoint: lose expression | wiring |
| `knife-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Knifepoint: praise expression | wiring |
| `knife-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Knifepoint: shock expression | wiring |
| `knife-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Knifepoint: taunt expression | wiring |
| `knife-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Knifepoint: win expression | wiring |
| `lancer-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Lancer starfighter exactly as in the reference: bank-left state | wiring |
| `lancer-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Lancer starfighter exactly as in the reference: bank-right state | wiring |
| `lancer-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Lancer starfighter exactly as in the reference: hit state | wiring |
| `lancer-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Lancer starfighter exactly as in the reference: idle state | wiring |
| `lancer-wreck.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Lancer starfighter exactly as in the reference: wreck state | wiring |
| `quill-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill Marren: idle expression | wiring |
| `quill-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill Marren: lose expression | wiring |
| `quill-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Quill Marren: win expression | wiring |
| `sorin-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sorin Vael: idle expression | wiring |
| `sorin-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sorin Vael: lose expression | wiring |
| `sorin-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sorin Vael: praise expression | wiring |
| `sorin-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sorin Vael: shock expression | wiring |
| `sorin-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sorin Vael: taunt expression | wiring |
| `sorin-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sorin Vael: win expression | wiring |
| `talon-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Talon starfighter exactly as in the reference: bank-left state | wiring |
| `talon-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Talon starfighter exactly as in the reference: bank-right state | wiring |
| `talon-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Talon starfighter exactly as in the reference: hit state | wiring |
| `talon-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Talon starfighter exactly as in the reference: idle state | wiring |
| `talon-wreck.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | the Talon starfighter exactly as in the reference: wreck state | wiring |
| `wailer-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wailer: idle expression | wiring |
| `wailer-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wailer: lose expression | wiring |
| `wailer-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wailer: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (15)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `na-anvil.png` | 1024x1024 | 1:1 | - | 3D model: na-anvil | 3D |
| `na-beacon.png` | 1024x1024 | 1:1 | - | 3D model: na-beacon | 3D |
| `na-hauler.png` | 1024x1024 | 1:1 | - | 3D model: na-hauler | 3D |
| `na-herald.png` | 1024x1024 | 1:1 | - | 3D model: na-herald | 3D |
| `na-keel.png` | 1024x1024 | 1:1 | - | 3D model: na-keel | 3D |
| `na-kestrel.png` | 1024x1024 | 1:1 | - | 3D model: na-kestrel | 3D |
| `na-maul.png` | 1024x1024 | 1:1 | - | 3D model: na-maul | 3D |
| `na-needle.png` | 1024x1024 | 1:1 | - | 3D model: na-needle | 3D |
| `na-razor.png` | 1024x1024 | 1:1 | - | 3D model: na-razor | 3D |
| `na-rift-gate.png` | 1024x1024 | 1:1 | - | 3D model: na-rift-gate | 3D |
| `na-rock-d.png` | 1024x1024 | 1:1 | - | 3D model: na-rock-d | 3D |
| `na-rock-e.png` | 1024x1024 | 1:1 | - | 3D model: na-rock-e | 3D |
| `na-station.png` | 1024x1024 | 1:1 | - | 3D model: na-station | 3D |
| `na-warden.png` | 1024x1024 | 1:1 | - | 3D model: na-warden | 3D |
| `na-wreck.png` | 1024x1024 | 1:1 | - | 3D model: na-wreck | 3D |
