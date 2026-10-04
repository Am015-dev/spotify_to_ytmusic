# GB (brick builder + driver minifig) — merge anchors

Base: base.html (live v80). Patch: `pGB1.py` only. Rebuild: `./reapply.sh pGB1.py` → REAPPLY_OK.

## Exact-string replacements
| # | patch | anchor (old string, exact) | what happens |
|---|---|---|---|
| 1 | pGB1.py | `window.__mho={` | the whole of `gb.js` is inserted immediately **before** it. Nothing else changes. |

No HTML/CSS anchors: the BRICKS/DRIVER tabs, brick toolbar (`#gbBkT`), palette (`#gbBkP`), CSS and the cutscene portrait (`.gbMe`) are created at runtime.

## Runtime re-bindings (wrappers; names/signatures must stay)
`gbTeam` (adds clamped brick handling mods, `gbB` bricks, `gbF` driver), `shipMesh` (attaches ONE merged brick+driver mesh, +1 emissive mesh, to `userData.carG`),
`gbRender` (DRIVER tab, standing minifig), `gbLoop` (builder camera), `gbClose`, `gbOpen` (refuses while `RO.ch||RO.sp` in roam — keeps BF2's garage-during-event block),
`roamPauseOpen` (hides the pause-menu GARAGE button while an event runs; `#roamExit.onclick` is re-pointed at the wrapper because base bound the raw function), `M1_csNext` (player portrait in cutscenes), `M1_av` (speaker `'YOU'`). Adds `'mho_gbfig'` to `CK` (per-slot save) and `M1_WHO.YOU`.
Bricks are saved inside the existing per-slot `mho_build` (`bricks:[{t,x,z,y,r,m,c}]`).

Globals read: GB, GB_PARTS-era helpers (gbReq, gbReqTxt, store, CK), THREE, mergeGeometries, V3, cv, clamp, DPR2, AU, say, state, RO, pl, M1, M1_scene, M1_WHO, SHIP_K-scaled `userData.m/carG`.
New globals: all `GB_*`, plus `window.__gb` (test API).
