# models-3 handoff (build-3, converter + INTEGRATOR, 2026-10-10). Branch alex/od-models.

## Shipped / ready
- v89u LIVE: Power Boat (4643) in RIDES water (src/98ld2_data.js, preset t_pboat / LD_pboat in 98ld_import.js).
- v89v READY at 70e3d72b (out/v89v), sent to coordinator + reviewer: Corner Garage 10264 (Frankfurt prop) + build-4 vehicles (30572, 4914, 4436, 7639: src/98ld_v_*.js)
  + build-5 world props (1632, 6365, 6372, 6402, 6601, 6683: src/98ld_w.js loader + src/98ld_w_*.js). Page 3.64 MB split (flagged to coordinator).

## Integrator loop (coordinator order)
Converters push to alex/od-mdl-veh (build-4, session_015sYS5pLMo4GwJxwswZ3vCb) and alex/od-mdl-world (build-5, session_0152SjBaXUCpBHUwK4AFD9Qq).
Every ~20–30 min or at 2+ models: `git fetch origin alex/od-mdl-veh alex/od-mdl-world && git merge` both → add NEW modules to src/ORDER (they forget:
98ld_v_* and 98ld_w.js then 98ld_w_* right after 98ld_import.js) → one OD_CHANGELOG entry + checklist items → `tools/build.sh <ver>` on CURRENT live
(check `git show origin/alex/brave-carson-rbpmlk:games/mainhattan-overdrive/index.html | cmp - out/<prev>/index.html`) → commit out/<ver> (whole dir, -f)
→ push → QUICK to reviewer + READY to coordinator at the same moment (with draw calls / tris).
Known conflict spot: tools/ld/ld2src.py HAVE line (keep ours: skips meshes of every 98ld*_data.js).

## New tools (this session)
- tools/ld/ldcull.py in out [cell] [drop]: drops parts hidden from outside (box depth maps, 5 views) — for big buildings.
- LD_cull (98ld_import.js, in LD_propMake): in game, drops triangles inside another plain brick's body (hidden studs) + bevel slivers.
- LD_PROPS list (98ld_import.js): more props through the bank's code path (placed after the bank). LD_KEEP/LD_MINT env in ld2garage.py = lower-poly meshes.
- tools/ld/prop_10264.sh: the Corner Garage pipeline (2 data modules 98ld3/98ld4, ≤ 200 KB each).
- tools/ld/ldProp.js <url> <png> <ids>: renders a prop as the world builds it + tris/draws (roam not needed). tRides.js: env TAB=boat for water sets.
- Fresh container setup: parts library unzip to ld/lib, pip scipy pyfqmr, `tools/build.sh dev --local`, http.server :8766, `node tools/ld/ld_dump.js ... ld/ours.json`.

## Next (my lane)
Page size is the limit now (3.64 MB). Prefer small sets; consider moving LD data into a separate fetched file only with the coordinator's OK (deploy.sh copies
overdrive.html + km.js + tune.json + music only). Roam still does not load headless here (garage shots only).
