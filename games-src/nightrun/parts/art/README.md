# parts/art

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `art.js`: painted art loading, ART.img/anim, sprite strips
- `arthooks.js`: literal id table for fx/fg/wpmount/wp/rule/rx/ui pictures plus the hooks that draw them when re
- `foeart.js`: every fly-stage enemy draws from an approved ship sheet
- `fxwave.js`: EFFECTS ASSET WAVE 8 (owner, 18 Oct 2026). Pictures for shot

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): drawPlayer: art.
