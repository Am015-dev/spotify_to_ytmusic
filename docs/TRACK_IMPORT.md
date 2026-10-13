# Track import: from a builder code to an official race

Alex builds tracks in the game (home → 🛠 BUILDER, or Race tab → 🛠 TRACK BUILDER), then taps **⧉ EXPORT** and sends the `ODT1:…` code.
(In the Track Lab artifact, 💾 also saves the track to the db collection `tracks`, so it is already shared with the team.)

## Worker steps
1. Save the code to a file (`code.txt`), or pass it as one argument.
2. `node tools/tbImport.mjs code.txt --id tb_<short_name>` decodes the code, writes `docs/tracks/<id>.json` and prints the lint (docs/TRACK_FUN.md).
   Fix red rules with Alex (or in the builder: IMPORT the code, edit, EXPORT again). Do not ship a track with red rules unless Alex asks for it as it is.
3. `node tools/tbImport.mjs code.txt --id tb_<short_name> --add` puts the track into `TB_BUILTIN` (src/98tb_track_builder.js), the one registry entry.
   Built-in tracks show under MY TRACKS (Race tab, per city) and in the builder list for every player; they run as open courses (98ro).
4. `tools/build.sh <ver> --local`, then the gate: `TRACK='<track name>' LAPS=2 node tools/tRace.js http://127.0.0.1:8766/local_dbg.html qa_<id>`
   (0 errors, wall hits/min ≤ 0.5, stuck ≤ 3 %), shots in one grid, reviewer PASS, DEPLOY message to the coordinator.

## Loading a code back in the game
Builder → ◀ (MY TRACKS) → PASTE A TRACK CODE → IMPORT. The track opens in the editor and is saved on the device.
