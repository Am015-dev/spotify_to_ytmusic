# HANDOFF W299 (branch nr/W299-gold-tune, not deployed)
Changed: `parts/waves/waves.js` FCD 1.6 -> 1.0 (flak cooldown per gun) and tags flak bullets (`b.fl`); `humanbot.js` records hull lost by
cause (flak / bullet / collision / boss / other), time in push, flak rings per run (`cf`, `flak` in the JSON); `qa/push-gate.js` `ONLY=`/`REUSE=`.
Tables and reasoning: BALANCE-W299.md. Re-run: `RUNS=16 STAGES=1,4,6 TABLE=1 node games-src/nightrun/qa/push-gate.js`; analysis of the JSON in OUT is
by `cf`. A constant can be tried without a rebuild with `PRE='WV.FCD=1.2'`.
## Open
- Real input, qa/gauntlet-flight.js STRATS=shooter STAGES=1 SEEDS=1 WALL=450 PAR=1: phone (CDP touch) and PC (keyboard) both reach the stage 1 result,
  boss killed, 0 errors, 0 rejections, `◆ GOLD 0/5` shown (the shooter never flies in close). Known W292-area finding: `result NEXT STAGE not clickable` (focus mode).
  With the default 150 s wall cap the run ends before the result in this container (software GL).
- Stage 5 (mini-boss) clears 0% for every policy; stages 2-3 100%: no signal there.
- visible-test zoo-efdrone / zoo-einterceptor (already failing on base).
## What the owner should feel
- Stage 1: drone squads show the clock chip; fly in close (right of the home spot), kill them fast and a GOLD toast appears (+1 weapon level).
  Turrets answer a close ship with a red ring and then a ring of bullets, about every second: dash or retreat. Staying back is safe but earns no GOLD.
- Stage 4: gun squads (turrets, shielders) are where the choice matters: close with a ready DASH and hull 3+ pays, close at low hull gets punished.
  Stage 6 (gunships): rings come often; pick one or two squads, not all.
