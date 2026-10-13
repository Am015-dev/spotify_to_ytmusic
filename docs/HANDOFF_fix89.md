# HANDOFF fix89 (branch alex/od-fix89, base = live src v89e bd26d579)

Coordinator session_017iH3DB4VyxwKSdMwsco4Ut · reviewer session_01Y6FYerWwxv43FuKUcaUT4v. Brief: 3 fixes (Athens TAKE, start tip overlap, Athens blank walls).

## 1. Athens car-jacking (TAKE)
- **Game root cause:** Athens traffic is ~1 in 10 scooters (`#scoot`, not takeable). On foot, every traffic vehicle used a 2.0 × 4.7 m car box
  (`OF_box` default). A scooter stops for a walker in its lane, so in the 8.5 m Athens streets a stopped scooter walled off the lane and the
  car queued behind it (the TAKE target) was never reached. tJack DBG showed `blk:["traf:#scoot//cv0.0@…"]` with the walker frozen 8 m from the car.
  **Fix** (`src/98of_onfoot.js` `OF_cars`): `#` types use `OB_cdim` sizes (scooter 0.45 × 1.05, trolleybus 1.26 × 5.7). Also logs `jack-abort:<why>`.
- **Test gaps (tools/tJack.js):** no side-step when blocked; walked straight through blocks to cars on other streets; got out on empty streets
  (no traffic within 70 m → stood still). Now: side-steps after ~0.5 s blocked, follows the street path (`wpath`) without line of sight, keeps
  driving (≤ 6 × 40 m) until moving traffic is within 60 m before EXIT (what a player does), falls back to traffic within 220 m.
- Results (qa89f/jack1…9): TAKE offered + jack completes in every run where the walker reaches traffic (phone j1 ×4 runs 0.8–1.7 s walk; desk j1–j3).
  Remaining FAILs are test noise: the Athens district switch reloads the page ("Driving to …" → `location.reload`, 70_roam_world.js) when the
  test's 100 m drive in the stolen car crosses a district border; and "drove 100 m" in narrow streets.
- Shot: `qa89f/jack8/phone_ath_j1_a_take_prompt.jpg`.

## 2. Start tip overlap
- The tip is `#npcSay` (Oma Hilde, `M1_radio` → `npcSay`, 4.2 s). The checklist pin `#odPin` (z 8990) sat exactly on top: tip fully hidden.
- Fix (`src/99c_checklist.js` CSS): `body:has(#npcSay:not([hidden])) #odPin{display:none!important}`. Before/after: `qa89f/start_before/start_0.jpg`,
  `qa89f/start_after/start_1.jpg` (overlap 19040 px² → 0; tip 14 px, pin 12 px; pin returns after).

## 3. Athens blank walls ("beige-block family")
- **Root cause:** `DR_solidBuild` (src/95_drive_flow.js, "solid blocks", v85-era) fills every deep block interior ≥ 22 m from any street with a
  plain merged box (7.5 m, beige #efe3c8 + orange cap #c8643c, no texture). 9294 rects, 74 km², one mesh `userData.dr` (669k verts). Where it
  borders fields/parks it reads as long blank walls. Found by render-pick (`qa89f/probePick.js`: hide candidates, compare the pixel; raycast
  fails because SM_upload frees CPU arrays).
- **Fix** `DR_athFill` (Athens only, Frankfurt unchanged): walls use the Athens `poly` facade material (windows/balconies, ATH_COL.poly tints),
  92 % internal faces skipped, exposed faces cut into ~32 m segments with 12 m deep wings 1–2 floors above a 2–3 floor core, street-side faces
  plain windowed. 2 draws. First try (instanced 32 m chunks, 116k instances) was too heavy and coincided with page reloads: replaced.
- Shots: before `qa89f/wall/sideL.jpg`, `qa89f/out_sheet.jpg`; after `qa89f/wall_after3/sideL.jpg`, `qa89f/out_after3_sheet.jpg`.
- Perf (ath/perf.js, 3 spots, light version): draws 190/245/172 vs live 177/233/186; tris 1.00/1.45/0.70 M vs 1.02/1.44/0.79 M; 0 errors.

## Next
REVIEW → after PASS: merge latest live src (check garage v89f / races), next free version letter, OD_CHANGELOG + 3 checklist items
(drafted in the DEPLOY step), `tools/build.sh <ver>`, `git add -f out/<ver>`, DEPLOY message to the coordinator.
