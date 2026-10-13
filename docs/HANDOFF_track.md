# HANDOFF track-1 (track builder, 2026-10-13). Branch alex/od-track (from alex/od-models = v90i src).
Coordinator session_017iH3DB4VyxwKSdMwsco4Ut · reviewer session_01Y6FYerWwxv43FuKUcaUT4v · integrator build-10 session_01NEKmBJhbYZuQ3ir54EPH89.
Draft PR #92 (alex/od-track → alex/od-models), for tracking only; the integrator merges after a reviewer PASS.

## Done
- STEP 1: `docs/TRACK_FUN.md` lists 15 lint rules (L1–L15) with numbers and sources. UNVERIFIED items are marked.
- STEP 2: `src/98tb_track_builder.js` (ORDER: right after 98ro_open.js). One edit in 98ro: `OPN_ROAD` is now `let`.
  - Builder tracks run as OPEN courses (98ro engine: 96 m ribbon, routes, pit jumps). `TB_def(json)` builds the race def; `TB_reg` puts it in TRACK_DEFS (not in TDF/ATH_TRACKS).
  - Hooks: a `loadTrack` wrap sets OPN_ROAD and builds the checkpoint gates. An `OPN_prep` wrap sets the per-segment surface. An `R15_pads` wrap clears the auto pads and adds the authored ones plus the jump boosts and route boosts.
  - laps: 99_api scales race laps by CR_RK (0.47), so the def stores `laps/CR_RK` and the author's 1–3 laps survive.
  - UI: `#tbx`, z-index 9000. `body.tbOn` hides #tuG, #odNew and #odPin. There are no prompt() calls (the app iframe may block modals): the name is an inline input and gates are auto-named after the nearest map label.
  - Entry points: home footer "🛠 BUILDER", a MY TRACKS block under the circuit list (Race tab), and "✎ EDIT TRACK" in pause and results (builder tracks only).
  - Save: artifact db `tracks/<id>` {name, city, json, author (user.id), time}, plus localStorage `mho_tb_tracks` and an `ODT1:` base64 track code (copy / paste).
  - Test API: `window.__tb` (open, list, lint, def, get, set, fit, test, state, code, decode) and `window.__tbS(x,z)` (world → screen).
- STEP 3: demo "Twister GP" (`TB_BUILTIN`, `docs/track_demo_twister.json`) passes 15/15. The 1:1 Twister copy (`docs/track_twister_copy.json`) passes 7/15.
- Preview artifact **"Overdrive Track Lab"**: https://claude.ai/artifact/Ntmqn43osDXjTVwm7CbcRP (v2; db + user capabilities; page + km.js + models.js + tune.json + models/ + music/).
  The `tracks` collection was empty after publishing (ArtifactData list). The page `<title>` is still "Mainhattan Overdrive" (a title edit on the build output was blocked).

## Measured (local build, phone 852×393, real touch)
- tRace on Twister GP (1 lap, before the laps fix): 73.6 s standing lap vs a 69.3 s flying estimate (the ~4 s gap is the start), so TB_V.cal = 1.
  Avg 180 km/h, 0 wall hits, 34 overtakes, 2 jumps (5.1 s air), both shortcuts used by the player, AI route share 0.36, 0 stuck, 0 errors.
- RESTART on a builder track: 0.3–0.4 s (no world rebuild). Builder taps, gate placement and the db save path (mock): 0 console errors.
- Grid: `docs/shots/track1/GRID.jpg`. Shots 5–7 are from the first run, so they show LAP 1/1; shot 4 shows the fixed LAP 1/2.

## Not tested / open
- Real artifact db write (only a mocked `claude.use('db')` was tested; the first tTB db run timed out on an overlay bug that is now fixed, and the db step was not re-run).
- iPhone Safari / pinch zoom on a real device (no WebKit here).
- Tracks drawn smaller than the 96 m ribbon fold, and L7/L8 flag this. Official circuit copies are 1:1 and mostly too tight; there is no scale tool yet.
- Variable course width: the slider only sets the asphalt (10–17 m); the drivable width is fixed at 96 m (OPN_I0=9 island).
- No full reviewer REVIEW sent yet; the coordinator asked for the preview first. Next worker: run `tools/tTB.js … gate` and tRace (`TRACK='Twister GP' LAPS=2`), then send REVIEW with the grid.

## Tools
- `node tools/tbLint.mjs track.json` runs the lint in node (same code as the game).
- `node tools/tbDemo.mjs in.json out.json spec.json` places pieces by lap fraction and prints a fraction/R/y table.
- `node tools/tTB.js URL outdir ui|json|db|gate [track.json]` (phone, real taps).

# HANDOFF track-2 (stunt pieces + STUNT CUP, 2026-10-13) — details in docs/HANDOFF_track2.md
State: alex/od-builder 0146a18 (export/import) PASS → build-10 v90k. alex/od-track deb7b1c (STUNT CUP, build tr2j) FULL PASS → build-10 v90l.
Lab "Overdrive Track Lab" https://claude.ai/artifact/Ntmqn43osDXjTVwm7CbcRP = v5 (tr2j): Race → FRA/ATH → ★ STUNT CUP; home → 🛠 BUILDER.

## Open items
- Island-nose scrapes: a car entering a split late can glance the island nose (0–0.5 hits/min on 2 of 6 tracks, 0 on 4). Ideas: a longer
  mouth (OPN_MOUTH/OPN_NOSE in 98ro) for builder routes, or a soft R17-style cushion on the island nose.
- Split timing: alt lanes are balanced by kf = base × length ratio ρ × TB_V.rk[kind] (rk: scd 1.07, scw .95). Single tRace samples per split
  are noisy (±7–10 %); per-kind medians are within ~2 %. For a real ±5 % per split, run ROUTE=road and default tRace 3× per track and average OPN.seg.
- Loops / corkscrews / wall rides: NOT possible in the race physics (spline + lateral offset, frame roll ≤ ~20°). Banks (19°, +45 % grip) are the safe version.
  A loop would need a new physics mode (car frame following a 3D tube); not started.
- No iPhone/WebKit test in the cloud.

## Importing Alex's tracks (from the Lab db "tracks" or a pasted code)
1. Lab db: ArtifactData list collection "tracks" on the Lab URL → each doc {name, city, json, author, time}; `json` is the track JSON
   (or an ODT1 code from ⧉ EXPORT). Save it to a file.
2. `node tools/tbImport.mjs <file> --id tb_<name>` → docs/tracks/<id>.json + lint (L1–L19, docs/TRACK_FUN.md). Fix red rules with Alex.
3. Official race: `--add` puts it in TB_BUILTIN (98tb, MY TRACKS for everyone). For the STUNT CUP row instead: copy the json to
   docs/tracks2/<id>.json, add the id to ORDER in tools/tsEmbed.py, run it (embeds into TS_TRACKS in 98ts).
4. `tools/build.sh <ver> --local`, load smoke (page errors + __tb), tRace 2 laps (0 errors, walls ≤ 0.5/min, stuck ≤ 3 %), grid, reviewer, build-10.
