# parts/drills

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `lessons.js`: short tactics lessons the first time a feature appears
- `school.js`: TRAINING = FLIGHT SCHOOL: one ordered list of drills (basics, loadout lessons, counters, gate, 
- `schoolfull.js`: every Flight School drill and lesson mini stage is a real lesson: demo, three escalating rounds
- `tut.js`: TUT: FLIGHT SCHOOL, a playable tutorial stage (about 3 minut

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): drawPickups (DRAW.extra): tut.
