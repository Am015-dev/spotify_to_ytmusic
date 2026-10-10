# city-1 handoff (2026-10-10). Branch alex/od-city (from od-models v90a). Module: src/98ct_city_lego.js (ORDER: right after 98ld_run.js).
Brief (coordinator, Alex's own request, freeze-exempt): "now we have a big variety, we can include it in our city and replace buildings and cars".

## Shipped in v90b: TRAFFIC (CT)
- HCAR slots are swapped to kinds `ld:<class>:<model>` (CT_SWAP). The class stays in the name, so QS speeds (/truck|delivery|bus/) and SC caps still work.
  Frankfurt: sedan→6633 Family Car, hypercar→75878, taxi→40468 taxi (TX_CAR), van→7731 mail van, truck→3221 big rig, delivery→60054 service van,
  police→4436 patrol car, coupe→75893 Charger. Athens: taxi→40468, sedan→6633, van→7639 camper, delivery→60054, hypercar→75892 (coupe slot kept, see OPEN).
  Bus, trolleybus, scooters and the two 98su street racers are unchanged. Same slot count = same draw calls.
- CR_cityGeo is wrapped: one merged body (CR_LO 2 + LD_cull), wheels, glass; true scale per size-1 rule: City/Town sets LD_SW×LD_FIG, Speed Champions LD_SW, 40468 taxi fitted to 1.72 m; 96 SC width cap skipped (userData.sc).
  Real set colours (no per-instance paint, CR_cityPost wrapped). Far LOD = the existing 98wb vertex-clustered copy. Collision: OB_cdim (90) asks CT_dim first
  (the model's own half width/length). Missing model (lazy load not done) → the old procedural kind (CT.fb). Boot preloads both cities' sets (LD_need).
- `?ct=0` = old traffic (A/B). Probe: `NOB=1 node tools/ct/ctProbe.js <url> <outdir> <fra|ath>` (draw calls/tris/heap/glMB per frame + car close-ups).

- OPEN: in Athens, swapping BOTH the taxi and the 'su:t_sc_tm' coupe slot adds ~110 MB JS heap (after GC) at the start view (bisected with
  `?ctx=<old kinds kept>`: any config that keeps taxi or tm is flat; Frankfurt swaps both and is flat). v90b keeps Athens tm procedural. Root-cause it
  (heap snapshot diff, ctProbe + `?ctx=`) before swapping tm in Athens.
- Measured v90b vs `?ct=0` (start view, 852×393, headless, GC'd): Frankfurt draws 489→488, tris 2.02M→2.11M, heap +2.5 MB, glMB +2.5;
  Athens draws 249→251, tris 1.22M→1.27M, heap flat (380 vs 377–390), glMB +2.6.

## NOT shipped: BUILDINGS (CTB) — code is in, OFF unless `?ctb=1`
- Hooks (edited 60_city_build.js): putK (Frankfurt Kenney rows/frontage, names building-a..m / building-type-*; towers untouched) → CTB_putK;
  Athens put → CTB_put (only 'plaka'/'villa' units in the plaka + villa districts; the 13k suburban 'town' houses stay procedural).
- CTB_fill packs a row of sets along the slot's street front (front flush = old setback), minifig scale (LD_SW×LD_FIG), oriented collider per set
  (footprint of tall parts −0.2 m, hubAddB like the Kenney boxes). Instancing: per variant one InstancedMesh per material (near ≤70 m) + one far mesh
  (WB_cluster .45 m), re-sorted every 6 frames by distance + view direction (CTB_step).
- Measured with ?ctb=1 (headless, 852×393, start view): Frankfurt draws 490→340, tris 2.16M→1.80M (fewer Kenney meshes), but **glMB +20 MB**
  (128→148) = unique geometry: Corner Garage 79k tris = 8.5 MB, three 6372 colour variants, two bank variants. Athens 5.1k sets, glMB +~2.
- Looks: shots docs/shots/city1/*_bld_*.png (earlier run). Frankfurt becomes a LEGO Town of 6–7 m houses on grass (towers stay); street density drops.

## TODO for buildings (next worker)
1. Memory to zero growth: ONE geometry per model; recolour per instance instead of variants: set the wall colour to sentinel #ffffff in the brick list,
   material = GB_MAT clone with the ART9_cabMat trick (instanceColor tints only pure-white vertices). Palette per city.
2. Corner Garage: drop the LD_PROPS 'cgarage' world prop when CTB has the cg kind (same 8.5 MB, now instanced, one per 260 m).
3. Use the new sets: 6362 shop + 6374 holiday home (Frankfurt), 6360 cottage + 6349 villa (Athens villas). Preload them like CT (LD_need at boot).
4. Density: fill the slot depth with a second row behind the first; keep 1 m gaps; check the road setback in shots.
5. Gate: shots Frankfurt street, Athens street, building close-ups (852×393), ≤250 draws / ≤600k tris target (baseline is already above in headless: report deltas),
   glMB no growth, minifig door check (tools/ld/ldDoor.js), then QUICK/full review per CLAUDE.md, OD_CHANGELOG + checklist, READY to the coordinator.
