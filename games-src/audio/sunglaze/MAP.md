# Sunglaze: sound map

Event names come from `azul/game/src/sound.js` (the `case` labels in `sfx()`). Every event has a sample with the same name, so the integration can be a one-line guard at the top of `sfx(name)`:

```js
if (window.GA && GA.has(name)) { GA.play(name); return; }  // else fall through to the synth
```

| event | sample | source | length | notes |
|---|---|---|---|---|
| `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | UI click |
| `select` | `select` | Kenney Impact Sounds: impactPlate_light_000.ogg | 0.48 s |  |
| `take` | `take` | Kenney Casino Audio: chips-collide-1.ogg + impactPlate_light_001.ogg | 0.55 s |  |
| `place` | `place` | Kenney Impact Sounds: impactPlate_light_002.ogg | 0.46 s | piece / tile placed |
| `wall` | `wall` | Kenney Impact Sounds: impactPlate_medium_000.ogg + glass_001.ogg | 0.54 s | call with `{rate: 1 + 0.06*(n-1)}` to keep the rising-count feel |
| `floor` | `floor` | Kenney Impact Sounds: impactPlate_heavy_000.ogg | 0.46 s |  |
| `sun` | `sun` | Kenney Music Jingles: jingles_PIZZI16.ogg | 0.46 s |  |
| `round` | `round` | Kenney Music Jingles: jingles_PIZZI08.ogg | 0.56 s |  |
| `refill` | `refill` | Kenney Casino Audio: chips-handle-5.ogg | 0.83 s |  |
| `win` | `win` | Kenney Music Jingles: jingles_PIZZI02.ogg | 0.95 s | win fanfare |
| `bad` | `bad` | Kenney Interface Sounds: error_006.ogg | 0.26 s | bad move / error |

## Extra samples (not in sound.js yet)

| sample | source | length | suggested use |
|---|---|---|---|
| `hover` | Kenney UI Audio: rollover2.ogg | 0.05 s | hover tick |
| `confirm` | Kenney Interface Sounds: confirmation_001.ogg | 0.29 s | confirm |
| `error` | Kenney Interface Sounds: error_006.ogg | 0.26 s | cancel / error buzz |
| `open` | Kenney Interface Sounds: maximize_006.ogg | 0.38 s | popup open |
| `close` | Kenney Interface Sounds: minimize_006.ogg | 0.37 s | popup close |
| `turn` | Kenney Music Jingles: jingles_PIZZI06.ogg | 0.69 s | turn-start sting |
| `levelup` | Kenney Music Jingles: jingles_PIZZI10.ogg | 0.80 s | level-up sting |
| `lose` | Kenney Music Jingles: jingles_PIZZI01.ogg | 0.99 s | lose sting |
| `clack` | Kenney Impact Sounds: impactPlate_light_003.ogg | 0.48 s | single die clack |
| `score` | Kenney Music Jingles: jingles_PIZZI10.ogg | 0.80 s | score |

## Music

| name | track | length | loop | encoding |
|---|---|---|---|---|
| `main` | "Morning" by Kevin MacLeod (CC BY 4.0) | 113.9 s | cut 21.50s-135.43s, 1.5 s equal-power cross-fade (similarity 0.904) | stereo 96 kbps, 1335 KB |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'sgz'})`.
- Music: call `GA.music('main')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.
- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `sgz_snd` / `sgz_mus` values.
- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
