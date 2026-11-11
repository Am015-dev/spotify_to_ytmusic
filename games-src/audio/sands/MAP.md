# Sands of Qamar: sound map

Event names come from `ft/src/sound.js` (the `case` labels in `sfx()`). Every event has a sample with the same name, so the integration can be a one-line guard at the top of `sfx(name)`:

```js
if (window.GA && GA.has(name)) { GA.play(name); return; }  // else fall through to the synth
```

| event | sample | source | length | notes |
|---|---|---|---|---|
| `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | UI click |
| `pick` | `pick` | Kenney Casino Audio: card-slide-1.ogg | 0.27 s |  |
| `drop` | `drop` | Kenney Casino Audio: card-place-1.ogg | 0.52 s |  |
| `take` | `take` | Kenney Casino Audio: card-fan-1.ogg | 0.72 s |  |
| `camel` | `camel` | Kenney Impact Sounds: impactWood_heavy_000.ogg | 0.31 s |  |
| `coins` | `coins` | Kenney RPG Audio: handleCoins.ogg | 0.74 s | coin pouch / handful of coins |
| `kill` | `kill` | Kenney RPG Audio: knifeSlice.ogg | 0.40 s |  |
| `djinn` | `djinn` | Kenney Digital Audio: powerUp3.ogg | 0.90 s |  |
| `build` | `build` | Kenney Impact Sounds: impactPlank_medium_000.ogg | 0.40 s |  |
| `bid` | `bid` | Kenney Casino Audio: chips-stack-1.ogg | 0.15 s |  |
| `round` | `round` | Kenney Music Jingles: jingles_PIZZI08.ogg | 0.56 s |  |
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
| `meeple` | Kenney Impact Sounds: impactWood_light_000.ogg | 0.14 s | wooden meeple placed |
| `tile` | Kenney RPG Audio: bookPlace1.ogg | 0.24 s | thick board tile placed |
| `shuffle` | Kenney Casino Audio: card-shuffle.ogg | 1.40 s | card shuffle |
| `flip` | Kenney Casino Audio: card-slide-5.ogg | 0.60 s | card flip |

## Music

| name | track | length | loop | encoding |
|---|---|---|---|---|
| `main` | "Desert Loop" by iamoneabe (CC0 1.0) | 64.0 s | author loop, unchanged | stereo 96 kbps, 750 KB |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'soq'})`.
- Music: call `GA.music('main')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.
- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `soq_snd` / `soq_mus` values.
- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
