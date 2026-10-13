# Empty green vs LEGO 2K Drive (art-2, 2026-10-13)

Alex: "All the game looks extremely poor compared to lively 2K Drive ... way too many empty spaces, boring green flat spaces."

Grid: `docs/research/ref/fill/side_by_side.jpg` (left: LEGO 2K Drive, Steam store shot + YouTube gameplay frames; right: our game at the
emptiest road-side spots found by `tools/tLive.js find`, 852×393). Refs: `ref/fill/ref0-5.jpg`.

## Differences (concrete)
1. **Ground.** 2K: the ground is never one flat colour. Rolling hills, two or three grass shades, dirt tracks, sand. Ours: one flat lime plane to the horizon (Frankfurt height range in view 2-8 m).
2. **Trees.** 2K: tree clusters and small forests at 30-200 m in every view, with autumn reds and oranges. Ours: single trees along kerbs, open fields empty.
3. **Props near the road.** 2K: fences, flower patches, rocks, signs, lamps and benches within 50 m. Ours: 0-1 props within 50 m of the spot.
4. **Water.** 2K: ponds, streams and lakes with sand banks. Ours: only the Main.
5. **Small life.** 2K: market stalls, people in parks, flags. Ours: flags/peds/birds exist (LV, v88n) but only on streets.
6. **Light.** 2K: warm and saturated, deep blue sky, strong sun. Ours: the sky is good, but the flat lime grass makes it look washed.

## Fix (src/98lf_lively_fill.js, LF)
Open-grass cells (28 m) get one theme from a 160 m noise patch: grove, garden, pond, wild (mound + rocks + dirt), market or meadow. Every cell also gets tufts and a grass-shade patch.
Mounds are real terrain: roamTerr adds them, so the car drives over them.

## GO checks (checklist `lf:*`): one exact spot each
Each check measures: flat uniform green % of the frame (tools/tLiveGreen.py), props within 50 m, and the height range in view.
