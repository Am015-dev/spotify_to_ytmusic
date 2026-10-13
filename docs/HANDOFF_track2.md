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
