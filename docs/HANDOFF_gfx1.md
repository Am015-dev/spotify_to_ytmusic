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

## Slice 3 (d3119c2, PAUSED by the coordinator 2026-10-14 for the session cap, flag still default OFF)
Done (src/98gx_gfx.js): sun ~23° (GFX_SUN [600,300,380]) 4.8, sky fill .5 #8fb4ff, exposure 1.0, deeper sky (uTop .004,.045,.40), trees/props/people > 1.2 m cast
(GFX_cast over the whole scene), car plastic roughness ≤ .24 + env 1.3, cheap contact AO (GFX_ao2: diffuse x .42→1 over the first 1.8 m above the
player's ground y, via LK's vLkW, fades 45-75 m out; no extra pass, phone too), warm grade ShaderPass before OutputPass (gain 1.06/1/.9, sat 1.18, contrast).
Checks on v90n-g21 = d3119c2: 9/9 PASS (fra high, ath high, fra med), 0 console errors; ath med not run yet (paused).
Draw calls: fra high 896 (742 before GFX), ath high 660 (545), fra med 733. Shot: docs/shots/gfx/s3_before_after.jpg (before = s19 build).
Resume: 1) run `tools/tGfx.js … ath` med; 2) LOOK at the grid; 3) flip default ON: in GFX.on use store.get('mho_gfx',1)===1 and catch→true
(coordinator asked for ON by default, phone = med tier); 4) PUSHED to int-4 (session_01QewuGcL86b169339CDxRy9); 5) later: saturation per material, AO in corners.

## Open
- Flip default on after reviewer look; perf on a real iPhone (med adds a 1024 shadow pass: +~16 % draw calls, +25 % tris at high).
- Next: cheap contact AO at facade bottoms, height fog/aerial perspective, warm grade preset, per-building variation (art-2 owns fill/props).
