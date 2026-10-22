# parts/waves

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `dir.js`: the director: every district lasts as long as its song; the
- `flavor.js`: run-and-gun flavour for the shooter
- `formations.js`: formation library (VARIETY A)
- `fun.js`: set pieces, deck replaces the fixed metronome, rosters
- `leak.js`: ground enemies, calmer pacing, escape penalty
- `remix.js`: each run plays a different seeded cut of the script
- `rules.js`: new-mechanic cadence, returns with a twist
- `stagescripts.js`: every story stage plays its own script
- `waves.js`: stages 1-6 play named waves with one idea each, a breather between, a rising curve to the final

Hook homes defined here (`hookable`): DIR.spawnOne.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): DIR.spawnOne: leak,stagescripts,waves; DMG.pass: leak; PW.draw: flavor; drawEnemy: dir,leak; drawPickups (DRAW.extra): dir,flavor,formations,fun; drawPlayer: rules,stagescripts.
