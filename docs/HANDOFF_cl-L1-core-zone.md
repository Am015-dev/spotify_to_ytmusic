# HANDOFF cl-L1-core-zone
1. src/99cl_loop.js (new, after 99hc in ORDER): `CL` flags (?cl=core|all, TUNE.cl.core), `CL_CORE`, `CL.box` = [-1100,470,-720,800], GO `why/core`.
2. Fresh PLAY (no saved pos) or a resume outside the box spawns at Paulsplatz on the nearest road heading east (wraps `roamPost`).
3. Density: outside the box 60 % of the prop instances are hidden for good (sliced, 1500/tick, draw calls unchanged); 70 % of the traffic fleet and the peds are moved onto core roads, 20 cars within 140 m of the spawn.
4. Measured (fra, built page, ?cl=core): props per 100 m of street 6.1 inside vs 2.5 outside (2.4x), 10 cars within 150 m of the spawn, 60/75 cars in the core. Shot: docs/shots/cl-L1/spawn_berliner.jpg.
5. Left: the x1.5 prop ADD inside the core (needs new instances per tile mesh; today the 2.4x comes from thinning outside only), and `hubCullStep` is not touched. Flag stays OFF by default.
