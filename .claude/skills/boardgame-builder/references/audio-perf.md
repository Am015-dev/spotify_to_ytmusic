# Brief: add PerfHUD and real audio to a game

SP = <workdir>

## Part 1: PerfHUD (skip for Shipwreck and Doorkick, which already have it)
- Follow `SP/perf/INTEGRATE.md` exactly for your game: register the renderer and quality hooks, replace the old watchdog with the PerfHUD controller, and route the loop through `PerfHUD.raf`.
- Put "Show speed" and "Test speed" next to the Graphics setting, in its popup or menu, and inside the ☰ menu on phones.
- Wire `isAnimating()` honestly (tweens, camera moves, particles, dice rolls), so the idle saver never freezes a visible animation.
- Add `perfhud.js` to the game's `build.py`, read from `SP/perf/perfhud.js` by a relative path like the other inlined files.
- Do the hover-lift check from INTEGRATE.md. Find any element that moves on `:hover` enough to leave the pointer (lift, scale, rotate), and fix it with an invisible hit area or by not moving the hit box. Doorkick's version of this bug made frames 6× slower and stalled a test.
- Verify in Playwright (PW=$(npm root -g)/playwright, args --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader):
  - the overlay shows with `?fps=1` and F9;
  - Test speed finishes and Apply saves the level;
  - Auto steps down on SwiftShader;
  - the idle saver drops to 10 fps and wakes on input;
  - no console errors.

## Part 2: real audio
- The library is `SP/audio/`. Read `SP/audio/<slug>/MAP.md`: it maps every event in the game's `sound.js` to a sample and gives the integration guard.
- Inline `SP/audio/gameaudio.js` and `SP/audio/<slug>/audio-data.js` in `build.py`, before `sound.js`.
- At the top of the game's `sfx(name)`: if `GA.has(name)`, play the sample, otherwise run the existing synthesized sound. Keep every synth sound as the fallback. Never delete one.
- Music:
  - Replace the synthesized background groove with `GA.music('main')`. Shipwreck has `calm` and `storm`: cross-fade on bad weather, storms and night.
  - Keep the existing music on/off and sound on/off buttons, and make them control GA, persisting as before.
  - Start music only after a user gesture.
  - Duck the music under big effects.
- Ambient loops (Shipwreck rain/fire/wind, Nebula engine_loop): start and stop them with the game state, never stacking copies.
- Volumes: set per-sound `vol` so nothing is jarring. Short taps (dice, clack, click) may need +3 to +6 dB. Keep UI clicks quiet. Play hover sounds at most every 80 ms, or leave them out if they get annoying.
- **The user hasn't listened yet.** Keep a single table `SND_MAP={event:{s:'sample',vol:1}}` at the top of `sound.js`, so swapping or muting one sound later is a one-line change. Setting `s:null` falls back to the synth.
- **Credits:** add a "Credits" section to the game's Rules or About popup, using the text from `SP/audio/<slug>/credits.html`. It lists CC0 thanks, plus the full TASL line for any CC-BY item (Sunglaze's Kevin MacLeod track is mandatory). Also say there: "Names, card text and art are original."
- **Licence log:** copy the rows for your game from `SP/audio/ASSETS.md` into `SP/<game-folder>/ASSETS.md`.

## Part 3: verify
- Rebuild, then run `node --check x.js`.
- Run ALL of the game's existing tests (see `/home/user/spotify_to_ytmusic/games-src/README.md`). All must pass with 0 errors and 0 layout problems.
- The jsdom tests have no audio; GA must stay silent and never throw.
- Playwright: play one full turn with sound on and confirm GA decoded samples and played without errors. Log which events fired, and confirm each maps to a sample or falls back to the synth.
- Check the file size: the build grows by roughly the bundle size. Keep it under about 5 MB.
- Don't publish or commit. Write `SP/<game-folder>/AUDIO-PERF-REPORT.md` and reply with:
  - what changed;
  - the exact test results;
  - the file size before and after;
  - any sound you muted or left on the synth, and why.

---

# Adding PerfHUD to a game

`perf/perfhud.js` is a plain script that defines `window.PerfHUD`. Shipwreck Isle (`rc/`) and Doorkick Dungeon (`munch/`) already use it. Copy what they do.

