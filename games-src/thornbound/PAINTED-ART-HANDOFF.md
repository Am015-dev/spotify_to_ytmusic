# The Thornbound Throne: painted art hand-off (laptop → Linux session, 2026-10-09)

The laptop made the pictures; the Linux session wires them in, tests and deploys. The same pattern is already done for Doorkick Dungeon: see `../munch/PAINTED-ART-HANDOFF.md`.

## Card art: `art/<id>.webp` + `art/manifest.json`
- 50 paintings, 256×256 WebP, one per kingdom card. `<id>` is the card `id` in `game/src/data.js` `KC` (`kc01`–`kc51`, for example `kc07` = The Lighthouse).
  - **Missing:** `kc27` (Herald of Applause). Flow failed it once; it follows in the next push. Keep the drawn art as the fallback for it.
- Style: dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit.
- Wiring (same as Doorkick):
  1. Embed in `game/build.py` as `var TB_ART` (copy `art_js()` from `../kaiten/game/build.py`).
  2. Where a kingdom card draws its picture, use `TB_ART[card.id]` when it exists.
  3. Use `object-fit: cover`.
- The faction Basic cards (14 per faction, identical in function) are not painted. They could use the faction colour with the default card back.
- The originals (1024 px JPEG) are on the laptop in `Desktop\game-assets\cards\thornbound\`, with the prompts in `cards.json`.

## Media files: `games/thornbound/media/` (separate files, not inlined)
- **Portraits** `camp-<id>.webp`, 256×256: `ysolde`, `tamsin`, `fennick`, `halvard`, `quill`, `rook`, `sable`, `ida`, `orlen`, `stag`.
  - These are the file names `campaign.json` already uses. Set `artBase: 'media/'` in the `GXC.init` call.
- **Card backs** `back-<id>.webp`, 300×426:
  - `default` (the thorn crown) and `court` (the crowned stag).
  - `council-seal` and `moth-wing` are the campaign `cardback` unlocks with the same ids.
- **Tables** `table-<id>.webp`:
  - `court` (desktop) and `court-phone` are the new default candlelit war-council table with a clear centre.
  - `lantern-night` and `throne-hall` are the campaign `table` unlocks.
- **Key art:** `title.webp` / `title-phone.webp` (the empty thorn throne with four factions closing in; clear top for the logo), `end-win.webp` (coronation) and `end-lose.webp` (the discarded crown).

## Music
`../audio/thornbound/treblo/`: ten Treblo instrumentals (5 cues × a/b). See the README there.

## Licence
Google Flow (Nano Banana) image generation from our own prompts, with no reference to the original game, its art or its publisher. Add a credit line to the game's credits and `kit/ASSETS.md`.
