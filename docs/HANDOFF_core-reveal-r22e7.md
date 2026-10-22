# HANDOFF core-reveal-r22e7
1. Settings (all runs): tools/perf1/tIosReveal.js on the BUILT page out/r22e7, CITY=fra CPU=6 (CDP 6x from the curtain gate), QS=prewarm=1(+cl=...), touch 852x393 lowmem, idle 4-core box; GO perf/ios-reveal pass formula computed in-page.
2. A: ?cl=studs 0/3 green (1 late link each); default fra is red too at 6x (1 link). The link is the same in every run: one MeshStandard ground tile (60_city_build userData.gk) first drawn ~2 s after reveal (0.6-1.3 s frame). Not the coin. Studs default NOT flipped.
3. B: TWG_run now draws the spawn view once under the curtain (R17_min) when R17_off moved nothing (core spawn): ?cl=core,studs 22 links + 2.8 s frame-0 stall -> 1 link (the same gk tile) x3. Kill switch ?twgfr=0. Core default NOT flipped (0/3, same gk link).
4. Gates: unit 0 FAIL; TAG=life1,xf1,terrain,core,studs fra+ath 43/44 (xf1/grass, known flake); default fra ios-reveal unchanged (1 gk link).
5. Left: find why that one gk ground-tile program links ~2 s after reveal (material/define changed after the prewarm, or the tile built late) -> then fra default, studs and core,studs should all be 0 links; flip studs+core for fra then.
