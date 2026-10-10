# Doorkick Dungeon: sound map

Event names come from `munch/sound.js` (the `case` labels in `sfx()`). Every event has a sample with the same name, so the integration can be a one-line guard at the top of `sfx(name)`:

```js
if (window.GA && GA.has(name)) { GA.play(name, {rate: SND.pitch || 1}); return; }  // else fall through to the synth
```

| event | sample | source | length | notes |
|---|---|---|---|---|
| `dice` | `dice` | Kenney Casino Audio: dice-throw-1.ogg | 0.55 s | dice roll on a tray |
| `clack` | `clack` | Kenney Casino Audio: die-throw-1.ogg | 0.38 s | single die clack |
| `smash` | `smash` | Kenney Impact Sounds: impactMetal_heavy_000.ogg + knifeSlice2.ogg | 0.48 s |  |
| `hurt` | `hurt` | Kenney Impact Sounds: impactPunch_heavy_002.ogg | 0.38 s |  |
| `roar` | `roar` | 80 CC0 creature SFX: monster_04.ogg | 1.06 s | monster growl |
| `door` | `door` | 100 CC0 SFX: slam_02.ogg + doorOpen_2.ogg | 1.53 s |  |
| `level` | `level` | Kenney Music Jingles: jingles_SAX10.ogg | 0.60 s | level-up sting |
| `bad` | `bad` | Kenney Music Jingles: jingles_SAX05.ogg | 0.40 s | bad move / error |
| `death` | `death` | Kenney Music Jingles: jingles_SAX01.ogg | 0.86 s |  |
| `curse` | `curse` | Kenney Digital Audio: phaserDown3.ogg + sfx100v2_air_02.ogg | 1.01 s |  |
| `whoosh` | `whoosh` | 100 CC0 SFX #2: sfx100v2_air_02.ogg | 1.03 s | whoosh |
| `turn` | `turn` | Kenney Music Jingles: jingles_SAX06.ogg | 0.51 s | turn-start sting |
| `win` | `win` | Kenney Music Jingles: jingles_SAX02.ogg | 0.84 s | win fanfare |
| `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | UI click |

## Extra samples (not in sound.js yet)

| sample | source | length | suggested use |
|---|---|---|---|
| `hover` | Kenney UI Audio: rollover2.ogg | 0.05 s | hover tick |
| `confirm` | Kenney Interface Sounds: confirmation_001.ogg | 0.29 s | confirm |
| `error` | Kenney Interface Sounds: error_006.ogg | 0.26 s | cancel / error buzz |
| `open` | Kenney Interface Sounds: maximize_006.ogg | 0.38 s | popup open |
| `close` | Kenney Interface Sounds: minimize_006.ogg | 0.37 s | popup close |
| `lose` | Kenney Music Jingles: jingles_SAX01.ogg | 0.86 s | lose sting |
| `sword` | Kenney RPG Audio: drawKnife2.ogg | 0.40 s | sword |
| `creak` | Kenney RPG Audio: creak1.ogg | 0.60 s | creak |
| `coins` | Kenney RPG Audio: handleCoins.ogg | 0.74 s | coin pouch / handful of coins |
| `deal` | Kenney Casino Audio: card-slide-2.ogg | 0.58 s | card deal |
| `flip` | Kenney Casino Audio: card-place-4.ogg | 0.60 s | card flip |
| `shuffle` | Kenney Casino Audio: card-shuffle.ogg | 1.40 s | card shuffle |

## Music

| name | track | length | loop | encoding |
|---|---|---|---|---|
| `main` | "Medieval: The Old Tower Inn" by RandomMind (CC0 1.0) | 74.9 s | cut 7.05s-81.93s, 1.5 s equal-power cross-fade (similarity 0.791) | stereo 96 kbps, 878 KB |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'dkd'})`.
- Music: call `GA.music('main')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.
- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `dkd_snd` / `dkd_mus` values.
- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
