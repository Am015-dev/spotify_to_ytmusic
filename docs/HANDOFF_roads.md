# HANDOFF roads-1 (branch alex/od-roads, from alex/od-models; live v90i)
Brief (coordinator, Alex 2026-10-13): simplify + connect the maps, wider roads, cars and people follow traffic rules. FULL gate (driving/world change).

## Tools (tools/roads/)
- `rdProbe.js <url> <out> fra|ath` → `graph_<city>.json`: road audit (OB), components, dead ends, width km, junction types, traffic-graph SCCs. `rdGraph.js` = in-page code.
- `rdMap.py graph.json out.png`: top-down map (grey main net, colours = disconnected, red rings = dead ends, green = signals).
- `rdXmon.js`: in-page traffic/ped rule monitor (red runs, off-road, wrong side, wrong one-way, overlaps + type, stuck20/60 + reason, peds on road, ped hit by car).
  tPlay hook: `XMON=tools/roads/rdXmon.js node tools/tPlay.js …` → `cityRes[city].xmon` (edit in tools/tPlay.js, 3 lines).
- `rdTraffic.js <url> fra|ath [sec]`: observer run (player parked on the pavement at the start + 2 busiest signals), render stubbed, ~1 min wall for 60 s×3.
- `rdShot.js <url> city <out> spec.json`: overhead shots (`<tag>_c.png` = canvas). **Needs GFX=normal** (gfx min renders black in this harness).
- `rdEval.js <url> city code.js [ticks]`: eval in module scope. Ticking with render on is slow (2400 ticks > 10 min).
- Base page copy for A/B: `rd_base.html` (= od-models 98425dc build). `?rd=0` turns every RD change off.

## STEP 0 numbers (base 98425dc)
- Graph: FRA 1 comp, 215 dead ends (203 grid stubs at grid edges), 474 CV junctions, 26 signals, traffic SCC 98.8 %. Grid crossings had NO approach edges
  (CV ignored edges > 140 m; grid edges are 240 m) → no yield/box rule at ~200 grid crossings.
  ATH 2 comps (0.54 km orphan), 365 dead ends, 947 junctions (65 signals), 160 km of one-way streets → traffic graph main SCC **23 %** (4934 SCCs: cars trapped).
  Widths ATH: 100 km < 8 m, 157 km 8–10 m.
- tPlay phone FAST MIN=3 (rd/tp_before, rd/tp_before.txt): FRA wall 0.66/min stuck 0 %; redRun 9.4 % (3/32), wrongSide 2.4 %, overlap 917/min, stuckCar 28 %,
  pedOnRoad 27.7 %, pedHitByCar 89. ATH wall **5.64/min (FAIL on base)**, stuck 1.3 %, heap 164 MB (FAIL on base), offRoad 7.2 %, wrongOneWay 1.47 %,
  overlap 323/min, stuckCar 25.7 %, pedOnRoad 2.75 %, pedHitByCar 47.
- Observer FRA base (rd/trB_fra.txt): stuckCar ~60 %, stuck60 17, overlap ~1400/min, pedOnRoad 21–25 %.

## Changes so far (src)
- 51_city_net.js `RD_net` (after OB_fix): ATH dead-end stubs cut (res 420 / sec 320 / link 200 / main+arterial 70 m; protected within 45 m of spots/landmarks/garages),
  orphans < 3 km dropped, all streets two-way for traffic (r.one0 keeps the original), widths: arterial ≥13 (×1.25, cap 22), main ≥11 (×1.2, cap 18), sec ≥8, res/link ≥7.
  `RD_fillTrim` (rfGrid wrapper): FRA grid stubs beyond the last crossing (< 230 m) trimmed, single-junction stubs deleted.
  Result: FRA dead ends 215→35; ATH 365→96, 1 comp, traffic SCC 23 %→100 %.
- 90_fixes_cv_ju.js: approach edges up to their own length (grid crossings get rules); two-phase signals (opposite approaches share green, 14/10 s, walk 7 s);
  compatible paths share the box (RD_compat); a car held 6 s in a box goes on; stuck despawn also when not on screen; RDy stop-reason tags.
