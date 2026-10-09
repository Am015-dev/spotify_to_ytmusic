# Tiles research (v88y, 2026-10-09)

Base facts (opened: LDraw spec https://www.ldraw.org/article/218.html: 1 brick width = 20 LDU, brick height = 24 LDU, plate height = 8 LDU, 1 LDU ≈ 0.4 mm;
LUGNET FAQ https://lugnet.com/~330/FAQ/Build/dimensions, via search summary: measured pitch 7.985 mm, brick 9.582 mm, plate 3.194 mm):
**stud pitch 8 mm, plate 3.2 mm, brick 9.6 mm (= 3 plates), 2/3 brick = 2 plates = 6.4 mm.** Stud ≈ 4.8–5 mm diameter, 1.6–1.7 mm tall.

How each row was checked: names and cross-refs came from Buka Atlas (it mirrors the Rebrickable and BrickLink IDs) and Brickset design pages. Sizes and shape came from bounding boxes computed from the official LDraw `.dat` geometry (20 LDU = 1 stud, 8 LDU = 1 plate).
Rebrickable (HTTP 403, Cloudflare) and BrickLink (HTTP 405, human check) could not be opened directly, so their IDs are cross-references, not pages I opened.
Source abbreviations: **BA** = https://buka-atlas.com/parts/<id>/ ; **BS** = https://brickset.com/parts/design-<id> ; **LD** = https://library.ldraw.org/library/official/parts/<id>.dat

| Game id | Part | Design ID | Studs (w×d) | Height | Shape | Source |
|---|---|---|---|---|---|---|
| t11 | Tile 1 x 1 (with groove) | 3070b (BL 3070) | 1×1 | 1 plate, 3.2 mm | Flat smooth top, bottom groove | BA 3070b; BS 3070; LD 3070b (20×20×8 LDU) |
| t12 | Tile 1 x 2 (with groove) | 3069b (BL 3069) | 1×2 | 3.2 mm | Flat | BA 3069b; BS 3069; LD 3069b (40×20×8) |
| t13 | Tile 1 x 3 | 63864 | 1×3 | 3.2 mm | Flat | BA 63864; BS 63864; LD 63864 (60×20×8) |
| t14 | Tile 1 x 4 | 2431 | 1×4 | 3.2 mm | Flat | BA 2431; BS 2431; LD 2431 (80×20×8) |
| t16 | Tile 1 x 6 | 6636 | 1×6 | 3.2 mm | Flat | BA 6636; BS 6636; LD 6636 (120×20×8) |
| t18 | Tile 1 x 8 | 4162 | 1×8 | 3.2 mm | Flat | BA 4162; BS 4162; LD 4162 (160×20×8) |
| t22 | Tile 2 x 2 (with groove) | 3068b (BL 3068) | 2×2 | 3.2 mm | Flat | BA 3068b; BS 3068; LD 3068b (40×40×8) |
| t23 | Tile 2 x 3 | 26603 | 2×3 | 3.2 mm | Flat | BA 26603; BS 26603; LD 26603 (60×40×8) |
| t24 | Tile 2 x 4 | 87079 | 2×4 | 3.2 mm | Flat | BA 87079; BS 87079; LD 87079 (80×40×8) |
| t26 | Tile 2 x 6 | 69729 | 2×6 | 3.2 mm | Flat | BA 69729; BS 69729 ("TILE 2X6"); LD 69729 (120×40×8) |
| rt | Tile, Round 1 x 1 | 98138 | 1×1 | 3.2 mm | Disc, Ø 1 stud (8 mm) | BA 98138; BS 98138; LD 98138 (20×20×8) |
| rt22 | Tile, Round 2 x 2 with Bottom Stud Holder | 14769 (variant: 4150 "Tile, Round 2 x 2", bottom cross axle holder) | 2×2 | 3.2 mm | Disc, Ø 2 studs (16 mm). 14769 has a round underside stud holder; 4150 has a cross underside | BA 14769, BA 4150; BS 14769, BS 4150; LD 14769, LD 4150 (both 40×40×8) |
| qt11 | Tile, Round 1 x 1 Quarter | 25269 | 1×1 | 3.2 mm | Quarter disc, radius 1 stud (8 mm), centred on one corner (LD uses `1-4disc` r = 20 LDU) | BA 25269; BS 25269 ("1/4 CIRCLE TILE 1X1"); LD 25269 |
| mac | Tile, Round Corner 2 x 2 Macaroni | 27925 | 2×2 | 3.2 mm | Quarter ring centred on one corner: inner r = 1 stud (8 mm), outer r = 2 studs (16 mm) (LD `1-4ring1` 20→40 LDU) | BA 27925; BS 27925 ("TILE 2X2, W/ BOW"); LD 27925 (keyword "macaroni") |
| st12 | Slope 30 1 x 2 x 2/3 | 85984 | 2 wide × 1 deep | 2/3 brick = 2 plates (LD max 15.6 LDU ≈ 6.2 mm, rounded top edge) | 30° slope runs across the 1-stud depth: from a ≈1.6 mm (4 LDU) front lip up to full height at the back, with a small rounded crest; no studs | BA 85984; BS 85984 ("ROOF TILE 1 X 2 X 2/3"); LD 85984 |
| st21 | Same part as st12 rotated 90° | 85984 | 1×2 rotated | 2 plates | There is no separate "2×1" 30° slope tile. BrickLink/Rebrickable list only "Slope 30 1 x 2 x 2/3". (Different part: 11477 "Slope, Curved 2 x 1 x 2/3", a curved 2-long slope, 2 plates tall) | BA 85984; BA 11477; LD 11477 (40 long × 20 × 16 LDU) |
| ch | Slope 30 1 x 1 x 2/3 ("cheese slope") | 54200 | 1×1 | 2 plates (LD 15.6 LDU) | Same profile as 85984, 1 stud wide | BA 54200; BS 54200 ("ROOF TILE 1X1X2/3"); LD 54200 (keyword "cheese") |
| cv13 | Slope, Curved 3 x 1 (No Studs) | 50950 | 1×3 | **1 brick = 3 plates (9.6 mm)** at the high end | Curved quarter-pipe-style top running along the 3-stud length: full brick height at one end, down to a ≈1.6 mm (4 LDU) lip at the other; no studs | BA 50950; BrickOwl (in search results only) lists "3 x 1 x 1"; LD 50950 (60×20×24 LDU) |
| grl | Tile, Modified 1 x 2 Grille with Bottom Groove | 2412b | 1×2 | 3.2 mm | Flat tile with a recessed slotted grille on top running along the 2-stud length (exact bar count not verified) | BA 2412b; BS 2412 ("RADIATOR GRILLE 1X2"); LD 2412b |
| jmp | Plate, Modified 1 x 2 with 1 Stud with Groove (Jumper) | 3794b (newer mould with bottom stud holder: 15573) | 1×2 | 1 plate (3.2 mm) + 1 centred stud (≈1.6–1.7 mm) | Smooth 1×2 top with ONE stud centred between the two stud positions (half-stud offset) | BA 3794b, BA 15573; BS 3794, BS 15573; LD 3794b, LD 15573 (40×20, 8+4 LDU) |
| prH | Tile, Round 1 x 1 with Headlight Pattern | 98138pr0005 (BL 98138pb006) | 1×1 | 3.2 mm | Round 1×1 tile with a headlight print. Car alternative: 27925pr0009, a Macaroni tile with a Ford GT headlight print (Speed Champions) | https://buka-atlas.com/parts/98138pr0005/ ; https://buka-atlas.com/parts/27925pr0009/ |
| prN | Tile 1 x 2 with License Plate 'AT 76269' print | 3069bpr9978 (BL 3069pb1208) | 1×2 | 3.2 mm | 1×2 tile with a black-text number plate print (2023) | https://buka-atlas.com/parts/3069bpr9978/ |
| prG | Tile, Round 1 x 1 with Gauge print | 98138pr0430 (BL 98138pb444) | 1×1 | 3.2 mm | Round 1×1 tile, white dial with a black pointer, a gold ring and a copper section (2025) | https://buka-atlas.com/parts/98138pr0430/ |

Notes
- The LDraw heights exclude studs. All tiles are 8 LDU = 1 plate. The slopes are 16 LDU (2 plates) nominal, and cv13 is 24 LDU (1 brick).
- I could not find a 1×4 tile with a printed licence plate (only sticker versions). 3069bpr9978 is a real printed 1×2.
- "Not verified": the bar count on the grl grille, and every page on Rebrickable and BrickLink (blocked).

## How v88y models them (src/98pa_garage_parts.js, Tiles tab)
- Flat tiles: `tile` (1×2, existing), `t11 t13 t14 t16 t22 t24 t44` (existing), new `t18 t23 t26`: 1 plate, no studs.
- `rt` round 1×1, new `rt22` round 2×2 (Ø 2 studs); new `qt11` quarter 1×1 (r = 1 stud, centre on the back-right corner; ⟳ / mirror for the others);
  `qt` (existing quarter 2×2); new `mac` macaroni 2×2 (quarter ring, r 1–2 studs).
- New `st12` Slope 30 1×2 (85984): 2 wide, the slope over the 1-stud depth, 2 plates high, 1.6 mm front lip. There is no separate 2×1 part (above), so the
  2×1 is the same part turned with ⟳ ROTATE. New `cv13` curved 3×1 (50950): 1 brick at the high end, curving over 3 studs.
- `grl` grille 1×2 and `jmp` jumper 1×2 (existing) moved into Tiles.
- Printed: new `prH` round 1×1 headlight (98138pr0005), `prN` 1×2 number plate (3069bpr9978), `prG` round 1×1 gauge (98138pr0430). Prints are modelled as
  thin coloured inlays; the headlight lens and the gauge needle glow.
