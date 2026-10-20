# HANDOFF sfx-r21c
1. src/99c8_sfxhit.js: AU.sfx limiter (1 trigger per cue per 70 ms, pickup chain +1 semitone up to +12, reset after 0.6 s; pitch variation kept; 'pick' reads SFXL.st).
2. src/10_core3.js CR_smashHit: >= 80 km/h = 70 ms time dip (dt x0.15, never a freeze) + shake .45-.55 + fovKick >= 6; < 40 km/h = shake <= .15 only. JU full freeze now uses the same dip (HIT_dt in the 72 loop and JU_step1).
3. GO feel/sfx + feel/hit (state asserts) and tools/unit/logic_sfx.js (limiter + chain).
4. Gate (built page, Frankfurt): unit 0 FAIL; TAG=feel/sfx,feel/hit,life1,xf1,terrain 24/25, 0 errors. Only xf1/grass fails (SLOW 11.8 s and a tyre-float check; terrain/audio-unrelated, same SLOW seen on this box before). Athens not run. logic_core/lint_tracks skipped here (three.js not installed).
5. Left: coordinator adds the OD_CHANGELOG entry at deploy; feel on a real phone (70 ms dip at 30 fps = 2 frames) is untested.
