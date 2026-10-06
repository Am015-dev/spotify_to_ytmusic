# ART handoff (branch alex/od-art) — last deploy v86w = live a23e93e (reviewer PASS 3c3e325); beta artifact v90
Build ALWAYS on the current live page: `./art.sh` fetches alex/brave-carson-rbpmlk, takes games/mainhattan-overdrive/index.html body + km.js, applies pART1-5 → overdrive.html. Split = copy overdrive.html + km.js into outART/; `node tools/tOut.js http://127.0.0.1:8798/overdrive.html` must print OUTBOOT PASS. Re-check live HEAD right before tools/deploy.sh. No deploy without a PASS from the reviewer session (session_01Y6FYerWwxv43FuKUcaUT4v).
Modules sit between /*ART<name>*/ … /*ART</name>*/ markers (artlib.py swaps them in place; anchor edits use RR, which skips edits already applied).
- art.js (pART1): deep-blue sky + brick-cloud ring, true-scale subtle studded grass (walk/yard/park), grey asphalt with a double yellow line (road, street, resSt, Athens cobble), midday light, day reflection env without neon boxes (no pink water), flash/hitFx clamp ≤ 1.
- art2.js (pART2): brick trees (Frankfurt props, Athens street trees), procedural 0.32 m studs on up-facing untextured surfaces, plastic rim + gloss.
- art3.js (pART3): live v86 car contact shadows (kept: the cars session's ground contact depends on them), blue boost lines + FOV kick, HUD skin, beacons ≥ 60 m → 1.5 m ground rings, 1600 m searchlights hidden (rescan every 4 s).
- pART4: boats only, edited INSIDE live's v86 vehicle block (never remove that block: it holds the cars session's grounding; removing it made the hot rod hover 0.83 m).
- art5.js (pART5): filler-grid streets + crossing squares draped onto groundY; hill streets at 0.07 m (was 0.22).
Ownership: the cars session owns the player car (driving, wheels, suspension, ground contact, camera, FX), traffic models and the HUD. ART owns the world, Athens and boats.
Tools: tools/dev.js `/cshot` (canvas readback); review shot scripts are in /tmp (lost on restart; see git history of this file for the recipe: abandon the mission, warp to an open road via hubRoads, side camera 4 m out at 0.5 m).
Open (not blocking):
1. (done in v86i) beacons are registered at creation via an Object3D.add hook. Athens: 70 pedestrians, spawn ≥ 30 m.
2. Alleenring "below physics" samples are overpass/ramp decks (accepted by the reviewer).
3. Menu: no live 3D garage background; map not brick-styled.

