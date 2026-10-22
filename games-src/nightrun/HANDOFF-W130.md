# W130 handoff (22 Oct 2026): Legend pressure that needs the right answer (parts/legend.js, flag RET.legend, ?legend=0 = old Legend)

Changes (Legend only, every hook checks LEG.act(): Normal/Hard untouched by construction):
- LASER WALL = a DASH check: no gap while you hold a charge. With no charge the gap opens LEG.GOFF (120-180) px AWAY from the ship (old: near it), so mashing
  DASH (timing.js PANIC empties the charges) leaves you reading a far gap. A wall hit costs LEG.WD = 2 hull (hurt(2), the shell's heavy hit).
- The curtain slot sends a GAP WALL: gap chosen at warning start, 120-180 px from the ship, drawn on the warning line (white bracket + "GAP"), drifts 45 px/s, wall 260 px/s.
  Why: before, gap walls hit the oracle 57% and curtain layers 93%, the random bot just as often, so they were dice rolls, not reading.
- CROSSFIRE: parked at x < 130 for 2 s -> column marked .6 s (dashed warm line + "CROSSFIRE: MOVE FORWARD"), then a shot from the top and one from the bottom edge.
- Leak penalty on Legend: 1 hull per 3 leaks (LEAK.grp.legend 2 -> 3).
- Tried and dropped (measured, n=48 per bot): +1 hull (random 8%), leaks 1 per 4 (random 8%), fire rate 5.0 (random 13%), a third seeker (human 2%), events every 5 bars (no gain), boss-fight walls (stages 10/20 have no boss: they clear at ~92 s).

Final legend-test, RUNS=8, st10/20 pooled (strict target): human 8-25 | oracle 35-65 | noor | beat | nodash | camp <=5 | rand <=3 | test verdict
- run 1: 19 | 25 | 19 | 94 | 6 | 0 | 0 | PASS
- run 2: 19 | 38 | 13 | 94 | 6 | 0 | 0 | PASS
- run 3: 0 | 31 | 25 | 100 | 6 | 0 | 0 | PASS
Before (orchestrator): human 0-19, oracle 19-38, camp 0-6, random 13-19.
Strict gate: random, camper and beat >= oracle hold in all 3; the oracle is under 35 in 2 of 3 runs and human 0 once. At n=16 one run swings ~12 points
(the same build gave the oracle 19-53 across samples). Pooled n=48 samples of this build: oracle 31-44, human 13, random 0-4, camp 0-2.
Bot flaw (test, not changed): the oracle's wall cost ignores grid points right of the wall, so it barely reads a gap; gap walls cannot separate readers from random.
Other suites: diet PASS, explain PASS, guard ok, legible 2 FAILS (st10 bullets 2.79, endless10 enemies 2.85): it runs on Normal, which this change does not touch; not checked on base.
NOT run: balance-test / humanbot DIFF=normal (Normal untouched by construction).
Next: lift the oracle on stage 20 (13-38%) without lifting random: every general easing tried (hull, leaks, fire rate) lifted random first. Look at the oracle's stage-20 deaths
(bullets and zdrn touches) for a threat a reader dodges and random play does not; measure with RUNS=24 (n=48), not 8.
