# Sands of Qamar: PerfHUD and real audio

Date: 2026-09-30. Build: `ft/src/build.py` → `ft/sands.html`. Nothing was published or committed.

## What changed

### PerfHUD (`three3d.js`, `ui.js`, `body.html`, `build.py`)
- The build inlines `perfhud.js` from `../../perf/perfhud.js`, right after `shell.js`.
- `perfHooks()` registers the game at the end of `init3D` with the mapping from `perf/INTEGRATE.md`:
  - levels `high / medium / low`, `getLevel: GFX.q`, `isAuto: GFX.pref==='auto'`, `autoTop: gfxAuto()`;
  - `setLevel`: Apply calls `setGfx` (saved); auto, test and restore set `GFX.q` and call `applyQ()` (not saved);
  - `basePR` as in INTEGRATE; `onPixelRatio` sets the ratio and resizes;
  - `orbit` swings the camera ±0.9 rad and restores it;
  - `beforeTest` closes any open drawer;
  - anchor `.gx-board`, bottom-left corner, which is empty rug at desktop and phone sizes (the round chip sits top-left).
- The loop: `loop3D` and its first call go through `PH.raf`. `applyQ` sets the pixel ratio through `PH.pixelRatio()`. `draw` resets `renderer.info` once per frame, so the draw and triangle counts cover the post-processing passes too. `sync3D` calls `PH.wake()`.
- Removed: the old watchdog (`GFX.ema / bad / slowN`), "slow mode" (`GFX.slow`: 0.6 pixel ratio, snapped pieces, no particles), and its draw-only-on-change frame gap. All the `GFX.slow` branches are gone.
- `isAnimating` is `V3.busy`, which the loop sets every frame. It is true for:
  - dirty scene syncs;
  - dragging;
  - particles and drop/pop animations;
  - pawns arcing or squashing;
  - the hover lift easing in or out;
  - the camera easing to its orbit;
  - hover changes;
  - the speed test.

  Water, sway, flame, motes and highlight pulses are ambient, so they slow to the idle rate.
- A software renderer (SwiftShader, llvmpipe) now starts Auto on Low: `V3.soft` in `gfxAuto()`, the same rule Crown City already uses. On SwiftShader in this sandbox, High ran at 1.2 to 3 s per frame. The page could not take a click before the controller had enough frames to act.
- Menu:
  - **Settings drawer:** "Show speed / Test speed" sit right under the Graphics quality row (`PerfHUD.buttonsHTML('btn')`).
  - **☰ menu on phones:** the same two buttons follow "⚙ Settings and graphics".
- Hover-lift check: no `:hover` rule in Sands moves an element (no transform, top or margin). Nothing needed fixing.

### Shared `perf/perfhud.js`: two small fixes for very slow frames
(The old file is at `perf/backup/perfhud.before-slowframes.js`.)
1. **Controller.** It needed 4 frames in its 2 s window before it would act, so frames slower than 500 ms never stepped down. Now 1 to 3 frames count as slow when their average is over 200 ms.
2. **Test speed.** A level with no finished frame in its 1.7 s window reported p95 0, so it looked fastest and was recommended. That happened here: High was "recommended" on SwiftShader. Now the whole window counts as one frame.

Both fixes change behaviour only when frames are slower than 200 ms (the controller) or 1.7 s (the test). Other games pick them up on their next build.

### Real audio (`sound.js`, `build.py`, `body.html`, `rules-html.js`)
- The build inlines `audio/gameaudio.js` and `audio/sands/audio-data.js` before the game scripts, so they load ahead of `sound.js`.
- `SND_MAP={event:{s,vol,duck}}` sits at the top of `sound.js`. `sfx(name)` checks it first: if `GA.has(s)`, it plays the sample, with the same 80 ms cooldown (40 ms for `drop`). Otherwise it runs the old synth, unchanged. All 13 synth sounds are kept as the fallback. `s:null` sends an event back to the synth.
- `GA.init` shares the synth's AudioContext, which is created on the first gesture. It is then synced once from `soq_snd` / `soq_mus`.
- **Music:** `musicStart()` calls `GA.music('main')` ("Desert Loop", 2 s fade-in). The synth groove returns early while the recorded track plays or is decoding. It only takes over if Web Audio is missing or the track fails to decode. Music starts only from `audioInit()`, which runs on the first pointer or key gesture, or from the music button.
- **Toggles:** the 🔊 and 🎶 buttons (bar, ☰ menu, Settings) now also call `GA.setSfx` and `GA.setMusic`. They persist in `soq_snd` / `soq_mus` as before.
- **Ducking:** `win` ducks the music by itself. `djinn` and `round` pass `duck:true`.
- **Volumes:** I measured the decoded samples (loudest 100 ms), then set gains so that game events land near -16 dB and the UI click near -33 dB:

  | event | gain | why |
  |---|---|---|
  | `click` | 0.5 | UI, kept quiet |
  | `pick` | 0.9 | |
  | `drop` | 0.9 | plays for every pawn dropped, so not boosted |
  | `take` | 0.6 | |
  | `camel` | 0.8 | |
  | `coins` | 1.2 | soft rattle, +1.6 dB |
  | `kill` | 0.8 | |
  | `djinn` | 0.8 | |
  | `build` | 0.8 | |
  | `bid` | 1.4 | short chip tap, +2.9 dB |
  | `round` | 0.6 | |
  | `win` | 0.85 | |
  | `bad` | 0.55 | |
