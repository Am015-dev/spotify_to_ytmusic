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

## v88w: DONE, reviewer PASS (4ca31b6), DEPLOY sent (alex/od-world f0a4e32b, out/v88w, on live v88v a1b848d)
- Last cuts: `wbIcon` (98wb end: map icon sprites of RO.marks → 1 InstancedMesh, 16×8 atlas, hidden/restored around render), `wbLoShare` 1.35 (far traffic types within 1.35× body box share the leader's lo mesh, scaled).
- Numbers (ath/v88w/m/): Fra 253→195 draws, tris avg 1.05→1.16M (peaks 1.34M perf spot, 1.62M close.js chase 0.2); Ath 244→203, 0.98→1.10M (peak 1.44M). CPU ms Fra 3.24→3.34, Ath 5.92→5.28. Tyre gap 0.03/0.033.
- Reviewer: keep wbTerr=1 until Alex's Show FPS says otherwise (wbTerr=0 = peak tris down, +~25 draws).
- Reviewer notes for next pass: (a) Life crowd cluster spawns minifigs inside parked cars (fra_0.5_car after): reject cluster spots within parked-car bbox+0.5 m (98l). (b) plain beige pillar/tower by the Frankfurt bridge (fra_0.2_wall) still windowless.
- Shots: ath/v88w/cmp (before/after stacked), ath/v88w/std, ath/v88w/after/ath_popup.png. v88v reference build: `git worktree add wb88v 7ef0c6c` + build --local.

## v88x plan: Athens busier (NOT started)
1. Fix (a) above first (crowd-in-parked-car, 98l LV cluster placement), cheap.
2. Kerb dressing instanced (bollards, kiosks, orange trees, café chairs) along Athens streets near the player: 1–3 draws via InstancedMesh, recycled like lively peds.
3. Crowd clusters denser in Athens (lvCrowd ×1.3 Athens only, Plaka/Monastiraki), evzones pair at Syntagma, one #bus line (blue-white) on a main avenue.
4. Budget: Athens ≤215 draws, tris avg ≤1.2M; measure with ath/perf.js; shots: close.js ath + g11drive ATH=1 + popup.js.

## Athens busier, older notes: see docs/HANDOFF_perf.md "Next" (kerb dressing instanced, crowd clusters, evzones, #bus).

## Tools (ath/v88v/, run from the repo root; server :8766 = `python3 -m http.server 8766`)
- `top.js <url> fra|ath` (DET=b SPOT=f): draws/tris per object category at one spot (hooks renderBufferDirect).
- `inv.js`: inventory of HUB.grp by material. `probe.js <url> <city> "<js>"`: evaluate after roam entry. `shots.js <url> <city> <out>` (DRONE=1, SPOTS=…).
- `tpltest.mjs`: node unit check of WB_tpl (indexed = non-indexed result).
