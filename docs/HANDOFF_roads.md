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
