# City variety: buildings, foliage, ground, props (lane city-var, 2026-10-16)

Alex: "the city looks repetitive and not good to the eye". Goal: LEGO 2K Drive liveliness, all instanced, no draw-call growth.
Lighting is out of scope (lane light-1 owns `src/98gx_gfx.js`).

## 1. Audit (measured, built page `out/cv*`, `?test=fra|ath&q=high`, 852×393, numbers from `__cvf.audit(150)` = checklist `cvf1/audit`)
"Looks" = distinct (prop kind + instance tint [+ height bucket]) among the trees/bushes within 150 m; "top" = share of the most common look.

| spot | foliage within 150 m | looks | top look | heights | prop types near / city | buildings in 400 m: variants / facades / same-variant-in-100 m | big ground materials | draw calls |
|---|---|---|---|---|---|---|---|---|
| Frankfurt start | 19 | 8 | 37 % | **1** | 19 / 38 | 18 / 15 / 10 % | 6 | 678 |
| Frankfurt busiest street (`bv1/fra`) | **13** | 6 | 23 % | **1** | 15 / 38 | 13 / 10 / 7 % | 6 | 289 |
| Frankfurt leafiest park (-1147, 2212) | 173 | 21 | 17 % | **1** | 17 / 38 | 4 / 4 / 25 % | 6 | 713 |
| Athens start | 123 | 26 | 10 % | **1** | 13 / 35 | 20 / **6** / 5 % | 6 | 539 |
| Athens busiest street (`bv1/ath`) | 54 | 22 | 11 % | **1** | 9 / 35 | 29 / 9 / 7 % | 6 | 433 |
| Athens leafiest park | 253 | 30 | 11 % | **1** | 10 / 35 | 25 / 7 / 1 % | 7 | 447 |

Where things are chosen (grep):
- **Buildings**: Frankfurt Kenney models + roof crowns, Athens kind + facade texture + roof; least-used pick within 100 m (`src/98bv_build_var.js` `BV_pick`, district mix `src/60_city_build4.js:63` `MIX`). LEGO-set buildings `src/98ct_city_lego.js`. District kits only for 3 Frankfurt districts (`src/98dt_district_themes.js`: Sachsenhausen taverns, Bahnhofsviertel neon, Osthafen murals).
- **Trees/bushes**: 4 prop kinds in Frankfurt (`tree`, `tree2`, `tree3`, `bush`; brick geometry `src/97_art.js` `ART_TREES`, 1-5 tints each), Athens + `CE_pine`, `CE_olive`, `CE_cypress`. asset-1 (`src/98as_assets.js`, on by default) swaps them for real LDraw trees: Frankfurt 8 variants (oak, linden, chestnut, autumn oak, maple, birch, plane, fir) + 2 bushes; Athens 9 (plane, orange, olive, almond, stone pine, palm, cypress, aleppo) + oleander. Placement: `src/60_city_build6.js` (`buildHubProps`, street/park loops), lazy zones `src/60_city_build4.js` `lzPropsG`.
- **Every tree and bush was placed at scale 1** (`_ts.set(1,1,1)` in `60_city_build6.js:84`, `lzPropsG`, `propRevive`, asset-1 near meshes): "heights = 1" in every row above. That is the clone look.
- **Ground**: 6-7 large flat ground materials in view (lawn, road, pavement, water, terrain); LF (`src/98lf_lively_fill.js`, on) adds grass-shade patches, tufts and mounds in open cells only.
- **Props**: 38 types in Frankfurt, 35 in Athens (lamp, bench, bin, hydrant, planter, stall, parasol, table, fence, sign, crate, dumpster, cars …), sprinkled one by one along kerbs (lamps every 7th slot), not in groups.

What the shots show (`docs/shots/cityvar/*_off_*.jpg`, looked at):
- Frankfurt street: the right side is ONE ~150 m yellow slab with the same window grid, the left a flat lime lawn with a few stalls; 13 trees in 150 m, no tree rows, no hedges, no kerb/pavement breakup.
- Athens street: same-size cube blocks in a row (dark faces = lighting lane), flat lawn between them.
- Park: dense trees but all one height; every tree of a variant is a clone.

