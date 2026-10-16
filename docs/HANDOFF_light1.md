# HANDOFF light-1 (2026-10-16): beta.40 brightness back
1. src/98gx_gfx.js: sun snaps behind the view when it is > gfxSnap (1 rad) off (spawn/cut/U-turn), else it slews at ≥ .8 rad/s. Measured side angle at the Athens start: 69° (beta.63, backlit) → 160°. Fill: hemi .4 → .8 with a warmer, brighter ground bounce; sun 4.8 → 4.2; env .22 → .3; sun 30° → 34° (shorter wedges).
2. All values are TUNE knobs (gfxHemi/gfxSun/gfxEnv/gfxEl/gfxAz/gfxSlew/gfxSnap) with a "Light" tab in the TUNE drawer; the checklist/tGfx fill limit is now ≤ .9. No new passes.
3. Median luminance (852×393, built page, q=high) beta.40 | beta.63 | light-1: fra 82 | 85 | 90, ath 102 | 77 | 94 (the beta.40 ath tile is cropped from the gfx-rev grid JPEG; that boot timed out here). Grid: docs/shots/light1/grid.jpg.
4. Gates: unit 0 FAIL; TAG=life1,xf1,terrain 35/36. life1/ath-density is SLOW (>10 s) and life1/people (juggler, 10 s timeout) is flaky. Both also fail on beta.63 in the same swiftshader runs.
5. Left: Athens is a bit under beta.40 (94 vs 102); raise TUNE.gfxHemi to .9 if Alex wants it brighter. Hard shadow edges still come from PCFSoft at ±42 m.
