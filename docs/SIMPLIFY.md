# SIMPLIFY (simplify-1, 2026-10-14): smaller, solid map

Alex (beta.60): "why so many pointless buildings if no road or story ... gaps, buildings that I can pass through. Horrible!!!"
Code: `src/98sp_simplify.js` (flag: **`?simp=1` = on, WIP default OFF** until `simp/perf` passes; then flip `SIMP_S().on` to `!/[?&]simp=0/`).
Hooks: `putK` + `athUnit` (60_city_build4), Athens `put` + interior pass (60_city_build3), gap trees after `OC_props` in `buildHubProps` (60_city_build6),
`p.simp` kept by `DR_cull` (95). Wrappers in the module: `lzPlanAll` (pockets), `buildHubProps` (pocket trees), `lzFinish` (solid + far clean), `lazyStep` (solid + far clean).

## Measured (hot pages, `?test=<city>&draw=0`, same session; "before" = `?simp=0`, "after" = `?simp=1`)

| | Frankfurt before | Frankfurt after | Athens before | Athens after |
|---|---|---|---|---|
| building colliders (city box, ≥5×5 m, >3 m tall) | 3789 | ~3480 | 43272 | ~19900 |
| all colliders (HUB.bld) | 6804 | 7707 (+1187 pocket rects) | 67354 | ~24400 (+4225 pocket rects) |
| buildings > 25 m from any road edge (not landmark/story) | 294 | **0** | 29067 | **0** (1 Acropolis wall, now exempt) |
| removed at build (`SIMP_cut`) | – | 213 | – | 1967 + interior pass skipped (`SIMP_far`) |
| Athens building instances (`HUB.athB.inst`) | – | – | 503975 | 185724 |
| Athens building meshes (`HUB.athB.meshes`) | – | – | 1616 | 828 |
| Athens `athBuildG` ms | – | – | 8507 | 4969 |
| building-like visuals without a collider (300 m round 20 spots) | 1 | **0** | 1 | **0** |
| bare 10 m cells in the street band / patches > 400 m² / biggest | 39042 / 993 / 72700 m² | → trees / **0** / 400 m² | 49431 / 2393 / 21200 m² | → trees / **0** / 400 m² |
| back lots closed as park pockets (hedge + collider) | – | 9.9 km², 15085 hedge segs | – | 63.5 km², 20287 hedge segs |
| draw calls / tris, sum of the perf spots (static, frustum) | 1878 / 17.7 M (5 spots) | 2165 / 19.2 M ❌ | 654 / 5.1 M (2 spots) | 696 / 6.9 M ❌ |
| boot to drivable (hot page) | 34.6 s | ~41 s (hot daemon) | 37.9 s | ~46 s (hot daemon) |

Draw calls went UP: removing instances inside per-tile InstancedMeshes does not remove calls; the hedges (LBatch 1400 m tiles), pocket trees
(1 InstancedMesh per 800 m hubTile × 3 kinds) and gap trees (props per type × tile) add calls. See HANDOFF_simp1.md "Next" for the plan.

## Tests (src/99c_checklist.js, ver `simp`, 📍 GO; WIP: say PENDING while the flag is off)
`simp/far-<c>`, `simp/solid-<c>`, `simp/gaps-<c>`, `simp/hedge-<c>`, `simp/walk-<c>`, `simp/hit-<c>1..5` (2 facades each, real gas), `simp/perf-<c>`; c = fra | ath.
Hot-page results with `?simp=1` (last run): far fra PASS (ath 1 → exempted, rerun), solid ✅✅, gaps ✅✅, hedge ✅✅, walk ✅✅, hit fra 5/5 ✅, ath 5/5 ✅ (two runs), perf ❌❌.
