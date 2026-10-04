# DR: driving flow (owner: "too many breakables and traffic, impossible to drive around")

## What changed (`dr.js` via `pDR2.py`; `drp.js` via `pDR1.py` is a measurement API only)
1. **Breakables off the driving line.** Every prop within 2.5 m of a road edge (on the road or on the kerb) is removed at build time, before instancing, so there are fewer instances to draw. Exceptions: street trees spaced at least 26 m apart (kerb side only), lamps at least 0.5 m off the road, traffic lights, and one roadwork smash line in four (they block one lane only). Brick piles, towers, gold and crates stay as deliberate smash targets. Plazas, parks, car-park lots and verges (more than 2.5 m from the road edge) keep their props. Biome props (`lzPropsG`) get the same filter.
2. **A smash never stops the car.** Each hit keeps at least 95 % of the speed. A burst of hits within 1 s keeps at least 85 % of the speed at the first contact.
3. **Traffic.** AI cars are halved (150 → 75 in Frankfurt, 150 → 78 in Athens, where trolleys are kept). Instanced meshes are compacted (`im.count`). Every AI car drives in the outer lane, so the inner lanes are always free, including at red lights. A car stopped for 8 s that the player can't see (behind, or more than 60 m away) is recycled, so queues never build into walls. This is on top of cityvar's lights, which still work.
4. **Solid blocks.** Frankfurt `resid` blocks with no street into them (8 m sample grid, all samples ≥ 2 m from any road) become one solid block: wall, roof slab, collider. Athens uses a 16 m raster of deep interiors (≥ 22 m from every street edge; not park, plaza, hill, river, landmark, garage, gate or ramp), merged into rectangles. All are drawn as one merged mesh per city. Nothing is spawned inside them (props are culled; later spawns are rejected by `roamHit`). No street is removed.
5. **Phone HUD.** On touch the mission card (`#qTrk`) shows one line (title, count, ↺ ✕) plus the progress bar. Tapping the title expands the text; the district plate hides while it is expanded. In landscape the card and the district plate sit right of the minimap, clear of the steer pads.
- `?dr=0` turns all of it off.

## Patch order
Apply last, onto the release-82 phase-2 order:
`pAU1 pAU2 pOG1 pOB1 pOB2 pOB3 pOC1 pCV1 pCV2 pRL1 pJU1 pRL2 pGB1 pDR1 pDR2` → REAPPLY_OK.
Also applies cleanly on devkit base.html (live v82) and plain v81. One anchor (`window.__mho={`, insert-before); see ANCHORS.md.
Size: +7.9 KB (3,730,789 → 3,738,642 unsplit; deploy the split build: out/overdrive.html 1,777,193 + km.js).

## Before / after
Final build = release-82 phase 2 (@d820164). Before = same build + pDR1 (probe only). tDR.js, Athens district B (Kolonaki) and Frankfurt (Altstadt).

| | Kolonaki before | Kolonaki after | Frankfurt before | Frankfurt after |
|---|---|---|---|---|
| breakables ≤ 2.5 m from road edge, district | 14,529 | 5,227 (−64 %) | 843 | 140 (−83 %) |
| same, within 450 m of the area centre | 1,447 | 466 (−68 %, all spaced trees) | 71 | 10 (−86 %) |
| breakables on the road surface, area | 1 | 1 (brick pile) | 64 (36 cones, 24 barriers…) | 6 (roadwork line) |
| all breakables, district | 35,431 | 17,272 (−51 %) | 31,616 | 28,852 |
| AI cars total | 150 | 78 | 150 | 75 |
| AI cars within 150 m (avg of 20 samples) | 6.5 | 3.9 | 4.9 | 4.4 (noisy; cars are recycled around the player) |
| stopped side-by-side lane walls | 0 | 0 | 0 | 0 |
| scene objects / visible meshes | 3,005 / 992 | 2,408 / 961 | 4,969 / 1,915 | 4,905 / 1,908 |
| draw calls / triangles (one frame) | 422 / 1.28 M | 413 / 1.15 M | 762 / 2.62 M | 737 / 2.44 M |
| bot avg speed, 5 fixed routes (km/h) | 107.9 | 116.1 (rerun 115.9) | 118.9 | 126.5 (rerun 123.5) |
| smashes on those routes | 30 | 16 | 3 | 1 |
| worst speed kept on a smash frame | 0.852 | 0.943 | 0.913 | 0.912 |
| solid blocks | — | 1,008 rects | — | 192 blocks |

Phone landscape (852×393 CSS = 2002×924 px, iPhone 16), mission running: the card was 270×88 at (10,176), above the steer pads. It is now 270×45 at (104,176), clear of every touch control and the minimap (88 px tall when expanded, still clear). The district plate is clear of the minimap and the card.
Shots: `shots/dr_before_phone.jpg`, `dr_after_phone.jpg`, `dr_after_phone_open.jpg`, `dr_{before,after}_{ath,fra}.jpg`, `dr_after_fra_solidblock.jpg`, `smoke/sheet.png` (split build).

## Tests (final build, own test dirs/ports)
| test | unsplit | split (out/ + km.js) |
|---|---|---|
| `node smoke.js .` | SMOKE PASS 12/12 | SMOKE PASS 12/12 |
| tools/tBA.js | 30/30 | 30/30 |
| tools/tBF.js | 9/1 (BF3, known harmless) | 9/1 (BF3, known harmless) |
| tDR.js | 21/21 on two reruns | — |

The first tDR run on the final build had one route in Kolonaki where the bot stood still for 150 s. It didn't reproduce in two full reruns or when the route was driven on its own. The bot now reports the car state (`why`) if a route doesn't finish.
Also checked on the phase-1 release build: smoke PASS, tBA 30/30, tBF 9/1 (BF3).

## Known gaps
- Thresholds are in metres (2.5 m edge, 26 m tree spacing, 16 m raster, 22 m interior). If od-scale rescales the world, revisit them; the code reads road widths at runtime and is otherwise scale-agnostic.
- Near-player traffic density in Frankfurt drops less than the total, because cars are recycled into a ring around the player.
- Athens solid blocks are plain rectangles (wall plus terracotta slab) behind the street units. They are seen mostly through gaps between units.
- Desktop (non-touch) HUD layout is unchanged.
