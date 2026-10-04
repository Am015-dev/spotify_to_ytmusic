# Cauldron Fair: sound map

Load order: `gameaudio.js`, this `audio-data.js`, then the game. `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'cf'})`.

| sample | length | suggested use |
|---|---|---|
| `click` | 0.08 s | buttons |
| `draw` | 0.25 s | a chip leaves the bag |
| `plop` | 0.16 s | a chip lands in the pot |
| `splash` | 0.61 s | a bigger splash (orange chip, droplet moves) |
| `boom` | 1.36 s | the cauldron overflows |
| `flask` | 0.63 s | flask used (glass + bubble) |
| `ruby` | 0.94 s | a ruby is earned or spent |
| `coin` | 0.34 s | coins gained |
| `tick` | 0.02 s | score counting, rising `rate` |
| `die` | 0.65 s | bonus die rolled |
| `page` | 0.42 s | day report / rules page turns |
| `round` | 0.86 s | round ends |
| `win` | 1.74 s | game over, winner |
| `error` | 0.10 s | illegal move |
| `buy` | 0.76 s | an ingredient is bought |
| `bubble` | 0.27 s | a bubble pops (pot flavour) |
| `pass` | 0.67 s | hot-seat pass screen |
| `bubbling` | 3.49 s | pot simmering loop (quiet, under music) |

Music: `GA.music('main')`; `GA.loop('bubbling',{vol:.12,fade:1.5})`. The user has not auditioned these by ear: tune per-sound `vol` in the game's `SND_MAP`.
