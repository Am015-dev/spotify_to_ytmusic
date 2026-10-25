# Licences (checked 2026-10-24)
**The game is GPL-3.0-or-later** (Alex, 24 Oct: "yes i am fine"; LICENSE at the repo root). GPL/LGPL/MIT/BSD/zlib/Apache code may be ported with attribution. Never: leaked or unlicensed code (e.g. GTA V browser ports, re3/reVC, SM64 decomp) and never any game assets.

Alex: the code is open source and may be used; we are not copying the assets.

| Repo | Licence | What we may do |
|---|---|---|
| isledecomp/racers, racers-portable | LGPL-3.0 (LICENSE in racers verified) | Port logic into **its own src file** with an LGPL header + attribution (repo@SHA, path, function). That file stays LGPL. |
| isledecomp/warp.parts | MIT | Port freely; keep the copyright notice. |
| Laupetin/Lego-Racers-Mod | GPL-3.0 | May be ported (the game is GPL-3.0 since 24 Oct). |
| JulianBiancardi/cuphead (Unity Cuphead recreation) | MIT | Reference for project organisation. Code may be ported with the MIT notice; NEVER its art or music (Cuphead is StudioMDHR's). |
| supertuxkart/stk-code | GPL-3.0 | May be ported: own src file, header with repo@SHA, path, function. Code only, no STK assets. |

## Never
No LEGO assets: no models, textures, sounds or data files from the game.

## Excerpts in this wiki
Short (<= 30 lines), only where the logic matters, labelled repo@SHA, path, function, licence. Longer ones go to `racers/code/<topic>.md` (<= 4 KB each). Whole repos are never vendored: `bash tools/racers_fetch.sh` clones them at the pins into git-ignored `ref/racers/`.
Pins: [racers.md](racers.md). Rules: [../SCHEMA.md](../SCHEMA.md).
