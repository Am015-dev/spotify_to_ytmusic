# Enemy ships: sheets the owner should create (21 Oct 2026)

Every fly-stage enemy that has a ship look now draws from an approved ship sheet (`parts/foeart.js`, table `ENEMY_ART`, flag `RET.foeart`, `?foeart=0` = old art).
Only six enemy-ship sheets exist (interceptor, bomber, gunship, kamikaze, carrier, cruiser), so most types are a **re-tinted stand-in** of the nearest one.
Per ASSET-POLICY.md a stand-in is only a recoloured / scaled / flipped approved sheet; where a type needs its own mark it carries a plain flat triangle / circle / box labelled with the asset id below (no art drawn in code). Below: each stand-in type with the real sheet to make, most frequent first. A new sheet replaces its row by changing `s` (and dropping `t`) in `ENEMY_ART`; nothing else.

Sheet spec for all rows: folder `ship-<id>/`, acts `flame` (loop, 4 frames, 12 fps), `volley` (loop, 4 frames, shown while the unit is about to fire), `death` (one-shot, 5 frames); cell 520 px wide, height as listed; transparent background; the ship faces LEFT (enemies fly right to left); anchor = centre. Prompts are one line each, in the style of `next-wave/flow-2d/mainhattan-nightrun/prompts-w34.json`.

Order = how often the type is on screen: on-screen draws summed over the 90 s human-model bot runs on stages 2/6/10/14/20 (`BOT=1 node nightrun/foeart-test.js`).

