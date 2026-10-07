# HANDOFF tune20 (TUNE drawer). Branch alex/od-tune20, on top of od-fix19 1dc40ba (= live v87w b16476c). Draft PR #62.

## Done
- `TUNE` object, on the line after `W14_ST` in `src/10_core.js`. It replaces inline literals one for one in:
  - 71 (roamStep / roamCam)
  - 93 CR_yaw
  - 30 (touch return, R15 speed, rubber-band)
  - 98k (drift fill / conv / regen / bash / drain)
  - 95 (traffic density)

  Defaults are the v87w values.
- `src/99t_tune.js` (in ORDER before 99_api.js) has:
  - `TUNE_K`: 56 knobs in 7 groups (Steer, Grip, Engine, Boost, Camera, Body, Race). Ids are paths into TUNE / C26 / W13S / W14_ST / RCAM.chase / W.B2K_DMIN.
  - the drawer UI (⚙ at the top centre; the drawer is a left column whose height stops above the touch controls);
  - db storage: `tune_versions/v<N>` and `tune/current`; with no db it fetches `./tune.json`;
  - body width / length / ride (a roamPose wrapper installed after boot);
  - `window.__tune`.
- tune.json path: `src/assets/tune.json` (empty values = defaults) → build.sh copies it to `out/<ver>/tune.json` → deploy.sh copies it to live if present.
- Docs: `docs/TUNE.md`, for Alex and the coordinator. The beta needs `capabilities {db:{}, user:{}}`.
- Test: `tools/tTune.js <url> <out> ab|ui|plain`. It uses a seeded Math.random, a test-driven rAF, and a fake db for `ui`.
- **A/B is identical**: v87w and tune20 give the same 40-sample log (max 135.83 km/h, slip avg 2.197°, stuck 13 %, dist 281.65 m). Results are in `qa20/base_ab` and `qa20/new_ab`.

## Running / next
1. `qa20/ui` + `qa20/plain` were running at handoff. LOOK at the shots `tune_closed`, `tune_open_steer`, `tune_open_camera`, `plain_roam`. Check in `ui.json`:
   - `gearOverlap` and `drawerOverlap` are empty;
   - `turnDefault` differs from `turnChanged`;
   - `list`, `cur` and `reload` are correct, with `writesOnLoad` = 0;
   - `errors` is empty.
2. If the ⚙ overlaps a HUD element, move it.
3. QUICK review: send `REVIEW alex/od-tune20 <commit> <shots>` to session_01Y6FYerWwxv43FuKUcaUT4v, along with the A/B numbers.
4. On PASS:
   - rebuild on the CURRENT live (`tools/verify_live.sh` first);
   - add the OD_CHANGELOG entry ("NEW: tuning drawer for Alex");
   - `tools/build.sh <next ver>`;
   - `git add -f out/<ver>` (overdrive.html, km.js, tune.json);
   - send DEPLOY to the coordinator.
