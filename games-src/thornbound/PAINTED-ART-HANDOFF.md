# The Thornbound Throne: painted art hand-off (laptop → Linux session, 2026-10-09)

The laptop made the pictures; the Linux session wires them in, tests and deploys. The same pattern is already done for Doorkick Dungeon: see `../munch/PAINTED-ART-HANDOFF.md`.

## Card art: `art/<id>.webp` + `art/manifest.json`
- 51 paintings (all kingdom cards), 256×256 WebP. `<id>` is the card `id` in `game/src/data.js` `KC` (`kc01`–`kc51`, for example `kc07` = The Lighthouse).
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

## Wired (2026-10-08)
- Kingdom cards: `build.py` embeds `art/*.webp` as `TB_ART` (blob URLs in `ui1.js`); `kcSpec` sets `img`, the kit's `paintedArt()` draws it with `slice` (kc27 keeps the drawn art). Kit: edit `kit/kit.js` directly (`kit/parts/` is stale).
- Extras in `ui13.js`: face-down card back (`back-default`, or the latest `cardback` unlock), table behind the map (`table-court` / `-phone`, or the latest `table` unlock; CSS vignette; CSS only while loading and on Low graphics). Portraits through `GXC.init({artBase:'media/'})`, title key art in `titleArt()`, end art in `overHTML()`.
- Music: `games/thornbound/music/*.mp3` (a and b of tavern/main/fight/victory/defeat), `audio-data.js` points at them. `ui14.js` picks the track per screen (title = tavern, game = main, final round = fight, end card = victory/defeat) and has the Music panel (Menu, Settings and the title screen). Music is now on by default (`tb_mus` = 0 turns it off); choices are saved in `tb_mpick`.
- Page size: 1.25 MB -> 1.82 MB. Screenshots: `playtest/`.
