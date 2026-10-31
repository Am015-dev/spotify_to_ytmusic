# REVIEW_2K_42: mem-r30q-final (e9c97a1) into trunk: **FAIL** (2 new reds from one checklist line; the memory patch itself is good)
Context, Alex: "The game refreshed 5 times in 5 minutes" (iPhone tab kills). Built pages: out/rev42b (branch) and out/rev42t (trunk 18d181e), phone profile (iPhone UA, 852x393 touch; memp at 6x CPU).

1. Diff risk read:
   - GL_free / GL_rp: re-points every scene material plus the player mesh that still holds the freed env and copies envMapRotation. It no longer adds clones to GL.mats (why/glossy fix). Cost is one scene.traverse per free, and frees are now about 1 per 5 min. OK.
   - Env key without azimuth plus envMapRotation (GL_rot on every roamStep): the sign is right for three r164 (WebGLMaterials negates the euler for PMREM/cubeUV, so y = -atan2(dz,dx) maps the light onto the env's +X sun). Players and traffic (HUB.cim) are in GL.mats and get rotated. Cloned paint gets the rotation only when re-pointed, so it can lag a heading change. The probe found 0 stale materials, but the sun did not swing in this harness (see SEEN.md).
   - maxTextureSize = 512 (lowmem): three reads it at upload (resizeImage, morph textures adapt). WebGLShadowMap caches _maxTextureSize at renderer creation, before the override, so shadow maps keep their 1024/2048. OK.
   - Half-size canvas textures (LTEX, >= 256 px): the needsUpdate setter redraws the half copy (one CPU drawImage per update on phones; no perf gate regression seen). ENV_free frees the PMREM render target (real leak fix). MEMF_hpk packs hidden meshes' normal to Int8 and colour to Uint8, keeping position and index for raycasts. OK.
2. Gates (branch): unit 0 FAIL (5372 pass, with three installed). TAG=why and `TAG=life1,xf1,terrain` via the default gate: 77/78. The one red, fra why/solid-cars (a traffic car jumped 14142 km in RD_unstack), passed 2/2 on rerun on both branch and trunk: a flake unrelated to this lane (traffic code is untouched).
3. TAG=mem, branch vs trunk (same box, phone profile):
   | GO | trunk | branch |
   |---|---|---|
   | fra mem/stable | ❌ 561→673 MB (20 %) | ❌ 546→629 MB (15 %), lower |
   | fra mem/no-reload | ❌ high-water 769 > 700 | ✅ |
   | fra perf/mem-quant, perf/mem-own | ❌ ❌ | ❌ ❌ (same) |
   | ath mem/ath-boot | ❌ 1312 > 913 | ❌ 1146 > 913, lower |
   | ath perf/mem-quant#1 | ❌ | ❌ |
   | **ath mem/no-reload#1** (new GO, added by this branch in 99c_checklist.js) | not run | ❌ 729 > 700 |
   | **ath perf/mem-own#1** | ✅ | ❌ "unused left 4": the new ath no-reload GO runs first and leaves 4 car forms; alone it passes 1/1 |
4. memp (branch, 6x CPU, peak heap+GPU MB): fra 565 / 554, ath 684 / 697 (worker's trunk: fra 631-661, ath 727-784). Env rebuilds per 5 min: 1 (keys fixed). 0 materials on a freed env. Memory only goes down.
5. Shots (docs/shots/rev42, SEEN.md): fra and ath START plus close-ups, branch vs trunk: no flipped reflections, no visible blur.

FAIL items (rule 15, no new reds):
1. src/99c_checklist.js: the new ath entry of mem/no-reload is red (729 > 700 in TAG=mem; memp 684/697, so it sits at the cap and is flaky). Revert that line (no-reload on fra only, as on trunk) or land it only once ath is reliably under 700.
2. The same entry turns ath perf/mem-own red when TAG=mem runs (4 car forms left unused after 5 min of play). Fixed by item 1. If the ath entry comes back later, re-run CRVC_drop before counting in mem-own.
With item 1 done, the branch's reds are a strict subset of trunk's and every shared one is lower. Re-review is the TAG=mem run only.
