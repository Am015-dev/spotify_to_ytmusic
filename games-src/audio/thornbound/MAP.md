# The Thornbound Throne: sound map

Load order: `gameaudio.js`, this `audio-data.js`, then the game. `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'tbt'})`; guard each sfx with `if (window.GA && GA.has(name)) { GA.play(name); return; }` and keep the synth as fallback.

| sample | length | use |
|---|---|---|
| `click` | 0.01 s | UI click |
| `place` | 0.77 s | card placed face-down (shove + soft thud) |
| `flip` | 0.64 s | card reveal / flip |
| `clash` | 0.47 s | clash hit (heavy metal impact + punch) |
| `win` | 1.39 s | win sting (steel jingle) |
| `influence` | 0.74 s | influence gained (coins) |
| `herald` | 0.47 s | herald step (footstep + latch click) |
| `bid` | 0.34 s | bid (coin handful) |
| `bell` | 1.25 s | round bell (heavy bell) |
| `fanfare` | 1.55 s | end fanfare (steel + hit jingle layered) |
| `lose` | 1.38 s | lose sting (steel jingle) |
| `error` | 0.26 s | illegal move |

## Music

| name | length | track |
|---|---|---|
| `main` | 20.0 s | dark brooding acoustic guitar and strings (main bed): "Dark Forest Theme" by cynicmusic |
| `tense` | 14.0 s | dark dungeon ambient (use for clashes / late rounds): "Dungeon Ambience" by yd |

```js
GA.music('main');    // after the first user gesture
GA.music('tense');   // optional: cross-fade during the clash reveal or the last round
```

Ducking: pass `{duck:true}` for `win`, `fanfare`, `clash`, `bell`, `season`. Not yet auditioned by ear: tune per-sound `vol` in the game's `SND_MAP`.
