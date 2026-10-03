# Short Fuse (Bomb Busters-style co-op) — work in progress

Snapshot saved before a pause. Not on the shelf yet.

## Done
- Rules research (`rules-notes.md`, `sources.md`) and data for all 66 jobs (`missions.json`), tools (`equipment.json`) and crew (`characters.json`).
- Engine, per-seat knowledge model and computer teammates (`game/src/`): gauntlet, coverage, hidden-info and rules tests (`game/*.js`, `game/ENGINE-REPORT.md`).
- Cartoon 3D kit (`kit/kit.js`, `kit/demo.html`), CC0 audio (`audio/`, credits in `audio/credits.html`).
- UI integration in progress: `game/ui.js`, `head.html`, `body.html`, `build.py` -> `game/shortfuse.html`.

## Next
1. Finish the UI integration and check layout at 4 sizes; look at the screenshots.
2. Stronger computer teammates on the jobs they never win (29, 43, 45, 47, 51, 61, 64, 65, 66), in `game/src/ai.js` only.
3. Online P2P (`games-src/net/`), PerfHUD checks, newcomer review, rules audit.
4. Shelf entry with a real screenshot cover, copy the built page to `games/short-fuse/`, push, check the live site.
