# land-2 handoff (2026-10-10, continues land-1 below)

## land-2 done (each sent to build-7 as MODEL)
| sha | swap | tris each | draws |
|---|---|---|---|
| 74f7c85 | Frankfurt planter → LEGO flower bed (bed brick + 3020, 33291 flowers, 6255 leaves) | 204 → 168 | 48 → 48 |
| 74f7c85 | Frankfurt dumpster → LEGO brick dumpster | 234 → 108 | 48 → 48 |
| ed78371 | 10184 Town Plan fountain placed in Frankfurt (src/98ld_w_10184f.js + src/MODELS) | new: 6,310 near / 4,414 far | +1/material |
| d9bf579 | Athens street lamps → same LEGO 2039 lamp (Athens grey, 5.5 m via R1 scale) | 92 → 78 | same |
| 075047a | Athens race palms (Syntagma) → LEGO 6376 palm (lathe trunk + 4 two-sided 2518 leaves) | 108 → 99 | 9 → 9 |

## land-2 notes
- LDraw library is downloaded to ld/lib (git-ignored): `curl -o c.zip https://library.ldraw.org/library/updates/complete.zip`.
- New swaps go in `LDS.SW` (src/98ld_l_land.js): `{type:[fn(oldGeo)->geo, label]}`, swapped after kmProps (Frankfurt only), A/B via `LDS_ab` list.
- Athens: `CITY=ath node tools/ld/lWorld.js ...` (sets mho_city@1). Race tracks: `node tools/ld/lRace.js <url> <out> synt` (attract race via `__ld.lds.race`, hides the menu DOM, palm A/B).
- km.js `light-curved` not dropped: kmProps still loads it before the swap and it is ~4 KB; removing it needs KM_IDX re-offsetting (tools/split_km.py) + a 60_city_build change. Low value.
- Frame `calls` differ by a few between A/B (bounding spheres), per-type draw counts are unchanged.

## Next (land-3)
1. Construction props (Kenney cone 66 / barrier 60 / clight 144, 615 total): LEGO 4589 cone (traffic cone), 3633-style barrier, light.
2. sign (road-sign-stop 104, 311): LEGO 3742-free sign = 4589/3957 pole + 2×2 round tile sign (892? check part).
3. rock_largeA (80, 262): LEGO rock 6082/6083 (Rock Panel) as boxes.
4. Athens procedural props (CE_* types) and parked Kenney cars (needs LEGO cars from the art lane, ask build-7 before touching).

# land-1 handoff (landscape lane, 2026-10-10). Branch alex/od-mdl-land (from alex/od-models 8eb6eaa), draft PR #91 → alex/od-models.

## Done (each one sent to build-7 as MODEL <sha> …)
| sha | swap (Frankfurt only) | tris per item | draws |
|---|---|---|---|
| 9afae66 | trees: box stacks → LEGO 3470 / 2435 / 3471 (lathe of the LDraw silhouette, far LOD per 800 m tile) | 60/60/84 → 136/136/168 near, 54/30/30 far | same |
| 5a51e5c | lamps: Kenney light-curved → LEGO 2039 lamp post + 3062b lamp + 4740 shade | 92 → 78 | same |
| d2faf6c | park fences: Kenney fence-1x3 → LEGO 3633 Fence Lattice 1×4×1 | 204 → 144 | same |
| d44c9e3 | crates: Kenney box → LEGO 61780 Container 2×2×2 Crate | 124 → 108 | same |
All code is in `src/98ld_l_land.js` (LDS; ORDER: right after 98ld_w.js). Hooks: `ART_trees` (trees, lamp: the lamp head/glow is computed after it)
and `kmProps` (fence, crate). Old geometry kept as `def.gOld`; `__ld.ldsAB(1/0)` toggles old/new for same-spot before/after shots.
Audit: docs/FREE_ASSETS.md (all Kenney props with counts/tris/draws + swap table). Sources: docs/MODEL_CATALOG.md (landscape).

## Key facts
- **`?fast=1` never ticks in this container** (its frame clock waits for rAF that never comes): roam never loads. Use plain
  `http://127.0.0.1:8766/local_dbg.html` (roam in ~23 s), load at 1280×720, then resize to 852×393 for shots (tools/ld/lWorld.js does this).
- `node tools/ld/lWorld.js <url> docs/shots/land <trees|lamps|fence|crate>`: per type count/tris old→new, densest spot shot after+before,
  frame tris/calls (renderer.info). Add a new tag to its regex for a new type.
- Full LDraw meshes are far too heavy for instanced street props (3470 = 1,000+ tris vs 60). Round parts → lathe from
  `tools/ld/lProfile.py <part>.dat`; flat/boxy parts → boxes with the part's LDU dimensions read from the .dat.
- The bush (2417 leaves) was dropped: flat and heavier. Lamp swap can't remove `light-curved` from km.js yet (Athens uses it).

## Next (in order)
1. planter (712 × 204, Kenney) → LEGO flower bed (10184 "Flowers" stems/3742 flowers are ~450 tris: needs a box+lathe version ≤ 204).
2. dumpster (690 × 234, Kenney) → LEGO-part dumpster as boxes ≤ 234.
3. 10184 Town Plan fountain as a Frankfurt plaza centrepiece: data module ready in `ld/pending/98ld_w_10184f.js` (60 parts) → move to src/,
   add to src/MODELS, check culled tris ≤ 25k and the placement shot.
4. Athens: palm (6376 palm, `ld/land/l_palm.ldr`) as a lathe+leaf version for the seafront; Athens lamps → same 2039 lamp, then drop
   `light-curved` from km.js.
