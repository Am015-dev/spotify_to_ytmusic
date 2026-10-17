# PERF-1 (2026-10-17): desktop lag (Alex beta.90: "lags a lot even on a very powerful machine")
Probe: `tools/perf1/tFrame.js <out> <ver>` (desktop context 1280x720, `?test=CITY&q=high`, rAF stubbed, 60 Hz fake clock, road-follow driver, composer.render stubbed
except every 60th frame). Subsystems are wrapped through `__oc.ev`. CPU profile helpers: `callers.js`, `inside.js`, `roots.js` and `stretch.js` (busy stretches = long tasks).
Cloud = 4 cores with software GL, so absolute ms are higher than on a desktop. The ranking and the per-call ratios are what matter. Baseline = trunk 9c43c09 (build pf0).

## Ranked hitch sources and per-frame costs (Frankfurt, desktop, 30 s roam at 87 km/h, 1800 stepped frames)
Whole frame (JS, render excluded): avg 35.6 ms · median 13 · p95 122 · max 295 · 502 frames over 50 ms.

| # | source | where | cost (before) | status |
|---|---|---|---|---|
| 1 | camera->car occluder ray `FC_pull`: three's Mesh.raycast on 215 merged meshes, 3.6 M triangles, no spatial index | src/98fc_foliage_cam.js | 66 ms per pull, every 3rd frame: avg 21.7 ms/frame, p95 109, max 186 | **FIXED**: lazy 2D triangle grid per geometry (≤ 1.5 ms/frame build). 300 rays: 16.8 s -> 0.1 s, 600/600 rays give the same hits as three's raycast. Batched/instanced meshes keep three's raycast. `?fcbvh=0` = old path |
| 2 | LF lively-fill tile drape stage (`LF_resid`, `LF_drapeOk`, `LF_drapeG`, `LF_mound`: groundY calls) in ONE lazy step | src/98lf_lively_fill.js | lazy steps up to 215 ms, 82 steps > 8 ms in 30 s (zone 'lf': 2132 steps, 5.0 s total) | **FIXED**: sliced (1.2 ms checks) + `LF_drapeG` reuses the drapeOk vertex heights (bit-identical) + instanced fill loop sliced |
| 3 | avatar prewarm (98bt_boot2 idle pump): `toDataURL` on GPU-backed 64x64 canvases waits for the GPU queue | src/30_race.js, 41_career_quests.js | single tasks of 5.9 s and 6.3 s in the cloud (GPU sync; on hardware a stall per avatar, ~30 avatars in the first minute) | **FIXED**: `cv(w,h,1)` = `willReadFrequently` software canvas for avatars + npc avatars |
| 4 | heap growth / GC | many | heap 586 -> 746 MB in 30 s of driving (+5 MB/s); GC 1 % of the profile | open: sample allocations (`--js-flags` sampling heap profile) during the drive |
| 5 | `B2_pump` -> `worldGroundGen` / `gndGen` (outer land after drivable) | src/98bt_boot2.js, 60_city_build.js | 6.0 s total in 20 s; slice is 8 ms, but one gndGen step can run past it | open: lower the slice to 4 ms and yield inside gndGen per row |
| 6 | `CV_pre` (traffic signals) spikes | src/90_fixes_cv_ju.js | avg 0.5 ms, max 75 ms | open |
| 7 | `LV_step` (lively peds/LIFE) spikes | src/98l_lively.js | avg 0.8 ms, max 67 ms | open |
| 8 | `DEV_yield` / `devOver`, `yieldStep`: querySelectorAll + getBoundingClientRect (forced layout) | dev overlay / yield prompt | 1.3 s in 20 s | open: cache the elements, check every 0.5 s |
| 9 | roamStep one-off 294 ms (frame 125), outside the wrapped helpers | src/71_roam_drive.js chain | 1 per run | open: wrap more of the roamStep chain |
| 10 | draw calls / triangles | renderer | roam 743 calls, 4.3 M tris; race 1028-1069 calls, 4.7 M tris; 193 programs, ~1050-1150 geometries | open: distance culling / merge (perf3: the shadow pass = 137 calls + 1.2 M tris) |
| - | hubCullStep, miniDraw, roamHud, CTB_step | | avg ≤ 0.7 ms, max 16-22 ms | small |

Race (Westend Split, bot, 10 s, before): roamCam (FC_pull) p95 69 ms, hubTrafficStep max 156 ms (lazy).
Athens: GO perf/frame only (below). Lowmem streaming (98mf_memfree): no per-frame cost seen in the desktop profile (`STR_step` avg 0.08 ms, max 5.7). The lowmem probe runs did not finish within the timebox (see Next).

## GO perf/frame (src/99c7_perf.js)
Stepped frames (dt 1/30, 600 steps, road-follow at speed). It times roamStep, roamCam, drawTraffic and updWorld, and judges p95 ≤ 8 ms and max ≤ 50 ms in both cities.
First run on pf2 (with the fixes), sharing the CPU with 2 probe runs: Frankfurt median 21.4 / p95 97.8 / max 852 ms; Athens median 31.9 / p95 161.9 / max 527 ms. **RED.**
The GO starts right at drivable, while lazy zones, LF tiles and the ground pump are all building, so sources 4-9 dominate there.

## Next (follow-up lane)
1. Rerun `tools/perf1/tFrame.js` pf0 vs pf2 alone (no parallel runs) in fra/ath, desktop and `LOWMEM=1`, for clean before/after numbers.
2. Profile inside the GO window (`PROF=1`) and fix sources 5-9. Then see whether p95 ≤ 8 ms is reachable on the cloud CPU, or whether the GO needs a cloud-calibrated budget.
3. Heap +5 MB/s: find the allocators.

## Gates on built pf2 (TAG=life1,xf1,terrain,mem,rv2k2,cam/stable,perf, fra+ath in parallel)
58/73 · unit 0 FAIL · rv2k2 and cam/stable green in both cities.
- perf/frame: Frankfurt median 10.0 / p95 23.0 / max 171 ms; Athens median 20.0 / p95 100 / max 409 ms. **RED**.
- The other reds are mem/stable, the SLOW-only xf1/terr1/life1 lines, terr1/terrain-tyre-ath and terr6/terrain-slope-ath. The same names were red on trunk in crash-6/7. The trunk rerun was cut short, so a same-name comparison is still owed.
