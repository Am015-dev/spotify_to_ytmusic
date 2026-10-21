# Mainhattan Nightrun: wiring audit (2026-10-21)

Read-only audit of what ships in `games/mainhattan-nightrun/` and whether the game code uses it. Scope: `games-src/anims/mainhattan-nightrun/sheets` (229 strips), `media/ready.json` plus the ids in `games-src/nightrun/ASSETS-NEEDED-2.md`, and the cues in `games-src/nightrun/music-treblo/`. Only `games-src/nightrun/parts/*.js` was searched.

## Method and limits
- **Sheets:** `anim/<dir>/<name>-strip.webp` checked against `ready.json`. Code use is a literal `dir/name` match, or a dynamic key builder (`'ship-'+id+'/flame'`, `'boss-'+nm+'/'+a`, the on-foot FM map in `art.js:190-194`, `'fx-boom-'+size+'-'+look'`), checked by hand for each family. Overrides are shown in the Where column.
- **Other media:** REFERENCED = a quoted literal id in parts, or a preload list (`fxN`, `shipN`, `enN`, `pkN`, `bossN` in art.js:6-11, loaded at art.js:109/111). TEMPLATE = a family builder I read by hand (`fg-`, `ui-`, `kit-`, `diff-`, `char-`, `medal-`, `soon-`, `ly-phone-`, `fx-fuse-tag-`); only the family was checked, not each id. No match = UNREFERENCED.
- **Music:** a cue counts as referenced when its key is used by the audio code. Not checked: whether the mp3 is shipped or in `tracks.json`, which is recorded in its own columns.

## 1. Strip sheets (229)

