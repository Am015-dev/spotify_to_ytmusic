# HANDOFF rev-1 → rev-2 (bug hunter, 2026-10-14)

Job: one teleport sweep per new LIVE build (next: beta.37, then beta.38). Find bugs before Alex does, turn each into an `rv:<date>` checklist test, route it to its owner lane, and send the coordinator (session_017iH3DB4VyxwKSdMwsco4Ut) a ranked list of 10 lines or fewer.
Lanes (coordinator brief, 02:44): cam-2 camera/sinking (session_01EYkuBARKhEtuoc447HjjLv) · foot-2 spawns/on-foot (session_01Wk3tCUz39tLELACJC821Sk) · xform-1 driving feel + portrait UI · art-3 world objects/facades (session_01Lav2AWo3iEKJTMMk8cCcCt) · trk-3 races (session_01VLUU7qG6rkKBd6UtN9FwoQ) · gfx-2 lighting (session_01W4Vv4TLL1rd3tZA62JLNjA) · life-2 (session_01DhpmPrE3mCsD3ixJsHMF5M) · asset-2 (session_011hY1WVvJaZ5tESSJwrB8Bn) · terr-2 terrain (starting).

## Method (what worked)
1. Make a hot copy of the build (gives module-scope eval):
   `python3 - <<E` read `out/<ver>/index.html` as **utf-8** (overdrive.html has no charset, so it shows mojibake), insert `window.__hot=__hs=>eval(__hs);\n` before `window.__mho={`, write `out/rvNN/index.html`, copy km.js/models.js/models/music/tune.json next to it, then `cd out && python3 -m http.server 8899`.
2. Scripts are in `tools/rv/`: start `cd tools/rv && node rvd.js http://127.0.0.1:8899/rvNN/index.html 8897 &`, then `RVS=$PWD/tools/rv tools/rv/sweep.sh fra tools/rv/views_fra.json $PWD/qa_rvN/fra` (same for ath), `python3 tools/rv/pgrid.py qa_rvN/fra qa_rvN/fra_grid "title" 6`, `tools/rv/ev.sh fra '<js>'`. What they do:
   - `rvd.js`: a node daemon holding one warm playwright page per city (`?test=fra|ath&draw=0`). Endpoints: `/eval` runs `__hot(js)`; `/run` runs node code that gets the page `p`.
   - A sweep loop: for each view, `__tq.reset()` → setup js → wait → metrics → `__tq.o.draw=1` only for the shot → shot 852×393 (L), resize to 393×852 (P), shot, back to L.
   - Helpers `RV.card/start(kind,id,nth)` (roamOpen(mark) + roamGo()), `RV.warp(x,z)` (rfSnap + roamWarp), `RV.ride(id)` (gbOpen; GAR_select; wait LDL; gbClose(true)), `OF_go('car'|'bench'|'mission'|'npc')`.
   - Marks: `RO.marks` (kind + ev.id: quest m1_hotdrop, q_ball, rival, boss, season, challenge e1-e6, mode, sprint sp_*, otg *).
   - Pair-grid: L + P side by side, 6 views per image.
   Cost: ~30-40 s per view in swiftshader (draw only for the shot). 50 views ≈ 30 min per city; run both cities in parallel.
3. `node tools/rvGo.js <url> rv14/ [--shots dir]` runs the rv14 GOs in P and L (works on the hot page `http://127.0.0.1:8890/hot.html` = current src, or on a build).
4. Read only the grids, then zoom into suspect tiles. Metrics that catch bugs: `OF_parkChk().tyre`, `OF.y-groundAt`, `camera distance` after a ride switch, DOM rect overlaps (#raceW #tP #b2kM #tL #tR #roamMini #roamArrow #rgSpd #hPos #spd #ogArea #roamCard #rcGo #rcNo).
5. Avoid: `pkill -f <pattern>` kills your own shell (use `kill $(pgrep ...)`); scene raycasts need `rc.camera=camera` and a mesh list; the LV_onRoad prop scan gives false hits on grass medians (cityAt/fillAt is the right road-edge test).

## Sweep 1 results (beta.27, grids qa_rv1/*_grid_*.jpg; open tests rv14/* in src/99rv_review.js + 99c)
FAIL on current src: rv-cam-refit (ride switch: Frankfurt lags one ride, Athens never re-fits), rv-p-hud (portrait: KM/H on the car, boost bar over ▶, timer over pause, arrow over the minimap), rv-p-race (portrait place over speed), rv-median (respawn on the median, lat 0), rv-hill-spawn (Kurpark tyre 0.4 m), rv-ath-foot (OF_go fails in central Athens), rv-p-garage (district chip over the garage in landscape).
To fix in the test: rv-p-card (the card does not open on the hot page: check markLocked or RO.cool), rv-ath-fest (find the mark by ev.id e_fest; visual only).
Visual only: rv-black-wall (pure-black facades), rv-ath-fest (brown box + black square on the road).
Not reproduced: bushes on the road, the figure inside a truck, sinking in roam (tyre gaps 0.03).
