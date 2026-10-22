# parts/bosses

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `armour.js`: boss HP phases, damage cap, last stand
- `bossmoves.js`: boss movesets: verbs (vd), telegraphs, per-boss lists
- `bossplay.js`: boss encounter mechanics (gates, ignoring a boss costs)
- `bossvis.js`: bosses look different in each phase

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): DMG.pass: armour; drawPlayer: armour; spawnBoss: armour.
