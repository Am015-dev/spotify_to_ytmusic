# Thornbound: wired R3 (W355)

**3D models: 2 of 2 wired.**
- `crown` -> `models/crown@512.webp` on the winner banner (ui4.js), already wired.
- `throne` -> `models/throne@512.webp` (new): hero picture at the top of the Kingdom sheet (tap the throne on the map), `popKingdom` in ui4.js, hidden on low graphics and when the file is missing. The painted `media/throne.webp` stays as the map centrepiece.

**2D wired: 5.**
- `back-council-seal`, `back-moth-wing` -> card backs unlocked by campaign rewards (ui13.js, name built at runtime).
- `table-lantern-night`, `table-throne-hall` -> tables unlocked by campaign rewards (ui13.js).
- `ui-sheet-head` is loaded for the drawer header (verified, not new).

**Superseded: 4.** `ui-button-go`, `ui-button-power`, `ui-round-shield` (`-c` versions loaded), `ui-sheet` (`ui-sheet-c` loaded).

**Prompts superseded: 0.**

**Still unused: 0** (the 59 manifest slots listed in the asset check are prompted, not delivered).
