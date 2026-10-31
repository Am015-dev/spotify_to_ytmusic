# W318 street pacing: a cleared street calls the next wave (street3.js), full stage from the title, TS 3, real input
Rule built: camera at its stop (camX >= bc-4) and no foe alive for >= 8 s -> the next unspent wave spawns at once; boss arrives when all 12 waves are spent and the street is clear >= 2 s (clock 145 s + 12 stays the upper bound).
First version (boss at once after 2 s clear): boss at 41-47 s, every run 0-4 hits, streetsim dodge 100%, gfirst 100% -> the street collapsed to ~45 s (gate fail), dropped. Pull-forward gaps tried in streetsim RUNS=40/80: 1 s nearest 10%, 3 s dodge 90%, 5 s dodge 28-29% (chaotic), 8 s n25 g85 d70 (chosen), 12 s not simmed.
| streetsim RUNS=40 | idle | nearest | gfirst | dodge |
|---|---|---|---|---|
| W316 build | - | 28% | 85% | 68% |
| W318 (8 s) | 0% | 25% | 85% | 70% |
## Real input (boss arrival = street clock s; before: 144.2 s every run, camera stop ~47 s)
| cell | reach / clear | boss arrival per run (s) | deaths |
|---|---|---|---|
| phone duelist (was 4/6, 4/6) | 6/6, 6/6 | 133.9 134.6 139.4 135.4 132.2 134.3 | none |
| phone late (4 seeds) | 3/4 reach, 2/4 clear | 133.1 - 138.7 136.4 | seed 1 street 130 s, seed 2 boss fight |
| PC duelist (was 5/6, 5/6) | 3/6, 3/6 | 144.2 143 - - - 144.2 | street 100, 101, 131 s |
| PC duelist, 12 s gap | 3/6, 3/6 | 141.2 143.3 134.9 | street 127, 128, 133 s |
| PC late (4 seeds) | 2/4 reach, 2/4 clear | 144.2 143.9 | street 127, 134 s |
Result: the boss comes 5-12 s earlier on phone (about 134 s), on PC mostly still at the clock. The pinned wait is gone (waves arrive as soon as the street is clear) but the boss is not much earlier, because all 12 waves still have to be fought. PC gate NOT met (3/6 vs 5/6; W316 was one run per seed, so part may be noise, not re-measured on the old build).
## Not run
Screenshots at boss arrival, streetsong-test, streetdraw-test, footvis-test, 844x390, W316 baseline rerun on PC.
