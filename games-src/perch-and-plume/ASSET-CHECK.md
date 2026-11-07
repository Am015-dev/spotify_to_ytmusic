# perch-and-plume: asset check

Made by `check-assets.py` (re-run after changing the roster, campaign or assets). REQUIRED = every distinct card, piece, character, boss, board, background, icon and effect the rules (src/data.js), the UI and campaign.json use. PROMPTED = stem in assets.json with a Flow prompt in `next-wave/flow-2d/perch-and-plume/`. DELIVERED = file in games/perch-and-plume/media/.

| required | in assets.json | prompted | delivered | gaps |
|---|---|---|---|---|
| 186 | 186 | 186 | 0 | 0 |

## By group

| group | required | prompted |
|---|---|---|
| bird card | 120 | 120 |
| bonus card | 18 | 18 |
| round goal tile | 12 | 12 |
| food token / die face | 7 | 7 |
| nest icon | 5 | 5 |
| token | 1 | 1 |
| icon | 1 | 1 |
| character / boss portrait | 8 | 8 |
| board | 4 | 4 |
| board piece | 2 | 2 |
| card back | 1 | 1 |
| background | 3 | 3 |
| ui | 1 | 1 |
| fx | 3 | 3 |

## Gaps

None.

## Slots not required by the list above

None.

## Music

Cues per gx-music slot (menu, main, fight, victory, defeat): `games-src/next-wave/music/perch-and-plume/cues-wave1.json`. Files go to `games/perch-and-plume/music/<slot>-a.mp3` / `-b.mp3`; the build lists only files that exist (silent until then).
