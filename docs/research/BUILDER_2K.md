# Builder research: PDF test script, 2K Drive Garage, big-vehicle templates

Researched 8 Oct 2026 from web sources only. Every fact has a source link. Where something is my own reading of a
drawing or a unit conversion, it says **(read from drawing)** or **(converted)**.

Sources used throughout:
- [PDF] LEGO building instruction, `CAR_Building-Instruction_Vehicles-PP-2021.pdf`:
  https://www.lego.com/cdn/cs/set/assets/bltdeea0c74389a8840/CAR_Building-Instruction_Vehicles-PP-2021.pdf
- Part names: Brickset part pages, `https://brickset.com/parts/<element id>` (element ids are printed in the PDF parts list).

---

## 1. The PDF: what it builds

| Item | Finding | Source |
|---|---|---|
| What it is | One "Rebuild the world" hot-rod/racer with a minifig driver, flames at the back, small spoked front wheels and big off-road rear tyres. It is built from parts of five sets shown on page 2: 11014, 60242, 60248, 60251, 60270. | [PDF] p.1 (cover photo), p.2 (set boxes) |
| Pages | 8 pages, A4 landscape (841.89 × 595.28 pt). | `pdfinfo` on [PDF] |
| Steps | 34 numbered main steps + 3 sub-assemblies (5, 5 and 4 sub-steps, at steps 14, 16, 18). | [PDF] pp.2–8 |
| Parts list | 66 element lines on page 2 (one "Nx element-id" per line). | [PDF] p.2 |
| Copyright line | "©2021 The LEGO Group." | [PDF] p.8 |

### Build order (as drawn)
1. **Spine / chassis plates (steps 1–3):** three long plates stacked: red 2×8, black 2×10, tan 2×10. [PDF] p.2
2. **Axle holders (steps 4–5):** black 2×4 wheel bearing at the front, red 4×6 plate as the floor, dark-grey 2×4
   wheel suspension at the rear. [PDF] p.2–3
3. **Floor detail (steps 6–7):** white 2×6, tan 1×2s, green 1×3s, dark-grey 2×4. [PDF] p.3
4. **Body walls (steps 8–10):** two red 1×4 bricks (cockpit sides), steering wheel, white 2×4 brick (dashboard). [PDF] p.3
5. **Nose (steps 11–13):** dark-blue 1×2 brick, front angle plate (studs facing forward), lime 1×2 plate,
   white wheel-arch brick. [PDF] p.3
6. **Rear bumper + flames (14–15), grille (16), bonnet slopes (17–19), rear deck (20–24), seat/driver (25–26),
   windscreen (27), rear arch + engine (28–32).** [PDF] pp.4–7
7. **Wheels last (33 front, 34 rear).** [PDF] p.8

So: chassis plates → axle holders → floor → walls → nose → sub-assemblies → cockpit → roof/engine → wheels.

### Size of the finished car (read from drawing)
- **Footprint:** chassis is **4 studs wide × 10 studs long** (4×6 floor + 2-long front bearing + 2-long rear
  suspension, all 4 wide; step 5). The bumper (14) and grille (16) add about 1 stud at each end → **≈4 × 12**.
  With wheels sticking out each side, the overall width is **≈6–7 studs**.
- **Height:** spine is 3 plates (y 0–2); the floor (4×6 plate) is the 4th plate; side bricks reach plate 7;
  bonnet, windscreen and engine reach roughly **12–14 plates (≈4–5 bricks)** above the bottom of the spine.

