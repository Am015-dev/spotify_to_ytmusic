# art-3 handoff (liveliness / variety lane), 2026-10-14

Branch: trunk on `alex/od-int2`. My commits: 46e9260, bb6fcd5 (lite cover), 3c6ff26 (bv1 tests), ad7a00a (building variety), 5f08d65 (street life), 1436c5a (fill off roads), plus the clean-GO fix.

## What exists
- **Lite ground cover** (`src/98lf_lively_fill.js`, `?lfl=0` turns it off):
  - Unthemed open grass is scanned on a 20 m grid (step 3b). It gets tufts, a dirt or dark-grass patch, and sometimes a flower bed.
  - Kerb rows: 4 tufts or dirt pieces 2-10 m off every street (in the verge loop).
  - `LF_liteOk` uses road and river margins only, with no collider margin.
- **Fill off the roads:** `LF_offRoad(x,z,m)` is checked on every `di()` and `P()`.
  - Tests: `lf1/road-fra` and `lf1/road-ath`, via `LF_roadCheck` / `LF_goRoad`. The pass line is 0 pieces on asphalt within 900 m.
- **BV** (`src/98bv_build_var.js`, in ORDER after 98lf; `?bv=0` turns everything off, `?bvl=0` turns off only the street life):
  - `BV_add` records every building as `{x, z, key = facade + '/' + roof, fac, ry, w, d, h, fr}`.
    - Frankfurt records them in `putK` (60_city_build4).
    - Athens records them in `CV_put` (90_fixes_cv_ju).
  - `BV_pick` returns the option used least within 100 m (45 m weighted ×3).
    - Athens `CV_put` uses it to choose `U.fv` (the facade) and `U.rf` (the roof).
    - Frankfurt `row()` and the frontage use it to choose the Kenney model.
  - Athens facade textures are made in `hubFacadeTex` / `hubWinEm` (53_terrain_roads): `poly2` ribbon, `poly3` shutters, `poly4` stone tile, `neo2` arched.
    - `plaka2` and `plaka3` reuse the `neo2` and `poly3` materials (TY/TI/MT in 60_city_build3).
  - Roofs (`BV_roof`):
    - poly: flat, garden, tank (solar heaters), pent (the penthouse, built in CE_dec).
    - neo: corn or ped.
    - plaka: tile, tileB or terr.
    - villa: tile, tileB or flat.
  - `BV_life` places one storefront piece per street-facing building; Frankfurt buildings ≥ 18 m wide get 2 slots.
    - Kinds: shop, café, kiosk, billboard, mural.
    - Colours come from the district palette `BV_PAL` via `BV_sty`.
    - Café and kiosk get a small `hubAddB` collider flush with the wall.
    - Drawn as instanced unit boxes, one mesh per 1.6 km cell.
- **Tests** (state asserts, < 60 s per city):
  - `tools/tBV.js <url> <out> [tag] [fra|ath]` runs `bv1/fra` and `bv1/ath`. The pass line is: same look within 100 m ≤ 20%, ≥ 3 facades in ≥ 95% of blocks, and street life ≥ 10 pieces / 4 kinds within 150 m.
  - `tools/tLiveGo.js` runs lf1, now including `road-*`; `GM=1` dumps the green mask, and `tools/tGreenMask.py` paints it.
  - `tools/tLfWhy.js` prints a histogram of the first rule that rejects fill around a spot.
  - `tools/tPerfBV.js` compares BV on vs off (`Q='&bvl=0,'` to compare other flags).
  - `tools/tBVshots.js` takes one-pass close-ups of every street-life kind and makes a grid.

## Results (last runs)
- **bv1** PASS in both cities.
  - Athens: same look within 100 m went from 74% to 5.2% (city-wide 2.2%, 39 looks). Blocks with ≥ 3 facades went from 15% to 100%.
  - Frankfurt: from 16% to 1.6%.
  - Street life within 150 m: Frankfurt 10, Athens 12.
