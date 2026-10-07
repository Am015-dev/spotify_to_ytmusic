# HANDOFF race15 (race worker 15, 2026-10-07): RACE2K slices a/b/c

Branch `alex/od-race15` (from live v87p a9a836e). The plan, the 2K research and the live measurements are in `docs/RACE2K_PLAN.md`.
Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Workers never run deploy.sh.

## Status
- **a) SPEED + WIDTH**: src commit 556087a; shots and bench in `docs/shots/race15a/` (ebf19b6). REVIEW sent to the reviewer and is waiting for PASS. After PASS: rebuild on current live HEAD, use the next free version, add an OD_CHANGELOG entry, then `git add -f out/<ver>` and send DEPLOY.
  - Track width is 38 m (`R15_trackW` in 20).
  - In races (not roam), every racer gets top speed ×1.2 and acceleration ×1.35 (`makeShip` in 30, `R15_on()`).
  - Boost burst: `R15_boostFx`.
  - With touch assist and no steering input, the car drifts to the racing line (`R15_line`).
- **b) STRATEGIC ROUTES**: `src/31_race_r15.js` plus hooks in 20/30 (all tagged R15). Working tree; commit it as slice b.
  - Corridors are found automatically per circuit (`R15_find`): 560 m long, on the inside of a bend, with a 150 m mouth where the wall opens, a 6 m island (40 m nose) and a lane of up to 22 m (`c.cw`, narrower on tight bends).
  - Kinds are water or dirt. Each corridor has a boost pad in its middle and three SHORTCUT boards plus floor arrows before the mouth (forward races only).
  - Terrain comes from `R15_ter` through `waterStep`, so boat and 4×4 swap automatically.
  - Lateral limits are `R15_b(s,px)`, and every old ±MARGIN clamp now uses it (`R15_cx`).
  - AI takes a corridor with a skill-based chance, decided once per lap (`R15_aiXt`).
  - Fixes made along the way:
    - steering feed-forward and corner speed now use the effective lane curvature k/(1−k·x) (player assist and AI);
    - corridor water grip is ×0.9 (the river stays ×0.62);
    - the island's lane-side face is fixed.
  - Coverage: grand, hafen, nord, akro, kifi and pana have water + dirt. fraport, sky, sachs and synt have one corridor; the circuit is too short or too crowded for two.
- **c) POWER-UPS**: draft at `scratchpad/32_race_items.js` + `slice_c.py` (copy to `src/98z_race_items.js`, add it to ORDER right before `99_api.js`, because it must wrap `pickItem` AFTER 96_scale_qa).
  - Floating LEGO "?" bricks: one InstancedMesh, respawn after 2.5 s, a row every 650 m, 4 across.
  - Race item set: MISSILE, TURBO, SHIELD, WEB, MINES, LIGHTNING.
  - AI fires WEB at long range.

## Testing
- `tools/tRace.js <url> [out]` (env TRACK, CITY, LAPS, MAXMIN, SHOTS, TAG, DBG, DBGW) is a real-touch phone race. It prints `RACE_RESULT` with:
  - lap/race time, average/top km/h, walls/min, transforms, `routes` (corridors driven), items, place, `ptrace`;
  - render ms (node wall clock, 5 forced frames every 10 s; in fast mode the in-page clocks are fake);
  - tyre gap.
- `tools/race_bench.sh <label> [runs]` runs grand, hafen and akro (×runs) into `qa_race/<label>/bench.txt` and prints a summary. Set `URL=` to use another server.
- Live and slice-a worktrees (`../wt_live`, `../wt_sa`) are served on :8767 and :8768 for A/B; the main repo is served on :8766.
- A race is 1 lap (LAP 1/1, set in 99_api). Results vary run to run (game RNG), so compare means of ≥2 runs.
