# Kaiten Kitchen: sound map

Load order: `gameaudio.js`, this `audio-data.js`, then the game. `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'kk'})`; guard each sfx with `if (window.GA && GA.has(name)) { GA.play(name); return; }`.

| sample | length | suggested use |
|---|---|---|
| `click` | 0.08 s | buttons |
| `clink` | 0.17 s | plate lands on your counter |
| `slide` | 0.46 s | a plate glides in / your pick leaves the hand |
| `pass` | 0.67 s | all hands pass left |
| `pick` | 0.88 s | you lock in a card (face-down) |
| `cloche` | 0.52 s | the simultaneous reveal (cloches lift) |
| `coin` | 0.34 s | a scoring line adds points |
| `tick` | 0.02 s | score counting, rising `rate` |
| `round` | 0.86 s | round ends, scores shown |
| `win` | 1.74 s | game over / winner |
| `error` | 0.10 s | illegal move |

## Music / ambience

| name | length | track |
|---|---|---|
| `main` | 42.3 s | diner music bed: relaxed instrumental jazz, loop: "Jazz Slower" by Pro Sensory |
| `belt` | 9.0 s | soft conveyor-belt hum ambience (low-passed fridge drone), loop under music: "The Shop collection: convenience store drinks fridge drone 2" by LEGIT Audio |

```js
GA.music('main');                 // after the first user gesture; seamless loop
GA.loop('belt',{vol:.35,fade:1.5});  // belt hum ('belt' ships in GA_DATA.sfx so GA.loop works); GA.stopLoop('belt') at game end
```

Ducking: pass `{duck:true}` for `win` and `round`. The user has not auditioned any of these by ear: tune per-sound `vol` in the game's `SND_MAP`.
