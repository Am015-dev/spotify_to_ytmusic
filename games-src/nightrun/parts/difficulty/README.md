# parts/difficulty

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `anticamp.js`: graded, readable pressure on a parked ship
- `bite.js`: Normal bites again on top of the short stages
- `choices.js`: build pressure and real choices (default OFF)
- `cp.js`: checkpoints with grace on long stages
- `density.js`: per-stage budget of enemy bullets on screen
- `econfit.js`: economy fit: hours to finish back to 9-13 h
- `endramp.js`: endless mode climbs in difficulty
- `holdline.js`: hold the line: letting enemies pass costs
- `legend.js`: Legend plays differently, not just faster
- `novelty.js`: late-run escalation layer
- ... 1 more files in this folder

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): DIR.spawnOne: pacing; DMG.hit: anticamp,choices,pacing; DMG.pass: endramp; drawEnemy: novelty; drawPickups (DRAW.extra): anticamp,cp; hurt: legend; spawnBoss: density,endramp.
