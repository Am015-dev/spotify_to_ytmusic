# HANDOFF cl-L1-core-zone
1. src/99cl_loop.js (new, after 99hc in ORDER): `CL` flags (?cl=core|all, TUNE.cl.core), `CL_CORE`, `CL.box` = [-1100,470,-720,800], GO `why/core`.
2. Fresh PLAY (no saved pos) or a resume outside the box spawns at Paulsplatz on the nearest road heading east (wraps `roamPost`).
3. Density: outside the box 60 % of the prop instances are hidden for good (sliced, 1500/tick, draw calls unchanged); 70 % of the traffic fleet and the peds are moved onto core roads, 20 cars within 140 m of the spawn.
4. Measured (fra, built page, ?cl=core): props per 100 m of street 6.1 inside vs 2.5 outside (2.4x), 10 cars within 150 m of the spawn, 60/75 cars in the core. Shot: docs/shots/cl-L1/spawn_berliner.jpg.
5. Left: the x1.5 prop ADD inside the core (needs new instances per tile mesh; today the 2.4x comes from thinning outside only), and `hubCullStep` is not touched. Flag stays OFF by default.

## Fix round (review 21)
- Heading: R17_off is skipped while CL.sp (98bp 180 deg start-life turn); GO now checks __tq.home after the real roamLoad (east, in box).
- Cost: only traffic moves (35 % of fleet, 10 cars near the spawn); peds stay (moving them was +4 % calls, opt-in ?clped=1). GO A/Bs moved vs home traffic at Paulsplatz: calls +1.1 %, tris +1.6 %.
- Shot: docs/shots/cl-L1/spawn_berliner_realplay.jpg (real PLAY path, faces east into traffic).

## Fix round 2 (review 21b)
- Whole-frame budget: why/core toggles the whole zone (thinned props + moved traffic) OFF/ON in one page, 5 alternating pairs, median: calls 0.0-0.8 %, tris 1.1-2.7 % (3 runs). Moved traffic cut to 8 % of the fleet + 3 near the spawn (the core already holds ~55 of 75 cars); peds stay.
- life1/smash: the plaza start boxes in the nearest run-up, so LIFE_goSmash (src/assets/lx/code.js) now tries up to 3 run-ups >= 50 m apart (4.0 s, then 2.6 s each). Passes with ?cl=core, ?cl=core,studs, ?cl=all and default.
- Spawn framing: CL_clear puts props on the chase-camera line (16 m back, 4.5 m either side, 5 m round the car) away for 40 s. Shot: docs/shots/cl-L1/spawn_berliner_realplay2.jpg.
