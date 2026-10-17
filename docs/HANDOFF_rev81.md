# HANDOFF rev-81 (2026-10-17): v90m-beta.81 = GO
1. Tested trunk sha f89122a (pill-2) on the built page v90m-beta.81 (3,136,708 B, split). Changelog commit adds the beta.81 entry only. Not deployed.
2. Unit 0 FAIL (4826 pass, 13 known). TAG=rv2k2,life1,xf1,terrain 43/54: only SLOW-time or known fails (xf1/*, tyre-fra, fps-fra, smash SLOW-only; ath-density known). life1/carousel and terrain-tyre-ath pass alone; life1/people (ath) fails 3 of 3 runs here, always SLOW-flagged too, unrelated to the HUD pill (was flaky in rev-80).
3. TAG=rv2k 18/23: objectives (timeout) known; drawer, foliage, card SLOW-only; rv2k2/burst failed in that run, passes alone.
4. Shots docs/shots/rev81/pill_land.png and pill_port.png, looked at. Portrait: pill reads "STORY · Hot Drop" in full, prompt card below, no overlap. Landscape: pill shows "STORY · Hot D…" ellipsised. The DOM says the span fits (112/112 px) while the pill clips at ~170 px of 258, so it is not a one-line CSS fix; not changed. Cosmetic.
5. Left: landscape pill clip (look at #m1Next width vs overflow:hidden with the empty .crD); life1/people ath.
