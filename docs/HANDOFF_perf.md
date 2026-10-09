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
