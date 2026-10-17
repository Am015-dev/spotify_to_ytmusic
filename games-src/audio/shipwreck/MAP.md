# Shipwreck Isle: sound map

Event names come from `rc/sound.js` (the `case` labels in `sfx()`). Every event has a sample with the same name, so the integration can be a one-line guard at the top of `sfx(name)`:

```js
if (window.GA && GA.has(name)) { GA.play(name); return; }  // else fall through to the synth
```

| event | sample | source | length | notes |
|---|---|---|---|---|
| `dice` | `dice` | Kenney Casino Audio: dice-throw-3.ogg | 0.57 s | dice roll on a tray |
| `wound` | `wound` | Kenney Impact Sounds: impactPunch_medium_001.ogg | 0.30 s |  |
| `heal` | `heal` | Kenney Music Jingles: jingles_STEEL04.ogg | 0.91 s |  |
| `build` | `build` | Kenney Impact Sounds: impactWood_heavy_001.ogg + impactPlank_medium_001.ogg | 0.60 s |  |
| `explore` | `explore` | Kenney Impact Sounds: footstep_grass_000.ogg + footstep_grass_002.ogg | 0.47 s |  |
| `fight` | `fight` | Kenney Impact Sounds: impactPunch_heavy_001.ogg + knifeSlice.ogg | 0.47 s |  |
| `event` | `event` | Kenney Casino Audio: card-slide-3.ogg | 0.60 s |  |
| `thunder` | `thunder` | 100 CC0 SFX #2: sfx100v2_thunder_01.ogg | 3.80 s | thunder clap |
| `night` | `night` | Kenney Music Jingles: jingles_STEEL14.ogg | 1.38 s |  |
| `round` | `round` | Kenney Music Jingles: jingles_STEEL08.ogg | 0.78 s |  |
| `good` | `good` | Kenney Music Jingles: jingles_STEEL10.ogg | 0.91 s |  |
| `bad` | `bad` | Kenney Music Jingles: jingles_STEEL05.ogg | 0.94 s | bad move / error |
| `mystery` | `mystery` | Kenney Music Jingles: jingles_STEEL13.ogg | 1.05 s |  |
| `win` | `win` | Kenney Music Jingles: jingles_STEEL03.ogg | 1.39 s | win fanfare |
| `lose` | `lose` | Kenney Music Jingles: jingles_STEEL01.ogg | 1.38 s | lose sting |
| `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | UI click |
| `place` | `place` | Kenney Impact Sounds: impactWood_light_001.ogg | 0.26 s | piece / tile placed |

## Extra samples (not in sound.js yet)

| sample | source | length | suggested use |
|---|---|---|---|
| `hover` | Kenney UI Audio: rollover2.ogg | 0.05 s | hover tick |
| `confirm` | Kenney Interface Sounds: confirmation_001.ogg | 0.29 s | confirm |
| `error` | Kenney Interface Sounds: error_006.ogg | 0.26 s | cancel / error buzz |
| `open` | Kenney Interface Sounds: maximize_006.ogg | 0.38 s | popup open |
| `close` | Kenney Interface Sounds: minimize_006.ogg | 0.37 s | popup close |
| `turn` | Kenney Music Jingles: jingles_STEEL06.ogg | 1.38 s | turn-start sting |
| `levelup` | Kenney Music Jingles: jingles_STEEL10.ogg | 0.91 s | level-up sting |
| `chop` | Kenney RPG Audio: chop.ogg | 0.24 s | wood chop |
| `splash` | 40 CC0 water / splash / slime SFX: splash_02.ogg | 0.61 s | water splash |
| `rain` | 30 CC0 SFX loops: rain.ogg | 3.69 s | rain loop - start with `GA.loop('rain',{vol:.5})`, stop with `GA.stopLoop('rain')` |
| `fire` | Fire Crackling: fire-1.ogg | 3.29 s | fire crackle loop - start with `GA.loop('fire',{vol:.5})`, stop with `GA.stopLoop('fire')` |
| `wind` | Mild Wind Background Noise: wind_background_noise_2.wav | 6.00 s | wind loop - start with `GA.loop('wind',{vol:.5})`, stop with `GA.stopLoop('wind')` |

## Music

| name | track | length | loop | encoding |
|---|---|---|---|---|
| `calm` | "Seaside Village" by KarateStudios (CC0 1.0) | 60.0 s | cut 3.75s-63.73s, 1.5 s equal-power cross-fade (similarity 0.760) | stereo 96 kbps, 703 KB |
| `storm` | "Storm Chasers" by Eldritch Grim (CC0 1.0) | 74.4 s | cut 4.10s-78.49s, 1.5 s equal-power cross-fade (similarity 0.933) | stereo 96 kbps, 872 KB |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'swi'})`.
- Music: call `GA.music('calm')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.
- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `swi_snd` / `swi_mus` values.
- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
- Moods: `GA.music('calm')` by day, `GA.music('storm')` for storm/night events; `GA.music()` cross-fades between them.
