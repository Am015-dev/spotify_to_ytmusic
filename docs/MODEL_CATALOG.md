# Model catalogue

## Landscape (land-1, 2026-10-10)

Goal (Alex): real LEGO landscape builds for Frankfurt instead of free assets and procedural brick stacks.
Sources checked: the LDraw OMR (full list of 1,470 sets scraped to `ld/omr_all.tsv`), the LDraw parts library (CCAL 2.0),
Rebrickable MOCs (per-designer licences, mostly "personal use": not reusable without the designer's OK, so none used),
official LEGO instruction PDFs (© LEGO, view only; no machine-readable data). Only OMR files and LDraw parts are used.
All OMR files below carry `0 !LICENSE Redistributable under CCAL version 2.0`: reuse allowed, credit the author.

Ranked by value for Frankfurt (visibility × count in the world ÷ cost):

| rank | build | source (set / part, LDraw author) | parts | licence | status / where |
|---|---|---|---|---|---|
| 1 | **Round tree** 3470 Plant Tree Oval 4×4×6 | LDraw part; the Classic Town park tree | 1 | CCAL 2.0 | **in** (Frankfurt `tree`, lathe of the part's silhouette) |
| 2 | **Pine** 3471 Plant Tree Pyramidal 4×4×6⅔ | as placed in 376-2 / 560 Town House with Garden (Robert Paciorek) | 1 | CCAL 2.0 | **in** (Frankfurt `tree3`) |
| 3 | **Small pine** 2435 Plant Tree Pyramidal 3×3×4 | next to the 3471 in 6388 / 1472 Holiday Home with Caravan (Robert Paciorek) | 1 | CCAL 2.0 | **in** (Frankfurt `tree2`) |
| 4 | **Fountain** | 10184 Town Plan, submodel "Fountain" (Marc Giraudet) | 66 | CCAL 2.0 | next: Römer / park centrepiece (1 instance) |
| 5 | **Flower bed** | 10184 Town Plan, submodel "Flowers" (Marc Giraudet) | 8 | CCAL 2.0 | next: planters / park borders (replaces Kenney `planter`) |
| 6 | **Lamp post** 2039 Support 2×2×7 Lamppost | used in 10184 Town Hall | 1–4 | CCAL 2.0 | next: replaces Kenney `light-curved` (most frequent street prop) |
| 7 | **Palm tree** 2563 base + 5× 2536 trunk + 2566 top + 4× 2518 leaves | as built in 6376 / 10037 Breezeway Cafe (Robert Paciorek) | 11 | CCAL 2.0 | converted (`l_palm`), not placed: Athens seafront candidate |
| 8 | **Lattice fence** 3185 Fence Lattice 1×4×2 | 6376 / 3061 | 1 | CCAL 2.0 | next: park fences (replaces Kenney `fence-1x3`) |
| 9 | **Park café terrace** | 3061 City Park Café (Friends, Philippe Hurbain), submodel "terasse" | ~40 | CCAL 2.0 | candidate: Römer café sets (Friends mini-doll scale: check door/seat height) |
| 10 | **Flower stand** | 3715 Flower Stand (Fabuland, Philippe Hurbain) | 19 | CCAL 2.0 | candidate: market stall (Fabuland scale: check) |
| 11 | **Bush** 2417 Leaves 6×5 + 2423 4×3 | leaves of 6376 Breezeway Cafe | 2–3 | CCAL 2.0 | tried, dropped: the leaf parts lie flat (2.4 plates high) and cost 1,119 tris vs ~500 for the brick bush |
| 12 | Town Plan Town Hall / Cinema / Station | 10184 Town Plan | 553 / 667 / 393 | CCAL 2.0 | too big for props (build-7 budget ≤ 25k culled tris) |
| — | Fountain Garden 10359, Tranquil Garden 10315, Tree House 21318, Trevi 21020, Trafalgar 21045 | OMR | — | CCAL 2.0 | not minifig scale (display / micro sets): skipped |

Not in the OMR (checked the full list): park benches, bandstands, playgrounds, riverside promenades and small footbridges as
separate sets. Pieces of them exist only inside bigger sets (10184 Town Plan: lamp posts 2039, flowers, fountain).

### How the land builds are made (repeatable)
The full LDraw meshes of the tree parts (converted with `LD_ALL=1 LD_KEEP=.1 LD_AGG=6 python3 tools/ld/ld2garage.py ld/land/<id>.ldr ld/out/<id>`;
LD_ALL keeps every face, the top+sides filter cut the branch rings into slices) are 1,000–1,600 tris each, but Frankfurt has ~8,300 trees at
60–84 tris. So round parts are drawn as a **lathe of their real silhouette**: `python3 tools/ld/lProfile.py 3470.dat 3` samples the LDraw mesh,
takes the max radius per height and simplifies it (Douglas-Peucker); the points go into `LDS.P` in `src/98ld_l_land.js` (near: 8 sides,
far: 6 sides + fewer points). No model data is downloaded. In-world check (before/after at the same spot, frame tris):
`node tools/ld/lWorld.js http://127.0.0.1:8766/local_dbg.html docs/shots/land trees` (NOT `?fast=1`: its frame clock never ticks in this
container, roam never loads). `ld/land/*.ldr` keep the part placements (from the OMR sets) for a later full-mesh garage/showcase use.
