# Nebula Aces: PerfHUD and real audio

Build: `python3 build.py` writes `xw/nebula.html`, 2,837,443 bytes, md5 `434677f509fdf4a1d140ee5b61c54c10`. `node --check x.js` passes.
The final build was made after the coordinator updated `perf/perfhud.js` (16:57). That update adds step-down for frames over 500 ms and stops the speed test reporting p95 0 for a level with no finished frames. Every test below ran on this build.
Size before: 1,035,927 bytes. After: 2,837,443 bytes (+1.80 MB, about the size of `audio/nebula/audio-data.js` plus `perfhud.js` and `gameaudio.js`). This is under the 5 MB limit.
Backups of the sources from before this pass are in `xw/bak/pre-audioperf/`. The files touched are `build.py`, `body.html`, `polish.css`, `sound.js`, `three3d.js` and `ui.js`. `flow.js` (the guided round flow) was not touched.

## What changed

### PerfHUD
- **Build:** `perfhud.js`, `gameaudio.js` and `audio-data.js` are inlined before `three.min.js`. They are read from `../perf/perfhud.js`, `../audio/gameaudio.js` and `../audio/nebula/audio-data.js`.
- **Register:** `perfHooks()` in `three3d.js` runs at the end of `init3D`, before the first frame. It uses the INTEGRATE.md mapping:
  - `getLevel` is `V3.q`;
  - `isAuto` is `!V3.pinned&&gfxPref()==='auto'`;
  - `setLevel` saves `na_gfx` and sets `V3.pinned` only for `'apply'`, then calls `setQuality`;
  - `autoTop` is `gfxAuto()`;
  - `basePR` follows `setQuality`'s ratios;
  - the anchor is `#stage`, top left;
  - `beforeTest` closes the ⚙ menu.
- **orbit(t):** swings `V3.cam.yaw` by ±0.6 rad and restores it on `null`. The loop's own camera easing does the rest.
- **Removed:**
  - the `V3.perf` fps watchdog at the top of `loop3D`, including its `raw<1` skip;
  - `stepDown()`;
  - `V3.perf=` in `setQuality`, which now calls `PH.hitch()` instead.
- **Loop:** `(PH?PH.raf:requestAnimationFrame)(loop3D)`, both in `init3D` and inside `loop3D`. `loop3D(now)` still gets the rAF timestamp.
- **isAnimating** returns `V3.busy`. The loop sets it after drawing, and it is true for any of these:
  - a ship flying a maneuver or exploding (`V3.anim`);
  - any bolt, spark, flash, fire, puff, ring or debris (`V3.fxq`);
  - delayed hits (`V3.later`);
  - a camera glide (`V3.ez`) or a drag;
  - screen shake or the explosion light;
  - a shield ripple, a landing dip or a selection-glow ease;
  - the speed test.
  
  The ship bob, engine flicker, lamps, rocks, pebbles, gas and stars are ambient and do not count.
- **Pixel ratio:** `setQuality` sets it through `PH.pixelRatio(want)`.
- **Other hooks:**
  - `renderFrame()` resets `r.info`;
  - `sync3D()` calls `PH.wake()`.
- **Menu:** **Show speed** and **Test speed** (class `btn`) sit right after the Graphics button in `#more`.
  - On desktop, that is the top bar.
  - On phones, it is the ⚙ menu, the phone menu in this game.
  - PerfHUD keeps the labels in sync.
- **Hover lifts:** `translateY(-1px)` on `.btn:hover` and `.mv:hover` (`polish.css`) is removed, so no hit box moves under a still pointer. The glow and shadow feedback stays.

### Audio (`sound.js`, `three3d.js`, `ui.js`)
- **SND_MAP** at the top of `sound.js` is one line per event `{s:'sample', vol}`. Setting `s:null` falls back to the synth. `MUSIC_MAP.main` works the same way for the music.
- **Init:** `GA.init({sfx, music, key:'na', musVol:.45})` runs once, then GA is synced with `na_snd` / `na_mus`.
- **sfx(name):** when GA has the sample, it plays with the map's `vol` (click 30 ms, others 70 ms cooldown, as before), then returns. Otherwise the unchanged synth code runs. No synth sound was removed.
- **Music:**
  - `musicStart()` calls `GA.music('main')` ("Hostile Fleet Interception"). The synthesized pad groove stays as the fallback: it starts if the track has not decoded 5 s later, or if decoding failed.
  - `musicStop()` calls `GA.music(null)`.
  - Music starts only after a user gesture, because GA and the synth both unlock on the first pointer or key press.
