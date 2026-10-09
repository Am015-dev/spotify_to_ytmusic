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

## REWORK required (reviewer FAILed a and b; c content OK). ONE combined REVIEW on the final commit, rebased on live v87r (brave-carson 528b4ab)
The coordinator (14:56) and the reviewer (14:56) need ALL of the items below. Stop adding features.
1. **Opponents and pack.**
   - 852×393 start-grid shot with all 7 opponents visible, Frankfurt and Athens. Note: the player starts on POLE, `setupRace` row/col. The shot is taken from the pole looking forward, so the field is behind. Use a side or high camera, or shoot at the end of the countdown from behind.
   - Mid-race shot next to an opponent.
   - Pack gap 1st→last at 15/30/60 s and position changes per race, live (:8767) vs stack.
   - Add these to tRace's `ptrace`: `ships` dist max−min, and a count of place changes.
   - If the field strings out on 38 m, raise the AI rubber band (`physAI s.rubber`, 30_race ~line 489).
2. **Clearance.**
   - Replace the box method with per-tyre RAYS: a raycast from 0.6 m above each wheel contact down onto the road/corridor/water meshes, for the player and 2 AI.
   - Cover start, 200+ km/h, a corner, a water lane (boat waterline) and a dirt lane.
   - Must be ≥0 and within ±0.05 m.
   - The coordinator also wants the minimum car-to-wall distance per lap, new vs live.
   - One low side view of the player beside an AI car.
3. **Feel strips at 230 km/h, live vs stack:**
   - tightest corner on grand and akro: 3 frames per corner, with slip and camera lag;
   - hard brake from top speed: strip plus stopping distance;
   - racing-line assist: show it never steers against input and lets go on touch (heading change: no input vs steering away from the line).
4. **Ghost boat** (`akro_phone_shortcut2_water` in race15b).
   - Root cause is very likely the GHOST item from 96_scale_qa `V85_item`. It does `s.ghostT=4.5`, clones the car materials at opacity .35, and sets `s.shield=4.5`, which draws the bubble disc.
   - Slice c removes GHOST from the race item set, and its akro water shot is solid.
   - Re-shoot the same frame (seeded RNG: same track, same time) on the final build and confirm.
   - If the shield bubble still covers the car, shrink it or put it behind the car.
5. **SHORTCUT boards** readable about 2 s ahead at 230 km/h.
   - Currently 16×8 m at y 11, 3 boards at −220/−120/−30 m (R15_mesh in 31).
   - Make them about 2× bigger with higher contrast (yellow on black), maybe an overhead gantry.
   - Shoot while moving, with the wall gap and arrows in view.
6. **WEB/LIGHTNING hit on the PLAYER**: phone shot.
   - The 96 WEB overlay (#v85web) blinds the full screen for 4.5 s and must not cover the HUD/controls.
   - It lives in 96 (QA module): ask the coordinator or keep it inside `98z` by overriding `V85W.style` (smaller vignette, shorter).
   - "WEB MISS" feed text must never sit over a control.
7. **Westhafen walls/min ≤ live 0.63** (stack had 1.10 with items).
   - Check with DBGW where the hits are (items / web blind / tester).
8. **Boost**: worker 16 (alex/od-boost16, `src/98k_boost2k.js`) owns the 2K boost meter (`window.B2K`). Don't build another; maybe call `B2K.add` on corridor boost pads. It isn't required.
Then send ONE REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v with all paths and numbers. After PASS: changelog, build, DEPLOY to the coordinator.