### Part identities used below (Brickset)
| Element (from PDF p.2) | Brickset name | Source |
|---|---|---|
| 303421 | Plate 2×8 (design 3034), bright red | https://brickset.com/parts/303421 |
| 383226 | Plate 2×10 (3832), black | https://brickset.com/parts/383226 |
| 4249019 | Plate 2×10 (3832), brick yellow (tan) | https://brickset.com/parts/4249019 |
| 6097381 | Bearing element 2×4 mini snap (18892), black | https://brickset.com/parts/6097381 |
| 303221 | Plate 4×6 (3032), bright red | https://brickset.com/parts/303221 |
| 6351293 | Wheel suspension 2×4 w/ snap (40687) | https://brickset.com/parts/6351293 |
| 379501 | Plate 2×6, white | https://brickset.com/parts/379501 |
| 4113917 | Plate 1×2 (tan in drawing) | https://brickset.com/parts/4113917 |
| 4107758 | Plate 1×3 (green in drawing) | https://brickset.com/parts/4107758 |
| 4211395 | Plate 2×4 (dark grey in drawing) | https://brickset.com/parts/4211395 |
| 301021 | Brick 1×4, red | https://brickset.com/parts/301021 |
| 300101 | Brick 2×4, white | https://brickset.com/parts/300101 |
| 4249891 | Brick 1×2 (dark blue in drawing) | https://brickset.com/parts/4249891 |
| 6158058 | Angle plate 1×2 / 2×4 (white, studs face forward) | https://brickset.com/parts/6158058 |
| 4164037 | Plate 1×2 (lime in drawing) | https://brickset.com/parts/4164037 |
| 4259940 | Brick 2×4×1 w. screen (white wheel arch in drawing) | https://brickset.com/parts/4259940 |

---

## 2. PDF test script (steps 1–13, pages 2–3) — the one to reproduce

**Grid:** x = across the width, 0 = driver's left … 3 = right (4 studs). z = along the length, **0 = front**
(the end that gets the grille and small wheels), 9 = rear. y = layer in **plates**, y 0 = bottom of the first plate;
a brick is 3 plates tall, a plate 1. "x0–3" means it covers studs 0 to 3 inclusive.
Positions are read from the drawings; treat ±1 stud on the small detail parts (steps 6–7, 11) as tolerance.
Steps 1–5, 8 and 10 are clear in the drawings and should be checked exactly.

| # | Part (colour) | Orientation | Position (x, z, y) | What the drawing shows |
|---|---|---|---|---|
| 1 | Plate 2×8, red | lengthwise | x1–2, z2–9, y0 | One long red plate on its own. |
| 2 | Plate 2×10, black | lengthwise | x1–2, z0–9, y1 | Sits on the red plate, flush at the rear, **overhangs 2 studs at the front** (leaves a gap underneath at z0–1). |
| 3 | Plate 2×10, tan | lengthwise | x1–2, z0–9, y2 | Exactly on top of the black plate. Spine is now 3 plates tall. |
| 4 | Bearing element 2×4 (front axle holder), black | **crosswise** (4 wide × 2 long) | x0–3, z0–1, under/around the spine overhang; top at y3 | Front wheel pins stick out at x−1 and x4. Tan spine studs show in the middle. |
| 5a | Plate 4×6, red (floor) | lengthwise | x0–3, z2–7, y3 | Big red floor over the spine. |
| 5b | Wheel suspension 2×4 (rear axle), dark grey | crosswise | x0–3, z8–9, y3 | Rear wheel pins at x−1 and x4. Car is now 4×10. |
| 6 | Plate 2×6, white + 2× plate 1×2, tan | white lengthwise; tan lengthwise | white x1–2, z4–9, y4; tan x0 and x3, z8–9, y4 | White strip down the middle, tan plates on both rear corners. |
| 7 | 2× plate 1×3, green + plate 2×4, dark grey | lengthwise | green x0 and x3, z7–9, y5; grey x1–2, z6–9, y5 | Rear deck raised by one plate. |
| 8 | 2× brick 1×4, red (cockpit sides) | lengthwise | x0 and x3, z3–6, y4–6 | Two side walls; white studs visible between them. |
| 9 | Steering wheel on a blue 1×? support | — | x1–2, z3, y4 | Blue upright + grey steering wheel between the walls. |
| 10 | Brick 2×4, white (dashboard) | crosswise | x0–3, z1–2, y4–6 | White block in front of the walls. |
| 11 | Brick 1×2, dark blue + small plate, reddish brown | crosswise | x1–2, z0, y4–6 (brown plate under it at y3) | Nose filler on the front axle holder. |
| 12 | Angle plate 1×2/2×4, white + plate 1×2, lime | angle plate's 2×4 face points **forward** | angle plate at z0, face at z−1 (8 forward studs); lime plate x1–2, z0, y7 | Forward-facing studs for the grille (used at step 16). |
| 13 | Wheel-arch brick 2×4, white | crosswise | x0–3, z0–1, y7–9 | Arch over the front wheels; finishes the nose. |

