# Lantern Dive: sound map

Load order: `gameaudio.js`, this `audio-data.js`, then the game. `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'ld'})`; every call is guarded with `window.GA && GA.has(name)` in `snd()` (ui6.js).

| sample | length | used for |
|---|---|---|
| `click` | 0.08 s | buttons |
| `play` | 0.31 s | a card lands on the table |
| `slide` | 0.60 s | a card or job card moves |
| `pass` | 0.64 s | device passed / cards given |
| `take` | 0.72 s | job taken |
| `ping` | 0.15 s | a ping is shown |
| `trick` | 0.23 s | trick swept to the winner |
| `done` | 0.32 s | job tick |
| `fail` | 0.69 s | job cross |
| `deal` | 1.20 s | new deal |
| `tick` | 0.02 s | counting |
| `win` | 1.55 s | result card, success |
| `lose` | 1.09 s | result card, failure |
| `error` | 0.10 s | refused move |

## Music / ambience

| name | length | track |
|---|---|---|
| `main` | 40.0 s | music bed: calm underwater theme, loop: "Underwater Theme" by Spring Spring |
| `sea` | 14.7 s | soft water pad, low-passed, loop under the music: "Underwater Ambient Pad" by isaiah658 |

```js
GA.music('main',{vol:.3});            // after the first user gesture; seamless loop
GA.loop('sea',{vol:.14,fade:1.5});     // 'sea' ships in GA_DATA.sfx so GA.loop works; GA.stopLoop('sea') at game end
```

Not auditioned by ear (no speakers here): levels are in `SND_MAP` / `sndMusic()` in `ui6.js`.
