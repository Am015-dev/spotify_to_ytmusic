# terr-5 handoff (2026-10-14). Trunk alex/od-int2, one commit "terrain: terr-5 green crowns, Taunus backdrop, strict skyline test"

Goal: Alex must SEE hills (terr-4 mounds read as "the street climbs"). All three terr-4 leads done, default ON.

## Flags (all default ON; `?tgt=0` / `?tau=0` / `?athx=1` = terr-4 look)
- NOTE: `?trg=0` already existed (= road grading OFF, src/53 TR_RG). Do not reuse `trg*` names; the first before-shots were wrong because of it.
- `?tgt=0` green crowns off, `?tgtm=<m>` crown threshold (mound share, default .5 = ≥35 m fra / ≥50 m ath of mound height).
- `?tau=0` no Frankfurt Taunus backdrop, `?taux=<k>` its height factor (default 2.2 → Feldberg 15° apparent).
- `?athx=<k>` Athens backdrop height factor (default 1.6; 1 = old height + old pale colours).

## Done
1. **Green crowns** (src/53 `TR_HA.M` mound mask, `TR_crown/TR_onCrown/TR_crownBlk/TR_crownTrees`): on a crown no buildings
   (fpOK + Frankfurt block type → 'park', Athens RR raster reserved like the hills), ground is grass per quadtree quad
   (gndBuild `o.qcls`, src/60_city_build.js; wrapper in 98tr), Athens crowns get ~10.5k grove trees (HUB.athTrees).
   fra 7781 → 6724 buildings, 63 park blocks on crowns; ath 75155 → 67354 colliders.
   LOOK (honest): from the street the crowns change little: the filler/street grading cuts the mounds down to 35-60 m, so a crown is a
   green terrace rather than a peak. They help the metric (view fra 71 → 81 %) more than the eye.
2. **Frankfurt Taunus backdrop** (98tr `TRN_fraRidge`, built lazily in `TRN_ridgeFit`, HUB.ridge like athRidge): real bearings from the
   Römer (Feldberg 310°, Altkönig 308°, Hohe Wurzel 277°, Winterstein 355°), x6.6 height, blue-green main ridge + green Vortaunus layer,
   brick-stepped tops. THIS is what makes hills visible in Frankfurt (shots: clear green ridge behind the city looking NW).
3. **Athens backdrop**: x1.6 height (`TRN_RX`, ring y-scale + `TRN_ridgeTop`) and recoloured slate blue (`TRN_athRecolor`): the old
   violet/beige was the same colour as the pale horizon, invisible in shots even where terr-4's test counted it.
4. **Strict test** GO `terr5/terrain-sky-fra/-ath` (`TRN_skyGo`, `TRN_view(…, {va:3,vh:40,mg:1})`): hill ≥3° and ≥40 m above the eye AND
   ≥1° clear above every building in front (terr-4 passed on a 0.01° sliver). Results: fra terr-4 7 % → **97 %** (need 80), ath 22 % → **63 %** (need 55).
   GO `terr5/terrain-crown-fra` (`TRN_crownGo`): 0 buildings on crowns, 161/164 crown ground samples hit a grass mesh (ray onto the gndBuild
   meshes, `userData.gk`), 63 park blocks. Pixel test on a shot: not done (LOOKed at the grids instead).

## Tests (hot pages + build out/terr5 via tChkGo, TAG=terr,v90n/sink,art1)
All terrain GOs PASS both cities: hills fra 99 / ath 75 %, sky 97 / 63, crown, flush, lyka 185.6, muehl 121.8, grade 11.4 / 9.7 %,
edge 0.05 / 0.09, tyre 0.023 / 0.025 m, ramp, base, slip, junc, fps; v90n/sink-rod/cab/truck tyres 0.03 m; art1/road-gap. 0 console errors.
- `v90m/ath-boot` FAILS (32.9 s > 30) but also FAILS on `?tgt=0` (32.3 s): this container, not terr-5. Athens hot boot ~28-33 s.
- `terr2/junc-fra` failed ONCE in the mixed TAG run ("raised strip 0.27 m" = a non-road mesh at sq (1920,0), not a crown; likely a spawned
  vehicle from the v90n/sink tests run before it in the same page); 3 reruns PASS, hot PASS. Watch it.
- Athens quadtree cache: no height change, cache still valid (junc-ath PASS, ath-boot 25/25 cells).

## Shots (docs/shots/terrain/)
terr5_taunus_fra_before_after.jpg (3 NW streets), terr5_crowns_fra_before_after.jpg (3 crown views), terr5_ath_before_after.jpg (2 spots).

## Next leads
- Crowns that read as peaks: stop grading filler streets through crown cores (drop or reroute fillers whose middle is on a crown), so the
  mound keeps its 70/100 m; or lift crowns after grading where no road is within 40 m.
- Athens: the strict sky metric is 63 %; avenue-end views show the mountains small. Possibly x2 and a nearer ring for the low quality.
- A shot-based pixel test (ridge colour band above the roofline in the GO view).

## Athens boot check (coordinator: beta.55 ath-boot 47 s vs 37 s), head cc9b8956, same box, back to back, 2 rounds (tChkGo v90m/ath-boot)
default 32.7 / 30.4 s · ?tgt=0 33.4 / 29.6 · ?athx=1&tau=0 30.1 / 29.5 · ?trh=0 39.9 / 37.4 (slower: the Athens quadtree cache is
fitted for the hills, so ?trh=0 fits every cell live). Green crowns and the backdrops add no measurable boot time; the 47 s is not terr-5.
If Athens boot regresses after a height change: regenerate the cache (see HANDOFF_terr4.md, tools/qtdump.js).
