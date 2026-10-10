# Short Fuse: painted art hand-off (laptop → Linux session, 2026-10-09)

Short Fuse had no raster art; everything was drawn in code. The laptop made the pictures; the Linux session wires them in, tests and deploys. Follow the Doorkick pattern in `../munch/PAINTED-ART-HANDOFF.md`.

## Card art: `art/<key>.webp` + `art/manifest.json` (32 paintings, 256×256)
Keys are exactly the object keys in `game/src/data.js`:
- **`EQUIP`** (18 equipment cards): `eq1`–`eq12`, `eqY`, `eq22`, `eq33`, `eq99`, `eq1010`, `eq1111`.
- **`CHARS`** (9 crew busts): `ch_captain` (Foreman Brix), `ch_base1`–`ch_base4`, `ch_new1`–`ch_new4`.
- **`ITEMS`** (5 personal tools): `dd`, `sweep`, `handsets`, `pt3`, `pt10`.

Style: workshop gouache, warm lamplight against cool blueprint blues, brass and copper wire.

Wiring:
1. Embed in `game/build.py` as `var SF_ART` (copy `art_js()` from `../kaiten/game/build.py`).
2. Show the picture in the equipment card window, on the crew pick and the seat, and on the personal-tool chip.
3. Budget: the page is 1.84 MB now. The 32 pictures add about 0.5 MB as base64.

## Media files: `games/short-fuse/media/` (separate files)
- **Portraits** `camp-<id>.webp`, 256×256: `brix`, `tally`, `wren`, `rig`, `quill` (the clockmaker), `mole` (The Weak Link).
  - Brix, Tally and Wren match their crew cards.
  - Set `artBase: 'media/'` in the `GXC.init` call.
- **Card backs** `back-default.webp` (the equipment deck) and `back-clock-key.webp` (the campaign `cardback` unlock `clock-key`).
- **Tables:**
  - `table-workbench` is the new default defusal workbench with a calm centre; the page has no table image yet, so add it behind the board like the other games.
  - `table-tower-floor` and `table-clockface` are the campaign `table` unlocks.
- **Key art:** `title.webp`, `end-win.webp` and `end-lose.webp`. `title-phone.webp` is the portrait title; a phone table is still to come (crop `table-workbench` until then).

## Music
`../audio/short-fuse/treblo/`: ten Treblo instrumentals (5 cues × a/b). See the README there.

## Licence
Google Flow (Nano Banana) image generation from our own prompts, with no reference to the original game, its art or its publisher. Add a credit line and log it in `kit/ASSETS.md` (or the game's credits).
