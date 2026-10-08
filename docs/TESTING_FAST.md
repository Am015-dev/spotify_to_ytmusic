# Fast testing on the software-GL boxes (Mainhattan Overdrive)

Harness side only: the game is not changed. Files: `tools/lowgfx.js` (helper), `tools/gfxprobe.js` (step timings).
Measured on live v88e, phone context 852×393, one run per cell (no repeats, so treat ±15 % as noise).

## Use which mode
| Job | Mode |
|---|---|
| layout, HUD overlap, tap/touch-control checks, load-to-drivable, anything that reads DOM or game state | `--gfx=min` |
| metric runs (tPlay) | `--gfx=min` should be fine, but **not measured** here (tPlay was not re-run with it) |
| final reviewer screenshots (the owner judges the look) | **normal** gfx |

In min mode the HUD and tap coordinates are identical (CSS size unchanged); the 3D scene is drawn into a ~0.35× buffer and looks soft. In the one min screenshot taken, the 3D scene was black, so never use min for a picture.

## How to use
```js
const G = require('./lowgfx');
const gfx = G.parse(process.argv, process.env);            // --gfx=min | GFX=min | default normal
const b = await chromium.launch({ args: G.launchArgs(gfx) });
const ctx = await b.newContext(G.contextOpts(gfx, { phone: true, width: 852, height: 393 }));
await ctx.addInitScript(G.initScript(gfx));                // before the first goto
// after localStorage.clear(), before the reload:  await G.seed(page, gfx)
```
`GFX=min node tools/gfxprobe.js http://127.0.0.1:<port>/local_dbg.html outdir` prints the table below for one run.
What min does: `deviceScaleFactor` 1 (normal phone runs use 3), `devicePixelRatio` overridden to 0.35 (the game's only use of it is its WebGL pixel ratio), and the game's own quality settings (`mho_set`: q low, res std, dres off) seeded.

## Before / after (seconds, one run each)
| Step | normal | min | note |
|---|---|---|---|
| build + split (`tools/build.sh --local`, od-src) | 1.1 | 1.1 | not a bottleneck |
| first load to menu | 7.9–8.7 | 8.4–9.1 | same |
| reload to menu | 18.6–21.4 | 11.9–14.0 | |
| STORY → drivable (Frankfurt, new game) | 57.8–61.1 | 35.9–44.8 | 1.5× |
| roam frame rate (real rAF) | 0.2–0.4 fps | 0.8–1.4 fps | 3× |
| 852×393 screenshot | 14.2–18.1 | 18.5–26.5 | no gain (it waits for a frame); use normal |
| pause → garage → open builder | 55.5–56.2 | 32.2–41.9 | |
| builder frame rate | 0.8–1.2 fps | 4.3–5.0 fps | 4× |
| 10 builder taps, real touch | 134–136 s (down→up 5–7 s) | 51–64 s (down→up 1.6–2.5 s) | **still broken, see below** |
| whole probe | 448–643 | 250–330 | about 2× |
| tPlay phone, Frankfurt, 1 game-minute (existing harness, normal gfx) | 314 | not run | stuck 12.1 % and no-rotation-DRIFT fail as before |

## Builder tap (7.5 s long-press): cause found, not fixed
`94_garage_ui.js`: a builder tap only counts if `performance.now()` between pointerdown and pointerup is < 900 ms. On these boxes touch events queue behind
slow frames, so down→up is 5–7 s (normal) or 1.6–2.5 s (min). The first tap after the builder opens is fast (63 ms); every later tap is slow, so the game's own work after a
tap (and the frames it triggers) delays the next events. Tried:
- plain CDP `touchStart`/`touchEnd`: 0/10 under 900 ms except the first tap, in both modes.
- parking `requestAnimationFrame` during the tap: no pointer events arrived at all.
- page-side synthetic `PointerEvent`s on `#gbC`: they reach `window` but never the canvas's own listeners (something upstream in the game stops untrusted events; not identified).
- `Input.synthesizeTapGesture`: no events reached the canvas (0 of 10 recorded).
- Untried: waiting for a quiet page before every tap (code is in `gfxprobe.js`, the run was stopped for budget), or the od-src `FAST=1` mode (`?fast=1` + synthetic touch clock, in `alex/od-src` docs/FAST-MODE.md), which makes the game's clock follow frames.
- A game-side fix would be: measure the tap duration with the frame clock instead of wall time. That needs the normal review and deploy route.

## Not done
- `tPlay.js --gfx=min` option (tPlay was not touched; the helper is ready to plug in with the snippet above).
- The `?fast=1` story-load hang was not reproduced; build/split time is not the problem.
- `src/` and `tools/build.sh` are on `alex/od-src` (v87e), not on `alex/brave-carson-rbpmlk`; v88e was tested from the live `index.html` with the same `window.__dbg` transform `P.py` uses.
