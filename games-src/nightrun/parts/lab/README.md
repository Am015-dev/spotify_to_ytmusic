# parts/lab

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `lab.js`: LAB: its own stage (title > LAB, settings > OPEN LAB, or ?la
- `labassets.js`: LAB ASSETS tab: look at every picture
- `labfull.js`: LAB, complete: every test menu entry
- `footlab.js`: LAB > ON FOOT: the Zeil street stage in a sandbox (rooms, spawns, god mode, slow motion, hit boxes, frame viewer, layer switches); sounds: SOUND page group ON FOOT

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): drawPlayer: labfull.
