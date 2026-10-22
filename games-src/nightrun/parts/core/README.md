# parts/core

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `a.js`: functions: $, hookable, rnd, clamp
- `b.js`: functions: stampOf, fit, toGame, tEnd
- `fs.js`: phone full screen on first tap
- `h.js`: H: no AFK wins, a dying ship slows the song
- `lagfix.js`: lag fix, part 2: songs are streamed (see parts/a.js "tracks"
- `saves.js`: explicit, safe saving and save slots
- `stamp.js`: build stamp and update check

Hook homes defined here (`hookable`): DMG.hit, DMG.pass, hurt, spawnBoss.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): drawPickups (DRAW.extra): h.
