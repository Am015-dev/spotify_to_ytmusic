# terr-1 handoff (2026-10-14). Branch alex/od-art1 → pushed to alex/od-int2

## State
TERR is ON by default (`?terr=0` = the old flat raster, sticky per tab; localStorage `mho_terr=0` for good). Code: `src/53_terrain_roads.js`
(TR_relief, TR_grade, TR_roadsInit, the rfGrid wrapper, TR_bridgeEnds, TR_padList) and `src/98tr_terrain.js` (tests, slope colours, flush recorder).
- Relief: exaggeration above a 1.2 km blurred floor (fra k 3.6 / ath 1.4, soft cap c 200, Acropolis excluded), horizon ridges at the
  world edge (+70/+50 m), a ring of nearer ridges 0.4-1.6 km outside the city box (+55/+40 m).
- Roads: ONE network solve per pass (TR_grade): every road sampled every 4 m, links |dy| ≤ g·ds (fra .085, ath .07, hill trails .3),
  equality links between roads closer than hw+flat+4 m, junction discs (JUNC, FILL_X, flat landmark plazas from LMX, overlapping discs
  linked) where every sample inside equals the disc node. Exact Dijkstra lower/upper Lipschitz envelopes, averaged. Then rasterized:
  flat to hw + one cell (+4 m), feathered 12-40 m, own-width weight dominates (1/(1+lat-hw)^4), discs weight 40.
  Frankfurt: pass 1 at TR_init (streets + Autobahn), pass 2 when rfGrid builds the filler grid (fillers + streets + Autobahn).
  Athens: graded right after AB_auto extends the dead-end streets (wrapper); Athens shelves are off with TERR (raster already graded).
- Bridge decks (city + AB) start/end at the graded ground (yA/yB, TR_bridgeEnds after each pass).
- Filler-road kerbs (60_city_build4.js) are now ≤6 m pitched pieces on the ground (were one flat box at y .12: Alex b27 "bands across the
  asphalt", 1687 sunk pieces).
- Athens qt ground cache (10b) regenerated on the current raster (qtdump forces a live fit via window.__qtdump). Re-run
  `node tools/qtdump.js http://127.0.0.1:8766/local_dbg.html` + build after ANY height change, else ath-boot fails.
- LF mounds auto-off with TERR; GO lf1/mound checks the Mühlberg relief under TERR.

## Tests (TAG=terrain, 16 GOs, all < 10 s): last numbers on the final build (probe, not a full tChkGo run)
fra: grade max 11.4 %, edge 0.06 m, junctions planar 0.021 m, Mühlberg ~100 m (margin thin), deck joints ok, tyre 0.02.
ath: grade 9.7 %, edge 0.09 m, junctions 0.015 m, Lycabettus ~198 m. Unit OK 0 FAIL.
OPEN: terrain-flush-fra FAILS: 2 sunk pieces at the Römerberg Ostzeile row (-73,-15)/(-73,10), ~1 m under (the ostzeile plaza disc
didn't catch them, probably they lie outside its r 30 or the Römer junction disc wins). terrain-flush-ath FAILS: 1 floating piece
(1025,-1816) +0.21 m (unknown object, near Thiseio). Find the builder (TRN_FL.float/buried give x,z,lo,hi,material) and drape it or pad it.
Last full tChkGo run of the whole terrain tag was before the junction/flush work (16/16); rerun `TAG=terrain,road-gap,ath-boot,lf1/mound tools/tGo.sh <url>`.

## Tools
art/rprobe.js `<url> <code> fra|ath` (needs attic/tools/lowgfx.js, restored from history, untracked in some checkouts), ?trdbg=1 keeps
the solver runs in TR_W.trRuns, TRN_FL (flush recorder), __trn.{grade,edge,ramp,base,relief}, TRN_junc().
