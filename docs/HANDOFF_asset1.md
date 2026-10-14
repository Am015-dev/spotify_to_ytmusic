# asset-1 handoff (2026-10-14): LEGO-part world assets (trees, bushes, street props)

## What is live on alex/od-int2 (ON by default; `?asset=0` or localStorage `od_asset=0` = old assets)
- Page: only `src/98as_assets.js` (~0.8 KB stub) + 3 checklist items `as1/parts|mix|lod` in `src/99c_checklist.js`.
- Code + data: `src/assets/as/code.js` (recipes, builder, LOD manager, variant picker, tests) + `src/assets/as/parts.js` (generated part meshes).
  `tools/as/pack.sh <out>` packs both into `<out>/models/as.js` (build.sh calls it after mkmodels; deploy copies `models/`). The stub loads it and
  `eval`s it in the page module scope (it wraps `buildHubProps lzPropsG propRevive hubCullStep`; applies late if it arrives after the city).
- Parts: `python3 tools/as/mkparts.py` reads the official LDraw library (`ld/lib/ldraw`, git-ignored: `curl -o c.zip https://library.ldraw.org/library/updates/complete.zip`),
  drops stud primitives (re-added as 5-side cylinders on uncovered top studs) + underside tubes, decimates (pip `pyfqmr`) to near/mid budgets. Part names = LDraw headers.
- Recipes `AS_R` (LDU, y up, part origin = its top face): `B.p B.stack B.ring B.dress` (dress = parts on free studs, e.g. blossoms, oranges).
  Trees fra: oak linden chestnut oakAut maple birch plane fir; ath: stonepine aleppo olive cypress palm orange plane; bushes bush bushFl oleander.
  Props (`p_*`, near-only ≤40 m, far = existing mesh, scale fitted to the old prop): bench bin hydrant post planter stall parasol table fence.
- LOD: full+studs ≤40 m, mid ≤150 m (2 global InstancedMeshes per variant in group `ASSET.grp`, NOT under HUB.grp: hubCull snapshots HUB.grp
  children and culled them), far = per-tile mesh with a 6-side lathe blob per class, scaled/tinted per instance (`AS_farM`). Far instance of a
  near/mid prop is zero-scaled; smash/revive still work.
- Variety: `AS_assign` greedy + `AS_fix` local search (60 m weighted); metric `__as.mix()`: p95 share of the most common variant in a 30 m disc.

## Tests (all PASS fra + ath, 2026-10-14)
`node tools/hot.js go as1/parts|mix|lod` (fra) / `eval "__as.go('lod')" --city ath`. fra: 19 types 8-37 parts; mix p95 28 %; lod 0 wrong, +19-20 draws,
71-124k tris at the densest spot, refresh 0.2-0.5 ms. ath: p95 30 % (borderline), +13 draws. GPU frame time NOT measured (software GL): needs a phone check.
A/B: `__as.ab(1)` old / `__as.ab(0)` LEGO. Shots: docs/shots/asset/GRID_a1.jpg (trees), GRID_props.jpg + props_4.jpg (props, old left of each pair).

## Known / next
- hot boot sometimes fails with `Failed to resolve module specifier "three"` (also before asset-1 existed): just reboot.
- Athens mix p95 is exactly 30 %: add an 8th Athens tree (e.g. carob or almond) if it drifts over.
- Next ideas: hedge walls (plates + 2417 leaves), Athens periptero kiosk (98la has its own kiosks), bus stop `stop`, lamp (LDS 2039 lathe already).
- Lazy forests (Stadtwald/Taunus) get variants via the lzPropsG wrapper; far tint for lazy props set when they build.
