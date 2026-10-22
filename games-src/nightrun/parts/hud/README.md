# parts/hud

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `c.js`: the hint bubble: wraps to two lines and stays inside the scr
- `explain.js`: every fly-stage visual is explained: first-appearance captions, max 2 rings on the ship, no sym
- `hud.js`: ship stats: a little cluster round the ship (hull, dash char
- `nocaps.js`: no caption, hint bubble or info box while a stage is played; a new thing is taught by ONE pre-s
- `uikit.js`: painted UI kit: HUD plates and the hint bubble
- `zonehint.js`: one-line caption on the first purple ring (gravity well) of each stage: what the ring is

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): drawPlayer: explain,zonehint.
