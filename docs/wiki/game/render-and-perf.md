# Render and performance
## Key files / functions
- Renderer, post, sky, textures: `src/10_core*.js` (`resize`, `applyMood`), `src/20_race_world.js:applyQuality`; main loop `frame(now)` in `src/72_roam_map_loop_boot.js`.
- Tiers: `src/98gt_gfxtier.js:GFX_detect` (0 LOW = phone, 1 MID, 2 HIGH, 3 ULTRA); low-gfx `tools/lowgfx.js`.
- Culling/compaction: `src/70_roam_world.js:hubCullStep`, `src/98pc_compact.js` (PC_*, per-instance distance + frustum), baked grids `src/98bk_bake.js`, streaming `src/98cl_stream.js` (STR_*), memory `src/98mf_memfree.js`, budgets `src/98rb_roam_budget.js`, `src/99cb_athbudget.js`.
- Telemetry: beacon `src/98pb_perfbeacon.js` (-> db collection `perf`), session doc `src/98ps_session.js`, FPS chip.
- Tools: `tools/perf/framejs.js`, `tools/perf_report.js`, `tools/perfab.js`, `tools/perfbisect.js`, `tools/prof.js`, `tools/bootprof.js`, `tools/gfxprobe.js`. GO modules `src/99c7_perf.js`, `src/99fj_framejs.js`.

## Invariants
- iPhone truth: no build is smooth without the throttled gate (6x CPU, 0 shader links and no long frames in the first 3 s after reveal).
- Phone path differs from desktop (invisible-car bug only on phone): test phone first.
- Allocation in the frame loop causes GC spikes (Athens spikes were GC).
- memFree / streaming (`98mf_memfree.js`, phone tier) only manages STATIC geometry: a mesh its owner rewrites every frame must use `setUsage(THREE.DynamicDrawUsage)` (MEMF_dyn skips it), and a zip whose arrays were written during the deflate is dropped. A nulled array on a drawn mesh whose version was bumped = render throw "null (reading 'byteLength')" (jserr-r30f: the drift trail; bug-r19a: SM_upload + dispose). GOs `bug/no-jserr-drive`, `bug/no-raf-error`; find the owner with the gauntlet's GTRAP mode (docs/GAUNTLET.md).

## Known bugs / history
- Perf lanes: [../../HANDOFF_perf.md](../../HANDOFF_perf.md), [../../PERF_1.md](../../PERF_1.md), [../../PERF_BISECT.md](../../PERF_BISECT.md), [../../PLAN_ATH_PERF.md](../../PLAN_ATH_PERF.md), [../../PLAN_PC_GRAPHICS.md](../../PLAN_PC_GRAPHICS.md), [../../EFFICIENCY_PLAN.md](../../EFFICIENCY_PLAN.md).
- Visual gap to 2K: [../../BENCH_2K.md](../../BENCH_2K.md), [../../GFX_REVIEW.md](../../GFX_REVIEW.md), reviews `docs/REVIEW_2K_<n>.md` (latest [../../REVIEW_2K_22.md](../../REVIEW_2K_22.md)).
- Reveal stall (parked): [../../HANDOFF_reveal-stall-r22e12.md](../../HANDOFF_reveal-stall-r22e12.md).