- 95_drive_flow.js DR_unjam: also despawns stuck cars the camera cannot see.
- 70_roam_world.js: two lanes per direction on chains with w ≥ 14 (c.lane picks ±0.11 w).
- 60_city_build.js pedStep: RD_pv / RD_pedNext / RD_sd / RD_kerb hooks. New `src/98rd_roads.js` (ORDER before 99_api): kerb constraint, crossing permission
  (outside junction box only, WALK at signals, no car within 20 m elsewhere, wait 12 s / 90 s then turn back), cars stop for walkers on a crossing, Frankfurt zebras (1 mesh).

## Open / next
1. Overlap diagnosis: observer says overlaps are mostly `sameEdge` (two cars on one edge < 2.2 m) — leader-follow failing somewhere (rdEval ov.js in scratchpad).
2. Observer stuck% did not improve (queues at reds are normal; use stuck60 = gridlock). Lead=most stops.
3. Then: tPlay XMON both cities on the new build; compare with STEP 0; Athens wall hits; shots grid; REVIEW.

## Gate run (new build rd16 = commit below) vs base re-run with the same monitor (rd/tp_after*, rd/tp_before2*)
- FRA: wall 0.66→0.99/min (PASS ≤1), player stuck 4.2→1.3 %; overlap 1015→324/min, stuckCar 32→26 %, pedOnRoad 24→12 %, ped outside crossing 18→10.5 %, pedHitByCar 78→57, redRun 2/21→3/36.
- ATH: wall 4.31→2.98/min (both FAIL), stuck 2.7→4.0 % (FAIL; same challenge-start spot ~1815,-1680 in both runs, +1 episode blocked by a queued car), offRoad 0.07→3.2 %, wrongOneWay 0.84→0, overlap 239→117, pedHitByCar 41→64, heap avg 163→160 MB (both FAIL), peak 166→224.
- Draw calls same views: ATH 249/249/288→232/228/292, FRA 380/421/477→378/431/455 (FRA over 250 already on base). Tyre gap 0.03 m both cities. 0 console errors.
- Grid: rd/step1_grid.jpg. Next slice queued by the coordinator: scooter riders + rideable scooters, LEGO bikes/motorbikes (6522 Highway Bike) in traffic.

