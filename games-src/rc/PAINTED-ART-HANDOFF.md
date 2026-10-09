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