- **lf1** PASS: fra-1, fra-2, fra-3, ath-1, ath-2, road-fra (0), road-ath (0).
- **lf1** FAIL, both caused by terr-1 and reported to them:
  - fra-4: 21% flat green, from the new horizon ridge outside the fill box.
  - mound: no hill, because LF mounds are off under TERR. The GO needs to target a TR hill.
- **Perf:** frame time is within noise (±20% under swiftshader). Athens has +123 mesh objects (+14%) before culling.

## Next
1. Street life is thin in Frankfurt: exactly 10 at the GO spot, and the line is 10. Options: a kiosk or billboard on the frontage gap plots, or more Frankfurt frontage.
2. District themes beyond the palettes: Sachsenhausen apple-wine taverns (green wreath, benches), Bahnhof neon, Osthafen murals everywhere.
3. Athens rooftop billboards on poly (the classic Athens look), and Athens shops recorded in BV.L (the CE_dec shops are not counted yet).

## Gotchas
- Upstream 35d0c14 untracked `node_modules/three`. To restore it locally: `git checkout 35d0c14~1 -- node_modules/three && git rm -r -q --cached node_modules/three`.
- Boots sometimes time out under swiftshader. Use a fresh browser per city; the tools now wait up to 200 s.
- The integrator session (session_01PVysqjdGofMMkTjCtSnKkr) was inactive at the last push.

## Queue for the next art-3 (from the coordinator, 2026-10-14; not started)
- Report DONE lines (one line, done items only) to the coordinator, session_017iH3DB4VyxwKSdMwsco4Ut. Send "PUSHED <commit> TAG=" to **int-4** (session_01QewuGcL86b169339CDxRy9).
- Use hot reload for every edit: `node tools/hot.js reload src/<mod>.js` (0.3 s), then `go <id>` (see docs/HOT.md). Use it instead of rebuilds.
1. **rev-1 sweep** (src/99rv_review.js, GO tests `rv14/*`):
   - A flat plain-brown box and a black square on the road at the Athens Festival Delivery start, and a similar slab at the Frankfurt Ebbelwoi start (shots in qa_rv1/ath/12_quest9_start_L).
   - Pure-black untextured facades (qa_rv1 fra/54, fra/15, ath/06). Check whether a BV facade type is missing its material: `MT[t]` falls back to the base kind when `BM[t]` is missing; check athIM / BW on the new keys.
2. **Patches cut the on-foot figure in half** (Alex: `git show origin/alex/overdrive-devkit:shots/alex_b25_foot_in_sand.png`).
   - The LF patch, bed, pond and mound decor are flat plates at `gy(centre)+0.04`; on TERR slopes they float or sink.
   - Recommended fix: flush decals that follow `groundY` per vertex (≤ 0.02 m), e.g. bake the patch vertices at build time, or `polygonOffset` plus a vertex-shader height. Then tell foot-2.
3. **test-1 unit suite:** 7 taxi/garage/landmark placements are OFF ROAD (tools/unit/known.json). Move them onto the road or kerb; `node tools/unit/run.js` (1.6 s) must show 0.
4. **Reuse first** (Alex: "stop reinventing"): for more building variety, use the existing building kits and the LDraw pipeline (98ld_*, 98ct_city_lego CTB_*, models.js) and the LDraw OMR modular-building models (CC-BY) before new geometry. Name what you reuse.
5. **fra-4 slope** (−1680,−1680): terr-1 says this ground is fill-eligible and mine. It is the new ridge outside the fill box (HX0..HX1). Extend the lite cover to the ridge band, or move the spot. groundY is final (TERR on by default).
6. **life-1** (src/98lx_life.js) places kerb pieces at W/2+1.4..6.5 m and skips anything roamHit reports. BV café and kiosk colliders are flush with the wall, so there is no conflict; tell life-1 if storefronts ever reserve kerb space.
7. **gfx-1** won't touch hubFacadeTex or HUB.BM. Its pass changes roughness and envMap on MeshStandard and chains onBeforeCompile. To keep a material out of it, add the material to GFX.mats.
