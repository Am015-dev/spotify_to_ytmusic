# HANDOFF gscript-r30o
1. tools/gauntlet.js 305daa3: no brake+arrow in the follower, hit target rules, tall-facade wall aim, quest routing via mkGo.
2. Fixed (stable in 2 full runs): steer, drive/*, hit/contact, drift/*. 12 FAIL -> 5 (A) / 7 (B).
3. Game: drive/near (0.5-0.7), wall/headon (car not stopped), boot rows.
4. Unstable, open: hit/noBrake, mission/reach (25 s vs 90 s on the same quest), wall setups (2-3 of 4 not set up).
5. Next script lane: trace mission/reach in run B, fix noBrake speed read, widen wall setup.
