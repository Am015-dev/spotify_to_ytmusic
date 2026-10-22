# parts/enemies

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `ai.js`: smarter enemies (the answer to "too easy with all the perks"
- `bandclear.js`: no enemy rests under the HUD band on a phone: flyers cross it fast, strays are moved out
- `counter.js`: threats that make DASH and EMP the answer
- `fair.js`: scale round 2, must-move column strike, strike follow-up
- `flankers.js`: flanker enemies that punish a parked ship (default OFF)
- `fleet.js`: enemy warships in the fly stages
- `grit.js`: slower EMP meter, tougher varied enemies
- `hard.js`: scale round 3: power-aware enemy hull
- `react.js`: enemies react to the ship, not fixed paths
- `scale.js`: power-aware enemy scale, round 1
- ... 3 more files in this folder

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): DIR.spawnOne: fleet,zoo; DMG.hit: fleet,grit,hard,react; DMG.pass: fleet,hard; SH.volley: hard; drawEnemy: ai,flankers,fleet,zoo; drawPickups (DRAW.extra): fair,flankers,fleet,react,zoo; drawPlayer: ai; hurt: grit; spawnBoss: fair,hard.
