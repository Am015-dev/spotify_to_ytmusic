## perf-16 (2026-10-18, alex/od-int2): LF_tileG bodies out of the generator, pooled decor records, cached colours
1. src/98lf_lively_fill.js: the per-cell/lite/verge/mound bodies of LF_tileG are small top-level functions (LF_cell, LF_litePt, LF_lite1, LF_verge1, LF_mound1, LF_open1; ring/R closures gone), decor records come from a pool checked out per build (LF.rp, fixed shape incl. gx/gz/_vy), pk without filter(), instance matrices via LF_inst, fill colours parsed once (LF_col; was Color.set(string) per instance). Same math and order: per-tile props + instance-matrix hashes identical trunk vs mine on 12 shared tiles.
2. heapOwner Athens (1 run each): LF_tileG-owned ~134 MB (LF_tileG 97, di 30, P/G16/tryP 7) -> ~77 MB (LF_tileG 32 + helpers 45) while building 14-15 tiles instead of 11-12 in 10 s. hubTrafficStep 430 is now the top allocator by far.
3. tFrame Athens SECS=10 HEAP=1 RACE=0, median of 3, trunk -> mine: 1574 -> 1544 MB (157 -> 154 MB/s, within noise), max 272 -> 189 ms, >50 ms frames 44 -> 32 (runs: trunk 1554/272/33, 1574/274/44, 1629/209/44; mine 1580/239/28, 1544/189/32, 1543/154/36). Goal (<=120 MB/s, max <=100) NOT met.
4. Gate on built p16a: unit 0 FAIL; TAG=life1,xf1,terrain 42/42. Step 2 (split hubTrafficStep, 70_roam_world.js:62-141 + ~12 wrappers) NOT started: out of time.
5. Next: split hubTrafficStep (430 MB/10 s, never optimized) into small helpers; then next() 170 / LF_drapeG 50 / LF_fit 18 (cl closure + e objects).

## perf-15 (2026-10-18, alex/od-int2): result scratch for road checks; TurboFan status was misread
1. Code (REVERTED in the next commit, no measurable gain): fillAt/abAt take an out object (RE_o() scratch) and the LF_free/offRoad/liteOk/onRoad, CE_onRoad and OC_roadE checks pass scratch outs to cityAt/fillAt/abAt; athRoadD writes its result once, with sqrt instead of hypot; roamTerr always returns {g,deck,low} (low=false on decks, was undefined). Same math; OC_roadE 84 -> 61 MB.
2. Athens tFrame SECS=10 HEAP=1 RACE=0, median of 3, trunk -> mine: 1673 -> 1689 MB (167 -> 169 MB/s), max 175 -> 171 ms, >50 ms frames 15 -> 21. NO measurable gain (noise ±50 MB, max 150-238). Goal (<=120 MB/s, max <=100) NOT met. A Float64Array-scratch variant was WORSE (+120 MB in LF_offRoad), so it was dropped.
3. Key finding: in Chrome 141, %GetOptimizationStatus 0b101001 = TurboFan (a forced %OptimizeFunctionOnNextCall reads 101001; forced Maglev reads 11001). perf-12's "Maglev only, every double boxed" was a misread. The hot helpers (cityAt, athRoadD, roamHit, fillAt, LF_offRoad, OC_roadE, groundAt, TR_Y) ARE TurboFan. roamTerr is stuck on Maglev (11001) and hubTrafficStep is not optimized at all (0b1000...01, too big): split them.
4. Gate on built p15c: unit 0 FAIL; TAG=life1,xf1,terrain 42/42.
5. Next: split hubTrafficStep into small functions so they tier up; find why roamTerr will not tier up past Maglev (deopt trace); LF_tileG own output arrays + generator next (~450 MB per 10 s) need a pooled props layout, not micro-fixes.

## perf-14 (2026-10-18, alex/od-int2): LF ground samples batched, QA lite ticks, fill shaders prewarmed
1. LF_gyB (src/98lf_lively_fill.js): LF_drapeOk/LF_resid sample the ground in batches into Float64 scratch; Athens inlines TR_G's bilinear and calls athShelfY/LF_mound only in shelf/mound cells (exact: 0/4000 mismatches vs groundY+LF_mound); no reassigned double locals (Maglev boxed them). ?lfb=0 = old path. LF_resid/LF_fit lost their per-iteration [.97,.5] arrays.
2. QA invariants: ped colliders + camera ray every 4th tick (2 s); Q.check still runs everything. LF_warm: fill materials (def/tuft/pond instanced + drape) compiled once via P2_compile after buildHubProps (?lfw=0 off); also runs in ?test= mode.
3. tFrame SECS=10 RACE=0, 1 run each. Athens HEAP=0 trunk->p14a: med 17/18.5, p95 37.8/38.7, max 194->131, >50 ms 18/18. Athens HEAP=1 trunk->p14b: 1959->1810 MB (196->181 MB/s), lazyStep 801->637 MB (LF_gyB 117->0), max 179/211 (noisy). Frankfurt HEAP=1 trunk: 1981 MB, max 290, >50 ms 18; mine 1948 MB (198->195 MB/s), med 18.6->17.3, p95 43.8->32.7, max 290->101, >50 ms 18->1 (Frankfurt keeps the plain chain, so mostly the shader prewarm + QA; 1 run).
4. Gate on built p14b: unit 0 FAIL; TAG=life1,xf1,terrain 41/42, only xf1/assist (known). Goal max<=100 / <=150 MB/s NOT met.
5. Next: lazyStep still 637 MB (athRoadD/OC_roadE 77, generator next() in LF_tileG/LF_drapeG 135, di/cityAt 60), hubTrafficStep 355, DEST_open 216; GC spikes remain (1-run max is noisy, needs 3 runs).

## perf-13 (2026-10-18, alex/perf13-wip): Athens spikes are GC, not traffic code (diagnosis + tools, no game change)
1. Trunk (beta.102) Athens tFrame q=high SECS=10 HEAP=0 RACE=0, runs 1/2: max 292/191 ms, p95 38.7/39.4, >50 ms frames 12/14, median ~20. FC_pull max 23.5/18.3 ms (< 30, OK after perf-10).
2. CPU profile split per frame (new tools/perf1/spikes.js on tFrame PROF=1 PROFOUT=...): in every >=99 ms frame 73-134 ms is "(garbage collector)"; one 147 ms frame is a first-use shader link (getProgramParameter 107). Excluding GC, per-frame max is hubCullStep 5, LV_step 9, pedStep 9, miniDraw 14, lazyStep 17, Q.tick 16, FC_pull 16 ms: the 100-200 ms "hubTrafficStep/LV_step/hubCullStep" spikes were GC pauses landing inside those wrappers (hubTrafficStep includes pedStep/hubCullStep/lazyStep/miniDraw). --trace-gc: Mark-Compact 10-33 ms + scavenges up to 30 ms + big incremental-marking steps.
3. Allocation by owner (new tools/perf1/heapOwner.js on tFrame HEAP=1 HEAPOUT=...; 2392 MB / 10 s): lazyStep 811 (LF tile build: LF_drapeOk 163, athRoadD 75, cityAt 71, LF_tileG 68, LF_resid 38 = ground samples via gy=groundY+LF_mound), DEST_open 487 (perf-12), hubTrafficStep own 215, roamStep 171, Q.tick 126 (QA invariants: roamHit per ped + camera ray), pedStep 53, LIFE_step 49, hubCullStep 35, LV_step 31.
4. No code change pushed (slicing the named steps cannot fix GC pauses; goal max <=100 ms not met). Unit 0 FAIL; tools-only commit, page unchanged, so no TAG/shot run.
5. Next (one lane each): LF tile ground sampling in lazyStep (cache gy per tile grid / fewer LF_drapeOk tries) = biggest allocator; QA invariants every 0.5 s (skip ped roamHit, sample camera ray every 2 m); prewarm the shader that links on first use.

