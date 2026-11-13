# Sands of Qamar: wired R3 (W355)

**3D models: 5 of 5 wired.**
- `palm`, `palace`, `camel` -> `models/*@512.webp` stack sprites and camel token (`html.sp3`, skin.css), already wired.
- `lamp` -> `models/lamp-turn.webp` 24-frame turntable in the djinn summon pop-up (`#summon .sm-lamp`), already wired.
- `meeple` -> `models/meeple@512.webp` (new): the blue builder figure replaces the flat drawn builder in the help/rules card pictures (`HP.meeple` in hlp.js, only when `html.sp3` is on; the drawn SVG stays otherwise). One colour only, because the model is a single blue base mesh; the other the tribes keep their painted meeples.

**2D wired: 6.**
- `back-copper`, `back-lamp` -> card back unlocked by campaign rewards (paint.js `BACKS`, built name `back-<id>`). The asset check missed it because the name is built at runtime. Verified in campaign.json.
- `table-workshop`, `table-court`, `table-night`, `table-palace` -> table background unlocked by campaign rewards (paint.js `TABLES`). Same reason.

**Superseded: 2.** `ui-button-go`, `ui-button-power` (the `-c` nine-slice versions are loaded).

**Prompts superseded: 0** (the camel pose prompts need poses the single 3D model cannot give).

**Still unused: 1.** `ui-seat-chip`: tried as the background of the player strips (`.sch`); the tray's handles and wide border sit under the name and score and make them unreadable at 60-90 px, so it was taken out again. It needs a layout that gives the tray room (a bigger Players sheet row), an owner decision.
