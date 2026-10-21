# HANDOFF lazy-split-r22s
- Page 3,500,030 B -> 3,348,351 B (-151.7 KB; cap 3.6 MB, target <= 3.38 MB). Unit 0 FAIL.
- Moved to ONE lazy chunk: 98b2_builder2.js + 98fs_flagship.js + 98r3e_r3e.js (track builder, flagship track, builder GO tests); src/LAZY line with `+` grouping (tools/lazy/pack.js, build.sh, unit/lib.js).
- New xc file for Beta publishing: xc/98b2_builder2.js (about 175 KB raw). The coordinator publishes every xc/*.js.
- Builder hooks: window.BX set in the builder; src/10z_lazy.js XC.post rebuilds the race-menu builder tracks if the menu was built before the chunk loaded.
- perf/reveal-desktop fra+ath pass; perf/ios-reveal fails identically on the untouched trunk build in this lab (slow lab, 1-2 vs 0-1 shader links, noise).
- TAG run vs untouched trunk build: same failures on both (xf1 grass/water/slope/kerb, bot/nav, stuck, traffic-hitch, ctb/collide, traffic/fit); no new ones. Left: 98tk_city_duel / 98of_onfoot (~45-85 KB each) are the next candidates.
