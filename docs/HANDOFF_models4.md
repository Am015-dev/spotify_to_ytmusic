# models-4 handoff (build-7, LEGO-model INTEGRATOR, 2026-10-10). Branch alex/od-models.
Coordinator session_017iH3DB4VyxwKSdMwsco4Ut, reviewer session_01Y6FYerWwxv43FuKUcaUT4v.
Converters: build-4 (veh, session_015sYS5pLMo4GwJxwswZ3vCb) + build-8 (veh, session_01EyTkWHVhqPJ5PdrDtAmH7s) -> alex/od-mdl-veh;
build-6 (world, session_01NhPhe9KMC86jAFXKzCXLmg) -> alex/od-mdl-world; land-1 (landscape) -> alex/od-mdl-land; city-1 (session_01U8NNDJZk5781ubHgiZXpWG, alex/od-city) uses LD_need.

## State
- LIVE: v90a (lazy models), v90b (garage-17). READY/in review: v90c 863b3b3c (16 City rides).
- Queued for v90d: build-8 604 Town Roadster (e84a20c5, alex/od-mdl-veh).
- Version numbers: other lanes (garage-17) also ship; ALWAYS ask/check live's changelog before naming the batch.

## Lazy models (v90a): how it works
- tools/ld/mkmodels.py (run by build.sh): src/MODELS modules -> out/<ver>/models.js (index: presets + placements + __LDX chunk table, ~50 KB)
  + out/<ver>/models/<modelId>.js (one chunk per LD model with all meshes it uses; ?hash cache-bust).
- src/98ld_run.js: LD_need(ids)->Promise, LD_br triggers loads, wrappers on GAR_select / G9C_equip / G9C_render / GB_enter / FB_begin wait for models.
  LDW_build + LD_propBuild await LD_need. Boot: models.js document.write()s the chunks the saved garage needs (mho_gar sel/off/boat, br[sel], fb, mho_build).
- deploy.sh copies out/<ver>/models/ (refuses without it); verify_live.sh compares it. Beta artifact needs models/*.js in files.
- Module layout must stay: lines 3/4 = Object.assign(LD_MESH/LD_MODELS,{json}); then preset / LDW_P.push.
- 98ld_w.js: LDW_spot gets the WHOLE scaled model box (v90a kerb fix). Test hook __ld.wroad(): prop footprint samples on/near road (must be 0/0).

## Loop
fetch od-mdl-veh/world/land -> merge -> every new src/98ld_*.js into src/MODELS (build fails otherwise) -> drop micro/tiny-scale sets ->
OD_CHANGELOG entry (2-4 lines) + 1 checklist item per model in src/99c_checklist.js -> merge latest live src branch -> tools/build.sh <ver>
-> cmp live index.html with the base out/<prev> -> test -> git add -f out/<ver> -> push -> REVIEW to reviewer + READY to coordinator at once.
Shots: coordinator wants each new ride EQUIPPED on the garage stage (tap card [data-gc=id], wait for build-up), not just the card thumbnail.
Test scripts (scratch, recreate): garage open + __g9c.render(id) for each id on out/<ver>/index.html (deploy page; ?fast=1 local_dbg does not pump thumbnails);
roam props: copy tools/tPlay.js, after "in roam" log __ld.w.on / __ld.wroad(). Headless roam needs tPlay's fake-rAF INIT. Athens 0.5-min tPlay wall/stuck fails on live too.
