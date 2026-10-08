# TUNE: tune the driving feel yourself (since tune20)

All the numbers that shape how the car drives and looks (~55 knobs) are in one place. You change them with sliders while you drive.
Nothing changes for normal players unless a tuning is published.

## Alex: how to use it
1. Open the **beta artifact** in the Claude app, or any build with `?tune=1` added to the URL.
2. Tap the small **⚙** at the top centre of the screen. A drawer slides out on the left. It stops above GAS/BRAKE/◀▶, so you can keep driving.
3. Pick a tab: **Steer · Grip · Engine · Boost · Camera · Body · Race · FX · Audio**. Move a slider and it applies at once.
   FX (since fix21) = boost visuals in roam and races: flame size/length/brightness, sparkles ON/OFF + count + size, speed lines, screen glow/blur, FOV kick, shake (all ×, 1 = default).
   Audio (since fix21) = music on/off, music volume (0.5 default), SFX volume ×, duck music under dialogue + boost (on/off + amount). Tracks: `src/assets/music/<name>.mp3` + the name in `MUS_FILES` (src/98m_music.js).
   The number next to a slider turns **pink** when it differs from the default.
4. **RESET STEER** (or another tab) puts that group back to the defaults.
5. **SAVE…** opens the Saves tab. Type a short note (e.g. "tighter steering") and tap **SAVE**. That stores a new version vN.
6. In the version list (vN · note · time):
   - **LOAD** tries a version now.
   - **★ SET** makes it the version the beta starts with for everyone.
7. **EXPORT JSON** copies the current values. If copying is blocked, the JSON is shown selected so you can copy it by hand.
   Send that JSON (or just "publish v7") to the coordinator.

Some knobs only apply later:
- Traffic density applies on the next city load.
- Race speed applies on the next race.
- Car width, length and ride height are cosmetic and only affect the player car. Collision is unchanged.

## Where the values live
- Beta artifact (db capability): collection `tune_versions` holds one doc `v<N>` per version: `{v, note, values, createdAt}`. Doc `tune/current` holds `{v}`.
  On load the page reads `tune/current`, then `tune_versions/v<N>`, and applies its `values`. Nothing is written on load, only on SAVE and ★ SET.
- Public game (GitHub Pages, no db): the page fetches `./tune.json`. That file is `{"v":N,"note":"…","values":{…}}`, and a missing file means defaults.
- `values` maps a knob id (e.g. `"TUNE.stAng"`, `"C26.muCity.road"`, `"RCAM.chase.b"`) to a number. Missing ids stay at their default.
- Knob table, defaults, and the drawer code: `src/99t_tune.js`.
  Defaults are the v87w values: inline literals moved into `TUNE` in `src/10_core.js`, plus the existing `C26`, `W13S`, `W14_ST` and `RCAM.chase` objects and `window.B2K_DMIN`.

## Coordinator: publish version N to the public game
1. Get the values:
   - Alex's EXPORT JSON; or
   - read the beta's db: `ArtifactData get` on `tune_versions/v<N>`, then take `values`.
2. Write `{"v":N,"note":"<note>","values":{…}}` to **`src/assets/tune.json`** and commit it, so every later build carries it.
   `tools/build.sh` copies it to `out/<ver>/tune.json`, and `tools/deploy.sh` copies `out/<ver>/tune.json` to `games/mainhattan-overdrive/tune.json` when it is present.
3. Fastest way, with no game rebuild: commit the same file straight to `alex/brave-carson-rbpmlk:games/mainhattan-overdrive/tune.json`.
   The game reads it on the next page load. `verify_live.sh` still matches, because it compares only index.html and km.js. Also do step 2 so the next deploy doesn't revert it.
4. To go back to the defaults, publish `{"v":0,"note":"defaults","values":{}}`.

## Beta artifact capabilities
Declare `capabilities: {db:{}, user:{}}`. db is the store, and user is recommended by the db capability.
Everyone who can open the beta can read the versions. Contributors and up can save and ★ SET; viewers get "save failed: not_granted".
