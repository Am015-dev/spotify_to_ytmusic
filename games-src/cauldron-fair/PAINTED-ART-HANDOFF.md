# Cauldron Fair: painted art hand-off (laptop → Linux session, 2026-10-09)

The laptop made the pictures; the Linux session rebuilds, tests and deploys. Unlike the other games, most of this needs **no wiring**: `build.py` already prefers `art/<name>.png` over the painted stand-in `art/<name>.webp` (see `ART-PROMPTS.md`, "Swapping in your own paintings").

## `art/<name>.png`: all 27 manifest items (picked up by `python3 build.py`)
- **Chips:** `chip-W`, `chip-O`, `chip-G`, `chip-B`, `chip-R`, `chip-Y`, `chip-P`, `chip-K`.
- **Table pieces:** `cauldron`, `pad`, `bag`, `flask`, `flask-empty`, `ruby`, `droplet`, `rat`, `puff`, `splash`, `bubble`, `seer`, `book`.
- **Makers:** `char-wynne`, `char-odo`, `char-tamsin`, `char-mirabel`.
- **Backgrounds:** `table`, `title`.
- Made with Google Flow from the exact `ART-PROMPTS.md` prompts plus its style block. Pieces were generated on white and then keyed, so they have transparent backgrounds; the keyer is `game-assets/prep_cauldron.py` on the laptop. They are saved at 2× the manifest size, and the build downsizes them and re-encodes them as WebP.
- **Check at phone size** (ART-PROMPTS: chips must read at 48 px wide).
- **Note:** `char-tamsin` came out as an old bearded seer. ART-PROMPTS does not set Tamsin's look; if the campaign treats Tamsin as a woman, regenerate that one.
- To go back to a stand-in, delete its PNG.

## `games/cauldron-fair/media/`: extras the manifest does not list (separate files)
- **Portraits** `camp-<id>.webp`: `hask`, `vesper`, and `wynne`, `odo`, `tamsin`, `mirabel`.
  - The last four reuse the maker busts so the faces match.
  - Set `artBase: 'media/'` in the `GXC.init` call; `campaign.json` already uses these names.
- **Bag skins** `bag-moss.webp` and `bag-ember.webp` (transparent): the campaign `cardback` unlocks `moss-bag` and `ember-bag`.
- **Fortune cards** `fortune-<id>.webp`, 256×256: all 24, keyed by the `FORTUNE` ids in `src/data.js`.
  - Wiring: show the picture on the fortune card when the file exists.
- **End screens:** `end-win.webp` and `end-lose.webp`.
- **Unlock tables:** `table-market-cloth.webp` and `table-judges-tent.webp` (campaign `table` unlocks `market-cloth` and `judges-tent`).
- **Phone versions:** `title-phone` and `table-phone` are not made yet (Flow failed twice). Crop the desktop `art/title.png` and `art/table.png` until then.

## Music
`../audio/cauldron-fair/treblo/`: ten Treblo instrumentals (5 cues × a/b). See the README there.
