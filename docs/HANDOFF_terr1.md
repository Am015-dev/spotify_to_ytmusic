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
LAST RUN (od-int2 merge, TAG=terrain,road-gap,ath-boot,lf1/mound): 18/19, 0 errors. fra k is 3.9 now (Mühlberg ≥100 m, margin thin);
bridge ends sample the ground 0.6 m past the deck end (= the joint the test reads).
OPEN: terrain-flush-ath FAILS: 1 floating piece at (1025,-1816) +0.21 m (unknown object near Thiseio; TRN_FL.float gives x,z,lo,hi,colour).
Find its builder and drape it or add a flat disc for it in TR_padList.
unit: 4 FAIL checklist/go-explicit-xf1/* are on od-int2 itself (not terrain).
Split-1 moved the Athens QTC blob to src/10c_qtc_blob.js (lazy): after tools/qtdump.js (still writes the whole thing to 10b) move the
`{const A=...}` block from 10b into 10c (keep 10c's first comment line) — see the python split in this session's last commit.
Locally: node_modules is untracked now: `npm i three@0.164.1 --no-save` before building.

## Tools
art/rprobe.js `<url> <code> fra|ath` (needs attic/tools/lowgfx.js, restored from history, untracked in some checkouts), ?trdbg=1 keeps
the solver runs in TR_W.trRuns, TRN_FL (flush recorder), __trn.{grade,edge,ramp,base,relief}, TRN_junc().
