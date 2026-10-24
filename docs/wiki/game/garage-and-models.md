# Garage and models
## Key files / functions
- Builder core `src/92_garage_builder.js` (`GB_PC`, `GB_piece`, `GB_geo`, `GB_attach`, `GB_mods`); old garage helpers `src/10_core3.js:gbOpen`, `kitParts`, `liveryPat`.
- UI/studio: `src/94_garage_ui.js:GB_ui`, `src/98s_garage_studio.js` (GS_*), `src/98u_garage_shell.js`, `src/98gx_garage_ux.js`, paint `src/98g_garage_paint.js`, floor `src/98gf_garage_floor.js`, zoom `src/98gz_garage_zoom.js`.
- Parts/canvas: `src/98pa_garage_parts.js`; collection + templates: `src/98y_garage_collection.js` (G9C_*); perks `src/98p_garage_perks.js`; build guide `src/98sb_build_guide.js`; new build `src/98r_garage_newbuild.js`.
- LDraw models (OMR, CCAL 2.0): runtime `src/98ld_import.js` (`LD_geo`, `LD_grp`, `LD_boat`), data `src/98ld{0..4}_data.js`, per-model `src/98ld_v_*.js` / `98ld_w_*.js`, list `src/MODELS`. Build: `tools/ld/mkmodels.py` -> `out/<ver>/models.js` + `models/<id>.js`, loaded on demand.
- Glossy paint: `src/98gc_glossy.js`. Docs: [../../MODEL_PIPELINE.md](../../MODEL_PIPELINE.md), [../../MODEL_CATALOG.md](../../MODEL_CATALOG.md), [../../ASSET_CATALOGUE.md](../../ASSET_CATALOGUE.md), [../../GARAGE2K_PLAN.md](../../GARAGE2K_PLAN.md), [../../GARAGE2K_GAP.md](../../GARAGE2K_GAP.md).

## Invariants
- Every model in `src/MODELS` ships a chunk; every chunk must be published ([build-and-deploy.md](build-and-deploy.md)).
- Budget 250 bricks; `GB_mods` penalises size (top -1.2 %, accel -3 % at full).
- Garage GO: `src/99cg_garage_cars.js`; lint: `tools/unit/lint_models.js`.

## Known bugs / history
- Missing chunks broke garage cars: [../../HANDOFF_garage-cars-r22e35.md](../../HANDOFF_garage-cars-r22e35.md). Audit: [../../GARAGE_AUDIT.md](../../GARAGE_AUDIT.md). Builder lanes: [../../HANDOFF_garage18.md](../../HANDOFF_garage18.md).
Racers comparison: [../racers/car-builder.md](../racers/car-builder.md).
