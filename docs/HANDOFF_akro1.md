# HANDOFF akro-1 (2026-10-17): Akropolis final finishable
- Root cause: tkBuild accepted a course whose start leg ran out to X and route A went straight back over it for ~340 m (overlap test only compared sparse vertices). The pursuit bot (and any s-projection) jumped onto the return pass and pinned at (-1855,370); not (-4566,60), which is not on this course.
- Fix (shared, src/98tk_city_duel.js): tkOverD = dense 10 m overlap test; tkBuild rejects tries where start/fin legs overlap A/B by >15 %. Akropolis now builds a 2726 m route.
- Measured (built page): rv2k2/akro PASS (bot finishes in 135 s, 0 stuck, 1 wall); unit 0 FAIL; rv2k2 close/items/burst/menu/tiny/hudctl/cardstop green; life1/xf1/terrain 41/42. Reds pace/traffic/near/life1-ath-density are identical on the untouched baseline (env).
- Left: bridge spot (576,-306) not re-probed (Westend close/items green); other quick-race courses were rebuilt with the stricter test, tk1/courses not run here.
