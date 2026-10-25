# REVIEW_2K_24: reload-r25d (2026-10-25)
Reviewer lane rev-reload-r25d. Commit 15aad944 (handoff docs/HANDOFF_reload-r25d.md). Alex (25 Oct, iPhone): "The game refreshed 5 times in 5 minutes while I was playing".
Built pages (tools/build.sh), phone profile (iPhone UA, 852x393 touch, DPR 3), 6x CPU, local http server. Builds: trunk 15aad944 (`rev24`), unfixed baseline = 15aad944 with src/98gc_glossy.js reverted (`unf`), hotfix = 15aad944 cherry-picked onto 42e084c4 (`hf163`).
Measuring script: docs/shots/rev24/memrev.js.txt. It runs MEM1_go('no-reload') through `__xc.ev` in both cities and, after the run, scans every scene material for an envMap that GL_free has freed.

## Verdict: FAIL. Send back to the same worker for two small fixes (about 30 min).
The leak fix is correct and large. Textures stay flat in both cities: Athens was +161 MB and is now -2 MB, and its high-water fell from 1118 to 771 MB. The paint on the player car looks the same after 3 min of driving.
Two things block a PASS:
1. **A material still points at a freed env.** GL_free re-points only the materials in `GL.mats`. In every run, 1 MeshPhysicalMaterial (3 meshes, one of them an InstancedMesh) was still left pointing at a freed env in both cities. It belongs to an LDraw car group (userData `keep/pcN/pcV/ldsN`, clearcoat 0.8, envMapIntensity 0.6). It is a clone of a paint material that GL_set had already set up, so it is in neither GL.mats, HUB.cim nor pl.mesh. In three r164 that sampler then reads a deleted texture, so the car shows black reflections, not garbage, and nothing crashes. Fix: in GL_free, also traverse `scene` and re-point any `m.envMap===t` to GL.tex (about 45 frees in 5 min, so this is cheap), or register clones.
2. **mem/no-reload is red in Athens.** The GO is registered for fra only (`k<'b'?'ath':'fra'`). Run in Athens, it fails only on the high-water (771 MB > 700). Fix: add an ath variant with its own measured cap, or lower Athens memory. Rule 15 forbids a GO that only passes because it skips a city.

## Checks
| check | result |
|---|---|
| Diff vs three r164 source | Correct. `texture.dispose()` on a render-target texture returns early (`__webglInit` is undefined), so the old code leaked. `rt.dispose()` → `deallocateRenderTarget` deletes the framebuffer AND the attached texture (`info.memory.textures--`), so it really frees GPU memory. The eviction loop never frees the new env (`t0===t` skip). Deleting from a Map while iterating it is safe. The inner `t0` shadows the timer `t0` only inside the loop, so `GL.ms` is still right. |
| Unit | 5598 asserts, 0 FAIL (three@0.164.1 installed). |
| TAG=life1,xf1,terrain PHONE=1, built | 42/42 PASS (fra + ath). |
| mem/no-reload fra, 6x | `page reloads 0 · GPU textures at 60 s 78 → end 79 MB (+1 ≤ 40) · heap + GPU high-water 648 MB ≤ 700 · car envs 4 cached / 45 built ✅` |
| mem/no-reload ath, 6x | `page reloads 0 · GPU textures at 60 s 82 → end 80 MB (+-2 ≤ 40) · heap + GPU high-water 771 MB ≤ 700 · car envs 4 cached / 48 built ❌` |
| unfixed ath, 6x (baseline) | `GPU textures 136 → 297 MB (+161) · high-water 1118 MB ❌` |
| perf/ios-reveal (+ -ath), PHONE=1 | FAIL in both cities. The unfixed baseline fails the same way, so this lane did not cause it: fra has 9 frames, 4 program links and a 309 ms median gap on this build vs 322 ms unfixed; ath 458 vs 295 ms (the two cities ran in parallel on 4 cores). This red was already there and is a rule-15 item for the coordinator. |
| race/racefree | Not in this lane's tags and not run here. It is the known red from racemode-r25a (REVIEW_2K_23), and another worker owns it. |

## Shot (852x393, phone UA): docs/shots/rev24/
`fra_fresh.jpg` (3 envs built) vs `fra_after3min.jpg` (57 envs built, about 50 freed, same start pose). I looked at both. The red player car's paint, clearcoat highlights and spoiler look the same, with no black or garbage paint. All 26 player paint materials point at the live env. The one stale material from item 1 belongs to a car 941 m off-screen, so it does not show in this shot.

## Rebuild stutter (point 4)
The env is still rebuilt about 40-48 times in 5 min, and each rebuild runs on a 500 ms timer (ART10_cars → GL_apply). Main-thread time per rebuild at 6x: fra median 6.8 ms, max 22.6 ms; ath median 7.9 ms, max 37.1 ms. With a GPU sync forced (readPixels, software GL), the worst was 17 ms in ath. In the hotfix build that ran in parallel it was 58 ms (CPU contention). **At the 6x gate the worst rebuild is a 23-37 ms block, i.e. 1-2 dropped frames about every 6-7 s while steering. That is a mild hitch, not a freeze. On a real iPhone it should be about 6x shorter (~4-6 ms CPU plus a small PMREM GPU pass), so it is probably invisible.**
Root cause of the churn, found with a light probe: shadows are off on the phone, so `moonL.target` stays at (0,0,0), and **GFX_sunFollow (98gx_gfx.js:118) turns the key light with the view heading**. As a result, `GL_key`'s direction, quantised with `round(v*3)`, changes whenever the car turns about 20-40°. The keys cycle like `1,2,-2 → -1,2,-2 → -2,2,-2 → -2,2,0 → ...`. Suggested follow-up, separate from this fix: leave the azimuth out of the key and keep only the elevation (the sun follows the camera on purpose). Also, GL_env still places its sun sphere at `moonL.position.normalize()`, not at the light direction. With shadows on, that puts the env sun in the wrong place. This was already there.

## Hotfix path (point 5)
`git merge-tree --merge-base 15aad944^ 42e084c4 15aad944` shows it applies cleanly: the 3 src files it touches are identical in 42e084c4 and 15aad944^. Built as `hf163`, mem/no-reload fra at 6x: `page reloads 0 · GPU textures 78 → 78 MB (+0) · high-water 634 MB ≤ 700 ✅`. It has the same stale material as trunk (3 meshes). Nothing was pushed for this.
Reviewer note: the leak fix alone is a clear win, and the stale-env effect is cosmetic (a few cloned paint materials lose their reflections). If the coordinator needs a reload hotfix before the rework lands, 15aad944 is safe to ship, but the GO stays red in Athens until item 2 is done.
