# terr-2 handoff (2026-10-14, ~150k context). Trunk alex/od-int2

## Done: item 1, warped junction (Alex b27), pushed dc41e0c0 + e23dc7be
- Module `src/98tj_junc.js` (ORDER after 98tr_terrain.js). Flags: `?tj=0` all off, `?tjpad=0` no filler×street pads, `?tjconf=0` pads at the old fixed offsets.
- Causes found (each is a TJ_one test failure class):
  1. Filler road × real street had no junction pad: the street's painted kerb band, edge line and yellow centre line ran across the side road's mouth (= b27). `TJ_fx` + `TJ_pads`: one pad per overlap, the filler's own rectangle (full width) over the stretch where any part of it is inside the street, +1.5 m (also past a filler END: T-junctions).
  2. Every pad sat at ground + fixed 4–6 cm, but road planes drape the ground on coarse grids (ART8_tol 4 cm), so the road poked through or z-fought. Now the road/ped triangles are captured while the hub batch is built (`TBatch.prototype.add` wrapper, `buildHubG` wrapper, cells around junctions only) and every pad vertex = ground + off + max excess of the roads within half a vertex spacing + `TJ.mg` 2.8 cm + ground convexity (capped at 4 cm). Pads don't conform to pads (they share texture + world uv, so overlapping pads draw the same pixels). Planar pads collapse to one quad. FILL_X squares (60_city_build4) and JUNC discs (60_city_build) use it too.
  3. Athens zebras: `+.24` on S.hs streets floated 17 cm (TERR turns shelves off). Now `TJ_y(x,z,.035,0)`.
  4. Athens ped paving (CV tiles, 90_fixes) stood 5 cm over discs: tiles stop at discs; ped strips count as road for the pads.
  5. Boulevard medians (CV, 0.16 m) stopped only at street discs: also at filler crossings (`TJ_nearFx`).
  6. terr-1's ground-following filler kerbs (0.25 m) ran into junctions (cityAt measures to street SAMPLE points, coarse on curves): `TJ_inJunc` (true polyline distance `TJ_st` + discs + squares + pads), kerb run ends refined to 0.5 m.
- Test: GOs `terr2/junc-fra` (720 junctions: disc 30, sq 454, fxs 236) and `terr2/junc-ath` (1096 discs), ~1.5 s each. A 1 m grid per junction, with point-in-triangle against the real static meshes (HUB.grp; culled tiles count as shown; wbLod far-LOD, ramps and roam objects excluded; bridge decks skipped). The visible top is the highest surface; a <6 mm tie goes to the stronger polygonOffset. Pass: 0 edge bands/raised strips on junction asphalt, strip ≤0.05 m above the road, step ≤0.1 m and fold (2nd difference) ≤0.1 m between 1 m samples. The ground off-plane residual is info only (decision: smooth bows of 0.1–0.6 m over 25–70 m Frankfurt junctions are slopes, not warps; checked by eye).
- Results: fra PASS (strips 0, ≤0.007 m, step 0.076, fold 0.09), ath PASS (0, 0, 0.042, 0.079). Terrain tag 13/14 (flush-ath is terr-1's open item (1025,-1816), unchanged). Unit 0 FAIL. Frankfurt +45k tris (+2.0 % static world), Athens unchanged, no measurable boot change.
- Shots: `docs/shots/terrain/terr2_junc_fxs720_before_after.jpg` (shows the b27 look before), `terr2_junc_grid.jpg` (7 junctions before/after, both cities).

## Tools / gotchas
- Hot daemon: `reboot` fails after a heavy eval, and two cities in one daemon stall. Restart per city instead: `node tools/hot.js stop; HOT_CITIES=ath node tools/hot.js eval 1`.
  Never `pkill -f tools/hot.js` from a bash line that contains that text (it kills your own shell).
- Debug a junction point: `TJ_meshes()`, `TJ_tris(MS,[{x,z,r}])`, `TJ_hits(C,x,z)` (y,u,kind,pf). TJ.cap (build-time capture) is freed after the build.
- tChkGo was not run (hot GOs only). The integrator session_01QewuGcL86b169339CDxRy9 was INACTIVE at push time: the coordinator has the SHA.

## Open queue (not started)
2. Athens boot ≤25 s (ath-boot GO 30–35 s). From hot-1: buildHubProps 5.3 s (98lf wrapper), gndBuild 3.8, CE_streets 2.9 (src/60_city_build6.js:1: put() calls cityAt + trailDist + lzRoadD + mtnDist + fillAt per candidate), TR_bldFix 2.1, plus split slice 3's +3 s from the top-level `await` in 52_terrain_data.js (split-1 suggests classic blocking <script> chunks before the module). Profile: `node tools/bootprof.js ath 30` (CHILD=fn / CALLERS=fn). Load: `tools/tLoad.js <outdir> ath`. My hot boots measured 23.5–26.7 s (draw=0, local, noise ±2 s).
3. Hills read from more streets. terr-1 already added nearer ridges (0.4–1.6 km) and the in-city slope tint (926dbc44). Keep terrain 16/16 green; Mühlberg relief margin is thin (101.8 vs ≥100).
