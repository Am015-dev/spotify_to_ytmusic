# size-1 handoff (alex/od-size, 2026-10-10). Alex: "many of the big vehicles need better size".

## State
- READY c7aefc07 out/v90b (base alex/od-models v90a WIP). QUICK review sent to the reviewer, READY sent to the coordinator. city-1 has the rule (alex/od-city 1064a8cb uses it for LDraw traffic).

## Fix: src/98sz_ride_scale.js (in ORDER after 98ld_run.js)
- Root cause 1: SC_ship (96) squeezed every roam ride to 0.75 width (SC_K.shipX). Brick rides now scale uniformly (0.408 per garage unit).
- Root cause 2: City/Town LDraw sets are minifig scale. RSZ.MS lists the refs. SZ_add(bricks) adds a 'drvM' brick: a true-minifig driver (k 2.36 → 1.96 m in roam) placed behind the 'stw' brick (r2: z+1, r0: z-2, y-3), which also marks the ride for ×LD_FIG.
  SZ_k(bricks) gives 1 or 1.6. Wired through: S.car, G9C_bricks, gbTeam (saved rides) and GB_attach → ud.szK/szB.
- BC.ref.W is 2.57 (the unsqueezed Hot Rod), so normal cars keep the default hull. Big rides get the hull from BC_upd as before.
- Speed Champions / garage builds / BC templates stay at car scale and have no driver figure (possible follow-up).

## Tools
- bc/sizes.js <url>: stud extents of every ride. bc/szshot.js <url> <out> [ids]: roam via the API, each ride as a roam ship plus a traffic car and a 1.9 m minifig, side shot + _cab 3/4 shot + W/L/H. bc/fig2.js: driver figure boxes.
- tools/ld/tRides.js with SET=<id>: real garage taps + drive + tyre gap (Big Rig 0.03 m).
- Don't `pkill -f`/`pgrep -f` with a pattern that is in your own command line: it kills the shell.
