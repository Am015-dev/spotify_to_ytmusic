# Tidewake: sound map

Every event has a sample with the same name; `sound.js` keeps its synth as the fallback:

```js
const TW_VOL = { /* the "vol" column below */ };
if (window.GA && GA.has(name)) { GA.play(name, {vol: TW_VOL[name] ?? 1}); return; }  // else fall through to the synth
```

Pack size: `audio-data.js` 740 KB (26 effects = 212 KB, 2 music loops = 343 KB, all mono MP3 56 kbps).

| group | event | sample | source | length | vol | ducks music | notes |
|---|---|---|---|---|---|---|---|
| Ambience | `sea_loop` | `sea_loop` | 40 CC0 water / splash / slime SFX: loop_water_02.ogg + wind_background_noise_2.wav | 6.51 s | 0.5 |  | gentle ocean bed: GA.loop('sea_loop',{vol:.5}) |
| Board | `tile_place` | `tile_place` | Kenney Impact Sounds: impactWood_medium_001.ogg + impactPlank_medium_001.ogg | 0.44 s | 1.1 |  | tile placed (wood on wood) |
| Board | `tile_rotate` | `tile_rotate` | Kenney Impact Sounds: impactWood_light_002.ogg | 0.12 s | 1.0 |  | tile rotate click |
| Board | `ship_glide` | `ship_glide` | Kenney RPG Audio: creak2.ogg + splash_14.ogg | 0.78 s | 0.8 |  | ship glides one step: soft creak over a water lap |
| Board | `ship_creak` | `ship_creak` | Kenney RPG Audio: creak1.ogg | 0.61 s | 0.8 |  | timber creak (ship starts / long run) |
| Board | `wake_swish` | `wake_swish` | 100 CC0 SFX #2: sfx100v2_air_01.ogg + splash_10.ogg | 0.80 s | 0.7 |  | wake swish (ship travels a long path) |
| Hazard | `crash` | `crash` | Kenney Impact Sounds: impactWood_heavy_001.ogg + impactPlank_medium_002.ogg + splash_05.ogg | 1.19 s | 1.0 | yes | ships collide: wood crash + splash |
| Hazard | `splash` | `splash` | 40 CC0 water / splash / slime SFX: splash_03.ogg | 0.56 s | 0.9 |  | generic splash |
| Hazard | `ship_sink` | `ship_sink` | 40 CC0 water / splash / slime SFX: splash_08.ogg + creak3.ogg + loop_bubbles_1.ogg + impactWood_heavy_003.ogg | 2.60 s | 1.0 | yes | ship sinking: splash + groaning timber + bubbles |
| Hazard | `leviathan_spawn` | `leviathan_spawn` | 40 CC0 water / splash / slime SFX: splash_12.ogg + monster_03.ogg | 0.57 s | 1.0 | yes | sea dragon surfaces: big splash + growl |
| Hazard | `leviathan_roar` | `leviathan_roar` | 80 CC0 creature SFX: roar_02.ogg + monster_01.ogg | 1.11 s | 1.0 | yes | sea dragon roar (deep, slowed) |
| Hazard | `tile_destroyed` | `tile_destroyed` | Kenney Impact Sounds: impactWood_heavy_002.ogg + sfx100v2_stones_02.ogg + splash_05.ogg + impactPlank_medium_001.ogg | 1.26 s | 1.0 | yes | tile smashed / swallowed: splintering wood + splash |
| Hazard | `cannon` | `cannon` | Ocean splash (cannon): cannon_miss_0.ogg | 1.53 s | 1.0 | yes | cannon boom (with a splash tail) |
| Dice | `dice_roll` | `dice_roll` | Kenney Casino Audio: dice-throw-3.ogg + dice-shake-2.ogg | 1.22 s | 1.2 |  | dice roll |
| Events | `rift_gate` | `rift_gate` | Kenney Sci-fi Sounds: forceField_002.ogg + glass_004.ogg + jingles_PIZZI09.ogg | 0.86 s | 0.9 |  | Rift Gate shimmer (magic portal) |
| Events | `rogue_wave` | `rogue_wave` | 100 CC0 SFX #2: sfx100v2_air_02.ogg + splash_14.ogg + splash_05.ogg | 1.91 s | 1.0 | yes | Rogue Wave surge: swelling rush then crash |
| Events | `maelstrom` | `maelstrom` | 40 CC0 water / splash / slime SFX: loop_water_01.ogg + loop_bubbles_02.ogg + sfx100v2_air_03.ogg | 2.40 s | 0.9 |  | Maelstrom swirl: churning water + bubbles |
| Fanfares | `win` | `win` | Kenney Music Jingles: jingles_STEEL03.ogg + jingles_STEEL10.ogg + jingles_PIZZI16.ogg | 1.41 s | 1.0 | yes | win fanfare |
| Fanfares | `lose` | `lose` | Kenney Music Jingles: jingles_STEEL01.ogg + creak3.ogg | 1.38 s | 1.0 | yes | lose sting |
| UI | `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | 0.6 |  | button click |
| UI | `hover` | `hover` | Kenney UI Audio: rollover2.ogg | 0.05 s | 0.3 |  | hover tick (quiet; cooldown 80) |
| UI | `open` | `open` | Kenney Interface Sounds: maximize_006.ogg | 0.38 s | 0.6 |  | popup open |
| UI | `close` | `close` | Kenney Interface Sounds: minimize_006.ogg | 0.37 s | 0.6 |  | popup close |
| UI | `confirm` | `confirm` | Kenney Interface Sounds: confirmation_001.ogg | 0.29 s | 0.7 |  | confirm / end turn |
| UI | `error` | `error` | Kenney Interface Sounds: error_006.ogg | 0.26 s | 0.7 |  | illegal move |
| UI | `turn` | `turn` | Kenney Music Jingles: jingles_PIZZI16.ogg | 0.46 s | 0.8 |  | your turn chime |

## Music

| name | track | length | loop | use |
|---|---|---|---|---|
| `calm` | "Seaside Village" (CC0) | 27.0 s | cut 0.85s-27.83s, 1.0 s equal-power cross-fade (similarity 0.923); mono 56 kbps, 184 KB | calm sailing loop (Seaside Village) |
| `tension` | "Eye of the Storm" (CC0) | 23.0 s | cut 0.50s-23.54s, 1.0 s equal-power cross-fade (similarity 0.971); mono 56 kbps, 157 KB | tension loop: leviathans close / last ships (Eye of the Storm) |

## Wiring

- Build order: `gameaudio.js`, this `audio-data.js`, then the game. Once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'tw', duck:["crash", "ship_sink", "leviathan_spawn", "leviathan_roar", "tile_destroyed", "cannon", "rogue_wave", "win", "lose"]})`.
- Events by game moment: place tile `tile_place`, rotate `tile_rotate`, ship moves `ship_glide` (long paths add `wake_swish`; first move `ship_creak`), ships collide `crash` then `ship_sink` ~300 ms later (`{at:.3}`), tile lost `tile_destroyed`, dragon appears `leviathan_spawn` then `leviathan_roar` (~400 ms), dragon attacks `cannon`/`splash`, draw/roll `dice_roll`, Rift Gate `rift_gate`, Rogue Wave `rogue_wave`, Maelstrom `maelstrom`, game over `win` or `lose`.
- Ambience: `GA.loop('sea_loop',{vol:.5})` while a game is on screen; `GA.stopLoop('sea_loop',{fade:1})` on exit.
- Music: `GA.music('calm')` after the first gesture. `GA.music('tension',{fade:1.5})` when a leviathan is within 2 tiles of any ship or 2 or fewer ships remain; back with `GA.music('calm',{fade:2})`. `GA.music(null,{fade:.4})` at game over, then `win`/`lose`.
- Ducked samples drop the music bus to 35 % for their length; pass the `duck` list above. Suggested defaults: `sfxVol 0.8`, `musVol 0.45`. `hover`: `{cooldown:80}`. Use `{jitter:0}` for `win`, `lose`, `turn`.
- Toggles: `GA.setSfx(on)` / `GA.setMusic(on)`; until decoding finishes `GA.has()` is false and the synth plays.
