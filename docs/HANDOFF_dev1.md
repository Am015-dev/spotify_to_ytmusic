# HANDOFF dev1 (branch alex/od-dev1, from od-int1 9d5d6c18 + od-roads c47039b + od-int2-tq d2108ce)

## Done (each pushed, coordinator told)
1. LAG (2ced33a8): perf-4 port in src/98ld_l_land.js (Athens CE far LOD, LDS_scan covers every LDS type, swap every 10th frame, ?props=0)
   + Frankfurt LDS props far = old Kenney geometry + atlas material (`d.gFar/d.mFar`, kmProps wrapper). `LDS.chk()` + GO v90k/lag: PASS both cities.
2. ROADS Athens (f7f09641, 6fc91314): od-roads merged; `RD_kriezi()` (51_city_net.js) + GO v90k/ath-kriezi PASS.
   2-min Athens drive (qa_dev1/tDrive.js, my keyboard street-follower; tPlay hung in setup): 1.5 hard hits/min (one spot 3090,-1848), stuck 2.7 %.
3. Frankfurt motorways (ffba9d8f): `AB_auto` in 53_terrain_roads.js (ramps from outward dead-end streets to the nearest motorway, forced ramp for a
   motorway without one, rejects paths across the Main / near other streets / inside filler-grid districts; then dead street ends extended to the nearest
   drivable street ≤150 m). `RD_fillJoin/RD_fillLoop` in 51_city_net.js (grid ends join next road ≤150 m or trim; trim-only pass again at buildHubG start).
   KEY BUG FOUND: 98bk_bake.js caches fillAt per FILL_G identity; OB_fillIdx clear() kept stale answers -> now `FILL_G=new Map()` before reindex.
   `AB_netChk()` + GO v90k/fra-net PASS: 1 network, 9 dead ends, every motorway has a ramp, 0 ramp building hits.
   Open: ramp drive end-to-end unverified (headless real time too slow); green plate patch at the street→ramp seam.

## NEW ORDER (coordinator 21:02): (1) BUILDER TRACKS FIRST, (2) 3a vehicle scale audit, (3) 3b, 3c, then 4-18
- (1) Alex: "I see no tracks made with the builder yet!!!" Build with BX (src/98b2_builder2.js, its own piece format so Alex can edit) 3 built-in
  tracks, visible in the builder track list AND playable from the Race menu: "Cliff Run" (mountain, cliff jump ≥1.5 s air, a drop, banked turn),
  "Two-Level City" (bridge over a road, tunnel under, water shortcut = boat), "Canyon Split" (canyon, 2 routes, off-road cut). ≥15 m elevation range
  each, no invisible walls, not flat. Per track: checklist GO (rv: style) + auto check (lap completes, elevation range, airtime, 0 errors).
  ONE grid of low chase-cam shots, LOOK (flat = redo). Push, one line + grid path to the coordinator. int-2 builds it live after.
- (2) 3a Alex: "some cars do not fit the human, way too small; some bus like a car size". Script measuring L/W/H of EVERY ride + traffic model and
  the driver minifig vs seat/roof; targets car 4-5 m, van 5-6, bus 11-13, truck 8-12 (check SZ_* in 98sz_ride_scale.js); per-model factor table
  (id → class → factor); rv checklist test "every vehicle ±20 % of class, driver fits" + GO opening the worst 3 in the garage + auto check;
  ONE before/after grid of the 6 worst beside a standing minifig.
- Also: fix the green plate seam under the car at the street→ramp start (coordinator saw it in go_v90k_fra_net.jpg).
- int-2's FILL_R fix (od-int2 0c07e04) targets my older e750be2 line; on od-dev1 that line is already gone (pass moved into rfGrid/buildHubG,
  ffba9d8f). When merging od-int2, keep od-dev1's 51_city_net.js version.

## Coordinator additions (after the above)
- 3b rv:2026-10-13 checklist tests (GO + auto check, fix fails): roads-1 kerb-parked cars counted off-road (fix in HANDOFF_roads: monitor skips c.pk);
  ped crossing gap rule too loose (RD_may in 98rd_roads.js: no car <8 m, none <30 m heading in); Athens start upside down (rare; SZ_add / LD_FACE);
  home-1 bricks over garage UI + toast overlap.
- 3c token savers (10 min): tools print pass/fail only; docs/MODULES.md one line per module (<10 KB, tools/modmap.py); split 60_city_build.js,
  10_core.js, 30_race.js into parts <40 KB (no behaviour change, src/ORDER), checked by the GO set (tools/tChkGo.js).
- then queue 4-7 (builder boat/bridge/split/elev, parked-car settle, 21 rides grid, WRONG WAY banner vs mission card),
  8-18 (orange box, sunk items scan, Big Rig, Athens upside down ×10 seeds, FRA stuck 4.4 %, ATH heap, Home trees, scooters, traffic rules,
  Home/nitro GO spawns, ▶ RUN + ?dev=1 panel). int-2 FAILs: v90k/shadow needs a wait/spawn; v90g/bigrig has no target (item 10).

## Tools (qa_dev1/)
- `tGoQ.js <url>/local_dbg.html <out> fra|ath <ver/id>[=key[=ms]]…` : ?test= fast start (FRA ~25 s, ATH ~70 s), taps GO, PASS/FAIL line + shot; env DRIVE=s holds GAS.
- `tEvalQ.js <url> <city> code.js` : module-scope eval (`__oc.ev`) after ?test= start.  `tDrive.js` : 2-min keyboard street-follow drive (old boot).
- Build: `tools/build.sh v90k-dev1 --local`; server `python3 -m http.server 8766` in the repo root.
