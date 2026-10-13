# Asset viewer (facelift production pipeline)

Local review tool for the facelift art: 3D model Keep/Redo votes, 2D Flow image votes, Flow budget planner,
game screens with painted art in place, animation clips.

Source of truth is the Windows laptop copy (`Desktop\game-assets\viewer`); this folder is a code-only copy.
Sync direction: laptop -> repo. Large data (`glb/`, `src/`, `media/`, `flowthumbs/`, Flow images) is not in git.

Online (read-only snapshot): https://am015-dev.github.io/spotify_to_ytmusic/asset-viewer/ (Production board, Flow Planner,
Asset Board). Refresh it with `python viewer/export_static.py`, then push `games/asset-viewer` (Pages deploys `games/`).

## Run

```sh
CROWN_REPO=/path/to/repo GAME_ASSETS=/path/to/game-assets python3 serve.py   # -> http://127.0.0.1:8765/
```

| Env | Default (laptop) | Used for |
|---|---|---|
| `CROWN_REPO` | `C:\Users\kourisa\crown-media\repo` | `/game/`, `/repo/`, pushed-file checks, `games-src/facelift-3d` |
| `GAME_ASSETS` | parent of this folder | `flow-2d/`, `flow-3d/`, `flow-covers/`, `flow-video/`, `logs/` |
| `FLOW_LOGS` | `C:\Users\kourisa\Google-Flow_MCP\logs` | 24 h Flow budget |
| `FLOW_DAY_LIMIT` | 380 | Flow images per rolling 24 h |

Needs Pillow (`flow_status.py` makes thumbnails).

| Page | Works with repo only? |
|---|---|
| `screens.html` Game Screens | yes (`/game/`, `/repo/`) |
| `anims.html` Animations | page yes, clips need `GAME_ASSETS/flow-video` |
| `index.html` TRELLIS Models | needs `glb/` + `src/` (approved models are in `games-src/facelift-3d/`) |
| `assets.html`, `board.html`, `flow.html` | need `GAME_ASSETS/flow-*` images (empty lists without them) |
| `media.html` | needs `media/` (ComfyUI outputs) |

`/run` (start a Flow lane) is Windows-only: it opens PowerShell and talks to Chrome on CDP 9222.

## Pipeline status (2026-10-13)

All Flow image waves are generated. Delivery into `games/<game>/media/` is the open work.

| Wave | Generated | Voted ok | Not voted | Prepped (WebP) | Pushed |
|---|---:|---:|---:|---:|---:|
| 0 Sands kit pilot | 41 | - | - | 41 | 41 |
| 1 High, unique pieces | 140 | 8 | 132 | 0 | 0 |
| 2 Crown City Smash | 191 | 64 | 127 | 0 | 0 |
| 3 Medium, unique pieces | 120 | 48 | 72 | 0 | 0 |
| 4 Kit re-runs | 210 | 84 | 88 | 38 | 38 (CCS, Doorkick, Nebula Aces) |
| 5 Low (Hollowbough, Nightrun) | 13 | 5 | 8 | 0 | 0 |
| 3D sources / Covers | 66 / 17 | | | | 3D: 59 approved GLBs in `games-src/facelift-3d/` |

Next, in order:
1. Windows: finish 2D votes (427 not voted) in `assets.html`.
2. Windows: prep approved images to WebP (`prep_kit.py` covers Wave 4; Waves 1-3 and 5 have no prep script yet) and push per game.
3. Linux: wire pushed `media/*.webp` into each game (same as the Doorkick handoff, `games-src/munch/PAINTED-ART-HANDOFF.md`).
4. Windows: 8 Nightrun boss pose images missing (Kronos atk1-4, Messe-Waechter atk1-4); the Flow run stopped on 2026-10-11 when the browser closed.
5. Adler boss video loop (MiniMax H3 on the A100): take 2 did not close the loop; ping-pong loop in ffmpeg is the cheap fallback. VM is stopped.
