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
