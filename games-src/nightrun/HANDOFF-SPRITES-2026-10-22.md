# Handoff: sprite sheets re-delivered, 22 Oct 2026 (sizes fixed)

All 105 actors in `games-src/anims/mainhattan-nightrun/sheets/` were rebuilt from the full-size originals (415 files: `<act>-strip.webp` + `.json`).
**These overwrite every earlier strip, including the S5 "owner's exports" in `bde25be3`.** Re-ingest all of them into `games/mainhattan-nightrun/media/anim/`.

## What changed
1. **One size per character, measured, not guessed.**
   - Real sizes in metres (e.g. bruiser 2.0 m, warden 2.2 m, tresor-wart 4.5 m tall). Every json now carries `metres`, `px_per_m` and `body` (px of the standing height).
   - Rigid actors (10 bosses, drone, turret, ...) were checked by feature matching (SIFT) of every state against every other state: all within 3% of idle.
   - Humans were checked by pose detection (RTMPose bone lengths: thigh, shin, torso), which does not change with the pose: all states within 5% of the reference state. 25 states were 5-13% too big (mostly run / melee / shoot) and are fixed.
2. **Grounded bosses stand on the floor.** bruecken-waechter, tresor-wart, talos, hoplite, messe-waechter and zentral-ice have feet/tracks on the bottom edge of the cell in every frame (0-2 px). Flying bosses (kronos, sek-adler, flusskrake, schranken-wart) stay vertically centred.
3. **Effects and weapons keep their soft smoke and fade-out.** The previous delivery had lost them (a double-alpha bug). They look more transparent on average because the smoke is back; this is correct.
4. **Ships:** hull-aligned, `ship_jitter.py` reports 0 sheets over 3 px.
5. **Cell sizes changed.** Every state of one character still has the same cell height, but the cell is often taller than the body (raised sword, smoke, horns). Example: kai cell 326 px, `body` 256 px.

## What Linux must pay attention to when wiring
1. **Scale by `body`, not by cell height.** The current rule (cell height = game height) now draws characters too small: kai would be 64 x 256/326 = 50 px instead of 64. Draw every frame at `gameHeight / body` (or `px_per_m` x metres), one scale per character, identical for all its states. If a json has no `body`, fall back to the cell-height rule.
2. **Feet = bottom edge of the cell.** Keep that anchor; do not anchor or scale per detected content (alpha bbox). That re-introduces size jumps (crouch/dash frames stretched, smoke/weapons shrink the body).
3. **Do not rescale crouch, dash, land or jump cells in code.** The sheet already carries the pose difference.
4. **Decode budget.** All sheets together are 126 Mpx (was 98 Mpx, +28%). Kai disappeared on the street stage with the earlier full-size ingest (`FQ.miss.kai`, branch `nr/full-size-assets`). Check the `ART.anim` budget and `FQ.miss.*` after ingest before merging.
5. **Checks after ingest:** `qa/spritecut.js` (no cut cells), every actor in the Lab viewers, and Kai visible on the street stage.

Details and the size rules: `games-src/ASSET-WIRING.md`, section 4 "Character sheets: one body size".
