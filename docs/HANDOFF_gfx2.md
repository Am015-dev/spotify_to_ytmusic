# gfx-2 handoff (lighting, alex/od-int2) — continues docs/HANDOFF_gfx1.md
GFX (src/98gx_gfx.js) is now ON by default (store 'mho_gfx' default 1; ?gfx=0 = old look).
## What changed vs slice 3
- Root cause of "subtle/flat": the fixed world sun was BACKLIT on half the headings (v90m Frankfurt start faces it): we saw only shaded faces,
  the car's shadow hid under the car, sun glare greyed the sky. GFX_sunFollow (in the roamStep wrapper) now keeps the sun ~160° from the camera
  view direction (behind, a little left), ~30° high, slewing ≤ ~.35 rad/s (faster for big errors) so shadows creep while turning. Sky sun glow (SKYU.uSunD) follows.
- Fill hemi .5 → .4 (#86acff / fra ground #4a5a4c), ground env .3 → .22: darker, cooler shadows. 24°/140° + .34 fill made Frankfurt's road one muddy shadow band.
- Shadow extents high ±42 m (2048) / med ±32 m (1024): crisper. Car plastic roughness ≤ .18, env 1.7.
- BUG fixed: GFX_flat threw on geometries whose normal arrays were freed after upload → TypeError every 2.5 s that also skipped GFX_ao/GFX_plastic.
- GFX_light places the sun relative to the shadow target (was world 0 until the next roamStep).
## Tests
- Checklist v90n/gfx-sun, gfx-shadow, gfx-plastic, NEW gfx-sunside (+ GO). tools/tGfx.js prints gfx-sunside too (`__gfx.side()` = sun vs view angle, pass ≥ 100°).
- Hot: `node tools/hot.js reboot fra 'q=high'` (new: extra query arg), then `eval '__tq.o.draw=1;1'` and wait ~10 s BEFORE shChk/shots:
  with draw=0 no frame renders, the shadow map is stale (shChk car == road ≈ .277, dark ground in shots). That cost gfx-2 one wrong grid.
- Results (hot pages, current src): fra high, ath high, fra med: sun 29.8°, ACES, hemi .4, map 2048/1024, car in map (car .18–.32 vs road 1.0),
  plastic rough .37–.38 / env .91–.94 / metal .12, sunside 158–160°, 0 console errors.
- tGfx on the built page timed out booting Athens (7 min) with 2 runs in parallel on 4 cores; run it alone (TMO env = boot timeout).
- Grid: docs/shots/gfx/s4_before_after.jpg (fra/ath before|after high + fra med).
## Open
- Draw calls not re-measured (renderer.info read 0 in the hot page); gfx-1 numbers: +~14–20 % calls with GFX on high/med.
- Real-iPhone perf of the med 1024 shadow pass is untested here (no WebKit/GPU).
- Ideas: facade-bottom AO, height fog, per-material saturation.
