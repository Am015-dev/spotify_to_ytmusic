# Nebula Aces: sound map

Event names come from `xw/sound.js` (the `case` labels in `sfx()`). Every event has a sample with the same name, so the integration can be a one-line guard at the top of `sfx(name)`:

```js
if (window.GA && GA.has(name)) { GA.play(name); return; }  // else fall through to the synth
```

| event | sample | source | length | notes |
|---|---|---|---|---|
| `laser` | `laser` | Kenney Sci-fi Sounds: laserSmall_000.ogg | 0.24 s |  |
| `ion` | `ion` | Kenney Digital Audio: phaserUp1.ogg | 0.46 s |  |
| `torp` | `torp` | Kenney Sci-fi Sounds: laserLarge_000.ogg | 0.68 s |  |
| `engine` | `engine` | Kenney Sci-fi Sounds: thrusterFire_000.ogg | 1.00 s |  |
| `roll` | `roll` | 100 CC0 SFX #2: sfx100v2_air_01.ogg | 1.10 s |  |
| `shield` | `shield` | Kenney Sci-fi Sounds: forceField_000.ogg | 0.77 s |  |
| `hull` | `hull` | Kenney Sci-fi Sounds: impactMetal_000.ogg | 0.42 s |  |
| `crit` | `crit` | Kenney Sci-fi Sounds: explosionCrunch_000.ogg | 0.78 s |  |
| `boom` | `boom` | Kenney Sci-fi Sounds: lowFrequency_explosion_000.ogg + explosionCrunch_002.ogg | 1.71 s |  |
| `miss` | `miss` | 100 CC0 SFX #2: sfx100v2_air_03.ogg | 0.28 s |  |
| `dice` | `dice` | Kenney Casino Audio: dice-throw-2.ogg | 0.36 s | dice roll on a tray |
| `token` | `token` | Kenney Casino Audio: chip-lay-1.ogg | 0.13 s |  |
| `lock` | `lock` | Kenney Digital Audio: threeTone2.ogg | 0.61 s |  |
| `stress` | `stress` | Kenney Interface Sounds: error_003.ogg | 0.39 s |  |
| `rock` | `rock` | Kenney Impact Sounds: impactMining_000.ogg | 0.65 s |  |
| `turn` | `turn` | Kenney Music Jingles: jingles_HIT03.ogg | 0.73 s | turn-start sting |
| `win` | `win` | Kenney Music Jingles: jingles_HIT15.ogg | 1.16 s | win fanfare |
| `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | UI click |

## Extra samples (not in sound.js yet)

| sample | source | length | suggested use |
|---|---|---|---|
| `hover` | Kenney UI Audio: rollover2.ogg | 0.05 s | hover tick |
| `confirm` | Kenney Interface Sounds: confirmation_001.ogg | 0.29 s | confirm |
| `error` | Kenney Interface Sounds: error_006.ogg | 0.26 s | cancel / error buzz |
| `open` | Kenney Interface Sounds: maximize_006.ogg | 0.38 s | popup open |
| `close` | Kenney Interface Sounds: minimize_006.ogg | 0.37 s | popup close |
| `levelup` | Kenney Music Jingles: jingles_HIT11.ogg | 0.95 s | level-up sting |
| `lose` | Kenney Music Jingles: jingles_HIT09.ogg | 0.73 s | lose sting |
| `bad` | Kenney Interface Sounds: error_006.ogg | 0.26 s | bad move / error |
| `engine_loop` | Kenney Sci-fi Sounds: spaceEngineLow_000.ogg | 4.50 s | engine hum loop - start with `GA.loop('engine_loop',{vol:.5})`, stop with `GA.stopLoop('engine_loop')` |

## Music

| name | track | length | loop | encoding |
|---|---|---|---|---|
| `main` | "Hostile Fleet Interception" by vitalezzz (CC0 1.0) | 96.0 s | cut 30.85s-126.83s, 1.5 s equal-power cross-fade (similarity 0.929) | stereo 96 kbps, 1125 KB |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'na'})`.
- Music: call `GA.music('main')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.
- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `na_snd` / `na_mus` values.
- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
- `engine` is a 1 s one-shot for the maneuver; `engine_loop` is an optional quiet bed during movement animations.
