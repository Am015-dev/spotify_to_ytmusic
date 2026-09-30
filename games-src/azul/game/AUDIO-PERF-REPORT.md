# Sunglaze: PerfHUD and real audio

Date: 2026-09-30. Build: `azul/game/src/build.py` → `azul/game/sunglaze.html`. Nothing was published or committed.

## What changed

### PerfHUD (`three3d.js`, `body.html`, `head.html`, `build.py`)
- The build inlines `perfhud.js` from `../../../perf/perfhud.js`, right after `shell.js`.
- `perfHooks()` registers the game at the end of `init3D` with the mapping from `perf/INTEGRATE.md`:
  - `getLevel: V3.q`, `isAuto: V3.qPref==='auto'`, `autoTop: gfxAuto()`;
  - `setLevel`: Apply calls `gfxSetPref` (saved); auto, test and restore call `applyQuality` (not saved);
  - `basePR` matches `applyQuality`; `onPixelRatio` sets the ratio and resizes;
  - `orbit` swings `V3.orbit` (±0.45 rad, within the drag limits) through `fitCam()`, then restores it;
  - `beforeTest` closes any open drawer;
  - `idleMode:'demand'`, anchor `.gx-board`, top-right corner (the round banner sits top-left).
- The loop: `loop3D` goes through `PH.raf`. `applyQuality` sets the pixel ratio through `PH.pixelRatio()`, and `drawFrame3D` resets `renderer.info` once per frame, so the counts include the bloom passes.
- Removed: the old watchdog, `frameWatch(dt)` and its call, plus `V3.fw` and `V3.autoDown`.
  - Kept: the game's draw-on-change gap. It is the game's own on-demand rendering, not a gap for slow GPUs.
- `isAnimating` is `V3.busy`. It holds the existing `busy` expression plus `PH.testing`:
  - dirty frames and dragging;
  - fx and score pops;
  - tiles flying, lifting or landing;
  - dying tiles;
  - the camera glide;
  - the sun token moving.