**Pass condition for our builder:** after step 5 the model is exactly 4 × 10 studs and 4 plates tall at the floor;
after step 13 the nose (z0–1) is ~10 plates tall and the cockpit walls end at y6. The ghost/next-step preview
should be able to show each row above as one placement.

---

## 3. LEGO 2K Drive Garage — how it works

| Topic | Finding | Source |
|---|---|---|
| Where | The Garage is where you build and modify vehicles; reachable from the main menu, and Garages on the Story map also act as fast-travel points. | https://lego.2k.com/drive/garage/ (via search summary; page now redirects to 2k.com) |
| Vehicle types | New vehicle: choose **Street, Off-Road or Water**. | https://www.touchtapplay.com/how-to-build-a-custom-car-in-lego-2k-drive/ |
| Start point | "After selecting a base – the axel and wheels – you can choose from hundreds of bricks." | https://gameinformer.com/preview/2023/03/23/lego-2k-drive-preview-a-refreshing-kickstart |
| Four wheels only | All base builds have four tyres: no motorcycles or trikes. | Epic Games Store news (via search summary): https://store.epicgames.com/en-US/news/lego-2k-drive-brings-your-colorful-building-brick-creations-to-life |
| Body Shop tools | **Build** (place bricks), **Group** (lock bricks into one piece), **Paint**, **Customize** (stickers, animations). | https://www.touchtapplay.com/how-to-build-a-custom-car-in-lego-2k-drive/ |
| Catalogue | Bricks "sorted by type and category" in the **Brick Drawer**; "over 1,000 unique LEGO pieces" over the adventure. | https://mp1st.com/news/lego-2k-drive-details-on-game-modes-multiplayer-features-and-customization-listed |
| Placing | You pull a brick onto the screen, rotate or flip it, then snap it stud-to-tube. | Epic Games Store (via search summary), link above |
| Orientation | "Each block can be manipulated for orientation in exactly the same way it could if it were in your hands." | https://www.gtplanet.net/?p=125445 |
| Mirror | Developer: tools "like the ability to mirror one side of a vehicle or change colors on the fly." Reviewer: "build half a vehicle and mirror it to the other side." | https://news.xbox.com/en-us/?p=193132 ; https://jalopnik.com/lego-2k-drive-racing-game-review-1850470709/ |
| Paint | Bricks coloured individually; several selected bricks can be recoloured; flat, metallic, glowing finishes; clear red bricks can glow when braking. Batch-recolour all bricks of one colour. | https://www.gtplanet.net/?p=125445 ; https://jalopnik.com/lego-2k-drive-racing-game-review-1850470709/ |
| Undo | "An Undo function is available." | https://www.gtplanet.net/?p=125445 |
| Piece budget | 350-element limit, plus size restrictions. | Epic Games Store (via search summary), link above |
| Size limit | "around 20 studs wide, 30 studs long, and 12 studs tall" (reviewer's estimate). Developer: "The Garage floor will keep your construction project within the size limitations." | https://www.gtplanet.net/?p=125445 ; https://news.xbox.com/en-us/?p=193132 |
| Can't build a dud | "it doesn't seem that you can build a vehicle that won't work." | https://gameinformer.com/preview/2023/03/23/lego-2k-drive-preview-a-refreshing-kickstart |
| Weight classes | More bricks = heavier; six weight classes **Super Light to Massive**. (Our "truck" equivalent is a weight class, not a separate chassis.) | https://lego.2k.com/drive/garage/ (via search summary) ; https://mp1st.com/news/lego-2k-drive-details-on-game-modes-multiplayer-features-and-customization-listed |
| Handling | Long builds like a top-fuel dragster corner poorly; lean sports cars handle sharply. | https://news.xbox.com/en-us/?p=193132 (via search summary) |
| Guided builds | Step-by-step guided builds for players with no design in mind; tutorials can be replayed. | https://lego.2k.com/drive/garage/ (via search summary) ; https://news.xbox.com/en-us/?p=193132 |
| Safe editing | "Modify" makes an exact copy of the chosen car, so the original is untouched. | https://lego.2k.com/drive/garage/ (via search summary) |
| Camera | PlayStation default controls: right stick moves the camera, R1 changes camera view. No preset list found. | https://www.playstation.com/en-ph/games/lego-2k-drive (via search summary) |
| Layer / grid control | **Not found** in any source checked. | — |

### What made building HARD (players/reviewers)
- Camera vs placement: "The positioning of a brick will change drastically with the movement of the camera" and
  "sometimes you need to adjust the camera just to see." — https://cogconnected.com/review/lego-2k-drive-review/
- One-tap disaster: "incredibly easy to delete the entire vehicle with two button presses", no warning or undo hint.
  — https://cogconnected.com/review/lego-2k-drive-review/
- "The controls are fiddly, and sometimes things snap in the wrong place." Tutorial screen overwhelmed kids; weight
  system hard to understand. — https://www.rapidreviewsuk.com/lego-2k-drive/
- Tedious: several menus, pick exact piece, rotate, then click in. — Checkpoint Gaming (via search summary):
  https://checkpointgaming.net/reviews/2023/05/lego-2k-drive-review-get-all-your-motors-bricking/
- Rotating hinged pieces takes too many button presses. — Brick Fanatics (via search summary):
  https://www.brickfanatics.com/lego-2k-drive-hands-on-preview-racing-game
- Blank slate is hard if you're used to instructions. — https://jalopnik.com/lego-2k-drive-racing-game-review-1850470709/ ;
  https://gameinformer.com/preview/2023/03/23/lego-2k-drive-preview-a-refreshing-kickstart
- Paywalled bricks may stop you building what you want. — https://www.gtplanet.net/?p=125445

### What made it EASY
- Mirror + batch recolour "that much easier"; editor "very intuitive". — https://jalopnik.com/lego-2k-drive-racing-game-review-1850470709/
- "Looks very daunting at first" but "pretty easy to pick up"; undo + tutorials. — https://www.gtplanet.net/?p=125445
- Snap-build suits LEGO; tools are accessible. — https://www.well-played.com.au/lego-2k-drive-review/
- Guided builds, pre-built start models, Modify-a-copy. — https://lego.2k.com/drive/garage/ ; https://news.xbox.com/en-us/?p=193132
- Limits stop you making something that won't drive. — https://gameinformer.com/preview/2023/03/23/lego-2k-drive-preview-a-refreshing-kickstart

---

## 4. Real LEGO big-vehicle templates (true proportions)

Brickset gives a model size as three numbers without labels; the order below is assigned by which figure is
obviously the length. Studs **(converted)** at 8 mm/stud and rounded; plates at 3.2 mm, bricks at 9.6 mm.

| Template | Set | Pieces | Size (cm) | ≈ studs W × L | ≈ height | Wheels / chassis | Sources |
|---|---|---|---|---|---|---|---|
| **Tow truck** | 60435 Tow Truck (2024) | 101 | 16 × 7 × 7 | built on a **6×16 car chassis**; 7 cm ≈ 9 wide incl. tyres/mirrors; 16 cm = **20 long** | 7 cm ≈ 7 bricks | 4× tyre Ø30.4×14 on rims 18×14 (big wheels) + 4× tyre Ø24×7 (spare/narrow) | https://brickset.com/sets/60435-1 ; https://brickset.com/inventories/60435-1 |
| **Bus** | 60407 Double-Decker Sightseeing Bus (2024) | 384 | 11 × 21 × 6 | body **6 wide** (City "mostly sticking to its 6 wides"; "narrower chassis"); 21 cm = **26 long** | 11 cm ≈ 11 bricks (two decks) | 4× tyre low Ø24×12 on rims 18×12; floor from 6×10 and 6×8 plates | https://brickset.com/sets/60407-1 ; https://brickset.com/article/110561/review-60407-double-decker-sightseeing-bus ; https://brickset.com/inventories/60407-1 |
| **Limousine** | 60102 Airport VIP Service (2016) | 364 (whole set) | limo 4 high × 21 long × 4 wide | 4 cm = **5 wide** (body most likely 4–6; not confirmed); 21 cm = **26 long** | 4 cm ≈ 4 bricks | Set contains 2×16 plates (likely the long floor; not confirmed) | https://www.lego.com/en-us/product/60102 (dimensions via search snippet; page blocks fetch) ; https://brickset.com/sets/60102-1 ; https://brickset.com/inventories/60102-1 |
| **Monster truck** | 60402 Monster Truck (2024) | 148 | 13 × 10 × 9 | 10 cm = **12–13 wide** incl. tyres; 13 cm = **16 long** | 9 cm ≈ 9 bricks | 4× **tractor tyre Ø56×26** on wide rims 30/20 (tyre = 7 studs tall, 3+ studs wide); spine plate 2×14 | https://brickset.com/sets/60402-1 ; https://brickset.com/inventories/60402-1 |

Comparison: the PDF racer is ≈4×12 studs. A fan semi tractor on LEGO Ideas is 8 wide × 25 long × 13 studs tall
(trailer 8 × 40 × 12) — https://ideas.lego.com/projects/65a5001b-53fb-46b5-b34a-5a671f75f42a (fan design, not a set).
2K Drive's estimated cap (20 × 30 × 12) fits all four templates. — https://www.gtplanet.net/?p=125445

---

## 5. What to build in our garage (ranked by impact on ease of building)

1. **Start from a chassis + wheels, not an empty floor.** The real PDF starts with spine plates and axle holders
   (§2 steps 1–5); 2K starts by picking "a base – the axel and wheels" (Game Informer). Offer car / truck / bus /
   limo / monster bases sized from §4.
2. **Guided build mode with a ghost of the next part** (§2 test script as the first level). 2K's guided builds help
   players who prefer instructions (2K Garage page; Game Informer; Jalopnik).
3. **Camera that never changes where the part lands.** Placement must use the stud under the finger, independent of
   orbit. Top complaint: "positioning of a brick will change drastically with the movement of the camera" (COGconnected).
   Add 3–4 preset views (top, side, front, 3/4).
4. **Layer control (current height shown and steppable).** Not found in 2K; the PDF works in clear layers
   (spine y0–2, floor y3, walls y4–6). A visible "layer N" with ▲▼ removes the "snaps in the wrong place" problem
   (Rapid Reviews).
5. **Mirror toggle** (build one side, other side copies). Called out by the developer and reviewers as making it
   "that much easier" (Xbox Wire; Jalopnik). The PDF car is symmetric about x1.5 (§2 steps 4–8).
6. **Undo/redo, and no one-tap "delete all".** Undo praised (GTPlanet); two-press full delete with no warning
   criticised (COGconnected). Work on a copy, like 2K's Modify (2K Garage page).
7. **Fewer taps per part: catalogue grouped by category, recent parts row, one-tap rotate.** Tedium of menus + rotate
   (Checkpoint); hinge rotation too many presses (Brick Fanatics); 2K's Brick Drawer sorts by type and category (mp1st).
8. **Paint bucket + "recolour all of this colour".** (GTPlanet; Jalopnik.)
9. **Visible piece budget and size box.** 2K: 350 elements and a floor that keeps builds inside the size limit
   (Epic Games Store; Xbox Wire; GTPlanet ≈20×30×12 studs). Show "pieces 87/350" and the box outline.
10. **"Can't build a dud" rules:** require 4 wheels on axle holders and a connected build before driving
    (Game Informer; Epic Games Store, four tyres).
11. **Plain-language weight/handling feedback** (heavier = slower/stronger; long = worse cornering). Kids found weight
    hard to understand (Rapid Reviews); dragster vs sports-car handling (Xbox Wire).
12. **Group/lock a sub-assembly** so it moves as one piece (2K Group tool, TouchTapPlay); matches the PDF's
    sub-assemblies at steps 14, 16, 18.
