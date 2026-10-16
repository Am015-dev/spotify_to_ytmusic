# GFX review: beta.40 / .50 / .61 / .62 (Frankfurt + Athens), judged against LEGO 2K Drive
Lane gfx-rev, 2026-10-16. Read-only review, no game code changed.
Method: built pages `out/v90m-beta.{40,50,61,62}/index.html`, `?test=fra|ath&q=high`, 852×393, swiftshader, same 3 shots per city.
Grids (2×2: .40 | .50 / .61 | .62): `docs/shots/gfxrev/grid_fra_start.jpg`, `grid_ath_start.jpg`, `grid_fra_drive.jpg`, `grid_ath_drive.jpg`.
Caveats: headless swiftshader reaches only 0-5 km/h in 5 s, so "chase after 5 s" is the chase camera at the start spot (the `_drive` grids repeat the start framing). `__art` was not exposed on these builds, so no numbers were read from the renderer; the constants below come from `src/` and the built pages (grep). No beta between .40 and .50 was shot, so ".42-.50" below is bracketed from the changelog (.42/.43 "sun follows camera / sits behind camera"; .48 "LEGO-set buildings in low-rise streets").

## Verdict per spot
**Frankfurt start (road ahead).** .40: both sides lined with tall textured towers, deep blue sky with a warm horizon glow, dark road, nice depth. .50: sky is cleaner and deeper blue, a skyline appears, but the building walls along the street are gone: the right side is a bare green lawn with props, the left a few big blocks. .61/.62: the right horizon is now a flat green wall of stepped blocks ("Taunus" ridge) plus a smooth green hill; a hard black shadow wedge sits left of the car. Street life and brick/window detail on the sides are the lowest of the four.
**Athens start.** .40: sunlit, warm, readable brick/stone facades (windmill, arched windows), dense street life, a textured town on the horizon. .50/.61/.62: the sun is no longer on the faces we see. Trees and the near building front are near-black silhouettes, facade texture is lost, the car runs on an ochre strip instead of the grey road, and bright 1-px green/white lines run along the road edge in .61/.62 (seam / z-fighting).
**Chase camera (after 5 s).** Same as the start shots. Car gloss: no clear loss, the red car looks about the same plastic in all four; the glossy-on-road reflection 2K shows is not there in any build (flat spec highlight only).

## Categories (what got worse, first version)
| Category | Result |
|---|---|
| Sky / colour | Not worse. .50+ sky is a cleaner deep blue with brick clouds; only the .40 horizon glow (depth) was lost. Grass is over-saturated lime in all. |
| Lighting / shadows | WORSE from ~.42/.43 (seen at .50). Athens faces toward the camera are black, Frankfurt gets hard black wedges (.61/.62). |
| Bloom | No change (.16 strength, all four). |
| Textures / brick detail | WORSE from .50: Athens facade texture invisible in shade; Frankfurt roadside walls replaced by lawn. |
| Draw distance / fog | Roughly equal (same fog density). Far trees became flat impostors at .42-.43 (visible as thin dark cut-outs). |
| Pop-in | Not measurable headless; LEGO impostors beyond 150 m (.42) are a likely pop source. |
| Z-fighting | WORSE at .61/.62 Athens: green/white lines along the left road edge. |
| Terrain banding | WORSE from .55: stepped green wall on the Frankfurt horizon. |
| Building quality | Mixed: .48 low-rise LEGO sets and .54 districts add variety but the main-street wall of towers is gone from the start view (.50+). |
| Car gloss | Equal; not 2K-quality in any build. |

## Top 5 regressions
1. **Backlit / black faces, no facade detail (Athens, partly Frankfurt).** First seen: beta.50 (introduced by .42/.43 sun-follow; .40 is bright). Athens trees and building fronts render near-black because only hemi .4 lights them. Source: `src/98gx_gfx.js` `GFX_sunFollow` (GFX_EL .52, GFX_AZ 2.8, GFX_SLEW .35, slews at most ~.35 rad/s, so at spawn/turns the sun is not behind the camera) and `hemi.intensity=.4` in `GFX_light`. Fix idea: higher fill (≥.7, warm ground bounce), snap sun on spawn, check `__gfx.side()` in a test for the Athens start.
2. **Street walls of buildings replaced by empty lawn at the Frankfurt start.** First seen: beta.50 (changelog .48 "LEGO-set buildings in low-rise streets", .42 far-tree impostors). The 2K "lively street" look is lost: no continuous towers, fewer props near the camera. Source: `src/98ro_open.js` (asset-2 trees/CTB placement, ~line 182), `src/97_art.js` (CTB), city blocks in `src/98wb_world_batch.js`. Flag: `?asset=0` / `?life=0` for A/B.
3. **Flat stepped green ridge ("Taunus") and smooth hill crowns on the horizon.** First seen: beta.55 (terr-4/terr-5, commit 5927cad), visible in .61/.62 Frankfurt as a flat green wall with blocky steps, no texture, no fog. Source: `src/53_terrain_roads.js` (~line 210 Taunus; terr-5 green crowns). Fix idea: fog/colour-grade the far ridge, add texture noise or hide it until it has detail.
4. **Hard black shadow wedges and heavy black car/prop shadows.** First seen: beta.50 (right of car), strongest .61/.62 (bottom-left). Low sun (~30°) with 2048 map ±42 m (`GFX_light` shadow extents, `src/98gx_gfx.js`) plus dark hemi makes shadows read as black holes instead of 2K's soft blue-tinted shade. Fix idea: lift shadow darkness (hemi up / `shadow.intensity`), soften radius.
5. **Athens road shows an ochre strip and green/white edge lines (z-fighting).** First seen: beta.50 for the ochre road surface, .61/.62 for the edge lines. Source suspects: road shelf / seam work in `src/98rs_road_seams.js` and `src/53_terrain_roads.js` (Athens shelf), kerb strips from .41/.43 "kerbs follow the ground". Needs a close-up shot at the spot to confirm which layer.

## Not regressions (keep)
Deep blue sky and brick clouds (2K target met), blimps, LEGO trees up close, bloom level, ACES tone mapping.

## Gap to 2K Drive (still true in all 4 builds)
No reflective/glossy car on the road, cartoon-flat lawns, Frankfurt street not "lively" at spawn, HUD (bug button + chip stack under the minimap, TAP TAP chip) takes the left third of the view on a phone in .60+.
