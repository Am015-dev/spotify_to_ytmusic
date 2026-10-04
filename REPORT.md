# Seamless Athens: REPORT (alex/od-seamless)

**Owner issue:** "I can go from one area to another in a minute and get 4 loading screens." Every Athens border (A↔B, B↔C, C↔D) was a
DRIVE TO gate that saved the position and called `location.reload()`, a full boot of the next district map.

**Result:** Athens A–D is **one map** built once at boot. Crossing a border shows only the 📍 district banner; there's no gate, fade,
reload or loading screen. The current district (`ATHD`) now follows the car.

## Approach (fallback chosen, with streaming where it pays)
A true per-district background build was not feasible as a patch. The city builder (`buildHubG`, ~20 KB of one generator) closes over
dozens of box constants (`HX0…`, `WX0…`, `CITY_S`, `SHELF`, `HUB.*`) used by physics, traffic, GPS and the minimap. So the four
districts are merged into one world, and the parts that grew with the map are streamed or made cheap:

| patch | what |
|---|---|
| pSM1 | one world = union of A–D. Streets limited to districts + 300 m; the gaps between districts are the existing lazy "Attiki" outskirts (streamed in 3.5 ms slices). Terrain = the 4 DEM grids blended continuously. No gates; `ATHD` is live; map district buttons warp in place; pins route directly; campaign missions that used a gate (amphora, metro, convoy) now cross at an invisible waypoint and continue in place (`ATC_transfer` → in-page resume). The first boot of a district without a saved position spawns at that district's garage. Off switch: `localStorage mho_sm='0'` (or `?sm=0`) restores the old split. |
| pSM2 | road-shelf ground query (`athShelfY`, ~60 % of the city build) compiled per 32 m cell: **bit-identical** (max diff 0 on 200k random points), about 2× faster build (merged 36.7 s → 17.5 s). Also speeds up the split build. |
| pSM3 | static city geometry is uploaded to the GPU inside the loading screen (zero-count draws) and its JS arrays are freed (107 MB). No first-sight upload hitches while driving. |
| pSM4 | city props share one material instead of ~12k identical ones (85 MB of cloned uniforms in prewarm). Also helps split and Frankfurt. |
| pSM5 | GPS graph (and minimap buckets) are built in the loader, not on the first frame. `propRespawn` and `hubCullStep` work in strides on big maps (235k props, 13k cull entries). |
| pSM6 | minimap streams: a 13×13 window of 250 m tiles around the car (same 0.34 px/m), nearest first, ≤4 ms per frame (tile median 1 ms, max 4 ms). The full map keeps the old district-sized zoom (pinch out to see all of Athens), and drag uses the map's own scale. |

Apply on top of release-82 `overdrive.html`, in order: `pSM1 pSM2 pSM3 pSM4 pSM5 pSM6` (anchors in ANCHORS.md).

## Measurements (this box: software WebGL, Chrome; frames = one game step, CPU throttled ×4, rendering excluded)
| | before (release-82, split) | after (seamless) |
|---|---|---|
| loading screens on bot drive A→B→C→D→A | **6** (each a page reload, 12.8–15.9 s here; D↔A not adjacent) | **0** (0 reloads, 6 crossings) |
| worst frame within ±3 s of a crossing (×4) | the whole reload (≥12.8 s) | **67 ms** (crossings: 52, 67, 57, 51, 41) |
| normal driving step p50 / p99 / max (×4) | 16 / 38 / 86 ms | 19–25 / 44–69 / 171 ms (0.5 % of steps > 50 ms) |
| boot to roam (unthrottled) | A 13.5 · B 16.6 · C 13.9 · D 13.0 s, plus one per crossing | **28.8 s** once (48 s in the ×4 run) |
| JS heap after boot | A 206 · B 196 · C 221 · D 266 MB | **392 MB** (all of Athens; 732 MB before pSM2–4) |
| draw calls at district starts | A 82 · B 344 · C 133 · D 456 (probe camera) | A 442 · B 451 · C 445 · D 390 (after 30 steps; 1.6 km cull radius unchanged) |
| Frankfurt | one map already (lazy biomes), **0 loading screens**; worst 153 ms, p99 33.5 ms (×4) | unchanged: 0 loading screens, worst 215 ms, p99 24 ms (×4) |

Notes: ×4 on this software-rendering box is much slower than an iPhone 16. The 50 ms target holds for the median, not for the worst
steps here; those are spread over normal driving (GC on the larger heap, outskirts tiles), not at borders. Frankfurt has no district
loading screens and needs no change. Its occasional worst steps were already there before (153 ms).

## Tests (final build; unsplit = `local_dbg.html`, split = `tools/split_km.py` page + km.js, each in its own dir and port)
| test | unsplit | km-split |
|---|---|---|
| `node smoke.js .` | SMOKE PASS 12/12 (re-run on the exact final build) | SMOKE PASS 12/12 |
| tools/tBA.js | ALL PASS 30/30 | ALL PASS 30/30 |
| tools/tBF.js | 9/1 (BF3 known harmless) | 9/1 (BF3 known) |
| tSM.js drive (seamless) | 8/1: 0 loading screens, 0 reloads, 6 seamless crossings, never stuck, 0 errors; FAIL only "crossing frame < 50 ms ×4" (67 ms) | — |
| tSM.js func (campaign gate in place, map warp, no gates) + Frankfurt | campaign ✓, gates ✓, map warp ✓ (after a test fix), Frankfurt 0 loading screens ✓; Frankfurt worst frame 215 ms (base 153) | — |

tBA gate test changed: in seamless mode it asserts the A→B crossing switches the district **without** a reload or loading screen
(the old reload branch is unchanged for `mho_sm=0`). smoke/tBF are unchanged.

## Known gaps
- Boot is about 2× a single district (28.8 s vs 13–16 s here), paid once per session. The JS heap is 392 MB vs ~200–265 MB. Nothing
  unloads: far districts are culled (1.6 km) and their static geometry lives on the GPU. The lazy outskirts are never disposed (as before).
- The worst normal-driving steps at ×4 are above 50 ms (GC pauses on the bigger heap, outskirts tiles). The p99 is 44 ms.
- The residential-blocks change (alex/od-drive) is not required. When it lands, roadless blocks become solid blocks, which should cut the
  merged build time and the 386k instanced building boxes further.
- The split build (`mho_sm=0`) still works and is what tBA's reload branch exercises.

Screens: smoke/sheet.png (final smoke), smoke/sm_map_border.jpg (full map: the A|B border with streets continuing, no gates).
