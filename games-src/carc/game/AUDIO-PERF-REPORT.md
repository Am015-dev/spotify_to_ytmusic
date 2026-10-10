# Rampart & Vine: PerfHUD and real audio

Build: `python3 src/build.py` writes `carc/game/rampart.html`, 2,313,056 bytes, md5 `aa7d55039f1155f24954169faaa21082`. `node --check src/x.js` passes.
The final build was made after the coordinator updated `perf/perfhud.js` (16:57). That update adds step-down for frames over 500 ms and stops the speed test reporting p95 0 for a level with no finished frames. Every test below ran on this build.
Size before: 866,134 bytes. After: 2,313,056 bytes (+1.45 MB, about the size of `audio/rampart/audio-data.js` plus `perfhud.js` and `gameaudio.js`). This is under the 5 MB limit.
Backups of every source file from before this pass are in `carc/game/bak-audioperf/`.

## What changed

### PerfHUD (`src/three3d.js`, `src/ui.js`, `src/body.html`, `src/build.py`)
- **Build:** `perfhud.js`, `gameaudio.js` and `audio-data.js` are inlined right after `shell.js`. They are read from `../../../perf/perfhud.js`, `../../../audio/gameaudio.js` and `../../../audio/rampart/audio-data.js`.
- **Register:** `perfHooks()` runs at the end of `init3D`, before the first frame. It uses the mapping from INTEGRATE.md:
  - levels `high/med/low`, with `med` named Medium;
  - `setLevel` calls `setGfx` (saved) only for `'apply'`, and `applyQ` otherwise;
  - `isAuto` is `V3.pref==='auto'`;
  - `basePR` is `min(GFX[q].pr, dpr)`;
  - the anchor is `.gx-board`, top left;
  - `beforeTest` closes any open drawer.
- **orbit(t):** the test moves `V3.look` in a small circle and tilts the camera slightly, then restores both when it gets `null`. It also cancels any camera glide in progress.
- **Removed:**
  - the old frame watch at the top of `loop3D` (`justDrew`, `prevTick`, `ivE`, `slowT`, `okT`);
  - `stepDown()`;
  - `V3.lockQ` and `V3.prMul`;
  - the "very slow GPU" frame gap (`slowG`).
  - `setGfx` no longer clears a lock, so a level picked by hand is never changed automatically.
- **Loop:** `(PH?PH.raf:requestAnimationFrame)(loop3D)`, both in `init3D` and inside `loop3D`. While `PerfHUD.testing` is true, every frame is drawn: the frame is treated as active and the gap is skipped.
- **isAnimating** returns `V3.busy`. It is true during camera glides, tile and figure tweens, score pop-ups, particle effects, a drag, or the speed test. Ambient life (water, tree sway, marker pulse) does not count.
- **Pixel ratio:** `applyQ` sets it through `PH.pixelRatio(want)`.
- **Other hooks:**
  - `draw()` resets `r.info` for correct draw and triangle counts;
  - `sync3D()` calls `PH.wake()`;
  - `setGfx()` and `resetScene()` call `PH.hitch()`.
- **Software GPU:** `gfxAuto()` now returns Low when the WebGL renderer is SwiftShader or llvmpipe (`V3.soft`, the same rule as Nebula Aces and Crown City).
  - Why: High takes about 5 s per frame at 1366x768 in SwiftShader. The first `perfhud.js` could not step down from there, because it needs 4 frames in its 2 s window. The updated one can, but starting on Low still saves the first several seconds of 5 s frames.
  - It still lowers the pixel ratio from Low (seen: Low, res x0.6).
- **Menu:** the Settings drawer (`#setd`, `renderSettings()`) now has **Show speed** and **Test speed** under the Graphics options, with a one-line explanation.
  - On phones, the same Settings drawer holds them; this game has no separate menu.
  - PerfHUD keeps the button labels in sync.
- **Hover lifts:** `translateY(-1px)` on hover is removed from these four rules in `head.html`, so no hit box moves under a still pointer. The colour and shadow feedback stays.
  - `.gx-bar .gx-ibtn:hover`
  - `.btn:hover`
  - `.hc:hover`
  - `.seg button:hover`

### Audio (`src/sound.js`, `src/ui.js`)
- **SND_MAP** at the top of `sound.js` is one line per event `{s:'sample', vol}`. Setting `s:null` falls back to the synth. `MUSIC_MAP.main` works the same way for the music.
- **Init:** `GA.init({sfx, music, key:'rv', musVol:.45})` runs once, then GA is synced with the game's own `rv_snd` / `rv_mus` settings.
- **sfx(name):** when GA has the sample, it plays with the map's `vol` and an 80 ms cooldown, then returns. Otherwise the unchanged synth code runs. No synth sound was removed.
- **Music:**
  - `musicStart()` calls `GA.music('main')`. The synthesized lute and drone is kept as the fallback: it starts if the track has not decoded after 5 s, or if decoding failed.
  - `musicStop()` calls `GA.music(null)`.
  - Music starts only after a user gesture, because both GA and the synth unlock on the first pointer or key press.
