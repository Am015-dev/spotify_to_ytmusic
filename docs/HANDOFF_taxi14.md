# garage-14 handoff (2026-10-10): LEGO 40468 Yellow Taxi from the official PDF. Branch alex/od-taxi (from alex/od-mem 073f1b93)

Brief (coordinator, Alex asked himself, freeze-exempt): build 40468 in the garage step by step from the official PDF, using the
garage's own tools (new parts, free 3-axis rotation, offsets, JOIN) through real touch/keys. Save it as preset "Yellow Taxi (40468)" in RIDES, drivable.
Shots vs the box art (garage front, side, 3/4 rear, drive) + side-by-side sheet → tPlay on the split build → REVIEW → after PASS:
OD_CHANGELOG + 99c checklist item, push out/<next free ver>, then send the coordinator DEPLOY with 3 bullets + the sheet path. Never run deploy.sh; never ask Alex.

## Done
- PDF downloaded, every page rendered and read. **Step list = `docs/TAXI_40468_STEPS.md`** (32 steps, 167 parts, x/z/y boxes, notes).
  Page renders: `docs/shots/taxi40468/pdf/NN.jpg` (01 box art, 41 final, 42–43 parts). Don't re-read the PDF; the table is enough.
- Key facts found: the body is **6 studs wide**, 14 long + bumpers. Both ends are SNOT faces made of 3 brackets 21712 hanging down (6×2 studs).
  The cabin and roof are on a **½-stud offset** (jumpers 15573): the roof is 5 wide (x −2.5..2.5). Wheels: tyre Ø21 mm → game `wM` (r .76, w .72) is the true size.
  The real set has **no chequer stripe** (solid yellow, black TAXI door stickers, green/blue roof sign). Keep it faithful; say so in the DEPLOY message.

## Garage facts (read, no need to re-read)
- Brick = `{t,x,z,y,r,m,c}`: x/z = min cell (studs), y = bottom (plates), r = yaw 0–3, front = −z. Stud GB_U .6, plate GB_PH .24 (true 0.4 ratio).
- Tilt = derived type `<part>@<x><z><45>` (98gb G13_def): footprint/height are rounded to whole cells, so a tipped tile fills a whole 1-stud cell and sits centred in it.
  **There is no sub-stud offset tool yet** → needed for SNOT faces (0.2/0.4-stud layers) and the ½-stud cabin/roof.
- Catalogue already has: inv22 (3660), br22 (21712, upward; roll 180° with F F = hanging), b12s4 (52107), s11d (35464), t11h (35399), jmp (15573), ch (54200),
  s21 (3040), s22 (3039), grl (2412), t13 t14 t16 t23 tile, p13 p14 p16 p23 p24 p26 p46, b11 b12 b14 b24 b26, wheels wM. `CR_reg` makes any `P/B/T/C<w>x<d>` (e.g. `P2x14`).
- cs24 is 3 plates tall (88930 is really 2): add a true `cp24` rather than change cs24 (used by other templates).
- Glass: parts pushed to `CR_G` render with CR_GM (93 GB_piece uses `GL=CR_G||M`). Colours may be hex strings.
- Presets: `GAR_SETS.push({id,n,tier,req:null,car:()=>[[t,x,z,r,c,y],…],off:R.off,boat:R.boat,tpl:1,ref:'40468',forms:['car'],load:{car:{name,k,st,w,perk},'4x4':…,boat:…}})`
  exactly like `98y_garage_collection.js` G9_T (copy the block that builds `load` from `GAR_set('rod')`). Templates are 8 wide; the taxi is 6 wide: check 98bc (BC) sizes physics from the build.
- Test harness pattern: `t4/g13taxi.js` (phone 852×393, CDP touch, `__b25.scr(i+.5,j+.5,L)` → screen point, tap, `#gsBar .gsPl` PLACE, search via `#g13Qi`, colour via `#gbBkCl`).
  Hooks: `__gb.list()`, `__gb.PC`, `__gs.held()`, `__g13.turn/st`, `__b25.S.L` (layer), pad buttons `#g13Pad [data-g13a=y|x|z|q|up|dn]`.

