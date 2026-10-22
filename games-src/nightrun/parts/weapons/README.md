# parts/weapons

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `forge.js`: weapon forge: combine, sockets, presets (data, actions)
- `forgeone.js`: one-screen phone forge: bench + ship slot bar + swipe strip, info and recipes as bottom sheets
- `forgeui.js`: forge screen, step by step
- `inventory.js`: inventory + loadout screen (Garage FORGE tab)
- `wpx.js`: 4b. WEAPON LEVELS BOUGHT IN THE GARAGE + EIGHT MORE WEAPONS

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): none.
