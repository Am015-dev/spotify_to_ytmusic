# HANDOFF W301 (bosses 1-10: beatable? why the bots died)
No game file changed. Changed: qa/gauntlet-flight.js (NOAUDIO=1, ZONES on by default, ZONES=0 = old bots), new qa/botzone.js (what a player sees), new qa/bosstrace.js (one-page, in-page bot, per-second boss trace, hurt classifier).

## Cause 1 (harness, not the game): the beat clock ran on wall time
In the gauntlet the AudioContext runs, so the boss beat (phases, verbs, zones) follows the audio clock while the bot steps the game at ~0.7 sim-s per wall-s. The W292 runs mixed two clocks. With the stepped clock (NOAUDIO=1, no AudioContext, beat = game time) the stage 1 shooter kills the boss 3 of 3 (fight 33-37 s, boss spawns at 88 s sim; 200 wall-s was only ~140 sim-s, so it never got there). Stage 1 shooter: heat stays 0-1, no heat/armour stall.
## Cause 2 (bots): they only saw bullets
Hull loss at stages 5 and 8 came from things not in G.eb: BMV telegraphed zones (laser_sweep sector, bar_curtain, vault_doors), the boss ram/charge row (siren_ram), BPL arena rules (slab, grid, ghost). All are telegraphed >= 0.5 s (laser_sweep 0.86 s). A hit there costs 1-2 hull. qa/botzone.js gives the bots those telegraphs (whole swept sector with a margin because the beam follows the boss, ram row, slab/grid/ghost/zone ring, and a 300 px escape search when standing inside a zone).
## Boss verdicts (GOD=1 = ship cannot die, fight length from spawn; seed 1)
| boss | killable by design? | fight (sim-s) | verdict |
|---|---|---|---|
| stage 1 mini (k5, 198 hp) | yes, both bots | 33-37 | OK |
| stage 5 mini (k5, 956 hp, tresor, slab) | yes, dodger 75.7, shooter 66.7 | 67-76 | no defect: no zero-damage hits, no heal, phase 2 at 0.656 hp opens on the bar line, last stand works. Bots die to zone/slab/enrage hits: BALANCE (hull 7 lost in 60-90 s) |
| stage 8 boss (k0, 704 hp, adler) | yes, dodger 115, shooter 100 | 100-115 | no defect found. Bots lose 7 hull to laser_sweep (0.86 s tell, sector +-0.22 rad), siren_ram (phase 2) and gate/enrage hits: BALANCE, hardest boss for the bots |
Hull hit sizes at the boss: 1 or 2 (2 = the shell's heavy hit / laser wall on the difficulty tier). Phase lines hold HP at 0.64/0.31 until the bar line: while a gate/shield is up hp is flat for ~15-60 s (not a defect, "ARMOUR HOLDS"/SHIELD OVERLOAD after 14 s).
## Proof table, PC, in-page bot (qa/bosstrace.js: JUMP=1, stepped clock, zones on, 3 seeds, SIMMAX 420 sim-s, hull 7)
Cleared = result screen. boss = spawn sim-s / killed sim-s (or boss hp left %). 
| stage | dodger | shooter |
|---|---|---|
| 1 | 3/3, boss 88->125 | 3/3, boss 88->119-125 |
| 2 | 3/3 (no boss) | 3/3 |
| 3 | 0/3 (7,7,9 hits) | 3/3 |
| 4 | 2/3 | 3/3 |
| 5 mini | 0/3 (boss left 5 / 39 / 36 %) | 1/3 (killed 95.8; others 31 / 31 %) |
| 6 | 2/3 | 3/3 |
| 7 | 0/3 | 1/3 |
| 8 boss | 0/3 (left 27 / 66 / 51 %) | 0/3 (left 34 / 19 / 22 %) |
| 9 | 1/3 | 2/3 |
| 10 | 0/3 | 3/3 |
Every stage is cleared by at least one bot except stage 8 (0 of 6, closest 19 % hp left). Stage 7: 1 of 6. These are bot results, not human results; the game side (GOD runs) shows nothing unkillable. 0 page errors in all 60 runs. Not the real-input gauntlet: this is an in-page bot sending key events, so NEXT STAGE per stage was NOT re-proved on PC this round (W292: stages 1-4 ok).
## Phone 390x763 CDP touch, real input (gauntlet-flight.js NOAUDIO=1 JUMP=1 dodger, 2 seeds)
1 -> boss killed -> NEXT by tap -> 2 -> NEXT by tap -> 3 (both seeds); stage 3: 4 deaths each, same as the PC dodger (0 of 3). 0 errors, 0 UI problems, HUD 0/107 mismatches. Stages 4 and 5 not reached on the phone (stage 3 blocks the dodger).
## Open (for the owner / next worker)
- OPEN-W301-1 stage 3 (dodger 0/3 PC, 0/2 phone): not a boss; a dodger-only stage problem, shooter clears. Look at what hits (7-9 hull).
- OPEN-W301-2 stage 8 boss and stage 5 mini are the hardest for a bot; if a human reports them too hard, the numbers are above (laser_sweep sector/tell, siren_ram row, enrage 2-hull). Not retuned.
- OPEN-W301-3 stage 7: 1 of 6.
- Draw path: nothing found wrong in what the boss draws vs its hitbox in these runs (no screenshots taken this round).
- The real-time gauntlet should be run with NOAUDIO=1; without it beats and sim drift apart.
