# W309 street boss duel part 4: late window set once (branch nr/W309-duel4 from nr/W304-duel3). Code: parts/street/streetboss.js tuning block.
Final constants: GRACE .28 (was .18), TGRACE .09 (was .02), HPK 8 (was 6, boss hp 288), ENR .8 / ENRAT .5 (new: at half hp every telegraph is 0.8x as long, the commit CUT stays, so the read part shrinks to .36 / .45 / .6 s). PUN, REC, damage unchanged.
Late bot now has a latency spread: 600 +-150 ms per answer (uniform, seeded by the run seed). sbL keeps the first-answer time.
Measured with boss-only JUMP=152, real input, 8 seeds, boss cleared n/8 (die = died or ran out of time):
| cell (band) | .18/.02 HPK 6 (W304, 2-6 seeds) | .18/.02 ENR .8 HPK 10 | .24/.02 ENR .85 HPK 10 | .28/.02 ENR .78 HPK 10 | FINAL .28/.09 ENR .8 HPK 8 |
|---|---|---|---|---|---|
| PC late (20-50%) | 3/6 | 0/8 | 1/8 | 3/8 | 4/8 (50%, top edge) |
| phone late (20-50%) | 5/6 | 0/8 | 0/8 | 0/8 | 2/8 (25%) |
| 844x390 late (20-50%) | not run | not run | not run | not run | NOT RUN (a .28/.09 HPK 10 run was stopped at 3 seeds: 0/3) |
| PC duelist (60-90%) | 2/2 | 6/8, 1-4 hearts lost | 7/8, mostly 0 hearts | 8/8, 0-2 hearts | 7/8 (88%), 0-1 hearts in the 7 clears |
| phone duelist (60-90%) | 4/4 | 4/6 | not run | not run | stopped at 2/4 with .28/.09 HPK 10; FINAL NOT RUN |
| 844x390 duelist | 4/4 | | | | NOT RUN |
| dodger, idle, masher, random (<= 20%) | | | | | NOT RUN (idle/dodge/nearest are covered pre-boss by streetsim, below) |
The constants in the last column were chosen with streetsim (the nearest bot's boss win must keep nearest at 25-40%): HPK 10 / ENR .78 gave nearest 13%, HPK 8 / ENR .85 43%, HPK 9 / ENR .8 25%, HPK 8 / ENR .8 28% (FINAL).
The final column is the only fully consistent set; the phone late 2/8 and PC duelist 7/8 are in band, PC late 4/8 is at the top edge.
Findings:
- A perfect reader (.25-.35 s + poll) loses 0-2 hearts, not 1-3: the enraged half only costs it hearts when the bot's own dispatch jitter (+.04 to +.35 s on the phone) pushes an answer past the shorter read part. The duelist still wins 7/8 in about 70 s of boss time (game clock 208-239 s from 152), not the 2-3 min asked. The lever for "2-3 min" is HPK, but HPK is bounded by streetsim's nearest gate (25-40%).
- Late phone: it clears the first half (swing/charge/pound right) and dies in the enraged half; ENR and TGRACE are the levers for phone late. 8 seeds still spread 0..4 hearts.
## streetsim RUNS=40 (SEED0 4321, FINAL constants)
gfirst 85% (34/34 boss wins) >= 73 PASS | idle 0% PASS | nearest 28% (11/40; boss win 11/22) PASS | still-foes 11.8% PASS | W191 reach PASS.
Still FAIL (pre-boss, unchanged since W304): "gfirst 60-80%" (85), "W243 gfirst 75 +-8" (85), threat peak, cover >= 3 hits, W173 D3.
## NOT RUN: weak bots (dodger/idle/masher/random real input), 844x390 matrix, full stage from the title, foot-test.js landscape STREET CLEAR (see HANDOFF-W309.md).
