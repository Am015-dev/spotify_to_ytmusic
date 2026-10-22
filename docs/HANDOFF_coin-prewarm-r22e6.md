# HANDOFF coin-prewarm-r22e6
1. src/98bp_warmall.js PREW_run: the ?cl=studs InstancedMeshes (own materials, built after the first compile) are compiled + linked and drawn FIRST, so the cap cannot abort before the coin.
2. Lab (CPU=2, prewcap=60000, fra built): ?cl=studs alone 1 late link -> 0 links; default 0 links. At 6x this lab is too slow (prewarm aborts at 4/67 for trunk too, 1 reveal frame), so 2/3 at 6x is not measurable here.
3. ?cl=core still shows 16 links in the first frame (spawn moves to Paulsplatz: districts around it link after reveal). Not the coin; needs the core spawn area built/drawn under the curtain. So core,studs stays default OFF.
4. Gates: unit 0 FAIL; TAG=life1,xf1,terrain,core,studs 41/44 (reds xf1/grass, xf1/slope SLOW, terr1/terrain-tyre-ath: known flakes).
5. Left: warm the core spawn districts under the curtain, then re-run ios-reveal x3 with ?cl=core,studs and flip fra on.
