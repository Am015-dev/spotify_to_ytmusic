# HANDOFF rev-82 (2026-10-17): v90m-beta.82 = GO
1. Tested trunk sha c28044b (pill-clip e18bbe2 + people-ath c28044b) on built v90m-beta.82 (3,136,993 B, split). Changelog commit adds the beta.82 entry only. Not deployed.
2. Unit 0 FAIL (4826 pass, 13 known; three.js not installed, logic_core/lint skipped as in rev-81).
3. TAG=rv2k2,life1,xf1,terrain 46/54: fails are xf1/* (SLOW or known), terrain tyre-fra/ath + fps-fra (SLOW / draw=0), life1/smash SLOW-only, ath-density known. life1/people passed in the combined run and alone 3/3 (7.0-8.0 s). TAG=rv2k 19/23: objectives known, card SLOW-only, foliage SLOW alone (21 s, camera clear view), drawer passes alone; rv2k2/close fails alone, identical on beta.81 (f89122a, 2ND, 0 lead changes, software-GL bot), so pre-existing.
4. Shots docs/shots/rev82/r82_land.png (852x393), r82_port.png (393x852), looked at: pill "STORY · Hot Drop" in full in both, prompt card below, 0 overlap px.
5. Left: rv2k2/close fails on this machine at beta.81 too; add to the known list.
