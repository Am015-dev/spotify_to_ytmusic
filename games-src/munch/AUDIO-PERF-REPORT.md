# Doorkick Dungeon: audio pass (brief Parts 2 and 3)

PerfHUD was already in place (Part 1 skipped). Backups of the pre-audio sources are in `SP/bak/audio-munch/`.

## What changed

- **`build.py`**: inlines `../audio/gameaudio.js` and `../audio/doorkick/audio-data.js` before `sound.js`. Their `<script>` tags are in `body.html`.
- **`sound.js`**:
  - **One table at the top.** `SND_MAP={event:{s:'sample',vol,pitch,duck}}` has all 14 events. Set `s:null` and that event goes back to its synth sound.
  - **`sfx(name)`.** If `GA.has(sample)`, it plays the sample with the table's volume, with the same 30/90 ms cooldown as before.
    - `roar` follows `SND.pitch` as its playback rate, the same way the synth roar does.
    - Otherwise it runs the original synth code, which is unchanged. No synth sound was deleted.
  - **Music.** `musicStart()` calls `GA.music('main')` and `musicStop()` calls `GA.music(null)`. The synth groove plays only when GA has no audio or `main` failed to decode (`gaMusicOk()`).
  - **Toggles.** The existing sound and music buttons now also call `GA.setSfx` / `GA.setMusic`. They still persist in `dkd_snd` / `dkd_mus`, and GA is synced from those values at boot.
  - **Gesture.** GA shares the synth's AudioContext, and that context is created only on the first pointerdown or keydown. Nothing plays before a gesture.
  - **Ducking.** roar, door, level, death, win and smash duck the music by default. curse also passes `duck:true`.
- **`rules-html.js`**: a "Credits" section at the end of How to play. It starts with "Names, card text and art are original." and then has the CC0 thanks from `audio/doorkick/credits.html`. Every item is CC0, so there is no CC-BY line.
- **`ASSETS.md`** (new): the 28 doorkick rows copied from `audio/ASSETS.md`.

## Volumes (`SND_MAP`)

| event | vol | note |
|---|---|---|
| dice | 1.4 | short tap, +3 dB |
| clack | 1.5 | short tap, +3.5 dB (not used by the game yet) |
| click | 0.35 | UI click, kept quiet |
| turn | 0.45 | plays every turn, kept low |
| bad | 0.6 | |
| whoosh | 0.6 | |
| level, curse | 0.7 | |
| hurt, death | 0.8 | |
| door | 0.85 | |
| win | 0.85 | |
| smash, roar | 0.9 | |

No hover sound was added, because the game has no hover event. There are no ambience beds.

## Test results (after the change)

| test | result |
|---|---|
| `python3 build.py` + `node --check x.js` | OK |
| `rules-test.js` | 46 passed, 0 failed |
| `cards-test.js` | loads, exit 0 (a test deck with no checks of its own) |
| `force.js` | checked 147 cards, problems 0 (the same 7 "names never in log" as before the change) |
| `gauntlet.js doorkick.html 20` | 20 games, errors 0 (avg 36.8 turns at the default 40-turn cap) |
| `click.js` | TOTAL errors 0 (F and hot, animation on and off) |
| `warn-check.js 50` | 482 situations, 482 warnings shown, 0 missed, 0 false alarms, errors 0 |
| `board-test.js` | ALL OK: 10 viewport and colour-scheme combinations, 0 layout problems |
| `newcomer.js` 1366x768 seed 7 | game finished at turn 47, 76 clicks, 0 errors |
| `audio/test/jsdom.test.js doorkick` | all passed |

- **Timeout on `warn-check.js`.** The first `warn-check.js 50` run hit my own 30-minute `timeout` on the loaded machine. The rerun without a cap finished in 15 min, with 11.9 min of CPU.
- **jsdom is slower.** Every jsdom test now parses a 1.7 MB page instead of 0.34 MB, so each one takes longer.

## Playwright audio check (`audio/work_dk_turn.js`)

This played six turns through the real page, following the hints: a full round of me plus 3 computers, with sound on.

- **Before the first gesture:** `audio:false`, nothing decoded, nothing playing.
- **After playing:** 27/27 samples decoded, 0 failed, ctx `running`, music `main`.
- **Events that fired, all as samples:** level, door, roar, dice, turn, curse, click.
- **Every `SND_MAP` event resolves to a sample:** dice, clack, smash, hurt, roar, door, level, bad, death, curse, whoosh, turn, win and click.
- **Music toggle:** off stops the track and stores `dkd_mus=0`. On brings `main` back and stores `1`.
- **Sound toggle:** off sets GA sfx to false, `GA.play` refuses, and `dkd_snd=0` is stored. On restores it.
- **Fallback (`audio/work_fb.js`):** setting `SND_MAP.dice.s=null` sends `dice` to `synth`.
- **Console errors:** 0.

## File size

`doorkick.html` went from 341,352 to 1,749,778 bytes, which is +1.41 MB, the size of the bundle. It is under 5 MB.

## Muted or left on the synth

- None. All 14 events use samples.
- `clack`, `smash` and `hurt` are mapped, but the game never fires them today.
- The user hasn't listened yet. To change one sound, edit its row in `SND_MAP`, or set `s:null` to go back to the synth.
