# city-2 handoff (2026-10-10). Branch alex/od-city (od-models v90d merged). Module: src/98ct_city_lego.js (CTB section). Status: code done, NOT yet reviewed/READY.
Brief (coordinator, Alex's own request): replace the generic city buildings with real LEGO buildings at minifig scale; one geometry per model + per-instance
wall colour; reuse Corner Garage + 6362/6374/6360/6349/6372; second row for density (Frankfurt dense mid-rise, not a village); Athens whitewashed
cottages, villas, cafés. Budget: GPU ≤ live + 5 MB, draws ≤ live, heap flat.

## What is in (CTB ON by default now; `?ctb=0` = old buildings for A/B)
- 5 LEGO modular buildings converted from the LDraw OMR (CCAL 2.0; low-poly + ldcull like the Corner Garage, no placement line, src/MODELS):
  m10182 Café Corner, m10185 Green Grocer (MMR1988), m10218 Pet Shop (Stefan Frenz), m10243 Parisian Restaurant (Willy Tschager), m10251 Brick Bank
  (Merlijn Wissink). Each 12.5×12.5 m, 13–18 m tall at minifig scale; ~70–87k tris full. OMR copies in ld/omr (`*_c.mpd` = cleaned of off-scale placements).
- Frankfurt slots (Kenney rows/frontage, ~25×25 m): front row facing the nearest road (CTB_side, FL_road probe) + back row turned 180° facing the street
  behind (slot depth). Pools: modulars + Corner Garage + bank/6372/6362/6374/6683. Palette per instance ('o' = own colour).
- Athens: plaka + villa districts AND the old town around the start (Psyrri 'old' style: neo/poly units → whitewashed Café Corner / Parisian
  Restaurant + cottages 6365/6360/6402/6349). w6372 dropped in Athens (draw calls). Suburban/outer units stay procedural.
- Memory: ONE geometry per model; wall colour → sentinel #ffffff, tinted per instance in CTB_mat (GB_MAT clone, flatShading, vertex shader: only pure-white
  vertices take instanceColor). Int16 positions, Uint8 colours, no normals; CPU arrays freed on upload (`?ctbkeep=1` keeps them for debugging).
  Near mesh = bricks + lamps + glass (opaque tinted) merged → 1 draw. LOD: near <34 m, mid (cluster .3) <120 m Fra / 80 m Ath, far (cluster 1.1) <560/430 m;
  Athens small sets (<25k tris) skip the mid band (cluster .7).
- Corner Garage world prop (LD_PROPS cgarage) and v90a LDW props of models CTB uses are not built when CTB is on (same geometry instanced instead).
- Per-step cost: precomputed matrices + colours, 64 m cell grid → CTB_step 0.7–0.9 ms (headless) every 6 frames (was 12 ms). Own rAF loop (hubCullStep does not run in Athens).
- Colliders: oriented hubAddB per set (footprint of tall bricks −0.2 m), Athens with {ab:1}.

## Measured (headless swiftshader, 852×393, tools/ct/ctbShot.js, same build ctb=0 vs on)
| | draws | tris | glMB | heap |
|---|---|---|---|---|
| Frankfurt start, ctb=0 → on | 488 → 341–348 | 2.11M → 2.00–2.21M | 136.8 → 124.4–125 | 396 → 400–407 (noise ±5) |
| Athens start | 246–247 → 242–253 (varies run to run) | 1.26M → 1.08–1.62M | 200.4 → 190.8–193.6 | 380–490 both (very noisy, ±100 in both builds) |
| Athens old-town street cam (2092,40.2,-1676 → 2147.9,40.2,-1637.4) | 252 → 254–256 | 1.27M → 1.64–1.80M | 200.5 → 193.6–197 | noisy |
GPU is under live in both cities. Athens draws at the old-town cam are +2..+4 (fix idea: fewer kinds in 'old', or drop w6402's mid band). Athens heap needs a
proper measure (3× gc + wait, several runs) before review: both builds swing 380↔490 MB.

## Shots (docs/shots/city2, 852×393; *_live = same build with ctb=0)
fra_street_new/live, fra_high_new/live, ath_start_new/live, ath_oldtown_new/live, fra_buildings1/2 (close-ups), ath_cottage, ath_cafe.
Looks: Frankfurt modulars read as real LEGO and fill the blocks two rows deep; they are ~15 m tall vs the old 25–30 m Kenney blocks, so the skyline
is lower than live (towers/landmarks unchanged). Athens: whitewashed cottages with blue roofs and white cafés; lower than the old 3-storey houses.

## TODO (next worker)
1. Proper heap A/B (Athens). Athens draws at the old-town cam ≤ live (see above). Minifig door check: `node tools/ld/ldDoor.js` for m10182/m10243 (not run).
2. Drive check with tPlay in both cities (colliders vs the new footprints, road setback: front row is flush with the old slot front; back row may overhang ≤1 m).
3. OD_CHANGELOG entry (v90e, NEW: real LEGO modular buildings in Frankfurt; CHANGED: Athens old town whitewashed LEGO houses and cafés) + checklist items
   (99c_checklist.js), credits for the 5 OMR authors if the credits screen lists LDraw authors.
4. QUICK review is NOT enough (world/perf change): full shot set to the reviewer, then push and "READY alex/od-city <sha> out/<ver> ..." to the coordinator.
Tools: `node tools/ct/ctbShot.js <url> <out> <fra|ath> [tag]` (env NB=<close-ups>, NOB=1, CAM=x,y,z,tx,ty,tz); `__ctb.stat()`, `__ctb.scam(x,z)`, `__ctb.scene()`.
