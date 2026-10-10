# Model pipeline: real LEGO builds → garage / game (models-1, 2026-10-10)

Alex: "use the taxi as an example to build more complicated items; look on the web for LEGO builds".
The 40468 taxi was rebuilt by reading PDF pages by eye (32 steps, ~1 day). This pipeline converts a machine-readable LEGO model file
instead: every part, its exact position and rotation and its colour come from the file. Three proof models took minutes each.

## 1. Sources (checked 2026-10-10)

| Source | Format | Licence / reuse | Use here |
|---|---|---|---|
| **LDraw OMR** (Official Model Repository), library.ldraw.org/omr — 1,470 official LEGO sets | `.mpd` (multi-part LDraw text) | **CCAL 2.0** (= CC BY 2.0): redistributable, credit the author. Header line `0 !LICENSE Redistributable under CCAL version 2.0` | **yes: the main source** |
| **LDraw parts library**, library.ldraw.org/library/updates/complete.zip (146 MB zip, 621 MB unpacked) | `.dat` part geometry | CCAL 2.0 (parts authors) | geometry for parts our catalogue lacks; never shipped whole, only the converted meshes |
| Rebrickable MOCs (fan builds) | `.ldr` / `.io` downloads, often behind purchase | per designer, mostly "personal use"; **not reusable by default** | only with the designer's written OK |
| BrickLink Studio | `.io` (zip with an LDraw model inside) | the file's owner decides; the gallery has no reuse licence | can be imported (unzip → `model.ldr`) when the owner allows |
| Official LEGO instructions (lego.com PDF) | images | © LEGO, viewing only | by-eye reference (the taxi); not machine readable |
| Brickset / Rebrickable set images | jpg | © LEGO | the "official image" column of the comparison sheets only |

The 40468 Yellow Taxi is **not** in the OMR (checked the full 1,470-set list), so the taxi stays hand-built; the round trip was proven on three other sets.

### Models used (credits, also in `src/98ld0_data.js`)
| In game | LEGO set | LDraw file author | Why this one (recommended-option rule) |
|---|---|---|---|
| **Rally S1** (RIDES, street) | 76897 1985 Audi Sport quattro S1 (Speed Champions 2020, 250 pieces) | Adrien Pennamen | the only 8-wide Speed Champions set in the OMR (the reference look Alex wants) |
| **Harbour Speedboat** (RIDES, water) | 4641 Speed Boat (City Harbor 2011, 41 pieces) | juraj3579 / Steffen | modern minifig-scale boat with a real hull (plane bottom 6×10) |
| **Mainhattan bank** (Frankfurt world prop) | 1490 Town Bank (Classic Town 1988, building only: 112 parts) | Robert Paciorek (bercik) | no Frankfurt/Athens set exists; a bank suits the banking city, minifig scale = the cars' scale, small enough for the phone |

Names in the game are generic like the other RIDES (no brand names); the LEGO set number is the `ref`.

## 2. Formats
- **LDraw**: one line per part, `1 <colour> x y z a b c d e f g h i <part>.dat`: colour code, position (LDU), 3×3 rotation, part file.
  Units: 1 stud = 20 LDU, 1 plate = 8 LDU, 1 brick = 24 LDU. −Y is up. `.mpd` = several such files (submodels) in one.
- **Ours** (garage brick): `{t, x, z, y, r, m, c, ox, oy, oz, R}`: part key, cell (x/z studs, y plates), yaw r (0..3), mirror m,
  colour (`#hex`, `~#hex` glass, `*#hex` lit), sub-stud offsets ox/oz (studs) / oy (plates) from the taxi work, tilt in the key (`part@xzq`),
  and new here: **R**, a free 3×3 rotation for parts off the 90° grid. Game units: stud = 0.6, plate = 0.24 → 0.03 per LDU.

## 3. How a part is converted (`tools/ld/ld2garage.py`)
1. **Part id → our part**, in this order:
   - LEGO design id: LDraw names are design ids (`3069bpr0001.dat` → 3069; `~Moved to` files followed). Our part tiles carry the design id
     (`G13_ID`, the taxi work), so 90 catalogue parts map directly. Prints/patterns map to the plain part (stickers are not converted).
   - alias table for same-mould ids and our parts without an id on the tile (3794 → jumper, 6141/4073 → round plate 1×1, 3039 → slope 2×2 …).
   - **real LDraw geometry** for everything else: the part's own mesh becomes a new garage part `ld<id>` (see 4). This replaced
     "closest shape" guesses: the closest shapes had the wrong stud layout (e.g. the Audi roof 6180 became a fully studded 4×6 plate).
   - fallback when a mesh is too big (> 1,600 triangles): closest catalogue shape, else a plain box `B/P/T<w>x<d>`. Both are reported.
   - skipped and reported: minifigs (the game has its own driver), stickers, Technic pins, wheel rims (our wheel has a rim).
   - tyres → our wheel by diameter (wS 17 mm, wM 20 mm, wL 24 mm); a rim+tyre shortcut counts as its tyre; the same wheel twice is dropped.
