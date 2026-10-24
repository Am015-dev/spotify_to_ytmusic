# W202 guard: human-reaction bots + defence with costs (flag counter still OFF: the dash gate fails)

Diagnosis: the W192 parry bot and the W197 dash bot read foe state with zero reaction time (they guard or dash on the exact frame a lunge starts), so
"parry bot clears 100%" was partly the gate. qa/streetsim.js now has HUMAN bots `parry` and `dash`: per attack a seeded reaction time 0.18-0.30 s from the
tell's start (crouch, feint pause, wind-up), a miss rate MISS=0.15 (env), and a timing error of about +-0.07 s on the press; they act on their own estimate
of the impact time. A feint's lunge (no tell) can only be answered from the pause before it. `parryp` / `dashp` = the same logic with no reaction time, misses or error (upper bound).
But the game was also wrong: with the counter on, feints made the street EASIER (nearest 25% -> 58%), because a feinting rusher stood still as a free target.

Changes in parts/street/streetcounter.js (all behind ?counter=1):
- feints answer defence: chance 15% + up to 55% more after 2 guard presses or dashes within 30 s (DWIN/DN), so shooters rarely see them;
- a feinting rusher blocks shots from its front (amber sparks, caption "FEINT: IT BLOCKS SHOTS..."), waits out a dash (strikes 0.2 s after it), and its real
  strike is a 2-heart blow (breaks a guard, a parry still beats it) that runs up to 0.2 s further until it reaches Kai;
- every heavy attack is the red-outlined unblockable slam (SLEVERY 1; fixed: SLEVERY 1 used to mean no slams), and a slam ends with the heavy OPEN (stuck) 1.2 s,
  the reward for getting out of the way (without it heavies could never be killed: gfirst 0%);
- telemetry S.cn: fb (shots blocked), fhit/fpar (what the lunge after a feint did). W196 counts feint/slam as attack states.

Gates, streetsim RUNS=100, Q=&counter=1 (same seeds):
| bot | clear | hearts/run |
| nearest | 35% | 10.5 |  gate 25-40 PASS
| gfirst | 56% | 10.5 |  >= nearest+15 PASS
| dodge | 66% | 8.6 |  best 60-80 PASS
| parry (human) | 59% | 7.9 |  gate 60-85, >= 3 hearts: 1 point short
| parryp (perfect) | 86% | 5.9 |  upper bound
| dash (human) | 94% | 6.9 |  gate 60-85: FAIL
| dashp (perfect) | 95% | 5.5 |
No NaN/stuck; W196 PASS with feint/slam counted as attacks. Old W192 gates (parry >= 30% fewer hearts than dodge, >= 5 parries) fail with the human bot.
Threat peak and cover gates fail with the counter OFF too (base).
Tuning notes: FPG .35 -> parry 93%; .7 -> 56%; .55 -> 59%. More flankers made it EASIER (they waste time circling). OPEN .5 changed nothing. A feinter that follows Kai
made shooters collapse (gfirst 28%): reverted.

Left to do:
1. The dash bot clears 90-95% whatever the counter does (11 of 12 with the counter off): the dash itself (streetdodge.js, W197: 0.13 s i-frames, 0.75 s cooldown) is the strong part; its deaths
   are rare and mostly at the boss. Owner's call: lengthen the dash cooldown, or make the boss shots harder to dash.
2. Parry at 59%: FPG .5 should land it at ~65%. Check with RUNS=100.
3. Screenshots: phone + PC frames of a feint taken (the caption reads well), but the bot ran into the rusher (31 px), so the amber outline could not be judged; the slam
   frame was not reached in 240 s. Retake with a bot that stands still in room C (heavy). Check the outline is drawn: the wrapper is on ART.footDraw; make sure the street foes
   go through it (foot.js 496 sets ART.fE, then drawWho).
4. Phone: the GUARD button label overlaps another button's label on 390x763 (seen in the feint shot; from W192, not this change).
5. footvis could not run: it needs commit 58585ec51, which is not in this shallow clone (fetching more history timed out). streetdraw 3/3, focus 15/15, footlab 37/37, guard.py ok.
   simhunt: 2 severe kinds, both in the flying stages (ship deaths, HUD band), not from this change.