## pART8 IN PROGRESS (art session session_019gi2haGf8EZyFCu7h3KCZa, 2026-10-06)
Build: `./art.sh a23e93e` (pART8.py added to art.sh; pART5/pART6 anchors made tolerant of pART7's later edits; the build reproduces live v86w byte-for-byte before pART8).
- Roads on top: art8.js replaces abStrip (live's renamed abStrip_v86): road strips refined where the ground is not linear (≤2.5 m along, ≤4 m across, check 6 mm); HUB.M.road/dirt get polygonOffset −1/−2 (city streets had −2/−4). tools/a7_poke.js Frankfurt: 2.6 % → 0 % (0/2265).
- Shadows: art8.js projected silhouettes (shadow twin per car mesh = child sharing geometry; traffic = 16-slot InstancedMesh per pool filled with cars ≤80 m from the camera), plane through the visible wheel bottoms (ART8_whl: exact radius from vertices), lift 7 cm, polygonOffset −4/−16, stencil (renderer stencil:true + composer rt stencilBuffer:true) → one flat silhouette at 60 %. Sun = moonL direction clamped to y ≤ −0.88. Hidden while airborne/boat (like ART6).
- fps: art7 quadtree uses an 8 cm fit with ≥16 m leaves for cells ≤64 m that are >14 m from every road edge (ART7_rd); ground tiles 500 m (city box) / 1000 m (outer). Terrain verts 3.31 M → ~1.9 M. Software-GL frame time is noisy (±4 %): live v86w park/hill/city 1061-1090/1155-1169/1155-1210 ms; candidate 1075-1096/1132-1179/1089-1116.
- Athens raycasts: SM3 frees vertex arrays (`rel` → this.array=null); for poke tests make a debug copy with that line removed.

## (brief) pART8 (coordinator brief 2026-10-06 11:52 UTC; Alex scored v86v 2/10)
1. Roads: ZERO grass/terrain poking through any road surface in Frankfurt AND Athens ("terrain merges with the road with random blobs"); roads always on top, no z-fighting at road edges. Verify with 852×393 shots along whole roads in both cities.
   - Measure: tools/a7_poke.js (eval in dev.js on local_dbg.html; curl --data-binary): live v86v 19.8 % of road-over-grass samples had grass on top, v86w 2.6 %. Remaining examples on v86w: (813,497) +0.118, (793,-1088) +0.056, (918,-573) +0.053 (also on live).
   - Causes found: road strips follow groundY only at their vertices (abStrip at path points; pART5 filler streets now 4 m segments) so chords sag under the exact grass on humps. Options: densify/drape every road strip type to ≤ 4 m, give road materials polygonOffset (factor −2, units −4) against the ground, and/or lower ground vertices under road footprints.
   - Athens: ground meshes free their index buffers after upload (318 meshes), so raycasts throw there; measure in a debug build that keeps the arrays (find the onUpload/dispose hook) or by rendering a top-down depth/colour check.
2. Shadows: Alex now WANTS car shadows (overrides "no shadows"; he hated the big blurry blob). Every car (player, AI, traffic) gets a crisp car-shaped sun shadow on the ground, LEGO 2K Drive style; keep the tyre patches (art6.js). Cheap: a shadow map limited to cars near the camera (small frustum following the player, cars castShadow only within ~40 m, ground receiveShadow), or projected silhouettes if too slow. art6.js currently forces castShadow=false on car meshes (ART6_noCast) — undo that for the shadow pass.
   Gate: low side + chase shots in both cities, fps vs live (tools/fpsCmp.js), reviewer PASS, deploy, report.

## pART7 DONE — live v86w a23e93e (reviewer PASS 3c3e325), beta artifact v90
- art7.js + pART7.py (in art.sh): gndBuild non-river cells = adaptive quadtree (ART7_quad/ART7_flat: leaf triangles within 3 cm of tH at 25 points, leaves ≥ 3 m, shared vertices); river-bank cells: verified step ART7_res (was 25 m with no hill check); outer land y0 −.25 → −.01 + tm polygonOffset; ground offset −.015 → −.005; pART5 draped streets/crossings 4 m segments both ways.
- Grass vs physics (tools/a7_grass.js): live 65 % outside ±5 cm → 0 % (−0.047..+0.014). Terrain 292k → 598k verts / 912k tris. Frame time, software GL (tools/fpsCmp.js, median ms): park 1056→1092 (+3 %), hill 1061→1175 (+11 %), city 1068→1175 (+10 %); software rendering overstates vertex cost, iPhone not measurable here. If Alex reports slowdown: coarser leaves away from roads/camera.
- Tools: local_dbg.html needs node_modules in the served dir (`ln -s $PWD/node_modules outART/`); kill dev.js by explicit PID with -9 (SIGTERM leaves port 9333 busy); the beta artifact page = its own inner shell (title "Overdrive Beta") + split body + km.js in files.

## pART6 DONE — reviewer PASS ccc8ab3; deploy candidate v86v = outART/ at d7b5ee7 (live v86u + pART1-6); deploy was refused by session permissions → handed to the coordinator 09:50 UTC
### (history) pART6 IN PROGRESS (handoff 2026-10-06 ~08:40 UTC; previous art session session_01FmQ73V8iH1VEUuWjWpM751 is over its context budget)
State: built on live v86q 5583b1f (`./art.sh 5583b1f`, pART6.py in art.sh). Review #1 FAILed (e0fcede): jump gaps PASS; shadows/tyre gap/shots failed.
Coordinator decisions (08:10): remove every blob and body-sized shadow; keep ONE small soft patch under EACH TYRE (not car-shaped). Fix sinking to ±0.05 m (player, AI, traffic). City ramps → cars session (leave).
Done in pART6 (art6.js + pART6.py):
- Hidden for good: ART3 blobs (removed from art3.js), ART4.ty, race ud.shadow, trShadow, trGlow, CR_SH; car meshes castShadow=false.
- Per-tyre patches: one InstancedMesh (640, ART_blobTex, 45 %), filled right before each scene render (renderer.render wrapper): player + race cars from wheel meshes (userData.r) at their lowest point; city traffic from wheel clusters of HUB.cim[k].userData.w × instance matrix; race traffic: 4 corner patches from trShadow's matrix (pART6 RR: trShadow scale wid*1.1/len*1.05).
- Jumps (level data): pits half → 32 (64 m), Main river `jw:70` (buildTrackData river branch). Verified on v86l, real keyboard, Rookie, no boost, launch 149 km/h: main +23.9, gleis +33.5, a5 +22.4, turm(72, unchanged) +43.2, gleis2 +41.1, isap +42.0, metro +45.4, ymit +42.1, athinas +39.5 (tools/tJump.js).
Tyre gap (tools/a6_eval.js → __A6.tyres(), now exact vertex bounds Box3.setFromObject(o,true); the old geometry-box×matrix overstated spinning wheels by up to 0.15 m — cars session confirmed, their sim rests tyres at groundAt ±0.006):
- Asphalt (x2400 z576): −0.030..−0.037 PASS.
- Park grass (x2280 z600): +0.07..+0.105 FAIL — the coarse terrain mesh (userData.trG, ~1300-vertex tiles) lies 0..0.10 m BELOW groundAt depending on the spot (tessellation vs the groundY function). ART-side fix options: denser terrain tiles in the drive area, or snap terrain vertices exactly to groundY (they may be sampled at a different resolution), or a +0.05 lift with a road polygonOffset check. Not done yet.
- Patches: placed at wheel centre − radius from the local box (rotation-invariant). AI race cars: cars session reports 172/172 tyres ±0.05.
Shots so far (dev.js + a6_eval.js cams, 852x393): docs/shots/v86r/ (4 asphalt, 4b grass, 5 traffic side, 7 city car). Still needed: jump strip ≥6 frames in a clean TT (tools/tJumpStrip.js url outdir grand main; was running at handoff, slow ~30 min), Athens.
Next: (1) rebuild on the newest live (no cars fix needed); (2) fix the grass/terrain mismatch above, re-measure __A6.tyres() asphalt + grass + Athens; (3) shots + strip; (4) REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v with tyre gaps; (5) on PASS: rebuild on current live → split → tOut → tools/deploy.sh → republish beta → report to coordinator (version line, 3 bullets, shots to devkit docs/shots/<ver>/).
Dev tips: `pkill -f` kills your own shell (exit 144) — kill by PID. dev.js: /boot reloads the build; eval tools/a6_eval.js first.

## Next task for a FRESH art session: pART6 (coordinator brief 2026-10-06 06:28 UTC; this session is over its context budget)
Base: live v86k (90babcf, or later). Note: brave-carson HEAD can be a "Shelf:" commit; take the latest commit that touched games/mainhattan-overdrive/ (`git log -1 origin/live -- games/mainhattan-overdrive/`). `./art.sh <commit>` builds on it.
Do not touch driving, collision, missions, barrel roll or speed feel (cars session pCAR15). Tell session_01Xfbyypd9bgKDJZnBFoDfnm once which regions pART6 touches.
A. Remove all car shadows (player, AI, traffic; races and city). Where they come from:
   - art3.js `ART_shadows`/`ART_step` (player blob ART3.pl + traffic InstancedMesh ART3.tr): delete it in art3.js, BUT keep `ART_blobTex` if live code still calls it (grep first).
   - live's v86 vehicle block (inside /*no marker*/ "ART step 5", untouched by pART4): `ART4_tyres` = per-tyre dark blobs → hide (`ART4.ty.visible=false`), don't remove the block (it holds ground contact).
   - the hovercraft-era `ud.shadow` plane on every ship/AI (8 refs) → `visible=false`; also check race-mode shadows (`trShadow`) and any cars-session shadow.
   Verify the tyre/road gap stays ≤0.05 m and take a low side shot (camera 4 m out, 0.5 m up).
B. Jump gaps: ramps are in `RO.ramps` (city, 39 refs, 14 `ramps.push`) and track `jumps:[…]` in track data (10). Measure each with real input (hold GAS from ~150 m, Rookie car, no boost): log the landing vs gap-end distance, then scale ramp hgt/len or the gap width (level data/geometry only) until margin ≥ 3 m at v86k top speed. Report a per-jump margin table.
Gate: reviewer session_01Y6FYerWwxv43FuKUcaUT4v (shots: jump mid-air, city car with no shadow, low side view). Shots go to docs/shots/<ver>/ on the devkit branch per the coordinator.
