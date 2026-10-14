# split-1 (2026-10-14): lazy code chunks, shrink the main page (cap 3.6 MB, target ≤ 2.5 MB)

## Pattern (use this for every module you want out of the page)
1. Add the module's file name to `src/LAZY` (one per line; keep it in `src/ORDER` too: dev tools (hot.js, patch_to_src, unit tests, modmap) keep seeing it, only the SPLIT BUILD leaves it out).
   Exports: `81_story.js:a,b` = top-level names other (eager) code uses. Declare `let a,b;` in an eager module and add `XC.apply['81_story']=o=>({a,b}=o)` next to it (see src/10z_lazy.js). A module nobody references by name (an IIFE like 99c_checklist.js) needs neither.
2. `tools/build.sh <ver>` → `out/<ver>/xc/<name>.js` (= `window.__XC[name]="<module source>"`, tools/lazy/pack.js) and a hash map filled into the page (`XCV` in src/10z_lazy.js). deploy.sh and verify_live.sh copy/compare `xc/`.
3. The page evals the source in module scope (same trick as models/as.js) after drivable: `XC_go()` (idle: state left 'loading', loader off, +1.5 s). In `?test=` mode `__tq.drv` = drivable, `__tq.ready` = drivable AND all chunks loaded (so `__chk` etc. exist for every test tool); tLoad.js waits for `drv`.
4. Eager code must not touch a chunk's names at boot or before `XC.done`; user-triggered entries call `XC_need(name).then(...)`. `node tools/lazy/scan.js <module.js>` lists the module's top-level names and every reference to them in other modules (TOP = runs at boot = trouble, fn = inside a function).
5. Chunk code runs in strict direct-eval: its own top-level const/function stay local to the eval (invisible to the page) unless exported as above.

## Slices
- 1 `99c_checklist.js` (101 KB): done, page 3.46 → 3.37 MB. Pin/chip appear ~1.5 s after the menu/roam is up.
