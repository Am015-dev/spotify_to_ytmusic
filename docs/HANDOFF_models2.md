# models-2 handoff (build-2, 2026-10-10). Branch alex/od-models.

## Done (committed locally; the push was blocked by a permission check, so it is NOT on origin yet)
- v89t: **Turbo 74 (75895 911 Turbo 3.0)** in RIDES (id t_turbo, perk slip). LDraw by Magnus Forsberg (CCAL 2.0). 158 of 176 parts; the driver and cone are dropped, and the sticker-sheet parts (6285381*) are skipped (new rule in ld2garage.py).
  ldRT median 0.01 (the only miss is the known steering wheel). Garage shot: docs/shots/models2/turbo_g_side.png. out/v89t is built from src (LIVE_MATCH v89s at start).
- LD data is now split into modules: `tools/ld/ld2src.py --out src/98ld<N>_data.js` adds to LD_MESH/LD_MODELS (≤ 200 KB per module) and skips meshes 98ld0 already holds.
- 4643 boat: converted to `ld/out/pboat` (--only boat --yaw 2, 57 parts, 28×8 hull). Its data module is staged at ld/pending/98ld2_data.js (git-ignored ld/; regenerate with convert_all.sh).
  Still to do: a preset like LD_boat (sink the hull, add a driver), then measure the waterline with w8boat.
- New tool tools/ld/tDrive.js: drive shots from a garage save (tools/ld/ls_turbo.json).

## Blocker in this container
- Headless Chromium stops firing rAF after the game loads (it happened with unmodified v89s too), so roam never loads and there are no drive shots. Garage shots work only with a long wait (SW=8000, no ?fast).
- Next session: try a fresh container first.

## Next
Push alex/od-models → QUICK review (garage shot) → DEPLOY v89t. Then v89u = the 4643 boat, v89v = the 10264 Corner Garage (Frankfurt prop, CR_LO 2, tris < 30k), and an Athens temple only if a CCAL file is found.
