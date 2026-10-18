# HANDOFF rev8 (2026-10-18): review #8 of trunk bcd0382, docs + review tools only, branch alex/rev8
1. docs/REVIEW_2K_8.md: overall 5.3/10 (r7 5.1). Races 4/4 finish, free roam 0 stuck/0 teleports/0 errors/0 blocked street points, race items 0 errors.
2. Top bug: Athens shortcuts never appear (DEST_find at 670/22700 nodes after 300 s, publishes only at the end) and it is Athens' top allocator (~280 MB/30 s).
3. Still open from r7: cyan ellipse at the Athens spawn (+ cyan arc in the Westend race), Athens quest pill truncation. New: RGB split too strong, PC KM/H 11 px over the car.
4. Tools: tools/rv8/probe.js (wander|road|ram|sweep), tools/rv8/hud.js; shots in docs/shots/rev8.
5. Early respawn / blocked roads not reproduced: needs a 🐞 report with a position.
