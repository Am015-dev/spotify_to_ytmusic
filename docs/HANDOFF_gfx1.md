# gfx-1 handoff (lighting/rendering, alex/od-int2)
Module: `src/98gx_gfx.js` (GFX_*), in src/ORDER before 99_api.js. Flag: `GFX.on` = `?gfx=1|0`, else localStorage `mho_gfx` (default off until approved).
Probe: `window.__gfx.state()`, `__gfx.shChk()` (shadow-map depth: car roof vs open road), `__gfx.set(on)`.

## Root causes of the flat look (measured v90n, Frankfurt high)
- NeutralToneMapping, exposure 1.0; white hemisphere fill .85 lit shade almost as bright as sun; sun 54° high; env .35, roughness ~.5.
- Sun shadow map only on high; med (phone) had none.
- Player car never cast: ART6_noCast (97_art.js) locks `castShadow` with a getter returning false.
- Merged city blocks (95_drive_flow DR_, 98wb world batch) built with castShadow=false.
- 98_garage_driver forces `bloom.threshold=1` before every roam render.
- Frankfurt ground plates cast shadows and carry kerbs: "casts" or a flat bbox does not identify ground; up-facing normals (>= 70 %) does.

## What GFX does by day (GFX_light after ART_light; GFX_frame every 2.5 s wall clock)
ACES 1.06 · sun #ffe1b4 4.3 at ~33° (GFX_SUN, written into MOOD.key[2] so 71_roam_drive keeps the shadow cam on it) · hemi #a9c8ff/#4f6a38 .68 ·
scene env .3 (ground) + plastic gets its own envMap at 1.25 · plastic roughness ~.39 · ground roughness .88 + 15 % direct specular (onBeforeCompile, uniform GFX.U) ·
bloom .16 / threshold 2.2 (property override) · deeper sky uniforms · shadows high 2048 PCFSoft ±55 m, med 1024 PCF ±40 m · tall merged blocks cast.
Night / FL night: back to Neutral, spec 1.

## Tests
`node tools/tGfx.js <url of out/<ver>/index.html> <outdir> high|med gfx=1` → PASS/FAIL lines for checklist v90n/gfx-sun, gfx-shadow, gfx-plastic per city,
`info` = draw calls/tris of one composer frame, one 852×393 shot per city. Boots `?test=<city>&q=<tier>&draw=0` (q param added to 98tq).
Swiftshader only here: ~4 s/frame, Athens high boot up to ~5 min; never run more than 2 in parallel (timeouts). Frame time is not measurable in this container.

## Results (4485d0a, tools/tGfx.js)
12/12 PASS (gfx-sun/shadow/plastic × fra/ath × high/med), 0 console errors. Shots: docs/shots/gfx/s2_before_after.jpg, s2_fra.jpg, s2_ath.jpg.
Perf (draw calls/frame, gfx=0 → 1): high fra 742→843, high ath 545→624, med ath 447→536 (+0.4 M shadow tris). GTAO (?ao=1) +~720 calls: opt-in only.
Stock addons: RoomEnvironment+PMREM, GTAOPass (three 0.164.1). CSM/Sky not used: CSM needs setupMaterial on every material (collides with LK_inject), mood sky shader drives env.

## Open
- Flip default on after reviewer look; perf on a real iPhone (med adds a 1024 shadow pass: +~16 % draw calls, +25 % tris at high).
- Next: cheap contact AO at facade bottoms, height fog/aerial perspective, warm grade preset, per-building variation (art-2 owns fill/props).