## Plan (next steps, in order)
1. New module `src/98tx_taxi40468.js` (add to `src/ORDER` after `98gb_garage13.js`), tag `TX_`:
   - **Offsets:** optional brick fields `ox, oz` (studs, ¼ steps) and `oy` (plates, ½ steps). Wrap `GB_brickGeo` outermost: after `f(b,M,L)`, translate the new
     M/L/CR_G entries and the new CR_W `w.o` by `(ox*GB_U, oy*GB_PH, oz*GB_U)`. Mirror twin: `ox → −ox` in `GB_twin`. Footprint/collision stay cell-based.
   - **NUDGE tool:** in SELECT with one part, keys `Alt+←/→` (x ¼), `Alt+↑/↓` (z ¼), `Alt+PgUp/PgDn` (y ½); on touch a ✥ NUDGE toggle on #g13Pad swapping
     its 6 buttons to ← → ↑ ↓ ⤒ ⤓. Hook it in `G13_keys` (94 calls it first). Push undo with `GB_snap()`.
   - **Glass colours:** `c` starting with `~` (e.g. `'~#dfe9f0'` trans-clear, `'~#e3241b'` trans-red): wrap GB_piece to build into `CR_G||M` with the colour after `~`.
   - **New/printed parts** (vertex-colour geometry, no textures): `cp24` curved plate 2×4×2/3 (88930, h 2); `lh11` lamp holder 41632 (1×1 plate + side clip ring);
     `be24` bearing element 18892 (2×4 under-plate holder); `tx12` brick 1×2 with the black-bordered "TAXI" sticker on its −z face (pixel letters from thin boxes);
     `lp12` tile 1×2 white with the "LDC-812" plate print; `sg14g` / `sg14b` tile 1×4 white with the green "BRICK OVEN!" / blue stars sign prints.
     Register with names, `G13_ID`, aliases, palette tiles (copy the G13_NEW tile loop).
   - **Preset:** `TX_CAR()` returns the 167-part list from the step table (tuples `[t,x,z,r,c,y]` + offsets → use objects if G9's tuple path can't carry ox/oy/oz;
     check how GAR_SETS `car()` tuples are converted, e.g. grep `tpl` in 98y/98 and pass `{t,x,z,r,c,y,ox,oy,oz}` through). Wheels: 4× `wM` at z −5/3 cells (centre ±4), y from `(.12-CR_WH.wM.r)/GB_PH`-style like G9_sc so the tyres touch the ground.
     id `t_taxi`, name **"Yellow Taxi (40468)"**, tier `c`, ref `40468`.
2. **Real-input build test** `t4/taxi40468.js` (phone 852×393, `?fast=1`): open RIDES → My Build (or an empty build) → BUILD, then for each step of the table:
   search the part (`#g13Qi`), pick it, PAINT the colour, turn it with the pad (touch) and R/T/F keys (a second PC run), place it by tapping the cell on the right layer, NUDGE the offsets,
   and JOIN each sub-build (rear face, front face, bumpers, sign). SAVE. Then compare `__gb.list()` with `TX_CAR()` (same multiset of t/c and positions ±¼) and print the diff.
   Shots per step group (chassis, rear face, front face, cabin, roof, sign, wheels). Expect ~30–45 min: run once in the background with `timeout 3600`.
3. Shots: garage front / side / 3/4 rear + a drive shot of the preset; `tools/sideBySide.py` (or g11sheet.py) → sheet vs `docs/shots/taxi40468/pdf/01.jpg` and `41.jpg`.
   Tyre-to-road gap ≤ 0.05 m (measure as in g13drive).
4. tPlay on the split build (`tools/build.sh v89r --local`, `tools/tPlay.js`), smoke, 0 console errors. Then REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v
   (full shot set: start, Frankfurt drive, Athens drive, low side view of the taxi and a traffic car, garage) + gap.
5. After PASS: rebuild on CURRENT live, OD_CHANGELOG entry (NEW: Yellow Taxi 40468 preset built from the real instructions; NEW: nudge tool;
   NEW: printed parts), 99c checklist item, `git add -f out/<ver>`, push, DEPLOY message to the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut).

## Substitutions so far
- Lamp holder 41632 → new `lh11`; bearing element 18892 → new `be24` (visual only, wheels are game wheels `wM`); tyre/rim 11209/11208 → `wM`.
- Stickers 1–4 → printed-part geometry (`tx12`, `lp12`, `sg14g`, `sg14b`).
- 2×3 hood tiles → tile over x −2..2 / z −5..−3 (see note 3 in the steps doc).
