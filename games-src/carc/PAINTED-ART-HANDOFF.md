# Rampart & Vine: painted art hand-off (laptop → Linux session, 2026-10-09)

Rampart draws its board in code (SVG tiles in `game/src/geo.js`). The laptop made Google Flow paintings as **separate files** in `games/rampart-and-vine/media/` (WebP); the Linux session wires them in, tests and deploys. Follow the Sands pattern in `../ft/PAINTED-ART-HANDOFF.md`.

## Media
- **Portraits** `camp-<id>.webp`, 256×256: every name in `campaign.json` (`tamsin`, `garnet`, `hob`, `wren`, `mabry`, `quill`, `ferro`, `dulcie`, `ostrand`, `isolde`, `corvin`) and `baron`. Set `artBase: 'media/'` in the `GXC.init` call (`game/src/camp.js:20`).
- **Tile backs** (300×426): `back-default`, `back-tavern`, `back-raven` (the campaign `cardback` unlocks).
- **Tables** (1376×768): `table-default` (new default), `table-harvest`, `table-riverbank`, `table-sable-hall` (`table` unlocks). `table-default-phone` (768×1376) for portrait.
- **Key art:** `title.webp` / `title-phone.webp`, `end-win.webp`, `end-lose.webp`.
- **Pieces** (256×256, transparent): `piece-meeple` (follower), `piece-champ` (champion), `piece-mason` (builder), `piece-hog` (pig). Can replace the drawn follower figures; keep the player colour as a ring or base under them.
- **Field textures** `tex-<k>.webp` (512×512, tileable): `field`, `road`, `river`, `lake`, `garden`, `hedge`, `hub`, `wall`, `mon` (monastery grounds), `town-basilica`, `town` (cobbles, circular pattern: may show a seam when tiled), `roof`. Use them as SVG `<pattern>` fills **under** the existing shapes in `geo.js` (`PAL.field`, towns, roads); keep the edges and lines that make tiles match. Keep the flat colours on Low graphics.
- About 2.4 MB in total; load them as files, not base64.

## Licence
Google Flow (Nano Banana) image generation from our own prompts, with no reference to the original game, its art or its publisher. Add a credit line to the game's credits and `kit/ASSETS.md`.
