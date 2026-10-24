# Traffic (NPC cars)
Plan: [../../PLAN_TRAFFIC_BRAIN.md](../../PLAN_TRAFFIC_BRAIN.md) (7 writers of speed, 5 of sideways offset, no single leader).

## Key files / functions
- Race traffic: `src/30_race.js` (`setupTraffic`, `stepTraffic`, `drawTraffic`, `TMAX=48`).
- Roam traffic (HUB.cars, Frankfurt + Athens): `src/70_roam_world.js:hubTrafficStep`; LEGO traffic cars (instanced, suspension) `src/93_cars_lego.js`; fit `src/98w_w13_traffic.js`.
- Behaviour layers: signals/variety `src/90_fixes_cv_ju.js` (CV_*), yield `src/98ayd_yield.js`, life `src/98l3_life3.js`, `src/98lx_life.js`, `src/98lf_lively_fill.js`.
- Contact: `src/95_drive_flow.js:W10_bump`, `src/98nc_npc_collide.js` (NC_* separation, `NC_hid`), `src/99sc_solidcars.js`.
- Phone compaction: `src/98pc_compact.js` (PC_*).
- GOs (no graphics): `src/99ctf_traffic_go.js` (TRF_go, how cars move), `src/99ctl_traffic_law.js` (TLW_go, law + on-road), `src/99iv_inview.js`.

## Invariants
- A car not drawn must still be solid or must not be reachable: pose-cull and contact rules must agree.
- A dead/smashed car must not block (Athens pin bug had `c.dead`=24.98 acting as a wall).
- One writer per speed/offset is the goal of the brain plan; do not add an 8th.

## Known bugs / history
- Pinned by a traffic car, invisible cars on phone: [../../PLAN_NPC_COLLIDE.md](../../PLAN_NPC_COLLIDE.md), [../../ATHENS_BUGS.md](../../ATHENS_BUGS.md).
- Law and view: [../../HANDOFF_traffic-law-r21s.md](../../HANDOFF_traffic-law-r21s.md), [../../HANDOFF_traffic-in-view-r22e15.md](../../HANDOFF_traffic-in-view-r22e15.md), [../../HANDOFF_traffic-brain-plan-r22d8.md](../../HANDOFF_traffic-brain-plan-r22d8.md).
