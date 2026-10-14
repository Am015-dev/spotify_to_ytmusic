# split-1 (2026-10-14): lazy code chunks, shrink the main page (cap 3.6 MB, target ≤ 2.5 MB)

## Pattern (use this for every module you want out of the page)
1. Add the module's file name to `src/LAZY` (one per line; keep it in `src/ORDER` too: dev tools (hot.js, patch_to_src, unit tests, modmap) keep seeing it, only the SPLIT BUILD leaves it out).
   Exports: `81_story.js:a,b` = top-level names other (eager) code uses. Declare `let a,b;` in an eager module and add `XC.apply['81_story']=o=>({a,b}=o)` next to it (see src/10z_lazy.js). A module nobody references by name (an IIFE like 99c_checklist.js) needs neither.
2. `tools/build.sh <ver>` → `out/<ver>/xc/<name>.js` (= `window.__XC[name]="<module source>"`, tools/lazy/pack.js) and a hash map filled into the page (`XCV` in src/10z_lazy.js). deploy.sh and verify_live.sh copy/compare `xc/`.
3. The page evals the source in module scope (same trick as models/as.js) after drivable: `XC_go()` (idle: state left 'loading', loader off, +1.5 s). In `?test=` mode `__tq.drv` = drivable, `__tq.ready` = drivable AND all chunks loaded (so `__chk` etc. exist for every test tool); tLoad.js waits for `drv`.
4. Eager code must not touch a chunk's names at boot or before `XC.done`; user-triggered entries call `XC_need(name).then(...)`. `node tools/lazy/scan.js <module.js>` lists the module's top-level names and every reference to them in other modules (TOP = runs at boot = trouble, fn = inside a function).
5. Chunk code runs in strict direct-eval: its own top-level const/function stay local to the eval (invisible to the page) unless exported as above.

## Slices (page = out/<ver>/overdrive.html)
- 1 `99c_checklist.js` (101 KB) -> xc/: done 205b899e. Page 3.46 -> 3.37 MB. FULL suite = baseline (fra 221/234, same 13 spawn-only bx items; ath 89/89), unit 0 FAIL, smoke green.
- 3 per-city data -> xc/: done 8516f90e, 78d740a8. `10c_qtc_blob.js` (Athens quadtree bits, 206 KB), `52f_terr_fra.js` / `52a_terr_ath.js` (TR_DATA per city). Started in `10z_lazy.js` (CID known), awaited by a top-level `await` in `52_terrain_data.js` before terrain reads them. Page 3.37 -> 3.05 MB (3057645 B). Unit 0 FAIL, smoke fra 12/12 ath 5/5.
- 2 story/quest text, 4 audio: NOT started (see below).

## OPEN: Athens drivable is ~3 s slower since slice 3 (needs an owner)
Fast 4G, tools/tLoad.js ath: base 27.3-30.0 s, slice-3 builds 29.9-33.8 s (fra 19.9 s, not slower). Stage times: the extra time is all in "Planting trees & lamps" -> "Starting traffic" (base 7.4 s, split 10.5 s); the early stages are the same or faster. Ruled out: the Athens ground cache (QTC) works (ok, pos == n); early download of the chunks (78d740a8) did not help. Suspects, untested: the top-level `await` turns the whole 3 MB module into an async module body; try loading the three chunks with a classic blocking `<script>` before the module instead (city from the same localStorage key as CID) or a promise-free path. CONFIRMED by 5 sequential runs (same machine): base 27.5 s, slice-1 build 27.6 / 27.6 s, slice-3 build 30.7 / 29.9 s -> slice 1 is free, slice 3 costs ~2.5-3 s on Athens only. `__xc.ev('QTC.ok')` evaluates in module scope.

## Why 2 and 4 were not done (findings, `node tools/lazy/scan.js <module.js>`)
- 80_story_m1 / 81_story_ath_m2_m3 / 41_career_quests: other modules assign their names at module top level (M1_next, M1_csNext, M1_av in 94_garage_ui, M1_goon in 96, qvFail/qvEnter/qvTick in 81, qvMiniQ in 98c, addXP in 98v...). A whole-module chunk would overwrite those wrappers on apply. 41 defines RO/prof/roamSave used by every module. Only the story TEXT/data (M1_STORY, M1_RADIO, M3_STORY, QUESTS dialog strings) can move: split them out as `const X={...}` data modules first, export with `name:X` in src/LAZY, stub `let X;` + `XC.apply[...]`, and gate the story UI on XC_need.
- 85_audio_feel_sp_otg (108 KB): 172 names used all over (FL_* in 53/60/70/71, AU_*, OTG_*, addXP assigned in 98v). Same: split data from wrappers; scan first.
- 98ld0/98ld3 data are not in the page (built into models.js), nothing to do.
- Other big page items: 60_city_build 206 KB, 00_page.html 116 KB, 02_data_json 111 KB (rf-data/ath-data per city, could be like slice 3), 50_kenney_data 79 KB (KM_TEX base64, data only).

## Notes
- hot.js / patch_to_src / unit tests keep working: lazy modules stay in ORDER (inline in raw src/ pages, XCV empty -> XC_need resolves at once). Unit lib.PAGE() excludes src/LAZY.
- tLoad.js waits for `__tq.drv`; `__tq.ready` also waits for XC.done. `?test=` GOs run after the chunks.
