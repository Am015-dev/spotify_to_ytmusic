# HANDOFF W308 (GOLD decision gate): NOT MET, nothing deployed, no game change
- done: SEEDBASE env in humanbot.js (different seed bases for the gate); 20+ gate runs at RUNS=16 on the 4-core container (about 2 min each); full table in BALANCE-W308.md.
- numbers: W303 base CHOOSE 48-58 vs HOLD 56-63, PUSH 54-56. Best no-heal config CHOOSE 58-60 vs HOLD 56-71 (flips with seed). Heal configs: CHOOSE 65-88 but PUSH 58-92 (gap >= 15 held in 1 of 8 runs).
- wrong: gate not 6/6 twice in a row; not found by constants alone. HOLD swings 56-71% on identical code (+-10), so any single run misleads (that is why W299 saw 6/6).
- next: tried nothing from BALANCE-W308.md section 3 (a)-(d); (b) is the most promising: heal only when DASH/EMP was ready at the kill, so the reckless bot cannot farm it. Judge each change with SEEDBASE 0/100/200 and pooled clear, not one run.
- NOT run: gauntlet-flight dodger/shooter (game unchanged from W303, so the W305 8/8 baseline stands), flow-test 91/0, claims-check 17/0.
- files: games-src/nightrun/BALANCE-W308.md, HANDOFF-W308.md, humanbot.js, qa/push-gate.js.
