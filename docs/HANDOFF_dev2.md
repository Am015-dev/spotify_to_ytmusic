# HANDOFF dev2 (branch alex/od-dev1) — item 1 BUILDER TRACKS

## Slice 1 done (tests first)
- 3 acceptance tests in BX_TESTS (src/98b2_builder2.js, before 'bx-elev'): `bx-t-cliff` (lap, ≥15 m, air ≥1.5 s, banked turn driven),
  `bx-t-city` (lap, ≥15 m, bridge over+under via bxCross, boat ≥2 s), `bx-t-canyon` (lap, ≥15 m, both SPLIT branches, off-road ≥2 s).
  Each loads `BX_DEMOS['CLIFF RUN'|'TWO-LEVEL CITY'|'CANYON SPLIT'].log`; they FAIL now because BX_DEMOS is still `{}` (line ~377).
- Checklist items ver 'bxT' + GO entries in src/99c_checklist.js (GO -> BX_test(id)).
- Decision: treated as content on the existing builder (Alex asked himself), not a new >1 h feature, so no spec/yes-no round.

## Next slice
1. Fill BX_DEMOS with 3 closed-loop logs built with `bxCh(world,[i,j,l,r],[pieces…])` (grid 40×40 cells of 8 m, l = 2 m levels;
   pieces: sf st cl cr up dn su sd kk bl br wl wr lp fk bo cp). Worlds: mountain (mesa ~30 m at 30,25), city (+lake 70,-75), canyon.
   A lap needs back over START with every CP seen. Verify closure with `__bx.route()` end ≈ start.
2. Race menu entry: list BX_DEMOS in the Race menu (find menu with tools/find.sh menuTrack) -> BX_open + BX_load + BX_driveStart.
3. Run tools/bx/tAccept.js style drive per test (≤3 min total), ONE grid of low chase-cam shots, LOOK (flat = redo).
