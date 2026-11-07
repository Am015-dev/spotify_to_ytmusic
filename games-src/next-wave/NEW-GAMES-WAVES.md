# New games: art waves for Google Flow (2D only)

Do not over-invest in art: generate each wave in one Flow session, drop the files in, done. Every picture is a named slot; a file `media/<stem>.webp` is drawn with no code change, a missing one keeps its code-drawn placeholder.

**How to read the tables.** Each prompt file holds one wave and one image ratio, so a Flow run = one file at one aspect. Paste the `cards` prompts of a file (key = the file name to save as, value = the prompt, the game's style block is already at the front). Flow offers 16:9, 4:3, 1:1, 3:4 and 9:16: use the `flow_aspect` written in the file; ingest centre-crops and resizes to the exact size. Do waves in order; wave 1 is enough to see each game with real art.

**After generating (3 steps).**
1. Save each result as `<stem>.webp` or `<stem>.png` (the key in the json) into `assets-inbox/<slug>/`. Pictures of things (icons, tokens, characters, fx, frames) are on flat white: leave the white, ingest keys it to transparent.
2. Run `python3 games-src/scripts/ingest-assets.py --check --slug <slug>`, then without `--check`. Read the PASS/WARN lines (a WARN for size under 1024 px or a wrong ratio means: generate again at the full size).
3. Tell the orchestrator. It runs the `register-assets.py` of the game once at merge time, then the one `build-all.py --deploy` call (the page lists `media/` at build time).


## Redline Rally (`redline-rally`): 37 pictures

Folder: `games-src/next-wave/flow-2d/redline-rally/`. Drop into `assets-inbox/redline-rally/`.

**Flow references:** for the two track pictures (`track-sunline`, `track-hairpin`), attach `games-src/redline-rally/guides/track-sunline.svg` and `games-src/redline-rally/guides/track-hairpin.svg` in Flow as layout references (export each to png first if Flow does not take svg).

| wave | count | prompt file to paste | Flow aspect | exact size(s) |
|---|---:|---|---|---|
| 1 | 1 | `prompts-wave1-ratio-16x5.json` | 16:9 (target 16:5) | 512x160 (ui) |
| 1 | 1 | `prompts-wave1-ratio-1x1.json` | 1:1 (target 1:1) | 512x512 (portrait) |
| 1 | 6 | `prompts-wave1-ratio-2x1.json` | 16:9 (target 2:1) | 256x128 (token) |
| 1 | 2 | `prompts-wave1-ratio-5x3.json` | 16:9 (target 5:3) | 2000x1200 (board) |
| 1 | 7 | `prompts-wave1-ratio-5x7.json` | 3:4 (target 5:7) | 500x700 (card) |
| 1 | 1 | `prompts-wave1-ratio-9x16.json` | 9:16 (target 9:16) | 1080x1920 (bg) |
| 2 | 7 | `prompts-wave2-ratio-1x1.json` | 1:1 (target 1:1) | 128x128, 256x256, 512x512 (icon, portrait, ui) |
| 3 | 5 | `prompts-wave3-ratio-1x1.json` | 1:1 (target 1:1) | 128x128, 512x512 (icon, ui) |
| 3 | 5 | `prompts-wave3-ratio-4x3.json` | 4:3 (target 4:3) | 512x384 (fx, ui) |
| 3 | 1 | `prompts-wave3-ratio-8x3.json` | 16:9 (target 8:3) | 512x192 (ui) |
| 3 | 1 | `prompts-wave3-ratio-9x16.json` | 9:16 (target 9:16) | 1080x1920 (bg) |
| total | 37 | wave 1: 18, wave 2: 7, wave 3: 12 | | |

## Emberclimb (`emberclimb`): 220 pictures

Folder: `games-src/next-wave/flow-2d/emberclimb/`. Drop into `assets-inbox/emberclimb/`.

| wave | count | prompt file to paste | Flow aspect | exact size(s) |
|---|---:|---|---|---|
| 1 | 8 | `prompts-wave1-ratio-1x1.json` | 1:1 (target 1:1) | 128x128, 256x256, 768x768 (icon, portrait, token, ui) |
| 1 | 4 | `prompts-wave1-ratio-3x4.json` | 3:4 (target 3:4) | 768x1024 (portrait) |
| 1 | 8 | `prompts-wave1-ratio-4x3.json` | 4:3 (target 4:3) | 512x384 (card) |
| 1 | 5 | `prompts-wave1-ratio-5x7.json` | 3:4 (target 5:7) | 500x700 (card, ui) |
| 1 | 3 | `prompts-wave1-ratio-9x16.json` | 9:16 (target 9:16) | 1080x1920 (bg) |
| 2 | 59 | `prompts-wave2-ratio-1x1.json` | 1:1 (target 1:1) | 128x128, 256x256, 768x768 (icon, portrait, token) |
| 2 | 107 | `prompts-wave2-ratio-4x3.json` | 4:3 (target 4:3) | 512x384 (card) |
| 2 | 3 | `prompts-wave2-ratio-5x7.json` | 3:4 (target 5:7) | 500x700 (ui) |
| 2 | 10 | `prompts-wave2-ratio-9x16.json` | 9:16 (target 9:16) | 1080x1920 (bg) |
| 3 | 11 | `prompts-wave3-ratio-1x1.json` | 1:1 (target 1:1) | 192x192, 256x256 (fx, token) |
| 3 | 2 | `prompts-wave3-ratio-9x16.json` | 9:16 (target 9:16) | 1080x1920 (bg) |
| total | 220 | wave 1: 28, wave 2: 179, wave 3: 13 | | |

## Twin Thrones (`twin-thrones`): 126 pictures

Folder: `games-src/next-wave/flow-2d/twin-thrones/`. Drop into `assets-inbox/twin-thrones/`.

| wave | count | prompt file to paste | Flow aspect | exact size(s) |
|---|---:|---|---|---|
| 1 | 1 | `prompts-wave1-ratio-15x2.json` | 16:9 (target 15:2) | 1800x240 (board) |
| 1 | 1 | `prompts-wave1-ratio-16x9.json` | 16:9 (target 16:9) | 2048x1152 (bg) |
| 1 | 5 | `prompts-wave1-ratio-1x1.json` | 1:1 (target 1:1) | 2048x2048, 256x256, 512x512 (bg, icon, portrait, token) |
| 1 | 2 | `prompts-wave1-ratio-5x1.json` | 16:9 (target 5:1) | 1500x300 (board) |
| 1 | 18 | `prompts-wave1-ratio-5x7.json` | 3:4 (target 5:7) | 500x700 (card) |
| 2 | 10 | `prompts-wave2-ratio-1x1.json` | 1:1 (target 1:1) | 256x256 (token) |
| 2 | 58 | `prompts-wave2-ratio-5x7.json` | 3:4 (target 5:7) | 500x700 (card) |
| 2 | 12 | `prompts-wave2-ratio-7x5.json` | 4:3 (target 7:5) | 700x500 (card) |
| 3 | 2 | `prompts-wave3-ratio-16x9.json` | 16:9 (target 16:9) | 2048x1152 (bg) |
| 3 | 17 | `prompts-wave3-ratio-1x1.json` | 1:1 (target 1:1) | 256x256, 512x512 (fx, icon) |
| total | 126 | wave 1: 27, wave 2: 80, wave 3: 19 | | |

## Needs a human eye
- Redline Rally tracks (`track-sunline`, `track-hairpin`): the prompt says "match the reference outline"; attach `games-src/redline-rally/guides/track-<name>.svg` (export to png first) as the Flow reference image, then check the drawn loop against the guide.
- Redline Rally: `ui-engine-tray`, `icon-stress`, `icon-gear`, `icon-lap`, `icon-place` and Emberclimb `fx-fire-burst` have no code slot yet (all wave 3): a wiring worker must add them before delivery is visible. The 3 reserved upgrade-deck backs were removed (not in the base rules).
- Twin Thrones: its `ui.js` is being rebuilt by another worker, so its slots were checked against data and `assets.json` only (all 73 cards, 12 wonders, 10 tokens, 7 science, 5 resources have a stem), not against the new UI code; check each stem is requested once that file lands.
- Wide strips (Twin Thrones `military-board` 15:2, `city-board-*` 5:1; Redline `ui-gear-dial` 16:5, `ui-engine-tray` 8:3) are generated at 16:9 and cropped by ingest: look at the crop.
- `ingest-assets.py` treats every stem listed in a game's `games-src/<slug>/assets.json` as wired (the page loads it by stem), so these three games no longer show a false "WIRING NEEDED".
- Alpha pictures key with `scipy` (`pip install scipy`) when it is installed; without it ingest prints one `keying path:` line and uses a plain near-white threshold instead (edges need a look; pose sets then lose the shared feet line).
- Emberclimb frames and rarity gems (`frame-*`, `gem-*`) must keep the empty window at y 14%-53% and everything else white; check them first.
