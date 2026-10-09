# HANDOFF fix21 (boost FX + FX/AUDIO tabs + music). Branch alex/od-fix21, on alex/od-tune20 3efffaf (= live v87x src). Draft PR #63.

## Done
- **Race boost FX root cause**: race cars keep heading + SHIP_K scale on `userData.m` (root unrotated/unscaled). `B2K_frame` used the root in races,
  so the thrusters were ~1/SHIP_K too big, world-axis aligned, and the box was heading-dependent. Now `userData.m` (98k), the race ×.7 is gone,
  `B2K_rear` = +z for that frame. `R15_boostFx` (30_race): 48 omni sparks at 10–18 m/s became ~10 short, slow exhaust sparks.
  Exhaust sparks are slow in world space (adding car velocity drew 2 m streaks). Race boost blur .6→.3, nitro lines +.25→+.12, burst FOV kick 15→10.
- **TUNE FX tab**: `TUNE.fxFlS fxFlL fxFlI fxSpk(bool) fxSpkN fxSpkS fxLines fxGlow fxFov fxShake` (10_core TUNE; 1 = default). 7th knob field `'bool'` = checkbox.
- **Music** `src/98m_music.js` (ORDER after 98k):
  - `MUS_FILES` = the shipped tracks; build.sh fails if one is missing. `MUS_MAP` maps mode→track; `MUS_mode()` decides the mode.
  - Two `<audio preload=none>` slots via MediaElementSource → gain → `AU.m` (master, so SOUND mutes).
  - Crossfade, resume via `pos` (needs HTTP Range), duck (dialogue = `AU_isDlg`/`M1.cs`; boost = half the amount for 0.8 s).
  - The synth music bus `AU.mus` is set to 0 while a track plays.
  - Unlock on the first pointerdown/touchend/keydown/click.
  - `window.__mus.st()/log`.
- Tracks: `src/assets/music/*.mp3` (from alex/od-music c3b0898). build.sh copies them to `out/<ver>/music/` (and `./music` with --local, gitignored).
- **AUDIO tab**: `TUNE.musOn musVol(.5) sfxVol duckOn duckAmt(.7)`.
- ⚙ sits left of `#topBtns` on the menu (it covered SOUND ON).
- Tests:
  - `tools/tBoostFx.js <url> <out> race|roam|tab` (normal build; fast mode hides particles)
  - `tools/tMusic.js <url?tune=1> <out> menu|roam|missing`
  Shots and probes: docs/shots/fix21/.

## Next
1. DONE: v87y DEPLOY sent (alex/od-fix21-fx 0411160, FX only); reviewer PASS 8adefc6 (audio); v87z DEPLOY sent (alex/od-fix21 c05ca90, out/v87z incl. music/). Coordinator deploys and must publish music/ to the beta too.
2. On PASS:
   - `tools/verify_live.sh` must say LIVE_MATCH (else merge the live src);
   - prepend the `OD_CHANGELOG` v87y entry (10_core top);
   - `tools/build.sh v87y`;
   - `git add -f out/v87y` (overdrive.html, km.js, index.html, tune.json, music/*.mp3);
   - push, then send the coordinator `DEPLOY alex/od-fix21 <commit> out/v87y <msg>` with 3 bullets + shots.
3. Beta artifact: the music/ files must be published next to the page (else one 404 per track, then synth).
