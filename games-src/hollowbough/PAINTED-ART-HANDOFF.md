# Hollowbough: painted art hand-off (laptop → Linux session, 2026-10-09)

The laptop made the pictures; the Linux session wires them in, tests and deploys. The same pattern is already done for Doorkick Dungeon: see `../munch/PAINTED-ART-HANDOFF.md`.

## Card art: `art/<key>.webp` + `art/manifest.json`
- 48 paintings (every card), 256×256 WebP, about 830 KB (about 1.1 MB as base64). `<key>` is the card's `role`, which `game/gen-data.py` writes as `key` in `HB.DATA.cards` (for example `architect` = Master Lathwright).
- Style: storybook watercolour and gouache, woodland critters and buildings in autumn colours.
- Wiring (same as Doorkick):
  1. Embed in `game/build.py` the way `../kaiten/game/build.py` `art_js()` does, as `var HB_ART`.
  2. Where the card face draws its picture, use `HB_ART[card.key]` when it exists.
  3. Use `object-fit: cover`, because the card window is not square.
- Budget: the page is 1.0 MB now and will be about 2.1 MB with the art.
- The originals (1024 px JPEG) are on the laptop in `Desktop\game-assets\cards\hollowbough\`, with the prompts in `cards.json`.

## Media files: `games/hollowbough/media/` (separate files, not inlined, 1.9 MB)
- **Portraits** `camp-<id>.webp`, 256×256: `hazel`, `bramble`, `fern`, `quill`, `thistle`, `grimbeard`.
  - These are the file names `campaign.json` already uses. Set `artBase: 'media/'` in the `GXC.init` call.
- **Card backs** `back-<id>.webp`, 300×426:
  - `default` (the main deck) and `meadow` (the meadow row).
  - `sprout` and `frost` are the campaign `cardback` unlocks with the same ids.
- **Tables** `table-<id>.webp`:
  - `woodland` (desktop) and `woodland-phone` are the new default tree-stump table with a clear centre.
  - `frostwood` and `elderheart` are the campaign `table` unlocks.
- **Key art:** `title.webp` / `title-phone.webp` for the title screen (clear sky at the top for the logo), `end-win.webp` and `end-lose.webp` for game over.

## Places and events (2026-10-09)
39 paintings in `art/`, named by the in-game key. They replace the SVG drawings returned by `spotArt(kind, key, i)` in `game/src/ui10.js`.
- `forest_*` (11), `bev_*` (4) and `sev_*` (16): 256×256, for the square spot art (`kind` `forest`, `bev`, `sev`).
- `basic_*` (8): 320×205 (100:64, the same shape as the `basic` SVG viewBox).
- To wire them, add each key to `art/manifest.json` `items` so `build.py` `art_js()` embeds it in `HB_ART`. Then have `spotArt` return an `<img>` (or a background) from `HB_ART[key]`, and keep the SVG as the fallback when the key is missing. About 1 MB in total if every key is embedded.
- Also see `../BOARD-ART-AUDIT.md` (the `.tbl` CSS layer hides the painted table).

## Music
`../audio/hollowbough/treblo/`: ten Treblo instrumentals (5 cues × a/b). See the README there.

## Licence
Google Flow (Nano Banana) image generation from our own prompts, with no reference to the original game, its art or its publisher. Add a credit line to the game's credits and `kit/ASSETS.md`.
