# Garage parts research (g13, 2026-10-09)

Goal: find the real LEGO parts that small vehicle sets use and our brick builder lacks, ranked by how useful they are for realistic cars.

**Method.**
- **Inventories.** The 40468 list was read from the official instruction PDF (pages 42–43, rendered and checked by eye). Each element ID was resolved on Brickset, giving its name, design and colour. The other four sets come from Brickset inventory pages.
- **Dimensions.** All sizes are bounding boxes I computed from the official LDraw `.dat` geometry, with subfiles resolved recursively and top or side studs left out. The conversion is 20 LDU = 1 stud (8 mm) and 8 LDU = 1 plate (3.2 mm). Every stud or plate number below is therefore **(converted)** from LDraw LDU.
- **Blocked sources.** Rebrickable (HTTP 403, Cloudflare) and BrickLink (HTTP 405, human check) could not be opened. Their IDs are not cited as opened pages.

Set codes used below: **T** = 40468 Yellow Taxi, **P** = 76916 Porsche 963 (Speed Champions), **M** = 76920 Ford Mustang Dark Horse (Speed Champions), **S** = 31127 Street Racer (Creator 3-in-1), **C** = 60312 Police Car (City).

## 1. What our catalogue already has (src grep)
These come from the `GB_PC` entries in `92_garage_builder.js` and `93_cars_lego.js` (generated families) and the `{n:..,w,d,h}` entries in `98*_*.js`. Sizes are in game units: w×d studs, h in plates.
- **Bricks** b11 b12 b13 b14 b16 b18 b22 b23 b24 b26 b28. **Plates** p11 p12 p13 p14 p16 p18 p22 p23 p24 p26 p28 p44 p46 p66. **Tiles** t11 t12(tile) t13 t14 t16 t18 t22 t23 t24 t26 t44.
- **Round and curved:** rt (round tile 1×1), rt22, rp (round plate 1×1), rp22, round (round brick 1×1), rb22, qt11 (quarter tile 1×1), qt (quarter tile 2×2), mac (macaroni).
- **Slopes:** ch (cheese 1×1 h2), st12 (slope30 1×2 h2), s21 (45 2×1 h3), s22 (45 2×2), s31 (33 3×1), slope, inv (inverted 2×1 h3), cs12 (curve 1×2 h2), cs14 (1×4 h3), cs22 (2×2 h2), cs24 (2×4 h3), cv13 (curve 1×3 h3), ics (inverted curve 1×2 h2).
- **Wedges:** wedge 2×2 h1, wl/wr (wedge plates 2×4 h1).
- **Car detail:** grl (grille 1×2), jmp (jumper 1×2), hl, bigl, tl (1×1 h3 lights), light, prH, prN, prG (printed tiles), lp (number plate 2×1 h2), mir (mirror 1×1 h2), stw (steering wheel 2×1 h2), exhaust, stack, pipes, sidep, diff, scoop, spoiler, wing, bump, bar, siren, sign, ant, seat, drv.
- **Arches, windows and wheels:** arch (mudguard 2×4 h6), ab14 (arch 1×4 h3), fender, ws4 (screen 2×4 h4), ws6 (screen 3×6 h5), bubble, G1x2, G1x4 (windows h6), and the wheels wS, wM, wL, wXL, wMT.

**Size mismatches found while verifying** (these are not missing parts):
- `ws4` is 4 plates tall, but the real windscreen 2×4×2 (3823) is 2 bricks = 6 plates (LDraw 48 LDU).
- `cs24` is 3 plates tall, but the real curved slope 2×4 (88930) is 2 plates (16 LDU).
- `arch` is 2 studs deep, but the real mudguards 3387 and 50745 are 2.5 studs deep (≈49 LDU).

## 2. Inventory, 40468 Yellow Taxi (PDF parts list, 45 lines)
Source: PDF pages 42–43. Each element was resolved at `https://brickset.com/parts/<element>`. "Have" means our catalogue has the same shape: Y = yes, **N** = missing, ~ = approximate.

