# TR — real terrain and drivable hills

Owner feedback: "2K Drive lets you drive on hills up to a height, which doesn't happen in our game. Also everything is flat; no city is that flat everywhere."

## What changed
- **Data** (`trdata.py` → `tr_data.js`, 118 KB embedded): AWS Terrarium tiles (z14; z12 for the compressed Frankfurt fringe), decoded with a small zlib PNG reader and cached in `tr_cache/` (not committed). There is one grid per map: Frankfurt fine (20 m) + coarse (160 m), and Athens A/B (12 m) and C/D (16 m). Each grid is Gaussian-smoothed, quantised to 0.5 m, then planar-predicted and Rice-coded. The page is now 3.35 MB (limit 3.6).
- **One height function** `TR_Y(x,z)` (in `tr_core.js`) is behind `groundY` and `tH`. Ground mesh, roads, junctions, buildings, props, traffic, pedestrians, markers, quests/GPS and the minimap all use it, because they already called `groundY`/`groundAt`/`tH`. `hillH` stays the old hill-feature mask for placement rules.
  - Datum is the river (Frankfurt, 92 m, ×1.25 exaggeration) or the district low point (Athens, ×1). Within 30–180 m of the Main the ground is flattened to river level, so quays and bridges stay as they were. The Acropolis keeps a flat plateau. The Taunus keeps its sculpted ridges on top of the real ground.
  - Athens: every street gets a graded profile on the real ground, capped at 12 % per sample and 11 % between junctions, with shared junction heights. Measured `roadProf` max grade is A 13.1 %, B 14.7 %, C 13.5 %, D 12.6 % (smoothing overshoots the cap slightly). Cuts and embankments blend back to terrain over 3× their height (18–60 m), so they stay at about 27° or less.
  - Frankfurt streets are draped directly on the smoothed DEM. The bot measured grades up to about 33 % over 4 m windows. That figure is all maps combined and includes off-road corner cuts, so Frankfurt alone is not separated.
  - The ground mesh refines by curvature (5 cm error, cells down to 8 m) and sits 10 cm low, so draped streets always show.
- **Buildings** are fixed after the city merge (first `hubGrid`). Each footprint gets its lowest and highest ground. Bodies built at y=0 are lifted to max(lowest corner, highest corner − 0.8 m), and a stone plinth fills down to the lowest corner. Colliders move with the buildings.
- **Drivable hills** (`tr_game.js`):
  - Gravity acts along the slope. Grip is full up to about 29° and fades to none at about 38°; past that the car slides down the fall line instead of getting stuck.
  - The car stays glued to the terrain (no airborne frames, never below the ground). It still bounces off real cliffs.
  - The car pitches and rolls to the slope normal, smoothed.
  - The chase camera lifts over the hillside, rising fast and settling slowly.
- **Summits:** Lycabettus (B) and Filopappou (A) each have a viewpoint ring, a flag, 13 studs, and a one-time +250 "VIEWPOINT" bonus saved per slot.
- **Minimap:** a hillshade overlay is drawn on the painted map.

## Patch order
`./reapply.sh pTR1.py` (a single patch; it inserts `tr_core.js` + `tr_data.js` and `tr_game.js`). There are 10 anchors, listed in `ANCHORS.md`.

## Tests (final run)
- `node tTR.js` (Frankfurt, Athens A–D): **ALL PASS**.
  - **Heights:** 10/10 points match the source within 12 m, and the world ground equals (h − datum) × exaggeration. For example: Parthenon 146 m, Lycabettus 251 m (the Terrarium source itself gives 251; real 277), Syntagma 102 m, Römer 107 m.
  - **Routes:** 40/40 bot routes (8 per map) with 0 airborne frames, 0 below-ground frames, and a longest stop of 2.1 s.
  - **Climbs:** off-road from the edge of the houses (305 m out).
    - Lycabettus: +87.5 m in 10.3 s, steepest stretch 29.7°.
    - Filopappou: +39.8 m in 16.2 s.
    - Both viewpoints were claimed.
  - **Buildings:** 0 floating > 0.3 m and 0 buried > 1 m among 58,028 checked (3,302 Frankfurt + 8,537 / 11,488 / 19,246 / 15,455 Athens A–D).
- `node tHop.js`: **ALL PASS** (30 checks, A–D, 0 airborne frames, 0 vy spikes).
- `node smoke.js .`: **SMOKE PASS** (300 s, no console errors). `smoke/sheet.png` was checked by eye. One earlier run crashed: smoke's Athens B drive goes in a random direction from about 70 m off the A/B border, so it sometimes enters the district gate and the page reloads mid-screenshot. The base build has the same gate and the same random drive.
- **Perf** (`trshots.js`, `renderer.info` summed over the whole composed frame, same camera; before = base):

| spot | calls before | calls after | tris before | tris after |
|---|---|---|---|---|
| fra_roemer chase | 788 | 781 | 2.36 M | 2.48 M |
| fra_roemer aerial | 615 | 636 | 2.18 M | 2.24 M |
| fra_sachs chase | 327 | 297 | 1.05 M | 1.08 M |
| fra_sachs aerial | 353 | 322 | 1.27 M | 1.34 M |
| fra_hbf chase | 464 | 487 | 1.61 M | 1.65 M |
| fra_hbf aerial | 490 | 517 | 1.65 M | 1.73 M |
| athA_plaka chase | 279 | 301 | 0.80 M | 0.83 M |
| athA_plaka aerial | 294 | 329 | 0.87 M | 0.94 M |
| athA_filo chase | 256 | 293 | 0.69 M | 0.72 M |
| athA_filo aerial | 267 | 307 | 0.74 M | 0.78 M |
| athB_lyka chase | 266 | 296 | 0.82 M | 0.87 M |
| athB_lyka aerial | 344 | 345 | 0.95 M | 0.99 M |

Plinths add a few draw calls per map; they are merged into one mesh per 800 m tile.

Screenshots: `shots/tr_compare.jpg` (before | after, chase and aerial, 6 spots) and `shots/tr_after_lyka_climb.jpg`.

## Known gaps
- Athens building count is 93 % (A) and 91 % (B) of base. Placement now skips plots beside streets whose graded profile leaves the ground by more than 1.5 m.
- One landmark piece is cut into the Acropolis slope (the Odeon area) and one is on a 40°+ Taunus slope. They keep their designed height and are listed, not counted, in tTR.
- Frankfurt streets have no graded profiles (the DEM is gentle and smoothed); junctions are not banked.
- `hillRoads()` (test API) now skips pedestrian lanes, map-edge pieces and pieces near district gates. With real heights the highest pieces sit there, and driving them would reload the page.
