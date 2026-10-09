# Sands of Qamar: painted art hand-off (laptop → Linux session, 2026-10-09)

Sands draws its board in code. The laptop made Google Flow paintings as **separate files** in `games/sands-of-qamar/media/` (WebP); the Linux session wires them in, tests and deploys. Follow the Doorkick pattern in `../munch/PAINTED-ART-HANDOFF.md`.

## Tiles `tile-<k>.webp` (384×384, top-down, opaque)
- One per `TILEDEF` key: `village`, `sacred`, `oasis`, `small`, `large`, `workshop`, `exchange`, `lake`, `city`.
- `tile-ravine` is still to come (Flow's safety check skipped it; it is queued again).
- Draw the painting inside the tile in `tileHtml(t)` (as a `background-image` under the existing icons and numbers), keyed by `t.k`. Keep the drawn tile as the fallback when a file is missing.

## Media
- **Portraits** `camp-<id>.webp`, 256×256: `farid`, `hadiya`, `layla`, `marwan`, `nimr`, `qadira`, `qays`, `sabah`, `tahir`, `yusra`, `zubaida`, `you`. Set `artBase: 'media/'` in the `GXC.init` call.
- **Card backs** (300×426): `back-default`, `back-copper`, `back-lamp` (the campaign `cardback` unlocks).
- **Tables** (1376×768): `table-default` (new default, calm centre), `table-workshop`, `table-court`, `table-night`, `table-palace` (`table` unlocks). `table-default-phone` (768×1376) for portrait.
- **Key art:** `title.webp` / `title-phone.webp`, `end-win.webp`, `end-lose.webp`.
- About 1.9 MB in total; load them as files, not base64.

## Music
`../audio/sands/treblo/`: ten Treblo instrumentals plus two short menu loops. See the README there.

## Licence
Google Flow (Nano Banana) image generation from our own prompts, with no reference to the original game, its art or its publisher. Add a credit line and log it in `kit/ASSETS.md` (or the game's credits).
