# Inbox: wildmark

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (47)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `card-bear-a.webp` | 600x840 | 5:7 | no | scoring card Twin Dens (cards drawer, rules) | wiring |
| `card-bear-b.webp` | 600x840 | 5:7 | no | scoring card Twin Dens, set B (next card sets) | wiring |
| `card-bear-c.webp` | 600x840 | 5:7 | no | scoring card Twin Dens, set C (next card sets) | wiring |
| `card-bear-d.webp` | 600x840 | 5:7 | no | scoring card Twin Dens, set D (next card sets) | wiring |
| `card-elk-a.webp` | 600x840 | 5:7 | no | scoring card Ridge Lines (cards drawer, rules) | wiring |
| `card-elk-b.webp` | 600x840 | 5:7 | no | scoring card Ridge Lines, set B (next card sets) | wiring |
| `card-elk-c.webp` | 600x840 | 5:7 | no | scoring card Ridge Lines, set C (next card sets) | wiring |
| `card-elk-d.webp` | 600x840 | 5:7 | no | scoring card Ridge Lines, set D (next card sets) | wiring |
| `card-fox-a.webp` | 600x840 | 5:7 | no | scoring card Curious Fox (cards drawer, rules) | wiring |
| `card-fox-b.webp` | 600x840 | 5:7 | no | scoring card Curious Fox, set B (next card sets) | wiring |
| `card-fox-c.webp` | 600x840 | 5:7 | no | scoring card Curious Fox, set C (next card sets) | wiring |
| `card-fox-d.webp` | 600x840 | 5:7 | no | scoring card Curious Fox, set D (next card sets) | wiring |
| `card-hawk-a.webp` | 600x840 | 5:7 | no | scoring card Lone Perches (cards drawer, rules) | wiring |
| `card-hawk-b.webp` | 600x840 | 5:7 | no | scoring card Lone Perches, set B (next card sets) | wiring |
| `card-hawk-c.webp` | 600x840 | 5:7 | no | scoring card Lone Perches, set C (next card sets) | wiring |
| `card-hawk-d.webp` | 600x840 | 5:7 | no | scoring card Lone Perches, set D (next card sets) | wiring |
| `card-salmon-a.webp` | 600x840 | 5:7 | no | scoring card River Runs (cards drawer, rules) | wiring |
| `card-salmon-b.webp` | 600x840 | 5:7 | no | scoring card River Runs, set B (next card sets) | wiring |
| `card-salmon-c.webp` | 600x840 | 5:7 | no | scoring card River Runs, set C (next card sets) | wiring |
| `card-salmon-d.webp` | 600x840 | 5:7 | no | scoring card River Runs, set D (next card sets) | wiring |
| `icon-logo.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | top bar logo (Wildmark crest) | wiring |
| `portrait-bram.webp` | 768x768 | 1:1 | no | Story portrait of bram | wiring |
| `portrait-frost.webp` | 768x768 | 1:1 | no | Story portrait of frost | wiring |
| `portrait-linnet.webp` | 768x768 | 1:1 | no | Story portrait of linnet | wiring |
| `portrait-oake.webp` | 768x768 | 1:1 | no | Story portrait of oake | wiring |
| `portrait-pip.webp` | 768x768 | 1:1 | no | Story portrait of pip | wiring |
| `portrait-quill.webp` | 768x768 | 1:1 | no | Story portrait of quill | wiring |
| `portrait-ranger.webp` | 768x768 | 1:1 | no | Story portrait of ranger | wiring |
| `portrait-rowan.webp` | 768x768 | 1:1 | no | Story portrait of rowan | wiring |
| `portrait-snowline.webp` | 768x768 | 1:1 | no | Story portrait of snowline | wiring |
| `portrait-sorrel.webp` | 768x768 | 1:1 | no | Story portrait of sorrel | wiring |
| `portrait-warden.webp` | 768x768 | 1:1 | no | Story portrait of warden | wiring |
| `result-lose.webp` | 1600x900 | 16:9 | no | #rs result panel after a loss | wiring |
| `result-win.webp` | 1600x900 | 16:9 | no | #rs result panel after a win | wiring |
| `table-bg.webp` | 1920x1080 | 16:9 | no | #board background behind the hex map | wiring |
| `ter-forest.webp` | 512x512 | 1:1 | no | terrain fill of every forest half-hex on the map and in the market | wiring |
| `ter-marsh.webp` | 512x512 | 1:1 | no | terrain fill of every marsh half-hex on the map and in the market | wiring |
| `ter-meadow.webp` | 512x512 | 1:1 | no | terrain fill of every meadow half-hex on the map and in the market | wiring |
| `ter-peak.webp` | 512x512 | 1:1 | no | terrain fill of every peak half-hex on the map and in the market | wiring |
| `ter-river.webp` | 512x512 | 1:1 | no | terrain fill of every river half-hex on the map and in the market | wiring |
| `title-bg.webp` | 1920x1080 | 16:9 | no | #start (title and setup screen background, behind the panel) | wiring |
| `tok-acorn.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | the round acorn token (map, market, score chips) | wiring |
| `tok-bear.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | the round bear token (map, market, score chips) | wiring |
| `tok-elk.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | the round elk token (map, market, score chips) | wiring |
| `tok-fox.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | the round fox token (map, market, score chips) | wiring |
| `tok-hawk.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | the round hawk token (map, market, score chips) | wiring |
| `tok-salmon.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | the round salmon token (map, market, score chips) | wiring |
