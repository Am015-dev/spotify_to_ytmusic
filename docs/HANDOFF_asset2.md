# asset-2 handoff (2026-10-14): LEGO street furniture, 8th Athens tree, LEGO tufts, far-tree impostors

All in `src/assets/as/code.js` (packed to models/as.js by tools/as/pack.sh; hot: `tools/as/pack.sh out/hot && node tools/hot.js reboot fra`), plus `src/98ro_open.js` (race scenery).

## Done (all on alex/od-int2)
- Street furniture from real LDraw parts, ≤40 m (hedge ≤150 m), far = old mesh: `p_lamp` (2039 lamppost, 3062b bulb, 4740 shade), `p_tlight`
  (4070 headlight bricks + red/yellow/green 6141), `p_sign` (30260 octagon on 3957a antenna, white 3069b bar), `p_stop` (bus shelter: 4215b/30413
  panels, 3035 roof, 30261 sign), `p_kiosk` (Athens `post` = periptero; AS_PN maps type → recipe), `p_hedge` (AS_ALT: 45% of fence runs per 40 m cell).
- 20 new parts in parts.js. `tools/as/mkparts.py` is incremental now (keeps existing parts byte for byte; `--all` rebuilds). LDraw lib: ld/lib (git-ignored).
- Athens 8th tree `almond` (blossom): mix p95 30% → 28%.
- Fill grass tufts (98lf, 216k in fra): two cones → a 12-tri low-poly copy of 6255 Plant 3 Large Leaves (`AS_tuftGeo`), also in the open races.
- Far trees/bushes (>150 m): LEGO impostors. Each variant's mid build is rendered from 22° above into a 4x4 atlas (`AS_impAtlas`), drawn as crossed
  quads (4 tris vs ~40). The cell index is in instanceColor.r (cell/255). Open races (98ro) use `__as.impMesh` for trees, bushes and cypresses.
- Boot fix: in src/00_page.html the importmap now comes before the modulepreload links (this caused the flaky "Failed to resolve module specifier three").
  hot.js boot timeout is 240 s.
- AS_spot cell keys fixed (negative coords decoded wrongly).

## Tests (PASS fra + ath)
as1/parts|mix|lod, as2/street (≥3 furniture kinds LEGO near the car, 0 wrong LOD), as2/far (≥99% of trees use the impostor, every variant has a cell).
Perf from a wide view 22 m up: fra +19 draws, tris −3%; ath +14 draws, tris +3%. GPU time not measured (software GL).
Shots: docs/shots/asset2/{fra,ath}_before_after.jpg. Hook: `__as.lineup(['p_lamp',..], d, old)` builds a row + a shot camera (d<0 = behind the car).

## Open / next
- Impostors are lit by a fixed sun, not the time of day; at dusk the far trees stay bright. Option: tint the impostor material by the scene's light level.
- The builder2 (98b2) tracks still use cone trees (dev-2 owns them).
- Athens market stalls (asset-1 p_stall) read as red/white stripes from above; maybe make the roof a solid colour.
