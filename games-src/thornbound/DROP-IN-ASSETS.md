# Thornbound: drop-in paintings (6 files)

Put the files at exactly these paths and push. No code change is needed; the page picks them up by name.

| File | Size | Goes in | Goes live |
|---|---|---|---|
| `basic-gilded.webp` | 256x256 WebP | `games-src/thornbound/art/` | after `python3 games-src/scripts/build-all.py --deploy thornbound` (embedded in the page) |
| `basic-heath.webp` | 256x256 WebP | `games-src/thornbound/art/` | same |
| `basic-lantern.webp` | 256x256 WebP | `games-src/thornbound/art/` | same |
| `basic-choir.webp` | 256x256 WebP | `games-src/thornbound/art/` | same |
| `map.webp` | 1376x768 WebP | `games/thornbound/media/` | as soon as it is pushed (loaded at run time) |
| `map-phone.webp` | 768x1376 WebP | `games/thornbound/media/` | as soon as it is pushed |

Make the pictures at 1024 px or larger if you like, then convert to WebP at the sizes above.
The ready prompts and the style block are in `games-src/MISSING-ASSETS.md` (Thornbound section) and on `games/missing.html`.
Faction ids: gilded = The Gilded Line, heath = heath clans, lantern = lantern uprising, choir = moth choir.
Until the files exist: Basic cards use a crop of the faction's campaign portrait, and the map shows the drawn land as a light parchment wash over the table.
