# Garage worker 13 handoff (2026-10-09): v89d 3-axis rotation, search, tray, join, simpler BUILD, 31 new parts. Branch alex/od-garage13

**Base:** v88z src, merged with origin/alex/od-cam (live v89b1).
**PR:** draft #79 (base alex/od-src). It only tracks the branch; deploys go through the reviewer and the coordinator.
**Version:** streaming takes v89c. At DEPLOY time, pick the next free letter after the newest entry in the live OD_CHANGELOG.
**Not done yet:** no REVIEW sent, no OD_CHANGELOG entry, no checklist items, no out/ build.

## What's in
- **Code:**
  - `src/98gb_garage13.js` (in ORDER after 98pa) holds everything.
  - `src/94_garage_ui.js` gets one line: the builder key handler calls `G13_keys(e)` first.
- **Rotation:**
  - A tipped part is a derived type `<part>@<x><z><45>`, created on demand by a Proxy set as GB_PC's prototype. It is non-enumerable, so all footprint, height, stack, save, mirror and undo code works unchanged.
  - `G13_turnOri` finds the yaw + tilt for a turn about a world axis.
  - Placed parts turn in place, together with their mirror twin. Groups turn on Y only.
  - Inputs: the R/T/F keys (Shift = reverse), the ⟲ AXES pad on #gsBar (Y X Z 45° ▲ ▼), a tap on the held part, and a two-finger twist (every 35°).
  - A 3-axis gizmo, scaled by camera distance, shows while turning.
- **Search:** #g13Ch holds 🔍 plus one ▾ category list, which proxies the hidden #gxCh chips. It matches on name, alias (G13_AL), design ID (G13_ID) and category.
- **Tray:** + on each part tile adds it to the tray. TRAY mode shows used/planned counts. Stored in localStorage `mho_tray[GX_sid()]`.
- **JOIN / SPLIT** (in #slBar): stud-grid snap (`G13_snap`), then GX_make. The parts get `.j=1` and the name "🔗 Piece N".
- **Bars:**
  - Main bar: PARTS · TRAY · SELECT · PAINT · MORE.
  - MIRROR, GROUPS, HIDE UP and KEYS are in ⋯ MORE.
  - The view column shows only the current view.
  - #slBar: GROUP · JOIN · MOVE · TURN · ⋯.
  - Table: `docs/GARAGE13_UI.md` (36 → 22 controls on screen).
- **Parts:** 31 new parts plus a SNOT tab. Research is in `docs/GARAGE13_PARTS.md` (40468 + 76916 / 76920 / 31127 / 60312).

## Tests
- **Real touch:** `t4/g13flow.js` via `t4/g13drive.js <url> <out>`; `NODRIVE=1` skips the drive, `IFRAME=1` runs in an iframe.
  - Steps: search, tray, build the front, rotate (pad, tap, twist, keys), group/move/ungroup, join, save the piece as a part, append it to the car, SAVE & DRIVE, reload.
  - A NODRIVE run takes about 30 minutes, so use `timeout 2700`.
- **PC keys:** `t4/g13pc.js <url> <out>` (1280×720). Run it ALONE: it timed out when run in parallel.
- **Run 1** (`t4/g13_r1.log`, shots in `t4/g13/r1`):
  - Search and tray OK.
  - Rotation OK on X, Z, 45° and Y, by tap, twist and the T/F/Shift+F/R keys.
  - Group → move OK. JOIN went from 4 components to 1.
  - 0 errors, 0 overlaps, smallest font 12 px.
  - It was killed by the 1500 s timeout before the save step.
  - Fixed since: the MORE popup was cut off at the top, so the MIRROR toggle failed; badges/paEm were wrong in tray/search; the gizmo was too small; gaps are now 12 px.
- **Run 2** (`t4/g13_r2.log`, `t4/g13/r2`) was still running at handoff. Check it: placed count, rotation, group/join, saved, appended, reload.

## Left (exact next steps)
1. Read `t4/g13_r2.log`. Fix anything that failed: ungroup was never confirmed in run 1, and the 1×4 tile didn't stack.
2. Look at the new parts in the TILES and SNOT tabs (shots 11 and 12) for broken geometry.
3. Run the PC keys check: `node t4/g13pc.js http://127.0.0.1:8766/local_dbg.html t4/g13`
4. Rebuild and run the full test with the drive (tyre gap ≤ 0.05 m, driving shots):
   `tools/build.sh v89d --local && timeout 3600 node t4/g13drive.js http://127.0.0.1:8766/local_dbg.html t4/g13/r3 > t4/g13_r3.log 2>&1`
5. Run the iframe test: `IFRAME=1 NODRIVE=1 timeout 2700 node t4/g13drive.js http://127.0.0.1:8766/local_dbg.html t4/g13/ifr`
6. Send `REVIEW alex/od-garage13 <commit> <shots>` to session_01Y6FYerWwxv43FuKUcaUT4v. Include shots: 03 search, 04 tray, 06/07 gizmo + pad, 08/09 group/join, 11/12 catalogue, `t4/g13/before_build.png` vs 01 for the bar before/after, and the r3 drive shots.
7. After PASS:
   - Merge the shipped branches and live (od-cam is already in; od-stream/od-p2 if shipped).
   - Prepend the OD_CHANGELOG entry (next free letter).
   - Add 99c checklist items: rotate R/T/F + pad, search + tray, JOIN.
   - Run `tools/build.sh <ver>` and `git add -f out/<ver>`, then push.
   - Send the coordinator `DEPLOY alex/od-garage13 <commit> out/<ver> <msg>`.
- **Known size mismatches** in existing parts (not changed): ws4 4 plates (should be 6), cs24 3 (should be 2), arch 2 deep (should be 2.5).
