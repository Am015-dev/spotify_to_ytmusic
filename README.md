# Mainhattan Overdrive — dev kit

Single-file three.js LEGO-2K-Drive-style racer. Cities: Frankfurt (real streets) and Athens (real OSM streets, 4 district maps A–D).
`base.html` is the LIVE build. You never edit it directly: you write small Python patch scripts that transform it.

## Setup (once per session)
```
./setup.sh        # installs three@0.164.1 locally, starts http server :8766 on this folder, builds the pages
```
Pages: `http://127.0.0.1:8766/local.html` (game), `local_dbg.html` (adds `window.__dbg` = scene, renderer, composer, THREE…).
Test/debug API: `window.__mho` (state, enterRoam, roamSim(n) = n×1/60 s sim steps, RO = roam car, K = keys, warp, rsnap, qv.path, gnd,
cid, athd, toggleMap, startRace, sim, pl, setOpt, homeHide, chapter, flagSet …) and `window.__m1` (Chapter-1 story system, see m1.js).

## Patch workflow
- Write `p<TAG>1.py`, `p<TAG>2.py`… each: `exec(open('P.py').read())`, then `R(old, new, n)` (exact-count string replace; aborts on mismatch), then `save()`.
- `save()` writes overdrive.html, local.html, local_dbg.html, chk.mjs.  Rebuild from scratch: `./reapply.sh p<TAG>1.py p<TAG>2.py …` → must print `REAPPLY_OK`.
- Prefer a **self-contained module** file (like `m1.js`) inserted with ONE anchor, e.g. `R('window.__mho={', open('mymod.js').read()+'\nwindow.__mho={')`,
  and extend existing functions by **wrapping** them (`const _f=f; f=(...a)=>{…_f(...a)…}` where they are `let`/function) instead of editing many lines.
- Prefix all new globals with your tag (e.g. `BF_`, `M2_`, `ATC_`, `LK_`, `PF_`). List EVERY anchor you replace in `ANCHORS.md`.
  Several sessions patch the same base in parallel and their patches are merged later — few, unique, stable anchors = easy merge.

## Speed rules (the box is slow: software WebGL)
- Rendering is the bottleneck (seconds per frame); game logic is fast (60 sim steps ≈ 7 ms). In tests use `fast.js`:
  `const F=require('./fast.js'); await F.on(p)` skips drawing; `await F.shot(p,'x.png')` draws once for a screenshot. Advance time with `__mho.roamSim(n)` / `__mho.sim(n)`.
- Never `pkill -f` broadly. Use long timeouts and `waitForFunction`. Keep iterations short; don't write 1-hour test suites.

## Quality gate (mandatory before you finish)
```
node smoke.js .     # boot, Frankfurt + Athens A/B drives (no hop/stuck), race, phone portrait+landscape layout, zero console errors
```
Must print `SMOKE PASS`. It also writes `smoke/sheet.png` (contact sheet) — look at it: the game must look good, nothing broken on screen.
Also write and run your own focused test (`t<TAG>.js`) for your feature, through real input where it matters (keys / touch).

## Constraints
- Keep `const ALL_OPEN=true;`, the "Made with ❤ by Alex" credits, touch defaults (buttons, gas pedal in city), English UI text, existing saves working.
- Page must stay ≤ 3.6 MB. Must stay smooth on an iPhone 16: don't add unbounded draw calls (use instancing/merging, LOD, distance culling).
- Never self-score fun or beauty; report what tests prove.

## Deliver
Commit ONLY: your patch scripts, module files, test files, `ANCHORS.md`, `REPORT.md` (short: what changed, patch order, test results with counts, known gaps),
and `smoke/sheet.png` + a few key screenshots (jpg). Push to the branch you were given. Do not commit base.html changes or generated pages.

Docs: `docs/fun_redesign.md` (story/activity design: chapters, characters, activities, milestones), `docs/m1_ANCHORS.md` (functions m1.js wraps),
`docs/athens_anchors.txt` (Athens rebuild anchors).
