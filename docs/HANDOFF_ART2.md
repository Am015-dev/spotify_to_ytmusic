# art-2 handoff (world liveliness lane), 2026-10-13

Branch `alex/od-art2`. Last merged into `alex/od-int2` at 5e23c60: the fill is **ON by default** (`?lf=0` turns it off).

## What exists
- `src/98lf_lively_fill.js` (LF), loaded just before `99c_checklist.js` in src/ORDER (it must be: 99c reads `LF.SP`).
  - **Fill, streamed:** every 1 km tile of the city box is a LAZY region (`lzReg`, build `LF_tileG`). It is built near the player in 1.2 ms slices and freed by 98cl_stream.
    - `STR_lzFree` is wrapped to drop the tile's mounds and grid entries.
    - Order of work per tile: open 40 m cells (`LF_open`) → mounds (`LF.mounds`, `?lfm=0` turns them off; they go OFF when art-1's terrain relief lands) → one theme per cell (grove / garden / pond / wild / market / meadow) → verge every `LF.vs` m along every street and filler road → decor InstancedMeshes per tile → `lzPropsG` (the city's smashable props).
  - **Knobs:** `LF.keep=.6` (share of open cells), `LF.far=.5` (density more than 150 m from a street), `LF.R` (decor cull distances).
  - **Grass mottle:** a shader patch on HUB.M walk/yard/grass (`LF_mottle`, wraps `ART_hub`). gfx-1 now owns materials: tell them about it.
  - **GO spots:** `LF.SP` (fra-1..4, ath-1..2) + `LF_goMound`. Pass line = flat-green ground ≤ 8% (`LF_green`: a second render with only the `trG` ground meshes, so tree crowns and the HUD don't count) AND ≥ 6 props within 50 m. `hRange` is reported, not gated.
  - **Probes:** `__lvf.why(x,z)` (first rule that rejects a point), `__lvf.ensure`, `__lvf.dbg()`.
- `src/99c_checklist.js`: 7 `lf1` items with GO.
- `src/98cl_stream.js`: STR_lzFree without the `push(...spread)` (130k+ props overflowed the stack in Athens).
- **Tools:**
  - `tools/tLiveGo.js <url> <out> [tag] [ids]`: lf1 GOs; the hill drive runs on a `draw=0` page.
  - `tools/tPerfLF.js <url> [fra|ath]`: fill ON vs `?lf=0`, no-render boot, median of 5 forced frames at 3 fixed views.
  - `tools/tLive.js`: spot finder.
  - `tools/tLiveGreen.py`: green % from a PNG (it counts the HUD; prefer the in-page check).
- **Research:** `docs/research/LIVELY_2K_FILL.md`, grid `docs/research/ref/fill/side_by_side.jpg`.

## Last results (one browser at a time; parallel runs time out or skew perf)
- **lf1:**
  - PASS fra-1, fra-3, fra-4, mound.
  - FAIL fra-2 11.7% (quay road: not in CITY_S or hubRoads, so it gets no verge; quay colliders sit nearby).
  - FAIL ath-1 8.7%.
  - FAIL ath-2 10.0% (4.0% one build earlier, noisy).
- **Perf:** fra −7.6% / boot −3.7 s, ath −14.8% / boot +1.7 s. PASS.
- **ath-trees:** PASS.

## Next
1. Close fra-2, ath-1 and ath-2. Ideas:
   - fra-2: verge along quay roads (QUAYS / lzRoad lists).
   - Athens: denser tufts on lawns.
   - Run only those ids.
2. Building variety (coordinator 23:46): no two adjacent blocks alike; district themes. Assert: repeat-rate of the same building variant within 100 m ≤ 20%. Coordinate with gfx-1 (session_01HxGL7Mn14pc2w3K3Tx8NsG).

## Rules learnt here
- Coordinator 23:30: no real-time play. Perf = fixed views only, ≤ 20 s per city; print FAIL lines only; push to od-int2 behind a flag once the lane GO passes.
- Fast mode (`?fast=1`) hangs at boot together with `?test=`. Use `&draw=0` for physics tests.
