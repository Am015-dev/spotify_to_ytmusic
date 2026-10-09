# HANDOFF world (alex/od-world): v88v world batching → v88w 2× brick detail → Athens busier

Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Live: v88u (alex/od-athens dadad854; handoff 14f6eb6 merged here).
Draft PR #74 (alex/od-world → alex/od-athens) exists; it is only for tracking.

## Status v88v: DONE, DEPLOY sent (alex/od-world 7ef0c6c3, out/v88v, on live v88u). Reviewer: CONDITIONAL PASS, condition fixed
All code is in `src/98wb_world_batch.js` + knobs (10_core TUNE, 99t Life tab, tune.json, docs/TUNE.md). Final numbers (`ath/v88v/rev/final.txt`):
Frankfurt 264 draws / 1.08 M tris (v88u 435 / 2.46 M), Athens 242 / 0.98 M (297 / 1.60 M). Tyre gap max 0.033 m. Load time unchanged within noise (`ath/v88v/loadtime.js`).
- Hitch fix: the background far-cell build used to stall up to 8–14 s; the cause was `WB_pix` (texture colour readback: canvas drawImage+getImageData stalls on the GPU while the game renders).
  `WB_pixPrep()` now does it in the loader (ldPrewarm, +0.6 s Fra / +0.3 s Ath headless). The instance loop yields every 128 instances. Max slice: 20 ms Fra / 28 ms Ath (`ath/v88v/hitch.js`, WBC.st slMax/sl50/sl100/big/pix*).
  The remaining multi-second headless frames also happen on v88u (swiftshader), so ignore them.
- Ring guard (reviewer condition): `WB_figPre` hides any torus with radius ≥ 3 m while the camera is within `TUNE.wbRingCam` (6 m) of its plane and inside R+6 (same in v88u, not a v88v regression). Proof: `ath/v88v/ring_cmp.png` (`ringshot.js`).
- Baseline v88u for comparisons: `git worktree add -f wb/base dadad85` + `ln -s ../../node_modules wb/base/node_modules` + `(cd wb/base && tools/build.sh v88u --local)` → http://127.0.0.1:8766/wb/base/local_dbg.html.
- Found, not fixed: LVP roadside pop-ups never spawn in Athens (LVP_path needs a street edge ≥ 40 m, and Athens edges are ≤ 38 m; walk chained edges instead). Reported to the coordinator.
- If the coordinator reports a deploy problem: everything is in out/v88v; the review shots are in ath/v88v/rev/.

### Left for v88w: draws ≤ 200 in Frankfurt (now ~264; spot 0.1 is ~295)
Breakdown at spot 0.1 (`ath/v88v/top.js DET=b SPOT=0.1`): city proxies + LOD + pieces ~90, terrain trG/trPl ~30, traffic (11 types × body/wheels/glass/lo/ART8 twins) ~25–30,
misc (studs in RO.grp, sprites, gb car, points) ~40, remaining merged/HUB.M ~30.
Ideas: bigger far cells (2 levels: 640 m blocks when all 4 sub-cells are far); one far InstancedMesh for all traffic types; drop ART8 twins beyond ~40 m; fewer near proxies.