## 2. What makes 2K Drive cities read well (refs: `docs/research/LIVELY_2K_FILL.md`, Steam shots in `docs/REVIEW_2K.md`)
1. **Silhouette first**: every block has a different roofline (setbacks, gables, towers, water tanks, roof gardens); no facade runs > ~30 m unchanged.
2. **Colour blocking per district**: each area has its own 2-3 colour family (facades, roofs, awnings), so you know where you are from the colours alone.
3. **Layered foliage**: tall trees + small trees + bushes + hedges + flowerbeds in one view, in groups, different sizes and autumn/green mixes.
4. **Ground is never one colour**: paving bands, grass edges, dirt paths, sand, flower patches, small height steps.
5. **Props in clusters (vignettes)**: bench + bin + lamp + planter; stall + parasol + crates + people; bus stop + sign; fences framing lawns.
6. All of it is LEGO-built (studs, plates), saturated, and repeated pieces are hidden by rotation, size and colour jitter.

## 3. Top 8 changes, ranked by look-gain per perf cost (all instanced; draw calls flat)
| # | change | gain | cost | file(s) | estimate |
|---|---|---|---|---|---|
| 1 | **Break long facade slabs**: split any building face > 30 m into 2-4 sub-facades (BV pick per piece), ±1-3 storey steps, roof crown per piece | very high (the worst thing in the Frankfurt shot) | 0 draw calls (same Kenney/CTB instanced meshes, more instances), +few k tris | `src/60_city_build4.js` (block fill, `MIX`), `src/98bv_build_var.js` (`BV_pick` per piece) | 2-3 h, Sonnet |
| 2 | **District colour blocking**: a 3-colour palette per district for facades, roofs, awnings, pavement tint (instance colour only); extend DT from 3 to all Frankfurt districts + Athens (Plaka white/blue, Kolonaki ochre, Piraeus port colours) | high (orientation + less sameness) | 0 draw calls, 0 tris | `src/98dt_district_themes.js`, `src/98bv_build_var.js` | 1.5 h, Sonnet |
| 3 | **Foliage mix** (PROTOTYPED, `TUNE.cvFol`): hashed size (w .82-1.2, h .78-1.32) + hue/lightness jitter on every tree/bush; LEGO tree pits with flowers under half the street trees | medium-high (kills the clone look, adds colour at kerb level) | +2 draw calls (one city-wide pair), see §4 | `src/98cv_city_var.js`, 2 lines in `src/assets/as/code.js` | done (prototype) |
| 4 | **Tree rows + hedges on bare streets**: a street tree every 12-15 m on pavements ≥ 4 m, low hedge runs along lawns that face a road | high on streets (13 trees in 150 m today) | 0 new types: existing tree/bush instances (+0-1 draw call per tile), hedge geo from `SIMP` | `src/60_city_build6.js` (`CE_streets`), `src/98sp_simplify.js` (hedge geometry) | 2 h, Sonnet |
| 5 | **Prop vignettes**: place props as stamped clusters (bench+bin+lamp+planter; stall+parasol+crates; bus stop+sign+bench; café 2 tables+parasol) instead of one by one | medium-high (streets read "lived in") | 0 draw calls (existing 38 types, LDraw versions from asset-1) | `src/60_city_build6.js` (`add`), `src/98bv_build_var.js` (`BV_life` slots) | 2 h, Sonnet |
| 6 | **Ground breakup**: paving bands at kerbs, 1-plate grass edges, dirt/gravel paths through parks, flower patches; vertex-colour noise on lawns | medium (the flat lime) | 1 InstancedMesh of flat plates (+1 call), 0 for vertex noise | `src/98lf_lively_fill.js`, `src/53_terrain_roads.js` | 2-3 h, Sonnet |
| 7 | **Roofline extras**: water tanks, antennas, roof gardens (existing tree/bush instances on flat roofs), stepped tower tops | medium (skyline) | 0-1 call (reuse instances) | `src/98bv_build_var.js` (roof crown), `src/98ct_city_lego.js` | 2 h, Sonnet |
| 8 | **Small height variation**: raised planters, 1-2 brick terraces and steps in parks and plazas, river embankment steps | medium | instances + colliders (needs a drive test) | `src/98lf_lively_fill.js`, `src/98ld_l_land.js` | 3 h, Opus for feel |