| Element | Qty | Brickset name | Design | Colour | Have |
|---|---|---|---|---|---|
| 6286834 | 4 | Roof tile 1x1 45° w/o knobs | 35464 | White | **N** |
| 4667575 | 2 | Brick 1x2 w. four knobs | 52107 | White | **N** |
| 306901 / 307026 / 307024 | 2/2/2 | Flat tile 1x2 / 1x1 / 1x1 | 3069 / 3070 / 3070 | White / Black / Yellow | Y |
| 243101 / 243124 | 2/1 | Flat tile 1x4 | 2431 | White / Yellow | Y |
| 300101 / 300424 / 300526 / 301026 / 4211795 | 1/2/1/1/1 | Brick 2x4 / 1x2 / 1x1 / 1x4 / 2x6 | 3001/3004/3005/3010/44237 | various | Y |
| 302123 | 1 | Plate 2x3 | 3021 | Bright Blue | Y |
| 4504381 | 4 | Roof tile 1x1x2/3 | 54200 | Yellow | Y (ch) |
| 6281992 | 2 | Lamp holder | 41632 | Yellow | not verified |
| 6092583 / 6066097 | 16/3 | Plate 1x2 w/ 1 knob | 15573 | Yellow / Med. Stone Grey | Y (jmp) |
| 4121965 | 2 | Roof tile 1x2/45° | 3040 | Yellow | Y (s21) |
| 6117938 | 6 | Angle plate 1x2 / 2x2 | 21712 | Yellow | **N** |
| 366024 | 8 | Roof tile 2x2/45 inv. | 3660 | Yellow | **N** |
| 4558172 | 4 | Flat tile 1x3 | 63864 | Yellow | Y |
| 6179184 | 2 | Flat tile 2x3 | 26603 | Yellow | Y |
| 371024 / 4211001 | 1/3 | Plate 1x4 | 3710 | Yellow / Dark Stone Grey | Y |
| 4597902 | 2 | Plate w. bow 2x4x2/3 | 88930 | Yellow | ~ (cs24 too tall) |
| 302024 / 302026 | 1/3 | Plate 2x4 | 3020 | Yellow / Black | Y |
| 366624 | 4 | Plate 1x6 | 3666 | Yellow | Y |
| 663624 | 4 | Flat tile 1x6 | 6636 | Yellow | Y |
| 379524 | 4 | Plate 2x6 | 3795 | Yellow | Y |
| 303224 | 1 | Plate 4x6 | 3032 | Yellow | Y |
| 6256435 | 2 | Flat tile 1x1, 1/2 circle | 35399 | Black | **N** |
| 241226 | 2 | Radiator grille 1x2 | 2412 | Black | Y (grl) |
| 6029208 / 6029209 | 4/4 | Tyre narrow Ø21×9.9 / Rim narrow Ø14.6×9.9 | 11209 / 11208 | Black / MSG | Y (wheels) |
| 6097381 | 2 | Bearing element 2x4 mini snap | 18892 | Black | implicit (axle) |
| 302328 | 1 | Plate 1x2 | 3023 | Dark Green | Y |
| 6245250 | 2 | Roof tile 1x1x2/3 | 35338 | Transparent | Y (ch) |
| 6220959 | 2 | Brick 1x1 | 35382 | Transparent | Y |
| 6277460 | 2 | Roof tile 1x2/45° | 35281 | Transparent | Y (s21) |
| 6244904 | 2 | Brick 1x2 w/o pin | 35743 | Transparent | Y |
| 6244886 | 3 | Roof tile 2x2/45° | 35277 | Transparent | Y (s22) |
| 6254248 | 2 | Flat tile 1x1 | 35403 | Trans. Red | Y (tail light) |
| 4211429 | 2 | Plate 1x3 | 3623 | MSG | Y |
| 6000970 | 1 | Plate 2x14 | 91988 | Dark Stone Grey | **N** (longest plate is 2×8) |

The Brickset inventory for 40468-1 lists 48 lines. It adds alternate element numbers for the transparent and bearing parts (6369923, 6507936, 6514100, 6514262).

The other sets have 107 (P), 121 (M), 94 (S) and 53 (C) inventory lines, 222 distinct design IDs in all. The parts they use most that our catalogue lacks are ranked below.

## 3. Ranked missing parts (top 40)
Columns:
- **W×L** = footprint in studs.
- **H** = body height in plates, studs not counted.
- **LDU** = the LDraw bounding box x × y(height) × z.

