# HANDOFF debris-2 (2026-10-17)
1. Cause: the floating green/black chunks in rev75 were smash debris (props/traffic/wreck), not transform bricks: debris() let callers pass size up to 3, life 2.4-4 s, launch up to 26 m/s, floor at the prop height. Close to a portrait camera they read as house-size blocks.
2. Fix (src/30_race.js debris()): size capped (pieces <= ~0.9 m), life 1-1.5 s with 0.5 s shrink-fade, launch speed clamped to 22, floor never above the spawn point. xfBurst untouched.
3. GO debris1/float extended (checklist): 40-piece smash burst: largest <= 1.5 m, 0 alive/0 above 3 m after 2 s: PASS fra+ath. Shots docs/shots/debris2/{before,after}.png (same forced burst, portrait): chunks fill the screen before, small cluster after.
4. Gate (built page): unit 0 FAIL; TAG=debris1,xf1,rv2k2/burst,tk1,life1: 18/21, only SLOW-time fails (xf1/grass 20 s load, dt 0.52 s; life1 ath-density/people).
5. Left: xf1/grass gap -0.23 m NOT reproduced (0.02 m now, 2.39 m ground step), cause unknown; tools/tDebris2Shot.js added.
