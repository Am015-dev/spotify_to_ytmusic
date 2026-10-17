# HANDOFF pace-2 (2026-10-17): open-road pace
1. Flag PACE2 (default ON, ?pace2=0 = old behaviour) in src/98l3_life3.js: turns on the existing L3_YLD lane yield (traffic in the player's lane takes the other lane when the player closes fast from behind) and softens the head-on smash from x0.6 to x0.85 (src/70_roam_world.js, the burst/damage code is unchanged).
2. rv2k2/pace bot (src/99c_checklist.js) now aims a 4.5 m lane offset around a car in its lane within 10+1.4v m, like a human overtake.
3. Measured on the built page (Frankfurt, pace GO, 5 runs ON): PASS, 89, PASS, 108, 93 km/h (limit 90); old behaviour (?pace2=0) 94, 91. Pace is noisy; the 50-65 km/h crawl near (-470,-160) is still there but short.
4. Gates: unit 0 FAIL; rv2k2/pace + slow1/spots; life1,xf1,terrain 42/42.
5. Left: pace still dips below 90 in some runs (corner at (-470,-160)); re-check the burst feel on a phone.
