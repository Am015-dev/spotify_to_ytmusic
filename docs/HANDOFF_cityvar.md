# HANDOFF city-var (2026-10-16)
1. Audit + plan: docs/CITY_VARIETY.md. Every tree/bush was placed at scale 1 (1 height in view); Frankfurt bv1 street has 13-19 trees in 150 m, one ~150 m same-window slab; 38/35 prop types placed one by one; 6 flat ground materials.
2. Top 3: break facade slabs > 30 m (60_city_build4 + 98bv), district colour blocking for all districts (98dt), foliage mix (done) + tree rows/hedges on bare streets (60_city_build6).
3. Prototype: src/98cv_city_var.js, flag TUNE.cvFol (default 0) / ?cvf=1. Size + hue jitter on all foliage (incl. asset-1 near/far, 2 lines in src/assets/as/code.js) + ≤1800 LEGO tree pits in 1 InstancedMesh pair: +2 draw calls, +6-7 % tris (Athens); looks in 150 m 2x, heights 1 → 6. Checklist cvf1/audit, cvf1/mix.
4. Gate (OFF, built): unit 0 FAIL, TAG=life1,xf1,terrain,cvf1 38/38. Shots docs/shots/cityvar/*_off_vs_on.jpg; effect is medium, pit close-up shot still owed (warp smashed the tree).
5. Left: pit close-up + Alex look, then cvFol:1 in tune.json; items 1, 2, 4 in CITY_VARIETY.md are the next lanes.
