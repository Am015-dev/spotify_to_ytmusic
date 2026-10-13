
## 2026-10-13 builder-A2 slice: respawn rule
- State: respawn ONLY when below the terrain minimum −3 m, >40 m from the course for >3 s, or upside down >2 s (not in loops); it returns to the last checkpoint/START passed. The cliff-landing, world-edge and 7 s air rules are gone; a far respawn after a >16 m fall is labelled 'cliff'.
- Root cause of the old failures: the bx-offroad/bx-water test routes ENDED, so the driver went straight on 60–80 m from the course (a real far respawn). The off-route waypoints are now loops kept ≤35 m from the course.
- Tests (tools/bx/tAccept.js): bx-offroad PASS (0 respawns), bx-water PASS (boat 11.6 s) but still 1 'far' respawn: at t≈5–14 s the boat held a fixed heading at 9.05 m/s and ignored the driver (also seen at the end of the old offroad trace). Suspect boat or test-driver steering; check next. bx-cliff PASS (cliff respawn, back after 0.29 s), bx-errors PASS.
- Next slice: the boat-steering/heading lock above, then bx-bridge, bx-split, bx-elev.