| sheet id | in ready.json | status | where (parts/*.js or art.js) |
|---|---|---|---|
| `boss-bruecken-waechter/attack` | yes | WIRED | art.js:103 |
| `boss-bruecken-waechter/defeat` | yes | WIRED | art.js:103 |
| `boss-bruecken-waechter/hit` | yes | WIRED | art.js:103 |
| `boss-bruecken-waechter/idle` | yes | WIRED | art.js:103 |
| `boss-flusskrake/attack` | yes | WIRED | art.js:103 |
| `boss-flusskrake/defeat` | yes | WIRED | art.js:103 |
| `boss-flusskrake/hit` | yes | WIRED | art.js:103 |
| `boss-flusskrake/idle` | yes | WIRED | art.js:103 |
| `boss-hoplite/attack` | yes | WIRED | art.js:103 |
| `boss-hoplite/defeat` | yes | WIRED | art.js:103 |
| `boss-hoplite/hit` | yes | WIRED | art.js:103 |
| `boss-hoplite/idle` | yes | WIRED | art.js:103 |
| `boss-kronos/attack` | yes | WIRED | art.js:103 |
| `boss-kronos/defeat` | yes | WIRED | art.js:103 |
| `boss-kronos/hit` | yes | WIRED | art.js:103 |
| `boss-kronos/idle` | yes | WIRED | art.js:132 |
| `boss-messe-waechter/attack` | yes | WIRED | art.js:103 |
| `boss-messe-waechter/defeat` | yes | WIRED | art.js:103 |
| `boss-messe-waechter/hit` | yes | WIRED | art.js:103 |
| `boss-messe-waechter/idle` | yes | WIRED | art.js:103 |
| `boss-schranken-wart/attack` | yes | WIRED | art.js:103 |
| `boss-schranken-wart/defeat` | yes | WIRED | art.js:103 |
| `boss-schranken-wart/hit` | yes | WIRED | art.js:103 |
| `boss-schranken-wart/idle` | yes | WIRED | art.js:103 |
| `boss-sek-adler/attack` | yes | WIRED | art.js:103 |
| `boss-sek-adler/defeat` | yes | WIRED | art.js:103 |
| `boss-sek-adler/hit` | yes | WIRED | art.js:103 |
| `boss-sek-adler/idle` | yes | WIRED | art.js:103 |
| `boss-talos/attack` | yes | WIRED | art.js:103 |
| `boss-talos/defeat` | yes | WIRED | art.js:103 |
| `boss-talos/hit` | yes | WIRED | art.js:103 |
| `boss-talos/idle` | yes | WIRED | art.js:103 |
| `boss-tresor-wart/attack` | yes | WIRED | art.js:103 |
| `boss-tresor-wart/defeat` | yes | WIRED | art.js:103 |
| `boss-tresor-wart/hit` | yes | WIRED | art.js:103 |
| `boss-tresor-wart/idle` | yes | WIRED | art.js:103 |
| `boss-zentral-ice/attack` | yes | WIRED | art.js:103 |
| `boss-zentral-ice/defeat` | yes | WIRED | art.js:103 |
| `boss-zentral-ice/hit` | yes | WIRED | art.js:103 |
| `boss-zentral-ice/idle` | yes | WIRED | art.js:103 |
| `bruiser/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `bruiser/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `bruiser/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `bruiser/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `bruiser/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `bruiser/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `drone/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `drone/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `drone/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `flamer/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `flamer/hit` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `flamer/spray` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `flamer/walk` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `fx-boom-boss-a/burst` | yes | WIRED | art.js:228 |
| `fx-boom-boss-b/burst` | yes | WIRED | art.js:228 |
| `fx-boom-debris/burst` | yes | WIRED | art.js:216 + fxwave.js:33 |
| `fx-boom-ground-dust/burst` | yes | WIRED | art.js:216 + fxwave.js:33 |
| `fx-boom-large-electric/burst` | yes | WIRED | fxwave.js:33 builds boom-<size>-<look>, LOOK fxwave.js:12 -> art.js:216 |
| `fx-boom-large-fire/burst` | yes | WIRED | art.js:224 |
| `fx-boom-large-plasma/burst` | yes | WIRED | fxwave.js:33 builds boom-<size>-<look>, LOOK fxwave.js:12 -> art.js:216 |
| `fx-boom-medium-electric/burst` | yes | WIRED | fxwave.js:33 builds boom-<size>-<look>, LOOK fxwave.js:12 -> art.js:216 |
| `fx-boom-medium-fire/burst` | yes | WIRED | art.js:224 |
| `fx-boom-medium-plasma/burst` | yes | WIRED | fxwave.js:33 builds boom-<size>-<look>, LOOK fxwave.js:12 -> art.js:216 |
| `fx-boom-small-electric/burst` | yes | WIRED | fxwave.js:33 builds boom-<size>-<look>, LOOK fxwave.js:12 -> art.js:216 |
| `fx-boom-small-fire/burst` | yes | WIRED | art.js:224 |
| `fx-boom-small-plasma/burst` | yes | WIRED | fxwave.js:33 builds boom-<size>-<look>, LOOK fxwave.js:12 -> art.js:216 |
| `fx-hitconfirm/burst` | yes | WIRED | art.js:215 |
| `fx-shield/glow` | yes | WIRED | art.js:223 |
| `fx-spark/burst` | yes | WIRED | art.js:215 |
| `grunt/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `grunt/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `grunt/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `grunt/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `grunt/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `grunt/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `gunman/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `gunman/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `gunman/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `gunman/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `gunman/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `gunman/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `hound/bite` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `hound/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `hound/pounce` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `hound/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `jetpack/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `jetpack/fly` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `jetpack/hover` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `jetpack/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/aimdiag` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/aimup` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/combo2` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/combo3` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/crouchshoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/dash` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/grenade` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/hurt` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/land` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/runshoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `kai/victory` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `knife/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `knife/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `knife/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `knife/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `knife/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `knife/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `mech/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `mech/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `mech/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `medic/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `medic/heal` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `medic/walk` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `ninja/block` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `ninja/dash` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `ninja/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `ninja/slash` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `pk-ammo/spin` | yes | UNWIRED | SPR.PK maps only shard/hp (art.js:219); ART.pkN has no ammo (art.js:11) |
| `pk-coin/spin` | yes | WIRED | art.js:219 |
| `pk-health/spin` | yes | WIRED | art.js:219 |
| `prop-banner/loop` | yes | WIRED | art.js:207 |
| `prop-beacon/loop` | yes | WIRED | art.js:207 |
| `prop-car/loop` | yes | WIRED | art.js:207 |
| `prop-drone/loop` | yes | WIRED | art.js:207 |
| `prop-holo/loop` | yes | WIRED | art.js:207 |
| `prop-neon/loop` | yes | WIRED | art.js:207 |
| `prop-police/loop` | yes | WIRED | art.js:207 |
| `prop-steam/glow` | yes | WIRED | art.js:207 |
| `prop-windows/loop` | yes | WIRED | art.js:207 |
| `shield/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `shield/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `shield/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `shield/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `shield/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `shield/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `ship-drift/death` | yes | WIRED | art.js:175 |
| `ship-drift/flame` | yes | WIRED | art.js:175 |
| `ship-ebomber/death` | yes | WIRED | art.js:175 |
| `ship-ebomber/flame` | yes | WIRED | art.js:175 |
| `ship-ebomber/volley` | yes | WIRED | art.js:175 |
| `ship-ec/death` | yes | WIRED | art.js:175 |
| `ship-ec/flame` | yes | WIRED | art.js:175 |
| `ship-ecarrier/death` | yes | WIRED | art.js:175 |
| `ship-ecarrier/flame` | yes | WIRED | art.js:175 |
| `ship-ecarrier/volley` | yes | WIRED | art.js:175 |
| `ship-ecruiser/death` | yes | WIRED | art.js:175 |
| `ship-ecruiser/flame` | yes | WIRED | art.js:175 |
| `ship-ecruiser/volley` | yes | WIRED | art.js:175 |
| `ship-egunship/death` | yes | WIRED | art.js:175 |
| `ship-egunship/flame` | yes | WIRED | art.js:175 |
| `ship-egunship/volley` | yes | WIRED | art.js:175 |
| `ship-einterceptor/death` | yes | WIRED | art.js:175 |
| `ship-einterceptor/flame` | yes | WIRED | art.js:175 |
| `ship-einterceptor/volley` | yes | WIRED | art.js:175 |
| `ship-ekamikaze/death` | yes | WIRED | art.js:175 |
| `ship-ekamikaze/flame` | yes | WIRED | art.js:175 |
| `ship-ekamikaze/volley` | yes | WIRED | art.js:175 |
| `ship-hv/death` | yes | WIRED | art.js:175 |
| `ship-hv/flame` | yes | WIRED | art.js:175 |
| `ship-lancer/death` | yes | WIRED | art.js:175 |
| `ship-lancer/flame` | yes | WIRED | art.js:175 |
| `ship-nova/death` | yes | WIRED | art.js:175 |
| `ship-nova/flame` | yes | WIRED | art.js:175 |
| `ship-std/death` | yes | WIRED | art.js:175 |
| `ship-std/flame` | yes | WIRED | art.js:175 |
| `ship-swg/death` | yes | WIRED | art.js:175 |
| `ship-swg/flame` | yes | WIRED | art.js:175 |
| `ship-syn/death` | yes | WIRED | art.js:175 |
| `ship-syn/flame` | yes | WIRED | art.js:175 |
| `ship-tri/death` | yes | WIRED | art.js:175 |
| `ship-tri/flame` | yes | WIRED | art.js:175 |
| `sniper/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `sniper/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `sniper/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `sniper/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `sniper/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `sniper/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `turret/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `turret/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `turret/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `warden/die` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `warden/idle` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `warden/jump` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `warden/melee` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `warden/run` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `warden/shoot` | yes | WIRED | art.js:190-194 FM map, art.js:195 footDraw |
| `wpn-arc/beam` | yes | UNWIRED | art.js:210 says beam sheets stay unwired by design |
| `wpn-arc/impact` | yes | WIRED | art.js:217 |
| `wpn-arc/muzzle` | yes | WIRED | art.js:217 |
| `wpn-beat/impact` | yes | WIRED | art.js:217 |
| `wpn-beat/muzzle` | yes | WIRED | art.js:217 |
| `wpn-disc/impact` | yes | WIRED | art.js:217 |
| `wpn-disc/muzzle` | yes | WIRED | art.js:217 |
| `wpn-drone/impact` | yes | WIRED | art.js:217 |
| `wpn-drone/muzzle` | yes | WIRED | art.js:217 |
| `wpn-flame/impact` | yes | WIRED | art.js:217 |
| `wpn-flame/muzzle` | yes | WIRED | art.js:217 |
| `wpn-frost/impact` | yes | WIRED | art.js:217 |
| `wpn-frost/muzzle` | yes | WIRED | art.js:217 |
| `wpn-laser/beam` | yes | UNWIRED | art.js:210 says beam sheets stay unwired by design |
| `wpn-laser/impact` | yes | WIRED | art.js:217 |
| `wpn-laser/muzzle` | yes | WIRED | art.js:217 |
| `wpn-mine/impact` | yes | WIRED | art.js:217 |
| `wpn-mine/muzzle` | yes | WIRED | art.js:217 |
| `wpn-orbit/beam` | yes | UNWIRED | art.js:210 says beam sheets stay unwired by design |
| `wpn-orbit/impact` | yes | WIRED | art.js:217 |
| `wpn-orbit/muzzle` | yes | WIRED | art.js:217 |
| `wpn-pulse/impact` | yes | WIRED | art.js:217 |
| `wpn-pulse/muzzle` | yes | WIRED | art.js:217 |
| `wpn-rail/impact` | yes | WIRED | art.js:217 |
| `wpn-rail/muzzle` | yes | WIRED | art.js:217 |
| `wpn-shell/impact` | yes | WIRED | art.js:217 |
| `wpn-shell/muzzle` | yes | WIRED | art.js:217 |
| `wpn-storm/beam` | yes | UNWIRED | art.js:210 says beam sheets stay unwired by design |
| `wpn-storm/impact` | yes | WIRED | art.js:217 |
| `wpn-storm/muzzle` | yes | WIRED | art.js:217 |
| `wpn-swarm/impact` | yes | WIRED | art.js:217 |
| `wpn-swarm/muzzle` | yes | WIRED | art.js:217 |
| `wpn-wave/beam` | yes | UNWIRED | art.js:210 says beam sheets stay unwired by design |
| `wpn-wave/impact` | yes | WIRED | art.js:217 |
| `wpn-wave/muzzle` | yes | WIRED | art.js:217 |
| `wpn-well/beam` | yes | UNWIRED | art.js:210 says beam sheets stay unwired by design |
| `wpn-well/impact` | yes | WIRED | art.js:217 |
| `wpn-well/muzzle` | yes | WIRED | art.js:217 |

## 2. Other media ids (ready.json + ASSETS-NEEDED-2.md)

| id | in ready.json | ASSETS-NEEDED-2 priority / wiring | status | where |
|---|---|---|---|---|
| `ac-fire-gap` | no | pri 3, wiring H | UNREFERENCED |  |
| `ac-flank-tell` | no | pri 1, wiring hooked W58b | REFERENCED | anticamp.js:62 |
| `ac-flanker` | no | pri 1, wiring H | UNREFERENCED |  |
| `boss-messe-waechter` | yes | - | REFERENCED | art.js:6 bossN -> art.js:111 |
| `boss-tresor-wart` | yes | - | REFERENCED | art.js:6 bossN -> art.js:111 |
| `bp-back` | no | pri 1, wiring hooked W58b | REFERENCED | bossplay.js:203 |
| `bp-blackout` | no | pri 3, wiring hooked W58b | REFERENCED | bossplay.js:192 |
| `bp-conveyor` | no | pri 2, wiring hooked W58b | REFERENCED | bossplay.js:196 |
| `bp-ghost` | no | pri 2, wiring hooked W58b | REFERENCED | bossplay.js:199 |
| `bp-medic` | no | pri 1, wiring hooked W58b | REFERENCED | bossplay.js:206 |
| `bp-node` | no | pri 1, wiring hooked W58b | REFERENCED | bossplay.js:207 |
| `bp-parry-orb` | no | pri 2, wiring hooked W58b | REFERENCED | bossplay.js:208 |
| `bp-plate-emp` | no | pri 2, wiring hooked W58b | REFERENCED | bossplay.js:204 |
| `bp-slab` | no | pri 1, wiring hooked W58b | REFERENCED | bossplay.js:194 |
| `card-back` | yes | - | REFERENCED | shapes.js:40 |
| `card-frame` | yes | - | REFERENCED | shapes.js:43 |
| `char-ally` | yes | - | TEMPLATE | tale.js:119 |
| `char-courier` | yes | - | TEMPLATE | tale.js:119 |
| `char-dispatch` | yes | - | TEMPLATE | tale.js:119 |
| `char-lumen` | yes | - | TEMPLATE | tale.js:119 |
| `char-mechanic` | yes | - | TEMPLATE | tale.js:119 |
| `char-rival` | yes | - | TEMPLATE | tale.js:119 |
| `chest-closed` | yes | - | REFERENCED | shapes.js:39 |
| `chest-open` | yes | - | REFERENCED | shapes.js:44 |
| `diff-easy` | yes | - | TEMPLATE | shapes.js:13 |
| `diff-hard` | yes | - | TEMPLATE | shapes.js:13 |
| `diff-legend` | yes | - | TEMPLATE | shapes.js:13 |
| `diff-normal` | yes | - | TEMPLATE | shapes.js:13 |
| `diff-vhard` | yes | - | TEMPLATE | shapes.js:13 |
| `fg-h-bassswell` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-blackshell` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-choirbomb` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-clustershell` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-edgearc` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-firefield` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-gravmines` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-halocoil` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-heatwave` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-hivemind` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-horizon` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-huntermines` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-iceneedle` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-minelance` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-prismdisc` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-pulselance` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-railric` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-ringshell` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-seedfan` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-shardring` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-snowburst` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-squalldisc` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-thunderhead` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-h-voltrail` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-k-burn` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-k-decoy` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-k-magnet` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-k-phase` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-k-ram` | no | pri 1, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-beat` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-bounce` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-heavy` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-homing` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-nova` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-pierce` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-ring` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-seed` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-shield` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-split` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-wide` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-m-zap` | no | pri 2, wiring A | TEMPLATE | forge.js:124 |
| `fg-p-salvage` | no | pri 3, wiring A | TEMPLATE | forge.js:124 |
| `fg-p-showman` | no | pri 3, wiring A | TEMPLATE | forge.js:124 |
| `fg-p-spare` | no | pri 3, wiring A | TEMPLATE | forge.js:124 |
| `fx-bullet-enemy` | yes | - | REFERENCED | ai.js:67 |
| `fx-crown` | yes | - | REFERENCED | ai.js:33 |
| `fx-engine` | yes | - | REFERENCED | draw.js:34 |
| `fx-explosion-big` | yes | - | REFERENCED | art.js:10 fxN -> art.js:109 |
| `fx-explosion-boss` | yes | - | REFERENCED | art.js:10 fxN -> art.js:109 |
| `fx-explosion-small` | yes | - | REFERENCED | art.js:10 fxN -> art.js:109 |
| `fx-fuse-tag-any-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-blast-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-bounce-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-bounce-pierce` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-burst-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-chain-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-homing-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-homing-burst` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-melee-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-mine-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-orbit-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-pierce-spread` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-pull-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-slow-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-fuse-tag-wave-any` | yes | - | TEMPLATE | g.js:234 (timg) |
| `fx-hit-spark` | yes | - | REFERENCED | art.js:10 fxN -> art.js:109 |
| `fx-muzzle` | yes | - | REFERENCED | art.js:10 fxN -> art.js:109 |
| `fx-orb-homing` | yes | - | REFERENCED | ai.js:40 |
| `fx-shield-link` | yes | - | REFERENCED | ai.js:37 |
| `fx-shockwave` | yes | - | REFERENCED | art.js:64 |
| `fx-shot-ec` | yes | - | REFERENCED | c.js:116 |
| `fx-shot-hv` | yes | - | REFERENCED | c.js:115 |
| `fx-shot-perfect` | yes | - | REFERENCED | c.js:117 |
| `fx-shot-std` | yes | - | REFERENCED | c.js:118 |
| `fx-w34-ac-fire` | no | pri 1, wiring H | UNREFERENCED |  |
| `fx-w34-ac-line` | no | pri 3, wiring H | UNREFERENCED |  |
| `fx-w34-bp-gravity` | no | pri 2, wiring hooked W58b | REFERENCED | bossplay.js:197 |
| `fx-w34-bp-grid` | no | pri 1, wiring hooked W58b | REFERENCED | bossplay.js:198 |
| `fx-w34-bp-medlink` | no | pri 1, wiring hooked W58b | REFERENCED | bossplay.js:205 |
| `fx-w34-bp-zone` | no | pri 2, wiring hooked W58b | REFERENCED | bossplay.js:200 |
| `fx-w34-elite-aura` | no | pri 1, wiring hooked W58b | REFERENCED | variants.js:109 |
| `fx-w34-gk-medlink` | no | pri 2, wiring H | UNREFERENCED |  |
| `fx-w34-gk-shield` | no | pri 1, wiring hooked W58b | REFERENCED | grit.js:60 |
| `fx-w34-rule-cash` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:128 |
| `fx-w34-rule-gate` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:143 |
| `fx-w34-rule-lane` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:67 |
| `fx-w34-rule-pocket` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:121 |
| `fx-w34-rule-portal` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:106 |
| `fx-w34-rule-tide` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:113 |
| `fx-w34-rule-well` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:60 |
| `fx-w34-strike-col` | no | pri 1, wiring H | UNREFERENCED |  |
| `fx-w34-ui-ring-charge` | no | pri 2, wiring H | UNREFERENCED |  |
| `fx-w34-ui-ring-empty` | no | pri 3, wiring H | UNREFERENCED |  |
| `fx-w34-ui-ring-ready` | no | pri 2, wiring H | UNREFERENCED |  |
| `gk-evasive` | no | pri 1, wiring hooked W58b | REFERENCED | grit.js:60 |
| `gk-medic` | no | pri 1, wiring hooked W58b | REFERENCED | grit.js:62 |
| `gk-plate` | no | pri 1, wiring hooked W58b | REFERENCED | grit.js:60 |
| `kit-as` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-bd` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-bt` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-cl` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-ec` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-hm` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-lk` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-ni` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-og` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-pc` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-rc` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-rg` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-sc` | yes | - | REFERENCED | garage.js:61 |
| `kit-sm` | yes | - | TEMPLATE | upgrades.js:136 |
| `kit-wn` | yes | - | TEMPLATE | upgrades.js:136 |
| `ly-phone-athina` | yes | - | TEMPLATE | bg.js:182 |
| `ly-phone-bankenviertel` | yes | - | TEMPLATE | bg.js:182 |
| `ly-phone-mainufer` | yes | - | TEMPLATE | bg.js:182 |
| `ly-phone-messe` | yes | - | TEMPLATE | bg.js:182 |
| `ly-phone-ostend` | yes | - | TEMPLATE | bg.js:182 |
| `medal-bronze` | yes | - | TEMPLATE | shapes.js:15 |
| `medal-gold` | yes | - | TEMPLATE | shapes.js:15 |
| `medal-silver` | yes | - | TEMPLATE | shapes.js:15 |
| `nv-tw-armored` | no | pri 2, wiring hooked W58b | REFERENCED | novelty.js:74 |
| `nv-tw-gilded` | no | pri 2, wiring hooked W58b | REFERENCED | novelty.js:75 |
| `nv-tw-lead` | no | pri 2, wiring hooked W58b | REFERENCED | novelty.js:78 |
| `nv-tw-swift` | no | pri 3, wiring hooked W58b | REFERENCED | novelty.js:76 |
| `nv-tw-tiny` | no | pri 3, wiring hooked W58b | REFERENCED | novelty.js:77 |
| `rule-bounce` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:75 |
| `rule-bounce-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-bumper` | no | pri 2, wiring A | REFERENCED | rules.js:160 |
| `rule-bumper-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-cash-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-cover` | no | pri 2, wiring A | REFERENCED | rules.js:152 |
| `rule-cover-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-echo` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:84 |
| `rule-echo-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-gate-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-gold` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:101 |
| `rule-gold-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-hulls` | no | pri 2, wiring hooked W58b | REFERENCED | rules.js:91 |
| `rule-hulls-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-hunter` | no | pri 2, wiring A | REFERENCED | rules.js:137 |
| `rule-hunter-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-lane-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-pads` | no | pri 2, wiring A | REFERENCED | rules.js:168 |
| `rule-pads-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-pocket-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-portal-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-tide-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rule-well-icon` | no | pri 3, wiring H | UNREFERENCED |  |
| `rx-bait` | no | pri 2, wiring H | UNREFERENCED |  |
| `rx-crown` | no | pri 3, wiring hooked W58b | REFERENCED | react.js:128 |
| `rx-feint` | no | pri 2, wiring H | UNREFERENCED |  |
| `rx-hunt` | no | pri 2, wiring H | UNREFERENCED |  |
| `rx-press` | no | pri 2, wiring H | UNREFERENCED |  |
| `rx-retreat` | no | pri 2, wiring H | UNREFERENCED |  |
| `rx-ring-gold` | no | pri 2, wiring hooked W58b | REFERENCED | react.js:127 |
| `rx-ring-steel` | no | pri 2, wiring hooked W58b | REFERENCED | react.js:127 |
| `rx-window` | no | pri 2, wiring H | UNREFERENCED |  |
| `ship-drift` | yes | - | UNREFERENCED |  |
| `ship-lancer` | yes | - | UNREFERENCED |  |
| `ship-nova` | yes | - | UNREFERENCED |  |
| `soon-boss-trophies` | yes | - | TEMPLATE | shapes.js:20 |
| `soon-contracts` | yes | - | TEMPLATE | shapes.js:20 |
| `soon-leaderboards` | yes | - | TEMPLATE | shapes.js:20 |
| `soon-pilot-ranks` | yes | - | TEMPLATE | shapes.js:20 |
| `soon-ship-skins` | yes | - | TEMPLATE | shapes.js:20 |
| `soon-squad-roster` | yes | - | TEMPLATE | shapes.js:20 |
| `soon-weapon-forge` | yes | - | TEMPLATE | shapes.js:20 |
| `spr-boss-messe-waechter` | yes | - | REFERENCED | art.js:6 bossN -> art.js:111 |
| `spr-boss-tresor-wart` | yes | - | REFERENCED | art.js:6 bossN -> art.js:111 |
| `spr-en-leader` | yes | - | REFERENCED | ai.js:31 |
| `spr-ship-drift` | yes | - | UNREFERENCED |  |
| `spr-ship-lancer` | yes | - | UNREFERENCED |  |
| `spr-ship-nova` | yes | - | UNREFERENCED |  |
| `ui-dash-icon` | no | pri 1, wiring A | TEMPLATE | abilities.js:99 |
| `ui-emp-icon` | no | pri 1, wiring A | TEMPLATE | abilities.js:99 |
| `var-elite-diamond` | no | pri 2, wiring hooked W58b | REFERENCED | variants.js:110 |
| `var-pip` | no | pri 3, wiring hooked W58b | REFERENCED | variants.js:108 |
| `wp-drone` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |
| `wp-flame` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |
| `wp-frost` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |
| `wp-rail` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |
| `wp-shell` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |
| `wp-storm` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |
| `wp-wave` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |
| `wp-well` | yes | - | UNREFERENCED | wp-*: labassets.js:145 parses the name only, no draw path |

## 3. Music cues (games-src/nightrun/music-treblo, 82 mp3)

| cue file | cue key | referenced by audio code | shipped in games music/ | in tracks.json | wired |
|---|---|---|---|---|---|
| `athina-a.mp3` | `athina` | athens.js:83 uses key athina (stage 13-15 song) | no | no | yes |
| `athina-b.mp3` | `athina` | athens.js:83 uses key athina (stage 13-15 song) | no | no | yes |
| `boss-d1-a.mp3` | `boss-d1` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d1-b.mp3` | `boss-d1` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d1-v2-a.mp3` | `boss-d1-v2` | none | no | no | no |
| `boss-d1-v2-b.mp3` | `boss-d1-v2` | none | no | no | no |
| `boss-d2-a.mp3` | `boss-d2` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d2-b.mp3` | `boss-d2` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d2-v2-a.mp3` | `boss-d2-v2` | none | no | no | no |
| `boss-d2-v2-b.mp3` | `boss-d2-v2` | none | no | no | no |
| `boss-d3-a.mp3` | `boss-d3` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d3-b.mp3` | `boss-d3` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d4-a.mp3` | `boss-d4` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d4-b.mp3` | `boss-d4` | ret.js:192-193 (bossT / bossRows) | no | no | yes |
| `boss-d4-v2-a.mp3` | `boss-d4-v2` | none | no | no | no |
| `boss-d4-v2-b.mp3` | `boss-d4-v2` | none | no | no | no |
| `d1a-a.mp3` | `d1a` | ret.js:191 (DP.rows) | no | no | yes |
| `d1a-b.mp3` | `d1a` | ret.js:191 (DP.rows) | no | no | yes |
| `d1b-a.mp3` | `d1b` | ret.js:191 (DP.rows) | no | no | yes |
| `d1b-b.mp3` | `d1b` | ret.js:191 (DP.rows) | no | no | yes |
| `d1b-v2-a.mp3` | `d1b-v2` | none | no | no | no |
| `d1b-v2-b.mp3` | `d1b-v2` | none | no | no | no |
| `d2a-a.mp3` | `d2a` | ret.js:191 (DP.rows) | no | no | yes |
| `d2a-b.mp3` | `d2a` | ret.js:191 (DP.rows) | no | no | yes |
| `d2b-a.mp3` | `d2b` | ret.js:191 (DP.rows) | no | no | yes |
| `d2b-b.mp3` | `d2b` | ret.js:191 (DP.rows) | no | no | yes |
| `d2b-v2-a.mp3` | `d2b-v2` | none | no | no | no |
| `d2b-v2-b.mp3` | `d2b-v2` | none | no | no | no |
| `d3a-a.mp3` | `d3a` | ret.js:191 (DP.rows) | no | no | yes |
| `d3a-b.mp3` | `d3a` | ret.js:191 (DP.rows) | no | no | yes |
| `d3a-v2-a.mp3` | `d3a-v2` | none | no | no | no |
| `d3a-v2-b.mp3` | `d3a-v2` | none | no | no | no |
| `d3b-a.mp3` | `d3b` | ret.js:191 (DP.rows) | no | no | yes |
| `d3b-b.mp3` | `d3b` | ret.js:191 (DP.rows) | no | no | yes |
| `d4a-a.mp3` | `d4a` | ret.js:191 (DP.rows) | no | no | yes |
| `d4a-b.mp3` | `d4a` | ret.js:191 (DP.rows) | no | no | yes |
| `d4a-v2-a.mp3` | `d4a-v2` | none | no | no | no |
| `d4a-v2-b.mp3` | `d4a-v2` | none | no | no | no |
| `d4b-a.mp3` | `d4b` | ret.js:191 (DP.rows) | no | no | yes |
| `d4b-b.mp3` | `d4b` | ret.js:191 (DP.rows) | no | no | yes |
| `endless3-a.mp3` | `endless3` | none | no | no | no |
| `endless3-b.mp3` | `endless3` | none | no | no | no |
| `fever-120-a.mp3` | `fever-120` | none | no | no | no |
| `fever-120-b.mp3` | `fever-120` | none | no | no | no |
| `fever-128-a.mp3` | `fever-128` | none | no | no | no |
| `fever-128-b.mp3` | `fever-128` | none | no | no | no |
| `fever-132-a.mp3` | `fever-132` | none | no | no | no |
| `fever-132-b.mp3` | `fever-132` | none | no | no | no |
| `pit-a.mp3` | `pit` | none | no | no | no |
| `pit-b.mp3` | `pit` | none | no | no | no |
| `school-a.mp3` | `school` | none | no | no | no |
| `school-b.mp3` | `school` | none | no | no | no |
| `st-boss-in-a.mp3` | `st-boss-in` | none | no | no | no |
| `st-boss-in-b.mp3` | `st-boss-in` | none | no | no | no |
| `st-clear-a.mp3` | `st-clear` | none | no | no | no |
| `st-clear-b.mp3` | `st-clear` | none | no | no | no |
| `st-fail-a.mp3` | `st-fail` | none | no | no | no |
| `st-fail-b.mp3` | `st-fail` | none | no | no | no |
| `st-newbest-a.mp3` | `st-newbest` | none | no | no | no |
| `st-newbest-b.mp3` | `st-newbest` | none | no | no | no |
| `st-perfect-a.mp3` | `st-perfect` | none | no | no | no |
| `st-perfect-b.mp3` | `st-perfect` | none | no | no | no |
| `st-phase-a.mp3` | `st-phase` | none | no | no | no |
| `st-phase-b.mp3` | `st-phase` | none | no | no | no |
| `st-tierup1-a.mp3` | `st-tierup1` | none | no | no | no |
| `st-tierup1-b.mp3` | `st-tierup1` | none | no | no | no |
| `st-tierup2-a.mp3` | `st-tierup2` | none | no | no | no |
| `st-tierup2-b.mp3` | `st-tierup2` | none | no | no | no |
| `st-tierup3-a.mp3` | `st-tierup3` | none | no | no | no |
| `st-tierup3-b.mp3` | `st-tierup3` | none | no | no | no |
| `st-unlock-a.mp3` | `st-unlock` | none | no | no | no |
| `st-unlock-b.mp3` | `st-unlock` | none | no | no | no |
| `street1-a.mp3` | `street1` | none | no | no | no |
| `street1-b.mp3` | `street1` | none | no | no | no |
| `street1-boss-a.mp3` | `street1-boss` | none | no | no | no |
| `street1-boss-b.mp3` | `street1-boss` | none | no | no | no |
| `street1-clear-a.mp3` | `street1-clear` | none | no | no | no |
| `street1-clear-b.mp3` | `street1-clear` | none | no | no | no |
| `street1-lock-a.mp3` | `street1-lock` | none | no | no | no |
| `street1-lock-b.mp3` | `street1-lock` | none | no | no | no |
| `talos-a.mp3` | `talos` | none | no | no | no |
| `talos-b.mp3` | `talos` | none | no | no | no |

## Counts

- **Strip sheets:** 222 wired / 7 unwired of 229 (all 229 are in ready.json).
- **Other media ids:** 69 referenced referenced by literal or preload list, 101 by family template (per id not verified), 44 unreferenced, of 214 ids.
- **Music cues:** 26 referenced by audio code / 56 not, of 82. Shipped to games/music: 0 of 82 (only the 11 original tracks are there). Listed in tracks.json: 0 of 82.

## Top 20 unwired items (by importance)

1. **Boss music, district bosses:** `boss-d1..d4` a/b (8 files). `ret.js:192-193` uses them, but the mp3s are not shipped and there are no tracks.json entries, so they never play.
2. **Boss music, TALOS:** `talos-a/b`. No code reference at all (district 6 uses `boss3`, `ret.js:192`), and not shipped.
3. **Stage music, district pools:** `d1a..d4b` a/b (16 files). `ret.js:191` references them, but not shipped and no tracks.json entries; rows without an entry are ignored (`ret.js:185-186`).
4. **Stage music, Athina 13-15:** `athina-a/b`. `athens.js:83` still plays the old `athina` track; the new cues are not shipped.
5. **Street stage music:** `street1`, `street1-lock`, `street1-boss`, `street1-clear` (8 files). Unreferenced; `foot.js:36` plays `stage2`.
6. **Fever music:** `fever-120/128/132` a/b (6 files). Unreferenced.
7. **Endless third theme:** `endless3` a/b (2 files). Unreferenced; `b.js:106` still uses endless/endless2.
8. **Pit-stop music:** `pit-a/b`. Unreferenced (`choices.js:83` is the pit offer, not music).
9. **Tutorial music:** `school-a/b`. Unreferenced.
10. **Stingers:** `st-boss-in`, `st-clear`, `st-fail`, `st-perfect`, `st-phase`, `st-tierup1-3`, `st-newbest`, `st-unlock` (20 files). `a.js:119` reads a `stingers` list from tracks.json, which does not exist, so none load. `st-newbest` and `st-unlock` have no caller.
11. **Shipped, unused: wpn beam sheets** (`wpn-arc/laser/orbit/storm/wave/well` `beam`, 6 sheets). Deliberately unwired per `art.js:210`.
12. **Shipped, unused: `pk-ammo/spin`.** `SPR.PK` (art.js:219) and `ART.pkN` (art.js:11) have no ammo pickup.
13. **Shipped, unused: ship stills `ship-drift/lancer/nova` and `spr-ship-drift/lancer/nova` (6 files).** Their sheets are wired, but the stills are not in `ART.shipN` (art.js:8) and nothing else draws them.
14. **Shipped, unused: `wp-*` weapon panel stills** (8 files: drone, flame, frost, rail, shell, storm, wave, well). Only `labassets.js:145` parses the name.
15. **Priority 1, not painted and not hooked: `ac-flanker`.** Needs an `ART.pic` call; `anticamp.js` uses `ac-flank-tell` instead.
16. **Priority 1, not painted: forge icons `fg-h-*` / `fg-k-*` (17 files).** Reached by the template at `forge.js:124`, so they appear once painted and ingested.
17. **Priority 1, not painted: `ui-dash-icon`, `ui-emp-icon`.** Template at `abilities.js:99`; skipped while absent from ready.json.
18. **Priority 1, not hooked: `fx-w34-ac-fire`, `fx-w34-strike-col`.** No `ART.pic` call anywhere.
19. **Priority 2, not hooked: `rx-bait`, `rx-feint`, `rx-hunt`, `rx-press`, `rx-retreat`, `rx-window`** (6 files). No references.
20. **Priority 3, not hooked: 15 `rule-*-icon` banner icons.** The game draws the `rule-bounce`, `rule-echo` and `rule-hulls` stills; the icon ids are not used.

Generated from the parts files at commit time; re-run after changes.