## perf-12 (2026-10-18, alex/perf12-wip -> alex/od-int2): DEST scan budget + QA prop grid
1. The DEST probes (roamHit/roamTerr/DEST_open/groundAt/GND_far) run Maglev-compiled, never TurboFan (%GetOptimizationStatus 0b101001), so every double at calls and phis is boxed; inlining bHit and an inline deck bbox reject in roamTerr did NOT cut MB. The Athens scan is one-off (22.7k nodes, ~35 s at 4 ms/frame); it now gets DEST_BUDGET=1.5 ms/frame (~90 s, same result; GO/tests use DEST_find(1e9)).
2. QA invariants: the prop_on_road check walks HUB.pgrid within 60 m instead of all ~130k HUB.props every 0.5 s (cold code, so it boxed and allocated iterators).
3. A/B SECS=10 HEAP=1 RACE=0, 2 runs each (runs in parallel, so the ms numbers are noisy): Athens 2604/2650 -> 2164/2140 MB (263 -> 215 MB/s), med/p95/max 23.3/67/310, 24.1/69/461 -> 21.8/70/412, 20.9/72/264; Frankfurt 2164/2273 -> 1919/2064 MB (222 -> 199 MB/s), 17.8/56/350, 16.2/51/359 -> 17.3/46/476, 15.9/37/311. Target 150 MB/s NOT met.
4. Gate on the built page: unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 49/56, reds are known only (mem/stable, xf1/* x5, life1/people); smash2 is green. There is no dest tag.
5. Next: what is left is LF_drapeOk/LF_tileG (perf-10 lane), so the DEST scan can only get 0 garbage by moving it off the frame (a worker, or caching the result per city+nodes hash); also athRoadD, cityAt and WB_tpl.
## perf-10 (2026-10-18, alex/perf10-wip → alex/od-int2)
1. The Frankfurt 330-640 ms roamStep frames were NOT FCG_build (already sliced). The cause was GFX_cast (every 2.5 s it boxed every new mesh in one traverse: 445 ms). It is now sliced at 3 ms and resumes after 100 ms, with a fast Float32 bbox (GFX_bbox). FCG_work boxes occluders inside its 1.5 ms budget.
2. Also: DEST_find is resumable per candidate (was ~90 ms when one node's DEST_open scans ran in one frame). DEST_check does 1 re-check per 20 frames. FC_pull treats an unindexed mesh as no hit (was three's full raycast, 40-55 ms; the camera pull may start a few frames late).
3. tFrame q=high SECS=10 HEAP=0 RACE=0, trunk → mine, Fra runs 1/2: max 638/488 → 161/231 ms, >50 ms frames 46/43 → 38/33, p95 65/55 → 55/53, median ~24 (noise). Ath run 1: max 457 → 642 (FC_pull 400, before the FCG_work fix), >50 ms frames 87 → 67, p95 81 → 64. No Athens re-run after that fix.
4. Gate on the built page: unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 52/56. Reds: mem/stable, mem/ath-boot, life1/people (known), and terr6/pit-fra SLOW 10.8 s (2/2 PASS when run alone, 7.5 s). Fra 852x393 shot looks normal.
5. Next: Athens hubTrafficStep/LV_step/hubCullStep spikes (100-200 ms) with LZ.slow-style probes; re-measure Athens FC_pull; DEST_open → LIFE_cell builds cells unbudgeted.

## perf-11 (2026-10-18, alex/perf11-wip -> alex/od-int2): allocation-sampling rank + LIFE_at / GND_far fixes
Athens q=high, trunk p11base, 15 s roam, CDP HeapProfiler.startSampling 32768 (tFrame HEAP=1 HEAPINT=32768), 3895 MB sampled; self-size summed per function over the top-40 stacks:
| # | function (src) | MB | main caller |
|---|---|---|---|
| 1 | roamTerr (53_terrain_roads) | 350 | DEST_open < DEST_find (scan) |
| 2 | roamHit (53_terrain_roads) | 232 | DEST_open < DEST_find; LIFE_at |
| 3 | LF_drapeOk (98lf, perf-10 lane) | 232 | LF_tileG |
| 4 | LIFE_at (assets/lx) | 185 | putG/putM/smPass |
| 5 | invariants (assets/qa, every 0.5 s) | 126 (+54 iterator next) | Q.tick |
| 6 | GND_in (60_city_build) | 121 | GND_far < roamTerr |
| 7 | cityAt (51_city_net) | 117 | DEST_open/LF_onRoad, GND_in, LF_tileG |
| 8 | athRoadD (60_city_build3) | 96 | OC_roadE, lzPropsG |
| 9 | LF_drapeG (98lf) | 70 | LF_tileG |
| 10 | LF_tileG (98lf) | 67 | lazy |
| 11 | (anon) | 58 | misc |
| 12 | LF_resid (98lf) | 57 | LF_tileG |
| 13 | GND_far (60_city_build) | 46 | roamTerr |
| 14 | DEST_open (98dest) | 46 | DEST_find |
| 15 | WB_tpl (60_city_build) | 44 | WB_cityBuild2 |
1. Fixed: LIFE_at computes candidate x,z in place and builds the object only for the spot that fits (same math); GND_in takes an optional out object, GND_far uses two scratch objects and an unrolled edge check (no array literals / destructuring). Both are gone from the top list on the branch.
2. A/B Athens SECS=10 HEAP=1 RACE=0, 1 run each (timebox): trunk 2515 MB (252 MB/s), jsMed/p95/max 29.5/88/664 -> perf-11 2419 MB (242 MB/s), 24.4/55.6/404. Target 150 MB/s NOT met. Frankfurt not measured; only 1 run each, not 2.
3. Gate on the built page: unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 trunk 45/56, perf-11 43/56 (both run at once); the 2 extra reds (terr1/terrain-fps-fra, life1/popup SLOW) pass 2/2 on a solo rerun. life1/smash is red on trunk too.
4. The DEST_find scan (roamTerr+roamHit+GND+cityAt under DEST_open, ~700 MB/15 s) is the biggest one: no deopt loop (--trace-deopt clean for these), so the garbage is likely boxed doubles from the groundAt/_dsO result fields; next: give DEST_open a typed-array ground cache or spread the scan thinner, then invariants (QA, ~180 MB: probably the HUB.props/peds full loops) and cityAt/athRoadD.
5. Tool: tools/perf1/tFrame.js HEAPINT env (sampling interval).

## perf-8b (2026-10-18, landed on alex/od-int2 57652d4)
1. Found with LZ.slow: the 'fin' spikes were the asset-1 lzPropsG wrapper (AS_assign/AS_fix/AS_far unsliced; AS_fix rebuilt its cell list from EVERY city cell per tile). Fix: 3 lazy steps, and AS_fix only builds the 5x5 cells around the tile (same swaps). The 'lf9' spikes were LF_drapeG: it is now a sliced generator with typed index and per-patch normals (same math as computeVertexNormals). LZ.lastV probe fixed.
2. Athens q=high tFrame (HEAP=1 RACE=0 SECS=20, 2 runs each), trunk → perf-8: lazyStep max 100/120 → 19/19 ms, frames >50 ms 49/52 → 28/23, p95 46.9/46.2 → 39.3/37.7, median 18.1/17.9 → 18.8/18.4 (noise).
3. Gate on the built page: unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 53/56 on both builds. Reds are only known/shared ones (mem/stable, mem/ath-boot, cam/stable). One 852×393 Athens street shot: ground and lighting look normal, but no draped patch is clearly in frame.
4. NOT done: the Frankfurt A/B (the trunk run hung and hit the time limit) and Frankfurt FCG_build/roamStep 329-363 ms frames.
5. Next: the Frankfurt A/B plus FCG_build slicing; the leftover Athens >50 ms frames are hubTrafficStep/roamStep (lazyStep is no longer the cause).

## perf-8 (2026-10-18, branch alex/perf8-wip, NOT merged to trunk: gate not run)
1. Athens hitches found: they come from the LF fill tiles (98lf), not the biomes. Single steps of 20-72 ms inside LF_tileG, plus 25-70 ms in the done step (generator tail + lzFinish + SIMP/STR wrappers). 32 steps > 20 ms in 20 s (LZ.slow probe).
2. Added: LZ.slow log (lazyStep, steps > 20 ms: [id, yield label, ms, finish ms, prev label]). LF_tileG yields are labelled lf1..lf11, and the lzBuildG yields are labelled too. Read it with PROBE='JSON.stringify(LZ.slow)'.
3. LBatch rewritten: add() keeps the parts' typed arrays, and flushG copies them into one Float32Array per attribute in 1.2 ms slices (no giant JS-array regrowth). Unit 0 FAIL. The TAG gate and the perf A/B were NOT run.
4. Frankfurt roamStep/FCG_build: not reached (the PROF run did not finish in the timebox).
5. Next: run PROBE on this build to see which lfN step is slow (suspects: LF_drapeG, unsliced, with computeVertexNormals; the lzFinish traverse), cap it, then the gate and a 3x A/B.

# HANDOFF perf (alex/od-athens): v88u perf hotfix → instancing/LOD → 2× brick detail → Athens busier

Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Live: v88t (8f78291 = alex/od-supra fe7a196b), merged here.

## Alex (2026-10-08)
"the game lags, I have a strong PC but still lags, I think there are way too many people". Then: "all builds need double the number of bricks and tiles to look more realistic, same for the city".
Order: 1 v88u hotfix · 2 instancing/LOD root cause · 3 2× brick detail (cars + city) · 4 Athens busier. Each ships separately with a review.

## Measured (852×393, normal gfx, headless; tools in ath/)
- `ath/perf.js <url> fra|ath`: renderer.info calls/tris at 3 street spots (LIFE=x). `ath/perfd.js`: CPU per tick while driving, render stubbed: mean/p95/p99/max (SET='code' runs code first; `ath/prof.code` wraps pedStep/hubTrafficStep/... and prints ms per tick).
- Draw calls, Frankfurt: v88l (pre-Life) 399 · v88q Life on 421 · Life 0 412. Athens 274 / 281 / 293. **Triangles ~2.5M Frankfurt, ~1.63M Athens in ALL builds** → Life is NOT the draw-call/GPU problem; the world is.
- CPU driving, Frankfurt: v88l mean 2.73 / p95 4.5 / max 14.6 ms; v88p-live mean 3.51 / p95 6.4 / max 20.6.
- Profile per tick (Frankfurt, driving): hubTrafficStep 1.58 → 2.81 ms (it contains miniDraw, hubRecycle, pedStep, hubCull, lazyStep, the 150-car loop and LV_step); pedStep 0.37 → 0.64 (97 vs 70 peds); miniDraw 0.18 → 0.36 (uses el.offsetParent = a layout read every 2nd frame).

## v88u changes (src)
- 98l: LV_ahead / LV_edges cached ~12 frames per 15 m / heading step (were full street-graph scans per call, up to 36 per frame from hubRecycle → LV_trNear → LV_nearHid); LV_onRoad uses a static 40 m edge grid (`LV_eGrid`); LV_init pre-warms shaders (incl. the lazily built pop-up ring) with renderer.compile.
- 60 pedStep: people > 90 m re-pose every 3rd frame; 70 hubTrafficStep: cars > 250 m every 4th frame (still move every frame). Knob TUNE.lvLod (Life tab).
- Defaults: lvPed 0.8 (56 walkers), lvCrowd 0.67 (4 clusters, 18 people) → ~74 people (was 97). 10_core + tune.json + TUNE.md.
- Changelog v88u + 3 checklist items (perf-smooth, perf-people, perf-pop).
- Results of the final sequential run: see the bottom of this file / the DEPLOY message.

## Next: root cause (step 2)
1. The world: 2.5M tris, 400-540 calls in Frankfurt. Find the top meshes by triangles×visible (traverse scene, sort by geometry index count × instance count; print name/userData). Likely: Kenney building kits with full detail at any distance, 150 cloud boxes ×6, trees. Fix with merged-per-material chunks + distance LOD (simplified box per building beyond ~150 m), not by deleting content.
2. CPU: the 150-car loop (groundAt + CR_susp each), miniDraw's offsetParent layout read, roamStep 3.6-5 ms total. Spikes: p99 8-10 ms, max 15-20 ms (GC? check allocations: LV_edges slice/concat, debris V3 per hit).
3. Then 2× brick detail through merged/instanced geometry, full detail ≤ 40-60 m, LOD beyond; budget calls ≤ v88m + 10 %, frame time ≤ the v88u numbers.
4. Then Athens (docs/HANDOFF_lively.md + the brief): before-shots done in `ath/before/sheet.png` (`ath/shots6.js`, 6 named spots). Findings: Athens map has NO coast (ends at Faliro) → Syngrou Avenue stands in for the coast road, no ferries; Plaka/Acropolis have no drivable streets (pedestrian), so their shots come from Amalias / Rovertou Galli. Why it looks empty: wide green lawns between road and buildings, life 50 m+ away, nothing Greek near the road. Plan: kerb dressing on pavement points (kiosks/periptero, taverna sets, bitter-orange trees, bougainvillea, souvlaki/koulouri carts, cats) as instanced meshes with smash-or-push colliders = drawn size, more Athens crowd clusters (LV_cn wrap), evzone guards at the Parliament from the ped pool (same scale, p.cw=2, no wave; edit LV release checks to p.cw===1), '#bus' athVeh (keep ATH_K length odd).

## Status 2026-10-09
- Final numbers (sequential, live v88t → v88u): draw calls Frankfurt 431 → 429, Athens 303 → 293; CPU driving Frankfurt mean ~3.8 → ~3.6 ms, p95/max within noise; Athens unchanged. Life code is ~0.1 ms. The CPU gains are within noise, so the real lag is most likely GPU/world (2.5M tris), which headless cannot measure.
- Added ⚙ TUNE → Life → "Show FPS" (TUNE.perfHud): bottom-left line with fps, worst frame, JS ms, the frame's real draws and tris (the old #fps showed the last composer pass only). The perf-smooth checklist item asks Alex for a screenshot of it.
- QUICK REVIEW sent for b9192327 (shots ath/v88u/sheet.png, ath/v88u/ath_monastiraki.png). After PASS: fetch live, merge if moved, `tools/build.sh v88u`, `git add -f out/v88u`, push, then DEPLOY to the coordinator.
- QUICK PASS (b9192327). Review notes fixed: FPS line shortened to one ~320 px line; checklist perf-pc added. DEPLOY sent: alex/od-athens dadad854 out/v88u (on live v88t). This session stops here (context limit); a fresh worker starts at "Next: root cause (step 2)" above.

## LIVE: v88u (2026-10-09, from alex/od-athens dadad854). The beta is republished.

## Plan for the next worker (in this order; each ships separately with a review)
### A · World draw calls / triangles (the real lag)
- First measure: traverse `scene` at 3 Frankfurt + 3 Athens spots (ath/perf.js style); for every visible mesh record triangles × instance count, material, parent name/userData; print the top 30 + the sum per category (buildings/Kenney kits, terrain/ground, trees, clouds 150×6 boxes, landmarks, props, traffic, peds, Life). Write the table here.
- Suspects: Kenney building kits at full detail at any distance (most of the 2.5M tris in Frankfurt); per-building meshes not merged per material (the ~430 draws); the cloud InstancedMesh (900 boxes, cheap but fills); terrain resolution.
- Fix: merge static city geometry per material per ~200 m chunk (BufferGeometryUtils.mergeGeometries; keep colliders untouched); distance LOD per chunk (full ≤ 150 m, a simple box/roof per building beyond, nothing past fog); frustum culling per chunk (the cull code is hubCull* in 70_roam_world.js). Target: draws ≤ v88m + 10 % (~400 Frankfurt, ~275 Athens) and triangles roughly halved; check with the Show FPS line + perf.js; before/after shots at the same spots (lesson 7: no visual loss up close).
- CPU (smaller): 150-car loop (groundAt + CR_susp each frame; v88u already thins far cars), miniDraw reads el.offsetParent (a layout read) every 2nd frame, allocations in LV_edges (slice/concat) and debris V3s.
### B · 2× brick detail (Alex: "double the number of bricks and tiles … same for the city")
- Only on top of A. Cars (93_cars_lego.js CR_*) and city facades: finer bricks, visible studs, tiles/plates/SNOT bands. Add the detail as merged geometry or normal-mapped/texture detail (studs as one instanced stud mesh per chunk), full detail ≤ 40-60 m, simplified beyond. Budget: draws ≤ v88m + 10 %, frame time ≤ v88u. Before/after shots at the same spots, side views of cars; the tyre gap must stay ≤ 0.05 m.
### C · Athens busier (the original brief of this branch)
- See the "Athens" bullet in "Next: root cause (step 2)" above; before-shots in ath/before/sheet.png from `node ath/shots6.js <url> <out>` (SET='TUNE.perfHud=1' shows the perf line). Keep the v88u people defaults unless Alex's perf-pc numbers allow more; the Athens dressing must be instanced (≤ +10 draws).

## perf-3 (2026-10-17, alex/perf3-wip): NOT on trunk (TAG gates not run in the timebox; max frame not improved)
1. Main find: V8 deopt loop. `TR_G` optimized→deopted ~5800x in 10 s and `roamTerr` ~400x ("insufficient type feedback for generic named access" on the TR_W fields, `JSFLAGS="--trace-deopt --trace-opt" DEBUG=pw:browser` in tools/perf1/tFrame.js). So every ground sample ran unoptimized and boxed its doubles. Fix: TR_G reads the grid fields from script lets.
2. Also: LF_drapeOk uses scratch buffers; a per-tile drape-check cache (LF.dc); roamTerr/roamHit use indexed loops; DEST_find uses a 130 m node grid and an allocation-free Dijkstra (same distances, tested on random graphs).
3. Athens, 30 s roam, run alone: allocated 9.9 GB→5.6 GB (~330→190 MB/s); median/p95/max 23.3/118/624→20.3/120/1027 ms (single runs, max is noisy). Frankfurt not measured.
4. Left: run TAG=life1,xf1,terrain,mem,cam vs trunk, measure Frankfurt, look for the same deopt loop in TR_Y/groundY/LF_drapeOk (175/59/44 cycles), DEST_open garbage (roamHit 240 MB), computeVertexNormals in LF_drapeG, QA invariants (0.24 GB, skip outside ?qa).
5. Draw calls (666-698) untouched.

# HANDOFF perf (perf-2 landed on trunk)
- Landed: alex/perf-wip 62418d5 (perf-2 GC cuts) merged with trunk 770da51 -> pushed FF to alex/od-int2 at 74ecd2b.
- Gates: tools/build.sh v90m-beta.92 OK; unit 5327 pass, 0 FAIL, 13 known.
- TAG life1,xf1,terrain,smash2,cam,rv2k2,mem on built page: no new reds. Perf-wip reds = trunk reds or known list (fra: mem/stable, xf1/water/land/slope/kerb, terr1/terrain-tyre-fra, life1/fra-density; ath: terr1/terrain-tyre-ath).
- Trunk 770da51 same set reds: fra mem/stable, xf1/*, terr1/terrain-tyre-fra, life1/fra-density, life1/popup; ath terr1/terrain-tyre-ath, life1/ath-density, life1/carousel.
- Left: perf/frame strict target not met; terr1 tyre-gap and xf1 red on both trunk and perf-wip.

## perf-3 landed (2026-10-17): perf3-wip merged onto od-int2
1. Perf harness, 30 s roam, median of 3 separate runs (median/p95/max ms, MB/s alloc): Athens trunk 20.8/45.8/308, 353 -> perf3 14.9/39.4/261, 183; Frankfurt trunk 13.2/33.6/287, 204 -> perf3 13.3/33.5/306, 178 (max is noise, runs 192-398).
2. Gate on built page TAG=life1,xf1,terrain,smash2,cam,rv2k2,mem: perf3 59/67 vs trunk 56/67; no new reds (life1/people red once, passed on 2 reruns = flaky).
3. Changes: TR_G deopt fix, LF_drapeOk scratch + drape cache, DEST_find grid. No flag needed.
4. Left: same deopt loop in TR_Y/groundY/LF_drapeOk, DEST_open garbage, computeVertexNormals in LF_drapeG, QA invariants alloc. Draw calls untouched.
## perf-4 (2026-10-17, alex/perf4-wip): draw calls / tris breakdown, low-quality culling knobs
1. Probe `tools/perf4/tTris.js <url> <out.json> [low|high] [fra,ath]`: wraps renderer.renderBufferDirect, 3 fixed spawn views per city, per-object calls/tris tagged by scene path, distance band (a<100 b<300 c<700 d>700 m) and bounding radius (R>400 = city-wide), + rAF ms.
2. Before (q=low, trunk e59bc7d): Fra 401-462 calls / 2.30-2.43 M tris · Ath 247-450 / 1.40-1.62 M. ~60 % of tris are city-wide meshes (bounding radius 400-6900 m) that per-mesh culling can never hide: G(48 IMs)#2708 217k, Ath merged Mesh R6862 110k + IM R6090 86k, ctb_plinth (all plinths, R3657) 51-62k, rdZebra R3448 42k, Mesh#32 / Group#49 IMs 55k+54k. LIFE bm_s/bm_m (BatchedMesh) are counted at full size here but only draw visible items.
3. Change: low/min hub culling 1350/520 -> 1000/400 m (min 1050/420 -> 800/340) in src/80_story_m1.js; CTB far LEGO sets 520 -> 380 m on low, 300 m on min (src/98ct_city_lego.js). After: Fra 379-435 calls / 2.05-2.15 M (-6 %/-10 %), Ath unchanged (its cost is near/city-wide). Athens 852x393 shot before/after: nothing near the road vanished.
4. Goal (low ≤400k / ≤150 calls) NOT reached. Next, biggest first: per-instance distance compaction (CTB_step style, keep a map so index writes like 98sp_simplify's CTB.pim zeroing still land) for G#2708's 48 IMs, ctb_plinth, Mesh#32, Group#49/Mesh#1; split the Ath R6862 merged mesh and rdZebra into 400 m cells so hubCull can drop them.
5. rAF ms on SwiftShader (≈1 s/frame) is not a usable metric; use tris/calls and the stepped JS probes (perf1/tFrame.js).

## perf-5 (2026-10-18, alex/perf5-wip): per-instance compaction + 200 m cells
1. New src/98pc_compact.js (?pc5=0 off): city-wide static InstancedMeshes in HUB.grp (count = capacity, > 300 m spread; 480 meshes / 75k instances Fra, 1833 / 568k Ath), clouds and traffic wheel/glass layers are re-packed every 10 frames / 20 m / 0.1 rad on an 80 m world grid (visible + ≤ 60 m kept for shadows, far 480 m low / 900 high); setMatrixAt/getMatrixAt/setColorAt/raycast are wrapped so smash/revive by original index still land. rdZebra + Athens DR filler meshes split into 200 m cells (TUNE.drCell).
2. tTris q=low before→after (calls/tris, 3 views): Fra 428/1.81M 379/1.95M 394/2.02M → 467/1.21M 384/1.44M 399/1.74M · Ath 399/1.51M 344/1.90M 249/1.67M → 488/0.97M 420/1.35M 279/1.36M. Tris −14…−36 %, calls +1…+22 % (cells). q=high not measured: SwiftShader ~7 s/frame, probe killed at 30 min (baseline Fra h0 876/3.98M). Target ≤ 600k NOT reached.
3. Gate on built p5c: unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 53/56, reds only known (mem/stable, xf1/water, xf1/kerb). New GO perf5/compact (fra+ath): smashed instanced prop stays hidden after compaction, revived one returns. 852×393 shots before/after: identical near the road (Athens spawn shows big yellow wall slabs in BOTH, pre-existing).
4. Left, biggest first: a 48-instance car IM (a8+art6c, 4244 tris, DynamicDraw, direct scene child, ~217k Fra / 195k Ath) and its 41/59-child twin, bm_s 105k (LIFE BatchedMesh), Mesh#32 (320 inst dynamic, 55k) are NOT compacted: they are dynamic and owned by other code; add them with C.dyn like the traffic layers once their owner is known.
5. If calls matter more than tris on phones, try TUNE.drCell=400 (halves the Athens filler cells).

## perf-6 (2026-10-18, alex/perf6-wip): late HUB meshes compacted + idle debris pool
1. The "48-instance car IM" was mislabelled by tTris: it is the lazy `lz` leaf group (HUB child, 48 children; inner IM 18114 inst × 12 tris = 217k, `lf`), added after perf-5's one-time scan. 98pc_compact now re-scans HUB.grp (skipping LIFE.grp, which drives its own .count) when its child count changes (PC_add/PC_grid). The real race-traffic TRM (4244 tris, 48 cap) is hidden in roam.
2. Mesh#32 = smash debris pool (30_race buildDebris, 320 slots): DEB.im.count = highest live slot + 1 → 0 when idle (−55k tris). bm_s 105k is a probe artefact: tTris counts the whole BatchedMesh buffer, multiDraw draws only visible ids; not touched.
3. tTris q=low calls/tris trunk → perf-6 (probe ran on the build BEFORE the LIFE.grp exclusion; Ath h2/h4 not finished at the hard stop): Fra 462/1.58M 397/1.68M 419/1.70M → 449/1.23M 408/1.42M 421/1.74M · Ath h0 472/1.29M → 424/0.93M. q=high not measured. Draw-call merging (step 3) NOT done.
4. Gate on built p6b: unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 49/56 with reds known only (mem/stable, xf1/grass/slope/kerb, life1/ath-density, life1/people slow), after a life1/smash red was fixed (LIFE.grp exclusion; re-run life1,perf5 8/9, only ath-density). Shots 852×393 Fra/Ath before/after: cars near the road look the same.
5. Next: re-measure tTris on the final build (both cities, q=low+high); merge per-cell static meshes by material in the 200 m cells for calls.

## perf-7 (2026-10-18, alex/perf7-wip, NOT on trunk): pc5 A/B + cheaper PC_step
1. A/B trunk build, perf-3 harness (HEAP=1, Q=high, 30 s, Athens, 1 run each, out of time for 3 + Frankfurt): ?pc5=0 13.7/37.1/196 ms 186 MB/s · default 14.6/35.8/220 204 MB/s; hubCullStep avg 1.36 → 3.14 ms (compaction = +1.8 ms/frame).
2. Root cause (PROF + WRAP=PC_step,PC_add,PC_grid): PC_add (perf-6) rebuilt the WHOLE grid (828k instances, 1992 meshes Athens) on every lazy HUB group: 460 ms spikes. PC_mesh itself is 0.19 ms avg.
3. Change in src/98pc_compact.js: incremental PC_grid (only new meshes; old cells keep centre, grow radius); a pass starts only on ≥ 20 m / ≥ 15°, then walks meshes circularly at TUNE.pc7Bud (60k) instances/frame; cells tested once per pass (PC.cv); traffic/clouds every 10 frames; uploads only the drawn range (addUpdateRange). tFrame.js: QS env for extra query.
4. After (p7d, 1 run): Athens 14.4/37.9/224, 193 MB/s, hubCullStep 2.1 ms (−33 %). Median and MB/s beat trunk default, p95/max within noise of it (not a clear win). Gate p7d: unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 54/56, reds known only (fra mem/stable, cam/stable).
5. Next: 3-run A/B both cities (Frankfurt unmeasured); if p95 still ≥ trunk, gate compaction to q=low/min; then TR_Y/groundY deopt + LF_drapeG normals (not started).

## perf-7 landed (2026-10-18, gate): compaction only on q=low/min
1. src/98pc_compact.js: PC_gate() (LK_lvl low/min, TUNE.pc7All forces on) wraps PC_step; med/high skip it entirely (no scan, no wrappers); PC_release() restores full counts if quality rises later.
2. Gate on BUILT page: unit 0 FAIL; TAG life1,xf1,terrain,smash2,cam,mem,perf5 54/56, only known reds (fra mem/stable, xf1/grass); perf5/compact passes at q=low (test default).
3. A/B NOT measured: out of time (3-run both cities x high/low not done; Athens partial runs hit the time limit). Expectation: high = trunk minus ~1.8 ms/frame and no 460 ms PC_add spikes; low = perf-7 WIP numbers.
4. Next: run tools/perf1/tFrame.js (HEAP=1 Q=high|low CITY=ath|fra RACE=0) trunk vs landed, 3 runs each.

## perf-9 (2026-10-18, alex/perf9-wip): NOT on trunk, NOT gated, NOT measured
1. Scratch/no-closure cuts: cityAt(out) used by ART7_rd; athRoadD(out) + OC_roadE junction loop without spread/array; RD_road/RD_cityNear without closures or Map iteration.
2. Not done: DEST_open, allocation-sampling rank, build, unit, TAG gate, 3-run A/B Ath+Fra, od-int2 merge. LF_tileG skipped on purpose (perf-8 lane).
3. Blocker: tFrame.js HEAP=1 ran over 30 min here (SwiftShader) without finishing. Use run_in_background with a long timeout, SECS<=300, one run at a time.
4. Next: baseline vs wip, SECS=300 HEAP=1 RACE=0, 3 runs Ath+Fra; then DEST_open; then gate, merge, push.

## perf-9 result (2026-10-18, merged to trunk alex/od-int2)
1. Gate on built page (merged trunk 540df66): unit 0 FAIL; TAG=life1,xf1,terrain,smash2,cam,mem,perf5 54/56, reds only known (mem/stable, cam/stable).
2. tFrame Athens q=high SECS=10 HEAP=1 RACE=0, 2 runs each: trunk 2869/2941 MB (287 vs 290 MB/s, within noise), jsMed 20.4/19.0 vs 19.9/20.4, p95 42/39 vs 39/43. The scratch cuts did NOT measurably cut allocation; Frankfurt not measured.
3. Next: allocation-sampling rank of what still allocates per frame (DEST_open, LF_tileG untouched).

## perf-17 (2026-10-18, on trunk alex/od-int2): streaming budgets
1. lzFinish's heavy part (buildings into the grid, y fix, shadows, cull entries) is now a generator inside lazyStep's budget; hubCullStep re-culls 1/4 per frame after a jump or tile landing (full pass only for >600 m teleports; the LK low/min radii from 80_story_m1 are folded in, no second full pass); LV jump re-places 3 clusters per frame, parking waits when LV is over 4 ms; FL emissive re-scan is round-robin, with the first full scan and headlights prewarmed in ldPrewarm.
2. Gate (rebased on ffbd811): unit 0 FAIL; TAG=perf17,life1,xf1,terrain 42/44. Reds: life1/people (known) and life1/smash (Frankfurt; also red on trunk tr106, NOT perf-17). GO perf17/stream checks p99 with max shown: lazyStep <15, own cull <10, LV <10 ms; 0 unbuilt tiles <600 m and 0 hidden cull entries <300 m after 150 km/h plus 3 warps.
3. tFrame 30 s (1 run each; median of 3 did not fit, ~9 min per run on this box). Athens, trunk vs mine: n50 49/42 vs 40, p99 103/109 vs 89, lazyStep max 50/136 vs 17.5, lzFinish 41/125 vs 0.1. Frankfurt: n50 24 vs 15, p99 55 vs 47, max 122 vs 128, lazyStep max 25 vs 60 in this single run. The goal (≤5 frames >50 ms, max ≤80) is NOT met. Most long frames left are GC-like (sub-steps small while the parent is 100+ ms) and are in PC_step (perf5 PC_add on tile landing, 22-650 ms), miniPaint (70 ms) and lf drape steps.
4. FL_step 112 ms not reproduced (max 9 ms); the suspects (the full hub traverse every 4 s, headlight rebuilds) are now amortised or prewarmed.
5. Next (coordinator, beta.106): a per-second timeline of frames >33 ms for the first 60 s at 852x393 touch, with an owner per frame (tFrame is desktop 1280x720; add a TOUCH=1 profile). Then PC_add slicing, miniPaint off the main path, and GC churn in lf/groundY.

## boot-1 (2026-10-18, on trunk alex/od-int2): first 60 s on touch
1. Probe tools/perf1/tBoot.js (852x393 isMobile/hasTouch, ?gov=1 keeps Graphics Auto, &warm=1 keeps the real ldPrewarm under ?test; PROF=1 = CPU-profile owner per long frame). Before (boot1b, 1 run): Fra 37 frames >50 ms, 0 >150, max 129; Ath 77 >50, 6 >150, max 304 (f0 PC scan+full pass 280 ms, PC_grid 130).
2. Fix: PC_add only queues, PC_drain registers ~3 ms/frame, no forced unbudgeted pass after a tile landing or the first scan; PC scan + minimap + DEST grid/sort+100 ms of scan run in the loader (src/98bo_boot1.js); Auto changes only render scale for the first 60 s of driving (GOV.pt).
3. After: Athens PC worst frame 280 → ~90 ms under the profiler (2x overhead), PC_add 5-15 ms. Clean after-runs NOT valid: Fra overlapped the gate (CPU contention), Athens not re-measured (time cap). Goal (≤3 >50 ms, none >150) NOT met.
4. Remaining owners (Ath PROF): major GC 100-230 ms (33 of the long frames), scene traverse/updateMatrixWorld, first-use shader links 85-205 ms at 0.5-2 s even with ldPrewarm, PB_tick 70 ms at 20 s (phone-2 beacon: tell phone-2).
5. Next: clean 1-run A/B both cities (nothing else running), compile higher-tier programs in the loader, cut boot garbage (GC), PC_add walk only new children. Gate boot1d: unit 0 FAIL; TAG=life1,xf1,terrain,scale1,perf5 46/48 (xf1/grass, xf1/assist known).

## boot-2 (2026-10-18, on trunk alex/od-int2): first-minute shader links + beacon
1. Beacon (a): PB_tick now only snapshots counters (typed-array copy); sort/doc/db write run in a setTimeout task; the GPU string (GL query = pipeline sync) is read in the loader. phone2/beacon ✅.
2. Shader links (b): src/98bp_warmall.js (?warmall=0 = off) builds LIFE (window.__life.init) and compiles with every hidden object made visible, plus a twin of the outer-land ground material (made by worldGroundGen after the 1st frame). tBoot PROGS=1 prints each late link's material/object chain (PF1MAT).
3. tBoot touch, 1 run each (time cap, not the median of 2): Fra >50 ms 18→9, >150 1→0, max 254→137; Ath >50 49→49, >150 3→2, max 406→286, late-link frames 7→3. Goal NOT met in Athens.
4. Left: Ath f4 hubCullStep 254 ms (d: scene traverse/cull), PC_step+hubCull 70-95 ms frames, one lazy-district instanced tile still links at 2 s (Group{lz} Mesh{lf,pcQ}), major GC (c) untouched.
5. Gate: unit 0 FAIL; TAG=life1,xf1,terrain,phone2 41/44 (xf1/grass, water, assist = known).

## boot-3 (2026-10-18, on trunk alex/od-int2): Athens first minute
1. The 254 ms cull frame was hubCullInit (bounding spheres for every hub mesh plus a traverse on the first roam frame) together with LDS_scan; both now run in the loader (98bo_boot1 'cull'). LDS_scan re-traversed the WHOLE hub on every tile landing: it now rescans only the top-level groups that changed (LDS_scan(true) = full scan).
2. PC_add now walks only the changed top-level groups (a lazy tile root until it is shown), not the hub; PC_grid writes only the touched cells into a doubling PC.G (was a full re-copy, 43 ms). PC_add 40 → 9-15 ms, PC_grid 43 → 26-31 ms.
3. tBoot touch, Athens, 2 runs each, JS frames >50 ms: before 109/79 (median 94) → after 39/54 (median 46.5); JS max 290/197 → 294/295; total n150 10/7 → 9/7. Frankfurt, 1 run: jsn50 14 → 14, n150 3 → 1, max 170 → 210 (GC noise). Goal (≤10, 0 >150) NOT met.
4. Remaining long frames are major GC (75-88 % of the profile) landing in PC_step/hubCullStep/roamCam/LV_step, plus render+prog late links at 25-30 s. Next: an allocation-sampling profile of the first 60 s, and the remaining PC_grid per-mesh Maps.
5. Gate b3c: unit 0 FAIL; TAG=perf17,perf5,life1,xf1,terrain,phone2 46/48 (xf1/grass, xf1/water = known).

## boot-4 (2026-10-18, on trunk alex/od-int2): first-minute allocation
1. tBoot.js HEAP=1 (CDP sampling, MB incl. collected, by function + by wrapped subsystem; HEAPOUT=file). Athens 60 s touch: 5050 MB → 4202 MB. Owners before: hubTrafficStep 1010, roamStep 834, lazyStep 556, LV_step 461 (LIFE, untouched), PC_step 415, DEST_find 340, pedStep 335; top functions FC_pull 225, PC snap 215(+hypot 67), LDS cull 174. NB most V8 MB is double boxing at non-inlined calls (roamHit/roamTerr/athRoadD); JSC (iPhone) NaN-boxes, so real objects matter most there.
2. Cut: FC_pull (no per-occluder arrays/closures/clone at 20 Hz, hits into FC.h), PC_step snap → PC_snap top-level with sqrt, PC_grid per-mesh Maps/arrays → one sorted Float64Array key + C.G Int32 [cell,start,end] over C.I, LDS cull loop squared distance. PC_step 415 → 97 MB, FC_pull gone from the top.
3. Late links: brickfx_burst disposed its material per burst → relinked its program on EVERY transform (24-50 s). Materials now pooled (XFB_MP) + linked in the loader (xfWarm in 98bp_warmall).
4. tBoot touch, clean: Athens 2 runs jsn50 21/27 (median 24, boot-3 46.5), n150 2/3, js max 164/259; Frankfurt 1 run jsn50 14 → 5, n150 1 → 0, max 210 → 97. Goal (≤15, 0 >150) NOT met in Athens.
5. Left: one render+prog at ~25 s = transformed car glass (MeshPhysical, Group{gb} Mesh{gbc,art6c,crP0}, customProgramCacheKey differs); DEST_find 183 ms frame (GC inside); roamStep/hubTrafficStep/pedStep/CV_pre object garbage. Gate b4c: unit 0 FAIL; TAG=perf5,life1,xf1,terrain,phone2,perf17 45/48 (xf1 grass/water/assist known).

## perf-r10a (2026-10-18, on trunk alex/od-int2): Athens roamStep-self + heap
1. "roamStep-self" was a tBoot attribution error: container subs were never owners. Now a container sub with more than 40 % of a frame owns it (`<name>-self`). Athens: the 15 roamStep-self frames >50 ms → hubTrafficStep-self 15, roamStep-self 2. The real culprit is the hubTrafficStep car loop (lane r10b). tBoot also gains LONG=ms (PROF window threshold) and a PF1X line: 0–5 s median, n50 per half, heap MB/s.
2. Fixes: CR_hud (pill fit: getComputedStyle + scrollWidth after DOM writes = forced layout, 5–9 ms) now runs every 6th frame instead of every 2nd (plus its 250 ms interval). LIFE_draw (the top allocator, 70 MB/30 s): figure poses use pooled 6-slot arrays (LIFE_pp) and the M['x_'+t] keys are cached on each item.
3. tBoot Athens 60 s touch, before (1 run) → after (2 runs, median): n50 48 → 45 (40/50), jsn50 18 → 17.5, 0–5 s median 21.9 → 20.2 ms, js max 219 → 108, heap 0–30 s 5.65 → 4.5 MB/s, 30–60 s −0.5 → 0.2 MB/s. Frankfurt, 1 run: n50 10 (jsn50 4), 0–5 s median 17.5, 3.7 / 0.4 MB/s. Goal of ≤12 n50 NOT met: 20–29 of the frames are software-GL render frames (every 30th), and 15 are hubTrafficStep.
4. Heap growth in the first 30 s is retained (it stays flat after that, so it is tile/asset streaming, not garbage). The sampled churn left is double boxing in roamHit, roamTerr, athRoadD and pedStep (RD_kerb is already pooled).
5. Gate r10a1: unit 0 FAIL. TAG=life1,terrain,phone2,perf17,r9a,r8b,r9b gives 52/54, the same as trunk r10a0 at 52/54. Flaky on both: life1/smash, r9a/pack5#1/#2. r8b/pill-dist failed once in a combined run and passed in a rerun and alone.
## perf-r10b (2026-10-18, on trunk alex/od-int2): cull slice + traffic loop split
1. hubCullStep: the normal tick now uses the 1/4 slice too (1/4 on each odd frame = one full sweep per 8 frames, as before; was a full pass every 8th frame); the visibility pass is a top-level hubCullVis. perf17 own cull, Athens: p99 2.8 → 2.1 ms, max 6.6 → 5.1 ms.
2. hubTrafficStep's car loop is split into small helpers in 70_roam_world.js (HT_cars/HT_dead/HT_car/HT_speed/HT_next/HT_pose/HT_hit/HT_smash/HT_flush; same logic and order). With them wrapped (tFrame WRAP=HT_cars,HT_pose,...) the whole car loop is ≤12 ms max (HT_pose ~11 = groundAt+CR_susp). There is no single 40-80 ms owner: those frames are LV_step 15-33 + pedStep 6-18 + CV_pre 5-11 + CTB/PC under hubCullStep 16-27 + lazyStep, all slow together (GC-like). RD_unstack now reuses its cell Map and lists (it allocated 25 MB per 30 s).
3. tFrame.js TOUCH=1 (tBoot's 852x393 phone context, q from the game). 30 s steady, touch, frames >50 ms / p99 / max: Athens before 5(wrapped)/14, p99 42/44, max 74/131; after 14/9 (median 11.5), p99 45/42, max 140/105. Frankfurt after: 3, p99 33, max 63 (goal met). Desktop q=high Athens, 1 run each: 25 → 21, max 145 → 133. Athens goal (≤10, max ≤120) NOT met; this box is noisier between runs than the change.
4. Left: the worst Athens frames are roamStep-self (lane r10a), LV_step (LIFE_draw is the top allocator, 72 MB/30 s), pedStep 69 MB, CV_pre 52 MB (one closure per car per frame for CV_near), L3_space/L3_stop 55 MB.
5. Gate r10b3 (rebased on a72b520): unit 0 FAIL; TAG=perf17,life1,terrain,phone2,r9a 46/46, 0 page errors. (Before the rebase, r10b2 had life1/smash and r9a/pack5 reds that trunk showed in the same runs: pack5 flips run to run.)
## perf-r10e (2026-10-19, on trunk alex/od-int2): camera wall-pull + CV_pre closures
1. Owner by measurement (tFrame sub): FC_pull (camera wall-pull, 20 Hz) avg 2.9 / p95 11.3 / max 38 ms in Athens. FC.occ held 1393 meshes, 1384 of them instanced meshes with raycast=()=>{} (no-ops) that still got a side swap + intersectObject each pass. FC_occ now skips no-op raycast meshes (Athens 51 occluders) and walks parents instead of pl.mesh.getObjectById per scene mesh (FC_occ 33 → <10 ms). FC_pull avg 2.9 → 0.2, p95 11.3 → 0.4 ms. New GO: r10e/fcpull.
2. CV_pre: two CV_near closures per car per frame became top-level callbacks (CV_inF/CV_aheadF, car in CV_c), and J.oc is reused. Same logic and order.
3. tFrame touch 30 s Athens, 2 runs each, before → after: n50 19/25 (med 22) → 16/19 (17.5), p99 52/65.5 → 46/52; max is still 154-205 (GC + render). tBoot Athens 60 s: n50 128 (1 run) → 117/103 (med 110), frame median 15.5 → 13.3 ms. This box is about 2x slower than r10a's (n50 ~45 then). Frankfurt tFrame: n50 7, p99 35, max 91 (r10b: 3/33/63 on a faster box). Goals NOT met.
4. Left: GC is root-level in profiles (trace-gc: Mark-Compact atomic pauses only 10-21 ms, scavenges ≤30 ms, so the 100+ ms frames are GC plus software-GL contention); top allocators (tools/perf1/heapsub.js <HEAPOUT> hubTrafficStep): LIFE_draw 156 MB/60 s (double boxing in the 9-arg LIFE_put calls), pedStep 138, CTB_step 109 (incl. hypot), athRoadD 92, RD_cityNear 76. onBeforeRender traverses: WB_figPre, BW_rampSh, SHB_scanTrees each frame (~9 % of long-frame time).
5. Tools: tBoot PROFOUT=file plus tools/perf1/profwin.js (inclusive and caller chains inside long-frame windows). Gate r10e2: unit 0 FAIL; TAG=r10e,life1,xf1,terrain,phone2,perf17,r9a 54/54 (after rebase on beta.114: 54/55, r9a/pack5#3 red once, passed alone), 0 errors.
## perf-r11c (2026-10-19, on trunk alex/od-int2): Athens retained heap + first 5 s
1. Retained heap (tFrame HEAP=ret: heap after a forced GC before/after 30 s roam; new PF1PROBE0). Top holders: streamed far-city super cells kept their CPU copy until their first DRAW (cells behind the camera / inside wbLodD never draw): STR_up uploads each one right after the build (1x1 target, SM_upload's trick), in STR_step and in the WB city pre-build. Next holders: LF fill tiles (~2 MB each, 5 on low-mem) and FCG grids (3 MB).
2. Athens touch + LOWMEM=1 (the iPhone tier), heap after GC over 30 s: +68 → +51 MB (goal 40 NOT met). Desktop q=high: 673→840 (+167) before; the far-city part (~43 MB) is gone. Without LOWMEM the LF ring is 2.2 km (desktop only; the phone already uses 400/600 m).
3. First 5 s: the f59 late link was the instanced LF fill program (instance colour + env map) → twin linked in 98bp_warmall. roamCam + hubTrafficStep pre-run once after roamPost while the curtain is up (BOOT1_pre; tBoot's test home warp gets it too; ?bootpre=0 off). tBoot touch Athens before/after: n50 36/38-50, n150 2/1-2, 0-5 s median 20.6/19.5-21.4, roamCam f0 46→8 ms; this box varies ±30 % run to run, so no clear win on n50. Frankfurt: n50 9, js max 116, 0-5 s 16.5 (one 296 ms first-render frame).
4. Left: the first real render after the curtain (150-250 ms, GPU uploads), f3-f9 lazyStep 90-107 ms (one LF tile build step), hubTrafficStep-self GC frames (lane r10e), LF tile CPU copies (MEMF skips 'lf').
5. Gate r11c8 (rebased on perf-r10e): unit 0 FAIL; TAG=life1,xf1,terrain,phone2,perf17,r11c 48/48 (new GO r11c/str-up: new cells drop their CPU copy, no unbuilt cell inside draw range).
## perf-r11f (2026-10-19, on trunk alex/od-int2): first render / lazyStep / LF CPU copies (no game change landed)
1. LF tile CPU copies can NOT be dropped: PC compaction (98pc_compact.js) registers the LF instanced meshes, keeps its own source copy and rewrites the front of instanceMatrix + .count every 10 frames. Freeing it on upload (tried: onUpload + x/z copy + GO) crashed PC_one in tBoot LOWMEM (TICKERR "null byteLength"); reverted. A real saving: free PC's src copy for LF instead, or give LF meshes userData.noPC and cull by tile (costs draw time; measure first).
2. lazyStep: tBoot now prints PF1LZ (LZ.max, steps >8 ms, LZ.slow = steps >20 ms with tile and yield label). Athens touch LOWMEM 60 s: max 24 ms, one slow step lf_1000_-4000 'lf1' (open-cell scan) 22 ms, 7 over 8 ms; the 90-107 ms LF step from r11c did not reproduce on this box. LF_tileG is already sliced at 1.2 ms; the remaining long step is a single LF_open1 call (roamHit/cityAt) after the slice check, not a missing yield.
3. First render: roamLoad already calls composer.render() after roamPost/BOOT1_pre behind the curtain. tBoot's f29 (first sampled real render, 101 ms + 1 program link) is at the test home warp, which the loader render never saw, so it overstates the real start. Next: run tBoot with PROGS=1 to name that program and twin it in 98bp_warmall.
4. Measured (tBoot touch Athens LOWMEM=1, base beta.116, 1 run): n50 75, n150 1, max 157 (render at f389), 0-5 s median 19.9 ms. Heap after GC (tFrame HEAP=ret SECS=30) timed out at 500 s on this box: not measured. Goals NOT met.
5. Gate: unit 0 FAIL; TAG=r11f,life1,xf1,terrain,phone2,perf17,r11c 50/50 on the built page (with the reverted change). Only tools/perf1/tBoot.js PF1LZ lands.

## perf-r12b (2026-10-19): N5 shader variants + hubTrafficStep GC
1. Warm (src/98bp_warmall.js): BW_flagAll in the loader warm, then twins of every HUB.BM / KMM com,sub / GFX.gm material on a plain (non-instanced) mesh, as is and with GFX_gspec. Named: fra f239 = HUB.BM.glass `gfxg|bw3`; ath f29/f839 = ground-spec LDS materials first drawn non-instanced (key bit mask 2081 vs instanced 2087/39).
2. tBoot QS=lowmem=1 PROGS=1 render+prog frames after the curtain: Frankfurt 1 (158 ms) → 0, 0; Athens 4 (max 668) → 1, 1. Left: ath f1289-1319 = W12-painted car glass (MeshPhysical, ART10) of a car loaded at ~21 s, after the warm: needs a warm at that car's load (lazy models chunk).
3. L3 (src/98l3_life3.js): L3_near per-car heading pair, L3_at without a closure, no filter array, shared empty list. HEAP top in Athens is roamStep 154 MB, updWorld 149, LIFE_draw 136, pedStep 136; L3_space+L3_stop only 110 MB. hubTrafficStep-self >50 ms: 41 → 35, 51 (noise); Athens n50 169 → 172, 191: the "cut by a third" goal is NOT met (on this box ~115 of the n50 frames are software-GL render).
4. Athens tBoot boot 59 s → 74/76 s (noisy box, 1 baseline run without HEAP): check that the extra twins don't cost real boot time on a phone before building more on this.
5. Gate: unit 0 FAIL; TAG=life1,xf1,terrain,phone2,perf17,r11c,boot,r12 48/50 on the built page (xf1/grass known red; perf17/stream#1 is red on trunk too in the full gate, 2/2 PASS alone on both builds).
## perf-r12a (2026-10-19): the 12 s LOWMEM freeze (N1)
1. Cause (CDP trace + CPU profile at f700, new tFrame `TRACE=a-b`): not GC and not camera.updateMatrixWorld (≤0.6 ms). It is LIFE_init (lx.js, wraps LV_step) building every LIFE geometry in ONE frame (LDraw turbine + Ferris wheel/carousel, BatchedMesh pools); crash-5 makes LOWMEM wait 12 s for it. With the real loader (`warm=1`), WARMALL builds LIFE inside the loader, so this only happens when lx.js arrives after the loader, and on ?test pages.
2. Fix: LIFE_pre (src/assets/lx/code.js) builds the turbine, geos and landmark LD on 3 separate frames, then LIFE_init reuses them. `?lifestage=0` = old path.
3. tFrame TOUCH=1 QS=lowmem=1 SECS=30, max frame / n50: before fra 272/16, 502/4; ath 279/28, 346/29 (freeze 238-502 ms at f689-713). After: fra 163/24, 101/10 (worst LIFE frame 109); ath 258/46, 170/47 (worst LIFE frame 141-176; the other big frames are hubCullStep/pedStep at f259/1403).
4. Left: Athens turbine stage alone is 105-158 ms. Splitting it into base/rotor frames was tried and reverted (the merge stage hit 327 ms, likely GC). Next: pre-build the turbine LD in the loader for LOWMEM too, or merge it over more frames. Goal (<120 ms) met in fra, not yet in ath.
5. Gate: build OK, unit 0 FAIL, TAG life1,xf1,terrain,phone2,perf17,r11c 47/48; perf17/stream#1 (ath) red in the full set but passes alone on both trunk and this build (timing flake).

## perf-r13a (2026-10-19) · review 13 N1, hubTrafficStep hitches · flag TUNE.htFar (default OFF)
1. Change: on touch/LOWMEM with TUNE.htFar=1, cars > 120 m step every 4th frame (summed dt); past 24 car steps per frame, cars > 60 m wait (the start index rotates); LV_step waits ≤ 2 frames when the streets already took > 14 ms. Files: 70_roam_world.js HT_cars/HT_lo, 98l_lively.js, GO perf/traffic-hitch in 99c7.
2. Split (tBoot ath lowmem, WRAP): there is no single owner. A > 50 ms streets frame is hubCullStep 17-35 + LV_step 6-34 + HT_cars 8-18 + pedStep 6-13 + L3_guard 5-10 ms; HT_cars alone is never > 18 ms.
3. Measured hubTrafficStep-self frames > 50 ms: base 17 and 16 (sequential runs), flag ON 24 (sequential); side by side under load: base 57 vs flag 35 (jsn50 94 vs 67). The GO in a warm page shows a mean streets frame of 10.4 vs 10.1 ms. Target (≤ 10 or halved) NOT met, so the flag stays OFF.
4. Next: the spikes are coincident periodic work, so a frame budget is needed across hubCullStep, LV_step and pedStep (spread their heavy passes onto different frames), not per-car LOD. Start with hubCullStep, the biggest single sub.
5. Tests: unit 0 FAIL; TAG=perf/traffic-hitch,life1,xf1,terrain 43/43 on the built page.

## perf-r13d (2026-10-19) · shared roam frame budget · flag TUNE.roamBudget (default OFF, ?rb=1 to try)
1. Change: src/98rb_roam_budget.js (after every wrapper in src/ORDER): the frame clock starts at roamStep; pedStep, hubCullStep (+ its wrappers, already sliced on its own counter) and LV_step run only while elapsed + their recent cost fits 12 ms on touch/LOWMEM. One of them (rotating) always runs, none waits > 2 frames, deferred dt is summed (≤ .2 s). HT_cars, player, camera and collisions are never deferred.
2. Measured, tBoot ath lowmem, interleaved base/flag/base/flag: non-render frames > 50 ms (PF1OWN without render) base 7 and 13, flag 7 and 7 (jsn50 8/13 vs 7/7). Run 1 shows no gain and run 2 shows 46 %, so the ≥ 30 % in both runs bar is NOT met and the flag stays OFF. Frankfurt and PC q=high were not re-run: with the flag OFF the path is inert, and PC is never gated.
3. Why the gain is small: the remaining spikes are single calls the cost EMA can't predict (LV_step 51 ms at f884, about 15 s in, when the LOWMEM lively fill starts; miniPaint+miniDraw 68 ms at f883), plus roamCam/HT_cars self time, which this budget never defers. Most frames > 50 ms on this box are render (software GL).
4. Next: break up the one-off 15 s LOWMEM fill (98lf LF.inR) and the miniPaint repaint into frame slices. A budget only pays once no single call costs more than about 12 ms.
5. Tests: unit 0 FAIL; TAG=perf/roam-budget,life1,xf1,terrain 43/43 on the built page (GO: each deferred sub runs 40/120 at 0 ms budget, longest wait 2, traffic 120/120, flag off waits 0).
## perf-r13b (2026-10-19): PC boot long tasks (REVIEW_2K_13 N2)
1. Cause: P2_warm (loader 0.68) and P2_compile queued ~200 programs at once; with no KHR_parallel_shader_compile, the next sync call waited for all of them in one task: PB_gpu's getParameter (6.8 s Athens), then the first roam frame's composer.render (11.8 s + 6.5 s).
2. Fix (src/98bp_warmall.js, LKG, desktop only, ?lkg=0|1): the loader compiles one program-distinct object at a time and links it before the next, yielding every 8 ms; a gate after roamPost runs buildEnv and links before the first draw. PB_gpu is read once at load (98pb). GO perf/pc-boot-lt (+ -ath) is in 99c7.
3. Measured (Athens PC, warm=1, SwiftShader, bootprof): before 11.8/10.6/6.8/6.5 s with 9-10 tasks > 2 s → after 10.8/5.0/3.6 s with 6 > 2 s. The PB_gpu task and the loader/first-frame link tasks are gone; the longest link step is < 0.4 s.
4. Left (largest first): one buildHubG generator step of 9-11 s (AS_fix, DR_solidBuild, OC_roadE, TR_bldFix: CPU, not shaders); after ready, GFX_frame/GFX_plastic mutate materials and a later buildEnv runs, so 44 programs link in bulk inside composer.render (4-10 s tasks in ?test). TR_grade init 4-5 s; menu W13_carImg 2-3 s.
5. Next: link the GFX_plastic-mutated programs through LKG (re-arm the gate when GFX changes materials or ENVD is set), and split the buildHubG step. Probe: scratch bootprof (CDP profile + long-task stacks); tFrame runs must be serial (running them in parallel doubles the times).

## perf-r13f (2026-10-19): PC programs linked after ready
1. Cause: perf-r13b's LKG path in P2_compile (98bp) returned without the inner P2_compile, so GFX_pre (98gx: plastic, ground spec, ACES, sun shadow) never ran before the desktop warm; ~50 GFX variants then linked after the roam gate (Athens 48, Frankfurt 51).
2. Fix (src/98bp_warmall.js, flag ?lkgfx=1, default OFF): GFX_pre before LKG_begin in the loader, and again in the roam gate (+ sliced GFX_cast, W12_cars, BW_flagAll) before it queues. Touch/LOWMEM unchanged (LKG is desktop only). Probe: tFrame prints PF1LINK (links after the gate + cache-key diff). GO perf/pc-post-ready-link (+ -ath) in 99c7.
3. Measured (SwiftShader, tFrame RACE=0): Athens SECS=3 post-gate links 48 → 30 → 17, longest boot task 43.1 → 9.3 s; Frankfurt (SECS=20 base / SECS=60 on) 51 → 23, longest boot task 46.9 → 6.0 s. Shots: Athens on/off look the same; Frankfurt OK.
4. Left (why still OFF; target ≤ 2): objects created after the gate (world-batch BatchedMesh and vertex-colour variants, wbIco), 3 shadow-depth variants, OutputPass NEUTRAL→ACES. Only one run per city per variant (each run takes 6-10 min).
5. Next: link the post-gate objects' variants through LKG (twin a batched + vertex-colour mesh per material, compile depth materials, compile OutputPass after GFX_light), then turn ?lkgfx on by default; it already helps a lot on its own.

## perf-r13e (2026-10-19) · single-call cap · flag TUNE.callCap (default OFF, ?cc=1 to try) · deliverable NOT met
1. Change: miniPaint skips roads/trails/slopes whose box misses a sub-rect paint (Athens SMM minimap tile) by > 60 m; pixels identical (GO). tBoot prints PF1MAX (largest per-frame ms of each wrapped sub). GO perf/single-call-cap in 99c7_rev5fix.
2. Measured tBoot ath lowmem (60 s): max miniPaint/SMM_tile base 29 / 10 (30 s run), cc=1 11, 37, 9, 22. LV_step max base 43 / 14, cc=1 11-33. Too noisy and one cc=1 run is > 30, so the flag stays OFF. Frankfurt is not affected (whole-map paint never culls).
3. Root causes: the LV_step spikes are NOT LIFE work. In the 33 ms frame every wrapped LV part (clusters, parking, birds, AD dress) is < 5 ms, while hubTrafficStep 95 and roamStep 118 grow in the same frame, so it's a GC/stall that lands in it. Slicing LF can't fix that (LF tiles already build as generators via lazyStep). Next: --trace-gc or a heap profile around 15 s (HEAP=1).
4. Minimap: one SMM_tile is about 40 ms in the GO page (desktop) with or without culling. In 18 tiles the measured parts are bldPaint 21 ms and SMM_shade 8 ms, so most of the cost is in SMM_tile itself: the LAZY/CITY_S splice swap (CITY_S.splice(...Ss) re-spreads thousands of streets per tile) or the first draw on a fresh canvas. Next: pass B/Ss into miniPaint as arguments instead of swapping the globals, then time again.
5. Tests: unit 0 FAIL; TAG=perf/single-call-cap,life1,xf1,terrain 43/43 on the built page.
## perf-r13g (2026-10-19): ?lkgfx default ON on desktop
1. Second run per city (SwiftShader, tFrame SECS=60 RACE=0, lkgfx 0 → 1): post-gate links Athens 54 → 21, Frankfurt 51 → 21; longest boot task Athens 13.2 → 8.8 s, Frankfurt 15.3 → 4.8 s. Agrees with r13f.
2. src/98bp_warmall.js: LKG.gfx now defaults ON (?lkgfx=0 = off). LKG is desktop only (!LOWMEM), so touch is unchanged.
3. GO perf/pc-post-ready-link (+ -ath) tightened from info-only to ≤ 24 post-gate links (measured 17-23). Shots 852x393 PC fra/ath on the built page: unchanged.
4. Left (step 3 not done, timebox): twin the 21 remaining post-gate objects in LKG (BatchedMesh/vertex-colour variants ~14, 3 shadow-depth programs, OutputPass ACES), then tighten the GO to ≤ 5.
5. Gates: build OK, unit 0 FAIL, GO perf/pc-post-ready-link 2/2, TAG=life1,xf1,terrain 42/42.