## Reviewer FAIL on 5c43425 (items) + status
1 ATH off-road 3.2 % → 540cb2c: flagged cars were kerb-parked (98l parks half on the kerb, base too); monitor skips c.pk → 0.01 % (base 0). DONE.
2 ATH ped contacts 64 (base 41) → gap rule (no car < 8 m, none < 30 m heading in) + wider car stop zone → 21 (base re-run 83). DONE.
3 ATH heap peak +58 → tPlay rd/tp_after2: flat +30–37 MB offset from the 1st sample, no growth. rdHeap.js (GC'd, phone ctx) shows new LOWER (475 vs 484). Probing ?fast=1 (tPlay uses it). RD_cityNear now reuses its Map (churn). OPEN.
4 ATH stuck +1 episode → root cause was MY prune peeling a crossed sec street (1718,-1325); fixed (main/arterial never cut, 2 rounds, crossed stubs kept). tp_after2 ATH stuck 2.7 % (pass), base re-run 1.3 %. wall ATH 4.31→0.66.
5 junction pile-up / overlaps → don't-block-the-box (RD_exitFree), all-red 4 s, breaker 15 s; observer FRA overlap 76/min. tPlay FRA overlap 167 (rd20, before these). Needs tPlay re-run + a low red-phase shot. OPEN.
6 pole on asphalt → RD_poleOut pushes poles off carriageway/junction plates (__rd.POLE() = moved/left). Verify count + shot. OPEN.
7 OD_CHANGELOG v90k (provisional) + 4 OD_CHECKLIST items (ver v90j, the current top) added. DONE.
Final GRID must be ONE labelled grid at docs/shots/roads/GRID.jpg (reviewer rule).

## STATE at stop (2026-10-13, Alex 10-min rule) — code head 381ec86, branch head = last commit
GRID: docs/shots/roads/GRID.jpg. NOT re-reviewed since the FAIL on 5c43425. Integrator is now build-11 (session_01FYerWDe4eDfpw7Jfrm9mtb).
Since the FAIL: un-stacker every frame + recycles never land on occupied spots + no respawn on exit-less nodes (FRA tPlay overlaps 36/min, base 1015);
don't-block-the-box, amber = stop unless at the line, all-red 4 s, box breaker only inside the box (FRA tPlay red runs 4/53 = 7.5 %, base 9.5 %);
poles off the asphalt (FRA 74/75, ATH 251/251); prune fix (main/arterial never cut, 2 rounds, crossed stubs kept → ATH 139 dead ends); ped gap rule;
changelog v90k (provisional) + 4 checklist items (ver v90j).
Last tPlay FRA (381ec86, MIN=3): wall 0.33/min, stuck 2.7 %, overlaps 36/min, red 7.5 %.
Last tPlay ATH (381ec86, rd/tp_final3): wall 5.63/min FAIL, stuck 1.4 %, heap 202.6 MB FAIL, off-road 0.06 %, overlaps 74/min, ped contacts 32.

## NEXT (fresh worker, 10-min slices)
1. ATH heap: 202.6 MB on 381ec86 vs 166–168 MB on 8c60144/6ef8d78 (base 162–166). Suspects in 381ec86: the stranded-car respawn loop in RD_unstack
   (respawn → stranded again → churn?) and the 70_roam_world respawn retry. Bisect 6ef8d78 vs 381ec86 with tPlay CITIES=ath (rdHeap.js does not show tPlay's offset).
2. ATH wall hits swing 0.66–5.63/min between runs (base 4.31): mostly the tPlay bot entering the Plaka pedestrian area (~1585,-1450) and the challenge ring
   (~1815,-1680), both also on base. Run 2 seeds before judging.
3. Re-REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v with docs/shots/roads/GRID.jpg (one labelled grid, reviewer rule) + numbers + tyre gap 0.03 m.
4. After PASS: hand the commit to build-11, READY to the coordinator. Then the queued slice: scooter riders + rideable scooters, LEGO bikes/motorbikes (6522 Highway Bike) in traffic.

## roads-2 (10-min slice): Athens wall-hit diagnosis, NO fix yet
- tp_final3's 17 ATH wall hits are all 6–35 m OFF the asphalt (athRoad e>0), not buildings on the road; 14 of them are in Psyrri (2020–2240, -1400..-1600). Base tp_before2 had the same pattern at other spots. So the cause is the bot driving into blocks, not colliders overlapping the road.
- Fix target: RD_prune cut Kriezi (sec) at 2142,-1419 / 2152,-1410 (base e 3.8 / 1.8 m → new 19 / 32 m). Buildings fill the old street, so a route through it now hits walls. Next: never prune `sec` in the old town (or within ~150 m of Garaz Psyrri), then re-run tPlay CITIES=ath ×2 seeds.
- Tool: `tools/roads/rdEvalW.js <http url> ath code.js` evaluates in window scope (rdEval needs __g9ev, which this build lacks). Serve out/<ver> over http (file:// breaks fetch).

## roads-3 (10-min slice): Frankfurt map before-render only, NO fix yet
- Branch fac6530 FRA graph (rd/r3_before, local page = ./overdrive.html from `build.sh <v> --local`, copied next to km.js): 1 comp, 35 dead ends, 2 stubs < 40 m, 468 junctions. Grid: docs/shots/roads/r3_grid.jpg (live map | branch).
- On the branch the district grids are already one network; the live map's islands come from v90j not having roads-1's work.
- Gap found: motorways (AB in 53_terrain_roads.js, 6 AB_FEED feeders) are NOT in rdGraph/OB_net, so "every motorway connected" cannot be checked yet. Next: add AB + feeders to rdGraph, then add ramps for motorway sides with no feeder (A66 west/east, A3 south), cut the 2 stubs < 40 m, hide Höchst/Offenbach loose roads from the map, checklist item + check.

## roads-4 (slice): Athens old town never loses secondary streets
- RD_prune (src/51_city_net.js, RD_OLD): `sec` streets in the old-town box (x 1450–2300, z -1760..-1300: Psyrri/Monastiraki/Plaka) or within 150 m of Garaz Psyrri are never cut. Kriezi restored (off-asphalt at the stub 19/32 m → 3.8/2.0 m = base).
- Check: `node tools/roads/rdEvalW.js <url> ath tools/roads/kriezi.code.js` → KRIEZI OK (asphalt + no building collider on the street within 150 m). Checklist item ath-kriezi (v90k) with a 📍 GO button (sets a GPS pin; `go:[city,x,z]` field, full checklist only).
- NOT measured: the Athens tPlay ×2 (CITIES=ath MODE=phone MIN=2 FAST=1) did not finish inside the slice (one browser crash, then stopped at the time limit). Next worker: run it twice on 409406d+ and compare with 5.63/min (tp_final3).
