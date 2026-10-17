# HANDOFF respawn-1 (2026-10-17): traffic after long drive + warp
1. Root cause: hubTrafficStep left a revived car's `dead` at -dt (truthy), so every `!c.dead` alive-check (traffic GO, career quests) skipped it; after pace crashes ~12 of 75 cars were "invisible" to the counts, recycling itself was fine.
2. Fix: src/70_roam_world.js respawn sets `c.dead=0`. New GO rv2k2/warp-traffic (src/99c_checklist.js): warp 1.5 km away and back, 5 s, needs ≥12 cars within 250 m.
3. Measured (built tree): after pace the GO went 0-3 cars -> 32+ (PASS); rv2k2/traffic PASS 34 cars; unit 0 FAIL; life1,xf1,terrain 25/25 fra + 17/17 ath.
4. rv2k2/pace is still a variable result (68 and 114 km/h in two runs), not touched.
5. Left: rv2k2/near (2-3 markers within 400 m, content gap) not done.
