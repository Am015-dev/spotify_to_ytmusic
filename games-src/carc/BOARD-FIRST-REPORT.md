# Rampart & Vine: board-first rework and story mode (6 Oct 2026)

## What changed
- **UI replaced** (`game/src/bf.js`, `camp.js`, `icons.js`, new `head.html`/`body.html`): the 3D view, dock panels, advice cards,
  players/log/tiles drawers and the online strip are gone. The old `ui.js`, `phone.js`, `three3d.js`, `net.js`, `rules-html.js`
  and the local `shell.js/css` copies were removed. Engine (`engine.js`), computer players (`ai.js`), tile drawing (`geo.js`),
  sound and the rules are unchanged.
- **The valley is the screen** (`#board`, `data-board`): 79% of a 390x763 screen. Drag to move, pinch or wheel to zoom; the view
  re-fits every turn (rotation and resize go through `gx-viewport.js`).
- **Your turn on the map:** the drawn tile sits big at the bottom. Tap it to turn it (only turns that fit somewhere). Glowing squares on the map show
  the tile as it would lie; tap one to place it. The view then zooms to the placed tile and glowing follower spots appear on it (follower, champion,
  mason, hog); tap one, or "Skip".
- **Computer turns animate** (about 0.65 s per tile, 0.45 s per follower; tap the board to speed up; menu has a fast setting).
- **Scores pop where earned:** finished features light up, "+N" flies to the seat chip, the follower goes home. At the end every unfinished feature scores in turn, then the result card.
- **One status line of 8 words or fewer.** No tips, panels or advice cards in any mode.
- **Ghost finger** on the first game (first two turns) and in story chapters with hints: it points at the computer's normal-level pick (same evaluation, so hint = finger).
- **Story mode** with the shared kit: 10 chapters in 3 acts (`campaign.json`), bosses c4 (6-point head start), c7 (boss opens) and c10 (15-point head start); c9 adds a follower.

## Checks
`game/sweep.js` (24 full games at 390x763 and 375x553 with touch taps on glowing targets only, rotations, 3 story chapters, chapter-1 simulation),
`game/rotate-test.js`, engine tests (`graph_test.js`, `geo_test.js`, `cover.js`, `gauntlet.js`) and `build-all.py rampart-and-vine` (phone-check).
Online play (peer-to-peer) was dropped with the old UI; the engine still has no network code in it.
