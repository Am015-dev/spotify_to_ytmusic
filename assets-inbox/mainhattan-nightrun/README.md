# Inbox: mainhattan-nightrun

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (92)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bemp-plate.webp` | 512x512 | 1 | yes (flat white background, we key it) | bEmp plate | wiring |
| `bpause-plate.webp` | 512x512 | 1 | yes (flat white background, we key it) | bPause plate | wiring |
| `dailybtn-plate.webp` | 512x512 | 3.45 | yes (flat white background, we key it) | dailyBtn plate | wiring |
| `diffbtn-plate.webp` | 512x512 | 3.48 | yes (flat white background, we key it) | diffBtn plate | wiring |
| `fx-bullet-needle.webp` | 256x64 | 4:1 | no | Enemy bullet effects | prefix |
| `fx-bullet-rocket.webp` | 256x128 | 2:1 | no | Enemy bullet effects | prefix |
| `fx-bullet-shell.webp` | 128x128 | 1:1 | no | Enemy bullet effects | prefix |
| `fx-fuse-arc-beat.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-arc-beat | auto |
| `fx-fuse-arc-disc.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-arc-disc | auto |
| `fx-fuse-arc-laser.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-arc-laser | auto |
| `fx-fuse-arc-mine.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-arc-mine | auto |
| `fx-fuse-arc-orbit.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-arc-orbit | auto |
| `fx-fuse-arc-pulse.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-arc-pulse | auto |
| `fx-fuse-arc-swarm.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-arc-swarm | auto |
| `fx-fuse-beat-disc.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-beat-disc | auto |
| `fx-fuse-beat-laser.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-beat-laser | auto |
| `fx-fuse-beat-mine.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-beat-mine | auto |
| `fx-fuse-beat-orbit.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-beat-orbit | auto |
| `fx-fuse-beat-pulse.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-beat-pulse | auto |
| `fx-fuse-beat-swarm.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-beat-swarm | auto |
| `fx-fuse-disc-laser.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-disc-laser | auto |
| `fx-fuse-disc-mine.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-disc-mine | auto |
| `fx-fuse-disc-orbit.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-disc-orbit | auto |
| `fx-fuse-disc-pulse.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-disc-pulse | auto |
| `fx-fuse-disc-swarm.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-disc-swarm | auto |
| `fx-fuse-laser-mine.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-laser-mine | auto |
| `fx-fuse-laser-orbit.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-laser-orbit | auto |
| `fx-fuse-laser-pulse.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-laser-pulse | auto |
| `fx-fuse-laser-swarm.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-laser-swarm | auto |
| `fx-fuse-mine-orbit.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-mine-orbit | auto |
| `fx-fuse-mine-pulse.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-mine-pulse | auto |
| `fx-fuse-mine-swarm.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-mine-swarm | auto |
| `fx-fuse-orbit-pulse.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-orbit-pulse | auto |
| `fx-fuse-orbit-swarm.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-orbit-swarm | auto |
| `fx-fuse-pulse-swarm.webp` | 512x512 | 1:1 | no | Weapon fusions: fx-fuse-pulse-swarm | auto |
| `gabtn-plate.webp` | 512x512 | 3.76 | yes (flat white background, we key it) | gaBtn plate | wiring |
| `go-dim-plate.webp` | 512x512 | 3.68 | yes (flat white background, we key it) | go dim plate | wiring |
| `kit-ckp.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-crt.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-dmg.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-drn.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-dsh.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-hul.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-mag.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-nmn.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-pwd.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-rev.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-rgn.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-rof.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `kit-shd.webp` | 128x128 | 1:1 | no | Garage perk icons | prefix |
| `labbtn-plate.webp` | 512x512 | 2.01 | yes (flat white background, we key it) | labBtn plate | wiring |
| `missing-picture-fx-bullet-needle-webp.webp` | 1024x1024 | 1 | yes (flat white background, we key it) | missing picture fx-bullet-needle.webp | wiring |
| `missing-picture-fx-bullet-rocket-webp.webp` | 1024x1024 | 1 | yes (flat white background, we key it) | missing picture fx-bullet-rocket.webp | wiring |
| `missing-picture-fx-bullet-shell-webp.webp` | 1024x1024 | 1 | yes (flat white background, we key it) | missing picture fx-bullet-shell.webp | wiring |
| `setbtn-plate.webp` | 512x512 | 3.28 | yes (flat white background, we key it) | setBtn plate | wiring |
| `ship-drift-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-drift-armed | auto |
| `ship-ec-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-ec-armed | auto |
| `ship-hv-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-hv-armed | auto |
| `ship-lancer-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-lancer-armed | auto |
| `ship-nova-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-nova-armed | auto |
| `ship-std-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-std-armed | auto |
| `ship-swg-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-swg-armed | auto |
| `ship-syn-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-syn-armed | auto |
| `ship-tri-armed.webp` | 512x256 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: ship-tri-armed | auto |
| `startbtn-plate.webp` | 512x512 | 3.09 | yes (flat white background, we key it) | startBtn plate | wiring |
| `storybtn-plate.webp` | 512x512 | 3.68 | yes (flat white background, we key it) | storyBtn plate | wiring |
| `title-plate.webp` | 1024x1024 | 0.51 | no | title plate | wiring |
| `wp-arc.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-arc | auto |
| `wp-beat.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-beat | auto |
| `wp-disc.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-disc | auto |
| `wp-laser.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-laser | auto |
| `wp-mine.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-mine | auto |
| `wp-orbit.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-orbit | auto |
| `wp-pulse.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-pulse | auto |
| `wp-swarm.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Weapons: wp-swarm | auto |
| `wpbtn-plate.webp` | 512x512 | 2.82 | yes (flat white background, we key it) | wpBtn plate | wiring |
| `wpmount-arc.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-arc | auto |
| `wpmount-beat.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-beat | auto |
| `wpmount-disc.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-disc | auto |
| `wpmount-drone.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-drone | auto |
| `wpmount-flame.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-flame | auto |
| `wpmount-frost.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-frost | auto |
| `wpmount-laser.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-laser | auto |
| `wpmount-mine.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-mine | auto |
| `wpmount-orbit.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-orbit | auto |
| `wpmount-pulse.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-pulse | auto |
| `wpmount-rail.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-rail | auto |
| `wpmount-shell.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-shell | auto |
| `wpmount-storm.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-storm | auto |
| `wpmount-swarm.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-swarm | auto |
| `wpmount-wave.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-wave | auto |
| `wpmount-well.webp` | 256x128 | 2:1 | yes (flat white background, we key it) | Ship weapon mounts: wpmount-well | auto |

