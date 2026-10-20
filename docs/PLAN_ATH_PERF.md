# Plan: Athens boot, reveal freeze and heap churn (athperf-r21n, 2026-10-20)
Pass 1 shipped (6d27980): desktop boot no longer renders the start view twice for a stat (Athens lab boot 98 -> 64 s hot, 137 -> 77 s built PC-like). This plan is pass 2's measurement; it is the 2nd lane on this target, so the next steps are split into small lanes below.

## Measured (lab, built page athC, same box; this box is ~4-6x slower than Alex's PC)
| What | Number | Tool |
|---|---|---|
| Athens HUB.bld rows vs Frankfurt | 75,199 vs 7,386 (10x) | hot eval |
| buildHubG children, Athens | athBuildG 8.5 s, buildHubPropsG 5.5, gndGen 5.2, TR_bldFixG 3.7, BH_drainG 2.4, life3 2.2 | `CHILD=buildHubG node tools/bootprof.js ath` |
| Reveal window, PC-like test page (3 s) | 36 program links after reveal (1.47 s), LKG_step 863 ms, GC 571 ms, WB_cityBuild2 201 ms; frames 561 / 517 / 766 ms | `CITY=ath CPU=1 PROF=45 node tools/perf1/tPcReveal.js out <ver>` |
| First 40 drive frames, test page (JS, render stubbed) | 10-51 ms, no 300 ms frame | `FIRST=1 TICKS=60 node tools/athdrive.js out <ver> ath` |
| Allocation while driving, Athens | 1.55-1.63 GB in 30 s (~54 MB/s) = the 509 -> 945 MB heap swings | `HEAP=30 HEAPP=next,hypot node tools/athdrive.js out <ver> ath` |
| Top allocators (MB / 30 s) | iterator `next` 180 (for..of in CV_pre, PC_step, QS_rampEdges, studSync, RD_unstack, CV_post, addR, LIFE_draw/fill, lazyStep, AS_step), roamTerr 93, Math.hypot 74 (CTB_step 19, roamStuds 7, PC_sph 5), roamHit 62, LIFE_draw 53, cityAt 49, RD_cityNear 45, CV_pre 43, CTB_step 37, pedStep 31 | same |
| Real player path (menu -> PLAY) | lab never reaches roam (software GL); Alex's 335 ms first-frame `sim` cannot be reproduced here | — |

## Lanes (each one deliverable, flag default OFF until its GO passes)
1. **reveal-links (Sonnet):** desktop LKG still links 36 programs after the curtain lifts in Athens. Hold ldHide until LKG.q is empty, or prewarm them in the gate (they are the city chunk materials WB_cityBuild2 makes after reveal). GO: perf/ath-budget gets "programs linked in the 5 s after reveal <= 2" and "no gap > 250 ms x lab factor in the 5 s after reveal" (tPcReveal numbers).
2. **first-frame sim (Sonnet, needs Beta data):** add PB.fs sub-sections inside `sim` (roamStep, hubTrafficStep, LIFE, PC_step, A2/AD/LV steps) to the freeze doc, deploy, read Alex's next freeze doc, then move the named first-tick init under the curtain (TWG warm frames). Without the sub-sections it is guesswork.
3. **alloc-churn A (Sonnet):** for..of -> indexed loops and Math.hypot -> sqrt in the per-frame paths listed above (CTB_step, CV_pre/CV_post, PC_step/PC_sph, studSync/roamStuds, RD_unstack, LIFE_draw/fill, lazyStep, AS_step, LV_edges0, QS_rampEdges); roamTerr callers that read `.g`/`.low` at once pass a scratch object (71_roam_drive, 98tr_terrain, 85_audio). Target: < 600 MB / 30 s with the same HEAP command; unit + bot unchanged.
4. **TR_bldFixG (Sonnet):** the per-vertex `find()` over every HUB.grp mesh (3.7 s lab). Cache the cell list across vertices of one mesh (vertices are spatially coherent) and skip meshes whose bounding box hits no bucket; assert trY/trBase of every HUB.bld row is bit-identical (hash) before/after.
5. **Athens build streaming (Opus, plan first):** athBuildG + props + gndGen = 19 s lab. Build the 400 m ring around the spawn before reveal and the rest in 4 ms BH_drain slices after; colliders (HUB.bld rows) must stay registered for the whole city at reveal (collide-r21i), so only meshes stream. gndGen: check determinism (seeded) and cache its arrays in the build output if the hash matches across 3 boots.
