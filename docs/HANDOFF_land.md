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
