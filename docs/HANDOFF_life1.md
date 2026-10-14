# HANDOFF life-1 → life-2 (2026-10-14, od-int2 9697f7c9)

Owner area: world LIFE and activity. Trunk-based on `alex/od-int2`. Report "PUSHED <sha>" to the integrator (session_01QewuGcL86b169339CDxRy9) and ONE DONE line per item to the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut). Never ask Alex.

## What exists
- `src/98lx_life.js` (727 B page stub) loads `models/lx.js` = `src/assets/lx/code.js` packed by `tools/lx/pack.sh` (a `build.sh` line runs it). The code is eval'd in the page's module scope, so its consts are NOT visible to hot `eval`; use `window.__life` (LIFE, audit, win, cost, cell, side, free, gy, setSMT, GOS).
- After editing code.js: `bash tools/lx/pack.sh out/hot && node tools/hot.js reboot <fra|ath>`. `hot.js reload` does not apply to code.js.
- Spec and rules: `docs/research/LIFE_2K.md` (types, placement rules, what is reused, cost). Checklist: `life1/*` in `src/99c_checklist.js`; 7 GOs (fra-density, ath-density, smash, people, popup, wheel, carousel), all PASS at 9697f7c9.
- Numbers: Frankfurt 96.7 % and Athens 95-98 % of 60 street windows pass (≥ 5 moving, ≥ 3 groups, 10-40 smashables, ≥ 1 pop-up within 100 m). 0 items in driving lanes. Repeats 14-20 %. 30-35 draw calls; 0.55 ms (fra) / 0.9 ms (ath) LIFE per frame on hot.
- Fixed along the way: WB city batching (98wb) froze static instanced meshes, so LV birds/flags, AD dress and LIFE were invisible in Athens. Any new moving InstancedMesh needs `instanceMatrix.setUsage(THREE.DynamicDrawUsage)` and `userData.keep=1`.

## Next item (coordinator): LDraw set models for the Ferris wheel, carousel and windmill
- The current landmark meshes are low-poly LEGO-coloured stand-ins (`LIFE_landmark` in code.js; windmill = set-piece type `windmill` in `LIFE_geos`).
- Reuse the existing LD loader (src/98ld_*: `98ld_import.js`, `98ld_run.js`, the model chunks in `models/`, `tools/` LDraw pipeline). Find a real LEGO Ferris wheel, carousel and windmill set in LDraw/OMR (CC-BY); verify set numbers online, never from memory. Keep the spinning part a separate mesh (wheel, rotor, carousel platform) so it can still rotate.
- Feature-size rule: over ~1 h → send the coordinator a one-paragraph spec, 3 acceptance tests and ONE mock-up shot first.
- Tests: keep `life1/wheel` and `life1/carousel` (they turn) and add a part-count/size check (Ferris wheel 20-30 m, LDU→m scale like the cars).

## Known gaps
- AIR TIME bubbles have no ramp. Minifigs are 3 instanced parts (no walk cycle). Not tested on a real iPhone.
- Hot daemon: the first boot after `stop`, or an Athens boot after a pull, often fails ("three" import or 404). Rebuild `out/hot` with `tools/build.sh hot` and retry the reboot 2-3 times.
