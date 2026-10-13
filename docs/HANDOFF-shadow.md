# shadow-1 handoff (alex/od-shadow)
Cause: sun shadow map runs only when LK level = high AND SET.q = high (src/80_story_m1.js LK_roamLook → LK_shadow); auto-quality drops it on PC lag.
v86v (ART6, src/97_art.js) replaced car blobs with tiny 45 % tyre patches; people and trees never had any. Not lost in v90j; it never existed at med/low.
Done: src/98sh_shadow.js (SHB_*): one InstancedMesh (900 blobs, depthWrite off) under player car, city traffic, peds, brick trees; on in free roam.
Checklist 'v90k/shadow' + GO (behind a Frankfurt traffic car). window.__sh() → {n,trees,pl,plUnder}. Builds OK (tools/build.sh v90k --local).
LEFT: tools/tShadow.js timed out at 170 s before printing (boot with phone:false? try phone:true + ?fast=1, 1-min dry run first).
Then: run it, LOOK at the before/after grid (tools/grid.py), check the tree heuristic (roughness .42) finds trees, tune opacity .5 if too dark.
