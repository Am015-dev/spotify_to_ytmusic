// ---- LDM (v89v, 2026-10-10). Coordinator: "move all LDraw model data OUT of overdrive.html into models.js next to km.js" (page ≤ 3.5 MB, flat as models grow).
// The data modules (src/MODELS: 98ld<N>_data.js, 98ld_v_*.js, 98ld_w_*.js) are built into out/<ver>/models.js; each is wrapped as a function in window.__LDQ
// (tools/build.sh) and run by 98ld_run.js after 98ld_w.js, with the bindings they use. models.js loads like km.js (<script src> before this module),
// so saved rides made of LDraw parts still build at boot. v89z: models.js is only an index; each model loads from models/<id>.js on demand (98ld_run.js). A missing models.js only loses the LDraw rides/props (LD_br gives []).
const LD_MESH={},LD_MODELS={};