- There are no hover sounds, and no ambient loops in this game.
- **Credits:** a "Credits" section at the end of How to play (`RULES_HTML`). It has the text from `audio/sands/credits.html` (CC0 thanks: iamoneabe's "Desert Loop" and the Kenney packs, all CC0) and the line "Names, card text and art are original."
- **Licence log:** `ft/ASSETS.md` holds the 25 rows from `audio/ASSETS.md` whose "used as" names `sands/`.

## Test results (final build)
| Test | Result |
|---|---|
| `node --check x.js` | OK |
| `gauntlet.js 10 2` | 10/10 done, errs 0, stalls 0 |
| `gauntlet.js 8 3 artisans,sultan,thieves,promos` | 8/8, errs 0, stalls 0 |
| `gauntlet.js 6 5 sultan` | 6/6, errs 0, stalls 0 |
| `gauntlet.js 6 4 artisans,thieves` | 6/6, errs 0, stalls 0 |
| `cover.js 40` | 40/40 finished, errors 0, invariant-fails 0, MISSING none |
| `click.js` (7 games, jsdom) | TOTAL errors 0. Every popup was seen. GA stays silent in jsdom and never throws. (jsdom still prints its usual `getContext not implemented` notice; it is not counted as an error, and it did so before this work too.) |
| `perf.js` | 35 / 20 / 9 ms |
| `audio/test/jsdom.test.js sands` | all passed |
| `lay.js '{}'` | 1366x768 65%, 1920x1080 74%, 768x1024 49%, 390x844 47%, no errors, **PROBLEMS 0** |
| `lay.js` 4 players, all expansions | 65 / 74 / 49 / 47%, no errors, **PROBLEMS 0** |

Playwright check (`ft/pa_test.js`), SwiftShader, 1366x768 and 390x844:
- `?fps=1` shows the overlay, and F9 hides and shows it.
- **Auto step-down:** it starts on Low (software GPU), then PerfHUD caps the resolution step by step: pixel ratio 1 → 0.8 → 0.64 → 0.6, in about 14 s.
- **Test speed:**
  - At 1366x768 it took 38 s. Every level ran at about 1.7 s per frame on this overloaded machine, and the recommendation was Low.
  - At 390x844 it took 21 s: High p95 900 ms, Medium 1250 ms, Low 1050 ms. The recommendation was Low.
  - The card appears. Copy report falls back to a textarea with the text selected (567/567 characters). Apply saves `soq_gfx` and turns Auto off.
- **Idle saver:** it goes idle once the board settles and wakes on a pointer move.
  - About 1 to 3 frames were drawn per second while idle. The cap is 10 fps, but each SwiftShader frame here took 300 ms or more.
  - A focused 1366x768 run went idle once the computer's move animations ended, and woke on the mouse.
- **Audio after the first click:** GA decoded 26/26 samples, 0 failed, the context was running and `main` was playing.
  - In 3 rounds of play, these events fired, and every one played its sample (none fell back to the synth): `bid, pick, drop, take, djinn, camel, round, coins, kill, build`.
  - Music off stops GA and saves `soq_mus=0`; music on resumes `main`. Sound off silences GA (`sfx()` then plays nothing).
- Console errors: 0 in every run.

## File size
- Before: 876,850 bytes.
- After: 2,090,177 bytes (+1.21 MB). The audio bundle is 1.18 MB, PerfHUD about 19 KB and gameaudio.js about 12 KB. That is well under 5 MB.

## Sounds muted or left on the synth
- None. All 13 events have a sample.
- The extra samples in the bundle (hover, confirm, open, close, turn, levelup, lose, meeple, tile, shuffle, flip, error) are not wired in, because `sound.js` has no events for them. Their bytes are still in the file.

## Notes
- This sandbox had a load average of 25 to 28 on 4 cores while I tested (other games' tests were running too). The frame times above are much slower than the 4-core idle figures in `GRAPHICS-REPORT.md`.
- Removing slow mode means Low on SwiftShader now draws every frame (at up to 10 fps when idle) rather than only on change. The layout tests still pass, but they are slower in this sandbox (about 5 minutes per size).
