# Garage worker 9 handoff (2026-10-07)

## Slice 1 = branch alex/od-garage9 (PR #58, draft). REVIEW sent to the reviewer at a9d4911 (QUICK). No PASS yet.
src = live v87r (alex/od-garage8a 5c23efb, verify_live LIVE_MATCH 528b4ab/7d5a9b6) + these changes:
- **Stacking root cause:** `GB_CAP=15` plates above the highest chassis cell (`src/92_garage_builder.js` line 5). A default body is ~11 plates tall, so about 4 tiles fit.
  - Now `GB_CAP=48`. `GB_fit` sets `GB_.capHit` when the cap is the reason.
  - The step loops in 98t/98u go up to y≤120.
  - Proof, same real taps at 852×393 on Alex's car: v87r placed 0 bricks / 0 plates / 3 tiles (`t4/g9/stack_old`). Now it places 12 / 12 / 12 (`t4/g9/stack`). Clean baseplate: `t4/g9/stackbp`.
- **New module `src/98v_garage_stack.js` (G9_):**
  1. The camera rises and pulls back as the build top grows.
  2. "Height limit reached · 48 plates" tip when the tapped cell is over the cap, instead of sliding the part to a neighbouring cell.
  3. Yellow edge outline on the held ghost, and for 1.6 s on a just-placed part (thin tiles on a same-colour body).
  4. The phone toolbar fits on one row: brick counter 80 px, gap 4 px (`t4/g9tb.js` → ROWS 1).
  5. SELECT counter: "☝ Tap a part" when nothing is selected (was a stale "3 selected").
  6. No brick shower over the NEW BUILD chassis picker (cut in `GNB_pick`, played in `GNB_new`). Coordinator follow-up.
  7. `#gfxNote` ("Graphics: canvas") hidden by CSS. Coordinator follow-up.
- Garage 8's release 2 is included: `98u_garage_select.js` (SELECT mode, dead-tap nearest-cell fallback) and the 94 finger-tolerance edits.
- **Evidence:**
  - `t4/g9/sel2` (g9sel.js): all SELECT actions, tap grid 0/19 dead, ERR [].
  - `t4/g9/tiles`: all 9 tiles placed.
  - `t4/g9/sweep_iframe.log`: every part 100/100, 0 blocked.
- **PENDING when I stopped:** queue `t4/g9/run_q3.sh` (background) runs `DRIVE=1 node t4/nb.js` → `t4/g9/drive1.log` and shots (tyre gap), then `node t4/g9fu.js` → `t4/g9/fu.log` (shower/picker, gfxNote).
  - Check their output, forward the tyre gap and drive shot to the reviewer, commit them (`git add -f`; `t4/g9/*/` and `*.log` are in .git/info/exclude).
- **On PASS:**
  1. Rebuild on CURRENT live: merge the latest live src, verify_live.
  2. Add the OD_CHANGELOG entry (v87s? check the next free version), e.g.:
     - FIXED: you can stack parts much higher (12+ layers), the camera follows tall builds;
     - NEW: SELECT tool (move/rotate/colour/delete/copy/select up/group);
     - FIXED: placed tiles get an outline;
     - FIXED: no bricks over the chassis picker.
  3. Push `out/<ver>/`, send DEPLOY to the coordinator.

## Slice 2 = branch alex/od-garage9b (PR #59, draft, base alex/od-garage9). Built (worktree `wt_s2/`), NOT reviewed
- **New module `src/98y_garage_collection.js` (G9C_/G9_):**
  - **Templates:** 8 street + 1 off-road, after real sets. Refs: `docs/shots/garage9/ref/*.jpg` (Brickset). Sources: `docs/GARAGE2K_COLLECTION.md`.
    - `G9_sc(o)`: Speed-Champions 8-wide skeleton (based on `GAR_gt`) with options for nose, cabin, rear, colours and extras.
    - `G9_f1`: open-wheel car.
    - Blue Beast = `CR_monster` recoloured.
    - All are pushed into `GAR_SETS` with `tpl:1`. `forms` says which tabs show them.
  - **COLLECTION:**
    - It replaces the `.garSets` row in RIDES. The BUILD YOUR OWN button moves into the grid as the first card.
    - Tabs STREET/OFF-ROAD/WATER with owned/total, rarity stripe, ★ fav (`mho_gar.fav`), sort RARITY/A–Z/NEW, filter ALL/OWNED/FAVS, and "owned n / m · locked k".
    - Tap a card to equip it; ✎ BUILD opens the builder (`GAR_select` + `GB_enter`).
    - 3D cards come from GS's offscreen renderer (`G9C_render`, cached, pumped 1 per 16 ms).
  - **Mix and match:** `98_garage_driver.js` patch (`GAR_frm`). Off-road/water forms come from `mho_gar.off` / `mho_gar.boat`, else from the street set.
- **Renders:** `t4/g9/tpl/*.png`; side-by-side images in `docs/shots/garage9/sbs/`.
  - These were rendered BEFORE the last commit.
  - The last commit changed the angle to front-left (`G9C.ry=2.35`, to match the refs), framing ×1.75, and wedge fenders on Bianco.
  - Re-render: `node t4/g9tpl.js http://127.0.0.1:8766/wt_s2/local_dbg.html t4/g9/tpl`, then re-run the composite (python PIL snippet; same layout as sbs/).
- My verdict on the first renders:
  - Good: Rosso, Patrol, Silver, Viola, Flame.
  - OK: Papaya F1.
  - Weak: Bianco (not wedgy enough), Racer (the engine barely reads), Beast (pickup look, not the 60402 roll-cage truck).
  - All roofs: the T6x2 roof plate reads like a "hat" over the screen (same as `GAR_gt`).
- **Collection test running when I stopped:** `t4/g9col.js` on wt_s2 → `t4/g9/col.log` and `t4/g9/col/01–06`. LOOK at them; check the 12 px text and ≤5 bar buttons (3 tabs + sort + filter).
- **Still to do for slice 2:**
  1. Fix what the col test shows.
  2. Fix the weak templates.
  3. Run tPlay/nb drive with a template equipped (tyre gap ≤ 0.05 m; templates use the GAR_gt wheel offsets, untested in driving).
  4. Run a drive with an off-road form mixed in.
  5. REVIEW, then DEPLOY.

## Test notes
- Never run two browsers at once. The queue scripts in `t4/g9/run_q*.sh` run tests one after another.
- `pkill -f <pattern>` matches your own bash. Kill by PID.
- The worktrees `wt_old/` (v87r for before/after) and `wt_s2/` (slice 2) are served at :8766 under the repo root.
