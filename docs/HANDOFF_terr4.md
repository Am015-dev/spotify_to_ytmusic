# terr-4 handoff (2026-10-14). Trunk alex/od-int2, one commit "terrain: terr-4 hills from more streets"

## Done: item 4, hills from more streets (flag ?trh=0 = old, default ON)
- **Test first** (src/98tr_terrain.js `TRN_view`, GO `terr4/terrain-hills-fra` / `-ath`): 100 street spots in the hub, eye 1.5 m over the road.
  Rays march the ground 150 m .. 1500 m (`TRN_VD` = the 'min' quality far plane; phones draw 1500-2000 m) and every HUB.grid building collider
  (top = b.h). A ray SEES A HILL when a ground point is ≥20 m (`TRN_VH`) and >1.5° above the eye and above every building / nearer ground in front.
  Pass metric = the DRIVING view: road direction both ways ±30° (5 rays each). Info: all-round 16 headings.
  First version skipped colliders with `y0` = every Athens building: fixed (Athens fell from 91 % to 19 %; Frankfurt barely changed).
- Results (seed default; seeds 5-7 in brackets): Frankfurt old 64 % → **77 %** (80-84), need ≥75. Athens old **14 %** → **53 %** (56-62), need ≥45.
- **Mounds** (src/53_terrain_roads.js `TR_hills4`, after the river flattening, before road grading): where the local relief RMS over ~1.2 km is
  below `TR_HA.rr`, add smooth mounds up to `TR_HA.h` (fra 70 m, ath 100 m; wavelength `w` 400/450, ~2.5-3 km apart). Faded out 250-700 m from
  the river, near landmark plazas (r+60..r+160 m) and on the Acropolis. Roads are graded after, so grades stay capped. `?trk=<k>` overrides TR_RK k
  (raising k 1.4→2.2 in Athens gave only +3 %: not used).
- **Athens backdrop mountains were invisible on phones**: athRidge is a ring 2300 m around the camera, but the far plane is 2000/1500 m on
  low/min quality, and it stood on y 0 (Athens streets are at 30-250 m, so it sank below the eye). `TRN_ridgeFit` (wraps hubTrafficStep): ring scaled
  about the camera to 0.9 × far (same apparent size), standing on the ground under the camera. The view test counts it (`TRN_ridgeTop`, per degree).
- Athens ground-quadtree cache regenerated (src/10b + 10c) for the new heights. **Any Athens height change needs it again:**
  `HOT_CITIES=ath node tools/hot.js reboot ath x=1` then `node tools/qtdump.js 'http://127.0.0.1:8890/hot.html?x=2'` (tools/qtdump.js now writes
  the split 10b/10c layout; with `?trh=0` it reproduced the old blob to 4 bits of 1.22 M). `?trh=0` and `?trk=` fit every cell live (QTC.ok=false).
  A stale cache = junc-ath FAIL (6 edge strips) and slower boot; that is how you notice.
- terrain-edge test: junction mouths (centre within one half-width of a terr-2 pad/disc/square, `TJ_inJunc`) are skipped like intersections:
  a filler road ending 8 m before the Ring (fra -816,240) carried the Ring's 6 % grade across (pad plane, blended over 20 m).
- All terrain GOs PASS both cities (hills, lyka 185.6, muehl 121.8, flush, grade fra 11.4 / ath 9.7 %, edge, ramp, base, slip, junc, tyre 0.023 m),
  plus v90n/sink-rod/cab/truck (tyres 0.03 m) and art1/road-gap. 0 console errors. Athens hot boot unchanged (~34-38 s here).
- Shots: docs/shots/terrain/terr4_hills_before_after.jpg (2 spots per city, before = ?trh=0).

## LOOK finding (honest): the effect is subtle on screen
The mounds are covered with city blocks, so they read as "the street climbs" (Athens spot 0/1) rather than "a hill". Frankfurt spot 1 looks
unchanged. The Athens ridge shows as a faint violet peak at avenue ends. The metric passes; the visual "hill" read is still weak.
Next leads (not started): (1) green/park tops on the mounds (no buildings above a height on a mound: they then read as hills, like Lycabettus);
(2) a Frankfurt backdrop ridge (Taunus NW, real bearings) like athRidge; (3) stricter test: hill ≥4° or ≥40 m, plus a pixel test on a shot.

## Thin margins
- Frankfurt edge (500 samples): max 0.29 m (limit 0.3) at fill15 (240,-888): parallel overlapping roads (fill15 and moerfelder 24 m apart, bands
  overlap 3 m) graded at different heights; the 50-sample GO reads 0.05. Old build max there 0.13.
- Athens grade 9.7 %, Frankfurt 11.4 % (A66w, unchanged by this work).
