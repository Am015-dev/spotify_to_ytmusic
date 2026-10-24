# Licences of the Racers study sources (checked 2026-10-24)
Alex: the code is open source and may be used; we are not copying the assets.

| Repo | Licence | What we may do |
|---|---|---|
| isledecomp/racers, racers-portable | LGPL-3.0 (LICENSE in racers verified) | Port logic into **its own src file** with an LGPL header + attribution (repo@SHA, path, function). That file stays LGPL. |
| isledecomp/warp.parts | MIT | Port freely; keep the copyright notice. |
| Laupetin/Lego-Racers-Mod | GPL-3.0 | File formats as **facts only**. Porting its code would make the whole game GPL: don't, without Alex's OK. |

## Never
No LEGO assets: no models, textures, sounds or data files from the game.

## Excerpts in this wiki
Short (<= 30 lines), only where the logic matters, labelled repo@SHA, path, function, licence. Longer ones go to `racers/code/<topic>.md` (<= 4 KB each). Whole repos are never vendored: `bash tools/racers_fetch.sh` clones them at the pins into git-ignored `ref/racers/`.
Pins: [racers.md](racers.md). Rules: [../SCHEMA.md](../SCHEMA.md).
