# parts/render

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `bg.js`: districts
- `calm.js`: a calm playfield: rule banners small in the top band, thin soft player/enemy beams, at most 2 r
- `comfort.js`: eye strain pass: flash/glitch rate and alpha caps, shake caps, glow/scan lines, text floors, Co
- `diet.js`: visual diet: fewer own effects, readable enemies, a lean 6-item HUD
- `draw.js`: weapon mounts on the ship: slot 1 = coloured circle, slot 2
- `legible.js`: enemies, enemy bullets and pickups readable on every stage backdrop; one colour per role
- `polish.js`: a calm, readable playfield: one telegraph style, ship on top, bullets tinted by threat
- `readable.js`: bullets and threats readable at a glance
- `shapes.js`: vector SHAPES for every item that still waits for painted ar

Hook homes defined here (`hookable`): drawEnemy, drawPlayer.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): PW.draw: diet; SH.volley: shapes; drawEnemy: calm,comfort,diet,legible; drawPickups (DRAW.extra): draw; drawPlayer: diet,polish,readable.
