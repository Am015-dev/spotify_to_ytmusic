# HANDOFF ath-alloc-r22p2
- Measured (tools/athdrive.js out <ver> ath, HEAP=40, 30 s): 1375 MB (46 MB/s) at trunk 614749f -> 1297 MB (43 MB/s); roamTerr self 107 -> 14 MB, GND_fars 13 -> ~2 MB. Target 25 MB/s NOT met -> docs/PLAN_ATH_ALLOC.md (owners + change each, 2 lanes spent).
- Cause found: reads of number fields off long-lived boot objects (RO.ramps) allocate per read in Chromium 141; fresh copies don't. roamTerr now reads a typed-array ramp mirror (RM_sync: identity-checked per call, re-read every 64 calls); GND_fars null|double phi -> sentinel. Same results (probe sums identical, GO compares mirror vs objects).
- GO perf/ath-alloc: + ramp mirror == objects at 9 points per ramp, mirror reused between calls, push/pop picked up, GND_fars phi check; AFTER 47 -> 43.
- Tools: athdrive.js HEAPDUMP= / JSFLAGS= / AFTER= / SERVE=<dir> (boot once, run probe files; see PLAN).
- Gate: unit 0 FAIL; TAG=perf/ath-alloc,life1,xf1,terrain on the built page 40/43 parallel (xf1 grass/slope SLOW >10 s, terr1 tyre-ath first spawn '?'); solo reruns xf1 6/6, terrain ath 14/14 (baseline same).