## The same 5 steps in every game

1. **Build.** In the game's `build.py`, add `'perfhud.js'` to the script list, right after `shell.js`, and read it from `../perf/perfhud.js` (adjust `../` to the folder depth):
   ```py
   SRC={'perfhud.js':'../perf/perfhud.js'}
   for f in ['shell.js','perfhud.js', ...]:
       ... open(SRC.get(f,f)).read() ...
   ```
   In `body.html`, add `<script src="perfhud.js"></script>` right after `<script src="shell.js"></script>`. Rebuild, then run `node --check x.js`.
2. **Register** once the renderer exists (at the end of `init3D`, just before the first frame):
   ```js
   const PH=typeof PerfHUD!=='undefined'?PerfHUD:null;
   PH&&PH.register({game:'Name', renderer:V3.r, levels:[...], names:{...},
     getLevel:()=>…, isAuto:()=>…, setLevel:(l,why)=>…, autoTop:()=>gfxAuto(),
     basePR:()=>…, onPixelRatio:v=>{V3.r.setPixelRatio(v);resize3D()},
     orbit:t=>…, isAnimating:()=>…, anchor:'.gx-board', corner:'tl', beforeTest:()=>closeMenus()});
   ```
   - `setLevel(l, why)`: `why` is `'auto'`, `'test'`, `'restore'` or `'apply'`. Only `'apply'` (the Apply button on the result card) is a choice by hand, so call the game's saving setter (`setGfx`) for it. For the other three, call the apply-only function and save nothing.
   - `isAuto()` must be false once the player picks a level by hand. PerfHUD then never changes the level or the pixel ratio.
   - `orbit(t)` is called with a `t` from 0 to 1 during the test, and with `null` at the end. Save the camera on the first call, move it slowly, and restore it on `null`.
   - `isAnimating()` returns true while something moves that the player should see smoothly: tweens, a camera glide, pieces walking, weather blends, dice, flights. Ambient life (water, sway, fire) does not count. That ambient life is what the idle saver slows to 10 fps.
3. **Loop.** Replace `requestAnimationFrame(loop3D)` (both the first call and the one inside `loop3D`) with `(PH?PH.raf:requestAnimationFrame)(loop3D)`. This lets PerfHUD time the game's work per frame and throttle the loop when idle.
   - Delete the game's own frame watchdog and `stepDown()`. PerfHUD's controller replaces them: p95 over 50 ms for 3 s steps down one level, then the pixel ratio in steps to 0.6; 10 s under 14 ms steps back up, at most once a minute; the first 2 s after a level change are ignored.
   - Also delete any "skip frames on a very slow GPU" gap. It hides slow frames from the p95.
   - While `PerfHUD.testing` is true, draw every frame. Treat it as "moving" in any frame cap.
4. **Pixel ratio.** In the game's apply-quality function, set the pixel ratio through the cap: `r.setPixelRatio(PH?PH.pixelRatio(want):want)`. Remove `V3.prMul` if the game has it.
   - For correct draw and triangle counts with post-processing, start `draw()` with `r.info.autoReset=false;r.info.reset();`.
   - Call `PH.wake()` at the start of `sync3D()`, so a move by the computer wakes the idle saver at once. Call `PH.hitch()` after any big rebuild.
5. **Menu.** Put `${PerfHUD.buttonsHTML('<the menu button class>')}` into the Settings popup or the menu. PerfHUD handles those buttons itself (`data-perfhud="show"` / `"test"`) and keeps their labels in sync. `?fps=1` and F9 work with no code.
   - Pick an `anchor` and `corner` that land on an empty corner of the board. The overlay has `pointer-events:none` and 0.72 opacity, but it should still not sit on a control.

Then check each game in Playwright:
- open the Settings popup;
- Show speed, and look at a screenshot;
- Test speed: a card appears, Apply saves the level, and Copy report shows the selected text in headless Chrome;
- wait 4 s with no input: `PerfHUD.idling` is true and about 10 frames are drawn per second;
- move the mouse: it wakes.

Run the game's full test list as well. The jsdom tests never start PerfHUD: the jsdom user agent, or no `requestAnimationFrame`, turns it off.

