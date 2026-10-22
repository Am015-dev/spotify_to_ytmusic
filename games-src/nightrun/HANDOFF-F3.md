# HANDOFF F3 (22 Oct 2026): street3, the Zeil street as one 2.5-3 min stage on one song

Flag `RET.street3`, **default OFF** (`?street3=1` turns it on) because two gates still fail for the human-style bot. Code: `parts/street/street3.js`, test `qa/street3-test.js` (RUNS=4).

Done and passing (with ?street3=1): one song (street1, 192 s; musicpack's lock/boss/clear switches blocked on this stage, no checkpoints, no captions, boss comes in without the warning sting);
the STREET RUN hold also waits for the painted street + prop pictures (first drawn frame painted at 1440x860 and 390x763@2, 0 placeholder frames after it);
no cross-fade on foot sheets, idle ping-pong 7 fps (measured 6.67), shots/melee 12 fps one-shots (12.0), idle<->walk switches on the next 1/12 s boundary; foes walk/approach at 70%
(rusher 210 u/s, was 300; lunges and charges unchanged); max sheet upscale 0.76 desktop / 1.02 phone; props snapped to device pixels; lamp pools (Kai and foes lit additively
under them), neon spill, wet-road reflection, prop contact shadows, one colour grade under the HUD; idle spawns of other foes off (the clock sets the pace).

Threat plan (S3.log.waves): 8 beats of calm (4.6 s), 12 waves 2 -> 10 (monotonic), peak at 140 s, breather to 150 s, then the big heavy; camera gate moves with the clock.

Left to do:
1. Clear rate: the bot clears 0-1 of 4 (needs ~60-90%); it dies at 120-150 s, mostly to gunner bullets (see `hits=` lines). Try: gunner fire cooldown x1.4 on street3, or
   one more heal pickup, or peak 9. Gate (a) 150-180 s passes when it clears (174.5 s seen), (b) needs the peak at 80-90% of the clear time (peak 140 s fits a 160-175 s clear).
2. Lamp cones are at fixed world x every 520 units and do not line up with the lamp posts painted in the street layers: align LAMP to the painted posts or drop the cone and keep the pool.
3. Colour grade is a little pink/washed on desktop; try multiply alpha .22.
No new art sheets were pushed in the last 3 hours (checked twice): nothing new wired.