- In demand mode the loop stops while idle, so everything that changes the table also calls `PH.wake()`:
  - `sync3D` (every move, including the computer's);
  - `syncHighlights`;
  - `fitCam`;
  - `resize3D` (and so `applyQuality`);
  - `burst` (fx).
- **Menu:** Sunglaze has no Graphics popup and no ☰ menu. Its Graphics control is the cycling bar button. "Show speed" and "Test speed" (class `gx-ibtn`) sit right after it in the same top bar. On phones the bar scrolls sideways as before.
- **Hover-lift fix:** six `:hover` rules moved their element up by 1–2 px. I removed the transform; the background and shadow change stays.
  - `.gx-bar .gx-ibtn`
  - `.gx-dock .gx-ibtn` / `.gx-drawer .gx-ibtn`
  - `.btn`
  - `.pk`
  - `.seg button`
  - `.thumb`

  `:active` presses still move, which is harmless. An edge sweep (`dbg/hoversweep.js`) parked the pointer 1 px inside each edge of the 12 bar buttons (48 points): 0 hover flickers.

### Shared `perf/perfhud.js`
I made two fixes for very slow frames while doing Sands of Qamar; see `ft/AUDIO-PERF-REPORT.md`.
1. The controller now also acts when fewer than 4 frames, each over 200 ms, fit in its window.
2. A test level where no frame finishes counts as one frame the length of the window, instead of p95 0.

Sunglaze needed fix 1: on SwiftShader its p95 was 8 s at High and 3.8 s at Medium, and without the fix the controller never stepped down.

### Real audio (`sound.js`, `build.py`, `body.html`, `rules-html.js`)
- The build inlines `audio/gameaudio.js` and `audio/sunglaze/audio-data.js` before the game scripts.
- `SND_MAP={event:{s,vol,duck}}` sits at the top of `sound.js`. `sfx(name,arg)` checks it first: if `GA.has(s)`, it plays the sample with a 60 ms cooldown, as before. Otherwise it runs the old synth, unchanged. All 11 synth sounds are kept as the fallback. `s:null` sends an event back to the synth.
- `wall` keeps its rising feel: the playback rate is `1 + 0.06 × (points − 1)`, up to 8 points, as MAP.md suggests.
- `GA.init` shares the synth's AudioContext, which is created on the first gesture. It is then synced once from `sgz_snd` / `sgz_mus`.
- **Music:** `musicStart()` calls `GA.music('main')` (Kevin MacLeod's "Morning", 2 s fade-in). The synth guitar loop returns early while the recorded track plays or is decoding. It takes over only if Web Audio is missing or decoding fails. Music starts only after a gesture (from `audioInit()` or the music button).
- **Toggles:** the sound and music bar buttons also call `GA.setSfx` / `GA.setMusic`. They persist in `sgz_snd` / `sgz_mus` as before.
- **Ducking:** `win` ducks the music by itself; `round` passes `duck:true`.
- **Volumes:** set from the measured sample levels (loudest 100 ms), so events land near -16 dB and the UI click near -33 dB:

  | event | gain | note |
  |---|---|---|
  | `click` | 0.5 | UI |
  | `select` | 0.9 | |
  | `take` | 1 | |
  | `place` | 1 | |
  | `wall` | 0.75 | |
  | `floor` | 0.75 | |
  | `sun` | 0.6 | |
  | `round` | 0.6 | |
  | `refill` | 0.65 | |
  | `win` | 0.85 | |
  | `bad` | 0.55 | |
- There are no hover sounds, and no ambient loops in this game.
- **Credits:** a "Credits" section at the end of the Rules popup (`RULES_HTML`), with the text from `audio/sunglaze/credits.html`:
  - the full TASL attribution for Kevin MacLeod's "Morning" (CC BY 4.0): title, author with a link, source link, licence link and the changes made, plus his standard credit line;
  - the Kenney CC0 thanks;
  - "Names, card text and art are original; the rules follow the published game."
- **Licence log:** `azul/game/ASSETS.md` holds the 22 rows from `audio/ASSETS.md` whose "used as" names `sunglaze/`, including the CC BY row for "Morning".

## Test results (final build)
| Test | Result |
|---|---|
| `node --check x.js` | OK |
| `run_gauntlet.sh` | 18 configurations, 800 games, 800 done, errs 0, stalls 0 in every configuration |
| `cover.js 60` | 60 finished, 5195 moves, errors 0, invariant-fails 0, MISSING none; 19 scenario PASS, 0 FAIL |
| `click.js` (7 games, jsdom) | TOTAL errors 0. Every action type was exercised. GA stays silent in jsdom and never throws. |
| `audio/test/jsdom.test.js sunglaze` | all passed |
| `lay.js '{}'` | 1366x768 65%, 1920x1080 74%, 768x1024 52%, 390x844 51%; 0 errors; **PROBLEMS 0**. The test retried one missed 3D tap each at 768x1024 and 390x844 through the dock, as it did before this work. |
| `lay.js '{"np":3,"ex":{"gray":true,"prism":true}}'` at 1366x768 | 65%, 0 errors, **PROBLEMS 0** |

Playwright check (`azul/game/pa_test.js`), SwiftShader, 1366x768 and 390x844:
- `?fps=1` shows the overlay, and F9 hides and shows it. The bar holds "Show speed / Test speed" right after Graphics.
- **Auto step-down:**
  - At 1366x768: High → Medium (p95 8066 ms) → Low (p95 3817 ms), then pixel ratio 0.8 → 0.64 → 0.6.
  - At 390x844: the pixel ratio stepped 0.8 → 0.64 → 0.6.
- **Test speed:** 12 s at 1366x768 and 10 s at 390x844. Low was recommended at both sizes. Copy report falls back to a textarea with the text selected. Apply saves `sgz_gfx=low` and turns Auto off; the Graphics button then reads "Low".
- **Idle saver (demand):**
  - With no input and nothing moving, it drew 0 frames in 1 s (and 0 in 2 s in a separate run).
  - A pointer move wakes it.
  - A computer move wakes it within 154 ms, through `sync3D`.
- **Audio after the first click:** GA decoded 22/22 samples, 0 failed, and `main` was playing.
  - In 4–5 rounds these events fired: `take, place, sun, wall, floor, round, win`. All played samples.
  - The very first `round` of the game fell back to the synth once: it fires on the same click that starts the decode, before the samples are ready. That is the intended fallback.
  - Music off/on and sound off work and persist; with sound off, `sfx()` plays nothing.
- Console errors: 0.

## File size
- Before: 833,364 bytes.
- After: 2,824,506 bytes (+1.99 MB). The audio bundle is 1.95 MB (the 114 s music loop alone is 1.34 MB); PerfHUD and gameaudio.js add about 31 KB. That is under 5 MB.

## Sounds muted or left on the synth
- None. All 11 events have a sample.
- The first `round` of a new session can play the synth, because it fires before decoding finishes.
- The extra samples in the bundle (hover, confirm, error, open, close, turn, levelup, lose, clack, score) are not wired in, because `sound.js` has no events for them.

## Notes
- This sandbox had a load average of 25 to 28 on 4 cores while I tested, so the SwiftShader frame times are much slower than in `GRAPHICS-REPORT.md`.