| # | game id (stand-in today) | new sheet id | cell | what it is | draws in 5 bot runs |
|--:|---|---|---|---|--:|
| 1 | drone (interceptor, blue) | `ship-edrone` | 520x150 | small two-rotor scout, red/blue beat lights; leader = gold crown plate | 5341 |
| 2 | charger (kamikaze, orange) | `ship-echarger` | 520x150 | wedge ram with a red nose, thrusters flare in `volley` | 2309 |
| 3 | turret (gunship, amber) | `ship-eturret` | 400x400 | hex emplacement + separate `ship-eturret/barrel` strip that turns (square cell) | 2010 |
| 4 | zdrn (interceptor, purple) | `ship-ezdrone` | 520x110 | splitter fragment, smaller and plain | 1763 |
| 5 | swarm (interceptor, magenta) | `ship-eswarm` | 520x110 | tiny dart, reads at 20 px, flies in groups of 10 | 1670 |
| 6 | mine (bomber, amber) | `ship-emine` | 360x360 | round spiked mine, blinking amber core (square cell, no facing) | 801 |
| 7 | gate (bomber, red, rotated) | `ship-egate` | 220x360 | one pylon with a field emitter on its tip; the code mirrors it for the bottom post | 391 |
| 8 | efdrone (interceptor, lilac) | `ship-ecdrone` | 520x110 | carrier escort drone with a tether lamp | 338 |
| 9 | gturret (old code shape, ground) | `ship-egturret` | 400x400 | ground dome turret | 333 |
| 10 | shielder (gunship, cyan) | `ship-eshielder` | 520x180 | armoured front plate; shield arc as a separate `ship-eshielder/shield` loop | 268 |
| 11 | splitter (interceptor, pink) | `ship-esplitter` | 520x170 | two halves joined by a glowing seam; `death` splits into two drones | 234 |
| 12 | sniper (interceptor, lime) | `ship-esniper` | 520x120 | long thin hull, lens that glows red when locking (`volley`) | 206 |
| 13 | gwalker (old code shape, ground) | `ship-egwalker` | 520x400 | two-legged walker, `flame` = walk cycle | 198 |
| 14 | flank (interceptor, cyan) | `ship-eflank` | 520x130 | slim cyan side-striker | 170 |
| 15 | gtank (old code shape, ground) | `ship-egtank` | 520x260 | ground tank, treads animated in `flame` | 88 |
| 16 | fk-diver (kamikaze, orange) | `ship-ediver` | 520x150 | shielded arrowhead, shield bubble as `ship-ediver/shield` | 64 |
| 17 | fk-crawler (bomber, green) | `ship-ecrawler` | 520x120 | low wall-hugging half-dome with legs | 5 |
| 18 | healer (interceptor, mint) | `ship-ehealer` | 520x170 | rounded medic craft with a white cross | 0 (zoo stage 16+, not met in the 90 s runs) |
| 19 | bomber (bomber, amber) | `ship-ezbomber` | 520x180 | light bomber with a belly bomb bay (the fleet's heavy bomber stays `ebomber`) | 0 (not met) |
| 20 | minelayer (bomber, yellow-green) | `ship-eminelayer` | 520x180 | stern mine hatch, `volley` = hatch open | 0 (not met) |
| 21 | fk-bait (interceptor, pink) | `ship-ebait` | 520x140 | round decoy lamp | 0 (flankers are off by default) |

The three ground units (gtank, gturret, gwalker): no ship sheet can stand in for them, so they still draw their old picture and are listed in `FOEART_NEEDS`.

## Flow prompts (one per sheet; paste with the 4-frame strip layout of `anims/FLOW-SPRITE-STRIPS.md`)

```json
{
 "ship-edrone": "Neon cyberpunk game art, Frankfurt 2099, glowing teal/magenta/amber neon on dark steel, crisp bright outline, chunky simple shape that reads at 40 px, no text. A small enemy scout drone seen from the side, nose pointing LEFT, two small rotors on top, a red and a blue beat light, 4-frame flame strip, transparent background, single object, centred.",
 "ship-eswarm": "Neon cyberpunk game art, same style. A tiny magenta dart-shaped enemy ship seen from the side, nose pointing LEFT, reads at 20 px, short engine flame, 4-frame strip, transparent background, centred.",
 "ship-emine": "Neon cyberpunk game art, same style. A round spiked space mine seen from the front, eight amber spikes, blinking amber core, 4-frame pulse strip, transparent background, centred, square cell.",
 "ship-echarger": "Neon cyberpunk game art, same style. A red wedge-shaped ramming enemy ship seen from the side, nose pointing LEFT, glowing red nose, thrusters flare in the volley strip, 4 frames, transparent background, centred.",
 "ship-eflank": "Neon cyberpunk game art, same style. A slim cyan side-striking enemy fighter seen from the side, nose pointing LEFT, swept wings, 4-frame flame strip, transparent background, centred.",
 "ship-eturret": "Neon cyberpunk game art, same style. A hexagonal amber enemy gun emplacement seen from the side, round hub, 4-frame idle glow strip, plus a separate barrel strip pointing LEFT, transparent background, square cell.",
 "ship-egate": "Neon cyberpunk game art, same style. A single red laser-gate pylon seen from the side, field emitter glowing on its tip, 4-frame pulse strip, transparent background, centred.",
 "ship-eshielder": "Neon cyberpunk game art, same style. A heavy cyan enemy gunship with a thick armoured front plate, seen from the side, nose pointing LEFT, 4-frame flame strip; a separate cyan energy shield arc loop strip, transparent background.",
 "ship-esplitter": "Neon cyberpunk game art, same style. A pink enemy ship made of two halves joined by a glowing seam, seen from the side, nose pointing LEFT, 4-frame flame strip; death strip shows it tearing into two drones, transparent background.",
 "ship-ezbomber": "Neon cyberpunk game art, same style. A light amber enemy bomber seen from the side, nose pointing LEFT, open belly bomb bay under the hull, 4-frame flame strip, transparent background, centred.",
 "ship-esniper": "Neon cyberpunk game art, same style. A long thin lime-green enemy sniper ship seen from the side, nose pointing LEFT, a lens at the nose that glows red when aiming, 4-frame strip, transparent background.",
 "ship-ehealer": "Neon cyberpunk game art, same style. A rounded mint-green enemy medic ship with a white cross on the hull, seen from the side, nose pointing LEFT, 4-frame flame strip, transparent background.",
 "ship-eminelayer": "Neon cyberpunk game art, same style. A yellow-green enemy minelayer seen from the side, nose pointing LEFT, a mine hatch at the stern, volley strip shows the hatch open, 4 frames, transparent background.",
 "ship-ezdrone": "Neon cyberpunk game art, same style. A small plain purple enemy drone fragment seen from the side, nose pointing LEFT, reads at 24 px, 4-frame flame strip, transparent background.",
 "ship-ecdrone": "Neon cyberpunk game art, same style. A small lilac carrier escort drone seen from the side, nose pointing LEFT, a glowing tether lamp on its back, 4-frame flame strip, transparent background.",
 "ship-ediver": "Neon cyberpunk game art, same style. An orange arrowhead enemy diver seen from the side, nose pointing LEFT, 4-frame flame strip; a separate cyan shield bubble loop strip, transparent background.",
 "ship-ecrawler": "Neon cyberpunk game art, same style. A low green half-dome enemy crawler with little legs, seen from the side, 4-frame crawling strip, transparent background, centred.",
 "ship-ebait": "Neon cyberpunk game art, same style. A round pink decoy lamp ship seen from the side, nose pointing LEFT, soft pulsing light, 4-frame strip, transparent background.",
 "ship-egtank": "Neon cyberpunk game art, same style. A ground enemy tank seen from the side, barrel pointing up and LEFT, treads animated across the 4-frame strip, transparent background.",
 "ship-egturret": "Neon cyberpunk game art, same style. A ground dome gun turret seen from the side, barrel pointing LEFT, 4-frame idle glow strip, transparent background, square cell.",
 "ship-egwalker": "Neon cyberpunk game art, same style. A two-legged ground walker mech with an arm cannon pointing LEFT, seen from the side, 4-frame walk cycle strip, transparent background."
}
```

Also not covered by any sheet: enemy bullets and beams (drawn as code / `fx-w-*` stills) and the boss minions (they reuse `mine`).
