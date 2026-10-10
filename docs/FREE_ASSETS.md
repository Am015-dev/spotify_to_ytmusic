# Free assets + ugly structures in Frankfurt (land-1 audit, 2026-10-10)

Measured in Frankfurt roam (`node tools/ld/lAudit.js` / `tools/ld/lWorld.js` on `local_dbg.html`, branch alex/od-mdl-land from od-models v89z).
"draws" = instanced meshes of that type (one per type per 800 m prop tile). Tris per instance; totals = count × tris.
No third-party glTF/OBJ files are loaded; the only third-party models are the **Kenney CC0 kits** packed in `assets/km.js`
(1.96 MB, `50_kenney_data.js` index, loader `kmGeo` in `51_city_net.js`). No "Facelift 3D raw models" are used in this game (grep: none).

## 1. Kenney CC0 models still in the Frankfurt world
| asset (Kenney model) | game type | module | count | tris each | tris total | draws |
|---|---|---|---|---|---|---|
| light-curved | `lamp` (street lamps, every 7th sidewalk slot) | 60_city_build.js `kmProps`/`buildHubProps` | **8,524** | 92 | **784k** | 52 |
| fence-1x3 | `fence` (park borders) | same | 2,197 | 204 | 448k | 32 |
| box | `crate` | same | 1,897 | 124 | 235k | 38 |
| dumpster | `dumpster` | same | 690 | 234 | 161k | 48 |
| planter | `planter` | same | 712 | 204 | 145k | 48 |
| construction-cone / -barrier / -light | `cone` `barrier` `clight` | same | 465 / 101 / 49 | 66 / 60 / 144 | 44k | 63 |
| road-sign-stop | `sign` | same | 311 | 104 | 32k | 47 |
| rock_largeA | `rock` | same | 262 | 80 | 21k | 26 |
| cargo-container-a | `container` | same | 156 | 160 | 25k | 1 |
| sedan / suv / taxi / van | `car` `car2` `car3` `car4` (parked) | same | 137 | 864–1,014 | 127k | 52 |
| traffic-light | `tlight` | same | 24 | 212 | 5k | 11 |
| detail-parasol-a / detail-awning | `parasol` `awning` | same | 32 | 96 / 40 | 3k | 6 |
| boat-speed-a / boat-tug-a / boat-house-a | `boat` `tug` `hboat` (river) | same | 23 | 156–471 | 6k | 14 |
| building-a…m, skyscraper-a…e, low-detail-*, building-type-* (suburban) | city tower blocks, outer towns, `lzFront` street fronts | 60_city_build.js `putK`/`lzKm` | (instanced per model) | 770–3,740 | — | per model |
| sedan / delivery | quest + M1 story vans | 41/70/80 | few | 864–924 | — | — |
| tree_default / tree_oak / tree_cone / plant_bushLarge | loaded by `kmProps`, then replaced by ART brick trees | 60 → 97_art.js | 0 drawn | 50–196 | 0 | 0 |

## 2. Ugliest procedural structures (Frankfurt)
| structure | type / module | count | tris each | draws | note |
|---|---|---|---|---|---|
| **trees** (box-stack "brick trees", no studs) | `tree` `tree2` `tree3`, ART_TREES in 97_art.js | 5,929 + 1,874 + 532 | 60 / 60 / 84 | 54 + 52 + 32 | most visible landscape item: **swapped first** (real LEGO 3470 / 2435 / 3471) |
| bushes (two slabs) | `bush`, ART_TREES | 867 | 24 | 36 | real LEGO leaf parts tried: flat and 1,119 tris → kept |
| brick piles / stud towers | `bricks` `tower` | 436 / 163 | 316 / 604 | 79 | game items (smash for studs), not landscape |
| benches, bins, posts, hydrants, bus stops | procedural boxes (propDefs) | 1,489 / 674 / 309 / 340 / 449 | 24–132 | ~245 | |
| river banks, quays, bridges/decks | `quayBuild`, `deckBuild`, `BRIDGES` (51/60) | merged | — | — | merged meshes; a LEGO bridge would be a new world prop (no OMR footbridge set) |

## 3. Plan / status (one swap at a time, each lighter or equal)
1. **trees** → real LEGO tree parts (done, see docs/MODEL_CATALOG.md and the swap table below).
2. **lamps** (Kenney, 784k tris, the biggest free-asset cost): a lathe of LEGO 2039 lamp post + round-brick lamp ≤ 92 tris.
3. **fence** (Kenney, 448k tris): LEGO 3185 Fence Lattice 1×4×2 as a flat panel (≤ 204 tris).
4. **planter / dumpster / crate** (Kenney): LEGO-part equivalents ≤ old tris.
Then km.js can drop each replaced model (km.js is shared with buildings/cars: only the props' slices go).

## Swaps
| # | what | before → after (per instance) | totals (all instances) | frame at the shot spot (renderer.info) | draws | shots |
|---|---|---|---|---|---|---|
| 1 | trees: box stacks → LEGO 3470 / 2435 / 3471 silhouettes | tree 60 → 136 near / 54 far; tree2 60 → 136 / 30; tree3 84 → 168 / 30 | 513k → 392k far, 1.15M all-near (near = within 120 m of a tile's trees) | 4.94M → 4.97M (+0.5%) | 138 → 138 | docs/shots/land/trees_before.png, trees_after.png |
