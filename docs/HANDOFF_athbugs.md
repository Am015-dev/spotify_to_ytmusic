# HANDOFF athbugs (2026-10-17), trunk 47536de (beta.86), pushed to alex/athbugs-wip (docs + test tools only, no game change)
- Hunt: tools/qa/athhunt/ (road-following bot hunt.js+drv_page.js, spot.js pin probe, pin.js reader trace), 3 routes × 3 min + GOs on the BUILT page. 0 JS errors, 0 HUD overlaps.
- Top bugs (docs/ATHENS_BUGS.md): 1 pinned at speed by a DEAD traffic car (c.dead 25, invisible wall), 2 launch to x=15432 after reverse on the Acropolis ped street, 3 7 m/frame jitter, 4 carousel 0 rad, 5 camera jumps.
- Fixed: none (timebox spent on the hunt and root-causing #1). #1 lead: the block reads a cached car position (getter on c.x caught no reader), skip c.dead>0 there.
- Gates not run (no game code changed). Left: fixes 1-3 with GOs.
