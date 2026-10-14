# art-6 handoff (liveliness / variety lane), 2026-10-14

Branch: trunk `alex/od-int2`. Continues docs/HANDOFF_ART5.md.

## Done
- **Matrix props-in-road** (commit 44289ac7): brick piles / towers / gold bricks are block scatter in the block RECT (diagonal roads cross it) and
  were exempt from the OC push-off-the-road (`OC_GAME`, src/90_fixes_cv_ju.js). Only roadworks (cone/barrier/clight) stay exempt. fra 7 → 0, ath 0.
  GO `art/props-road`.
- **Matrix footsurf-crash** (44289ac7): art-4 draped LF patches are plain Meshes tagged `lf='patch'`; tools/hot/footSurf.js called `getMatrixAt` on
  them. footSurf now samples draped triangle CENTROIDS. That exposed a real gap: drape triangles floated / sank up to 2.4 m between their vertices on
  curved ground (feet inside the grass). `LF_drapeOk` (src/98lf_lively_fill.js): a patch is draped only if every triangle centroid / edge midpoint is
  +1.2 / −7 cm from ground + 3.5 cm; else it is tried at 0.7× and 0.5× size, then dropped (fra ~27 % of draped patches, ~6 % of all patches).
  footSurf PASS both cities (worst 0.042 / 0.037 m). GO `art/footsurf` (real W key across a draped patch).
- GO module: src/98ar_art_go.js (`window.__art`, calls by name so hot reload works).

- **District themes built, default ON** (`?dt=0` = off), src/98dt_district_themes.js + 4 hook lines in BV_life. fra: 67 taverns, 8 neon pylons +
  9 roof neon, 11 mural walls; 11 extra draw calls. GO dt/sachs, dt/bahn, dt/ost PASS; ctb/fra-row, ctb/collide, bv1/fra (repeat 9.6 %, blocks 100 %),
  art/* PASS; 0 console errors. Shot grid `qa_art6/dt_grid.jpg` (looked: tavern table/benches/lights, neon blade, studs mural).
- **Found + fixed: BV_life colliders never reached HUB.grid** (art-3/4 kiosks and cafés: 623 fra kiosks had no collision). `hubGridAdd` at the end
  of BV_life (1444 colliders fra).

## Next
- Neon reads pale in daylight fog (MeshBasic, unlit); if a reviewer wants more pop: a night-mood shot, or `fog:false` on DT.gm.
- Taverns: Sachsenhausen rect is big (whole district); Alt-Sachsenhausen alone would be the area near the Main east of the Schweizer Straße.
- Matrix `--quick --fam props,footsurf` on trunk (492 s): props clean both cities, footsurf fra clean; ath had `footsurf-B-penetrates-rides`
  k6@0,0 = a pooled car at (0,0) during a respawn, test-only, fixed in footSurf (264ccd7c).
- OPEN, foot lane (not art): footSurf ath B sample `fence@2159,-1741` ends 0.64 m inside the fence (foot box = visible bbox 11.5 × 3.9 m, so
  OF_collide let the walker in; random-sample dependent, other runs 0). Repro: `node tools/hot.js eval "$(cat tools/hot/footSurf.js)" --city ath`.

## District themes (coordinator PRE-APPROVED 2026-10-14; spec for the record)
**Spec.** Three Frankfurt districts get a theme built from the BV street-life pieces (src/98bv_build_var.js `BV_life`), in a new module
src/98dt_district_themes.js, flag `?dt=0` = off, default ON once the 3 tests pass. Nearly every facade there is a CTB LEGO set (art-5), on which
nothing is hung, so every theme piece stands on the pavement or the set's roof, in BV's instanced boxes (1 extra draw call per 1.6 km cell),
plus one unlit neon mesh and 4 textured mural meshes per cell. Sachsenhausen: **apple-wine taverns** (Äppelwoi garden: long wooden table with 2
benches, a post with the green pine wreath (Fichtenkranz) and a grey-blue Bembel jug on top, a string of lights on 2 poles). Bahnhofsviertel:
**neon** (a pavement pylon with a tall glowing blade sign in pink / cyan / violet / amber, and glowing roof signs on legs on some sets).
Osthafen: **murals** (free-standing LEGO brick walls, 8–10 m × 3.5 m, beside a set, 4 painted designs on canvas textures, with a collider).
Themes appear only inside their district (DISTRICTS rects via `districtAt`).

**Tests** (src/99c_checklist.js, TAG `dt`, 📍 GO parks you at the densest spot and measures):
1. `dt/sachs`: ≥ 3 taverns within 150 m, each with table, 2 benches, wreath and Bembel; 0 tavern pieces on a drivable surface; 0 taverns outside Sachsenhausen.
2. `dt/bahn`: ≥ 5 neon signs within 150 m in ≥ 3 colours, unlit (glow at night), lowest neon ≥ 2.4 m above the pavement or on a roof; 0 outside the Bahnhofsviertel.
3. `dt/ost`: ≥ 3 mural walls within 300 m, ≥ 2 designs, each wall clear of buildings and roads, with a collider (the car stops at it); 0 outside Osthafen.
Perf (all three): ≤ 12 extra draw calls city-wide, no console errors.