The (converted) rule applies to every W×L and H value. The design ID is the LDraw/BrickLink-style ID. When Brickset files the set inventory under another design number, it is given as "BS nnnnn".

| # | Design | Name (LDraw title) | W×L | H | LDU | Model as | Sets (qty) |
|---|---|---|---|---|---|---|---|
| 1 | 87087 | Brick 1×1 with stud on 1 side | 1×1 | 3 | 20×24×20 | box + 1 side stud cylinder (snot anchor for lights and grilles) | P, M (4) |
| 2 | 99780 | Bracket 1×2–1×2 (LDraw "Up"; BS 99780 "angular plate 1.5 bot.", i.e. inverted) | 2×1 (+0.2 lip) | 2.5 | 40×20×24 | L of 2 boxes: plate 1×2 + vertical 1×2 plate hanging below | P, M, S (10) |
| 3 | 99781 | Bracket 1×2–1×2 (LDraw "Down"; BS "angular plate 1,5 top") | 2×1 (+0.2) | 2.5 | 40×20×24 | L of 2 boxes, vertical plate rising up; studs on both faces | P (4) |
| 4 | 44728 | Bracket 1×2–2×2 (BS 21712 "angle plate 1x2/2x2"; same shape, inferred) | 2×1 (+0.2) | 5 | 40×40×24 | plate 1×2 + vertical 2×2 plate | T (6) |
| 5 | 99207 | Bracket 1×2–2×2 inverted (BS "angular plate 1.5 bot. 1x2 2/2") | 2×1 (+0.2) | 5 | 40×40×24 | as #4, flipped down | M (3) |
| 6 | 36840 / 36841 | Bracket 1×1–1×1 up / down | 1×1 (+0.2) | 2.5 | 20×20×24 | L of 2 thin boxes | P, M (16) |
| 7 | 73825 | Bracket 1×1–2×1 up | 1×1 (+0.2) | 5 | 20×40×24 | 1×1 plate + vertical 1×2 plate | P, M, S (15) |
| 8 | 29119 / 29120 | Slope curved 2×1 with cutout right / left | 1×1.85 | 2 | 20×16×37 | cs12 curve with one 45° corner cut off (wedge-clip the profile) | P, M (26) |
| 9 | 2420 | Plate 2×2 corner | 2×2 L | 1 | 40×8×40 | L of two 1×2 plate boxes, 3 studs | P, M (18) |
| 10 | 24246 | Tile 1×1 with rounded end (BS 35399 "1/2 circle") | 1×1 | 1 | 20×8×20 | box half + half-cylinder r = 0.5 stud | T, P, M, S (13) |
| 11 | 3660 | Slope 45 2×2 inverted (geometry 3660a) | 2×2 | 3 | 40×24×40 | brick box with the lower front edge chamfered 45° | T (8) |
| 12 | 1748 | Tile 1×2 half round | 1×2 | 1 | 40×8×20 | tile with one long side rounded (half-stadium) | P, M (12) |
| 13 | 3386 | Plate 1×1×2/3 half round with open side stud | 1×1 | 2 | 20×16×20 | half-cylinder + box, 1 side stud (headlight cup) | P, M (13) |
| 14 | 85861 | Plate 1×1 round with open stud | 1×1 | 1 | 20×8×20 | cylinder r 0.5 + hollow stud ring (trans light) | M, C (9) |
| 15 | 33909 | Plate 2×2 with 2 studs on one edge | 2×2 | 1 | 40×8×40 | plate box, 2 studs on one side only (half tiled) | P, M (9) |
| 16 | 3387 | Car mudguard 4×2.5×2 (with top studs) | 4×2.5 | 7 | 80×56×50 | box with a half-cylinder arch cut Ø≈3 studs; studs on top | P, M (8) |
| 17 | 86996 | Plate 1×1×0.667 | 1×1 | 2 | 20×16×20 | box 1×1×2 plates | P, M (8) |
| 18 | 1745 | Plate 1×2 half round with 1 centre stud | 1×2 | 1 | 40×8×20 | half-stadium plate, 1 offset stud | P (8) |
| 19 | 35480 / 77850 / 77845 | Plate 1×2 / 1×3 / 1×4 with round ends, open studs | 1×2–1×4 | 1 | 40/60/80×8×20 | stadium (box + 2 half-cylinders) | M (7), P (4), M (4) |
| 20 | 2310 | Slope 45 2×1 inverted with 0.667 cutout | 1×2 | 3 | 20×24×40 | inv slope with a 2-plate notch under the low end | M (6) |
| 21 | 14719 | Tile 2×2 corner | 2×2 L | 1 | 40×8×40 | L of two 1×2 tile boxes | P (6) |
| 22 | 78329 | Plate 1×5 | 1×5 | 1 | 100×8×20 | plate box (add to the generated `p` family) | P, M (5) |
| 23 | 15207 / 23950 | Panel 1×4×1 / 1×3×1, rounded corners | 1×4 / 1×3 | 3 | 80/60×24×20 | thin wall (0.2 stud) on a 1×n tile base; door or side-window frame | M, S, C (5) / P (2) |
| 24 | 5091 / 5092 | Tile 1×2 cut 45° left / right | 1.85×1 | 1 | 37×8×20 | tile box with one corner chamfered 45° | M (4) |
| 25 | 26601 | Plate 2×2 without corner (wedge plate) | 2×2 | 1 | 40×8×40 | plate with one corner cut 45° (triangle prism clip) | M (4) |
| 26 | 77844 | Plate 3×3 corner | 3×3 L | 1 | 60×8×60 | L plate, 5 studs | M (4) |
| 27 | 48336 / 2540 | Plate 1×2 with handle (type 2 / type 1) | 2×1.8 | 1.5 | 40×12×36 | plate + horizontal bar Ø3.2 mm on a long side (mirror or bumper mount) | M (4) / M (1) |
| 28 | 35464 | Slope 45 1×1 double (BS "roof tile 1x1 45° w/o knobs") | 1×1 | 2 | 20×16×20 | pyramid-roof corner: box with two adjacent top edges chamfered | T (4) |
| 29 | 37762 | Cylinder 1×1.333 with 0.5L bar and bar hole (BS "candle") | 0.72 dia | 4.94 | 14.5×39.5×14.5 | thin cylinder r 0.36 stud; exhaust tip or light pod | M (4) |
| 30 | 52107 / 11211 / 30414 / 22885 | Brick 1×2 with studs on sides / 2 studs on 1 side / 1×4 studs on side / 1×2×1.667 studs on 1 side | 1×2, 1×4 | 3 / 3 / 3 / 5 | 40×24×20 … | box with side studs (snot core for bumpers and grilles) | T (2), M (2), C (2), M (1) |
| 31 | 2437 | Windscreen 3×4×1.333 (60312 lists BS 35279 "windscreen 4x3x1 1/3"; same shape, inferred) | 4×3 | 4 | 80×32×60 | thin slanted panel + 1×4 base strip (trans) | C (4) |
| 32 | 65632 | Windscreen 6×6×1.667 curved | 6×6 | 5 | 120×40×120 | curved shell: sliced cylinder sector, trans | M, S (2) |
| 33 | 32803 | Slope curved 2×2 inverted | 2×2 | 2 | 40×16×40 | ics widened to 2 | M, S (3) |
| 34 | 43710 / 43711 | Wedge 4×2 double left / right | 2×4 | 3 | 40×24×80 | brick-high wedge, two sloped faces meeting at a point | P (2) |
| 35 | 65426 / 65429 / 51739 | Wing 2×4 truncated R/L, wing 2×4 | 1.93×3.5 / 3.85×2 | 1 | 38.5×8×70 / 77×8×40 | plate with one or two 45° cut sides (nose plate) | P (2), M (1) |
| 36 | 30357 | Plate 3×3 with 2×2 round corner | 3×3 | 1 | 60×8×60 | plate, one corner a quarter-circle r = 3 studs | P (2) |
| 37 | 3678 | Slope 65 2×2×2 (geometry 3678a) | 2×2 | 6 | 40×48×40 | 2-brick wedge, steep 65° face | S (3) |
| 38 | 2432 | Tile 1×2 with handle | 1×2 | 4 incl. bar | 40×32×20 | tile + arched bar on top (roof rack or push bar) | C (1) |
| 39 | 37352 | Brick 1×2 with curved top | 1×2 | 3 | 40×24×20 | box, top rounded across its width (quarter round) | S (2) |
| 40 | 91988 | Plate 2×14 | 2×14 | 1 | (not run in LDraw) | plate box (chassis; Brickset element 6000970) | T (1) |

