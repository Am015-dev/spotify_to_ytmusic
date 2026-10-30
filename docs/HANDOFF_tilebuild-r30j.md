# HANDOFF tilebuild-r30j (2026-10-30): tiled city build design
- Done: docs/DESIGN_tiled_city_build.md (measured breakdown, design, 5 Sonnet steps tb1..tb5 with GOs + numbers, risks). No engine change.
- Measured (built page tb30j = 9f0c2ea, phone profile, 6x, boottoctl copy + Athens seed + CPU profile, ~15 % profiler overhead): fra 89.3 s, buildHubG 63.8 s wall / 51.8 s JS (gndC 17.6, kerb+ 9.7, rfPass 6.6, ctbK 5.6, props ~5), non-hub 25.5 s (Painting the sky 9.0, TWG 8.1); ath 121.2 s, buildHubG 73.5 s JS (athBuildG/ctbK 31.0, gndC 16.4, trFix 15.1, olive trees 5.2, props 11.5).
- Within 800 m of the spawn: fra 7.5 % colliders / 11 % props / 21 % instanced verts; ath 2.1 / 2.8 / 4.4 %. Projection: fra ~35 s, ath ~32 s gauntlet after tb1..tb5 (fra margin ~1 s; next lever Painting the sky).
- Gaps: the BMK buffer cap (1 500) cut the Athens marks at 85.8 s (35 s tail unsplit; tb1 raises it). Merged TBatch verts not countable (memFree drops CPU arrays).
- Next: tb1 (SONNET, fra pure-geometry deferral, target gauntlet fra <= 58 s). Reused: boottoctl.js, LAZY plan/build split, TBatch hubTile keys, B2_pump, qtdump precedent.
