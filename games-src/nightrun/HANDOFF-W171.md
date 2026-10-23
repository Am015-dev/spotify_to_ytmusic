# HANDOFF W171: fourth street foe (the shield guard), flag `?shieldfoe=1` (off by default)

Street bar row E4 (>= 4 foe types, each readable by silhouette and asking for its own answer).

- File: `parts/street/streetfoe.js` (one line in build.py). Defines `FOOT_ENEMIES.guard` (always defined, inert); the flag only places it.
- Look: the existing `shield` sheet (the only street foe with a riot shield); no new assets.
- Behaviour: walks slowly at Kai; its shield stops every shot and blow from the front (white sparks, first block pops "BLOCKED: GET BEHIND IT");
  its back is bare; it turns slowly (1 s), so stepping or jumping past it and shooting its back is the answer. Shield bash: 0.6 s crouch telegraph,
  0.25 s shove, 1 heart, then 3.2 s cooldown. After 10 s on screen it lowers the shield ("SHIELD DOWN"), so nobody gets stuck.
- Placement: waves 5 and 9 of the street3/streethard plan: two rushers become one guard (same threat weight, 2).
- Player decision: walk past the guard (into the gunner's line and the rushers) to hit its back now, or keep shooting the others and let it come.
- Measure: `Q='&shieldfoe=1' node qa/streetsim.js`: two new W171 gates (>= 4 foe types in hearts by source; guard time to kill differs >= 30%
  between the bots that get behind it, gfirst/dodge, and the one that does not, nearest). The gfirst/dodge bots now also step past a guard (no effect with the flag off).
- footvis-test: the guard is checked on its own line; the test now empties S.E between spawns (env.spawn's 16-foe cap refused the last ids, so
  rusher/gunner/heavy/bigheavy were never drawn there before).

Open (orchestrator / owner):
- With the flag on, the casual (nearest) bot clears less (0-8% vs 18% off) and dodge clears 100% (84% off). Both clear-rate gates already FAIL with the flag off.
  The guard punishes standing in front of it, which the nearest bot always does. Owner play decides whether the guard is fair; tune TIRED/CD in `FOOT.GD`.