**Also checked (on LDraw, not in the five inventories).**
- 3823 windscreen 2×4×2: 4×2, 6 plates (80×48×40). Fixes `ws4`.
- 98282 mudguard 4×2.5×1: 4×2.45, 4 plates.
- 50745 mudguard 4×2.5×2 (C): 4×2.4, 6 plates. Matches `arch`.
- 6091 brick 2×1×1.333 curved top: 1×2, 4 plates.
- 60481 slope 65 2×1×2: 1×2, 6 plates.
- 61252 plate 1×1 clip horizontal: 1×1.7, 1.86 plates.
- 63868 plate 1×2 clip on end: 2.7×1.
- 60478 plate 1×2 handle on end: 2.8×1, 1.5 plates.
- 92280 plate 1×2 clip on top: 2×1, 2.25 plates.
- 15712 tile 1×1 clip: 1×1, 2.25 plates.
- 4599 tap (C): 0.8×1.4, 3 plates.
- 64567 lightsaber hilt (via 577b): Ø0.8, 3.88 plates. Exhaust.
- 30374 bar 4L: Ø0.4, 10 plates.
- 4070 brick 1×1 headlight: 1×1, 3 plates. Already present as `hl`.

**Not resolved.**
- Brickset design 35283 "windscreen 3x6 25 deg." (S) is not in LDraw under that number.
- Brickset 41632 "lamp holder" (T) was not checked.

