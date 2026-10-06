# ART handoff (branch alex/od-art) — last deploy v86i = live 594ccf7 (reviewer PASS b0119e9); beta artifact v79
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