## Wave 7 pictures (3)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `event-boss-warning.png` | 1920x1080 | 16:9 | no | Painting: event-boss-warning | wiring |
| `event-level-clear.png` | 1920x1080 | 16:9 | no | Painting: event-level-clear | wiring |
| `event-new-record.png` | 1920x1080 | 16:9 | no | Painting: event-new-record | wiring |

## Pose sets (flat background, we cut them out; name = character-pose) (50)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bruecken-waechter-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bruecken Waechter: defeat-1 frame | wiring |
| `bruecken-waechter-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bruecken Waechter: defeat-2 frame | wiring |
| `bruecken-waechter-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Bruecken Waechter: hit frame | wiring |
| `flusskrake-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Flusskrake: defeat-1 frame | wiring |
| `flusskrake-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Flusskrake: defeat-2 frame | wiring |
| `flusskrake-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Flusskrake: hit frame | wiring |
| `hoplite-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hoplite: defeat-1 frame | wiring |
| `hoplite-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hoplite: defeat-2 frame | wiring |
| `hoplite-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Hoplite: hit frame | wiring |
| `kronos-atk1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kronos: atk1 frame | wiring |
| `kronos-atk2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kronos: atk2 frame | wiring |
| `kronos-atk3.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kronos: atk3 frame | wiring |
| `kronos-atk4.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kronos: atk4 frame | wiring |
| `kronos-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kronos: defeat-1 frame | wiring |
| `kronos-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kronos: defeat-2 frame | wiring |
| `kronos-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Kronos: hit frame | wiring |
| `messe-waechter-atk1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Messe Waechter: atk1 frame | wiring |
| `messe-waechter-atk2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Messe Waechter: atk2 frame | wiring |
| `messe-waechter-atk3.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Messe Waechter: atk3 frame | wiring |
| `messe-waechter-atk4.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Messe Waechter: atk4 frame | wiring |
| `messe-waechter-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Messe Waechter: defeat-1 frame | wiring |
| `messe-waechter-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Messe Waechter: defeat-2 frame | wiring |
| `messe-waechter-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Messe Waechter: hit frame | wiring |
| `schranken-wart-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Schranken Wart: defeat-1 frame | wiring |
| `schranken-wart-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Schranken Wart: defeat-2 frame | wiring |
| `schranken-wart-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Schranken Wart: hit frame | wiring |
| `sek-adler-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sek Adler: defeat-1 frame | wiring |
| `sek-adler-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sek Adler: defeat-2 frame | wiring |
| `sek-adler-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Sek Adler: hit frame | wiring |
| `ship-lancer-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: bank-left state | wiring |
| `ship-lancer-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: bank-right state | wiring |
| `ship-lancer-boost.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: boost state | wiring |
| `ship-lancer-damaged.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: damaged state | wiring |
| `ship-nova-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: bank-left state | wiring |
| `ship-nova-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: bank-right state | wiring |
| `ship-nova-boost.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: boost state | wiring |
| `ship-nova-damaged.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: damaged state | wiring |
| `ship-std-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: bank-left state | wiring |
| `ship-std-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: bank-right state | wiring |
| `ship-std-boost.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: boost state | wiring |
| `ship-std-damaged.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: damaged state | wiring |
| `talos-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Talos: defeat-1 frame | wiring |
| `talos-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Talos: defeat-2 frame | wiring |
| `talos-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Talos: hit frame | wiring |
| `tresor-wart-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tresor Wart: defeat-1 frame | wiring |
| `tresor-wart-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tresor Wart: defeat-2 frame | wiring |
| `tresor-wart-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Tresor Wart: hit frame | wiring |
| `zentral-ice-defeat-1.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Zentral Ice: defeat-1 frame | wiring |
| `zentral-ice-defeat-2.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Zentral Ice: defeat-2 frame | wiring |
| `zentral-ice-hit.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | Zentral Ice: hit frame | wiring |

## 3D source paintings (go to the 3D pipeline, kept in `models-src/`) (10)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `boss3d-bruecken-waechter.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-bruecken-waechter | 3D |
| `boss3d-flusskrake.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-flusskrake | 3D |
| `boss3d-hoplite.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-hoplite | 3D |
| `boss3d-kronos.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-kronos | 3D |
| `boss3d-messe-waechter.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-messe-waechter | 3D |
| `boss3d-schranken-wart.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-schranken-wart | 3D |
| `boss3d-sek-adler.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-sek-adler | 3D |
| `boss3d-talos.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-talos | 3D |
| `boss3d-tresor-wart.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-tresor-wart | 3D |
| `boss3d-zentral-ice.png` | 1024x1024 | 1:1 | - | 3D model: boss3d-zentral-ice | 3D |
