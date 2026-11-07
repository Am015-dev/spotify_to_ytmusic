# Doorkick Dungeon (munch): asset check (W346)

Checked on branch `shelf/W346-assets-a`. Source: `art/manifest.json` (147 items, card and monster art), `games/doorkick-dungeon/media/` (65 files), `campaign.json` (7 portraits), `cards.js` (card keys), `tbl.js` (`media/back-${id}.webp`), `bf.js` (`media/doorkick-${k}-boss.mp4`), and the shell.

## Counts
| item | count |
|---|---|
| required pictures | 210 (147 art items, 63 media stems the code loads, 11 of them through a template) |
| delivered | 147 art files (in `art/`, built into the page) + 65 media files |
| prompted | 0 |
| gaps added | 0 |
| not wired | 2 |

Music: `MUSIC-PROMPTS.txt` lists the music prompts. I did not check the cue names against the code, so this is not verified.

Flow prompts: `next-wave/flow-2d/doorkick-dungeon/` has no prompt files for these art items. They were delivered before this check, so they are not counted as gaps.

## Gaps added
None. Every required item is delivered.

## Not wired (file exists, no code loads it)
| file | note |
|---|---|
| `ui-button-go.webp`, `ui-button-power.webp` | code and shell use `-c` versions |

Not checked: nothing skipped.
