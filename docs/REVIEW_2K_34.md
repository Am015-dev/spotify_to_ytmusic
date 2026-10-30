# REVIEW_2K_34: jserr-r30f (6b8da29), the "null (reading 'byteLength')" render throw

2026-10-30 · lane review-r30-8 · built page `out/rev34` (tools/build.sh, trunk 6b8da29), phone profile (iPhone UA, 852x393 touch, dpr 2; 6x CPU for the gauntlet boot and mem/no-reload). Parent = `6b8da29^` + only the new GO (src/99c7_rev5fix.js hunk), built as `out/rev34p`.
Probes (copied to `docs/shots/rev34/`): `census.js` wraps `BufferAttribute.needsUpdate` in the page, runs GO bug/no-jserr-drive (300 s game, drifts every 9 s, zip/stream running), then lists every attribute written >= 20 times, the function that wrote it, and whether memFree manages its mesh. `driftshot.js` drives, holds a handbrake drift and takes the 852x393 shot.

## Verdicts
| # | point | verdict |
|---|---|---|
| a | 3 full gauntlets, new seeds 31/32/33, fra + ath + portrait: jsErrors 0 | **PASS**: 0 / 0 / 0, reloads 0 / 0 / 0 |
| b | other per-frame meshes on StaticDraw that memFree packs: can any throw or show garbage? | **PASS**: none found in Frankfurt or Athens (list below) |
| c | memory mem/no-reload no worse | **PASS, with a caveat**: 667 MB fix vs 650 MB parent (both <= 700, textures +1 MB on both); the worker's 653 -> 646 MB gain was not reproduced. See §c |
| d | drift trail on a long drift looks right | **PASS** (shot) |
| e | the new GO fails on the parent | **PASS**: FAIL fra + FAIL ath on the parent, PASS fra + PASS ath on the fix |
| gate | build, unit, TAG=life1,xf1,terrain gate fra+ath | build OK · unit 0 FAIL (5232 pass, 13 known) · gate PHONE=1 TAG=life1,xf1,terrain fra+ath **PASS 42/42**, errors 0 |

**Overall: PASS. The fix is correct and can deploy.** Two small slips in `tools/gauntlet.js` go back to the worker (§f). Neither hides a real error. One of them can crash the gauntlet before it prints its verdict rows.

