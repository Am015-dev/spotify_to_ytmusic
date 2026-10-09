# Garage worker 12 handoff (2026-10-09): v88y build canvas + My parts + Tiles, branch alex/od-garage12

Base: alex/od-garage12 = v88w src (f0a4e32, live). Not merged with alex/od-world / alex/od-quick yet; no OD_CHANGELOG entry, no checklist items, no out/v88y yet.
Draft PR #75 (base alex/od-src) only tracks the branch; deploys go through reviewer + coordinator.

## What's in (src/98pa_garage_parts.js, in ORDER before 99c_checklist.js)
- Shared change: `src/92_garage_builder.js` build bounds `GB_N0 GB_N1 GB_Z0 GB_Z1` are now `let` (the canvas widens them, then restores them).
- CANVAS: MY PARTS chip → CANVAS card (or NEW → 🧩 BUILD CANVAS). 32×32 green studded baseplate, own bricks (localStorage `mho_cv`), own undo, own
  group names (`mho_cvn`), no driver figure, layer 0. Camera zoom ×1.65; two-finger drag = pan (+ pinch zoom), right/middle-drag or arrows pan on PC.
  Badge "🧩 CANVAS 32×32 · ← CAR" top centre (objective pin hidden while on the canvas). DONE / SAVE & DRIVE / BACK / NEW leave the canvas first,
  so the car's build is never overwritten.
- PARTS: ⛓ GROUPS → active group → row "💾 SAVE PART" / "🧩 TO CANVAS". Parts in `mho_parts` (max 30, newest first, normalised bricks).
  MY PARTS tab lists them (thumbnail + name); tap = APPEND as a carried cluster (existing SL carry: tap to move, ⟳, ▲▼, ✔ PLACE).
  ⇋ MIRROR (global GB_.mir, default on) adds the mirror twin when the part is off the centre line and the other side is free; placed, the part
  and its twin become two named groups ("X", "X ⇋"). Long-press a part card → "🗑 DELETE?" → tap again deletes.
- TILES: new t18 t23 t26 rt22 qt11 mac st12 cv13 prH prN prG + tile/grl/jmp/rt/qt moved into the Tiles tab (sorted). Research + sources:
  `docs/research/TILES_88y.md` (incl. "how v88y models them"). 2×1 slope 30 = same part turned (no separate part exists).

## Tests
- `t4/g12drive.js <url> <out>` = `t4/g12flow.js` (real touch: canvas → 6 parts → SELECT → MAKE GROUP → SAVE PART → ← CAR → MY PARTS → append
  mirrored → PLACE → DONE → SAVE & DRIVE → reload) then the g11drive drive (tyre gaps, shots). `NODRIVE=1` skips the drive; `IFRAME=1` = in an iframe
  (no reload check). `t4/g12probe.js <url> <expr> [shot]` = open builder, eval.
- Do NOT use `?fast=1` for garage tests: the builder render loop does not run in fast mode (stale shots).
- Run 3 (t4/g12_r3.log): 6 placed, 6 selected, group made, part saved (6), append + mirror (12 bricks, 2 groups), reload keeps parts + canvas, ERR [].
  Its append landed on the canvas because the ← CAR badge was hidden while parts were selected (fixed after run 3).

## Open / next
- Confirm run 4: append on the CAR, car count +12 after reload, then drive tyre gap ≤ 0.05 m, iframe run, shots, REVIEW.
- Before DEPLOY: merge alex/od-world, alex/od-quick, live; OD_CHANGELOG v88y entry (top of src/10_core.js); 99c checklist items; build split out/v88y.
