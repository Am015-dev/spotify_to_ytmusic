# Crown City Smash: sound map

Event names come from `kot/sound.js` (the `case` labels in `sfx()`). Every event has a sample with the same name, so the integration can be a one-line guard at the top of `sfx(name)`:

```js
if (window.GA && GA.has(name)) { GA.play(name, {rate: SND.pitch || 1}); return; }  // else fall through to the synth
```

| event | sample | source | length | notes |
|---|---|---|---|---|
| `dice` | `dice` | Kenney Casino Audio: dice-throw-1.ogg | 0.55 s | dice roll on a tray |
| `clack` | `clack` | Kenney Casino Audio: die-throw-4.ogg | 0.46 s | single die clack |
| `smash` | `smash` | Kenney Impact Sounds: impactPunch_heavy_000.ogg + sfx100v2_stones_01.ogg | 0.52 s |  |
| `hurt` | `hurt` | Kenney Impact Sounds: impactPunch_medium_000.ogg | 0.31 s |  |
| `roar` | `roar` | 16 Monster Growls: monster.6.ogg | 1.26 s | monster growl |
| `heal` | `heal` | Kenney Digital Audio: powerUp2.ogg | 0.22 s |  |
| `star` | `star` | Kenney Digital Audio: threeTone1.ogg | 0.53 s |  |
| `energy` | `energy` | Kenney Digital Audio: zap1.ogg | 0.91 s |  |
| `whoosh` | `whoosh` | 100 CC0 SFX #2: sfx100v2_air_02.ogg | 1.03 s | whoosh |
| `stomp` | `stomp` | Kenney Impact Sounds: impactSoft_heavy_000.ogg + lowFrequency_explosion_001.ogg | 0.89 s |  |
| `ko` | `ko` | Kenney Sci-fi Sounds: explosionCrunch_004.ogg | 1.98 s |  |
| `mindbug` | `mindbug` | Kenney Digital Audio: zapThreeToneDown.ogg | 1.24 s |  |
| `evolve` | `evolve` | Kenney Digital Audio: powerUp1.ogg | 0.99 s |  |
| `buy` | `buy` | Kenney RPG Audio: handleCoins2.ogg | 0.34 s |  |
| `turn` | `turn` | Kenney Music Jingles: jingles_NES05.ogg | 0.82 s | turn-start sting |
| `win` | `win` | Kenney Music Jingles: jingles_NES12.ogg | 0.82 s | win fanfare |
| `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | UI click |

## Extra samples (not in sound.js yet)

| sample | source | length | suggested use |
|---|---|---|---|
| `hover` | Kenney UI Audio: rollover2.ogg | 0.05 s | hover tick |
| `confirm` | Kenney Interface Sounds: confirmation_001.ogg | 0.29 s | confirm |
| `error` | Kenney Interface Sounds: error_006.ogg | 0.26 s | cancel / error buzz |
| `open` | Kenney Interface Sounds: maximize_006.ogg | 0.38 s | popup open |
| `close` | Kenney Interface Sounds: minimize_006.ogg | 0.37 s | popup close |
| `levelup` | Kenney Music Jingles: jingles_NES03.ogg | 0.58 s | level-up sting |
| `lose` | Kenney Music Jingles: jingles_NES11.ogg | 0.81 s | lose sting |
| `bad` | Kenney Interface Sounds: error_006.ogg | 0.26 s | bad move / error |
| `shake` | Kenney Casino Audio: dice-shake-2.ogg | 1.00 s | dice shaken in the hand |
| `crumble` | Kenney Sci-fi Sounds: explosionCrunch_002.ogg + sfx100v2_stones_02.ogg | 1.26 s | crumble |

## Music

| name | track | length | loop | encoding |
|---|---|---|---|---|
| `main` | "Funked Up" by Joth (CC0 1.0) | 66.3 s | author loop, unchanged | stereo 96 kbps, 777 KB |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'ccs'})`.
- Music: call `GA.music('main')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.
- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `ccs_snd` / `ccs_mus` values.
- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
