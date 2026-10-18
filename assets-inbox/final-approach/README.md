# Inbox: final-approach

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (3)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `gx-bar-plate.webp` | 1024x512 | 8.86 | yes (flat white background, we key it) | gx bar plate | wiring |
| `tlink-button-plate.webp` | 512x512 | 3.03 | yes (flat white background, we key it) | tlink button plate | wiring |
| `ttl-bg-picture.webp` | 1024x1024 | 0.51 | no | ttl bg picture | wiring |

## Wave 7 pictures (13)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-go-around.png` | 1024x768 | 4:3 | no | Painting: event-go-around | wiring |
| `event-touchdown.png` | 1024x768 | 4:3 | no | Painting: event-touchdown | wiring |
| `event-wind-shear.png` | 1024x768 | 4:3 | no | Painting: event-wind-shear | wiring |
| `table-fog.png` | 1920x1080 | 16:9 | no | Painting: table-fog | wiring |
| `table-fog-phone.png` | 1080x1920 | 9:16 | no | Painting: table-fog-phone | wiring |
| `table-snow.png` | 1920x1080 | 16:9 | no | Painting: table-snow | wiring |
| `table-snow-phone.png` | 1080x1920 | 9:16 | no | Painting: table-snow-phone | wiring |
| `table-sunset.png` | 1920x1080 | 16:9 | no | Painting: table-sunset | wiring |
| `table-sunset-phone.png` | 1080x1920 | 9:16 | no | Painting: table-sunset-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (34)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `alder-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Molly Brack of Port Alder Tower: idle expression | wiring |
| `alder-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Molly Brack of Port Alder Tower: lose expression | wiring |
| `alder-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Molly Brack of Port Alder Tower: win expression | wiring |
| `bowlrock-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Gunnar Sted of Bowlrock Tower: idle expression | wiring |
| `bowlrock-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Gunnar Sted of Bowlrock Tower: lose expression | wiring |
| `bowlrock-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Gunnar Sted of Bowlrock Tower: praise expression | wiring |
| `bowlrock-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Gunnar Sted of Bowlrock Tower: shock expression | wiring |
| `bowlrock-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Gunnar Sted of Bowlrock Tower: taunt expression | wiring |
| `bowlrock-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Gunnar Sted of Bowlrock Tower: win expression | wiring |
| `cloudspire-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Aurel Kade of Cloudspire Tower: idle expression | wiring |
| `cloudspire-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Aurel Kade of Cloudspire Tower: lose expression | wiring |
| `cloudspire-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Aurel Kade of Cloudspire Tower: praise expression | wiring |
| `cloudspire-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Aurel Kade of Cloudspire Tower: shock expression | wiring |
| `cloudspire-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Aurel Kade of Cloudspire Tower: taunt expression | wiring |
| `cloudspire-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Aurel Kade of Cloudspire Tower: win expression | wiring |
| `foxmere-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nell Ashby of Foxmere Approach: idle expression | wiring |
| `foxmere-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nell Ashby of Foxmere Approach: lose expression | wiring |
| `foxmere-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Nell Ashby of Foxmere Approach: win expression | wiring |
| `ravi-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | First Officer Ravi Okoro: idle expression | wiring |
| `ravi-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | First Officer Ravi Okoro: lose expression | wiring |
| `ravi-talk.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | First Officer Ravi Okoro: talk expression | wiring |
| `ravi-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | First Officer Ravi Okoro: win expression | wiring |
| `seabright-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Teo Vance of Seabright Approach: idle expression | wiring |
| `seabright-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Teo Vance of Seabright Approach: lose expression | wiring |
| `seabright-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Teo Vance of Seabright Approach: praise expression | wiring |
| `seabright-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Teo Vance of Seabright Approach: shock expression | wiring |
| `seabright-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Teo Vance of Seabright Approach: taunt expression | wiring |
| `seabright-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Controller Teo Vance of Seabright Approach: win expression | wiring |
| `voss-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Pilot Hedda Voss: idle expression | wiring |
| `voss-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Pilot Hedda Voss: lose expression | wiring |
| `voss-praise.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Pilot Hedda Voss: praise expression | wiring |
| `voss-shock.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Pilot Hedda Voss: shock expression | wiring |
| `voss-taunt.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Pilot Hedda Voss: taunt expression | wiring |
| `voss-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Chief Pilot Hedda Voss: win expression | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (12)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `fuel-truck.png` | 1024x1024 | 1:1 | - | 3D model: fuel-truck | 3D |
| `hangar.png` | 1024x1024 | 1:1 | - | 3D model: hangar | 3D |
| `plane-jet.png` | 1024x1024 | 1:1 | - | 3D model: plane-jet | 3D |
| `plane-trainer.png` | 1024x1024 | 1:1 | - | 3D model: plane-trainer | 3D |
| `plane-twin.png` | 1024x1024 | 1:1 | - | 3D model: plane-twin | 3D |
| `runway-light.png` | 1024x1024 | 1:1 | - | 3D model: runway-light | 3D |
| `tower-alder.png` | 1024x1024 | 1:1 | - | 3D model: tower-alder | 3D |
| `tower-bowlrock.png` | 1024x1024 | 1:1 | - | 3D model: tower-bowlrock | 3D |
| `tower-cloudspire.png` | 1024x1024 | 1:1 | - | 3D model: tower-cloudspire | 3D |
| `tower-foxmere.png` | 1024x1024 | 1:1 | - | 3D model: tower-foxmere | 3D |
| `tower-seabright.png` | 1024x1024 | 1:1 | - | 3D model: tower-seabright | 3D |
| `windsock.png` | 1024x1024 | 1:1 | - | 3D model: windsock | 3D |