- **Toggles:** the existing 🔊 and 🎵 buttons also call `GA.setSfx` / `GA.setMusic`, and still save `na_snd` / `na_mus`.
- **Ducking:** `boom`, `crit` and `win` duck the music (GA's default list).
- **engine_loop:** tied to ships moving. `loop3D` counts ships with a live path animation.
  - When the count goes from 0 to more than 0, `engineBed(true)` calls `GA.loop('engine_loop',{vol:.3,fade:.35})`. When it goes back to 0, it calls `GA.stopLoop` with a 0.7 s fade.
  - It changes only on a transition (`V3.engOn`), and GA keeps at most one copy per name, so copies never stack. In Playwright, at most 1 loop ran at once.
  - Sound off stops it, through GA's `setSfx`. Sound back on during a move restarts it.
  - The 1 s `engine` one-shot still plays at the start of each maneuver.
- **Credits:** the Rules popup ("How to play") ends with a Credits section. It says "Names, card text and art are original.", then gives the CC0 thanks from `audio/nebula/credits.html`. Every item is CC0; there is no CC-BY item in this game.
- **Licence log:** `xw/ASSETS.md` has the 28 rows for `nebula/…` copied from `audio/ASSETS.md`.

### Volumes (sample loudness measured in Chromium, RMS dBFS)

| event | RMS | vol | | event | RMS | vol |
|---|---|---|---|---|---|---|
| laser | -16.2 | 0.7 (frequent) | | miss | -19.0 | 0.8 |
| ion | -17.3 | 0.75 | | dice | -27.0 | 1.5 (short tap, +3.5 dB) |
| torp | -15.8 | 0.85 | | token | -23.6 | 1.4 (short tap, +3 dB) |
| engine | -16.7 | 0.7 | | lock | -18.1 | 0.6 |
| roll | -19.4 | 0.75 | | stress | -18.5 | 0.6 |
| shield | -15.7 | 0.7 | | rock | -16.4 | 0.85 |
| hull | -17.9 | 0.85 | | turn | -15.9 | 0.6 |
| crit | -13.5 | 0.9 | | win | -16.5 | 0.9 |
| boom | -15.5 | 1.0 | | click | -27.0 | 0.5 (UI, quiet) |
| engine_loop | -21.1 | 0.3 (quiet bed) | | music | | 0.45 |

- **Muted or left on the synth:** none. Every `sound.js` event maps to a sample.
- `dice` and `turn` are mapped, but nothing in the game calls `sfx('dice')` or `sfx('turn')`, before or after this pass, so they never sound.
- No hover sounds were added.

## Tests

### Playwright: PerfHUD and audio (`audioperf/nbpw.js`; output in `audioperf/nb_1366.txt` and `audioperf/nb_390.txt`, screenshots `audioperf/nb_*.png`)
**Both sizes: 0 console errors.**

- **Overlay:** `?fps=1` shows it and `?fps=0` hides it. F9 toggles it off and on. **Show speed** in the bar or the ⚙ menu shows it, with the label changing to "Hide speed". It has `pointer-events:none` and sits top left of the battlefield.
- **Test speed:**
  - It closes the menu and finishes in about 10 s. The camera yaw is restored afterwards.
  - Both sizes recommended Low. At 1366x768 the results were High p95 1533 ms, Medium 1733 ms and Low 400 ms.
  - Copy report selects the one-line JSON (the headless fallback).
  - **Apply** saves `na_gfx=low`, sets `V3.pinned`, and `PerfHUD.stats().auto` becomes false. The Graphics button then shows "Low".
- **Auto on SwiftShader:** it starts on Low (the existing software-GPU rule in `gfxAuto`). PerfHUD then lowers the resolution in steps to x0.6 (HUD: "Low · auto · res ×0.6").
- **Idle saver:**
  - 390x844: 20 frames/s awake, then `idling` true at 10 frames/s after 4.5 s with no input.
  - 1366x768: 8 frames/s awake, 7 idle.
  - A mouse move wakes it at both sizes.
- **Audio:**
  - 28 of 28 samples decoded after the first real click, 0 failed, the context is `running`, `main` music is playing, and the synth music timer is off.
  - Rounds were played through the UI: 6 at 1366x768 and 3 at 390x844. Every `sfx` call in this list played its sample, except the very first click, which came before decoding finished and used the synth.
  - 1366x768 fired these events:
    - `click` 33
    - `token` 12
    - `engine` 15
    - `laser` 9
    - `miss` 7
    - `stress` 3
    - `rock` 1
    - `shield` 1
    - `roll` 1
    - `hull` 1
    - `crit` 1
  - `GA.play` was called 83 times and returned false 5 times, from the 70 ms per-sample cooldown on bunched hits. At 390x844 it was 35 calls, 3 of them false.
  - `engine_loop` ran only while ships moved, never more than 1 at once.
  - Each mapped event fired once by hand (ion, torp, crit, boom, dice, lock, turn and win included) played its sample.
  - Music off and on sets `GA.music` and `na_mus`; sound off and on sets `GA.sfx` and `na_snd`.
- **Credits** show in the Rules popup.

### jsdom GA check (`audioperf/jsdom-ga.js`)
- GA has no audio context, `GA.has` is false for everything, `GA.unlock` is false, and every `sfx`, loop, toggle and music call is silent.
- PerfHUD is inert.
- **0 errors.**

### Existing test list (outputs in `audioperf/tests/`)
| Test | Result |
|---|---|
| `node unit.js` | **27 ok, 0 failed** |
| `node geotest.js` | runs clean |
| Gauntlet, Core (`gxw2.js nebula.html 20`, TLIM 300 s) | 20/20 finished (14–6), **errors 0** |
| Gauntlet, Standard, all waves (20 games, TLIM 300 s) | 20/20 finished (10–10), **errors 0** |
| Coverage, computer play (`cover.js pilots 2`, TLIM 150 s) | 35 pilots; 34 finished 2/2, and "Brannoc Dale" finished 1/2 with **1 error** (see below) |
| Coverage, computer play (`cover.js ups 2`) | 57/57 upgrades 2/2, **0 with errors** |
| Coverage, human path (`coverh.js`, 3 shards each) | pilots 12+12+11 and upgrades 19+19+19, all 2/2, **0 errors** in all 6 shards |
| Clicker (`uixw.js`), solo with `na_tour` | **TOTAL errors 0** |
| Clicker, hot-seat | **TOTAL errors 0** |
| Clicker, guided (no tour key) | **TOTAL errors 0**; it clicked "Continue to Round N" up to round 15, so the flow.js guided round flow works |
| Layout (`pwshell.js`), 1366x768 / 1920x1080 / 768x1024 / 390x844 | each **fails 0, console errors 0**, reached round 4, **ALL OK** |
| `pwplay.js`, desktop / phone | full games to a win (rounds 36 and 23), **0 errors** |
| jsdom GA check | **0 errors** |

**The one error:**
- `cover.js pilots`: one game of the "Brannoc Dale" pair threw `RangeError: Maximum call stack size exceeded` inside jsdom's HTML parser, during a timer task (an `innerHTML` parse of a `<button>`). Only the last 10 stack frames were kept, all of them jsdom's, so the game code on the stack is unknown.
- It did not come back in 323 more games of the same test on the same build:
  - `ONLY=brannoc`, 8 games;
  - every pilot × 3, 105 games;
  - every pilot × 6, 210 games, run with `--stack-trace-limit=400` so a repeat would show the full stack.
  - All of them finished with 0 errors.
- The earlier full runs (70 games each, on the build before the `perfhud.js` update) and the old pre-audio build (8 Brannoc games) never showed it either.
- In jsdom, the code this pass added is inert: GA has no context, `GA.has` returns false and PerfHUD never starts. None of it recurses.
- So I believe it is a rare flake that was already there, not caused by this change, but I could not prove where it comes from.
- Logs: `audioperf/tests/cov_p.txt`; repro runs `audioperf/brannoc_new.txt`, `brannoc_old.txt`, `repro_*.txt` and `repro2_*.txt`.

### Notes
- **Load:** for most of the session this 4-core machine had a load average of 20+, from other agents' test runs. The coverage and gauntlet scripts stop a game on a wall-clock budget (25–60 s), so the first pass left games unfinished that had never had a chance to end.
  - A/B check: one seeded gauntlet game took the same CPU time on the old and the new build (2.26 s against 2.42 s user).
  - The time-limited tests were therefore run with longer budgets (`TLIM`). All the results above are from that final run, on the final build, at load about 5–7.
- **PerfHUD speed test:** the first runs showed the shared `perfhud.js` "recommending" High with `fps:0`, because a level with no finished frames got p95 0. The coordinator's update fixes this, and it is in this build: both sizes now recommend Low.
