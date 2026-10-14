# terr-3 handoff (2026-10-14). Trunk alex/od-int2 (commits ca7fbcdd, e87e5d02, 1679f402, 1ba3ce62; all "terrain:" prefix)

## Done
1. **Slipway cliffs** (ca7fbcdd). Root cause: TR_grade SKIPPED road samples within 25 m of the Main, so Mainkai / Schaumainkai took the
   feathered heights of the cross streets (+4.7 / +4.7 / +15.2 m at slipways 0/2/3; the quay walls were buried the same way).
   Now (src/53_terrain_roads.js) `TR_rivSkip` skips only samples IN the river or on a deck, `TR_rivPin` pins samples within 25 m of the water at
   `TR_QY`=0 (quay level). TR_grade got `o.pin(x,z)` (fixed nodes) and a clamp: non-fixed nodes are clamped into
   [max_f Y(f)-d, min_f Y(f)+d] (two extra Dijkstras from the fixed nodes only), so no grade step next to a pin. `?trq=0` = old behaviour.
   `slipBuild` (60_city_build.js): ramp top = `slipTop(s)` (ground 0.6 m inland), top face = drive surface `slipY` (was a .4 box centred on it: +0.2 m lip).
   Test GO `terr3/terrain-slip-fra` / `-ath` (TRN_slip in 98tr_terrain.js): top vs ground 0.6 m inland at 3 points across + roamTerr step across the
   top edge. fra 0.032 m PASS (old code: 0.81 / 2.54 / 5.93 m FAIL, checked with ?trq=0); ath: no slipways (no river) PASS.
   Frankfurt terrain 9/9 PASS after (Mühlberg relief 101.8 -> 104.4 m), xf1/water, land, slope PASS.
2. **terrain-flush-ath** (e87e5d02): the floater (1025,-1816) was the fountain at W2(820,-62) (60_city_build3.js): basin at the centre's ground on a
   1.1 m slope. Basin now on the lowest ground under its rim, water fills it. flush-ath 0 floating, base-ath PASS. Shot docs/shots/terrain/terr3_fountain_ath.jpg.
   `?trdbg=1` now stores the builder stack + bbox of each floater in TRN_FL.float (find the next one in seconds).
3. **Athens boot** (1679f402, 1ba3ce62). This box is ~1.7x slower than terr-2's: terr-2's commit d5f03ad = 57.4 s ath-boot GO here (30-35 s there).
   Now 36.3 s here (start of my session 49.0) => ~20-21 s on terr-2's box. All results bit-identical (checked by hash / swap counts):
   - AS_fix (src/assets/as/code.js, asset-2's tree variety): re-score a tree only when a variant changed in its 5x5 cells since its last scoring;
     numeric variant ids + one Float64Array counter; 4.7 s -> 1.6 s profiled. NOTE: code.js is packed into models/as.js — the hot page needs
     `tools/as/pack.sh out/hot` after editing it (build.sh does it).
   - BK caches (98bk_bake.js): Athens hub = ~23k 64 m cells, the 8000 cap cleared and re-baked 437k cells. Cap 30000 while the hub builds,
     trimmed to BK_MAX at hubEnter (+ the existing 5 s idle clear). BK_cand 3.6 -> 0.4 s.
   - DR_inSolid 64 m grid; TR_bldFix pass 2 only near lifted buildings; BV_near only the touched cells + BV_near2 (one scan for CV_put's two picks);
     slope tint 3 ground reads per vertex (was 5; one-sided difference, tint only).
   Remaining profile (self, profiled): TR_G 3.0 s (call volume via groundY: TRN_slopeCol, TR_bldFix, OC_props, OC_minG), TR_bldFix 2.1 + find 1.1
   (pass 1 still looks up every vertex), gndBuild 2.1, athRoadD 1.6, TR_grade 1.1.

## Open: item 4, hills from more streets (not started)
Lead: write the test first: from ~50 street spawns per city, eye 1.5 m above the road, 16 headings, march the ground raster 0.4-3 km out and
the building colliders (HUB.grid / roamHit heights) near; "hill visible" = some ground point's elevation angle > every building's on that ray and > 1.5 deg.
Pass line e.g. ">= 60 % of Frankfurt street spots see a hill in at least one direction". Then raise what blocks it (nearer ridge ring height,
TR_RK k, relief floor). Keep terrain GOs green; Mühlberg now 104.4 (margin better).

## Gotchas
- `node tools/hot.js stop` then an immediate start fails with "Target page ... closed": sleep 4 s between.
- Profiling: run the daemon with HOT_CITIES=gym so no city page competes; `CHILD=f CALLERS=g node tools/bootprof.js ath 25` (CALLERS gives the
  outermost frame's caller). Wall times vary ±3 s; compare function self times instead.
- The local branch alex/od-int2 here is stale (remote was force-pushed); I worked on local branch `terr3` tracking origin/alex/od-int2.
