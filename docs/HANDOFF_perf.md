# HANDOFF perf (perf-2 landed on trunk)
- Landed: alex/perf-wip 62418d5 (perf-2 GC cuts) merged with trunk 770da51 -> pushed FF to alex/od-int2 at 74ecd2b.
- Gates: tools/build.sh v90m-beta.92 OK; unit 5327 pass, 0 FAIL, 13 known.
- TAG life1,xf1,terrain,smash2,cam,rv2k2,mem on built page: no new reds. Perf-wip reds = trunk reds or known list (fra: mem/stable, xf1/water/land/slope/kerb, terr1/terrain-tyre-fra, life1/fra-density; ath: terr1/terrain-tyre-ath).
- Trunk 770da51 same set reds: fra mem/stable, xf1/*, terr1/terrain-tyre-fra, life1/fra-density, life1/popup; ath terr1/terrain-tyre-ath, life1/ath-density, life1/carousel.
- Left: perf/frame strict target not met; terr1 tyre-gap and xf1 red on both trunk and perf-wip.
