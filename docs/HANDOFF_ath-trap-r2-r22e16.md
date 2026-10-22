# HANDOFF ath-trap-r2-r22e16 (2026-10-22)
1. A/B (bughunt ath, --q "t9e=1&bx=1", seeds 0/40, ~22 sim-min each): trap sum/h (ladder+UNSTUCK+BACK ON THE ROAD) off 51.1 / 103.5, on 50.0 / 48.5 = -36 % mean, but all from seed 40 (seed 0 flat) and `invisible` was worse on (8.5/h vs 6.7/h): below the "no detector worse" bar, so t9e and bx stay default OFF, no QTC re-dump. bughunt now takes `--q <query>`.
2. The "height-less HUB.bld boxes" were the Athens/Frankfurt solid-fill blocks (DR_solidBuildG, 16 m raster of deep interiors): drawn buildings whose collider had no `h` (= endless wall in roamHit). They are now registered with the drawn roof top (`h:y1`, `fill:1`); shots at (-420,-1900) and (2250,-1800) show real building faces beside the road.
3. Side effect: the Athens skyline test (TRN_ray) now saw those blocks as occluders (61 % -> 41 %), so it skips `b.fill` (one token in 98tr_terrain.js).
(iOS-reveal ath passes; bughunt fra 3 detectors over the limit vs trunk 4: not worse.)
4. Gates (built page): unit 0 FAIL; TAG=life1,xf1,terrain,why fra+ath 72/74 in the full batch; the misses (why/quiet-start, solid-cars, hud6, speedfeel) pass solo.
5. Left: trap metric still counts the bot's ram mode; real trap wedges (22-44 deg slopes) are not removed by the box fix, a drive-mode breakdown of the cells needs the json `cells` list.