- **Toggles:** the existing 🔊 and 🎵 buttons also call `GA.setSfx` / `GA.setMusic`. They keep saving `rv_snd` / `rv_mus` as before.
- **Ducking:** `win` ducks the music (it is in GA's default list). No other Rampart event is big enough to need it.
- **Credits:** the Rules drawer ends with a Credits section. It says "Names, card text and art are original.", then gives the CC0 thanks from `audio/rampart/credits.html`. Every item is CC0; there is no CC-BY item in this game.
- **Licence log:** `carc/game/ASSETS.md` has the 18 rows for `rampart/…` copied from `audio/ASSETS.md`.

### Volumes (sample loudness measured in Chromium, RMS dBFS)

| event | sample RMS | vol | note |
|---|---|---|---|
| click | -27.0 | 0.5 | UI click, kept quiet |
| place | -18.9 | 1.4 | short tap, +3 dB |
| fig | -19.4 | 1.4 | short tap, +3 dB |
| home | -22.5 | 1.3 | short tap |
| goods | -20.7 | 0.9 | |
| score | -16.7 | 0.7 | jingle |
| turn | -16.6 | 0.35 | plays every turn, so kept low |
| story | -16.3 | 0.7 | |
| win | -16.3 | 0.9 | ducks the music |
| bad | -15.4 | 0.6 | |

- Music volume is 0.45.
- No hover sounds were added.
- **Muted or left on the synth:** none. Every event maps to a sample.
- `turn` is the one to watch: a 0.7 s pizzicato jingle on every turn. If it gets tiresome, set `turn:{s:null}` for the old tiny synth beep.

## Tests (final build, md5 above)

| Test | Result |
|---|---|
| `node geo_test.js` | tiles 85, drawing errors 0, adjacency warnings 0 |
| `node graph_test.js` | 77 passed, 0 failed |
| `node gauntlet.js 20 3 river,ic,tb` | 20 done, errs 0, stalls 0 |
| `node cover.js` | 48 games finished, 7545 moves, errors 0, invariant fails 0, probe mismatches 0, 84 of 84 tile types, MISSING TOTAL 0 |
| `node click.js` (jsdom) | **TOTAL errors 0** (every game, all popups including `pop:setd` and `pop:rulesd`) |
| `lay.js` (Playwright, 4 sizes) | **PROBLEMS 0**; 1366x768 / 1920x1080 / 768x1024 / 390x844 each 4 human turns, 4–6 real 3D taps, 0 missed, 0 errors |
| jsdom GA check (`xw/audioperf/jsdom-ga.js rampart.html`) | GA has no context, `GA.has` false everywhere, every `sfx`, loop, toggle and music call is silent, **0 errors** |
| `audioperf/rvpw.js` 1366x768 and 390x844 (Playwright, SwiftShader) | see below, **0 console errors** at both sizes |

Playwright details (`audioperf/rv_1366.txt`, `audioperf/rv_390.txt`, screenshots `audioperf/rv_*.png`):
- **Overlay:** `?fps=1` shows it, `?fps=0` hides it, and F9 toggles it off and on. It has `pointer-events:none` and sits top left over the board.
- **Show speed** in Settings works, and its label changes to "Hide speed".
- **Test speed:**
  - The drawer closes and the test finishes (9–10 s).
  - Copy report selects the JSON (the headless fallback).
  - Both sizes recommended Low. At 1366x768 the results were High p95 250 ms, Medium 1117 ms and Low 567 ms.
  - **Apply** saves `rv_gfx=low`, after which `PerfHUD.stats().auto` is false.
- **Auto:** on SwiftShader, Auto starts on Low (software GPU), and PerfHUD then lowers the resolution to x0.6.
- **Idle saver:**
  - 390x844: 60 frames/s awake, then `idling` true at 10 frames/s after 4.5 s with no input.
  - 1366x768: 10 frames/s awake, 9 idle.
  - Moving the mouse wakes it at both sizes.
- **Audio:**
  - 19 of 19 samples decoded after the first real click, 0 failed, the context is `running`, `main` music is playing, and the synth music timer is off.
  - Six human turns (13 game turns at 1366x768) fired these events: `turn` 13 (12 as samples, 1 synth before decoding finished), `click` 12, `place` 12 and `fig` 5, all as samples.
  - `GA.play` was called 41 times and returned false 0 times.
  - Each mapped event fired once by hand (`home`, `score`, `goods`, `story`, `win` and `bad` included) played its sample.
  - Music off and on sets `GA.music` and `rv_mus`; sound off and on sets `GA.sfx` and `rv_snd`.

### Notes
- For part of the session this machine was heavily loaded (load average 20–25 on 4 cores, from other agents' runs). The final run had load about 7. SwiftShader frame rates here only show that the mechanisms work.
- The PerfHUD speed-test issue from the first run is fixed by the coordinator's `perfhud.js` update, and it is in this build. Before the fix, a level with no finished frames got p95 0 and was "recommended": High with `fps:0`.
