# Inbox: doorkick-dungeon

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (8)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `btn-primary-button-plate.webp` | 512x512 | 2.25 | yes (flat white background, we key it) | btn primary button plate | wiring |
| `doorkick-twins-boss.mp4` | 854x480 | 16:9 | - | Boss reveal clip | wiring |
| `gx-app-plate.webp` | 1024x1024 | 0.51 | no | gx app plate | wiring |
| `gx-bar-plate.webp` | 1024x512 | 8.86 | yes (flat white background, we key it) | gx bar plate | wiring |
| `gx-dock-plate.webp` | 512x1024 | 0.57 | yes (flat white background, we key it) | gx dock plate | wiring |
| `gxt-b-pri-button-plate.webp` | 1024x512 | 6.29 | yes (flat white background, we key it) | gxt b pri button plate | wiring |
| `gxt-b-pulse-button-plate.webp` | 1024x512 | 6.29 | yes (flat white background, we key it) | gxt b pulse button plate | wiring |
| `modal-plate.webp` | 1024x1024 | 0.51 | no | modal plate | wiring |

## Wave 7 pictures (13)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `end-lose-b.png` | 1024x768 | 4:3 | no | Painting: end-lose-b | wiring |
| `end-lose-c.png` | 1024x768 | 4:3 | no | Painting: end-lose-c | wiring |
| `end-win-b.png` | 1024x768 | 4:3 | no | Painting: end-win-b | wiring |
| `end-win-c.png` | 1024x768 | 4:3 | no | Painting: end-win-c | wiring |
| `event-curse.png` | 1024x768 | 4:3 | no | Painting: event-curse | wiring |
| `event-door-kick.png` | 1024x768 | 4:3 | no | Painting: event-door-kick | wiring |
| `event-level-up.png` | 1024x768 | 4:3 | no | Painting: event-level-up | wiring |
| `table-bone-crypt.png` | 1920x1080 | 16:9 | no | Painting: table-bone-crypt | wiring |
| `table-bone-crypt-phone.png` | 1080x1920 | 9:16 | no | Painting: table-bone-crypt-phone | wiring |
| `table-dragon-hoard.png` | 1920x1080 | 16:9 | no | Painting: table-dragon-hoard | wiring |
| `table-dragon-hoard-phone.png` | 1080x1920 | 9:16 | no | Painting: table-dragon-hoard-phone | wiring |
| `table-flooded-cellar.png` | 1920x1080 | 16:9 | no | Painting: table-flooded-cellar | wiring |
| `table-flooded-cellar-phone.png` | 1080x1920 | 9:16 | no | Painting: table-flooded-cellar-phone | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (76)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bodkin-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bodkin the Braggart: attack pose | wiring |
| `bodkin-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bodkin the Braggart: hit pose | wiring |
| `bodkin-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bodkin the Braggart: idle pose | wiring |
| `bodkin-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bodkin the Braggart: lose pose | wiring |
| `bodkin-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bodkin the Braggart: win pose | wiring |
| `chest-closed.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | chest: closed state | wiring |
| `chest-open.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | chest: open state | wiring |
| `chest-opening.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | chest: opening state | wiring |
| `dread-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Nameless Dread: attack pose | wiring |
| `dread-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Nameless Dread: hit pose | wiring |
| `dread-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Nameless Dread: idle pose | wiring |
| `dread-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Nameless Dread: lose pose | wiring |
| `dread-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | The Nameless Dread: win pose | wiring |
| `grub-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grub the Mercenary: attack pose | wiring |
| `grub-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grub the Mercenary: hit pose | wiring |
| `grub-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grub the Mercenary: idle pose | wiring |
| `grub-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grub the Mercenary: lose pose | wiring |
| `grub-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grub the Mercenary: walk-a pose | wiring |
| `grub-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grub the Mercenary: walk-b pose | wiring |
| `grub-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Grub the Mercenary: win pose | wiring |
| `hobb-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Hobb the Doorwarden: idle pose | wiring |
| `hobb-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Hobb the Doorwarden: lose pose | wiring |
| `hobb-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Old Hobb the Doorwarden: win pose | wiring |
| `inferno-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Horned Inferno: attack pose | wiring |
| `inferno-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Horned Inferno: hit pose | wiring |
| `inferno-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Horned Inferno: idle pose | wiring |
| `inferno-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Horned Inferno: lose pose | wiring |
| `inferno-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Horned Inferno: win pose | wiring |
| `morwen-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Morwen the Grudge-Keeper: attack pose | wiring |
| `morwen-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Morwen the Grudge-Keeper: hit pose | wiring |
| `morwen-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Morwen the Grudge-Keeper: idle pose | wiring |
| `morwen-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Morwen the Grudge-Keeper: lose pose | wiring |
| `morwen-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Morwen the Grudge-Keeper: walk-a pose | wiring |
| `morwen-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Morwen the Grudge-Keeper: walk-b pose | wiring |
| `morwen-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Morwen the Grudge-Keeper: win pose | wiring |
| `pharaoh-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pharaoh Wrappington: attack pose | wiring |
| `pharaoh-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pharaoh Wrappington: hit pose | wiring |
| `pharaoh-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pharaoh Wrappington: idle pose | wiring |
| `pharaoh-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pharaoh Wrappington: lose pose | wiring |
| `pharaoh-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pharaoh Wrappington: win pose | wiring |
| `pip-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip the Plucky: attack pose | wiring |
| `pip-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip the Plucky: hit pose | wiring |
| `pip-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip the Plucky: idle pose | wiring |
| `pip-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip the Plucky: lose pose | wiring |
| `pip-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip the Plucky: walk-a pose | wiring |
| `pip-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip the Plucky: walk-b pose | wiring |
| `pip-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Pip the Plucky: win pose | wiring |
| `skygrif-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Stampeding Skygrif: attack pose | wiring |
| `skygrif-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Stampeding Skygrif: hit pose | wiring |
| `skygrif-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Stampeding Skygrif: idle pose | wiring |
| `skygrif-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Stampeding Skygrif: lose pose | wiring |
| `skygrif-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Stampeding Skygrif: win pose | wiring |
| `tansy-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tansy the Lucky: attack pose | wiring |
| `tansy-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tansy the Lucky: hit pose | wiring |
| `tansy-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tansy the Lucky: idle pose | wiring |
| `tansy-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tansy the Lucky: lose pose | wiring |
| `tansy-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tansy the Lucky: walk-a pose | wiring |
| `tansy-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tansy the Lucky: walk-b pose | wiring |
| `tansy-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tansy the Lucky: win pose | wiring |
| `tentacles-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tentaclopolis: attack pose | wiring |
| `tentacles-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tentaclopolis: hit pose | wiring |
| `tentacles-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tentaclopolis: idle pose | wiring |
| `tentacles-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tentaclopolis: lose pose | wiring |
| `tentacles-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tentaclopolis: win pose | wiring |
| `wrenna-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wrenna the Schemer: attack pose | wiring |
| `wrenna-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wrenna the Schemer: hit pose | wiring |
| `wrenna-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wrenna the Schemer: idle pose | wiring |
| `wrenna-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wrenna the Schemer: lose pose | wiring |
| `wrenna-walk-a.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wrenna the Schemer: walk-a pose | wiring |
| `wrenna-walk-b.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wrenna the Schemer: walk-b pose | wiring |
| `wrenna-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Wrenna the Schemer: win pose | wiring |
| `wyrm-attack.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Uranium Wyrm: attack pose | wiring |
| `wyrm-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Uranium Wyrm: hit pose | wiring |
| `wyrm-idle.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Uranium Wyrm: idle pose | wiring |
| `wyrm-lose.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Uranium Wyrm: lose pose | wiring |
| `wyrm-win.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Uranium Wyrm: win pose | wiring |

## Music and sounds (sources for the audio tools) (8)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `amb-tavern.mp3` | 60 s seamless loop | - | - | Sound extras | wiring |
| `stinger-bad.mp3` | under 2 s | - | - | Sound extras | wiring |
| `stinger-boss.mp3` | under 2 s | - | - | Sound extras | wiring |
| `stinger-curse.mp3` | under 2 s | - | - | Sound extras | wiring |
| `stinger-level.mp3` | under 2 s | - | - | Sound extras | wiring |
| `stinger-lose.mp3` | under 2 s | - | - | Sound extras | wiring |
| `stinger-turn.mp3` | under 2 s | - | - | Sound extras | wiring |
| `stinger-win.mp3` | under 2 s | - | - | Sound extras | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (13)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bone-pile.png` | 1024x1024 | 1:1 | - | 3D model: bone-pile | 3D |
| `boss-dread.png` | 1024x1024 | 1:1 | - | 3D model: boss-dread | 3D |
| `boss-inferno.png` | 1024x1024 | 1:1 | - | 3D model: boss-inferno | 3D |
| `boss-pharaoh.png` | 1024x1024 | 1:1 | - | 3D model: boss-pharaoh | 3D |
| `boss-skygrif.png` | 1024x1024 | 1:1 | - | 3D model: boss-skygrif | 3D |
| `boss-tentacles.png` | 1024x1024 | 1:1 | - | 3D model: boss-tentacles | 3D |
| `boss-wyrm.png` | 1024x1024 | 1:1 | - | 3D model: boss-wyrm | 3D |
| `chest.png` | 1024x1024 | 1:1 | - | 3D model: chest | 3D |
| `coin-pile.png` | 1024x1024 | 1:1 | - | 3D model: coin-pile | 3D |
| `hero-bodkin.png` | 1024x1024 | 1:1 | - | 3D model: hero-bodkin | 3D |
| `hero-hobb.png` | 1024x1024 | 1:1 | - | 3D model: hero-hobb | 3D |
| `hero-wrenna.png` | 1024x1024 | 1:1 | - | 3D model: hero-wrenna | 3D |
| `torch.png` | 1024x1024 | 1:1 | - | 3D model: torch | 3D |
