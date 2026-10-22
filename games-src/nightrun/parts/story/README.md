# parts/story

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `map.js`: Nightrun story MAP: a painted, scrollable route through the
- `saga.js`: campaign story: opening, briefings, comms, chapter ends, STORY tile and log
- `story.js`: Nightrun Story: 12 stages in 3 acts, stage select, stars, Ha
- `storydata.js`: every line of the campaign story (data only; saga.js plays it)
- `tale.js`: story cast, beats, dialogue card, STORY LOG

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): none.
