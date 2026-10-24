# parts/street

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `foot.js`: on-foot street stage engine
- `footart.js`: ON-FOOT ART: window.FA (the street stage's pictures). Inert
- `footen.js`: on-foot street stage enemies + boss library (W3). Pure data
- `footq.js`: on-foot quality: sprites preloaded before the run starts, no old mock graphics, one fixed size 
- `footstage.js`: the finished on-foot stage (7 sections, Warden gate)
- `purefoot.js`: the street drawn with the owner's art only (W217, flag purefoot, ?purefoot=0 = old)
- `streetlook.js`: on-foot street look on phones: one world scale, portrait layout, 3-layer parallax, clip-safe po

Hook homes defined here (`hookable`): none.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): none.
