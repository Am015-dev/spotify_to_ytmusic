# Wired audio, round 3 (W357)

Branch `shelf/W357-audio-anims` (from `origin/alex/brave-carson-rbpmlk`). Not deployed.

## What was checked

- Source: every `games-src/audio/<folder>/treblo/*.mp3` (170 files in 15 game folders). The 16th folder, `overdrive`, holds 16 more files and was **not touched** (owner rule for Mainhattan Overdrive). Nightrun was not touched either.
- Built: every `games/<slug>/music/*.mp3`.
- Played: each game's music call site. Music is chosen by a slot (menu, flight/main, last round, victory, defeat), each with an `a` and a `b` cue, and the menu, flight and last-round slots default to **all songs** (shuffle pool). A cue is "playing" when it is in that game's music table and its slot can pick it.

## Per game

| game (folder) | source mp3 | playing before | wired now | still unused |
|---|---|---|---|---|
| cauldron-fair (cauldron-fair) | 12 | 10 | 2: tavern-short-a/b | 0 |
| crown-city-smash (crown) | 10 | 10 | 0 (no extra files) | 0 |
| doorkick-dungeon (doorkick) | 12 | 10 (+ `classic.mp3`, built, not in source) | 2: main-short-a/b | 0 |
| final-approach (final-approach) | 12 | 10 | 2: tavern-short-a/b | 0 |
| hollowbough (hollowbough) | 12 | 10 | 2: tavern-short-a/b | 0 |
| kaiten-kitchen (kaiten) | 12 | 10 | 2: tavern-short-a/b | 0 |
| lantern-dive (lantern-dive) | 10 | 10 | 0 (no extra files) | 0 |
| nebula-aces (nebula) | 10 | 10 | 0 (no extra files) | 0 |
| rampart-and-vine (carc) | 12 | 10 | 2: tavern-short-a/b | 0 |
| sands-of-qamar (ft) | 12 | 10 | 2: tavern-short-a/b | 0 |
| shipwreck-isle (rc) | 12 | 10 | 2: tavern-short-a/b | 0 |
| short-fuse (short-fuse) | 12 | 10 | 2: tavern-short-a/b | 0 |
| sunglaze (sunglaze) | 10 | 10 | 0 (no extra files) | 0 |
| thornbound (thornbound) | 12 | 10 | 2: tavern-short-a/b | 0 |
| tidewake (tidewake) | 10 | 10 | 0 (no extra files) | 0 |
| mainhattan-overdrive (overdrive) | 16 | not checked | 0 | 16 (excluded, owner rule) |

Totals for the 15 games outside the exclusion: 170 source files. 150 were already in a playable slot, and **20 were wired in this round** (9 menu loops plus Doorkick's 2 dungeon loops). None is left unused.

## How the short loops were wired

The `-short` files are extra menu loops (`treblo/*-short-*.mp3`) that never went through `music.py`, so they were not published and not in any music table. This round did the same three steps for each of the 9 games with a tavern cue (and `main` for Doorkick, which has no separate tavern set):

1. **Encode**: `ffmpeg loudnorm -18 LUFS, 44.1 kHz stereo, 96 kbps MP3`, the same format as the other cues, copied to `games/<slug>/music/`.
2. **Cue table**: added `tavern-short-a/b` (or `main-short-a/b`) to the game's title table (`MTITLE`, or the picker titles in `carc`, `ft`, `rc`, `munch` and `short-fuse`). These join the existing `MALL` shuffle pool, so the menu, flight and last-round "all songs" modes can play them. They are not separate a/b choices in the picker.
3. **Music table**: added the same entries to the game's `audio-data.js`. For `final-approach`, `cauldron-fair` (`bundle_cauldron.py`) and `shipwreck-isle` (`rc/build.py`), the generator was also updated so a rebuild keeps them.

Design call: the short loops are not separate picker choices. They are mixed into the shuffle pool, because every game defaults its menu to "all songs", so they play by default without changing the picker. If the owner wants them as selectable menu tracks, that is a picker change in each game.

## Checks

- Quick build (`VIS_SLUGS="," build-all.py --quick <slug>`): **PASS** for final-approach, cauldron-fair, hollowbough, kaiten-kitchen, thornbound, rampart-and-vine, sands-of-qamar, shipwreck-isle, short-fuse, doorkick-dungeon. Only the staged build; nothing deployed. The one warning on final-approach is an existing title-screen text-overlap note, not from this change.
- Playwright (staged build + game folder, phone viewport): for all 10 games the short cue is in the menu pool, the file loads with HTTP 200 when called, and there are **0 console errors** and 0 failed requests.
- Standard cues: confirmed by their slot wiring and table entries, not by playing each one in a browser.
- Playwright: installed `1.63.0` (not the `1.56.1` the task named). The preinstalled browser matches `1.63.0`; `1.56.1` looks for a different browser build and the scenario runner failed on launch. `--no-save`, not committed.

## Animations (Crown City Smash, Voltusk)

Assets in `games-src/anims/crown-city-smash/`: `voltusk-idle-sheet.webp` (62 KB), `voltusk-idle.webm` (421 KB), `voltusk-attack.webm` (832 KB), plus `refs/`.

**Result: not wired.** Nothing was changed for animations.

- Voltusk is drawn as its 3D model (`models/voltusk.glb`) in the 3D standee code, `kot/three3d.js` around lines 552-557. There is no still cutout for it in the build (`media.json` lists only one cutout), so the model is what the player sees.
- Idle needs the standee to play the sheet or the webm. That is a change to `three3d.js`, which another worker is editing right now, and the owner limited this round to the animation hook and cue tables.
- Attack needs the attack event (the venom and claw resolution in `kot/engine.js`, around line 445). That is game logic, outside the hook.
- Decision needed from the owner: allow the idle change in `three3d.js` (after the 3D worker is done) and the attack trigger in `engine.js`, or leave the animation as it is for this round.

## Caveats

- Several audio tables are edited by hand because their generator is not in the repo. `audio/tools/bundle.py` reads a `music_report.json` from a work folder that is not in the repo. Rebuilding those games from the work folder would drop the short entries. Affected: hollowbough, kaiten, thornbound, rampart, sands, short-fuse, doorkick.
- `games-src/nightrun/MODULES-COMPACT.md` is regenerated by the build. It was left out of this commit.
- Built HTML was not committed, as the rules say.
