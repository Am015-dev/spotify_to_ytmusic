# parts/powers

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `abilities.js`: DASH charges and EMP as abilities (beat bonus, refund)
- `abup.js`: DASH/EMP upgrades and power-up interaction
- `arsenal.js`: 12 extra power-ups and the context-aware drop picker
- `power.js`: music power-ups: glowing enemies drop them, collecting one e
- `powerups.js`: six music-tied timed power-ups + drum burst
- `powlevels.js`: power-up levels + five new shooter power-ups
- `reward.js`: risk pays: graze chain multiplier
- `timing.js`: DASH/EMP as beat-and-window decisions

Hook homes defined here (`hookable`): PW.draw, PW.give.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): DMG.hit: arsenal,reward; PW.draw: arsenal,powerups,powlevels; PW.give: arsenal,powerups,powlevels; SH.volley: powerups,powlevels; drawPlayer: reward.
