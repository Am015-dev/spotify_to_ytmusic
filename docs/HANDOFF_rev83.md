# HANDOFF rev-83 (2026-10-17): GO for v90m-beta.83
1. Tested sha 07c2ed7 (trunk alex/od-int2 head), built tools/build.sh v90m-beta.83; unit 0 FAIL (5277 pass, 13 known).
2. TAG=mem/tier,rv2k2,rv2k3,smash2,hudstack1: 26/28; rv2k3/racepop + hudstack1/stack red only in the combined run (pop-up timing at 113 km/h), both PASS alone. 0 console errors.
3. TAG=life1,xf1,terrain: 41/42, only known life1/ath-density. 0 console errors.
4. ?lowmem=1 and ?lowmem=0: 0 console errors (pr 1.5 vs 1, 50-55 cars within 250 m). Shots docs/shots/rev83/{land,port,race,lm0}.jpg looked at: lively, HUD clear, race shows 2ND/2 and -2.1 s gap.
5. Left: racepop order-dependence in the combined run; mem/stable deeper leak (crash1 handoff).
