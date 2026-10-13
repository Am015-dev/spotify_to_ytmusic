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

## Pipeline status (2026-10-13, afternoon)

Every Flow image is generated, voted and pushed. The open work is wiring.

| Asset | Made | In repo | Wired into a game |
|---|---:|---:|---:|
| 2D facelift paintings (Waves 0-5, `games/<game>/media/`) | 715 | 715 | 37 (Sands 30, Crown 7) |
| 3D models (`games/<game>/models/`) | 59 approved | 59 | 67 GLBs placed in 15 games (cloud workers, 13 Oct) |
| Animation clips (`games-src/anims/`) | 3 (Voltusk idle/attack, Adler take 1) | 3 | 0 |
| Nightrun boss pose stills (`games-src/anims/mainhattan-nightrun/poses/`) | 68 of 76 | 68 | n/a (video references) |
| Treblo cover art (`games-src/audio/covers/`) | 17 | 17 | n/a (track artwork) |
| Music (Treblo) | all games | all | per handoff |

Not pushed on purpose: rejected/candidate GLBs (`viewer/glb`, 576 MB), TRELLIS inputs, superseded v2/v3 sources,
ComfyUI test outputs, contact sheets, the old Suno originals (replaced by Treblo).

### Pending: Linux (wiring)
1. Wire the 678 pushed-but-unused paintings, biggest first: Crown City Smash 198 (182 power cards), Sands 102,
   Rampart 38, Shipwreck 37, Doorkick 33, Nebula 32, Final Approach 29, Lantern Dive 28, Thornbound 28, the rest 19-23.
2. Wire the clips in `games-src/anims/` once the owner approves them in `anims.html`.

### Pending: Windows (generation)
1. Nightrun: 8 pose stills (Kronos atk1-4, Messe-Waechter atk1-4) and 13 base perk icons (`games/missing.html`).
2. Adler boss loop: ffmpeg ping-pong (free) or one more H3 bridge take (~9 min A100, owner OK needed). The other
   9 Nightrun bosses and the Crown monsters wait until one loop is accepted.
3. Optional 3D gap fix, 4 items (sw-shelter, tower-c, sw-palm-b, sun): owner ruled the holes acceptable.
4. Refresh the online snapshot after changes: `export_static.py`, push `games/asset-viewer`.

### Owner decisions open
1. Adler loop: free ping-pong, or a paid loop take.
2. From `games-src/HANDOFF.md`: replace the few CC BY tracks; open games as separate pages instead of the shelf iframe.
