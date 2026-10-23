# W163: street balance, smooth levers (23 Oct 2026, partial)
Added in streethard.js (all behind RET.streethard): SH.POPT .6 (gunner slug announced 0.6 s, was 0.5: duck saves 2.7 -> 3.6, gate PASS),
SH.SLUGD .5 (a slug costs half a heart; the heart goes on every second slug; caption "GLANCING HIT: NO HEART LOST"), SH.BINV 1.6 (Kai invulnerable 1.6 s after a slug, engine 1.3). hp knobs untouched.
streetsim (50 runs/bot): nearest 18% -> 20%, gfirst 70% -> 78%, dodge 84% -> 86%, cover 3.3 -> 3.4, peak nearest 86.7 / gfirst 84.1 / dodge 81.6.
STILL FAIL: nearest 25-40, dodge 60-80, peak 82-88. Tried and no use: bigheavy hp (no effect), BINV > 1.6 (saturates), CALL 3.5-9 (+-6% noise, dodge rises with more calls).
Noise between configs is about +-6 points at 50 runs: use RUNS=100 to tune. Nearest dies to rusher melee, which these levers do not touch; dodge needs a lever that only bites skilled play (melee window or rusher lunge speed).
Not run: streetdraw, footvis, streetsong, focus, footlab tests, guard.py (streetdraw-test did not finish in 5 min).
