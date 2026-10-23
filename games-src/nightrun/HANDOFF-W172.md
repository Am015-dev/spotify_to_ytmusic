# W172 hit feel stuck + default ON
Cause (one line): the nearest/gfirst bot's "keep off the heavy's front" rule walks Kai into the left screen edge, where rushers stack on his x and he shoots the wall (and jumps every telegraph) for ever; hit feel only reshuffled which seed (flag off sticks the same way at the same rate: 3 per 900 runs on seeds 300/bot, e.g. nearest 661598).
Fix: qa/street2-test.js bot does not retreat into the left edge (dx > 0 && x - camX < 60). Stuck per 900 runs: 3 -> 1 (flag on), 3 -> 1 (flag off). Default build, RUNS=50: stuck 0.
Default flipped: RET.hitfeel ON, `?hitfeel=0` = old (streetfeel.js line 27).
Gates (RUNS=50 default build): stuck 0; clear nearest 46 / gfirst 92 / dodge 92 (flag off same bot: 26 / 96 / 88, 50-run noise is +-7; at 300 runs on 39 vs off 33). footvis, streetdraw, streetsong, footlab, focus, guard pass.
Left: 1 rare stuck per 900 runs remains (nearest 1065467 / gfirst 1920719: boss or gunner pinned Kai at the left edge through the gfirst push rules). Not a hit feel issue. Orchestrator: rebuild after merge.
