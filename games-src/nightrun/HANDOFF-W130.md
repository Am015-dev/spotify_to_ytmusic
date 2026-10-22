# W130 handoff (22 Oct 2026): Legend pressure that needs the right answer (parts/legend.js, flag RET.legend, ?legend=0 = old)

Changes (Legend only, all behind LEG.act()):
- Laser wall = a DASH check: no gap while you hold a charge (Hard's rule; no charge = a 110 px gap). Mashing DASH empties charges (timing.js PANIC), so random play hits it.
- Curtain slot sends a GAP WALL: gap picked at warning start 120-180 px from the ship, drawn on the warning line (white bracket + "GAP"), drifts 45 px/s, wall 260 px/s.
  Why: before this, gap walls hit the oracle 57% and curtain layers 93%, the random bot just as often, so they were dice, not reading.
- CROSSFIRE: parked at x < 130 for 2 s -> column marked .6 s (dashed line + "CROSSFIRE: MOVE FORWARD"), then shots from the top and bottom edges along it.

legend-test RUNS=8, st10/20 pooled (target): human 8-25 | oracle 35-65 | noor | beat | nodash | camp <=5 | rand <=3
- run 1: 19 | 44 | 25 | 100 | 13 | 0 | 0  PASS
- run 2: 6 | 38 | 25 | 94 | 19 | 0 | 6  PASS (noise band; human and rand are outside the strict target)
- run 3: 0 | 19 | 25 | 94 | 6 | 0 | 0  FAIL (oracle)
Before (same session): human 19, oracle 6 then 50 (noise), camp 0, rand 0 then 6.
Strict 3x gate is NOT met: the oracle swings 19-44 at n=16. Oracle hits are mostly bullets, leaks ("other") and zdrn touches, not walls now.
Bot flaw (test, not changed): the oracle's wall cost ignores grid points right of the wall, so it does not really read a gap; gap walls cannot separate readers from random.
Other suites: diet PASS, explain PASS, guard ok. legible FAIL st10 bullets 2.79 / endless10 enemies 2.85 (runs on Normal, which this change does not touch; not checked on base).
NOT run: balance-test / humanbot DIFF=normal (Normal is untouched by construction: every hook checks SET.diff==='legend').
Next: raise the oracle without raising rand: e.g. LEG.EV 6 -> 7 (fewer events) or a slower Legend seeker; check with RUNS=12 because n=16 noise is about 12 points.
