# parts/menus

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `hub.js`: an organised home: PLAY + status + 4 sections (MISSIONS, HANGAR, TRAINING, PROFILE), one header
- `layout.js`: phone layout pass: centred one-colour section pills, centred result / pause buttons, controls b
- `menufix.js`: HANGAR shows 5 tabs + a MORE sheet (every label fits a 375 px phone); the other menu defects of
- `tidy.js`: tidy Settings (<= 20 controls on the main page, one Assist page, the rest under More) + a stree
- `title.js`: title diet + CONTINUE, 14 px type floor

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): none.
