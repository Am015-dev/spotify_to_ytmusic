# models-1 handoff (build-1, 2026-10-10): LDraw → garage pipeline + 3 real LEGO models. Branch alex/od-models (from alex/od-taxi).

## Done
- **Pipeline** (docs/MODEL_PIPELINE.md): LDraw OMR `.mpd` (CCAL 2.0) → `tools/ld/ld2garage.py` → `ld/out/<m>.json/.md` (bricks + substitution report)
  → `tools/ld/ld2src.py` → `src/98ld0_data.js` (66 real LDraw meshes + 3 models, 167 KB). All three: `tools/ld/convert_all.sh`.
  Part id map via the LEGO ids on our tiles (G13_ID) + alias table; parts we lack become **real LDraw meshes** (`ld<id>` parts, hidden from the
  palette); envelope calibration of every part's orientation (24 rotations, cache tools/ld/calib.json); offsets ox/oy/oz (taxi) + new free rotation `R`.
- **Game module** `src/98ld_import.js` (ORDER after 98tx): mesh parts (crease normals, our studs incl. side studs, tilt + glass handled inside),
  free rotation `R`, offsets/R through the CR_grp path (packed into the colour by a GAR_apply wrapper), presets, bank prop, test hook `window.__ld`.
  - RIDES street: **Rally S1 (76897)** id t_rally (8-wide Speed Champions). Tyre gap 0.03 m ×4, 0 console errors.
  - RIDES water: **Harbour Speedboat (4641)** id t_speedboat, hull 5 plates down (w8boat gapAvg ≈ −0.2 m after that change; −0.016 before), driver added.
  - **Mainhattan bank (1490 Town Bank)**, Frankfurt only: placed on the nearest free lot to the start (2078, 17), front to the road, LEGO scale
    = the cars' (0.408 m per garage unit, measured), world-space merged meshes (3 draws, 11.6k tris, CR_LO 2), hub culling, box collider from the walls.
- **Checks**: `tools/ld/ldRT.js` round trip (median 0.01 game units, bank 112/112), `tools/ld/ldAB.js` + `abSheet.py` (LDraw truth vs ours),
  `tools/ld/ldRender.js`, `tools/ld/tRides.js` (real touch RIDES → garage → save → drive; env SET, GONLY, DUMPLS), `tools/ld/tWorld.js` (bank shots),
  `tools/w8boat.js <url> <out> t_speedboat`. tPlay: new env `LS=tools/ld/ls_rally.json` (garage save of the Rally → drive it).
- Sheets: `docs/shots/models1/sheet_{rally,boat,bank}.jpg`, A/B: `docs/shots/models1/ab_{rally,boat,bank}.png`.

## Notes
- Live was v89q; taxi (garage-16) uses v89r, so this is **v89s**. garage-16 also changed tools/tPlay.js (CAR=<preset>): expect a small merge.
- 0 km/h in tRides' 9 s GAS hold = the same story-start popup the taxi worker saw; tPlay is the gate.
- One-time setup in a new session: parts library into ld/lib (see MODEL_PIPELINE §5), `pip install scipy pyfqmr`, `node tools/ld/ld_dump.js`.

## Still to do (in order)
1. tPlay result (ld/shots/tplay1.log), REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v with the sheets + gap 0.03 m.
2. After PASS: rebuild on CURRENT live (verify_live.sh), OD_CHANGELOG v89s (NEW Rally S1, NEW Speedboat, NEW bank in Frankfurt — all from real
   LEGO model files), 99c checklist items, `git add -f out/v89s`, push, DEPLOY to the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut). If the taxi deploys first, merge it in.
3. Ideas (not started): show the 66 imported parts as an "LDraw" palette category; white hubcaps for our wheels; more OMR sets (the script is ~2 min per model).
