# Rampart & Vine: sound map

Event names come from `carc/game/src/sound.js` (the `case` labels in `sfx()`). Every event has a sample with the same name, so the integration can be a one-line guard at the top of `sfx(name)`:

```js
if (window.GA && GA.has(name)) { GA.play(name); return; }  // else fall through to the synth
```

| event | sample | source | length | notes |
|---|---|---|---|---|
| `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | UI click |
| `place` | `place` | Kenney RPG Audio: bookPlace1.ogg | 0.24 s | piece / tile placed |
| `fig` | `fig` | Kenney Impact Sounds: impactWood_light_002.ogg | 0.14 s |  |
| `score` | `score` | Kenney Music Jingles: jingles_PIZZI10.ogg | 0.80 s |  |
| `home` | `home` | Kenney Impact Sounds: impactWood_light_004.ogg | 0.17 s |  |
| `goods` | `goods` | Kenney RPG Audio: handleCoins2.ogg | 0.34 s |  |
| `turn` | `turn` | Kenney Music Jingles: jingles_PIZZI06.ogg | 0.69 s | turn-start sting |
| `story` | `story` | Kenney Music Jingles: jingles_PIZZI13.ogg | 0.87 s |  |
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
| `levelup` | Kenney Music Jingles: jingles_PIZZI12.ogg | 0.99 s | level-up sting |
| `lose` | Kenney Music Jingles: jingles_PIZZI01.ogg | 0.99 s | lose sting |
| `coins` | Kenney RPG Audio: handleCoins.ogg | 0.74 s | coin pouch / handful of coins |

## Music

| name | track | length | loop | encoding |
|---|---|---|---|---|
| `main` | "Medieval: Harvest Season" by RandomMind (CC0 1.0) | 81.5 s | cut 25.70s-107.19s, 1.5 s equal-power cross-fade (similarity 0.835) | stereo 96 kbps, 955 KB |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'rv'})`.
- Music: call `GA.music('main')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.
- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `rv_snd` / `rv_mus` values.
- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
