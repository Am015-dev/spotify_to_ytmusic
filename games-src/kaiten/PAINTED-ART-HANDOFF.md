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
- **Still the old stand-ins:** `sashimi`, `roll3`, `squid`, `egg`, `wasabi`, `wasabi-nigiri`, `pudding`, `chef-mina`, `chef-taro`, `chef-odile`, `chef-kofi`.
  - Flow painted most of these on a square linen placemat, which looks wrong next to the round stand-ins. `ART-PROMPTS.md`'s style block asks for a placemat, so I dropped that phrase for the retry.
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
