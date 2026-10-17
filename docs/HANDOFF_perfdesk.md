# HANDOFF perf-desk (2026-10-17): desktop lag, alex/perf-wip fe664b0 (not on trunk: GO perf/frame red)
1. Fixed: FC_pull camera ray grid (66 ms per pull -> 0.3 ms, same hits), sliced LF drape lazy step (up to 215 ms -> sliced), software-canvas avatars (toDataURL GPU waits).
2. After (GO perf/frame, pf2): fra median 10 / p95 23 / max 171 ms; ath median 20 / p95 100 / max 409 ms. Target p95 ≤ 8, max ≤ 50.
3. Gates pf2: unit 0 FAIL, rv2k2 + cam/stable green, 58/73; the other reds look like trunk's, but no same-name trunk run yet.
4. Next: see docs/PERF_1.md "Next" (clean probe pf0 vs pf2, PROF inside the GO window, B2_pump/CV_pre/LV_step/heap).