Reuse (licences): LDraw parts via asset-1 (CCAL 2.0), Kenney kits in `km.js` (CC0), three.js `InstancedMesh` (MIT), own brick geometry `ART_brickGeo` (`src/97_art.js`). No new third-party files needed for 1-7.

## 4. Prototype: foliage mix (`src/98cv_city_var.js`, flag `TUNE.cvFol`, default 0 = OFF; `?cvf=1` on, `?cvf=0` off)
What it does: every tree/bush gets a hashed size (width .82-1.2, height .78-1.32) and a small hue/saturation/lightness shift (far instances and asset-1 near LDraw meshes, also after a smashed tree respawns); half the street trees (1.6-14 m off a road) and 1 in 8 park trees get a LEGO tree pit (grey kerb, green clumps, 1x1 flower plates in 6 colours), at most 1800 spread over the city by hash, in ONE city-wide InstancedMesh pair (~130 tris a pit, no collider: it sits inside the tree's footprint).

Measured on the built page (same spots, OFF vs ON; draw calls = visible meshes in the frustum, `SIMP_drawStat`):
| spot | draw calls OFF → ON | tris OFF → ON | foliage looks in 150 m | top look | heights |
|---|---|---|---|---|---|
| Frankfurt start | 692 → 671 | 3.43 M → 3.52 M | 8 → 13 | 37 % → 16 % | 1 → 5 |
| Frankfurt park | 732 → 686 | 4.27 M → 3.87 M | 21 → 43 | 17 % → 8 % | 1 → 6 |
| Athens start | 530 → 532 (+0.4 %) | 2.63 M → 2.83 M (+7 %) | 26 → 55 | 10 % → 7 % | 1 → 6 |
| Athens street | 424 → 426 (+0.5 %) | 2.96 M → 3.15 M (+6 %) | 22 → 38 | 11 % → 7 % | 1 → 6 |
| Athens park | 437 → 434 | 2.45 M → 2.64 M | 28 → 64 | 9 % → 5 % | 1 → 6 |
Frankfurt numbers move with lazy streaming between runs (OFF higher than ON there); the fixed cost of the change is +2 calls, which is what Athens shows. First version had no cap: Athens put 31,608 pits (+8.7 M tris), now capped at 1800.

Shots (OFF left, ON right; looked at): `docs/shots/cityvar/fra_park_off_vs_on.jpg`, `ath_park_off_vs_on.jpg`, `fra_street_off_vs_on.jpg`, `ath_street_off_vs_on.jpg`, `fra_pit_off_vs_on.jpg`.
Honest look: the size mix shows in parks (trees no longer the same height), the colour shift is subtle, and pits read as small flower boxes at kerb level. The gain is real but medium: on its own it does NOT fix the "repetitive" street, because the worst view (Frankfurt `bv1`) has only 10-19 trees in 150 m. Items 1 (facade slabs) and 4 (tree rows) matter more there. The Athens park camera (`CVF_park`) can land inside a tree, so use the street or pit shot to judge.
Gate: unit 0 FAIL; `TAG=life1,xf1,terrain,cvf1` on the built page (see HANDOFF_cityvar). Turn on for a beta: set `cvFol:1` in `src/assets/tune.json` (or TUNE in `src/10_core.js`) once Alex has seen the shots.

## 5. Which become builder pieces
Tree pit with flowers (from #3), the LDraw tree variants at 3 sizes (asset-1 + #3 sizes), hedge 1×4 / corner (#4), flowerbed 2×4 and paving / path plates (#6), the 4 prop vignettes as one-tap stamps (#5: bench set, market stall, bus stop, café), facade modules (shop front, balcony band, roof crown, water tank) from #1/#7. `src/98b2_builder2.js` already has `BX_trees` / `BX_asTrees`; the stamps would be new palette entries there.
