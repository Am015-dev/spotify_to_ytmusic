# Inbox: mainhattan-nightrun

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (319)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bemp-plate.webp` | 512x512 | 1 | yes (flat white background, we key it) | bEmp plate | wiring |
| `bpause-plate.webp` | 512x512 | 1 | yes (flat white background, we key it) | bPause plate | wiring |
| `dailybtn-plate.webp` | 512x512 | 3.45 | yes (flat white background, we key it) | dailyBtn plate | wiring |
| `diffbtn-plate.webp` | 512x512 | 3.48 | yes (flat white background, we key it) | diffBtn plate | wiring |
| `foot/bg-far.webp` | 2048x1024 | 2:1 | yes (flat white background, we key it) | On-foot street stage: foot/bg-far | auto |
| `foot/bg-floor.webp` | 2048x1024 | 2:1 | yes (flat white background, we key it) | On-foot street stage: foot/bg-floor | auto |
| `foot/bg-mid.webp` | 2048x1024 | 2:1 | yes (flat white background, we key it) | On-foot street stage: foot/bg-mid | auto |
| `foot/bg-near.webp` | 2048x1024 | 2:1 | yes (flat white background, we key it) | On-foot street stage: foot/bg-near | auto |
| `foot/bg-sky.webp` | 2048x1024 | 2:1 | yes (flat white background, we key it) | On-foot street stage: foot/bg-sky | auto |
| `foot/bruiser-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-crouch | auto |
| `foot/bruiser-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-crouch-shoot | auto |
| `foot/bruiser-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-die | auto |
| `foot/bruiser-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-fall | auto |
| `foot/bruiser-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-hit | auto |
| `foot/bruiser-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-idle | auto |
| `foot/bruiser-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-jump | auto |
| `foot/bruiser-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-melee | auto |
| `foot/bruiser-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-run-a | auto |
| `foot/bruiser-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-run-b | auto |
| `foot/bruiser-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/bruiser-shoot | auto |
| `foot/drone-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/drone-die | auto |
| `foot/drone-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/drone-hit | auto |
| `foot/drone-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/drone-idle | auto |
| `foot/drone-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/drone-shoot | auto |
| `foot/grunt-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-crouch | auto |
| `foot/grunt-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-crouch-shoot | auto |
| `foot/grunt-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-die | auto |
| `foot/grunt-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-fall | auto |
| `foot/grunt-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-hit | auto |
| `foot/grunt-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-idle | auto |
| `foot/grunt-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-jump | auto |
| `foot/grunt-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-melee | auto |
| `foot/grunt-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-run-a | auto |
| `foot/grunt-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-run-b | auto |
| `foot/grunt-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/grunt-shoot | auto |
| `foot/gunman-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-crouch | auto |
| `foot/gunman-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-crouch-shoot | auto |
| `foot/gunman-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-die | auto |
| `foot/gunman-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-fall | auto |
| `foot/gunman-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-hit | auto |
| `foot/gunman-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-idle | auto |
| `foot/gunman-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-jump | auto |
| `foot/gunman-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-melee | auto |
| `foot/gunman-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-run-a | auto |
| `foot/gunman-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-run-b | auto |
| `foot/gunman-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/gunman-shoot | auto |
| `foot/kai-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-crouch | auto |
| `foot/kai-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-crouch-shoot | auto |
| `foot/kai-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-die | auto |
| `foot/kai-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-fall | auto |
| `foot/kai-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-hit | auto |
| `foot/kai-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-idle | auto |
| `foot/kai-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-jump | auto |
| `foot/kai-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-melee | auto |
| `foot/kai-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-run-a | auto |
| `foot/kai-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-run-b | auto |
| `foot/kai-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/kai-shoot | auto |
| `foot/knife-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-crouch | auto |
| `foot/knife-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-crouch-shoot | auto |
| `foot/knife-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-die | auto |
| `foot/knife-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-fall | auto |
| `foot/knife-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-hit | auto |
| `foot/knife-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-idle | auto |
| `foot/knife-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-jump | auto |
| `foot/knife-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-melee | auto |
| `foot/knife-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-run-a | auto |
| `foot/knife-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-run-b | auto |
| `foot/knife-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/knife-shoot | auto |
| `foot/mech-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/mech-die | auto |
| `foot/mech-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/mech-hit | auto |
| `foot/mech-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/mech-idle | auto |
| `foot/mech-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/mech-shoot | auto |
| `foot/pk-bomb.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-bomb | auto |
| `foot/pk-damage.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-damage | auto |
| `foot/pk-heal.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-heal | auto |
| `foot/pk-magnet.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-magnet | auto |
| `foot/pk-shield.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-shield | auto |
| `foot/pk-slow.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-slow | auto |
| `foot/pk-speed.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-speed | auto |
| `foot/pk-weapon-arc.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-weapon-arc | auto |
| `foot/pk-weapon-flame.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-weapon-flame | auto |
| `foot/pk-weapon-hmg.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-weapon-hmg | auto |
| `foot/pk-weapon-rocket.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-weapon-rocket | auto |
| `foot/pk-weapon-shotgun.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/pk-weapon-shotgun | auto |
| `foot/sc-barrel.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sc-barrel | auto |
| `foot/sc-crate.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sc-crate | auto |
| `foot/sc-door.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sc-door | auto |
| `foot/sc-neon-sign.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sc-neon-sign | auto |
| `foot/sc-vending.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sc-vending | auto |
| `foot/shield-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-crouch | auto |
| `foot/shield-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-crouch-shoot | auto |
| `foot/shield-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-die | auto |
| `foot/shield-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-fall | auto |
| `foot/shield-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-hit | auto |
| `foot/shield-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-idle | auto |
| `foot/shield-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-jump | auto |
| `foot/shield-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-melee | auto |
| `foot/shield-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-run-a | auto |
| `foot/shield-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-run-b | auto |
| `foot/shield-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/shield-shoot | auto |
| `foot/sniper-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-crouch | auto |
| `foot/sniper-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-crouch-shoot | auto |
| `foot/sniper-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-die | auto |
| `foot/sniper-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-fall | auto |
| `foot/sniper-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-hit | auto |
| `foot/sniper-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-idle | auto |
| `foot/sniper-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-jump | auto |
| `foot/sniper-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-melee | auto |
| `foot/sniper-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-run-a | auto |
| `foot/sniper-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-run-b | auto |
| `foot/sniper-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/sniper-shoot | auto |
| `foot/turret-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/turret-die | auto |
| `foot/turret-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/turret-hit | auto |
| `foot/turret-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/turret-idle | auto |
| `foot/turret-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/turret-shoot | auto |
| `foot/warden-attack2.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-attack2 | auto |
| `foot/warden-crouch.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-crouch | auto |
| `foot/warden-crouch-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-crouch-shoot | auto |
| `foot/warden-die.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-die | auto |
| `foot/warden-enrage.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-enrage | auto |
| `foot/warden-fall.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-fall | auto |
| `foot/warden-hit.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-hit | auto |
| `foot/warden-idle.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-idle | auto |
| `foot/warden-jump.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-jump | auto |
| `foot/warden-melee.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-melee | auto |
| `foot/warden-run-a.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-run-a | auto |
| `foot/warden-run-b.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-run-b | auto |
| `foot/warden-shoot.webp` | 1024x1024 | 1:1 | yes (flat white background, we key it) | On-foot street stage: foot/warden-shoot | auto |
| `fx-boom-boss-a.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-boss-a | auto |
| `fx-boom-boss-b.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-boss-b | auto |
| `fx-boom-debris.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-boom-debris | auto |
| `fx-boom-ground-dust.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-ground-dust | auto |
| `fx-boom-large-electric.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-large-electric | auto |
| `fx-boom-large-fire.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-large-fire | auto |
| `fx-boom-large-plasma.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-large-plasma | auto |
| `fx-boom-medium-electric.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-medium-electric | auto |
| `fx-boom-medium-fire.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-medium-fire | auto |
| `fx-boom-medium-plasma.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-boom-medium-plasma | auto |
| `fx-boom-small-electric.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-boom-small-electric | auto |
| `fx-boom-small-fire.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-boom-small-fire | auto |
| `fx-boom-small-plasma.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-boom-small-plasma | auto |
| `fx-bullet-needle.webp` | 256x64 | 4:1 | no | Enemy bullet effects | auto |
| `fx-bullet-rocket.webp` | 256x128 | 2:1 | no | Enemy bullet effects | auto |
| `fx-bullet-shell.webp` | 128x128 | 1:1 | no | Enemy bullet effects | auto |
| `fx-eb-aim-line.webp` | 256x32 | 8:1 | no | Effects (wave 8): fx-eb-aim-line | auto |
| `fx-eb-bomb.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-eb-bomb | auto |
| `fx-eb-heal-ring.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-eb-heal-ring | auto |
| `fx-eb-laser-sweep.webp` | 512x64 | 8:1 | no | Effects (wave 8): fx-eb-laser-sweep | auto |
| `fx-eb-mine.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-eb-mine | auto |
| `fx-eb-plasma.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-eb-plasma | auto |
| `fx-eb-rocket-trail.webp` | 512x128 | 4:1 | no | Effects (wave 8): fx-eb-rocket-trail | auto |
| `fx-eb-shield-bubble.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-eb-shield-bubble | auto |
| `fx-eb-shockwave-ring.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-eb-shockwave-ring | auto |
| `fx-eb-sniper-beam.webp` | 256x64 | 4:1 | no | Effects (wave 8): fx-eb-sniper-beam | auto |
| `fx-ft-arc.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-arc | auto |
| `fx-ft-arc-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-arc-hit | auto |
| `fx-ft-arc-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-arc-muzzle | auto |
| `fx-ft-blood-spark.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-blood-spark | auto |
| `fx-ft-dust.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-ft-dust | auto |
| `fx-ft-flame.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-flame | auto |
| `fx-ft-flame-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-flame-hit | auto |
| `fx-ft-flame-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-flame-muzzle | auto |
| `fx-ft-grenade.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-ft-grenade | auto |
| `fx-ft-mg-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-mg-bullet | auto |
| `fx-ft-mg-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-mg-hit | auto |
| `fx-ft-mg-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-mg-muzzle | auto |
| `fx-ft-pistol-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-pistol-bullet | auto |
| `fx-ft-pistol-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-pistol-hit | auto |
| `fx-ft-pistol-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-pistol-muzzle | auto |
| `fx-ft-rocket.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-rocket | auto |
| `fx-ft-rocket-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-rocket-hit | auto |
| `fx-ft-rocket-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-rocket-muzzle | auto |
| `fx-ft-shield-hit.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-ft-shield-hit | auto |
| `fx-ft-shotgun-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-shotgun-hit | auto |
| `fx-ft-shotgun-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-shotgun-muzzle | auto |
| `fx-ft-shotgun-pellet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-ft-shotgun-pellet | auto |
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
| `fx-pw-bomb-pulse.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-bomb-pulse | auto |
| `fx-pw-crescendo-glow.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-crescendo-glow | auto |
| `fx-pw-echo-ghost.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-pw-echo-ghost | auto |
| `fx-pw-fever-aura.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-fever-aura | auto |
| `fx-pw-level-up.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-level-up | auto |
| `fx-pw-magnet-field.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-magnet-field | auto |
| `fx-pw-nova-ring.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-nova-ring | auto |
| `fx-pw-pickup-glow.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-pickup-glow | auto |
| `fx-pw-shield-bubble.webp` | 512x512 | 1:1 | no | Effects (wave 8): fx-pw-shield-bubble | auto |
| `fx-pw-wingmate-trail.webp` | 256x64 | 4:1 | no | Effects (wave 8): fx-pw-wingmate-trail | auto |
| `fx-w-arc-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-arc-bullet | auto |
| `fx-w-arc-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-arc-hit | auto |
| `fx-w-arc-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-arc-muzzle | auto |
| `fx-w-beat-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-beat-bullet | auto |
| `fx-w-beat-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-beat-hit | auto |
| `fx-w-beat-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-beat-muzzle | auto |
| `fx-w-disc-bullet.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-w-disc-bullet | auto |
| `fx-w-disc-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-disc-hit | auto |
| `fx-w-disc-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-disc-muzzle | auto |
| `fx-w-drone-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-drone-bullet | auto |
| `fx-w-drone-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-drone-hit | auto |
| `fx-w-drone-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-drone-muzzle | auto |
| `fx-w-flame-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-flame-bullet | auto |
| `fx-w-flame-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-flame-hit | auto |
| `fx-w-flame-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-flame-muzzle | auto |
| `fx-w-frost-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-frost-bullet | auto |
| `fx-w-frost-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-frost-hit | auto |
| `fx-w-frost-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-frost-muzzle | auto |
| `fx-w-laser-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-laser-bullet | auto |
| `fx-w-laser-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-laser-hit | auto |
| `fx-w-laser-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-laser-muzzle | auto |
| `fx-w-mine-bullet.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-w-mine-bullet | auto |
| `fx-w-mine-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-mine-hit | auto |
| `fx-w-mine-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-mine-muzzle | auto |
| `fx-w-orbit-bullet.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-w-orbit-bullet | auto |
| `fx-w-orbit-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-orbit-hit | auto |
| `fx-w-orbit-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-orbit-muzzle | auto |
| `fx-w-pulse-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-pulse-bullet | auto |
| `fx-w-pulse-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-pulse-hit | auto |
| `fx-w-pulse-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-pulse-muzzle | auto |
| `fx-w-rail-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-rail-bullet | auto |
| `fx-w-rail-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-rail-hit | auto |
| `fx-w-rail-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-rail-muzzle | auto |
| `fx-w-shell-bullet.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effects (wave 8): fx-w-shell-bullet | auto |
| `fx-w-shell-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-shell-hit | auto |
| `fx-w-shell-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-shell-muzzle | auto |
| `fx-w-storm-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-storm-bullet | auto |
| `fx-w-storm-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-storm-hit | auto |
| `fx-w-storm-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-storm-muzzle | auto |
| `fx-w-swarm-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-swarm-bullet | auto |
| `fx-w-swarm-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-swarm-hit | auto |
| `fx-w-swarm-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-swarm-muzzle | auto |
| `fx-w-wave-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-wave-bullet | auto |
| `fx-w-wave-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-wave-hit | auto |
| `fx-w-wave-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-wave-muzzle | auto |
| `fx-w-well-bullet.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-well-bullet | auto |
| `fx-w-well-hit.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-well-hit | auto |
| `fx-w-well-muzzle.webp` | 256x256 | 1:1 | no | Effects (wave 8): fx-w-well-muzzle | auto |
| `gabtn-plate.webp` | 512x512 | 3.76 | yes (flat white background, we key it) | gaBtn plate | wiring |
| `go-dim-plate.webp` | 512x512 | 3.68 | yes (flat white background, we key it) | go dim plate | wiring |
| `kit-ckp.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-crt.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-dmg.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-drn.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-dsh.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-hul.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-mag.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-nmn.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-pwd.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-rev.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-rgn.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-rof.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
| `kit-shd.webp` | 128x128 | 1:1 | no | Garage perk icons | auto |
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
| `event-boss-warning.png` | 1920x1080 | 16:9 | no | Painting: event-boss-warning | auto |
| `event-level-clear.png` | 1920x1080 | 16:9 | no | Painting: event-level-clear | auto |
| `event-new-record.png` | 1920x1080 | 16:9 | no | Painting: event-new-record | auto |

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
| `ship-lancer-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: bank-left state | auto |
| `ship-lancer-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: bank-right state | auto |
| `ship-lancer-boost.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: boost state | wiring |
| `ship-lancer-damaged.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | lancer ship: damaged state | auto |
| `ship-nova-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: bank-left state | auto |
| `ship-nova-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: bank-right state | auto |
| `ship-nova-boost.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: boost state | wiring |
| `ship-nova-damaged.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | nova ship: damaged state | auto |
| `ship-std-bank-left.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: bank-left state | auto |
| `ship-std-bank-right.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: bank-right state | auto |
| `ship-std-boost.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: boost state | wiring |
| `ship-std-damaged.png` | 1024x1024 | 1:1 | yes (cut-out from flat background) | std ship: damaged state | auto |
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
