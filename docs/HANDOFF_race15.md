# HANDOFF race15 (race worker 15, 2026-10-07): RACE2K slices a/b/c

Branch `alex/od-race15` (from live v87p a9a836e). The plan, the 2K research and the live measurements are in `docs/RACE2K_PLAN.md`.
Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Workers never run deploy.sh.

## Status (all 3 slices built and sent to the reviewer; waiting for PASS)
- **a) SPEED + WIDTH**: src 556087a; review e412b92-independent head ebf19b6 (shots and bench in docs/shots/race15a/).
  - Track width is 38 m (`R15_trackW` in 20).
  - In races, every racer gets top speed ×1.2 and acceleration ×1.35 (`makeShip`, `R15_on()`).
  - Boost burst: `R15_boostFx`.
  - With touch assist and no steering input, the car drifts to the racing line (`R15_line`).
- **b) STRATEGIC ROUTES**: src 11f25e9 + d7159a6; review head f9d2b08 (docs/shots/race15b/). Code is `src/31_race_r15.js` plus R15 hooks in 20/30 and one camera-clamp line in 99_api.
  - Corridors are found per circuit by `R15_find`: 560 m long, 150 m mouths, a 6 m island with a 40 m nose, a lane up to 22 m (`c.cw`).
  - Kinds are water or dirt. Each has a boost pad mid-lane and 3 SHORTCUT boards plus floor arrows before the mouth (forward races only).
  - Terrain comes from `R15_ter` through `waterStep`.
  - Lateral limits are `R15_b`; the old ±MARGIN clamps now go through `R15_cx`.
  - AI uses `R15_aiXt`; the assist uses `R15_line` / `R15_hold`; the camera limit is `R15_camB`.
  - Steering feed-forward and corner speed use k/(1−k·x). Corridor water grip is ×0.9.
  - Coverage: grand, hafen, nord, akro, kifi and pana have water + dirt. fraport, sky, sachs and synt have one corridor (too short or crowded).
  - Taking both shortcuts on grand: 118.8 s vs 125.8 s on the road.
- **c) POWER-UPS**: src a15c7f6 + 14a1e24; review head e412b92 (docs/shots/race15c/). Code is `src/98z_race_items.js`, in ORDER before 99_api because it must wrap pickItem after 96.
  - Floating LEGO "?" bricks: one InstancedMesh, ×1.9 scale, respawn after 2.5 s, a row every 650 m, 4 across.
  - Race item set: missile, turbo, shield, web, mines, lightning. The leader gets no web.
  - AI fires web at long range.
- **After each PASS** (the reviewer may pass slices separately):
  1. Rebuild on CURRENT live HEAD: `git fetch origin alex/brave-carson-rbpmlk`. If live moved, merge or re-split src (see HOW-TO-WORK) and rerun verify.
  2. Use the next free version and add an OD_CHANGELOG entry at the top of `src/10_core.js`.
  3. Run `tools/build.sh <ver>`, then `git add -f out/<ver>`, then push.
  4. Send the coordinator "DEPLOY alex/od-race15 <commit> out/<ver> <msg>" with 3 bullets and shot paths.
  - To ship slice a alone, build from 556087a. b sits on a, c on b.
- Known limits:
  - Signs only face forward races.
  - Westhafen walls/min is ~1.1 with items vs live 0.63; the 3-track mean is better (1.04 vs 1.17).
  - The tyre-gap box metric reads −0.2…−0.6 m on banked lanes (car code unchanged).

## Testing
- `tools/tRace.js <url> [out]` (env TRACK, CITY, LAPS, MAXMIN, SHOTS, TAG, DBG, DBGW) is a real-touch phone race. It prints `RACE_RESULT` with:
  - lap/race time, average/top km/h, walls/min, transforms, `routes` (corridors driven), items, place, `ptrace`;
  - render ms (node wall clock, 5 forced frames every 10 s; in fast mode the in-page clocks are fake);
  - tyre gap.
- `tools/race_bench.sh <label> [runs]` runs grand, hafen and akro (×runs) into `qa_race/<label>/bench.txt` and prints a summary. Set `URL=` to use another server.
- Live and slice-a worktrees (`../wt_live`, `../wt_sa`) are served on :8767 and :8768 for A/B; the main repo is served on :8766.
- A race is 1 lap (LAP 1/1, set in 99_api). Results vary run to run (game RNG), so compare means of ≥2 runs.
