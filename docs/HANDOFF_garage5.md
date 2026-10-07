# Garage worker 5 handoff (2026-10-07)

Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Tracking draft PR #54.

## Done
- **Task 1 (phone fold) = v87j:** QUICK PASS on c81ea31. DEPLOY sent: branch `alex/od-garage5-v87j` 98a094d, `out/v87j`, built on live 80d8894 (v87i).
  - RIDES: the PERKS row (3 slots, one line, 44 px) sits right under the studs line, above VEHICLES (`src/98p_garage_perks.js`, class `.gpkTop`).
  - PROFILE: the PERKS card (with "Next: …") is moved above VEHICLES (`src/98q_profile.js`).
  - Shots: `docs/shots/garage5_fold/`.

## Task 2 (slice 4, NEW BUILD) on `alex/od-garage5`: in progress, not reviewed
Module `src/98r_garage_newbuild.js` (ORDER after 98q_profile.js). What it does:
- Adds a 5th set 'mine' ("My Build", Neat). Its street car is a bare chassis taken 1:1 from a real set (frame plates, 4 tyres, seat + driver, diffuser). The tyres are the set's own tyres, so they should sit on the road. Off-road/boat = the Hot Rod's forms.
- Chassis picker (🆕 NEW BUILD in the builder toolbar, and 🆕 BUILD YOUR OWN in RIDES): SPEED CHAMPION (posei frame, 8 wide, T6x16, wL×4) and HOT ROD (rod frame). The draft's "Hypercar" was dropped: its frame was identical to the Speed Champion one.
- Build-limit bar: `#gbBkN` reads "🧱 BUILD LIMIT n/120 · <2K weight class>" with a fill gradient. GB_MAX is a const of 120 (perf budget), not 2K's 350.
- Builder fixes (apply to every build):
  - `GB_top` ignores tyres, so parts never stack on a wheel.
  - The `GB_cand` wrapper snaps a Mudguard or Cycle fender tapped on or next to a tyre over that tyre.
  - The `GB_fit` wrapper stops a mirrored centred part (windscreen) from doubling.
  - The `GB_scanBase` wrapper extends the bp base grid to the whole chassis floor plate (16 long).
  - The bottom parts panel `#gbBkP` is pointer-events:none except its buttons. It used to swallow taps on the lower half of the car: a real phone bug.
  - The new-build camera is dist 11, pit .95, yaw .72π, so all 4 wheels can be tapped.
- Test hooks: `__gnb.gap()` returns the tyre-bottom-to-ground gap per visible wheel of the player mesh in m (RO.mesh, else pl.mesh); `__gnb.dbg(x,y)` returns the pick and candidate under a screen point.
- Test: `node t4/nb.js <url> <out>` (`DRIVE=1` for the drive + gap). It taps chassis cells via `__gb.scr(i,j)` and sends touchStart+touchEnd back to back over CDP. The software renderer runs at about 2 fps, so a normal tap spans more than 900 ms and the builder treats it as a long press.
- The paint step uses colours 6 (blue) and 2 (yellow); 0 = red is the default colour.

## Left to do
1. Run nb.js and look at the shots `03_chassis 04_parts 05_painted 06_rides_mine`. Then run it with DRIVE=1 for `08_drive` and `tyre` (≤ 0.05 m). The DRIVE section (story start, skip cutscenes) is untested.
2. Check that RIDES shows the "My Build" card and that SAVE & DRIVE uses the bricks (`mho_gar@1`.br.mine).
3. Strip for REVIEW: empty chassis → parts → painted → driving in the city, plus 0 console errors.
4. On PASS: rebuild on CURRENT live HEAD, use the next free version, add the OD_CHANGELOG entry, force-add `out/<ver>`, and send DEPLOY to the coordinator.
