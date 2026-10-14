# Coordinator handoff (2026-10-14 03:00Z)
Live: v90m-beta.38 (brave-carson ef23c9bb); Beta artifact P6zT2b2SwfHYguRTtb67Ug republished.
Deploy: $SCRATCH/deploy.sh <out/ver> "<msg>" with DEPLOY_TRAILER (retry on "fetch first"); pre-check changelog/ALL_OPEN/"by Alex"/xc. Then republish Beta with root=out/<ver>, file_path beta.html, files km.js models.js tune.json models/lx.js models/as.js xc/99c_checklist.js xc/10c_qtc_blob.js xc/52a_terr_ath.js xc/52f_terr_fra.js.
Cadence (Alex): int-4 BUILD every 3 min when od-int2 has new commits; gate = unit + changed TAGs; smoke/--quick run in the background, red = revert next build. Deploy each BUILD at once.
Matrix: test-1 makes no-graphics, fixed-step, boot-once the default (Alex: "I never told you with graphics"); target --full 20k < 3 min.
Cost (02:56Z): $626 total, coordinator $539 (1.87B cache reads over 10 days). Keep coordinator context small; replies terse; no fan-out checks.
| lane | session | state |
|---|---|---|
| int-4 integrator (Sonnet) | session_01QewuGcL86b169339CDxRy9 | building beta.39 (cam-2 544ec504, foot-2 2119aaf/81d2493/49bccbe, art-3 8d9dd4c); hands off after it |
| cam-2 (Sonnet) | session_01EYkuBARKhEtuoc447HjjLv | hands off at next push → start cam-3 |
| foot-2 (Sonnet) | session_01Wk3tCUz39tLELACJC821Sk | body pitch, ON FOOT banner, starts() filter; hands off at next push |
| test-1 (Sonnet) | session_01U93UmpgV3ZVvcvjyQjCyUu | no-graphics matrix |
| xform-1 (Opus) | session_013BAHoBj5ikZM6Z6zGNhLkJ | xf1 land/grass/kerb + life1/people fails; held out; hands off at next push |
| trk-3 (Opus) | session_01VLUU7qG6rkKBd6UtN9FwoQ | race HUD portrait, rivals, track |
| art-4 (Opus) | session_015i3rywhFk2zVtVUh8QsF6J | from docs/HANDOFF_ART3.md |
| rev-2 / gfx-2 / life-2 / asset-2 / terr-2 | 019tCGx.. / 01W4Vv4.. / 01DhpmP.. / 011hY1W.. / 01SJyUa.. | running |
Stopped, not archived (verify pushes first): terr-1 016nYa3n, trk-2 01Q3etX1, rev-1 01NLojdb, life-1 01H1FaLE.
Rules: never archive before checking the work is pushed; a worker past 150k hands off; never route around a permission denial; never ask Alex.
