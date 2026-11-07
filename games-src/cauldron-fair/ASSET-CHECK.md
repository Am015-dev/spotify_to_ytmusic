# Cauldron Fair: asset check (W346)

Checked on branch `shelf/W346-assets-a`. Source: `art/manifest.json`, the 27 art items, `games/cauldron-fair/media/` (80 files), the code ids in `src/data.js`, `src/ui12.js`, `src/skin.css`, `src/head.html`, `campaign.json`, and the shared shell `shell/gx-skin.js`.

## Counts
| item | count |
|---|---|
| required pictures | 96 (27 manifest art items, 24 fortune cards, 6 cast portraits, 2 bag skins, 3 table cloths, 2 end pictures, title, and the other media stems the code loads) |
| delivered | 107 (27 in `art/`, 80 in `media/`) |
| prompted (no file, prompt exists) | 0 |
| gaps added | 0 |
| not wired | 11 (listed below) |

Music: the cue slots `main`, `fight`, `tavern`, `victory`, `defeat` (a and b each) are all present in `media/music/`, 10 of 10 files.

Flow prompts: the 27 manifest art items have no Flow prompt in `next-wave/flow-2d/cauldron-fair/`. They were delivered before this check, so they are not counted as gaps. The Flow prompts that exist are character poses (for example `mirabel-idle`), which the code does not load (it uses one `char-<id>` picture per character).

## Gaps added
None. Every required item is delivered.

## Not wired (file exists, no code loads it)
| file | note |
|---|---|
| `btn-draw.webp` | code uses `btn-draw-c` |
| `title-phone.webp` | no code path loads it |
| `ui-button-go.webp`, `ui-button-power.webp` | code and shell use the `-c` versions |
| `ui-stall.webp`, `ui-stall-locked.webp` | code uses `ui-stall-c`, `ui-stall-locked-c` |
| `ui-iconbtn-k`, `ui-node-boss-k`, `ui-node-done-k`, `ui-node-locked-k`, `ui-node-open-k` | the `-k` variants are not referenced anywhere in the repo's game or shell code (these are the `.webp` files in `media/`) |

Not checked: nothing skipped.
