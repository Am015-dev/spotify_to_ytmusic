# HANDOFF W167: street boss phases (flag ?sboss=1, off by default)

Branch `nr/W167-boss`. New part `parts/street/streetboss.js` (one `PARTS_EXTRA.append` line in parts/build.py), wraps `FOOT_BOSS.bigheavy` (street2.js `heavyDef`).
The boss bar reads `S.boss.bname` (streetlook.js; flag off: still WARDEN, unchanged).

## What the player gets (flag on)
- PHASE 1 THE CHARGE (100-66% hp): charge (0.8 s red crouch; JUMP it) + barrel throw when Kai keeps his distance (0.7 s wind-up; STEP BACK or cover).
- PHASE 2 GROUND POUND (66-33%): + two shock waves along the road (0.8 s wind-up; JUMP the wave).
- PHASE 3 LEAP (33-0%): + leaping slam on the spot Kai stood on (0.6 s wind-up, red marks on the road; DASH or run out).
- Each phase: 1.2 s roar (no damage), its name over the boss and on the bar, then the new attack. Hp cannot skip a phase (bombs and barrels included).
- B3 done here too: a 1.0 s OPEN stun (full damage) after EVERY attack, charges included. The charge hits only its lower 65% (a jump clears it) and not in its first 0.12 s.
- Bug fixed under the flag: a charge 2-3 px short of the screen edge never counted as a wall (walk() refused the step) and ground Kai in the corner for 1.1 s.
- Each attack's answer is captioned the first time it is used (CHARGE · JUMP OR DASH, BARREL · STEP BACK, GROUND POUND · JUMP THE WAVE, LEAP · DASH OUT).

## Gate (streetsim 50 runs/bot, `Q='&sboss=1' DBG=$PWD/qa/bossprobe.js JSONOUT=x.json`, then `node qa/bossprobe.js x.json`)
| | before (live) | after (?sboss=1) |
|---|---|---|
| phases seen, fights reaching 33% | 0 | 42/42 dodge, 47/47 gfirst, 10/10 nearest show all 3 |
| distinct attacks / fight (dodge) | 1 | median 3, min 3 (4 kinds in all) |
| dodged by the dodge bot | charge 7% | charge 100%, pound 98%, leap 100%, throw 100% |
| opening >= 1 s after an attack (dodge) | 2% | 100% |
| fight length dodge median | 7.4 s | 9.5 s (B4 still FAIL) |
| clears nearest / gfirst / dodge | 18 / 70 / 84% | 20 / 94 / 84% |
The dodge bot's boss answers are in qa/streetsim.js RUND (W167 block): jump the charge at contact - 0.12 s, jump the pound at the end of its wind-up, step back from the throw, run/dash out of the leap marks.
gfirst/nearest still fail pound (20-32%) and leap (49-90%): they do not know those answers (nearest has none of the new rules).

## Left for W168 (B4)
- Fight length: `?sbhp=K` multiplies boss hp (default 1). x5: dodge median 31.8 s, x8: 46.5 s, but the climax rushers (street2 climax, one every 3.5 s, max 3) then kill the bots:
  dodge clears 84% -> 60% (x5) -> 8% (x8), all from mel:rusher. B4 needs the adds slowed/stopped during the boss (or capped at 1) together with hp ~x8.
- Add boss columns to streetsim's table (qa/bossprobe.js has the numbers now).
- Owner look: the leap's red road marks are small squares (12 px); a ring/shadow would read better.

## Other gates (flag off, the default): streetdraw 3/3, footvis 139/139, streetsong 6/6, focus 15/15, footlab 37/37 PASS; guard ok.
simhunt: 2 severe kinds (ship "unexplained death", parked + human bot), the same two kinds as the committed qa/SIMHUNT.md, ship stages only (not the street).
