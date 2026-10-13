# HANDOFF track-2 (stunt tracks, 2026-10-13). Branch alex/od-track. Coordinator session_017iH3DB4VyxwKSdMwsco4Ut · reviewer session_01Y6FYerWwxv43FuKUcaUT4v · integrator build-10 session_01NEKmBJhbYZuQ3ir54EPH89.
Brief: Alex "make tracks fun like YouTube: high stunts, alternative roads". STEP1 research → TRACK_FUN.md L16–L19; STEP2 pieces; STEP3 6 tracks (3 FRA, 3 ATH), tRace, grid, reviewer PASS, Lab artifact, coordinator after 2 tracks.

## State (WIP)
- `src/98tb_track_builder.js`: new pieces in TB_PCS (ramp, gapw, gapr, bank, scs, lm), `TB_ST` numbers, `TB_air` (air estimate), `TB_route` (splits grow to ≥320 m over dense points),
  lint L8 allows flyovers (≥12 m apart, close run ≤260 m), L9 counts ramps/gaps, new L16 big stunts, L17 route splits, L18 landmark on screen, L19 elevation range. TB_def passes kick/banks/lms, routes get kf = base×rho×TB_V.rk[kind].
  Builder palette is 3 columns; LANDMARK tool places anywhere, tap again cycles the type.
- `src/98ts_track_stunts.js` (ORDER after 98tb): buildTrackData wrap (kicker bumps, banks → T/R/U rebuilt), OPN_prep wrap (NEAR rows → no hills), setupRace wrap (TS.kick list, gap g/floor),
  airStep wrap (launch at the lip; lane kicker climb), crashJump splash, updateCam lift in big air + apex slow-mo, bank grip (C26.muRace ×1.45), stunt lane = road, AI route pick by skill, sign tex, pads,
  world: ramp decals/boards, gap water / road with cars, stunt lane asphalt + wedge, bank kerbs, flyover skirts + deck underside, landmarks (TS_lm). Probe `window.__ts()`. Embedded cup tracks `TS_TRACKS` (tools/tsEmbed.py).
- `src/98ro_open.js`: NEAR rows skip hills/trees; TB ground plane y0-10.
- Tools: `tools/tbDemo.mjs in out spec` (turtle layouts, pieces by fraction, lm offset or [x,z]); `/tmp/claude-0/sp/close.py` closes a turtle (copy into tools if kept); tRace shots air1..3 + `stunts` in RACE_RESULT.
- Tracks: docs/tracks2/<id>.spec.json → .json. Done: main_river_jump (19/19 lint).

## Update 2026-10-13 (later)
- PRIORITY slice done: **alex/od-builder** (from 4b1dd8b; worktree /home/user/odb), draft PR #96: EXPORT dialog, IMPORT at top of MY TRACKS, tools/tbImport.mjs,
  docs/TRACK_IMPORT.md, tools/tTBx.js gate. GRID docs/shots/builder/GRID.jpg. REVIEW sent to the reviewer (0146a18); after PASS → hand to build-10 for v90k.
  Lesson: a moved line carried a closing `}` → the TB module died at load but build.sh said BUILD_OK. Always run a load smoke (`/tmp/claude-0/sp/err.js URL`: waits for __tb + menu, prints page errors).
- alex/od-track merged od-builder (7562fe7). 6 STUNT CUP tracks, 19/19 lint; tRace 2 laps each in qa_t2_*.log (0 errors, all jumps landed, air 2.3–3.6 s).
- Open: wall hits 0.51–0.57/min on 4 tracks, Taunus 1.08 (DBGW run qa_t2_td2); route balance needs ROUTE=road runs (TB_V.rk); Lab artifact update; stunt GRID; full REVIEW.

## Update (REVIEW sent)
- od-builder 0146a18 PASSed (QUICK-plus) → handed to build-10 for v90k (conditions: changelog/checklist, ≤3.6 MB, models ship).
- STUNT CUP REVIEW sent: alex/od-track 7f79e65, GRID docs/shots/track2/GRID.jpg (build tr2i), Lab v4. Final tRace qa_t7_*.log.
- Coordinator notes fixed: big-air camera (10 m back / 5.5 m up, eases out) + 0.35 s apex slow-mo, landmarks ahead of every jump, LEGO city blocks (TS_city).
- Tyre gap: tRace now measures plane distance (old world-Y box was wrong on banks); median +0.002 m.
- Split radius lint (dirt/water R≥150, stunt R≥90) removed the island scrapes; tRace driver now holds the split lane centre.
- Next after PASS: build-10 handoff (OD_CHANGELOG entry + checklist: STUNT CUP row, a big jump, a split, the builder new pieces).

## DONE (2026-10-13)
- STUNT CUP: reviewer FULL PASS on deb7b1c (code 52734f8, build tr2j) → handed to build-10 as v90l (after v90k builder). Lab v5 = tr2j.
- Open (not blocking): occasional island-nose scrape on late split entry; per-split timing noisy; no loops/wall rides (spline physics); no WebKit test.
