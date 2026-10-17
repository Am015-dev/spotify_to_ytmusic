# Kaiten Kitchen: painted art hand-off (laptop → Linux session, 2026-10-09)

Like Cauldron Fair, most of this needs **no wiring**: `game/build.py` already prefers `art/<name>.png` over the painted stand-in `art/<name>.webp`, and fits it to the size in `art/manifest.json`. Just rebuild.

## `art/<name>.png` (Flow paintings, picked up by the build)
- **Food plates** (keyed transparent, round): `tempura`, `dumpling`, `roll1`, `roll2`, `salmon`, `chop`.
- **Diner:** `chef-pip` (round medallion).
- **Strips and panels**, cropped to the manifest shape:
  - `belt` (8:1)
  - `counter` (4:1)
  - `back`: the card back, indigo seigaiha waves with a plate medallion
  - `title`: the diner at night
- **Repainted without the placemat (2026-10-09):** `sashimi`, `roll3`, `squid`, `egg`, `wasabi`, `wasabi-nigiri`, `pudding` (round plates, keyed) and `chef-mina`, `chef-taro`, `chef-odile`, `chef-kofi` (round portraits). Every plate and chef now has a Flow painting.
  - `ART-PROMPTS.md`'s style block asks for a placemat; Flow painted a square linen mat under them, so the retry prompts drop that phrase. Media adds `camp-mina`/`taro`/`odile`/`kofi` (from the chefs) and `table-dinner-counter`.
  - They are being regenerated without the mat and follow in the next push.
- Check them on a phone. The prompts and the style block come from `ART-PROMPTS.md`.

## `games/kaiten-kitchen/media/` (separate files)
- **Portraits** `camp-<id>.webp`: `suzu` and `pip`.
  - `mina`, `kofi`, `odile` and `taro` follow with the diner retry; they reuse the diner paintings so the faces match.
  - Set `artBase: 'media/'` in the `GXC.init` call.
- **Card backs** `back-<id>.webp`: `lunch-belt`, `custard` and `golden`, the campaign `cardback` unlocks.
- **Tables:** `table-midnight-belt.webp` is a campaign `table` unlock. `table-dinner-counter` follows.
- **End screens:** `end-win.webp` and `end-lose.webp`. `title-phone` is not made yet (9:16 images keep failing in Flow); crop `art/title.png` until then.

## Music
`../audio/kaiten/treblo/`: ten Treblo instrumentals (5 cues × a/b). See the README there.
