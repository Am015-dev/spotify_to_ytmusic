# Crown City Smash: PerfHUD and real audio

Date: 2026-09-30. Nothing published or committed. Working files and test logs are in `kot/_ap/`.

## What changed

### Build (`build.py`, `body2.html`)
- `perfhud.js` is inlined right after `shell.js`, read from `../perf/perfhud.js`.
- `gameaudio.js` (`../audio/gameaudio.js`) and `audio-data.js` (`../audio/crown/audio-data.js`) are inlined just before `sound.js`.
- The inlined files are looked up through one `SRC={...}` map.
- The ☰ Menu drawer, which is the same drawer on desktop and phone, now has **Show speed** and **Test speed** rows right under **Graphics** (`btn mrow`, `data-perfhud`).

### PerfHUD (`three3d.js`)
- `PH` is defined at the top. `perfHooks()` registers these hooks at the end of `init3D`:
  - `levels high/medium/low`, `getLevel V3.q`, `isAuto !V3.pinned && gfxPref()==='auto'`, `autoTop gfxAuto()`;
  - `setLevel`: the `apply` reason saves `ccs_gfx`; `auto`, `test` and `restore` only call `setQuality`;
  - `basePR`, `onPixelRatio`;
  - `orbit`: `V3.orbA` swings the eased camera up to ±0.45 rad around the look point, and `null` puts it back;
  - `beforeTest`: closes the open drawer;
  - anchor `.gx-board`, corner `tr` (the empty top-right corner of the board; the game's own HUD sits bottom-left).
- Removed: `stepDown()`, the `V3.perf` block in `loop3D`, and `V3.perf=` in `setQuality`. `V3.soft`, which forces Low in `gfxAuto`, is kept.
- Both `requestAnimationFrame(loop3D)` calls now go through `(PH?PH.raf:requestAnimationFrame)`.
- `setQuality` passes its pixel ratio through `PH.pixelRatio()`. `renderFrame` starts with `r.info.autoReset=false; r.info.reset()`. `sync3D` calls `PH.wake()`, and `cycleGfx` calls `PH.hitch()`.
- `isAnimating()` returns `V3.busy`, which the loop sets each frame. It is true while any of these is happening:
  - monster hops, landings, hit shakes, red flashes, K.O. falls;
  - dice in flight, click pulses, hover lift easing (kept dice bob all the time, which counts as ambient);
  - live particles or screen shake;
  - the camera easing towards its target (more than about 0.14 units away) or the winner push-in;
  - the speed test.

  Ambient life does not count: sway, neon, water, clouds, the active ring pulse and the crown spin.

### Hover-lift check
The page had three hover lifts that move their own hit box:
- `.btn:hover` `translate(-1px,-1px)` (`head.html`);
- `.die:hover` `translateY(-2px)` (`polish.css`);
- `.monpick button:hover` `translateY(-2px)` (`polish.css`).

None of them moves on hover now. They keep the stronger shadow and get a slight `brightness` instead. `:active` presses still move, which is harmless. No transform-on-hover rules are left in the built page.

### Audio (`sound.js`)
- `SND_MAP` at the top of the file is the single table of `{event:{s:'sample', vol, p, duck, then}}`.
  - `s:null` falls back to the synth; `vol:0` mutes the event.
  - `p` makes the sample follow the monster's pitch (`SND.pitch`).
  - `then` plays a second event 250 ms later.
- GA is set up with `GA.init({sfx, music, key:'ccs', ctx:()=>audioInit()?SND.ctx:null})`, so it shares the game's AudioContext. `gaSync()` sets GA from the game's own `ccs_snd` / `ccs_mus` values.
- At the top of `sfx(name)`, after the existing on-check and 90 ms throttle: if the sample is decoded, `GA.play` it and return; otherwise the old synth runs. No synth sound was deleted. `SND_LOG` records `event:sample` or `event:synth`.
- Music:
  - `musicStart()` calls `GA.music('main',{vol:.6})` ("Funked Up" by Joth), and `musicStop()` calls `GA.music(null)`.
  - The synth groove stays as a fallback. It returns early while `GA.playing()` is true, so it only plays before decoding finishes or if decoding fails.
  - Music starts only after a gesture: `audioInit` and GA unlock happen only on pointerdown or keydown.
  - Ducking: GA's default list covers roar, smash, stomp, ko and win; `mindbug` and `evolve` duck too.
- The toggles keep their buttons and storage. Sound off silences samples and GA music (just as the old master gain muted everything). Music off stops the GA track. Both settings persist.
- Sound stays local to each page. `net.js` is unchanged, clients already call `snd()` from their own state diff, and nothing about audio is added to `G` or sent over the network.
- The game has no ambient loops, so nothing needed starting or stopping.

### Credits and licence log
- The Rules popup (`ui.js`) has a new **Credits** section after "About this version". It reads: "Names, card text and art are original.", then the text of `audio/crown/credits.html`: CC0 thanks to Joth, Kenney, rubberduck and StarNinjas. The links open in a new tab.
- Every item is CC0, so no TASL (CC-BY attribution) line is needed.
- `kot/ASSETS.md` has the 30 rows from `audio/ASSETS.md` used by `crown/*`, including `music.main`.

## Volumes (`SND_MAP`)

| event | vol | why |
|---|---|---|
| dice | 1.4 | short tap, +3 dB |
| clack | 1.3 | short tap, +2 dB, once per landing die |
| smash, stomp | 1 | as mastered; stomp is followed by `roar` as the synth did |
| hurt | 0.9 | follows half the monster's pitch |
| roar | 0.85 | follows the monster's pitch |
| ko | 0.85 | |
| win | 0.8 | |
| whoosh | 0.8 | |
| buy | 0.85 | |
| heal, mindbug, evolve | 0.7 | |
| star | 0.65 | |
| energy | 0.5 | 0.9 s zap, kept low |
| turn | 0.5 | plays every turn, so kept soft |
| click | 0.45 | UI clicks stay quiet |

- No sound is muted, and none is left on the synth.
- No hover sound was added, to avoid annoyance.
- Unused extras in the bundle: `hover`, `confirm`, `error`, `open`, `close`, `levelup`, `lose`, `bad`, `shake`, `crumble`. They are part of `audio-data.js` as delivered and are left in.

## Test results (new build)
- `node --check x.js`: OK.
- `rulestest.js kot/kot2.html`: passed 27, failed 0.
- `gauntlet.js`: 20 games, endings: 17 by 20 stars, 3 last standing; average 9.1 turns; errors 0, invariant violations 0, stalls 0.
- `uiclick4.js`: 665 clicks, 0 rejected, 0 errors, 0 invariant violations (solo and hot seat, with and without animation).
- `nettest.js` (1 client): game finished (winner P1, 115 clicks, 88 remote), clients agree, errors []. With 2 clients: errors [].
- `coverage.js`: 230 items; errors or invariant problems 0.
  - 8 items never fired in the default 3-game sample.
  - Rerun with 8 games each, 4 still never fire: `spree`, `meta`, `mimic`, `c_clown`.
  - The old build (`_ap/before.html`) shows the same 4 with the same settings. This is a limit of the coverage harness that was already there, not a regression; the engine is unchanged.
- `kot/layoutcheck.js`: ALL PASS at 4 sizes, 0 fails.
  - 1366x768: 64 checks; 1920x1080: 46; 768x1024: 68; 390x844: 72.
  - At 1920 the loop timed out before any human turn because the machine was so slow; everything else ran.
- Baseline, the old build, on the same machine: rulestest 27/0, gauntlet errors 0, uiclick 574 clicks 0 errors, nettest errors []. Its coverage run was killed by the 30 min limit.

## Playwright (SwiftShader)
The shared machine was badly overloaded: load average 20–25 on 4 cores, with other agents' SwiftShader browsers. Both the old and the new build drew only about 1 frame per second at any size. Timings are therefore not meaningful, but every feature ran.

**PerfHUD**
- Overlay:
  - with `?fps=1` it shows;
  - F9 hides it and F9 shows it again.
  - Screenshot: it sits on the board's top-right corner and does not cover any control.
- Show speed and Test speed appear under Graphics in the Menu drawer, on desktop and on a 390x844 phone.
- Test speed (480x320): High 1.8 fps / p95 967 ms, Medium 1.4 / 1333, Low 1.5 / 733. Recommended Low.
  - Apply saved `ccs_gfx=low`, and `isAuto` became false.
  - Copy report fell back to a selected textarea (563 characters) in headless Chrome.
- Auto step-down: forced High while on auto and kept the page awake. PerfHUD stepped down on its own, in this order:
  - High to Medium (p95 950);
  - Medium to Low;
  - pixel ratio 0.8;
  - pixel ratio 0.64.
- Idle saver: with the computer paused, `PerfHUD.idling` became true once the animations settled. Particles last about 12 frames, which took 16 s at 1 fps. It woke on mouse move.
  - Measured rate while idle: 0.5 fps. The 10 fps target could not be confirmed, because the machine only managed about 1 fps even when awake.
- Console errors: none.

**Audio**
- Before any gesture there is no AudioContext and no music.
- After the first click: context running, all 28 samples decoded (27 sfx and the music), 0 failed, music `main` playing.
- One full round with sound on (a human turn and the three computer turns around it) fired: `dice`, `clack`, `click`, `star`, `energy`, `stomp`, `roar`, `smash`, `hurt`, `heal`, `buy`, `turn`.
  - Every one played as `sample`; none fell back to the synth.
  - `SND_MAP` check: all 17 events map to a decoded sample.
- Toggles:
  - sound off: GA sfx and music off;
  - sound on: music resumes;
  - music off: the track stops, and this survives a reload;
  - music on: it plays again.
- Console errors: none.
- The jsdom tests have no audio: GA stays silent (`GA.has()` is false) and nothing throws. This is covered by all the jsdom suites above.

## File size
`kot2.html` went from 1,054,690 to 2,368,626 bytes in the final build (+1.31 MB, under 5 MB):
- `audio-data.js`: 1,276,457 bytes;
- `gameaudio.js`: 12.7 KB;
- `perfhud.js`: 19.2 KB.

## Final build: updated perfhud.js included
- The coordinator updated `perf/perfhud.js` (19,205 bytes, 16:57) with a slow-frame fix:
  - step-down now works when frames take more than 500 ms;
  - the speed test no longer reports p95 0 for a level with no finished frames.
- The first overloaded run hit exactly that second bug: High collected 0 frames, got p95 0, and was wrongly recommended.
- I did not edit `perfhud.js`. I rebuilt `kot2.html` afterwards, and the file is inlined verbatim (checked).
- After the rebuild:
  - `node --check x.js` passed;
  - `rulestest.js kot/kot2.html`: passed 27, failed 0.
- The Playwright and other suite results above come from the build just before this update. Only `perfhud.js` changed; the game code is identical.
- Final size: **2,368,626 bytes**.
