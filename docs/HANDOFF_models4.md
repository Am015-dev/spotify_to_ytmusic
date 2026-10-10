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

## Update 17:50 UTC
- LIVE: v90e (city-1 traffic, built from 32c4ea53; Big Rig out of fra traffic). v90f on branch head: size-1 (deduped: LD_SCRE in 98ld_import.js = one SC-vs-minifig rule for rides + traffic; RSZ.mini covers every t_v City/Town ride),
  land-1 (98ld_l_land.js after 98ld_w.js: trees/lamps/fences/crates), 9 Town rides, facing fix 604/606/620/622, 4956 House. tPlay fra PASS. WAITING: size-1 (session_01NeJvmdn2aCpPX3zP2ofgLc) Snowplow lane shot + dark-object answer.
- Queued v90g: build-8 6521, 6527, 6530 (alex/od-mdl-veh). garage-18 (session_019vNFjqrqunwBDfw4daimsX, alex/od-garage18) garage bugs: merge when it reports. rescue-1 session_01PjYpc3jdr9iB9myHSwGVAs (alex/od-rescue).
- ALEX RULE: never drop/skip finished work -> fix or hand to rescue-1.
- Test tricks: tools/tPlayLD.tmp.js (git-ignored copy of tPlay) logs LDCHK (props, __ld.wroad). A ride equipped in roam cannot be forced from tPlay (story keeps Hot Rod).
  Garage card shots: tap the card IMG (touchscreen) = equip, wait 12 s; thumbnails pump serially (~1.5 s each in swiftshader).

## Follow-up bugs (queue)
- Athens start off the road (one tPlay run, v90f build): spawned in a park, camera inside a tree, target "Flights → Frankfurt", player measured 5.82×8.6 m; Athens walls 11.29/min that run. Not reproduced in 3 later runs. Shot docs/shots/v90f/ath_badrun_park_start.jpg. Cause unknown.
- 604/606/620/622 Town cars: no steering wheel in the LDraw files -> ×1.6 but empty seat (no driver).
- Garage floor dark patch on some rides (1572/6668/6526/6669/621): garage render bug, owner garage-18.

## Update 18:50 UTC (build-7 hands off)
- LIVE: v90f. DEPLOY sent for v90g = fb4fc431 out/v90g (reviewer PASS). Next release: v90h (check live's changelog first; other lanes also take versions).
- Queued for v90h: veh-2 (session_017JBQniskVjutGH7QYYWjis, alex/od-mdl-veh): 6525 Blaze Commander a88fc89, 6524 Blizzard Blazer 6a869df, 6523 Red Cross Car 212c404, 6509 Red Devil Racer 9804662
  (add their 98ld_v_*.js lines to src/MODELS if not on the branch). land-2 (session_01Uq1zhXLZyqmHQd2xQRNNUb) is fixing: race palms on the asphalt + floating orange slab.
- Other open follow-ups: checklist pin covers the mission objective line on phone (HUD lane, coordinator routes); Athens park-start one-off; 604/606/620/622 no driver; garage floor dark patch (garage-18).
- Sessions: coordinator session_017iH3DB4VyxwKSdMwsco4Ut, reviewer session_01Y6FYerWwxv43FuKUcaUT4v, rescue-1 session_01PjYpc3jdr9iB9myHSwGVAs (done, 22 models),
  build-6 session_01NhPhe9KMC86jAFXKzCXLmg (world), land-1 session_01F1oHeA7LV2cMbPpXRMGsXm, garage-18 session_019vNFjqrqunwBDfw4daimsX. build-8, size-1, city-1 stood down.
- Test notes: run the http server detached (setsid nohup python3 -m http.server 8766) — it died twice. tPlay copy with LDCHK/RIG2 hooks: tools/tPlayLD.tmp.js (git-ignored;
  recreate from tools/tPlay.js: log __ld.w.on, __ld.wroad(), __ct.wide()). Equip a ride before story: tools/ld/tRides.js SET=<id> (size-1's tip). Geoms growth ~50/min fra 2-min is pre-existing (v90e 54).