## a. Gauntlet, built page, 3 new seeds (labels rev34-s31/32/33, `docs/shots/gauntlet/rev34-s3*/REPORT.md`)
| seed | page/jsErrors | page/reload | ath/boot | ath/race | portrait/boot | heap high-water |
|---|---|---|---|---|---|---|
| 31 | **0** | 0 | PASS | grid reached | PASS | 497 MB |
| 32 | **0** | 0 | PASS | grid reached | PASS | 441 MB |
| 33 | **0** | 0 | PASS | grid reached | PASS | 441 MB |
The three ran in parallel on 4 cores, so boot/toControl (150-166 s lab) is contention and not a measurement. The other FAIL rows (drive/near, hit/contact, drift/*, wall/*, mission/reach, steer, race/rollBoth s32) are the bot's "not set up (script)" and traffic-density rows. The worker's own jserr-r30f-s12 run has the same set. They predate this commit and do not touch the jsErrors row.
Also: 3 more 300 s GO drives under census, 0 render throws, 0 uncaught errors (fra x2, ath x1).

## b. Per-frame geometry writers vs memFree (runtime census, 300 s mixed drive with drifts, fra 10.3 km, ath 7.6 km)
memFree's sweep only hooks `isMesh && !isInstancedMesh && !isSkinnedMesh`, skips the car group (`RO.grp`), any subtree with `keep`/`gb` and any mesh with a skip flag (`trG gk simp lf keep P bmk cd dr gb sim ramp lz sky nr`), and now any mesh with a non-static attribute (MEMF_dyn). Every attribute written >= 20 times during the drive, by owner:
| writer | object | usage | memFree | can throw / garbage? |
|---|---|---|---|---|
| B2K_trail (drift trail) | Mesh < Scene | **Dynamic** (fixed) | not managed (MEMF_dyn) | no |
| studSync (139 meshes), PC_mesh, OG_draw | Mesh under the car (`RO.grp`) | static / dyn | never walked | no |
| LIFE_bm (BatchedMesh bm_s / bm_m) | Mesh {keep,bmk} | static | seen, skipped by flag | no |
| DMG_panels (traffic car panels, ath) | Mesh {gb} | static | subtree skipped | no |
| updPool / updWorld / rain / speed lines / sfJet | Points, LineSegments | static | not a Mesh, never hooked | no |
| HT_flush, AS_step, AS_far, CTB_step, PC_mesh, PC_cap, LIFE_draw, LV_*, CV_post, CV_lamps, FL_headlights, pedStep, drawTraffic, updDebris, updStreaks, DMG_debStep, HC_step | InstancedMesh: **instanceMatrix / instanceColor** only | static or dyn | MEMF_ipack packs the BASE geometry (normal/colour) once | no: the instance buffers are not in `geometry.attributes` and memFree never touches them; no owner rewrites a base geometry |
No non-instanced Mesh managed by memFree (MEMF.S / MEMF.G / mfDone) was written during the drive in either city, and no written attribute had been detached by a MEMF_q repack (0 orphans once instance buffers are counted). So the worker's handoff item 4 ("other per-frame meshes with StaticDraw would be colour-packed") names no real mesh today. It is a rule for new code, and the wiki line in render-and-perf.md covers it.
Seen once: fra census run 1 logged `zips 792 (1 dropped: written meanwhile)` with 0 managed meshes rewritten by the end. The new zip guard caught an array or version change mid-deflate and kept the raw arrays, which is the safe outcome. The source was not identified (candidates: a geometry sharing attributes with another, as WB_split pieces do). Runs 2 and 3 dropped 0.
Not covered: race mode and the garage. Static check: the race pools (pointPool, spritePool, linePool), rain and speed lines are Points / LineSegments, and drawTraffic / updDebris / updStreaks are instanced, so the same answer holds.

## c. Memory, mem/no-reload (Frankfurt-only GO), PHONE=1 THROTTLE=6, one run each
| build | heap+GPU high-water | GPU textures 60 s -> end | car envs built | reloads |
|---|---|---|---|---|
| fix (rev34) | 667 MB | 78 -> 79 MB | 39 | 0 |
| parent (rev34p) | 650 MB | 78 -> 79 MB | 38 | 0 |
Both PASS (<= 700 MB). The +17 MB is one sample each with one more car env built. The change only affects a 256-vertex mesh (about 6 KB of arrays), so it cannot cause 17 MB either way. The worker's 653 -> 646 MB "gain" is the same kind of noise. Report it as "no memory effect", not as a saving. Athens has no mem/no-reload variant.

## d. Drift trail, long drift (`docs/shots/rev34/drift_fra_mid.jpg`, `drift_fra_end.jpg`)
Frankfurt, 25 s drive then a held handbrake drift with left steer (1.5 s + 2 s): two smooth pink ribbons come off the rear tyres and follow the slide. The colour is not banded, so it was not quantised. 82-86 trail points, position/colour are Float32 DynamicDraw, not managed by memFree, 0 page errors. A first attempt after a 150 s drive put the car in the Main because my probe's street follower is crude, so that shot was discarded. The trail after long distances is covered by the GO: 10.3 km and 7.6 km, trail not managed.

## e. GO bug/no-jserr-drive on the parent (6b8da29^ + the GO only)
- fra: **FAIL**: `1 memFree-managed meshes rewritten during the drive (trail managed on1 dr0 cz0 568 m from its pack centre)`.
- ath (census.js, GO variant 1): **FAIL**: `trail managed on0 ... 3539 m from its pack centre`. The trail had been streamed OFF (invisible), which is the second symptom from the handoff.
- fix: PASS fra (twice) + PASS ath. The GO checks the cause directly (a managed dynamic mesh), so it fails reliably even in runs where the throw itself does not happen.

## f. Back to the worker (small, tools only; not deploy-blocking)
1. `tools/gauntlet.js:373`: the new comment `// jserr-r30f: every frame throw counts (was the last one only)` was put in front of `if(ge[1])console.log('WARN sampler: '+ge[1]);` on the same line, so that statement is now commented out and sampler errors (`__GH.serr`) are silently dropped. Move the comment to the end of the line.
2. `tools/gauntlet.js:391` (portrait catch): `if(Q)await trapDump(Q);await Q.ctx.close().catch(()=>{})`. The `if` now guards only `trapDump`, so when the portrait boot throws (Q null) the catch throws `TypeError (reading 'ctx')`. That crashes the gauntlet before page/reload and page/jsErrors are written, and the deploy gate then has no verdict rows. Fix: `if(Q){await trapDump(Q);await Q.ctx.close().catch(()=>{})}`.
3. Cosmetic: `errN` repeats the LAST frame-throw message N times. The count is right but the messages can be wrong when two different errors throw. Keep a small list instead.

## Method notes
- unit: `node tools/unit/run.js`: 0 FAIL (lint_tracks / logic_core SKIP: three not installed in node_modules, as before).
- All probes run on the built page with `?test=<city>&draw=0`. census.js evaluates through the page's own `__oc.ev` (module scope).
