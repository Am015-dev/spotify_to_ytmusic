# HANDOFF test-1 (2026-10-14)
Owns: tools/unit (node, 2 s, 4.4k assertions, known.json ratchet, --selftest 18 seeds) and tools/matrix (warm-page player-experience matrix).
- Unit: `node tools/unit/run.js` (needs `npm i three@0.164.1 --no-save`; groups skip with a hint otherwise). Add checks as lint_*/logic_*.js; seeds in seeds.js + lib.js JSCODE mutations.
- Matrix: `node tools/matrix/run.js --quick` (192 s) / `--full` (313 s, 18.5k cases, 3 pages). Families: builder, roam, spot, foot, race, camfit, props, footsurf, mission, garage, respawn + qa-1 invariants (`qa-inv:*`). Needs the hot server (auto-started, HOT_CITIES=none). Page-side checks: tools/matrix/page.js (window.MX). Tried and rejected: 5 pages split by family (slower on 4 cores).
- Known harness limits: desktop is emulated in a touch context (no touch-absence checks); builder runs last (it leaves #touch hidden); hot server 404s models/qa|lx|as|xf.js (harmless).
- Open findings (FAIL groups, last --full): bx-visual-facing (BX_car front axis: fix inner.rotation.y += PI), roam-tyre-gap, roam-start-inside-wall, roam-camera-behind (Athens), roam-heading-vs-road, props/fill in roads, foot-no-walk-progress, race-hud-overlap-pos-spd (portrait), qa-inv:camera_blocked.
- Not done: junction/crosswalk polygon + kerb flush checks, pose matrix (benches/HI/TALK/swim), other vehicle-switch paths (TAKE/ENTER/mission vehicle), garage-exit from the real garage marker.
- Monkey bot (tools/qa): fra `--min 5` per build, Athens hourly; heatmaps docs/shots/qa/.
