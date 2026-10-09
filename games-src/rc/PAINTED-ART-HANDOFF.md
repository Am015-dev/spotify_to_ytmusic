# Shipwreck Isle: painted art hand-off (laptop → Linux session, 2026-10-09). PART 1

Shipwreck Isle had no raster art. The laptop made the pictures; the Linux session wires them in, tests and deploys. Follow the Doorkick pattern in `../munch/PAINTED-ART-HANDOFF.md`.

## In this push: `art/<key>.webp` + `art/manifest.json` (256×256)
- **Beasts** `beast-<k>`, with `k` from `BEASTS` in `data.js`: 14 of 16. `alligator` and `birds` are still to come.
- **Inventions** `inv-<key>`, from `INVENTIONS`: all 30.
- **Items** `item-<key>`, from `ITEMS`: 6 of 8. `stormglass` and `bible` are still to come.
- **Card back** `games/shipwreck-isle/media/back-default.webp` (compass rose and rope emblem).

Style: tropical castaway gouache in turquoise, sand, jungle green and driftwood.

Wiring:
1. Embed in `build.py` as `var SW_ART`.
2. Show the picture on the beast, invention and item cards when it exists.
3. Keep the drawn art as the fallback.

## Still to come (part 2)
Generation paused because Google Flow started refusing with "unusual activity". These follow in a later push:
- Discoveries `disc-*` (17), wrecks `wreck-*` (3), characters `char-*` (5).
- Campaign portraits `camp-*` (17).
- Card backs `back-cross` / `back-lifeboat`.
- Tables `table-beach` / `temple-ruins` / `homestead`.
- Title and end screens.

The prompts are in laptop `game-assets/cards/shipwreck/*.json`.

## Music
`../audio/shipwreck/treblo/`: ten Treblo instrumentals (5 cues × a/b). See the README there.

## Wired (2026-10-09)
- 50 paintings live in `games/shipwreck-isle/art/` as separate files (`rc/extras.js` `artImg()`; `build.py` lists `art/` into `ART_HAVE`, so missing ones show nothing). Shown on: the fight card on the board and in the story card, the boost/tracker question, starting-item and built-invention rows, invention build rows, Bright Idea options, and the card list (beasts, inventions, items).
- `media/back-default.webp` is the card back in the Decks list (`.dk .cb`).
- Treblo music: `games/shipwreck-isle/music/*.mp3` (see `audio/ASSETS.md`); per-screen slots and the Music picker are in `rc/extras.js` (menu: "Pick songs"). Saved choice key `swi_mpick`.
- `node cards-page.js` (in `rc/`) rebuilds `games/shipwreck-isle/cards.html`; then `python3 ../scripts/stamp-copyright.py ../../games/shipwreck-isle/cards.html`.
- Still to wire when part 2 arrives: discoveries, wrecks, characters, camp portraits, other backs, tables, title/end screens.
