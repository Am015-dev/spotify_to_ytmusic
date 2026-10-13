# models-5 handoff (build-9, LEGO-model INTEGRATOR, 2026-10-13). Branch alex/od-models.
Coordinator session_017iH3DB4VyxwKSdMwsco4Ut, reviewer session_01Y6FYerWwxv43FuKUcaUT4v. Read docs/HANDOFF_models4.md for the pipeline (lazy models, src/MODELS, loop).

## State
- LIVE: v90g (brave-carson 05ac434; later brave-carson commits do not touch games/mainhattan-overdrive).
- v90h (garage-18 floor fix) was never shipped on its own; it is folded into v90i (changelog keeps both entries v90i + v90h).
- v90i = out/v90i on alex/od-models (built at 5e8c7e38, grid ce5cbb2b): v90h floor fix (alex/od-garage18 78d49cf0) + veh-2's 16 Town rides
  + size-1 b989e882 (JU squash clamp, BC_dims width cap) + land-2 35406f1 (palms on the verge) + checklist pin clears #m1Next (src/99c_checklist.js pinPlace selector).
  GRID docs/shots/v90i/GRID.jpg. REVIEW sent; see the end of this file for PASS/READY status.
- tPlay phone v90i vs v90g baseline (docs/shots/v90i/tPlay_*.json): the same fails on both (fra stuck ~4.5-4.9 %, ath walls 1.5-2/min, ath heap ~165 MB); v90i is no worse.

## Next: v90j (fresh integrator)
- veh-2 (stood down) left 20 rides on alex/od-mdl-veh head 3cac11f, NOT in src/MODELS yet (veh-2 does not commit MODELS):
  98ld_v_6605-1 6609-1 6354-1 6361-1 625-1 6504-1 6608-1 4206-2 7347-1 7638-1 6600-1 6602-1 6603-1 6501-1 6675-1 6430-1 6450-1 6480-1
  6911-1_Ladder-Truck 6911-1_Rescue-SUV (.js). Grids: docs/shots/veh/GRID_veh2.jpg, GRID_veh2b.jpg.
- CONFLICT: 7638 Tow Truck already shipped in v90g (rescue-1, same file src/98ld_v_7638-1.js). Keep one version (compare both on the stage).
- veh-3 (new) sends MODEL lines + grids to the integrator directly.
- land-3 WIP on alex/od-mdl-land (3e29a64..ad2e05d: LEGO cone/barrier/stop sign/rock, Athens tree swaps) is UNTESTED; take it only when land-3 reports.

## Test notes (things that cost time)
- tPlay and g18/audit.js need the --local build (local_dbg.html has __dbg/__g9ev); out/<ver>/index.html fails with "__dbg is not defined".
  `tools/build.sh <ver>dbg --local` then serve the repo root on :8766 (setsid nohup python3 -m http.server 8766).
- Ride audit: `node g18/audit.js http://127.0.0.1:8766/local_dbg.html <out> t_v6525_1,...` prints gap/dummy/errs per ride + stage png per ride.
- Baseline for any tPlay fail: `git worktree add ../wt<ver> <live src commit>`, build --local there, serve on :8767, run the same tPlay.
- One full phone tPlay (2 min/city) takes ~50-55 min here.
- qa/ is in .git/info/exclude (test output); commit only docs/shots/<ver>/.