2. **Calibration** (cached in `tools/ld/calib.json`): our part drawn upright and LDraw's part are both turned into surface points;
   for each of the 24 axis rotations the **outer envelope** is compared (depth maps from the top and the 4 sides; the underside is ignored
   because LDraw parts are hollow and ours are solid). Exact parts score 0.01–0.05, wrong ones > 0.11. A design-id match that scores > 0.09
   ("our part looks different") is replaced by the real mesh.
3. **Placement**: orientation O = A·R·A⁻¹·Cᵀ (A = LDraw axes → ours), mirrored placements use m. O → nearest stored orientation
   (yaw × tilt × 45°); round parts may spin freely; if nothing is within 1°, the part keeps an exact free rotation **R**.
   Body centre → cell + offsets (the taxi's ox/oy/oz). One global shift puts most parts on the stud grid and centres the model.
4. **Mesh parts** (`tools/ld/ldmesh.py`): low-res LDraw primitives (p/8), studs replaced by stud positions (the game draws its own studs,
   side studs included), only the outer surface kept (top + 4 sides; tubes and inner walls dropped), triangles turned to face the viewer that
   sees them, vertices on a ½ LDU grid, quadric simplification (pyfqmr) for big parts. Normals are made in the game (35° crease).
   66 imported parts, 2–1,100 triangles each, ~140 KB for all three models.
5. **Colours**: LDraw `LDConfig.ldr` codes → its hex value; alpha < 255 → glass (`~#hex`).

## 4. Checks (all scripted, run after every conversion)
- `tools/ld/ldRT.js <url> ld/out/<m>.json` **round trip**: each converted part is drawn alone by the game code and its box is compared with
  the LDraw part's world box. Median error **0.01 game units (⅓ LDU)** on all three models; the bank passes 112/112 within 2 LDU;
  the only misses are our smaller steering-wheel part and the hidden rounded underside of 2654.
- `tools/ld/ldAB.js` **A/B render**: the original LDraw file (three.js LDrawLoader with the real parts library) next to our conversion,
  same camera, 4 views (`tools/ld/abSheet.py`). Sheets: `docs/shots/models1/ab_*.png`.
- `tools/ld/ldRender.js` (RIDES thumbnails), `tools/ld/tRides.js` (real-touch garage → save → drive, tyre gap), tPlay with `LS=` (drive a given car).

## 5. Repeat it for a new model
```
python3 tools/ld/ld2garage.py ld/omr/<set>.mpd ld/out/<name> [--yaw K] [--only SUB,..] [--drop SUB,..]   # report: ld/out/<name>.md
# add <name>=ld/out/<name>.json to tools/ld/convert_all.sh, run it (writes src/98ld0_data.js), then a preset in src/98ld_import.js
tools/build.sh <ver> --local && node tools/ld/ldRT.js http://127.0.0.1:8766/local_dbg.html?fast=1 ld/out/<name>.json
node tools/ld/ldAB.js http://127.0.0.1:8766/local_dbg.html?fast=1 /ld/omr/<set>.mpd <name> ld/shots/ab_<name>.png <yaw> minifig
```
One-time setup: the parts library (`curl -o c.zip https://library.ldraw.org/library/updates/complete.zip; unzip -d ld/lib c.zip`, git-ignored),
`pip install scipy pyfqmr`, and `node tools/ld/ld_dump.js <url> ld/ours.json` (our catalogue + surface points; rerun when parts change).
Front of a car/boat = −z in the garage: pick `--yaw` with the A/B sheet. A file with trailing spaces in `0 FILE` names needs
`sed 's/[ \t]*$//'` for LDrawLoader (the converter does not care).

## 5b. models.js (since v89v)
Model data modules are listed in `src/MODELS` (not src/ORDER) and built into `out/<ver>/models.js`, loaded by `<script src="models.js">` after km.js.
Each module is wrapped as a function and run by `src/98ld_run.js` (after 98ld_w.js) with LD_MESH, LD_MODELS, GB_PC, G13_ID, GAR_SETS, GAR_set, LD_br, LDW_P, LDW_reg.
A new model = a new data module + one line in src/MODELS; it may only use those names. The page size stays flat.

## 6. Gaps
- Stickers and printed tiles are not converted (OMR files mark "missing stickers"; prints map to the plain part).
- Imported parts are hidden from the part palette (searchable by id later; ~66 new real parts could become a "LDraw" category).
- Our wheel has no white hubcap (76897's rims are white): the closest rim colour is used.
- Hinges/angled parts keep their exact angle (R) but are drawn only: footprint and stacking use the upright part.
- Moving an imported part in the garage keeps its offsets and R; NUDGE works as for the taxi.
- No OMR file for 40468; Frankfurt/Athens landmarks do not exist as LEGO sets (a MOC would need its designer's permission).
