# Hollowbough: sound map

Load order: `gameaudio.js`, this `audio-data.js`, then the game. `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'hb'})`; guard each sfx with `if (window.GA && GA.has(name)) { GA.play(name); return; }` and keep the synth as fallback.

| sample | length | use |
|---|---|---|
| `click` | 0.08 s | UI click |
| `place` | 0.31 s | card placed on the table |
| `flip` | 0.60 s | card flip / turn over |
| `twig` | 0.22 s | twig resource (two dry wood knocks) |
| `resin` | 0.13 s | resin resource (soft drip) |
| `pebble` | 0.73 s | pebble resource (two stone clicks) |
| `berry` | 0.15 s | berry resource (soft pluck) |
| `worker` | 0.26 s | worker placed (wooden knock) |
| `season` | 1.32 s | season change chime (plucked-string jingle) |
| `event` | 1.14 s | event achieved (plucked-string jingle) |
| `tally` | 0.02 s | score tally tick: play repeatedly with rising `rate` |
| `score` | 0.54 s | score total confirm |
| `turn` | 0.69 s | your turn |
| `fanfare` | 2.23 s | end fanfare (plucked strings + sax jingle layered) |
| `lose` | 0.99 s | low-score / lose sting |
| `error` | 0.10 s | illegal move |

## Music

| name | length | track |
|---|---|---|
| `spring` | 14.4 s | spring bed: Celtic folk loop: "Celtic Loop" by stereoscopic |
| `summer` | 12.2 s | summer bed: medieval village-square tune: "Medieval 5" by Tozan |
| `autumn` | 12.0 s | autumn bed: Northumberland folk melody: "Northumberland" by Spring Spring |
| `winter` | 13.7 s | winter bed: hushed ambient: "Long Winter" by Indieteur |

```js
const SEASON_BED={spring:'spring',summer:'summer',autumn:'autumn',winter:'winter'};
GA.music(SEASON_BED[G.season]);   // cross-fades on season change; GA.music(null) to stop
```

Ducking: pass `{duck:true}` for `win`, `fanfare`, `clash`, `bell`, `season`. Not yet auditioned by ear: tune per-sound `vol` in the game's `SND_MAP`.

There is no `win` sample: map `win` to `fanfare`. `tally` is a tick: replay it with rising `rate` while counting points.