## Sources
- LEGO 40468 instructions PDF: https://www.lego.com/cdn/product-assets/product.bi.core.pdf/6607919.pdf (parts list pp. 42–43)
- Brickset element pages: `https://brickset.com/parts/<element id>` (all 45 elements of 40468, e.g. https://brickset.com/parts/6286834)
- Brickset inventories:
  - https://brickset.com/inventories/40468-1
  - https://brickset.com/inventories/76916-1
  - https://brickset.com/inventories/76920-1
  - https://brickset.com/inventories/31127-1
  - https://brickset.com/inventories/60312-1
- LDraw official library geometry: `https://library.ldraw.org/library/official/parts/<design>.dat` (for example https://library.ldraw.org/library/official/parts/87087.dat), with subparts and primitives resolved under `parts/s/` and `p/`. Moved IDs (3660, 3678, 3040, 3665, 41769, 4865, 4085, 4599, 577b) were measured through their target files (3660a, 3678a, …).
- Unit basis (also in docs/research/TILES_88y.md): LDraw spec https://www.ldraw.org/article/218.html. 1 stud = 20 LDU (8 mm), 1 plate = 8 LDU (3.2 mm), 1 brick = 24 LDU (9.6 mm).
- Prior game research: docs/research/TILES_88y.md, docs/research/BUILDER_2K.md.

## What v89d added (src/98gb_garage13.js, 31 parts)
Grid rule: footprints are whole studs and heights whole plates, so 2.5-plate brackets are 3 plates and the 1.85-stud curved wedges are 2 studs long.
- **Tiles:** 14719 corner 2×2, 35399 1×1 half round, 1748 1×2 half round, 35787 2×2 cut corner, 27263 2×2 triangle, 2432 1×2 with handle
- **Slopes:** 35464 45 1×1 double, 3660 inverted 2×2, 50950 curved 3×1, 3678 65 2×2, 29120/29119 curved wedge L/R, 32803 inverted curve 2×2
- **Plates:** 26601 wedge 2×2, 2420 corner 2×2, 35480 1×2 rounded, 2540 1×2 handle; 28626 round 1×1 with hole; 31561 1×1 with bar
- **SNOT (new tab):** 87087, 99781, 99780, 36840, 36841, 21712, 21731, 28802, 52107, 11211, 2877 (grille brick), 15533
- **Already in the catalogue:** headlight brick 4070 = `hl`. Search also finds parts by alias and design ID.
- **Not changed (this would change existing builds):** ws4 height 4→6, cs24 3→2, arch depth 2→2.5. These are left for a separate fix.
