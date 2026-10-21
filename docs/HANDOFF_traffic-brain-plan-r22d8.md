# HANDOFF traffic-brain-plan-r22d8 (design only)
1. docs/PLAN_TRAFFIC_BRAIN.md: writer map of every traffic-car field (12 hubTrafficStep wrappers; 8 `c.cv` writers, 5 sideways sources, 4 save/restore `c.v` caps).
2. Root causes: summed lateral offsets (yo + l3s + shove + clamp) = dodging; no single leader mid-edge = overlaps; NC_hid + 5 m gate + 5.2 m skip = air cars.
3. Design: one module 98tb_traffic_brain.js (`TB.on`, default OFF): shared grid, one leader per car, IDM speed, integer lanes that never change for the player, OBB contact for all sizes with mass + knocked state.
4. Build lanes B1-B5 (all SONNET): IDM follow, no-dodge lanes, solid contact, reaction + core smash, flip ON + cleanup + perf; each with GO, shot and deletions.
5. Left: B1 first; B2 must fix the rv2k2/close bot's follow logic instead of keeping the dodge.
