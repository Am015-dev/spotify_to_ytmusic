# Shipwreck Isle: audio pass (brief Parts 2 and 3)

PerfHUD was already in place (Part 1 skipped). Backups of the pre-audio sources are in `SP/bak/audio-rc/`.

## What changed

- **`build.py`**: inlines `../audio/gameaudio.js` and `../audio/shipwreck/audio-data.js` before `sound.js`. Their `<script>` tags are in `body.html`.
- **`sound.js`**:
  - **One table at the top.** `SND_MAP={event:{s:'sample',vol,duck}}` has all 17 events. Set `s:null` and that event goes back to its synth sound.
  - **Tables for music and ambience.** `SND_AMB` sets the rain, wind and fire beds and their volumes. `SND_MUS` names the `calm` and `storm` tracks.
  - **`sfx(name)`.** If `GA.has(sample)`, it plays the sample with the table's volume, with the same 30/90 ms cooldown as before. Otherwise it runs the original synth code, which is unchanged. No synth sound was deleted.
  - **Music.** `musicStart()` calls `GA.music(mood)` and `musicStop()` calls `GA.music(null)`. The synth groove plays only when GA has no audio or the track failed to decode (`gaMusicOk()`).
  - **Moods.** `audioMood()` reads the same weather that the 3D scene shows: the forecast while planning, and the real clouds in the weather phase. It follows the story beat on screen, through `withView`.
    - Music cross-fades over 2.5 s to `storm` at night, on a lost game, with a storm token, with heavy clouds (storm level 0.5 or more), or when the weather phase rolls rain or snow. At all other times it plays `calm`.
    - The rain loop plays whenever rain clouds show, louder with more rain.
    - The wind loop plays with storms (storm level above 0.2) and snow.
    - The camp-fire crackle plays at night, a little quieter in the rain.
    - `GA.loop` only changes the volume of a bed that is already running, so copies never stack. Beds fade out when their condition ends, when sound is turned off, or on the start screen.
  - **When the mood updates.** `audioMood()` runs on every `refresh()` (in `ui.js`) and on a 1 s timer. The timer starts only after the first gesture creates the AudioContext.
  - **Toggles.** The existing sound and music buttons now also call `GA.setSfx` / `GA.setMusic`. They still persist in `swi_snd` / `swi_mus`, and GA is synced from those values at boot.
  - **Gesture.** GA shares the synth's AudioContext (`ctx:()=>{audioInit();return SND.ctx}`), and that context is created only on the first pointerdown or keydown. Nothing plays before a gesture.
  - **Ducking.** thunder, win and lose duck the music by default. fight, night and mystery also pass `duck:true`.
- **`rules-html.js`**: a "Credits" section at the end of How to play. It starts with "Names, card text and art are original." and then has the CC0 thanks from `audio/shipwreck/credits.html`. Every item is CC0, so there is no CC-BY line.
- **`ASSETS.md`** (new): the 33 shipwreck rows copied from `audio/ASSETS.md`.

## Volumes (`SND_MAP`)

| event | vol | note |
|---|---|---|
| dice | 1.4 | short tap, +3 dB |
| click | 0.35 | UI click, kept quiet |
| round | 0.5 | |
| good | 0.55 | |
| heal, night, bad, mystery | 0.6 | jingles |
| event | 0.75 | |
| wound, thunder | 0.8 | |
| build | 0.85 | |
| explore, place | 0.8 | |
| fight | 0.9 | ducks |
| win, lose | 0.85 | |

| bed | vol |
|---|---|
| rain | 0.45 × (0.45 + 0.55 × rain) |
| wind | 0.4 × (0.4 + 0.6 × max(storm, snow)) |
| fire | 0.45 × (1 − 0.4 × rain) |

No hover sound was added, because the game has no hover event.

## Test results (after the change)

| test | result |
|---|---|
| `python3 build.py` + `node --check x.js` | OK |
| `rules-test.js` | 24 pass, 0 fail |
| `force.js` | runs 2520, failing 0 |
| `gauntlet.js 20` | 20 games, errs 0 (wins 1, avg round 9.7) |
| `adv-test.js 10` | illegal 0, bad moves 0, red open 0, errors 0 |
| `click.js` (jsdom, 6 games) | TOTAL errors 0 |
| `lay.js` 1366x768 / 1920x1080 / 768x1024 / 390x844 | PROBLEMS 0 at each size; board 65% / 74% / 47% / 40% |
| `np.js 1366 768 n 2` | 50 shots, errors [] |
| `audio/test/jsdom.test.js shipwreck` | all passed (silent and no throw without Web Audio, or with a throwing or failing context) |

- **Running `lay.js`.** A single run over all four sizes died twice with "Target page, context or browser has been closed", exit 144. Other agents were running many headless browsers on the machine at the time. Each size then passed when run on its own with `SIZES=`.
- **Win rates.** The gauntlet and adv-test win rates come from the engine and AI only. Those tests do not load the audio code.

## Playwright audio check (`audio/work_rc_turn.js`)

This played one full round with sound on: start, story beats, AI-planned actions, and night, up to the day-2 plan.

- **Before the first gesture:** `audio:false`, nothing decoded, nothing playing.
- **After the first click:** 31/31 samples decoded, 0 failed, ctx `running`, music `calm`.
- **Mood trail:** `1|plan|calm` → `1|night|storm|fire` → `2|event|storm|fire` → `2|event|calm` → `2|plan|calm`.
- **Forced mood checks, on the live beat:**
  - Night gives the `fire` loop and `storm` music.
  - Rain 2 plus a storm token gives the `rain` and `wind` loops and `storm` music.
  - Clearing both returns no loops and `calm` music.
  - Calling `audioMood()` 20 times at night still leaves one `fire` loop.
  - Sound off leaves no loops. Music off stops the track, and music on brings `calm` back.
- **Events that fired, all as samples:** click, round, explore, dice, mystery, place, night, event.
- **Every `SND_MAP` event resolves to a sample:** dice, wound, heal, build, explore, fight, event, thunder, night, round, good, bad, mystery, win, lose, click and place.
- **Fallback (`audio/work_fb.js`):** setting `SND_MAP.dice.s=null` sends `dice` to `synth`.
- **Console errors:** 0.

## File size

`shipwreck.html` went from 1,165,189 to 3,714,491 bytes, which is +2.55 MB, the size of the bundle. It is under 5 MB.

## Muted or left on the synth

- None. All 17 events use samples.
- The synth groove, the synth rain hiss and every synth effect remain only as the fallback.
- The user hasn't listened yet. To change one sound, edit its row in `SND_MAP`, or set `s:null` to go back to the synth.
