# Source pins: LEGO Racers study (read 2026-10-24)
Raw sources are third-party and immutable. We store only these pins; nothing is vendored. Code is proprietary decompiled output: read it, never copy it.

| Repo | Pinned HEAD (git ls-remote, 2026-10-24) | What it is |
|---|---|---|
| github.com/isledecomp/racers | 5bb9f133b5e14d5d060ea7f8d3897ec52ef382f2 | Decompilation of LEGO Racers. Paths in the racers pages are under `LEGORacers/` |
| github.com/isledecomp/racers-portable | 9f9d72b7df813a1b42a94e3dcf32435134d6c9ed | Same code ported (cross-platform) |
| github.com/isledecomp/warp.parts | 6994d32b7f8b7a716978b832a5cb03452ea5d660 | Svelte launcher that runs racers-portable as WebAssembly and streams LEGO.JAM; no game logic |
| github.com/Laupetin/Lego-Racers-Mod | b0959faaeb6cf47acd33e58183edd3484ee6242b | JAM/GDB tools; README lists asset types only |

## Re-fetch
`git ls-remote https://github.com/isledecomp/racers HEAD` (same for the others) shows if the pin moved.
To read: `git clone --depth 1 https://github.com/isledecomp/racers <scratch dir>` (scratch dir, never inside the repo), then `git -C <dir> checkout 5bb9f13` if you need the pinned state. Delete the clone afterwards.
Via the GitHub MCP tools: `get_file_contents` with ref = SHA.

## Rules
- Our design summary: [../../DESIGN_racers_rebuild.md](../../DESIGN_racers_rebuild.md). Pages: [../index.md](../index.md).
- Units are the game's internal ones (speed per ms, model units): compare ratios.
- If a pin moves, re-check function names in the racers pages before trusting them; log it in [../log.md](../log.md).