## v88w status (IN PROGRESS, not reviewed). Branch alex/od-world, live = v88v (a1b848d, built from 7ef0c6c3)
Code: NEW `src/98bw_bricks2x.js` (in ORDER after 98wb), edits in 98wb (super cells, piece runs, grouped proxies), 93 (bwCar), 98l (LVP_ahead), knobs in 10_core/99t/tune.json/TUNE.md.
1. **Bricks (shader, 0 draws/tris)**: BW_flag wraps onBeforeCompile of KMM.com/sub + all HUB.BM materials (needs LK's vLkW): brick courses 0.48 m (`bwCourse`), staggered joints,
   lit top edge, tiles on tops, glass frame grid; full to 0.6×`bwFade` (90 m), gone at 90 m. Verified visible: `ath/v88w/after/fra_*_wall.png` (houses, piers).
2. **Roof studs**: per-cell lazy generation near the camera (BW_cellGen ≤3 ms/frame, cells within bwStudD+90), sources = Kenney com/sub instances (WB_tpl exact, texel colours) +
   merged facade soups captured in WB_cityPrep (BW_mergedPrep). One InstancedMesh, ≤8000, only roofs 2–16 m above ground (`bwStudH/bwStudTop`) and below camera eye. City-wide would be 775k studs, hence lazy.
   NOT yet looked at: `_roof.png` shots (camera 28 m up) of the after set don't exist yet (rerun close.js on the current build).
3. **Cars** (`bwCar`, CR_LO=3 in CR_cityGeo): keeps mirrors/plates/exhausts, curveSegments 8, studs as LO (6 seg). Full LO=0 was 3.5× tris (truck 80k), rejected. Tri count of LO=3 not re-measured.
4. **Draw budget**: wbSuperD 700 (2×2 far cells share one buffer, super mesh when all 4 far), wbTerr (trG/trPl merged 800/2000 m blocks at load, 197 meshes fewer),
   wbRuns (contiguous near pieces one drawRange), grouped near proxies (2635 originals → 84 groups), wbLzD 420 (far small HUB/lazy instanced hidden), bwRampSh 70 (ramp shadows), wbLodD 220→190.
5. **Athens pop-ups**: LVP_path walks chained straight edges (LVP_ahead); probe: 74/300 street spots now get a path (was 0). Not yet seen spawning in a drive.

### Numbers (perf.js avg of 3 spots)
Frankfurt: v88v 264 / 1.08 M → now **209–213 draws / 1.16–1.18 M tris** (noise ±5 from traffic). Athens (before proxies/ramp/190): 222 / 1.08 M (v88v 242 / 0.98 M).
Still > 200 in Frankfurt. Left at the worst spot (top.js SPOT=0.1, 249 before ramp fix): proxies ~45, non-WB dynamic instanced (lively/parked/smashables) 17, map icon sprites 11 (70 mission icons, 1 draw each),
traffic far lo 11 (1/type), wbM ~19, far LOD ~22, terrain ~14. Next ideas: share far lo between plain white types (sedan+sports, suv+van, delivery+truck, scaled) −3;
mission icon sprites → one Points/instanced quad atlas −10; ART8 twins on traffic beyond 40 m −2.

### Shots
`ath/v88w/close.js <url> fra|ath <out>`: per fixed spot (ath/v88w/spots_<city>.json): _fac (street level 40°), _car (traffic side), _wall (12 m from nearest building), _roof (28 m up), + chase draws.
Before (v88v, served from wb88v/local_dbg.html = live v88v copy): `ath/v88w/before/` fra complete; ath was rerunning (before_ath.log). After: `ath/v88w/after/` fra (no _roof yet), ath not yet.
Then: standard set + tyre gap (ATH=1 node ath/v88v/g11drive.js …), REVIEW, OD_CHANGELOG v88w + checklist (99c), split out/v88w on CURRENT live, DEPLOY to coordinator. v88x (Athens busier) after.

## Athens busier (after v88w): see docs/HANDOFF_perf.md "Next" (kerb dressing instanced, crowd clusters, evzones, #bus).

## Tools (ath/v88v/, run from the repo root; server :8766 = `python3 -m http.server 8766`)
- `top.js <url> fra|ath` (DET=b SPOT=f): draws/tris per object category at one spot (hooks renderBufferDirect).
- `inv.js`: inventory of HUB.grp by material. `probe.js <url> <city> "<js>"`: evaluate after roam entry. `shots.js <url> <city> <out>` (DRONE=1, SPOTS=…).
- `tpltest.mjs`: node unit check of WB_tpl (indexed = non-indexed result).
