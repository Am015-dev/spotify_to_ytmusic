# HANDOFF W180: belt floor is the default (RET.belt ON, ?belt=0 = old flat road)

Player decision (rule 13): line up to hit, or step out of line to dodge (D2 `W173 D2` is the measure: 57% of foe attacks avoided by depth).

## Changes (foot.js, streetlook.js, qa/streetsim.js)
1. STUCK runs: the stuck bots were NOT in the boss lock; all stalled at x ~5650-5800 (t 130-155 s), before the boss. Two causes:
   - `aimAssist` (0.3 rad cone) pulled Kai's shots toward any foe, in any lane: bullets bent up/down over the foe in line. Now only foes within the depth gate (`zok`) pull the aim. (game fix)
   - The stage's two platforms (x 5550-5930) have no depth: Kai hopped onto one and fired over every foe on the road, for ever. On the belt there are no platforms (not drawn, not landable); ?belt=0 keeps them. (game fix)
   - Bot: jumps on the road only for a threat in its line (rusher crouch/lunge, heavy charge, shot within .15 in depth), at most once per 1.6 s, and stays off platforms on the belt (qa/streetsim.js).
   Result RUNS=8, 3 bots: stuck 0 (was 7 with the old bots/game).
2. Props are in the depth sort (streetlook.js `dP`): Kai at z < .12 is drawn behind a wall-side crate. Belt off: unchanged loop.
3. Ducking: the crouch is gone on the belt, REPLACED by the depth-dodge gate (D2); jumping still dodges head-high gunner slugs. streetsim skips the ducking gate when the belt is on.
4. RET.belt default ON (`?belt=0` old). streetsim: belt gates run unless Q has `&belt=0`.

## Gates (default build, RUNS=8): 
no NaN/stuck PASS (0); idle dies PASS; cover blocks PASS (3.3/run); melee fairness (min 1.3 s on screen) PASS; behind-share PASS (26/300 hits); D1 27%/80% PASS; D2 57% PASS; D3 35% PASS; speed x750.
FAIL (balance, all also fail with the belt off): best bot 88% (target 60-80), nearest 50% (25-40), threat peak 60-62% (82-88).
FAIL that is new vs belt off: "kill order matters" (gfirst 50% vs nearest 50%; off: 88% vs 0%): the belt lifts the casual bot, so the gap closes. Tune after the owner plays; RUNS=8 is 12.5% steps.
footvis, streetdraw, streetsong, focus, footlab tests PASS; guard.py ok. Phone 390x763 and PC 1280x720 screenshots looked at (not committed): road band, shadows and boss read fine.

## Left
- Platforms/stage hook lanes on other stages (footstage etc.) were not re-checked with the belt on; platforms are off on the belt everywhere.
- Old draw path (?streetlook=0) has no belt drawing. Balance (above).
- Debug in streetsim: LIST=1 TR=1 prints the state at each stuck run (boss/foes/Kai y, bullets, props).
