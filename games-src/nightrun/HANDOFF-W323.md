# HANDOFF W323 (branch nr/W323-gold3, not deployed)
Done: A) GOLD copy (waves.js: strip "GOLD 3s · x3 points, +1 weapon", win "GOLD! squad killed up close", misses "no GOLD: too far / too slow / squad fled", result line "GOLD n/5 · earned x3 points + n weapon levels"; qa/copy-test.js checks it; qa/w323-shots.js makes the shots in /tmp/w323).
B) waves.js: GOLD repairs 1 hull if DASH or EMP ready (P.dashCd<=0 || P.emp>0); bty() punisher at P.hp<=1 on the live squad. Numbers: BALANCE-W323.md.
Open: CHOOSE >= PUSH on base 1000 not met (76 vs 82); two neighbours tried, no better. Next idea: cost the repair to PUSH (e.g. repair only if the squad was killed before its clock passed half), or a stronger CHOOSE rule in humanbot.js.
Note: in the stepped harness WV.bty() was not reached from the tick when foes were killed by setting hp; w323-shots.js calls WV.bty() directly after the kill (real code, forced input). Not investigated.
