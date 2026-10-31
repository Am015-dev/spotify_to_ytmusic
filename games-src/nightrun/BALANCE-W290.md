# W290 street boss duel (big heavy), design. Code: parts/street/streetboss.js (one owner, no flags besides sboss)
1. One fight, three attacks in a FIXED cycle so the player can learn it: SWING -> CHARGE -> POUND -> SWING ...
2. SWING: the boss walks in to 60-80 px, stands with the raised fist (melee pose), sound 'warn', yellow word GUARD! over it. Telegraph 0.85 s (READ 0.60 + COMMIT 0.25). Answer: GUARD (or a parry).
3. CHARGE: it backs off to >= 150 px for a run-up, crouches low (crouch pose), sound 'dash', red word DASH!. Telegraph 0.95 s (READ 0.75 + COMMIT 0.20). Answer: DASH (through it, i-frames).
4. POUND: it rises 26 px on its toes (idle pose lifting), sound 'up', blue word JUMP!, a ring of blue marks rolls out along the road on the slam. Telegraph 1.0 s (READ 0.85 + COMMIT 0.15). Answer: JUMP.
5. Each telegraph = READ part + the last 0.15-0.25 s COMMIT (the boss switches to its attack pose and the answer word sticks to it). The answer must be pressed in the READ part.
6. ONE decision per attack: the first of GUARD / DASH / JUMP pressed in the READ part counts; later presses do not change it.
7. Right answer: no damage, a green 'PARRY! / DODGED! / CLEARED! OPEN' pop, hit-stop and the 'big' sound; the boss is OPEN (stun, hit pose) for 1.6 s and takes x2 damage with no armour.
8. Wrong answer ('WRONG · <answer>' pop) or none / too late ('TOO LATE'): the attack lands: SWING 1 heart, CHARGE 2 hearts, POUND 1 heart (Kai in the air dodges the pound's ground band).
9. After a miss the boss shakes it off for 0.9 s (no punish), then walks 0.9 s before the next telegraph.
10. Outside the punish window the boss keeps heavyDef's armour: front shots heal back 70% (only the knife and the OPEN window really hurt it).
11. Camping: 4 s without an attack (Kai keeps away or stands still) = a CHARGE at once, out of the cycle (the gap-closer).
12. HP 36 x HPK 6 = 216 (W279-W281 used 288 for a fight with no punish window).
13. No adds during the boss (street3 W278 rule unchanged), heals as it walks in unchanged, pre-boss stage (W263 constants) untouched.
14. Art kept: owner's idle / run / crouch / melee / hit / die sheets via heavyDef's pose names; hitbox (54 x 96, fw 58) unchanged.
15. Reaction budget: READ ends at 0.60 / 0.75 / 0.85 s; a 250-350 ms reader has >= 0.25 s to spare, a 600 ms reader is late on SWINGs, on some CHARGEs, and in time for POUNDs.
