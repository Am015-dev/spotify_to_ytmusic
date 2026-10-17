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
