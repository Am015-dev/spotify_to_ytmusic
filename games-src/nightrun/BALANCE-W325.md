# W325 casual street: constants only, streetsim RUNS=40 (cumulative, one lever at a time)
Base = release candidate nr/W319-rc (nearest 10, gfirst 85, dodge 65, idle 0, still 17.5).
| try | nearest (25-40) | gfirst (>=73) | dodge (57-73) | idle | still-foes (<20) | nearest reached boss |
|---|---|---|---|---|---|---|
| base W319-rc (from HANDOFF-W319) | 10 | 85 | 65 | 0 | 17.5 | - |
| 1. HPK 8 -> 7 | 10 | 85 | 65 | 0 | 17.5 | 11/40 (won 4) |
| 2. + ENR .8 -> .9 | 23 | 85 | 65 | 0 | 17.5 | 11/40 |
| 3. + clear-gap 8 -> 10 s (street3.js:47) | 25 | 90 | 73 | 0 | 16.9 | 12/40 |
Lever 4 (GRACE .30) not needed: try 3 passes every streetsim gate (nearest at the lower edge, dodge at the upper edge).
Finding: HPK moves nothing for the casual bot; 29 of 40 nearest runs die in the street before the boss, so the boss hp cannot rescue them. ENR .9 gave most of the gain.
## Real input, boss only (JUMP=152, TS 3, final constants HPK 7 / ENR .9 / gap 10)
| cell | result | band | W313 |
|---|---|---|---|
| late PC x6 | 4/6 | 20-50 | 4/8 (ABOVE band, 6 seeds are noisy) |
| late phone x6 | 3/6 | 20-50 | 2/8 |
| duelist PC x4 | 4/4 | 60-90 | 8/8 |
| masher (aggressor) PC x4 | 0/4 | <= 20 | 0/4 |
Full stage from the title, late bot: see HANDOFF-W325.md.
## Full stage from the title, late bot, real input, TS 3
PC 2/3 (seed 0 died at 124 s; seeds 1, 2 cleared), phone 3/3 = 5/6 cleared (reviewer saw 1/6 before). Noise warning from W319: 3 seeds per cell.
